const Joi = require('joi');
// const BaseModel = require('../utils/base-model.js');
const UserModel = require('./user.model');


class StudentModel extends UserModel {
  constructor() {
    super('Student', {
      major: Joi.string().allow('').optional(),
    });
  }
}
module.exports = new StudentModel();
