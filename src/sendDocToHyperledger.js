const _ = require('lodash');
const Promise = require('bluebird');
const axios = require('axios');
const debug = require('debug')('trellis-service-ibmfoodtrust:sendDocToHyperledger')

const config = require('../config.js')
const _IFT = require('./ift.js');

const ift = new _IFT({
  organization_id: _.get(config, 'ift.organizationId'),
  apiKey: _.get(config, 'ift.apiKey')
});

function sendDocToHyperledger({token, certificationMeta, audit, certificate}) {
  const certificationId = certificationMeta._id.replace('resources/', '').replace('/_meta', '');
  //Send to hyperledger using ift
  return ift.connect().then(() => {
    return ift.putCertificate(audit, certificate).then((hyperledgerId) => {
      //Add hyperledger_id to certification
      debug(certificationId, 'Successfully pushed to hyperledger. hyperledger_id:', hyperledgerId);
      return axios({
        method: 'PUT',
        url: config.api+'/'+certificationMeta._id+'/hyperledger_id',
        headers: {
          Authorization: 'Bearer '+token,
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(hyperledgerId)
      });
    }).catch((err) => {
      debug(certificationId, 'Error: Failed to putCertificate() to hyperledger.', err);
    });
  }).catch((err) => {
    debug(certificationId, 'Error: Failed to connect to hyperledger.', err);
  });
}

module.exports = sendDocToHyperledger;
