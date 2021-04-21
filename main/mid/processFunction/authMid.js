import * as authValidate from '../../../utils/validateUtils/auth.js';

/*----------作品确权请求----------*/

export async function handleWorkAuth(contractRemote, seqObj, req, res) {

    console.time('handleWorkAuth');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = JSON.parse(Object.keys(req.body)[0]);
    let [validateInfoRes, validateInfo] = await authValidate.validateWorkAuthReq(body);
    if(!validateInfoRes) {
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = validateInfo;
        return resInfo;
    }

    resInfo.data = body;
    console.log('resInfo:', resInfo);

    console.timeEnd('handleWorkAuth');
    console.log('--------------------');
    
    return resInfo;

}

/*----------版权确权请求----------*/

export async function handleCopyrightAuth(contractRemote, seqObj, req, res) {

    console.time('handleCopyrightAuth');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = JSON.parse(Object.keys(req.body)[0]);
    let [validateInfoRes, validateInfo] = await authValidate.validateCopyrightAuthReq(body);
    if(!validateInfoRes) {
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = validateInfo;
        return resInfo;
    }

    resInfo.data = body;
    console.log('resInfo:', resInfo);

    console.timeEnd('handleCopyrightAuth');
    console.log('--------------------');

    return resInfo;

}

/*----------确权状态查询----------*/

export async function handleAuthState(contractRemote, seqObj, req, res) {

    console.time('handleAuthState');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = req.query;
    let [validateInfoRes, validateInfo] = await authValidate.validateAuthStateReq(body);
    if(!validateInfoRes) {
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = validateInfo;
        return resInfo;
    }

    resInfo.data = body;
    console.log('resInfo:', resInfo);

    console.timeEnd('handleAuthState');
    console.log('--------------------');

    return resInfo;

}