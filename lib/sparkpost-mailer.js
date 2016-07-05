'use strict';

import dotenv from 'dotenv';
import SparkPost from 'sparkpost';

// At beginning, load environment variables
dotenv.load({silent: true});

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
export default function(options, cb) {
  sp.transmissions.send({
    transmissionBody: {
      content: {
        from: options.from,
        subject: options.subject || 'Example subject',
        html: options.content || '<p>Example content</p>'
      },
      recipients: options.recipients
    }
  }, err => {
    if (err) {
      console.log('Whoops! Something went wrong');
      console.log(err);
      if (cb && typeof cb === 'function') {
        cb(err);
      }
    } else {
      console.log('Woohoo! You just sent your mailing!');
      if (cb && typeof cb === 'function') {
        cb();
      }
    }
  });
}
