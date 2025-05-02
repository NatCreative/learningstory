export default async function handler(req, res) {
  // Allow Webflow and other known frontends
  const allowedOrigins = [
    "https://little-plans-a950d2.webflow.io",
    "https://www.childcarecentredesktop.com.au"
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Preflight OK
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const {
    childName,
    ageRange,
    learningDescription,
    learningOutcome,
    homeExtension,
    childQuotes
  } = req.body;

  if (!childName || !learningDescription || !learningOutcome) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const includeMTOP = ageRange?.includes("5–12");

  const userMessage = `
You are a qualified early childhood or school-age educator in Australia. Create a structured **Learning Story** using the following details:

- Child's Name: ${childName}
- Age Range: ${ageRange}
- Description of Learning: ${learningDescription}
- What the child learned: ${learningOutcome}
- Home Extension Ideas: ${homeExtension}
- Child's Voice: ${childQuotes}

Write the story as a reflective, narrative-style observation written in British English. Link to **EYLF v2.0**, and include **MTOP** where relevant (especially for school-age children). Reference specific sub-outcome numbers where appropriate.

Use Markdown formatting with these headings:
# Learning Story: [Insert Story Title]  
## Observation Summary  
## Child's Learning and Development  
## Learning Outcomes (EYLF${includeMTOP ? " / MTOP" : ""})  
## Educator Reflection  
## Child's Voice  
## Ideas for Home Extension
`;

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Project": "proj_ok4p8YSgjhmqm16Xtu8HUWag"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You create reflective, educator-written Learning Stories aligned with EYLF v2.0 and MTOP. Use Markdown formatting, British English, and include critical reflection and learning outcome references."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.6,
        max_tokens: 1500
      })
    });

    const data = await openaiRes.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error("Invalid OpenAI response:", data);
      return res.status(500).json({ message: "OpenAI response missing" });
    }

    return res.status(200).json({ text: data.choices[0].message.content.trim() });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server error", details: error.message });
  }
}
