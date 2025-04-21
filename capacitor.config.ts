
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5513d79477c644378bea89583ccaeb73',
  appName: 'PlantApp',
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
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#f8fafc",
      androidScaleType: "CENTER_CROP",
      splashImmersive: true,
      splashFullScreen: true,
      splashShowOnlyFirstTime: false,
      androidSplashResourceName: "splash"
    },
    CapacitorHttp: {
      enabled: true
    },
    Haptics: {
      selectionStarted: true,
      impactLightStyle: true,
      notificationSuccess: true,
      notificationWarning: true,
      notificationError: true
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488558",
      sound: "beep.wav",
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
