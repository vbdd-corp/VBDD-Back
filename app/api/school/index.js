const { Router } = require('express');
const { School } = require('../../models');

// const logger = require('../../utils/logger');

/* const logThis = function (message) {
  logger.log(message);
}; */
const router = new Router();

function getSchoolByPartialNameSafely(name) {
  try {
    const array = [];
    School.get().filter(
      school => school.name.toLowerCase().includes(name.toLowerCase()),
    ).forEach((school) => { array.push(school); });
    return array;
  } catch (err) {
    if (err.name === 'NotFoundError') {
      return null;
    }
    throw err;
  }
}

function getSchoolByExactNameSafely(name) {
  //  split two strings in 2 arrays of strings,
  //  compare the substrings one by one.
  try {
    const array = [];
    School.get().filter(
      school => school.name.toLowerCase() === name.toLowerCase(),
    ).forEach((school) => {
      array.push(school);
    });
    return array;
  } catch (err) {
    if (err.name === 'NotFoundError') {
      return null;
    }
    throw err;
  }
}

router.get('/status', (req, res) => res.status(200).json({ ans: 'hello world JMD.' }));
router.get('/', (req, res) => res.status(200).json(School.get()));

/*
* POST /api/school.by-name
* envoyer un json { "schoolName": "Example Tech School"}
* retourne un array avec les schools ayant un nom contenant schoolName,
* sinon retourne un array vide.
* */
router.post('/get-by-name', (req, res) => {
  if (typeof req.body.schoolName === 'undefined' || req.body.schoolName.length === 0) {
    res.status(403).json({ error: 'req.body.schoolName is empty.' });
  }
  res.status(200).json(getSchoolByPartialNameSafely(req.body.schoolName));
});

function myPost(schoolJSONObject) {
  if (
    schoolJSONObject.name !== undefined
    && getSchoolByExactNameSafely(schoolJSONObject.name).length === 0
  ) {
    const schoolIdMax = School.get().reduce((max, p) => (p.id > max ? p.id : max), 0);
    return School.createWithGivenId(schoolJSONObject, schoolIdMax + 1);
  }
  return null;
}

router.post('/', (req, res) => {
  try {
    const oneSchool = myPost(req.body);
    if (oneSchool) {
      res.status(201).json(oneSchool);
    } else { // length > 0 i.e. school already exists in mock
      res.status(403).json({ error: `school with name ${req.body.name} already exists in mocks.` });
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json(err.extra);
    } else {
      res.status(500).json(err);
    }
  }
});

module.exports = router;
