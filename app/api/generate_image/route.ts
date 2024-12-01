import type { NextRequest } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

interface GenerateImageRequest {
  prompt: string;
  num_steps?: number;
}

interface ErrorResponse {
  error: string;
}

interface AiResponse {
  image: string;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, num_steps = 4 }: GenerateImageRequest = await request.json()
    
    const ctx = getRequestContext()
    if (!ctx?.env?.AI) {
      throw new Error('AI binding not configured')
    }

    const ai = ctx.env.AI
    
    if (!prompt) {
      return new Response('Prompt is required', { status: 400 })
    }

    const seed = Math.floor(Math.random() * 4294967295)

    const response = await ai.run('@cf/black-forest-labs/flux-1-schnell', {
      prompt,
      num_steps: Math.min(num_steps, 8),
      seed
    }) as AiResponse

    if (!response.image) {
      throw new Error('No image generated')
    }

    return Response.json({ 
      dataURI: `data:image/jpeg;charset=utf-8;base64,${response.image}`,
      seed: seed
    })

  } catch (error: unknown) {
    console.error('Error generating image:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return Response.json({ error: errorMessage }, { status: 500 })
  }
} 