const cache = new Map();
const MAX_CHARS_PER_REQUEST = 3000;
const { GoogleGenAI } = require("@google/genai");
require('dotenv').config({ quiet: true });
// console.log(process.env.GEMINI_API_KEY);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

function splitIntoChunks(text, maxChars) {
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
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{
                role: 'user',
                parts: [{
                    text: `You are a Philippine Dialect Expert, knowledgable about the different grammar rules and vocabulary of various Philippine Dialects.
                    Translate the following ${sourceLang} text to ${targetLang}. Provide ONLY the translated text, with no other explanations: "${text}"`
                }]
            }]
        });

        const translatedText = response.text;

        if (!translatedText) {
            throw new Error("Gemini returned empty translation");
        }

        return translatedText;
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

    // const source = String(sourceLanguage || "en").trim().toLowerCase(); --> for MyMemory since codes ang basis
    const source = String(sourceLanguage || "English").trim().toLowerCase();
    // remembers this specific text and translation to reduce redundancy
    const cacheKey = `${source}|${target.myMemoryCode}|${text}`;

    // if cacheKey exists, just return the existing translation with source|target|translated text
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    try {
        await sleep(10000);
        // --- STEP 1: Attempt full translation with Gemini ---
        console.log("Attempting full translation with Gemini...");
        const translated = await translateWithGeminiPrompt(text, source, target.label);
        
        cache.set(cacheKey, translated);
        return translated;

    } catch (geminiError) {
        // --- STEP 2: Fallback to Chunked MyMemory ---
        console.warn("Gemini failed (Quota/Error). Falling back to Chunked MyMemory...");
        
        // Use your existing chunking logic specifically for MyMemory's 500-char limit
        const chunks = splitIntoChunks(text, 450); 
        const translatedParts = [];

        for (const chunk of chunks) {
            if (!chunk.trim()) {
                translatedParts.push(chunk);
                continue;
            }

            const chunkKey = `${source}|${target.myMemoryCode}|${chunk}`;
            if (cache.has(chunkKey)) {
                translatedParts.push(cache.get(chunkKey));
                continue;
            }

            // Small delay to prevent hitting MyMemory's rate limits too
            await sleep(5000);

            const sourceCode = source === "English" ? "en" : source;
            const translatedChunk = await translateWithMyMemory(chunk, sourceCode, target.myMemoryCode);
            
            cache.set(chunkKey, translatedChunk);
            translatedParts.push(translatedChunk);
        }

        const finalTranslation = translatedParts.join("");
        cache.set(cacheKey, finalTranslation);
        return finalTranslation;
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