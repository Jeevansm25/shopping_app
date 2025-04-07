/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Only on the client side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // These modules are used by bcrypt and other native modules
        // but they're not needed on the client side
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
      };
    }

    // Exclude problematic modules from the build
    config.module.rules.push({
      test: /node-pre-gyp|\.html$/,
      use: 'null-loader',
    });

    return config;
  },
};

module.exports = nextConfig;