const Promise = require('bluebird');
const debug = require('debug')('hyperledger-service')

//const getUnsignedAudits = require('./src/getUnsignedAudits.js')
const getUnhyperledgeredAudits = require('./src/getUnhyperledgeredAudits.js')
const putInHyperledger = require('./src/putInHyperledger.js')
const verify = require('@trellisfw/signatures').verify;
const tokens = require('./src/tokens.js')
const config = require('./config.js')

function run() {
  //Load tokens
  return Promise.map(tokens.getAll(), (token) => {
    return getUnhyperledgeredAudits({token}).then((unhyperledgeredAudits) => {
      //Check if it has a signature
      debug(unhyperledgeredAudits.length, 'audits need signatures.');
      return Promise.map(unhyperledgeredAudits, (data) => {
        return verify(data.audit).then(() => { 
          return verify(data.certificate).then(() => { 
            return putInHyperledger(certificationToHyperledgerAudit(data)).then((certificationid) => {
              return axios({
                method: 'PUT',
                url: config.api+'/bookmarks/certifications/'+key+'/_meta/hyperledger_id',
                headers: {
                  Authorization: 'Bearer '+token
                },
                data: certificationid
              })
            })
          }).catch((error) => {
            debug('certificate could not be verified:', data.certificate._id)
        }).catch((error) => {
          debug('Audit could not be verified:', data.audit._id)
        })
      });
    });
  });
}

run();
setInterval(() => {
  run()
}, config.interval*1000);
