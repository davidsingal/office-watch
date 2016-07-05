'use strict';

import path from 'path';
import fs from 'fs';
import http from 'http';
import dotenv from 'dotenv';
import handlebars from 'handlebars';
import mailer from '../lib/sparkpost-mailer';

// At beginning, load environment variables
dotenv.load({silent: true});

const tplPath = path.join(process.cwd(), '/app/templates/birthdays.handlebars');
const query = `SELECT cartodb_id AS id, name, email AS address, birthday
  FROM ${process.env.VIZZUALITY_TABLENAME}`;
const requestConfig = {
  host: `${process.env.VIZZUALITY_USERNAME}.cartodb.com`,
  path: `/api/v2/sql?q=${encodeURIComponent(query)}`
};

function callback(response) {
  let str = '';

  // Another chunk of data has been recieved,
  // so append it to `str`
  response.on('data', chunk => str += chunk);

  // The whole response has been recieved,
  // so we just print it out here
  response.on('end', () => {
    const result = [];
    const birthdays = JSON.parse(str).rows;
    const today = new Date();

    for (let b = 0, blen = birthdays.length; b < blen; b++) {
      const currentBirthday = new Date(birthdays[b].birthday);
      if (currentBirthday.getDate() === today.getDate() &&
        currentBirthday.getMonth() === today.getMonth()) {
        let age = today.getYear() - currentBirthday.getYear();
        let message = '';
        if (birthdays[b].age >= 35) {
          age = birthdays[b].age - 10;
          message = 'The age shown is approximate.';
        }
        birthdays[b].age = age;
        birthdays[b].message = message;
        result.push(birthdays[b]);
      }
    }

    // Only if there are birthdays
    if (result.length) {
      fs.readFile(tplPath, 'utf8', (err, tpl) => {
        if (err) {
          console.error(err);
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
