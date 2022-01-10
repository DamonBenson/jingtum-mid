import Joi from 'joi';
import { jingtumCustom } from './base.js';

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
        Joi.array().min(minQueryAmount).max(maxQueryAmount).items(
            Joi.string().hex().length(64),
        ).required(),
})

/**
 * @description 查询权利信息。
 * @param {int[]}copyrightIds 版权权利通证标识列表
 */
export const copyrightQueryReqSchema = Joi.object().keys({
    copyrightIds:
        Joi.array().min(minQueryAmount).max(maxQueryAmount).items(
            Joi.string().hex().length(64),
        ).required(),
})

/**
 * @description 查询授权信息。
 * @param {int[]}approveIds 版权许可通证标识列表
 */
export const approveQueryReqSchema = Joi.object().keys({
    approveIds:
        Joi.array().min(minQueryAmount).max(maxQueryAmount).items(
            Joi.string().hex().length(64),
        ).required(),
})

/**
 * @description 查询用户的所有作品信息。
 * @param {String}address 用户地址
 */
export const workOfUserQueryReqSchema = Joi.object().keys({
    address:
        jingtumCustom.jingtum().address().required(),
});

/**
 * @description 查询用户作品的许可发放信息。
 * @param {String}address 用户地址
 * @param {int}workId 作品标识
 */
export const issueApproveOfWorkQueryReqSchema = Joi.object().keys({
    address:
        jingtumCustom.jingtum().address().required(),
    workId:
        Joi.string().hex().length(64),
});

/**
 * @description 查询用户作品的许可获得信息。
 * @param {String}address 用户地址
 * @param {int}workId 作品标识
 */
export const ownApproveOfWorkQueryReqSchema = Joi.object().keys({
    address:
        jingtumCustom.jingtum().address().required(),
    workId:
        Joi.string().hex().length(64),
});