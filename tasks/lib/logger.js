'use strict';

const logger = require('winston');

// Configuring logger
logger.add(logger.transports.File, {filename: 'log/messages.json'});

/**
 * Window wrapper to make log messages
 * @param  {String} type    info, error, debug
 * @param  {String} message
 */
module.exports = function(type, message) {
  logger.log(type, message);
};
