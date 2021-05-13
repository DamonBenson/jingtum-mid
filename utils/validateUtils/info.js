import Joi from 'joi';

import {idCustom} from './base.js';

/*----------数据常量----------*/

const minQueryAmount = 1;
const maxQueryAmount = 100;

/*----------数据验证格式----------*/

/**
 * @description 激活账户。
 * @param {int}amount 需要激活的区块链账户数量
 */
export const activateReqSchema = Joi.object().keys({
    amount:
        Joi.number().integer().min(minQueryAmount).max(maxQueryAmount).required(),
})

/**
 * @description 查询作品信息。
 * @param {int[]}workIds 作品标识列表
 */
export const workQueryReqSchema = Joi.object().keys({
    workIds:
        idCustom.id().hash().required(),
})

/**
 * @description 查询作品信息。
 * @param {int[]}copyrightIds 版权通证标识列表
 */
export const copyrightQueryReqSchema = Joi.object().keys({
    copyrightIds:
        idCustom.id().hash().required(),
})

/**
 * @description 查询作品信息。
 * @param {int[]}approveIds 许可通证标识列表
 */
 export const approveQueryReqSchema = Joi.object().keys({
    approveIds:
        idCustom.id().hash().required(),
})