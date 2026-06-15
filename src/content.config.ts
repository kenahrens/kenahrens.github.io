import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    series: z.string().optional(),
    draft: z.boolean().default(false),
    // When set, this post was first published elsewhere; point search engines there.
    canonicalURL: z.string().url().optional(),
  }),
});

export const collections = { blog };
