import { askGemini } from "../config/gemini-config.js";

export const getSmartSearchKeywords = async (query) => {
    const prompt = `Act as an e-commerce assistant. Provide 5 comma-separated synonyms or related categories for the search term: "${query}". Only return the keywords.`;
    const result = await askGemini(prompt);
    return result ? result.split(",").map(k => k.trim().toLowerCase()) : [query.toLowerCase()];
};

export const getAIRecommendations = async (browsingHistory, allProducts) => {
    const productNames = allProducts.map(p => p.name).join(", ");
    const prompt = `Based on a user's interest in ${browsingHistory.join(", ")}, which 3 products from this list are most relevant: ${productNames}? Return only the names.`;
    const result = await askGemini(prompt);
    return result ? result.split(",").map(k => k.trim()) : [];
};