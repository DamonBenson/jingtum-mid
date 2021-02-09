import ipfsAPI from 'ipfs-api';
import sha256 from 'crypto-js/sha256.js';

import * as tx from '../../../utils/jingtum/tx.js'
import * as erc721 from '../../../utils/jingtum/erc721.js';
import * as ipfsUtils from '../../../utils/ipfsUtils.js';
import * as localUtils from '../../../utils/localUtils.js';

import {pic, chains, rightTokenName, ipfsConf, debugMode} from '../../../utils/info.js';

const ipfs = ipfsAPI(ipfsConf); // ipfs连接
const uploadChain = chains[0]; // 存证链

/*----------中间层账号(存证/交易链账号0)----------*/

const a0 = uploadChain.account.a[0].address;
const s0 = uploadChain.account.a[0].secret;

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

    // 构造交易

    console.timeEnd('handleBuyOrder');
    console.log('--------------------');

    return unsignedTx;

}

/*----------提交买方签名的买单上传交易----------*/

/**
 * @param {signedTx} 平台签名的交易blob
 * @return {orderId} 订单编号
 */
export async function handleSignedBuyOrder(contractRemote, seqObj, req, res) {

    console.time('handleSignedBuyOrder');

    let body = JSON.parse(Object.keys(req.body)[0]);

    // 提交交易

    console.timeEnd('handleSignedBuyOrder');
    console.log('--------------------');

    return orderId;

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

    // 构造交易

    console.timeEnd('handleSellOrder');
    console.log('--------------------');

    return unsignedTx;

}

/*----------提交卖方签名的卖单上传交易----------*/

/**
 * @param {signedTx} 平台签名的交易blob
 * @return {orderId} 订单编号（通证ID）
 */
export async function handleSignedSellOrder(contractRemote, seqObj, req, res) {

    console.time('handleSignedSellOrder');

    let body = JSON.parse(Object.keys(req.body)[0]);

    // 提交交易

    console.timeEnd('handleSignedSellOrder');
    console.log('--------------------');

    return orderId;

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

    // 构造交易

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

    // 提交交易

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

    // 从买单合约中获取交易匹配结果
    // 从数据库中查询所有相关卖单合约的地址
    // 构造所有交易

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

    // 提交交易

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

    // 生成许可通证
    // 构造卖方确认写入交易

    console.timeEnd('handleSellerApproveConfirm');
    console.log('--------------------');

    return [unsignedTx, tokenId];

}

/*----------提交卖方签名的卖方确认交易（卖单合约）----------*/

/**
 * @param {signedTx} 买方签名的交易blob
 * @return {oederId} 订单编号（通证ID）
 */
export async function handleSignedSellerApproveConfirm(contractRemote, seqObj, req, res) {

    console.time('handleSignedSellerApproveConfirm');

    let body = JSON.parse(Object.keys(req.body)[0]);

    // 提交交易

    console.timeEnd('handleSignedSellerApproveConfirm');
    console.log('--------------------');

    return orderId;

}