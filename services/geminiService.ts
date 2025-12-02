import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = process.env.API_KEY;
// Ensure we don't crash if key is missing during dev, but valid instructions require it.
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

// Audio Context singleton (lazy initialized)
let audioContext: AudioContext | null = null;

export const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 24000, // Match Gemini TTS output sample rate
    });
  }
  return audioContext;
};

// Helper: Base64 decoding
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper: Audio Data Decoding
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generatePronunciation = async (text: string): Promise<AudioBuffer> => {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say the word: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Using 'Kore' for clear pronunciation
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio data received from Gemini");
    }

    const ctx = getAudioContext();
    const audioBytes = decode(base64Audio);
    const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);

    return audioBuffer;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};

export const playAudioBuffer = (buffer: AudioBuffer) => {
  const ctx = getAudioContext();
  // Resume context if it was suspended (common in browsers requiring user interaction)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
};