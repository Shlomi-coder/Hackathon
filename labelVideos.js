// import { fetchVideoMetadata, extractVideoId } from './youtubeApi.js';
// import { YOUTUBE_API_KEY } from './secrets.js';

// Array to store video metadata
let collectedMetadata = [];
let hasDownloaded = false;

// Test data for predictions
const testPredictionsData = {
    "https://www.youtube.com/watch?v=V8YfSjiqWaI&t=2s&pp=ygUUcGFyaXMgdnMgYXJzZW5hbCAyLTE%3D": [0.85, 0.15],
    "https://www.youtube.com/watch?v=ghxOfPG7ZAA&t=41s&pp=ygUUcGFyaXMgdnMgYXJzZW5hbCAyLTE%3D": [0.23, 0.77],
    "hhttps://www.youtube.com/watch?v=FunI7-CnokA&pp=ygUUcGFyaXMgdnMgYXJzZW5hbCAyLTE%3D": [0.45, 0.55],
    "https://www.youtube.com/watch?v=V-5ke6lhVzc&pp=ygUUcGFyaXMgdnMgYXJzZW5hbCAyLTE%3D": [0.92, 0.08],
    "https://www.youtube.com/watch?v=RC-oF-W7R5c&pp=ygUUcGFyaXMgdnMgYXJzZW5hbCAyLTE%3D": [0.12, 0.88],
    "https://www.youtube.com/watch?v=jHVLj6Sm7j4&pp=ygUUcGFyaXMgdnMgYXJzZW5hbCAyLTE%3D": [0.51, 0.49],
    "https://www.youtube.com/watch?v=GihQQVmHQAU&pp=ygUUcGFyaXMgdnMgYXJzZW5hbCAyLTE%3D": [0.78, 0.22],
    "https://www.youtube.com/watch?v=KRSvhsbBAgU&pp=ygUUcGFyaXMgdnMgYXJzZW5hbCAyLTE%3D": [0.33, 0.67],
    "https://www.youtube.com/watch?v=WAVuvgboJq4&t=29s&pp=ygUUcGFyaXMgdnMgYXJzZW5hbCAyLTE%3D": [0.95, 0.05],
    "https://www.youtube.com/watch?v=Gfr5SvFQ6zs&pp=ygUUcGFyaXMgdnMgYXJzZW5hbCAyLTE%3D": [0.05, 0.95],
    "https://www.youtube.com/watch?v=WoI3jJbldtc&pp=ygUUcGFyaXMgdnMgYXJzZW5hbCAyLTE%3D": [0.64, 0.36],
    "https://www.youtube.com/watch?v=Vfe_BLEWr9U&pp=ygUUcGFyaXMgdnMgYXJzZW5hbCAyLTE%3D": [0.29, 0.71],
    "https://www.youtube.com/watch?v=35_G6R6rD94&pp=ygUUcGFyaXMgdnMgYXJzZW5hbCAyLTE%3D": [0.81, 0.19],
    "https://www.youtube.com/watch?v=nK2tyqkJRXM&t=8s&pp=ygUUcGFyaXMgdnMgYXJzZW5hbCAyLTE%3D": [0.42, 0.58],
    "https://www.youtube.com/watch?v=lHKSdF94qZI&pp=ygUUcGFyaXMgdnMgYXJzZW5hbCAyLTE%3D": [0.98, 0.02],
    "https://www.youtube.com/watch?v=NLj-3JRvJ1s&t=11s&pp=ygUUcGFyaXMgdnMgYXJzZW5hbCAyLTE%3D": [0.09, 0.91],
    "https://www.youtube.com/watch?v=QraZ3NRYzIg&pp=ygUUcGFyaXMgdnMgYXJzZW5hbCAyLTE%3D": [0.56, 0.44],
    "https://www.youtube.com/watch?v=8HdLON0lJ9Y&pp=ygUUcGFyaXMgdnMgYXJzZW5hbCAyLTE%3D": [0.72, 0.28],
    "https://www.youtube.com/watch?v=QMXWVDMQTYA&pp=ygUUcGFyaXMgdnMgYXJzZW5hbCAyLTE%3D": [0.38, 0.62],
    "https://www.youtube.com/watch?v=GvAIb5s4IYo&pp=ygUUcGFyaXMgdnMgYXJzZW5hbCAyLTE%3D": [0.91, 0.09]
} ;

// Function to calculate background color based on prediction percentages
function calculateBackgroundColor(realPercent, fakePercent) {
    const higherPercent = Math.max(100*realPercent, 100*fakePercent);
    const isReal = realPercent > fakePercent;
    
    if (higherPercent < 60) {
        // Yellow for uncertain predictions (around 50%)
        return 'rgba(255, 255, 0, 0.8)';
    } else if (isReal) {
        // Green for high real percentage
        const intensity = Math.min(1, (higherPercent - 60) / 40); // Scale from 60% to 100%
        return `rgba(0, ${Math.round(255 * intensity)}, 0, 0.8)`;
    } else {
        // Red for high fake percentage
        const intensity = Math.min(1, (higherPercent - 60) / 40); // Scale from 60% to 100%
        return `rgba(${Math.round(255 * intensity)}, 0, 0, 0.8)`;
    }
}

// Function to format label text based on prediction percentages
function formatLabelText(realPercent, fakePercent) {
    const higherPercent = Math.max(100*realPercent, 100*fakePercent);
    const isReal = realPercent > fakePercent;
    return `${Math.round(higherPercent)}% ${isReal ? 'Real' : 'Fake'}`;
}

// Function to create and style the label element
function createLabel(predictions = null) {
    const label = document.createElement('div');
    
    if (predictions) {
        const [realPercent, fakePercent] = predictions;
        label.textContent = formatLabelText(realPercent, fakePercent);
        label.style.backgroundColor = calculateBackgroundColor(realPercent, fakePercent);
    } else {
        label.textContent = 'Analyzing...';
        label.style.backgroundColor = 'rgba(128, 128, 128, 0.8)'; // Gray background for analyzing state
    }
    
    label.style.cssText += `
        color: white;
        font-weight: bold;
        border: 2px solid #ff0000;
        padding: 4px 8px;
        margin: 8px 0;
        text-align: center;
        border-radius: 4px;
        width: 100%;
        box-sizing: border-box;
    `;
    return label;
}

// Function to update label with prediction data
function updateLabelWithPrediction(label, url, predictions) {
    if (predictions && Array.isArray(predictions) && predictions.length === 2) {
        const [realPercent, fakePercent] = predictions;
        console.log('Real %: ' + realPercent + ', Fake %: ' + fakePercent)
        label.textContent = formatLabelText(realPercent, fakePercent);
        label.style.backgroundColor = calculateBackgroundColor(realPercent, fakePercent);
    }
}

// Function to test predictions with sample data
async function testPredictions() {
    try {
        console.log('Starting testPredictions...');
        const testData = testPredictionsData;
        console.log('Using test data:', testData);
        
        // Update all labels with test predictions
        const labels = document.querySelectorAll('.video-classifier-label');
        console.log('Found labels:', labels.length);
        
        labels.forEach(label => {
            const videoCard = label.closest('ytd-video-renderer, ytd-rich-item-renderer');
            if (videoCard) {
                const videoUrl = videoCard.querySelector('a#video-title')?.href;
                console.log('Processing video URL:', videoUrl);
                
                if (videoUrl) {
                    // Extract video ID
                    const videoId = videoUrl.split('v=')[1]?.split('&')[0];
                    console.log('Extracted video ID:', videoId);
                    
                    // Find the matching URL in test data
                    const matchingUrl = Object.keys(testData).find(url => 
                        url.includes(videoId)
                    );
                    
                    console.log('Matching URL found:', matchingUrl);
                    
                    if (matchingUrl) {
                        console.log('Applying prediction:', testData[matchingUrl]);
                        updateLabelWithPrediction(label, videoUrl, testData[matchingUrl]);
                    } else {
                        console.log('No matching URL found, using random prediction');
                        // If no exact match, use a random prediction
                        const testUrls = Object.keys(testData);
                        const randomUrl = testUrls[Math.floor(Math.random() * testUrls.length)];
                        updateLabelWithPrediction(label, videoUrl, testData[randomUrl]);
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error in testPredictions:', error);
    }
}

// Function to download metadata as JSON
function downloadMetadata() {
    console.log('downloadMetadata called');
    if (hasDownloaded || collectedMetadata.length === 0) {
        console.log('Skipping download - hasDownloaded:', hasDownloaded, 'metadata length:', collectedMetadata.length);
        return;
    }
    
    const jsonData = JSON.stringify(collectedMetadata, null, 2);
    console.log('Prepared JSON data:', jsonData);
    
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

    // Send the same JSON to the server endpoint
    //console.log('Sending metadata to server:', jsonData);
    // For testing: use test predictions instead of making API call
    console.log('Calling testPredictions...');
    testPredictions();
    
    // Comment out the actual API call for testing
    /*
    fetch('http://localhost:5000/process', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Server response:', data);
        // Update all labels with their corresponding predictions
        const labels = document.querySelectorAll('.video-classifier-label');
        labels.forEach(label => {
            const videoCard = label.closest('ytd-video-renderer, ytd-rich-item-renderer');
            if (videoCard) {
                const videoUrl = videoCard.querySelector('a#video-title')?.href;
                if (videoUrl && data[videoUrl]) {
                    updateLabelWithPrediction(label, videoUrl, data[videoUrl]);
                }
            }
        });
    })
    .catch(error => {
        console.error('Error sending metadata to server:', error);
    });
    */
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
    if (videoId && collectedMetadata.length < 20) {
        try {
            const apiKey = window.globals.YOUTUBE_API_KEY;
            if (!apiKey) {
                console.error('YouTube API key not found');
                return;
            }

            const videoMetadata = await fetchVideoMetadata(videoId, apiKey);
            collectedMetadata.push(videoMetadata);
            console.log(`Collected metadata for video ${videoId}`);

            // If we've collected 20 videos, trigger download
            if (collectedMetadata.length === 20) {
                downloadMetadata();
            } else {
                console.log('Collected metadata:', collectedMetadata.length);
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
    
    // Process only the first 20 cards
    const cardsToProcess = Array.from(videoCards).slice(0, 20);
    
    for (const card of cardsToProcess) {
        await processVideoCard(card);
    }
}

// Function to start video processing
async function startVideoProcessing() {
    console.log('Starting video processing...');
    hasDownloaded = false; // Reset the download flag
    collectedMetadata = []; // Clear collected metadata
    await processAllVideoCards();
    return { success: true };
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startVideoCheck') {
        startVideoProcessing().then(sendResponse);
        return true; // Keep the message channel open for async response
    }
});

// Create a MutationObserver to watch for new videos
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length && !hasDownloaded) {
            // Only process new videos if we've already started processing
            if (collectedMetadata.length > 0) {
                processAllVideoCards();
            }
        }
    });
});

// Start observing the document for changes
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Remove the automatic processing of existing videos
// processAllVideoCards();

console.log('Label Videos script loaded');