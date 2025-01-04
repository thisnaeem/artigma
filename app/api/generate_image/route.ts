//@ts-nocheck
import type { NextRequest } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { prompt, num_steps = 4, width = 1024, height = 1024, upscale = 1 } = await request.json()
    
    const ctx = getRequestContext()
    if (!ctx?.env?.AI) {
      throw new Error('AI binding not configured')
    }

    const ai = ctx.env.AI
    
    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Validate upscale factor
    const upscaleFactor = Number(upscale)
    if (![1, 2, 4].includes(upscaleFactor)) {
      return Response.json({ error: 'Upscale factor must be 1, 2, or 4' }, { status: 400 })
    }

    const seed = Math.floor(Math.random() * 4294967295)

    // Calculate dimensions based on upscale factor
    const baseWidth = Math.min(width, 1024)
    const baseHeight = Math.min(height, 1024)
    const finalWidth = baseWidth * upscaleFactor
    const finalHeight = baseHeight * upscaleFactor

    // Generate initial image
    const response = await ai.run('@cf/black-forest-labs/flux-1-schnell', {
      prompt,
      num_steps: Math.min(num_steps, 8),
      width: baseWidth,
      height: baseHeight,
      seed
    })

    if (!response.image) {
      throw new Error('No image generated')
    }

    // If upscaling is requested
    if (upscaleFactor > 1) {
      const upscaledResponse = await ai.run('@cf/upscaler/realesr-general-x4v3', {
        image: response.image,
        width: finalWidth,
        height: finalHeight
      })

      if (!upscaledResponse.image) {
        throw new Error('Failed to upscale image')
      }

      return Response.json({ 
        dataURI: `data:image/jpeg;charset=utf-8;base64,${upscaledResponse.image}`,
        seed: seed,
        upscaled: true,
        dimensions: { width: finalWidth, height: finalHeight }
      })
    }

    return Response.json({ 
      dataURI: `data:image/jpeg;charset=utf-8;base64,${response.image}`,
      seed: seed,
      upscaled: false,
      dimensions: { width: baseWidth, height: baseHeight }
    })

  } catch (error: any) {
    console.error('Error generating image:', error)
    return Response.json({ 
      error: error.message || 'Failed to generate image'
    }, { status: 500 })
  }
} 