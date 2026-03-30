import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingModal from "../components/LoadingModal";
import { DIALECTS, DIALECT_CODE_TO_LABEL } from "../constants/languages";

const DRAFT_STORAGE_KEY = "newArticleDraft";

/** 
for adapting old articles
function normalizeLegacyArticle(stored) {
  if (!stored) {
    return null;
  }

  if (stored.source && stored.translations) {
    return stored;
  }

  return {
    id: stored.id || Date.now().toString(),
    source: {
      language: "en",
      title: stored.title_en || "",
      body: stored.body_en || "",
    },
    translations: {
      tl: {
        language: "tl",
        title: stored.title_fil || "",
        body: stored.body_fil || "",
        translationStatus: "done",
        reviewStatus: "needs_review",
        reviewerName: "",
        reviewerComment: "",
        reviewedAt: null,
      },
    },
    author: stored.author || "Unknown",
    status: stored.status || "review",
    createdAt: stored.createdAt || new Date().toISOString(),
  };
} */

function ReviewArticle() {
  const [article, setArticle] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("tl");
  const [isPublishing, setIsPublishing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("currArticle"));
    // const normalized = normalizeLegacyArticle(stored);
    setArticle(stored);
    
    const availableCode = Object.keys(stored.translations)[0];
      if (availableCode) {
        setSelectedLanguage(availableCode);
      }
    // if (normalized?.translations && !normalized.translations[selectedLanguage]) {
    //   const availableCode = Object.keys(normalized.translations)[0];
    //   if (availableCode) {
    //     setSelectedLanguage(availableCode);
    //   }
    // }
  }, []);

  const selectedTranslation = useMemo(() => {
    if (!article) {
      return null;
    }

    return article.translations?.[selectedLanguage] || null;
  }, [article, selectedLanguage]);

  // switching the currently editable article
  function updateSelectedTranslation(field, value) {
    setArticle((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [selectedLanguage]: {
          ...prev.translations[selectedLanguage],
          [field]: value,
        },
      },
    }));
  }
  
  function updateReviewStatus(nextStatus) {
    const reviewedAt = nextStatus === "approved" ? new Date().toISOString() : null;
    setArticle((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [selectedLanguage]: {
          ...prev.translations[selectedLanguage],
          reviewStatus: nextStatus,
          reviewedAt,
        },
      },
    }));
  }

  async function approveArticle() {
    if (!article) {
      return;
    }

    setIsPublishing(true);
    try {
      const published = JSON.parse(localStorage.getItem("published")) || [];
      const id = Date.now().toString();
      const publishedAt = new Date().toISOString();
      const author = article.author || "Unknown";

      const englishArticle = {
        id: `${id}_en`,
        title: article.source.title,
        body: article.source.body,
        language: "EN",
        author,
        publishedAt,
        editedAt: null,
      };

      const translatedArticles = Object.entries(article.translations || {}).map(([code, translation]) => ({
        id: `${id}_${code}`,
        title: translation.title,
        body: translation.body,
        language: code.toUpperCase(),
        languageLabel: DIALECT_CODE_TO_LABEL[code] || code.toUpperCase(),
        reviewStatus: translation.reviewStatus || "needs_review",
        reviewerName: translation.reviewerName || "",
        reviewerComment: translation.reviewerComment || "",
        reviewedAt: translation.reviewedAt || null,
        author,
        publishedAt,
        editedAt: null,
      }));

      published.push(englishArticle, ...translatedArticles);
      localStorage.setItem("published", JSON.stringify(published));
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      localStorage.removeItem("currArticle");
      navigate("/dashboard");
    } finally {
      setIsPublishing(false);
    }
  }

  function handleGoBack() {
    localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({
        title: article?.source?.title || "",
        body: article?.source?.body || "",
        author: article?.author || localStorage.getItem("user") || "",
      })
    );
    navigate("/new");
  }

  if (!article || !selectedTranslation) {
    return <div className="min-h-screen bg-gray-100 p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <LoadingModal isOpen={isPublishing} message="Publishing approved article..." />

    {/* switching which article to edit */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {DIALECTS.filter((dialect) => article.translations?.[dialect.code]).map((dialect) => (
            <button
              key={dialect.code}
              onClick={() => setSelectedLanguage(dialect.code)}
              className={`px-3 py-2 text-sm rounded ${
                selectedLanguage === dialect.code ? "bg-purple-700 text-white" : "bg-white border"
              }`}
            >
              {dialect.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-4 shadow">
            <h2 className="font-bold mb-2">English Source</h2>
            <input value={article.source.title} disabled readOnly className="border p-2 w-full mb-2" />
            <textarea value={article.source.body} disabled readOnly className="border p-2 w-full h-64" />
          </div>

          <div className="bg-white p-4 shadow">
            <h2 className="font-bold mb-2">{DIALECT_CODE_TO_LABEL[selectedLanguage]} Review</h2>
            <input
              value={selectedTranslation.title}
              onChange={(e) => updateSelectedTranslation("title", e.target.value)}
              disabled={isPublishing}
              className="border p-2 w-full mb-2"
            />
            <textarea
              value={selectedTranslation.body}
              onChange={(e) => updateSelectedTranslation("body", e.target.value)}
              disabled={isPublishing}
              className="border p-2 w-full h-40 mb-3"
            />

            <div className="grid sm:grid-cols-2 gap-2 mb-2">
              <select
                value={selectedTranslation.reviewStatus || "needs_review"}
                onChange={(e) => updateReviewStatus(e.target.value)}
                disabled={isPublishing}
                className="border p-2"
              >
                <option value="needs_review">Needs Review</option>
                <option value="approved">Approved</option>
                <option value="changes_requested">Changes Requested</option>
              </select>

              <input
                value={selectedTranslation.reviewerName || ""}
                onChange={(e) => updateSelectedTranslation("reviewerName", e.target.value)}
                disabled={isPublishing}
                placeholder="Reviewer name"
                className="border p-2"
              />
            </div>

            <textarea
              value={selectedTranslation.reviewerComment || ""}
              onChange={(e) => updateSelectedTranslation("reviewerComment", e.target.value)}
              disabled={isPublishing}
              placeholder="Reviewer comment"
              className="border p-2 w-full h-20"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={handleGoBack} disabled={isPublishing} className="bg-gray-600 text-white px-6 py-2">
            Go Back and Edit English
          </button>
          <button
            onClick={approveArticle}
            disabled={isPublishing}
            className="bg-purple-700 text-white px-6 py-2"
          >
            {isPublishing ? "Publishing..." : "Approve & Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewArticle;