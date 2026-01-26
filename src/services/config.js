
// Default Configuration
export const DEFAULT_CONFIG = {
    // Model Provider: 'gemini' | 'doubao'
    provider: import.meta.env.VITE_AI_PROVIDER || 'gemini',

    // Gemini Settings
    gemini: {
        baseUrl: import.meta.env.VITE_AI_BASE_URL || 'https://api.apiyi.com/v1beta',
        textModel: 'gemini-3-flash-preview',
        imageModel: 'gemini-3-pro-image-preview',
        // Updated Keys (Trimmed & Verified)
        textKey: 'sk-zu5cm3pPZaEyIwz85a5bCb76546f4b1d92BaA08aAc3f7404',
        imageKey: 'sk-qMB7fSJhKZmebuFL0b823fE2Af274cCc9a1e62A5990aF1F6'
    },



    // Prompts
    prompts: {
        textAnalysis: `You are the Chief Copywriter for the luxury brand "VIVE (双妹)".
      
      **TASK 1: VISUAL ANALYSIS (For Artist)**
      Analyze the uploaded selfie for facial structure.
      - **'features'**: RETURN A JSON STRING. Precisely describe the anatomy.

      **TASK 2: BRAND COPYWRITING**
      Analyze the **Vibe / Spirit**.
      
      **BRAND REFERENCE LIBRARY (Strict Pool):**
      1. #锐意先锋 | 以锋芒之姿，诠释当代风范。
      2. #赤诚摩登 | 以赤诚底色，挥洒摩登意气。
      3. #独立自洽 | 于方寸之间，自有天地广阔。
      4. #无畏锋芒 | 以破局之姿，重塑摩登定义。
      5. #如花明媚 | 让本色盛放，不负鎏金岁月。
      6. #如狮无畏 | 心有大格局，自有万千气象。
      7. #尽态极妍 | 登场即焦点，演绎摩登风范。
      8. #传世之美 | 岁月不败我，沉淀非凡底蕴。
      9. #东情西韵 | 蕴东方风骨，彰显摩登格调。

      **OUTPUT FORMAT (JSON):**
      {
        "features": "...",
        "keyword": "#selected_keyword", 
        "attitude": "selected_attitude"
      }`,

        imageGeneration: `**CRITICAL MISSION**: 
      Create a cinematic masterpiece of **THE SAME PERSON** appearing twice in **ONE UNIFIED SCENE**.
      **FORMAT**: Vertical Portrait (3:4 Aspect Ratio). FULL FRAME. NO BLACK BARS. NO LETTERBOXING.

      
      **1. SCENE UNITY (STRICT)**:
      - The background MUST be a single, continuous, seamless Art Deco room.
      - **DO NOT** split the screen. **DO NOT** draw dividing lines. **DO NOT** use different backgrounds for left/right.
      - The two figures are standing side-by-side in the SAME physical space.

      **2. IDENTITY**:
      - BOTH figures are the **IDENTICAL SAME PERSON** (Twin concept).
      - **MANDATORY**: Preserve the **EXACT facial bone structure**, jawline contour, and chin shape from the source image for BOTH.
      - **Left Figure**: 1920s style ({{style1920}}).
      - **Right Figure**: 2026s style ({{style2026}}).

      **3. COMPOSITION**:
      - One single image.
      - Headroom top 25% empty (for text).
      - No text.`
    }
};

const STORAGE_KEY = 'vive_admin_config_v2'; // Cache Busting for fresh keys

export const getConfig = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            // Deep merge with default to ensure new keys exist
            const parsed = JSON.parse(saved);
            return {
                ...DEFAULT_CONFIG,
                ...parsed,
                gemini: { ...DEFAULT_CONFIG.gemini, ...parsed.gemini },
                prompts: { ...DEFAULT_CONFIG.prompts, ...parsed.prompts }
            };
        }
    } catch (e) {
        console.error("Config Load Error", e);
    }
    return DEFAULT_CONFIG;
};

export const saveConfig = (newConfig) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    // Dispatch event for live updates if needed
    window.dispatchEvent(new Event('vive-config-updated'));
};

export const resetConfig = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('vive-config-updated'));
};
