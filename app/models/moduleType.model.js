const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

class ModuleTypeModel extends BaseModel {
  constructor() {
    super('ModuleType', {
      id: Joi.number().required(),
      typeName: Joi.string().required(),
      infos: Joi.object().required(),
    });
  }
}

module.exports = new ModuleTypeModel();
