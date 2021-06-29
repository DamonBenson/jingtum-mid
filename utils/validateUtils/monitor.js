import Joi from 'joi';

/*----------数据验证格式定义----------*/

/**
 * @description 证据上链，中间层签名。
 * @param {int}workId 作品标识
 * @param {String}sampleId 监测文件标识
 * @param {String}evidenceNo 侵权证据标识
 * @param {String}ipfsAddress 侵权证据文件IPFS地址
 */
export const evidenceReqSchema = Joi.any();