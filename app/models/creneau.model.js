const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

class Creneau extends BaseModel {
  constructor() {
    super('Creneau', {
      id: Joi.number().required(),
      start: Joi.date().required(),
      end: Joi.date().required(),
      appointmentTypeId: Joi.number().required(),
      statusId: Joi.number().required(),
    });
  }
}

module.exports = new Creneau();
