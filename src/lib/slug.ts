/** URL-safe lowercase slug: "Winter Shawl 2" -> "winter-shawl-2". */
export const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-');
