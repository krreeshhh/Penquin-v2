import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocsContent } from "@/components/docs/DocsContent";
import { getAllDocRoutes, getDocPage, getPageDescription } from "@/lib/docs";

type Params = {
  slug?: string[];
};

function stripDecorations(value: string) {
  return value.replace(/^[^A-Za-z0-9]+/, "").trim();
}

function paramsToRoute(params: Params) {
  const parts = params.slug?.filter(Boolean) ?? [];
  return parts.length ? `/${parts.join("/")}` : "/";
}

export function generateStaticParams() {
  // Everything under src/data is addressable as a route.
  // Exclude /docs/* here since that's handled by src/app/docs/[[...slug]].
  return getAllDocRoutes()
    .filter((route) => route !== "/" && route !== "/docs" && !route.startsWith("/docs/"))
    .map((route) => ({ slug: route.replace(/^\//, "").split("/") }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const route = paramsToRoute(resolvedParams);
  const page = getDocPage(route);

  if (!page) return {};

  return {
    title: `${stripDecorations(typeof page.title === "string" ? page.title : "Untitled")} ● Penquin`,
    description: getPageDescription(page),
  };
}

export default async function ContentPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const route = paramsToRoute(resolvedParams);
  const page = getDocPage(route);

  if (!page) {
    notFound();
  }

  return <DocsContent page={page} route={route} />;
}
