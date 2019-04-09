const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

class AppointmentStatus extends BaseModel {
  constructor() {
    super('AppointmentStatus', {
      id: Joi.number().required(),
      name: Joi.string().required(),
    });
  }
}

module.exports = new AppointmentStatus();
