import React, {useEffect} from "react";
import { useAuth0 } from "@auth0/auth0-react"; 
import {useLocation} from "react-router-dom";

const BeginOauth = () => {
  const { getAccessTokenSilently} = useAuth0();
  const search = useLocation().search;
  const code = new URLSearchParams(search).get('code');
  startOauth(getAccessTokenSilently, code)
}

const startOauth = async (getAccessTokenSilently, code) => {
  const access_token = await getAccessTokenSilently();
  console.log(`Access Token: ${access_token}`)  
    fetch("/.netlify/functions/miroOauth", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`
      },
      body: JSON.stringify({
        source: window.location,
        code: code
      }),
    })
    .then(res => {
      console.log(res)
    })
      // .then((json) => {
      //   console.log("Found some json")
      //   console.log(json)
      //   if ('url' in json) {
      //     window.open(json.url)
      //   }
      //   return <></>
      // });
}

const OauthRedirect = () => {  
  useEffect(() => {
    console.log('loaded')
  }, []);

  return (
    <>
    <div>
      {BeginOauth()}
    </div>
    </>
  );
};

export default OauthRedirect;
