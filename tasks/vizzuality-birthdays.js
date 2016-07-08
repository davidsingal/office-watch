'use strict';

const path = require('path');
const fs = require('fs');
const http = require('http');
const handlebars = require('handlebars');
const mailer = require('./lib/mailer');
const logger = require('./lib/logger');
const birthdays = require('./lib/birthdays');

const tplPath = './templates/birthdays.handlebars';
const query = 'SELECT cartodb_id AS id, name, email AS address, birthday ' +
  'FROM ' + process.env.VIZZUALITY_TABLENAME + ' WHERE birthday IS NOT NULL';
const requestConfig = {
  host: process.env.VIZZUALITY_USERNAME + '.cartodb.com',
  path: '/api/v2/sql?q=' + encodeURIComponent(query)
};

logger('info', 'Runinng birthday task...');

function callback(response) {
  let str = '';

  // Another chunk of data has been recieved,
  // so append it to `str`
  response.on('data', chunk => str += chunk);

  // The whole response has been recieved,
  // so we just print it out here
  response.on('end', () => {
    const people = JSON.parse(str).rows;
    const result = birthdays(people);

    // Only if there are birthdays
    if (result.length) {
      fs.readFile(tplPath, 'utf8', (err, tpl) => {
        if (err) {
          logger('error', err);
        }
        const mailTemplate = handlebars.compile(tpl);
        mailer({
          from: process.env.SPARKPOST_FROM_EMAIL,
          subject: 'Happy birthday!',
          content: mailTemplate({team: result}),
          recipients: birthdays
        });
      });
    }
  });
}

http.request(requestConfig, callback).end();
