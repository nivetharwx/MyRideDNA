import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';
import Navigation from './navigation';
import firebase from 'react-native-firebase';
import { IS_ANDROID, DEVICE_TOKEN, PageKeys } from './constants';
import store from './store';
import { screenChangeAction, resetCurrentFriendAction, replaceChatMessagesAction, updateNotificationCountAction, updateMessageCountAction, updateChatListAction } from './actions';
import { Actions } from 'react-native-router-flux';
import { Root } from "native-base";
import { seenMessage } from './api';

export default class App extends Component {
    notificationListener = null;
    notificationOpenedListener = null;
    async componentDidMount() {
        const channel = new firebase.notifications.Android.Channel('default', 'Default', firebase.notifications.Android.Importance.Max)
            .setDescription('MyRideDNA default channel')
            .enableLights(true);
        firebase.notifications().android.createChannel(channel);

        const notificationOpen = await firebase.notifications().getInitialNotification();
        if (notificationOpen) {
            console.log("InitialNotification received: ", notificationOpen.notification);
        }

        if (!await firebase.messaging().hasPermission()) {
            try {
                await firebase.messaging().requestPermission();
            } catch (e) {
                alert("Failed to grant permission")
            }
        }

        this.notificationListener = firebase.notifications().onNotification(notification => {
            firebase.notifications().displayNotification(notification);
        });

        this.notificationOpenedListener = firebase.notifications().onNotificationOpened(this.onNotificationOpened);

        const token = await firebase.messaging().getToken();
        console.log("TOKEN - firebase.messaging().getToken()", token);
        if (token) {
            AsyncStorage.setItem(DEVICE_TOKEN, token);
        }

        // Didn't find anything specific to iOS on react-native-firebase
        // if (!IS_ANDROID) {
        //     FCM.getAPNSToken().then(token => {
        //         console.log("APNS TOKEN (getFCMToken)", token);
        //     });
        // }

        // topic example
        // firebase.messaging().subscribeToTopic('sometopic');
        // firebase.messaging().unsubscribeFromTopic('sometopic');
    }

    onNotificationOpened = async (notification) => {
        if (notification.body) {
            if (!notification.local_notification && JSON.parse(notification.body).reference && JSON.parse(notification.body).reference.targetScreen) {
                if (JSON.parse(notification.body).reference.targetScreen === "CHAT" && JSON.parse(notification.body).senderId !== store.getState().UserAuth.user.userId) {
                    console.log('JSON.parse(notification.body) : ', JSON.parse(notification.body))
                    if (store.getState().PageState.appState === 'background') {
                        this.showLocalNotification(notification)
                    }
                    else {
                        if (Actions.currentScene === "chatList") {
                            store.dispatch(updateMessageCountAction({ id: JSON.parse(notification.body).id }));
                        }
                        else {
                            store.dispatch(seenMessage(JSON.parse(notification.body).id, store.getState().UserAuth.user.userId, JSON.parse(notification.body).isGroup, PageKeys.NOTIFICATIONS));
                            store.dispatch(replaceChatMessagesAction({ comingFrom: PageKeys.NOTIFICATIONS, notificationBody: JSON.parse(notification.body) }));
                        }
                        store.dispatch(updateChatListAction({ comingFrom: 'sendMessgaeApi', newMessage: JSON.parse(notification.body), id: JSON.parse(notification.body).id }));
                    }
                }
                else {
                    if (!JSON.parse(notification.body).content) {
                        store.dispatch(updateNotificationCountAction())
                    }
                    this.redirectToTargetScreen(JSON.parse(notification.body));
                }
            }
            else {
                if (notification.my_custom_data && notification.my_custom_data.reference && notification.my_custom_data.reference.targetScreen && notification.my_custom_data.reference.targetScreen === 'CHAT') {
                    this.redirectToTargetScreen(notification.my_custom_data)
                }
                else {
                    if (Actions.currentScene === "chat") {
                        store.dispatch(replaceChatMessagesAction({ comingFrom: 'fcmDeletForEveryone', notificationBody: JSON.parse(notification.body) }));
                    }
                }
            }
        }
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
                store.dispatch(resetCurrentFriendAction({ comingFrom: PageKeys.NOTIFICATIONS }))
                store.dispatch(screenChangeAction({ name: PageKeys[body.reference.targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: body } }));
            }
            else if (body.reference.targetScreen === "CHAT") {
                console.log(Actions.prevState)
                if (store.getState().TabVisibility.currentScreen.name !== PageKeys.CHAT) {
                    console.log('other than CHAT')
                    if (Actions.prevState.routes[Actions.prevState.routes.length - 1].routeName === "chat" && (Actions.prevState.routes[Actions.prevState.routes.length - 2].routeName === "chatList" || Actions.prevState.routes[Actions.prevState.routes.length - 2].routeName === "friends")) {
                        console.log('other than CHAT if')
                        store.dispatch(replaceChatMessagesAction({ comingFrom: PageKeys.NOTIFICATIONS, notificationBody: body }));
                        Actions.refresh({ comingFrom: PageKeys.NOTIFICATIONS, chatInfo: body });
                    }
                    else {
                        console.log('other than CHAT else')
                        store.dispatch(screenChangeAction({ name: PageKeys[body.reference.targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, chatInfo: body } }));
                    }
                }
                else {
                    console.log("currentScreen.name is CHAT");
                    if (Actions.prevState.routes.length === 1 && Actions.prevState.routes[0].routeName === "map") {
                        console.log("currentScreen.name is CHAT if");
                        store.dispatch(screenChangeAction({ name: PageKeys[body.reference.targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, chatInfo: body } }));
                    }
                    else {
                        console.log("currentScreen.name is CHAT else");
                        store.dispatch(replaceChatMessagesAction({ comingFrom: PageKeys.NOTIFICATIONS, notificationBody: body }));
                        Actions.refresh({ comingFrom: PageKeys.NOTIFICATIONS, chatInfo: body });
                    }
                }
            }
            else {
                store.dispatch(screenChangeAction({ name: PageKeys[body.reference.targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: body } }));
            }
        }
    }

    showLocalNotification(notification) {
        console.log('notification local notification : ', JSON.parse(notification.body));
        var notificationBody = JSON.parse(notification.body);
        if (!notification.local_notification) {
            let notification = new firebase.notifications.Notification();
            notification = notification.setNotificationId(new Date().valueOf().toString())
                .setTitle(notificationBody.groupName || notificationBody.senderName)
                .setBody(notificationBody.content)
                .setSound("bell.mp3");
            // DOC: Android notification options
            notification.android.setPriority(firebase.notifications.Android.Priority.High);
            notification.android.setTicker("My Notification Ticker");
            notification.android.setAutoCancel(true);
            notification.android.setSmallIcon("@drawable/myridedna_notif_icon");
            notification.android.setBigText(notificationBody.content);
            notification.android.setColor("black");
            notification.android.setColorized(true);
            notification.android.setVibrate([300]);
            notification.android.set([300]);
            notification.android.setChannelId("default")

            // DOC: iOS notification options
            notification.ios.badge = 10;

            // Couldn't find matching options in react-native-firebase
            // FCM.presentLocalNotification({
            //     wake_screen: true,
            //     my_custom_data: notificationBody,
            //     show_in_foreground: true,
            // });

            firebase.notifications().displayNotification(notification)
        }
    }

    componentWillUnmount() {
        // TODO: Need to find removing listeners in react-native-firebase
        // this.notificationListener.remove();
    }

    render() {
        return (
            <Root>
                <Navigation />
            </Root>
        )
    }
}

