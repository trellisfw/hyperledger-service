const Promise = require('bluebird');
const debug = require('debug')('trellisfw-service-ibmfoodtrust')

const getDocsForHyperledger = require('./src/getDocsForHyperledger.js')
const sign= require('./src/sign.js')
const tokens = require('./src/tokens.js')
const config = require('./config.js')


function run() {
  //Load tokens
  return Promise.map(tokens.getAll(), (token) => {
    return getDocsForHyperledger({token}).then((docsForHyperledger) => {
      //Check if it has a signature
      debug(docsForHyperledger.length, 'docs need to be pushed to hyperledger.');
      return Promise.map(docsForHyperledger, (doc) => {
        return pushToHyperLedger({doc, token});
      });
    });
  });
}

run();
setInterval(() => {
  run()
}, config.interval*1000);
