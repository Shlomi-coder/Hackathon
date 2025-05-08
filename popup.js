document.addEventListener('DOMContentLoaded', function() {
  const checkButton = document.getElementById('checkButton');
  const videoType = document.getElementById('videoType');
  const result = document.getElementById('result');
  const loading = document.getElementById('loading');
  const progress = document.querySelector('.progress');
  const progressFill = document.querySelector('.progress-fill');
  const progressText = document.querySelector('.progress-text');
  const error = document.getElementById('error');

  checkButton.addEventListener('click', async () => {
    // Reset UI state
    loading.style.display = 'block';
    progress.style.display = 'block';
    result.style.display = 'none';
    error.style.display = 'none';
    checkButton.disabled = true;
    progressFill.style.width = '0%';
    progressText.textContent = 'Extracting clips: 0%';

    try {
      // Send message to background script
      const response = await chrome.runtime.sendMessage({
        action: 'classifyVideo',
        videoType: videoType.value
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Display result
      result.style.display = 'block';
      result.textContent = `${response.confidence}% ${response.type}`;
    } catch (error) {
      error.style.display = 'block';
      error.textContent = error.message || 'Error: Could not classify video';
    } finally {
      loading.style.display = 'none';
      progress.style.display = 'none';
      checkButton.disabled = false;
    }
  });

  // Listen for progress updates from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'progress') {
      const percent = Math.round(message.progress * 100);
      progressFill.style.width = `${percent}%`;
      progressText.textContent = `Extracting clips: ${percent}%`;
    }
  });
}); 