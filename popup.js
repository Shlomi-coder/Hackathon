document.addEventListener('DOMContentLoaded', function() {
  const checkButton = document.getElementById('checkButton');
  const result = document.getElementById('result');
  const loading = document.getElementById('loading');
  const progress = document.querySelector('.progress');
  const error = document.getElementById('error');

  checkButton.addEventListener('click', () => {
    console.log('Check button clicked');
    
    // Hide loading and progress elements
    loading.style.display = 'none';
    progress.style.display = 'none';
    error.style.display = 'none';
    
    // Show result
    result.style.display = 'block';
    result.textContent = 'This video is fake!';
  });
}); 