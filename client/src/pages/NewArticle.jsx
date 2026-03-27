import { useState } from "react";
import { useNavigate } from "react-route-dom";
// import { addArticle } from "../../utils/storage";
import { translateText } from "../api/api";

function defaultTranslate(text){
    return "FILIPINO VERSION: \n" + text;
}

function NewArticle(){
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();

        const filTitle = translateText(title);
        const filBody = translateText(body);

        const article = {
            id: Date.now().toString(),
            title_en: title,
            body_en: body,
            title_fil:filTitle,
            body_fil:filBody,
            status: "review"
        };

        // addArticle(article);
        localStorage.setItem("currArticle", JSON.stringify(article));
        navigate("/review");
    }

    return (
        <div>
            <h1>New Article</h1>

            <form onSubmit={handleSubmit}>
                <input placeholder="English Title" value={title} onChange={e => setBody(e.target.value)} />
                <textarea
                    placeholder="English Body"
                    value={body}
                    onChange={e => setBody(e.target.value)}
                />
                <button type="submit">Translate</button>
            </form>
        </div>
    );
}

export default NewArticle;