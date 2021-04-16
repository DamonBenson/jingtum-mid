import Joi from 'joi';

import {authCustom, jingtumCustom, delJoiKeys} from './base.js';

/*----------数据常量----------*/

const minQueryAmount = 1;
const maxQueryAmount = 100;

/*----------数据验证格式定义----------*/

// 账号激活请求格式
const activateSchema = Joi.number().integer().min(minQueryAmount).max(maxQueryAmount).required();

// 三类信息查询格式
const querySchema = Joi.array().sparse().min(minQueryAmount).max(maxQueryAmount).items(
    jingtumCustom.jingtum().hash().required(),
).required();

/*----------数据格式验证函数----------*/

// 账户激活验证函数
export async function validateActivate(addAmount) {

    try {
        await activateSchema.validateAsync(addAmount);
    }
    catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        return [false, e];
    }

    return [true, 'valid req.'];

}

// 信息查询验证函数
export async function validateQuery(body) {

    try {
        await querySchema.validateAsync(body);
    }
    catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        return [false, e];
    }

    return [true, 'valid req.'];

}