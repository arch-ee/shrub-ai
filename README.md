# shrubAI - Your Pocket Botanist 🌱

A powerful AI-powered plant identification and care management app built with React, TypeScript, and Capacitor for cross-platform mobile deployment.

## 🌟 Features

### 🔍 Plant Identification
- **AI-Powered Recognition**: Advanced plant identification using Google's Gemini AI
- **Multi-Category Support**: Identifies plants, fruits, berries, and fungi
- **Health Assessment**: Analyzes plant health and provides care recommendations
- **Safety Information**: Warns about toxic plants and provides edibility information

### 📱 Camera Integration
- **High-Quality Capture**: Supports up to 4K resolution photography
- **Advanced Zoom**: 5x digital zoom with smooth controls
- **Smart Overlay**: Visual guides for optimal plant photography
- **Auto-Identification**: Instant analysis after photo capture

### 🎨 User Experience
- **Dark/Light Mode**: Adaptive theming with system preference detection
- **Responsive Design**: Optimized for mobile and desktop devices
- **Accessibility**: Configurable text sizes and high contrast support
- **Haptic Feedback**: Native mobile vibration feedback (iOS/Android)

### 🛒 Shopping Integration
- **Store Locator**: Find nearby plant nurseries and garden centers
- **Online Shopping**: Direct links to major retailers (Amazon, Etsy, Home Depot, etc.)
- **Price Comparison**: Multiple vendor options with pricing information

### ⚙️ Customization
- **Text Size Options**: Small, medium, and large text sizes
- **Camera Settings**: Adjustable zoom levels and quality settings
- **Shopping Preferences**: Toggle shopping suggestions on/off

## 🚀 Technology Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling framework
- **Shadcn/ui** - High-quality component library
- **Vite** - Fast build tool and development server

### Mobile Development
- **Capacitor 6** - Cross-platform native runtime
- **Android Support** - Native Android app compilation
- **iOS Support** - Native iOS app compilation (configured)

### AI & APIs
- **Google Gemini AI** - Advanced plant identification
- **Google Maps API** - Store location services
- **Camera API** - Native camera integration
- **Geolocation API** - Location-based services

### State Management
- **React Query** - Server state management
- **Local Storage** - Client-side data persistence
- **Context API** - Global state management

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shrubai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the app**
   - Web: http://localhost:8080
   - Mobile: Use Capacitor live reload

### Mobile Development

1. **Sync Capacitor**
   ```bash
   npm run cap:sync
   ```

2. **Android Development**
   ```bash
   # Open in Android Studio
   npm run cap:open:android
   
   # Run on device/emulator
   npm run cap:run:android
   
   # Build APK
   npm run cap:build:android
   ```

3. **iOS Development** (macOS only)
   ```bash
   # Open in Xcode
   npx cap open ios
   
   # Run on device/simulator
   npx cap run ios
   ```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### API Keys Setup

1. **Google Gemini AI**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add to environment variables

2. **Google Maps API**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Maps JavaScript API and Places API
   - Create credentials and add to environment variables

### Capacitor Configuration
The app is pre-configured for mobile deployment. Key configurations:

- **App ID**: `app.archie.shrubAI`
- **App Name**: shrubAI
- **Permissions**: Camera, Location, Notifications
- **Splash Screen**: Custom branded splash screen
- **Status Bar**: Adaptive styling

## 📱 Mobile Features

### Native Capabilities
- **Camera Access**: High-resolution photo capture
- **Haptic Feedback**: Tactile user feedback
- **Push Notifications**: Plant care reminders
- **Local Notifications**: Watering schedules
- **File System**: Image storage and caching
- **Network Detection**: Offline capability awareness

### Platform-Specific Features
- **Android**: Material Design integration
- **iOS**: Human Interface Guidelines compliance
- **Progressive Web App**: Installable web version

## 🎨 Design System

### Color Palette
- **Primary**: Leaf green (#5AB04B) - Nature-inspired primary color
- **Secondary**: Cream (#FFE180) - Warm accent color
- **Neutral**: Slate grays - Professional text and backgrounds
- **Semantic**: Success, warning, error states

### Typography
- **Font Family**: Futura - Clean, modern typeface
- **Sizes**: Responsive scaling with accessibility options
- **Weights**: Light, regular, medium for hierarchy

### Components
- **Consistent Spacing**: 8px grid system
- **Rounded Corners**: Soft, friendly interface
- **Shadows**: Subtle depth and elevation
- **Animations**: Smooth transitions and micro-interactions

## 🧪 Testing

### Development Testing
```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Build verification
npm run build
```

### Mobile Testing
- **Android**: Use Android Studio emulator or physical device
- **iOS**: Use Xcode simulator or physical device
- **Web**: Test in multiple browsers and screen sizes

## 📦 Building & Deployment

### Web Deployment
```bash
# Build for production
npm run build

# Preview build
npm run preview
```

### Mobile App Building
```bash
# Android APK
npm run cap:build:android

# iOS App (requires macOS and Xcode)
npx cap build ios
```

### Distribution
- **Google Play Store**: Follow Android publishing guidelines
- **Apple App Store**: Follow iOS publishing guidelines
- **Web Hosting**: Deploy to Netlify, Vercel, or similar platforms

## 🔒 Privacy & Security

### Data Handling
- **Local Storage**: User preferences and plant data stored locally
- **No Personal Data**: No user accounts or personal information collected
- **Image Processing**: Photos processed locally and via secure APIs
- **API Security**: Secure API key management and HTTPS communication

### Permissions
- **Camera**: Required for plant photography
- **Location**: Optional for store locator features
- **Notifications**: Optional for plant care reminders
- **Storage**: Required for image caching and app data

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use Tailwind CSS for styling
3. Maintain component modularity
4. Write descriptive commit messages
5. Test on multiple devices and browsers

### Code Style
- **ESLint**: Configured for React and TypeScript
- **Prettier**: Consistent code formatting
- **Naming**: Descriptive variable and function names
- **Comments**: Document complex logic and APIs

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues
1. **Camera not working**: Check browser permissions and HTTPS
2. **API errors**: Verify API keys and network connection
3. **Build failures**: Ensure all dependencies are installed
4. **Mobile deployment**: Check Capacitor configuration

### Getting Help
- Check the documentation
- Review GitHub issues
- Contact the development team

## 🚀 Future Roadmap

### Planned Features
- **Plant Care Calendar**: Advanced scheduling and reminders
- **Community Features**: Share plants and care tips
- **Offline Mode**: Full functionality without internet
- **Plant Database**: Comprehensive plant encyclopedia
- **AR Integration**: Augmented reality plant identification

### Technical Improvements
- **Performance Optimization**: Faster loading and smoother animations
- **Accessibility**: Enhanced screen reader support
- **Internationalization**: Multi-language support
- **Advanced AI**: More accurate plant identification

---

**shrubAI** - Bringing the power of AI to plant care and identification. Made with ❤️ for plant enthusiasts everywhere.