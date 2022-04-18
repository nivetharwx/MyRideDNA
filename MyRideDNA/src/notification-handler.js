
import PushNotification from 'react-native-push-notification';
import { IS_ANDROID } from './constants';

class NotificationHandler {
    onNotification(notification) {
        // console.log('NotificationHandler:', notification);

        if (typeof this._onNotification === 'function') {
            this._onNotification(notification);
        }
    }

    attachNotification(handler) {
        this._onNotification = handler;
    }
}

const handler = new NotificationHandler();

PushNotification.configure({

    onNotification: handler.onNotification.bind(handler),


    permissions: {
        alert: true,
        badge: true,
        sound: true,
    },

    requestPermissions: !IS_ANDROID,
});

export default handler;