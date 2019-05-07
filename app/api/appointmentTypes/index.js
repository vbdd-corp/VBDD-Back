const { Router } = require('express');
const { AppointmentType } = require('../../models');

const router = new Router();


router.get('/', (req, res) => {
  try {
    res.status(200).json(AppointmentType.get());
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
