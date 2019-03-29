const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

class FileModel extends BaseModel {
  constructor() {
    super('File', {
      id: Joi.number().required(),
      studentId: Joi.number().required(),
      moduleIds: Joi.array().items(Joi.number()).required(),
      fileTypeId: Joi.numver().required(),
    });
  }
}

module.exports = new FileModel();
