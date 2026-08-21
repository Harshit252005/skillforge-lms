const { GoogleGenAI } = require('@google/genai');

// Explicitly pass the key so it never fails to find it
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const explainConcept = async (req, res) => {
    const { term, courseContext } = req.body;

    if (!term) {
        return res.status(400).json({ message: "Term is required" });
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: `You are a helpful AI tutor for an online learning platform. 
            A student watching a course about "${courseContext || 'programming'}" highlighted the term or phrase: "${term}". 
            Explain this term clearly, simply (ELI5 style - Explain Like I'm 5), and keep it concise (under 3 sentences) with a quick real-world analogy.`,
        });

        res.json({ explanation: response.text });
    } catch (e) {
        console.error("Gemini ELI5 Error:", e);
        res.status(500).json({ message: "Failed to generate AI explanation", error: e.message });
    }
};

module.exports = { explainConcept };