const Joi = require('joi');

class Time {
  static getScheme() {
    return Joi.object().keys({
      minute: Joi.number().integer().min(0).max(59),
      hour: Joi.number().integer().min(0).max(23),
      day: Joi.number().integer().min(1).max(31),
      month: Joi.number().integer().min(1).max(12),
      year: Joi.number().integer(),
    });
  }

  // return a copy, doesn't add to the time itself !!!
  static add30MinutesToTime(time) {
    return this.addNMinutesToTime(30, time);
  }

  // return a copy, doesn't add to the time itself !!!
  static addNMinutesToTime(n, time) { // only works with n =< 60, not passing new days.
    return {
      hour: time.hour + ((time.minute + n) >= 60 ? 1 : 0),
      minute: (time.minute + n) % 60,
      day: time.day,
      month: time.month,
      year: time.year,
    };
  }

  // return 1 if A > B, 0 if A == B, -1 if A < B
  static compareByHoursAndMinutes(timeA, timeB) {
    if (timeA.hour > timeB.hour) {
      return 1;
    }
    if (timeA.hour === timeB.hour) {
      return this.compareByMinutes(timeA, timeB);
    }

    return -1;
  }

  // return 1 if A > B, 0 if A == B, -1 if A < B
  static compareByMinutes(timeA, timeB) {
    if (timeA.minute > timeB.minute) {
      return 1;
    }
    if (timeA.minute === timeB.minute) {
      return 0;
    }

    return -1;
  }

  // return 1 if A > B, 0 if A == B, -1 if A < B
  static compare(timeA, timeB) {
    if (timeA.year > timeB.year) {
      return 1;
    }
    if (timeA.year < timeB.year) {
      return -1;
    }
    if (timeA.month > timeB.month) {
      return 1;
    }
    if (timeA.month < timeB.month) {
      return -1;
    }
    if (timeA.day > timeB.day) {
      return 1;
    }
    if (timeA.day < timeB.day) {
      return -1;
    }
    if (timeA.hour > timeB.hour) {
      return 1;
    }
    if (timeA.hour < timeB.hour) {
      return -1;
    }
    if (timeA.minute > timeB.minute) {
      return 1;
    }
    if (timeA.minute < timeB.minute) {
      return -1;
    }
    return 0;
  }
}


module.exports = Time;
