import * as requestInfo from '../../../utils/jingtum/requestInfo.js';
import * as erc721 from '../../../utils/jingtum/erc721.js';
import * as localUtils from '../../../utils/localUtils.js';
import * as authValidate from '../../../utils/validateUtils/auth.js';

import {userAccount} from '../../../utils/config/jingtum.js';

const authenticateAddr = userAccount.authenticateAccount[0].address;
const authenticateSecr = userAccount.authenticateAccount[0].secret;

// /*----------作品确权请求----------*/

// export async function handleWorkAuth(contractRemote, seqObj, req, res) {

//     console.time('handleWorkAuth');

//     let resInfo = {
//         msg: 'success',
//         code: 0,
//         data: {},
//     }

//     let body = JSON.parse(Object.keys(req.body)[0]);
//     let [validateInfoRes, validateInfo] = await authValidate.validateWorkAuthReq(body);
//     if(!validateInfoRes) {
//         resInfo.msg = 'invalid parameters',
//         resInfo.code = 1;
//         resInfo.data.validateInfo = validateInfo;
//         return resInfo;
//     }

//     resInfo.data = body;
//     console.log('resInfo:', resInfo);

//     console.timeEnd('handleWorkAuth');
//     console.log('--------------------');
    
//     return resInfo;

// }

/**
 * @description 版权确权，平台签名。
 * @param {int[]}copyrightIds 版权权利通证标识列表
 * @param {String}platformAddr 平台地址
 * @param {String}contractAddr 确权合约地址
 * @returns 无
 */
export async function handleCopyrightAuth(contractRemote, seqObj, req) {

    console.time('handleCopyrightAuth');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.body;
    try {
        await authValidate.copyrightAuthReqSchema.validateAsync(body);
    } catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = e;
        console.timeEnd('handleCopyrightAuth');
        console.log('--------------------');
        return resInfo;
    }

    //方法体

    console.timeEnd('handleCopyrightAuth');
    console.log('--------------------');

    return resInfo;

}

/**
 * @description 查询审核情况，中间层签名。
 * @param {int[]}copyrightIds 版权权利通证标识列表
 * @param {String}contractAddr 确权合约地址
 * @returns {Object[]} 审核情况列表，包括：审核状态auditStatus、审核结果copyrightStatus、确权标识authenticationId、确权证书索引licenseUrl
 */
export async function handleAuthState(contractRemote, seqObj, req) {

    console.time('handleAuthState');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.query;
    try {
        await authValidate.authStateReqSchema.validateAsync(body);
    } catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = e;
        console.timeEnd('handleAuthState');
        console.log('--------------------');
        return resInfo;
    }

    // 方法体    

    console.timeEnd('handleAuthState');
    console.log('--------------------');

    resInfo.data.auditInfoList = auditInfoList;

    return resInfo;

}

/**
 * @description 不通过合约完成同步版权确权。
 * @param {int[]}copyrightIds 版权权利通证标识列表
 * @returns {Object[]} 确权信息列表，包括：版权权利通证标识copyrightId、审核结果auditResult、确权标识authenticationId、登记确权证书索引licenseUrl、确权时间戳timestamp
 */
 export async function handleInnerCopyrightAuth(tokenRemote, seqObj, req) {

    console.time('handleInnerCopyrightAuth');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.body;
    try {
        await authValidate.innerCopyrightAuthReqSchema.validateAsync(body);
    } catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = e;
        console.timeEnd('handleInnerCopyrightAuth');
        console.log('--------------------');
        return resInfo;
    }

    //方法体
    let copyrightIds = body.copyrightIds;
    let authenticationInfoList = new Array(copyrightIds.length);
    let authenticatePromises = copyrightIds.map((copyrightId, index) => {
        let auditResult = localUtils.randomSelect([true, false], [0.8, 0.2]);
        authenticationInfoList[index] = {
            copyrightId: copyrightId,
            auditResult: auditResult,
        }
        if(auditResult) {
            let authenticationId = 'DCI' + copyrightId.substring(copyrightId.length - 8, copyrightId.length);
            let licenseUrl = 'http://auth.com/' + authenticationId + '.pdf';
            let authInfo = {
                authenticationId: authenticationId,
                licenseUrl: licenseUrl,
            }
            Object.assign(authenticationInfoList[index], authInfo);
            return (erc721.buildTokenInfoChangeTx(tokenRemote, authenticateAddr, authenticateSecr, undefined, copyrightId, authInfo, false));
        }
        return null;
    });

    let authenticateResArr = await Promise.all(authenticatePromises);

    let txInfoPromises = authenticateResArr.map(authenticateRes => {
        if(authenticateRes) {
            let txHash = authenticateRes.tx_json.hash;
            return requestInfo.requestTx(tokenRemote, txHash, false);
        }
        return null;
    });

    let txInfoResArr = await Promise.all(txInfoPromises);

    txInfoResArr.forEach((txInfoRes, index) => {
        if(txInfoRes) {
            authenticationInfoList[index].timestamp = txInfoRes.Timestamp + 946684800;
        }
    });

    resInfo.data.authenticationInfoList = authenticationInfoList;
    console.log('/auth/innerCopyright:', resInfo.data);

    console.timeEnd('handleInnerCopyrightAuth');
    console.log('--------------------');

    return resInfo;

}