const { Router } = require('express');
const { Bri, Student } = require('../../models');

// const { STUDENT_MOCKS } = require('../../mocks/student.mocks');
// const { BRI_MOCKS } = require('../../mocks/bri.mocks.json')

const logger = require('../../utils/logger');

const router = new Router();

const getBRIByLoginAndPwd = function (mail, pwd) {
  const res = Bri.get().filter(
    bri => bri.mail === mail && bri.password === pwd,
  );
  logger.log('getBRIbyLoginAndPWd ==> ', res);
  return res;
};

const getStudentByLoginAndPwd = function (mail, pwd) {
  const res = Student.get().filter(
    student => student.mail.valueOf() === mail.valueOf()
      && student.password.valueOf() === pwd.valueOf(),
  );
  logger.log(`getStudentByLoginAndPwd ==> ${res}`);
  return res;
};

const log = function (message) {
  logger.log(message);
};

router.get('/', (req, res) => res.status(200).json('ok login'));
router.post('/', (req, res) => {
  // res.status(200).json('ok login post');
  log('plop');
  try {
    let resUser = getBRIByLoginAndPwd(req.body.mail.trim(), req.body.password.trim());
    // logger.info('resUser => ', resUser);
    if (resUser.length) {
      res.status(201).json(resUser);
    } else {
      resUser = getStudentByLoginAndPwd(req.body.mail.trim(), req.body.password.trim());
      if (resUser.length) {
        res.status(201).json(resUser);
      } else {
        res.status(403).json('Wrong password or login');
      }
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
