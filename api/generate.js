export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { prompt } = req.body;

  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "Falta el prompt" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Eres un experto programador de Lua para Roblox.
Genera ÚNICAMENTE el código Lua completo y funcional.
No escribas explicaciones, no uses markdown, no pongas \`\`\`lua ni nada extra.
Solo el código puro listo para copiar y pegar.
Hazlo compatible con executors (Delta, etc.) y también con Roblox Studio cuando sea posible.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.35,
        max_tokens: 2048
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Error al generar con Groq"
      });
    }

    const codigo = data.choices?.[0]?.message?.content || "No se pudo generar el código.";

    return res.status(200).json({ codigo });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
