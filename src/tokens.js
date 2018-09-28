const Promise = require('bluebird');
const readFile = Promise.promisify(require("fs").readFile);
const debug = require('debug')('trellis-signature-service:tokens');

const config = require('../config.js');

function loadJSON(filename) {
  return readFile(filename, "utf8").then((data) => {
    return JSON.parse(data);
  });
}

var tokens = loadJSON(config.tokensFile);
function getAll() {
  reload();
  return tokens;
}
function reload() {
  //Reload the keys
  //Reload the tokens
  try {
    tokens = loadJSON(config.tokensFile);
  } catch {
    debug('Failed to load tokens, reusing old.')
  }
}
module.exports = {
  getAll,
  reload
}
