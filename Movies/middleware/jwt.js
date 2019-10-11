const jwt = require('express-jwt');

const jwksRsa = require('jwks-rsa');

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://gabestremos.auth0.com/.well-known/jwks.json`
  }),
  issuer: `https://gabestremos.auth0.com/`,
  algorithm: ['RS256']
});
module.exports = checkJwt;
