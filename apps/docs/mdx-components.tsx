import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
export function getMDXComponents(components: MDXComponents): MDXComponents {
	return {
		...defaultMdxComponents,
		...components,
	};
}

// Next.js MDX convention export
export function useMDXComponents(components: MDXComponents): MDXComponents {
	return getMDXComponents(components);
}
