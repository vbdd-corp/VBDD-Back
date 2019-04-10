const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');
const Time = require('./time.model.js');

class Appointment extends BaseModel {
  constructor() {
    super('Appointment', {
      id: Joi.number().required(),
      start: Time.getScheme(),
      end: Time.getScheme(),
      time: Joi.number().required(),
      appointmentTypeId: Joi.number().min(0).required(), // -1 for all
      appointmentStatusId: Joi.number().required(),
      creneauId: Joi.number().required(),
      studentId: Joi.number().required(),
    });
  }
}

module.exports = new Appointment();
