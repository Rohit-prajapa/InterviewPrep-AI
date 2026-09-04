import OpenAI from "openai";

const getClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
};

const getModeInstructions = (mode) => {
  switch (mode) {
    case "technical":
      return `
Focus on technical knowledge, programming concepts,
problem solving, databases, APIs, architecture and
role-specific engineering skills.
`;

    case "hr":
      return `
Focus on HR and recruiter questions such as:
Tell me about yourself, career goals, strengths,
weaknesses, motivation, company fit, teamwork,
leadership and conflict handling.
`;

    case "behavioral":
      return `
Focus on behavioral and situational questions involving
teamwork, leadership, conflict, problem solving,
failure, decision making and adaptability.
Prefer STAR-style questions.
`;

    case "mixed":
      return `
Create a balanced combination of technical, HR and
behavioral questions.
`;

    default:
      return "Focus on relevant interview questions for the candidate's role.";
  }
};

const generateJSON = async (prompt) => {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "system",
        content: "You are an expert AI interview assistant. Return valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    response_format: {
      type: "json_object",
    },
  });

  const text = response.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error("Groq returned an empty response");
  }

  return JSON.parse(text);
};

export const generateInterviewQuestions = async ({
  role,
  difficulty,
  mode,
  questionCount,
}) => {
  const prompt = `
You are an expert interviewer.

Candidate Role: ${role}
Difficulty: ${difficulty}
Interview Mode: ${mode}

${getModeInstructions(mode)}

Generate exactly ${questionCount} interview questions.

Rules:
- Relevant to the candidate's role.
- Match the requested difficulty.
- Avoid duplicates.
- Cover different concepts.
- Make questions realistic.

Return JSON:
{
  "questions": [
    {
      "question": "string",
      "category": "string",
      "difficulty": "easy|medium|hard"
    }
  ]
}
`;

  return generateJSON(prompt);
};

export const evaluateAnswer = async ({
  question,
  answer,
  role,
  mode = "technical",
}) => {
  const prompt = `
You are an expert interviewer evaluating a candidate.

Candidate Role: ${role}
Interview Mode: ${mode}

${getModeInstructions(mode)}

Question:
${question}

Candidate Answer:
${answer}

Evaluate fairly.

Score every category from 0 to 100.

Return JSON:
{
  "technicalAccuracy": 0,
  "completeness": 0,
  "communication": 0,
  "confidence": 0,
  "overallScore": 0,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "missingConcepts": ["string"],
  "idealAnswer": "string",
  "followUpQuestion": "string"
}
`;

  return generateJSON(prompt);
};

export const generatePreparationPlan = async ({
  targetRole,
  experience,
  skills,
  averageScore,
  technicalAccuracy,
  communication,
  confidence,
  weakAreas,
}) => {
  const prompt = `
You are an expert interview preparation coach.

Create a personalized 4-week interview preparation plan.

Target Role: ${targetRole}
Experience: ${experience}
Skills: ${skills.join(", ") || "Not specified"}

Performance:
Average Score: ${averageScore}
Technical Accuracy: ${technicalAccuracy}
Communication: ${communication}
Confidence: ${confidence}

Weak Areas:
${weakAreas.join(", ") || "No specific weak areas yet"}

Rules:
- Prioritize weak areas.
- Make the plan practical.
- Include technical preparation, interview practice and communication.
- Create exactly 4 weeks.
- Each week needs topics and actionable tasks.

Return JSON:
{
  "targetRole": "string",
  "goals": ["string"],
  "weeks": [
    {
      "week": 1,
      "title": "string",
      "topics": ["string"],
      "tasks": ["string"],
      "completed": false
    }
  ]
}
`;

  return generateJSON(prompt);
};

export const generateAdaptiveQuestion = async ({
  role,
  mode,
  previousQuestion,
  previousAnswer,
  previousScore,
  difficulty,
}) => {
  let nextDifficulty = difficulty;

  if (previousScore >= 80) {
    nextDifficulty = "hard";
  } else if (previousScore < 50) {
    nextDifficulty = "easy";
  } else {
    nextDifficulty = "medium";
  }

  const prompt = `
You are an adaptive AI interviewer.

Candidate Role: ${role}
Interview Mode: ${mode}

${getModeInstructions(mode)}

Previous Question:
${previousQuestion}

Previous Answer:
${previousAnswer}

Previous Score:
${previousScore}/100

Generate ONE new interview question.

Rules:
- Score 80-100 → hard.
- Score 50-79 → medium.
- Score 0-49 → easy.
- Do not repeat the previous question.
- Test a related but different concept.
- Keep it relevant to the role.

Return JSON:
{
  "question": "string",
  "category": "string",
  "difficulty": "${nextDifficulty}"
}
`;

  return generateJSON(prompt);
};