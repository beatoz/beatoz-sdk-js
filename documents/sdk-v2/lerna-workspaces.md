# Yarn workspaces와 Lerna 역할 정리

이 저장소에서는 Yarn workspaces가 의존성 설치와 내부 패키지 연결을 담당하고, Lerna가 여러 패키지의 스크립트를 실행하는 역할을 담당합니다. Lerna 자체는 유지하며, Yarn과 역할이 겹치는 레거시 `lerna bootstrap` 명령만 제거했습니다.

## 변경 전 문제

루트 `package.json`에는 다음 흐름이 있었습니다.

```text
yarn build
  -> prebuild
  -> yarn clean
  -> lerna bootstrap
  -> lerna run build --stream
```

`lerna bootstrap`은 각 패키지의 외부 의존성을 설치하고 모노레포 내부 패키지를 서로 연결하던 명령입니다. 그러나 이 저장소는 이미 루트 `package.json`에 `workspaces`를 선언하고 `lerna.json`에서 `npmClient: yarn`, `useWorkspaces: true`를 사용합니다. 따라서 설치와 내부 패키지 연결은 `yarn install`이 처리합니다.

그 결과 빌드할 때마다 `lerna bootstrap`을 다시 실행하는 것은 역할이 중복되고, 최신 Lerna로 업그레이드할 때 제거된 명령 때문에 실패하게 됩니다.

## 변경 내용

루트 스크립트를 다음과 같이 정리했습니다.

```json
{
  "scripts": {
    "version": "yarn build && git add packages/*/src/version.ts",
    "prebuild": "yarn clean",
    "build": "lerna run build --stream"
  }
}
```

- `bootstrap` 스크립트 삭제
- `prebuild`에서 `lerna bootstrap` 삭제
- `version`에서 별도의 `yarn run bootstrap` 삭제
- `lerna run build`, `lerna run test`, `lerna run clean` 등 작업 실행 기능은 유지

## 도구별 책임

| 책임 | 담당 도구 | 저장소의 근거 |
| --- | --- | --- |
| 외부 의존성 설치 | Yarn | `yarn.lock`, `yarn install` |
| 내부 workspace 패키지 연결 | Yarn workspaces | 루트 `package.json`의 `workspaces` |
| 여러 패키지의 build/test/clean 실행 | Lerna | 루트 scripts의 `lerna run ...` |
| 패키지 버전 관리 및 배포 | Lerna | `lerna.json`의 고정 버전 설정 |

즉, Yarn과 Lerna 중 하나만 선택한 것이 아닙니다. 서로 다른 책임으로 함께 사용합니다.

## 사용 방법

새로 저장소를 받은 로컬 환경에서는 먼저 한 번 설치한 뒤 빌드합니다.

```sh
yarn install
yarn build
```

CI처럼 lockfile과 정확히 일치하는 설치가 필요하면 다음과 같이 실행합니다.

```sh
yarn install --frozen-lockfile
yarn build
```

`yarn build`는 이제 설치를 암묵적으로 수행하지 않습니다. 의존성이 바뀌었거나 `node_modules`가 없는 환경에서는 반드시 `yarn install`을 먼저 실행해야 합니다. 설치와 빌드를 분리하면 실패 원인이 설치 문제인지 컴파일 문제인지도 명확하게 구분할 수 있습니다.

## 검증 결과

변경 후 다음 명령을 실행했습니다.

```sh
yarn install --frozen-lockfile
yarn build
```

- frozen lockfile 설치 성공
- 전체 13개 패키지 빌드 성공
- 빌드 로그에서 `lerna bootstrap`이 더 이상 실행되지 않음
- Lerna의 패키지 작업 실행은 기존과 동일하게 동작

## 다음 단계와의 관계

이번 변경은 현재 Lerna `6.6.x`에서 불필요한 레거시 설치 단계를 제거한 것입니다. Lerna 버전 업그레이드는 별도의 작업으로 진행해야 하며, 업그레이드 시에는 task pipeline과 캐시 설정을 추가로 검토합니다.
