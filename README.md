# Video Type Classifier Chrome Extension

This Chrome extension helps you determine if a YouTube video shows real sports footage or video game gameplay.

## Features

- Right-click on any YouTube video to access the "Check video" option
- Select the type of video (currently supports Football)
- Get a confidence score indicating whether the video is real footage or video game gameplay

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

1. Navigate to any YouTube video
2. Right-click on the video player
3. Select "Check video" from the context menu
4. In the popup window, select the video type (Football)
5. Click "Check" to analyze the video
6. View the results showing the confidence percentage and classification

## Note

This is a basic implementation. The current version uses mock data for demonstration purposes. To implement actual video classification, you'll need to:

1. Integrate with a video processing API
2. Implement video frame extraction
3. Connect to a machine learning model for classification

## Future Improvements

- Add support for more sports types
- Implement real video classification using ML models
- Add batch processing for multiple videos
- Improve UI/UX 