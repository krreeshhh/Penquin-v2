import React from 'react';

export const Footer = () => {
  return (
    <footer className="VPFooter w-full py-[32px] mt-auto text-center border-t border-[var(--vp-c-divider)] bg-[var(--vp-c-bg)] relative z-10">
      <div
        className="container mx-auto px-6"
        style={{ maxWidth: 'var(--content-max-width, 1152px)', transition: 'max-width 500ms cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <p className="message flex items-center justify-center gap-[5px] text-[14px] text-[var(--vp-c-text-2)] font-medium leading-[24px]">
          <a
            href="#"
            className="hover:text-[var(--vp-c-text-1)] transition-colors inline-block"
          >
            The Penquin Team
          </a>
          <span className="divider mx-2">|</span>
          <a
            href="#"
            className="text-[14px] hover:text-[var(--vp-c-text-1)] transition-colors inline-block"
          >
            1c62c2a
          </a>
        </p>
        <p className="copyright text-[14px] text-[var(--vp-c-text-2)] font-medium leading-[24px] mt-[2px]">
          made with love and eepy energy
        </p>
      </div>
    </footer>
  );
};
