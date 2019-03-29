const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

// modèle servant a recevoir les données du post lors du login des utilisateurs
// est générique, represente user/password.

class UserModel extends BaseModel {
  constructor() {
    super('User', {
      id: Joi.number().required(),
      user: Joi.string().required(),
      password: Joi.string().required(),
    });
  }
}

module.exports = new UserModel();
