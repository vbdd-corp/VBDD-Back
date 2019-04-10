const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

class CreneauStatus extends BaseModel {
  constructor() {
    super('CreneauStatus', {
      id: Joi.number().required(),
      name: Joi.string().required(),
    });
  }
}

module.exports = new CreneauStatus();
