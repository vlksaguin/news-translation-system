import React from "react";

import { useEffect, useState } from "react";
import { getPublished } from "../../utils/storage";
import ArticleCard from "../components/ArticleCard"
import { useNavigate } from "react-router-dom";

function Dashboard(){
    const [published, setPublished] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setPublished(getPublished());
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>

            <button onClick={() => navigate("/new")}>
                New Article
            </button>

            {published.map(published => (
                <ArticleCard
                    key={published.id}
                    article={published}
                    onClick={() => navigate(`/review`)}
                    />
            ))}
        </div>
    );
}

export default Dashboard;