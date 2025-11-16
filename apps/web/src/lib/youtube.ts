export type YoutubeThumbnailQuality = "hq" | "max";

const extractYoutubeVideoId = (youtubeUrl?: string | null) => {
  if (!youtubeUrl) return null;
  try {
    const parsed = new URL(youtubeUrl);
    const host = parsed.hostname.replace(/^www\./, "");
    let videoId = "";
    if (host.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.split("/shorts/")[1]?.split(/[/?#&]/)[0] ?? "";
      } else if (parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1]?.split(/[/?#&]/)[0] ?? "";
      } else if (parsed.searchParams.get("v")) {
        videoId = parsed.searchParams.get("v") ?? "";
      }
    } else if (host.includes("youtu.be")) {
      videoId = parsed.pathname.replace("/", "").split(/[/?#&]/)[0] ?? "";
    }
    return videoId || null;
  } catch {
    return null;
  }
};

export const getYoutubeThumbnailUrl = (youtubeUrl?: string | null, quality: YoutubeThumbnailQuality = "hq") => {
  const videoId = extractYoutubeVideoId(youtubeUrl);
  if (!videoId) return null;
  const fileName = quality === "max" ? "maxresdefault.jpg" : "hqdefault.jpg";
  return `https://img.youtube.com/vi/${videoId}/${fileName}`;
};

export { extractYoutubeVideoId };
