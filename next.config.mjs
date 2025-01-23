/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self' https://*.posthog.com;
              script-src 'self' 'unsafe-inline' 'unsafe-eval' 
                https://*.privy.systems
                https://*.privy.io 
                https://cdn.walletconnect.com 
                https://*.walletconnect.com 
                https://*.walletconnect.org
                https://*.geckoterminal.com
                https://*.posthog.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' blob: data: 
                *;
              font-src 'self' https://fonts.gstatic.com;
              connect-src 'self' 
                https://*.supabase.co
                wss://*.helius-rpc.com
                https://*.helius-rpc.com
                https://*.jup.ag
                https://*.geckoterminal.com
                https://*.privy.systems
                https://*.privy.io 
                https://api.privy.io
                wss://*.privy.io
                https://*.walletconnect.com
                wss://*.walletconnect.com
                https://*.walletconnect.org
                wss://*.walletconnect.org
                https://api.web3modal.com
                https://verify.walletconnect.com
                https://registry.walletconnect.com
                https://*.posthog.com
                https://us.i.posthog.com
                https://us-assets.i.posthog.com;
              frame-src 'self' 
                https://*.coingecko.com
                https://*.geckoterminal.com
                https://*.privy.systems
                https://*.privy.io 
                https://*.walletconnect.com 
                https://*.walletconnect.org;
              worker-src 'self' blob:;
              manifest-src 'self';
              media-src 'self' blob: data: https://*.supabase.co https://*.coingecko.com;
            `.replace(/\s{2,}/g, ' ').trim()
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options', 
            value: 'nosniff'
          }
        ]
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tkhulbtxxjvkjsxwmcug.supabase.co",
      },
      {
        protocol: "https",
        hostname: "spsgdfbyzszlwqwucocu.supabase.co",
      },
      {
        protocol: "https",
        hostname: "tsedxkflgndtkvrmgbug.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.privy.io"
      },
      {
        protocol: "https",
        hostname: "*.walletconnect.com"
      },
      {
        protocol: "https",
        hostname: "img.icons8.com"
      }
    ],
      domains: ['coin-images.coingecko.com']
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['@mui/icons-material', '@heroicons/react']
  }
};

export default nextConfig;