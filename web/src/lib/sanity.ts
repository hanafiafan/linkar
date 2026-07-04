import type { SiteContent } from './content';

export async function fetchFromSanity(): Promise<SiteContent> {
  throw new Error('Sanity not configured — implemented in Task 14');
}
