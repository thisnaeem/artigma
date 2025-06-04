import { NextRequest } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = 'edge';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  image?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, model, image } = await request.json() as ChatRequest;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Messages are required' }, { status: 400 });
    }

    const ctx = getRequestContext();
    if (!ctx?.env?.AI) {
      throw new Error("AI binding not configured");
    }

    const ai = ctx.env.AI;
    
    // Use the selected model, default to '@cf/meta/llama-3.3-70b-instruct-fp8-fast' if not provided
    const selectedModel = model || '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
    
    // Check if we're using a vision model and have an image
    const isVisionModel = selectedModel.includes('vision');
    const hasImage = !!image;

    let aiInput;
    
    if (isVisionModel && hasImage) {
      // Format for vision models with image
      const lastMessage = messages[messages.length - 1];
      
      aiInput = {
        messages: [
          ...messages.slice(0, -1).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: lastMessage.role,
            content: [
              { type: "text", text: lastMessage.content },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ]
      };
    } else {
      // Standard format for text-only models
      aiInput = {
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      };
    }

    // Run the selected model with appropriate input format
    const response = await ai.run(selectedModel as any, aiInput);

    // Handle different response formats
    let responseText;
    if (typeof response === 'object' && response !== null) {
      if ('response' in response) {
        responseText = response.response;
      } else if ('content' in response) {
        responseText = response.content;
      } else {
        // Try to stringify the response for unknown formats
        responseText = JSON.stringify(response);
      }
    } else if (typeof response === 'string') {
      responseText = response;
    } else {
      throw new Error("Unexpected response format from model");
    }

    return Response.json({
      message: responseText
    });
  } catch (error: any) {
    console.error("Error in chat:", error);
    return Response.json(
      { error: error.message || "Failed to get chat response" },
      { status: 500 }
    );
  }
} 