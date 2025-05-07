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
You are a qualified early childhood or school-age educator in Australia. Based on the details below, write a structured Learning Story that captures the child's experience, learning, and development in a reflective, strengths-based narrative. Use British English, and write with warmth, professionalism, and clarity appropriate for a parent or carer audience.
Include links to the Early Years Learning Framework v2.0 (EYLF), and reference My Time, Our Place (MTOP) where applicable (especially for school-age children). Cite relevant sub-outcome numbers where possible.

- Child's Name: ${childName}
- Age Range: ${ageRange}
- Description of Learning: ${learningDescription}
- What the child learned: ${learningOutcome}
- Home Extension Ideas: ${homeExtension}
- Child's Voice: ${childQuotes}

Write the story as a reflective, narrative-style observation written in British English. Link to **EYLF v2.0**, and include **MTOP** where relevant (especially for school-age children). Reference specific sub-outcome numbers where appropriate.

Use Markdown formatting with these headings:
# Learning Story: [Insert a meaningful title inspired by the child's voice or observed learning]  

## Observation Summary  
Look at ${learningDescription} and expand appropriatly. Do not embelish. Just state the facts in a way ${childName}'s parents would be interested.

## Child's Learning and Development  
Describe the developmental significance of the observed experience. Comment on emerging dispositions, skills, relationships, and agency. Use rich, professional language that aligns with EYLF or MTOP perspectives.

## Learning Outcomes (EYLF${includeMTOP ? " / MTOP" : ""})  
List the specific learning outcomes and sub-outcome numbers that relate to the child’s observed development. Briefly justify each link (e.g. “Outcome 1.1 – demonstrates a strong sense of identity through confident exploration”).

## Educator Reflection  
Reflect on what this experience tells us about the child. What surprised, delighted, or challenged you as the educator? What are the next steps for supporting this child’s learning journey?

## Child's Voice  
Include direct quote(s) that capture the child’s perspective, curiosity, or emotional engagement. Present them naturally (e.g. “That one’s flying like a rocket!”).

## Ideas for Home Extension  
Offer a few simple, practical ideas that families can try at home to continue or build on this learning. Ensure they are age-appropriate, engaging, and inclusive.

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
