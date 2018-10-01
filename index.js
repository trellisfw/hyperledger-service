const Promise = require('bluebird');
const debug = require('debug')('trellis-service-ibmfoodtrust')
const axios = require('axios');

const getDocsForHyperledger = require('./src/getDocsForHyperledger.js')
const tokens = require('./src/tokens.js')
const config = require('./config.js')
const _IFT = require('./src/ift.js');
const ift = new _IFT({});

function run() {
  //Load tokens
  return Promise.map(tokens.getAll(), (token) => {
    return getDocsForHyperledger({token}).then((docsForHyperledger) => {
      //Check if it has a signature
      debug(docsForHyperledger.length, 'certifications need to be pushed to hyperledger.');
      return Promise.map(docsForHyperledger, ({certification, audit, certificate}) => {
        debug('Connecting...');
        //Send to hyperledger using ift
        return ift.connect().then(() => {
          debug('Connected to hyperledger');
          return ift.putCertificate(audit, certificate).then((certificationId) => {
            //Add hyperledger_id to certification
            debug('Certification successfully pushed to hyperledger:', certification._id, certificationId);
            return axios({
              method: 'PUT',
              url: config.api+'/'+certification._id+'/_meta/hyperledger_id',
              headers: {
                Authorization: 'Bearer '+token,
                'Content-Type': 'application/json'
              },
              data: certificationId
            });
          }).catch((err) => {
            debug('Failed to putCertificate to hyperledger.', err);
          });
        }).catch((err) => {
          debug('Failed to connect to hyperledger.', err);
        });
      });
    });
  });
}

run();
setInterval(() => {
  run()
}, config.interval*1000);
