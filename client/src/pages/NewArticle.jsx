import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { translateText } from "../api/api";
import LoadingModal from "../components/LoadingModal";
import { DIALECTS } from "../constants/languages";

const DRAFT_STORAGE_KEY = "newArticleDraft";

function NewArticle() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState(() => localStorage.getItem("user") || "");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);
  const [showDraftRestored, setShowDraftRestored] = useState(false);
  const [translationProgress, setTranslationProgress] = useState({});

  const navigate = useNavigate();

  const progressEntries = useMemo(
    () => DIALECTS.map((dialect) => ({ ...dialect, status: translationProgress[dialect.code] || "pending" })),
    [translationProgress]
  );

  useEffect(() => {
    const storedDraft = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY));
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

  async function translateDialect(languageCode) {
    setTranslationProgress((prev) => ({ ...prev, [languageCode]: "translating" }));

    try {
      const translatedTitle = await translateText(title, languageCode);
      const translatedBody = await translateText(body, languageCode);

      setTranslationProgress((prev) => ({ ...prev, [languageCode]: "done" }));

      return {
        language: languageCode,
        title: translatedTitle,
        body: translatedBody,
        translationStatus: "done",
        reviewStatus: "needs_review",
        reviewerName: "",
        reviewerComment: "",
        reviewedAt: null,
      };
    } catch (error) {
      setTranslationProgress((prev) => ({ ...prev, [languageCode]: "failed" }));

      return {
        language: languageCode,
        title,
        body,
        translationStatus: "failed",
        reviewStatus: "needs_review",
        reviewerName: "",
        reviewerComment: "Translation failed. Needs manual rewrite.",
        reviewedAt: null,
      };
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      alert("Please provide both title and body before translation.");
      return;
    }

    setIsTranslating(true);
    setTranslationProgress({});

    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ title, body, author }));

      const translations = {};

      for (const dialect of DIALECTS) {
        const translated = await translateDialect(dialect.code);
        translations[dialect.code] = translated;
      }

      const article = {
        id: Date.now().toString(),
        source: {
          language: "en",
          title,
          body,
        },
        translations,
        author: author || "Unknown",
        status: "review",
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem("currArticle", JSON.stringify(article));
      navigate("/review");
    } catch (error) {
      console.error("Translation failed:", error);
      alert("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <LoadingModal isOpen={isTranslating} message="Translating to 6 Filipino dialects..." />
      <div className="max-w-3xl mx-auto bg-white p-6 mt-6 shadow">
        <h1 className="text-2xl font-bold mb-4">New Article</h1>
        {showDraftRestored && (
          <div className="mb-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            Draft restored from your previous edit.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            disabled={isTranslating}
            className="border p-2 w-full mb-3"
          />

          <input
            placeholder="English Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isTranslating}
            className="border p-2 w-full mb-3"
          />

          <textarea
            placeholder="English Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isTranslating}
            className="border p-2 w-full h-40 mb-3"
          />

          <button type="submit" disabled={isTranslating} className="bg-purple-700 text-white px-4 py-2">
            {isTranslating ? "Translating..." : "Translate All Dialects"}
          </button>
        </form>

        <div className="mt-6 grid sm:grid-cols-2 gap-2">
          {progressEntries.map((entry) => (
            <div key={entry.code} className="border rounded px-3 py-2 text-sm flex justify-between items-center">
              <span>{entry.label}</span>
              <span className="font-semibold capitalize">{entry.status.replace("_", " ")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NewArticle;