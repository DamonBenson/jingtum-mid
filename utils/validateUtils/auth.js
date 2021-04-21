import Joi from 'joi';

/*----------数据验证格式定义----------*/

// 作品确权
const workAuthReqSchema = Joi.any();

// 版权确权
const copyrightAuthReqSchema = Joi.any();

// 确权状态查询
const authStateReqSchema = Joi.any();

/*----------数据格式验证函数----------*/

// 作品确权
export async function validateWorkAuthReq(body) {

    try {
        await workAuthReqSchema.validateAsync(body);
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
export async function validateCopyrightAuthReq(body) {

    try {
        await copyrightAuthReqSchema.validateAsync(body);
    }
    catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        return [false, e];
    }

    return [true, 'valid req.'];

}

// 确权状态查询
export async function validateAuthStateReq(body) {

    try {
        await authStateReqSchema.validateAsync(body);
    }
    catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        return [false, e];
    }

    return [true, 'valid req.'];

}