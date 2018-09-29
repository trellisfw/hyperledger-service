let authtoken = require('./authtoken');
const pretty = require('prettyjson');
const primusgfs = require("./primusgfs");

const IFT = require("./ift");

let _IFT = new IFT({});

_IFT.connect().then((response) => {
    //_IFT.getCertificateManager(certificationId);
    //_IFT.deleteCertificate();
    console.log("New Certification ID",_IFT.addCertificate(primusgfs));
});


