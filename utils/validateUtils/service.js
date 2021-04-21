import Joi from 'joi';

/*----------数据验证格式定义----------*/

// 服务调用请求
const serviceCallReqSchema = Joi.any();

// 服务结果写入
const serviceResultReqSchema = Joi.any();

/*----------数据格式验证函数----------*/

// 作品确权
export async function validateServiceCallReq(body) {

    try {
        await serviceCallReqSchema.validateAsync(body);
    }
    catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        return [false, e];
    }

    return [true, 'valid req.'];

}

// 版权确权
export async function validateServiceResultReq(body) {

    try {
        await serviceResultReqSchema.validateAsync(body);
    }
    catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        return [false, e];
    }

    return [true, 'valid req.'];

}