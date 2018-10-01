const Promise = require('bluebird');
const debug = require('debug')('trellis-service-ibmfoodtrust')

const getDocsForHyperledger = require('./src/getDocsForHyperledger.js')
const sendDocToHyperledger = require('./src/sendDocToHyperledger.js')
const tokens = require('./src/tokens.js')
const config = require('./config.js')

function run() {
  //Load tokens
  return Promise.map(tokens.getAll(), (token) => {
    debug('------------------ Getting certifications for:', token, '----------------------');
    return getDocsForHyperledger({token}).then((docsForHyperledger) => {
      //Check if it has a signature
      debug(docsForHyperledger.length, 'certifications need to be pushed to hyperledger.');
      return Promise.map(docsForHyperledger, ({certification, certificationMeta, audit, certificate}) => {
        return sendDocToHyperledger({token, certificationMeta, audit, certificate});
      });
    });
  });
}

run();
setInterval(() => {
  run()
}, config.interval*1000);
