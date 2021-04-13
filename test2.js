import Joi from 'joi';

const schema = Joi.object({
    a: [Joi.string(), Joi.number()],
    b: Joi.link('#type.a')
}).id('type');



let res = await schema.validateAsync({
    a: 'a',
    b: [1],
});
console.log(res);