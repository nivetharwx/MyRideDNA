import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';
import Navigation from './navigation';
import FCM, { NotificationActionType, NotificationType, FCMEvent, RemoteNotificationResult, WillPresentNotificationResult } from "react-native-fcm";
import { IS_ANDROID, DEVICE_TOKEN, PageKeys } from './constants';
import store from './store';
import { screenChangeAction, resetCurrentFriendAction } from './actions';
import { Actions } from 'react-native-router-flux';
import { Root } from "native-base";


// this shall be called regardless of app state: running, background or not running. Won't be called when app is killed by user in iOS
// FCM.on(FCMEvent.Notification, (notif) => {
//     console.log("FCM.on(FCMEvent.Notification): ", notif);
//     // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload
//     if (notif.local_notification) {
//         //this is a local notification

//         console.log('what i got from   local notif ', notif)
//     }


//     if (notif.opened_from_tray) {
//         //iOS: app is open/resumed because user clicked banner
//         //Android: app is open/resumed because user clicked banner or tapped app icon
//         console.log("FCM.on(FCMEvent.Notification) opened_from_tray");
//     }

// });

// FCM.on(FCMEvent.RefreshToken, (token) => {
//     console.log(token)
//     // fcm token may not be available on first load, catch it here
//     if (token) {
//         AsyncStorage.setItem(DEVICE_TOKEN, token);
//     }
// });
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
            console.log("InitialNotification received: ", notif);
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

        this.notificationListener = FCM.on(FCMEvent.Notification, (notification) => {
            if (notification.body) {
                console.log('body notification : ', JSON.parse(notification.body));
                JSON.parse(notification.body).reference.targetScreen && this.redirectToTargetScreen(JSON.parse(notification.body));
            }
        });

        FCM.getFCMToken().then(token => {
            console.log("TOKEN (getFCMToken)", token);
            if (token) {
                AsyncStorage.setItem(DEVICE_TOKEN, token);
            }
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

    redirectToTargetScreen(body) {
        if (store.getState().PageState.appState === 'background') {
            if (Object.keys(PageKeys).indexOf(body.reference.targetScreen) === -1) {
                if (body.reference.targetScreen === 'REQUESTS') {
                    store.getState().TabVisibility.currentScreen.name !== PageKeys.FRIENDS
                        ? store.dispatch(screenChangeAction({ name: PageKeys.FRIENDS, params: { comingFrom: PageKeys.NOTIFICATIONS, goTo: body.reference.targetScreen, notificationBody: body } }))
                        : Actions.refresh({ comingFrom: PageKeys.NOTIFICATIONS, goTo: body.reference.targetScreen, notificationBody: body });
                }
                return;
            }
            if (body.reference.targetScreen === "FRIENDS_PROFILE") {
                store.dispatch(resetCurrentFriendAction({comingFrom:PageKeys.NOTIFICATIONS}))
                store.dispatch(screenChangeAction({ name: PageKeys[body.reference.targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: body } }));
            }
            else{
                store.dispatch(screenChangeAction({ name: PageKeys[body.reference.targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: body } }));
            }
        }
    }

    componentWillUnmount() {
        this.notificationListener.remove();
    }

    render() {
        return (
            <Root>
                <Navigation />
            </Root>
        )
    }
}

