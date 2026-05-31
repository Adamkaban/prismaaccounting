import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Build slug→pubDate map from blog markdown frontmatter
const blogDates = {};
try {
  for (const file of readdirSync(join(__dirname, 'src/content/blog'))) {
    if (!file.endsWith('.md')) continue;
    const content = readFileSync(join(__dirname, 'src/content/blog', file), 'utf8');
    const match = content.match(/^pubDate:\s*(.+)$/m);
    if (match) {
      const slug = file.replace('.md', '');
      blogDates[`https://prismaaccounting.com/blog/${slug}/`] = match[1].trim();
    }
  }
} catch {}

const BUILD_DATE = new Date().toISOString().split('T')[0];

export default defineConfig({
  site: 'https://prismaaccounting.com',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      serialize(item) {
        item.lastmod = blogDates[item.url] ?? BUILD_DATE;
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
