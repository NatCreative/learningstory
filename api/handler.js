export default async function handler(req, res) {
  const allowedOrigins = [
    "https://little-plans-a950d2.webflow.io",
    "https://www.childcarecentredesktop.com.au"
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "null");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Only POST requests allowed" });

  const {
    "child-name": childName,
    "child-age": childAge,
    "what-happened": whatHappened,
    "why-meaningful": whyMeaningful,
    "who-involved": whoInvolved,
    "home-extension": homeExtension
  } = req.body;

  if (!childName || !whatHappened || !whyMeaningful) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const includeMTOP = childAge?.includes("5–12");
  const homeExtensionText = homeExtension
    ? `Ideas for home extension: ${homeExtension}`
    : "Please include 2–3 ways families could naturally extend this learning at home through play or conversation.";

  const userMessage = `
Learning Story Generator
You are a qualified early childhood educator in Australia with expertise in Margaret Carr's authentic Learning Stories methodology and deep knowledge of the Early Years Learning Framework (EYLF) v2.0${includeMTOP ? " and My Time, Our Place (MTOP)" : ""}.

Your Role:
Using the information provided, write an authentic, strengths-based Learning Story that captures a single meaningful learning moment. Use warm, factual educator language. Avoid dramatic or academic tone. Only include what was observed. Write for families.

Child's Name: ${childName}
Age Range: ${childAge}
Specific Moment: ${whatHappened}
Why it was meaningful: ${whyMeaningful}
Who else was involved: ${whoInvolved}
${homeExtensionText}

Write using the following structure in Markdown:

# Learning Story Title
(Choose a short, engaging title that reflects the moment)

## The Story
A rich, first-person narrative of what actually happened using phrases like:
- "I noticed ${childName}..."
- "Today ${childName} was..."
- Describe the setting, child’s actions, interactions, and any problem-solving or thinking processes observed.

## What This Tells Us
- What this moment shows about the child’s learning or development
- Connection to genuine EYLF${includeMTOP ? "/MTOP" : ""} outcomes (list specific outcome numbers only if clearly demonstrated)
- Keep tone warm, reflective, and professional (e.g. “This shows ${childName} is developing confidence in...”)

## Opportunities and Possibilities
- Suggestions for where learning might go next based on this experience
- Can include ideas for the educator, the setting, or links to community or family

## ${childName}'s Voice
- Direct quotes or phrases from the child if any were provided or implied

## Ideas for Home Extension
${homeExtensionText}

Key Principles:
- Focus on ONE meaningful learning moment
- Use factual, descriptive educator voice
- Highlight learning without turning it into an assessment
- Genuinely connect to EYLF${includeMTOP ? "/MTOP" : ""} only if appropriate
- Always position the child as capable, curious and competent
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
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an expert early childhood educator. You write authentic Learning Stories that follow Margaret Carr’s approach, remain warm and factual, honour the child’s learning, and connect only to genuinely demonstrated EYLF outcomes."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
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
