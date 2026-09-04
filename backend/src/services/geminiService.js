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

const MODEL = "openai/gpt-oss-20b";

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
      return `
Focus on relevant interview questions for the candidate's role.
`;
  }
};

const cleanJsonText = (text) => {
  if (!text) {
    throw new Error("Groq returned an empty response");
  }

  let cleaned = text.trim();

  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const objectStart = cleaned.indexOf("{");
  const objectEnd = cleaned.lastIndexOf("}");

  if (objectStart !== -1 && objectEnd > objectStart) {
    cleaned = cleaned.slice(objectStart, objectEnd + 1);
  }

  return cleaned;
};

const generateJSON = async (prompt) => {
  const client = getClient();

  try {
    const response = await client.chat.completions.create({
      model: MODEL,

      messages: [
        {
          role: "system",
          content:
            "You are an expert AI interview assistant. Return ONLY valid JSON. Never return markdown or explanations outside the JSON object.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.2,

      response_format: {
        type: "json_object",
      },
    });

    const rawText =
      response.choices?.[0]?.message?.content || "";

    const cleanedText = cleanJsonText(rawText);

    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Invalid Groq JSON:", rawText);
      throw new Error("Groq returned invalid JSON");
    }
  } catch (error) {
    console.error("Groq AI Error:", {
      message: error.message,
      status: error.status,
      code: error.code,
    });

    throw error;
  }
};

export const generateInterviewQuestions = async ({
  role,
  difficulty = "medium",
  mode = "technical",
  questionCount = 5,
}) => {
  const safeQuestionCount = Math.min(
    Math.max(Number(questionCount) || 5, 1),
    20
  );

  const prompt = `
You are an expert interviewer.

Candidate Role: ${role}
Difficulty: ${difficulty}
Interview Mode: ${mode}

${getModeInstructions(mode)}

Generate exactly ${safeQuestionCount} interview questions.

Rules:
- Questions must be relevant to the candidate's role.
- Match the requested difficulty.
- Avoid duplicates.
- Cover different concepts.
- Make questions realistic for an actual interview.
- Return exactly ${safeQuestionCount} questions.
- Do not include answers.

Return ONLY valid JSON in this exact format:

{
  "questions": [
    {
      "question": "string",
      "category": "string",
      "difficulty": "easy"
    }
  ]
}
`;

  const result = await generateJSON(prompt);

  if (!Array.isArray(result.questions)) {
    throw new Error("Groq returned an invalid questions format");
  }

  return {
    questions: result.questions.slice(0, safeQuestionCount),
  };
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

Evaluate the candidate fairly.

Score every category from 0 to 100.

Return ONLY valid JSON in this exact format:

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

  const result = await generateJSON(prompt);

  return {
    technicalAccuracy: Math.min(
      Math.max(Number(result.technicalAccuracy) || 0, 0),
      100
    ),

    completeness: Math.min(
      Math.max(Number(result.completeness) || 0, 0),
      100
    ),

    communication: Math.min(
      Math.max(Number(result.communication) || 0, 0),
      100
    ),

    confidence: Math.min(
      Math.max(Number(result.confidence) || 0, 0),
      100
    ),

    overallScore: Math.min(
      Math.max(Number(result.overallScore) || 0, 0),
      100
    ),

    strengths: Array.isArray(result.strengths)
      ? result.strengths
      : [],

    weaknesses: Array.isArray(result.weaknesses)
      ? result.weaknesses
      : [],

    missingConcepts: Array.isArray(result.missingConcepts)
      ? result.missingConcepts
      : [],

    idealAnswer: result.idealAnswer || "",

    followUpQuestion:
      result.followUpQuestion || "",
  };
};

export const generatePreparationPlan = async ({
  targetRole,
  experience,
  skills = [],
  averageScore = 0,
  technicalAccuracy = 0,
  communication = 0,
  confidence = 0,
  weakAreas = [],
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
- Include technical preparation.
- Include interview practice.
- Include communication improvement.
- Create exactly 4 weeks.
- Each week needs topics and actionable tasks.

Return ONLY valid JSON:

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
  mode = "technical",
  previousQuestion,
  previousAnswer,
  previousScore,
  difficulty = "medium",
}) => {
  let nextDifficulty = "medium";

  if (Number(previousScore) >= 80) {
    nextDifficulty = "hard";
  } else if (Number(previousScore) < 50) {
    nextDifficulty = "easy";
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
- Keep it relevant to the candidate's role.

Return ONLY valid JSON:

{
  "question": "string",
  "category": "string",
  "difficulty": "${nextDifficulty}"
}
`;

  const result = await generateJSON(prompt);

  return {
    question: result.question || "",
    category: result.category || "General",
    difficulty: nextDifficulty,
  };
};