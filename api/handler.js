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
    childQuotes,
    developmentalProgress // NEW FIELD: "emerging", "developing", "secure", "extending"
  } = req.body;

  if (!childName || !learningDescription || !learningOutcome) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const includeMTOP = ageRange?.includes("5–12");

  const userMessage = `
You are a qualified early childhood or school-age educator in Australia with expertise in Margaret Carr's Learning Stories methodology and deep knowledge of the Early Years Learning Framework (EYLF) v2.0 and My Time, Our Place (MTOP) v2.0 frameworks.

**Task**: Analyse the learning observation and dynamically select the most appropriate EYLF outcomes and sub-outcomes that genuinely reflect what was observed. Then write a structured Learning Story that positions the child as the hero of their learning journey while maintaining complete factual accuracy.

**Input Details:**
- Child's Name: ${childName}
- Age Range: ${ageRange}
- Description of Learning: ${learningDescription}
- What the child learned: ${learningOutcome}
- Developmental Progress: ${developmentalProgress || 'developing'} (emerging = just beginning to show this learning, developing = progressing in this area, secure = confidently demonstrating, extending = going beyond expected level)
- Home Extension Ideas: ${homeExtension}
- Child's Voice: ${childQuotes}

**Step 1: EYLF Analysis**
Before writing the Learning Story, analyse the learning description and identify which EYLF v2.0 outcomes and specific sub-outcomes are genuinely demonstrated in this observation. Consider:

**EYLF v2.0 Learning Outcomes:**
- **Outcome 1: Children have a strong sense of identity**
  - 1.1: Children feel safe, secure and supported
  - 1.2: Children develop their emerging autonomy, inter-dependence, resilience and agency
  - 1.3: Children develop knowledgeable, confident self-identities and a positive sense of self-worth
  - 1.4: Children learn to interact in relation to others with care, empathy and respect

- **Outcome 2: Children are connected with and contribute to their world**
  - 2.1: Children develop a sense of connectedness to groups and communities and an understanding of their reciprocal rights and responsibilities as active and informed citizens
  - 2.2: Children respond to diversity with respect
  - 2.3: Children become aware of fairness
  - 2.4: Children become socially responsible and show respect for the environment

- **Outcome 3: Children have a strong sense of wellbeing**
  - 3.1: Children become strong in their social, emotional and mental wellbeing
  - 3.2: Children become strong in their physical learning and wellbeing
  - 3.3: Children are aware of and develop strategies to support their own mental and physical health and personal safety

- **Outcome 4: Children are confident and involved learners**
  - 4.1: Children develop a growth mindset and learning dispositions such as curiosity, cooperation, confidence, creativity, commitment, enthusiasm, persistence, imagination and reflexivity
  - 4.2: Children develop a range of learning and thinking skills and processes such as problem solving, inquiry, experimentation, hypothesising, researching and investigating
  - 4.3: Children transfer and adapt what they have learned from one context to another
  - 4.4: Children resource their own learning through connecting with people, place, technologies and natural and processed materials

- **Outcome 5: Children are effective communicators**
  - 5.1: Children interact verbally and non-verbally with others for a range of purposes
  - 5.2: Children engage with a range of texts and gain meaning from these texts
  - 5.3: Children express ideas and make meaning using a range of media
  - 5.4: Children begin to understand how symbols and pattern systems work
  - 5.5: Children use digital technologies and media to access information, investigate ideas and represent their thinking

${includeMTOP ? `
**MTOP v2.0 Connections (where relevant for school-age children):**
Select appropriate MTOP outcomes that align with the EYLF outcomes chosen.
` : ""}

**Step 2: Developmental Progress Integration**
Based on the developmental progress indicator (${developmentalProgress || 'developing'}), adjust your language throughout the ENTIRE learning story to reflect:

- **Emerging**: "beginning to show...", "starting to demonstrate...", "exploring the idea of...", "taking first steps in..."
- **Developing**: "increasingly showing...", "growing confidence in...", "building skills in...", "progressing towards..."
- **Secure**: "confidently demonstrating...", "consistently showing...", "clearly understanding...", "competently managing..."
- **Extending**: "exceeding typical expectations by...", "demonstrating sophisticated understanding of...", "showing mastery through...", "independently leading...", "displaying advanced capabilities in...", "going beyond the expected level by..."

**CRITICAL**: Use this developmental language consistently in ALL sections - The Story, What This Means, Learning Dispositions, and Educator Reflection. The developmental level should be evident throughout the entire learning story.

**Writing Guidelines:**
- Write as a professional educator documenting genuine observations
- Use first person perspective ("I observed...", "I noticed...") but maintain factual accuracy
- Focus on what actually happened without adding fictional details
- Use warm, engaging language while staying completely truthful
- Make the child the hero through celebrating their actual achievements
- **NEVER add details not provided in the original observation**
- Link to specific EYLF v2.0 sub-outcomes with numbers and brief justification that genuinely reflects the observation
- Remember families will read this as a factual account of their child's experience

**Required Structure in Markdown:**

# Learning Story: [Create a meaningful title inspired by the child's voice, actions, or the essence of their learning]

## The Story
*[Write the main narrative in first person as the educator-storyteller]*

Expand thoughtfully on ${learningDescription}, staying strictly factual while making the observation engaging for families. **CRITICAL: Only include details that were actually observed - never add fictional elements, expressions, sounds, or emotions that weren't specifically mentioned.**

Include only:
- Facts about what ${childName} actually did
- The sequence of events as described
- Context provided in the original observation
- Any direct quotes or interactions that were recorded

**Do not add:**
- Facial expressions not mentioned
- Sounds not recorded
- Emotional interpretations not observed
- Dramatic language that wasn't part of the actual observation
- Details about setting unless provided

*Write with warmth and professionalism, but maintain complete factual accuracy. Parents trust these observations to be genuine records of their child's experience.*

## What This Means for ${childName}
*[Write directly to the child in second person perspective using "You..."]*

Reflect on the learning significance from the child's perspective, incorporating the developmental progress level (${developmentalProgress || 'developing'}):
- What this experience reveals about them as a learner
- Emerging learning dispositions you observed (curiosity, resilience, creativity, collaboration, etc.)
- How this connects to their growing identity and capabilities
- What makes this moment special in their learning journey

Use affirming, warm language that celebrates their competence and growth at their current developmental level.

## Learning Framework Connections

**EYLF v2.0 Outcomes:**
[Based on your analysis, list 2-4 relevant learning outcomes that GENUINELY reflect what was observed]:
- **Outcome X.X:** [Full sub-outcome description] - *Because [specific evidence from the observation that demonstrates this outcome]*

${includeMTOP ? `**MTOP v2.0 Connections:**
[Only include if genuinely relevant to the observation]
- **Outcome X.X:** [Full outcome description] - *Because [specific evidence from the observation]*
` : ""}

## Learning Dispositions Observed
Highlight the key learning dispositions demonstrated, adjusting language for developmental progress:
- **[Disposition]:** [How it was shown, using appropriate developmental language]
- **[Disposition]:** [How it was shown, using appropriate developmental language]
- **[Disposition]:** [How it was shown, using appropriate developmental language]

*Examples: Curiosity, Persistence, Collaboration, Creativity, Problem-solving, Confidence, Risk-taking, Communication*

## ${childName}'s Voice
*[Include authentic quotes that capture the child's perspective and thinking]*

Include ONLY the exact quotes provided in ${childQuotes}. **Do not create additional dialogue or quotes.** Present the actual quotes that reveal:
- Their curiosity and questions
- Emotional engagement
- Problem-solving thinking
- Social interactions
- Sense of achievement

Present quotes naturally within context.

## Educator Reflection
*[Write in first person as the observing educator]*

Reflect thoughtfully on:
- What surprised, delighted, or impressed you about ${childName}'s learning
- How this experience reveals their unique strengths and interests at their current developmental level
- What theories or approaches this connects to (e.g., inquiry-based learning, constructivism)
- How this moment fits into their broader learning journey
- What questions this raises for further exploration

## Looking Forward: Opportunities and Possibilities
*[Planning for extending the learning]*

Based on this observation and developmental progress level, consider:
- **Immediate possibilities:** What could happen next to build on this interest?
- **Resources to introduce:** Materials, books, or experiences that might extend learning
- **Environmental changes:** How might the learning space support continued exploration?
- **Social connections:** Opportunities to share learning with peers or involve families

## Ideas for Home Extension
*[Practical suggestions for families]*

Offer 3-4 simple, engaging ideas that families can try at home, considering the child's developmental level:
- Activities using everyday household items
- Conversation starters related to the learning theme
- Community experiences that connect to the child's interests
- Books or resources that might appeal to ${childName}

Incorporate ${homeExtension} whilst ensuring suggestions are:
- Age-appropriate and achievable for the child's developmental level
- Culturally inclusive and accessible
- Connected to the specific learning observed
- Fun and engaging for the whole family

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
        model: "gpt-4", // Consider upgrading to GPT-4 for better analysis
        messages: [
          {
            role: "system",
            content: "You are an expert early childhood educator with deep knowledge of the EYLF v2.0 and MTOP frameworks. You create reflective, evidence-based Learning Stories that accurately link observations to appropriate learning outcomes. You always analyse the learning description carefully to select only the most relevant and genuinely demonstrated EYLF outcomes."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 2000 // Increased for more detailed analysis
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
