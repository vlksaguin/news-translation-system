const cache = new Map();
const MAX_CHARS_PER_REQUEST = 3000;
const { GoogleGenAI } = require("@google/genai");
const { OpenAI } = require("openai");

require('dotenv').config({ quiet: true });
// console.log(process.env.GEMINI_API_KEY);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const openAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
                    text: `You are a Philippine Dialect Expert, knowledgeable about the different grammar rules and vocabulary of various Philippine Dialects.
                    Translate "${text}" from ${sourceLang} to ${targetLang}. Response must be only the translated text, no quotes around it, no explanation.`
                }]
            }]
        });

        let translatedText = response.text.trim();

        // Remove surrounding quotes if present
        if ((translatedText.startsWith('"') && translatedText.endsWith('"')) ||
            (translatedText.startsWith("'") && translatedText.endsWith("'"))) {
            translatedText = translatedText.slice(1, -1);
        }

        if (!translatedText) {
            throw new Error("Gemini returned empty translation");
        }

        return translatedText;
    } catch (error) {
        console.error("Gemini Error: ", error.message);
        throw new Error(`Gemini Failed: ${error.message}`);
    }
}
async function translateWithOpenAIPrompt(text, sourceLang, targetLang) {
    try {
        const response = await openAI.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: "system",
                    content: "You are a Philippine Dialect Expert knowledgeable about the grammar rules and vocabulary of various Philippine Dialects."
                },
                {
                    role: "user",
                    content: `Translate "${text}" from ${sourceLang} to ${targetLang}. Response must be only the translated text, no quotes around it, no explanation.`
                }
            ],
            temperature: 0.3,
            max_tokens: 5000,
        });

        let translatedText = response.choices[0].message.content.trim();

        // Remove surrounding quotes if present
        if ((translatedText.startsWith('"') && translatedText.endsWith('"')) ||
            (translatedText.startsWith("'") && translatedText.endsWith("'"))) {
            translatedText = translatedText.slice(1, -1);
        }

        if (!translatedText) {
            throw new Error("OpenAI returned empty translation");
        }

        return translatedText;
    } catch (error) {
        console.error("OpenAI Error: ", error.message);
        throw new Error(`OpenAI Failed: ${error.message}`);
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
        // Attempt 1: OpenAI
        console.log("Attempting OpenAI...");
        await sleep(2000); 
        const translated = await translateWithOpenAIPrompt(text, source, target.label);
        cache.set(cacheKey, translated);
        return translated;

    } catch (openAIError) {
        console.warn("OpenAI failed, attempting Gemini...");
        
        try {
            // Attempt 2: Gemini
            await sleep(5000);
            const translated = await translateWithGeminiPrompt(text, source, target.label);
            cache.set(cacheKey, translated);
            return translated;

        } catch (geminiError) {
            // Attempt 3: MyMemory (Final Fallback)
            console.warn("Gemini failed, falling back to MyMemory...");
            const finalTranslation = await handleMyMemoryFallback(text, source, target);
            cache.set(cacheKey, finalTranslation);
            return finalTranslation;
        }
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