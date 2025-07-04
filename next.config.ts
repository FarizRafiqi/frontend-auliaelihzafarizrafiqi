import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Konfigurasi untuk mengatasi masalah CSP dan API calls
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://202.157.176.100:3001/:path*',
      },
    ];
  },
  
  // Konfigurasi headers untuk CSP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "connect-src 'self' http://202.157.176.100:3001 https://202.157.176.100:3001",
              "frame-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  
  // Konfigurasi untuk Ant Design
  transpilePackages: ['antd'],
  
  // Konfigurasi experimental untuk CSS
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
