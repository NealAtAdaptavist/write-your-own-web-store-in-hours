const { NetlifyJwtVerifier } = require("@serverless-jwt/netlify");

// Starting
var Analytics = require('analytics-node');



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
      let boardQuery = `INSERT IGNORE into tenant (auth_sub, auth_provider, auth_sub_id, board_id, user_id) VALUES ("${userSub}","${subParts[0]}","${subParts[1]}", "${payload.boardInfo.id}", "${payload.userInfo.id}")`
      console.log(boardQuery)
      console.log(`mysql://${process.env.APP_DATABASE_USER}:${process.env.APP_DATABASE_PASS}@${process.env.APP_DATABASE_DOMAIN}/${process.env.APP_DATABASE_PATH}?ssl={"rejectUnauthorized":true}`)
      const connection = await mysql.createConnection(`mysql://${process.env.APP_DATABASE_USER}:${process.env.APP_DATABASE_PASS}@${process.env.APP_DATABASE_DOMAIN}/${process.env.APP_DATABASE_PATH}?ssl={"rejectUnauthorized":true}`);
      connection.query(boardQuery, function (err, result) {
        if (err) {
          console.warn(err)
          return {
            statusCode: 403,
            body: JSON.stringify({er: err}),
          };
        }
        else console.log(result);      
      });
      connection.end();
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


const boringFunction = async (event, context) => {
  analytics.identify({
    userId: '12345',
    traits: {
      miroId: '5678',
      provider: 'i am sad',
      createdAt: new Date()
    }
  });
  const butseriously = await analytics.flush(function(err) {
    console.log('Flushed, and now this program can exit!')
    if (err) return({err: err})
  })
  return {succes: butseriously}
};

async function lambda()
{
  const WRITE_KEY = 'BlFUAAGcnOCCewCIEVFvEDxJSt2Uvoyu'
  const analytics = new Analytics(WRITE_KEY, { flushAt: 20 });
  analytics.flushed = true;
  
  analytics.track({
    anonymousId: '1111111',
    event: 'Test event',
    properties: {
      name: 'Test event',
      timestamp: new Date()
    }
  });
  await analytics.flush(function(err, batch) {
    console.log('Flushed, and now this program can exit!');
    return ({in: 'here'})
  });
}

// exports.handler = verifyJwt( async function (event, context) {
  // Decode the payload
  exports.handler =  async function (event, context) {
  const resp = await lambda()
  return {
    statusCode: 200,
    body: JSON.stringify({resp: resp, ts: new Date()}),
  };

};
