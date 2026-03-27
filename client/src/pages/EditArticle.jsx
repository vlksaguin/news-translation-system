import React from "react";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// import { getArticles, updateArticle } from "../../utils/storage";

function EditArticle() {
    const [article, setArticle] = useState("")
    const navigate = useNavigate();
    // const article = getArticles.find(a => a.id === id);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("editArticle"));
        setArticle(stored);


    }, []);

    function saveArticle() {
        const published = JSON.parse(localStorage.getItem("published")) || [];
        const updatedPublished = published.map(p =>
            p.id === article.id ? article : p
        );
        localStorage.setItem("published", JSON.stringify(updatedPublished));
        localStorage.removeItem("editArticle");
        navigate("/dashboard");
    }

    if (!article) return <div className="min-h-screen bg-gray-100 p-6">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-3xl mx-auto bg-white p-6 mt-6 shadow">
                <h2 className="text-2xl font-bold mb-4">Edit Article</h2>
                <input
                    value={article.title}
                    onChange={e =>
                        setArticle({ ...article, title: e.target.value })
                    }
                    className="border p-2 w-full mb-3"
                />
                <textarea
                    value={article.body}
                    onChange={e =>
                        setArticle({ ...article, body: e.target.value })
                    }
                    className="border p-2 w-full h-72 mb-3"
                />

                <button
                    onClick={saveArticle}
                    className="bg-purple-700 text-white px-4 py-2"
                >
                    Save Edits to Article
                </button>
            </div>
        </div>
    );
}

export default EditArticle;