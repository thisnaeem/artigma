import { NextRequest } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = 'edge';

interface EnhancePromptRequest {
  prompt: string;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json() as EnhancePromptRequest;

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const ctx = getRequestContext();
    if (!ctx?.env?.AI) {
      throw new Error("AI binding not configured");
    }

    const ai = ctx.env.AI;

    const response = await (ai as any).run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        {
          role: 'user',
          content: `Enhance the following image generation prompt to create exceptional, detailed, and visually striking images.
Make it more descriptive and artistic, while maintaining the original intent.
Add relevant style keywords, lighting, mood, and composition details.
Keep the enhanced prompt concise but impactful.
Return ONLY the enhanced prompt text without any prefixes or labels.

Original prompt: "${prompt}"`
        }
      ]
    });

    const enhancedPrompt = response.response
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