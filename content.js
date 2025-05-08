// Function to get video duration
function getVideoDuration() {
  const video = document.querySelector('video');
  return video ? video.duration : 0;
}

// Function to get random timestamp within video duration
function getRandomTimestamp(duration, clipDuration) {
  return Math.random() * (duration - clipDuration);
}

// Function to calculate number of clips needed
function calculateNumClips(duration) {
  const MIN_CONTENT_SECONDS = 90;
  const CLIP_DURATION = 7;
  
  if (duration <= MIN_CONTENT_SECONDS) {
    // For short videos, capture everything
    return Math.ceil(duration / CLIP_DURATION);
  } else if (duration <= 450) { // 7.5 minutes
    // For medium videos, capture 90 seconds
    return Math.ceil(MIN_CONTENT_SECONDS / CLIP_DURATION);
  } else {
    // For long videos, capture 20%
    return Math.ceil((duration * 0.2) / CLIP_DURATION);
  }
}

// Function to extract video clips
async function extractVideoClips() {
  console.log('Starting video clip extraction...');
  const video = document.querySelector('video');
  if (!video) {
    console.error('No video element found on page');
    return null;
  }

  const duration = video.duration;
  console.log('Video duration:', duration);
  const clipDuration = 7; // 7 seconds per clip
  const numClips = calculateNumClips(duration);
  console.log('Calculated number of clips:', numClips);
  const clips = [];
  const frameRate = 5; // 5 FPS
  const frameInterval = 1000 / frameRate; // 200ms between frames
  const maxProcessingTime = 3000; // 3 seconds max processing time
  const startTime = Date.now();

  // Create a canvas for frame extraction
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);

  // Extract random clips
  for (let i = 0; i < numClips; i++) {
    // Check if we've exceeded max processing time
    if (Date.now() - startTime > maxProcessingTime) {
      console.log('Reached maximum processing time, stopping extraction');
      break;
    }

    // Get random timestamp for this clip
    const timestamp = getRandomTimestamp(duration, clipDuration);
    console.log(`Extracting clip ${i + 1}/${numClips} at timestamp:`, timestamp);
    video.currentTime = timestamp;
    
    // Wait for the video to seek to the timestamp
    await new Promise(resolve => {
      const seekedHandler = () => {
        video.removeEventListener('seeked', seekedHandler);
        resolve();
      };
      video.addEventListener('seeked', seekedHandler);
    });

    // Extract frames for this clip at 5 FPS
    const frames = [];
    const totalFrames = clipDuration * frameRate; // 35 frames for 7 seconds at 5 FPS
    console.log(`Extracting ${totalFrames} frames for clip ${i + 1}`);
    
    for (let j = 0; j < totalFrames; j++) {
      // Check processing time for each frame
      if (Date.now() - startTime > maxProcessingTime) {
        console.log('Reached maximum processing time during frame extraction');
        break;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frameData = canvas.toDataURL('image/jpeg', 0.8);
      frames.push(frameData);
      
      // Move to next frame (200ms later)
      video.currentTime += frameInterval / 1000;
      await new Promise(resolve => setTimeout(resolve, frameInterval));
    }
    
    clips.push({
      timestamp,
      frames
    });

    // Send progress update
    const progress = (i + 1) / numClips;
    console.log('Sending progress update:', progress);
    chrome.runtime.sendMessage({
      type: 'progress',
      progress
    });
  }

  console.log('Finished extracting clips:', clips.length);
  return {
    videoId: new URLSearchParams(window.location.search).get('v'),
    clips,
    totalSecondsProcessed: clips.length * clipDuration
  };
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractClips') {
    console.log('Received extractClips request from background script');
    extractVideoClips().then(clips => {
      console.log('Sending clips back to background script:', clips);
      sendResponse(clips);
    }).catch(error => {
      console.error('Error extracting clips:', error);
      sendResponse({ error: error.message || 'Failed to extract clips' });
    });
    return true; // Keep the message channel open for async response
  }
}); 