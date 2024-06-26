# web3 rpc methods

## 개요
이 문서는 `BEATOZ` 블록체인의 다양한 RPC 요청들을 처리하는 함수를 설명합니다. `BEATOZ` 블록체인에서는 데이터를 조회하기 위한 다양한 RPC 메소드들을 제공하고 있습니다. 제공하는 RPC 메소드들을 요청하는 방법을 예시를 통해 확인할 수 있습니다.

## RPC 요청 함수

### `health`
`BEATOZ` 노드의 네트워크 연결 상태를 확인하는 health 메소드를 호출합니다.
- 요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
try {
    const result: Promise<null> = await web3.beatoz.health();
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
null
```

### `status`
`BEATOZ` 네트워크의 상태를 확인하는 status 메소드를 호출합니다.
- 요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
try {
    const result: StatusResponse = await web3.beatoz.status();
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
{
  node_info: {
    id: 'aadc84574ab72a8de81af876df69546f5112f6fd',
    listen_addr: 'tcp://0.0.0.0:26656',
    network: 'testnet0',
    version: '0.34.24',
    channels: '40202122233038606100',
    moniker: 'ip-10-40-10-98',
    other: Map(2) {
      'tx_index' => 'on',
      'rpc_address' => 'tcp://0.0.0.0:26657'
    },
    protocol_version: { app: '72620543991349248', block: 11, p2p: 8 }
  },
  sync_info: {
    earliest_app_hash: '394D26CA253D1453A8485F19C0845F7752B78F8804A1CD37968A8089A72B6117',
    earliest_block_hash: '8DAECF4CB13892442ABE50BCD8B5F7249B3B5E38D824198EF7792EC4BC8A8FE2',
    earliest_block_height: 1,
    earliest_block_time: 2023-10-23T00:55:13.604Z { nanoseconds: 720042 },
    latest_block_hash: '296BE1E68CB4E0348150265B937A1BF9AD5B95D4EE170C4D5CD0F2EA77EC4AA1',
    latest_app_hash: '3467DEDA9EABAA0DEA34B8B4BE82224556479ECC8AA4C294425BD77C5B5679B9',
    latest_block_time: 2023-11-01T08:40:49.950Z { nanoseconds: 377457 },
    latest_block_height: 522682,
    catching_up: false
  },
  validator_info: {
    pub_key: { type: 'tendermint/PubKeyEd25519', value: [Object] },
    power: '0',
    address: 'D222FC1EB4BB204E85FE03B850FCDF3888B8FC77',
    name: undefined
  }
}
```

### `netInfo`
`BEATOZ` 네트워크에 대한 정보를 확인하는 netInfo 메소드를 호출합니다.
- 요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
try {
    const result: NetInfoResponse = await web3.beatoz.netInfo();
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
{
    listening: true,
        listeners: [ 'Listener(@)' ],
        n_peers: '1',
        peers: [
        {
            node_info: [Object],
            is_outbound: true,
            connection_status: [Object],
            remote_ip: '10.40.30.118'
        }
    ]
}
```

### `blockchain`
블록체인 정보를 조회하는 blockchain 메소드를 호출합니다. minHeight, MaxHeight로 범위를 설정할 수 있습니다.
- 요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
try {
    const result: BlockchainResponse = await web3.beatoz.blockchain(1, 5);
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
{
    last_height: 523008,
        block_metas: [
        {
            block_id: [Object],
            block_size: 600,
            header: [Object],
            num_txs: 0
        },
        {
            block_id: [Object],
            block_size: 600,
            header: [Object],
            num_txs: 0
        },
        {
            block_id: [Object],
            block_size: 600,
            header: [Object],
            num_txs: 0
        },
        {
            block_id: [Object],
            block_size: 600,
            header: [Object],
            num_txs: 0
        },
        {
            block_id: [Object],
            block_size: 351,
            header: [Object],
            num_txs: 0
        }
    ]
}
```

### `block`
특정 블록을 조회할 수 있는 block 메소드를 호출합니다.
- 요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
try {
    const result: BlockResponse = await web3.beatoz.block(5);
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
{
  block_id: {
    hash: '65EC40CA47448E1F0C0181C01635E8AE90E4F8C75541F18DDC52324D931AA3F0',
    parts: {
      total: 1,
      hash: '2B1B9218FCE5369B4C22D73BD279AF4563174D39C7E017FC9553DD0D1E787472'
    }
  },
  block: {
    header: {
      version: [Object],
      chain_id: 'testnet0',
      height: 5,
      time: [Date],
      last_block_id: [Object],
      last_commit_hash: 'D73A01763F00E2FE63CA2B37A63DBBB90BA1CA945DDAB17915E8D6EB6E17816D',
      data_hash: 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
      validators_hash: 'F801F5D280370F09F589A962022D669E28937E3500F2FC2DA2DE3BD30055AE38',
      next_validators_hash: 'F801F5D280370F09F589A962022D669E28937E3500F2FC2DA2DE3BD30055AE38',
      consensus_hash: '048091BC7DDC283F77BFBF91D73C44DA58C3DF8A9CBC867405D8B7F3DAADA22F',
      app_hash: 'F13EA8DEDF3DF8D96F0778AB69A5A2B9333B7BE48DD34AC1403F07C07816FC19',
      last_results_hash: 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
      evidence_hash: 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
      proposer_address: 'EFEBF132773AF5C3913EDF1BB0502107E3CE830D'
    },
    last_commit: { block_id: [Object], height: 4, round: 0, signatures: [Array] },
    data: { txs: [] },
    evidence: []
  }
}
```

### `blockByHash`
특정 블록 해시 값으로 블록 정보를 조회할 수 있는 block_by_hash 메소드를 호출합니다
- 요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
const blockHash: string = '4dd7c7927bf1027bb5bb8e1cabd8165f9876f40976280fa98a92db94467f3b40';
try {
    const result: BlockResponse = await web3.beatoz.blockByHash(blockHash);
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
{
  block_id: {
    hash: '4DD7C7927BF1027BB5BB8E1CABD8165F9876F40976280FA98A92DB94467F3B40',
    parts: {
      total: 1,
      hash: 'AD71568A889DBA337A54BA84B16C7BFA4AE44A5748F066DB581E062C36E65031'
    }
  },
  block: {
    header: {
      version: [Object],
      chain_id: 'testnet0',
      height: 523371,
      time: [Date],
      last_block_id: [Object],
      last_commit_hash: '0F3B9D3F6A3C8C91F6E6865525DB940F95177E0EABC5E4A96CDC03CECE3CFFEF',
      data_hash: 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
      validators_hash: '46ECE3D1B8835321AA59FF853517D8A5E334F4EB66EFA67AEB08CD912AC6FC61',
      next_validators_hash: '46ECE3D1B8835321AA59FF853517D8A5E334F4EB66EFA67AEB08CD912AC6FC61',
      consensus_hash: '048091BC7DDC283F77BFBF91D73C44DA58C3DF8A9CBC867405D8B7F3DAADA22F',
      app_hash: '349C40DA18BB4C33ADC253DC4C7395EE21C34C856D3EF574EAA4F98D085374A9',
      last_results_hash: 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
      evidence_hash: 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
      proposer_address: '636D6B4B823C324675B75986CD749DBC14B3E0A8'
    },
    last_commit: {
      block_id: [Object],
      height: 523370,
      round: 0,
      signatures: [Array]
    },
    data: { txs: [] },
    evidence: []
  }
}
```

### `blockResults`
특정 블록 높이로 블록 결과 값을 조회할 수 있는 block_results 메소드를 호출합니다.
- 요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
try {
    const result: BlockResultsResponse = await web3.beatoz.blockResults(5);
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
{
  height: 5,
  txs_results: [],
  validator_updates: [],
  consensus_params_updates: undefined,
  begin_block_events: [ { type: 'reward', attributes: [Array] } ],
  end_block_events: []
}
```

### `commit`
특정 블록 높이에 대한 커밋 정보를 조회할 수 있는 commit 메소드를 호출합니다.
- 요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
try {
    const result: CommitResponse = await web3.beatoz.commit(5);
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
{
  canonical: true,
  signed_header: {
    header: {
      version: [Object],
      chain_id: 'testnet0',
      height: 5,
      time: [Date],
      last_block_id: [Object],
      last_commit_hash: 'D73A01763F00E2FE63CA2B37A63DBBB90BA1CA945DDAB17915E8D6EB6E17816D',
      data_hash: 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
      validators_hash: 'F801F5D280370F09F589A962022D669E28937E3500F2FC2DA2DE3BD30055AE38',
      next_validators_hash: 'F801F5D280370F09F589A962022D669E28937E3500F2FC2DA2DE3BD30055AE38',
      consensus_hash: '048091BC7DDC283F77BFBF91D73C44DA58C3DF8A9CBC867405D8B7F3DAADA22F',
      app_hash: 'F13EA8DEDF3DF8D96F0778AB69A5A2B9333B7BE48DD34AC1403F07C07816FC19',
      last_results_hash: 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
      evidence_hash: 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
      proposer_address: 'EFEBF132773AF5C3913EDF1BB0502107E3CE830D'
    },
    commit: { block_id: [Object], height: 5, round: 0, signatures: [Array] },
    canonical: true
  }
}
```

### `validators`
특정 블록 높이에 대한 검증인들의 정보를 조회하는 validators 메소드를 호출합니다.
- 요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
try {
    const result: ValidatorsResponse = await web3.beatoz.validators(5);
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
{
  block_height: 5,
  validators: [
    {
      pub_key: [Object],
      power: '7000000',
      address: 'EFEBF132773AF5C3913EDF1BB0502107E3CE830D',
      name: undefined
    }
  ],
  count: 1,
  total: 1
}
```

### `genesis`
`BEATOZ` 블록체인의 제네시스 정보를 조회할 수 있는 genesis 메소드를 호출합니다.
- 요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
try {
    const result: GenesisResponse = await web3.beatoz.genesis();
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
  genesis_time: 2023-10-23T00:55:13.604Z { nanoseconds: 720042 },
  chain_id: 'testnet0',
  initial_height: 1,
  consensus_params: {
    block: { max_bytes: 22020096, max_gas: -1, time_iota_ms: 1000 },
    evidence: {
      max_age_num_blocks: 100000,
      max_age_duration: 172800000000000,
      max_bytes: 1048576
    },
    validator: { pub_key_types: [Array] },
    version: { app_version: 1 }
  },
  validators: [
    {
      address: 'EFEBF132773AF5C3913EDF1BB0502107E3CE830D',
      pub_key: [Object],
      power: '7000000',
      name: ''
    }
  ],
  app_hash: '394D26CA253D1453A8485F19C0845F7752B78F8804A1CD37968A8089A72B6117',
  app_state: {
    assetHolders: [
      [Object], [Object],
      [Object], [Object],
      [Object], [Object],
      [Object], [Object],
      [Object]
    ],
    govParams: {
      version: '1',
      maxValidatorCnt: '21',
      minValidatorStake: '7000000000000000000000000',
      rewardPerPower: '1585489599',
      lazyRewardBlocks: '2592000',
      lazyApplyingBlocks: '259200',
      gasPrice: '250000000000',
      minTrxGas: '4000',
      maxTrxGas: '25000000',
      maxBlockGas: '18446744073709551615',
      minVotingPeriodBlocks: '259200',
      maxVotingPeriodBlocks: '2592000',
      minSelfStakeRatio: '50',
      maxUpdatableStakeRatio: '30',
      slashRatio: '50',
      signedBlocksWindow: '10000',
      minSignedBlocks: '500'
    }
  }
}
```

### `genesisChunked`
제네시스 블록을 청크로 조회할 수 있는 genesis_chunked 메소드를 호출합니다.
- 요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
try {
    const result: GenesisChunkedResponse = await web3.beatoz.genesisChunked(0);
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
{
  chunk: '0',
  total: '1',
  data: 'eyJnZW5lc2lzX3RpbWUiOiIyMDIzLTEwLTIzVDAwOjU1OjEzLjYwNDcyMDA0MloiLCJjaGFpbl9pZCI6InRlc3RuZXQwIiwiaW5pdGlhbF9oZWlnaHQiOiIxIiwiY29uc2Vuc3VzX3BhcmFtcyI6eyJibG9jayI6eyJtYXhfYnl0ZXMiOiIyMjAyMDA5NiIsIm1heF9nYXMiOiItMSIsInRpbWVfaW90YV9tcyI6IjEwMDAifSwiZXZpZGVuY2UiOnsibWF4X2FnZV9udW1fYmxvY2tzIjoiMTAwMDAwIiwibWF4X2FnZV9kdXJhdGlvbiI6IjE3MjgwMDAwMDAwMDAwMCIsIm1heF9ieXRlcyI6IjEwNDg1NzYifSwidmFsaWRhdG9yIjp7InB1Yl9rZXlfdHlwZXMiOlsic2VjcDI1NmsxIl19LCJ2ZXJzaW9uIjp7ImFwcF92ZXJzaW9uIjoiMSJ9fSwidmFsaWRhdG9ycyI6W3siYWRkcmVzcyI6IkVGRUJGMTMyNzczQUY1QzM5MTNFREYxQkIwNTAyMTA3RTNDRTgzMEQiLCJwdWJfa2V5Ijp7InR5cGUiOiJ0ZW5kZXJtaW50L1B1YktleVNlY3AyNTZrMSIsInZhbHVlIjoiQW96dWJBSXJMWDlzMjdoWmNMQ0tVRFNHT2J0SG9YRGhsNkhXazlKOWFaZ1oifSwicG93ZXIiOiI3MDAwMDAwIiwibmFtZSI6IiJ9XSwiYXBwX2hhc2giOiIzOTREMjZDQTI1M0QxNDUzQTg0ODVGMTlDMDg0NUY3NzUyQjc4Rjg4MDRBMUNEMzc5NjhBODA4OUE3MkI2MTE3IiwiYXBwX3N0YXRlIjp7ImFzc2V0SG9sZGVycyI6W3siYWRkcmVzcyI6IkEzNERBMTk1NTNBRjQ2RTNFRjY5MjdDRjM1MjJGQjQ1RERFQzA4MkYiLCJiYWxhbmNlIjoiMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIn0seyJhZGRyZXNzIjoiQjY1RkY5MTA5ODVCOTFFQjhCRkZEMDMxNDQzNjU0NzVEMkVCQ0ExRSIsImJhbGFuY2UiOiIxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAifSx7ImFkZHJlc3MiOiJDNTE3RkVCQUU2NjI5OTM1OTRGQjUwRUQ4RjJEMjI0MDQ1QUFEODAxIiwiYmFsYW5jZSI6IjEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCJ9LHsiYWRkcmVzcyI6IkFBMjFDNDJDNjUxMEYyREY5Q0YyMjJFRThFNUJENjJDQjM4NUEyMjEiLCJiYWxhbmNlIjoiMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIn0seyJhZGRyZXNzIjoiRTU2Qjg2RTA3MTgxRDVGOEM3MUNGRkMwMDRENzkxNkFCOTIxQzg2OCIsImJhbGFuY2UiOiIxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAifSx7ImFkZHJlc3MiOiJFN0ZDMUNFNUZBRjQ2QTIwMjI2MjY0OTlGNTNFRjkxREM3NDYxRThGIiwiYmFsYW5jZSI6IjEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCJ9LHsiYWRkcmVzcyI6IjRCNjY2NUY4Q0E3RDI3Nzk2Qzk1QzBEQjJDMkM2QTMyOTM3OTY5MDciLCJiYWxhbmNlIjoiMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIn0seyJhZGRyZXNzIjoiM0NDQTk1N0Y4RDE5QUI0NUFFNEYzNTNCQTBEMDNFM0NDNDE2Rjc1OCIsImJhbGFuY2UiOiIxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAifSx7ImFkZHJlc3MiOiJGNTVFMDU5Qzg3OTFENkIwMUZFRTQ0NDEyMDlBNzgzRTRDQURDNTk1IiwiYmFsYW5jZSI6IjEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCJ9XSwiZ292UGFyYW1zIjp7InZlcnNpb24iOiIxIiwibWF4VmFsaWRhdG9yQ250IjoiMjEiLCJtaW5WYWxpZGF0b3JTdGFrZSI6IjcwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAiLCJyZXdhcmRQZXJQb3dlciI6IjE1ODU0ODk1OTkiLCJsYXp5UmV3YXJkQmxvY2tzIjoiMjU5MjAwMCIsImxhenlBcHBseWluZ0Jsb2NrcyI6IjI1OTIwMCIsImdhc1ByaWNlIjoiMjUwMDAwMDAwMDAwIiwibWluVHJ4R2FzIjoiNDAwMCIsIm1heFRyeEdhcyI6IjI1MDAwMDAwIiwibWF4QmxvY2tHYXMiOiIxODQ0Njc0NDA3MzcwOTU1MTYxNSIsIm1pblZvdGluZ1BlcmlvZEJsb2NrcyI6IjI1OTIwMCIsIm1heFZvdGluZ1BlcmlvZEJsb2NrcyI6IjI1OTIwMDAiLCJtaW5TZWxmU3Rha2VSYXRpbyI6IjUwIiwibWF4VXBkYXRhYmxlU3Rha2VSYXRpbyI6IjMwIiwic2xhc2hSYXRpbyI6IjUwIiwic2lnbmVkQmxvY2tzV2luZG93IjoiMTAwMDAiLCJtaW5TaWduZWRCbG9ja3MiOiI1MDAifX19'
}
```

### `dumpConsensusState`
`BEATOZ` 블록체인의 현재 합의 상태를 조회할 수 있는 dump_consensus_state 메소드를 호출합니다.
- 요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
try {
        const result: DumpConsensusStateResponse = await web3.beatoz.dumpConsensusState();
        console.log(result);
    } catch (e) {
        console.log(e);
    }
```

- 응답
```shell
{
  round_state: {
    height: '524861',
    round: 0,
    step: 1,
    start_time: '2023-11-01T09:37:39.97558846Z',
    commit_time: '2023-11-01T09:37:38.97558846Z',
    validators: { validators: [Array], proposer: [Object] },
    proposal: null,
    proposal_block: null,
    proposal_block_parts: null,
    locked_round: -1,
    locked_block: null,
    locked_block_parts: null,
    valid_round: -1,
    valid_block: null,
    valid_block_parts: null,
    votes: [ [Object] ],
    commit_round: -1,
    last_commit: {
      votes: [Array],
      votes_bit_array: 'BA{3:xxx} 21000000/21000000 = 1.00',
      peer_maj_23s: {}
    },
    last_validators: { validators: [Array], proposer: [Object] },
    triggered_timeout_precommit: false
  },
  peers: [
    {
      node_address: 'bb8a257773d37f4a6ba888b9fa5b40a18b6c77eb@10.40.30.118:26656',
      peer_state: [Object]
    }
  ]
}
```

### `consensusState`
`BEATOZ` 블록체인의 합의 상태 정보를 조회할 수 있는 consensus_state 메소드를 호출합니다.
- 요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
try {
    const result: ConsensusStateResponse = await web3.beatoz.consensusState();
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
{
  round_state: {
    'height/round/step': '560412/0/6',
    start_time: '2023-11-02T01:03:19.299943048Z',
    proposal_block_hash: '01606465FEFE30545D1DCD3C2438646E26691FEA6389C8E420C0AA7FD4655B49',
    locked_block_hash: '01606465FEFE30545D1DCD3C2438646E26691FEA6389C8E420C0AA7FD4655B49',
    valid_block_hash: '01606465FEFE30545D1DCD3C2438646E26691FEA6389C8E420C0AA7FD4655B49',
    height_vote_set: [ [Object], [Object] ],
    proposer: { address: '636D6B4B823C324675B75986CD749DBC14B3E0A8', index: 0 }
  }
}

```

### `consensusParams`
특정 블록 높이에서의 합의 매개변수를 조회할 수 있는 consensus_params 메소드를 호출합니다.
- 요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
try {
    const result: ConsensusParamsResponse = await web3.beatoz.consensusParams(5);
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
{
  block_height: '5',
  consensus_params: {
    block: { max_bytes: '22020096', max_gas: '-1', time_iota_ms: '1000' },
    evidence: {
      max_age_num_blocks: '100000',
      max_age_duration: '172800000000000',
      max_bytes: '1048576'
    },
    validator: { pub_key_types: [Array] },
    version: { app_version: '1' }
  }
}
```

### `unconfirmedTxs`
입력된 한도만큼 컨펌되지 않은 트랜잭션을 조회할 수 있는 unconfirmed_txs 메소드를 호출합니다.
- 요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
try {
    const result: UnconfirmedTxsResponse = await web3.beatoz.unconfirmedTxs(5);
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
{ n_txs: '0', total: '0', total_bytes: '0', txs: [] }
```

### `txSearch`
지정된 쿼리 문자열에 따라 트랜잭션을 검색하고, 반환해주는 tx_search 메소드를 호출합니다.
- 요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
try {
    const result: TxSearchResponse = await web3.beatoz.txSearch('tx.height=515992');
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
{
  total_count: 1,
  txs: [
    {
      tx: 'CAEQgMmC866z2skXGAIiFDzKlX+NGatFrk81O6DQPjzEFvdYKhQ7oY3oqXJWNAK8pLlldA512VSOrDIJGxrk1uLvUAAAOMCEPUIFOjUpRABIAVpBEmm/jFsIU4I9M1cw67/uKSTpNkDwrA4K+OoUUjrFDalXuPTfPAAhqQ+9fryOofz/PNXJMGe01uMPontinq7p2wA=',
      hash: '946100C74D0993E90FA4501DF09DA9C70897AC9E71AD892F91D7FD7D04CD55D1',
      height: 515992,
      index: 0,
      result: [Object],
      proof: undefined,
      tx_result: [Object]
    }
  ]
}
```

### `tx`
`BEATOZ` 블록체인에서 트랜잭션 해시 값을 입력해서 결과 값을 조회할 수 있는 tx 메소드를 호출합니다.
-요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
try {
    const result: TxResponse = await web3.beatoz.tx('946100c74d0993e90fa4501df09da9c70897ac9e71ad892f91d7fd7d04cd55d1');
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
{
  tx: 'CAEQgMmC866z2skXGAIiFDzKlX+NGatFrk81O6DQPjzEFvdYKhQ7oY3oqXJWNAK8pLlldA512VSOrDIJGxrk1uLvUAAAOMCEPUIFOjUpRABIAVpBEmm/jFsIU4I9M1cw67/uKSTpNkDwrA4K+OoUUjrFDalXuPTfPAAhqQ+9fryOofz/PNXJMGe01uMPontinq7p2wA=',
  hash: '946100C74D0993E90FA4501DF09DA9C70897AC9E71AD892F91D7FD7D04CD55D1',
  height: 515992,
  index: 0,
  result: {
    code: 0,
    codespace: '',
    log: '',
    data: null,
    events: [ [Object] ],
    gas_wanted: '1000000',
    gas_used: '1000000'
  },
  proof: {
    data: 'CAEQgMmC866z2skXGAIiFDzKlX+NGatFrk81O6DQPjzEFvdYKhQ7oY3oqXJWNAK8pLlldA512VSOrDIJGxrk1uLvUAAAOMCEPUIFOjUpRABIAVpBEmm/jFsIU4I9M1cw67/uKSTpNkDwrA4K+OoUUjrFDalXuPTfPAAhqQ+9fryOofz/PNXJMGe01uMPontinq7p2wA=',
    root_hash: '5F739A65D19856E98E8C5663ABBBA19ACACE168E2795569F7FEDC3EE93103BC6',
    proof: {
      total: 1,
      index: 0,
      leaf_hash: 'X3OaZdGYVumOjFZjq7uhmsrOFo4nlVaff+3D7pMQO8Y=',
      aunts: []
    }
  },
  tx_result: {
    code: 0,
    codespace: '',
    log: '',
    data: null,
    events: [ [Object] ],
    gas_wanted: '1000000',
    gas_used: '1000000'
  }
}
```

### `abciInfo`
`BEATOZ` 블록체인 노드 정보를 조회할 수 있는 abci_info 메소드를 호출합니다.
- 요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
try {
    const result: AbciInfoResponse = await web3.beatoz.abciInfo();
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
{
  response: {
    version: '0.17.0',
    app_version: '72620543991349248',
    last_block_height: 561044,
    last_block_app_hash: 'fXg7LijXNP/tuaMQC1cla2iemItJoeXXqXgR44b3qZg='
  }
}
```

### `checkTx`
`BEATOZ` 블록체인에 제출하기 전 트랜잭션의 상태를 확인할 수 있는 check_tx 메소드를 호출합니다.
- 요청
```typescript
import { Web3, TrxProtoBuilder, TrxProto, AccountResponse } from '@beatoz/web3';
import { Web3Account } from '@beatoz/web3-accounts';

// create web3 instance
const web3 = new Web3('https://rpc1.testnet.beatoz.io');

// import private key
const privateKey: string = 'your private key';
const account: Web3Account = privateKeyToAccount(privateKey);

// get accountInfo
const accountInfo: AccountResponse = await web3.beatoz.getAccount(account.address);

// create transaction
const trxProto: TrxProto = TrxProtoBuilder.buildTransferTrxProto({
    from: accountInfo.value.address,
    to: 'address',
    nonce: account.value.nonce,
    amount: '100',
    gas: 1000000,
    gasPrice: '250000000000',
});

try {
    const result: CheckTxResponse = await web3.beatoz.checkTx(trxProto);
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
{
  code: 0,
  data: null,
  log: '',
  info: '',
  gas_wanted: '1000000',
  gas_used: '1000000',
  events: [],
  codespace: '',
  sender: '',
  priority: '0',
  mempoolError: ''
}
```

### `numUnconfirmedTxs`
`BEATOZ` 블록체인에서 컨펌되지 않은 트랜잭션의 수를 확인할 수 있는 num_unconfirmed_txs 메소드를 호출합니다.
- 요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
try {
    const result: NumUnconfirmedTxsResponse = await web3.beatoz.numUnconfirmedTxs()
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
{ n_txs: 0, total: 0, total_bytes: 0, txs: [] }
```

### `broadcastTxAsync`
트랜잭션을 `BEATOZ` 블록체인 네트워크에 비동기적으로 제출할 수 있는 broadcast_tx_async 메소드를 호출합니다..
- 요청
```typescript
import { Web3, TrxProtoBuilder, TrxProto, AccountResponse } from '@beatoz/web3';
import { Web3Account } from '@beatoz/web3-accounts';

// create web3 instance
const web3 = new Web3('https://rpc1.testnet.beatoz.io');

// import private key
const privateKey: string = 'your private key';
const account: Web3Account = privateKeyToAccount(privateKey);

// get accountInfo
const accountInfo: AccountResponse = await web3.beatoz.getAccount(account.address);

// create transaction
const trxProto: TrxProto = TrxProtoBuilder.buildTransferTrxProto({
    from: accountInfo.value.address,
    to: 'address',
    nonce: account.value.nonce,
    amount: '100',
    gas: 1000000,
    gasPrice: '250000000000',
});

// sign transaction
TrxProtoBuilder.signTrxProto(tx, account, 'testnet0');

try {
    const result: BroadcastTxAsyncResponse = await web3.beatoz.broadcastTxAsync(tx);
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
{
  code: 0,
  codespace: '',
  log: '',
  data: '',
  events: [],
  gas_wanted: undefined,
  gas_used: undefined,
  hash: '47C1F5DAFB2A62A92DDB293518EB43E2A38FF5E87625531C46B6A72D4CDAC1FC'
}
```

### `broadcastTxSync`
트랜잭션을 `BEATOZ` 블록체인 네트워크에 비동기적으로 제출할 수 있는 broadcast_tx_sync 메소드를 호출합니다.
- 요청
```typescript
import { Web3, TrxProtoBuilder, TrxProto, AccountResponse } from '@beatoz/web3';
import { Web3Account } from '@beatoz/web3-accounts';

// create web3 instance
const web3 = new Web3('https://rpc1.testnet.beatoz.io');

// import private key
const privateKey: string = 'your private key';
const account: Web3Account = privateKeyToAccount(privateKey);

// get accountInfo
const accountInfo: AccountResponse = await web3.beatoz.getAccount(account.address);

// create transaction
const trxProto: TrxProto = TrxProtoBuilder.buildTransferTrxProto({
    from: accountInfo.value.address,
    to: 'address',
    nonce: account.value.nonce,
    amount: '100',
    gas: 1000000,
    gasPrice: '250000000000',
});

// sign transaction
TrxProtoBuilder.signTrxProto(tx, account, 'testnet0');

try {
    const result: BroadcastTxSyncResponse = await web3.beatoz.broadcastTxSync(tx);
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
{
    code: 0,
        codespace: '',
        log: '',
        data: '',
        events: [],
        gas_wanted: undefined,
        gas_used: undefined,
        hash: 'F95B852EE37F83DB0882EBAF9DF877A7B59C654D07B080ED513564657E56C9CA'
}
```

### `broadcastTxCommit`
트랜잭션을 `BEATOZ` 블록체인 네트워크에 제출하고 커밋이 완료될 때까지 대기하는 broadcast_tx_commit 메소드를 호출합니다.
- 요청
```typescript
import { Web3, TrxProtoBuilder, TrxProto, AccountResponse } from '@beatoz/web3';
import { Web3Account } from '@beatoz/web3-accounts';

// create web3 instance
const web3 = new Web3('https://rpc1.testnet.beatoz.io');

// import private key
const privateKey: string = 'your private key';
const account: Web3Account = privateKeyToAccount(privateKey);

// get accountInfo
const accountInfo: AccountResponse = await web3.beatoz.getAccount(account.address);

// create transaction
const trxProto: TrxProto = TrxProtoBuilder.buildTransferTrxProto({
    from: accountInfo.value.address,
    to: 'address',
    nonce: account.value.nonce,
    amount: '100',
    gas: 1000000,
    gasPrice: '250000000000',
});

// sign transaction
TrxProtoBuilder.signTrxProto(tx, account, 'testnet0');

try {
    const result: BroadcastTxCommitResponse = await web3.beatoz.broadcastTxCommit(tx);
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
{
  height: 562639,
  hash: '466F6AFE6F38D6E98986CE975BC61BF3F4F4FAAC9F5209660FB44196F1D34E00',
  check_tx: {
    code: 0,
    codespace: '',
    log: '',
    data: null,
    events: [],
    gas_wanted: '1000000',
    gas_used: '1000000'
  },
  deliver_tx: {
    code: 0,
    codespace: '',
    log: '',
    data: null,
    events: [ [Object] ],
    gas_wanted: '1000000',
    gas_used: '1000000'
  }
}
```

### `delegatee`
`BEATOZ` 블록체인의 위임 정보를 조회할 수 있는 delegatee 메소드를 호출합니다.
- 요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
try {
    const result: DelegateeResponse = await web3.beatoz.delegatee('636d6b4b823c324675b75986cd749dbc14b3e0a8')
    console.log(result);
} catch (e) {
    console.log(e);
}
```

- 응답
```shell
{
  key: '636D6B4B823C324675B75986CD749DBC14B3E0A8',
  value: {
    address: '636D6B4B823C324675B75986CD749DBC14B3E0A8',
    pubKey: '03EC1DCFD15C06F220B491407E1049B1AC3FE241838C0DD4ECF285AB3BA400F371',
    selfPower: '7000000',
    totalPower: '7000010',
    slashedPower: '0',
    stakes: [ [Object], [Object] ],
    NotSignedHeights: { blockHeights: null }
  },
  height: 563101
}
```

### `rule`
`BEATOZ` 블록체인의 거버넌스 규칙을 조회할 수 있는 rule 메소드를 호출합니다.
- 요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
try {
    const result: RuleResponse = await web3.beatoz.rule();
    console.log(result);
} catch (e) {
    console.log(e);
}
```
- 응답
```shell
{
  value: {
    version: '1',
    maxValidatorCnt: '21',
    minValidatorStake: '7000000000000000000000000',
    rewardPerPower: '1585489599',
    lazyRewardBlocks: '2592000',
    lazyApplyingBlocks: '259200',
    gasPrice: '250000000000',
    minTrxGas: '4000',
    maxTrxGas: '25000000',
    maxBlockGas: '18446744073709551615',
    minVotingPeriodBlocks: '259200',
    maxVotingPeriodBlocks: '2592000',
    minSelfStakeRatio: '50',
    maxUpdatableStakeRatio: '30',
    slashRatio: '50',
    signedBlocksWindow: '10000',
    minSignedBlocks: '500'
  },
  height: 563202
}
```

### `getAccount`
계정에 대한 정보를 조회할 수 있는 account 메소드를 호출합니다.
- 요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
try {
    const result: AccountResponse = await web3.beatoz.getAccount('fef705700f04ccb3c722d12ba8217fc0b50529ac')
    console.log(result);
} catch (e) {
    console.log(e);
}
```
- 응답
```shell
{
  key: 'FEF705700F04CCB3C722D12BA8217FC0B50529AC',
  value: {
    address: 'FEF705700F04CCB3C722D12BA8217FC0B50529AC',
    nonce: 8,
    balance: '4998083843250000000000',
    name: undefined,
    docURL: undefined
  }
}
```

### `stakes`
트랜잭션을 `BEATOZ` 블록체인 네트워크에 제출하고 커밋이 완료될 때까지 대기하는 broadcast_tx_commit 메소드를 호출합니다.
- 요청
```typescript
import { Web3 } from '@beatoz/web3';

const web3 = new Web3('https://rpc1.testnet.beatoz.io');
try {
    const result: StakesResponse = await web3.beatoz.stakes('636d6b4b823c324675b75986cd749dbc14b3e0a8')
    console.log(result);
} catch (e) {
    console.log(e);
}
```
- 응답
```shell
{
  key: '636D6B4B823C324675B75986CD749DBC14B3E0A8',
  value: [
    {
      owner: '636D6B4B823C324675B75986CD749DBC14B3E0A8',
      to: '636D6B4B823C324675B75986CD749DBC14B3E0A8',
      txhash: 'F72491CCA7DD47867654A39EC30C76704543D19BEBA8F793AC15E40EC0D4DF1D',
      startHeight: '5361',
      refundHeight: '0',
      power: '7000000'
    }
  ],
  height: 563416
}
```