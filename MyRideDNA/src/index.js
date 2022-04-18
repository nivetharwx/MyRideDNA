import React, { Component } from 'react';
import Navigation from './navigation';
import { IS_ANDROID, PageKeys, CHAT_CONTENT_TYPE, NOTIFICATION_TYPE, RIDE_TYPE } from './constants';
import store from './store';
import {
    screenChangeAction, replaceChatMessagesAction, updateNotificationCountAction, updateMessageCountAction,
    updateChatListAction, resetPersonProfileAction, setCurrentFriendAction, updateLikeAndCommentAction,
    updateRideLikeAndCommentAction, updateCurrentBikeLikeAndCommentCountAction, replaceFriendListAction, updateRidePictureInListAction,
    decreaseNotificationCountAction
} from './actions';
import { Actions } from 'react-native-router-flux';
import  {Root}  from "native-base";
import { getAllNotifications, readNotification, seenMessage } from './api';
import axios from 'axios';
import messaging, { firebase } from '@react-native-firebase/messaging';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import NotifService from './notif-service';
import { Provider } from 'react-redux';

console.disableYellowBox = true;

Promise.allSettled = (promises) => {
    let mappedPromises = promises.map((p) => {
        return Promise.resolve(p)
            .then((value) => {
                return {
                    status: 'fulfilled',
                    value
                };
            })
            .catch((reason) => {
                return {
                    status: 'rejected',
                    reason
                };
            });
    });
    return Promise.all(mappedPromises);
};

export default class App extends Component {
    
    constructor() {
        super();
        this.notifService = new NotifService(this.onNotification.bind(this))
    }

    async componentDidMount() {

        console.log(IS_ANDROID)
        if (!IS_ANDROID) {
            PushNotificationIOS.requestPermissions().then(
                (data) => {
                    console.log('PushNotificationIOS.requestPermissions', data);
                },
                (data) => {
                    console.log('PushNotificationIOS.requestPermissions failed', data);
                },
            );
        }
        
        console.log('\n\n\n getFcm Token : ', await messaging().getToken());
        
        if (IS_ANDROID === false) {
            PushNotificationIOS.addEventListener('localNotification', this.onOpenIOSNotification);
            // listener to get notification in background for IOS
            firebase.messaging().setBackgroundMessageHandler((notification) => {
                console.log('\n\n\nsetBackgroundMessageHandler : ', notification)
                if(JSON.parse(notification.data.reference).targetScreen === "CHAT" && store.getState().ChatList.chatMessages.length>0){
                    console.log(store.getState().ChatList.chatMessages.some(item=>item.messageId === notification.data.messageId))
                    if(store.getState().ChatList.chatMessages.some(item=>item.messageId === notification.data.messageId)){
                        return;
                    }
                }    
                this.handleNotification(this.parseNotificationData(notification), true)          
            })
            console.log('listener to get notification in foreground for IOS')
            // listener to get notification in foreground for IOS
            firebase.messaging().onMessage(notification => {
                console.log('\n\n\nmessage : ', notification)
                if(JSON.parse(notification.data.reference).targetScreen === "CHAT" && store.getState().ChatList.chatMessages.length>0){
                    if(store.getState().ChatList.chatMessages.some(item=>item.messageId === notification.data.messageId)){
                        return;
                    }
                }
                    this.handleNotification(this.parseNotificationData(notification))
            })
        }
    }

     parseNotificationData = (notification) => {
        return { ...notification.data, reference: JSON.parse(notification.data.reference) }
    }

    onNotification = (notification) => {
        if (!IS_ANDROID) return;
        console.log('onNotification : ', notification);
        // axios.post(`https://beta.api.myridedna.com/users/`, { onNotification: notification, platform: `${IS_ANDROID ? 'ANDROID' : 'IOS'}` }, { timeout: 15000 });
        if (notification.userInteraction) {
            console.log('Entered to the notification on user interaction',notification.data.isBgMessaging)
            if (notification.data.isBgMessaging) return;
            let notificationData = notification.data;
            if (typeof notification.data.reference === "string") {
                notificationData = { ...notification.data, reference: JSON.parse(notification.data.reference) }
            }
            this.redirectToTargetScreen(notificationData);
        } else {
            this.handleNotification(this.parseNotificationData(notification));
        }
    }

    // DOC: Strictly for IOS (Calls when user taps on notification)
    onOpenIOSNotification = (notification) => {
        console.log('on open ios notification called')
        if (typeof notification._data.reference === 'string') {
            notification._data.reference = JSON.parse(notification._data.reference);
        }
       
            this.redirectToTargetScreen(notification._data);
       
        notification.finish(PushNotificationIOS.FetchResult.NoData);
    }

    showLocalNotification(notificationBody) {
        if (IS_ANDROID) {
            this.notifService.showLocalNotification(notificationBody)
        } else {
            if (store.getState().PageState.appState === 'foreground') {
                console.log("PushNotificationIOS.presentLocalNotification");
                PushNotificationIOS.presentLocalNotification({
                    alertTitle: notificationBody.name,
                    alertAction: 'view',
                    alertBody: notificationBody.content,
                    userInfo: notificationBody,
                    isSilent: false,
                    soundName: 'default',
                     
                });
            }
        }
    }

    async requestUserPermission() {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Authorization status:', authStatus);
        }
    }

    handleNotification = (notificationData, skipLocalNotification) => {
        // for checking reference is present or not
        if (!notificationData) return;
        let notificationList=store.getState().NotificationList.notificationList.notification
        let notificationIndex=notificationList.findIndex((value)=>{
            console.log(value.id,notificationData.id)
            return value.id==notificationData.id
        })
        console.log(notificationIndex,'//// notificationIndex')
        const targetScreen = notificationData.reference.targetScreen;
        console.log('\n\n\n notification data recieved  ' + JSON.stringify(notificationData))
        // checking targetscreen in notification is chat 
        // then if current screen is chat and if you are on same chat then update content only else open local notification
        if (targetScreen === "CHAT") {
            const { user } = store.getState().UserAuth;
            console.log('\n\n\n chat data recieved ' + JSON.stringify(store.getState()))
            if (user && notificationData.senderId === user.userId) return;
            if (Actions.currentScene === PageKeys.CHAT) {
                console.log(notificationData,store.getState().ChatList.chatData.id, notificationData.id,'////// notificationData //////')
                if (store.getState().ChatList.chatData.id === notificationData.id) {
                    this.updatePageContent(notificationData)
                    return;
                }
                else{
                    this.updatePageContent(notificationData)
                    // store.dispatch(updateMessageCountAction({ isUpdateCount: true,id:notificationData.id }));
                }
            }
            else if (Actions.currentScene === PageKeys.CHAT_LIST) {
                this.updatePageContent(notificationData)
            }
            else {
                if(notificationData.messageIdList && JSON.parse(notificationData.messageIdList).length>0) return;
                store.dispatch(updateMessageCountAction({ isUpdateCount: true }));
            }
            notificationData['isGroup'] = JSON.parse(notificationData.isGroup)
            console.log('///condition',!notificationData.messageIdList && !skipLocalNotification)
            if(!notificationData.messageIdList && !skipLocalNotification) this.showLocalNotification(this.getChatMessageType(notificationData));
            return;
        }
        // checking targetscreen in notification is Request
        // if user current screen is friends then just updated content else open local notification
        if (targetScreen === 'REQUESTS') {
            if (Actions.currentScene === PageKeys.NOTIFICATIONS) {
                this.updatePageContent(notificationData)
            }
            else {
                notificationIndex==-1&&store.dispatch(updateNotificationCountAction(notificationData))
                notificationIndex==-1&&!skipLocalNotification && this.showLocalNotification(notificationData);
            }
            return;
        }

        if (targetScreen === "POST_DETAIL" || targetScreen === "RIDE_DETAILS"){
            if ( Actions.currentScene === PageKeys.COMMENTS){
                this.updatePageContent(notificationData)
            }
            else if(Actions.currentScene === PageKeys.JOURNAL || Actions.currentScene === PageKeys.RIDES){
                if(notificationData.notifiedUserId === store.getState().UserAuth.user.userId){
                !skipLocalNotification && this.showLocalNotification(notificationData);
                }
            }
            else if(notificationData.notifiedUserId === store.getState().UserAuth.user.userId){
                notificationIndex==-1&&Actions.currentScene!==PageKeys.NOTIFICATIONS&&store.dispatch(updateNotificationCountAction(notificationData))
                notificationIndex==-1&&!skipLocalNotification && this.showLocalNotification(notificationData);
            }
            return;
        }

        if(targetScreen === 'SHARED_RIDE'){
            if(Actions.currentScene === PageKeys.RIDES){
                console.log('\n\n\n Coming in Actions.currentScene === PageKeys.RIDES : ', IS_ANDROID)
                this.updatePageContent(notificationData)
            }
            return;
        }

        if(targetScreen === 'FRIENDS_PROFILE'){
            console.log('entered in friends profile')
            if(Actions.currentScene === PageKeys.FRIENDS){
                store.dispatch(replaceFriendListAction({ comingFrom: PageKeys.NOTIFICATIONS, newFriendData: notificationData.reference.data}));
            }
            notificationIndex==-1&&store.dispatch(updateNotificationCountAction(notificationData))
            notificationIndex==-1&&!skipLocalNotification && this.showLocalNotification(notificationData);
            return;
        }
        console.log(targetScreen , Actions.currentScene,'//// screen printed')
        // if target screen is not same as above two then open local notification 
        if (targetScreen !== Actions.currentScene) {
            console.log('\n\n\n targetScreen !== Actions.currentScene : ', IS_ANDROID)
            notificationIndex==-1&&store.dispatch(updateNotificationCountAction(notificationData))
            notificationIndex==-1&&!skipLocalNotification && this.showLocalNotification(notificationData);
            return;
        }
    }


    updatePageContent = (notificationData) => {
        const targetScreen = notificationData.reference.targetScreen;
        console.log('\n\n\n notificationData : ', notificationData, IS_ANDROID,Actions.currentScene)
        //  checking target screen as chat and message is not send by you
        //  if user is on chat then update chatmessage redux and call seenMessage api 
        if (targetScreen === "CHAT") {
            if (Actions.currentScene === PageKeys.CHAT) {
                if (notificationData.senderId && notificationData.senderId !== store.getState().UserAuth.user.userId ) {
                    console.log('entered chat update',notificationData)
                    notificationData.id == store.getState().ChatList.chatData.id && store.dispatch(seenMessage(notificationData.id, store.getState().UserAuth.user.userId, notificationData.isGroup, PageKeys.NOTIFICATIONS));
                    notificationData.id == store.getState().ChatList.chatData.id && store.dispatch(replaceChatMessagesAction({ comingFrom: PageKeys.NOTIFICATIONS, notificationBody: notificationData }));
                    notificationData.id !== store.getState().ChatList.chatData.id && store.dispatch(updateMessageCountAction({ id: notificationData.id }));
                    store.dispatch(updateChatListAction({ comingFrom: PageKeys.NOTIFICATIONS, messageBody: notificationData, id: notificationData.id }));
                }
                else if (notificationData.messageIdList) {
                    store.dispatch(replaceChatMessagesAction({ comingFrom: 'fcmDeletForEveryone', notificationBody: notificationData }));
                }
            }
            // if user is on chatlist page then update chatList count and chatlist last message
            else if (Actions.currentScene === PageKeys.CHAT_LIST) {
                if (notificationData.messageIdList) {
                    store.dispatch(replaceChatMessagesAction({ comingFrom: 'fcmDeletForEveryone', notificationBody: notificationData }));
                }
                else {
                    console.log('\n\n\n coming here else ')
                    store.dispatch(updateMessageCountAction({ id: notificationData.id }));
                    store.dispatch(updateChatListAction({ comingFrom: PageKeys.NOTIFICATIONS, messageBody: notificationData, id: notificationData.id }));
                }
            }
            return;
        }
        // if user is on request tab then refresh the page to call all api related to request
        if (targetScreen === "REQUESTS" && Actions.currentScene === PageKeys.NOTIFICATIONS) {
            Actions.refresh({ comingFrom: PageKeys.NOTIFICATIONS, goTo: targetScreen, notificationBody: notificationData, isRefresh: true });
            return;
        }
        if (targetScreen === "POST_DETAIL") {
            console.log('entered into the commented area /////')
            if(notificationData.notificationType === NOTIFICATION_TYPE.COMMENT){
                Actions.refresh({notificationData : notificationData.reference.data, comingFrom:PageKeys.NOTIFICATIONS})
            }
            else{
                store.dispatch(updateLikeAndCommentAction({ isUpdateLike: notificationData.notificationType === NOTIFICATION_TYPE.LIKE ? true : false, id: notificationData.reference.tragetId, isAdded: true }));
            }
            return;
        }
        if (targetScreen === "RIDE_DETAILS") {
            if(notificationData.notificationType === NOTIFICATION_TYPE.COMMENT){
                Actions.refresh({notificationData : notificationData.reference.data, comingFrom:PageKeys.NOTIFICATIONS})
            }
            else{
                store.dispatch(updateRideLikeAndCommentAction({ isUpdateLike: notificationData.notificationType === NOTIFICATION_TYPE.LIKE ? true : false, rideId: notificationData.reference.tragetId, isAdded: true, rideType: notificationData.reference.isRecorded ? RIDE_TYPE.RECORD_RIDE : RIDE_TYPE.BUILD_RIDE }));
                store.dispatch(updateCurrentBikeLikeAndCommentCountAction({ isUpdateLike: notificationData.notificationType === NOTIFICATION_TYPE.LIKE ? true : false, rideId: notificationData.reference.tragetId, isAdded: true }));
            }
            return;
        }

        if(targetScreen === 'SHARED_RIDE'){
            store.dispatch(updateRidePictureInListAction({rideType:RIDE_TYPE.SHARED_RIDE,rideId:notificationData.reference.targetId, snapshotId: notificationData.reference.data.snapshotId})); 
        }

        if (targetScreen === Actions.currentScene) {
            Actions.refresh();
        }
    }

    redirectToTargetScreen(notificationData) {
        console.log('\n\n\n redirectToTargetScreen : ', notificationData)
       
        const targetScreen = notificationData.reference.targetScreen;
        console.log(targetScreen)
        if (Object.keys(PageKeys).indexOf(targetScreen) === -1) {
            if (targetScreen === 'REQUESTS') {
                store.dispatch(screenChangeAction({ name: PageKeys.NOTIFICATIONS, params: { comingFrom: PageKeys.NOTIFICATIONS, goTo: targetScreen, notificationBody: notificationData } }))
                // store.dispatch(readNotification(notificationData.notifiedUserId,notificationData.id))
            }
            return;
        }

        if (targetScreen === "FRIENDS_PROFILE") {
            store.dispatch(resetPersonProfileAction({ comingFrom: PageKeys.NOTIFICATIONS }))
            store.dispatch(setCurrentFriendAction({ userId: notificationData.fromUserId }))
            store.dispatch(screenChangeAction({ name: PageKeys[targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: notificationData } }));
        }
        else if (targetScreen === "CHAT") {
            if(JSON.parse(notificationData.isGroup) === 0 || JSON.parse(notificationData.isGroup) === false){
                notificationData['isGroup'] = false;
            }
            else{
                notificationData['isGroup'] = true;
            }

            console.log('\n\n\n notificationData : ', notificationData)
            
            //  if user is chatiing with one person and message came for another person then moving to another person chat
            Actions.currentScene === PageKeys.CHAT
                ? Actions.refresh({ comingFrom: PageKeys.NOTIFICATIONS, goTo: targetScreen, chatInfo: notificationData })
                : store.dispatch(screenChangeAction({ name: PageKeys[targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, chatInfo: notificationData } }));
        }
        else if (targetScreen === "POST_DETAIL") {
            console.log('inside post details')
            if(notificationData.notificationType === NOTIFICATION_TYPE.COMMENT || notificationData.notificationType === NOTIFICATION_TYPE.LIKE){
                // store.dispatch(screenChangeAction({ name: notificationData.notificationType === NOTIFICATION_TYPE.COMMENT?PageKeys.COMMENTS:PageKeys.LIKES, params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: notificationData, isEditable: true } }));
                store.dispatch(screenChangeAction({ name: PageKeys.POST_DETAIL, params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: notificationData, isEditable: true } }));
            }
            else{
                store.dispatch(screenChangeAction({ name: PageKeys[targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: notificationData, isEditable: true } }));
            }
        }

        else if (targetScreen === "RIDE_DETAILS") {
            if(notificationData.notificationType === NOTIFICATION_TYPE.COMMENT|| notificationData.notificationType === NOTIFICATION_TYPE.LIKE){
                // store.dispatch(screenChangeAction({ name:notificationData.notificationType === NOTIFICATION_TYPE.COMMENT?PageKeys.COMMENTS:PageKeys.LIKES, params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: notificationData, isEditable: true } }));
                store.dispatch(screenChangeAction({ name: PageKeys.RIDE_DETAILS, params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: notificationData, isEditable: true } }));
            }
            else{
                store.dispatch(screenChangeAction({ name: PageKeys[targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: notificationData, isEditable: true } }));
            }
        }
        else {
            console.log(PageKeys[targetScreen]+ 'enter in the else part')
            store.dispatch(screenChangeAction({ name: PageKeys[targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: notificationData } }));
        }
        console.log('\n\n\n Comparison   '+ targetScreen!== PageKeys.NOTIFICATIONS)
        if(targetScreen!== PageKeys.NOTIFICATIONS && targetScreen!=='CHAT'){
            console.log(notificationData,'//// notificationData')
            store.dispatch(readNotification(notificationData.notifiedUserId,notificationData.id))
        }
    }

    getChatMessageType = (notificationData) => {
        let notificationBody = null;
        switch (notificationData.type) {
            case CHAT_CONTENT_TYPE.RIDE:
                let rideName = JSON.parse(notificationData.content).name;
                notificationBody = { ...notificationData, content: `Shared a ride, ${rideName}` }
                break;
            case CHAT_CONTENT_TYPE.IMAGE || CHAT_CONTENT_TYPE.VIDEO:
                notificationBody = { ...notificationData, content: `Shared ${JSON.parse(notificationData.media).length} ${notificationData.type}${JSON.parse(notificationData.media).length > 1 ? 's' : ''}` }
                break;
            default:
                notificationBody = notificationData
        }
        return notificationBody;
    }

    componentWillUnmount() {
        PushNotificationIOS.removeEventListener('localNotification', this.onOpenIOSNotification);
    }

    render() {
        console.log('\n\n\n inside index.js render')
        return (
            <Provider store={store}>
            <Root>
                <Navigation />
            </Root>
            </Provider>
        )
    }
}

