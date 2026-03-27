import React from "react";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// import { getArticles, updateArticle } from "../../utils/storage";

function ReviewArticle() {
    const [article, setArticle] = useState("")
    const [engArticle, setEngArticle] = useState(null)
    const [filArticle, setFilArticle] = useState(null)
    const navigate = useNavigate();
    // const article = getArticles.find(a => a.id === id);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("currArticle"));
        setArticle(stored);


    }, []);

    function approveArticle() {
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
        // console.log("approveArticle Published: " + JSON.stringify(published));
        navigate("/dashboard");
    }

    if (!article) return <div>Loading...</div>;

    return (
        <div>
            <div>
                <h2>English</h2>
                <input
                    value={article.title_en}
                    readOnly
                    style={{ width: "100%" }}
                />
                <textarea
                    value={article.body_en}
                    readOnly
                    style={{ width: "100%", height: "300px" }}
                />
            </div>

            <div>
                <h2>Filipino</h2>
                <input
                    value={article.title_fil}
                    onChange={e =>
                        setArticle({ ...article, title_fil: e.target.value })
                    }
                    style={{ width: "100%" }}
                />
                <textarea
                    value={article.body_fil}
                    onChange={e =>
                        setArticle({ ...article, body_fil: e.target.value })
                    }
                    style={{ width: "100%", height: "300px" }}
                />
            </div>

            <button onClick={approveArticle}>
                Approve & Publish
            </button>
        </div>
    );
}

export default ReviewArticle;