'use strict';

require('dotenv').load({ silent: true });

var fs = require('fs');
var _ = require('underscore');
var moment = require('moment');
var http = require('http');
var schedule = require('node-schedule');
var mailer = require('../lib/mailer');
var handlebars = require('handlebars');

// Getting team and groups: name, email and _group is required
var http = require('http');
var query = 'SELECT cartodb_id AS id, name, email, birthday' +
  ' FROM ' + process.env.CARTODB_TABLENAME;
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
    var today = moment();
    var birthdays = [];

    // Getting birthdays
    _.each(team, function(t) {
      var birth = moment(t.birthday);
      if (birth.date() === today.date() &&
        birth.month() === today.month()) {
        t.age = today.year() - birth.year();
        birthdays.push(t);
      }
    });

    if (birthdays.length) {
      var recipients = _.map(team, function(t) {
        return { email: t.email, name: t.name, type: 'to' };
      });

      var tplPath = process.cwd() + '/app/templates/birthdays.handlebars';

      fs.readFile(tplPath, 'utf8', function(err, tpl) {
        var mailTemplate = handlebars.compile(tpl);
        var message = { html: mailTemplate({ team: birthdays }) };
        mailer('Happy birthday!', message, recipients);
        console.log('Mail sent!');
      });
    }
  });
};

// Schedule job: all mondays at 09:00 00 09 * * 1
schedule.scheduleJob('00 09 * * *', function() {
  // send request to get groups
  http.request(options, callback).end();
});

