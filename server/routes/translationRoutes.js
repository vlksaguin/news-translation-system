const router = require("express").Router();
const translateToFilipino = require("../services/translationService");

router.post("/translate", async (req, res) => {
    const { text } = req.body;
    console.log("tRoutes: " + text);
    const translation = await translateToFilipino(text);
    // const translation = "Fil: " + text;
    console.log("tRoutes: " + translation);
    res.json({ translation });
});

module.exports = router;