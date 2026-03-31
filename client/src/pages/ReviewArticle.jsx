import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { translateText } from "../api/api";
import LoadingModal from "../components/LoadingModal";
import { DIALECTS, DIALECT_CODE_TO_LABEL } from "../constants/languages";

function getStatusColor(reviewStatus) {
  if (reviewStatus === "approved") {
    return "bg-emerald-500";
  }

  if (reviewStatus === "changes_requested") {
    return "bg-amber-500";
  }

  return "bg-slate-400";
}

function ReviewArticle() {
  const [article, setArticle] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("tl");
  const [isGeneratingTranslations, setIsGeneratingTranslations] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Load draft article from articles list
    const stored = JSON.parse(localStorage.getItem("currArticle"));
    if (!stored) {
      navigate("/dashboard");
      return;
    }

    // Set initial status to "for_review" and generate translations
    const initialArticle = {
      ...stored,
      status: "for_review",
    };

    // If no translations yet, generate them
    if (!stored.translations || Object.keys(stored.translations).length === 0) {
      generateTranslations(initialArticle);
    } else {
      setArticle(initialArticle);
      const availableCode = Object.keys(initialArticle.translations)[0];
      if (availableCode) {
        setSelectedLanguage(availableCode);
      }
    }
  }, []);

  async function generateTranslations(baseArticle) {
    setIsGeneratingTranslations(true);
    try {
      const targetLanguages = DIALECTS.map((dialect) => dialect.code);
      const title = baseArticle.source.title;
      const body = baseArticle.source.body;

      const titleResults = [];
      const bodyResults = [];
      for (const targetLanguage of targetLanguages) {
        try {
          const translatedTitle = await translateText(title, targetLanguage);
          titleResults.push({
            targetLanguage,
            ok: true,
            translation: translatedTitle,
            error: null,
          });
        } catch (error) {
          titleResults.push({
            targetLanguage,
            ok: false,
            translation: title,
            error: error?.response?.data?.error || error?.message || "Translation failed",
          });
        }

        try {
          const translatedBody = await translateText(body, targetLanguage);
          bodyResults.push({
            targetLanguage,
            ok: true,
            translation: translatedBody,
            error: null,
          });
        } catch (error) {
          bodyResults.push({
            targetLanguage,
            ok: false,
            translation: body,
            error: error?.response?.data?.error || error?.message || "Translation failed",
          });
        }
      }

      const titleResultMap = Object.fromEntries(
        titleResults.map((result) => [result.targetLanguage, result])
      );
      const bodyResultMap = Object.fromEntries(
        bodyResults.map((result) => [result.targetLanguage, result])
      );

      const translations = {};
      for (const dialect of DIALECTS) {
        const titleResult = titleResultMap[dialect.code];
        const bodyResult = bodyResultMap[dialect.code];
        const isSuccess = Boolean(titleResult?.ok) && Boolean(bodyResult?.ok);

        translations[dialect.code] = {
          language: dialect.code,
          title: titleResult?.translation || title,
          body: bodyResult?.translation || body,
          translationStatus: isSuccess ? "done" : "failed",
          reviewStatus: "needs_review",
          reviewerName: "",
          reviewerComment: isSuccess ? "" : "Translation failed. Needs manual rewrite.",
          reviewedAt: null,
        };
      }

      const updatedArticle = {
        ...baseArticle,
        translations,
      };

      setArticle(updatedArticle);
      const availableCode = Object.keys(translations)[0];
      if (availableCode) {
        setSelectedLanguage(availableCode);
      }
    } catch (error) {
      console.error("Translation generation failed:", error);
      setValidationMessage("Failed to generate translations. Please try again.");
    } finally {
      setIsGeneratingTranslations(false);
    }
  }

  const selectedTranslation = useMemo(() => {
    if (!article) {
      return null;
    }
    return article.translations?.[selectedLanguage] || null;
  }, [article, selectedLanguage]);

  const allSixApproved = useMemo(() => {
    if (!article?.translations) {
      return false;
    }

    return DIALECTS.every((dialect) => article.translations[dialect.code]?.reviewStatus === "approved");
  }, [article]);

  function updateSelectedTranslation(field, value) {
    setValidationMessage("");
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
    setValidationMessage("");
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

  async function saveTranslationEdits() {
    if (!article) {
      return;
    }

    setIsSaving(true);
    setValidationMessage("");
    try {
      const articles = JSON.parse(localStorage.getItem("articles")) || [];
      const updatedArticles = articles.map((storedArticle) => {
        if (storedArticle.id !== article.id) {
          return storedArticle;
        }

        return {
          ...storedArticle,
          // Save only translated fields and review statuses; keep source content untouched.
          translations: article.translations,
          status: "for_review",
        };
      });

      localStorage.setItem("articles", JSON.stringify(updatedArticles));
      localStorage.setItem("currArticle", JSON.stringify({
        ...article,
        status: "for_review",
      }));
      setValidationMessage("Translated fields saved.");
    } finally {
      setIsSaving(false);
      handleGoBack();
    }
  }

  // Publish only if all languages are approved
  async function publishArticle() {
    if (!article) {
      return;
    }

    if (!allSixApproved) {
      setValidationMessage("Approve all 6 dialects before publishing.");
      return;
    }

    setIsPublishing(true);
    try {
      // Get existing articles and published lists
      const articles = JSON.parse(localStorage.getItem("articles")) || [];
      const published = JSON.parse(localStorage.getItem("published")) || [];

      // Remove draft from articles list
      const updatedArticles = articles.filter((a) => a.id !== article.id);
      localStorage.setItem("articles", JSON.stringify(updatedArticles));

      // Create published entries
      const id = article.id;
      const publishedAt = new Date().toISOString();
      const author = article.author || "Unknown";

      const englishArticle = {
        id: `${id}_en`,
        title: article.source.title,
        body: article.source.body,
        language: "EN",
        languageLabel: "English",
        author,
        publishedAt,
        editedAt: null,
        status: "published",
        sourceArticleId: id,
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
        status: "published",
        sourceArticleId: id,
      }));

      published.push(englishArticle, ...translatedArticles);
      localStorage.setItem("published", JSON.stringify(published));

      // Clean up temporary storage
      localStorage.removeItem("currArticle");

      navigate("/dashboard");
    } finally {
      setIsPublishing(false);
    }
  }

  function handleGoBack() {
    setValidationMessage("");
    localStorage.removeItem("currArticle");
    navigate("/dashboard");
  }

  function handleEditEnglish() {
    if (!article) return;
    
    setValidationMessage("");
    // Save article back as draft
    const articles = JSON.parse(localStorage.getItem("articles")) || [];
    const draftArticle = {
      ...article,
      status: "draft",
      translations: {}, // Clear translations to start fresh
    };
    
    const updatedArticles = articles.map((a) => (a.id === article.id ? draftArticle : a));
    if (!articles.find((a) => a.id === article.id)) {
      updatedArticles.push(draftArticle);
    }
    localStorage.setItem("articles", JSON.stringify(updatedArticles));
    
    // Preload into new article form
    const DRAFT_STORAGE_KEY = "newArticleDraft";
    const DRAFT_META_STORAGE_KEY = "newArticleDraftMeta";
    
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
  }

  if (!article) {
    return <div className="min-h-screen bg-gray-100 p-6">Loading...</div>;
  }

  if (isGeneratingTranslations) {
    return <div className="min-h-screen bg-gray-100"><LoadingModal isOpen={true} message="Generating translations for all 6 dialects..." /></div>;
  }

  if (!selectedTranslation) {
    return <div className="min-h-screen bg-gray-100 p-6">No translations available. Please try again.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <LoadingModal isOpen={isPublishing} message="Publishing approved article..." />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Review Article</h1>
        <p className="text-sm text-gray-600 mb-4">Status: <span className="font-semibold">For Checking/For Review</span></p>

        {validationMessage && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {validationMessage}
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          {DIALECTS.filter((dialect) => article.translations?.[dialect.code]).map((dialect) => (
            <button
              key={dialect.code}
              onClick={() => setSelectedLanguage(dialect.code)}
              className={`px-3 py-2 text-sm rounded ${
                selectedLanguage === dialect.code ? "bg-purple-700 text-white" : "bg-white border"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${getStatusColor(
                    article.translations[dialect.code].reviewStatus
                  )}`}
                />
                {dialect.label}
              </span>
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
          {/* <button onClick={handleGoBack} disabled={isPublishing || isSaving} className="bg-gray-600 text-white px-6 py-2">
            Leave as For Review
          </button> */}
          <button onClick={handleEditEnglish} disabled={isPublishing || isSaving} className="bg-orange-600 text-white px-6 py-2">
            Go Back and Edit English
          </button>
          <button
            onClick={saveTranslationEdits}
            disabled={isPublishing || isSaving}
            className="bg-blue-700 text-white px-6 py-2"
          >
            {isSaving ? "Saving..." : "Save Translated Fields"}
          </button>
          <button
            onClick={publishArticle}
            disabled={isPublishing || isSaving || !allSixApproved}
            className={`px-6 py-2 text-white ${allSixApproved ? "bg-purple-700" : "bg-purple-300 cursor-not-allowed"}`}
            title={allSixApproved ? "" : "Approve all 6 dialects to enable publishing"}
          >
            {isPublishing ? "Publishing..." : "Publish (if all approved)"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewArticle;