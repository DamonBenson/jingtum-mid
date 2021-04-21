import * as serviceValidate from '../../../utils/validateUtils/service.js';

/*----------服务调用请求----------*/

export async function handleServiceCall(contractRemote, seqObj, req, res) {

    console.time('handleServiceCall');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = JSON.parse(Object.keys(req.body)[0]);
    let [validateInfoRes, validateInfo] = await serviceValidate.validateServiceCallReq(body);
    if(!validateInfoRes) {
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = validateInfo;
        return resInfo;
    }

    resInfo.data = body;
    console.log('resInfo:', resInfo);

    console.timeEnd('handleServiceCall');
    console.log('--------------------');

    return resInfo;

}

/*----------服务结果写入----------*/

export async function handleServiceResult(contractRemote, seqObj, req, res) {

    console.time('handleServiceResult');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = JSON.parse(Object.keys(req.body)[0]);
    let [validateInfoRes, validateInfo] = await serviceValidate.validateServiceResultReq(body);
    if(!validateInfoRes) {
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = validateInfo;
        return resInfo;
    }

    resInfo.data = body;
    console.log('resInfo:', resInfo);

    console.timeEnd('handleServiceResult');
    console.log('--------------------');

    return resInfo;

}