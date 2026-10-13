const { getAIResponse } = require("./ai.service");

const generateQuestions = async (resumeText, jobDescription, category, role) => {
  try {
    const prompt = `
      Generate interview questions for role "${role || "General"}" in category "${category || "All"}".
      Resume Text: ${resumeText || "General Candidate"}
      Job Description: ${jobDescription || "Standard industry job description"}
    `;

    const aiResult = await getAIResponse(prompt);

    // Flatten into frontend question format: { id, category, text, tip }
    const questions = [];
    let idCounter = 1;

    if (aiResult.categories) {
      const mapping = {
        technical: "Technical",
        behavioral: "Behavioural",
        situational: "Behavioural",
        roleSpecific: "Gap-based",
      };

      for (const [key, list] of Object.entries(aiResult.categories)) {
        if (Array.isArray(list)) {
          for (const item of list) {
            questions.push({
              id: idCounter++,
              category: mapping[key] || "Technical",
              text: item.question || item.text,
              tip: item.hint || item.tip || "Structure your answer using the STAR method.",
            });
          }
        }
      }
    }

    // If empty or fallback needed
    if (questions.length === 0) {
      questions.push(
        {
          id: 1,
          category: "Technical",
          text: `How do you approach designing scalable systems in ${role || "Software Engineering"}?`,
          tip: "Mention caching, modular architecture, and load distribution.",
        },
        {
          id: 2,
          category: "Behavioural",
          text: "Tell me about a challenging project deadline and how you managed expectations.",
          tip: "Highlight proactive communication, prioritization, and delivery.",
        },
        {
          id: 3,
          category: "Gap-based",
          text: "How do you quickly learn a newly adopted technology or framework?",
          tip: "Describe your rapid learning process and practical project application.",
        }
      );
    }

    return {
      totalQuestions: questions.length,
      questions,
      tips: aiResult.tips || [
        "Take a moment to collect your thoughts before responding.",
        "Provide concrete metrics and impact examples.",
      ],
      categories: aiResult.categories,
    };
  } catch (error) {
    console.error("Interview Service Error:", error);
    throw error;
  }
};

const getQuestionsByResumeId = async (resumeId) => {
  try {
    return {
      resumeId,
      questions: [],
      message: "No questions found for this resume yet",
    };
  } catch (error) {
    console.error("Get Questions Error:", error);
    throw error;
  }
};

module.exports = { generateQuestions, getQuestionsByResumeId };