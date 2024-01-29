const nextTranslate = require("next-translate-plugin");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "inpn.mnhn.fr", protocol: "https" }],
  },
  i18n: {
    defaultLocale: "fr",
  },
};

module.exports = withBundleAnalyzer(nextTranslate(nextConfig));
