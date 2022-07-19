import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/layout";
import Home from "./pages/home";
import Success from "./pages/success";

import "./App.css";
import MiroHome from "./pages";

const App = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/success" element={<Success />} />
          <Route path="/app" element={<Home />} />
          <Route path="/app" element={<MiroHome />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
