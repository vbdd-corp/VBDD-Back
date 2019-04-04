const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

class ModuleModel extends BaseModel {
  constructor() {
    super('Module', {
      id: Joi.number().required(),
      typeModuleId: Joi.number().required(),
      infos: Joi.object(),
    });
  }
}

module.exports = new ModuleModel();
