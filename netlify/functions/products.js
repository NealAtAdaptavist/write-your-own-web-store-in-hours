const { NetlifyJwtVerifier } = require("@serverless-jwt/netlify");
const mysql = require('mysql2');


const verifyJwt = NetlifyJwtVerifier({
  issuer: process.env.AUTH0_ISSUER,
  audience: process.env.AUTH0_AUDIENCE,
});
exports.handler = verifyJwt(async function (event, context) {
  // Decode the payload
  const payload = JSON.parse(event.body);
  payload.context = context.clientContext
  const connection = mysql.createConnection(process.env.APP_DATABASE_URL);
  console.log('Connected to PlanetScale!');
  let userSub = payload.context.user.sub
  let subParts = userSub.split("|")
  if (payload.boardInfo.id && payload.userInfo.id) {
    let boardQuery = `INSERT IGNORE into tenant (auth_sub, auth_provider, auth_sub_id, board_id, user_id) VALUES ("${userSub}","${subParts[0]}","${subParts[1]}", "${payload.boardInfo.id}", "${payload.userInfo.id}")`
    console.log(boardQuery)
    connection.query(boardQuery, function (err, result, fields) {
      if (err) throw err;
      console.log(result);      
    });
  }
    connection.end();

  return {
    statusCode: 200,
    body: JSON.stringify({status: true}),
  };
});
