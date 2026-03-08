// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🔥 Next Level Image Whitelisting
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com', // Google images ka domain whitelisted
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
