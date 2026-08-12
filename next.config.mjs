const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  // Admin photo/gallery uploads go straight through Server Actions as
  // multipart FormData; the 1MB default silently 500s on any real photo.
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
      // Matched unconditionally (not just when NEXT_PUBLIC_SUPABASE_URL is
      // set at build time) — a missing env var in a given deploy target
      // must not silently break every Supabase-hosted photo on the site.
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      ...(supabaseHostname && !supabaseHostname.endsWith(".supabase.co")
        ? [{ protocol: "https", hostname: supabaseHostname }]
        : []),
    ],
  },
};

export default nextConfig;
