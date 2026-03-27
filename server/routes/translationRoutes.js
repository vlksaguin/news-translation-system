const router = require("express").Router();
const translateToFilipino = require("../services/translationService");

router.post("/translate", async (req, res) => {

    try {
        const { text } = req.body;
        const translation = await translateToFilipino(text);
        res.json({ translation });
    } catch(error){
        console.error(error);
        res.status(500).json({error: "Translation failed"});
    }
});

module.exports = router;