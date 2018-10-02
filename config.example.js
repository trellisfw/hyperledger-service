module.exports = {
  api: 'https://a.trellis.api.here',
  tokensFile: './tokens.json',
  interval: 30, //seconds
  supportedTypes: [
    'application/vnd.trellis.certification.primusgfs.1+json'
  ],
  ift: {
    organizationId: 'someIdHere',
    apiKey: 'someSecretKeyHere'
  },
  debug: {
    sendToHyperledger: true,
    overrideGLN: '0728612177446',
    verifySignatures: true
  }
}
