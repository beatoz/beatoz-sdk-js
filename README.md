# Javascript SDK for BEATOZ

`beatoz-sdk-js` is Javascript SDK for BEATOZ blockhcain network.

## Prerequisite

To build use typescript compiler,

```bash
npm install yarn -g
```

To generate typescript sources for protobuf messages,

```bash
brew install protobuf
```

To compile typescript sources,

```bash
node -v
v19.5.0
```

```bash
npm -v
9.4.1
```

## Usages

### Install SDK

```bash
npm install @beatoz/web3
```

### Build sources

```bash
git clone https://github.com/beatoz/beatoz-sdk-js.git
cd beatoz-sdk-js
npm install

npm run build 
```

<!--
### Browserify

```bash
git clone https://github.com/beatoz/beatoz-sdk-js.git
cd beatoz-sdk-js
npm install

# web build uses ems. So, pre-build is required.
npm run build 
npm run build:web
```

```html
<script type="text/javascript" src="./dist/beatoz.min.js"></script>
```
-->

---

### Documentation / API-Document 

You can find documents at english https://beatoz.gitbook.io/beatoz-sdk-js/docs-en

## License
```
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
```
