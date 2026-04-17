import React, { useState, useEffect, useMemo } from "react";
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

function EditArticle() {
  const [article, setArticle] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("tl");
  const [isRetranslating, setIsRetranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("editArticle"));
    if (!stored) {
      navigate("/dashboard");
      return;
    }

    // Reconstruct article structure from published entry
    const sourceArticleId = stored.sourceArticleId || stored.id?.split("_")[0];
    const published = JSON.parse(localStorage.getItem("published")) || [];

    // Find all related published entries
    const allArticles = published.filter((p) => p.sourceArticleId === sourceArticleId);

    // Find English entry
    const englishEntry = allArticles.find((p) => p.language === "EN" || !p.language);

    if (!englishEntry) {
      navigate("/dashboard");
      return;
    }

    // Build translations object
    const translations = {};
    for (const dialect of DIALECTS) {
      const dialectEntry = allArticles.find((p) => p.language?.toLowerCase() === dialect);
      if (dialectEntry) {
        translations[dialect] = {
          language: dialect,
          title: dialectEntry.title,
          body: dialectEntry.body,
          translationStatus: "done",
          reviewStatus: dialectEntry.reviewStatus || "needs_review",
          reviewerName: dialectEntry.reviewerName || "",
          reviewerComment: dialectEntry.reviewerComment || "",
          reviewedAt: dialectEntry.reviewedAt || null,
        };
      }
    }

    const reconstructed = {
      id: sourceArticleId,
      sourceArticleId,
      source: {
        language: "en",
        title: englishEntry.title,
        body: englishEntry.body,
      },
      translations,
      author: englishEntry.author || "Unknown",
      status: "published",
      publishedAt: englishEntry.publishedAt,
      createdAt: englishEntry.createdAt,
    };

    setArticle(reconstructed);
    if (Object.keys(translations).length > 0) {
      const firstCode = Object.keys(translations)[0];
      setSelectedLanguage(firstCode);
    }
  }, [navigate]);

  async function retranslateDialects() {
    if (!article) return;

    setIsRetranslating(true);
    try {
      const targetLanguages = DIALECTS.map((dialect) => dialect.code);
      const title = article.source.title;
      const body = article.source.body;

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
        const titleResult = titleResultMap[dialect];
        const bodyResult = bodyResultMap[dialect];
        const isSuccess = Boolean(titleResult?.ok) && Boolean(bodyResult?.ok);

        translations[dialect] = {
          language: dialect,
          title: titleResult?.translation || title,
          body: bodyResult?.translation || body,
          translationStatus: isSuccess ? "done" : "failed",
          reviewStatus: "needs_review",
          reviewerName: "",
          reviewerComment: isSuccess ? "" : "Translation failed. Needs manual rewrite",
          reviewedAt: null,
        };
      }

      setArticle((prev) => ({
        ...prev,
        translations,
      }));
    } catch (error) {
      console.error("Retranslation failed:", error);
      setValidationMessage("Failed to retranslate. Please try again.");
    } finally {
      setIsRetranslating(false);
    }
  }

  const selectedTranslation = useMemo(() => {
    if (!article) return null;
    return article.translations?.[selectedLanguage] || null;
  }, [article, selectedLanguage]);

  const englishChanged = useMemo(() => {
    if (!article) return false;
    // Check if user edited English title or body
    return false; // Will be set in updateEnglish functions
  }, [article]);

  function updateEnglishTitle(value) {
    setValidationMessage("");
    setArticle((prev) => ({
      ...prev,
      source: {
        ...prev.source,
        title: value,
      },
      _englishChanged: true,
    }));
    // Trigger retranslation
    retranslateAfterEnglishChange({ ...article, source: { ...article.source, title: value }, _englishChanged: true });
  }

  function updateEnglishBody(value) {
    setValidationMessage("");
    setArticle((prev) => ({
      ...prev,
      source: {
        ...prev.source,
        body: value,
      },
      _englishChanged: true,
    }));
    // Trigger retranslation
    retranslateAfterEnglishChange({ ...article, source: { ...article.source, body: value }, _englishChanged: true });
  }

  async function retranslateAfterEnglishChange(updatedArticle) {
    setIsRetranslating(true);
    try {
      const targetLanguages = DIALECTS.map((dialect) => dialect.code);
      const title = updatedArticle.source.title;
      const body = updatedArticle.source.body;

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
        const titleResult = titleResultMap[dialect];
        const bodyResult = bodyResultMap[dialect];
        const isSuccess = Boolean(titleResult?.ok) && Boolean(bodyResult?.ok);

        translations[dialect] = {
          language: dialect,
          title: titleResult?.translation || title,
          body: bodyResult?.translation || body,
          translationStatus: isSuccess ? "done" : "failed",
          reviewStatus: "needs_review",
          reviewerName: "",
          reviewerComment: isSuccess ? "" : "Retranslation failed. Needs manual rewrite",
          reviewedAt: null,
        };
      }

      setArticle((prev) => ({
        ...prev,
        translations,
      }));
    } catch (error) {
      console.error("Retranslation failed:", error);
      setValidationMessage("Failed to retranslate. Please try again.");
    } finally {
      setIsRetranslating(false);
    }
  }

  function updateTranslationField(field, value) {
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

  async function handleSaveEdits() {
    if (!article) return;

    setIsSaving(true);
    try {
      const published = JSON.parse(localStorage.getItem("published")) || [];
      const nowIso = new Date().toISOString();

      const sourceArticleId = article.sourceArticleId || article.id;
      const updatedPublished = published.map((p) => {
        if (p.sourceArticleId !== sourceArticleId && p.id !== article.id) {
          return p;
        }

        // Update English entry
        if (p.language === "EN" || !p.language) {
          return {
            ...p,
            title: article.source.title,
            body: article.source.body,
            editedAt: article._englishChanged ? nowIso : p.editedAt || null,
          };
        }

        // Update dialect entries
        const dialectCode = p.language?.toLowerCase();
        const translation = article.translations?.[dialectCode];
        if (translation) {
          return {
            ...p,
            title: translation.title,
            body: translation.body,
            reviewStatus: translation.reviewStatus || "needs_review",
            reviewerName: translation.reviewerName || "",
            reviewerComment: translation.reviewerComment || "",
            reviewedAt: translation.reviewedAt || null,
            editedAt: article._englishChanged ? nowIso : p.editedAt || null,
          };
        }

        return p;
      });

      localStorage.setItem("published", JSON.stringify(updatedPublished));
      localStorage.removeItem("editArticle");
      navigate("/dashboard");
    } finally {
      setIsSaving(false);
    }
  }

  function handleGoBack() {
    setValidationMessage("");
    localStorage.removeItem("editArticle");
    navigate("/dashboard");
  }

  if (!article) {
    return <div className="min-h-screen bg-gray-100 p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <LoadingModal
        isOpen={isSaving || isRetranslating}
        message={isRetranslating ? "Retranslating dialects..." : "Saving edits..."}
      />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Edit Article</h1>
        <p className="text-sm text-gray-600 mb-4">
          Status: <span className="font-semibold">Published (Editing)</span>
        </p>

        {validationMessage && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {validationMessage}
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          {DIALECTS.filter((dialect) => article.translations?.[dialect]).map((dialect) => (
            <button
              key={dialect}
              onClick={() => setSelectedLanguage(dialect)}
              className={`px-3 py-2 text-sm rounded ${
                selectedLanguage === dialect ? "bg-[#9D0759] text-white" : "bg-white border-[#f8c9e1]"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${getStatusColor(
                    article.translations[dialect]?.reviewStatus
                  )}`}
                />
                {DIALECT_CODE_TO_LABEL[dialect] || dialect.toUpperCase()}
              </span>
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-4 shadow">
            <h2 className="font-bold mb-2">English Source</h2>
            <input
              value={article.source.title}
              onChange={(e) => updateEnglishTitle(e.target.value)}
              disabled={isSaving || isRetranslating}
              className="border p-2 w-full mb-2"
            />
            <textarea
              value={article.source.body}
              onChange={(e) => updateEnglishBody(e.target.value)}
              disabled={isSaving || isRetranslating}
              className="border p-2 w-full h-64"
            />
          </div>

          <div className="bg-white p-4 shadow">
            <h2 className="font-bold mb-2">{DIALECT_CODE_TO_LABEL[selectedLanguage]} Edit</h2>
            {selectedTranslation && (
              <>
                <input
                  value={selectedTranslation.title || ""}
                  onChange={(e) => updateTranslationField("title", e.target.value)}
                  disabled={isSaving || isRetranslating}
                  className="border p-2 w-full mb-2"
                />
                <textarea
                  value={selectedTranslation.body || ""}
                  onChange={(e) => updateTranslationField("body", e.target.value)}
                  disabled={isSaving || isRetranslating}
                  className="border p-2 w-full h-40 mb-3"
                />

                <div className="grid sm:grid-cols-2 gap-2 mb-2">
                  <select
                    value={selectedTranslation.reviewStatus || "needs_review"}
                    onChange={(e) => updateReviewStatus(e.target.value)}
                    disabled={isSaving || isRetranslating}
                    className="border p-2"
                  >
                    <option value="needs_review">Needs Review</option>
                    <option value="approved">Approved</option>
                    <option value="changes_requested">Changes Requested</option>
                  </select>

                  <input
                    value={selectedTranslation.reviewerName || ""}
                    onChange={(e) => updateTranslationField("reviewerName", e.target.value)}
                    disabled={isSaving || isRetranslating}
                    placeholder="Reviewer name"
                    className="border p-2"
                  />
                </div>

                <textarea
                  value={selectedTranslation.reviewerComment || ""}
                  onChange={(e) => updateTranslationField("reviewerComment", e.target.value)}
                  disabled={isSaving || isRetranslating}
                  placeholder="Reviewer comment"
                  className="border p-2 w-full h-20"
                />
              </>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleGoBack}
            disabled={isSaving || isRetranslating}
            className="bg-gray-600 text-white px-6 py-2"
          >
            Go Back
          </button>
          <button
            onClick={handleSaveEdits}
            disabled={isSaving || isRetranslating}
            className="bg-[#9D0759] text-white px-6 py-2"
          >
            {isSaving || isRetranslating ? "Saving..." : "Save Edits"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditArticle;