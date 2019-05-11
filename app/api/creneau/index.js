const { Router } = require('express');
const { Creneau, AppointmentType } = require('../../models');
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

const attachAppointmentType = (creneau) => {
  const newCreneau = Object.assign({}, creneau, {
    appointmentType: getAppointmentTypeSafely(creneau.appointmentTypeId),
  });
  delete newCreneau.appointmentTypeId;
  return newCreneau;
};

router.get('/', (req, res) => res.status(200).json(Creneau.get()));

router.get('/by-bri/:briId', (req, res) => {
  try {
    const creneauList = Creneau.get()
      .filter(creneau => creneau.briId === parseInt(req.params.briId, 10))
      .map(creneau => attachAppointmentType(creneau));

    res.status(200).json(creneauList);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else {
      logThis(err);
      res.status(500).json(err);
    }
  }
});

module.exports = router;
