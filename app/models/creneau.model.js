const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

class Creneau extends BaseModel {
  constructor() {
    super('Creneau', {
      id: Joi.number().required(),
      start: Joi.date().format('HH:mm').required(),
      end: Joi.date().format('HH:mm').required(),
      date: Joi.date().format('DD/MM/YYYY'),
      appointmentTypeId: Joi.number().required(),
      statusId: Joi.number().required(),
    });
  }
}

module.exports = new Creneau();
