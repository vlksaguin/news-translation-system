// import axios from "axios";

// const API = axios.create({
//     baseURL: "https://localhost:5000"
// });

// export const translateText = async (text) => {
//     const response = await axios.post(`${API}/api/translate`, {
//         text: text
//     });
//     return response.data;
// }


import axios from "axios";

const API_URL = "http://localhost:5000";

export const translateText = async (text) => {
  const response = await axios.post(`${API_URL}/api/translate`, {
    text: text,
  });
  console.log("inside translateText in api.js");
  console.log(response.data.translation);
  return response.data.translation;
};