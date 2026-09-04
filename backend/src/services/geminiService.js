import OpenAI from "openai";

const getClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
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
- Tell me about yourself
- Career goals
- Strengths and weaknesses
- Motivation
- Company fit
- Teamwork
- Leadership
- Conflict handling
`;

    case "behavioral":
      return `
Focus on behavioral and situational questions.
Use realistic workplace scenarios involving:
- Teamwork
- Leadership
- Conflict
- Problem solving
- Failure
- Decision making
- Adaptability

Prefer STAR-style questions.
`;

    case "mixed":
      return `
Create a balanced combination of:
- Technical questions
- HR questions
- Behavioral questions

Distribute the questions across these areas.
`;

    default:
      return `
Focus on relevant interview questions for the candidate's role.
`;
  }
};

const generateJSON = async (prompt) => {
  const client = getClient();

  const response = await client.responses.create({
    model: "gpt-5.6-luna",
    input: prompt,
  });

  const text = response.output_text?.trim();

  if (!text) {
    throw new Error("OpenAI returned an empty response");
  }

  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("OpenAI returned invalid JSON");
  }

  return JSON.parse(cleaned.slice(start, end + 1));
};

export const generateInterviewQuestions = async ({
  role,
  difficulty,
  mode,
  questionCount,
}) => {
  const modeInstructions = getModeInstructions(mode);

  const prompt = `
You are an expert interviewer conducting a professional interview.

Candidate Role:
${role}

Difficulty:
${difficulty}

Interview Mode:
${mode}

${modeInstructions}

Generate exactly ${questionCount} interview questions.

Rules:
- Questions must be relevant to the candidate's role.
- Match the requested difficulty.
- Avoid duplicate questions.
- Cover different important concepts.
- Make questions realistic for an actual interview.
- Return ONLY valid JSON.
- Do not use markdown.

JSON format:
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
  const modeInstructions = getModeInstructions(mode);

  const prompt = `
You are an expert interviewer evaluating a candidate.

Candidate Role:
${role}

Interview Mode:
${mode}

${modeInstructions}

Interview Question:
${question}

Candidate Answer:
${answer}

Evaluate the candidate fairly.

Score every category from 0 to 100.

Return ONLY valid JSON.
Do not use markdown.

JSON format:
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

Candidate:
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
- Make the plan practical and achievable.
- Include technical preparation, interview practice and communication.
- Create exactly 4 weeks.
- Each week must contain topics and actionable tasks.
- Return ONLY valid JSON.
- Do not use markdown.

JSON format:
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

  const modeInstructions = getModeInstructions(mode);

  const prompt = `
You are an adaptive AI interviewer.

Candidate Role:
${role}

Interview Mode:
${mode}

${modeInstructions}

Previous Question:
${previousQuestion}

Previous Answer:
${previousAnswer}

Previous Overall Score:
${previousScore}/100

Generate ONE new interview question.

Adaptive difficulty rules:
- Score 80-100: increase difficulty to hard.
- Score 50-79: keep difficulty medium.
- Score 0-49: reduce difficulty to easy.
- Do not repeat the previous question.
- Test a related but different concept.
- Keep the question relevant to the candidate's role.
- Follow the selected interview mode.

Return ONLY valid JSON.
Do not use markdown.

JSON format:
{
  "question": "string",
  "category": "string",
  "difficulty": "${nextDifficulty}"
}
`;

  return generateJSON(prompt);
};