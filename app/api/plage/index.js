const { Router } = require('express');
const { Plage, Creneau } = require('../../models');
const Time = require('../../models/time.model');

const router = Router();

const createCreneauxFromPlage = function (plage) {
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

router.get('/:plageId', (req, res) => {
  try {
    res.status(200).json(Plage.getById(req.params.plageId));
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else {
      res.status(500).json(err);
    }
  }
});

router.post('/', (req, res) => {
  try {
    const plage = Plage.create(req.body);
    createCreneauxFromPlage(plage);

    res.status(201).json(plage);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json(err.extra);
    } else {
      res.status(500).json(err);
    }
  }
});

// TODO : change creaneau accordingly to plage put
router.put('/:plageId', (req, res) => {
  try {
    res.status(200).json(Plage.update(req.params.plageId, req.body));
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else if (err.name === 'ValidationError') {
      res.status(400).json(err.extra);
    } else {
      res.status(500).json(err);
    }
  }
});

module.exports = router;
