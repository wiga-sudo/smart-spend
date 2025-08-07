import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useToast } from './use-toast';
import { useAuth } from './use-auth';

// Mock object for web platform
const mockLocalNotifications = {
  requestPermissions: () => Promise.resolve({ display: 'denied' }),
  schedule: () => Promise.resolve(),
  addListener: () => ({ remove: () => {} }),
  removeAllListeners: () => Promise.resolve()
};

export const useLocalNotifications = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const initializeLocalNotifications = async () => {
      if (!user || !Capacitor.isNativePlatform()) return;

      // Dynamically import Capacitor plugins only on native platforms
      let LocalNotifications;
      try {
        const localModule = await import('@capacitor/local-notifications');
        LocalNotifications = localModule.LocalNotifications;
      } catch (error) {
        console.log('Local notifications not available, using mock');
        return;
      }

      try {
        // Request permission for local notifications
        const permissionStatus = await LocalNotifications.requestPermissions();
        
        if (permissionStatus.display === 'granted') {
          console.log('Local notification permission granted');
          
          // Listen for local notification actions
          LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
            console.log('Local notification action performed: ' + JSON.stringify(notification));
            
            // Handle notification action based on data
            const data = notification.notification.extra;
            if (data?.route) {
              // Navigate to specific route if provided
              window.location.hash = data.route;
            }
            
            toast({
              title: notification.notification.title || 'Notification',
              description: notification.notification.body || 'Notification received',
            });
          });

          // Listen for notification received (when app is in foreground)
          LocalNotifications.addListener('localNotificationReceived', (notification) => {
            console.log('Local notification received: ' + JSON.stringify(notification));
          });

        } else {
          console.log('Local notification permission not granted');
          toast({
            title: 'Notifications Disabled',
            description: 'Enable notifications in settings to receive budget alerts',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error initializing local notifications:', error);
        toast({
          title: 'Notification Error',
          description: 'Failed to setup notifications',
          variant: 'destructive'
        });
      }
    };

    initializeLocalNotifications();

    // Cleanup listeners when component unmounts
    return () => {
      if (Capacitor.isNativePlatform()) {
        // Only cleanup if on native platform
        import('@capacitor/local-notifications').then(({ LocalNotifications }) => {
          LocalNotifications.removeAllListeners();
        }).catch(() => {
          console.log('Local notifications cleanup skipped');
        });
      }
    };
  }, [user, toast]);

  // Function to schedule local notifications for budget alerts
  const scheduleLocalNotification = async (title: string, body: string, scheduleTime?: Date) => {
    if (!Capacitor.isNativePlatform()) {
      // For web, show toast instead
      toast({
        title,
        description: body,
      });
      return;
    }

    let LocalNotifications;
    try {
      const localModule = await import('@capacitor/local-notifications');
      LocalNotifications = localModule.LocalNotifications;
    } catch (error) {
      console.log('Local notifications not available');
      return;
    }

    try {
      const notificationTime = scheduleTime || new Date(Date.now() + 1000);
      
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            schedule: { at: notificationTime },
            sound: 'beep.wav',
            attachments: undefined,
            actionTypeId: '',
            extra: {
              timestamp: Date.now()
            }
          }
        ]
      });
      
      console.log('Local notification scheduled:', title);
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      // Fallback to toast on error
      toast({
        title,
        description: body,
      });
    }
  };

  return {
    scheduleLocalNotification
  };
};

// Export with old name for backward compatibility
export const usePushNotifications = useLocalNotifications;