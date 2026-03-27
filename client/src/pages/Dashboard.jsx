import { useEffect, useState } from "react";
import { getArticles } from "../../utils/storage";
import ArticleCard from "../components/ArticleCard"
import { useNavigate } from "react-route-dom";

function Dashboard(){
    const [articles, setArticles] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setArticles(getArticles());
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>

            <button onClick={() => navigate("/new")}>
                New Article
            </button>

            {articles.map(a => (
                <ArticleCard
                    key={articles.id}
                    article={article}
                    onClick={() => navigate(`/review/${article.id}`)}
                    />
            ))}
        </div>
    );
}

export default Dashboard;