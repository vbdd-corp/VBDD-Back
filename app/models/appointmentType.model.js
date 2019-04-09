const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

class AppointmentType extends BaseModel {
  constructor() {
    super('AppointmentType', {
      id: Joi.number().required(),
      name: Joi.string().required(),
      avgTime: Joi.number().required(), // -1 for none
    });
  }
}

module.exports = new AppointmentType();
