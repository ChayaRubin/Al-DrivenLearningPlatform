export const CATEGORY_IMAGES: Record<string, string> = {
  Programming: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
  Mathematics: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80',
  Graphics: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&q=80',
  DataScience: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
  'Generative AI': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80',
};

export function getCategoryImageUrl(category: {
  name: string;
  imageUrl?: string | null;
}): string {
  if (category.imageUrl) return category.imageUrl;
  return (
    CATEGORY_IMAGES[category.name] ??
    `https://picsum.photos/seed/${encodeURIComponent(category.name)}/600/360`
  );
}
