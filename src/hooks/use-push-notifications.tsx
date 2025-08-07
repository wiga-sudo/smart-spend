import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { useToast } from './use-toast';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';

export const usePushNotifications = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const initializePushNotifications = async () => {
      if (!user) return;

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
            // TODO: Uncomment once push_token column is available in types
            try {
              // await supabase
              //   .from('profiles')
              //   .update({ push_token: token.value })
              //   .eq('user_id', user.id);
              console.log('Push token received:', token.value);
            } catch (error) {
              console.error('Error saving push token:', error);
            }
          });

          // Listen for registration errors
          PushNotifications.addListener('registrationError', (error) => {
            console.error('Error on registration: ' + JSON.stringify(error));
          });

          // Listen for push notifications received
          PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push notification received: ' + JSON.stringify(notification));
            
            toast({
              title: notification.title || 'Notification',
              description: notification.body || 'You have a new notification',
            });
          });

          // Listen for push notification actions
          PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('Push notification action performed: ' + JSON.stringify(notification));
            
            // Handle notification action (e.g., navigate to specific screen)
            // You can implement navigation logic here
          });
        } else {
          console.log('Push notification permission not granted');
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };

    initializePushNotifications();

    // Cleanup listeners when component unmounts
    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [user, toast]);

  return {
    // You can return functions to manually trigger actions if needed
  };
};