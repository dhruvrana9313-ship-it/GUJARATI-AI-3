/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface TranslationResult {
  detectedLanguage: string;
  originalText: string;
  translatedText: string;
}

export async function translateToGujarati(text: string): Promise<TranslationResult> {
  const prompt = `Translate the following text into Gujarati. 
  Also detect the source language. 
  Return ONLY a JSON object with the following structure:
  {
    "detectedLanguage": "Name of source language",
    "originalText": "the original text",
    "translatedText": "the Gujarati translation"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: `${prompt}\n\nText: ${text}` }] }],
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from Gemini");
    
    return JSON.parse(resultText) as TranslationResult;
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
}

export async function generateGujaratiSpeech(text: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say in Gujarati: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS error:", error);
    return null;
  }
}

export async function speechToText(audioData: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "Transcribe this audio. Detect the language automatically. Return only the transcription text." },
            { inlineData: { data: audioData, mimeType: "audio/webm" } }
          ]
        }
      ],
    });

    return response.text.trim();
  } catch (error) {
    console.error("STT error:", error);
    throw error;
  }
}
