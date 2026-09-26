export function getInstagramEmbedUrl(postUrl: string): string | null {
  const match = postUrl.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)/);
  if (!match) return null;
  return `https://www.instagram.com/p/${match[1]}/embed/`;
}

export function getTikTokVideoId(postUrl: string): string | null {
  const match = postUrl.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (!match) return null;
  return match[1];
}

export function getTikTokEmbedUrl(postUrl: string): string | null {
  const videoId = getTikTokVideoId(postUrl);
  if (!videoId) return null;
  return `https://www.tiktok.com/embed/v2/${videoId}`;
}

export interface SocialMediaPost {
  id: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  post_url: string;
  video_url?: string;
  thumbnail_url?: string;
  is_active: boolean;
  display_order: number;
}
