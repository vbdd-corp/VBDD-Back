const { Router } = require('express');
const { User } = require('../../model/user.model');

const { BRI } = require('../../model/bri.model');
const { Student } = require('../../model/student.model');
// const { STUDENT_MOCKS } = require('../../mocks/student.mocks');
// const { BRI_MOCKS } = require('../../mocks/bri.mocks.json')

const { logger } = require('../../utils/logger');

const router = new Router();

const getBRIByLoginAndPwd = function (mail, pwd) {
  return BRI.get().filter(
    bri => bri.login.equals(mail) && bri.password.equals(pwd),
  );
};

const getStudentByLoginAndPwd = function (mail, pwd) {
  return Student.get().filter(
    student => student.mail.equals(mail) && student.password.equals(pwd),
  );
};

router.get('/', (req, res) => res.status(200).json('ok login'));
router.post('/', (req, res) => {
  try {
    const user = User.create(req.body);
    let resUser = getBRIByLoginAndPwd(user.mail, user.password);
    logger.log('resUser => ', resUser);
    if (resUser.length) {
      res.status(201).json(resUser);
    } else {
      resUser = getStudentByLoginAndPwd(user.mail, user.password);
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
