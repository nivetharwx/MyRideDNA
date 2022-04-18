// import firebase from 'react-native-firebase';
import { CHAT_CONTENT_TYPE } from './constants';
import store from './store';
var PushNotification = require("react-native-push-notification");

export default async (notificationBody) => {

    let recievedData=notificationBody.data
    console.log('bgMessaging : ', notificationBody,recievedData)
    if (notificationBody.data.messageIdList) return;
    if(notificationBody.data.notifiedUserId && notificationBody.data.notifiedUserId === notificationBody.data.fromUserId) return;
    console.log()
    let notificationData =(() => {
        console.log('recieved data ///', recievedData)
        let newNotificationBody = null;
        switch (recievedData.type) {
            case CHAT_CONTENT_TYPE.RIDE:
                let rideName = JSON.parse(recievedData.content).name;
                newNotificationBody = { ...recievedData,content: `Shared a ride, ${rideName}`}  
                break;
            case CHAT_CONTENT_TYPE.IMAGE || CHAT_CONTENT_TYPE.VIDEO:
                newNotificationBody = { ...recievedData, content: `Shared ${JSON.parse(recievedData.media).length} ${recievedData.type}${JSON.parse(recievedData.media).length > 1 ? 's' : ''}` }
                break;
            default:
                newNotificationBody = recievedData
        }
        return newNotificationBody;
    })()
   
    PushNotification.localNotification({
        title: notificationData.name, // (optional)
        message: notificationData.content, // (required)
        userInfo: recievedData, // (optional) default: {} (using null throws a JSON value '<null>' error)
        playSound: true, // (optional) default: true
    })
    return Promise.resolve();
}


