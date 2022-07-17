import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Layout = ({ children }) => {
  const { isLoading, isAuthenticated, logout } = useAuth0();

  return (
    <>
      <header>
        <nav>
        <img src="https://cdn.freebiesupply.com/logos/thumbs/2x/auth0-logo.png" alt="Logo" width="50px"/>             
          <ul>
            {!isLoading && isAuthenticated && (
              <li>
                <button className="menuitem" onClick={logout}>
                  Logout
                </button>
              </li>
            )}
          </ul>
        </nav>
      </header>
      <main>{children}</main>
    </>
  );
};

export default Layout;
