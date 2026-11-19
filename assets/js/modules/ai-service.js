import { askGemini } from "../config/gemini-config.js";

// Common category synonyms and keyword map for smart fallback
const LOCAL_KEYWORD_MAP = {
    phone: ["smartphone", "mobile", "cellphone", "android", "device"],
    laptop: ["computer", "notebook", "pc", "macbook", "workstation"],
    shoes: ["footwear", "sneakers", "boots", "sandals", "loafers"],
    shirt: ["t-shirt", "apparel", "clothing", "top", "fashion"],
    grocery: ["food", "provisions", "essentials", "snacks", "produce"],
    watch: ["timepiece", "smartwatch", "accessory", "wristwear", "chrono"],
    bag: ["backpack", "handbag", "purse", "luggage", "tote"]
};

export const getSmartSearchKeywords = async (query) => {
    if (!query || typeof query !== "string") return [];
    // Sanitize query to prevent prompt injection and oversized payloads
    const cleanQuery = query.replace(/[^a-zA-Z0-9\s-]/g, '').trim().slice(0, 50).toLowerCase();
    if (!cleanQuery) return [];

    const prompt = `Act as an e-commerce assistant. Provide 5 comma-separated synonyms or related product categories for the search term: "${cleanQuery}". Only return the keywords separated by commas.`;
    const result = await askGemini(prompt);

    if (result) {
        const keywords = result.split(",")
            .map(k => k.replace(/^[0-9.\-\s]+/, '').trim().toLowerCase())
            .filter(k => k.length > 0 && k !== cleanQuery);
        return [cleanQuery, ...keywords];
    }

    // Fallback: rule-based dictionary
    for (const [key, synonyms] of Object.entries(LOCAL_KEYWORD_MAP)) {
        if (cleanQuery.includes(key)) {
            return [cleanQuery, ...synonyms];
        }
    }

    return [cleanQuery];
};

export const getAIRecommendations = async (browsingHistory, allProducts) => {
    if (!allProducts || !allProducts.length) return [];
    const historyList = (browsingHistory || []).filter(Boolean);

    if (historyList.length > 0) {
        const productNames = allProducts.map(p => p.name).join(", ");
        const prompt = `Based on a user's interest in ${historyList.join(", ")}, which 3 products from this list are most relevant: ${productNames}? Return only the exact names separated by commas.`;
        const result = await askGemini(prompt);

        if (result) {
            const recommendedNames = result.split(",").map(k => k.trim().toLowerCase());
            const matched = allProducts.filter(p => 
                recommendedNames.some(name => p.name.toLowerCase().includes(name) || name.includes(p.name.toLowerCase()))
            );
            if (matched.length > 0) return matched.slice(0, 3);
        }
    }

    // Fallback recommendations: random or highest rated / most recent products
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
};
