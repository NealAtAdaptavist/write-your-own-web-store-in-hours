const { NetlifyJwtVerifier } = require("@serverless-jwt/netlify");

const mysql = require('mysql2')

const verifyJwt = NetlifyJwtVerifier({
  issuer: process.env.AUTH0_ISSUER,
  audience: process.env.AUTH0_AUDIENCE,
});

const waitingFunc = async (event, context) => {
  let payload = JSON.parse(event.body);
  payload.context = context.identityContext
   if (payload.context.claims) {
    let userSub = payload.context.claims.sub
    let subParts = userSub.split("|")
    if (payload.boardInfo && payload.userInfo) {      
      let boardQuery = `INSERT IGNORE into tenant (auth_sub, auth_provider, auth_sub_id, board_id, user_id) VALUES ("${userSub}","${subParts[0]}","${subParts[1]}", "${payload.boardInfo.id}", "${payload.userInfo.id}")`
      console.log(boardQuery)
      console.log(`mysql://${process.env.APP_DATABASE_USER}:${process.env.APP_DATABASE_PASS}@${process.env.APP_DATABASE_DOMAIN}/${process.env.APP_DATABASE_PATH}?ssl={"rejectUnauthorized":true}`)
      const connection = mysql.createConnection(`mysql://${process.env.APP_DATABASE_USER}:${process.env.APP_DATABASE_PASS}@${process.env.APP_DATABASE_DOMAIN}/${process.env.APP_DATABASE_PATH}?ssl={"rejectUnauthorized":true}`);
      connection.query(boardQuery, function (err, result) {
        if (err) {
          console.warn(err)
          return {
            statusCode: 403,
            body: JSON.stringify({er: err}),
          };
        }
        else {
          console.log(result); 
          return {
            statusCode: 403,
            body: JSON.stringify({result: result}),
          };
        }     
      });
      connection.end();
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({er: 'no user found'}),
      };
    }
  }
}

// async function lambda()
// {
//   const WRITE_KEY = 'BlFUAAGcnOCCewCIEVFvEDxJSt2Uvoyu'
//   const analytics = new Analytics(WRITE_KEY, { flushAt: 20 });
//   analytics.flushed = true;
  
//   analytics.track({
//     anonymousId: '1111111',
//     event: 'Test event',
//     properties: {
//       name: 'Test event',
//       timestamp: new Date()
//     }
//   });
//   await analytics.flush(function(err, batch) {
//     console.log('Flushed, and now this program can exit!');
//     return ({in: 'here'})
//   });
// }

exports.handler = verifyJwt( async function (event, context) {
  // Decode the payload
  const resp = await waitingFunc(event, context)
  return resp;

});
