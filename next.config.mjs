/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  }
};

if (process.env.NODE_ENV === 'development') {
  try {
    const { setupDevPlatform } = await import('@cloudflare/next-on-pages/next-dev');
    await setupDevPlatform({
      bindings: {
        AI: {
          async fetch(request) {
            return new Response('Mock AI Response');
          },
          async run(model, input) {
            if (model === '@cf/black-forest-labs/flux-1-schnell') {
              return {
                image: 'base64_mock_image_data'
              };
            }
            if (model === '@cf/upscaler/realesr-general-x4v3') {
              return {
                image: 'base64_mock_upscaled_image_data'
              };
            }
            return {
              image: 'base64_mock_image_data'
            };
          }
        }
      }
    });
  } catch (error) {
    console.warn('Warning: Failed to setup dev platform:', error);
  }
}

export default nextConfig;
