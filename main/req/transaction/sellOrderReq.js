import jlib from 'jingtum-lib';
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';
import sha256 from 'crypto-js/sha256.js';
import util from 'util';
import * as requestInfo from '../../../utils/jingtum/requestInfo.js';
import * as mysqlUtils from '../../../utils/mysqlUtils.js';
import * as localUtils from '../../../utils/localUtils.js';
import * as fetch from '../../../utils/fetch.js';

import {chains, userAccount, mysqlConf, sellOrderContractAddr, debugMode} from '../../../utils/info.js';

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接
const MidIP = '39.102.93.47';// 中间层服务器IP
// const MidIP = 'localhost';// 中间层服务器IP
const msPerSellOrder = 5000;
const sellOrderAmount = 1;
const platformAddr = userAccount[4].address; // 平台账号
const platformSecret = userAccount[4].secret;
// const sellerAddr = userAccount[5].address;

// setInterval(postSellOrderReq, msPerSellOrder);

const contractChain = chains[1];
const Remote = jlib.Remote;
const contractRemote = new Remote({server: contractChain.server[0], local_sign: true});

// 连接到权益链
contractRemote.connect(async function(err, res) {

    if(err) {
        return console.log('err: ', err);
    }
    else if(res) {
        console.log('connect: ', res);
    }
    global.seq = (await requestInfo.requestAccountInfo(platformAddr, contractRemote, false)).account_data.Sequence;

    // postSellOrderReq();
    setInterval(postSellOrderReq, msPerSellOrder);


});

async function postSellOrderReq() {

    console.time('sellOrderReq');

    for(let i = 0; i < sellOrderAmount; i++) {

        let addrFilter = {
            addr: 'jGcNi9Bs4eddeeYZJfQMhXqgcyGYK5n8N9',
        };
        let sql = sqlText.table('work_info').field('work_id').where(addrFilter).order('RAND()').limit(2).select();//Rand Select 2 work to sell
        let workInfoArr = await mysqlUtils.sql(c, sql);

        let workIds = workInfoArr.map(workInfo => {
            return workInfo.work_id;
        });
        let sellerAddr = addrFilter.addr;
        let sellOrder = generateSellOrder(workIds, sellerAddr);
        if(debugMode) {
            console.log('sellOrder:', sellOrder);
        }
        
        let sellOrderRes = await fetch.postData(util.format('http://%s:9001/transaction/sell', MidIP), sellOrder);
        // let buf = Buffer.from(sellOrderRes.body._readableState.buffer.head.data);
        // // if(debugMode) console.log('buf.toString():', buf.toString());
        // let txJson = JSON.parse(buf.toString());
        // let unsignedTx = {
        //     tx_json: txJson,
        // };
        // jlib.Transaction.prototype.setSequence.call(unsignedTx, seq++);
        // jlib.Transaction.prototype.setSecret.call(unsignedTx, platformSecret);
        // jlib.Transaction.prototype.sign.call(unsignedTx, () => {});
        // let blob = unsignedTx.tx_json.blob;
        
        // let signedTxRes = await fetch.postData(util.format('http://%s:9001/transaction/signedSell', MidIP), blob);
        // let resInfo = JSON.parse(Buffer.from(signedTxRes.body._readableState.buffer.head.data).toString());
        // console.log('res:', resInfo);

    }
    
    console.timeEnd('sellOrderReq');
    console.log('--------------------');

}


function generateSellOrder(wrokIds, sellerAddr) {
    let labelSet = generateLabelSet();
    let basePrice = localUtils.randomNumber(100, 1000);
    let expectedPrice = generateExpectedPrice(basePrice);

    let sellOrder = {
        labelSet: labelSet,
        expectedPrice: expectedPrice,
        sellerAddr: sellerAddr,
        contact: 'phoneNumber', // 联系方式
        assetId: wrokIds,
        assetType: 0,
        consumable: false,
        expireTime: 86400,
        platformAddr: platformAddr,
        contractAddr: sellOrderContractAddr,
    }

    sellOrder.sellOrderId = sha256((seq++).toString() + 'a').toString();
    console.log(seq);
    return sellOrder;

}

function generateLabelSet() {

    let labelSet = {};
    for(let i = 0; i < 5; i++) {
        labelSet[i] = [localUtils.randomSelect([0, 1, 2, 3, 4])];
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
    for(let i = 0; i < 10; i++) {
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