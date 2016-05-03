require('babel-register');
require('babel-polyfill');
require('isomorphic-fetch');

let Promise = require('bluebird');
Promise.promisifyAll(require('fs'));
require('./app.js');
