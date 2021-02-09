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

/*----------构造部署合约的交易----------*/

/**
 * @param {payload} 合约编译后的16进制字节码
 * @param {abi} 合约2进制接口
 * @param {args} 合约初始化参数
 * @return {unsignedTx} 用以在链上部署合约的待签名交易
 */
export async function handleInitContract(contractRemote, seqObj, req, res) {

    console.time('handleInitContract');

    let body = JSON.parse(Object.keys(req.body)[0]);

    // 构造交易

    console.timeEnd('handleInitContract');
    console.log('--------------------');

    return unsignedTx;

}

/*----------提交平台签名的合约部署交易----------*/

/**
 * @param {signedTx} 平台签名的交易blob
 * @param {platformId} 平台标识（可以直接用平台的链上地址）
 * @param {serviceType} 服务类型（确权类、交易类、监测维权类等）
 * @return {contractAddr} 部署的合约地址
 */
export async function handleSignedInitContract(contractRemote, seqObj, req, res) {

    console.time('handleSignedInitContract');

    let body = JSON.parse(Object.keys(req.body)[0]);

    // 提交交易
    // 在管理合约中注册

    console.timeEnd('handleSignedInitContract');
    console.log('--------------------');

    return contractAddr;

}

/*----------查询对应平台标识、服务类型的合约地址----------*/

/**
 * @param {platformId} 平台标识（可以直接用平台的链上地址）
 * @param {serviceType} 服务类型（确权类、交易类、监测维权类等）
 * @return {contractAddr} 合约地址
 */
export async function handleContractQuery(contractRemote, seqObj, req, res) {

    console.time('handleContractQuery');

    let body = JSON.parse(Object.keys(req.body)[0]);

    // 从数据库中查找合约地址

    console.timeEnd('handleContractQuery');
    console.log('--------------------');

    return contractAddr;

}

/*----------从服务合约中获取详细信息----------*/

/**
 * @param {contractAddr} 服务合约地址
 * @return {contractInfo} 服务详细信息
 */
export async function handleContractInfo(contractRemote, seqObj, contractAddr, req, res) {

    console.time('handleContractInfo');

    let body = JSON.parse(Object.keys(req.body)[0]);

    // 获取服务的详细信息

    console.timeEnd('handleContractInfo');
    console.log('--------------------');

    return contractInfo;

}