import Joi from 'joi';

const custom = Joi.extend((joi) => {

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
                    for(key in value) {
                        if(
                            !value[key].hasOwnProperty('authorizationChannel') ||
                            !value[key].hasOwnProperty('authorizationArea') ||
                            !value[key].hasOwnProperty('authorizationTime')
                        ) {
                            return helpers.error('authType.nonexist', {});
                        }
                        else {
                            if(
                                !Number.isInteger(value[key].authorizationChannel) ||
                                !Number.isInteger(value[key].authorizationArea) ||
                                !Number.isInteger(value[key].authorizationTime)
                            ) {
                                return helpers.error('authType.dataType', {});
                            }
                            else {
                                if(
                                    !(0 <= value[key].authorizationChannel <= authChannelAmount[Number(key)]) ||
                                    !(0 <= value[key].authorizationArea <= authAreaAmount[Number(key)]) ||
                                    !(0 <= value[key].authorizationArea <= authTimeAmount[Number(key)])
                                ) {
                                    return helpers.error('authType.overflow', {});
                                }
                            }
                        }
                    }
                }
            },
        }
    };
    
});

const schema = custom.authType()


let res = await schema.validateAsync({
    firstName: 'a',
    lastName: 'a',
    children: [
        {
            firstName: 'a',
            lastName: 'a',
        },
    ]
});
console.log(res);