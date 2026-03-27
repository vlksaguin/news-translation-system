import React from "react";
import { useEffect, useState } from "react";
import { getPublished } from "../../utils/storage";
import ArticleCard from "../components/ArticleCard";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [published, setPublished] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setPublished(getPublished());
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>

          <button
            onClick={() => navigate("/new")}
            className="bg-purple-700 text-white px-4 py-2 rounded"
          >
            New Article
          </button>
        </div>

        {/* Article Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {published.map((published) => (
            <ArticleCard
              key={published.id}
              article={published}
              onClick={() => {
                localStorage.setItem(
                  "editArticle",
                  JSON.stringify(published)
                );
                navigate("/edit");
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;