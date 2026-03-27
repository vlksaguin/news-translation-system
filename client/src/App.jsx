import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import NewArticle from "./pages/NewArticle";
import ReviewArticle from "./pages/ReviewArticle";
import Published from "./pages/Published";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new" element={<NewArticle />} />
        <Route path="/review" element={<ReviewArticle />} />

      </Routes>
    </Router>
  );
}

export default App;