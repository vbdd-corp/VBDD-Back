const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

class Plage extends BaseModel {
  constructor() {
    super('Plage', {
      id: Joi.number().required(),
      start: Joi.date().required(),
      end: Joi.date().required(),
      appointmentTypeId: Joi.number(),
      BriId: Joi.number(),
    });
  }
}

module.exports = new Plage();
