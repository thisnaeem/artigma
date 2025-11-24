import { NextRequest } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { script, numPrompts } = await request.json() as { script: string; numPrompts: number };

    if (!script || !numPrompts) {
      return Response.json(
        { error: 'Script and number of prompts are required' },
        { status: 400 }
      );
    }

    const ctx = getRequestContext();
    if (!ctx?.env?.AI) {
      throw new Error("AI binding not configured");
    }

    const ai = ctx.env.AI;

    const prompt = `Analyze this YouTube video script and create exactly ${numPrompts} distinct image prompts that represent key visual moments from the script.

Script:
${script}

Generate exactly ${numPrompts} image prompts. Each prompt should be a detailed description for image generation that captures a specific moment or concept from the script.

Format your response as a numbered list like this:
1. [First image prompt - detailed description for image generation]
2. [Second image prompt - detailed description for image generation]
3. [Third image prompt - detailed description for image generation]
...
${numPrompts}. [Final image prompt - detailed description for image generation]

Make each prompt detailed and visual, focusing on what would make compelling images for the video. Include details about composition, lighting, mood, and visual elements.`;

    const response = await (ai as any).run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const text = response.response;
    
    // Split the response into individual prompts using numbered list format
    const prompts = text
      .split(/\n(?=\d+\.)/g)  // Split by numbered list items
      .filter(Boolean)  // Remove empty strings
      .map((prompt: string) => {
        // Clean up the prompt text
        return prompt
          .trim()
          .replace(/^\d+\.\s*/, '')  // Remove number prefix
          .replace(/\[.*?\]/g, '')  // Remove any bracketed text
          .trim();
      })
      .filter((prompt: string) => prompt.length > 10)  // Filter out very short prompts
      .slice(0, numPrompts);  // Ensure we only return the requested number of prompts

    return Response.json({ prompts });
  } catch (error) {
    console.error('Error generating prompts:', error);
    return Response.json(
      { error: 'Failed to generate prompts' },
      { status: 500 }
    );
  }
}