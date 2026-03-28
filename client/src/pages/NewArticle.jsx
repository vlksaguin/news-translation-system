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
    const [isTranslating, setIsTranslating] = useState(false);
    
    const navigate = useNavigate();
    
    useEffect(() => {
        localStorage.setItem(
            DRAFT_STORAGE_KEY,
            JSON.stringify({ title, body })
        );
    }, [title, body]);

    useEffect(() => {
        const storedDraft = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY));
        if (!storedDraft) {
            return;
        }

        setTitle(storedDraft.title || "");
        setBody(storedDraft.body || "");
    }, []);


    async function handleSubmit(e) {
        console.log("Inside Handle Submit")
        e.preventDefault();

        setIsTranslating(true);
        try {
            localStorage.setItem(
                DRAFT_STORAGE_KEY,
                JSON.stringify({ title, body })
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

                <form onSubmit={handleSubmit}>
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