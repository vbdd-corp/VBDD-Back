const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');
const Time = require('./time.model.js');

class Plage extends BaseModel {
  constructor() {
    super('Plage', {
      id: Joi.number().required(),
      start: Time.getScheme(),
      end: Time.getScheme(),
      appointmentTypeId: Joi.number(), // -1 for all
      briId: Joi.number(),
    });
  }
}

module.exports = new Plage();
