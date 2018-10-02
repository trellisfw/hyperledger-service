const pretty = require("prettyjson");
const primusgfs = require("./primusgfs");
// const IFT = require("trellisfw-ift");

const IFT = require("./ift");

let _IFT = new IFT({
  organization_id: "",
  apiKey: ""
});

/**
 * connecting to IFT framework
 * adding a new certificate to the IFT
 */
_IFT.connect().then(response => {
  //_IFT.getCertificateManager("0b57ad143f6094626acaa22e65f34b10");
  _IFT.putCertificate(primusgfs, primusgfs).then(response => {
    console.log(response);
  });
  //console.log("New Certification ID",_IFT.putCertificate(primusgfs));
});
