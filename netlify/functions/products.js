const { NetlifyJwtVerifier } = require("@serverless-jwt/netlify");
var faunadb = require('faunadb')
var q = faunadb.query

const verifyJwt = NetlifyJwtVerifier({
  issuer: process.env.AUTH0_ISSUER,
  audience: process.env.AUTH0_AUDIENCE,
});

const waitingFunc = async (event, context, client) => {
  let payload = JSON.parse(event.body);
  console.log(payload)
  payload.context = context.identityContext
   if (payload.context.claims) {
    let userSub = payload.context.claims.sub
    let subParts = userSub.split("|")
    if (payload.boardInfo && payload.userInfo) {      
      let resp = await client.query(
        q.Map(
          q.Paginate(
            q.Match(q.Index("search-by-auth-sub"), userSub)
          ), 
          q.Lambda(x => q.Get(x))
          )
        )
      .then(async (ret) => {
        console.log(`Found the following: ${JSON.stringify(ret)}`)
        
        if (ret.data.length > 0) {
          console.log("Found an object, time to update!")
          let resp = await client.query(
            q.Update(
              q.Ref(q.Collection('tenant'),ret.data[0].ref.id),
              { 
                data: 
                  { 
                    authSub: userSub,
                    miroUser : payload.userInfo,
                    boardInfo : payload.boardInfo,
                    ts : new Date()
                  } 
              },
            )
            )
        }
        return ret
      })
      .catch((err) => {
        return { error: err.errors()[0].description}
      })
      return resp   
    } else {
      return {er: 'no user found'}
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
  var client = new faunadb.Client({
    secret: process.env.FAUNA_KEY,
    domain: 'db.us.fauna.com'
  })
  const resp = await waitingFunc(event, context, client)
  console.log(resp)
  return {
    statusCode: 200, 
    body: JSON.stringify({resp: resp})
  };

});
