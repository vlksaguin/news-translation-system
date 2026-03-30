import React from "react";
import { useEffect, useState } from "react";
import ArticleCard from "../components/ArticleCard";
import { useNavigate } from "react-router-dom";

const DRAFT_STORAGE_KEY = "newArticleDraft";
const DRAFT_META_STORAGE_KEY = "newArticleDraftMeta";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "for_review", label: "For Review" },
  { key: "published", label: "Published" },
];

function getDashboardStatus(article) {
  // If it's from "articles" list, use its status field
  if (article.status && article.status !== "published") {
    return article.status;
  }

  // If it's from "published" list
  if (article.status === "published" || article.language === "EN") {
    return "published";
  }

  return "for_review";
}

function Dashboard() {
  const [allArticles, setAllArticles] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    // Load from both articles (drafts) and published
    const articles = JSON.parse(localStorage.getItem("articles")) || [];
    const published = JSON.parse(localStorage.getItem("published")) || [];

    // For published articles, we only show the English version as the base
    // Group by sourceArticleId to represent one article per source
    const publishedBySourceId = {};
    published.forEach((article) => {
      if (article.language === "EN" || !article.language) {
        publishedBySourceId[article.id] = article;
      }
    });

    // Combine draft and published articles
    const combined = [
      ...articles,
      ...Object.values(publishedBySourceId),
    ];

    setAllArticles(combined);
  }, []);

  const withStatus = allArticles.map((article) => ({
    ...article,
    dashboardStatus: getDashboardStatus(article),
  }));

  const counts = withStatus.reduce(
    (acc, article) => {
      acc[article.dashboardStatus] += 1;
      acc.all += 1;
      return acc;
    },
    { all: 0, draft: 0, for_review: 0, published: 0 }
  );

  const filtered =
    activeFilter === "all"
      ? withStatus
      : withStatus.filter((article) => article.dashboardStatus === activeFilter);

  function handleCardClick(article) {
    // Drafts should return to the English input form.
    if (article.status === "draft") {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          title: article.source?.title || "",
          body: article.source?.body || "",
          author: article.author || "",
        })
      );
      localStorage.setItem(
        DRAFT_META_STORAGE_KEY,
        JSON.stringify({ draftId: article.id })
      );
      localStorage.removeItem("currArticle");
      navigate("/new");
      return;
    }

    // For review items should open translation editing.
    if (article.status === "for_review") {
      localStorage.setItem("currArticle", JSON.stringify(article));
      localStorage.removeItem("editArticle");
      navigate("/review");
      return;
    }

    // If it's published, open for editing
    localStorage.setItem("editArticle", JSON.stringify(article));
    navigate("/edit");
  }

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

        <div className="mb-6 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`rounded-full px-4 py-2 text-sm ${
                activeFilter === filter.key ? "bg-purple-700 text-white" : "bg-white border"
              }`}
            >
              {filter.label} ({counts[filter.key]})
            </button>
          ))}
        </div>

        {/* Article Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              status={article.dashboardStatus}
              onClick={() => handleCardClick(article)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;