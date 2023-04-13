const Joi = require('joi');

module.exports.notesSchema = Joi.object({
    title: Joi.string()
        .min(1)
        .max(25)
        .required(),
    note: Joi.string(),
})

module.exports.usersSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .required(),
    email: Joi.string()
        .email()
        .required(),
})
// we don't need the user part 'couz that will be take care by passport