import Joi from 'joi';

import {jingtumCustom, idCustom} from './base.js';

/*----------数据常量----------*/

const minQueryAmount = 1;
const maxQueryAmount = 100;

/*----------数据验证格式定义----------*/

// 账号激活
export const activateReqSchema = Joi.object().keys({
    amount:
        Joi.number().integer().min(minQueryAmount).max(maxQueryAmount).required(),
})

// 三类信息查询
export const workQueryReqSchema = Joi.object().keys({
    WorkIds:
        idCustom.id().hash().required(),
})
export const copyrightQueryReqSchema = Joi.object().keys({
    CopyrightIds:
        idCustom.id().hash().required(),
})
export const approveQueryReqSchema = Joi.object().keys({
    ApproveIds:
        idCustom.id().hash().required(),
})