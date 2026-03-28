import React from "react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { addArticle } from "../../utils/storage";
import { translateText } from "../api/api";
import LoadingModal from "../components/LoadingModal";

const DRAFT_STORAGE_KEY = "newArticleDraft";

function NewArticle() {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [author, setAuthor] = useState(() => localStorage.getItem("user") || "");
    const [isTranslating, setIsTranslating] = useState(false);
    const [isDraftHydrated, setIsDraftHydrated] = useState(false);
    const [showDraftRestored, setShowDraftRestored] = useState(false);
    
    const navigate = useNavigate();
    
    
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

        localStorage.setItem(
            DRAFT_STORAGE_KEY,
            JSON.stringify({ title, body, author })
        );
    }, [title, body, author, isDraftHydrated]);

    async function handleSubmit(e) {
        console.log("Inside Handle Submit")
        e.preventDefault();

        setIsTranslating(true);
        try {
            localStorage.setItem(
                DRAFT_STORAGE_KEY,
                JSON.stringify({ title, body, author })
            );

            const filTitle = await translateText(title);
            console.log(filTitle);
            const filBody = await translateText(body);
            console.log(filBody);

            const article = {
                id: Date.now().toString(),
                title_en: title,
                body_en: body,
                title_fil: filTitle,
                body_fil: filBody,
                author: author || "Unknown",
                status: "review"
            };

            // addArticle(article);
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
            <LoadingModal isOpen={isTranslating} message="Translating content to Filipino..." />
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
                        onChange={e => setAuthor(e.target.value)}
                        disabled={isTranslating}
                        className="border p-2 w-full mb-3"
                    />

                    <input
                        placeholder="English Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        disabled={isTranslating}
                        className="border p-2 w-full mb-3"
                    />

                    <textarea
                        placeholder="English Body"
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        disabled={isTranslating}
                        className="border p-2 w-full h-40 mb-3"
                    />

                    <button
                        type="submit"
                        disabled={isTranslating}
                        className="bg-purple-700 text-white px-4 py-2"
                    >
                        {isTranslating ? "Translating..." : "Translate"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default NewArticle;