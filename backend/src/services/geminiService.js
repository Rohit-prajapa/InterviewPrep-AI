import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const ai = new GoogleGenAI({
  apiKey,
});

const MODEL = "gemini-3.5-flash-lite";


// =====================================================
// Generate Structured JSON
// =====================================================

async function generateJSON(prompt, responseSchema) {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,

      contents: prompt,

      config: {
        temperature: 0.2,

        responseMimeType: "application/json",

        responseSchema,
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned an empty response");
    }

    console.log("Gemini AI response received");

    return JSON.parse(response.text);

  } catch (error) {
    console.error("Gemini AI Error:", {
      message: error.message,
      status: error.status,
      code: error.code,
    });

    throw error;
  }
}


// =====================================================
// Generate Interview Questions
// =====================================================

export const generateInterviewQuestions = async ({
  role,
  difficulty = "medium",
  count = 5,
  mode = "technical",
}) => {

  const prompt = `
You are an expert technical interviewer.

Generate exactly ${count} interview questions.

Role:
${role}

Difficulty:
${difficulty}

Interview Mode:
${mode}

Rules:
- Questions must be relevant to the role.
- Questions must be different.
- Questions should be realistic interview questions.
- Difficulty must be easy, medium, or hard.
`;

  const schema = {
    type: Type.OBJECT,

    properties: {
      questions: {
        type: Type.ARRAY,

        items: {
          type: Type.OBJECT,

          properties: {
            question: {
              type: Type.STRING,
            },

            category: {
              type: Type.STRING,
            },

            difficulty: {
              type: Type.STRING,
              enum: ["easy", "medium", "hard"],
            },
          },

          required: [
            "question",
            "category",
            "difficulty",
          ],
        },
      },
    },

    required: ["questions"],
  };

  const result = await generateJSON(prompt, schema);

  if (
    !result ||
    !Array.isArray(result.questions) ||
    result.questions.length === 0
  ) {
    throw new Error("No questions generated");
  }

  return result.questions;
};


// =====================================================
// Evaluate Candidate Answer
// =====================================================

export const evaluateAnswer = async ({
  question,
  answer,
  role,
  difficulty = "medium",
}) => {

  const prompt = `
You are an expert technical interviewer.

Evaluate the candidate's answer objectively.

Role:
${role}

Difficulty:
${difficulty}

Question:
${question}

Candidate Answer:
${answer}

Score every category from 0 to 100.

Consider:
- Technical correctness
- Completeness
- Communication
- Confidence
- Overall performance

Provide strengths, weaknesses, missing concepts,
an ideal answer, and one useful follow-up question.
`;

  const schema = {
    type: Type.OBJECT,

    properties: {
      technicalAccuracy: {
        type: Type.NUMBER,
      },

      completeness: {
        type: Type.NUMBER,
      },

      communication: {
        type: Type.NUMBER,
      },

      confidence: {
        type: Type.NUMBER,
      },

      overallScore: {
        type: Type.NUMBER,
      },

      strengths: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
      },

      weaknesses: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
      },

      missingConcepts: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
      },

      idealAnswer: {
        type: Type.STRING,
      },

      followUpQuestion: {
        type: Type.STRING,
      },
    },

    required: [
      "technicalAccuracy",
      "completeness",
      "communication",
      "confidence",
      "overallScore",
      "strengths",
      "weaknesses",
      "missingConcepts",
      "idealAnswer",
      "followUpQuestion",
    ],
  };

  return await generateJSON(prompt, schema);
};


// =====================================================
// Generate Adaptive Question
// =====================================================

export const generateAdaptiveQuestion = async ({
  role,
  previousQuestion,
  previousAnswer,
  previousScore,
  difficulty = "medium",
}) => {

  const prompt = `
You are an adaptive AI interviewer.

Role:
${role}

Previous Question:
${previousQuestion}

Previous Answer:
${previousAnswer}

Previous Score:
${previousScore}

Current Difficulty:
${difficulty}

Generate the next interview question.

Rules:
- If the candidate performed well, increase difficulty.
- If the candidate performed poorly, maintain or reduce difficulty.
- Focus on missing or weak concepts when appropriate.
`;

  const schema = {
    type: Type.OBJECT,

    properties: {
      question: {
        type: Type.STRING,
      },

      category: {
        type: Type.STRING,
      },

      difficulty: {
        type: Type.STRING,
        enum: ["easy", "medium", "hard"],
      },
    },

    required: [
      "question",
      "category",
      "difficulty",
    ],
  };

  return await generateJSON(prompt, schema);
};


// =====================================================
// Generate Preparation Plan
// =====================================================

export const generatePreparationPlan = async ({
  targetRole,
  goals = [],
}) => {

  const prompt = `
You are an expert interview preparation coach.

Create a practical 4-week interview preparation plan.

Target Role:
${targetRole}

Candidate Goals:
${goals.join(", ")}

Create exactly 4 weeks.
Each week should contain useful topics and tasks.
`;

  const schema = {
    type: Type.OBJECT,

    properties: {
      targetRole: {
        type: Type.STRING,
      },

      goals: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
      },

      weeks: {
        type: Type.ARRAY,

        items: {
          type: Type.OBJECT,

          properties: {
            week: {
              type: Type.INTEGER,
            },

            title: {
              type: Type.STRING,
            },

            topics: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },

            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },

            completed: {
              type: Type.BOOLEAN,
            },
          },

          required: [
            "week",
            "title",
            "topics",
            "tasks",
            "completed",
          ],
        },
      },
    },

    required: [
      "targetRole",
      "goals",
      "weeks",
    ],
  };

  return await generateJSON(prompt, schema);
};