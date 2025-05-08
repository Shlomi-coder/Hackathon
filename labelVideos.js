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

// Function to process a single video card
function processVideoCard(card) {
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
}

// Function to process all visible video cards
function processAllVideoCards() {
    // Select all video card types
    const videoCards = document.querySelectorAll('ytd-video-renderer, ytd-rich-item-renderer');
    videoCards.forEach(processVideoCard);
}

// Create a MutationObserver to watch for new videos
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
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