const cache = new Map();
const MAX_CHARS_PER_REQUEST = 450;

function findChunkBreak(text, start, maxChars) {
    const hardEnd = Math.min(start + maxChars, text.length);
    if (hardEnd >= text.length) {
        return text.length;
    }

    // Prefer breaking on natural boundaries to keep translation coherent.
    const window = text.slice(start, hardEnd);
    const minBreak = Math.floor(window.length * 0.6);

    for (let i = window.length - 1; i >= minBreak; i -= 1) {
        const ch = window[i];
        if (ch === "\n" || ch === "." || ch === "!" || ch === "?" || ch === ";" || ch === "," || ch === " ") {
            return start + i + 1;
        }
    }

    return hardEnd;
}

function splitIntoChunks(text, maxChars = MAX_CHARS_PER_REQUEST) {
    const chunks = [];
    let cursor = 0;

    while (cursor < text.length) {
        const nextBreak = findChunkBreak(text, cursor, maxChars);
        chunks.push(text.slice(cursor, nextBreak));
        cursor = nextBreak;
    }

    return chunks;
}

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
        const chunks = splitIntoChunks(text);
        const translatedParts = [];

        for (const chunk of chunks) {
            if (!chunk.trim()) {
                translatedParts.push(chunk);
                continue;
            }

            // Cache per chunk to reduce duplicate remote calls.
            if (cache.has(chunk)) {
                translatedParts.push(cache.get(chunk));
                continue;
            }

            const translatedChunk = await translateWithMyMemory(chunk);
            cache.set(chunk, translatedChunk);
            translatedParts.push(translatedChunk);
        }

        const translated = translatedParts.join("");
        cache.set(text, translated);
        return translated;
    } catch (error) {
        console.error("Translation error:", error);
        return text;
    }
}

module.exports = translateToFilipino;