'use strict';

require('dotenv').load({ silent: true });

const SparkPost = require('sparkpost');
const sp = new SparkPost(process.env.SPARKPOST_API_KEY);

/**
 * Module wrapper of SparkPost API
 * @param  {String} subject
 * @param  {Object} message
 * @param  {Array} recipients
 * @param  {Function} cb
 */

module.exports = function(subject, message, recipients, cb) {
  sp.transmissions.send({
    transmissionBody: {
      content: {
        from: process.env.SPARKPOST_FROM_EMAIL,
        subject: subject || 'Example subject',
        html: message && message.html ? message.html : '<p>Example content</p>',
      },
      recipients: [{address: 'david.inga@vizzuality.com'}]
    }
  }, function(err, res) {
    if (err) {
      console.log('Whoops! Something went wrong');
      console.log(err);
      if (cb && typeof cb === 'function') {
        cb(null, res);
      }
    } else {
      console.log('Woohoo! You just sent your first mailing!');
      if (cb && typeof cb === 'function') {
        cb(res);
      }
    }
  });
};
