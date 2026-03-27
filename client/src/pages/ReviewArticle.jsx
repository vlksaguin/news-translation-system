import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
// import { getArticles, updateArticle } from "../../utils/storage";

function ReviewArticle() {
    const [ article, setArticle ] = useState(null)
    const navigate = useNavigate();
    // const article = getArticles.find(a => a.id === id);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("currArticle"));
        setArticle(stored);
    }, []);

    function handlePublish() {
        const articles = JSON.parse(localStorage.getItem("articles")) || [];
        articles.push({ ...article, status: "published" });
        localStorage.setItem("articles", JSON.stringify(articles));
        navigate("/published");
    }

    if(!article) return <div>Loading...</div>;

    return (
        <div>
            <div>
                <h2>English</h2>
                <input 
                    value={article.title_en}
                    readOnly
                    style={{width:"100%"}}
                />
                <textarea
                    value={article.body_en}
                    readOnly
                    style={{width: "100%", height:"300px"}}
                />
            </div>

            <div>
                <h2>Filipino</h2>
                <input 
                    value={article.title_fil}
                    onChange={e =>
                        setArticle({...article, title_fil: e.target.value})
                    }
                    style={{width:"100%"}}
                />
                <textarea
                    value={article.body_fil}
                    onChange={e =>
                        setArticle({...article, body_fil: e.target.value})
                    }
                    style={{width: "100%", height:"300px"}}
                />
            </div>

            <button onClick={approveArticle}>
                Approve & Publish
            </button>
        </div>
    );
}

export default ReviewArticle;