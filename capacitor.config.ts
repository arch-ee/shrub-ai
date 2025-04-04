
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5513d79477c644378bea89583ccaeb73',
  appName: 'Plant Trivia',
  webDir: 'dist',
  server: {
    url: 'https://5513d794-77c6-4437-8bea-89583ccaeb73.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: null,
      keystorePassword: null,
      keystoreAlias: null,
      keystoreAliasPassword: null,
      signingType: null
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#f8fafc",
      androidScaleType: "CENTER_CROP",
      splashImmersive: true,
      splashFullScreen: true,
      splashShowOnlyFirstTime: false
    },
    CapacitorHttp: {
      enabled: true
    },
    Haptics: {
      selectionStarted: true
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#f8fafc"
    },
    Keyboard: {
      resize: "body",
      style: "DARK",
      resizeOnFullScreen: true
    }
  }
};

export default config;
