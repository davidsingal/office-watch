'use strict';

require('./app');

var express = require('express')
var server = express();

server.set('port', (process.env.PORT || 5000))

server.listen(server.get('port'), function() {
  console.log("Node server is running at localhost:" + server.get('port'))
})
