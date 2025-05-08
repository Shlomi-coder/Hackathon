// Remove any existing injected note to prevent duplicates
const existingNote = document.getElementById('youtube-injected-note');
if (existingNote) {
    existingNote.remove();
}

// Create and style the floating message
const note = document.createElement('div');
note.id = 'youtube-injected-note';
note.textContent = '💬 Injected gibberish: Blorp ziggity zig!';
note.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    z-index: 9999;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

// Add the note to the page
document.body.appendChild(note); 