import mysql from 'mysql';
import sqlText from 'node-transform-mysql';
import sha256 from 'crypto-js/sha256.js';

import * as tx from '../../../utils/jingtum/tx.js';
import * as erc721 from '../../../utils/jingtum/erc721.js';
import * as contract from '../../../utils/jingtum/contract.js';
import * as ipfsUtils from '../../../utils/ipfsUtils.js';
import * as mysqlUtils from '../../../utils/mysqlUtils.js';
import * as transactionValidate from '../../../utils/validateUtils/transaction.js';

import {userAccount, chains, tokenName} from '../../../utils/config/jingtum.js';
import {mysqlConf} from '../../../utils/config/mysql.js';
import _ from 'lodash';

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接

const matchSystemAddr = userAccount.matchSystemAccount.address; // 智能交易系统（签名由中间层代替）
const matchSystemSecr = userAccount.matchSystemAccount.secret;

const authorizeAddr = userAccount.buptAuthorizeAccount.address; // 智能授权系统（中间层部分）
const authorizeSecr = userAccount.buptAuthorizeAccount.secret;

/*----------构造上传买单的交易----------*/

/**
 * @param {contractAddr} 买单合约地址
 * @param {platformId} 平台标识（可以直接用平台的链上地址）
 * @param {contact} 买方联系方式
 * @param {orderInfo} 买单信息
 * @return {unsignedTx} 用以在链上上传买单的待签名交易
 */
export async function handleBuyOrder(contractRemote, seqObj, req) {

    console.time('handleBuyOrder');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.body;
    try {
        await transactionValidate.buyOrderReqSchema.validateAsync(body);
    } catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = e;
        console.log('/transaction/buy:', resInfo.data);
        console.timeEnd('handleBuyOrder');
        console.log('--------------------');
        return resInfo;
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
    let buyOrderInfoHash = await ipfsUtils.add(body);
    
    // 构造交易
    let unsignedTx = contractRemote.invokeContract({
        account: platformAddr, 
        destination: contractAddr,
        abi: abi,
        func: "makeOrder('" + buyOrderId + "','" + buyOrderInfoHash + "')",
    });

    resInfo.data.unsignedTx = unsignedTx.tx_json;
    console.log('/transaction/buy:', resInfo.data);

    console.timeEnd('handleBuyOrder');
    console.log('--------------------');

    return resInfo;

}

/*----------提交买方签名的买单上传交易----------*/

/**
 * @param {signedTx} 平台签名的交易blob
 * @return {orderId} 订单编号
 */
export async function handleSignedBuyOrder(contractRemote, req) {

    console.time('handleSignedBuyOrder');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.body;
    try {
        await transactionValidate.signedTxReqSchema.validateAsync(body);
    } catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = e;
        console.log('/transaction/signedBuy:', resInfo.data);
        console.timeEnd('handleSignedBuyOrder');
        console.log('--------------------');
        return resInfo;
    }

    let blob = body.blob;

    // 提交交易
    let txResult = await tx.buildSignedTx(contractRemote, blob, false);
    txResult = {
        result: txResult.engine_result,
        message: txResult.engine_result_message,
        seq: txResult.tx_json.Sequence,
        hash: txResult.tx_json.hash,
    };

    resInfo.data.txResult = txResult;
    console.log('/transaction/signedBuy:', resInfo.data);

    console.timeEnd('handleSignedBuyOrder');
    console.log('--------------------');

    return resInfo;

}

/*----------构造买单接受的交易----------*/

export async function handleBuyOrderAccept(contractRemote, seqObj, req) {

    console.time('handleBuyOrderAccept');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.body;
    try {
        await transactionValidate.buyOrderAcceptSchema.validateAsync(body);
    } catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = e;
        console.log('/transaction/buyAccept:', resInfo.data);
        console.timeEnd('handleBuyOrderAccept');
        console.log('--------------------');
        return resInfo;
    }

    // 获取合约元数据
    let contractAddr = body.contractAddr;
    let abi = await getAbi(contractAddr);
    
    // 解析需要存入合约的卖单信息
    let buyOrderId = body.buyOrderId;
    let buyOrderHash = body.buyOrderHash;
    let platformAddr = body.platformAddr;
    
    // 构造交易
    let func = "acceptOrder('" + buyOrderId + "','" + platformAddr + "','" + buyOrderHash + "')";

    // 由中间层代替
    let txResult = await contract.invokeContract(matchSystemAddr, matchSystemSecr, contractRemote, seqObj.matchSystem.contract++, abi, contractAddr, func, false);
    txResult = {
        result: txResult.engine_result,
        message: txResult.engine_result_message,
        seq: txResult.tx_json.Sequence,
        hash: txResult.tx_json.hash,
    };

    resInfo.data.txResult = txResult;
    console.log('/transaction/buyAccept:', resInfo.data);
    
    console.timeEnd('handleBuyOrderAccept');
    console.log('--------------------');

    return resInfo;

}

/*----------构造上传卖单的交易----------*/

/**
 * @param {contractAddr} 卖单合约地址
 * @param {platformId} 平台标识（可以直接用平台的链上地址）
 * @param {contact} 卖方联系方式
 * @param {orderInfo} 卖单信息
 * @return {unsignedTx} 用以在链上上传卖单的待签名交易
 */
export async function handleSellOrder(contractRemote, seqObj, req) {

    console.time('handleSellOrder');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.body;
    try {
        await transactionValidate.sellOrderReqSchema.validateAsync(body);
    } catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = e;
        console.log('/transaction/sell:', resInfo.data);
        console.timeEnd('handleSellOrder');
        console.log('--------------------');
        return resInfo;
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
    let otherClausesHash = await ipfsUtils.add(body);
    
    // 构造交易
    let func = "makeOrder(" + sellOrderId + ",[" + assetId + "]," + assetType + "," + consumable + "," + expireTime + ",'" + otherClausesHash + "')";
    let unsignedTx = contractRemote.invokeContract({
        account: platformAddr, 
        destination: contractAddr,
        abi: abi,
        func: func,
    });

    resInfo.data.unsignedTx = unsignedTx.tx_json;
    console.log('/transaction/sell:', resInfo.data);

    console.timeEnd('handleSellOrder');
    console.log('--------------------');

    return resInfo;

}

/*----------提交卖方签名的卖单上传交易----------*/

/**
 * @param {signedTx} 平台签名的交易blob
 * @return {orderId} 订单编号（通证ID）
 */
export async function handleSignedSellOrder(contractRemote, seqObj, req) {

    console.time('handleSignedSellOrder');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.body;
    try {
        await transactionValidate.signedTxReqSchema.validateAsync(body);
    } catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = e;
        console.log('/transaction/signedSell:', resInfo.data);
        console.timeEnd('handleSignedSellOrder');
        console.log('--------------------');
        return resInfo;
    }

    let blob = body.blob;

    // 提交交易
    let txResult = await tx.buildSignedTx(contractRemote, blob, false);
    txResult = {
        result: txResult.engine_result,
        message: txResult.engine_result_message,
        seq: txResult.tx_json.Sequence,
        hash: txResult.tx_json.hash,
    };

    resInfo.data.txResult = txResult;
    console.log('/transaction/signedSell:', resInfo.data);

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
export async function handleMatch(contractRemote, seqObj, req) {

    console.time('handleMatch');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.body;
    try {
        await transactionValidate.matchReqSchema.validateAsync(body);
    } catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = e;
        console.log('/transaction/match:', resInfo.data);
        console.timeEnd('handleMatch');
        console.log('--------------------');
        return resInfo;
    }

    // 获取合约元数据
    let contractAddr = body.contractAddr;
    let abi = await getAbi(contractAddr);

    // 解析买方平台地址、买单ID、撮合信息
    let buyOrderInfo = body.buyOrderInfo;
    let buyOrderHash = buyOrderInfo.buyOrderHash;
    let sellOrderInfo = body.sellOrderInfo;
    let matchResults = {
        buyOrderInfo: buyOrderInfo,
        sellOrderInfo: sellOrderInfo,
    }
    let matchResultsHash = await ipfsUtils.add(matchResults);

    // 构造交易
    let func = "updateMatches('" + buyOrderHash + "','" + matchResultsHash + "')";

    // 由中间层代替
    let txResult = await contract.invokeContract(matchSystemAddr, matchSystemSecr, contractRemote, seqObj.matchSystem.contract++, abi, contractAddr, func, false);
    txResult = {
        result: txResult.engine_result,
        message: txResult.engine_result_message,
        seq: txResult.tx_json.Sequence,
        hash: txResult.tx_json.hash,
    };

    resInfo.data.txResult = txResult;
    console.log('/transaction/match:', resInfo.data);

    console.timeEnd('handleMatch');
    console.log('--------------------');

    return resInfo;

}

// /*----------查询交易匹配结果----------*/

// /**
//  * @param {contractAddr} 买单合约地址
//  * @param {orderId} 订单编号
//  * @return {matchInfo} 交易匹配结果
//  */
// export async function handleMatchInfo(contractRemote, seqObj, req, res) {

//     console.time('handleMatchInfo');

//     let body = JSON.parse(Object.keys(req.body)[0]);

//     // 从合约中查询订单的匹配结果

//     console.timeEnd('handleMatchInfo');
//     console.log('--------------------');

//     return matchInfo;

// }

// /*----------构造提交买方确认的交易----------*/

// /**
//  * @param {contractAddr} 买单合约地址
//  * @param {platformId} 平台标识（可以直接用平台的链上地址）
//  * @param {orderId} 订单编号
//  * @return {unsignedTxs} 用以在链上写入买方确认的待签名交易
//  */
// export async function handleBuyerConfirm(contractRemote, seqObj, req, res) {

//     // console.time('handleBuyerConfirm');

//     // let body = JSON.parse(Object.keys(req.body)[0]);

//     // // 获取合约元数据列表（对应多个卖单）
//     // let contractAddrs = body.contractAddrs;
//     // let abis = contractAddrs.map(async(addr) => {
//     //     let abi = await getAbi(addr);
//     //     return abi;
//     // })

//     // // 获取买方平台账户地址
//     // let platformAddr = body.platformAddr;

//     // // 解析卖单ID、超时限制
//     // let sellOrderIds = body.sellOrderIds;
//     // let expireTime = body.expireTime;

//     // // 买单信息存入IPFS，获取哈希标识
//     // let buyOrderInfo = body.buyOrderInfo;
//     // let buyOrderInfoBuffer = Buffer.from(JSON.stringify(buyOrderInfo));
//     // let buyOrderInfoHash = await ipfsUtils.add(ipfs, buyOrderInfoBuffer);

//     // // 构造交易列表（对应多个卖单）
//     // let unsignedTxs = contractAddrs.map((contractAddr, index) => {
//     //     let unsignedTx = contractRemote.invokeContract({
//     //         account: platformAddr, 
//     //         destination: contractAddr, // 待部署
//     //         abi: abis[index], // 待部署
//     //         func: makeBuyIntention(sellOrderIds[index], expireTime, buyOrderInfoHash),
//     //     });
//     //     return unsignedTx.tx_json;
//     // })

//     // console.timeEnd('handleBuyerConfirm');
//     // console.log('--------------------');

//     // return unsignedTxs;

//     console.time('handleBuyerConfirm');

//     let resInfo = {
//         msg: 'success',
//         code: 0,
//         data: {},
//     }

//     let body = JSON.parse(Object.keys(req.body)[0]);
//     let [validateInfoRes, validateInfo] = await transactionValidate.validateBuyerConfirmReq(body);
//     if(!validateInfoRes) {
//         resInfo.msg = 'invalid parameters',
//         resInfo.code = 1;
//         resInfo.data.validateInfo = validateInfo;
//         return resInfo;
//     }

//     resInfo.data = body;
//     console.log('resInfo:', resInfo);

//     console.timeEnd('handleBuyerConfirm');
//     console.log('--------------------');

//     return resInfo;

// }

// /*----------提交买方签名的买方确认交易（买单合约）----------*/

// /**
//  * @param {signedTx} 买方签名的交易blob
//  * @return {oederId} 订单编号
//  */
// export async function handleSignedBuyerConfirmForBuyOrder(contractRemote, seqObj, req, res) {

//     console.time('handleSignedBuyerConfirm');

//     let body = JSON.parse(Object.keys(req.body)[0]);

//     // 提交交易

//     console.timeEnd('handleSignedBuyerConfirm');
//     console.log('--------------------');

//     return orderId;

// }

// /*----------提交买方签名的买方确认交易（卖单合约）----------*/

// /**
//  * @param {signedTx} 买方签名的交易blob
//  * @return {oederId} 订单编号（通证ID）
//  */
// export async function handleSignedBuyerConfirmForSellOrder(contractRemote, seqObj, req, res) {

//     console.time('handleSignedBuyerConfirm');

//     let body = JSON.parse(Object.keys(req.body)[0]);

//     let blob = body;

//     // 提交交易
//     await tx.buildSignedTx(contractRemote, blob, true);

//     console.timeEnd('handleSignedBuyerConfirm');
//     console.log('--------------------');

//     return orderId;

// }

// /*----------构造提交卖方确认的交易（转让）----------*/

// /**
//  * @param {contractAddr} 卖单合约地址
//  * @param {platformId} 平台标识（可以直接用平台的链上地址）
//  * @param {orderId} 订单编号（通证ID）
//  * @param {buyerAddr} 买方地址
//  * @return {unsignedTxs} 用以在链上写入卖方确认的待签名交易
//  */
// export async function handleSellerTransferConfirm(tokenRemote, contractRemote, seqObj, req, res) {

//     // console.time('handleSellerTransferConfirm');

//     // let body = JSON.parse(Object.keys(req.body)[0]);

//     // // 构造卖方确认写入交易
//     // // 构造通证转让交易

//     // console.timeEnd('handleSellerTransferConfirm');
//     // console.log('--------------------');

//     // return unsignedTxs;

//     console.time('handleSellerTransferConfirm');

//     let resInfo = {
//         msg: 'success',
//         code: 0,
//         data: {},
//     }

//     let body = JSON.parse(Object.keys(req.body)[0]);
//     let [validateInfoRes, validateInfo] = await transactionValidate.validateSellerTransferConfirmReq(body);
//     if(!validateInfoRes) {
//         resInfo.msg = 'invalid parameters',
//         resInfo.code = 1;
//         resInfo.data.validateInfo = validateInfo;
//         return resInfo;
//     }

//     resInfo.data = body;
//     console.log('resInfo:', resInfo);

//     console.timeEnd('handleSellerTransferConfirm');
//     console.log('--------------------');

//     return resInfo;

// }

// /*----------提交卖方签名的卖方确认交易（转让、卖单合约）----------*/

// /**
//  * @param {signedTx} 买方签名的交易blob
//  * @return {oederId} 订单编号（通证ID）
//  */
// export async function handleSignedSellerTransferConfirmForSellOrder(contractRemote, seqObj, req, res) {

//     console.time('handleSignedSellerTransferConfirmForSellOrder');

//     let body = JSON.parse(Object.keys(req.body)[0]);

//     // 提交交易

//     console.timeEnd('handleSignedSellerTransferConfirmForSellOrder');
//     console.log('--------------------');

//     return orderId;

// }

// /*----------提交卖方签名的通证转让交易----------*/

// /**
//  * @param {signedTx} 买方签名的交易blob
//  * @return {tokenId} 通证ID
//  */
// export async function handleSignedSellerTransferConfirmForToken(tokenRemote, contractRemote, seqObj, req, res) {

//     console.time('handleSignedSellerTransferConfirmForToken');

//     let body = JSON.parse(Object.keys(req.body)[0]);

//     // 提交交易

//     console.timeEnd('handleSignedSellerTransferConfirmForToken');
//     console.log('--------------------');

//     return tokenId;

// }

// /*----------构造提交卖方确认的交易（许可）----------*/

// /**
//  * @param {contractAddr} 卖单合约地址
//  * @param {platformId} 平台标识（可以直接用平台的链上地址）
//  * @param {orderId} 订单编号（通证ID）
//  * @param {buyerAddr} 买方地址
//  * @return {unsignedTx} 用以在链上写入卖方确认的待签名交易
//  * @return {tokenId} 新生成的许可通证ID
//  */
// export async function handleSellerApproveConfirm(tokenRemote, contractRemote, seqObj, req, res) {

//     // console.time('handleSellerApproveConfirm');

//     // let body = JSON.parse(Object.keys(req.body)[0]);

//     // // 获取合约元数据
//     // let contractAddr = body.contractAddr;
//     // let abi = await getAbi(contractAddr);

//     // // 解析买单信息（主要是授权场景）、卖单ID、卖方平台账户地址
//     // let platformAddr = body.addr;
//     // let sellOrderId = body.sellOrderId;
//     // let buyOrderInfo = body.buyOrderInfo;
//     // let buyerAddr = buyOrderInfo.buyerAddr;

//     // // 默认mono值
//     // let mono = false;

//     // // 构造交易
//     // let unsignedTx = contractRemote.invokeContract({
//     //     account: platformAddr, 
//     //     destination: contractAddr, // 待部署
//     //     abi: abi, // 待部署
//     //     func: commitOrder(sellOrderId, platformAddr, mono, buyerAddr),
//     // });

//     // /* 智能授权系统处理许可通证发行
//     // workId为数组，待处理 */

//     // // // 根据卖单ID，从合约中获取卖单信息
//     // // let func = "getOrderInfo('" + sellOrderId + "')";
//     // // let getOrderInfoRes = await contract.invokeContract(a1, s1, contractRemote, seqObj.a1.contract++, abi, contractAddr, func, true);
//     // // let sellOrderInfo = getOrderInfoRes.ContractState;
//     // // let workId = sellOrderInfo.asset_id;

//     // // // 根据卖单信息，查询数据库，获取相关的通证ID
//     // // let authorizationInfo = buyOrderInfo.authorizationInfo;
//     // // let authorizationType = getType(authorizationInfo);
//     // // let rightTokenIds = getTokenIds(workId, authorizationType);

//     // // // 为版权通证生成对应的许可通证，并发放给用户
//     // // let buyerAddr = buyOrderInfo.buyerAddr;
//     // // let tokenIssuePromises = [];
//     // // let tokenAuthPromises = [];
//     // // rightTokenIds.map(tokenId => {
//     // //     let rightTokenId = tokenId;
//     // //     let apprChannel = authorizationInfo[authorizationType].AuthorizationChannel;
//     // //     let apprArea = authorizationInfo[authorizationType].AuthorizationArea;
//     // //     let apprTime = authorizationInfo[authorizationType].AuthorizationTime;
//     // //     let apprTokenId = sha256(rightTokenId + seqObj.a1.token).toString(); // tokenId暂定为hash(workId+0~16)
//     // //     let tokenInfo = {
//     // //         rightTokenId: rightTokenId,
//     // //         apprChannel: apprChannel,
//     // //         apprArea: apprArea,
//     // //         apprTime: apprTime,
//     // //     }
//     // //     let tokenMemos = localUtils.obj2memos(tokenInfo);
//     // //     if(debugMode) {
//     // //         console.log('issue token:', tokenInfo);
//     // //     }
//     // //     else {
//     // //         console.log('issue token:', tokenInfo.rightTokenId + '_' + seqObj.a1.token);
//     // //     }
//     // //     /* issue token: {
//     // //         workId: '909B18A4FCFE8ACDA0C8F4AC5C45AF2BA86F2DE7761C73126B1EDBF0A18FEBA5',
//     // //         rightType: 6
//     // //     } */
//     // //     tokenIssuePromises.push(erc721.buildIssueTokenTx(s1, tokenRemote, seqObj.a1.token++, a1, approveTokenName, apprTokenId, tokenMemos, true));
//     // //     tokenAuthPromises.push(erc721.buildAuthTokenTx(s1, tokenRemote, seqObj.a1.token++, a1, buyerAddr, approveTokenName, apprTokenId, true));
//     // // })
//     // // await Promise.all(tokenIssuePromises);
//     // // await Promise.all(tokenAuthPromises);

//     // console.timeEnd('handleSellerApproveConfirm');
//     // console.log('--------------------');

//     // return unsignedTx.tx_json;

//     console.time('handleSellerApproveConfirm');

//     let resInfo = {
//         msg: 'success',
//         code: 0,
//         data: {},
//     }

//     let body = JSON.parse(Object.keys(req.body)[0]);
//     let [validateInfoRes, validateInfo] = await transactionValidate.validateSellerApproveConfirmReq(body);
//     if(!validateInfoRes) {
//         resInfo.msg = 'invalid parameters',
//         resInfo.code = 1;
//         resInfo.data.validateInfo = validateInfo;
//         return resInfo;
//     }

//     resInfo.data = body;
//     console.log('resInfo:', resInfo);

//     console.timeEnd('handleSellerApproveConfirm');
//     console.log('--------------------');

//     return resInfo;

// }

// /*----------提交卖方签名的卖方确认交易（卖单合约）----------*/

// /**
//  * @param {signedTx} 买方签名的交易blob
//  * @return {oederId} 订单编号（通证ID）
//  */
// export async function handleSignedSellerApproveConfirm(contractRemote, seqObj, req, res) {

//     console.time('handleSignedSellerApproveConfirm');

//     let body = JSON.parse(Object.keys(req.body)[0]);

//     let blob = body;

//     // 提交交易
//     await tx.buildSignedTx(contractRemote, blob, true);

//     console.timeEnd('handleSignedSellerApproveConfirm');
//     console.log('--------------------');

//     return orderId;

// }

/**
 * @description 版权许可通证生成（对于平台内部匹配的交易），卖方用户签名。
 * @param {Object}buyOrderInfo 买单信息，包括：买方地址buyerAddr、授权场景authorizationScene、授权渠道authorizationChannel、授权范围authorizationArea、授权时间authorizationTime
 * @param {Object[]}sellOrderInfoList 卖单信息列表，包括：卖方地址sellerAddr、卖方私钥sellerSecret、作品标识workId
 * @returns {Object[]} 授权结果列表，包括：作品标识workId、版权许可通证标识列表approveIds
 */
export async function handleApproveConfirm(tokenRemote, seqObj, req) {

    console.time('handleApproveConfirm');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.body;
    try {
        await transactionValidate.approveConfirmReqSchema.validateAsync(body);
    } catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = e;
        console.log('/transaction/approveConfirm:', resInfo.data);
        console.timeEnd('handleApproveConfirm');
        console.log('--------------------');
        return resInfo;
    }

    let buyOrderInfo = body.buyOrderInfo;
    let buyerAddr = buyOrderInfo.buyerAddr;
    let approveScene = buyOrderInfo.authorizationScene;
    let tokenInfos = {
        approveChannel: buyOrderInfo.authorizationChannel,
        approveArea: buyOrderInfo.authorizationArea,
        approveTime: buyOrderInfo.authorizationTime,
    };

    let approveResultList = [];

    let sellOrderInfoList = body.sellOrderInfoList;
    let pubApproveTokenPromises = sellOrderInfoList.map(async sellOrderInfo => {

        let sellerAddr = sellOrderInfo.sellerAddr;
        let sellerSecr = sellOrderInfo.sellerSecret;
        let workId = sellOrderInfo.workId;

        let approveResult = {
            workId: workId,
            approveIds: [],
        };

        let copyrightIds = await getTokenIds(workId, approveScene);
        let singlePubApproveTokenPromises = copyrightIds.map(copyrightId => {

            let approveId = sha256(copyrightId + JSON.stringify(buyOrderInfo)).toString();

            approveResult.approveIds.push(approveId);

            return erc721.buildPubRefTokenTx(tokenRemote, authorizeAddr, authorizeSecr, seqObj.authorize.token++, buyerAddr, tokenName.approve, approveId, tokenInfos, copyrightId, sellerAddr, sellerSecr, true);

        });

        approveResultList.push(approveResult);

        return Promise.all(singlePubApproveTokenPromises);

    });

    await Promise.all(pubApproveTokenPromises);

    resInfo.data.approveResultList = approveResultList;
    console.log('/transaction/approveConfirm:', resInfo.data);

    console.timeEnd('handleApproveConfirm');
    console.log('--------------------');

    
    return resInfo;

}

async function getAbi(contractAddr) {

    let sql = sqlText.table('contract_info').field('abi_hash').where({contract_addr: contractAddr}).select();
    let getAbiRes = await mysqlUtils.sql(c, sql);
    let abiHash = getAbiRes[0].abi_hash;
    let abi = await ipfsUtils.get(abiHash);
    return abi;

}

function getType(authorizationInfo) {
    return Object.keys(authorizationInfo)[0];
}

async function getTokenIds(workId, approveScene) {

    const approveScene2rigehtType = [
        [1, 2, 3],
        [1, 2, 3],
        [1, 2, 3],
        [1, 2, 3],
        [1, 2, 3],
        [1, 2, 3],
        [1, 2, 3],
        [1, 2, 3],
        [1, 2, 3],
        [1, 2, 3],
    ];

    const rightFilter = approveScene2rigehtType.map(types => {
        let str = 'copyright_type = ' + types.join(' OR copyright_type = ');
        return str;
    });
    
    let filter = "work_id = '" + workId + "' AND (" + rightFilter[approveScene] + ")";
    let sql = sqlText.table('right_token_info').field('copyright_id').where(filter).select();
    let copyrightInfoArr = await mysqlUtils.sql(c, sql);
    let copyrightIds = copyrightInfoArr.map(copyrightInfo => {
        return copyrightInfo.copyright_id;
    });
    return copyrightIds;

}
