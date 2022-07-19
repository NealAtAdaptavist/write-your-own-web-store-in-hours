import React, {useEffect} from "react";
import { useAuth0 } from "@auth0/auth0-react"; 

async function init() {
  // Listen for a click on your app icon and open /app when clicked
  window.miro.board.ui.on('icon:click', async () => {
    await window.miro.board.ui.openModal({
      url: '/',
      width: 800,
      height: 600,
      fullscreen: false,
    });
  });
}
init();

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

const BuyNowButton = () => {
  const { isLoading, isAuthenticated, loginWithPopup, getAccessTokenSilently} = useAuth0();

  if (isLoading) return <></>;

  if (isAuthenticated) {    
    getToken(getAccessTokenSilently)
    return <>
      <div>You're logged in!</div>
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

const Home = () => {  

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

export default Home;
