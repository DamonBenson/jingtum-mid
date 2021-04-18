import jlib from 'jingtum-lib';
import Joi from 'joi';
import _ from 'lodash';

const u = jlib.utils;

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