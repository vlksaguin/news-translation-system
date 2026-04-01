import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DIALECTS, DIALECT_CODE_TO_LABEL } from "../constants/languages";
import { PUBLIC_ARTICLES, PUBLIC_LANGUAGE_STORAGE_KEY } from "../data/publicArticles";

const DEFAULT_LANGUAGE = "en";

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
  const [article, setArticle] = useState(() => 
    PUBLIC_ARTICLES.find((item) => item.id === articleId) || null
  );

  useEffect(() => {
    setArticle(PUBLIC_ARTICLES.find((item) => item.id === articleId) || null);
  }, [articleId]);

  const relatedStories = useMemo(
    () => PUBLIC_ARTICLES.filter((item) => item.id !== articleId).slice(0, 4),
    [articleId]
  );

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
            onClick={() => navigate("/public")}
            className="btn-primary mt-4"
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
    <div className="page-enter min-h-screen bg-transparent">
      <div className="shell max-w-6xl py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate("/public")}
            className="btn-secondary"
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
            <div className="overflow-hidden rounded-2xl">
              <img src={article.leadImage} alt={content.title} className="h-[380px] w-full object-cover" />
            </div>
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

          <aside className="lg:col-span-4">
            <div className="surface p-4">
              <h3 className="mb-4 border-l-4 border-purple-700 pl-2 text-lg font-bold uppercase tracking-wide text-slate-900">Related News</h3>
              <div className="space-y-4">
                {relatedStories.map((item) => {
                  const fallbackCode = Object.keys(item.translations)[0];
                  const itemCode = item.translations[selectedLanguage] ? selectedLanguage : fallbackCode;
                  const itemContent = item.translations[itemCode];
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(`/public/article/${item.id}`)}
                      className="flex w-full gap-3 border-b border-slate-200 pb-3 text-left last:border-b-0"
                    >
                      <img src={item.leadImage} alt={itemContent.title} className="h-16 w-20 rounded object-cover" />
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-purple-700">{item.category}</p>
                        <p className="text-sm font-semibold leading-snug text-slate-900 line-clamp-2">{itemContent.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default PublicArticle;