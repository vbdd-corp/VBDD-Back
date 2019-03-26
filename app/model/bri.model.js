const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

module.exports = new BaseModel('Bri', {
  id: Joi.number().required(),
  login: Joi.string().required(),
  password: Joi.string().required()
});
