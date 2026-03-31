const cache = new Map();
const MAX_CHARS_PER_REQUEST = 450;
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

const SUPPORTED_LANGUAGES = {
    tl: { label: "Tagalog", myMemoryCode: "tl" },
    ceb: { label: "Cebuano", myMemoryCode: "ceb" },
    ilo: { label: "Ilocano", myMemoryCode: "ilo" },
    hil: { label: "Hiligaynon", myMemoryCode: "hil" },
    war: { label: "Waray", myMemoryCode: "war" },
    pam: { label: "Kapampangan", myMemoryCode: "pam" }
};

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

function getTargetLanguage(language) {
    const normalized = String(language || "").trim().toLowerCase();
    return SUPPORTED_LANGUAGES[normalized] || null;
}

async function translateWithMyMemory(text, sourceLang, targetLang) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
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

async function translateWithGeminiPrompt(text, sourceLang, targetLang) {
    try {
        const prompt = `Translate the following ${sourceLang} text to ${targetLang.label}. 
                        Provide ONLY the translated text without quotes or explanations: 
                        "${text}"`;
        const result = await model.generateContent(prompt);
        const response = result.text().trim();
        const translatedText = response.text().trim();

        if (!translatedText) {
            throw new Error("Gemini returned empty translation");
        }

        return translateText;
    } catch (error) {
        console.error("Gemini Error: ", error.message);
        throw new Error(`Gemini Failed: ${error.message}`);
    }
}

async function translateText({ text, sourceLanguage = "English", targetLanguage }) {
    if (!text || !text.trim()) {
        return text;
    }
    // get the Object containing the language and myMemoryCode
    const target = getTargetLanguage(targetLanguage);
    if (!target) {
        throw new Error(`Unsupported language: ${targetLanguage}`);
    }

    const source = String(sourceLanguage || "en").trim().toLowerCase();
    // remembers this specific text and translation to reduce redundancy
    const cacheKey = `${source}|${target.myMemoryCode}|${text}`;

    // if cacheKey exists, just return the existing translation with source|target|translated text
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    try {
        const chunks = splitIntoChunks(text);
        // will contain translated text chunk by chunk
        const translatedParts = [];

        for (const chunk of chunks) {
            if (!chunk.trim()) {
                translatedParts.push(chunk);
                continue;
            }

            const chunkKey = `${source}|${target.myMemoryCode}|${chunk}`;
            // check if the chunk is in the cache to reduce redundant translations.
            if (cache.has(chunkKey)) {
                translatedParts.push(cache.get(chunkKey));
                continue;
            }
            // translate the chunk and store it in the cache, jic the same chunk appears again
            const translatedChunk = await translateWithGeminiPrompt(chunk, source, target.label);
            cache.set(chunkKey, translatedChunk);

            // push to translated array
            translatedParts.push(translatedChunk);
        }

        const translated = translatedParts.join("");
        // update cacheKey -> { src|tgt|src text : translated text }
        cache.set(cacheKey, translated);
        // returns translated text
        return translated;
    } catch (error) {
        console.error("Translation error:", error);
        throw new Error(error.message || "Translation failed");
    }
}

function getSupportedLanguages() {
    return Object.entries(SUPPORTED_LANGUAGES).map(([code, value]) => ({
        code,
        label: value.label
    }));
}

module.exports = {
    translateText,
    getSupportedLanguages
};