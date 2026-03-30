import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import NewArticle from "./pages/NewArticle";
import ReviewArticle from "./pages/ReviewArticle";
import EditArticle from "./pages/EditArticle";
import PublicHome from "./pages/PublicHome";
import PublicArticle from "./pages/PublicArticle";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new" element={<NewArticle />} />
        <Route path="/review" element={<ReviewArticle />} />
        <Route path="/edit" element={<EditArticle />} />
        <Route path="/public" element={<PublicHome />} />
        <Route path="/public/article/:articleId" element={<PublicArticle />} />
      </Routes>
    </Router>
  );
}

export default App;