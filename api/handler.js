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
You are a qualified early childhood or school-age educator in Australia with expertise in Margaret Carr's Learning Stories methodology. Based on the details below, write a structured Learning Story that captures the child's experience, learning, and development in a reflective, strengths-based narrative. Use British English throughout.

**About Learning Stories:**
Learning Stories are narrative assessments that position the child as the hero of their learning journey. They focus on learning dispositions (curiosity, resilience, collaboration, creativity) rather than skills checklists, and are written to celebrate children's competence and agency. The educator acts as a skilled storyteller, documenting meaningful moments that reveal how children are developing as learners.

**Input Details:**
- Child's Name: ${childName}
- Age Range: ${ageRange}
- Description of Learning: ${learningDescription}
- What the child learned: ${learningOutcome}
- Home Extension Ideas: ${homeExtension}
- Child's Voice: ${childQuotes}

**Writing Guidelines:**
- Write as a storyteller using first person perspective ("I observed...", "I noticed...")
- Focus on strengths, interests, and emerging capabilities
- Use warm, professional language appropriate for families
- Make the child the hero - celebrate their agency and competence
- Link to specific EYLF v2.0 sub-outcomes with numbers and brief justification
- Include MTOP references where relevant for school-age children (5-12 years)
- Capture the story's emotional resonance and learning significance
- Avoid deficit language or teaching-focused observations

**Required Structure in Markdown:**

# Learning Story: [Create a meaningful title inspired by the child's voice, actions, or the essence of their learning]

## The Story
*[Write the main narrative in first person as the educator-storyteller]*

Expand thoughtfully on ${learningDescription}, staying true to what actually happened whilst painting a vivid picture of the child's experience. Include:
- Context and setting details that matter
- The child's actions, expressions, and engagement
- How the learning unfolded naturally
- Moments of discovery, persistence, or collaboration
- The emotional tone of the experience

*Do not embellish beyond the provided details, but bring the observation to life through skilled storytelling that would engage ${childName}'s family.*

## What This Means for ${childName}
*[Write directly to the child in second person perspective using "You..."]*

Reflect on the learning significance from the child's perspective:
- What this experience reveals about them as a learner
- Emerging learning dispositions you observed (curiosity, resilience, creativity, collaboration, etc.)
- How this connects to their growing identity and capabilities
- What makes this moment special in their learning journey

Use affirming, warm language that celebrates their competence and growth.

## Learning Framework Connections

**EYLF v2.0 Outcomes:**
List 2-4 relevant learning outcomes with specific sub-outcome numbers and brief justifications:
- **Outcome X.X:** [Full outcome description] - *Because [brief explanation of how this was demonstrated]*

${ageRange?.includes("5–12") ? "**MTOP v2.0 Connections (where relevant):**\n- **Outcome X.X:** [Full outcome description] - *Because [brief explanation]*\n" : ""}

## Learning Dispositions Observed
Highlight the key learning dispositions demonstrated:
- **[Disposition]:** [How it was shown]
- **[Disposition]:** [How it was shown]
- **[Disposition]:** [How it was shown]

*Examples: Curiosity, Persistence, Collaboration, Creativity, Problem-solving, Confidence, Risk-taking, Communication*

## ${childName}'s Voice
*[Include authentic quotes that capture the child's perspective and thinking]*

Include direct quotes from ${childQuotes} and any additional dialogue that reveals:
- Their curiosity and questions
- Emotional engagement
- Problem-solving thinking
- Social interactions
- Sense of achievement

Present quotes naturally within context (e.g., "As ${childName} carefully examined the butterfly, they wondered aloud, 'Why are its wings so colourful?'").

## Educator Reflection
*[Write in first person as the observing educator]*

Reflect thoughtfully on:
- What surprised, delighted, or impressed you about ${childName}'s learning
- How this experience reveals their unique strengths and interests
- What theories or approaches this connects to (e.g., inquiry-based learning, constructivism)
- How this moment fits into their broader learning journey
- What questions this raises for further exploration

## Looking Forward: Opportunities and Possibilities
*[Planning for extending the learning]*

Based on this observation, consider:
- **Immediate possibilities:** What could happen tomorrow to build on this interest?
- **Resources to introduce:** Materials, books, or experiences that might extend learning
- **Environmental changes:** How might the learning space support continued exploration?
- **Social connections:** Opportunities to share learning with peers or involve families

## Ideas for Home Extension
*[Practical suggestions for families]*

Offer 3-4 simple, engaging ideas that families can try at home:
- Activities using everyday household items
- Conversation starters related to the learning theme
- Community experiences that connect to the child's interests
- Books or resources that might appeal to ${childName}

Incorporate ${homeExtension} whilst ensuring suggestions are:
- Age-appropriate and achievable
- Culturally inclusive and accessible
- Connected to the specific learning observed
- Fun and engaging for the whole family

*Example starter: "You might enjoy continuing ${childName}'s exploration of [topic] by..."*

## Documentation Notes
*[For educator use]*

**Evidence captured:**
- Photos/videos that tell the story
- Work samples or creations
- Conversations and quotes recorded
- Follow-up observations needed

**Sharing:**
- Key moments to highlight when sharing with family
- Connections to previous learning stories
- Links to current curriculum focuses

---

*This Learning Story was written with love and respect for ${childName} as a capable, curious learner. It celebrates their unique journey and invites families to see the remarkable learning happening every day.*
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
