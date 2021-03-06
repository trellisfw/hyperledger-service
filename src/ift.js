const Promise = require('bluebird');
const config = require('../config.js')
const _ = require('lodash');
const debug = require('debug')('trellis-service-ibmfoodtrust:ift')


class IFT {
  async connect() {
    return true;
  }
  putCertificate(audit, certificate) {
    return Promise.try(() => {
      debug('DEBUG MODE, not sending to hyperledger.');
      return 'Test12345';
    })
  }
};


if (_.get(config, 'debug.sendToHyperledger') === false) {
  module.exports = IFT;
} else {
  //module.exports = require('trellisfw-ift');
  module.exports = require('./ift/ift.js');
}
