import Joi from 'joi';

/*----------数据验证格式定义----------*/

// 已签名交易格式
const signedTxSchema = Joi.any();

/*----------数据格式验证函数----------*/

// 已签名交易验证
export async function validateSignedTxReq(body) {

    try {
        await signedTxSchema.validateAsync(body);
    }
    catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        return [false, e];
    }

    return [true, 'valid req.'];

}