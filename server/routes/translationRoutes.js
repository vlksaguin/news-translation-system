const router = require("express").Router();
const {
    translateText,
    getSupportedLanguages
} = require("../services/translationService");

router.get("/translate/languages", (_req, res) => {
    res.json({ languages: getSupportedLanguages() });
});

router.post("/translate", async (req, res) => {
    // const { text } = req.body;
        // console.log("tRoutes: " + text);
    // const translation = await translateToFilipino(text);
    // // const translation = "Fil: " + text;
        // console.log("tRoutes: " + translation);
    // res.json({ translation });

    const { text, sourceLanguage = "en", targetLanguage = "tl" } = req.body;

    if (typeof text !== "string") {
        return res.status(400).json({ error: "Text is required and must be a string" });
    }

    try {
        // used to be translateToFilipino. Can now translate based on src and tgt
        const translation = await translateText({ text, sourceLanguage, targetLanguage });
        // returns the translation
        return res.json({ translation });
    } catch (error) {
        console.error("Translate route error:", error);
        return res.status(400).json({ error: error.message || "Translation failed" });
    }
});

router.post("/translate/batch", async (req, res) => {
    const {
        text,
        sourceLanguage = "en",
        targetLanguages = []
    } = req.body;

    if (typeof text !== "string") {
        return res.status(400).json({ error: "text is required and must be a string" });
    }

    if (!Array.isArray(targetLanguages) || targetLanguages.length === 0) {
        return res.status(400).json({ error: "targetLanguages must be a non-empty array" });
    }

    const uniqueTargets = [...new Set(targetLanguages.map(language => String(language).trim().toLowerCase()))];

    const results = await Promise.all(
        uniqueTargets.map(async targetLanguage => {
            try {
                const translation = await translateText({ text, sourceLanguage, targetLanguage });
                return {
                    targetLanguage,
                    ok: true,
                    translation,
                    error: null
                };
            } catch (error) {
                return {
                    targetLanguage,
                    ok: false,
                    translation: text,
                    error: error.message || "Translation failed"
                };
            }
        })
    );

    return res.json({
        sourceLanguage,
        text,
        results
    });
});

module.exports = router;