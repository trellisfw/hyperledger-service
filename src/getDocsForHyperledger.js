const axios = require('axios');
const verify = require('@trellisfw/signatures').verify;
const _ = require('lodash');
const Promise = require('bluebird');

const config = require('../config.js')
const debug = require('debug')('trellis-signature-service:getDocsForHyperledger')
/*
  Get all certifications and audits that do not have a `hyperledger_id` in their meta
  and also have a `signatures` key, and the signatures are valid.

  '/_meta/hyperledger_id'
*/

function getDocsForHyperledger({token}) {
  /*
    Get /bookmarks/certifications
  */
  var docs = [];
  return axios({
    method: 'GET',
    url: config.api+'/bookmarks/certifications',
    headers: {
      Authorization: 'Bearer '+token
    }
  }).then((response) => {
    //Extract only list of certification ids
    var certKeys = _.filter(Object.keys(response.data), key=>(_.startsWith(key, '_')===false));
    return Promise.map(certKeys, (key) => {
      return Promise.join(
        //Add certification to list if it IS signed and does NOT have a '/_meta/hyperledger_id' key
        axios({
          method: 'GET',
          url: config.api+'/bookmarks/certifications/'+key,
          headers: {
            Authorization: 'Bearer '+token
          }
        }).then((response) => {
          const hyperledgerId = _.get(response, 'data._meta.hyperledger_id');
          const signatures = _.get(response, 'data.signatures');
          if (hyperledgerId == null && signatures != null && (_.isArray(signatures) && signatures.length > 0)) {
            docs.push(response.data);
          }
        }).catch((err) => {
          debug('Failed to load certification', key);
        }),
        //Add audit to list if it IS signed and does NOT have a '/_meta/hyperledger_id' key
        axios({
          method: 'GET',
          url: config.api+'/bookmarks/certifications/'+key+'/audit',
          headers: {
            Authorization: 'Bearer '+token
          }
        }).then((response) => {
          const hyperledgerId = _.get(response, 'data._meta.hyperledger_id');
          const signatures = _.get(response, 'data.signatures');
          if (hyperledgerId == null && signatures != null && (_.isArray(signatures) && signatures.length > 0)) {
            docs.push(response.data);
          }
        }).catch((err) => {
          debug('Failed to load audit', key);
        }),
      );
    }, {concurrency: 5});
  }).then(() => {
    //Check if docs are valid
    var verifiedDocs = [];
    return Promise.map(docs, (doc) => {
      return verify(doc).then(() => {
        verifiedDocs.push(doc);
      }).catch((err) => {
        debug('Doc could not be verified:', doc, err.message)
      });
    }).then(()=> {
      return verifiedDocs;
    });
  }).catch((error) => {
    if (error.response.status == 404) {
      debug('Certifications resource does not exist.')
      return [];
    } else {
      throw error;
    }
  })
}

module.exports = getDocsForHyperledger;
