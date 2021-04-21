import * as contractValidate from '../../../utils/validateUtils/contract.js';

/*----------构造部署合约的交易----------*/

/**
 * @param {payload} 合约编译后的16进制字节码
 * @param {abi} 合约2进制接口
 * @param {args} 合约初始化参数
 * @return {unsignedTx} 用以在链上部署合约的待签名交易
 */
export async function handleDeployContract(contractRemote, seqObj, req, res) {

    console.time('handleDeployContract');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = JSON.parse(Object.keys(req.body)[0]);
    let [validateInfoRes, validateInfo] = await contractValidate.validateDeployContractReq(body);
    if(!validateInfoRes) {
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = validateInfo;
        return resInfo;
    }

    resInfo.data = body;
    console.log('resInfo:', resInfo);

    console.timeEnd('handleDeployContract');
    console.log('--------------------');

    return resInfo;

}

/*----------提交平台签名的合约部署交易----------*/

/**
 * @param {signedTx} 平台签名的交易blob
 * @param {platformId} 平台标识（可以直接用平台的链上地址）
 * @param {serviceType} 服务类型（确权类、交易类、监测维权类等）
 * @return {contractAddr} 部署的合约地址
 */
export async function handleSignedDeployContract(contractRemote, seqObj, req, res) {

    console.time('handleSignedDeployContract');

    let body = JSON.parse(Object.keys(req.body)[0]);

    // 提交交易
    // 在管理合约中注册

    console.timeEnd('handleSignedDeployContract');
    console.log('--------------------');

    return contractAddr;

}

/*----------查询对应平台标识、服务类型的合约地址----------*/

/**
 * @param {platformId} 平台标识（可以直接用平台的链上地址）
 * @param {serviceType} 服务类型（确权类、交易类、监测维权类等）
 * @return {contractAddr} 合约地址
 */
export async function handleContractAddr(contractRemote, seqObj, req, res) {

    console.time('handleContractAddr');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.query;
    let [validateInfoRes, validateInfo] = await contractValidate.validateContractAddrReq(body);
    if(!validateInfoRes) {
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = validateInfo;
        return resInfo;
    }

    resInfo.data = body;
    console.log('resInfo:', resInfo);

    console.timeEnd('handleContractAddr');
    console.log('--------------------');

    return resInfo;

}

/*----------从服务合约中获取详细信息----------*/

/**
 * @param {contractAddr} 服务合约地址
 * @return {contractInfo} 服务详细信息
 */
export async function handleContractInfo(contractRemote, seqObj, req, res) {

    console.time('handleContractInfo');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.query;
    let [validateInfoRes, validateInfo] = await contractValidate.validateContractInfoReq(body);
    if(!validateInfoRes) {
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = validateInfo;
        return resInfo;
    }

    resInfo.data = body;
    console.log('resInfo:', resInfo);

    console.timeEnd('handleContractInfo');
    console.log('--------------------');

    return resInfo;

}