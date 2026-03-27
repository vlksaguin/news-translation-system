const cache = new Map();

async function translateWithMyMemory(text) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|tl`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`MyMemory failed: ${response.status}`);
    }

    const data = await response.json();
    const translated = data && data.responseData ? data.responseData.translatedText : "";

    if (!translated) {
        throw new Error("MyMemory returned empty translation");
    }

    return translated;
}

async function translateToFilipino(text) {
    if (!text || !text.trim()) {
        return text;
    }

    if (cache.has(text)) {
        return cache.get(text);
    }

    try {
        const translated = await translateWithMyMemory(text);
        cache.set(text, translated);
        return translated;
    } catch (error) {
        console.error("Translation error:", error);
        return text;
    }
}

module.exports = translateToFilipino;