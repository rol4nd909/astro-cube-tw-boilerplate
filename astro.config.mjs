import { defineConfig } from 'astro/config';

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: 'https://rol4nd909.github.io',

  // update the `base` to your needs
  base: '/astro-cube-tw-boilerplate/',

  scopedStyleStrategy: "where",
  integrations: [tailwind({
    applyBaseStyles: false,
    config: './tailwind.config.ts',
    nesting: true,
  })],
});
