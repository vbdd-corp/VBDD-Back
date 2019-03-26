const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

// modèle servant a recevoir les données du post lors du login des utilisateurs
// est générique, represente user/password.
module.exports = new BaseModel('User', {
  id: Joi.number().required(),
  mail: Joi.string().required(),
  password: Joi.string().required(),
});
