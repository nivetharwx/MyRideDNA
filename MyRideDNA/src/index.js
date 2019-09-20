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
    // removeNotificationListener = null;
    removeNotificationOpenedListener = null;
    removeNotificationDisplayedListener = null;
    async componentDidMount() {
        const channel = new firebase.notifications.Android.Channel('default', 'Default', firebase.notifications.Android.Importance.High)
            .setDescription('MyRideDNA default channel')
            .enableLights(true)
            .enableVibration(true)
            .setSound("bell.mp3");
        firebase.notifications().android.createChannel(channel);

        const notificationOpen = await firebase.notifications().getInitialNotification();
        if (notificationOpen) {
            console.log("InitialNotification received: ", notificationOpen.notification);
            // this.onNotificationOpened(notificationOpen.notification._data, true)
            // this.redirectToTargetScreen(JSON.parse(notificationOpen.notification._data.reference).targetScreen,notificationOpen.notification._data)
        }

        if (!await firebase.messaging().hasPermission()) {
            try {
                await firebase.messaging().requestPermission();
            } catch (e) {
                alert("Failed to grant permission")
            }
        }

        // this.removeNotificationListener = firebase.notifications().onNotification(notification => {
        //     console.log("From onNotification: ", notification);
        //     notification.android.setChannelId("default")
        //     notification.android.setAutoCancel(true);
        //     firebase.notifications().displayNotification(notification);
        // });
        this.messageListener = firebase.messaging().onMessage(notification => {
            console.log("From onMessage: ", notification);
            // for checking reference is present or not
            if (!notification._data.reference) return;
            // checking targetscreen in notification is chat 
            // then if current screen is chat and if you are on same chat then update content only else open local notification
            if (JSON.parse(notification._data.reference).targetScreen === "CHAT") {
                if (notification._data.senderId && notification._data.senderId === store.getState().UserAuth.user.userId) return;
                if (Actions.currentScene === PageKeys.CHAT) {
                    if (store.getState().ChatList.chatData.id === notification._data.id) {
                        this.updatePageContent(JSON.parse(notification._data.reference).targetScreen, notification._data)
                        return;
                    }
                }
                notification._data['isGroup'] = JSON.parse(notification._data.isGroup)
                this.showLocalNotification(notification._data);
                return;
            }
            // checking targetscreen in notification is Request
            // if user current screen is friends then just updated content else open local notification
            if (JSON.parse(notification._data.reference).targetScreen === 'REQUESTS') {
                if (Actions.currentScene === PageKeys.FRIENDS) {
                    this.updatePageContent(JSON.parse(notification._data.reference).targetScreen, notification._data)
                }
                else {
                    store.dispatch(updateNotificationCountAction())
                    this.showLocalNotification(notification._data);
                }
                return;
            }
            // if target screen is not same as above two then open local notification 
            if (JSON.parse(notification._data.reference).targetScreen !== Actions.currentScene) {
                store.dispatch(updateNotificationCountAction())
                this.showLocalNotification(notification._data);
                // if platform is ios then updatepage content here only because onNotificationDisplayed will not be called
                if (!IS_ANDROID) {
                    this.updatePageContent(JSON.parse(notification._data.reference).targetScreen, notification._data)
                }
                return;
            }



        });
        this.removeNotificationDisplayedListener = firebase.notifications().onNotificationDisplayed(notification => {
            console.log('from onNotificationDisplayed :', notification);
            if (IS_ANDROID) {
                this.updatePageContent(JSON.parse(notification._data.reference).targetScreen, notification._data)
            }
        });

        this.removeNotificationOpenedListener = firebase.notifications().onNotificationOpened(({ notification }) => {
            console.log('removeNotificationOpenedListener : ', notification);
            if (notification._data.reference) {
                // if user is background and notification comes, user click on notification to get redirect to screen mentioned in target screen 
                this.redirectToTargetScreen(JSON.parse(notification._data.reference).targetScreen, notification._data)
            }
        });

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

    onNotificationOpened = async (notifBody) => {
        console.log("From onNotificationOpened: ", notifBody);
        if (notifBody) {
            if (notifBody.reference) {
                notifBody.reference = JSON.parse(notifBody.reference);
                // if (notifBody.reference.targetScreen === "CHAT" && notifBody.senderId !== store.getState().UserAuth.user.userId) {
                //     if (store.getState().PageState.appState === 'background') {
                //         this.redirectToTargetScreen(notifBody)
                //         return;
                //     }
                //     if (Actions.currentScene === "chatList") {
                //         store.dispatch(updateMessageCountAction({ id: notifBody.id }));
                //     }
                //     else {
                //         store.dispatch(seenMessage(notifBody.id, store.getState().UserAuth.user.userId, notifBody.isGroup, PageKeys.NOTIFICATIONS));
                //         store.dispatch(replaceChatMessagesAction({ comingFrom: PageKeys.NOTIFICATIONS, notificationBody: notifBody }));
                //     }
                //     store.dispatch(updateChatListAction({ comingFrom: 'sendMessgaeApi', newMessage: notifBody, id: notifBody.id }));
                // }
                // else {
                //     console.log('else part of not chat target screen')
                //     if (!notifBody.content) {
                //         store.dispatch(updateNotificationCountAction())
                //     }
                //     this.redirectToTargetScreen(notifBody);
                // }
            }
            // else {
            //     if (notification.my_custom_data && notification.my_custom_data.reference && notification.my_custom_data.reference.targetScreen && notification.my_custom_data.reference.targetScreen === 'CHAT') {
            //         this.redirectToTargetScreen(notification.my_custom_data)
            //     }
            //     else {
            //         if (Actions.currentScene === "chat") {
            //             store.dispatch(replaceChatMessagesAction({ comingFrom: 'fcmDeletForEveryone', notificationBody: notifBody }));
            //         }
            //     }
            // }
        }
    }

    updatePageContent = (targetScreen, notifBody) => {
        console.log('store.getState().TabVisibility.currentScreen.name : ', store.getState().TabVisibility.currentScreen.name)
        //  checking target screen as chat and message is not send by you
        //  if user is on chat then update chatmessage redux and call seenMessage api 
        if (targetScreen === "CHAT") {
            if (Actions.currentScene === PageKeys.CHAT) {
                if (notifBody.senderId && notifBody.senderId !== store.getState().UserAuth.user.userId) {
                    store.dispatch(seenMessage(notifBody.id, store.getState().UserAuth.user.userId, notifBody.isGroup, PageKeys.NOTIFICATIONS));
                    store.dispatch(replaceChatMessagesAction({ comingFrom: PageKeys.NOTIFICATIONS, notificationBody: notifBody }));
                    store.dispatch(updateChatListAction({ comingFrom: PageKeys.NOTIFICATIONS, newMessage: notifBody, id: notifBody.id }));
                }
                else if (notifBody.messageIdList) {
                    store.dispatch(replaceChatMessagesAction({ comingFrom: 'fcmDeletForEveryone', notificationBody: notifBody }));
                }
            }
            // if user is on chatlist page then update chatList count and chatlist last message
            else if (Actions.currentScene === PageKeys.CHAT_LIST) {
                store.dispatch(updateMessageCountAction({ id: notifBody.id }));
                store.dispatch(updateChatListAction({ comingFrom: PageKeys.NOTIFICATIONS, newMessage: notifBody, id: notifBody.id }));
            }
            return;
        }
        // if user is on request tab then refresh the page to call all api related to request
        if (targetScreen === "REQUESTS" && Actions.currentScene === PageKeys.FRIENDS) {
            console.log('actions.refresh');
            Actions.refresh({ comingFrom: PageKeys.NOTIFICATIONS, goTo: targetScreen, notificationBody: notifBody, isRefresh: false });
        }
        if (targetScreen === Actions.currentScene) {
            Actions.refresh();
        }

        // if (body.reference.targetScreen === "CHAT") {
        //     if (store.getState().TabVisibility.currentScreen.name !== PageKeys.CHAT) {
        //         console.log('other than CHAT')
        //         if (Actions.prevState.routes[Actions.prevState.routes.length - 1].routeName === "chat" && (Actions.prevState.routes[Actions.prevState.routes.length - 2].routeName === "chatList" || Actions.prevState.routes[Actions.prevState.routes.length - 2].routeName === "friends")) {
        //             console.log('other than CHAT if')
        //             store.dispatch(replaceChatMessagesAction({ comingFrom: PageKeys.NOTIFICATIONS, notificationBody: body }));
        //             Actions.refresh({ comingFrom: PageKeys.NOTIFICATIONS, chatInfo: body });
        //         }
        //         else {
        //             console.log('other than CHAT else')
        //             // store.dispatch(screenChangeAction({ name: PageKeys[body.reference.targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, chatInfo: body } }));
        //         }
        //     }
        //     else {
        //         console.log("currentScreen.name is CHAT");
        //         if (Actions.prevState.routes.length === 1 && Actions.prevState.routes[0].routeName === "map") {
        //             console.log("currentScreen.name is CHAT if");
        //             store.dispatch(screenChangeAction({ name: PageKeys[body.reference.targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, chatInfo: body } }));
        //         }
        //         else {
        //             console.log("currentScreen.name is CHAT else");
        //             store.dispatch(replaceChatMessagesAction({ comingFrom: PageKeys.NOTIFICATIONS, notificationBody: body }));
        //             Actions.refresh({ comingFrom: PageKeys.NOTIFICATIONS, chatInfo: body });
        //         }
        //     }
        // }  
    }

    redirectToTargetScreen(targetScreen, notifData) {
        if (Object.keys(PageKeys).indexOf(targetScreen) === -1) {
            if (targetScreen === 'REQUESTS') {
                Actions.currentScene !== PageKeys.FRIENDS
                    ? store.dispatch(screenChangeAction({ name: PageKeys.FRIENDS, params: { comingFrom: PageKeys.NOTIFICATIONS, goTo: targetScreen, notificationBody: notifData } }))
                    : Actions.refresh({ comingFrom: PageKeys.NOTIFICATIONS, goTo: targetScreen, notificationBody: notifData, isRefresh: true });
            }
            return;
        }

        if (targetScreen === "FRIENDS_PROFILE") {
            store.dispatch(resetCurrentFriendAction({ comingFrom: PageKeys.NOTIFICATIONS }))
            store.dispatch(screenChangeAction({ name: PageKeys[targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: notifData } }));
        }
        else if (targetScreen === "CHAT") {
            notifData['isGroup'] = JSON.parse(notifData.isGroup);
            console.log('notifData redirectScreen : ', notifData)
            //  if user is chatiing with one person and message came for another person then moving to another person chat
            Actions.currentScene === PageKeys.CHAT
                ? Actions.refresh({ comingFrom: PageKeys.NOTIFICATIONS, goTo: targetScreen, chatInfo: notifData })
                : store.dispatch(screenChangeAction({ name: PageKeys[targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, chatInfo: notifData } }));
        }
        else {
            store.dispatch(screenChangeAction({ name: PageKeys[targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: notifData } }));
        }

    }

    showLocalNotification(notificationBody) {
        console.log('notification local notification : ', notificationBody);
        let notification = new firebase.notifications.Notification();
        notification = notification.setNotificationId(new Date().valueOf().toString())
            .setTitle(notificationBody.name)
            .setBody(notificationBody.content)
            .setData(notificationBody)
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

    componentWillUnmount() {
        // this.removeNotificationListener();
        this.removeNotificationOpenedListener();
        this.removeNotificationDisplayedListener();
        this.messageListener();
    }

    render() {
        return (
            <Root>
                <Navigation />
            </Root>
        )
    }
}

