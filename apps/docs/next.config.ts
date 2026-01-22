import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMdx = createMDX();

const config: NextConfig = {
	transpilePackages: ["shadcn-modal-manager"],
	serverExternalPackages: ["shiki", "@shikijs/engine-oniguruma"],

	redirects() {
		return [
			{
				source: "/",
				destination: "/docs/getting-started/introduction",
				permanent: true,
			},
			{
				source: "/docs",
				destination: "/docs/getting-started/introduction",
				permanent: true,
			},
		];
	},

	headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-DNS-Prefetch-Control",
						value: "on",
					},
					{
						key: "Strict-Transport-Security",
						value: "max-age=63072000; includeSubDomains; preload",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-XSS-Protection",
						value: "1; mode=block",
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=()",
					},
				],
			},
		];
	},
};

export default withMdx(config);
