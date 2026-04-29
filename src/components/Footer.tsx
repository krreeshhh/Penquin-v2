import React from 'react';

export const Footer = () => {
  return (
    <footer className="VPFooter w-full py-[18px] mt-auto text-center border-t border-[var(--vp-c-divider)] bg-[var(--vp-c-bg)] relative z-10">
      <div
        className="container mx-auto px-6"
        style={{ maxWidth: 'var(--content-max-width, 1152px)', transition: 'max-width 700ms cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <p className="message flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[13px] text-[var(--vp-c-text-2)] font-medium leading-[20px]">
          <a
            href="#"
            className="hover:text-[var(--vp-c-text-1)] transition-colors inline-block"
          >
            The Penquin Team
          </a>
          <span className="divider mx-2">|</span>
          <a
            href={`${process.env.NEXT_PUBLIC_GITHUB_REPO}/commit/${process.env.NEXT_PUBLIC_COMMIT_HASH}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] hover:text-[var(--vp-c-text-1)] transition-colors inline-block"
          >
            {process.env.NEXT_PUBLIC_COMMIT_HASH}
          </a>
        </p>
        <p className="copyright text-[13px] text-[var(--vp-c-text-2)] font-medium leading-[20px] mt-[2px]">
          made with love and eepy energy
        </p>
      </div>
    </footer>
  );
};
