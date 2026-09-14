/*
    Copyright 2023 All BEATOZ Developers

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import importX from 'eslint-plugin-import-x';
import unicorn from 'eslint-plugin-unicorn';
import licenseHeader from 'eslint-plugin-license-header';

/**
 * 모든 소스 파일 상단에 요구하는 Apache 2.0 헤더.
 * 기존 eslint-plugin-header 설정과 같은 문구를 유지한다.
 */
const APACHE_LICENSE_HEADER = [
    '/*',
    '    Copyright 2023 All BEATOZ Developers',
    '',
    '    Licensed under the Apache License, Version 2.0 (the "License");',
    '    you may not use this file except in compliance with the License.',
    '    You may obtain a copy of the License at',
    '',
    '        http://www.apache.org/licenses/LICENSE-2.0',
    '',
    '    Unless required by applicable law or agreed to in writing, software',
    '    distributed under the License is distributed on an "AS IS" BASIS,',
    '    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.',
    '    See the License for the specific language governing permissions and',
    '    limitations under the License.',
    '*/',
];

/**
 * null을 정상 입력으로 다뤄야 하는 경계 파일들.
 *
 * 이 SDK는 JSON-RPC 클라이언트이므로 노드가 보내는 응답에는 null이 정상적으로 들어온다.
 * (JSON에는 undefined가 없고, "값 없음"을 null로 표현한다.)
 * 따라서 전선을 직접 다루는 파일에서는 null 사용을 허용하고,
 * 그 바깥 내부 코드에서는 undefined로 통일한다.
 *
 * 내부 코드가 null을 다루게 됐다면 이 목록에 추가하는 것이 아니라,
 * 경계에서 undefined로 정규화하지 못한 지점이 어디인지 먼저 확인해야 한다.
 */
const RPC_BOUNDARY_FILES = [
    'packages/web3-types/src/response_decoder.ts',
    'packages/web3-types/src/responses.ts',
    'packages/web3-types/src/encodings.ts',
    'packages/web3-types/src/web3_base_provider.ts',
    'packages/web3-types/src/assert.ts',
    'packages/web3-core/src/web3_request_manager.ts',
    'packages/web3-contract/src/log_subscription.ts',
    'packages/web3-contract/src/encoding.ts',
    'packages/web3-utils/src/storage.ts',
];

export default tseslint.config(
    // ---------------------------------------------------------------
    // 1. 전역 무시 대상
    //    기존 패키지별 .eslintignore를 한곳으로 모은 것이다.
    // ---------------------------------------------------------------
    {
        ignores: [
            '**/node_modules/**',
            '**/lib/**',
            '**/dist/**',
            '**/coverage/**',
            '**/.coverage/**',
            '**/*.tsbuildinfo',
            '**/jest.config.js',
            '**/webpack.config.js',
            '**/webpack.analyze.js',
            // protobuf 생성 코드 — 사람이 고치는 파일이 아니다.
            'packages/web3-accounts/src/tx/trx_pb.ts',
            // 파일 전체가 주석 처리된 죽은 코드다.
            // license-header 규칙의 autofix가 선행 주석 덩어리를 "잘못된 헤더"로 보고
            // 통째로 치환해 내용을 지워버리므로 반드시 제외한다.
            // (이 파일을 살릴지 삭제할지는 별도 판단 필요)
            'packages/web3-accounts/src/transfer_test.ts',
            // 기존 .eslintignore에서 이어온 개별 제외 대상
            'packages/web3-types/src/responses.ts',
            'packages/web3-providers-ws/src/**',
            'packages/web3-providers-ws/test/websocket_provider.test.ts',
            'packages/web3-utils/test/**',
            'packages/web3-validator/test/**',
            'packages/web3/test/**',
            // 빌드 산출물 이외의 잡다한 스크립트
            'tools/**',
            'examples/**',
        ],
    },

    // ---------------------------------------------------------------
    // 2. 기본 권장 규칙
    // ---------------------------------------------------------------
    js.configs.recommended,
    ...tseslint.configs.recommended,

    // ---------------------------------------------------------------
    // 3. TypeScript 소스: 타입 인식 린팅 + 저장소 공통 규칙
    // ---------------------------------------------------------------
    {
        files: ['**/*.ts'],
        languageOptions: {
            parserOptions: {
                // projectService는 각 파일에 맞는 tsconfig를 자동으로 찾는다.
                // 기존에는 13개 패키지가 각자 .eslintrc.js에 project 경로를 적었는데,
                // 그 중복이 이 설정 하나로 대체된다.
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            'import-x': importX,
            unicorn,
            'license-header': licenseHeader,
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            'license-header/header': ['error', APACHE_LICENSE_HEADER],

            // 의도적으로 쓰지 않는 식별자는 `_` 접두사로 표시한다.
            // 주로 시그니처는 유지해야 하지만 본문에서 쓰지 않는 매개변수에 해당한다.
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],

            // 내부 코드는 undefined로 통일한다. 경계 파일은 아래 4번에서 예외 처리한다.
            'unicorn/no-null': 'error',

            // 순환 import 차단. 기존 설정은 resolver만 있고 플러그인이 빠져 있어
            // 규칙이 로드되지 않았다.
            'import-x/no-cycle': 'error',
        },
        settings: {
            'import-x/resolver': {
                typescript: true,
            },
        },
    },

    // ---------------------------------------------------------------
    // 4. RPC 경계 파일: null 허용
    // ---------------------------------------------------------------
    {
        files: RPC_BOUNDARY_FILES,
        rules: {
            'unicorn/no-null': 'off',
        },
    },

    // ---------------------------------------------------------------
    // 5. 테스트 코드: 제품 코드보다 완화
    // ---------------------------------------------------------------
    {
        files: ['**/test/**/*.ts', '**/test/**/*.js'],
        languageOptions: {
            globals: {
                jest: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeAll: 'readonly',
                beforeEach: 'readonly',
                afterAll: 'readonly',
                afterEach: 'readonly',
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            'license-header/header': 'off',
            'unicorn/no-null': 'off',
            // 타입 수준 테스트는 값을 선언해두고 `typeof`로만 참조하는 패턴을 쓴다.
            // 이때 값 자체는 런타임에서 쓰이지 않는 것이 정상이다.
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],
        },
    },

    // ---------------------------------------------------------------
    // 6. 설정·스크립트용 JavaScript: 타입 인식 린팅 대상이 아니다.
    // ---------------------------------------------------------------
    {
        files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
        ...tseslint.configs.disableTypeChecked,
        languageOptions: {
            sourceType: 'commonjs',
            globals: {
                module: 'writable',
                require: 'readonly',
                __dirname: 'readonly',
                process: 'readonly',
                console: 'readonly',
            },
        },
        rules: {
            'license-header/header': 'off',
            '@typescript-eslint/no-require-imports': 'off',
        },
    },

    // ---------------------------------------------------------------
    // 7. Prettier 연동은 반드시 마지막.
    //    포맷과 충돌하는 규칙을 끄고, 포맷 위반을 lint 에러로 보고한다.
    // ---------------------------------------------------------------
    prettierRecommended,
);
