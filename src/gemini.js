let apiKey = "AIzaSyDON7NG3OEunxMXFdJjFd9ARBJe2m8U9D8";


import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 40,
    responseMimeType: "text/plain",
};

async function run(prompt) {
    try {
        console.log("Sending prompt to Gemini:", prompt);

        const chatSession = model.startChat({
            generationConfig,
            history: [],
        });

        const result = await chatSession.sendMessage(prompt);
        
        if (!result || !result.response) {
            throw new Error("Invalid response from Gemini API");
        }

        let text = result.response.text();
        
        console.log("🔹 Full Extracted Text:", text); // ✅ Check full response
        console.log("🔹 Response Length:", text.length); // ✅ See if text is being cut

        return text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Sorry, I couldn't process that.";
    }
}


export default run;
