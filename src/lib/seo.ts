import { site } from '../data/site';

export const TITLE_MAX = 65;
const TITLE_SUFFIX = ' | M.M. Construction';

/** Appends the brand to a page title when it still fits within TITLE_MAX characters. */
export function pageTitle(title: string): string {
  return title.length + TITLE_SUFFIX.length <= TITLE_MAX ? `${title}${TITLE_SUFFIX}` : title;
}

/** Serialises JSON-LD for a <script> element; "<" is escaped so content can never close the tag. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export const absolute = (path: string) => new URL(path, site.url).href;

export const ids = {
  organization: `${site.url}/#organization`,
  website: `${site.url}/#website`,
  founder: `${site.url}/#founder`,
};

export type Crumb = { name: string; path: string };

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: absolute(c.path) })),
  };
}

export function faqSchema(faqs: [string, string][]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}

export const DESCRIPTION_MAX = 170;

/**
 * Builds a meta description from sentences, adding whole sentences while the result stays within
 * DESCRIPTION_MAX characters. A first sentence that is already too long is cut at a word boundary.
 */
export function describe(...parts: string[]): string {
  // Split after ". " only when a lowercase letter precedes the stop, so "M.M. Construction" stays whole.
  const sentences = parts.flatMap((p) => p.split(/(?<=[a-z)][.!?])\s+(?=[A-Z])/)).map((s) => s.trim()).filter(Boolean);
  let out = '';
  for (const sentence of sentences) {
    const next = out ? `${out} ${sentence}` : sentence;
    if (next.length > DESCRIPTION_MAX) break;
    out = next;
  }
  if (!out && sentences[0]) out = `${sentences[0].slice(0, DESCRIPTION_MAX - 1).replace(/\s+\S*$/, '')}…`;
  return out;
}
