import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { script, numPrompts, apiKey } = await req.json() as { script: string; numPrompts: number; apiKey: string };

    if (!script || !apiKey || !numPrompts) {
      return NextResponse.json(
        { error: 'Script, number of prompts, and API key are required' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Analyze this YouTube video script and create ${numPrompts} distinct image prompts that follow the story's progression. Each prompt should represent a key scene or visual moment from the script.

Script:
${script}

Create exactly ${numPrompts} separate image prompts. Format each prompt exactly as shown below, with a clear separator between prompts:

===PROMPT 1===
[Scene Description]
Brief description of what's happening in this scene

[Visual Details]
Detailed image generation prompt including:
- Composition and framing
- Lighting and atmosphere
- Color palette and mood
- Key subjects and elements
- Technical specifications (aspect ratio, style)

===PROMPT 2===
[Scene Description]
...

Continue this exact format for all ${numPrompts} prompts. Make each prompt distinct and ensure they follow the script's chronological flow.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Split the response into individual prompts using the separator
    const prompts = text
      .split(/===PROMPT \d+===/g)  // Split by prompt separator
      .filter(Boolean)  // Remove empty strings
      .map(prompt => {
        // Clean up the prompt text
        return prompt
          .trim()
          .replace(/\[Scene Description\]/g, '')
          .replace(/\[Visual Details\]/g, '')
          .replace(/^\s*-\s*/gm, '') // Remove bullet points
          .split('\n')
          .filter(Boolean)
          .join('\n')
          .trim();
      })
      .slice(0, numPrompts);  // Ensure we only return the requested number of prompts

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Error in generate_prompts:', error);
    return NextResponse.json(
      { error: 'Failed to generate prompts' },
      { status: 500 }
    );
  }
} 