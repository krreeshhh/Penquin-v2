import React from 'react';
import { Globe, Box, Folder, CircleSlash } from 'lucide-react';

const categories = [
  {
    icon: Globe,
    title: 'Websites',
    description: 'Websites for anime, manga, novels & tokusatsu',
    link: '/docs',
  },
  {
    icon: Box,
    title: 'Software',
    description: 'Software for every Operating System',
    link: '/docs',
  },
  {
    icon: Folder,
    title: 'Misc-sites',
    description: 'Various sites for database, info, tracking news & tools',
    link: '/docs',
  },
  {
    icon: CircleSlash,
    title: 'NSFW',
    description: 'hen...',
    link: '/docs',
  },
];

export const Categories = () => {
  return (
    <section
      className="VPFeatures VPHomeFeatures mx-auto px-6 pt-0 pb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      style={{ maxWidth: 'var(--content-max-width, 1152px)', transition: 'max-width 500ms cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      {categories.map((category) => (
        <a
          key={category.title}
          className="VPLink link no-icon VPFeature group block"
          href={category.link}
        >
          <article className="box h-full group bg-[var(--vp-c-bg-soft)] border-[var(--vp-c-divider)] hover:border-[var(--vp-c-brand-1)] active:border-[var(--vp-c-brand-2)] transition-all">
            <div className="icon w-12 h-12 rounded-lg bg-[var(--vp-c-bg-alt)]/80 flex items-center justify-center mb-4 transition-colors group-hover:bg-[var(--vp-c-bg-soft)] border border-[var(--vp-c-divider)]/40">
              <category.icon
                className={`w-6 h-6 text-[var(--vp-c-text-2)] ${category.title === 'NSFW' ? 'group-hover:text-red-500' : 'group-hover:text-[var(--vp-c-brand-1)]'} transition-colors duration-300`}
                strokeWidth={2}
              />
            </div>
            <h2 className="title text-[17px] font-bold text-[var(--vp-c-text-1)] mb-1 tracking-wide">{category.title}</h2>
            <p className="details text-[14.5px] text-[var(--vp-c-text-2)] leading-[1.6]">
              {category.description}
            </p>
          </article>
        </a>
      ))}
    </section>
  );
};
