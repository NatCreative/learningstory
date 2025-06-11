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
    childAge,
    whatHappened,
    childActionsWords,
    context,
    whyThisMattered
  } = req.body;

  if (!childName || !childAge || !whatHappened || !whyThisMattered) {
    return res.status(400).json({ error: "Missing required fields: childName, childAge, whatHappened, and whyThisMattered are required" });
  }

  const includeMTOP = childAge?.includes("5-12") || childAge?.includes("school");

  const userMessage = `
You are a qualified early childhood educator in Australia with expertise in authentic Learning Stories methodology and deep knowledge of the Early Years Learning Framework (EYLF) v2.0 and My Time, Our Place (MTOP) frameworks.

**Task**: Create an authentic Learning Story that celebrates the child as a capable, competent learner while maintaining complete factual accuracy.

**Child Information:**
- Child's Name: ${childName}
- Child's Age: ${childAge}
- What Happened: ${whatHappened}
- Child's Actions and Words: ${childActionsWords || 'Not specified'}
- Context: ${context || 'Not specified'}
- Why This Mattered: ${whyThisMattered}

**Instructions:**
1. Write a warm, engaging Learning Story that stays strictly factual
2. Only include details that were actually provided - never add fictional elements
3. Connect to relevant EYLF v2.0 outcomes that are genuinely demonstrated
4. Position the child as the hero of their learning journey
5. Use professional but warm educator language that families will treasure

${includeMTOP ? `
**Note**: Include MTOP connections where relevant for this school-age child.
` : ""}

**Required Structure:**

**LEARNING STORY**
**ACTIVITY NAME:** [Create meaningful title] **DATE:** [Use today's date]

**Learning Story**
Write the main narrative using "I noticed..." or "Today I observed..." Stay completely factual while making the learning visible and meaningful for families.

**Analysis of Learning**  
Reflect on what this reveals about the child's development, connecting to early childhood theories (Piaget, Vygotsky, Reggio Emilia) and your professional understanding.

**Where to Next**
Suggest 2-3 ways to extend this learning based on the child's demonstrated interests and capabilities.

**Links to EYLF v2.0**
Select only 2-3 outcomes genuinely demonstrated:
- **Outcome X.X:** [Description] - *Evidence: [specific example from observation]*

${includeMTOP ? `
**Links to MTOP (if relevant)**
Include relevant MTOP connections for school-age learning.
` : ""}

**Key Requirements:**
- Honor the child as competent and capable
- Stay strictly factual - no added details
- Use warm, professional language
- Make learning processes visible
- Connect meaningfully to frameworks
- Write for families to celebrate their child

Create a Learning Story that authentically captures this moment of learning.
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
            content: "You are an expert early childhood educator with deep knowledge of EYLF v2.0 and MTOP frameworks. You create authentic, meaningful Learning Stories that celebrate children as capable learners while staying strictly factual and connecting genuinely to learning outcomes."
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
