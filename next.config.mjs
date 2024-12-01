import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

if (process.env.NODE_ENV === 'development') {
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
}

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
