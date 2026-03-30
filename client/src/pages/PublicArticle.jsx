import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

function PublicArticle() {
  const navigate = useNavigate();
  const { articleId } = useParams();
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const saved = localStorage.getItem(PUBLIC_LANGUAGE_STORAGE_KEY);
    return saved || DEFAULT_LANGUAGE;
  });
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const published = JSON.parse(localStorage.getItem("published")) || [];
    
    // Find all entries for this article
    const articleEntries = published.filter((p) => {
      const sourceId = p.sourceArticleId || p.id?.split("_")[0];
      return sourceId === articleId;
    });

    if (articleEntries.length === 0) {
      setArticle(null);
      return;
    }

    // Build article structure
    const englishEntry = articleEntries.find((p) => p.language === "EN" || !p.language);
    if (!englishEntry) {
      setArticle(null);
      return;
    }

    const translations = {};
    articleEntries.forEach((entry) => {
      const languageCode = entry.language?.toLowerCase() || "en";
      if (languageCode !== "en") {
        translations[languageCode] = {
          title: entry.title,
          body: entry.body,
        };
      }
    });

    setArticle({
      id: articleId,
      author: englishEntry.author || "Unknown",
      publishedAt: englishEntry.publishedAt,
      category: englishEntry.category || "News",
      translations,
    });
  }, [articleId]);

  const { activeCode, content } = useMemo(() => {
    if (!article) return { activeCode: DEFAULT_LANGUAGE, content: null };

    const fallbackCode = Object.keys(article.translations)[0];
    const code = article.translations[selectedLanguage] ? selectedLanguage : fallbackCode;

    return {
      activeCode: code,
      content: article.translations[code] || { title: "Untitled", body: "" },
    };
  }, [article, selectedLanguage]);

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="max-w-3xl mx-auto bg-white border rounded-xl p-6">
          <h1 className="text-xl font-semibold">Article not found.</h1>
          <button
            onClick={() => navigate("/public")}
            className="mt-4 bg-slate-800 text-white px-4 py-2 rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  function handleLanguageChange(nextLanguage) {
    setSelectedLanguage(nextLanguage);
    localStorage.setItem(PUBLIC_LANGUAGE_STORAGE_KEY, nextLanguage);
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate("/public")}
            className="px-4 py-2 rounded bg-white border border-slate-300 text-slate-700"
          >
            Back to Home
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="article-language" className="text-sm font-medium text-slate-700">
              Article language
            </label>
            <select
              id="article-language"
              value={activeCode}
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

        <article className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">{article.category}</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">{content.title}</h1>
          <p className="text-sm text-slate-500 mb-6">
            {article.author} · {formatDate(article.publishedAt)} · {DIALECT_CODE_TO_LABEL[activeCode]}
          </p>

          <p className="text-lg leading-8 text-slate-800 whitespace-pre-wrap">{content.body}</p>
        </article>
      </div>
    </div>
  );
}

export default PublicArticle;