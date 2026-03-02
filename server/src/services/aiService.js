const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// PRESETS: Think of these as different "Staff Members"
const AGENT_ROLES = {
  FINANCE: "You are a Barangay Treasurer's assistant. Focus on budget utilization and deficit risks.",
  HEALTH: "You are a Barangay Health Worker. Focus on symptom trends, nutrition, and maternal health risks.",
  JUSTICE: "You are a Lupon Tagapamayapa assistant. Focus on conflict resolution and legal categorization.",
  WASTE: "You are an Environmental Officer. Focus on waste segregation compliance and collection efficiency."
};

const getAiResponse = async (roleType, userContent) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: AGENT_ROLES[roleType] || "You are a helpful Barangay Assistant."
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      model: "llama-3.3-70b-versatile", // Upgrading to 70B for better reasoning (still free)
      temperature: 0.5,
    });

    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq AI Error:", error);
    throw new Error("AI Agent is currently unavailable.");
  }
};

module.exports = { getAiResponse };