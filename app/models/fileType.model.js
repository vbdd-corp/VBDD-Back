const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

class FileTypeModel extends BaseModel {
  constructor() {
    super('File', {
      id: Joi.number().required(),
      typeName: Joi.string().required(),
    });
  }
}

module.exports = new FileTypeModel();
