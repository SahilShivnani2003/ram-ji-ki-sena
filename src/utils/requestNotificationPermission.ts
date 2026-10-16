import { PermissionsAndroid, Platform } from 'react-native';
// import messaging from '@react-native-firebase/messaging';
import {
      getMessaging,
      requestPermission,
      AuthorizationStatus,
} from '@react-native-firebase/messaging';

export default async function requestNotificationPermission(): Promise<boolean> {
      try {
            let enabled = false;

            if (Platform.OS === 'android') {
                  if (Platform.Version >= 33) {
                        const grant = await PermissionsAndroid.request(
                              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                        );

                        if (grant === PermissionsAndroid.RESULTS.GRANTED) {
                              const messagingInstance = getMessaging();
                              const authStatus = await requestPermission(messagingInstance,);
                              // const authStatus = await messaging().requestPermission();
                              enabled =
                                    authStatus === AuthorizationStatus.AUTHORIZED ||
                                    authStatus === AuthorizationStatus.PROVISIONAL;
                        } else {
                              return false;
                        }
                  } else {
                        // Android < 13 (auto granted)
                        const messagingInstance = getMessaging();
                        const authStatus = await requestPermission(messagingInstance,);
                        // const authStatus = await messaging().requestPermission();
                        enabled =
                              authStatus === AuthorizationStatus.AUTHORIZED ||
                              authStatus === AuthorizationStatus.PROVISIONAL;
                  }
            } else if (Platform.OS === 'ios') {
                  const messagingInstance = getMessaging();
                  const authStatus = await requestPermission(messagingInstance,);
                  // const authStatus = await messaging().requestPermission();
                  enabled =
                        authStatus === AuthorizationStatus.AUTHORIZED ||
                        authStatus === AuthorizationStatus.PROVISIONAL;
            }

            return enabled;
      } catch (error) {
            console.log('Notification Permission Error:', error);
            return false;
      }
}