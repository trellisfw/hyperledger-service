const fsig = require('fpad-signatures');
const _ = require('lodash');
const Promise = require('bluebird');
const axios = require('axios');
const debug = require('debug')('trellis-signature-service:signAudit')

const jwkKeys = require('./jwkKeys.js');
const config = require('../config.js')

function putInHyperledger({audit, token}) {
  return Promise.join(jwkKeys.public(), jwkKeys.private(), jwkKeys.info(), (pubJwk, prvJwk, {kid, alg, kty, typ, jku}) => {
    const headers = { kid, alg, kty, typ, jku }
    return fsig.generate(audit, prvJwk, headers).then((signatures) => {
      debug('Signing audit:', audit._id);
      return axios({
        method: 'PUT',
        url: config.api+'/'+audit._id+'/signatures',
        headers: {
          Authorization: 'Bearer '+config.token
        },
        data: signatures
      });
    }).catch((error) => {
      debug('Failed to sign audit', audit._id)
      throw error;
    });
  });
}

module.exports = signAudit;
