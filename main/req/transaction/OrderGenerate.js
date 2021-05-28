import sha256 from 'crypto-js/sha256.js';
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as localUtils from '../../../utils/localUtils.js';
import * as mysqlUtils from '../../../utils/mysqlUtils.js';

import {userAccount, contractAddr} from '../../../utils/config/jingtum.js';
import {mysqlConf} from '../../../utils/config/mysql.js';

const sellPlatformAddr = userAccount.platformAccount[0].address;
const sellPlatformAddrOutBand = userAccount.platformAccount[1].address;

const buyPlatformAddr = userAccount.platformAccount[0].address;
const buyPlatformAddrOutBand = userAccount.platformAccount[1].address;

const buyerAddr = userAccount.normalAccount.map(acc => acc.address);

const buyOrderContractAddrs = contractAddr.buyOrder;
const sellOrderContractAddrs = contractAddr.sellOrder;

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接

global.salt = 1 + localUtils.randomNumber(1, 9999); 
//*****************************************************************************************************//
// 买单
//
//*****************************************************************************************************//
// Eg:生成外部平台挂京东买单
export function generateBuyOrderOutBand() {
    
    let subBuyOrderList = generateSubBuyOrder();
    let limitPrice = localUtils.randomNumber(1000, 10000);
    let tradeStrategy = localUtils.randomSelect([0,1]); // 0-性价比最高策略 1-价格最低策略
    // let authorizationType = localUtils.randomNumber(0,9); // 十个授权方式
    let authorizationType = localUtils.randomNumber(0,9); // 十个授权方式

    let authorizationInfo = generateAuthorizationInfo(authorizationType);
    let side = 0;
    let buyOrder = {
        subBuyOrderList: subBuyOrderList,
        limitPrice: limitPrice,
        tradeStrategy: tradeStrategy,
        authorizationInfo: authorizationInfo,
        side: side,
        buyerAddr: buyerAddr[localUtils.randomNumber(0,9)],//10个用户
        contact: 'phoneNumber', // 联系方式
        platformAddr: buyPlatformAddrOutBand, // 买方平台2
        contractAddr: buyOrderContractAddrs[0],  // 买方平台2 跨平台买单挂在买方合约上
    };
    buyOrder.buyOrderId = sha256(seq.toString() + salt.toString()).toString();
    salt = salt + 1;
    return buyOrder;

}
// Eg:生成外部平台挂京东买单
export function generateBuyOrder() {
    
    let subBuyOrderList = generateSubBuyOrder();
    let limitPrice = localUtils.randomNumber(5000, 40000);
    // limitPrice = 40000;
    let tradeStrategy = localUtils.randomSelect([0,1]); // 0-性价比最高策略 1-价格最低策略
    let authorizationType = localUtils.randomNumber(0,9); // 十个授权方式
    let authorizationInfo = generateAuthorizationInfo(authorizationType);
    let side = 0;
    let buyOrder = {
        subBuyOrderList: subBuyOrderList,
        limitPrice: limitPrice,
        tradeStrategy: tradeStrategy,
        authorizationInfo: authorizationInfo,
        side: side,
        buyerAddr: buyerAddr[localUtils.randomNumber(0,9)],//10个用户
        contact: 'phoneNumber', // 联系方式
        platformAddr: buyPlatformAddr,
        contractAddr: contractAddr.buyOrder[0],
    };
    buyOrder.buyOrderId = sha256(seq.toString() + salt.toString()).toString();
    salt = salt + 1;
    return buyOrder;

}

export function generateSubBuyOrder() {
    let subBuyOrderList = [];
    let subBuyOrderListAmount = localUtils.randomNumber(1, 4)
    
    for(let i = subBuyOrderListAmount; i > 0; i--) {
        let labelDemand = {};
        let labelWeight = {};
        [labelDemand,labelWeight] = generateLabelDemand_AND_LabeWeight();
        subBuyOrderList.push({
            labelAmount: localUtils.randomNumber(1, 5),
            labelDemand: labelDemand,
            labelWeight: labelWeight,
        })
    }
    

    return subBuyOrderList;

}
export function generateLabelDemand_AND_LabeWeight() {

    let labelDemand = {};
    let labelWeight = {
        0: {},
        1: {},
        2: {},
        3: {},
        4: {},
    }

    // ORIGIN 
    for(let i = 0; i < 5; i++) {
        let Demand =[];
        for(let j = 0; j < 5; j++) {
            if(localUtils.randomNumber(1,4) == 1){// 增加标签
                Demand.push(j);  
                labelWeight[i][j] = localUtils.randomNumber(5,10);  
            }
        }
        labelDemand[i] = Demand;
    }

    // Less 
    // let count = 0;
    // while(count == 0 ){
    //     count = 0;
    //     for(let i = 0; i < 5; i++) {
    //         let Demand =[];
    //         for(let j = 0; j < 5; j++) {
    //             if(localUtils.randomNumber(1,25) == 1){// 增加标签
    //                 Demand.push(j);  
    //                 labelWeight[i][j] = localUtils.randomNumber(5,10);  
    //                 count = 1;
    //             }
    //         }
    //         labelDemand[i] = Demand;
    //     }
    //     console.log(labelDemand,count);
    // }

    // All 
    // for(let i = 0; i < 5; i++) {
    //     let Demand =[];
    //     for(let j = 0; j < 5; j++) {
    //         Demand.push(j);  
    //         labelWeight[i][j] = localUtils.randomNumber(5,10);  
    //     }
    //     labelDemand[i] = Demand;
    // }
    // labelDemand[4] = [];
    

    for(let i = 0; i < 5; i++) {
        for(let j = 0; j < 5; j++) {
            if(labelWeight[i][j] == null){
                // if(localUtils.randomSelect([0,1,2,3,4]) == 1)// 该标签不赋值
                //     1 == 1;
                if(localUtils.randomSelect([0,1]) == 1)// 喜欢
                    labelWeight[i][j] = localUtils.randomNumber(5,10);
                else
                    labelWeight[i][j] = localUtils.randomNumber(0,5);
            }
        }
    }

    return [labelDemand,labelWeight];

}

// unused
export function generateLabelDemand() {

    let labelDemand = {};
    //作品大类标签 5
    if(localUtils.randomNumber(0,2) == 0){//作品风格 5
        labelDemand[0] = [localUtils.randomNumber(0,4)];
    }
    if(localUtils.randomNumber(0,2) == 0){//作品语种 5
        labelDemand[1] = [localUtils.randomNumber(0,4)];
    }
    if(localUtils.randomNumber(0,2) == 0){//作品情感 5
        labelDemand[2] = [localUtils.randomNumber(0,4)];
    }
    if(localUtils.randomNumber(0,2) == 0){//作品声音特质 5
        labelDemand[3] = [localUtils.randomNumber(0,4)];
    }
    if(localUtils.randomNumber(0,2) == 0){//作品配器 5
        labelDemand[4] = [localUtils.randomNumber(0,4)];
    }
    return labelDemand;

}
// unused
export function generateLabelWeight() {

    let labelWeight = {
        0: {},
        1: {},
        2: {},
        3: {},
        4: {},
    }
    for(let i = 0; i < 5; i++) {
        for(let j = 0; j < 5; j++) {
            labelWeight[i][j] = localUtils.randomSelect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);  //跟generateLabelDemand冲突？
        }
    }
    return labelWeight;

}

export function generateAuthorizationInfo(authorizationType) {

    let authorizationInfo = {};
    authorizationInfo[authorizationType] = {};
    switch(authorizationType) {
        case 0:
        case 8:
            authorizationInfo[authorizationType].authorizationChannel = localUtils.randomSelect([0, 1]);
            authorizationInfo[authorizationType].authorizationArea = localUtils.randomSelect([0, 1, 2]);
            authorizationInfo[authorizationType].authorizationTime = localUtils.randomSelect([0, 1, 2, 3]);
            break;
        case 1:
        case 2:
        case 7:
        case 9:
            authorizationInfo[authorizationType].authorizationChannel = 0;
            authorizationInfo[authorizationType].authorizationArea = localUtils.randomSelect([0, 1, 2]);
            authorizationInfo[authorizationType].authorizationTime = localUtils.randomSelect([0, 1, 2, 3]);
            break;
        case 3:
            authorizationInfo[authorizationType].authorizationChannel = localUtils.randomSelect([0, 1, 2]);
            authorizationInfo[authorizationType].authorizationArea = localUtils.randomSelect([0, 1, 2]);
            authorizationInfo[authorizationType].authorizationTime = localUtils.randomSelect([0, 1, 2, 3]);
            break;
        case 4:
        case 5:
            authorizationInfo[authorizationType].authorizationChannel = localUtils.randomSelect([0, 1]);
            authorizationInfo[authorizationType].authorizationArea = localUtils.randomSelect([0, 1, 2]);
            authorizationInfo[authorizationType].authorizationTime = 0;
            break;
        case 6:
            authorizationInfo[authorizationType].authorizationChannel = 0;
            authorizationInfo[authorizationType].authorizationArea = localUtils.randomSelect([0, 1, 2]);
            authorizationInfo[authorizationType].authorizationTime = 0;
            break;
        default:
            break;
    }
    return authorizationInfo;

}


//*****************************************************************************************************//
// 卖单
//
//*****************************************************************************************************//
// Eg:生成京东平台挂京东公开卖单
export async function generateSellOrder() {

    let sql1 = sqlText.table('work_info').field('address').group('address').having('count(address)>1').order('RAND()').limit(1).select();
    let sellerAddr = (await mysqlUtils.sql(c, sql1))[0].address;
    let sql2 = sqlText.table('work_info').field('work_id').where({address: sellerAddr}).order('RAND()').limit(2).select();
    let workInfoArr = await mysqlUtils.sql(c, sql2);
    let workIds = workInfoArr.map(workInfo => {
        return workInfo.work_id;
    });

    let labelSet = generateLabelSet();
    let basePrice = localUtils.randomNumber(100, 1000);
    // basePrice = 0;

    let expectedPrice = generateExpectedPrice(basePrice); 

    let sellOrder = {
        labelSet: labelSet,
        expectedPrice: expectedPrice,
        sellerAddr: sellerAddr,
        contact: 'phoneNumber', // 联系方式
        assetId: workIds,// TODO 缺乏workID
        assetType: 0,
        consumable: false,
        expireTime: 86400,
        platformAddr: sellPlatformAddr,
        contractAddr: sellOrderContractAddrs[0],
    }

    sellOrder.sellOrderId = sha256(seq.toString() + salt.toString()).toString();
    salt = salt + 1;
    return sellOrder;

}
export async function generateSellOrderOutBand() {

    let sql1 = sqlText.table('work_info').field('address').group('address').having('count(address)>1').order('RAND()').limit(1).select();
    let sellerAddr = (await mysqlUtils.sql(c, sql1))[0].address;
    let sql2 = sqlText.table('work_info').field('work_id').where({address: sellerAddr}).order('RAND()').limit(2).select();
    let workInfoArr = await mysqlUtils.sql(c, sql2);
    let workIds = workInfoArr.map(workInfo => {
        return workInfo.work_id;
    });

    let labelSet = generateLabelSet();
    let basePrice = localUtils.randomNumber(100, 1000);
    // basePrice = 0;

    let expectedPrice = generateExpectedPrice(basePrice);

    let sellOrder = {
        labelSet: labelSet,
        expectedPrice: expectedPrice,
        sellerAddr: sellerAddr,
        contact: 'phoneNumber', // 联系方式
        assetId: workIds,
        assetType: 0,
        consumable: false,
        expireTime: 86400,
        platformAddr: sellPlatformAddrOutBand,
        contractAddr: sellOrderContractAddrs[1],
    }

    sellOrder.sellOrderId = sha256(seq.toString() + salt.toString()).toString();
    salt = salt + 1;
    return sellOrder;

}
export function generateLabelSet() {

    let labelSet = {};
    //作品大类标签 5
    for(let i = 0; i < 5; i++) {
        let Demand =[];
        for(let j = 0; j < 5; j++) {
            if(localUtils.randomSelect([0,1,2,3]) == 1){// 增加标签
                Demand.push(j);  
            }
            // Demand.push(j); 
        }
        labelSet[i] = Demand;
    }
    
    return labelSet;

}

export function generateExpectedPrice(basePrice) {

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