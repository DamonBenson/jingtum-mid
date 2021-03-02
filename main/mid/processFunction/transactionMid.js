import ipfsAPI from 'ipfs-api';
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';
import sha256 from 'crypto-js/sha256.js';

import * as tx from '../../../utils/jingtum/tx.js'
import * as erc721 from '../../../utils/jingtum/erc721.js';
import * as contract from '../../../utils/jingtum/contract.js';
import * as ipfsUtils from '../../../utils/ipfsUtils.js';
import * as mysqlUtils from '../../../utils/mysqlUtils.js';
import * as localUtils from '../../../utils/localUtils.js';

import {pic, chains, rightTokenName, approveTokenName, ipfsConf, mysqlConf, debugMode} from '../../../utils/info.js';

const ipfs = ipfsAPI(ipfsConf); // ipfs连接
const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接
const tokenChain = chains[0]; // 交易链

/*----------智能授权系统发币账号----------*/

const a1 = tokenChain.account.a[1].address;
const s1 = tokenChain.account.a[1].secret;

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

    let body = JSON.parse(Object.keys(req.body)[0]);

    // 获取合约元数据
    let contractAddr = body.contractAddr;
    let abi = await getAbi(contractAddr);

    // 解析买单ID
    let orderId = body.orderId;

    // 解析买方地址
    let platformAddr = body.addr;

    // 所有买单信息存入IPFS
    let orderInfo = Buffer.from(JSON.stringify(body, ['subBuyOrder', 'limitPrice', 'tradeStrategy', 'authorizationInfo', 'side', 'buyerAddr', 'contact']));
    let orderInfoHash = await ipfsUtils.add(ipfs, orderInfo); // 直接存数据不需要这行
    
    // 构造交易
    let unsignedTx = contractRemote.invokeContract({
        account: platformAddr, 
        destination: contractAddr, // 待部署
        abi: abi, // 待部署
        func: "makeOrder('" + orderId + "','" + orderInfoHash + "')", // 存索引
        // func: makeOrder(orderId, orderInfo), // 直接存数据
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

    let body = JSON.parse(Object.keys(req.body)[0]);

    let blob = body;

    // 提交交易
    await tx.buildSignedTx(contractRemote, blob, true);

    console.timeEnd('handleSignedBuyOrder');
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

    let body = JSON.parse(Object.keys(req.body)[0]);

    // 获取合约元数据
    let contractAddr = body.contractAddr;
    let abi = await getAbi(contractAddr);

    // 解析需要存入合约的卖单信息
    let orderId = body.orderId;
    let assetId = body.assetId;
    let assetType = body.assetType;
    let consumable = body.consumable;
    let expireTime = body.expireTime;

    // 解析平台地址
    let platformAddr = body.addr;

    // 卖单次要信息（标签、授权价格、联系方式）存入IPFS
    let otherClauses = Buffer.from(JSON.stringify(body, ['labelSet', 'expectedPrice', 'sellerAddr', 'contact']));
    let otherClausesHash = await ipfsUtils.add(ipfs, otherClauses);
    
    // 构造交易
    let func = "makeOrder('" + orderId + "','" + assetId + "'," + assetType + "," + consumable + "," + expireTime + ",'" + otherClausesHash + "')";
    console.log(func);
    let unsignedTx = contractRemote.invokeContract({
        account: platformAddr, 
        destination: contractAddr, // 待部署
        abi: abi, // 待部署
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

    let body = JSON.parse(Object.keys(req.body)[0]);

    let blob = body;

    // 提交交易
    await tx.buildSignedTx(contractRemote, blob, true);

    console.timeEnd('handleSignedSellOrder');
    console.log('--------------------');

    // return orderId;

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

    // 获取合约元数据
    let contractAddr = body.contractAddr;
    let abi = await getAbi(contractAddr);

    // 获取智能交易系统账户地址
    let matchSystemAddr = body.addr;

    // 解析买方平台地址、买单ID、撮合信息
    let platformAddr = body.platformAddr;
    let buyOrderId = body.buyOrderId;
    let matchResults = body.matchResults;
    /* {
        买单: {买单信息}
        卖单: [{卖方平台，卖单ID，作品ID}，……]
    } */
    let matchResultsBuffer = Buffer.from(JSON.stringify(matchResults));
    let matchResultsHash = await ipfsUtils.add(ipfs, matchResultsBuffer);

    // 构造交易
    let unsignedTx = contractRemote.invokeContract({
        account: matchSystemAddr, 
        destination: contractAddr, // 待部署
        abi: abi, // 待部署
        func: updateMatches(platformAddr, buyOrderId, matchResultsHash),
    });
    unsignedTx.setSequence(seqObj.a1.contract++);

    console.timeEnd('handleMatch');
    console.log('--------------------');

    return unsignedTx;

}

/*----------提交平台签名的交易匹配结果写入交易----------*/

/**
 * @param {signedTx} 平台签名的交易blob
 * @return {oederId} 订单编号
 */
export async function handleSignedMatch(contractRemote, seqObj, req, res) {

    console.time('handleSignedMatch');

    let body = JSON.parse(Object.keys(req.body)[0]);

    let blob = body;

    // 提交交易
    await tx.buildSignedTx(contractRemote, blob, true);

    console.timeEnd('handleSignedMatch');
    console.log('--------------------');

    return orderId;

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
    let platformAddr = body.addr;

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
        unsignedTx.setSequence(seqObj.a1.contract++);
        return unsignedTx;
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

    // 默认mono值
    let mono = false;

    // 构造交易
    let unsignedTx = contractRemote.invokeContract({
        account: platformAddr, 
        destination: contractAddr, // 待部署
        abi: abi, // 待部署
        func: commitOrder(sellOrderId, platformAddr, mono),
    });
    unsignedTx.setSequence(seqObj.a1.contract++);

    // 根据卖单ID，从合约中获取卖单信息
    let func = "getOrderInfo('" + sellOrderId + "')";
    let getOrderInfoRes = await contract.invokeContract(a1, s1, contractRemote, seqObj.a1.contract++, abi, contractAddr, func, true);
    let sellOrderInfo = getOrderInfoRes.ContractState;
    let workId = sellOrderInfo.asset_id;

    // 根据卖单信息，查询数据库，获取相关的通证ID
    let authorizationInfo = buyOrderInfo.authorizationInfo;
    let authorizationType = getType(authorizationInfo);
    let rightTokenIds = getTokenIds(workId, authorizationType);

    // 为版权通证生成对应的许可通证，并发放给用户
    let buyerAddr = buyOrderInfo.buyerAddr;
    let tokenIssuePromises = [];
    let tokenAuthPromises = [];
    rightTokenIds.map(tokenId => {
        let rightTokenId = tokenId;
        let apprChannel = authorizationInfo[authorizationType].AuthorizationChannel;
        let apprArea = authorizationInfo[authorizationType].AuthorizationArea;
        let apprTime = authorizationInfo[authorizationType].AuthorizationTime;
        let apprTokenId = sha256(rightTokenId + seqObj.a1.token).toString(); // tokenId暂定为hash(workId+0~16)
        let tokenInfo = {
            rightTokenId: rightTokenId,
            apprChannel: apprChannel,
            apprArea: apprArea,
            apprTime: apprTime,
        }
        let tokenMemos = localUtils.obj2memos(tokenInfo);
        if(debugMode) {
            console.log('issue token:', tokenInfo);
        }
        else {
            console.log('issue token:', tokenInfo.rightTokenId + '_' + seqObj.a1.token);
        }
        /* issue token: {
            workId: '909B18A4FCFE8ACDA0C8F4AC5C45AF2BA86F2DE7761C73126B1EDBF0A18FEBA5',
            rightType: 6
        } */
        tokenIssuePromises.push(erc721.buildIssueTokenTx(s1, tokenRemote, seqObj.a1.token++, a1, approveTokenName, apprTokenId, tokenMemos, true));
        tokenAuthPromises.push(erc721.buildAuthTokenTx(s1, tokenRemote, seqObj.a1.token++, a1, buyerAddr, approveTokenName, apprTokenId, true));
    })
    await Promise.all(tokenIssuePromises);
    await Promise.all(tokenAuthPromises);

    console.timeEnd('handleSellerApproveConfirm');
    console.log('--------------------');

    return [unsignedTx];

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
