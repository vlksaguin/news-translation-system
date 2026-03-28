import React from "react";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingModal from "../components/LoadingModal";

// import { getArticles, updateArticle } from "../../utils/storage";

function EditArticle() {
    const [article, setArticle] = useState("")
    const [originalArticle, setOriginalArticle] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();
    // const article = getArticles.find(a => a.id === id);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("editArticle"));
        setArticle(stored);
        setOriginalArticle(stored);


    }, []);

    async function saveArticle() {
        setIsSaving(true);
        try {
            const published = JSON.parse(localStorage.getItem("published")) || [];
            const nowIso = new Date().toISOString();
            const isEdited =
                article.title !== (originalArticle?.title || "") ||
                article.body !== (originalArticle?.body || "");

            const updatedPublished = published.map(p =>
                p.id === article.id
                    ? { ...article, editedAt: isEdited ? nowIso : p.editedAt || null }
                    : p
            );
            localStorage.setItem("published", JSON.stringify(updatedPublished));
            localStorage.removeItem("editArticle");
            navigate("/dashboard");
        } finally {
            setIsSaving(false);
        }
    }

    function handleGoBack() {
        localStorage.removeItem("editArticle");
        navigate("/dashboard");
    }

    if (!article) return <div className="min-h-screen bg-gray-100 p-6">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <LoadingModal isOpen={isSaving} message="Saving article edits..." />
            <div className="max-w-3xl mx-auto bg-white p-6 mt-6 shadow">
                <h2 className="text-2xl font-bold mb-4">Edit Article</h2>
                <input
                    value={article.title}
                    onChange={e =>
                        setArticle({ ...article, title: e.target.value })
                    }
                    disabled={isSaving}
                    className="border p-2 w-full mb-3"
                />
                <textarea
                    value={article.body}
                    onChange={e =>
                        setArticle({ ...article, body: e.target.value })
                    }
                    disabled={isSaving}
                    className="border p-2 w-full h-72 mb-3"
                />

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleGoBack}
                        disabled={isSaving}
                        className="bg-gray-600 text-white px-4 py-2"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={saveArticle}
                        disabled={isSaving}
                        className="bg-purple-700 text-white px-4 py-2"
                    >
                        {isSaving ? "Saving..." : "Save Edits to Article"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditArticle;