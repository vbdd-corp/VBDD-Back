const { Router } = require('express');
const { File, Student } = require('../../models');
// const logger = require('../../utils/logger');

const router = new Router();

function getStudentSafely(studentId) {
  try {
    return Student.getById(studentId);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      return null;
    }
    throw err;
  }
}

/* function log_this(elt) {
  logger.log(`debug ==> ${elt}`);
} */

const attachStudents = (file) => {
  const resFile = Object.assign({}, file, {
    students: getStudentSafely(file.studentId),
  });
  delete resFile.studentId;
  return resFile;
};

router.get('/:fileID', (req, res) => {
  try {
    /* let temp = File.getById(req.params.fileID);
    log_this(temp.moduleIds);
    let attach = attachStudents(temp);
    log_this(attach);
    log_this(getStudentSafely(2).lastName); */
    const reqFile = attachStudents(File.getById(req.params.fileID));
    res.status(200).json(reqFile);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else {
      res.status(500).json(err);
    }
  }
});

module.exports = router;
