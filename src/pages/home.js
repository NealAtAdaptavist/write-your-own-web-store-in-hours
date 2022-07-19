import React, {useEffect} from "react";
import { useAuth0 } from "@auth0/auth0-react"; 

const getToken = async (getAccessTokenSilently) => {
  const access_token = await getAccessTokenSilently();
  console.log(`Access Token: ${access_token}`)  
  const userInfo = await window.miro.board.getUserInfo()
  const boardInfo = await window.miro.board.getInfo()
  // const miro_token = await window.miro.board.getIdToken();
    fetch("/.netlify/functions/user", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`
      },
      body: JSON.stringify({
        source: window.location,
        userInfo: userInfo, 
        boardInfo: boardInfo
      }),
    })
    .then(res => {
      return res.json()
    })
      .then((json) => {
        console.log(json)
      });
}

const startOauth = async (getAccessTokenSilently) => {
  const access_token = await getAccessTokenSilently();
  console.log(`Access Token: ${access_token}`)  
  const userInfo = await window.miro.board.getUserInfo()
  const boardInfo = await window.miro.board.getInfo()
  // const miro_token = await window.miro.board.getIdToken();
    fetch("/.netlify/functions/miroOauth", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`
      },
      body: JSON.stringify({
        source: window.location,
        userInfo: userInfo, 
        boardInfo: boardInfo
      }),
    })
    .then(res => {
      return res.json()
    })
      .then((json) => {
        console.log("Found some json")
        console.log(json)
        if ('url' in json) {
          window.open(json.url)
        }
      });
}

const BuyNowButton = () => {
  const { isLoading, isAuthenticated, loginWithPopup, getAccessTokenSilently} = useAuth0();

  if (isLoading) return <></>;

  if (isAuthenticated) {    
    getToken(getAccessTokenSilently)
    return <>
      <div>You're logged in!</div>
      <div>
      <button onClick={(() => startOauth(getAccessTokenSilently))}>Connect with OAuth</button>
    </div>
    </>
  }
  
  return <>
    <div>
      To get started, log in with your Salable account.
    </div>
    <div>
      <button onClick={loginWithPopup}>Sign in Salable</button>
    </div>   
    
  </>
};

const MiroHome = () => {  

  useEffect(() => {
    console.log("Loaded Salable App")
  }, []);

  return (
    <>
      <h1>Auth0 Demo</h1>      
      <div>
      {BuyNowButton()}
      </div>
    </>
  );
};

export default MiroHome;
