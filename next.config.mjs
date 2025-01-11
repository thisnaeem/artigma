/** @type {import('next').NextConfig} */
const nextConfig = {};

if (process.env.NODE_ENV === 'development') {
  try {
    const { setupDevPlatform } = await import('@cloudflare/next-on-pages/next-dev');
    await setupDevPlatform({
      bindings: {
        AI: {
          async run(model, input) {
            console.log('AI.run called with:', { model, input });
            return {
              image: 'mock_base64_image_data'
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
