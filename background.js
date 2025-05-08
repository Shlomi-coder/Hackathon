// Create context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "checkVideo",
    title: "Check video",
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
    // Send message to content script to extract clips
    const response = await chrome.tabs.sendMessage(tabId, { action: 'extractClips' });
    
    if (!response || !response.clips) {
      throw new Error('Failed to extract video clips');
    }

    // Here you would send the clips to your ML model for classification
    // For now, we'll use mock classification
    const mockClassification = {
      type: Math.random() > 0.5 ? "Real video" : "Video game",
      confidence: Math.floor(Math.random() * 100)
    };

    return mockClassification;
  } catch (error) {
    console.error('Error processing video:', error);
    throw error;
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "classifyVideo") {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      try {
        const tab = tabs[0];
        const result = await processVideoClips(tab.id);
        sendResponse(result);
      } catch (error) {
        sendResponse({ error: 'Failed to process video' });
      }
    });
    return true; // Keep the message channel open for async response
  }
}); 