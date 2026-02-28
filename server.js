import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  console.log("API called");

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify(req.body),
      },
    );

    const data = await response.json();
    console.log("OpenRouter response:", data);
    res.status(200).json(data);
  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
