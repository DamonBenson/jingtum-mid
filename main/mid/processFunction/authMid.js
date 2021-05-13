import * as authValidate from '../../../utils/validateUtils/auth.js';

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
 * @param {int[]}copyrightIds 版权通证标识列表
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

    let body = JSON.parse(Object.keys(req.body)[0]);
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
 * @param {int[]}copyrightIds 版权通证标识列表
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