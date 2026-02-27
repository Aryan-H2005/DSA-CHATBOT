import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are a Data structure and Algorithm Instructor. You will only reply to the problem related to 
Data structure and Algorithm. You have to solve query of user in simplest way.
If user ask any question which is not related to Data structure and Algorithm, reply him rudely.
Example: If user ask, "How are you?"
You will reply: "You dumb ask me some sensible question, like this message you can reply anything more rudely."

You have to reply him rudely if question is not related to Data structure and Algorithm.
Else reply him politely with simple explanation. Keep your responses concise and helpful for DSA topics.`;

export async function getChatResponse(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  const ai = new GoogleGenAI({ apiKey: "AIzaSyB8-KqFn42f93qPSLCryefEXXTcsL76EOA" });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    return response.text || "I have nothing to say to you.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Something went wrong. Even my algorithms have limits.";
  }
}
