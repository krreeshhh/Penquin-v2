import React from 'react';
import { Soup, CookingPot, Sparkles } from 'lucide-react';

const categories = [
  {
    icon: Soup,
    title: 'Starters',
    description: 'Small plates packed with core knowledge so you learn fast without frying your brain',
    link: '/docs',
  },
  {
    icon: CookingPot,
    title: 'Main Course',
    description: 'Heavy plates only with real commands and real execution in the field',
    link: '/docs/recon#main-course',
  },
  {
    icon: Sparkles,
    title: 'Specials',
    description: 'Specials powered by AI to make your workflow faster',
    link: '/',
    isBlock: true,
  }
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
              {category.isBlock ? (
                <div className="VPFeature relative z-10 flex-1 block rounded-xl border border-[var(--vp-c-bg-soft)] bg-[var(--vp-c-bg-soft)] h-[198px] overflow-hidden cursor-not-allowed opacity-50 select-none">
                  <article className="h-full p-6 flex flex-col relative">
                    <div className="absolute top-0 right-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[var(--vp-c-brand-soft)] text-[var(--vp-c-brand-1)] px-2 py-0.5 rounded-bl-xl rounded-tr-xl">
                        Coming Soon
                      </span>
                    </div>
                    <div className="icon w-12 h-12 rounded-[6px] bg-[rgba(142,150,170,0.14)] flex items-center justify-center mb-5">
                      <category.icon className="w-6 h-6 text-[var(--vp-c-text-2)]" strokeWidth={2} />
                    </div>
                    <h2 className="title text-[16px] font-semibold text-[var(--vp-c-text-1)]">{category.title}</h2>
                    <p className="details pt-2 text-[14px] font-medium text-[var(--vp-c-text-2)] leading-6">
                      {category.description}
                    </p>
                  </article>
                </div>
              ) : (
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
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
