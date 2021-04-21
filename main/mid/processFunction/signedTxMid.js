import * as signedTxValidate from '../../../utils/validateUtils/signedTx.js';

/*----------提交已签名交易----------*/

export async function handleSignedTx(uploadRemote, tokenRemote, contractRemote, req, res) {

    console.time('handleSignedTx');

    let resInfo = {
        msg: 'success',
        code: 0,
        data: {},
    }

    let body = JSON.parse(Object.keys(req.body)[0]);
    let [validateInfoRes, validateInfo] = await signedTxValidate.validateSignedTxReq(body);
    if(!validateInfoRes) {
        resInfo.msg = 'invalid parameters',
        resInfo.code = 1;
        resInfo.data.validateInfo = validateInfo;
        return resInfo;
    }
    
    resInfo.data = body;
    console.log('resInfo:', resInfo);

    console.timeEnd('handleSignedTx');
    console.log('--------------------');

    return resInfo;

}