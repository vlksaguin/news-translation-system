import axios from "axios";

const API = axios.create({
    baseURL: "https://localhost:3000/api"
});

export async function translateText(text) {
    const res = await API.post("/translate", { text });
    return res.data.translation;
}