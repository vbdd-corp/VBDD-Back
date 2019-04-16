const { Router } = require('express');
const School = require('../../models');

const logger = require('../../utils/logger');

const logThis = function (message) {
  logger.log(message);
};
const router = new Router();

function getSchoolByNameSafely(name) {
  try {
    logThis(`School.get() == ${School.get()}`);
    return School.get().filter(
      school => school.name.match(`/${name}/i`) != null,
    );
  } catch (err) {
    if (err.name === 'NotFoundError') {
      return null;
    }
    throw err;
  }
}

router.get('/status', (req, res) => res.status(200).json({ ans: 'hello world JMD.' }));
router.get('/', (req, res) => {
  let schools;
  try {
    schools = School.get();
  } catch (err) {
    logThis(err);
  }
  res.status(200).json(schools);
});
router.get('/by-name/:schoolName', (req, res) => res.status(200).json(getSchoolByNameSafely(req.params.schoolName)));

module.exports = router;
