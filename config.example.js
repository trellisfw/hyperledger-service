module.exports = {
  api: 'https://a.trellis.api.here',
  tokensFile: './tokens.json',
  interval: 30, //seconds
  supportedTypes: [
    'application/vnd.trellisfw.certification.primusgfs.1+json'
  ],
  ift: {
    organizationId: 'someIdHere',
    apiKey: 'someSecretKeyHere'
  },
  debug: {
    sendToHyperledger: true,
    verifySignatures: true
  }
}
