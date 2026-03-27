import { useParams, useNavigate } from "react-router-dom";
import { getArticles, updateArticle } from "../utils/storage";

function ReviewArticle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const article = getArticles.find(a => a.id === id);

    function approveArticle() {
        article.status = "published";
        updateArticle(article);
        navigate("/published");
    }

    return (
        <div>
            <h1>Review Article</h1>
            <h2>English</h2>
            <h3>{article.title_en}</h3>
            <h3>{article.body_en}</h3>
            <h2>Filipino</h2>
            <h3>{article.title_fil}</h3>
            <h3>{article.body_fil}</h3>

            <button onClick={approveArticle}>
                Approve & Publish
            </button>
        </div>
    );
}

export default ReviewArticle;