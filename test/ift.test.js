var mocha = require('mocha');
var _ = require('lodash');
var ift = require('../src/ift/ift');
var Promise = require('bluebird');
var axios = require('axios');
var {expect}= require('chai');
var config = require('./config.js');
var pgfsTemplate = require('./pgfsTemplate');
var makeCertification = require('./makeCertification');
var result;
var certificationId;
var _IFT;

async function cleanUp() {
  await oadaRequest({
    method: 'delete',
    url: 'https://api.trellis.one/bookmarks/certifications',
  })
  await oadaRequest({
    method: 'delete',
    url: 'https://api.trellis.one/'+result.certification_id
  })
  await oadaRequest({
    method: 'delete',
    url: 'https://api.trellis.one/'+result.certificate_id
  })
  await oadaRequest({
    method: 'delete',
    url: 'https://api.trellis.one/'+result.audit_id
  })
}

function oadaRequest({method, url, data, type}) {
  var request = {
    method,
    url,
    headers: {
      'Authorization': 'Bearer '+config.token,
    }
  }
  if (type) request.headers['Content-Type'] = type;
  if (data) request.data = data;
  return axios(request);
}

describe('Check trellis signatures service', () => {

  describe('Should create certifications, a certification, certificate, and audit first', async function() {
    before('Connect to IBM Food Trust', async function() {
      _IFT = new ift(config.ift)
      await _IFT.connect()
    })

    it('Create test certification', async function() {
      this.timeout(5000);
      var audit = pgfsTemplate;
      var certificate = _.cloneDeep(pgfsTemplate);
      certificate.certificate_validity_period = {
        start: "2016-04-11",
        end: "2017-04-11"
      }
      delete certificate.sections;
      delete certificate.control_points;
      certificate.organization.GLN = config.gln;
      result = await makeCertification(audit, certificate)
      certificationId = result.certification_id.replace(/^resources\//, '');
    })

    it('Should create a hyperledger_id on the certification and in Hyperledger itself', async function() {
      this.timeout(65000)
      this.retries(12);
      await Promise.delay(5000)
      var audit = pgfsTemplate;
      var certificationMeta = await oadaRequest({
        method: 'get',
        url: 'https://api.trellis.one/bookmarks/certifications/'+certificationId+'/_meta',
      })
      expect(certificationMeta.data).to.include.keys('hyperledger_id')
      if (certificationMeta.data.hyperledger_id) {
        var hyperledgerAudit = await _IFT.getCertificate(certificationMeta.data.hyperledger_id)
        expect(hyperledgerAudit).to.include.keys(['metadata', 'timestamp', 'certificationId', 'attachments'])
        expect(hyperledgerAudit.metadata).to.include.keys(['addendumsComments', 'auditStartDate', 'auditedBy', 'certificationStatus', 'auditType', 'auditReferenceNumber', 'scope', 'scheme', 'schemeOwner'])
        expect(hyperledgerAudit.certificationId).to.equal(certificationMeta.data.hyperledger_id);
        expect(hyperledgerAudit.metadata.scheme).to.equal(audit.scheme.name)
        expect(hyperledgerAudit.metadata.schemeOwner).to.equal(audit.scheme.name)
        expect(hyperledgerAudit.metadata.scope).to.have.string(audit.scope.description)
        audit.scope.products_observed.forEach((item) => {
          expect(hyperledgerAudit.metadata.scope).to.have.string(item.name)
        })
        expect(hyperledgerAudit.metadata.auditedBy).to.equal(audit.certifying_body.auditor.name)
        expect(hyperledgerAudit.metadata.certificateReferenceNumber).to.equal(audit.certificationid.id)
        expect(hyperledgerAudit.metadata.locationGLNList[0].split('gln')[1]).to.equal(config.gln)
      } 
    })

    it('Clean Up', async function() {
      cleanUp()
    })
  })

  describe(`Shouldn't put certifications into hyperledger that are missing a GLN on the audit/certificate`, async function() {
    it(`Create test certification`, async function() {
      this.timeout(5000);
      var audit = pgfsTemplate;
      var certificate = _.cloneDeep(pgfsTemplate);
      certificate.certificate_validity_period = {
        start: "2016-04-11",
        end: "2017-04-11"
      }
      delete certificate.sections;
      delete certificate.control_points;
      result = await makeCertification(audit, certificate)
      certificationId = result.certification_id.replace(/^resources\//, '');
    })

    it(`Shouldn't have a hyperleger_id`, async function() {
      this.timeout(65000)
      await Promise.delay(60000)
      var certificationMeta = await oadaRequest({
        method: 'get',
        url: 'https://api.trellis.one/bookmarks/certifications/'+certificationId+'/_meta',
      })

      expect(certificationMeta.data).not.to.include.keys('hyperledger_id')
    })

    it('Clean Up', async function() {
      cleanUp()
    })

  })

  describe(`Test sending an integer type gln`, async function() {
    it(`Create test certification`, async function() {
      this.timeout(5000);
      var audit = pgfsTemplate;
      var certificate = _.cloneDeep(pgfsTemplate);
      certificate.certificate_validity_period = {
        start: "2016-04-11",
        end: "2017-04-11"
      }
      delete certificate.sections;
      delete certificate.control_points;
      certificate.organization.GLN = parseInt(config.gln);
      result = await makeCertification(audit, certificate)
      certificationId = result.certification_id.replace(/^resources\//, '');
    })

    it(`Shouldn't have a hyperleger_id`, async function() {
      this.timeout(65000)
      await Promise.delay(60000)
      var certificationMeta = await oadaRequest({
        method: 'get',
        url: 'https://api.trellis.one/bookmarks/certifications/'+certificationId+'/_meta',
      })

      expect(certificationMeta.data).not.to.include.keys('hyperledger_id')
    })

    it('Clean Up', async function() {
      cleanUp()
    })

  })

  describe('Should put a CustomFieldList into Hyperledger when analytics url is present in _meta', async function() {
    it(`Create test certification`, async function() {
      this.timeout(5000);
      var audit = pgfsTemplate;
      var certificate = _.cloneDeep(pgfsTemplate);
      certificate.certificate_validity_period = {
        start: "2016-04-11",
        end: "2017-04-11"
      }
      delete certificate.sections;
      delete certificate.control_points;
      var analytics_url = "https://test.analyticsexample.com";
      certificate.organization.GLN = config.gln;
      result = await makeCertification(audit, certificate, {analytics_url})
      certificationId = result.certification_id.replace(/^resources\//, '');
    })

    it(`Should include have a hyperleger_id`, async function() {
      this.timeout(65000)
      this.retries(12);

      var audit = pgfsTemplate;
      var analytics_url = "https://test.analyticsexample.com";
      await Promise.delay(5000)
      var certificationMeta = await oadaRequest({
        method: 'get',
        url: 'https://api.trellis.one/bookmarks/certifications/'+certificationId+'/_meta',
      })
      
      expect(certificationMeta.data).to.include.keys('hyperledger_id')
      if (certificationMeta.data.hyperledger_id) {
        var hyperledgerAudit = await _IFT.getCertificate(certificationMeta.data.hyperledger_id)
        expect(hyperledgerAudit).to.include.keys(['metadata', 'timestamp', 'certificationId', 'attachments'])
        expect(hyperledgerAudit.metadata).to.include.keys(['addendumsComments', 'auditStartDate', 'auditedBy', 'certificationStatus', 'auditType', 'auditReferenceNumber', 'scope', 'scheme', 'schemeOwner'])
        expect(hyperledgerAudit.certificationId).to.equal(certificationMeta.data.hyperledger_id);
        expect(hyperledgerAudit.metadata.scheme).to.equal(audit.scheme.name)
        expect(hyperledgerAudit.metadata.schemeOwner).to.equal(audit.scheme.name)
        expect(hyperledgerAudit.metadata.scope).to.have.string(audit.scope.description)
        audit.scope.products_observed.forEach((item) => {
          expect(hyperledgerAudit.metadata.scope).to.have.string(item.name)
        })
        expect(hyperledgerAudit.metadata.auditedBy).to.equal(audit.certifying_body.auditor.name)
        expect(hyperledgerAudit.metadata.certificateReferenceNumber).to.equal(audit.certificationid.id)
        expect(hyperledgerAudit.metadata.locationGLNList[0].split('gln')[1]).to.equal(config.gln)
        expect(hyperledgerAudit.metadata.customFieldList[0].value).to.equal(analytics_url)
      }
    })

    it('Clean Up', async function() {
      cleanUp()
    })
  })   

})
