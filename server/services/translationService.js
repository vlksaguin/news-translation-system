const translate = require("@vitalets/google-translate-api");

async function translateToFilipino(text) {
    try {
        const res = await translate(text, { to: "tl"});
        return res.text;
    } catch (error) {
        console.error(error);
        return text;
    }
}

module.exports = translateToFilipino;