export default async function handler(req, res) {
  console.log("API called");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("Body:", req.body);

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
}
