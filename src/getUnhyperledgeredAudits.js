const axios = require('axios');
const debug = require('debug')('trellis-signature-service:getUnhyperledgeredAudits')
const config = require('../config.js')
const _ = require('lodash');
const Promise = require('bluebird');

function getUnhyperledgeredAudits({token}) {
  /*
    Get /bookmarks/certifications
  */
  var certifications = [];
  return axios({
    method: 'GET',
    url: config.api+'/bookmarks/certifications',
    headers: {
      Authorization: 'Bearer '+token
    }
  }).then((response) => {
    //Extract only list of certification ids
    return axios({
      method: 'GET',
      url: config.api+'/bookmarks/certifications/'+key+'/_meta',
      headers: {
        Authorization: 'Bearer '+token
      }
    }).then(async (response) => {
      if (!response.data['hyperledger_id']) {
        var audit = axios({
          method: 'GET',
          url: config.api+'/bookmarks/certifications/'+key+'/audit',
          headers: {
            Authorization: 'Bearer '+token
          }
        })
        var certificate = axios({
          method: 'GET',
          url: config.api+'/bookmarks/certifications/'+key+'/certificate',
          headers: {
            Authorization: 'Bearer '+token
          }
        })
        return certifications.push({audit, certificate})
      }
      return
    }, {concurrency: 5});
  }).then(() => {
    return certifications;
  }).catch((error) => {
    if (error.response.status == 404) {
      debug('Certifications resource does not exist.')
      return [];
    } else {
      throw error;
    }
  })
}

module.exports = getUnhyperledgeredAudits;
