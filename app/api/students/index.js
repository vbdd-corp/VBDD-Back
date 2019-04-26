const { Router } = require('express');
const { Student, File } = require('../../models');

// const logger = require('../../utils/logger');
/* const log = function (message) {
  logger.log(message);
}; */

const router = new Router();


function getStudentByMajor(major) {
  return Student.get().filter(student => student.major === major);
}

function getStudentByName(name) {
  return Student.get().filter(
    student => student.firstName.includes(name) || student.lastName.includes(name),
  );
}

router.get('/', (req, res) => res.status(200).json(Student.get()));
router.get('/by-name/:studentName', (req, res) => res.status(200).json(getStudentByName(req.params.studentName)));
router.get('/by-major/:major', (req, res) => res.status(200).json(getStudentByMajor(req.params.major)));

router.get('/:studentID', (req, res) => {
  try {
    res.status(200).json(Student.getById(req.params.studentID));
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else {
      res.status(500).json(err);
    }
  }
});

/*
*   /api/students/by-fileTypeId/:fileTypeID
*   retourne la liste des étudiants qui possèdent au moins un dossier dont le
*   fileTypeId vaut :fileTypeID
* */
router.get('/by-fileTypeId/:fileTypeID', (req, res) => {
  const studentList = [];

  function studentExists(studentId) {
    return studentList.some(stud => stud.id === studentId);
  }

  try {
    File.get()
      .filter(file => file.fileTypeId === parseInt(req.params.fileTypeID, 10))
      .forEach((file) => {
        if (!studentExists(file.studentId)) {
          studentList.push(Student.getById(file.studentId));
        }
      });
    res.status(200).json(studentList);
  } catch (err) {
    res.status(500).json(err);
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
