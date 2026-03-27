export function getArticles() {
    const articles = localStorage.getItem("articles");
    return articles ? JSON.parse(articles) : [];
}

export function getPublished() {
    const published = localStorage.getItem("published");
    console.log(JSON.parse(published));
    return published ? JSON.parse(published) : [];
}

export function saveArticles(articles) {
    localStorage.setItem("articles", JSON.stringify(articles));
}

export function addArticle(article) {
    const articles = getArticles();
    articles.push(article);
    saveArticles(articles);
}

export function updateArticle(updatedArticle) {
    const articles = getArticles().map(a =>
        a.id === updatedArticle.id ? updatedArticle : articles
    );
    saveArticles(articles);
}