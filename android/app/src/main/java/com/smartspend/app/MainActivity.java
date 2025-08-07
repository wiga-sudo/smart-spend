package com.smartspend.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import java.util.ArrayList;

// Local Notifications
import com.capacitorjs.plugins.localnotifications.LocalNotificationsPlugin;
// Status Bar
import com.capacitorjs.plugins.statusbar.StatusBarPlugin;
// Splash Screen
import com.capacitorjs.plugins.splashscreen.SplashScreenPlugin;
// App
import com.capacitorjs.plugins.app.AppPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initializes the Bridge
        this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
            // Additional plugins you've installed go here
            add(LocalNotificationsPlugin.class);
            add(StatusBarPlugin.class);
            add(SplashScreenPlugin.class);
            add(AppPlugin.class);
        }});
    }
}