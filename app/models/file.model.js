const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

class FileModel extends BaseModel {
  constructor() {
    super('File', {
      id: Joi.number().required(),
      name: Joi.string().required(),
      studentId: Joi.number().required(),
      moduleIds: Joi.array().items(Joi.number()).required(),
      fileTypeId: Joi.number().required(),
      isValidated: Joi.boolean().required(),
    });
  }
}

module.exports = new FileModel();
