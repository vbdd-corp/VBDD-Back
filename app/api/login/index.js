const { Router } = require('express');
// const { User } = require('../../model/user.model');
/*
const { BRI } = require('../../model/bri.model');
const { Student } = require('../../model/student.model');
*/
const router = new Router();
/*
const getBRIByLoginAndPwd = function (mail, pwd) {
  return BRI.get().filter(
    bri => bri.login.equals(mail) && bri.password.equals(pwd),
  );
};

const getStudentByLoginAndPwd = function (mail, pwd) {
  return Student.get().filter(
    student => student.login.equals(mail) && student.password.equals(pwd),
  );
}; */

router.get('/', (req, res) => res.status(200).json('ok login'));
/* router.post('/', (req, res) => {
  try {
    const user = User.create(req.body);
    // const BRI_MOCK;
    // const STUDENTS_MOCK;
    // res.status(201).json(ticket);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json(err.extra);
    } else {
      res.status(500).json(err);
    }
  }
}); */

module.exports = router;
