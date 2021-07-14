import Joi from 'joi';
import {authCustom, jingtumCustom} from "./base.js";
import {minTs, maxTs} from '../config/profile.js';

/*----------数据验证格式定义----------*/

// 作品确权
export const workAuthReqSchema_Any = Joi.any();

/**
 * @description 版权确权。
 * @param {int[]}copyrightIds 版权权利通证标识列表
 * @param {String}platformAddr 平台地址
 * @param {String}contractAddr 确权合约地址
 */
export const copyrightAuthReqSchema = Joi.any();

/**
 * @description 查询审核情况。
 * @param {int[]}copyrightIds 版权权利通证标识列表
 * @param {String}contractAddr 确权合约地址
 */
export const authStateReqSchema = Joi.any();

/**
 * @description 不通过合约完成同步作品确权。
 * @param {int}workId 作品标识
 * @param {String}address 确权用户地址
 */
export const innerWorkAuthReqSchema = Joi.any();

/**
 * @description 不通过合约完成同步版权确权。
 * @param {int[]}copyrightIds 版权权利通证标识列表
 */
export const innerCopyrightAuthReqSchema = Joi.any();

/**
 * @description 北京版权局确权请求报文。
 */
export const workAuthReqSchema = Joi.object().keys({
    workId:
        Joi.string().required(),
    address:
        jingtumCustom.jingtum().address().required()
}).id('workAuthReqSchema');

/**
 * @description 北京版权局确权返回报文。
 */
export const workAuthResSchema = Joi.object().keys({
    workId:
        Joi.string().required(),
    address:
        jingtumCustom.jingtum().address().required()
    authenticationInfo:
        Joi.object().keys({
            auditResult :
                Joi.boolean().required(),
            examineMessage :
                Joi.string(),
            authenticationId :
                Joi.string(),
            licenseUrl:
                Joi.string(),
            timestamp :
                Joi.number().integer().min(minTs).max(maxTs),
        }).required(),


    }
}).id('workAuthResSchema');

// /**
//  * @description 北京版权局确权。
//  * @param {int[]}copyrightIds 版权权利通证标识列表
//  */
// export const package1Schema = Joi.object().keys({
//     workId:
//         Joi.string().required(),
//     address:
//         jingtumCustom.jingtum().address().required()
// }).id('workAuthReqSchema');