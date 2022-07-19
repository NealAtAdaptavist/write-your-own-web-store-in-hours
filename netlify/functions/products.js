const { NetlifyJwtVerifier } = require("@serverless-jwt/netlify");
var faunadb = require('faunadb')
var q = faunadb.query

// Load the Auth0 issuer and audience from ENV
const verifyJwt = NetlifyJwtVerifier({
  issuer: process.env.AUTH0_ISSUER,
  audience: process.env.AUTH0_AUDIENCE,
});

// Upsert users data in Fauna
// Stores against the AUTH0 identity - 
// the last updated user and board context seen

const upsertUserCollection = async (event, context, client) => {  
  // Get the identity context from the event body
  let payload = JSON.parse(event.body);
  payload.context = context.identityContext
  // Look for the claims param and pull the sub value
  if (payload.context.claims) {
    let userSub = payload.context.claims.sub
    // If we are in a miro iframe
    if (payload.boardInfo && payload.userInfo) {  
      // Search for the current auth sub
      let resp = await client.query(
        q.Map(
          q.Paginate(
            q.Match(q.Index("search-by-auth-sub"), userSub)
          ), 
          q.Lambda(x => q.Get(x))
          )
        )
      .then(async (ret) => {
        // If there is already a sub that exists
        if (ret.data.length > 0) {
          // Update against the first user found
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
          return resp
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
  // Create Fauna Client
  var client = new faunadb.Client({
    secret: process.env.FAUNA_KEY,
    domain: 'db.us.fauna.com'
  })
  const resp = await upsertUserCollection(event, context, client)
  console.log(resp)
  return {
    statusCode: 200, 
    body: JSON.stringify({resp: resp})
  };

});
