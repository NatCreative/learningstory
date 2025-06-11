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

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Block all methods except POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const {
    childName,
    ageRange,
    learningDescription,
    learningOutcome,
    homeExtension,
    childQuotes,
    developmentalProgress
  } = req.body;

  if (!childName || !learningDescription || !learningOutcome) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const includeMTOP = ageRange?.includes("5–12");
  const homeExtensionText = homeExtension
    ? `Home Extension Ideas: ${homeExtension}`
    : "Please generate 3-4 practical home extension ideas based on this learning observation";

  const userMessage = `
You are a qualified early childhood educator in Australia with expertise in Margaret Carr's Learning Stories methodology and deep knowledge of the Early Years Learning Framework (EYLF) v2.0 and My Time, Our Place (MTOP) v2.0 frameworks.

Task: Analyse the learning observation and dynamically select the most appropriate EYLF outcomes and sub-outcomes that genuinely reflect what was observed. Then write a structured Learning Story that positions the child as the hero of their learning journey while maintaining complete factual accuracy.

Input Details:
- Child's Name: ${childName}
- Age Range: ${ageRange}
- Description of Learning: ${learningDescription}
- What the child learned: ${learningOutcome}
- ${homeExtensionText}
- Child's Voice: ${childQuotes}

Step 1: EYLF Analysis
(Include full EYLF and MTOP outcome references...)

Step 2: Developmental Progress Integration
Apply language for: ${developmentalProgress || 'developing'}

Use the following Markdown structure:
# Learning Story: [Create a meaningful title]
## The Story
(Write observation factually, using first-person)
## What This Means for ${childName}
(Write in second-person)
## Learning Framework Connections
(EYLF${includeMTOP ? " + MTOP" : ""} with justifications)
## Learning Dispositions Observed
(3 key dispositions)
## ${childName}'s Voice
(Only include exact quotes)
## Educator Reflection
## Looking Forward: Opportunities and Possibilities
## Ideas for Home Extension
## Documentation Notes
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
              "You are an expert early childhood educator with deep knowledge of EYLF v2.0 and MTOP frameworks. You create authentic, meaningful Learning Stories that celebrate children as capable learners while staying strictly factual and connecting genuinely to learning outcomes."
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
