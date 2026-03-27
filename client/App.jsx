import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./src/pages/LoginPage";
import Dashboard from "./src/pages/Dashboard";
import NewArticle from "./src/pages/NewArticle";
import ReviewArticle from "./src/pages/ReviewArticle";
import Published from "./src/pages/Published";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new" element={<NewArticle />} />
        <Route path="/review/:id" element={<ReviewArticle />} />
        <Route path="/published" element={<Published />} />

      </Routes>
    </Router>
  );
}

export default App;