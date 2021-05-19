import Joi from 'joi';

/*----------数据验证格式定义----------*/

// 作品确权
export const workAuthReqSchema = Joi.any();

/**
 * @description 版权确权。
 * @param {int[]}copyrightIds 版权通证标识列表
 * @param {String}platformAddr 平台地址
 * @param {String}contractAddr 确权合约地址
 */
export const copyrightAuthReqSchema = Joi.any();

/**
 * @description 查询审核情况。
 * @param {int[]}copyrightIds 版权通证标识列表
 * @param {String}contractAddr 确权合约地址
 */
export const authStateReqSchema = Joi.any();

/**
 * @description 不通过合约完成同步版权确权。
 * @param {int[]}copyrightIds 版权通证标识列表
 */
 export const innerCopyrightAuthReqSchema = Joi.any();