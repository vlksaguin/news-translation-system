import React from "react";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingModal from "../components/LoadingModal";

// import { getArticles, updateArticle } from "../../utils/storage";
const DRAFT_STORAGE_KEY = "newArticleDraft";

function ReviewArticle() {
    const [article, setArticle] = useState("")
    const [isPublishing, setIsPublishing] = useState(false);
    const navigate = useNavigate();
    // const article = getArticles.find(a => a.id === id);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("currArticle"));
        setArticle(stored);


    }, []);

    async function approveArticle() {
        setIsPublishing(true);
        try {
            // const article = JSON.parse(localStorage.getItem("articles"));
            const published = JSON.parse(localStorage.getItem("published")) || [];
            console.log(article.title_en);
            console.log(article.title_fil);
            const id = Date.now();
            const englishArticle = {
                id: id + "_engl",
                title: article.title_en,
                body: article.body_en,
                language: "EN"
            };

            const filipinoArticle = {
                id: id + "_fil",
                title: article.title_fil,
                body: article.body_fil,
                language: "FIL"
            };

            published.push(englishArticle);
            published.push(filipinoArticle);

            localStorage.setItem("published", JSON.stringify(published));
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            localStorage.removeItem("currArticle");
            // console.log("approveArticle Published: " + JSON.stringify(published));
            navigate("/dashboard");
        } finally {
            setIsPublishing(false);
        }
    }

    function handleGoBack() {
        localStorage.setItem(
            DRAFT_STORAGE_KEY,
            JSON.stringify({
                title: article.title_en || "",
                body: article.body_en || ""
            })
        );
        navigate("/new");
    }

    if (!article) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <LoadingModal isOpen={isPublishing} message="Publishing approved article..." />

            <div className="max-w-6xl mx-auto p-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* English */}
                    <div className="bg-white p-4 shadow">
                        <h2 className="font-bold mb-2">English</h2>
                        <input
                            value={article.title_en}
                            disabled={true}
                            readOnly
                            className="border p-2 w-full mb-2"
                        />
                        <textarea
                            value={article.body_en}
                            disabled={true}
                            readOnly
                            className="border p-2 w-full h-64"
                        />
                    </div>

                    {/* Filipino */}
                    <div className="bg-white p-4 shadow">
                        <h2 className="font-bold mb-2">Filipino</h2>
                        <input
                            value={article.title_fil}
                            onChange={e =>
                                setArticle({ ...article, title_fil: e.target.value })
                            }
                            disabled={isPublishing}
                            className="border p-2 w-full mb-2"
                        />
                        <textarea
                            value={article.body_fil}
                            onChange={e =>
                                setArticle({ ...article, body_fil: e.target.value })
                            }
                            disabled={isPublishing}
                            className="border p-2 w-full h-64"
                        />
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                    <button
                        onClick={handleGoBack}
                        disabled={isPublishing}
                        className="bg-gray-600 text-white px-6 py-2"
                    >
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