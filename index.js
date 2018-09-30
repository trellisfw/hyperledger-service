const Promise = require('bluebird');
const debug = require('debug')('trellisfw-service-ibmfoodtrust')
const axios = require('axios');

const getDocsForHyperledger = require('./src/getDocsForHyperledger.js')
const tokens = require('./src/tokens.js')
const config = require('./config.js')
const ift = require('./src/ift/ift.js')

function run() {
  //Load tokens
  return Promise.map(tokens.getAll(), (token) => {
    return getDocsForHyperledger({token}).then((docsForHyperledger) => {
      //Check if it has a signature
      debug(docsForHyperledger.length, 'certifications need to be pushed to hyperledger.');
      return Promise.map(docsForHyperledger, ({certification, audit, certificate}) => {
        //Send to hyperledger using ift
        //TODO ift.putCertificate needs to take audit AND certificate as arguments
        return ift.putCertificate(audit).then((certificationId) => {
          //Add hyperledger_id to certification
          debug('Certification successfully pushed to hyperledger:', certification._id);
          return axios({
            method: 'PUT',
            url: config.api+'/'+certification._id+'/_meta/hyperledger_id',
            headers: {
              Authorization: 'Bearer '+token
            },
            data: certificationId
          });
        })
      });
    });
  });
}

run();
setInterval(() => {
  run()
}, config.interval*1000);
