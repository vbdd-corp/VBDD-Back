// const Joi = require('joi');
// const BaseModel = require('../utils/base-model.js');
const UserModel = require('./user.model');


class BriModel extends UserModel {
  constructor() {
    super('BRI', {

    });
  }
}

module.exports = new BriModel();
