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

function createCreneauxBetween(briId, appointmentTypeId, timeA, timeB) {
  let start; let end;
  if (Time.compare(timeB, timeA) >= 0) {
    start = timeA;
    end = timeB;
  } else {
    start = timeB;
    end = timeA;
  }

  let endingTime = Time.add30MinutesToTime(start);
  while (Time.compare(end, endingTime) >= 0) {
    try {
      Creneau.createWithNextId({
        start,
        end: endingTime,
        appointmentTypeId,
        statusId: 0,
        briId,
      });
    } catch (err) {
      if (err.name === 'ValidationError') {
        console.log(err.extra);
      } else {
        console.log(err);
      }
      throw err;
    }
    start = endingTime;
    endingTime = Time.add30MinutesToTime(endingTime);
  }

  // if there is less than 30 minute left create a smaller creneau at the end
  if (Time.compare(start, end) < 0) {
    try {
      Creneau.createWithNextId({
        start,
        end,
        appointmentTypeId,
        statusId: 0,
        briId,
      });
    } catch (err) {
      if (err.name === 'ValidationError') {
        console.log(err.extra);
      } else {
        console.log(err);
      }
      throw err;
    }
  }
}

const createCreneauxFromPlage = function (plage) {
  createCreneauxBetween(plage.briId, plage.appointmentTypeId, plage.start, plage.end);
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

router.get('/by-bri/:briId', (req, res) => {
  try {
    const plageList = Plage.get()
      .filter(plage => plage.briId === parseInt(req.params.briId, 10))
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
    const plage = Plage.createWithNextId(req.body);
    logThis('plop');
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

function changeTimeCreneau(creneau, start, end) {
  Creneau.update(creneau.id, { start, end });
}

function deleteCreneauxBetween(briId, timeA, timeB) {
  let start; let end;
  if (Time.compare(timeB, timeA) >= 0) {
    start = timeA;
    end = timeB;
  } else {
    start = timeB;
    end = timeA;
  }
  Creneau.get().filter(creneau => (creneau.briId === briId)
      && ((Time.compare(creneau.end, start) > 0 && Time.compare(creneau.end, end) <= 0)
        || (Time.compare(creneau.start, start) >= 0 && Time.compare(creneau.start, end) < 0)))
    .forEach(creneau => deleteCreneau(creneau));
}

function putAndDeleteCreneauxBetween(briId, timeA, timeB) {
  let start; let end;
  if (Time.compare(timeB, timeA) >= 0) {
    start = timeA;
    end = timeB;
  } else {
    start = timeB;
    end = timeA;
  }
  Creneau.get().filter(creneau => (creneau.briId === briId)
    && (Time.compare(creneau.start, end) < 0) && (Time.compare(creneau.end, start) > 0))
    .forEach((creneau) => {
      if (Time.compare(creneau.end, end) <= 0 && Time.compare(creneau.start, start) >= 0) {
        deleteCreneau(creneau);
        return;
      }
      if (Time.compare(creneau.end, end) > 0) {
        changeTimeCreneau(creneau, end, creneau.end);
        return;
      }
      if (Time.compare(creneau.start, start) < 0) {
        changeTimeCreneau(creneau, creneau.start, start);
      }
    });
}

function changeAppointmentTypeCreneauxBetween(appointmentTypeId, briId, timeA, timeB) {
  let start; let end;
  if (Time.compare(timeB, timeA) >= 0) {
    start = timeA;
    end = timeB;
  } else {
    start = timeB;
    end = timeA;
  }
  Creneau.get().filter(creneau => (creneau.briId === briId)
    && ((Time.compare(creneau.end, start) > 0 && Time.compare(creneau.end, end) <= 0)
      || (Time.compare(creneau.start, start) >= 0 && Time.compare(creneau.start, end) < 0)))
    .forEach((creneau) => {
      logThis(`${creneau.start.hour} : ${creneau.start.minute}`);
      Creneau.update(creneau.id, { appointmentTypeId });
    });
}

router.put('/:plageId', (req, res) => {
  try {
    const oldPlage = Plage.getById(req.params.plageId);
    const plage = Plage.update(req.params.plageId, req.body);

    changeAppointmentTypeCreneauxBetween(plage.appointmentTypeId,
      plage.briId, plage.start, plage.end);

    if (Time.compare(plage.start, oldPlage.start) > 0) {
      try {
        putAndDeleteCreneauxBetween(plage.briId, oldPlage.start, plage.start);
      } catch (err) {
        logThis('404 not found error during putAndDeleteCreneauxBetween !');
      }
    } else if (Time.compare(plage.start, oldPlage.start) < 0) {
      createCreneauxBetween(plage.bri, plage.appointmentTypeId, plage.start, oldPlage.start);
    }
    if (Time.compare(oldPlage.end, plage.end) > 0) {
      try {
        putAndDeleteCreneauxBetween(plage.briId, plage.end, oldPlage.end);
      } catch (err) {
        logThis('404 not found error during putAndDeleteCreneauxBetween !');
      }
    } else if (Time.compare(oldPlage.end, plage.end) < 0) {
      createCreneauxBetween(plage.briId, plage.appointmentTypeId, oldPlage.end, plage.end);
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

    // TODO: find why deleteCreneauxBetween send a 404 error not found and del try-catch
    // base model delete creneau sending errors on some creneau
    // but they're deleted anyway and existed before
    try {
      deleteCreneauxBetween(plage.briId, plage.start, plage.end);
    } catch (err) {
      logThis('404 not found error during deleteCreneauxBetween !');
    }
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
