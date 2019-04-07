const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

class CourseModel extends BaseModel {
  constructor() {
    super('Course', {
      id: Joi.number().required(),
      schoolId: Joi.number().required(),
      semester: Joi.number().required(),
      // semester number : 0 -> all year, 1 -> fall semester, 2 -> winter semester
      nameOrTitle: Joi.string().required(),
      unitCode: Joi.string().required(),
      ECTS: Joi.number().required(),
    });
  }
}

module.exports = new CourseModel();
