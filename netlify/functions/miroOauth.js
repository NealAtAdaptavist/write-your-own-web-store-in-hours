const { NetlifyJwtVerifier } = require("@serverless-jwt/netlify");
var faunadb = require('faunadb')
const axios = require('axios')
var q = faunadb.query

// Load the Auth0 issuer and audience from ENV
const verifyJwt = NetlifyJwtVerifier({
  issuer: process.env.AUTH0_ISSUER,
  audience: process.env.AUTH0_AUDIENCE,
});

// Upsert users data in Fauna
// Stores against the AUTH0 identity - 
// the last updated user and board context seen

const oauthFunction = async (event, context, client) => {  
  // Get the identity context from the event body
  let payload = JSON.parse(event.body);

  let access_token;
  let refresh_token;

  if (payload.code) {
    // #3:
    // ---> Request `access_token` and `refresh_token` pair by making a request to Miro /oauth endpoint.
    // ---> Required parameters include `grant_type`, `client_id`, `client_secret`, `code`, and `redirect_uri`.
    // ---> See full details in Miro documentation here: https://developers.miro.com/docs/getting-started-with-oauth#step-3

    let url = `https://api.miro.com/v1/oauth/token?grant_type=authorization_code&client_id=${process.env.MIRO_CLIENT_ID}&client_secret=${process.env.MIRO_CLIENT_SECRET}&code=${payload.code}&redirect_uri=${process.env.MIRO_REDIRECT_URL}`;
    console.log(url)
    async function grabToken() {
      try {
        let oauthResponse = await axios.post(url, {}, {
          headers: {
            // Overwrite Axios's automatically set Content-Type
            'Content-Type': 'application/json'
          }
        });

        // Console log access_token and reference_token:
        console.log(`access_token: ${oauthResponse.data.access_token}`);
        console.log(`refresh_token: ${oauthResponse.data.refresh_token}`);

        // Set global variable for access_token and refresh_token values
        access_token = oauthResponse.data.access_token;
        refresh_token = oauthResponse.data.refresh_token;
        payload.context = context.identityContext
      // Look for the claims param and pull the sub value
      if (payload.context.claims) {
        let userSub = payload.context.claims.sub
        // Search for the current auth sub
        let resp = await client.query(
          q.Map(
            q.Paginate(
              q.Match(q.Index("tenant-tokens"), userSub)
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
                q.Ref(q.Collection('miro-tenant'),ret.data[0].ref.id),
                { 
                  data: 
                    { 
                      authSub: userSub,
                      miroToken: access_token,
                      ts : new Date()
                    } 
                },
              )              
            )  
            return resp          
          } else {
            let resp = await client.query(
              q.Create(
                q.Collection('miro-tenant'),
                { data: { 
                  authSub: userSub,
                  miroToken: access_token,
                  ts : new Date()
                } }
              )
            )
            return resp
          }          
        })
        .catch((err) => {
          return { error: err.errors()[0].description}
        })       

      } else {        
        return {er: 'no user found'}      
      }        
  
        
  //       // Specify Miro API request URL
  //       let requestUrl = `https://api.miro.com/v2/boards/${process.env.boardId}`;

  //       // #4:
  //       // ---> If `access_token` was successfully retrieved, send an API request to any Miro endpoint that contains the same permissions as your OAuth 2.0 app, with `access_token` as value for Bearer Token.
  //       // ---> (See permissions under user profile > apps: https://miro.com/app/settings/user-profile/apps)
  //       if (access_token) {
  //         // API request options
  //         let config = {
  //           method: "get",
  //           url: requestUrl,
  //           headers: {
  //             Authorization: `Bearer ${access_token}`,
  //           },
  //         };
  //         async function callMiro() {
  //           try {
  //             let response = await axios(config);
  //             console.log(JSON.stringify(response.data));
  //             let miroResponse = JSON.stringify(response.data);
  //             // Display response in browser
  //             let JSONResponse = `<pre><code>${miroResponse}</code></pre>`;
  //             res.send(`
  //                                   <div class="container">
  //                                       <h1>Hello, World!</h1>
  //                                       <h3>Miro API Response:</h3>
  //                                       ${JSONResponse}
  //                                   </div>
  //                               `);
  //           } catch (err) {
  //             console.log(`ERROR: ${err}`);
  //           }
  //         }
  //         callMiro();

  //         //Function to refresh access_token and refresh_token pair
  //         async function refreshToken() {
  //           try {
  //             // Declare request URL for refresh_token flow
  //             let refreshUrl = `https://api.miro.com/v1/oauth/token?grant_type=refresh_token&client_id=${process.env.clientID}&client_secret=${process.env.clientSecret}&refresh_token=${refresh_token}`;

  //             // Make request to Miro OAuth endpoint with grant_type = refresh_token
  //             let oauthRefreshResponse = await axios.post(refreshUrl);

  //             console.log(
  //               `New access_token: ${oauthRefreshResponse.data.access_token}`
  //             );
  //             console.log(
  //               `New refresh_token: ${oauthRefreshResponse.data.refresh_token}`
  //             );
  //           } catch (err) {
  //             console.log(`ERROR: ${err}`);
  //           }
  //         }
  //         refreshToken();
  //       }
      } catch (err) {
        console.log(`ERROR: ${err}`);
      }
    }
    grabToken();
  }
  // // ---> #2:
  // // ---> If no authorization code is present, redirect to Miro OAuth to authorize retrieve new `code`.
  return(
    { "url" : 
      "https://miro.com/oauth/authorize?response_type=code&client_id=" +
      process.env.MIRO_CLIENT_ID +
      "&redirect_uri=" +
      process.env.MIRO_REDIRECT_URL
    }
  );
}

exports.handler = verifyJwt( async function (event, context) {
  // Create Fauna Client
  var client = new faunadb.Client({
    secret: process.env.FAUNA_KEY,
    domain: 'db.us.fauna.com'
  })
  const resp = await oauthFunction(event, context, client)
  console.log(resp)
  return {
    statusCode: 200, 
    body: JSON.stringify(resp)
  };

});
