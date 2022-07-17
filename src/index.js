import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Auth0Provider } from "@auth0/auth0-react";

// let miro = window.miro

// async function init() {
//   // Listen for a click on your app icon and open /app when clicked
//   miro.board.ui.on('icon:click', async () => {
//     await miro.board.ui.openModal({
//       url: '/',
//       width: 800,
//       height: 600,
//       fullscreen: false,
//     });
//   });
// }

// init();

const audience = process.env.REACT_APP_AUTH0_AUDIENCE
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID
const domain = process.env.REACT_APP_AUTH0_DOMAIN

ReactDOM.render(
  <React.StrictMode>
    <Auth0Provider domain={domain} clientId={clientId} audience={audience} redirectUri={window.location.origin}>
      <App />
    </Auth0Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
