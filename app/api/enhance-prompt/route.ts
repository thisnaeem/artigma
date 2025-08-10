import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';

interface EnhancePromptRequest {
  prompt: string;
  apiKey: string;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey } = await request.json() as EnhancePromptRequest;

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!apiKey) {
      return Response.json({ error: 'Gemini API key is required' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(`
      Enhance the following image generation prompt to create exceptional, detailed, and visually striking images.
      Make it more descriptive and artistic, while maintaining the original intent.
      Add relevant style keywords, lighting, mood, and composition details.
      Keep the enhanced prompt concise but impactful.
      Return ONLY the enhanced prompt text without any prefixes or labels.

      Original prompt: "${prompt}"
    `);

    const response = await result.response;
    const enhancedPrompt = response.text()
      .trim()
      .replace(/^(Enhanced Prompt:|\*\*Enhanced Prompt:\*\*)\s*/i, '')  // Remove any "Enhanced Prompt:" prefix
      .replace(/^\s*Generate\s+/i, '')  // Remove leading "Generate" if present
      .replace(/\n+/g, ' ')  // Replace multiple newlines with single space
      .trim();

    return Response.json({ enhancedPrompt });
  } catch (error: any) {
    console.error('Error enhancing prompt:', error);
    return Response.json(
      { error: error.message || 'Failed to enhance prompt' },
      { status: 500 }
    );
  }
} 