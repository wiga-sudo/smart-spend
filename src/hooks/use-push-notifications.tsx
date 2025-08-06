import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useToast } from './use-toast';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';

// Mock objects for web platform
const mockPushNotifications = {
  requestPermissions: () => Promise.resolve({ receive: 'denied' }),
  register: () => Promise.resolve(),
  addListener: () => ({ remove: () => {} }),
  removeAllListeners: () => Promise.resolve()
};

const mockLocalNotifications = {
  requestPermissions: () => Promise.resolve({ display: 'denied' }),
  schedule: () => Promise.resolve(),
  addListener: () => ({ remove: () => {} }),
  removeAllListeners: () => Promise.resolve()
};

export const usePushNotifications = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const initializePushNotifications = async () => {
      if (!user || !Capacitor.isNativePlatform()) return;

      // Dynamically import Capacitor plugins only on native platforms
      let PushNotifications, LocalNotifications;
      try {
        const pushModule = await import('@capacitor/push-notifications');
        const localModule = await import('@capacitor/local-notifications');
        PushNotifications = pushModule.PushNotifications;
        LocalNotifications = localModule.LocalNotifications;
      } catch (error) {
        console.log('Capacitor plugins not available, using mocks');
        return;
      }

      try {
        // Request permission for push notifications
        const permissionStatus = await PushNotifications.requestPermissions();
        
        if (permissionStatus.receive === 'granted') {
          // Register for push notifications
          await PushNotifications.register();
          
          // Listen for registration
          PushNotifications.addListener('registration', async (token) => {
            console.log('Push registration success, token: ' + token.value);
            
            // Save the token to user's profile
            try {
              await supabase
                .from('profiles')
                .update({ 
                  // Note: You may need to add push_token column to profiles table
                  // push_token: token.value 
                })
                .eq('user_id', user.id);
              console.log('Push token saved:', token.value);
            } catch (error) {
              console.error('Error saving push token:', error);
            }
          });

          // Listen for registration errors
          PushNotifications.addListener('registrationError', (error) => {
            console.error('Error on registration: ' + JSON.stringify(error));
            toast({
              title: 'Notification Setup Failed',
              description: 'Unable to setup push notifications',
              variant: 'destructive'
            });
          });

          // Listen for push notifications received while app is in foreground
          PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
            console.log('Push notification received: ' + JSON.stringify(notification));
            
            // Show local notification when app is in foreground
            LocalNotifications.schedule({
              notifications: [
                {
                  title: notification.title || 'SmartSpend',
                  body: notification.body || 'You have a new notification',
                  id: Date.now(),
                  schedule: { at: new Date(Date.now() + 1000) },
                  sound: 'beep.wav',
                  attachments: undefined,
                  actionTypeId: '',
                  extra: notification.data
                }
              ]
            });
          });

          // Listen for push notification actions (when user taps notification)
          PushNotifications.addListener('pushNotificationActionPerformed', (notification: any) => {
            console.log('Push notification action performed: ' + JSON.stringify(notification));
            
            // Handle notification action based on data
            const data = notification.notification.data;
            if (data?.route) {
              // Navigate to specific route if provided
              window.location.hash = data.route;
            }
            
            toast({
              title: notification.notification.title || 'Notification',
              description: notification.notification.body || 'Notification received',
            });
          });

          // Request local notification permissions
          await LocalNotifications.requestPermissions();
          
          // Listen for local notification actions
          LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
            console.log('Local notification action performed: ' + JSON.stringify(notification));
          });

        } else {
          console.log('Push notification permission not granted');
          toast({
            title: 'Notifications Disabled',
            description: 'Enable notifications in settings to receive updates',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
        toast({
          title: 'Notification Error',
          description: 'Failed to setup notifications',
          variant: 'destructive'
        });
      }
    };

    initializePushNotifications();

    // Cleanup listeners when component unmounts
    return () => {
      if (Capacitor.isNativePlatform()) {
        // Only cleanup if on native platform
        import('@capacitor/push-notifications').then(({ PushNotifications }) => {
          PushNotifications.removeAllListeners();
        }).catch(() => {
          console.log('Push notifications cleanup skipped');
        });
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
    if (!Capacitor.isNativePlatform()) return;

    let LocalNotifications;
    try {
      const localModule = await import('@capacitor/local-notifications');
      LocalNotifications = localModule.LocalNotifications;
    } catch (error) {
      console.log('Local notifications not available');
      return;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            schedule: scheduleTime ? { at: scheduleTime } : { at: new Date(Date.now() + 1000) },
            sound: 'beep.wav',
            attachments: undefined,
            actionTypeId: '',
            extra: {}
          }
        ]
      });
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  };

  return {
    scheduleLocalNotification
  };
};