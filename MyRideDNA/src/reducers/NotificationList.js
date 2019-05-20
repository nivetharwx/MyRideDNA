import { RESET_NOTIFICATION_LIST, UPDATE_NOTIFICATION_IN_LIST, CLEAR_NOTIFICATION_LIST, UPDATE_NOTIFICATION_COUNT, DELETE_NOTIFICATIONS_FROM_LIST, IS_LOADING_DATA } from "../actions/actionConstants";
import { updateShareLocationState } from "../api";

const initialState = {
    notificationList: {
        notification: []
    },
    pageNumber: 0,
    isLoading: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        // case RESET_NOTIFICATION_LIST:
        // return {
        //     ...state,
        //     notificationList: action.data
        // }
        case RESET_NOTIFICATION_LIST:
            if (action.data.pageNumber === 0) {
                return {
                    ...state,
                    notificationList: {
                        notification: action.data.notification,
                        totalUnseen: action.data.totalUnseen
                    },
                    pageNumber: action.data.pageNumber + 1
                }
            }
            else {
                return {
                    ...state,
                    notificationList: {
                        notification: [
                            ...state.notificationList.notification,
                            ...action.data.notification
                        ],
                        totalUnseen: action.data.totalUnseen
                    },
                    pageNumber: action.data.pageNumber + 1
                }
            }
        case UPDATE_NOTIFICATION_IN_LIST:
            const notificationIdx = state.notificationList.notification.findIndex(item => item.id === action.data.id);
            if (action.data.pictureObj) {
                let updatedNotifList = state.notificationList.notification.map(item => {
                    if (!item.profilPictureId) return item;
                    if (typeof action.data.pictureObj[item.profilPictureId] === 'string') {
                        return { ...item, profilePicture: action.data.pictureObj[item.profilPictureId] }
                    }
                    return item;
                })
                return {
                    ...state,
                    notificationList: {
                        ...state.notificationList,
                        notification: updatedNotifList
                    }
                }
            }
            else {
                if (notificationIdx > -1) {
                    return {
                        ...state,
                        notificationList: {
                            ...state.notificationList,
                            notification: [
                                ...state.notificationList.notification.slice(0, notificationIdx),
                                { ...state.notificationList.notification[notificationIdx], ...action.data.status },
                                ...state.notificationList.notification.slice(notificationIdx + 1)
                            ]
                        }
                        // notificationList: [
                        //     ...state.notificationList.slice(0, notificationIdx),
                        //     { ...state.notificationList[notificationIdx], ...action.data.status },
                        //     ...state.notificationList.slice(notificationIdx + 1)
                        // ]
                    }

                }
            }

            return state;

        case UPDATE_NOTIFICATION_COUNT:
            return {
                ...state,
                notificationList: {
                    ...state.notificationList,
                    totalUnseen: 0
                }
            }

        case DELETE_NOTIFICATIONS_FROM_LIST:
            const index = state.notificationList.notification.findIndex(item => item.id === action.data.notificationIds);
            return {
                ...state,
                notificationList: {
                    ...state.notificationList,
                    notification: [...state.notificationList.notification.slice(0, index), ...state.notificationList.notification.slice(index + 1)]
                }
            }

        case IS_LOADING_DATA:
            return {
                ...state,
                isLoading: action.data
            }

        case CLEAR_NOTIFICATION_LIST:
            return {
                ...state,
                notificationList: {}
            }


        default: return state
    }
}