import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Ważne: To pozwala na pomyślne budowanie projektu,
    // nawet jeśli ma on błędy ESLint.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;