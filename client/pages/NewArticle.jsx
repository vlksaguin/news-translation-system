import { useState } from "react";
import { addArticle } from "../utils/storage";
import { useNavigate } from "react-route-dom";

function defaultTranslate(text){
    return "FILIPINO VERSION: \n" + text;
}

function NewArticle(){
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();

        const article = {
            id: Date.now().toString(),
            title_en: title,
            body_en: body,
            title_fil:defaultTranslate(title_en),
            body_fil: defaultTranslate(body_en),
            status: translated
        };

        addArticle(article);
        navigate("/dashboard");
    }

    return (
        <div>
            <h1>New Article</h1>

            <form onSubmit={handleSubmit}>
                <input placeholder="English Title" value={title} onChange={e => setBody(e.target.value)} />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default NewArticle;