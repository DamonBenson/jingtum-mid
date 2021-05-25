import Joi from 'joi';

import {authCustom, jingtumCustom, delJoiKeys} from './base.js';

/*----------数据常量----------*/

const minSubBuyOrderListLength = 1;
const maxSubBuyOrderListLength = 5;
const minLabelAmount = 1;
const maxLabelAmount = 1000;
const mainClassAmount = 5;
const subClassAmount = 5;
const maxWeight = 10;
const minLimitPrice = 100;
const maxLimitPrice = 100000;
const tradeStrategyAmount = 2;
const maxAssetAmout = 100;
const minExpireTime = 3600;
const maxExpireTime = 2592000;
const assetTypeAmount = 3;
const minTs = 1609430400;
const maxTs = 1924963200;

const sideConst = 0;
// const contact = ''; // 如何验证？

/*----------数据验证格式定义----------*/

// 已签名交易
export const signedTxReqSchema = Joi.object().keys({
    blob:
        Joi.string().hex().required(),
}).id('signedTxReqSchema');

// 买单上传
export const buyOrderReqSchema = Joi.object().keys({
    subBuyOrderList: 
        Joi.array().min(minSubBuyOrderListLength).max(maxSubBuyOrderListLength).items(
            Joi.object().keys({
                labelAmount: 
                    Joi.number().integer().min(minLabelAmount).max(maxLabelAmount).required(),
                labelDemand: 
                    Joi.object().length(mainClassAmount).and('0', '1', '2', '3', '4').pattern(
                        /.*/,
                        Joi.array().items(Joi.number().integer().min(0).max(subClassAmount - 1)).unique(),
                    ).required(),
                labelWeight: 
                    Joi.object().length(mainClassAmount).and('0', '1', '2', '3', '4').pattern(
                        /.*/,
                        Joi.object().length(subClassAmount).and('0', '1', '2', '3', '4').pattern(
                            /.*/,
                            Joi.number().integer().min(0).max(maxWeight),
                        ),
                    ).required(),
            })
        ).required(),
    limitPrice:
        Joi.number().integer().min(minLimitPrice).max(maxLimitPrice).required(),
    tradeStrategy:
        Joi.number().integer().min(0).max(tradeStrategyAmount - 1).required(),
    authorizationInfo:
        authCustom.authType().length(1).or('0', '1', '2', '3', '4', '5', '6', '7', '8', '9').buyFlag().required(),
        /* Joi.object().length(1).or('0', '1', '2', '3', '4', '5', '6', '7', '8', '9').pattern(
            /.*\/,
            Joi.object().keys({
                authorizationChannel:
                    Joi.number().integer().min(0).max(authChannelAmount[authType] - 1).required(),
                authorizationArea:
                    Joi.number().integer().min(0).max(authAreaAmount[authType] - 1).required(),
                authorizationTime:
                    Joi.number().integer().min(0).max(authTimeAmount[authType] - 1).required(),
            })
        ).required(), */
    side:
        Joi.number().integer().min(sideConst).max(sideConst).required(),
    buyerAddr:
        jingtumCustom.jingtum().address().required(),
    contact:
        Joi.string().required(), // 如何验证？
    platformAddr:
        jingtumCustom.jingtum().address().required(), 
    contractAddr:
        jingtumCustom.jingtum().address().required(), 
    buyOrderId:
        Joi.string().hex().required(),
}).id('buyOrderReqSchema');

// 买单确认接收
export const buyOrderAcceptSchema = Joi.object().keys({
    buyOrderId:
        Joi.string().hex().required(),
    buyOrderHash:
        Joi.string().hex().required(),
    platformAddr:
        jingtumCustom.jingtum().address().required(),
    matchSystemAddr:
        jingtumCustom.jingtum().address().required(),
    contractAddr:
        jingtumCustom.jingtum().address().required(),
}).id('buyOrderConfirmSchema');

// 卖单上传
export const sellOrderReqSchema = Joi.object().keys({
    labelSet:
        Joi.object().length(mainClassAmount).and('0', '1', '2', '3', '4').pattern(
            /.*/,
            Joi.array().items(Joi.number().integer().min(0).max(subClassAmount - 1)).unique(),
        ).required(),
    expectedPrice:
        authCustom.authType().max(10).and('0', '1', '2', '3', '4', '5', '6', '7', '8', '9').sellFlag().required(),
        /* Joi.object().keys({
            '0':
                Joi.array().length(authSubTypeAmount['0']).items(
                    Joi.object().keys({
                        authorizationChannel:
                            Joi.number().integer().min(0).max(authChannelAmount['0'] - 1).required(),
                        authorizationArea:
                            Joi.number().integer().min(0).max(authAreaAmount['0'] - 1).required(),
                        authorizationTime:
                            Joi.number().integer().min(0).max(authTimeAmount['0'] - 1).required(),
                        authorizationPrice:
                            Joi.number().integer().min(minAuthPrice).max(maxAuthPrice).required(),
                    })
                ).required(),
            '1':
                Joi.array().length(authSubTypeAmount['1']).items(
                    Joi.object().keys({
                        authorizationChannel:
                            Joi.number().integer().min(0).max(authChannelAmount['1'] - 1).required(),
                        authorizationArea:
                            Joi.number().integer().min(0).max(authAreaAmount['1'] - 1).required(),
                        authorizationTime:
                            Joi.number().integer().min(0).max(authTimeAmount['1'] - 1).required(),
                        authorizationPrice:
                            Joi.number().integer().min(minAuthPrice).max(maxAuthPrice).required(),
                    })
                ).required(),
            '2':
                Joi.array().length(authSubTypeAmount['2']).items(
                    Joi.object().keys({
                        authorizationChannel:
                            Joi.number().integer().min(0).max(authChannelAmount['2'] - 1).required(),
                        authorizationArea:
                            Joi.number().integer().min(0).max(authAreaAmount['2'] - 1).required(),
                        authorizationTime:
                            Joi.number().integer().min(0).max(authTimeAmount['2'] - 1).required(),
                        authorizationPrice:
                            Joi.number().integer().min(minAuthPrice).max(maxAuthPrice).required(),
                    })
                ).required(),
            '3':
                Joi.array().length(authSubTypeAmount['3']).items(
                    Joi.object().keys({
                        authorizationChannel:
                            Joi.number().integer().min(0).max(authChannelAmount['3'] - 1).required(),
                        authorizationArea:
                            Joi.number().integer().min(0).max(authAreaAmount['3'] - 1).required(),
                        authorizationTime:
                            Joi.number().integer().min(0).max(authTimeAmount['3'] - 1).required(),
                        authorizationPrice:
                            Joi.number().integer().min(minAuthPrice).max(maxAuthPrice).required(),
                    })
                ).required(),
            '4':
                Joi.array().length(authSubTypeAmount['4']).items(
                    Joi.object().keys({
                        authorizationChannel:
                            Joi.number().integer().min(0).max(authChannelAmount['4'] - 1).required(),
                        authorizationArea:
                            Joi.number().integer().min(0).max(authAreaAmount['4'] - 1).required(),
                        authorizationTime:
                            Joi.number().integer().min(0).max(authTimeAmount['4'] - 1).required(),
                        authorizationPrice:
                            Joi.number().integer().min(minAuthPrice).max(maxAuthPrice).required(),
                    })
                ).required(),
            '5':
                Joi.array().length(authSubTypeAmount['5']).items(
                    Joi.object().keys({
                        authorizationChannel:
                            Joi.number().integer().min(0).max(authChannelAmount['5'] - 1).required(),
                        authorizationArea:
                            Joi.number().integer().min(0).max(authAreaAmount['5'] - 1).required(),
                        authorizationTime:
                            Joi.number().integer().min(0).max(authTimeAmount['5'] - 1).required(),
                        authorizationPrice:
                            Joi.number().integer().min(minAuthPrice).max(maxAuthPrice).required(),
                    })
                ).required(),
            '6':
                Joi.array().length(authSubTypeAmount['6']).items(
                    Joi.object().keys({
                        authorizationChannel:
                            Joi.number().integer().min(0).max(authChannelAmount['6'] - 1).required(),
                        authorizationArea:
                            Joi.number().integer().min(0).max(authAreaAmount['6'] - 1).required(),
                        authorizationTime:
                            Joi.number().integer().min(0).max(authTimeAmount['6'] - 1).required(),
                        authorizationPrice:
                            Joi.number().integer().min(minAuthPrice).max(maxAuthPrice).required(),
                    })
                ).required(),
            '7':
                Joi.array().length(authSubTypeAmount['7']).items(
                    Joi.object().keys({
                        authorizationChannel:
                            Joi.number().integer().min(0).max(authChannelAmount['7'] - 1).required(),
                        authorizationArea:
                            Joi.number().integer().min(0).max(authAreaAmount['7'] - 1).required(),
                        authorizationTime:
                            Joi.number().integer().min(0).max(authTimeAmount['7'] - 1).required(),
                        authorizationPrice:
                            Joi.number().integer().min(minAuthPrice).max(maxAuthPrice).required(),
                    })
                ).required(),
            '8':
                Joi.array().length(authSubTypeAmount['8']).items(
                    Joi.object().keys({
                        authorizationChannel:
                            Joi.number().integer().min(0).max(authChannelAmount['8'] - 1).required(),
                        authorizationArea:
                            Joi.number().integer().min(0).max(authAreaAmount['8'] - 1).required(),
                        authorizationTime:
                            Joi.number().integer().min(0).max(authTimeAmount['8'] - 1).required(),
                        authorizationPrice:
                            Joi.number().integer().min(minAuthPrice).max(maxAuthPrice).required(),
                    })
                ).required(),
            '9':
                Joi.array().length(authSubTypeAmount['9']).items(
                    Joi.object().keys({
                        authorizationChannel:
                            Joi.number().integer().min(0).max(authChannelAmount['9'] - 1).required(),
                        authorizationArea:
                            Joi.number().integer().min(0).max(authAreaAmount['9'] - 1).required(),
                        authorizationTime:
                            Joi.number().integer().min(0).max(authTimeAmount['9'] - 1).required(),
                        authorizationPrice:
                            Joi.number().integer().min(minAuthPrice).max(maxAuthPrice).required(),
                    })
                ).required(),
        }).required(), */
    sellerAddr:
        jingtumCustom.jingtum().address().required(),
    contact:
        Joi.string().required(), // 如何验证？
    assetId:
        Joi.array().min(1).max(maxAssetAmout).items(
            Joi.string().hex()
        ).required(),
    assetType:
        Joi.number().integer().min(0).max(assetTypeAmount - 1).required(),
    consumable:
        Joi.boolean().required(),
    expireTime:
        Joi.number().integer().min(minExpireTime).max(maxExpireTime).required(),
    platformAddr:
        jingtumCustom.jingtum().address().required(), 
    contractAddr:
        jingtumCustom.jingtum().address().required(), 
    sellOrderId:
        Joi.string().hex().required(),
}).id('sellOrderReqSchema');

// 写入匹配结果
export const matchReqSchema = Joi.object().keys({
    buyOrderInfo:
        Joi.object().keys({
            buyOrderId:
                Joi.string().hex().required(),
            buyOrderHash:
                Joi.string().hex().required(),
            subBuyOrderList: 
                Joi.array().min(minSubBuyOrderListLength).max(maxSubBuyOrderListLength).items(
                    Joi.object().keys({
                        labelAmount: 
                            Joi.number().integer().min(minLabelAmount).max(maxLabelAmount).required(),
                        labelDemand: 
                            Joi.object().length(mainClassAmount).and('0', '1', '2', '3', '4').pattern(
                                /.*/,
                                Joi.array().items(Joi.number().integer().min(0).max(subClassAmount - 1)).unique(),
                            ).required(),
                        labelWeight: 
                            Joi.object().length(mainClassAmount).and('0', '1', '2', '3', '4').pattern(
                                /.*/,
                                Joi.object().length(subClassAmount).and('0', '1', '2', '3', '4').pattern(
                                    /.*/,
                                    Joi.number().integer().min(0).max(maxWeight),
                                ),
                            ).required(),
                    })
                ).required(),
            limitPrice:
                Joi.number().integer().min(minLimitPrice).max(maxLimitPrice).required(),
            tradeStrategy:
                Joi.number().integer().min(0).max(tradeStrategyAmount - 1).required(),
            authorizationInfo:
                authCustom.authType().length(1).or('0', '1', '2', '3', '4', '5', '6', '7', '8', '9').buyFlag().required(),
            side:
                Joi.number().integer().min(sideConst).max(sideConst).required(),
            buyerAddr:
                jingtumCustom.jingtum().address().required(),
            contact:
                Joi.string().required(), // 如何验证？
            platformAddr:
                jingtumCustom.jingtum().address().required(),
            contractAddr:
                jingtumCustom.jingtum().address().required(),
            timeStamp:
                Joi.number().integer().min(minTs).max(maxTs).required(),
        }),
    sellOrderInfo:
        Joi.object().pattern(
            /.*/,
            Joi.array().min(minSubBuyOrderListLength * minLabelAmount).max(maxSubBuyOrderListLength * maxLabelAmount).items(
                Joi.object().keys({
                    sellOrderId:
                        Joi.string().hex().required(),
                    contractAddr:
                        jingtumCustom.jingtum().address().required(),
                }),
            ),
            // {matches:
            //     Joi.array().length(Joi.ref(
            //         'buyOrderInfo.subBuyOrderList', 
            //         {adjust: value => {
            //             return value.length;
            //         }}
            //     )).items(
            //         Joi.number().integer().min(0).max(Joi.ref(
            //             'buyOrderInfo.subBuyOrderList', 
            //             {adjust: value => {
            //                 return value.length;
            //             }}
            //         ))
            //     )
            // }
        ).required(),
    matchSystemAddr:
        jingtumCustom.jingtum().address().required(),
    contractAddr:
        jingtumCustom.jingtum().address().required(),
}).id('matchReqSchema');

// 买方确认
export const buyerConfrimReqSchema = Joi.any();

// 卖方转让确认
export const sellerTransferConfrimReqSchema = Joi.any();

// 卖方许可确认
export const sellerApproveConfrimReqSchema = Joi.any();

/**
 * @description 版权许可通证生成（对于平台内部匹配的交易），卖方用户签名。
 * @param {Object}buyOrderInfo 买单信息，包括：买方地址buyerAddr、授权场景authorizationScene、授权渠道authorizationChannel、授权范围authorizationArea、授权时间authorizationTime
 * @param {Object[]}sellOrderInfoList 卖单信息列表，包括：卖方地址sellerAddr、卖方私钥sellerSecret、作品标识workId
 */
export const approveConfirmReqSchema = Joi.any();

// 买单监听
export const buyOrderWatchSchema = delJoiKeys(buyOrderReqSchema, ['platformAddr', 'contractAddr']);