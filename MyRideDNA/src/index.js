import React, { Component } from 'react';
import Navigation from './navigation';
import FCM, { NotificationActionType, FCMEvent } from "react-native-fcm";
import { IS_ANDROID } from './constants';


// this shall be called regardless of app state: running, background or not running. Won't be called when app is killed by user in iOS
FCM.on(FCMEvent.Notification, (notif) => {

    console.log("notif: ", notif);
    // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload
    if (notif.local_notification) {
        //this is a local notification

        console.log('what i got from   local notif ', notif)
    }


    if (notif.opened_from_tray) {
        //iOS: app is open/resumed because user clicked banner
        //Android: app is open/resumed because user clicked banner or tapped app icon
    }

});

FCM.on(FCMEvent.RefreshToken, (token) => {
    console.log(token)
    // fcm token may not be available on first load, catch it here
});
export default class App extends Component {

    async componentDidMount() {
        //FCM.createNotificationChannel is mandatory for Android targeting >=8. Otherwise you won't see any notification
        FCM.createNotificationChannel({
            id: 'default',
            name: 'Default',
            description: 'used for example',
            priority: 'high'
        })
        FCM.getInitialNotification().then(notif => {
            console.log("Notification received: ", notif);
            if (notif) {
                console.log("Notification details: ", notif);
            }
        });

        try {
            let result = await FCM.requestPermissions({
                badge: false,
                sound: true,
                alert: true
            });
        } catch (e) {
            console.error(e);
        }

        FCM.on(FCMEvent.Notification, (notification) => {
            console.log("FCMEvent.Notification: ", notification);
        });

        FCM.getFCMToken().then(token => {
            console.log("TOKEN (getFCMToken)", token);
            this.setState({ token: token || "" });
        });

        if (!IS_ANDROID) {
            FCM.getAPNSToken().then(token => {
                console.log("APNS TOKEN (getFCMToken)", token);
            });
        }

        // topic example
        // FCM.subscribeToTopic('sometopic')
        // FCM.unsubscribeFromTopic('sometopic')
    }

    render() {
        return (
            <Navigation />
        )
    }
}