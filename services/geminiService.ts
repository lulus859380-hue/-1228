import { GoogleGenAI, Type } from "@google/genai";
import { CardData, UserInput } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCardContent = async (input: UserInput): Promise<CardData> => {
  const traitRequirement = input.style === 'concise' 
    ? 'exactly 4 short, punchy 4-character keywords/phrases (e.g., "天马行空", "独立卓绝").' 
    : 'exactly 4 descriptive, soul-searching phrases of varying lengths (6-10 characters). Use the style: "脑回路清奇可爱", "看见未来的先知", "理智与感性共存", "不随波逐流".';

  const prompt = `
    Generate a personality analysis based on:
    Zodiac: ${input.zodiac}
    MBTI: ${input.mbti}
    Chinese Zodiac: ${input.animal}
    Blood Type: ${input.bloodType}

    Language: Simplified Chinese (Mainland China style).
    Tone: Mystical, insightful, soulful, and tailored for social media.
    
    Requirements:
    1. For Zodiac, MBTI, Animal, and BloodType: Provide a title (e.g., "水瓶座") and ${traitRequirement}
    2. Core Trait: A single powerful sentence summarizing the combination of these 4 factors. (e.g., "看见未来的冷静是最强武器家").
    3. Fortune: A short paragraph (approx 40-50 words) predicting their near future or giving advice.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          zodiac: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              traits: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "traits"]
          },
          mbti: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              traits: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "traits"]
          },
          animal: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              traits: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "traits"]
          },
          bloodType: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              traits: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "traits"]
          },
          coreTrait: { type: Type.STRING },
          fortune: { type: Type.STRING }
        },
        required: ["zodiac", "mbti", "animal", "bloodType", "coreTrait", "fortune"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  return JSON.parse(text) as CardData;
};

export const generateViralCopy = async (input: UserInput, data: CardData): Promise<string> => {
  const z = input.zodiac.split(' ')[0];
  const m = input.mbti;
  const a = input.animal.split(' ')[0];
  const b = input.bloodType;

  const prompt = `
    Role: Social Media Expert for WeChat Channels (视频号) / Red Note (小红书).
    Task: Create a viral social media post copy for a numerology/personality card.
    
    User Profile:
    - Combination: ${z} + ${m} + ${a} + ${b}
    - Core Trait: ${data.coreTrait}
    - Key Traits: ${data.zodiac.traits.join(', ')}, ${data.mbti.traits.join(', ')}
    
    Requirements:
    1. **Title**: Must be catchy, clickbait-style, use "⚠️" or "‼️" emojis. 
       Format similar to: "⚠️ 当${z}${m}${a}${b}结合... 准到离谱！"
    2. **Body**: 
       - Tone: High energy, enthusiastic, flattering, using internet slang (e.g., YYDS, 绝绝子, 天花板, 宝藏).
       - Content: Praise this specific combination. Mention their unique strengths based on the traits provided.
       - Narrative: "People think you are... but actually you are...".
       - Ending: A strong Call to Action (CTA) asking for comments/likes. (e.g., "评论区告诉我，你是不是也是这个神仙组合？！👇")
    3. **Tags**: 5-8 relevant hashtags including #玄学 #MBTI #${z} etc.
    
    Output Format: Return ONLY the text content (Title + Body + Tags). Do not use Markdown formatting or code blocks.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text || "文案生成失败，请重试。";
};