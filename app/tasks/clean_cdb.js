'use strict';

require('dotenv').load({ silent: true });

var fs = require('fs');
var _ = require('underscore');
var moment = require('moment');
var http = require('http');
var schedule = require('node-schedule');
var mailer = require('../lib/mailer');
var handlebars = require('handlebars');

var weeksInYear = moment({ month: 11, day: 31 }).isoWeeks();
var currentWeek = moment().week();

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

// Getting team and groups: name, email and _group is required
var http = require('http');
var query = 'SELECT cartodb_id AS id, name, email, _group' +
  ' FROM cartodb_madrid_office' +
  ' WHERE office=\'Madrid\' AND _group IS NOT NULL';
var options = {
  host: process.env.CARTODB_USERNAME + '.cartodb.com',
  path: '/api/v2/sql?q=' + encodeURIComponent(query)
};
var callback = function(response) {
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    var team = JSON.parse(str).rows;
    var groups = groupBy(team, function(g) {
      return g._group;
    });
    var groupsLen = groups.length;
    var turns = [];
    var c = 0;

    // Assign a gruop to each week of year
    for (var w = weeksInYear; w--;) {
      c = c + 1;
      if (c === groupsLen) {
        c = 0;
      }
      turns.push(groups[c]);
    }

    // Turn of this week
    var currentTurn = turns[currentWeek];
    var recipients = _.map(team, function(t) {
      return { email: t.email, name: t.name, type: 'to' };
    });
    var tplPath = process.cwd() + '/app/templates/clean.handlebars';

    fs.readFile(tplPath, 'utf8', function(err, tpl) {
      var mailTemplate = handlebars.compile(tpl);

      // All mondays at 09:00 00 09 * * 1
      schedule.scheduleJob('00 09 * * 1', function() {
        var message = { html: mailTemplate({ team: currentTurn }) };
        mailer('Cleaning time', message, recipients);
        console.log('Mail sent!');
      });
    });

  });

};

// send request to get groups
http.request(options, callback).end();
