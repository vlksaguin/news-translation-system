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

    if (!article) return <div>Loading...</div>;

    return (
        <div>
            <div>
                <h2>Edit Article</h2>
                <input
                    value={article.title}
                    onChange={e =>
                        setArticle({ ...article, title: e.target.value })
                    }
                    style={{ width: "100%" }}
                />
                <textarea
                    value={article.body}
                    onChange={e =>
                        setArticle({ ...article, body: e.target.value })
                    }
                    style={{ width: "100%", height: "300px" }}
                />
            </div>

            <button onClick={saveArticle}>
                Save Edits to Article
            </button>
        </div>
    );
}

export default EditArticle;