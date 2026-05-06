import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocsContent } from "@/components/docs/DocsContent";
import { getDocPage, getIntroductionRoutes, getPageDescription, routeToSlug } from "@/lib/docs";

type Params = {
  slug?: string[];
};

function stripDecorations(value: string) {
  return value.replace(/^[^A-Za-z0-9]+/, "").trim();
}

function paramsToRoute(params: Params) {
  return `/docs${params.slug?.length ? `/${params.slug.join("/")}` : ""}`;
}

export function generateStaticParams() {
  return getIntroductionRoutes().map((route) => ({ slug: routeToSlug(route) }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const page = getDocPage(paramsToRoute(resolvedParams));

  if (!page) {
    return {};
  }

  return {
    title: `${stripDecorations(typeof page.title === "string" ? page.title : "Untitled")} ● Penquin`,
    description: getPageDescription(page),
  };
}

export default async function DocsPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const route = paramsToRoute(resolvedParams);
  const page = getDocPage(route);

  if (!page) {
    notFound();
  }

  return <DocsContent page={page} route={route} />;
}
