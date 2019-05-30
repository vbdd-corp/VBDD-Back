const email = require('emailjs/email');
const { Student, AppointmentType } = require('../models');

const server = email.server.connect({
  user: 'ps6briprojetpolytech',
  password: 'BRIPOLYTEST',
  host: 'smtp.gmail.com',
  ssl: true,
});

module.exports = class Mailer {
  static sendAppointmentCancelMessage(appointment) {
    const student = Student.getById(appointment.studentId);
    const appointmentType = AppointmentType.getById(appointment.appointmentTypeId);
    server.send({
      text: `\n
      Votre rendez-vous pour : ${appointmentType.name} , a été annulé !\n
      Veuillez reprendre rendez vous avec le bureau dans les horraires disponibles.\n
      \n
      BRI - Polyetch Nice-Sophia.`,
      from: '<ps6briprojetpolytech@gmail.com>',
      to: `someone <${student.mail}>`,
      subject: 'BRI - Rendez-vous annulé',
    }, (err, message) => {
      if (err) throw err;
      else if (message) return message;
      return '';
    });
  }
};

// , (err, message) => {
//       if (err) res.status(500).json(err);
//       else if (message) res.status(200).json(attachSchool(attachStudent(application)));
//     });
