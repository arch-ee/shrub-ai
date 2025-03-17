
# shrubAI Documentation

## Overview

shrubAI is an identification application that uses artificial intelligence to identify plants, berries, fruits, and fungi from images, with a special focus on edibility and safety information. Simply take a photo or upload an image, and the AI will analyze it to determine what it is and provide crucial safety information.

## Features

### 1. Comprehensive Identification
- Upload an image or take a photo of plants, berries, fruits, or fungi
- Receive accurate identification of the species
- Get information about edibility and potential toxicity
- Identify harmful plants that can cause skin irritation (like poison ivy)

### 2. Safety Information
- Clear edibility indicators (edible or not edible)
- Toxicity ratings (none, mild, moderate, severe)
- Which parts of the plant are safe to consume (if any)
- Warning symptoms in case of consumption or contact
- Health diagnostics for plants

### 3. Plant Care Information
- Water requirements
- Sunlight needs
- Temperature preferences
- Plant health assessments
- Treatment recommendations for unhealthy plants

### 4. User Interface
- Dark mode toggle (similar to YouTube's interface)
- Responsive design for mobile and desktop
- Camera integration for taking photos directly in the app

## Technology

shrubAI uses the following technologies:

- **Frontend**: React with TypeScript
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **AI Integration**: Google's Gemini Pro Vision API for image analysis and identification
- **Styling**: Custom Tailwind themes with dark mode support

## How to Use

### Identification Process

1. **Launch the application** in your web browser
2. **Select an image** using one of two methods:
   - Click the "camera" button to take a photo using your device's camera
   - Click the "upload" button to select an image from your device
3. **Identify** by clicking the "identify" button
4. **View results** showing:
   - Name of the plant, berry, or fungus
   - Edibility status and which parts can be eaten (if any)
   - Toxicity rating and potential warning symptoms
   - For plants: health status and care requirements

### Dark Mode

Toggle between light and dark modes by clicking the switch in the top-right corner of the application.

## Safety Disclaimer

**IMPORTANT**: Never consume any plant, berry, fruit, or fungus based solely on this app's identification. Always cross-reference with multiple reliable sources and consult with foraging experts before consuming any wild-growing organism. This application provides informational content only and is not a substitute for professional advice.

## API Usage

shrubAI uses Google's Gemini Pro Vision API for identification. The application sends the image to the API and receives JSON data containing:

- Plant/fungi name (common name)
- Scientific name
- Whether it's a fungus or plant
- Edibility status
- Edible parts (if any)
- Toxicity rating
- Warning symptoms (if toxic)
- Health assessment (for plants)
- Care requirements (for plants)

## Privacy

The application processes images locally before sending them to the Gemini API. No images are stored permanently, and all analysis is done in real-time.

## Error Handling

If the AI cannot identify what's in the image, the application will inform you and suggest taking a clearer photo from a different angle.

## Troubleshooting

### Common Issues

1. **"Not identified" error**
   - Ensure you're taking a clear, well-lit photo
   - Try photographing from different angles
   - Make sure the subject is the main focus in the image

2. **Camera not working**
   - Check that you've granted camera permissions to the browser
   - Try refreshing the page
   - Ensure your device has a working camera

3. **Image upload problems**
   - Verify the image format is supported (JPEG, PNG)
   - Check that the image file size is not too large

## Future Updates

The shrubAI team is constantly working to improve the application. Planned features include:

- Expanded database of edible and toxic species
- Seasonal availability information for edible plants and fungi
- Geographic distribution data
- Detailed guides for safe foraging practices
- Collection and tracking features for foragers

## Contact

For support or feedback, please reach out to us at support@shrubai.com
