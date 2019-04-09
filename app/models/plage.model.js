const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

class Plage extends BaseModel {
  constructor() {
    super('Plage', {
      id: Joi.number().required(),
      start: Joi.date().format('HH:mm').required(),
      end: Joi.date().format('HH:mm').required(),
      date: Joi.date().format('DD/MM/YYYY'),
      appointmentTypeId: Joi.number(),
      BriId: Joi.number(),
    });
  }
}

module.exports = new Plage();
