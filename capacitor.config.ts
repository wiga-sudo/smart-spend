import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smartspend.app',
  appName: 'SmartSpend',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'https://avjdagipcmkvplwlonwo.supabase.co',
      'https://smartspend.app'
    ]
  },
  plugins: {
    App: {
      launchUrl: 'com.smartspend.app'
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav"
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999"
    },
    StatusBar: {
      style: "LIGHT_CONTENT",
      backgroundColor: "#3B82F6",
      overlaysWebView: false
    },
    Keyboard: {
      resize: "body",
      style: "dark",
      resizeOnFullScreen: true
    }
  }
};

export default config;