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

const getStudentByMajor = function (major) {
  return Student.get().filter(student => student.major === major);
};

const getStudentByName = function (name) {
  return Student.get().filter(
    student => student.firstName.includes(name) || student.lastName.includes(name),
  );
};

router.get('/', (req, res) => res.status(200).json(Student.get()));
router.get('/by-name/:studentName', (req, res) => res.status(200).json(getStudentByName(req.params.studentName)));
router.get('/by-major/:major', (req, res) => res.status(200).json(getStudentByMajor(req.params.major)));

router.get('/:studentID', (req, res) => {
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

/* éventuellement faire méthode put */

/* ce post fonctionne mais l'id est rempli automatiquement par Node.JS
* probablement avec la date courante au lieu du plus petit id possible */

router.post('/', (req, res) => {
  try {
    const oneStud = Student.create(req.body);
    res.status(201).json(oneStud);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json(err.extra);
    } else {
      res.status(500).json(err);
    }
  }
});

module.exports = router;
