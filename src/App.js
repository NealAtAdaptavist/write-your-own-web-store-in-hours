import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/layout";
import Home from "./pages/home";
import MiroHome from "./pages/mirohome";
import Success from "./pages/success";

import "./App.css";

const App = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/success" element={<Success />} />
          <Route path="/" element={<Home />} />
          <Route path="/miro" element={<MiroHome />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
