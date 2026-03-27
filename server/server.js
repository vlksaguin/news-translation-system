const express = require('express');
const cors = require("cors");
const translationRoutes = require("./routes/translationRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api", translationRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});