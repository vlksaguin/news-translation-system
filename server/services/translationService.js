const { translate } = require("@vitalets/google-translate-api");

async function translateToFilipino(text) {
    try {
        const res = await translate(text, { to: "tl"});
        console.log("Translation response:", res);
        console.log("Translation text field:", res.text);
        return res.text;
    } catch (error) {
        console.error("Translation error:", error);
        return text;
    }
}

module.exports = translateToFilipino;