var Promise = require('bluebird');
var axios = require('axios');
var TOKEN = '51w5jCXPr15m';

function oadaRequest({method, url, data, type}) {
  var request = {
    method,
    url,
    headers: {
      'Authorization': 'Bearer '+TOKEN,
    }
  }
  if (type) request.headers['Content-Type'] = type;
  if (data) request.data = data;
  return axios(request);
}

module.exports = async function makeCertification(audit, certificate, certificationMeta) {
  var _id;
  var putRes;
  var postRes;
  try {
    var postRes = await oadaRequest({
      method: 'post',
      url: 'https://api.trellis.one/resources',
      data: {},
      type: 'application/vnd.trellis.certifications.1+json'
    })
    _id = postRes.headers.location.replace(/^\//, '')
    var putRes = await oadaRequest({
      method: 'put',
      url: 'https://api.trellis.one/bookmarks/certifications',
      data: {_id, _rev: '0-0'},
      type: 'application/vnd.trellis.certifications.1+json'
    })
    var postRes = await oadaRequest({
      method: 'post',
      url: 'https://api.trellis.one/resources',
      data: {},
      type: 'application/vnd.trellis.certification.primusgfs.1+json'
    })
    _id = postRes.headers.location.replace(/^\//, '')
    var certification_id = _id;
    var certificationId = _id.replace(/^resources\//, '');
    var putRes = await oadaRequest({
      method: 'put',
      url: 'https://api.trellis.one/bookmarks/certifications/'+certificationId,
      data: {_id, _rev: '0-0'},
      type: 'application/vnd.trellis.certification.primusgfs.1+json'
    })
    var postRes = await oadaRequest({
      method: 'post',
      url: 'https://api.trellis.one/resources',
      data: audit,
      type: 'application/vnd.trellis.audit.primusgfs.1+json'
    })
    _id = postRes.headers.location.replace(/^\//, '')
    var audit_id = _id;
    var putRes = await oadaRequest({
      method: 'put',
      url: 'https://api.trellis.one/bookmarks/certifications/'+certificationId+'/audit',
      data: {_id, _rev: '0-0'},
      type: 'application/vnd.trellis.audit.primusgfs.1+json'
    })
    var postRes = await oadaRequest({
      method: 'post',
      url: 'https://api.trellis.one/resources',
      data: certificate,
      type: 'application/vnd.trellis.certificate.primusgfs.1+json'
    })
    _id = postRes.headers.location.replace(/^\//, '')
    var certificate_id = _id;
    var putRes = await oadaRequest({
      method: 'put',
      url: 'https://api.trellis.one/bookmarks/certifications/'+certificationId+'/certificate',
      data: {_id, _rev: '0-0'},
      type: 'application/vnd.trellis.certificate.primusgfs.1+json'
    })

    if (certificationMeta) {
      var putRes = await oadaRequest({
        method: 'put',
        url: 'https://api.trellis.one/bookmarks/certifications/'+certificationId+'/_meta',
        data: certificationMeta,
        type: 'application/vnd.trellis.certification.primusgfs.1+json'
      })
    }
  } catch(error) {
    console.log(error);
  }
  return {certification_id, audit_id, certificate_id}
}
