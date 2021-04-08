import jlib from 'jingtum-lib';
import ipfsAPI from 'ipfs-api';
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';
import Joi from 'joi';

import * as tx from '../../../utils/jingtum/tx.js'
import * as ipfsUtils from '../../../utils/ipfsUtils.js';
import * as mysqlUtils from '../../../utils/mysqlUtils.js';

import {chains, ipfsConf, mysqlConf} from '../../../utils/info.js';

const ipfs = ipfsAPI(ipfsConf); // ipfs连接
const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接
const tokenChain = chains[0]; // 交易链
const u = jlib.utils;

// 智能授权系统发币账号
const a1 = tokenChain.account.a[1].address;
const s1 = tokenChain.account.a[1].secret;

/*----------买单数据格式验证----------*/

const minSubBuyOrderListLength = 1;
const maxSubBuyOrderListLength = 5;
const minLabelAmount = 1;
const maxLabelAmount = 1000;
const mainClassAmount = 5;
const subClassAmount = 5;
const maxWeight = 10;
const minLimitPrice = 100;
const maxLimitPrice = 100000;
const minAuthPrice = 1;
const maxAuthPrice = 1000;
const tradeStrategyAmount = 2;
const maxAssetAmout = 100;
const minExpireTime = 3600;
const maxExpireTime = 2592000;
const assetTypeAmount = 3;

const authChannelAmount = {
    '0': 2,
    '1': 1,
    '2': 1,
    '3': 3,
    '4': 2,
    '5': 2,
    '6': 1,
    '7': 1,
    '8': 2,
    '9': 1,
};

const authAreaAmount = {
    '0': 3,
    '1': 3,
    '2': 3,
    '3': 3,
    '4': 3,
    '5': 3,
    '6': 3,
    '7': 3,
    '8': 3,
    '9': 3,
};

const authTimeAmount = {
    '0': 4,
    '1': 4,
    '2': 4,
    '3': 4,
    '4': 1,
    '5': 1,
    '6': 1,
    '7': 4,
    '8': 4,
    '9': 4,
};

const authSubTypeAmount = {
    '0': 24,
    '1': 12,
    '2': 12,
    '3': 36,
    '4': 6,
    '5': 6,
    '6': 3,
    '7': 12,
    '8': 24,
    '9': 12,
};

const sideConst = 0;
// const contact = ''; // 如何验证？

const authCustom = Joi.extend((joi) => {

    return {
        type: 'authType',
        base: joi.object(),
        messages: {
            'authType.nonexist': '{{#label}} must have valid flags',
            'authType.dataType': '{{#label}} has a flag with wrong data type',
            'authType.overflow': '{{#label}} has a flag out of range',
        },
        rules: {
            buyFlag: {
                validate(value, helpers, args, options) {
                    for(let key in value) {
                        let o = value[key];
                        if(
                            !o.hasOwnProperty('authorizationChannel') ||
                            !o.hasOwnProperty('authorizationArea') ||
                            !o.hasOwnProperty('authorizationTime')
                        ) {
                            return helpers.error('authType.nonexist', {});
                        }
                        else {
                            if(
                                !Number.isInteger(o.authorizationChannel) ||
                                !Number.isInteger(o.authorizationArea) ||
                                !Number.isInteger(o.authorizationTime)
                            ) {
                                return helpers.error('authType.dataType', {});
                            }
                            else {
                                if(
                                    !(0 <= o.authorizationChannel && o.authorizationChannel <= authChannelAmount[Number(key)]) ||
                                    !(0 <= o.authorizationArea && o.authorizationArea <= authAreaAmount[Number(key)]) ||
                                    !(0 <= o.authorizationTime && o.authorizationTime <= authTimeAmount[Number(key)])
                                ) {
                                    return helpers.error('authType.overflow', {});
                                }
                            }
                        }
                    }
                }
            },
            sellFlag: {
                validate(value, helpers, args, options) {
                    for(let key in value) {
                        let l = value[key].length;
                        for(let i = 0; i < l; i++) {
                            let o = value[key][i];
                            if(
                                !o.hasOwnProperty('authorizationChannel') ||
                                !o.hasOwnProperty('authorizationArea') ||
                                !o.hasOwnProperty('authorizationTime') ||
                                !o.hasOwnProperty('authorizationPrice')
                            ) {
                                return helpers.error('authType.nonexist', {});
                            }
                            else {
                                if(
                                    !Number.isInteger(o.authorizationChannel) ||
                                    !Number.isInteger(o.authorizationArea) ||
                                    !Number.isInteger(o.authorizationTime) ||
                                    !Number.isInteger(o.authorizationPrice)
                                ) {
                                    return helpers.error('authType.dataType', {});
                                }
                                else {
                                    if(
                                        !(0 <= o.authorizationChannel && o.authorizationChannel <= authChannelAmount[Number(key)]) ||
                                        !(0 <= o.authorizationArea && o.authorizationArea <= authAreaAmount[Number(key)]) ||
                                        !(0 <= o.authorizationTime && o.authorizationTime <= authTimeAmount[Number(key)]) ||
                                        !(minAuthPrice <= o.authorizationPrice && o.authorizationPrice <= maxAuthPrice)
                                    ) {
                                        return helpers.error('authType.overflow', {});
                                    }
                                }
                            }
                        }
                    }
                }
            },
        }
    };
    
});

const jingtumCustom = Joi.extend((joi) => {

    return {
        type: 'jingtum',
        base: joi.string(),
        messages: {
            'jingtum.hash': '{{#label}} is not a valid hash',
            'jingtum.address': '{{#label}} is not a valid address',
            'jingtum.secret': '{{#label}} is not a valid secret',
        },
        rules: {
            hash: {
                validate(value, helpers, args, options) {
                    if(!u.isValidHash(value)) {
                        return helpers.error('jingtum.hash');
                    }
                }
            },
            address: {
                validate(value, helpers, args, options) {
                    if(!u.isValidAddress(value)) {
                        return helpers.error('jingtum.address');
                    }
                }
            },
            secret: {
                validate(value, helpers, args, options) {
                    if(!u.isValidSecret(value)) {
                        return helpers.error('jingtum.secret');
                    }
                }
            },
        }
    };
});

/*----------上传已签名交易的数据格式验证----------*/

async function validateSignedTx(blob) {
    
    const signedTxSchema = Joi.string().hex().required();

    try {
        await signedTxSchema.validateAsync(blob);
    }
    catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        return [false, e];
    }

    return [true, 'valid req.'];

}

/*----------上传买单请求的数据格式验证----------*/

async function validateBuyOrderReq(body) {

    let authType;
    try {
        authType = Number(Object.keys(body.authorizationInfo)[0]);
    }
    catch(e) {
        console.log(e.name + ": " + e.message);
        console.log(e.stack);
        return [false, e.name + ": " + e.message];
    }

    const buyOrderReqSchema = Joi.object().keys({
        subBuyOrderList: 
            Joi.array().min(minSubBuyOrderListLength).max(maxSubBuyOrderListLength).items(
                Joi.object().keys({
                    labelAmount: 
                        Joi.number().integer().min(minLabelAmount).max(maxLabelAmount).required(),
                    labelDemand: 
                        Joi.object().length(mainClassAmount).and('0', '1', '2', '3', '4').pattern(
                            /.*/,
                            Joi.array().items(Joi.number().integer().min(0).max(subClassAmount - 1)).unique(),
                        ).required(),
                    labelWeight: 
                        Joi.object().length(mainClassAmount).and('0', '1', '2', '3', '4').pattern(
                            /.*/,
                            Joi.object().length(subClassAmount).and('0', '1', '2', '3', '4').pattern(
                                /.*/,
                                Joi.number().integer().min(0).max(maxWeight),
                            ),
                        ).required(),
                })
            ).required(),
        limitPrice:
            Joi.number().integer().min(minLimitPrice).max(maxLimitPrice).required(),
        tradeStrategy:
            Joi.number().integer().min(0).max(tradeStrategyAmount - 1).required(),
        authorizationInfo:
            authCustom.authType().length(1).or('0', '1', '2', '3', '4', '5', '6', '7', '8', '9').buyFlag().required(),
            /* Joi.object().length(1).or('0', '1', '2', '3', '4', '5', '6', '7', '8', '9').pattern(
                /.*\/,
                Joi.object().keys({
                    authorizationChannel:
                        Joi.number().integer().min(0).max(authChannelAmount[authType] - 1).required(),
                    authorizationArea:
                        Joi.number().integer().min(0).max(authAreaAmount[authType] - 1).required(),
                    authorizationTime:
                        Joi.number().integer().min(0).max(authTimeAmount[authType] - 1).required(),
                })
            ).required(), */
        side:
            Joi.number().integer().min(sideConst).max(sideConst).required(),
        buyerAddr:
            jingtumCustom.jingtum().address().required(),
        contact:
            Joi.string().required(), // 如何验证？
        platformAddr:
            jingtumCustom.jingtum().address().required(), 
        contractAddr:
            jingtumCustom.jingtum().address().required(), 
        buyOrderId:
            jingtumCustom.string().hex().required(),
    });

    try {
        await buyOrderReqSchema.validateAsync(body);
    }
    catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        return [false, e];
    }

    return [true, 'valid req.'];
    
}

/*----------上传卖单请求的数据格式验证----------*/

async function validateSellOrderReq(body) {

    const sellOrderReqSchema = Joi.object().keys({
        labelSet:
            Joi.object().length(mainClassAmount).and('0', '1', '2', '3', '4').pattern(
                /.*/,
                Joi.array().items(Joi.number().integer().min(0).max(subClassAmount - 1)).unique(),
            ).required(),
        expectedPrice:
            authCustom.authType().max(10).and('0', '1', '2', '3', '4', '5', '6', '7', '8', '9').sellFlag().required(),
            /* Joi.object().keys({
                '0':
                    Joi.array().length(authSubTypeAmount['0']).items(
                        Joi.object().keys({
                            authorizationChannel:
                                Joi.number().integer().min(0).max(authChannelAmount['0'] - 1).required(),
                            authorizationArea:
                                Joi.number().integer().min(0).max(authAreaAmount['0'] - 1).required(),
                            authorizationTime:
                                Joi.number().integer().min(0).max(authTimeAmount['0'] - 1).required(),
                            authorizationPrice:
                                Joi.number().integer().min(minAuthPrice).max(maxAuthPrice).required(),
                        })
                    ).required(),
                '1':
                    Joi.array().length(authSubTypeAmount['1']).items(
                        Joi.object().keys({
                            authorizationChannel:
                                Joi.number().integer().min(0).max(authChannelAmount['1'] - 1).required(),
                            authorizationArea:
                                Joi.number().integer().min(0).max(authAreaAmount['1'] - 1).required(),
                            authorizationTime:
                                Joi.number().integer().min(0).max(authTimeAmount['1'] - 1).required(),
                            authorizationPrice:
                                Joi.number().integer().min(minAuthPrice).max(maxAuthPrice).required(),
                        })
                    ).required(),
                '2':
                    Joi.array().length(authSubTypeAmount['2']).items(
                        Joi.object().keys({
                            authorizationChannel:
                                Joi.number().integer().min(0).max(authChannelAmount['2'] - 1).required(),
                            authorizationArea:
                                Joi.number().integer().min(0).max(authAreaAmount['2'] - 1).required(),
                            authorizationTime:
                                Joi.number().integer().min(0).max(authTimeAmount['2'] - 1).required(),
                            authorizationPrice:
                                Joi.number().integer().min(minAuthPrice).max(maxAuthPrice).required(),
                        })
                    ).required(),
                '3':
                    Joi.array().length(authSubTypeAmount['3']).items(
                        Joi.object().keys({
                            authorizationChannel:
                                Joi.number().integer().min(0).max(authChannelAmount['3'] - 1).required(),
                            authorizationArea:
                                Joi.number().integer().min(0).max(authAreaAmount['3'] - 1).required(),
                            authorizationTime:
                                Joi.number().integer().min(0).max(authTimeAmount['3'] - 1).required(),
                            authorizationPrice:
                                Joi.number().integer().min(minAuthPrice).max(maxAuthPrice).required(),
                        })
                    ).required(),
                '4':
                    Joi.array().length(authSubTypeAmount['4']).items(
                        Joi.object().keys({
                            authorizationChannel:
                                Joi.number().integer().min(0).max(authChannelAmount['4'] - 1).required(),
                            authorizationArea:
                                Joi.number().integer().min(0).max(authAreaAmount['4'] - 1).required(),
                            authorizationTime:
                                Joi.number().integer().min(0).max(authTimeAmount['4'] - 1).required(),
                            authorizationPrice:
                                Joi.number().integer().min(minAuthPrice).max(maxAuthPrice).required(),
                        })
                    ).required(),
                '5':
                    Joi.array().length(authSubTypeAmount['5']).items(
                        Joi.object().keys({
                            authorizationChannel:
                                Joi.number().integer().min(0).max(authChannelAmount['5'] - 1).required(),
                            authorizationArea:
                                Joi.number().integer().min(0).max(authAreaAmount['5'] - 1).required(),
                            authorizationTime:
                                Joi.number().integer().min(0).max(authTimeAmount['5'] - 1).required(),
                            authorizationPrice:
                                Joi.number().integer().min(minAuthPrice).max(maxAuthPrice).required(),
                        })
                    ).required(),
                '6':
                    Joi.array().length(authSubTypeAmount['6']).items(
                        Joi.object().keys({
                            authorizationChannel:
                                Joi.number().integer().min(0).max(authChannelAmount['6'] - 1).required(),
                            authorizationArea:
                                Joi.number().integer().min(0).max(authAreaAmount['6'] - 1).required(),
                            authorizationTime:
                                Joi.number().integer().min(0).max(authTimeAmount['6'] - 1).required(),
                            authorizationPrice:
                                Joi.number().integer().min(minAuthPrice).max(maxAuthPrice).required(),
                        })
                    ).required(),
                '7':
                    Joi.array().length(authSubTypeAmount['7']).items(
                        Joi.object().keys({
                            authorizationChannel:
                                Joi.number().integer().min(0).max(authChannelAmount['7'] - 1).required(),
                            authorizationArea:
                                Joi.number().integer().min(0).max(authAreaAmount['7'] - 1).required(),
                            authorizationTime:
                                Joi.number().integer().min(0).max(authTimeAmount['7'] - 1).required(),
                            authorizationPrice:
                                Joi.number().integer().min(minAuthPrice).max(maxAuthPrice).required(),
                        })
                    ).required(),
                '8':
                    Joi.array().length(authSubTypeAmount['8']).items(
                        Joi.object().keys({
                            authorizationChannel:
                                Joi.number().integer().min(0).max(authChannelAmount['8'] - 1).required(),
                            authorizationArea:
                                Joi.number().integer().min(0).max(authAreaAmount['8'] - 1).required(),
                            authorizationTime:
                                Joi.number().integer().min(0).max(authTimeAmount['8'] - 1).required(),
                            authorizationPrice:
                                Joi.number().integer().min(minAuthPrice).max(maxAuthPrice).required(),
                        })
                    ).required(),
                '9':
                    Joi.array().length(authSubTypeAmount['9']).items(
                        Joi.object().keys({
                            authorizationChannel:
                                Joi.number().integer().min(0).max(authChannelAmount['9'] - 1).required(),
                            authorizationArea:
                                Joi.number().integer().min(0).max(authAreaAmount['9'] - 1).required(),
                            authorizationTime:
                                Joi.number().integer().min(0).max(authTimeAmount['9'] - 1).required(),
                            authorizationPrice:
                                Joi.number().integer().min(minAuthPrice).max(maxAuthPrice).required(),
                        })
                    ).required(),
            }).required(), */
        sellerAddr:
            jingtumCustom.jingtum().address().required(),
        contact:
            Joi.string().required(), // 如何验证？
        assetId:
            Joi.array().min(1).max(maxAssetAmout).items(
                Joi.string().hex()
            ).required(),
        assetType:
            Joi.number().integer().min(0).max(assetTypeAmount - 1).required(),
        consumable:
            Joi.boolean().required(),
        expireTime:
            Joi.number().integer().min(minExpireTime).max(maxExpireTime).required(),
        platformAddr:
            jingtumCustom.jingtum().address().required(), 
        contractAddr:
            jingtumCustom.jingtum().address().required(), 
        sellOrderId:
            jingtumCustom.string().hex().required(),
    });

    try {
        await sellOrderReqSchema.validateAsync(body);
    }
    catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        return [false, e];
    }

    return [true, 'valid req.'];
    
}

/*----------构造上传买单的交易----------*/

/**
 * @param {contractAddr} 买单合约地址
 * @param {platformId} 平台标识（可以直接用平台的链上地址）
 * @param {contact} 买方联系方式
 * @param {orderInfo} 买单信息
 * @return {unsignedTx} 用以在链上上传买单的待签名交易
 */
export async function handleBuyOrder(contractRemote, seqObj, req, res) {

    console.time('handleBuyOrder');

    // 解析数据、格式验证
    let body = JSON.parse(Object.keys(req.body)[0]);
    let [validateRes, validateInfo] = await validateBuyOrderReq(body);
    if(!validateRes) {
        return validateInfo;
    }

    // 获取合约元数据
    let contractAddr = body.contractAddr;
    let abi = await getAbi(contractAddr);

    // 解析买单ID
    let buyOrderId = body.buyOrderId;

    // 解析买方地址
    let platformAddr = body.platformAddr;

    // 所有买单信息存入IPFS
    delete body.platformAddr;
    delete body.contractAddr;
    delete body.buyOrderId;
    let buyOrderInfo = Buffer.from(JSON.stringify(body)); //JSON.stringify()第二个参数问题，暂用delete
    let buyOrderInfoHash = await ipfsUtils.add(ipfs, buyOrderInfo);
    
    // 构造交易
    let unsignedTx = contractRemote.invokeContract({
        account: platformAddr, 
        destination: contractAddr, // 待部署
        abi: abi, // 待部署
        func: "makeOrder('" + buyOrderId + "','" + buyOrderInfoHash + "')",
    });

    console.timeEnd('handleBuyOrder');
    console.log('--------------------');

    return unsignedTx.tx_json;

}

/*----------提交买方签名的买单上传交易----------*/

/**
 * @param {signedTx} 平台签名的交易blob
 * @return {orderId} 订单编号
 */
export async function handleSignedBuyOrder(contractRemote, seqObj, req, res) {

    console.time('handleSignedBuyOrder');

    // 解析数据、格式验证
    let body = JSON.parse(Object.keys(req.body)[0]);
    let blob = body;
    let [validateRes, validateInfo] = await validateSignedTx(blob);
    if(!validateRes) {
        return validateInfo;
    }

    // 提交交易、返回结果
    let signedTxRes = await tx.buildSignedTx(contractRemote, blob, true);
    let resInfo = {
        result: signedTxRes.engine_result,
        seq: signedTxRes.tx_json.Sequence,
        message: signedTxRes.engine_result_message,
    };

    console.timeEnd('handleSignedBuyOrder');
    console.log('--------------------');

    return resInfo;

}

/*----------构造买单确认接收的交易----------*/

export async function handleBuyOrderConfirm(contractRemote, seqObj, req, res) {

    console.time('handleBuyOrderConfirm');

    let body = JSON.parse(Object.keys(req.body)[0]);

    // 获取合约元数据

    // 获取新旧订单标识
    
    // 构造交易

    console.timeEnd('handleBuyOrderConfirm');
    console.log('--------------------');

    return unsignedTx.tx_json;

}

/*----------构造已签名买单确认接收的交易----------*/

export async function handleSignedBuyOrderConfirm(contractRemote, seqObj, req, res) {

    console.time('handleSignedBuyOrderConfirm');

    let body = JSON.parse(Object.keys(req.body)[0]);
    
    // 构造交易

    console.timeEnd('handleSignedBuyOrderConfirm');
    console.log('--------------------');

}

/*----------构造上传卖单的交易----------*/

/**
 * @param {contractAddr} 卖单合约地址
 * @param {platformId} 平台标识（可以直接用平台的链上地址）
 * @param {contact} 卖方联系方式
 * @param {orderInfo} 卖单信息
 * @return {unsignedTx} 用以在链上上传卖单的待签名交易
 */
export async function handleSellOrder(contractRemote, seqObj, req, res) {

    console.time('handleSellOrder');

    // 解析数据、格式验证
    let body = JSON.parse(Object.keys(req.body)[0]);
    let [validateRes, validateInfo] = await validateSellOrderReq(body);
    if(!validateRes) {
        return validateInfo;
    }

    // 获取合约元数据
    let contractAddr = body.contractAddr;
    let abi = await getAbi(contractAddr);
    
    // 解析需要存入合约的卖单信息
    let sellOrderId = '0x' + body.sellOrderId;
    let assetId = body.assetId;
    assetId = assetId.map(id => {
        return '0x' + id;
    })
    let assetType = body.assetType;
    let consumable = body.consumable;
    let expireTime = body.expireTime;

    // 解析平台地址
    let platformAddr = body.platformAddr;

    // 卖单次要信息（标签、授权价格、联系方式）存入IPFS
    delete body.assetId;
    delete body.assetType;
    delete body.consumable;
    delete body.expireTime;
    delete body.platformAddr;
    delete body.contractAddr;
    delete body.sellOrderId;
    let otherClauses = Buffer.from(JSON.stringify(body));
    let otherClausesHash = await ipfsUtils.add(ipfs, otherClauses);
    
    // 构造交易
    let func = "makeOrder(" + sellOrderId + ",[" + assetId + "]," + assetType + "," + consumable + "," + expireTime + ",'" + otherClausesHash + "')";
    let unsignedTx = contractRemote.invokeContract({
        account: platformAddr, 
        destination: contractAddr,
        abi: abi,
        func: func,
    });

    console.timeEnd('handleSellOrder');
    console.log('--------------------');

    return unsignedTx.tx_json;

}

/*----------提交卖方签名的卖单上传交易----------*/

/**
 * @param {signedTx} 平台签名的交易blob
 * @return {orderId} 订单编号（通证ID）
 */
export async function handleSignedSellOrder(contractRemote, seqObj, req, res) {

    console.time('handleSignedSellOrder');

    // 解析数据、格式验证
    let body = JSON.parse(Object.keys(req.body)[0]);
    let blob = body;
    let [validateRes, validateInfo] = await validateSignedTx(blob);
    if(!validateRes) {
        return validateInfo;
    }

    // 提交交易、返回结果
    let signedTxRes = await tx.buildSignedTx(contractRemote, blob, true);
    let resInfo = {
        result: signedTxRes.engine_result,
        seq: signedTxRes.tx_json.Sequence,
        message: signedTxRes.engine_result_message,
    };

    console.timeEnd('handleSignedSellOrder');
    console.log('--------------------');

    return resInfo;

}

/*----------构造写入交易匹配结果的交易----------*/

/**
 * @param {contractAddr} 买单合约地址
 * @param {platformId} 买方平台标识（可以直接用平台的链上地址）
 * @param {orderId} 订单编号
 * @param {matchInfo} 交易匹配结果
 * @return {unsignedTx} 用以在链上写入交易匹配结果的待签名交易
 */
export async function handleMatch(contractRemote, seqObj, req, res) {

    console.time('handleMatch');

    let body = JSON.parse(Object.keys(req.body)[0]);
    let [validateRes, validateInfo] = await validateMatchReq(body);
    if(!validateRes) {
        return validateInfo;
    }

    // 获取合约元数据
    let contractAddr = body.contractAddr;
    let abi = await getAbi(contractAddr);

    // 获取智能交易系统账户地址
    let matchSystemAddr = body.matchSystemAddr;

    // 解析买方平台地址、买单ID、撮合信息
    let buyOrderInfo = body.buyOrderInfo;
    let buyOrderId = body.buyOrderId;
    let buyerAddr = buyOrderInfo.buyerAddr;
    let sellOrderInfo = body.sellOrderInfo;
    let matchResults = {
        buyOrderInfo: buyOrderInfo,
        sellOrderInfo: sellOrderInfo,
    }
    /* {
        买单: {买单信息}
        卖单: [{合约地址，卖单ID}，……]
    } */
    let matchResultsBuffer = Buffer.from(JSON.stringify(matchResults));
    let matchResultsHash = await ipfsUtils.add(ipfs, matchResultsBuffer);

    // 构造交易
    let unsignedTx = contractRemote.invokeContract({
        account: matchSystemAddr, 
        destination: contractAddr, // 待部署
        abi: abi, // 待部署
        func: updateMatches(buyerAddr, buyOrderId, matchResultsHash),
    });
    unsignedTx.setSequence(seqObj.a1.contract++); // 需要智能交易系统维护

    console.timeEnd('handleMatch');
    console.log('--------------------');

    return unsignedTx.tx_json;

}

/*----------提交平台签名的交易匹配结果写入交易----------*/

/**
 * @param {signedTx} 平台签名的交易blob
 * @return {oederId} 订单编号
 */
export async function handleSignedMatch(contractRemote, seqObj, req, res) {

    console.time('handleSignedMatch');

    // 解析数据、格式验证
    let body = JSON.parse(Object.keys(req.body)[0]);
    let blob = body;
    let [validateRes, validateInfo] = await validateSignedTx(blob);
    if(!validateRes) {
        return validateInfo;
    }

    // 提交交易、返回结果
    let signedTxRes = await tx.buildSignedTx(contractRemote, blob, true);
    let resInfo = {
        result: signedTxRes.engine_result,
        seq: signedTxRes.tx_json.Sequence,
        message: signedTxRes.engine_result_message,
    };

    console.timeEnd('handleSignedMatch');
    console.log('--------------------');

    return resInfo;

}

/*----------查询交易匹配结果----------*/

/**
 * @param {contractAddr} 买单合约地址
 * @param {orderId} 订单编号
 * @return {matchInfo} 交易匹配结果
 */
export async function handleMatchInfo(contractRemote, seqObj, req, res) {

    console.time('handleMatchInfo');

    let body = JSON.parse(Object.keys(req.body)[0]);

    // 从合约中查询订单的匹配结果

    console.timeEnd('handleMatchInfo');
    console.log('--------------------');

    return matchInfo;

}

/*----------构造提交买方确认的交易----------*/

/**
 * @param {contractAddr} 买单合约地址
 * @param {platformId} 平台标识（可以直接用平台的链上地址）
 * @param {orderId} 订单编号
 * @return {unsignedTxs} 用以在链上写入买方确认的待签名交易
 */
export async function handleBuyerConfirm(contractRemote, seqObj, req, res) {

    console.time('handleBuyerConfirm');

    let body = JSON.parse(Object.keys(req.body)[0]);

    // 获取合约元数据列表（对应多个卖单）
    let contractAddrs = body.contractAddrs;
    let abis = contractAddrs.map(async(addr) => {
        let abi = await getAbi(addr);
        return abi;
    })

    // 获取买方平台账户地址
    let platformAddr = body.platformAddr;

    // 解析卖单ID、超时限制
    let sellOrderIds = body.sellOrderIds;
    let expireTime = body.expireTime;

    // 买单信息存入IPFS，获取哈希标识
    let buyOrderInfo = body.buyOrderInfo;
    let buyOrderInfoBuffer = Buffer.from(JSON.stringify(buyOrderInfo));
    let buyOrderInfoHash = await ipfsUtils.add(ipfs, buyOrderInfoBuffer);

    // 构造交易列表（对应多个卖单）
    let unsignedTxs = contractAddrs.map((contractAddr, index) => {
        let unsignedTx = contractRemote.invokeContract({
            account: platformAddr, 
            destination: contractAddr, // 待部署
            abi: abis[index], // 待部署
            func: makeBuyIntention(sellOrderIds[index], expireTime, buyOrderInfoHash),
        });
        return unsignedTx.tx_json;
    })

    console.timeEnd('handleBuyerConfirm');
    console.log('--------------------');

    return unsignedTxs;

}

/*----------提交买方签名的买方确认交易（买单合约）----------*/

/**
 * @param {signedTx} 买方签名的交易blob
 * @return {oederId} 订单编号
 */
export async function handleSignedBuyerConfirmForBuyOrder(contractRemote, seqObj, req, res) {

    console.time('handleSignedBuyerConfirm');

    let body = JSON.parse(Object.keys(req.body)[0]);

    // 提交交易

    console.timeEnd('handleSignedBuyerConfirm');
    console.log('--------------------');

    return orderId;

}

/*----------提交买方签名的买方确认交易（卖单合约）----------*/

/**
 * @param {signedTx} 买方签名的交易blob
 * @return {oederId} 订单编号（通证ID）
 */
export async function handleSignedBuyerConfirmForSellOrder(contractRemote, seqObj, req, res) {

    console.time('handleSignedBuyerConfirm');

    let body = JSON.parse(Object.keys(req.body)[0]);

    let blob = body;

    // 提交交易
    await tx.buildSignedTx(contractRemote, blob, true);

    console.timeEnd('handleSignedBuyerConfirm');
    console.log('--------------------');

    return orderId;

}

/*----------构造提交卖方确认的交易（转让）----------*/

/**
 * @param {contractAddr} 卖单合约地址
 * @param {platformId} 平台标识（可以直接用平台的链上地址）
 * @param {orderId} 订单编号（通证ID）
 * @param {buyerAddr} 买方地址
 * @return {unsignedTxs} 用以在链上写入卖方确认的待签名交易
 */
export async function handleSellerTransferConfirm(tokenRemote, contractRemote, seqObj, req, res) {

    console.time('handleSellerTransferConfirm');

    let body = JSON.parse(Object.keys(req.body)[0]);

    // 构造卖方确认写入交易
    // 构造通证转让交易

    console.timeEnd('handleSellerTransferConfirm');
    console.log('--------------------');

    return unsignedTxs;

}

/*----------提交卖方签名的卖方确认交易（卖单合约）----------*/

/**
 * @param {signedTx} 买方签名的交易blob
 * @return {oederId} 订单编号（通证ID）
 */
export async function handleSignedSellerTransferConfirmForSellOrder(contractRemote, seqObj, req, res) {

    console.time('handleSignedSellerTransferConfirmForSellOrder');

    let body = JSON.parse(Object.keys(req.body)[0]);

    // 提交交易

    console.timeEnd('handleSignedSellerTransferConfirmForSellOrder');
    console.log('--------------------');

    return orderId;

}

/*----------提交卖方签名的通证转让交易----------*/

/**
 * @param {signedTx} 买方签名的交易blob
 * @return {tokenId} 通证ID
 */
export async function handleSignedSellerTransferConfirmForToken(tokenRemote, contractRemote, seqObj, req, res) {

    console.time('handleSignedSellerTransferConfirmForToken');

    let body = JSON.parse(Object.keys(req.body)[0]);

    // 提交交易

    console.timeEnd('handleSignedSellerTransferConfirmForToken');
    console.log('--------------------');

    return tokenId;

}

/*----------构造提交卖方确认的交易（许可）----------*/

/**
 * @param {contractAddr} 卖单合约地址
 * @param {platformId} 平台标识（可以直接用平台的链上地址）
 * @param {orderId} 订单编号（通证ID）
 * @param {buyerAddr} 买方地址
 * @return {unsignedTx} 用以在链上写入卖方确认的待签名交易
 * @return {tokenId} 新生成的许可通证ID
 */
export async function handleSellerApproveConfirm(tokenRemote, contractRemote, seqObj, req, res) {

    console.time('handleSellerApproveConfirm');

    let body = JSON.parse(Object.keys(req.body)[0]);

    // 获取合约元数据
    let contractAddr = body.contractAddr;
    let abi = await getAbi(contractAddr);

    // 解析买单信息（主要是授权场景）、卖单ID、卖方平台账户地址
    let platformAddr = body.addr;
    let sellOrderId = body.sellOrderId;
    let buyOrderInfo = body.buyOrderInfo;
    let buyerAddr = buyOrderInfo.buyerAddr;

    // 默认mono值
    let mono = false;

    // 构造交易
    let unsignedTx = contractRemote.invokeContract({
        account: platformAddr, 
        destination: contractAddr, // 待部署
        abi: abi, // 待部署
        func: commitOrder(sellOrderId, platformAddr, mono, buyerAddr),
    });

    /* 智能授权系统处理许可通证发行
    workId为数组，待处理 */

    // // 根据卖单ID，从合约中获取卖单信息
    // let func = "getOrderInfo('" + sellOrderId + "')";
    // let getOrderInfoRes = await contract.invokeContract(a1, s1, contractRemote, seqObj.a1.contract++, abi, contractAddr, func, true);
    // let sellOrderInfo = getOrderInfoRes.ContractState;
    // let workId = sellOrderInfo.asset_id;

    // // 根据卖单信息，查询数据库，获取相关的通证ID
    // let authorizationInfo = buyOrderInfo.authorizationInfo;
    // let authorizationType = getType(authorizationInfo);
    // let rightTokenIds = getTokenIds(workId, authorizationType);

    // // 为版权通证生成对应的许可通证，并发放给用户
    // let buyerAddr = buyOrderInfo.buyerAddr;
    // let tokenIssuePromises = [];
    // let tokenAuthPromises = [];
    // rightTokenIds.map(tokenId => {
    //     let rightTokenId = tokenId;
    //     let apprChannel = authorizationInfo[authorizationType].AuthorizationChannel;
    //     let apprArea = authorizationInfo[authorizationType].AuthorizationArea;
    //     let apprTime = authorizationInfo[authorizationType].AuthorizationTime;
    //     let apprTokenId = sha256(rightTokenId + seqObj.a1.token).toString(); // tokenId暂定为hash(workId+0~16)
    //     let tokenInfo = {
    //         rightTokenId: rightTokenId,
    //         apprChannel: apprChannel,
    //         apprArea: apprArea,
    //         apprTime: apprTime,
    //     }
    //     let tokenMemos = localUtils.obj2memos(tokenInfo);
    //     if(debugMode) {
    //         console.log('issue token:', tokenInfo);
    //     }
    //     else {
    //         console.log('issue token:', tokenInfo.rightTokenId + '_' + seqObj.a1.token);
    //     }
    //     /* issue token: {
    //         workId: '909B18A4FCFE8ACDA0C8F4AC5C45AF2BA86F2DE7761C73126B1EDBF0A18FEBA5',
    //         rightType: 6
    //     } */
    //     tokenIssuePromises.push(erc721.buildIssueTokenTx(s1, tokenRemote, seqObj.a1.token++, a1, approveTokenName, apprTokenId, tokenMemos, true));
    //     tokenAuthPromises.push(erc721.buildAuthTokenTx(s1, tokenRemote, seqObj.a1.token++, a1, buyerAddr, approveTokenName, apprTokenId, true));
    // })
    // await Promise.all(tokenIssuePromises);
    // await Promise.all(tokenAuthPromises);

    console.timeEnd('handleSellerApproveConfirm');
    console.log('--------------------');

    return unsignedTx.tx_json;

}

/*----------提交卖方签名的卖方确认交易（卖单合约）----------*/

/**
 * @param {signedTx} 买方签名的交易blob
 * @return {oederId} 订单编号（通证ID）
 */
export async function handleSignedSellerApproveConfirm(contractRemote, seqObj, req, res) {

    console.time('handleSignedSellerApproveConfirm');

    let body = JSON.parse(Object.keys(req.body)[0]);

    let blob = body;

    // 提交交易
    await tx.buildSignedTx(contractRemote, blob, true);

    console.timeEnd('handleSignedSellerApproveConfirm');
    console.log('--------------------');

    return orderId;

}

async function getAbi(contractAddr) {

    let sql = sqlText.table('contract_info').field('abi_hash').where({contract_addr: contractAddr}).select();
    let getAbiRes = await mysqlUtils.sql(c, sql);
    let abiHash = getAbiRes[0].abi_hash;
    let abiJson = await ipfsUtils.get(ipfs, abiHash);
    let abi = JSON.parse(abiJson);
    return abi;

}

function getType(authorizationInfo) {
    return Object.keys(authorizationInfo)[0];
}

async function getTokenIds(workId, authorizationType) {

    const apprType2RightType = {
        0: 'right_type = 0 OR right_type = 1 OR right_type = 2',
        1: 'right_type = 0 OR right_type = 1 OR right_type = 2',
        2: 'right_type = 0 OR right_type = 1 OR right_type = 2',
        3: 'right_type = 0 OR right_type = 1 OR right_type = 2',
        4: 'right_type = 0 OR right_type = 1 OR right_type = 2',
        5: 'right_type = 0 OR right_type = 1 OR right_type = 2',
        6: 'right_type = 0 OR right_type = 1 OR right_type = 2',
        7: 'right_type = 0 OR right_type = 1 OR right_type = 2',
        8: 'right_type = 0 OR right_type = 1 OR right_type = 2',
        9: 'right_type = 0 OR right_type = 1 OR right_type = 2',
    }
    let rightFilter = apprType2RightType[authorizationType];
    let filter = 'work_id = ' + workId + ' AND (' + rightFilter + ')'
    let sql = sqlText.table('right_token_info').field('token_id').where(filter).select();
    let tokenIds = await mysqlUtils.sql(c, sql);
    return tokenIds;

}
