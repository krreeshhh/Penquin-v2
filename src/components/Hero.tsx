import React from 'react';

export const Hero = () => {
  return (
    <section
      className="VPHero has-image VPHomeHero relative z-0 w-full -mt-[64px] pt-[112px] md:pt-[144px] pb-12 md:pb-16 px-6 md:px-16"
    >
      <div className="container max-w-[1152px] mx-auto flex flex-col md:flex-row">
        <div className="image md:order-2 md:flex-none md:w-[560px] md:h-[168px] relative h-[320px] w-[calc(100%+48px)] -mt-[76px] -mx-6 -mb-12 md:m-0">
          <div className="image-container relative w-[320px] h-[320px] mx-auto md:w-full md:h-full md:-translate-x-8 md:-translate-y-8">
            {/* Blurred gradient blob: should flow behind the cards (not above). */}
            <div className="image-bg pointer-events-none absolute z-0 left-1/2 top-[160px] md:top-[84px] -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] md:w-[360px] md:h-[360px] rounded-full" />
            <img
              className="VPImage image-src absolute z-10 left-1/2 top-[160px] md:top-[84px] -translate-x-1/2 -translate-y-1/2 w-[220px] h-[208px] md:w-[360px] md:h-[341px] object-contain drop-shadow-[0_0_100px_rgba(59,130,246,0.2)]"
              src="/v2/Hero Section.png"
              alt="Penquin Mascot"
            />
          </div>
        </div>

        <div className="main relative z-10 md:order-1 md:flex-none md:w-[592px] flex flex-col items-center md:items-start text-center md:text-left">
          <a
            href="#"
            className="mb-3 inline-flex items-center rounded-[8px] bg-[var(--vp-c-bg-soft)] px-4 py-1 text-[14px] font-semibold leading-5 text-[var(--vp-c-text-1)] hover:text-[var(--vp-c-text-1)] transition-colors"
          >
            Mihon & Aniyomi Extensions
          </a>

          <h1 className="heading flex flex-col items-center md:items-start text-[32px] sm:text-[48px] md:text-[56px] font-bold leading-[40px] sm:leading-[56px] md:leading-[64px] tracking-[-0.4px]">
            <span className="name clip">Hunt bugs</span>
            <span className="text text-[var(--vp-c-text-1)]">Not noise</span>
          </h1>
          <p className="text-[16px] leading-[24px] mt-4 text-[var(--vp-c-text-2)]">A no-BS index of resources, techniques, and field-tested workflows — for people in the field</p>
        </div>
      </div>
    </section>
  );
};
