import React from 'react';

export const Hero = () => {
  return (
    <section
      className="VPHero has-image VPHomeHero w-full pt-0 pb-8 px-6 mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12"
      style={{ maxWidth: 'var(--content-max-width, 1152px)', transition: 'max-width 500ms cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      <div className="main flex-1 flex flex-col items-center md:items-start text-center md:text-left z-10">
        <a
          href="#"
          className="mb-4 inline-flex items-center rounded-[8px] bg-[var(--vp-c-bg-soft)] px-3 py-1 text-[11px] sm:text-[12px] font-bold text-[var(--vp-c-text-2)] hover:text-[var(--vp-c-text-1)] border border-[var(--vp-c-divider)] transition-colors uppercase tracking-wider"
        >
          Mihon & Aniyomi Extensions
        </a>
        <h1 className="heading text-[36px] sm:text-[48px] md:text-[56px] font-bold leading-[1.1] sm:leading-[1.15] tracking-tight mb-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
          <span className="name clip">Penquin</span>
          <span className="text font-bold text-[var(--vp-c-text-1)] whitespace-nowrap">The Penquin Index</span>
        </h1>
      </div>

      <div className="image relative flex justify-center items-center mt-4 md:mt-0 flex-none w-full max-w-[500px] sm:max-w-[560px] md:max-w-[600px]">
        <div className="image-container relative">
          <div className="image-bg absolute inset-0 -z-10 rounded-full" />
          <img
            className="VPImage image-src relative max-w-full w-[260px] sm:w-[340px] md:w-[400px] lg:w-[460px] h-auto object-contain drop-shadow-[0_0_100px_rgba(59,130,246,0.2)]"
            src="/v2/Hero Section.png"
            alt="Penquin Mascot"
          />
        </div>
      </div>
    </section>
  );
};
