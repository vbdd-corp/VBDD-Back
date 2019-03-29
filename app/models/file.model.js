const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

class BriModel extends BaseModel {
  constructor() {
    super('Bri', {
      id: Joi.number().required(),
      mail: Joi.string().required(),
      password: Joi.string().required(),
    });
  }
}

module.exports = new BriModel();
