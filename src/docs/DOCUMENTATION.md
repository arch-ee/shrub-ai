
# shrubAI Documentation

## Overview

shrubAI is a plant identification application that uses artificial intelligence to identify plants from images and provide care information. Simply take a photo or upload an image of a plant, and the AI will analyze it to determine the plant species and provide information about its care requirements.

## Features

### 1. Plant Identification
- Upload an image or take a photo of a plant
- Receive identification of the plant species
- Get health assessment of the plant

### 2. Plant Care Information
- Water requirements
- Sunlight needs
- Temperature preferences
- Health diagnostics (if issues are detected)
- Treatment recommendations (if applicable)

### 3. User Interface
- Dark mode toggle (similar to YouTube's interface)
- Responsive design for mobile and desktop
- Camera integration for taking photos directly in the app

## Technology

shrubAI uses the following technologies:

- **Frontend**: React with TypeScript
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **AI Integration**: Google's Gemini 2.0 API for image analysis and plant identification
- **Styling**: Custom Tailwind themes with dark mode support

## How to Use

### Plant Identification

1. **Launch the application** in your web browser
2. **Select an image** using one of two methods:
   - Click the "camera" button to take a photo using your device's camera
   - Click the "upload" button to select an image from your device
3. **Identify the plant** by clicking the "identify plant" button
4. **View results** showing the plant name, health status, and care requirements

### Dark Mode

Toggle between light and dark modes by clicking the switch in the top-right corner of the application.

## API Usage

shrubAI uses Google's Gemini 2.0 Pro API for plant identification. The application sends the image to the API and receives JSON data containing:

- Plant name (common name)
- Scientific name
- Health assessment (percentage)
- Water needs
- Sunlight requirements
- Temperature preferences
- Disease diagnosis (if applicable)
- Treatment recommendations (if applicable)

## Privacy

The application processes images locally before sending them to the Gemini API. No images are stored permanently, and all analysis is done in real-time.

## Error Handling

If the AI cannot identify a plant, the application will inform you and suggest taking a clearer photo from a different angle.

## Troubleshooting

### Common Issues

1. **"Plant not identified" error**
   - Ensure you're taking a clear, well-lit photo
   - Try photographing the plant from different angles
   - Make sure the plant is the main subject in the image

2. **Camera not working**
   - Check that you've granted camera permissions to the browser
   - Try refreshing the page
   - Ensure your device has a working camera

3. **Image upload problems**
   - Verify the image format is supported (JPEG, PNG)
   - Check that the image file size is not too large

## Future Updates

The shrubAI team is constantly working to improve the application. Planned features include:

- More detailed plant care guides
- Plant disease identification with expanded treatment recommendations
- Seasonal care tips based on user location
- Plant collection and tracking features

## Contact

For support or feedback, please reach out to us at support@shrubai.com
