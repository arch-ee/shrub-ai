import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.archie.shrubAI',
  appName: 'shrubAI',
  webDir: 'android/app/src/main/assets/public',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      signingType: undefined
    },
    // Lock orientation to portrait
    orientation: 'portrait'
  },
  ios: {
    // Lock orientation to portrait
    orientation: 'portrait'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#f8fafc",
      androidScaleType: "CENTER_CROP",
      splashImmersive: true,
      splashFullScreen: true,
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#5AB04B",
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
      iconColor: "#5AB04B",
      sound: "beep.wav"
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#f8fafc"
    },
    Keyboard: {
      resize: "body",
      style: "DARK",
      resizeOnFullScreen: true
    },
    Camera: {
      permissions: {
        camera: "This app needs access to camera to take photos of plants for identification."
      }
    }
  }
};

export default config;