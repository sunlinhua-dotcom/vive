
// Default Configuration
export const DEFAULT_CONFIG = {
    // Model Provider: 'gemini' (Exclusive)
    provider: 'gemini',

    // Gemini Settings
    gemini: {
        baseUrl: import.meta.env.VITE_GEMINI_BASE_URL || 'https://api.apiyi.com/v1beta',
        textModel: import.meta.env.VITE_GEMINI_TEXT_MODEL || 'gemini-3-flash-preview',
        imageModel: import.meta.env.VITE_GEMINI_IMAGE_MODEL || 'gemini-3-pro-image-preview',
        textKey: import.meta.env.VITE_GEMINI_API_KEY || 'sk-zu5cm3pPZaEyIwz85a5bCb76546f4b1d92BaA08aAc3f7404',
        imageKey: import.meta.env.VITE_GEMINI_IMAGE_KEY || 'sk-qMB7fSJhKZmebuFL0b823fE2Af274cCc9a1e62A5990aF1F6'
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
      Create a "Parallel Life" cinematic portrait featuring **THE SAME PERSON** in two different timelines (1920 and 2026).
      
      **1. IDENTITY (STRICT)**:
      - BOTH figures MUST be the **IDENTICAL SAME PERSON**. 
      - **MANDATORY**: Preserve the **EXACT facial bone structure**, jawline contour, and chin shape from the source image for BOTH characters.
      - **1920s Version**: Wearing {{style1920}}.
      - **2026s Version**: Wearing {{style2026}}.

      **2. ENVIRONMENT**:
      - **Scene**: {{scene}}
      - Art Deco Interior, warm amber lighting.

      **3. COMPOSITION**:
      - **Magazine Cover Style**:
        - **ATMOSPHERE**: Generate a **FAINT, GOLDEN, ETHEREAL textual logo "VIVE"** blended into the upper background (as a lighting effect or architectural detail).
        - **Scene Depth**: **High Ceiling** (Grand Art Deco Architecture). Ensure the background extends to the very top.
        - **Composition**: Cinematic wide shot. Subject positioned naturally low. 
        - **Headroom**: The upper area should contain this faint golden text, creating a layered effect behind the foreground elements.
      - **Camera**: Eye-level or slightly low angle.`
    }
};

const STORAGE_KEY = 'vive_admin_config';

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
