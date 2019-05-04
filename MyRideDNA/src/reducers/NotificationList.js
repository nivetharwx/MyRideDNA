import { RESET_NOTIFICATION_LIST, UPDATE_NOTIFICATION_IN_LIST, CLEAR_NOTIFICATION_LIST } from "../actions/actionConstants";

const initialState = {
    notificationList: []
};

export default (state = initialState, action) => {
    switch (action.type) {
        case RESET_NOTIFICATION_LIST:
            return {
                ...state,
                notificationList: action.data
            }

        case UPDATE_NOTIFICATION_IN_LIST:
            const notificationIdx = state.notificationList.findIndex(item => item.id === action.data.id);
            if (notificationIdx > -1) {
                if (action.data.profilePicture) {
                    const notification = state.notificationList[notificationIdx];
                    notification.profilePicture = action.data.profilePicture;
                    return { ...state, notificationList: [...state.notificationList.slice(0, notificationIdx), notification, ...state.notificationList.slice(notificationIdx + 1)] }
                }
                else {
                    return {
                        ...state,
                        notificationList: [
                            ...state.notificationList.slice(0, notificationIdx),
                            { ...state.notificationList[notificationIdx], ...action.data.notification },
                            ...state.notificationList.slice(notificationIdx + 1)
                        ]
                    }

                }
            }

            return state;

        case CLEAR_NOTIFICATION_LIST:
            return {
                ...state,
                notificationList: []
            }

        default: return state
    }
}