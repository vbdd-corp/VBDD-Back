const Joi = require('joi');

class Time {
  static getScheme() {
    return Joi.object().keys({
      minutes: Joi.number().integer().min(0).max(59),
      hours: Joi.number().integer().min(0).max(23),
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
      hours: time.hours + ((time.minutes + n) >= 60 ? 1 : 0),
      minutes: (time.minutes + n) % 60,
      day: time.day,
      month: time.month,
      year: time.year,
    };
  }

  // return 1 if A > B, 0 if A == B, -1 if A < B
  static compareByHoursAndMinutes(timeA, timeB) {
    if (timeA.hours > timeB.hours) {
      return 1;
    }
    if (timeA.hours === timeB.hours) {
      return this.compareByMinutes(timeA, timeB);
    }

    return -1;
  }

  // return 1 if A > B, 0 if A == B, -1 if A < B
  static compareByMinutes(timeA, timeB) {
    if (timeA.minutes > timeB.minutes) {
      return 1;
    }
    if (timeA.minutes === timeB.minutes) {
      return 0;
    }

    return -1;
  }
}


module.exports = Time;
