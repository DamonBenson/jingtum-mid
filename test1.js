import jlib from 'jingtum-lib';
import * as requestInfo from '../../utils/jingtum/requestInfo.js';
import * as contract from "./utils/jingtum/contract";
import * as ipfsUtils from './utils/ipfsUtils.js';
import { chains, sellOrderContractAddr } from "./utils/info";

const Remote = jlib.Remote;

const contractChain = chains[1];
const contractRemote = new Remote({server: 'ws://172.31.43.237:9030', local_sign: true});
const platformAddr = contractChain.account.a[4].address;
const platformSecret = contractChain.account.a[4].secret;

const abi;

const ipfs = ipfsAPI({
    host: '127.0.0.1',
    port: '5001',
    protocol: 'http',
}); // ipfs连接

async function test1() {
    let count = 0;
    let ipfsInfo = JSON.stringify(generateIpfsInfo());
    contractRemote.connect(async function(err, res) {

        if(err) {
            return console.log('err: ', err);
        }
        else if(res) {
            console.log('connect: ', res);
        }

        let seq = (await requestInfo.requestAccountInfo(platformAddr, contractRemote, false)).account_data.Sequence;

        while(true) {
            let orderId = sha256(count.toString()).toString();
            console.log(count++);
            let func = generateFuncStr(orderId, ipfsInfo);
            await contract.invokeContract(platformAddr, platformSecret, contractRemote, seq++, abi, sellOrderContractAddr, func, true);
        }

    })
    
}

async function test2() {
    let count = 0;
    let ipfsInfo = JSON.stringify(generateIpfsInfo());
    contractRemote.connect(async function(err, res) {

        if(err) {
            return console.log('err: ', err);
        }
        else if(res) {
            console.log('connect: ', res);
        }

        let seq = (await requestInfo.requestAccountInfo(platformAddr, contractRemote, false)).account_data.Sequence;

        while(true) {
            let orderId = sha256(count.toString()).toString();
            console.log(count++);
            let ipfsInfoHash = await ipfsUtils.add(ipfs, Buffer.from(JSON.stringify(ipfsInfo)));
            let func = generateFuncStr(orderId, ipfsInfoHash);
            await contract.invokeContract(platformAddr, platformSecret, contractRemote, seq++, abi, sellOrderContractAddr, func, true);
        }

    })
    
}

function generateFuncStr(orderId, ipfsInfo) {
    return "makeOrder('" + orderId + "','1D3FC1B79CD0F2A207C8F6B669FB1F2F26325F52FEE4F5490AEB5A869DB2F080',0,false,86400,'" + ipfsInfo + "')";
}



function generateIpfsInfo() {
    
    let labelSet = generateLabelSet();
    let basePrice = localUtils.randomNumber(100, 1000);
    let expectedPrice = generateExpectedPrice(basePrice);
    let ipfsInfo = {
        labelSet: labelSet,
        expectedPrice: expectedPrice,
        sellerAddr: 'jGcNi9Bs4eddeeYZJfQMhXqgcyGYK5n8N9',
        contact: 'phoneNumber',
    }
    
    return ipfsInfo;

}

function generateLabelSet() {

    let labelSet = {};
    for(let i = 0; i < 5; i++) {
        // labelSet[i] = [localUtils.randomSelect([0, 1, 2, 3, 4])];
        labelSet[i] = [0];
    }
    return labelSet;

}

function generateExpectedPrice(basePrice) {

    let expectedPrice = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
    };
    for(let i = 0; i < 9; i++) {
        switch(i) {
            case 0:
            case 8:
                for(let j = 0; j < 2; j++) {
                    for(let k = 0; k < 3; k++) {
                        for(let l = 0; l < 4; l++) {
                            expectedPrice[i].push({
                                authorizationChannel: j,
                                authorizationArea: k,
                                authorizationTime: l,
                                authorizationPrice: basePrice,
                            });
                        }
                    }
                }
                break;
            case 1:
            case 2:
            case 7:
            case 9:
                for(let k = 0; k < 3; k++) {
                    for(let l = 0; l < 4; l++) {
                        expectedPrice[i].push({
                            authorizationChannel: 0,
                            authorizationArea: k,
                            authorizationTime: l,
                            authorizationPrice: basePrice,
                        });
                    }
                }
                break;
            case 3:
                for(let j = 0; j < 3; j++) {
                    for(let k = 0; k < 3; k++) {
                        for(let l = 0; l < 4; l++) {
                            expectedPrice[i].push({
                                authorizationChannel: j,
                                authorizationArea: k,
                                authorizationTime: l,
                                authorizationPrice: basePrice,
                            });
                        }
                    }
                }
                break;
            case 4:
            case 5:
                for(let j = 0; j < 2; j++) {
                    for(let k = 0; k < 3; k++) {
                        expectedPrice[i].push({
                            authorizationChannel: j,
                            authorizationArea: k,
                            authorizationTime: 0,
                            authorizationPrice: basePrice,
                        });
                    }
                }
                break;
            case 6:
                for(let k = 0; k < 3; k++) {
                    expectedPrice[i].push({
                        authorizationChannel: 0,
                        authorizationArea: k,
                        authorizationTime: 0,
                        authorizationPrice: basePrice,
                    });
                }
                break;
            default:
                break;
        }
    }

    return expectedPrice;

}
