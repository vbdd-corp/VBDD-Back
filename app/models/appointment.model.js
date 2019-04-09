const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

class Appointment extends BaseModel {
  constructor() {
    super('Appointment', {
      id: Joi.number().required(),
      start: Joi.date().format('HH:mm').optional(),
      end: Joi.date().format('HH:mm').optional(),
      date: Joi.date().format('DD/MM/YYYY').optional(),
      time: Joi.number().required(),
      appointmentTypeId: Joi.number().required(),
      appointmentStatusId: Joi.number().required(),
      creneauId: Joi.number().required(),
      studentId: Joi.number().required(),
    });
  }
}

module.exports = new Appointment();
