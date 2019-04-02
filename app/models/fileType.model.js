const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

class FileTypeModel extends BaseModel {
  constructor() {
    super('FileType', {
      id: Joi.number().required(),
      typeName: Joi.string().required(),
      moduleTypeList: Joi.array().items(Joi.number()).required(),
      /* liste de moduleTypeIds */
    });
  }
}

module.exports = new FileTypeModel();
