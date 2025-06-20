import {Web3} from 'beatoz-sdk-js'
const web3 = new Web3("http://localhost:26657")

web3.subscribe('ws://localhost:26657/websocket', "tm.event='NewBlockHeader'", (resp) => {
    console.log(resp)
})