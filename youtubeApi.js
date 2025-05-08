// Helper function to extract videoId from YouTube URL
const https = require('https');
const http = require('http');

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

// Helper function to calculate channel age in days
function calculateChannelAge(channelCreationDate) {
    const creationDate = new Date(channelCreationDate);
    const now = new Date();
    const diffTime = Math.abs(now - creationDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
}


// Helper function to make synchronous HTTP request
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(JSON.parse(data));
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Modify fetchVideoMetadata to be synchronous
function fetchVideoMetadata(videoId, apiKey) {
    try {
        // Make synchronous request for video data
        const videoUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails,statistics,status`;
        const data = makeRequest(videoUrl);

        if (!data.items || data.items.length === 0) {
            throw new Error('No video data found');
        }

        const video = data.items[0];
        const channelId = video.snippet.channelId;

        // Make synchronous request for channel data
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${apiKey}`;
        const channelData = makeRequest(channelUrl);

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
        const views = parseInt(video.statistics.viewCount) || 0;
        const likesViewsRatio = views > 0 ? likes / views : 0;

        const avgViewsPerVideo = channelStats.videoCount > 0 
            ? channelStats.viewCount / channelStats.videoCount 
            : 0;

        // Check comments status
        let hasComments = false;
        try {
            const commentsUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=id&videoId=${videoId}&key=${apiKey}&maxResults=1`;
            const commentsData = makeRequest(commentsUrl);
            hasComments = true;
        } catch (error) {
            hasComments = false;
        }

        // Return structured data
        return {
            video_url: `https://www.youtube.com/watch?v=${videoId}`,
            option_to_comment: hasComments,
            video_length: parseDuration(video.contentDetails.duration),
            likes,
            views,
            likes_views_ratio: likesViewsRatio,
            channel_age: calculateChannelAge(channel.snippet.publishedAt),
            number_of_videos: channelStats.videoCount,
            avg_views_per_video: Math.round(avgViewsPerVideo),
            upload_frequency: calculateUploadFrequency(channelStats)
        };
    } catch (error) {
        console.error('Error fetching video metadata:', error);
        return {
            error: error.message,
            video_url: null,
            option_to_comment: null,
            video_length: null,
            likes: null,
            views: null,
            likes_views_ratio: null,
            channel_age: null,
            number_of_videos: null,
            avg_views_per_video: null,
            upload_frequency: null
        };
    }
}

console.log('Youtube API script loaded');