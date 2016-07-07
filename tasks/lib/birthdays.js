'use strict';

const logger = require('./logger');

/**
 * Function to get birthdays in people data
 * @param  {Array} people [{birthday: '1988-04-19'}]
 * @return {Array}
 */
module.exports = function(people) {
  // Checking if people exist
  if (!people || !people.length) {
    return logger('error', '"people" params is undefined or empty.');
  }

  const today = new Date();
  const result = [];

  for (let i = people.length - 1; i >= 0; i--) {
    const birthday = new Date(people[i].birthday);
    const age = today.getYear() - birthday.getYear();
    if (birthday.getDate() === today.getDate() &&
        birthday.getMonth() === today.getMonth()) {
      people[i].age = age >= 35 ? age - 10 : age;
      result.push(people[i]);
    }
  }

  if (result.length) {
    logger('info', 'There are birthdays today!!! :)');
  } else {
    logger('info', 'There aren\'t birthdays today.');
  }

  return result;
};
