import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  serverExternalPackages: ["@libsql/client", "libsql"],
  experimental: { serverActions: { bodySizeLimit: "4.5mb" } }, // product image uploads; Vercel caps bodies at 4.5 MB
  async redirects() {
    return [
      {
        source: '/shipping-policy',
        destination: '/return-policy',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      // Partial CSP: blocks clickjacking, <base> hijacking, plugins and off-site form posts without touching scripts (Clerk, inline Next.js data).
      { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests" },
    ] }];
  },
};

export default nextConfig;
