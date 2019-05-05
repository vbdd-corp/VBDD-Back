const Joi = require('joi');
const { Router } = require('express');
const { Plage, Creneau, AppointmentType } = require('../../models');
const Time = require('../../models/time.model');
const logger = require('../../utils/logger');

function logThis(elt) {
  logger.log(`debug ==> ${elt}`);
}

const router = Router();

function getAppointmentTypeSafely(appointmentTypeId) {
  try {
    return AppointmentType.getById(appointmentTypeId);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      return null;
    }
    throw err;
  }
}

const attachAppointmentType = (plage) => {
  const newPlage = Object.assign({}, plage, {
    appointmentType: getAppointmentTypeSafely(plage.appointmentTypeId),
  });
  delete newPlage.appointmentTypeId;
  return newPlage;
};

const createCreneauxFromPlage = function (plage) {
  let startingTime = plage.start;
  let endingTime = Time.add30MinutesToTime(plage.start);
  while (Time.compare(plage.end, endingTime) >= 0) {
    try {
      Creneau.create({
        start: startingTime,
        end: endingTime,
        appointmentTypeId: plage.appointmentTypeId,
        statusId: 0,
        briId: plage.briId,
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

router.get('/', (req, res) => {
  try {
    res.status(200).json(Plage.get().map(attachAppointmentType));
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/status', (req, res) => {
  try {
    res.status(200).json({ msg: 'ok here :)' });
  } catch (err) {
    logThis(err);
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else {
      res.status(500).json(err);
    }
  }
});

/*
* GET /api/plage/between-dates
*   ?sYear=2019&sMonth=12&sDay=17&sHour=6&sMinute=44
*   &eYear=2019&eMonth=12&eDay=17&eHour=17&eMinute=44
*
* 9-4-2019  10H - 11H30
* 10-4-2019 11H - 11H30
* 9-4-2019  10H - 11H30
* */
router.get('/between-times', (req, res) => {
  try {
    const timeStart = {
      minute: parseInt(req.query.sMinute, 10),
      hour: parseInt(req.query.sHour, 10),
      day: parseInt(req.query.sDay, 10),
      month: parseInt(req.query.sMonth, 10),
      year: parseInt(req.query.sYear, 10),
    };
    Joi.validate(timeStart, Time.getScheme());
    const timeEnd = {
      minute: parseInt(req.query.eMinute, 10),
      hour: parseInt(req.query.eHour, 10),
      day: parseInt(req.query.eDay, 10),
      month: parseInt(req.query.eMonth, 10),
      year: parseInt(req.query.eYear, 10),
    };
    Joi.validate(timeEnd, Time.getScheme());
    const plageList = Plage.get()
      .filter(plage => (
        Time.compare(plage.start, timeStart) >= 0
        && Time.compare(plage.end, timeEnd) <= 0))
      .map(plage => attachAppointmentType(plage));

    res.status(200).json(plageList);
  } catch (err) {
    logThis(err);
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else {
      res.status(500).json(err);
    }
  }
});

router.get('/:plageId', (req, res) => {
  try {
    res.status(200).json(attachAppointmentType(Plage.getById(req.params.plageId)));
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

    res.status(201).json(attachAppointmentType(plage));
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json(err.extra);
    } else {
      res.status(500).json(err);
    }
  }
});

function deleteCreneau(creneau) {
  Creneau.delete(creneau.id);
}

function deleteCreneauxBetween(briId, timeA, timeB) {
  let start; let
    end;
  if (Time.compare(timeB, timeA) >= 0) {
    start = timeA;
    end = timeB;
  } else {
    start = timeB;
    end = timeA;
  }
  Creneau.get().filter(creneau => creneau.briId === briId
      && ((Time.compare(creneau.end, start) > 0 && Time.compare(creneau.end, end) <= 0)
        || (Time.compare(creneau.start, start) >= 0 && Time.compare(creneau.start, end) < 0)))
    .forEach(creneau => deleteCreneau(creneau));
}

// TODO: create creneaux accordingly to plage PUT
router.put('/:plageId', (req, res) => {
  try {
    const oldPlage = Plage.getById(req.params.plageId);
    const plage = Plage.update(req.params.plageId, req.body);

    if (Time.compare(plage.start, oldPlage.start) > 0) {
      deleteCreneauxBetween(plage.briId, oldPlage.start, plage.start);
    }
    if (Time.compare(oldPlage.end, plage.end) > 0) {
      deleteCreneauxBetween(plage.briId, plage.end, oldPlage.end);
    }

    res.status(200).json(attachAppointmentType(plage));
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

router.delete('/:plageId', (req, res) => {
  try {
    const plage = Plage.getById(req.params.plageId);
    Plage.delete(req.params.plageId);
    deleteCreneauxBetween(plage.briId, plage.start, plage.end);
    res.status(204).end();
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else {
      res.status(500).json(err);
    }
  }
});


module.exports = router;
