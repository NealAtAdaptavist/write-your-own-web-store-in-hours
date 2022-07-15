import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Auth0Provider } from "@auth0/auth0-react";

let miro = window.miro

async function init() {
  // Listen for a click on your app icon and open /app when clicked
  miro.board.ui.on('icon:click', async () => {
    await miro.board.ui.openModal({
      url: 'index.html',
      width: 800,
      height: 600,
      fullscreen: false,
    });
  });
}

init();

ReactDOM.render(
  <React.StrictMode>
    <Auth0Provider domain="dev-p9p797fk.us.auth0.com" clientId="gFdf1HX3He3G2Jz0YYoy8uqbMLLQtXJV" redirectUri={window.location.origin}>
      <App />
    </Auth0Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
