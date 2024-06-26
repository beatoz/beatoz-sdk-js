# Getting Started

**@beatoz/web3 가이드 문서에 오신 것을 환영합니다.**

@beatoz/web3는 HTTP 및 WebSocket을 사용하여 로컬 또는 원격 BEATOZ 노드와 상호 작용할 수 있게 해주는 JavaScript 라이브러리입니다. 다음 문서는 @beatoz/web3의 사용 방법 및 예제 코드를 제공합니다.
이 문서는 @beatoz/web3 1.0.12 또는 상위 버전을 사용하는 개발자를 위해 작성되었습니다.

## 요구 사항

@beatoz/web3 라이브러리를 사용하려면 다음 요구 사항이 필요합니다:
- Node.js (버전 16.19.0 이상)
- npm (버전 8.19.0 이상)

## Installation

@beatoz/web3를 설치하려면 npm을 사용해 다음 명령을 실행하세요:
```shell
npm install @beatoz/web3
```

@beatoz/web3의 특정 버전을 설치하려면 다음 명령을 실행하세요:
```shell
npm install @beatoz/web3@X.X.X
```

## Starting with @beatoz/web3
@beatoz/web3 설치가 완료되면 라이브러리를 사용해서 BEATOZ 노드에 연결할 수 있습니다.
아래 예제를 통해 연결하는 방법을 확인하세요.

먼저 작업 디렉토리에 예제 코드를 작성할 파일을 생성합니다.
```shell
$ touch beatoz.js
```
생성된 beatoz.js에 아래의 코드를 작성합니다.
```javascript
import { Web3 } from '@beatoz/web3';
const web3 = new Rweb3('https://rpc1.testnet.beatoz.io');

async function getAbciInfo() {
    const info = await web3.beatoz.abciInfo();
    console.log(info);
}

getAbciInfo();
```
위 코드의 결과는 아래와 같습니다.
```shell
{
  response: {
    version: '0.17.0',
    app_version: '72620543991349248',
    last_block_height: 231923,
    last_block_app_hash: '4MYzthbFGIFAGU/EOy+Dw1JjxjqBl1NimEryfjyHS9o='
  }
}
```
