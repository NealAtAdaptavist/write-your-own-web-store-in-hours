const { NetlifyJwtVerifier } = require("@serverless-jwt/netlify");
const mysql = require('mysql2');


const verifyJwt = NetlifyJwtVerifier({
  issuer: process.env.AUTH0_ISSUER,
  audience: process.env.AUTH0_AUDIENCE,
});
exports.handler = verifyJwt(async function (event, context) {
  // Decode the payload
  let payload = JSON.parse(event.body);
  payload.context = context.identityContext
   if (payload.context.claims) {
    let userSub = payload.context.claims.sub
    let subParts = userSub.split("|")
    if (payload.boardInfo.id && payload.userInfo.id) {
      let boardQuery = `INSERT IGNORE into tenant (auth_sub, auth_provider, auth_sub_id, board_id, user_id) VALUES ("${userSub}","${subParts[0]}","${subParts[1]}", "${payload.boardInfo.id}", "${payload.userInfo.id}")`
      console.log(boardQuery)
      console.log(`mysql://${process.env.APP_DATABASE_USER}:${process.env.APP_DATABASE_PASS}@${process.env.APP_DATABASE_DOMAIN}/${process.env.APP_DATABASE_PATH}?ssl={"rejectUnauthorized":true}`)
      const connection = mysql.createConnection(`mysql://${process.env.APP_DATABASE_USER}:${process.env.APP_DATABASE_PASS}@${process.env.APP_DATABASE_DOMAIN}/${process.env.APP_DATABASE_PATH}?ssl={"rejectUnauthorized":true}`);
      connection.query(boardQuery, function (err, result) {
        if (err) {
          console.warn(err)
        }
        else console.log(result);      
      });
      connection.end();
    }
  }
  
    

  return {
    statusCode: 200,
    body: JSON.stringify({status: true}),
  };
});
