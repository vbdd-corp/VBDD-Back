const { Router } = require('express');
const { Student } = require('../../models');

// const logger = require('../../utils/logger');

const router = new Router();

/* const log = function (message) {
  logger.log(message);
}; */

const getStudentById = function (studentId) {
  return Student.getById(studentId);
};

router.get('/', (req, res) => res.status(200).json(Student.get()));
router.get('/by-name/:studentName', (req, res) => res.status(200).json('WIP'));

router.get('/by-id/:studentID', (req, res) => {
  try {
    res.status(200).json(getStudentById(req.params.studentID));
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else {
      res.status(500).json(err);
    }
  }
});


module.exports = router;
