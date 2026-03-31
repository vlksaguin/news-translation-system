import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DIALECTS } from "../constants/languages";
import { PUBLIC_ARTICLES, PUBLIC_LANGUAGE_STORAGE_KEY } from "../data/publicArticles";

const DEFAULT_LANGUAGE = "en";
const HOME_CATEGORIES = ["Latest News", "Politics", "Business", "Technology", "Health", "Sports", "Lifestyle"];

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
  const [publishedArticles, setPublishedArticles] = useState(PUBLIC_ARTICLES);

  useEffect(() => {
    setPublishedArticles(PUBLIC_ARTICLES);
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

  const featuredStory = visibleArticles[0] || null;
  const latestStories = visibleArticles.slice(1, 5);
  const streamStories = visibleArticles.slice(1);

  function handleLanguageChange(nextLanguage) {
    setSelectedLanguage(nextLanguage);
    localStorage.setItem(PUBLIC_LANGUAGE_STORAGE_KEY, nextLanguage);
  }

  return (
    <div className="page-enter min-h-screen bg-transparent">
      <div className="shell py-6">
        <div className="mb-4 border-b border-purple-200 pb-3">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-600">
            <span>{new Date().toLocaleDateString()}</span>
            <span>Paraluman News Network</span>
          </div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h1 className="brand-heading text-5xl font-bold text-purple-800">paraluman.</h1>
            <div className="flex items-center gap-2">
              <label htmlFor="public-language" className="text-sm font-medium text-slate-700">
                Language
              </label>
              <select
                id="public-language"
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="field min-w-[180px]"
              >
                {DIALECTS.map((dialect) => (
                  <option key={dialect.code} value={dialect.code}>
                    {dialect.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-purple-100 pt-2 text-sm font-semibold text-slate-700">
            {HOME_CATEGORIES.map((item) => (
              <button key={item} className="transition hover:text-purple-700">
                {item}
              </button>
            ))}
          </div>
        </div>

        {!featuredStory ? (
          <div className="surface p-8 text-center">
            <p className="text-slate-600">No published articles yet.</p>
            <p className="text-sm text-slate-500 mt-2">Articles published in the editor will appear here.</p>
          </div>
        ) : (
          <>
            <section className="grid gap-5 lg:grid-cols-12">
              <article
                className="relative overflow-hidden rounded-2xl lg:col-span-8"
                onClick={() => navigate(`/public/article/${featuredStory.id}`)}
              >
                <img
                  src={featuredStory.leadImage}
                  alt={featuredStory.content.title}
                  className="h-[420px] w-full cursor-pointer object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <div className="absolute bottom-0 p-6 text-white">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-200">{featuredStory.category}</p>
                  <h2 className="brand-heading mb-2 max-w-3xl text-4xl font-bold leading-tight">{featuredStory.content.title}</h2>
                  <p className="max-w-2xl text-sm text-slate-200">{featuredStory.summary}</p>
                  <p className="mt-3 text-xs text-slate-300">{featuredStory.author} · {formatDate(featuredStory.publishedAt)}</p>
                </div>
              </article>

              <aside className="surface p-4 lg:col-span-4">
                <h3 className="mb-3 border-l-4 border-purple-700 pl-2 text-lg font-bold uppercase tracking-wide text-slate-900">Latest News</h3>
                <div className="space-y-4">
                  {latestStories.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => navigate(`/public/article/${article.id}`)}
                      className="flex w-full items-start gap-3 border-b border-slate-200 pb-3 text-left last:border-b-0"
                    >
                      <img src={article.leadImage} alt={article.content.title} className="h-16 w-20 rounded object-cover" />
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-purple-700">{article.category}</p>
                        <p className="text-sm font-semibold leading-snug text-slate-900 line-clamp-2">{article.content.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </aside>
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-3">
              {visibleArticles.slice(2, 5).map((article) => (
                <button
                  key={article.id}
                  onClick={() => navigate(`/public/article/${article.id}`)}
                  className="overflow-hidden rounded-xl bg-white text-left shadow-sm transition hover:shadow-md"
                >
                  <img src={article.leadImage} alt={article.content.title} className="h-40 w-full object-cover" />
                  <div className="p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">{article.category}</p>
                    <p className="mt-1 text-base font-bold leading-snug text-slate-900 line-clamp-2">{article.content.title}</p>
                  </div>
                </button>
              ))}
            </section>

            <section className="mt-7 grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <h3 className="mb-4 border-l-4 border-purple-700 pl-2 text-xl font-bold uppercase tracking-wide text-slate-900">More Stories</h3>
                <div className="space-y-4">
                  {streamStories.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => navigate(`/public/article/${article.id}`)}
                      className="flex w-full gap-4 border-b border-slate-200 pb-4 text-left"
                    >
                      <img src={article.leadImage} alt={article.content.title} className="h-28 w-44 rounded-lg object-cover" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">{article.category}</p>
                        <h4 className="mt-1 text-xl font-bold leading-snug text-slate-900">{article.content.title}</h4>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{article.summary}</p>
                        <p className="mt-2 text-xs text-slate-500">{article.author} · {formatDate(article.publishedAt)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <aside className="lg:col-span-4">
                <div className="surface p-4">
                  <h3 className="mb-3 border-l-4 border-purple-700 pl-2 text-lg font-bold uppercase tracking-wide text-slate-900">Trending</h3>
                  <ol className="space-y-3">
                    {visibleArticles.slice(0, 5).map((article, index) => (
                      <li key={article.id}>
                        <button onClick={() => navigate(`/public/article/${article.id}`)} className="flex w-full gap-3 text-left">
                          <span className="text-lg font-extrabold text-purple-700">{index + 1}</span>
                          <span className="text-sm font-semibold leading-snug text-slate-800">{article.content.title}</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>
              </aside>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default PublicHome;