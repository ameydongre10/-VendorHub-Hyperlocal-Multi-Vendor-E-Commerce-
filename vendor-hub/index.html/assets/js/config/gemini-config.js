import { getEnv } from "./env-loader.js";

const getApiKey = () => {
    return getEnv("VITE_GEMINI_API_KEY") || 
           (typeof window !== "undefined" && window.__env?.VITE_GEMINI_API_KEY) || 
           "";
};

export const askGemini = async (prompt) => {
    const apiKey = getApiKey();
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
        console.warn("[VendorHub AI] VITE_GEMINI_API_KEY not set or placeholder; AI fallback active.");
        return null;
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            console.warn(`[VendorHub AI] Request failed with HTTP ${response.status}`);
            return null;
        }

        const data = await response.json();
        if (data && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        }
        return null;
    } catch (error) {
        console.warn("[VendorHub AI] Gemini Error:", error.message);
        return null;
    }
};
