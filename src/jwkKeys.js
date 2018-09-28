const Promise = require('bluebird');
const config = require('../config.js');
const readFile = Promise.promisify(require("fs").readFile);

function loadKey(filename) {
  return readFile(filename, "utf8").then((data) => {
    return data;
  });
}
function loadInfo(filename) {
  return readFile(filename, "utf8").then((data) => {
    return JSON.parse(data);
  });
}

var pubJWK = loadKey(config.key.public);
var prvJWK = loadKey(config.key.private);
var infoJWK = loadInfo(config.key.info);
function private() {
  return prvJWK;
}
function public() {
  return pubJWK;
}
function info() {
  return infoJWK;
}
function reload() {
  //Reload the keys
  pubJWK = loadKey(config.key.public);
  prvJWK = loadKey(config.key.private);
  infoJWK = loadInfo(config.key.info);
}
module.exports = {
  private,
  public,
  info,
  reload
}
