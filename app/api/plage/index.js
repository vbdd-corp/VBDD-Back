const { Router } = require('express');
const { Plage, Creneau } = require('../../models');
const Time = require('../../models/time.model');

const router = Router();

const createModulesFromPlage = function (plage) {
  let startingTime = plage.start;
  let endingTime = Time.add30MinutesToTime(plage.start);
  while (Time.compareByHoursAndMinutes(plage.end, endingTime) >= 0) {
    try {
      Creneau.create({
        start: startingTime,
        end: endingTime,
        appointmentTypeId: plage.appointmentTypeId,
        statusId: 0,
      });
    } catch (err) {
      if (err.name === 'ValidationError') {
        console.log(err.extra);
      } else {
        console.log(err);
      }
      throw err;
    }
    startingTime = endingTime;
    endingTime = Time.add30MinutesToTime(endingTime);
  }
};

router.get('/', (req, res) => res.status(200).json(Plage.get()));

router.post('/', (req, res) => {
  try {
    const plage = Plage.create(req.body);
    createModulesFromPlage(plage);

    res.status(201).json(plage);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json(err.extra);
    } else {
      res.status(500).json(err);
    }
  }
});


module.exports = router;
