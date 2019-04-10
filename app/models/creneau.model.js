const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');
const Time = require('./time.model.js');

class Creneau extends BaseModel {
  constructor() {
    super('Creneau', {
      id: Joi.number().required(),
      start: Time.getScheme(),
      end: Time.getScheme(),
      appointmentTypeId: Joi.number().required(), // -1 for all
      statusId: Joi.number().required(),
    });
  }
}

module.exports = new Creneau();
