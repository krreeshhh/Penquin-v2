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
      className="VPFeatures VPHomeFeatures relative z-10 w-full px-6 md:px-16"
    >
      <div className="container max-w-[1152px] mx-auto">
        <div className="items flex flex-wrap -m-2 items-stretch">
          {categories.map((category) => (
            <div key={category.title} className="item p-2 w-full md:w-1/2 lg:w-1/4 flex">
              <a className="VPLink link no-icon VPFeature relative z-10 group flex-1 block rounded-xl border border-[var(--vp-c-bg-soft)] bg-[var(--vp-c-bg-soft)] hover:border-[var(--vp-c-brand-1)] transition-colors h-[198px] overflow-hidden" href={category.link}>
                <article className="h-full p-6 flex flex-col">
                  <div className="icon w-12 h-12 rounded-[6px] bg-[rgba(142,150,170,0.14)] flex items-center justify-center mb-5">
                    <category.icon
                      className={`w-6 h-6 text-[var(--vp-c-text-2)] ${category.title === 'NSFW' ? 'group-hover:text-red-500' : 'group-hover:text-[var(--vp-c-brand-1)]'} transition-colors duration-300`}
                      strokeWidth={2}
                    />
                  </div>
                  <h2 className="title text-[16px] font-semibold text-[var(--vp-c-text-1)]">{category.title}</h2>
                  <p className="details pt-2 text-[14px] font-medium text-[var(--vp-c-text-2)] leading-6">
                    {category.description}
                  </p>
                </article>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
