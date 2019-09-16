import firebase from 'react-native-firebase';

export default async (message) => {
    console.log('handled message : ', message);
    let notification = new firebase.notifications.Notification();
    notification = notification.setNotificationId(new Date().valueOf().toString())
        .setTitle(message.data.name)
        .setBody(message.data.content)
        .setData(message.data)
        .setSound("bell.mp3");
    // DOC: Android notification options
    notification.android.setPriority(firebase.notifications.Android.Priority.High);
    notification.android.setTicker("My Notification Ticker");
    notification.android.setAutoCancel(true);
    notification.android.setSmallIcon("@drawable/myridedna_notif_icon");
    notification.android.setBigText(message.data.content);
    notification.android.setColor("black");
    notification.android.setColorized(true);
    notification.android.setVibrate([300]);
    notification.android.setChannelId("default")

    // DOC: iOS notification options
    notification.ios.badge = 10;

    // Couldn't find matching options in react-native-firebase
    // FCM.presentLocalNotification({
    //     wake_screen: true,
    //     my_custom_data: message.data,
    //     show_in_foreground: true,
    // });

    firebase.notifications().displayNotification(notification)
    return Promise.resolve();
}