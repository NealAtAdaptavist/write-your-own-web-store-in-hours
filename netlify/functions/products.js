const { NetlifyJwtVerifier } = require("@serverless-jwt/netlify");

// Starting
var Analytics = require('analytics-node');
var analytics = new Analytics('BlFUAAGcnOCCewCIEVFvEDxJSt2Uvoyu', { flushAt: 1 });

const mysql = require('mysql2')


const verifyJwt = NetlifyJwtVerifier({
  issuer: process.env.AUTH0_ISSUER,
  audience: process.env.AUTH0_AUDIENCE,
});

const waitingFunc = async (event, context) => {
  let payload = JSON.parse(event.body);
  payload.context = context.identityContext
  let resp
   if (payload.context.claims) {
    let userSub = payload.context.claims.sub
    let subParts = userSub.split("|")
    if (payload.boardInfo && payload.userInfo) {
      console.log("Throwing track call")
      resp = analytics.identify({
        userId: subParts[1],
        traits: {
          miroId: payload.userInfo.id,
          provider: subParts[0],
          createdAt: new Date()
        }
      });
      console.log(resp)
      resp = analytics.track({
        userId: subParts[1],
        event: 'Viewed Board',
        properties: {
          boardId: payload.boardInfo.id
        }
      });
      console.log(resp)
      // let boardQuery = `INSERT IGNORE into tenant (auth_sub, auth_provider, auth_sub_id, board_id, user_id) VALUES ("${userSub}","${subParts[0]}","${subParts[1]}", "${payload.boardInfo.id}", "${payload.userInfo.id}")`
      // console.log(boardQuery)
      // console.log(`mysql://${process.env.APP_DATABASE_USER}:${process.env.APP_DATABASE_PASS}@${process.env.APP_DATABASE_DOMAIN}/${process.env.APP_DATABASE_PATH}?ssl={"rejectUnauthorized":true}`)
      // const connection = await mysql.createConnection(`mysql://${process.env.APP_DATABASE_USER}:${process.env.APP_DATABASE_PASS}@${process.env.APP_DATABASE_DOMAIN}/${process.env.APP_DATABASE_PATH}?ssl={"rejectUnauthorized":true}`);
      // connection.query(boardQuery, function (err, result) {
      //   if (err) {
      //     console.warn(err)
      //   }
      //   else console.log(result);      
      // });
      // connection.end();
    } else {
      resp=analytics.identify({
        userId: subParts[1],
        traits: {
          provider: subParts[0],
          createdAt: new Date()
        }
      });
      console.log(resp)
    }
  }

  await analytics.flush(function(err) {
    console.log('Flushed, and now this program can exit!')
    if (err) console.log(err)
  })
  return (resp)
}


exports.handler = verifyJwt( async function (event, context) {
  // Decode the payload

  const resp = await waitingFunc(event, context)
  return {
    statusCode: 200,
    body: JSON.stringify({resp: resp, ts: new Date()}),
  };

});
