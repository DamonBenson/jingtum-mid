import Joi from 'joi';

import {authCustom, jingtumCustom, delJoiKeys} from './base.js';

/*----------数据常量----------*/

const minQueryAmount = 1;
const maxQueryAmount = 100;

/*----------数据验证格式定义----------*/

// 账号激活
const activateReqSchema = Joi.number().integer().min(minQueryAmount).max(maxQueryAmount).required();

// 三类信息查询
const queryReqSchema = Joi.array().sparse().min(minQueryAmount).max(maxQueryAmount).items(
    jingtumCustom.jingtum().hash().required(),
).required();

/*----------数据格式验证函数----------*/

// 账号激活
export async function validateActivateReq(addAmount) {

    try {
        await activateReqSchema.validateAsync(addAmount);
    }
    catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        return [false, e];
    }

    return [true, 'valid req.'];

}

// 三类信息查询
export async function validateQueryReq(body) {

    try {
        await queryReqSchema.validateAsync(body);
    }
    catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        return [false, e];
    }

    return [true, 'valid req.'];

}