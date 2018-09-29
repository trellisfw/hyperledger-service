const pretty = require('prettyjson');
const primusgfs = require("./primusgfs");

const IFT = require("./ift");

let _IFT = new IFT({});

/**
 * connecting to IFT framework
 * adding a new certificate to the IFT
 */
_IFT.connect().then( (response) => {
    _IFT.putCertificate(primusgfs).then((response) => {console.log(response)}); 
    //console.log("New Certification ID",_IFT.putCertificate(primusgfs));
});
// _IFT.connect().then((response) => {
//     //_IFT.getCertificateManager(certificationId);
//     //_IFT.deleteCertificate();
//     console.log("New Certification ID",_IFT.addCertificate(primusgfs));
// });

/**
 * converting primusgfs to IFT schema
 */
//console.log(_IFT._mapOada2Hyperledger(primusgfs));

