import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { topic, apiKey } = await req.json() as { topic: string; apiKey: string };

    if (!topic || !apiKey) {
      return NextResponse.json(
        { error: 'Topic and API key are required' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Create a detailed YouTube video script about "${topic}". Structure it as follows:

[TITLE]
Create an engaging, SEO-friendly title for the video.

[HOOK - 30 seconds]
Write a compelling hook that grabs viewer attention in the first 30 seconds.

[INTRO - 1 minute]
- Brief overview of what the video will cover
- Why this topic matters
- What viewers will learn

[MAIN CONTENT]
Divide the content into 3-4 clear sections. For each section:
- Section title with timestamp
- Key points and details
- Examples or demonstrations
- Transition to next section

[CALL TO ACTION]
- Brief recap of key points
- Call to action (subscribe, like, comment)
- Teaser for next video

Format the response with clear section headers, timestamps, and bullet points for easy reading. Make it conversational and engaging, as if speaking directly to the viewer.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const script = response.text();

    return NextResponse.json({ script });
  } catch (error) {
    console.error('Error in generate_script:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
} 