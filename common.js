const scriptsPaths = [
    'youtubeApi.js',
    'secrets.js',
    'labelVideos.js',
];

// chrome.scripting.executeScript({
//     target: { tabId: tab.id }, // ✅ must not target an iframe
//     files: ['yourScript.js']
//   });
  

// scriptsPaths.forEach(path => {
//     const script = document.createElement('script');
//     script.src = chrome.runtime.getURL(path);
//     // script.type = 'module';
//     script.onload = () => {
//         console.log(`${path} loaded`);
//     };
//     script.onerror = (ev, err) => {
//         console.error(`Error loading ${path}`, { ev, err });
//     };
//     document.head.appendChild(script);

// });



console.log('Common script loaded');