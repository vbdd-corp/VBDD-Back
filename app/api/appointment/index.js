const { Router } = require('express');
const {
  Appointment, AppointmentType, AppointmentStatus, Creneau, Student,
} = require('../../models');
const logger = require('../../utils/logger');

function logThis(elt) {
  logger.log(`debug ==> ${elt}`);
}

const router = new Router();

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

function getAppointmentStatusSafely(appointmentStatusId) {
  try {
    return AppointmentStatus.getById(appointmentStatusId);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      return null;
    }
    throw err;
  }
}

function getAppointmentCreneauSafely(appointmentCreneau) {
  try {
    return Creneau.getById(appointmentCreneau);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      return null;
    }
    throw err;
  }
}

function getAppointmentStudentSafely(studentId) {
  try {
    return Student.getById(studentId);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      return null;
    }
    throw err;
  }
}

const attachAppointmentType = (appointment) => {
  const newAppointment = Object.assign({}, appointment, {
    appointmentType: getAppointmentTypeSafely(appointment.appointmentTypeId),
  });
  delete newAppointment.appointmentTypeId;
  return newAppointment;
};

const attachAppointmentStatus = (appointment) => {
  const newAppointment = Object.assign({}, appointment, {
    appointmentStatus: getAppointmentStatusSafely(appointment.appointmentStatusId),
  });
  delete newAppointment.appointmentStatusId;
  return newAppointment;
};

const attachAppointmentCreneau = (appointment) => {
  const newAppointment = Object.assign({}, appointment, {
    creneau: getAppointmentCreneauSafely(appointment.creneauId),
  });
  delete newAppointment.creneauId;
  return newAppointment;
};

const attachAppointmentStudent = (appointment) => {
  const newAppointment = Object.assign({}, appointment, {
    student: getAppointmentStudentSafely(appointment.studentId),
  });
  logThis('debug2');
  delete newAppointment.studentId;
  return newAppointment;
};

router.get('/status', (req, res) => res.status(200).json({ msg: 'ok :)' }));

router.get('/', (req, res) => {
  try {
    const resList = Appointment.get()
      .map(appointment => attachAppointmentType(appointment))
      .map(appointment => attachAppointmentStatus(appointment))
      .map(appointment => attachAppointmentCreneau(appointment))
      .map(appointment => attachAppointmentStudent(appointment));
    res.status(200).json(resList);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else {
      res.status(500).json(err);
    }
  }
});

router.get('/:appointmentID', (req, res) => {
  try {
    res.status(200).json(
      attachAppointmentStatus(
        attachAppointmentType(
          attachAppointmentCreneau(
            attachAppointmentStudent(
              Appointment.getById(req.params.appointmentID),
            ),
          ),
        ),
      ),
    );
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else {
      res.status(500).json(err);
    }
  }
});

router.get('/by-student/:StudentId', (req, res) => {
  try {
    const resList = Appointment.get()
      .filter(appointment => appointment.studentId === parseInt(req.params.StudentId, 10))
      .map(appointment => attachAppointmentType(appointment))
      .map(appointment => attachAppointmentStatus(appointment))
      .map(appointment => attachAppointmentCreneau(appointment))
      .map(appointment => attachAppointmentStudent(appointment));
    res.status(200).json(resList);
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
    const appointment = Appointment.createWithNextId(req.body);
    res.status(201).json(appointment);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json(err.extra);
    } else {
      res.status(500).json(err);
    }
  }
});

module.exports = router;
