const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

class SchoolModel extends BaseModel {
  constructor() {
    super('School', {
      id: Joi.number().required(),
      city: Joi.string().required(),
      country: Joi.string().required(),
      name: Joi.string().required(),
    });
  }
}

module.exports = new SchoolModel();
