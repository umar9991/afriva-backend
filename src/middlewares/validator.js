const Joi = require('joi');

exports.signupSchema = Joi.object({
    email: Joi.string()
    .min(6)
    .max(30)
    .email({ 
     tlds: { allow: ['com', 'net', 'org', 'in','edu' , 'pk'] } }),
    password: Joi.string()
    .min(8).required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    
});

exports.signinSchema = Joi.object({
    email: Joi.string()
    .min(6)
    .max(30)
    .email({ 
     tlds: { allow: ['com', 'net', 'org', 'in', 'edu' , 'pk'] } }),
    password: Joi.string()
    .min(8).required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    
});
