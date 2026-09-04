const swaggerDocument = {
  openapi: "3.0.0",

  info: {
    title: "InterviewPrep AI API",
    version: "1.0.0",
    description:
      "REST API for the InterviewPrep AI interview preparation platform.",
  },

  servers: [
    {
      url: "http://localhost:5000/api",
      description: "Local development server",
    },
  ],

  tags: [
    {
      name: "Authentication",
      description: "User authentication APIs",
    },
    {
      name: "Interviews",
      description: "Interview management APIs",
    },
    {
      name: "Questions",
      description: "Question bank APIs",
    },
    {
      name: "AI",
      description: "Gemini-powered AI APIs",
    },
    {
      name: "Evaluations",
      description: "Answer evaluation APIs",
    },
    {
      name: "Analytics",
      description: "Performance analytics APIs",
    },
    {
      name: "Preparation",
      description: "AI preparation plan APIs",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },

    schemas: {
      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          name: {
            type: "string",
          },
          email: {
            type: "string",
            format: "email",
          },
          role: {
            type: "string",
          },
        },
      },

      Question: {
        type: "object",
        properties: {
          question: {
            type: "string",
          },
          category: {
            type: "string",
          },
          difficulty: {
            type: "string",
            enum: ["easy", "medium", "hard"],
          },
          answer: {
            type: "string",
          },
          explanation: {
            type: "string",
          },
          pinned: {
            type: "boolean",
          },
        },
      },

      Interview: {
        type: "object",
        properties: {
          role: {
            type: "string",
          },
          mode: {
            type: "string",
            enum: [
              "technical",
              "hr",
              "behavioral",
              "mixed",
            ],
          },
          difficulty: {
            type: "string",
            enum: ["easy", "medium", "hard"],
          },
          questionCount: {
            type: "integer",
          },
          overallScore: {
            type: "number",
          },
          status: {
            type: "string",
            enum: ["in-progress", "completed"],
          },
        },
      },
    },
  },

  paths: {
    "/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user",

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                type: "object",

                required: [
                  "name",
                  "email",
                  "password",
                ],

                properties: {
                  name: {
                    type: "string",
                    example: "Rohit",
                  },

                  email: {
                    type: "string",
                    format: "email",
                    example: "rohit@example.com",
                  },

                  password: {
                    type: "string",
                    format: "password",
                    example: "password123",
                  },

                  role: {
                    type: "string",
                    example: "student",
                  },
                },
              },
            },
          },
        },

        responses: {
          201: {
            description: "Registration successful",
          },

          400: {
            description: "Validation failed",
          },

          409: {
            description: "User already exists",
          },
        },
      },
    },

    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login user",

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                type: "object",

                required: [
                  "email",
                  "password",
                ],

                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "rohit@example.com",
                  },

                  password: {
                    type: "string",
                    format: "password",
                    example: "password123",
                  },
                },
              },
            },
          },
        },

        responses: {
          200: {
            description: "Login successful",
          },

          400: {
            description: "Validation failed",
          },

          401: {
            description: "Invalid credentials",
          },
        },
      },
    },

    "/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get current user",

        security: [
          {
            bearerAuth: [],
          },
        ],

        responses: {
          200: {
            description: "Current user returned",
          },

          401: {
            description: "Authentication required",
          },
        },
      },
    },

    "/interviews": {
      get: {
        tags: ["Interviews"],
        summary: "Get user's interviews",

        security: [
          {
            bearerAuth: [],
          },
        ],

        responses: {
          200: {
            description: "Interviews returned",
          },
        },
      },

      post: {
        tags: ["Interviews"],
        summary: "Create an interview",

        security: [
          {
            bearerAuth: [],
          },
        ],

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                type: "object",

                required: ["role"],

                properties: {
                  role: {
                    type: "string",
                    example: "Full Stack Developer",
                  },

                  mode: {
                    type: "string",
                    enum: [
                      "technical",
                      "hr",
                      "behavioral",
                      "mixed",
                    ],
                    example: "technical",
                  },

                  difficulty: {
                    type: "string",
                    enum: [
                      "easy",
                      "medium",
                      "hard",
                    ],
                    example: "medium",
                  },

                  questionCount: {
                    type: "integer",
                    minimum: 1,
                    maximum: 50,
                    example: 10,
                  },
                },
              },
            },
          },
        },

        responses: {
          201: {
            description: "Interview created",
          },

          400: {
            description: "Validation failed",
          },
        },
      },
    },

    "/questions": {
      get: {
        tags: ["Questions"],
        summary: "Get saved questions",

        security: [
          {
            bearerAuth: [],
          },
        ],

        responses: {
          200: {
            description: "Questions returned",
          },
        },
      },

      post: {
        tags: ["Questions"],
        summary: "Create a question",

        security: [
          {
            bearerAuth: [],
          },
        ],

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Question",
              },
            },
          },
        },

        responses: {
          201: {
            description: "Question created",
          },

          400: {
            description: "Validation failed",
          },
        },
      },
    },

    "/ai/generate-questions": {
      post: {
        tags: ["AI"],
        summary: "Generate AI interview questions",

        security: [
          {
            bearerAuth: [],
          },
        ],

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                type: "object",

                required: ["role"],

                properties: {
                  role: {
                    type: "string",
                    example: "Java Developer",
                  },

                  mode: {
                    type: "string",
                    enum: [
                      "technical",
                      "hr",
                      "behavioral",
                      "mixed",
                    ],
                  },

                  difficulty: {
                    type: "string",
                    enum: [
                      "easy",
                      "medium",
                      "hard",
                    ],
                  },

                  questionCount: {
                    type: "integer",
                    example: 5,
                  },
                },
              },
            },
          },
        },

        responses: {
          200: {
            description: "Questions generated",
          },

          401: {
            description: "Authentication required",
          },
        },
      },
    },

    "/ai/evaluate-answer": {
      post: {
        tags: ["AI"],
        summary: "Evaluate candidate answer",

        security: [
          {
            bearerAuth: [],
          },
        ],

        responses: {
          200: {
            description: "Answer evaluated",
          },

          400: {
            description: "Validation failed",
          },
        },
      },
    },

    "/analytics": {
      get: {
        tags: ["Analytics"],
        summary: "Get interview analytics",

        security: [
          {
            bearerAuth: [],
          },
        ],

        responses: {
          200: {
            description: "Analytics returned",
          },
        },
      },
    },

    "/preparation": {
      get: {
        tags: ["Preparation"],
        summary: "Get preparation plan",

        security: [
          {
            bearerAuth: [],
          },
        ],

        responses: {
          200: {
            description: "Preparation plan returned",
          },
        },
      },
    },

    "/preparation/generate": {
      post: {
        tags: ["Preparation"],
        summary: "Generate AI preparation plan",

        security: [
          {
            bearerAuth: [],
          },
        ],

        responses: {
          200: {
            description: "Preparation plan generated",
          },
        },
      },
    },
  },
};

export default swaggerDocument;