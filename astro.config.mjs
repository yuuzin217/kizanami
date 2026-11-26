import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://yuuzin217.github.io',
  base: '/kizanami/',
  output: 'static',
  // Issue #50: prefetch internal pages as links enter the viewport so that
  // article navigation does not wait on a GitHub Pages round trip after tap.
  // Astro's prefetch only applies to same-origin links; external links
  // (sources, SNS share links) are not prefetched.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
