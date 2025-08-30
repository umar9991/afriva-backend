const Joi = require('joi');

exports.signupSchema = Joi.object({
    email: Joi.string()
    .min(6)
    .max(30)
    .email({ 
     tlds: { allow: ['com', 'net', 'org', 'in','edu' , 'pk'] } }),
    password: Joi.string()
    .min(8)  // Increased from 3 to 8 for security
    .max(50) 
    .required(),
    
    confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
        'any.only': 'Passwords must match'
    })
});

exports.signinSchema = Joi.object({
    email: Joi.string()
    .min(6)
    .max(30)
    .email({ 
     tlds: { allow: ['com', 'net', 'org', 'in', 'edu' , 'pk'] } }),
    password: Joi.string()
    .min(3)  
    .max(50) 
    .required()
});
