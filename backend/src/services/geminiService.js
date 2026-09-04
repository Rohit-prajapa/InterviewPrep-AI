import { GoogleGenerativeAI } from "@google/generative-ai";

const getModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  return genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
  });
};

const cleanJson = (text) => {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Gemini returned invalid JSON");
  }

  return JSON.parse(cleaned.slice(start, end + 1));
};

const generateWithRetry = async (model, prompt, retries = 2) => {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await model.generateContent(prompt);
    } catch (error) {
      lastError = error;

      const message = error?.message || "";

      const isRateLimit =
        message.includes("429") ||
        message.includes("Too Many Requests") ||
        message.includes("quota") ||
        message.includes("Quota exceeded");

      const isTemporary =
        message.includes("503") ||
        message.includes("Service Unavailable") ||
        message.includes("high demand");

      if (isRateLimit) {
        throw new Error(
          "Gemini API quota exceeded. Please wait and try again later."
        );
      }

      if (!isTemporary || attempt === retries) {
        throw error;
      }

      const delay = attempt * 3000;

      console.log(
        `Gemini temporary error. Retrying in ${delay / 1000}s...`
      );

      await new Promise((resolve) =>
        setTimeout(resolve, delay)
      );
    }
  }

  throw lastError;
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

export const generateInterviewQuestions = async ({
  role,
  difficulty,
  mode,
  questionCount,
}) => {
  const model = getModel();

  const modeInstructions = getModeInstructions(mode);

  const prompt = `
You are an expert interviewer conducting a professional
interview.

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
- For HR questions, evaluate personality, motivation and company fit.
- For behavioral questions, use realistic workplace situations.
- For technical questions, test actual technical understanding.
- For mixed mode, maintain a balanced mixture of question types.
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

  const result = await generateWithRetry(model, prompt);
  const text = result.response.text();

  return cleanJson(text);
};

export const evaluateAnswer = async ({
  question,
  answer,
  role,
  mode = "technical",
}) => {
  const model = getModel();

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

Evaluation should consider the interview mode:
- Technical: technical accuracy and completeness are most important.
- HR: communication, clarity, confidence and suitability are important.
- Behavioral: communication, confidence, reasoning and completeness are important.
- Mixed: balance all relevant dimensions.

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

  const result = await generateWithRetry(model, prompt);
  const text = result.response.text();

  return cleanJson(text);
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
  const model = getModel();

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

  const result = await generateWithRetry(model, prompt);
  const text = result.response.text();

  return cleanJson(text);
};

export const generateAdaptiveQuestion = async ({
  role,
  mode,
  previousQuestion,
  previousAnswer,
  previousScore,
  difficulty,
}) => {
  const model = getModel();

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

Candidate Answer:
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

  const result = await generateWithRetry(model, prompt);
  const text = result.response.text();

  return cleanJson(text);
};