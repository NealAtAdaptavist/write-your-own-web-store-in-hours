const { NetlifyJwtVerifier } = require("@serverless-jwt/netlify");
const mysql = require('mysql2');


const verifyJwt = NetlifyJwtVerifier({
  issuer: process.env.AUTH0_ISSUER,
  audience: process.env.AUTH0_AUDIENCE,
});
exports.handler = verifyJwt(async function (event, context) {
   
  // Decode the payload
  const payload = JSON.parse(event.body);

  const connection = mysql.createConnection(process.env.DATABASE_URL);
  console.log('Connected to PlanetScale!');
  connection.end();

  return {
    statusCode: 200,
    body: JSON.stringify({status: true}),
  };
});
