/**
 * Extract YouTube video ID from various URL formats.
 * Supports: youtube.com/watch, youtu.be, youtube.com/shorts, youtube.com/embed
 */
export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;

  const patterns = [
    /youtube\.com\/watch\?v=([^&#]+)/,
    /youtu\.be\/([^?&#]+)/,
    /youtube\.com\/shorts\/([^?&#]+)/,
    /youtube\.com\/embed\/([^?&#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function validateVideoUrl(url) {
  return !!extractYouTubeId(url);
}

export function createEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Process an array of video objects from the request body.
 * Extracts embedId from each URL, validates, and returns processed array.
 */
export function processVideos(videos) {
  if (!Array.isArray(videos)) return [];

  return videos
    .filter(v => v && v.url)
    .map((video, index) => {
      const videoId = extractYouTubeId(video.url);
      if (!videoId) {
        throw new Error(`URL de YouTube inválida: ${video.url}`);
      }

      return {
        url: video.url,
        embedId: videoId,
        title: video.title || '',
        type: 'youtube',
        order: video.order ?? index,
      };
    });
}
