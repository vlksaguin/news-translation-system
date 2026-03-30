import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DIALECTS, DIALECT_CODE_TO_LABEL } from "../constants/languages";

const DEFAULT_LANGUAGE = "tl";
const PUBLIC_LANGUAGE_STORAGE_KEY = "publicSelectedLanguage";

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString();
}

function PublicHome() {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const saved = localStorage.getItem(PUBLIC_LANGUAGE_STORAGE_KEY);
    return saved || DEFAULT_LANGUAGE;
  });
  const [publishedArticles, setPublishedArticles] = useState([]);

  useEffect(() => {
    const published = JSON.parse(localStorage.getItem("published")) || [];
    
    // Group by sourceArticleId to get unique articles with all language versions
    const articlesBySource = {};
    published.forEach((article) => {
      const sourceId = article.sourceArticleId || article.id?.split("_")[0];
      if (!articlesBySource[sourceId]) {
        articlesBySource[sourceId] = {
          id: sourceId,
          author: article.author || "Unknown",
          publishedAt: article.publishedAt,
          category: article.category || "News",
          translations: {},
        };
      }
      
      // Map language to our dialect codes
      const languageCode = article.language?.toLowerCase() || "en";
      if (languageCode !== "en") {
        articlesBySource[sourceId].translations[languageCode] = {
          title: article.title,
          body: article.body,
        };
      }
    });

    setPublishedArticles(Object.values(articlesBySource));
  }, []);

  const visibleArticles = useMemo(
    () =>
      publishedArticles.map((article) => {
        const fallbackCode = Object.keys(article.translations)[0];
        const activeCode = article.translations[selectedLanguage]
          ? selectedLanguage
          : fallbackCode;

        return {
          ...article,
          activeCode,
          content: article.translations[activeCode] || { title: "Untitled", body: "" },
        };
      }),
    [publishedArticles, selectedLanguage]
  );

  function handleLanguageChange(nextLanguage) {
    setSelectedLanguage(nextLanguage);
    localStorage.setItem(PUBLIC_LANGUAGE_STORAGE_KEY, nextLanguage);
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Paraluman Public Demo</h1>
            <p className="text-slate-600 text-sm">Browse articles in your preferred Philippine language.</p>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="public-language" className="text-sm font-medium text-slate-700">
              Language
            </label>
            <select
              id="public-language"
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="border border-slate-300 rounded px-3 py-2 bg-white"
            >
              {DIALECTS.map((dialect) => (
                <option key={dialect.code} value={dialect.code}>
                  {dialect.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {visibleArticles.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <p className="text-slate-600">No published articles yet.</p>
            <p className="text-sm text-slate-500 mt-2">Articles published in the editor will appear here.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {visibleArticles.map((article) => (
              <article
                key={article.id}
                className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/public/article/${article.id}`)}
              >
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">{article.category}</p>
                <h2 className="text-xl font-semibold mb-2 text-slate-900">{article.content.title}</h2>
                <p className="text-slate-700 line-clamp-3">{article.content.body}</p>

                <div className="mt-4 text-xs text-slate-500 flex justify-between">
                  <span>{article.author}</span>
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicHome;