import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DIALECTS, DIALECT_CODE_TO_LABEL } from "../constants/languages";
import { PUBLIC_ARTICLES, PUBLIC_LANGUAGE_STORAGE_KEY } from "../data/publicArticles";

const DEFAULT_LANGUAGE = "tl";
const PREVIEW_STORAGE_KEY = "previewArticle";

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString();
}

function PreviewArticle() {
  const navigate = useNavigate();
  const { articleId } = useParams();
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const saved = localStorage.getItem(PUBLIC_LANGUAGE_STORAGE_KEY);
    return saved || DEFAULT_LANGUAGE;
  });
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const previewMeta = JSON.parse(localStorage.getItem(PREVIEW_STORAGE_KEY) || "null");
    const sourceId = previewMeta?.sourceId || articleId;

    const published = JSON.parse(localStorage.getItem("published") || "[]");
    const sourceEntries = published.filter((item) => {
      const itemSourceId = item.sourceArticleId || item.id?.split("_")[0];
      return itemSourceId === sourceId;
    });

    if (sourceEntries.length > 0) {
      const englishEntry = sourceEntries.find((item) => (item.language || "").toUpperCase() === "EN") || sourceEntries[0];
      const translations = {
        en: {
          title: englishEntry.title || "Untitled",
          body: englishEntry.body || "",
          summary: englishEntry.summary || "",
        },
      };

      sourceEntries.forEach((entry) => {
        const code = String(entry.language || "").toLowerCase();
        if (!code || code === "en") {
          return;
        }

        translations[code] = {
          title: entry.title || translations.en.title,
          body: entry.body || translations.en.body,
          summary: entry.summary || "",
        };
      });

      setArticle({
        id: sourceId,
        category: englishEntry.category || "News",
        author: englishEntry.author || "Unknown",
        publishedAt: englishEntry.publishedAt || new Date().toISOString(),
        translations,
      });
      return;
    }

    const draftOrReview = (JSON.parse(localStorage.getItem("articles") || "[]")).find((item) => item.id === sourceId);
    if (draftOrReview) {
      const translations = {
        en: {
          title: draftOrReview.source?.title || "Untitled",
          body: draftOrReview.source?.body || "",
          summary: "",
        },
      };

      Object.entries(draftOrReview.translations || {}).forEach(([code, value]) => {
        translations[code] = {
          title: value?.title || translations.en.title,
          body: value?.body || translations.en.body,
          summary: value?.summary || "",
        };
      });

      setArticle({
        id: draftOrReview.id,
        category: draftOrReview.category || "News",
        author: draftOrReview.author || "Unknown",
        publishedAt: draftOrReview.createdAt || new Date().toISOString(),
        translations,
      });
      return;
    }
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
      <div className="page-enter min-h-screen bg-transparent p-8">
        <div className="surface mx-auto max-w-3xl p-6">
          <h1 className="brand-heading text-2xl font-bold text-slate-900">Article not found.</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-primary mt-4"
          >
            Back to Dashboard
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
    <div className="page-enter min-h-screen bg-transparent">
      <div className="shell max-w-6xl py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-secondary"
          >
            Back to Dashboard
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="article-language" className="text-sm font-medium text-slate-700">
              Article language
            </label>
            <select
              id="article-language"
              value={activeCode}
              onChange={(e) => handleLanguageChange(e.target.value)}
                className="field max-w-[140px] text-sm max-h-11"
            >
              {DIALECTS.map((dialect) => (
                <option key={dialect.code} value={dialect.code}>
                  {dialect.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <article className="lg:col-span-8">
            <div className="mt-5">
              <p className="mb-2 text-xs uppercase tracking-wide text-purple-700">{article.category}</p>
              <h1 className="brand-heading mb-3 md:text-5xl text-4xl font-bold leading-tight text-slate-900">{content.title}</h1>
              <p className="mb-5 md:text-sm text-xs text-slate-500">
                {article.author} · {formatDate(article.publishedAt)} · {DIALECT_CODE_TO_LABEL[activeCode]}
              </p>
              <p className="mb-6 text-lg font-semibold text-slate-700">{content.summary}</p>
              <p className="md:text-xl text-lg leading-9 text-slate-800 whitespace-pre-wrap">{content.body}</p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

export default PreviewArticle;