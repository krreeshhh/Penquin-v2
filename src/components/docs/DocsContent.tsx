// DocsContent is now a Server Component

import React from "react";
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, FolderOpen } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { DocIcon, defaultDocIcons } from "@/components/docs/doc-icons";
import { CopyButton } from "@/components/docs/CopyButton";
import { getNeighbors } from "@/lib/docs";

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

  // Routes are now served directly from `src/data/**` (e.g. `/recon/...`, `/enumeration/...`).
  // Keep absolute internal links as-is.
  return url.endsWith("/") ? url.replace(/\/+$/, "") : url;
}

function MarkdownContent({
  content,
  className,
  variant,
}: {
  content: string;
  className?: string;
  variant?: "default" | "gitbook";
}) {
  if (!content) return null;

  // Pre-process content to fix mangled backticks and ensure tables have spacing
  const processedContent = content
    .replace(/^(?:``|`)([\w-]+)\n/gm, "```$1\n") // Fix opening code blocks
    .replace(/\n(?:``|`)$/gm, "\n```")           // Fix closing code blocks
    .replace(/^`$/gm, "```")                     // Fix single backtick
    .replace(/([^\n\r])\r?\n(\|[^\n\r]+\|\r?\n\|[ \t\-:|]+\|)/g, "$1\n\n$2") // Ensure blank line before tables
    .replace(/{%\s*embed\s+url="([^"]+)"\s*%}/g, "[$1]($1)"); // Convert GitBook embeds to markdown links

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p data-spotlight-block="p" className="mt-4 first:mt-0">
              {children}
            </p>
          ),
          code: ({ node, className, children }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <div data-spotlight-block="code" className="relative mt-4 group">
                <div className="absolute right-3 top-3 z-10 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <CopyButton value={String(children).replace(/\n$/, "")} />
                </div>
                <pre className="overflow-x-auto rounded-[14px] border border-[var(--vp-code-border)] bg-[var(--vp-code-bg)] px-4 py-4 font-mono text-[12px] leading-6 text-[var(--vp-code-text)]">
                  <code className={className}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code className="rounded bg-[var(--vp-code-bg)] px-1.5 py-0.5 font-mono text-[13px] text-[var(--vp-code-text)]">
                {children}
              </code>
            );
          },
          a: ({ href, children }) => (
            <a
              href={normalizeDocHref(href)}
              className="text-[var(--vp-c-brand-1)] underline-offset-4 hover:underline"
              target={isExternalHref(href) ? "_blank" : undefined}
              rel={isExternalHref(href) ? "noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="mt-4 list-disc pl-5 space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="mt-4 list-decimal pl-5 space-y-2">{children}</ol>,
          li: ({ children }) => <li className="text-[15px] leading-7">{children}</li>,
          table: ({ children }) => (
            <div
              data-spotlight-block="table"
              className="my-8 overflow-x-auto rounded-[16px] border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg)] shadow-sm"
            >
              <table className="w-full text-left text-[13.5px] border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[var(--vp-c-bg-soft)] border-b border-[var(--vp-c-divider)]">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-5 py-3.5 font-bold text-[var(--vp-c-text-1)] whitespace-nowrap">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-5 py-4 border-t border-[var(--vp-c-divider)]/50 text-[var(--vp-c-text-2)] leading-relaxed">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="transition-colors hover:bg-[var(--vp-c-bg-soft)]/40 align-top">
              {children}
            </tr>
          ),
          ...(variant === "gitbook"
            ? {
                h1: ({ children }) => {
                  const text = stripDecorations(resolveTextContent(children));
                  return text ? <DocHeading as="h2" id={slugify(text)} variant="gitbook">{text}</DocHeading> : null;
                },
                h2: ({ children }) => {
                  const text = stripDecorations(resolveTextContent(children));
                  return text ? <DocHeading as="h2" id={slugify(text)} variant="gitbook">{text}</DocHeading> : null;
                },
                h3: ({ children }) => {
                  const text = stripDecorations(resolveTextContent(children));
                  return text ? <DocHeading as="h3" id={slugify(text)} variant="gitbook">{text}</DocHeading> : null;
                },
                h4: ({ children }) => {
                  const text = stripDecorations(resolveTextContent(children));
                  return text ? <DocHeading as="h3" id={slugify(text)} variant="gitbook">{text}</DocHeading> : null;
                },
              }
            : null),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
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

function extractDomainFromLogoUrl(logoUrl?: string): string | undefined {
  if (!logoUrl || typeof logoUrl !== 'string') return undefined;
  
  // Handle GitBook proxy URLs like https://Penquin.gitbook.io/docs/~gitbook/image?url=https%3A%2F%2Fgithub.com%2Ffluidicon.png
  if (logoUrl.includes('~gitbook/image')) {
    const urlParam = new URLSearchParams(logoUrl.split('?')[1] || '').get('url');
    if (urlParam) {
      try {
        const decodedUrl = decodeURIComponent(urlParam);
        const { hostname } = new URL(decodedUrl);
        return hostname;
      } catch {
        return undefined;
      }
    }
  }
  
  return undefined;
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

function renderListItem(item: unknown, key: React.Key, variant?: "default" | "gitbook"): React.ReactNode {
  if (typeof item === "string") {
    const trimmed = item.trim();

    // GitBook often represents "label + command" as one list item. Render it compactly.
    if (variant === "gitbook" && trimmed.includes("\n")) {
      const [first, ...rest] = trimmed.split(/\r?\n/).filter(Boolean);
      const code = rest.join("\n").trim();
      return (
        <li key={key} className="mt-1">
          <MarkdownContent content={first} variant={variant} />
          {code ? (
            <pre className="mt-2 overflow-x-auto rounded-[12px] border border-[var(--vp-code-border)] bg-[var(--vp-code-bg)] px-3 py-2 font-mono text-[13px] leading-6 text-[var(--vp-code-text)]">
              <code>{code}</code>
            </pre>
          ) : null}
        </li>
      );
    }

    return (
      <li key={key} className="mt-1">
        <MarkdownContent content={item} variant={variant} />
      </li>
    );
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
        <div className="mt-1 text-[14px] leading-6 text-[var(--vp-c-text-2)]">
          <MarkdownContent content={item.description} />
        </div>
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
          {subitems.map((subitem, index) => renderListItem(subitem, `${String(key)}-${index}`, variant))}
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
            <div className="mt-1 text-[14px] leading-6 text-[var(--vp-c-text-2)]">
              <MarkdownContent content={docItem.description} />
            </div>
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

  // Clean up children for port styling
  const textContent = typeof children === "string" ? children : "";
  const portMatch = textContent.match(/^(Port\s*\d+(?:\/\d+)?(?:\s*-\s*)?)(.*)$/i);

  const base =
    resolvedVariant === "gitbook"
      ? as === "h1"
        ? "text-[32px] md:text-[40px] leading-[1.1] tracking-tight mb-6"
        : as === "h2"
          ? "text-[26px] md:text-[30px] leading-[36px] font-semibold mt-10 pb-2 border-b border-[var(--vp-c-divider)]"
          : "text-[20px] md:text-[24px] leading-[32px] font-semibold mt-6"
      : as === "h1"
        ? "text-[36px] md:text-[44px] leading-[1.1] tracking-tight mb-10"
        : as === "h2"
          ? "text-[24px] md:text-[28px] mt-16 pb-3 border-b border-[var(--vp-c-divider)] group/h2"
          : "text-[18px] md:text-[20px] mt-10 font-semibold";

  return (
    <Tag id={id} className={`group scroll-mt-[100px] font-bold text-[var(--vp-c-text-1)] ${base}`}>
      <span className="relative inline-flex items-center gap-2">
        {as === "h2" && !portMatch && (
          <span className="absolute -left-4 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-[var(--vp-c-brand-1)] opacity-0 transition-opacity group-hover/h2:opacity-100 hidden md:block" />
        )}
        {portMatch ? (
          <span className="flex items-baseline gap-2.5">
            <span className="text-[var(--vp-c-brand-1)] font-extrabold tracking-tight">
              {portMatch[1].replace(/\s*-\s*$/, "").toUpperCase().trim()}
            </span>
            <span className="text-[var(--vp-c-text-3)] font-medium">|</span>
            <span className="text-[var(--vp-c-text-1)]">{portMatch[2].trim()}</span>
          </span>
        ) : children}
        <a
          href={`#${id}`}
          aria-label={`Permalink to ${typeof children === "string" ? children : "section"}`}
          className="header-anchor md:opacity-0 md:group-hover:opacity-100 transition-opacity text-[var(--vp-c-text-3)] hover:text-[var(--vp-c-text-1)] ml-1"
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
  
  // Extract domain from GitBook proxy URLs in logo
  const extractedDomain = extractDomainFromLogoUrl(typeof item.logo === 'string' ? item.logo : undefined);
  
  // Priority: icon > logo > image > extracted domain favicon > fallback from url
  const assetUrl = getAssetUrl(item.icon) ?? getAssetUrl(item.logo) ?? getAssetUrl(item.image) ?? (extractedDomain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(extractedDomain)}&sz=64` : undefined) ?? getFallbackSiteIcon(item.url);

  return (
    <CardLink href={normalizeDocHref(item.url) ?? item.url} className="flex items-start justify-between gap-3 rounded-[14px] border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] px-4 py-3 transition-colors hover:border-[var(--vp-c-brand-1)]/40 hover:bg-[var(--vp-c-bg-soft)] overflow-hidden">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--vp-c-text-1)] min-w-0">
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
          <section key={keyPrefix} className="mt-12 bg-[var(--vp-c-bg-soft)]/30 rounded-[20px] p-6 border border-[var(--vp-c-divider)]/50">
            {depth === 0 && title && <DocHeading as="h2" id={slugify(title)}>{title}</DocHeading>}
            <div className={`mt-6 ${depth === 0 ? "space-y-12" : "space-y-8"}`}>
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
                  <section key={`${keyPrefix}-${index}`} className="relative">
                    <DocHeading as="h3" id={slugify(`${title}-${heading}`)}>{stripDecorations(String(heading))}</DocHeading>
                    <div className="mt-4 space-y-6">
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
        <section key={keyPrefix} className="mt-10 mb-14">
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
        <div className="mt-4 text-[15px] leading-7 text-[var(--vp-c-text-2)]">
          <MarkdownContent content={renderPrimitive(value)} />
        </div>
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

    return <MarkdownContent content={String(value ?? "")} />;
  };

  return (
    <div className="mt-6 overflow-hidden rounded-[16px] border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg)] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13.5px] border-collapse">
          <thead className="bg-[var(--vp-c-bg-soft)] border-b border-[var(--vp-c-divider)]">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-5 py-3.5 font-bold capitalize text-[var(--vp-c-text-1)] whitespace-nowrap">
                  {column.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--vp-c-divider)]/50">
            {rows.map((row, index) => (
              <tr key={index} className="transition-colors hover:bg-[var(--vp-c-bg-soft)]/40 align-top">
                {columns.map((column) => (
                  <td key={column} className="px-5 py-4 text-[var(--vp-c-text-2)] leading-relaxed">
                    {renderCell(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
                <td className="px-4 py-3 font-medium text-[var(--vp-c-text-1)]"><MarkdownContent content={row.tool} /></td>
                <td className="px-4 py-3 text-[var(--vp-c-text-1)]"><MarkdownContent content={row.purpose} /></td>
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
    case "hint": {
      const hintVariant = (block as Record<string, unknown>).variant;
      const kind = typeof hintVariant === "string" ? hintVariant.toLowerCase() : "";

      if (kind === "success") {
        return (
          <div className="mt-4 rounded-[14px] border border-[var(--vp-hint-success-border)] bg-[var(--vp-hint-success-bg)] px-4 py-3 text-[14px] leading-6 text-[var(--vp-hint-success-text)]">
            <MarkdownContent content={resolveTextContent(block.content)} variant={variant} />
          </div>
        );
      }

      return (
        <div className="mt-4 rounded-[14px] border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] px-4 py-3 text-[14px] leading-6 text-[var(--vp-c-text-2)]">
          <MarkdownContent content={resolveTextContent(block.content)} variant={variant} />
        </div>
      );
    }
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
        <div
          className={
            variant === "gitbook"
              ? "mt-4 text-[16px] leading-[26px] text-[var(--vp-c-text-2)]"
              : "mt-4 text-[15px] leading-7 text-[var(--vp-c-text-2)]"
          }
        >
          <MarkdownContent content={resolveTextContent(block.content)} variant={variant} />
        </div>
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
    case "code_block": {
      const copyContent = joinContentLines(block.content);
      const lines = copyContent.split("\n");

      if (variant === "gitbook") {
        const raw = copyContent.replace(/\r\n/g, "\n");
        const looksLikeMarkdownDoc = /(^|\n)#{1,3}\s+\S/.test(raw) && raw.includes("```");
        if (looksLikeMarkdownDoc) {
          // Some imports include a README rendered as a code block; render it as Markdown instead.
          const withoutTitle = raw.replace(/^#\s+[^\n]+\n+/, "");
          return (
            <div className="mt-4">
              <MarkdownContent content={withoutTitle} variant={variant} />
            </div>
          );
        }

        const trimmed = raw.trim();
        if (/^This README provides\b/i.test(trimmed)) {
          return (
            <div className="mt-4 text-[16px] leading-[26px] text-[var(--vp-c-text-2)]">
              <MarkdownContent content={trimmed} variant={variant} />
            </div>
          );
        }
      }

      return (
        <div className="relative mt-4 group">
          <div className="absolute right-3 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton value={copyContent} />
          </div>
          <pre
            className={
              variant === "gitbook"
                ? "overflow-x-auto rounded-[12px] border border-[var(--vp-code-border)] bg-[var(--vp-code-bg)] px-5 py-4 font-mono text-[14px] leading-[22px] text-[var(--vp-code-text)]"
                : "overflow-x-auto rounded-[14px] border border-[var(--vp-code-border)] bg-zinc-900 px-5 py-5 font-mono text-[13.5px] leading-7 text-[#e6edf3] shadow-sm"
            }
          >
            <code>
              {lines.map((line, idx) => {
                const trimmed = line.trim();
                
                const cComment = variant === "gitbook" ? "text-gray-500 dark:text-[#8b949e]" : "text-[#8b949e]";
                const cCmd = variant === "gitbook" ? "text-green-600 dark:text-[#7ee787] font-medium" : "text-[#7ee787] font-medium";
                const cArg = variant === "gitbook" ? "text-blue-600 dark:text-[#a5d6ff]" : "text-[#a5d6ff]";
                const cText = variant === "gitbook" ? "text-gray-800 dark:text-[#e6edf3]" : "text-[#e6edf3]";

                // Comments
                if (trimmed.startsWith("#")) {
                  return <span key={idx} className={`block ${cComment}`}>{line}</span>;
                }
                
                // Prompts or bash commands
                if (trimmed.startsWith("$ ")) {
                  const cmdPart = line.substring(line.indexOf("$ ") + 2);
                  const firstWord = cmdPart.split(" ")[0];
                  const rest = cmdPart.substring(firstWord.length);
                  return (
                    <span key={idx} className="block">
                      <span className={cComment}>$ </span>
                      <span className={cCmd}>{firstWord}</span>
                      <span className={cArg}>{rest}</span>
                    </span>
                  );
                }

                // Normal command execution (starts with word)
                const cmdMatch = line.match(/^([a-zA-Z0-9_\-]+)(\s+|$)/);
                if (cmdMatch && !trimmed.includes("=") && !trimmed.startsWith(".") && !trimmed.startsWith("debug1:") && !trimmed.startsWith("Password:")) {
                  return (
                    <span key={idx} className="block">
                      <span className={cCmd}>{cmdMatch[1]}</span>
                      <span className={cArg}>{line.substring(cmdMatch[1].length)}</span>
                    </span>
                  );
                }
                
                // Logs or standard output
                if (trimmed.startsWith("debug1:")) {
                   return (
                     <span key={idx} className="block">
                       <span className={cCmd}>debug1:</span>
                       <span className={cText}>{line.substring(line.indexOf("debug1:") + 7)}</span>
                     </span>
                   );
                }

                return <span key={idx} className={`block ${cText}`}>{line}</span>;
              })}
            </code>
          </pre>
        </div>
      );
    }
    case "list":
    case "ordered_list": {
      const Tag = block.type === "ordered_list" ? "ol" : "ul";
      const items = (Array.isArray(block.items) ? block.items : (Array.isArray(block.content) ? block.content : [])) as unknown[];

      if (items.length && items.every((item) => isRecord(item))) {
        return (
          <div className="mt-4 grid gap-3">
            {items.map((item, index) => renderStructuredListItemCard(item as Record<string, unknown>, block.type === "ordered_list" ? index + 1 : index, block.type === "ordered_list"))}
          </div>
        );
      }

      return (
        <Tag
          className={
            variant === "gitbook"
              ? `mt-4 space-y-2 pl-5 text-[16px] leading-[26px] text-[var(--vp-c-text-2)] ${Tag === "ol" ? "list-decimal" : "list-disc"}`
              : `mt-4 space-y-2 pl-5 text-[15px] leading-7 text-[var(--vp-c-text-2)] ${Tag === "ol" ? "list-decimal" : "list-disc"}`
          }
        >
          {items.map((item: unknown, index: number) => renderListItem(item, index, variant))}
        </Tag>
      );
    }
    case "link":
    case "link_card":
    case "page":
      if (variant === "gitbook") {
        return <div className="mt-4"><LinkCard item={block} /></div>;
      }

      return <div className="mt-4"><LinkCard item={block} /></div>;
    case "links":
    case "articles_list": {
      const items = (Array.isArray(block.items) ? block.items : block.links ?? block.articles ?? []) as DocLink[];
      const headingTitle = typeof block.heading === "string" ? block.heading : undefined;
      return <LinkGrid items={items} />;
    }
    case "videos": {
      const items = (Array.isArray(block.items) ? block.items : []) as Array<{ embed_url?: string; url?: string; embedStyle?: string; aspect_ratio?: string; height?: number }>;
      const headingTitle = typeof block.heading === "string" ? block.heading : undefined;
      return <EmbedGrid items={items} />;
    }
    case "embeds": {
      const items = (Array.isArray(block.items) ? block.items : []) as Array<{ embed_url?: string; url?: string; embedStyle?: string; aspect_ratio?: string; height?: number }>;
      const headingTitle = typeof block.heading === "string" ? block.heading : undefined;
      return <EmbedGrid items={items} />;
    }
    case "image": {
      const src =
        typeof (block as Record<string, unknown>).url === "string"
          ? ((block as Record<string, unknown>).url as string)
          : typeof (block as Record<string, unknown>).src === "string"
            ? ((block as Record<string, unknown>).src as string)
            : undefined;
      if (!src) return null;
      const alt = typeof block.caption === "string"
        ? block.caption
        : typeof block.title === "string"
          ? block.title
          : "Image";
      return (
        <div className="mt-6 overflow-hidden rounded-[16px] border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)]">
          <img className="w-full object-cover" src={src} alt={alt} loading="lazy" decoding="async" />
        </div>
      );
    }
    case "success_hint":
      return <div className="mt-4 rounded-[14px] border border-[var(--vp-hint-success-border)] bg-[var(--vp-hint-success-bg)] px-4 py-3 text-[14px] leading-6 text-[var(--vp-hint-success-text)]">
        <MarkdownContent content={resolveTextContent(block.content)} variant={variant} />
      </div>;
    case "table": {
      const headers = (block as Record<string, unknown>).headers;
      const rawRows = (block as Record<string, unknown>).rows;

      if (Array.isArray(headers) && Array.isArray(rawRows) && rawRows.every((row) => Array.isArray(row))) {
        return (
          <div className="mt-6 overflow-hidden rounded-[16px] border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg)] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13.5px] border-collapse">
                <thead className="bg-[var(--vp-c-bg-soft)] border-b border-[var(--vp-c-divider)]">
                  <tr>
                    {headers.map((h, idx) => (
                      <th key={idx} className="px-5 py-3.5 font-bold text-[var(--vp-c-text-1)] whitespace-nowrap">
                        {stripDecorations(String(h ?? ""))}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--vp-c-divider)]/50">
                  {rawRows.map((row, rIdx) => (
                    <tr key={rIdx} className="transition-colors hover:bg-[var(--vp-c-bg-soft)]/40 align-top">
                      {(row as unknown[]).map((cell, cIdx) => (
                        <td key={cIdx} className="px-5 py-4 text-[var(--vp-c-text-2)] leading-relaxed">
                          <MarkdownContent content={String(cell ?? "")} variant={variant} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      return <GenericTable rows={Array.isArray(block.rows) ? block.rows : []} />;
    }
    case "youtube": {
      const url = typeof (block as Record<string, unknown>).url === "string" ? ((block as Record<string, unknown>).url as string) : undefined;
      return <EmbedVideo url={url} />;
    }
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

  const renderExtras = () => {
    // Ignore common block fields so we don't render noisy "extra" primitives (e.g. hint.variant => "success").
    const knownKeys = new Set([
      "type",
      "content",
      "heading",
      "id",
      "level",
      "subheadings",
      "title",
      "variant",
      "language",
      "items",
      "url",
      "embed_url",
      "embedStyle",
      "aspect_ratio",
      "rows",
      "headers",
      "src",
      "alt",
      "width",
      "height",
      "caption",
      "description",
      "icon",
      "logo",
      "image",
      "links",
      "articles",
    ]);
    const extraKeys = Object.entries(block).filter(([key, value]) => !knownKeys.has(key) && value != null);
    
    if (!extraKeys.length) return null;

    return (
      <div className="mt-6 flex flex-col gap-6">
        {extraKeys.map(([key, value]) => renderExtraSection(formatLabel(key), value, `extra-${key}`, 1))}
      </div>
    );
  };

  if (heading && typeof block.type === "string" && block.type !== "heading") {
    return (
      <section className={variant === "gitbook" ? "mt-6" : "mt-10"}>
        <DocHeading as="h2" id={id ?? slugify("section")} variant={variant}>{heading}</DocHeading>
        <SectionBody block={block} variant={variant} />
        {renderExtras()}
      </section>
    );
  }

  return (
    <>
      <SectionBody block={block} variant={variant} />
      {renderExtras()}
    </>
  );
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

export function DocsContent({ page, route }: { page: Record<string, any>; route?: string }) {
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
  // GitBook-like layout is preferred for this page to match the upstream GitBook styling.
  const isGitBookRoute =
    route === "/docs/mains/learn-the-basics/learn-wsl" ||
    route === "/docs/mains/build-your-own-bug-bounty-methodology";
  const variant: "default" | "gitbook" = (isPentestBook || isGitBookRoute) ? "gitbook" : "default";
  const isGitBookVariant = variant === "gitbook";

  let previous = navigation.previous ?? metadata.previous_page;
  let next = navigation.next ?? metadata.next_page;

  if (route) {
    const neighbors = getNeighbors(route);
    if (neighbors.previous) previous = neighbors.previous;
    if (neighbors.next) next = neighbors.next;
  }

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
      className={isGitBookVariant ? "mx-auto px-4 md:px-12" : "mx-auto px-6 md:px-10 lg:px-14"}
      style={{ 
        maxWidth: isGitBookVariant ? "var(--content-max-width, 860px)" : "var(--content-max-width, 820px)", 
        transition: "max-width 500ms cubic-bezier(0.16, 1, 0.3, 1)",
        paddingBottom: "120px"
      }}
    >
      <div>
        <div className={isGitBookVariant
          ? "mb-3 flex flex-wrap items-center gap-2 text-[14px] leading-[26px] text-[var(--vp-c-text-2)]"
          : "mb-6 flex flex-wrap items-center gap-2 text-[13px] text-[var(--vp-c-text-2)]"
        }>
          {isGitBookVariant ? (
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
                <span className="opacity-40">{isGitBookVariant ? "/" : "›"}</span>
                {item.url ? (
                  <Link href={normalizeDocHref(item.url) ?? item.url} className="hover:text-[var(--vp-c-text-1)] transition-colors">{label}</Link>
                ) : (
                  <span>{label}</span>
                )}
              </React.Fragment>
            );
          })}
          <span className="opacity-40">{isGitBookVariant ? "/" : "›"}</span>
          <span className={isGitBookVariant ? "font-normal text-[var(--vp-c-text-2)]" : "font-medium text-[var(--vp-c-text-1)]"}>{cleanTitle}</span>
        </div>

        <DocHeading as="h1" id={slugify(cleanTitle)} variant={variant}>{cleanTitle}</DocHeading>

        {description ? <div className="mt-5 text-[16px] leading-8 text-[var(--vp-c-text-2)]"><MarkdownContent content={description} variant={variant} /></div> : null}
        {subtitle ? <div className="mt-4 text-[15px] leading-7 text-[var(--vp-c-text-2)]"><MarkdownContent content={subtitle} variant={variant} /></div> : null}
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

        {typeof content.introductoryText === "string" ? <div className="mt-6 text-[15px] leading-7 text-[var(--vp-c-text-2)]"><MarkdownContent content={content.introductoryText} variant={variant} /></div> : null}
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
