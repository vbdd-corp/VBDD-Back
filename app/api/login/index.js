const { Router } = require('express');
const { Bri, Student } = require('../../models');

// const logger = require('../../utils/logger');

const router = new Router();

const getBriByLogin = function (mail, pwd) {
  return Bri.get().filter(
    bri => bri.mail === mail && bri.password === pwd,
  );
};

const getStudentByLogin = function (mail, pwd) {
  return Student.get().filter(
    student => student.mail.valueOf() === mail.valueOf()
      && student.password.valueOf() === pwd.valueOf(),
  );
};

/* const log = function (message) {
  logger.log(message);
}; */

router.get('/', (req, res) => res.status(200).json('ok login'));
router.post('/', (req, res) => {
  try {
    let user = getBriByLogin(req.body.mail.trim(), req.body.password.trim());
    if (user.length) { // if user is found in BRI base
      res.status(201).json({ bri: user, error: '' });
    } else {
      user = getStudentByLogin(req.body.mail.trim(), req.body.password.trim());
      if (user.length) { // if user is found in Student base
        res.status(201).json({ student: user, error: '' });
      } else {
        res.status(403).json({ error: 'Wrong password or login' });
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
