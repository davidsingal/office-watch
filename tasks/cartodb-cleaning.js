'use strict';

const path = require('path');
const fs = require('fs');
const http = require('http');
const handlebars = require('handlebars');
const mailer = require('./lib/mailer');
const logger = require('./lib/logger');
const currentGroup = require('./lib/weekly-group');

const tplPath = path.join(__dirname, 'templates/clean.handlebars');
const query = `SELECT cartodb_id AS id, Nombre AS name, Correo AS address, Grupo AS _group
  FROM ${process.env.CARTODB_TABLENAME}`;
const requestConfig = {
  host: `${process.env.CARTODB_USERNAME}.cartodb.com`,
  path: `/api/v2/sql?q=${encodeURIComponent(query)}`
};

logger('info', 'Runinng cleaning task...');

function callback(response) {
  let str = '';

  // Another chunk of data has been recieved,
  // so append it to `str`
  response.on('data', chunk => str += chunk);

  // The whole response has been recieved,
  // so we just print it out here
  response.on('end', () => {
    const people = JSON.parse(str).rows;
    const currentTurn = currentGroup(people);

    fs.readFile(tplPath, 'utf8', (err, tpl) => {
      if (err) {
        logger('error', err);
      }
      const mailTemplate = handlebars.compile(tpl);
      mailer({
        from: process.env.SPARKPOST_FROM_EMAIL,
        subject: 'Cleaning time',
        content: mailTemplate({team: currentTurn}),
        recipients: people
      });
    });
  });
}

http.request(requestConfig, callback).end();
