'use strict';

// At beginning, load environment variables
require('dotenv').load({silent: true});

const SparkPost = require('sparkpost');
const logger = require('./logger');

const sp = new SparkPost(process.env.SPARKPOST_API_KEY);

/**
 * Wrapper for SparkPost API
 * @param  {Object} options
 * @param  {Function} cb
 * @example
 * {
 *   from: 'hello@example.com',
 *   subject: 'Example',
 *   content: '<p>Lorem ipsum</p>',
 *   recipients: [{address: 'people@example.com'}]
 * }
 */
module.exports = function(options, cb) {
  sp.transmissions.send({
    transmissionBody: {
      content: {
        from: options.from,
        subject: options.subject,
        html: options.content
      },
      recipients: options.recipients
    }
  }, err => {
    if (err) {
      logger('error', err);
      if (cb && typeof cb === 'function') {
        cb(err);
      }
    } else {
      logger('info', 'You\'ve sent your mailing.');
      if (cb && typeof cb === 'function') {
        cb();
      }
    }
  });
};
