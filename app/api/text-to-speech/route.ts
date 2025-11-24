import { NextRequest } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = 'edge';

interface TextToSpeechRequest {
  text: string;
  lang?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { text, lang = 'en' } = await request.json() as TextToSpeechRequest;

    if (!text) {
      return Response.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const ctx = getRequestContext();
    if (!ctx?.env?.AI) {
      throw new Error("AI binding not configured");
    }

    const ai = ctx.env.AI;

    const { audio } = await (ai as any).run('@cf/myshell-ai/melotts', {
      prompt: text,
      lang: lang,
    });

    // Returns the base64 encoded MP3 audio
    return Response.json({ audio });
  } catch (error: any) {
    console.error('Error generating speech:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    return Response.json(
      { 
        error: 'Failed to generate speech',
        details: error.message || 'Unknown error',
        errorCode: error.code || 'UNKNOWN'
      },
      { status: 500 }
    );
  }
}