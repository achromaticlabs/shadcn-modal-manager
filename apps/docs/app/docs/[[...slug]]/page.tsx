import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import { notFound } from "next/navigation";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

interface PageProps {
	params: Promise<{ slug?: string[] }>;
}

const mdxComponents = getMDXComponents({});

const Page = async (props: PageProps) => {
	const params = await props.params;
	const page = source.getPage(params.slug);

	if (!page) {
		return notFound();
	}

	const data = page.data as any;
	const Mdx = data.body;

	return (
		<DocsPage toc={data.toc}>
			<DocsTitle>{data.title}</DocsTitle>
			<DocsDescription>{data.description}</DocsDescription>
			<DocsBody>
				<Mdx components={mdxComponents} />
			</DocsBody>
		</DocsPage>
	);
};

export const generateStaticParams = () => source.generateParams();

export const generateMetadata = async (props: PageProps) => {
	const params = await props.params;
	const page = source.getPage(params.slug);

	if (!page) {
		return {};
	}

	const data = page.data as any;

	return {
		title: data.title,
		description: data.description,
	};
};

export default Page;
