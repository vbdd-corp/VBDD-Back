const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

class StudentModel extends BaseModel {
  constructor() {
    super('Student', {
      id: Joi.number().required(),
      mail: Joi.string().required(),
      password: Joi.string().required(),
      // major: Joi.string().allow('').optional(),
    });
  }
}
module.exports = new StudentModel();
