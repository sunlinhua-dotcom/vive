
// Default Configuration
export const DEFAULT_CONFIG = {
    // Model Provider: 'gemini' | 'doubao'
    provider: 'gemini',

    // Gemini Settings
    gemini: {
        baseUrl: 'https://apiyi.com/v1',
        textModel: 'gemini-3-flash-preview',
        imageModel: 'gemini-3-pro-image-preview',
        textKey: 'sk-zu5cm3pPZaEyIwz85a5bCb76546f4b1d92BaA08aAc3f7404',
        imageKey: 'sk-qMB7fSJhKZmebuFL0b823fE2Af274cCc9a1e62A5990aF1F6'
    },

    // Doubao Settings (Placeholders)
    doubao: {
        baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
        model: 'doubao-pro-4k', // Text
        imageModel: 'cv-generation', // CV
        apiKey: ''
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
      Create a "Double Life" cinematic portrait featuring **TWO WOMEN** (Twin Sisters) posing together in a luxurious room.
      
      **1. IDENTITY**:
      - **Woman A (Left/Front) - The 1920s Soul**: Vintage Qipao, retro waves.
      - **Woman B (Right/Back) - The 2026s Modern Spirit**: Modern high-fashion, sharp.
      - **Consistent Face**: Based on uploaded photo.

      **2. ENVIRONMENT**:
      - **Scene**: {{scene}}
      - Art Deco Interior, warm amber lighting.

      **3. COMPOSITION**:
      - One single image.
      - Headroom top 25% empty.
      - No text.`
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
                doubao: { ...DEFAULT_CONFIG.doubao, ...parsed.doubao },
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
