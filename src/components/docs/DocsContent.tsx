// DocsContent is now a Server Component

import React from "react";
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, FolderOpen } from "lucide-react";
import Link from "next/link";

import { DocIcon, defaultDocIcons } from "@/components/docs/doc-icons";
import { CopyButton } from "@/components/docs/CopyButton";

type DocLink = {
  title?: string;
  label?: string;
  text?: string;
  name?: string;
  username?: string;
  url?: string;
  emoji?: string;
  icon?: string | { url?: string };
  logo?: string | { url?: string };
  image?: string | { url?: string };
  relation?: string;
  platform?: string;
  source?: string;
  domain?: string;
  browser?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: string;
  caption?: string;
};

type DocBlock = DocLink & {
  type?: string;
  id?: string;
  level?: number;
  content?: unknown;
  title?: string;
  heading?: string;
  url?: string;
  embed_url?: string;
  embedStyle?: string;
  aspect_ratio?: string;
  items?: unknown[];
  links?: DocLink[];
  articles?: DocLink[];
  rows?: Array<Record<string, unknown>>;
  caption?: string;
  subheadings?: Array<Record<string, unknown>>;
} & Record<string, unknown>;

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function stripDecorations(value: string) {
  return value.replace(/^[^A-Za-z0-9]+/, "").trim();
}

function formatLabel(value: string) {
  const clean = stripDecorations(value);
  if (!clean) return "";
  
  return clean
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
}

function formatDate(value?: string) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function isExternalHref(url?: string) {
  return !!url && /^https?:\/\//.test(url);
}

function normalizeDocHref(url?: string) {
  if (!url || isExternalHref(url)) return url;
  if (url === "/") return url;
  return url.startsWith("/docs") ? url : `/docs${url}`;
}

	function getAssetUrl(value?: string | { url?: string }) {
	  if (!value) return undefined;
	  const url = typeof value === "string" ? value : value.url;
	  if (typeof url !== "string" || !url.startsWith("http")) return undefined;
	
	  // Ignore GitBook proxy URLs as they are often broken/expired
	  if (url.includes("gitbook.io/docs/~gitbook/image")) return undefined;
	
	  return url;
	}

function getFallbackSiteIcon(url?: string) {
  if (!url || !/^https?:\/\//.test(url)) return undefined;

  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;
  } catch {
    return undefined;
  }
}

function isUrlString(value: unknown): value is string {
  return typeof value === "string" && /^https?:\/\//.test(value);
}

function normalizeEmbedStyle(value?: string) {
  return value ? `padding-bottom: ${value}` : undefined;
}

function normalizeVideo(item: { url?: string; embed_url?: string; embedStyle?: string; aspect_ratio?: string }) {
  return {
    url: item.url ?? item.embed_url,
    embedStyle: item.embedStyle ?? normalizeEmbedStyle(item.aspect_ratio),
  };
}

function joinContentLines(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === "string" ? item : String(item ?? ""))).join("\n");
  }

  return typeof value === "string" ? value : String(value ?? "");
}

function resolveTextContent(value: unknown, fallback = "") {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value)) {
    const joined = value
      .map((item) => (typeof item === "string" ? item : String(item ?? "")))
      .filter(Boolean)
      .join(" ");
    return joined || fallback;
  }

  if (value == null) return fallback;

  const stringValue = String(value);
  return stringValue || fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isPrimitive(value: unknown) {
  return value == null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function getLinkLabel(item: DocLink) {
  return item.title ?? item.label ?? item.text ?? item.name ?? item.username ?? item.fileName ?? item.url;
}

function toDocLink(value: unknown): DocLink | null {
  if (!isRecord(value)) return null;

  const item = value as DocLink;
  if (!item.url || !getLinkLabel(item)) return null;

  return item;
}

function renderPrimitive(value: unknown) {
  return typeof value === "string" ? value : String(value ?? "");
}

function renderListItem(item: unknown, key: React.Key): React.ReactNode {
  if (typeof item === "string") {
    return <li key={key}>{item}</li>;
  }

  if (!isRecord(item)) {
    return <li key={key}>{JSON.stringify(item)}</li>;
  }

  const label = getLinkLabel(item as DocLink) ?? "Item";
  const subitems = Array.isArray(item.subitems) ? item.subitems : [];

  return (
    <li key={key}>
      {typeof (item as DocLink).url === "string" ? (
        <a
          href={normalizeDocHref((item as DocLink).url)}
          className="font-medium text-[var(--vp-c-brand-1)] underline-offset-4 hover:underline"
          target={isExternalHref((item as DocLink).url) ? "_blank" : undefined}
          rel={isExternalHref((item as DocLink).url) ? "noreferrer" : undefined}
        >
          {stripDecorations(label)}
        </a>
      ) : (
        <span className="font-medium text-[var(--vp-c-text-1)]">{stripDecorations(label)}</span>
      )}
      {typeof item.description === "string" && item.description.trim() ? (
        <p className="mt-1 text-[14px] leading-6 text-[var(--vp-c-text-2)]">{item.description}</p>
      ) : null}
      {typeof item.secondary_url === "string" ? (
        <p className="mt-1 text-[13px] leading-6 text-[var(--vp-c-text-2)]">
          <a
            href={normalizeDocHref(item.secondary_url)}
            className="text-[var(--vp-c-brand-1)] underline-offset-4 hover:underline"
            target={isExternalHref(item.secondary_url) ? "_blank" : undefined}
            rel={isExternalHref(item.secondary_url) ? "noreferrer" : undefined}
          >
            {item.secondary_url}
          </a>
        </p>
      ) : null}
      {typeof item.code === "string" && item.code.trim() ? (
        <pre className="mt-2 overflow-x-auto rounded-[12px] border border-[var(--vp-code-border)] bg-[var(--vp-code-bg)] px-3 py-2 font-mono text-[12px] leading-6 text-[var(--vp-code-text)]">
          <code>{item.code}</code>
        </pre>
      ) : null}
      {subitems.length ? (
        <ul className="mt-2 list-disc space-y-2 pl-5 text-[15px] leading-7 text-[var(--vp-c-text-2)]">
          {subitems.map((subitem, index) => renderListItem(subitem, `${String(key)}-${index}`))}
        </ul>
      ) : null}
    </li>
  );
}

function renderStructuredListItemCard(item: Record<string, unknown>, key: React.Key, ordered: boolean): React.ReactNode {
  const docItem = item as DocLink & { description?: string; secondary_url?: string; code?: string; subitems?: unknown[] };
  const label = stripDecorations(getLinkLabel(docItem) ?? `Item ${String(key)}`);
  const assetUrl = getAssetUrl(docItem.icon) ?? getAssetUrl(docItem.logo) ?? getAssetUrl(docItem.image) ?? getFallbackSiteIcon(docItem.url);
  const subitems = Array.isArray(docItem.subitems) ? docItem.subitems : [];

  return (
    <div key={key} className="rounded-[14px] border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] px-4 py-3">
      <div className="flex items-start gap-3">
        {ordered ? (
          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--vp-c-divider)] text-[12px] font-semibold text-[var(--vp-c-text-2)]">
            {String(key)}
          </span>
        ) : assetUrl ? (
          <img src={assetUrl} alt="" className="mt-0.5 h-4 w-4 shrink-0 rounded-[4px] object-cover" decoding="async" />
        ) : (
          <DocIcon
            emoji={docItem.emoji}
            icon={typeof docItem.icon === "string" ? docItem.icon : undefined}
            domain={(() => { try { return docItem.url ? new URL(docItem.url).hostname : undefined } catch { return undefined } })()}
            fallback={defaultDocIcons.link}
            className="mt-0.5 h-4 w-4 shrink-0"
          />
        )}
        <div className="min-w-0 flex-1">
          {typeof docItem.url === "string" ? (
            <a
              href={normalizeDocHref(docItem.url)}
              className="font-semibold text-[var(--vp-c-text-1)] underline-offset-4 hover:text-[var(--vp-c-brand-1)] hover:underline"
              target={isExternalHref(docItem.url) ? "_blank" : undefined}
              rel={isExternalHref(docItem.url) ? "noreferrer" : undefined}
            >
              {label}
            </a>
          ) : (
            <div className="font-semibold text-[var(--vp-c-text-1)]">{label}</div>
          )}
          {typeof docItem.description === "string" && docItem.description.trim() ? (
            <p className="mt-1 text-[14px] leading-6 text-[var(--vp-c-text-2)]">{docItem.description}</p>
          ) : null}
          {typeof docItem.secondary_url === "string" ? (
            <p className="mt-1 text-[13px] leading-6 text-[var(--vp-c-text-2)]">
              <a
                href={normalizeDocHref(docItem.secondary_url)}
                className="text-[var(--vp-c-brand-1)] underline-offset-4 hover:underline"
                target={isExternalHref(docItem.secondary_url) ? "_blank" : undefined}
                rel={isExternalHref(docItem.secondary_url) ? "noreferrer" : undefined}
              >
                {docItem.secondary_url}
              </a>
            </p>
          ) : null}
          {typeof docItem.code === "string" && docItem.code.trim() ? (
            <pre className="mt-2 overflow-x-auto rounded-[12px] border border-[var(--vp-code-border)] bg-[var(--vp-code-bg)] px-3 py-2 font-mono text-[12px] leading-6 text-[var(--vp-code-text)]">
              <code>{docItem.code}</code>
            </pre>
          ) : null}
          {subitems.length ? (
            <div className="mt-3 space-y-2">
              {subitems.map((subitem, index) => {
                const subLink = toDocLink(subitem);
                if (subLink?.url) {
                  return (
                    <a
                      key={`${String(key)}-${index}`}
                        href={normalizeDocHref(subLink.url)}
                      className="block rounded-[10px] border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg)] px-3 py-2 text-[14px] text-[var(--vp-c-text-1)] transition-colors hover:border-[var(--vp-c-brand-1)]/40 hover:text-[var(--vp-c-brand-1)]"
                      target={isExternalHref(subLink.url) ? "_blank" : undefined}
                      rel={isExternalHref(subLink.url) ? "noreferrer" : undefined}
                    >
                      {stripDecorations(getLinkLabel(subLink) ?? subLink.url)}
                    </a>
                  );
                }

                return <div key={`${String(key)}-${index}`}>{renderListItem(subitem, `${String(key)}-${index}`)}</div>;
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const DocHeading = React.memo(function DocHeading({
  as,
  id,
  children,
  variant,
}: {
  as: "h1" | "h2" | "h3";
  id: string;
  children: React.ReactNode;
  variant?: "default" | "gitbook";
}) {
  const Tag = as;
  const resolvedVariant = variant ?? "default";
  const base =
    resolvedVariant === "gitbook"
      ? as === "h1"
        ? "text-[36px] leading-[45px]"
        : as === "h2"
          ? "text-[30px] leading-[36px] font-semibold mt-8 pt-6"
          : "text-[24px] leading-[32px] font-semibold mt-6 pt-4"
      : as === "h1"
        ? "text-[40px] leading-[1.15] tracking-[-0.02em]"
        : as === "h2"
          ? "text-[24px] mt-10"
          : "text-[18px] mt-8";

  return (
    <Tag id={id} className={`group scroll-mt-[88px] font-bold text-[var(--vp-c-text-1)] ${base}`}>
      <span className="inline-flex items-center gap-2">
        {children}
        <a
          href={`#${id}`}
          aria-label={`Permalink to ${typeof children === "string" ? children : "section"}`}
          className="header-anchor opacity-0 group-hover:opacity-100 transition-opacity text-[var(--vp-c-text-3)] hover:text-[var(--vp-c-text-1)]"
        >
          #
        </a>
      </span>
    </Tag>
  );
});

function EmbedVideo({ url, embedStyle }: { url?: string; embedStyle?: string }) {
  if (!url) return null;

  const paddingBottomMatch = embedStyle?.match(/padding-bottom:\s*([\d.]+%)/i);
  const paddingBottom = paddingBottomMatch?.[1] ?? "56.25%";

  return (
    <div className="mt-6 rounded-[16px] overflow-hidden border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)]">
      <div className="relative w-full" style={{ paddingBottom }}>
        <iframe
          src={url}
          title="Embedded video"
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}

const LinkCard = React.memo(function LinkCard({ item }: { item: DocLink }) {
  if (!item.url) return null;

  const label = stripDecorations(getLinkLabel(item) ?? item.url);
  const assetUrl = getAssetUrl(item.icon) ?? getAssetUrl(item.logo) ?? getAssetUrl(item.image) ?? getFallbackSiteIcon(item.url);

  return (
    <CardLink href={normalizeDocHref(item.url) ?? item.url} className="flex items-start justify-between gap-3 rounded-[14px] border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] px-4 py-3 transition-colors hover:border-[var(--vp-c-brand-1)]/40 hover:bg-[var(--vp-c-bg-soft)]">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--vp-c-text-1)]">
          {assetUrl ? (
            <img
              src={assetUrl}
              alt=""
              className="mt-0.5 h-4 w-4 shrink-0 rounded-[4px] object-cover"
              decoding="async"
            />
          ) : (
            <DocIcon
              emoji={item.emoji}
              icon={typeof item.icon === "string" ? item.icon : undefined}
              domain={(() => { try { return item.url ? new URL(item.url).hostname : undefined } catch { return undefined } })()}
              fallback={item.fileName ? defaultDocIcons.file : defaultDocIcons.link}
              className="h-4 w-4"
            />
          )}
          <span className="truncate">{label}</span>
        </div>
        {(item.platform || item.source || item.domain || item.browser || item.caption || item.fileType || item.fileSize) && (
          <p className="mt-1 text-[12px] text-[var(--vp-c-text-2)]">
            {[item.platform, item.source, item.domain, item.browser, item.fileType, item.fileSize, item.caption]
              .filter(Boolean)
              .map((entry) => (typeof entry === "string" ? stripDecorations(entry) : entry))
              .join(" • ")}
          </p>
        )}
      </div>
      {isExternalHref(item.url) ? <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-[var(--vp-c-text-3)]" /> : <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--vp-c-text-3)]" />}
    </CardLink>
  );
});

function CardLink({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  if (isExternalHref(href)) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function LinkGrid({ title, items }: { title?: string; items: DocLink[] }) {
  if (!items.length) return null;

  return (
    <section className="mt-8">
      {title ? <DocHeading as="h2" id={slugify(title)}>{title}</DocHeading> : null}
      <div className="mt-4 grid gap-3">
        {items.map((item, index) => (
          <LinkCard key={`${item.url ?? item.title ?? item.label ?? index}`} item={item} />
        ))}
      </div>
    </section>
  );
}

function SimpleList({ title, items }: { title?: string; items: string[] }) {
  if (!items.length) return null;

  return (
    <section className="mt-8">
      {title ? <DocHeading as="h2" id={slugify(title)}>{title}</DocHeading> : null}
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-[var(--vp-c-text-2)]">
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function EmbedGrid({ title, items }: { title?: string; items: Array<{ embed_url?: string; url?: string; embedStyle?: string; aspect_ratio?: string; height?: number }> }) {
  if (!items.length) return null;

  return (
    <section className="mt-8">
      {title ? <DocHeading as="h2" id={slugify(title)}>{title}</DocHeading> : null}
      <div className="mt-4 space-y-4">
        {items.map((item, index) => {
          const url = item.url ?? item.embed_url;
          if (!url) return null;

          if (typeof item.height === "number") {
            return (
              <div key={`${url}-${index}`} className="overflow-hidden rounded-[16px] border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)]">
                <iframe src={url} title={`Embed ${index + 1}`} className="w-full border-0" style={{ height: item.height }} loading="lazy" />
              </div>
            );
          }

          return <EmbedVideo key={`${url}-${index}`} url={url} embedStyle={item.embedStyle ?? normalizeEmbedStyle(item.aspect_ratio)} />;
        })}
      </div>
    </section>
  );
}

function ObjectLinks({ title, value }: { title: string; value: Record<string, unknown> }) {
  const items = Object.entries(value)
    .filter(([, entry]) => isUrlString(entry))
    .map(([key, entry]) => ({ title: formatLabel(key), url: entry as string }));

  if (!items.length) return null;
  return <LinkGrid title={title} items={items} />;
}

function renderExtraSection(title: string, value: unknown, keyPrefix: string, depth = 0): React.ReactNode {
  if (value == null) return null;

  if (Array.isArray(value)) {
    if (!value.length) return null;

    if (value.every((item) => typeof item === "string")) {
      return (
        <section key={keyPrefix} className="mt-8">
          {depth === 0 && title && <DocHeading as="h2" id={slugify(title)}>{title}</DocHeading>}
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-[var(--vp-c-text-2)]">
            {(value as string[]).map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
          </ul>
        </section>
      );
    }

    if (value.every((item) => isRecord(item) && !!toDocLink(item))) {
      return (
        <section key={keyPrefix} className="mt-8">
          {depth === 0 && title && <DocHeading as="h2" id={slugify(title)}>{title}</DocHeading>}
          <div className="mt-4 grid gap-3">
            {(value as Array<Record<string, unknown>>).map((item, index) => (
              <LinkCard key={`${String(index)}`} item={toDocLink(item)!} />
            ))}
          </div>
        </section>
      );
    }

    if (value.every((item) => isRecord(item) && ((item as { embed_url?: string; url?: string }).embed_url || (item as { url?: string }).url))) {
      const items = value as Array<{ embed_url?: string; url?: string; embedStyle?: string; aspect_ratio?: string; height?: number }>;
      return (
        <section key={keyPrefix} className="mt-8">
          {depth === 0 && title && <DocHeading as="h2" id={slugify(title)}>{title}</DocHeading>}
          <div className="mt-4 space-y-4">
            {items.map((item, index) => {
              const url = item.url ?? item.embed_url;
              if (!url) return null;
              return <EmbedVideo key={`${url}-${index}`} url={url} embedStyle={item.embedStyle ?? normalizeEmbedStyle(item.aspect_ratio)} />;
            })}
          </div>
        </section>
      );
    }

    if (value.every((item) => isRecord(item))) {
      const records = value as Array<Record<string, unknown>>;
      const grouped = records.every((item) => Object.values(item).some((entry) => Array.isArray(entry) || isRecord(entry)));

      if (grouped) {
        return (
          <section key={keyPrefix} className="mt-8">
            {depth === 0 && title && <DocHeading as="h2" id={slugify(title)}>{title}</DocHeading>}
            <div className={`mt-4 ${depth === 0 ? "space-y-8" : "space-y-6"}`}>
              {records.map((item, index) => {
                const heading = typeof item.name === "string"
                  ? item.name
                  : typeof item.title === "string"
                    ? item.title
                    : typeof item.label === "string"
                      ? item.label
                      : `${title} ${index + 1}`;

                const nestedEntries = Object.entries(item).filter(([k, entry]) => 
                  (Array.isArray(entry) || isRecord(entry)) && k !== "name" && k !== "title" && k !== "label" && k !== "url" && k !== "emoji" && k !== "icon"
                );

                return (
                  <section key={`${keyPrefix}-${index}`}>
                    <DocHeading as="h3" id={slugify(`${title}-${heading}`)}>{stripDecorations(String(heading))}</DocHeading>
                    <div className="mt-3 space-y-6">
                      {nestedEntries.map(([nestedKey, nestedValue]) => renderExtraSection(formatLabel(nestedKey), nestedValue, `${keyPrefix}-${index}-${nestedKey}`, depth + 1))}
                    </div>
                  </section>
                );
              })}
            </div>
          </section>
        );
      }

      return (
        <section key={keyPrefix} className="mt-8">
          {depth === 0 && title && <DocHeading as="h2" id={slugify(title)}>{title}</DocHeading>}
          <GenericTable rows={records} />
        </section>
      );
    }

    return null;
  }

  if (isRecord(value)) {
    const link = toDocLink(value);
    if (link) return <LinkGrid key={keyPrefix} title={depth === 0 ? title : undefined} items={[link]} />;

    const linkEntries = Object.values(value).every((entry) => isUrlString(entry));
    if (linkEntries) return <ObjectLinks key={keyPrefix} title={depth === 0 ? title : ""} value={value} />;

    const stringGroups = Object.values(value).every((entry) => Array.isArray(entry) && (entry as unknown[]).every((item) => typeof item === "string"));
    if (stringGroups) {
      return (
        <section key={keyPrefix} className="mt-8">
          {depth === 0 && title && <DocHeading as="h2" id={slugify(title)}>{title}</DocHeading>}
          <div className="mt-4 space-y-6">
            {Object.entries(value).map(([nestedKey, nestedValue]) => (
              <section key={`${keyPrefix}-${nestedKey}`}>
                <DocHeading as="h3" id={slugify(`${title}-${nestedKey}`)}>{formatLabel(nestedKey)}</DocHeading>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-7 text-[var(--vp-c-text-2)]">
                  {(nestedValue as string[]).map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                </ul>
              </section>
            ))}
          </div>
        </section>
      );
    }

    return (
      <section key={keyPrefix} className="mt-8">
        {depth === 0 && title && <DocHeading as="h2" id={slugify(title)}>{title}</DocHeading>}
        <div className="mt-4 space-y-6">
          {Object.entries(value).map(([nestedKey, nestedValue]) => renderExtraSection(formatLabel(nestedKey), nestedValue, `${keyPrefix}-${nestedKey}`, depth + 1))}
        </div>
      </section>
    );
  }

  if (isPrimitive(value)) {
    return (
      <section key={keyPrefix} className="mt-8">
        {depth === 0 && title && <DocHeading as="h2" id={slugify(title)}>{title}</DocHeading>}
        <p className="mt-4 text-[15px] leading-7 text-[var(--vp-c-text-2)] whitespace-pre-wrap">{renderPrimitive(value)}</p>
      </section>
    );
  }

  return null;
}

function GenericTable({ rows }: { rows: Array<Record<string, unknown>> }) {
  if (!rows.length) return null;

  const columns = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set<string>())
  );

  const renderCell = (value: unknown) => {
    if (isUrlString(value)) {
      return (
        <a href={value} className="text-[var(--vp-c-brand-1)] underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
          {value}
        </a>
      );
    }

    if (Array.isArray(value)) {
      return value
        .map((entry) => {
          if (isUrlString(entry)) return entry;
          if (typeof entry === "string") return entry;
          if (entry && typeof entry === "object") {
            return Object.values(entry as Record<string, unknown>).join(" ");
          }
          return "";
        })
        .filter(Boolean)
        .join(", ");
    }

    if (value && typeof value === "object") {
      return Object.values(value as Record<string, unknown>).join(" ");
    }

    return String(value ?? "");
  };

  return (
    <div className="mt-4 overflow-hidden rounded-[14px] border border-[var(--vp-c-divider)]">
      <table className="w-full text-left text-[13px]">
        <thead className="bg-[var(--vp-c-bg-soft)]">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 font-semibold capitalize text-[var(--vp-c-text-2)]">
                {column.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-[var(--vp-c-divider)]/70 align-top">
              {columns.map((column) => (
                <td key={column} className="px-4 py-3 text-[var(--vp-c-text-1)]">
                  {renderCell(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MetaHighlights({ skillLevel, prerequisites }: { skillLevel?: string; prerequisites?: string }) {
  if (!skillLevel && !prerequisites) return null;

  const items = [
    skillLevel ? { label: "Skill Level", value: skillLevel } : null,
    prerequisites ? { label: "Prerequisites", value: prerequisites } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  return (
    <section className="mt-6 grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-[16px] border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--vp-c-text-3)]">{item.label}</p>
          <p className="mt-2 text-[15px] leading-7 text-[var(--vp-c-text-1)]">{item.value}</p>
        </div>
      ))}
    </section>
  );
}

function ToolsTable({ rows }: { rows: Array<{ category: string; tool: string; purpose: string }> }) {
  if (!rows.length) return null;

  return (
    <section className="mt-8">
      <DocHeading as="h2" id="tools">Tools</DocHeading>
      <div className="mt-4 overflow-hidden rounded-[14px] border border-[var(--vp-c-divider)]">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-[var(--vp-c-bg-soft)]">
            <tr>
              <th className="px-4 py-3 font-semibold text-[var(--vp-c-text-2)]">Category</th>
              <th className="px-4 py-3 font-semibold text-[var(--vp-c-text-2)]">Tool</th>
              <th className="px-4 py-3 font-semibold text-[var(--vp-c-text-2)]">Purpose</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.category}-${row.tool}-${index}`} className="border-t border-[var(--vp-c-divider)]/70 align-top">
                <td className="px-4 py-3 text-[var(--vp-c-text-2)]">{row.category}</td>
                <td className="px-4 py-3 font-medium text-[var(--vp-c-text-1)]">{row.tool}</td>
                <td className="px-4 py-3 text-[var(--vp-c-text-1)]">{row.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LinkPill({ href, label }: { href: string; label: string }) {
  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        className="inline-flex items-center gap-2 rounded-[999px] border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] px-3 py-1.5 text-[14px] text-[var(--vp-c-text-1)] transition-colors hover:border-[var(--vp-c-brand-1)]/40 hover:text-[var(--vp-c-brand-1)]"
        target="_blank"
        rel="noreferrer"
      >
        <span className="break-all">{label}</span>
        <ExternalLink className="h-4 w-4 shrink-0 text-[var(--vp-c-text-3)]" />
      </a>
    );
  }

  return (
    <Link
      href={normalizeDocHref(href) ?? href}
      className="inline-flex items-center gap-2 rounded-[999px] border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] px-3 py-1.5 text-[14px] text-[var(--vp-c-text-1)] transition-colors hover:border-[var(--vp-c-brand-1)]/40 hover:text-[var(--vp-c-brand-1)]"
    >
      <span className="break-all">{label}</span>
      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--vp-c-text-3)]" />
    </Link>
  );
}

function SectionBody({ block, variant }: { block: DocBlock; variant: "default" | "gitbook" }) {
  switch (block.type) {
    case "heading": {
      const headingSource = typeof block.content !== "undefined"
        ? resolveTextContent(block.content, typeof block.title === "string" ? block.title : "section")
        : typeof block.title !== "undefined"
          ? resolveTextContent(block.title, "section")
          : "section";
      const headingContent = headingSource;
      const id = typeof block.id === "string" && block.id.trim() ? block.id : slugify(headingSource);
      const level = typeof block.level === "number" && block.level >= 3 ? "h3" : "h2";
      return <DocHeading as={level} id={id} variant={variant}>{headingContent}</DocHeading>;
    }
    case "paragraph":
      return (
        <p
          className={
            variant === "gitbook"
              ? "mt-4 text-[16px] leading-[26px] text-[var(--vp-c-text-2)] whitespace-pre-wrap"
              : "mt-4 text-[15px] leading-7 text-[var(--vp-c-text-2)] whitespace-pre-wrap"
          }
        >
          {resolveTextContent(block.content)}
        </p>
      );
    case "divider":
      return <div className="mt-8 border-b border-[var(--vp-c-divider)]" />;
    case "video":
      return (
        <EmbedVideo
          url={typeof block.url === "string" ? block.url : typeof block.embed_url === "string" ? block.embed_url : undefined}
          embedStyle={typeof block.embedStyle === "string" ? block.embedStyle : normalizeEmbedStyle(typeof block.aspect_ratio === "string" ? block.aspect_ratio : undefined)}
        />
      );
    case "code_block":
      return (
        <div className="relative mt-4">
          <div className="absolute right-3 top-3 z-10">
            <CopyButton value={joinContentLines(block.content)} />
          </div>
          <pre
            className={
              variant === "gitbook"
                ? "overflow-x-auto rounded-[12px] border border-[var(--vp-code-border)] bg-[var(--vp-code-bg)] px-6 py-4 font-mono text-[16px] leading-[26px] text-[var(--vp-code-text)]"
                : "overflow-x-auto rounded-[14px] border border-[var(--vp-code-border)] bg-[var(--vp-code-bg)] px-4 py-4 font-mono text-[12px] leading-6 text-[var(--vp-code-text)]"
            }
          >
            <code>{joinContentLines(block.content)}</code>
          </pre>
        </div>
      );
    case "list":
    case "ordered_list": {
      const Tag = block.type === "ordered_list" ? "ol" : "ul";
      const items = Array.isArray(block.items) ? block.items : [];

      if (items.length && items.every((item) => isRecord(item))) {
        return (
          <div className="mt-4 grid gap-3">
            {items.map((item, index) => renderStructuredListItemCard(item as Record<string, unknown>, block.type === "ordered_list" ? index + 1 : index, block.type === "ordered_list"))}
          </div>
        );
      }

      return (
        <Tag className={`mt-4 space-y-2 pl-5 text-[15px] leading-7 text-[var(--vp-c-text-2)] ${Tag === "ol" ? "list-decimal" : "list-disc"}`}>
          {items.map((item: unknown, index: number) => renderListItem(item, index))}
        </Tag>
      );
    }
    case "link":
    case "link_card":
    case "page":
      if (variant === "gitbook") {
        const href = typeof block.url === "string" ? block.url : "";
        const label = stripDecorations(getLinkLabel(block as unknown as DocLink) ?? href);
        return href ? (
          <div className="mt-4">
            <LinkPill href={href} label={label} />
          </div>
        ) : null;
      }

      return <div className="mt-4"><LinkCard item={block} /></div>;
    case "links":
    case "articles_list": {
      const items = (Array.isArray(block.items) ? block.items : block.links ?? block.articles ?? []) as DocLink[];
      const headingTitle = typeof block.heading === "string" ? block.heading : undefined;
      return <LinkGrid title={headingTitle} items={items} />;
    }
    case "videos": {
      const items = (Array.isArray(block.items) ? block.items : []) as Array<{ embed_url?: string; url?: string; embedStyle?: string; aspect_ratio?: string; height?: number }>;
      const headingTitle = typeof block.heading === "string" ? block.heading : undefined;
      return <EmbedGrid title={headingTitle} items={items} />;
    }
    case "embeds": {
      const items = (Array.isArray(block.items) ? block.items : []) as Array<{ embed_url?: string; url?: string; embedStyle?: string; aspect_ratio?: string; height?: number }>;
      const headingTitle = typeof block.heading === "string" ? block.heading : undefined;
      return <EmbedGrid title={headingTitle} items={items} />;
    }
    case "image": {
      const src = typeof block.url === "string" ? block.url : undefined;
      if (!src) return null;
      const alt = typeof block.caption === "string"
        ? block.caption
        : typeof block.title === "string"
          ? block.title
          : "Image";
      return <img className="mt-6 w-full rounded-[16px] border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] object-cover" src={src} alt={alt} />;
    }
    case "success_hint":
      return <div className="mt-4 rounded-[14px] border border-[var(--vp-hint-success-border)] bg-[var(--vp-hint-success-bg)] px-4 py-3 text-[14px] leading-6 text-[var(--vp-hint-success-text)] whitespace-pre-wrap">{resolveTextContent(block.content)}</div>;
    case "table":
      return <GenericTable rows={Array.isArray(block.rows) ? block.rows : []} />;
    default:
      return null;
  }
}

function SectionBlock({ block, variant }: { block: DocBlock; variant: "default" | "gitbook" }) {
  const heading = typeof block.heading === "string" ? stripDecorations(block.heading) : undefined;
  const id = heading ? slugify(heading) : undefined;
  const subheadings = (Array.isArray(block.subheadings) ? block.subheadings.filter(isRecord) : []) as DocBlock[];

  if (subheadings.length) {
    return (
      <section className={variant === "gitbook" ? "mt-6" : "mt-10"}>
        {heading ? <DocHeading as="h2" id={id ?? slugify("section")} variant={variant}>{heading}</DocHeading> : null}
        <div className={variant === "gitbook" ? "mt-4 space-y-10" : "mt-4 space-y-8"}>
          {subheadings.map((subheading, index) => {
            const subheadingTitle = typeof subheading.heading === "string" ? stripDecorations(subheading.heading) : `Section ${index + 1}`;
            return (
              <section key={`${subheadingTitle}-${index}`}>
                <DocHeading as="h3" id={slugify(`${heading ?? "section"}-${subheadingTitle}`)} variant={variant}>{subheadingTitle}</DocHeading>
                <SectionBody block={subheading} variant={variant} />
              </section>
            );
          })}
        </div>
      </section>
    );
  }

  if (heading && typeof block.type === "string" && block.type !== "heading") {
    return (
      <section className={variant === "gitbook" ? "mt-6" : "mt-10"}>
        <DocHeading as="h2" id={id ?? slugify("section")} variant={variant}>{heading}</DocHeading>
        <SectionBody block={block} variant={variant} />
      </section>
    );
  }

  return <SectionBody block={block} variant={variant} />;
}

function NavigationFooter({ previous, next }: { previous?: DocLink; next?: DocLink }) {
  if (!previous && !next) return null;

  return (
    <div className="mt-12 grid gap-3 border-t border-[var(--vp-c-divider)] pt-6 md:grid-cols-2">
      {previous ? (
        <Link href={normalizeDocHref(previous.url) ?? "#"} className="rounded-[14px] border border-[var(--vp-c-divider)] px-4 py-4 transition-colors hover:bg-[var(--vp-c-bg-soft)]">
          <p className="flex items-center gap-2 text-[12px] uppercase tracking-[0.08em] text-[var(--vp-c-text-3)]">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </p>
          <p className="mt-2 font-semibold text-[var(--vp-c-text-1)]">{stripDecorations(previous.title ?? "")}</p>
        </Link>
      ) : <div />}
      {next ? (
        <Link href={normalizeDocHref(next.url) ?? "#"} className="rounded-[14px] border border-[var(--vp-c-divider)] px-4 py-4 text-right transition-colors hover:bg-[var(--vp-c-bg-soft)]">
          <p className="flex items-center justify-end gap-2 text-[12px] uppercase tracking-[0.08em] text-[var(--vp-c-text-3)]">
            Next
            <ChevronRight className="h-4 w-4" />
          </p>
          <p className="mt-2 font-semibold text-[var(--vp-c-text-1)]">{stripDecorations(next.title ?? "")}</p>
        </Link>
      ) : null}
    </div>
  );
}

export function DocsContent({ page }: { page: Record<string, any> }) {
  const breadcrumbItems = Array.isArray(page.breadcrumb) ? page.breadcrumb : [];
  const title = typeof page.title === "string" ? page.title : "Untitled";
  const cleanTitle = stripDecorations(title);
  const description = typeof page.description === "string" ? page.description : undefined;
  const subtitle = typeof page.subtitle === "string" ? page.subtitle : undefined;
  const skillLevel = typeof page.skill_level === "string" ? page.skill_level : undefined;
  const prerequisites = typeof page.prerequisites === "string" ? page.prerequisites : undefined;
  const navigation = page.navigation ?? {};
  const metadata = page.metadata ?? {};
  const isPentestBook = typeof metadata.edit_url === "string" && /github\.com\/six2dez\/pentest-book\b/.test(metadata.edit_url);
  const variant: "default" | "gitbook" = isPentestBook ? "gitbook" : "default";
  const previous = navigation.previous ?? metadata.previous_page;
  const next = navigation.next ?? metadata.next_page;
  const lastUpdated = page.footer?.lastUpdated ?? metadata.lastUpdated ?? metadata.last_updated;
  const topLevelVideos = Array.isArray(page.videos) ? page.videos : [];
  const contactLinks = Array.isArray(page.contactSection?.links) ? page.contactSection.links : [];
  const navigationLinks = Array.isArray(page.navigationLinks) ? page.navigationLinks : [];
  const subtopics = Array.isArray(page.subtopics) ? page.subtopics : [];
  const articles = Array.isArray(page.articles) ? page.articles : [];
  const programs = Array.isArray(page.programs) ? page.programs : [];
  const toolsTable = Array.isArray(page.tools_table) ? page.tools_table : [];
  const sections = Array.isArray(page.sections) ? page.sections : [];
  const usefulImages = Array.isArray(page.images)
    ? page.images.filter((image: { description?: string }) => !/icon/i.test(image.description ?? ""))
    : [];
  const content = page.content ?? {};
  const consumedKeys = new Set([
    "title",
    "description",
    "subtitle",
    "skill_level",
    "prerequisites",
    "breadcrumb",
    "navigation",
    "metadata",
    "footer",
    "coverImage",
    "embeddedVideo",
    "videos",
    "contactSection",
    "navigationLinks",
    "subtopics",
    "articles",
    "programs",
    "tools_table",
    "sections",
    "images",
    "content",
    "extensions", // Special key for browser-extension (consumes to prevent extraSection heading)
    "categories",  // Special key for 55-youtube-channels (consumes to prevent extraSection heading)
    "internalLinks",
    "headers",
  ]);
  const extraSections = Object.entries(page)
    .filter(([key, value]) => !consumedKeys.has(key) && value != null)
    .map(([key, value]) => renderExtraSection(formatLabel(key), value, key))
    .filter(Boolean);

  return (
    <div
      data-doc-variant={variant}
      className={isPentestBook ? "mx-auto px-4 md:px-12" : "mx-auto px-8"}
      style={{ maxWidth: isPentestBook ? "860px" : "var(--content-max-width, 756px)", transition: "max-width 500ms cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      <div>
        <div className={isPentestBook
          ? "mb-3 flex flex-wrap items-center gap-2 text-[14px] leading-[26px] text-[var(--vp-c-text-2)]"
          : "mb-6 flex flex-wrap items-center gap-2 text-[13px] text-[var(--vp-c-text-2)]"
        }>
          {isPentestBook ? (
            <Link href="/docs" className="hover:text-[var(--vp-c-text-1)] transition-colors">Home</Link>
          ) : (
            <Link href="/" className="hover:text-[var(--vp-c-text-1)] transition-colors" aria-label="Home">
              <FolderOpen className="h-4 w-4" />
            </Link>
          )}
          {breadcrumbItems.map((item: Record<string, string>, index: number) => {
            const label = stripDecorations(item.label ?? item.name ?? item.title ?? "");
            return (
              <React.Fragment key={`${label}-${index}`}>
                <span className="opacity-40">{isPentestBook ? "/" : "›"}</span>
                {item.url ? (
                  <Link href={normalizeDocHref(item.url) ?? item.url} className="hover:text-[var(--vp-c-text-1)] transition-colors">{label}</Link>
                ) : (
                  <span>{label}</span>
                )}
              </React.Fragment>
            );
          })}
          <span className="opacity-40">{isPentestBook ? "/" : "›"}</span>
          <span className={isPentestBook ? "font-normal text-[var(--vp-c-text-2)]" : "font-medium text-[var(--vp-c-text-1)]"}>{cleanTitle}</span>
        </div>

        <DocHeading as="h1" id={slugify(cleanTitle)} variant={variant}>{cleanTitle}</DocHeading>

        {description ? <p className="mt-5 text-[16px] leading-8 text-[var(--vp-c-text-2)] whitespace-pre-wrap">{description}</p> : null}
        {subtitle ? <p className="mt-4 text-[15px] leading-7 text-[var(--vp-c-text-2)] whitespace-pre-wrap">{subtitle}</p> : null}
        <MetaHighlights skillLevel={skillLevel} prerequisites={prerequisites} />

        {page.coverImage?.url ? (
          <div className="mt-8 overflow-hidden rounded-[16px] border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)]">
            <img 
              src={page.coverImage.url} 
              alt={cleanTitle} 
              className="w-full object-cover" 
              loading="lazy" 
              decoding="async" 
            />
          </div>
        ) : null}

        <EmbedVideo url={page.embeddedVideo?.url} embedStyle={page.embeddedVideo?.embedStyle} />

        {typeof content.introductoryText === "string" ? <p className="mt-6 text-[15px] leading-7 text-[var(--vp-c-text-2)] whitespace-pre-wrap">{content.introductoryText}</p> : null}
        <EmbedVideo url={content.embeddedVideo?.url} embedStyle={content.embeddedVideo?.embedStyle} />

         {content.resumeSection?.heading ? <DocHeading as="h2" id={slugify(content.resumeSection.heading)} variant={variant}>{content.resumeSection.heading}</DocHeading> : null}
        {Array.isArray(content.resumeSection?.files) ? <div className="mt-4 grid gap-3">{content.resumeSection.files.map((item: DocLink, index: number) => <LinkCard key={`${item.url ?? item.fileName ?? index}`} item={item} />)}</div> : null}

         {content.learningResourcesSection?.heading ? <DocHeading as="h2" id={slugify(content.learningResourcesSection.heading)} variant={variant}>{content.learningResourcesSection.heading}</DocHeading> : null}
        {Array.isArray(content.learningResourcesSection?.videos)
          ? content.learningResourcesSection.videos.map((video: { url?: string; embedStyle?: string }, index: number) => (
              <EmbedVideo key={`${video.url ?? index}`} url={video.url} embedStyle={video.embedStyle} />
            ))
          : null}

        {sections.map((section: Record<string, any>, index: number) => (
          <div key={`${section.type ?? "section"}-${index}`}>
            <SectionBlock block={section} variant={variant} />
          </div>
        ))}

        {topLevelVideos.length ? (
          <section className="mt-8">
            <DocHeading as="h2" id="videos" variant={variant}>Videos</DocHeading>
            {topLevelVideos.map((video: { url?: string; embed_url?: string; embedStyle?: string; aspect_ratio?: string }, index: number) => {
              const normalizedVideo = normalizeVideo(video);
              return (
              <div key={`${video.url ?? index}`} className="mt-4">
                <EmbedVideo url={normalizedVideo.url} embedStyle={normalizedVideo.embedStyle} />
              </div>
              );
            })}
          </section>
        ) : null}

        <LinkGrid title={subtopics.length ? "Subtopics" : undefined} items={subtopics} />
        <LinkGrid title={navigationLinks.length ? "Explore More" : undefined} items={navigationLinks} />
        <LinkGrid title={articles.length ? "Articles" : undefined} items={articles} />
        <LinkGrid title={programs.length ? "Programs" : undefined} items={programs} />
        <LinkGrid title={contactLinks.length ? page.contactSection?.heading ?? "Contact" : undefined} items={contactLinks} />
        
        {/* Render specialized sections that weren't in consumedKeys if they exist */}
        {page.extensions && <LinkGrid title="Extensions" items={page.extensions} />}
        {page.categories && page.categories.map((cat: any, i: number) => (
          renderExtraSection(cat.name, cat, `cat-${i}`, 0)
        ))}

        {extraSections}

        <ToolsTable rows={toolsTable} />

        {usefulImages.map((image: { url: string; description?: string }, index: number) => (
          <img 
            key={`${image.url}-${index}`} 
            className="mt-6 w-full rounded-[16px] border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] object-cover" 
            src={image.url} 
            alt={image.description ?? cleanTitle} 
            loading="lazy"
            decoding="async"
          />
        ))}

        {lastUpdated ? (
          <div className="mt-10 flex items-center gap-2 text-[12px] text-[var(--vp-c-text-3)]">
            <CalendarDays className="h-4 w-4" />
            <span>Last updated {formatDate(lastUpdated)}</span>
          </div>
        ) : null}

        <NavigationFooter previous={previous} next={next} />
      </div>
    </div>
  );
}
