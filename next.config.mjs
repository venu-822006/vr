/** @type {import('next').NextConfig} */
const API_URL = process.env.API_URL || 'https://vr-backend-tts6.onrender.com';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`
      },
      {
        source: '/socket.io/:path*',
        destination: `${API_URL}/socket.io/:path*`
      }
    ]
  }
};
export default nextConfig;
