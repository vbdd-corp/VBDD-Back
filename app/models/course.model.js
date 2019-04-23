const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

class CourseModel extends BaseModel {
  constructor() {
    super('Course', {
      id: Joi.number().required(),
      schoolId: Joi.number().required(),
      semester: Joi.string().required(),
      // semester number : 0 -> all year, 1 -> fall semester, 2 -> winter semester
      // we changed! we store fall, spring or full (all year)
      nameOrTitle: Joi.string().required(),
      unitCode: Joi.string().required(),
      ECTS: Joi.number().required(),
    });
  }
}

module.exports = new CourseModel();
