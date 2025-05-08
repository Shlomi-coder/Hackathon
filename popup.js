document.addEventListener('DOMContentLoaded', function() {
  const checkButton = document.getElementById('checkButton');
  const result = document.getElementById('result');
  const loading = document.getElementById('loading');
  const progress = document.querySelector('.progress');
  const error = document.getElementById('error');

  checkButton.addEventListener('click', async () => {
    console.log('Check button clicked');
    
    // Show loading state
    loading.style.display = 'block';
    progress.style.display = 'block';
    error.style.display = 'none';
    result.style.display = 'none';
    
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Send message to content script to start processing
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'startVideoCheck' });
      
      // Hide loading elements
      loading.style.display = 'none';
      progress.style.display = 'none';
      
      if (response && response.success) {
        result.style.display = 'block';
        result.textContent = 'Videos are being analyzed...';
      } else {
        error.style.display = 'block';
        error.textContent = 'Failed to start video analysis';
      }
    } catch (error) {
      console.error('Error:', error);
      loading.style.display = 'none';
      progress.style.display = 'none';
      error.style.display = 'block';
      error.textContent = 'Error: ' + error.message;
    }
  });
}); 