const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

class StudentModel extends BaseModel {
  constructor() {
    super('Student', {
      id: Joi.number().required(),
      mail: Joi.string().required(),
      password: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      major: Joi.string(), // allow us to know which diploma is being prepared
      gender: Joi.string(),
      nationality: Joi.string(),
      residencePermitExpirationDate: Joi.date(),
      birthDate: Joi.string(),
      INE: Joi.string(),
      studentNumber: Joi.string(),
      address: Joi.string(),
      city: Joi.string(),
      postalCode: Joi.string(),
      mobilePhoneNumber: Joi.string(),
      phoneNumber: Joi.string(),
    });
  }
}
module.exports = new StudentModel();
