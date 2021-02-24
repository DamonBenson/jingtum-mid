import jlib from 'jingtum-lib';

import * as localUtils from '../../utils/localUtils.js';
import * as fetch from '../../utils/fetch.js';

import {userAccount, debugMode} from '../../utils/info.js';

const msPerSellOrder = 10000;
const platformAddress = userAccount[5].address; // 平台账号
const platformSecret = userAccount[5].secret;

// setInterval(postSellOrderReq, msPerSellOrder);

postSellOrderReq();

async function postSellOrderReq() {

    console.time('sellOrderReq');
    let sellOrder = generateSellOrder();
    if(debugMode) {
        console.log('sellOrder:', sellOrder);
    }
    let unsignedTx = await fetch.postData('http://127.0.0.1:9001/transaction/sell', sellOrder);
    unsignedTx.setSecret(platformSecret);
    unsignedTx.sign();
    let blob = signedTx.blob;
    await fetch.postData('http://127.0.0.1:9001/transaction/signedSell', blob);
    console.timeEnd('sellOrderReq');
    console.log('--------------------');

}

function generateSellOrder() {
    
    let labelSet = generateLabelSet();
    let basePrice = localUtils.randomNumber(100, 1000);
    let expectedPrice = generateExpectedPrice(basePrice);
    let sellOrder = {
        labelSet: labelSet,
        expectedPrice: expectedPrice,
        contact: 'phoneNumber', // 联系方式
        workId: '7848E52E59ACDB6BD51CB0BC219628B01980633E6D1AAB1C6A22547985C0927A',
        assetType: 0,
        consumable: true,
        expireTime: 86400,
        addr: platformAddress,
        contractAddr: '', // 待部署
    }
    sellOrder.orderId = sha256(sellOrder).toString();
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

    let expectedPrice = {};
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

}