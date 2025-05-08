// import { fetchVideoMetadata, extractVideoId } from './youtubeApi.js';
// import { YOUTUBE_API_KEY } from './secrets.js';

// Array to store video metadata
let collectedMetadata = [];
let hasDownloaded = false;

// Function to create and style the label element
function createLabel() {
    const label = document.createElement('div');
    label.textContent = 'HERE';
    label.style.cssText = `
        color: white;
        font-weight: bold;
        border: 2px solid #ff0000;
        padding: 4px 8px;
        margin: 8px 0;
        text-align: center;
        background-color: rgba(0, 0, 0, 0.8);
        border-radius: 4px;
        width: 100%;
        box-sizing: border-box;
    `;
    return label;
}

// Function to download metadata as JSON
function downloadMetadata() {
    if (hasDownloaded || collectedMetadata.length === 0) return;
    
    const jsonData = JSON.stringify(collectedMetadata, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'video_metadata.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    hasDownloaded = true;
    console.log('Metadata downloaded successfully');
}

// Function to process a single video card
async function processVideoCard(card) {
    // Skip if already processed
    if (card.querySelector('.video-classifier-label')) {
        return;
    }

    // Find the metadata section
    const metadata = card.querySelector('#metadata-line');
    if (!metadata) {
        return;
    }

    // Create and insert the label
    const label = createLabel();
    label.className = 'video-classifier-label';
    metadata.parentNode.insertBefore(label, metadata.nextSibling);

    // Extract video ID and collect metadata
    const videoId = card.querySelector('a#video-title')?.href?.split('v=')[1];
    if (videoId && collectedMetadata.length < 10) {
        try {
            const apiKey = window.globals.YOUTUBE_API_KEY;
            if (!apiKey) {
                console.error('YouTube API key not found');
                return;
            }

            const videoMetadata = await fetchVideoMetadata(videoId, apiKey);
            collectedMetadata.push(videoMetadata);
            console.log(`Collected metadata for video ${videoId}`);

            // If we've collected 10 videos, trigger download
            if (collectedMetadata.length === 10) {
                downloadMetadata();
            }
        } catch (error) {
            console.error(`Error fetching metadata for video ${videoId}:`, error);
        }
    }
}

// Function to process all visible video cards
async function processAllVideoCards() {
    // Select all video card types
    const videoCards = document.querySelectorAll('ytd-video-renderer, ytd-rich-item-renderer');
    
    // Process only the first 10 cards
    const cardsToProcess = Array.from(videoCards).slice(0, 10);
    
    for (const card of cardsToProcess) {
        await processVideoCard(card);
    }
}

// Create a MutationObserver to watch for new videos
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length && !hasDownloaded) {
            processAllVideoCards();
        }
    });
});

// Start observing the document for changes
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Process any existing videos
processAllVideoCards();

console.log('Label Videos script loaded');