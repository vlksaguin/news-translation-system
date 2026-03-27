import { getArticles } from "../../utils/storage";

function Published() {
    const articles = JSON.parse(localStorage.getItem("articles")) || [];

    return (
        <div>
            <h1>Published</h1>
            {articles.map(a => (
                <div key={a.id}>
                    <h2>{a.title_en}</h2>
                    <p>{a.body_en}</p>

                    <hr />

                    <h2>{a.title_fil}</h2>
                    <p>{a.body_fil}</p>
                </div>
            ))}
        </div>
    );
}

export default Published;