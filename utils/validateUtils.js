import jlib from 'jingtum-lib';
import Joi from 'joi';
import _ from 'lodash';

const u = jlib.utils;

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
const minAuthPrice = 1;
const maxAuthPrice = 1000;
const tradeStrategyAmount = 2;
const maxAssetAmout = 100;
const minExpireTime = 3600;
const maxExpireTime = 2592000;
const assetTypeAmount = 3;
const minTs = 1609430400;
const maxTs = 1924963200;

const authChannelAmount = {
    '0': 2,
    '1': 1,
    '2': 1,
    '3': 3,
    '4': 2,
    '5': 2,
    '6': 1,
    '7': 1,
    '8': 2,
    '9': 1,
};

const authAreaAmount = {
    '0': 3,
    '1': 3,
    '2': 3,
    '3': 3,
    '4': 3,
    '5': 3,
    '6': 3,
    '7': 3,
    '8': 3,
    '9': 3,
};

const authTimeAmount = {
    '0': 4,
    '1': 4,
    '2': 4,
    '3': 4,
    '4': 1,
    '5': 1,
    '6': 1,
    '7': 4,
    '8': 4,
    '9': 4,
};

const authSubTypeAmount = {
    '0': 24,
    '1': 12,
    '2': 12,
    '3': 36,
    '4': 6,
    '5': 6,
    '6': 3,
    '7': 12,
    '8': 24,
    '9': 12,
};

const sideConst = 0;
// const contact = ''; // 如何验证？

/*----------自定义验证类----------*/

// 交易授权信息验证
const authCustom = Joi.extend((joi) => {

    return {
        type: 'authType',
        base: joi.object(),
        messages: {
            'authType.nonexist': '{{#label}} must have valid flags',
            'authType.dataType': '{{#label}} has a flag with wrong data type',
            'authType.overflow': '{{#label}} has a flag out of range',
        },
        rules: {
            buyFlag: {
                validate(value, helpers, args, options) {
                    for(let key in value) {
                        let o = value[key];
                        if(
                            !o.hasOwnProperty('authorizationChannel') ||
                            !o.hasOwnProperty('authorizationArea') ||
                            !o.hasOwnProperty('authorizationTime')
                        ) {
                            return helpers.error('authType.nonexist', {});
                        }
                        else {
                            if(
                                !Number.isInteger(o.authorizationChannel) ||
                                !Number.isInteger(o.authorizationArea) ||
                                !Number.isInteger(o.authorizationTime)
                            ) {
                                return helpers.error('authType.dataType', {});
                            }
                            else {
                                if(
                                    !(0 <= o.authorizationChannel && o.authorizationChannel <= authChannelAmount[Number(key)]) ||
                                    !(0 <= o.authorizationArea && o.authorizationArea <= authAreaAmount[Number(key)]) ||
                                    !(0 <= o.authorizationTime && o.authorizationTime <= authTimeAmount[Number(key)])
                                ) {
                                    return helpers.error('authType.overflow', {});
                                }
                            }
                        }
                    }
                }
            },
            sellFlag: {
                validate(value, helpers, args, options) {
                    for(let key in value) {
                        let l = value[key].length;
                        for(let i = 0; i < l; i++) {
                            let o = value[key][i];
                            if(
                                !o.hasOwnProperty('authorizationChannel') ||
                                !o.hasOwnProperty('authorizationArea') ||
                                !o.hasOwnProperty('authorizationTime') ||
                                !o.hasOwnProperty('authorizationPrice')
                            ) {
                                return helpers.error('authType.nonexist', {});
                            }
                            else {
                                if(
                                    !Number.isInteger(o.authorizationChannel) ||
                                    !Number.isInteger(o.authorizationArea) ||
                                    !Number.isInteger(o.authorizationTime) ||
                                    !Number.isInteger(o.authorizationPrice)
                                ) {
                                    return helpers.error('authType.dataType', {});
                                }
                                else {
                                    if(
                                        !(0 <= o.authorizationChannel && o.authorizationChannel <= authChannelAmount[Number(key)]) ||
                                        !(0 <= o.authorizationArea && o.authorizationArea <= authAreaAmount[Number(key)]) ||
                                        !(0 <= o.authorizationTime && o.authorizationTime <= authTimeAmount[Number(key)]) ||
                                        !(minAuthPrice <= o.authorizationPrice && o.authorizationPrice <= maxAuthPrice)
                                    ) {
                                        return helpers.error('authType.overflow', {});
                                    }
                                }
                            }
                        }
                    }
                }
            },
        }
    };
    
});

// 井通数据格式验证
const jingtumCustom = Joi.extend((joi) => {

    return {
        type: 'jingtum',
        base: joi.string(),
        messages: {
            'jingtum.hash': '{{#label}} is not a valid hash',
            'jingtum.address': '{{#label}} is not a valid address',
            'jingtum.secret': '{{#label}} is not a valid secret',
        },
        rules: {
            hash: {
                validate(value, helpers, args, options) {
                    if(!u.isValidHash(value)) {
                        return helpers.error('jingtum.hash');
                    }
                }
            },
            address: {
                validate(value, helpers, args, options) {
                    if(!u.isValidAddress(value)) {
                        return helpers.error('jingtum.address');
                    }
                }
            },
            secret: {
                validate(value, helpers, args, options) {
                    if(!u.isValidSecret(value)) {
                        return helpers.error('jingtum.secret');
                    }
                }
            },
        }
    };
});

/*----------数据验证格式定义----------*/

// 已签名交易格式
const signedTxSchema = Joi.string().hex().required().id('signedTxSchema');

// 买单上传请求格式
const buyOrderReqSchema = Joi.object().keys({
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

// 卖单上传请求格式
const sellOrderReqSchema = Joi.object().keys({
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

// 写入匹配结果格式
const matchReqSchema = Joi.object().keys({
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
        Joi.array().min(minSubBuyOrderListLength * minLabelAmount).max(maxSubBuyOrderListLength * maxLabelAmount).items(
            Joi.object().keys({
                sellOrderId:
                    Joi.string().hex().required(),
                contractAddr:
                    jingtumCustom.jingtum().address().required(),
            }),
        ).required(),
    matchSystemAddr:
        jingtumCustom.jingtum().address().required(),
    contractAddr:
        jingtumCustom.jingtum().address().required(),
}).id('matchReqSchema');

// 买单监听格式
const buyOrderWatchSchema = delJoiKeys(buyOrderReqSchema, ['platformAddr', 'contractAddr']);

/*----------数据格式验证函数----------*/

// 已签名交易验证
export async function validateSignedTx(blob) {

    try {
        await signedTxSchema.validateAsync(blob);
    }
    catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        return [false, e];
    }

    return [true, 'valid req.'];

}

// 上传买单请求验证
export async function validateBuyOrderReq(body) {

    try {
        await buyOrderReqSchema.validateAsync(body);
    }
    catch(e) {
        console.log(e);
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        return [false, e];
    }

    return [true, 'valid req.'];
    
}

// 上传卖单请求验证
export async function validateSellOrderReq(body) {

    try {
        await sellOrderReqSchema.validateAsync(body);
    }
    catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        return [false, e];
    }

    return [true, 'valid req.'];
    
}

// 写入匹配结果验证
export async function validateMatchReq(body) {

    try {
        await matchReqSchema.validateAsync(body);
    }
    catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        return [false, e];
    }

    return [true, 'valid req.'];
    
}

// 买单监听验证
export async function validateBuyOrderWatch(data) {

    try {
        await buyOrderWatchSchema.validateAsync(data);
    }
    catch(e) {
        e.details.map((detail, index) => {
            console.log('error message ' + index + ':', detail.message);
        });
        return [false, e];
    }

    return [true, 'valid req.'];
    
}

function delJoiKeys(schema, props) {
    let newSchema = _.cloneDeep(schema);
    props.forEach(prop => {
        newSchema._ids._byKey.delete(prop);
        let l = newSchema['$_terms'].keys.length;
        for(let i = 0; i < l; i++) {
            if(newSchema['$_terms'].keys[i].key == prop) {
                newSchema['$_terms'].keys.splice(i, 1);
                break;
            }
        }
    });
    return newSchema;
}