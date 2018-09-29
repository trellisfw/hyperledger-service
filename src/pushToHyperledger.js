const _ = require('lodash');
const Promise = require('bluebird');
const debug = require('debug')('trellisfw-service-ibmfoodtrust:pushToHyperLedger')
const config = require('../config.js')
/*
  TODO May need a way to figure out if the document is a audit or a certificate, maybe have `getDocsForHyperledger` return certifications and audits separately
  TODO Use hyperledger library to put document in hyperledger
  TODO PUT on _meta/hyperledger_id
*/
function pushToHyperLedger({doc, token}) {

}

module.exports = pushToHyperLedger;
