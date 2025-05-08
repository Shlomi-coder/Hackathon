// Create context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "checkVideo",
    title: "Check videos",
    contexts: ["video"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "checkVideo") {
    // Open the popup window
    chrome.windows.create({
      url: 'popup.html',
      type: 'popup',
      width: 400,
      height: 300
    });
  }
});

// Function to process video clips
async function processVideoClips(tabId) {
  try {
    console.log('Sending extractClips message to content script...');
    // Send message to content script to extract clips
    const response = await chrome.tabs.sendMessage(tabId, { action: 'extractClips' });
    console.log('Received response from content script:', response);

    if (!response || !response.clips) {
      console.error('Invalid response from content script:', response);
      throw new Error('Failed to extract video clips');
    }

    // Sample up to 5 frames from the clips
    const frames = [];
    for (const clip of response.clips) {
      if (frames.length >= 5) break;
      if (clip.frames && clip.frames.length > 0) {
        frames.push(clip.frames[0]);
      }
    }

    if (frames.length === 0) {
      console.error('No frames found in clips');
      throw new Error('No frames available for classification');
    }
    console.log(`Collected ${frames.length} frames for classification`);

    // Send frames to FastAPI backend
    console.log('Sending frames to backend...');
    const apiResponse = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ frames })
    });

    if (!apiResponse.ok) {
      console.error('Backend request failed:', apiResponse.status);
      throw new Error('Failed to classify video');
    }

    const result = await apiResponse.json();
    console.log('Received classification result:', result);
    return {
      type: result.label === 'real' ? 'Real video' : 'Video game',
      confidence: result.confidence
    };

  } catch (error) {
    console.error('Error in processVideoClips:', error);
    return { error: error.message || 'Failed to classify video' };
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "classifyVideo") {
    console.log('Received classifyVideo request from popup');
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      try {
        const tab = tabs[0];
        console.log('Processing video from tab:', tab.id);
        const result = await processVideoClips(tab.id);
        console.log('Sending result back to popup:', result);
        sendResponse(result);
      } catch (error) {
        console.error('Error handling classifyVideo request:', error);
        sendResponse({ error: error.message || 'Failed to process video' });
      }
    });
    return true; // Keep the message channel open for async response
  }
});

// Test function to inject note
chrome.action.onClicked.addListener(async (tab) => {
  // Check if we're on YouTube
  if (tab.url.includes('youtube.com')) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['injectNote.js']
      });
      console.log('Note injected successfully');
    } catch (error) {
      console.error('Failed to inject note:', error);
    }
  }
});

