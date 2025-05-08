// Helper function to extract videoId from YouTube URL
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Helper function to convert ISO 8601 duration to seconds
function parseDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = (match[1] && parseInt(match[1])) || 0;
  const minutes = (match[2] && parseInt(match[2])) || 0;
  const seconds = (match[3] && parseInt(match[3])) || 0;
  return hours * 3600 + minutes * 60 + seconds;
}

// Helper function to calculate upload frequency
function calculateUploadFrequency(channelStats) {
  if (!channelStats.firstUploadDate || !channelStats.videoCount) {
    return null;
  }

  const firstUpload = new Date(channelStats.firstUploadDate);
  const now = new Date();
  const daysSinceFirstUpload = (now - firstUpload) / (1000 * 60 * 60 * 24);
  return channelStats.videoCount / daysSinceFirstUpload;
}

// Main function to fetch video metadata
async function fetchVideoMetadata(videoId, apiKey) {
  try {
    // Fetch video details
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      `part=contentDetails,statistics,status&` +
      `id=${videoId}&` +
      `key=${apiKey}`
    );
    const videoData = await videoResponse.json();

    if (!videoData.items || videoData.items.length === 0) {
      throw new Error('Video not found');
    }

    const video = videoData.items[0];
    const channelId = video.snippet.channelId;

    // Fetch channel details
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?` +
      `part=statistics,snippet&` +
      `id=${channelId}&` +
      `key=${apiKey}`
    );
    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      throw new Error('Channel not found');
    }

    const channel = channelData.items[0];
    const channelStats = {
      videoCount: parseInt(channel.statistics.videoCount) || 0,
      viewCount: parseInt(channel.statistics.viewCount) || 0,
      firstUploadDate: channel.snippet.publishedAt
    };

    // Calculate metrics
    const likes = parseInt(video.statistics.likeCount) || 0;
    const dislikes = parseInt(video.statistics.dislikeCount) || 0;
    const likesDislikesRatio = dislikes > 0 ? likes / dislikes : likes;

    const avgViewsPerVideo = channelStats.videoCount > 0 
      ? channelStats.viewCount / channelStats.videoCount 
      : 0;

    // Return structured data
    return {
      option_to_comment: video.status.privacyStatus !== 'private',
      video_length: parseDuration(video.contentDetails.duration),
      likes,
      dislikes,
      likes_dislikes_ratio: likesDislikesRatio,
      channel_age: new Date(channel.snippet.publishedAt).toISOString(),
      number_of_videos: channelStats.videoCount,
      avg_views_per_video: Math.round(avgViewsPerVideo),
      upload_frequency: calculateUploadFrequency(channelStats)
    };
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    return {
      error: error.message,
      option_to_comment: null,
      video_length: null,
      likes: null,
      dislikes: null,
      likes_dislikes_ratio: null,
      channel_age: null,
      number_of_videos: null,
      avg_views_per_video: null,
      upload_frequency: null
    };
  }
}

// Export functions
// export {
//   extractVideoId,
//   fetchVideoMetadata
// }; 

console.log('Youtube API script loaded');