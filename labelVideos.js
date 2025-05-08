// import { fetchVideoMetadata, extractVideoId } from './youtubeApi.js';
// import { YOUTUBE_API_KEY } from './secrets.js';



// Function to create and style the label
function createLabel() {
  const label = document.createElement('div');
  label.style.position = 'absolute';
  label.style.top = '10px';
  label.style.right = '10px';
  label.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  label.style.color = 'white';
  label.style.padding = '10px';
  label.style.borderRadius = '5px';
  label.style.fontSize = '14px';
  label.style.maxWidth = '300px';
  label.style.zIndex = '9999';
  label.style.display = 'none';
  return label;
}

// Function to format the metadata for display
function formatMetadata(metadata) {
  if (metadata.error) {
    return `Error: ${metadata.error}`;
  }

  const formatNumber = (num) => {
    if (num === null) return 'N/A';
    return num.toLocaleString();
  };

  const formatDuration = (seconds) => {
    if (seconds === null) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  return `
    Video Length: ${formatDuration(metadata.video_length)}
    Likes: ${formatNumber(metadata.likes)}
    Dislikes: ${formatNumber(metadata.dislikes)}
    Like/Dislike Ratio: ${formatNumber(metadata.likes_dislikes_ratio)}
    Channel Age: ${formatDate(metadata.channel_age)}
    Channel Videos: ${formatNumber(metadata.number_of_videos)}
    Avg Views/Video: ${formatNumber(metadata.avg_views_per_video)}
    Upload Frequency: ${formatNumber(metadata.upload_frequency)} videos/day
    Comments: ${metadata.option_to_comment ? 'Enabled' : 'Disabled'}
  `.trim();
}

// Function to handle video hover
async function handleVideoHover(video) {
  const label = createLabel();
  document.body.appendChild(label);

  video.addEventListener('mouseenter', async () => {
    const videoId = extractVideoId(window.location.href);
    if (!videoId) {
      label.textContent = 'Error: Could not extract video ID';
      label.style.display = 'block';
      return;
    }

    label.textContent = 'Loading metadata...';
    label.style.display = 'block';

    try {
      const metadata = await fetchVideoMetadata(videoId, window.globals.YOUTUBE_API_KEY);
      label.innerHTML = formatMetadata(metadata).replace(/\n/g, '<br>');
    } catch (error) {
      label.textContent = `Error: ${error.message}`;
    }
  });

  video.addEventListener('mouseleave', () => {
    label.style.display = 'none';
  });
}

// Function to initialize video labeling
function initializeVideoLabeling() {
  console.log('Initializing video labeling');
  const video = document.querySelector('video');
  if (video) {
    handleVideoHover(video);
  }
}

// Initialize when the page is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeVideoLabeling);
} else {
  initializeVideoLabeling();
}

// Re-initialize when navigating to a new video
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length) {
      const video = document.querySelector('video');
      if (video) {
        handleVideoHover(video);
      }
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
}); 

console.log('Label Videos script loaded');