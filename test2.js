import Joi from 'joi';

const Schema = Joi.string().hex();

let res = await Schema.validateAsync("ae");

console.log(res);