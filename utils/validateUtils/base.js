import jlib from 'jingtum-lib';
import Joi from 'joi';
import _ from 'lodash';

const u = jlib.utils;

/*----------数据常量----------*/

const minAuthPrice = 1;
const maxAuthPrice = 1000;
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

/*----------自定义验证类----------*/

// 交易授权信息验证
export const authCustom = Joi.extend((joi) => {

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
export const jingtumCustom = Joi.extend((joi) => {

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

/*----------工具类----------*/

export function delJoiKeys(schema, props) {
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