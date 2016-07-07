'use strict';

const logger = require('./logger');
const moment = require('moment');

function groupBy(array, f) {
  var groups = {};
  array.forEach(function(o) {
    var group = JSON.stringify(f(o));
    groups[group] = groups[group] || [];
    groups[group].push(o);
  });
  return Object.keys(groups).map(function(group) {
    return groups[group];
  });
}

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

  const weeksInYear = moment({ month: 11, day: 31 }).isoWeeks();
  const currentWeek = moment().week();
  const groups = groupBy(people, function(g) {
    return g._group;
  });
  const groupsLen = groups.length;
  const result = [];

  let c = 0;

  // Assign a group to each week of year
  for (let w = weeksInYear; w--;) {
    c = c + 1;
    if (c === groupsLen) {
      c = 0;
    }
    result.push(groups[c]);
  }

  logger('info', 'Current group created.');

  return result[currentWeek];
};
