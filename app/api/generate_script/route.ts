import { NextRequest } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = 'edge';

interface GenerateScriptRequest {
  topic: string;
  wordCount?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { topic, wordCount = 400 } = await request.json() as GenerateScriptRequest;

    if (!topic) {
      return Response.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const ctx = getRequestContext();
    if (!ctx?.env?.AI) {
      throw new Error("AI binding not configured");
    }

    const ai = ctx.env.AI;

    const prompt = `Write a natural, conversational YouTube video script about "${topic}". 

Requirements:
- Write approximately ${wordCount} words
- Write it as if you're speaking directly to the viewer
- Make it engaging and conversational
- Include a strong hook at the beginning
- Cover the main points thoroughly
- End with a call to action
- Do NOT use markdown formatting, headers, or bullet points
- Do NOT include timestamps or section labels
- Write it as one flowing script that sounds natural when spoken
- Make it sound like a real person talking, not a structured document

Just write the script as natural speech that would be spoken in a YouTube video.`;

    const response = await (ai as any).run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const script = response.response;

    return Response.json({ script });
  } catch (error) {
    console.error('Error generating script:', error);
    return Response.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
}