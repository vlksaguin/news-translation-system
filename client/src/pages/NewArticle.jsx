import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { translateText } from "../api/api";
import LoadingModal from "../components/LoadingModal";
import { DIALECTS } from "../constants/languages";

const DRAFT_STORAGE_KEY = "newArticleDraft";
const DRAFT_META_STORAGE_KEY = "newArticleDraftMeta";

function NewArticle() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState(() => localStorage.getItem("user") || "");
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);
  const [showDraftRestored, setShowDraftRestored] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState(null);
  const [translationProgress, setTranslationProgress] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const storedDraft = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY));
    const storedMeta = JSON.parse(localStorage.getItem(DRAFT_META_STORAGE_KEY));

    if (storedMeta?.draftId) {
      setEditingDraftId(storedMeta.draftId);
    }

    if (!storedDraft) {
      setIsDraftHydrated(true);
      return;
    }

    const restoredTitle = storedDraft.title || "";
    const restoredBody = storedDraft.body || "";
    const restoredAuthor = storedDraft.author || localStorage.getItem("user") || "";

    setTitle(restoredTitle);
    setBody(restoredBody);
    setAuthor(restoredAuthor);

    if (restoredTitle || restoredBody || restoredAuthor) {
      setShowDraftRestored(true);
    }

    setIsDraftHydrated(true);
  }, []);

  useEffect(() => {
    if (!isDraftHydrated) {
      return;
    }

    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ title, body, author }));
  }, [title, body, author, isDraftHydrated]);

  function buildBaseArticle(status = "draft") {
    return {
      id: editingDraftId || Date.now().toString(),
      source: {
        language: "en",
        title,
        body,
      },
      translations: {},
      author: author || "Unknown",
      status,
      createdAt: new Date().toISOString(),
    };
  }

  function upsertArticle(article) {
    const articles = JSON.parse(localStorage.getItem("articles")) || [];
    const existingIndex = articles.findIndex((item) => item.id === article.id);

    if (existingIndex >= 0) {
      articles[existingIndex] = article;
    } else {
      articles.push(article);
    }

    localStorage.setItem("articles", JSON.stringify(articles));
  }

  function handleSaveDraft() {
    if (!title.trim() || !body.trim()) {
      alert("Please provide both title and body before saving as draft.");
      return;
    }

    try {
      const draftArticle = buildBaseArticle("draft");
      upsertArticle(draftArticle);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      localStorage.removeItem(DRAFT_META_STORAGE_KEY);
      localStorage.removeItem("currArticle");
      navigate("/dashboard");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save draft. Please try again.");
    }
  }

  async function handleTranslate(e) {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      alert("Please provide both title and body before translating.");
      return;
    }

    setIsTranslating(true);
    setTranslationProgress(
      Object.fromEntries(DIALECTS.map((dialect) => [dialect.code, "translating"]))
    );
    try {
      const baseArticle = buildBaseArticle("for_review");
      const targetLanguages = DIALECTS.map((dialect) => dialect.code);

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
      const nextProgress = {};
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
          reviewerComment: isSuccess ? "" : "Translation failed. Needs manual rewrite",
          reviewedAt: null,
        };

        nextProgress[dialect.code] = isSuccess ? "done" : "failed";
      }

      setTranslationProgress(nextProgress);

      const translatedArticle = {
        ...baseArticle,
        translations,
      };

      upsertArticle(translatedArticle);
      localStorage.setItem("currArticle", JSON.stringify(translatedArticle));
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      localStorage.removeItem(DRAFT_META_STORAGE_KEY);
      navigate("/review");
    } catch (error) {
      console.error("Translate failed:", error);
      alert("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  }

  return (
    <div className="page-enter min-h-screen bg-transparent">
      <LoadingModal isOpen={isTranslating} message="Translating to 6 Filipino dialects..." />
      <div className="shell py-6">
        <div className="surface mx-auto max-w-4xl p-6 md:p-8">
        <h1 className="brand-heading mb-2 text-3xl font-bold text-slate-900">Create New Article</h1>
        <p className="mb-4 text-sm text-slate-600">Draft in English first, then generate six dialect versions for review.</p>
        {showDraftRestored && (
          <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Draft restored from your previous edit.
          </div>
        )}

        <form onSubmit={handleTranslate}>
          <input
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            disabled={isTranslating}
            className="field mb-3"
          />

          <input
            placeholder="English Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isTranslating}
            className="field mb-3"
          />

          <textarea
            placeholder="English Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isTranslating}
            className="field mb-3 h-44"
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isTranslating}
              className="btn-secondary"
            >
              Save as Draft
            </button>
            <button type="submit" disabled={isTranslating} className="btn-primary">
              {isTranslating ? "Translating..." : "Translate"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-sm text-slate-600">
          <p>Save as Draft stores English only. Translate generates all 6 dialects and opens review.</p>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {DIALECTS.map((dialect) => {
            const status = translationProgress[dialect.code] || "pending";
            return (
              <div key={dialect.code} className="surface-muted flex items-center justify-between px-3 py-2 text-sm">
                <span>{dialect.label}</span>
                <span className="font-semibold capitalize">{status.replace("_", " ")}</span>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
}

export default NewArticle;