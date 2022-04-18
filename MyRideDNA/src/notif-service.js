import PushNotification from 'react-native-push-notification';
import NotificationHandler from './notification-handler';

export default class NotifService {
    constructor(onNotification) {
        NotificationHandler.attachNotification(onNotification);
    }

    showLocalNotification(notificationBody) {
        PushNotification.localNotification({
            title: notificationBody.name,
            message: notificationBody.content,
            userInfo: notificationBody,
            playSound: true,
            vibrate: true,
            vibration: 300,
            soundName: "default"
        })
    }

    checkPermission(cbk) {
        return PushNotification.checkPermissions(cbk);
    }

    requestPermissions() {
        return PushNotification.requestPermissions();
    }
}