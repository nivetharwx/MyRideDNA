import {
    updateSignupResultAction, updateRideAction, updateWaypointAction, updateUserAction, toggleLoaderAction,
    replaceRideListAction, deleteRideAction, updateRideListAction, updateEmailStatusAction, updateFriendListAction, replaceFriendListAction, replaceGarageInfoAction, updateBikeListAction, addToBikeListAction, deleteBikeFromListAction, updateActiveBikeAction, updateGarageNameAction, replaceShortSpaceListAction, replaceSearchListAction, updateRelationshipAction, createFriendGroupAction, replaceFriendGroupListAction, addMembersToCurrentGroupAction, resetMembersFromCurrentGroupAction, updateMemberAction, removeMemberAction, addWaypointAction,
    deleteWaypointAction, removeFriendGroupAction, updatePasswordSuccessAction, updatePasswordErrorAction, screenChangeAction, addToPassengerListAction, replacePassengerListAction, updatePassengerInListAction, updateFriendAction, doUnfriendAction, updateFriendRequestResponseAction, updateOnlineStatusAction, resetNotificationListAction, updateNotificationAction, deleteNotificationsAction, replaceFriendRequestListAction, updateFriendRequestListAction, updateInvitationResponseAction, updateCurrentFriendAction, resetStateOnLogout, addFriendsLocationAction,
    apiLoaderActions, replaceFriendInfooAction, resetNotificationCountAction, isloadingDataAction, updateRideInListAction, updateSourceOrDestinationAction, updatePageNumberAction, isRemovedAction, removeFromPassengerListAction, updateChatMessagesAction, replaceChatMessagesAction, updateChatListAction, updateFriendChatPicAction, resetMessageCountAction, storeUserAction, errorHandlingAction, resetErrorHandlingAction, addMembersLocationAction, storeUserMyWalletAction, updateUserMyWalletAction, updateFriendsLocationAction, updateGroupsLocationAction,
    replaceAlbumListAction, updateFavouriteFriendAction, replaceCommunityListAction, updateCommunityListAction, updateCurrentGroupAction, updateSearchListAction, updatePostTypesAction, updatePrevProfileAction, updateBikeAlbumAction
} from '../actions';
import { USER_BASE_URL, RIDE_BASE_URL, RECORD_RIDE_STATUS, RIDE_TYPE, PageKeys, USER_AUTH_TOKEN, FRIENDS_BASE_URL, HEADER_KEYS, RELATIONSHIP, GRAPH_BASE_URL, NOTIFICATIONS_BASE_URL, EVENTS_BASE_URL, APP_EVENT_NAME, APP_EVENT_TYPE, DEVICE_TOKEN, RIDE_POINT, CHAT_BASE_URL, POSTS_BASE_URL } from '../constants';
import axios from 'axios';

import { Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import Base64 from '../util';
import { Actions } from 'react-native-router-flux';
import DeviceInfo from 'react-native-device-info';

const CancelToken = axios.CancelToken;
const axiosSource = CancelToken.source();
const API_TIMEOUT = 10 * 1000; // 10 seconds

/**
 * DOC: getPicture is a common API for fetching any kind of picture from server.
 * 
 * @param {*} pictureId
 * @param {*} successCallback - Calling component needs to dispatch success action
 * @param {*} errorCallback - Calling component needs to dispatch error action 
 */
export const getPicture = (pictureId, successCallback, errorCallback) => {
    axios.get(USER_BASE_URL + `getPicture/${pictureId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        .then(res => {
            if (res.status === 200) {
                if (res.data.picture === '') {
                    // errorCallback(res.data);
                    // differentErrors(er, [pictureId, successCallback, errorCallback], getPicture, false);
                } else {
                    successCallback(res.data);
                    store.dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            }
        })
        .catch(er => {
            errorCallback(er.response || er);
            handleServiceErrors(er, [pictureId, successCallback, errorCallback], getPicture, false);
        })
}
export const getPictureList = (pictureIdList, successCallback, errorCallback) => {
    axios.put(USER_BASE_URL + `getPictureList`, { pictureIdList }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        .then(res => {
            if (res.status === 200) {
                if (Object.keys(res.data).length === 0) {
                    handleServiceErrors(er, [pictureIdList, successCallback, errorCallback], getPictureList, false);
                    // errorCallback(res.data);
                } else {
                    successCallback(res.data);
                    store.dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            }
        })
        .catch(er => {
            handleServiceErrors(er, [pictureIdList, successCallback, errorCallback], getPictureList, false);
            // errorCallback(er.response || er);
        })
}
export const getPostTypes = () => {
    return dispatch => {
        axios.get(`${POSTS_BASE_URL}postTypes`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => dispatch(updatePostTypesAction(res.data)))
            .catch(er => {
                console.log(`${POSTS_BASE_URL}postTypes error: `, er);
                handleServiceErrors(er, [], getPostTypes, false);
            })
    }
}
export const getRidePictureList = (pictureIdList, successCallback, errorCallback) => {
    axios.put(RIDE_BASE_URL + `getPictureList`, { pictureIdList }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        .then(res => {
            if (res.status === 200) {
                if (Object.keys(res.data).length === 0) {
                    // errorCallback(res.data);
                    handleServiceErrors(er, [pictureIdList, successCallback, errorCallback], getRidePictureList, false);
                } else {
                    successCallback(res.data);
                    store.dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            }
        })
        .catch(er => {
            errorCallback(er.response || er);
            handleServiceErrors(er, [pictureIdList, successCallback, errorCallback], getRidePictureList, false);
        })
}

export const pushNotification = (userId) => {
    axios.get(NOTIFICATIONS_BASE_URL + `pushNotification?userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        .then(res => {
            if (res.status === 200) {
                console.log("pushNotification success: ", res.data || res);
            }
        })
        .catch(er => {
            console.log("pushNotification error: ", er.response || er);
        })
}
// export const getAllNotifications = (userId) => {
//     return dispatch => {
//         axios.get(NOTIFICATIONS_BASE_URL + `getAllNotifications?userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
//             .then(res => {
//                 if (res.status === 200) {
//                     console.log('getAllNotifications : ',res.data)
//                     dispatch(resetNotificationListAction(res.data));
//                 }
//             })
//             .catch(er => {
//                 console.log("getAllNotifications error: ", er.response || er);
//             })
//     }
// }
export const getAllNotifications = (userId, pageNumber, date, comingFrom, successCallback, errorCallback) => {
    return dispatch => {
        // dispatch(isloadingDataAction(true));
        axios.get(NOTIFICATIONS_BASE_URL + `getNotifications?userId=${userId}&pageNumber=${pageNumber}&date=${date}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('getAllNotifications : ', res.data)
                if (res.status === 200 && res.data.notification.length > 0) {
                    // dispatch(isloadingDataAction(false));
                    dispatch(resetNotificationListAction(res.data));
                    dispatch(updatePageNumberAction({ pageNumber: pageNumber }));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    if (comingFrom === 'notification') {
                        seenNotification(userId)
                    }
                    successCallback(res.data)
                }
                else if (res.data.notification.length === 0) {
                    dispatch(apiLoaderActions(false));
                    if (comingFrom === 'notification') {
                        seenNotification(userId)
                    }
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    // dispatch(isloadingDataAction(false));
                    successCallback(false)
                }
            })
            .catch(er => {
                // dispatch(isloadingDataAction(false));
                handleServiceErrors(er, [userId, pageNumber, date, successCallback, errorCallback], getAllNotifications, false);
                errorCallback(er)
                console.log("getNotifications error: ", er.response || er);
            })
    }
}
const seenNotification = (userId) => {
    axios.get(NOTIFICATIONS_BASE_URL + `seenNotification?userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        .then(res => {
            console.log('seenNotification : ', res.data)
            if (res.status === 200) {
                store.dispatch(resetNotificationCountAction(res.data));
            }
        })
        .catch(er => {
            console.log("seenNotification error: ", er.response || er);
        })
}
export const readNotification = (userId, notificationId) => {
    return dispatch => {
        axios.put(NOTIFICATIONS_BASE_URL + `readNotification`, { notifiedUserId: userId, id: notificationId }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log("readNotification success: ", res.data || res);
                    dispatch(updateNotificationAction({ id: notificationId, status: res.data }));
                }
            })
            .catch(er => {
                console.log("readNotification error: ", er.response || er);
            })
    }
}
export const deleteNotifications = (notificationIds) => {
    console.log('deleteNotifications: ', notificationIds)
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(NOTIFICATIONS_BASE_URL + `deleteNotifications`, { notificationIds: [notificationIds] }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(apiLoaderActions(false))
                    console.log("deleteNotifications success: ", res.data || res);
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    dispatch(deleteNotificationsAction({ notificationIds }));
                }
            })
            .catch(er => {
                handleServiceErrors(er, [notificationIds], deleteNotifications, true);
                dispatch(apiLoaderActions(false))
                console.log("deleteNotifications error: ", er.response || er);
            })
    }
}
export const deleteAllNotifications = (userId) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.delete(NOTIFICATIONS_BASE_URL + `deleteAllNotifications?userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(apiLoaderActions(false))
                    console.log("deleteAllNotifications success: ", res.data || res);
                    dispatch(updateNotificationAction({ notificationId, notification: res.data }));
                }
            })
            .catch(er => {
                dispatch(apiLoaderActions(false))
                console.log("deleteAllNotifications error: ", er.response || er);
            })
    }
}
export const publishEvent = (eventBody) => {
    axios.post(EVENTS_BASE_URL + `publishEvent`, eventBody, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        .then(res => {
            if (res.status === 200) {
                console.log("publishEvent success: ", res.data || res);
            }
        })
        .catch(er => {
            console.log("publishEvent error: ", er.response || er);
        })
}
export const updateLocation = (userId, locationInfo) => {
    axios.put(GRAPH_BASE_URL + `updateLocation?userId=${userId}`, locationInfo, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        .then(res => {
            if (res.status === 200) {
                console.log("updateLocation success: ", res.data || res);
            }
        })
        .catch(er => {
            console.log("updateLocation error: ", er.response || er);
        })
}
export const logoutUser = (userId, accessToken, deviceToken) => {
    return async (dispatch) => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.post(USER_BASE_URL + `logoutUser`, { userId, accessToken, registrationToken: deviceToken, deviceId: await DeviceInfo.getUniqueId() }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('logoutUser : ', res.data)
                if (res.status === 200) {

                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    // DOC: Updating user active | isLoggedIn with publish event

                    publishEvent({ eventName: APP_EVENT_NAME.USER_EVENT, eventType: APP_EVENT_TYPE.INACTIVE, eventParam: { isLoggedIn: false, userId: userId } });
                    // TODO: Clear store
                    // AsyncStorage.removeItem(DEVICE_TOKEN).then(() => {
                    // });
                    AsyncStorage.removeItem(USER_AUTH_TOKEN).then(() => {
                        Actions.reset(PageKeys.LOGIN);
                    });
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    setTimeout(() => { dispatch(resetStateOnLogout()) }, 1000)
                }
            })
            .catch(er => {
                console.log(er.response);
                dispatch(apiLoaderActions(false))
                handleServiceErrors(er, [userId, accessToken, deviceToken], logoutUser, true);
                // TODO: Dispatch error info action
            })
    };
}
export const validateEmailOnServer = (email) => {
    return dispatch => {
        axios.get(USER_BASE_URL + `isEmailPresent/${email}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(updateEmailStatusAction(res.data));

                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
            })
    };
}
export const registerUser = (user) => {
    return dispatch => {
        axios.post(USER_BASE_URL + 'registerUser', user, { cancelToken: axiosSource.token, timeout: 100 })
            .then(res => {
                if (res.status === 200) {
                    console.log('registerUser :', res.data)
                    dispatch(updateSignupResultAction(res.data));
                }
            })
            .catch(error => {
                console.log('registerUser error : ', error)
                dispatch(updateSignupResultAction(error.response.data));
                if ((error.message === 'timeout of 100ms exceeded' || error.message === 'Network Error') && store.getState().PageState.hasNetwork === true) {
                    Alert.alert(
                        'Something went wrong ',
                        '',
                        [
                            {
                                text: 'Retry ', onPress: () => {
                                    registerUser(user)
                                }
                            },
                            { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                        ],
                        { cancelable: false }
                    )
                }
                // TODO: Dispatch error info action
            })
    };
}
export const updateUserInfo = (userData, successCallback, errorCallback) => {
    console.log('userData : ', userData);
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(USER_BASE_URL + 'updateUserDetails', userData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    if (userData.mimeType) {
                        const { mimeType: mime, profilePicture: picStr, ...otherData } = userData;
                        dispatch(updateUserAction({ ...otherData, profilePicture: `data:${mime};base64,${picStr}` }));
                    } else {
                        dispatch(updateUserAction(userData));
                    }
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    successCallback(false)
                }
            })
            .catch(er => {
                errorCallback(false)
                console.log("updateUserInfo: ", er.response || er);
                handleServiceErrors(er, [userData, successCallback, errorCallback], updateUserInfo, true);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const addClubs = (userId, clubName, clubs) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.patch(USER_BASE_URL + 'addClubs', { userId, clubName }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log('addClubs : ', res.data)
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateUserAction({ clubs: [...clubs, res.data] }))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            })
            .catch(er => {
                console.log("addClubs: ", er.response || er);
                handleServiceErrors(er, [userId, clubName, clubs], addClubs, true);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const updateClubs = (userId, clubName, clubId, clubs) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.patch(USER_BASE_URL + `updateClubs/${userId}`, { clubId, clubName }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log('updateClubs : ', res.data)
                    dispatch(toggleLoaderAction(false));
                    const index = clubs.findIndex(item => item.clubId === clubId);
                    clubs[index].clubName = clubName
                    console.log('updateClubs clubs: ', clubs);
                    dispatch(updateUserAction({ clubs }))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            })
            .catch(er => {
                console.log("updateClubs: ", er.response || er);
                handleServiceErrors(er, [userId, clubName, clubId, clubs], updateClubs, true);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}

export const removeClubs = (userId, clubId, clubs) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.patch(USER_BASE_URL + 'removeClubs', { userId, clubId }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log('removeClubs : ', res.data)
                    dispatch(toggleLoaderAction(false));
                    const index = clubs.findIndex(item => item.clubId === clubId);
                    dispatch(updateUserAction({ clubs: [...clubs.slice(0, index), ...clubs.slice(index + 1)] }))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            })
            .catch(er => {
                console.log("removeClubs: ", er.response || er);
                handleServiceErrors(er, [userId, clubId, clubs], removeClubs, true);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}


export const updatePassword = (passwordInfo) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(USER_BASE_URL + 'updatePassword', passwordInfo, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log("updatePassword success: ", res.data);
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(updatePasswordSuccessAction(res.data));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            })
            .catch(er => {
                console.log("updatePassword error: ", er.response || er);
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                handleServiceErrors(er, [passwordInfo], updatePassword, true);
                dispatch(updatePasswordErrorAction(er.response.data));
            })
    };
}
export const updateUserSettings = (userSettings) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(USER_BASE_URL + 'updateUserSettings', userSettings, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log("updateUserSettings success: ", res.data);
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    dispatch(updateUserAction(userSettings));
                }
            })
            .catch(er => {
                console.log("updateUserSettings error: ", er.response || er);
                handleServiceErrors(er, [userSettings], updateUserSettings, true);
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const updateShareLocationState = (userId, shareLocState) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(USER_BASE_URL + 'shareLocationEnableOrDisable', { userId, locationEnable: shareLocState }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log("updateShareLocationState: ", res.data);
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(updateUserAction({ locationEnable: shareLocState }));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            })
            .catch(er => {
                console.log("updateShareLocationState: ", er.response || er);
                handleServiceErrors(er, [userId, shareLocState], updateShareLocationState, true);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const updateProfilePicture = (profilePicStr, mimeType, userId) => {
    return dispatch => {
        // dispatch(profileLoaderActions(true))
        axios.put(USER_BASE_URL + 'updateProfilePicture', { userId, profilePicture: profilePicStr, mimeType }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(profileLoaderActions(false))
                    dispatch(updateUserAction({ ...res.data, profilePicture: `data:${mimeType};base64,${profilePicStr}` }));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            })
            .catch(er => {
                // dispatch(profileLoaderActions(false))
                console.log(er.response);
                handleServiceErrors(er, [profilePicStr, mimeType, userId], updateProfilePicture, true);
                // TODO: Dispatch error info action
            });

        // axios.put(USER_BASE_URL + `updateProfilePicture?userId=${userId}`, formData, ).then(res => {
        //     if (res.status === 200) {
        //         console.log("updateProfilePicture: ", res.data);
        //         // dispatch(updateUserAction({ ...res.data, profilePicture: `data:${mimeType};base64,${profilePicStr}` }));
        //     }
        // }).catch(er => {
        //     console.log(er.response);
        //     // TODO: Dispatch error info action
        // })
    };
}
export const getAllBuildRides = (userId, toggleLoader, pageNumber, successCallback, errorCallback) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        toggleLoader && dispatch(apiLoaderActions(true))
        axios.get(RIDE_BASE_URL + `getAllBuildRides?userId=${userId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('getAllBuildRides : ', res.data);
                if (res.status === 200 && res.data.length > 0) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(replaceRideListAction({ rideType: RIDE_TYPE.BUILD_RIDE, rideList: res.data, pageNumber: pageNumber }));
                    dispatch(updatePageNumberAction({ pageNumber: pageNumber }));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    successCallback(res.data);
                }
                else if (res.data.length === 0) {
                    dispatch(apiLoaderActions(false))
                    successCallback(res.data)
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                handleServiceErrors(er, [userId, toggleLoader, pageNumber, successCallback, errorCallback], getAllBuildRides, false);
                errorCallback(er)
            })
    };
}
export const getAllPublicRides = (userId, toggleLoader, pageNumber, successCallback, errorCallback) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        toggleLoader && dispatch(apiLoaderActions(true))
        axios.get(RIDE_BASE_URL + `getAllPublicRides?userId=${userId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('getAllPublicRides success: ', res.data)
                if (res.status === 200 && res.data.length > 0) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false));
                    dispatch(updatePageNumberAction({ pageNumber: pageNumber }));
                    dispatch(replaceRideListAction({ rideType: RIDE_TYPE.SHARED_RIDE, rideList: res.data, pageNumber: pageNumber }));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    successCallback(res.data);
                }
                else if (res.data.length === 0) {
                    successCallback(false);
                    dispatch(apiLoaderActions(false))
                }
            })
            .catch(er => {
                console.log(er.response);
                handleServiceErrors(er, [userId, toggleLoader, pageNumber, successCallback, errorCallback], getAllPublicRides, false);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false));
                errorCallback(er)
            })
    };
}
export const getAllRecordedRides = (userId, toggleLoader, pageNumber, spaceId, successCallback, errorCallback) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        toggleLoader && dispatch(apiLoaderActions(true))
        axios.get(RIDE_BASE_URL + `getAllRecordRides?userId=${userId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('getAllRecordRides : ', res.data);
                if (res.status === 200 && res.data.length > 0) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false));
                    dispatch(replaceRideListAction({ rideType: RIDE_TYPE.RECORD_RIDE, rideList: res.data, pageNumber: pageNumber }));
                    dispatch(updatePageNumberAction({ pageNumber: pageNumber }));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    successCallback(res.data);
                }
                else if (res.data.length === 0) {
                    dispatch(apiLoaderActions(false))
                    successCallback(res.data);
                }
            })
            .catch(er => {
                console.log(er.response);
                handleServiceErrors(er, [userId, toggleLoader, pageNumber, successCallback, errorCallback], getAllRecordedRides, false);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                errorCallback(er);
            })
    };
}


export const getRecordRides = (userId, spaceId, pageNumber = 0, successCallback, errorCallback) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.get(RIDE_BASE_URL + `getRecordRides?userId=${userId}&pageNumber=${pageNumber}&spaceId=${spaceId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('getRecordRides : ', res.data);
                if (res.status === 200) {
                    dispatch(apiLoaderActions(false));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    successCallback(res.data);
                }
            })
            .catch(er => {
                console.log(er.response);
                handleServiceErrors(er, [userId, pageNumber, spaceId, successCallback, errorCallback], getRecordRides, false);
                // TODO: Dispatch error info action
                dispatch(apiLoaderActions(false))
                errorCallback(er);
            })
    };
}




export const getFriendsRideList = (friendUserId, relationship) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.get(RIDE_BASE_URL + `getFriendRides?userId=${friendUserId}&relationshipStatus=${relationship}`)
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(updateCurrentFriendAction({ rideList: res.data, userId: friendUserId }));
                    console.log('getFriendRides : ', res)
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            })
            .catch(er => {
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                handleServiceErrors(er, [friendUserId, relationship], getFriendsRideList, false);
                console.log('friendsRideError : ', er)
            })
    }
}
export const createNewRide = (rideData) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.post(RIDE_BASE_URL + 'createRide', rideData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(updateRideAction({ ...rideData, ...res.data }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const createRecordRide = (rideData) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.post(RIDE_BASE_URL + 'createRecordRide', rideData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(updateRideAction({ ...rideData, ...res.data }));
                }
            })
            .catch(er => {
                console.log(er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const copySharedRide = (rideId, name, rideType, userId, date) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `copySharedRide?rideId=${rideId}`, { name, userId, date }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log('copySharedRide : ', res.data)
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(updateRideListAction({ rideType, rideList: [res.data] }));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            })
            .catch(er => {
                console.log(er.response);
                handleServiceErrors(er, [rideId, name, rideType, userId, date], copySharedRide, true);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const copyRide = (rideId, name, rideType, date) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `copyRide?rideId=${rideId}`, { name, date }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(updateRideListAction({ rideType, rideList: [res.data] }));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            })
            .catch(er => {
                console.log(er.response);
                handleServiceErrors(er, [rideId, name, rideType, date], copyRide, true);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const renameRide = (ride, rideType, userId, index) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `renameRecordRide`, { rideId: ride.rideId, name: ride.name, userId }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(updateRideListAction({ rideType, rideList: [ride], index }));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            })
            .catch(er => {
                console.log(er.response);
                handleServiceErrors(er, [ride, rideType, userId, index], renameRide, true);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const deleteRide = (rideId, index, rideType) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.delete(RIDE_BASE_URL + `deleteRide?rideId=${rideId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(isRemovedAction(true))
                    dispatch(deleteRideAction({ rideType, index }));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            })
            .catch(er => {
                console.log(er.response);
                handleServiceErrors(er, [rideId, index, rideType], deleteRide, true);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const addTrackpoints = (actualPoints, trackpoints, distance, ride, userId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `addTrackpoints?rideId=${ride.rideId}&userId=${userId}`,
            { actualPoints: Base64.encode(actualPoints.join()), trackpoints: Base64.encode(trackpoints.join()), distance }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(updateRideAction({ ...ride, trackpoints: [...ride.trackpoints, ...trackpoints], totalDistance: distance }));
                }
            })
            .catch(er => {
                console.log("addTrackpoints error: ", er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const pauseRecordRide = (pauseTime, actualPoints, trackpoints, distance, ride, userId, loadRide) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `pauseRecordRide?rideId=${ride.rideId}&userId=${userId}`,
            { actualPoints: Base64.encode(actualPoints.join()), trackpoints: Base64.encode(trackpoints.join()), pauseTime, distance }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    const updatedRide = { ...ride, trackpoints: ride.trackpoints ? [...ride.trackpoints, ...trackpoints] : trackpoints, ...res.data, unsynced: false, status: RECORD_RIDE_STATUS.PAUSED, totalDistance: distance };
                    if (loadRide) {
                        dispatch(getRideByRideId(updatedRide.rideId, updatedRide));
                    } else {
                        dispatch(apiLoaderActions(false))
                        dispatch(updateRideAction(updatedRide));
                    }
                }
            })
            .catch(er => {
                console.log("pauseRecordRide error: ", er || er.response);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const completeRecordRide = (endTime, actualPoints, trackpoints, distance, ride, userId, loadRide) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        console.log(`completeRecordRide: `, { actualPoints, trackpoints, endTime, distance });
        axios.put(RIDE_BASE_URL + `completeRecordRide?rideId=${ride.rideId}&userId=${userId}`,
            { actualPoints: Base64.encode(actualPoints.join()), trackpoints: Base64.encode(trackpoints.join()), endTime, distance }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(apiLoaderActions(false))
                    // dispatch(toggleLoaderAction(false));
                    let updatedRide = { ...ride, totalDistance: distance };
                    if (ride.trackpoints) {
                        updatedRide.trackpoints = [...ride.trackpoints];
                    } else {
                        updatedRide.trackpoints = [];
                    }
                    if (trackpoints.length >= 7) {
                        updatedRide.trackpoints.push(...[trackpoints.slice(0, trackpoints.length - 7)]);
                    }
                    const destinationPoint = trackpoints.slice(-7);
                    if (destinationPoint.length === 7) {
                        updatedRide.destination = { lng: destinationPoint[1], lat: destinationPoint[0] };
                    }
                    updatedRide = { ...updatedRide, ...res.data, unsynced: false, status: RECORD_RIDE_STATUS.COMPLETED };
                    // const updatedRide = { ...ride, trackpoints: ride.trackpoints ? [...ride.trackpoints, ...trackpoints] : trackpoints, ...res.data, unsynced: false, status: RECORD_RIDE_STATUS.COMPLETED };
                    if (loadRide) {
                        dispatch(getRideByRideId(updatedRide.rideId, updatedRide));
                    } else {
                        dispatch(updateRideAction(updatedRide));
                    }
                }
            })
            .catch(er => {
                console.log("completeRecordRide error: ", er || er.response);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const continueRecordRide = (resumeTime, ride, userId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `resumeRecordRide?rideId=${ride.rideId}&userId=${userId}`, { resumeTime }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(updateRideAction({ ...ride, ...res.data, status: RECORD_RIDE_STATUS.RUNNING }));
                }
            })
            .catch(er => {
                console.log("resumeRecordRide error: ", er || er.response);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}

export const updateRide = (updates, successCallback, errorCallback) => {
    axios.put(RIDE_BASE_URL + `updateRide`, updates, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        .then(res => {
            if (res.status === 200) {
                successCallback(res.data);
            }
        })
        .catch(er => {
            console.log(er.response || er);
            errorCallback(er.response || er);
        })
    // return dispatch => {
    //     // dispatch(toggleLoaderAction(true));
    //     dispatch(apiLoaderActions(true))
    //     axios.put(RIDE_BASE_URL + `updateRide`, updatedRide, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
    //         .then(res => {
    //             if (res.status === 200) {
    //                 // dispatch(toggleLoaderAction(false));
    //                 dispatch(apiLoaderActions(false));
    //                 dispatch(updateRideInListAction({ ride: updatedRide, rideType }));
    //                 updateActiveRide === true && dispatch(updateRideAction(updatedRide));
    //             }
    //         })
    //         .catch(er => {
    //             console.log(er.response || er);
    //             // TODO: Dispatch error info action
    //             // dispatch(toggleLoaderAction(false));
    //             dispatch(apiLoaderActions(false))
    //         })
    // };
}
export const addSource = (waypoint, ride) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `addSource?rideId=${ride.rideId}`, waypoint, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(updateRideAction({ source: waypoint }));
                }
            })
            .catch(er => {
                console.log(er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const addWaypoint = (waypoint, ride, index) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `addWaypoint?rideId=${ride.rideId}&index=${index}`, waypoint, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    return dispatch(addWaypointAction({ index, waypoint }));
                }
            })
            .catch(er => {
                console.log(er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const deleteWaypoint = (ride, index) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.delete(RIDE_BASE_URL + `deleteWaypoint?rideId=${ride.rideId}&index=${index}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    return dispatch(deleteWaypointAction({ index }));
                }
            })
            .catch(er => {
                console.log(er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const updateWaypoint = (updates, waypoint, ride, index) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `updateWaypoint?rideId=${ride.rideId}&index=${index}`, updates, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    if (res.data.pictureIdList.length > 0) {
                        waypoint.pictureIdList
                            ? dispatch(updateWaypointAction({ index, updates: { pictureIdList: [...waypoint.pictureIdList, ...res.data.pictureIdList] } }))
                            : dispatch(updateWaypointAction({ index, updates: { pictureIdList: res.data.pictureIdList } }));
                    } else {
                        dispatch(updateWaypointAction({ index, updates }));
                    }
                }
            })
            .catch(er => {
                console.log(er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const updateSource = (updates, waypoint, ride) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `updateSource?rideId=${ride.rideId}`, updates, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    console.log("updateSource response: ", res.data);
                    dispatch(apiLoaderActions(false))
                    if (res.data.pictureIdList.length > 0) {
                        waypoint.pictureIdList
                            ? dispatch(updateRideAction({ source: { ...waypoint, pictureIdList: [...waypoint.pictureIdList, ...res.data.pictureIdList] } }))
                            : dispatch(updateRideAction({ source: { ...waypoint, pictureIdList: res.data.pictureIdList } }));
                    } else {
                        dispatch(updateRideAction({ source: { ...waypoint, ...updates } }));
                    }
                }
            })
            .catch(er => {
                console.log(er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const deleteSource = (ride) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.delete(RIDE_BASE_URL + `deleteSource?rideId=${ride.rideId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    return dispatch(updateRideAction({ source: null }));
                }
            })
            .catch(er => {
                console.log(er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const updateDestination = (updates, waypoint, ride) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `updateDestination?rideId=${ride.rideId}`, updates, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    if (res.data.pictureIdList.length > 0) {
                        waypoint.pictureIdList
                            ? dispatch(updateRideAction({ destination: { ...waypoint, pictureIdList: [...waypoint.pictureIdList, ...res.data.pictureIdList] } }))
                            : dispatch(updateRideAction({ destination: { ...waypoint, pictureIdList: res.data.pictureIdList } }));
                    } else {
                        dispatch(updateRideAction({ destination: { ...waypoint, ...updates } }));
                    }
                }
            })
            .catch(er => {
                console.log(er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const makeWaypointAsSource = (ride, index) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `makeWaypointAsSource?rideId=${ride.rideId}&index=${index}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    return dispatch(updateRideAction({
                        waypoints: [...ride.waypoints.slice(index + 1)],
                        source: ride.waypoints[index]
                    }));
                }
            })
            .catch(er => {
                console.log(er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const makeSourceAsWaypoint = (ride) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `makeSourceAsWaypoint?rideId=${ride.rideId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    return dispatch(updateRideAction({
                        waypoints: [ride.source, ...ride.waypoints],
                        source: null
                    }));
                }
            })
            .catch(er => {
                console.log(er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const makeWaypointAsDestination = (ride, index) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `makeWaypointAsDestination?rideId=${ride.rideId}&index=${index}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    return dispatch(updateRideAction({
                        waypoints: [...ride.waypoints.slice(0, index)],
                        destination: ride.waypoints[index]
                    }));
                }
            })
            .catch(er => {
                console.log(er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const makeDestinationAsWaypoint = (ride) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `makeDestinationAsWaypoint?rideId=${ride.rideId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    return dispatch(updateRideAction({
                        waypoints: [...ride.waypoints, ride.destination],
                        destination: null
                    }));
                }
            })
            .catch(er => {
                console.log(er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const deleteDestination = (ride) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.delete(RIDE_BASE_URL + `deleteDestination?rideId=${ride.rideId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    return dispatch(updateRideAction({ destination: null }));
                }
            })
            .catch(er => {
                console.log(er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
// DOC: This API call is for syncing the state of ride with the server. There will not be any dispatcher
export const replaceRide = (rideId, ride, successCallback, errorCallback) => {
    axios.put(RIDE_BASE_URL + `replaceRide?rideId=${rideId}`, ride, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        .then(res => {
            if (res.status === 200) {
                successCallback && successCallback();
            }
        })
        .catch(er => {
            console.log(er.response || er);
            errorCallback && errorCallback(er.response || er);
            // ToDo handle timeout error seperately for map
        })
}
export const getRideByRideId = (rideId, rideInfo = {}) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.get(RIDE_BASE_URL + `getRideByRideId?rideId=${rideId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    dispatch(updateRideAction({ ...rideInfo, ...res.data }));
                }
            })
            .catch(er => {
                console.log(`getRideByRideId: ${RIDE_BASE_URL}getRideByRideId?rideId=${rideId}`, er.response);
                handleServiceErrors(er, [rideId, rideInfo = {}], getRideByRideId, true);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const getWaypointPictureList = (id, pictureIdList) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `getWaypointPictureList`, { id, pictureIdList }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    if (res.data.id === RIDE_POINT.SOURCE || res.data.id === RIDE_POINT.DESTINATION) {
                        dispatch(updateSourceOrDestinationAction({
                            identifier: res.data.id, updates: {
                                pictureList: Object.keys(res.data.picture).reduce((list, k) => {
                                    list.push(res.data.picture[k]);
                                    return list;
                                }, [])
                            }
                        }))
                    } else {
                        dispatch(updateWaypointAction({
                            index: res.data.id, updates: {
                                pictureList: Object.keys(res.data.picture).reduce((list, k) => {
                                    list.push(res.data.picture[k]);
                                    return list;
                                }, [])
                            }
                        }))
                    }
                }
            })
            .catch(er => {
                console.log(`getWaypointPictureList error: ${RIDE_BASE_URL}getWaypointPictureList`, { id, pictureIdList }, er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const deleteWaypointPicture = (ride, id, pictureIdList) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `deleteWaypointPicture`, { rideId: ride.rideId, id, pictureIdList }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false));
                    if (res.data.id === RIDE_POINT.SOURCE || res.data.id === RIDE_POINT.DESTINATION) {
                        const point = id === RIDE_POINT.SOURCE ? ride.source : ride.destination;
                        const newPicList = [];
                        const newPicIdList = point.pictureIdList.reduce((list, picId, idx) => {
                            if (res.data.pictureIdList.indexOf(picId) === -1) {
                                list.push(picId);
                                newPicList.push(point.pictureList[idx]);
                            }
                            return list;
                        }, []);
                        dispatch(updateSourceOrDestinationAction({
                            identifier: res.data.id, updates: {
                                pictureList: newPicList,
                                pictureIdList: newPicIdList
                            }
                        }))
                    } else {
                        const point = ride.waypoints[id];
                        const newPicList = [];
                        const newPicIdList = point.pictureIdList.reduce((list, picId, idx) => {
                            if (res.data.pictureIdList.indexOf(picId) === -1) {
                                list.push(picId);
                                newPicList.push(point.pictureList[idx]);
                            }
                            return list;
                        }, []);
                        dispatch(updateWaypointAction({
                            index: res.data.id, updates: {
                                pictureList: newPicList,
                                pictureIdList: newPicIdList
                            }
                        }))
                    }
                }
            })
            .catch(er => {
                console.log(`deleteWaypointPicture error: ${RIDE_BASE_URL}deleteWaypointPicture`, { rideId, id, pictureIdList }, er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const getAllFriends = (friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback) => {
    return dispatch => {
        toggleLoader && dispatch(apiLoaderActions(true))
        // pageNumber > 0 && dispatch(toggleLoaderAction(true));
        // pageNumber > 0 && dispatch(apiLoaderActions(true));
        // axios.get(FRIENDS_BASE_URL + `getFriendList?userId=${userId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        axios.get(GRAPH_BASE_URL + `getFriendList?userId=${userId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('getAllFriend sucess : ', res.data)
                if (res.status === 200 && res.data.friendList.length > 0) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false));
                    dispatch(replaceFriendListAction({ friendList: res.data.friendList, pageNumber: pageNumber }))
                    dispatch(updatePageNumberAction({ pageNumber: pageNumber }));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    successCallback(res.data);

                    // DOC: Calling for getting online friends
                    // dispatch(getAllOnlineFriends(userId));
                    // if (pageNumber === 0) {
                    //     dispatch(replaceFriendListAction({ friendType, friendList: res.data }))
                    // } else {
                    //     dispatch(updateFriendListAction({ friendType, friendList: res.data }))
                    // }
                }
                else if (res.data.friendList.length === 0) {
                    dispatch(apiLoaderActions(false));
                    successCallback(false);
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            })
            .catch(er => {
                console.log(`getAllFriends: `, er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false));
                handleServiceErrors(er, [friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback], getAllFriends, false);
                // errorCallback(er);
            })
    };
}
export const getFriendInfo = (friendType, userId, friendsIdList) => {
    return dispatch => {
        dispatch(apiLoaderActions(true));
        axios.put(GRAPH_BASE_URL + `getFriend`, { userId, friendsIdList }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200 && res.data.friendList.length > 0) {
                    dispatch(apiLoaderActions(false));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                    dispatch(updateCurrentFriendAction(res.data.friendList[0]));
                }
                else if (res.data.friendList.length === 0) {
                    dispatch(apiLoaderActions(false));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            })
            .catch(er => {
                console.log(`getFriend: `, er.response || er);
                dispatch(apiLoaderActions(false));
                handleServiceErrors(er, [friendType, userId, friendIdList], getFriendInfo, false);
            })
    };
}
export const getFriendProfile = (userId, friendId) => {
    return dispatch => {
        dispatch(apiLoaderActions(true));
        axios.get(FRIENDS_BASE_URL + `getFriendProfile?userId=${userId}&friendId=${friendId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(apiLoaderActions(false));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                    dispatch(updateCurrentFriendAction(res.data));
                }
            })
            .catch(er => {
                console.log(`getFriendProfile error: `, er.response || er);
                dispatch(apiLoaderActions(false));
                handleServiceErrors(er, [userId, friendId], getFriendProfile, false);
            })
    };
}
export const getPassengersById = (userId, friendId, pageNumber, passengerList, successCallback, errorCallback) => {
    return dispatch => {
        dispatch(apiLoaderActions(true));
        axios.get(USER_BASE_URL + `getPassengersById?userId=${userId}&friendId=${friendId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(apiLoaderActions(false));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                    updatedPassengerList = [...passengerList, ...res.data.passengerList]
                    res.data.passengerList.length > 0 && dispatch(updateCurrentFriendAction({ passengerList: updatedPassengerList, userId: friendId }));
                    successCallback(res.data);
                }
            })
            .catch(er => {
                console.log(`getPassengersById error: `, er.response || er);
                dispatch(apiLoaderActions(false));
                handleServiceErrors(er, [userId, friendId, pageNumber], getPassengersById, false);
                errorCallback(er);
            })
    };
}
export const getRoadBuddiesById = (userId, friendId, pageNumber, friendList, successCallback, errorCallback) => {
    return dispatch => {
        dispatch(apiLoaderActions(true));
        axios.get(GRAPH_BASE_URL + `getRoadBuddiesById?userId=${userId}&friendId=${friendId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('getRoadBuddiesById : ', res.data);
                if (res.status === 200) {
                    dispatch(apiLoaderActions(false));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                    updatedBuddyFriendList = [...friendList, ...res.data.friendList]
                    res.data.friendList.length > 0 && dispatch(updateCurrentFriendAction({ friendList: updatedBuddyFriendList, userId: friendId }));
                    successCallback(res.data)
                }
            })
            .catch(er => {
                console.log(`getRoadBuddiesById error: `, er.response || er);
                dispatch(apiLoaderActions(false));
                handleServiceErrors(er, [userId, friendId, pageNumber], getRoadBuddiesById, false);
                errorCallback(er)
            })
    };
}
export const getMutualFriends = (userId, friendId, pageNumber, preference, mutualFriends = [], successCallback, errorCallback) => {
    return dispatch => {
        dispatch(apiLoaderActions(true));
        axios.get(GRAPH_BASE_URL + `getMutualFriends?userId=${userId}&friendId=${friendId}&pageNumber=${pageNumber}&preference=${preference}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log('getMutualFriends : ', res.data)
                    dispatch(apiLoaderActions(false));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                    updatedMutualFriendList = [...mutualFriends, ...res.data.friendList]
                    res.data.friendList.length > 0 && dispatch(updateCurrentFriendAction({ mutualFriends: updatedMutualFriendList, userId: friendId }));
                    successCallback(res.data)
                }
            })
            .catch(er => {
                console.log(`getMutualFriends error: `, er.response || er);
                dispatch(apiLoaderActions(false));
                handleServiceErrors(er, [userId, friendId, pageNumber, preference, successCallback, errorCallback], getMutualFriends, false);
                errorCallback(er)
            })
    };
}


export const getUserProfile = (userId, friendId) => {
    return dispatch => {
        dispatch(apiLoaderActions(true));
        axios.get(USER_BASE_URL + `getUserProfile?userId=${userId}&friendId=${friendId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(apiLoaderActions(false));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                    dispatch(updateCurrentFriendAction(res.data));
                }
            })
            .catch(er => {
                console.log(`getUserProfile error: `, er.response || er);
                dispatch(apiLoaderActions(false));
                handleServiceErrors(er, [userId, friendId], getUserProfile, false);
            })
    };
}
export const getAllFriends1 = (friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback) => {
    return dispatch => {
        toggleLoader && dispatch(apiLoaderActions(true))
        // pageNumber > 0 && dispatch(toggleLoaderAction(true));
        // pageNumber > 0 && dispatch(apiLoaderActions(true));
        // axios.get(FRIENDS_BASE_URL + `getFriendList?userId=${userId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        axios.get(GRAPH_BASE_URL + `getFriendList?userId=${userId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200 && res.data.friendList.length > 0) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false));
                    dispatch(replaceFriendListAction({ friendList: res.data.friendList, pageNumber: pageNumber }))
                    dispatch(updatePageNumberAction({ pageNumber: pageNumber }));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    successCallback(res.data);

                    // DOC: Calling for getting online friends
                    // dispatch(getAllOnlineFriends(userId));
                    // if (pageNumber === 0) {
                    //     dispatch(replaceFriendListAction({ friendType, friendList: res.data }))
                    // } else {
                    //     dispatch(updateFriendListAction({ friendType, friendList: res.data }))
                    // }
                }
                else if (res.data.friendList.length === 0) {
                    dispatch(apiLoaderActions(false));
                    successCallback(false);
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            })
            .catch(er => {
                console.log(`getAllFriends1: `, er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false));
                handleServiceErrors(er, [friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback], getAllFriends, false);
                // errorCallback(er);
            })
    };
}

export const getUser = (userId, successCallback, errorCallback) => {
    return dispatch => {
        axios.get(USER_BASE_URL + `getUser?id=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(({ data }) => {
                dispatch(updateUserAction(data));
                typeof successCallback === 'function' && successCallback();
            })
            .catch(er => {
                console.log(`getUser: `, er.response || er);
                typeof errorCallback === 'function' && errorCallback();
            })
    };
}

export const getAllOnlineFriends = (userId) => {
    return dispatch => {
        axios.get(GRAPH_BASE_URL + `getOnlineFriends?userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(updateOnlineStatusAction({ friendList: res.data }))
                }
            })
            .catch(er => {
                console.log(`getOnlineFriends error: `, er.response || er);
            })
    };
}
export const searchForFriend = (searchParam, userId, pageNumber, preference) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        axios.get(FRIENDS_BASE_URL + `searchFriend?searchParam=${searchParam}&userId=${userId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    if (res.data.userList.length > 0) {
                        console.log("res.data: ", res.data);
                        dispatch(updatePageNumberAction({ pageNumber: pageNumber }));
                        dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                        dispatch(replaceSearchListAction({ results: res.data.userList, pageNumber }));
                    } else {
                        dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    }
                }
            })
            .catch(er => {
                console.log(`searchFriend: `, er.response || er);
                handleServiceErrors(er, [searchParam, userId, pageNumber, preference], searchForFriend, true);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
            })
    };
}



export const addFavorite = (userId, senderId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(FRIENDS_BASE_URL + `addFavorite`, { userId, senderId }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log('addFavorite : ', res.data)
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                    dispatch(updateFavouriteFriendAction({ friendId: userId, favorite: true }))
                    // res.data.length > 0 && dispatch(addFriendsLocationAction(res.data));
                }
            })
            .catch(er => {
                console.log(`addFavorite error: `, er.response || er);
                handleServiceErrors(er, [userId, senderId], addFavorite, true);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}


export const removeFavorite = (userId, senderId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(FRIENDS_BASE_URL + `removeFavorite`, { userId, senderId }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log('removeFavorite : ', res.data)
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                    dispatch(updateFavouriteFriendAction({ friendId: userId, favorite: false }))
                    // res.data.length > 0 && dispatch(addFriendsLocationAction(res.data));
                }
            })
            .catch(er => {
                console.log(`removeFavorite error: `, er.response || er);
                handleServiceErrors(er, [userId, senderId], removeFavorite, true);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}


export const sendInvitationOrRequest = (requestBody) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.post(FRIENDS_BASE_URL + `sendInvitationOrRequest`, requestBody, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    dispatch(updateInvitationResponseAction(res.data));
                }
            })
            .catch(er => {
                console.log(`sendInvitationOrRequest: `, er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                handleServiceErrors(er, [requestBody], sendInvitationOrRequest, true);
                dispatch(updateInvitationResponseAction({ error: er.response.data || "Something went wrong" }));
            })
    };
}
export const sendFriendRequest = (requestBody, successCallback, errorCallback) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.post(FRIENDS_BASE_URL + `sendFriendRequest`, requestBody, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    typeof successCallback === "function" && successCallback(res.data)
                }
            })
            .catch(er => {
                console.log(`sendFriendRequest: `, er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                handleServiceErrors(er, [requestBody], sendFriendRequest, true);
                typeof errorCallback === "function" && errorCallback(er);
            })
    };
}
export const cancelFriendRequest = (senderId, personId, requestId, successCallback, errorCallback) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.delete(FRIENDS_BASE_URL + `cancelFriendRequest?senderId=${senderId}&userId=${personId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log('cancelFriendRequest : ', res.data)
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(updateFriendRequestListAction({ id: requestId }))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    // dispatch(updateSearchListAction({ userId: personId, relationship: RELATIONSHIP.UNKNOWN }));
                    dispatch(updateRelationshipAction({ personId, relationship: RELATIONSHIP.UNKNOWN }));
                    typeof successCallback === "function" && successCallback(res.data)
                }
            })
            .catch(er => {
                console.log(`cancelFriendRequest: `, er, er.response);
                handleServiceErrors(er, [senderId, personId, requestId], cancelFriendRequest, true);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                typeof errorCallback === "function" && errorCallback(er);
            })
    };
}

export const getAllFriendRequests = (userId, toggleLoader) => {
    return dispatch => {
        toggleLoader && dispatch(apiLoaderActions(true))
        axios.get(FRIENDS_BASE_URL + `getAllRequests?userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(apiLoaderActions(false))
                    dispatch(replaceFriendRequestListAction(res.data))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            })
            .catch(err => {
                handleServiceErrors(err, [userId, toggleLoader], getAllFriendRequests, false);
                dispatch(apiLoaderActions(false))
                console.log(err)
            })
    }
}
export const approveFriendRequest = (senderId, personId, actionDate, requestId, successCallback, errorCallback) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(FRIENDS_BASE_URL + `approveFriendRequest?senderId=${senderId}&userId=${personId}&date=${actionDate}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log('approveFriendRequest : ', res.data)
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(updateFriendRequestListAction({ id: requestId }))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    // dispatch(updateSearchListAction({ userId: personId, relationship: RELATIONSHIP.FRIEND }));
                    dispatch(updateRelationshipAction({ personId, relationship: RELATIONSHIP.FRIEND }));
                    typeof successCallback === 'function' && successCallback(res.data)
                }
            })
            .catch(er => {
                console.log(`approveFriendRequest: `, er, er.response);
                handleServiceErrors(er, [senderId, personId, actionDate, requestId], getAllFriendRequests, true);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                typeof errorCallback === 'function' && errorCallback(er)
            })
    };
}
export const rejectFriendRequest = (senderId, personId, requestId, successCallback, errorCallback) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(FRIENDS_BASE_URL + `rejectFriendRequest?senderId=${senderId}&userId=${personId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log('rejectFriendRequest : ', res.data)
                    dispatch(updateFriendRequestListAction({ id: requestId }))
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    // dispatch(updateSearchListAction({ userId: personId, relationship: RELATIONSHIP.UNKNOWN }));
                    dispatch(updateRelationshipAction({ personId, relationship: RELATIONSHIP.UNKNOWN }));
                    typeof successCallback === 'function' && successCallback(res.data)
                }
            })
            .catch(er => {
                console.log(`rejectFriendRequest error : `, er, er.response);
                handleServiceErrors(er, [senderId, personId, requestId], rejectFriendRequest, true);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                typeof errorCallback === 'function' && errorCallback(er)
            })
    };
}
export const doUnfriend = (senderId, personId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.delete(FRIENDS_BASE_URL + `unfriend?senderId=${senderId}&userId=${personId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('doUnfriend : ', res.data)
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    dispatch(doUnfriendAction({ personId }));
                    dispatch(updateCurrentFriendAction({ isFriend: false, userId: personId }));
                    dispatch(updatePrevProfileAction({ userId: personId }))
                }
            })
            .catch(er => {
                console.log(`unfriend: `, er.response || er);
                handleServiceErrors(er, [senderId, personId], doUnfriend, true);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const getFriendsLocationList = (userId, friendsIdList) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(GRAPH_BASE_URL + `getFriendsLocationList`, { userId, friendsIdList }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log('getFriendsLocationList : ', res.data)
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                    res.data.length > 0 && dispatch(addFriendsLocationAction(res.data));
                }
            })
            .catch(er => {
                console.log(`getFriendLocationList: `, er.response || er);
                handleServiceErrors(er, [userId, friendsIdList], getFriendsLocationList, true);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
// export const getFriendGroups = (userId, toggleLoader) => {
//     return dispatch => {
//         // dispatch(toggleLoaderAction(true));
//         toggleLoader && dispatch(apiLoaderActions(true))
//         axios.get(FRIENDS_BASE_URL + `getFriendGroups?memberId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
//             .then(res => {
//                 if (res.status === 200) {
//                     console.log('getFriendGroups : ',res.data)
//                     // dispatch(toggleLoaderAction(false));
//                     dispatch(apiLoaderActions(false))
//                     return dispatch(replaceFriendGroupListAction(res.data))
//                 }
//             })
//             .catch(er => {
//                 console.log(`getFriendGroups error: `, er.response);
//                 // TODO: Dispatch error info action
//                 // dispatch(toggleLoaderAction(false));
//                 dispatch(apiLoaderActions(false))
//             })
//     };
// }
export const getFriendGroups = (userId, toggleLoader, pageNumber, successCallback, errorCallback) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        toggleLoader && dispatch(apiLoaderActions(true))
        axios.get(FRIENDS_BASE_URL + `getFriendGroups?memberId=${userId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('getFriendGroups : ', res.data)
                if (res.status === 200) {
                    if (res.data.length > 0) {
                        dispatch(replaceFriendGroupListAction({ groupList: res.data, pageNumber: pageNumber }))
                        dispatch(apiLoaderActions(false))
                        dispatch(updatePageNumberAction({ pageNumber: pageNumber }));
                        dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                        successCallback(res.data)
                    }
                    // dispatch(toggleLoaderAction(false));

                    // return dispatch(replaceFriendGroupListAction(res.data))
                    else if (res.data.length === 0) {
                        dispatch(apiLoaderActions(false));
                        dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                        successCallback(res.data)
                    }
                }
            })
            .catch(er => {
                handleServiceErrors(er, [userId, toggleLoader, pageNumber, successCallback, errorCallback], getFriendGroups, false);
                dispatch(apiLoaderActions(false))
                errorCallback(er)
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));

            })
    };
}
export const createFriendGroup = (newGroupInfo) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.post(FRIENDS_BASE_URL + `createFriendGroup`, newGroupInfo, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('createFriendGroup : ', res.data);
                if (res.status === 200) {
                    newGroupInfo.groupId = res.data.groupId;
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    if (newGroupInfo.profilePicture) {
                        newGroupInfo.profilePicture = "data:" + newGroupInfo.mimeType + ";base64," + newGroupInfo.profilePicture
                    }
                    return dispatch(createFriendGroupAction(newGroupInfo))
                }
            })
            .catch(er => {
                console.log(`createFriendGroup error: `, er.response);
                handleServiceErrors(er, [newGroupInfo], createFriendGroup, true);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}

export const updateFriendGroup = (updatedGroupInfo) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(FRIENDS_BASE_URL + `updateFriendGroup`, updatedGroupInfo, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('updatedGroupInfo : ', res.data);
                if (res.status === 200) {
                    // newGroupInfo.groupId = res.data.groupId;
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    if (updatedGroupInfo.profilePicture) {
                        updatedGroupInfo.profilePicture = "data:" + updatedGroupInfo.mimeType + ";base64," + updatedGroupInfo.profilePicture
                    }
                    console.log('updatedGroupInfo : ', updatedGroupInfo)
                    return dispatch(updateCurrentGroupAction(updatedGroupInfo))
                }
            })
            .catch(er => {
                console.log(`updatedGroupInfo error: `, er.response);
                handleServiceErrors(er, [updatedGroupInfo], updatedGroupInfo, true);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}

export const exitFriendGroup = (groupId, memberId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(FRIENDS_BASE_URL + `exitFriendGroup?memberId=${memberId}&groupId=${groupId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    return dispatch(removeFriendGroupAction(groupId))
                }
            })
            .catch(er => {
                console.log(`exitFriendGroup error: `, er.response);
                handleServiceErrors(er, [groupId, memberId], exitFriendGroup, true);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
// export const getAllGroupMembers = (groupId, userId, groupName) => {
//     console.log('groupId  : ', groupId);
//     return dispatch => {
//         // dispatch(toggleLoaderAction(true));
//         dispatch(apiLoaderActions(true))
//         axios.get(FRIENDS_BASE_URL + `getAllGroupMembers?groupId=${groupId}&memberId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
//             .then(res => {
//                 if (res.status === 200) {
//                     console.log('getAllGroupMembers sucess: ', res);
//                     // dispatch(toggleLoaderAction(false));
//                     dispatch(apiLoaderActions(false))
//                     return dispatch(resetMembersFromCurrentGroupAction({ members: res.data, groupId: groupId, groupName: groupName }))
//                 }
//             })
//             .catch(er => {
//                 console.log(`getAllGroupMembers error: `, er.response ? er.response : er);
//                 // TODO: Dispatch error info action
//                 // dispatch(toggleLoaderAction(false));
//                 dispatch(apiLoaderActions(false))
//             })
//     };
// }

export const getGroupMembers = (groupId, userId, groupName, toggleLoader, pageNumber, successCallback, errorCallback) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        toggleLoader && dispatch(apiLoaderActions(true))
        axios.get(GRAPH_BASE_URL + `getMembers?groupId=${groupId}&memberId=${userId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200 && res.data.length > 0) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(updatePageNumberAction({ pageNumber: pageNumber }));
                    dispatch(resetMembersFromCurrentGroupAction({ members: res.data, groupId: groupId, groupName: groupName, pageNumber: pageNumber, userId: userId }))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    successCallback(res.data)
                }
                else if (res.data.length === 0) {
                    dispatch(apiLoaderActions(false));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    successCallback(false)
                }
            })
            .catch(er => {
                console.log(`getGroupMembers error: `, er.response ? er.response : er);
                handleServiceErrors(er, [groupId, userId, groupName, toggleLoader, pageNumber, successCallback, errorCallback], getGroupMembers, false)
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                errorCallback(er)
            })
    };
}

export const addMembers = (groupId, memberDetails) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(FRIENDS_BASE_URL + `addMembers?groupId=${groupId}`, memberDetails, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    return dispatch(addMembersToCurrentGroupAction(res.data))
                }
            })
            .catch(er => {
                console.log(`addMembers error: `, er)
                handleServiceErrors(er, [groupId, memberDetails], addMembers, true)
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const makeMemberAsAdmin = (groupId, memberId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(FRIENDS_BASE_URL + `makeMemberAsAdmin?groupId=${groupId}&memberId=${memberId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // setTimeout(() => dispatch(toggleLoaderAction(false)), 1000);
                    dispatch(apiLoaderActions(false))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    return dispatch(updateMemberAction({ memberId, updates: { isAdmin: true } }));
                }
            })
            .catch(er => {
                console.log(`makeMemberAsAdmin: `, er.response ? er.response : er);
                handleServiceErrors(er, [groupId, memberId], makeMemberAsAdmin, true)
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const dismissMemberAsAdmin = (groupId, memberId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(FRIENDS_BASE_URL + `dismissMemberAsAdmin?groupId=${groupId}&memberId=${memberId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    return dispatch(updateMemberAction({ memberId, updates: { isAdmin: false } }));
                }
            })
            .catch(er => {
                console.log(`dismissMemberAsAdmin: `, er.response ? er.response : er);
                handleServiceErrors(er, [groupId, memberId], dismissMemberAsAdmin, true)
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const removeMember = (groupId, memberId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(FRIENDS_BASE_URL + `removeMember?groupId=${groupId}&memberId=${memberId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    return dispatch(removeMemberAction(memberId));
                }
            })
            .catch(er => {
                console.log(`removeMember: `, er.response ? er.response : er);
                handleServiceErrors(er, [groupId, memberId], removeMember, true)
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const getAllMembersLocation = (groupId, userId) => {
    return dispatch => {
        dispatch(apiLoaderActions(true));
        axios.get(GRAPH_BASE_URL + `getAllMembersLocation?userId=${userId}&groupId=${groupId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(apiLoaderActions(false));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                res.data.length > 0 && dispatch(addMembersLocationAction({ list: res.data, groupId }));
            })
            .catch(er => {
                console.log(`getAllMembersLocation error: `, er.response || er);
                dispatch(apiLoaderActions(false));
                handleServiceErrors(er, [userId], getAllMembersLocation, false);
            })
    }
}
export const getAllMembersAndFriendsLocationList = (userId, ids) => {
    return dispatch => {
        axios.put(GRAPH_BASE_URL + `getAllMembersAndFriendsLocationList`, { userId, ...ids }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                if (res.data.friendList.length > 0) dispatch(updateFriendsLocationAction(res.data.friendList));
                if (Object.keys(res.data.groupList || {}).length > 0) dispatch(updateGroupsLocationAction(res.data.groupList));
            })
            .catch(er => {
                // differentErrors(er, [userId, friendsIdList, groupIdList], getAllMembersAndFriendsLocationList, false);
                console.log(`getAllMembersAndFriendsLocationList error: `, er.response || er);
            })
    }
}
export const getSpaces = (userId, successCallback, errorCallback) => {
    axios.get(`${USER_BASE_URL}getSpaces/${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        .then(res => {
            console.log("getSpaces success: ", res.data);
            typeof successCallback === 'function' && successCallback(res.data);
        })
        .catch(er => {
            console.log(`getSpaces error: `, er.response || er);
            typeof errorCallback === 'function' && errorCallback(er.response || er);
        })
}
export const getGarageInfo = (userId, successCallback, errorCallback) => {
    // return dispatch => {
    //     dispatch(toggleLoaderAction(true));
    //     axios.get(USER_BASE_URL + `getGarage/${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
    //         .then(res => {
    //             dispatch(toggleLoaderAction(false));
    //             console.log("getGarage success: ", res.data);
    //             dispatch(replaceGarageInfoAction(res.data))
    //         })
    //         .catch(er => {
    //             console.log(`getGarage: `, er.response);
    //             // TODO: Dispatch error info action
    //             dispatch(toggleLoaderAction(false));
    //         })
    // };
    axios.get(USER_BASE_URL + `getGarage/${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        .then(res => {
            console.log('getGarage apoi : ', res.data);
            successCallback(res.data);
            store.dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
        })
        .catch(er => {
            console.log("getGarage error: ", er.response || er);
            handleServiceErrors(er, [userId, successCallback, errorCallback], getGarageInfo, false);
            errorCallback(er.response || er);
        })
}
export const updateGarageName = (garageName, garageId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true));
        axios.put(USER_BASE_URL + 'updateGarage', { garageName, garageId }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                return dispatch(updateGarageNameAction(garageName))
            })
            .catch(er => {
                console.log(`updateGarageName: `, er.response);
                handleServiceErrors(er, [garageName, garageId], updateGarageName, true);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false));
            })
    };
}
export const addBikeToGarage = (userId, bike, pictureList, successCallback, errorCallback) => {
    return dispatch => {
        axios.put(USER_BASE_URL + `addSpace/${userId}`, { ...bike, pictureList }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    bike.spaceId = res.data.spaceId;
                    bike.picture = res.data.picture;
                    dispatch(addToBikeListAction({ bike }));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                    successCallback(true);
                }
            })
            .catch(er => {
                console.log(`addSpace error: `, er.response || er);
                errorCallback(false);
                handleServiceErrors(er, [userId, bike, pictureList, successCallback, errorCallback], addBikeToGarage, true);
            })
    };
}
export const editBike = (userId, bike, pictureList, successCallback, errorCallback) => {
    return dispatch => {
        axios.put(USER_BASE_URL + `updateSpace/${userId}`, { ...bike, pictureList }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(({ data }) => {
                if (!bike.picture) bike.picture = data.picture;
                dispatch(updateBikeListAction(bike));
                successCallback(true);
            })
            .catch(er => {
                console.log("updateSpace error: ", er.response || er);
                errorCallback(false);
                handleServiceErrors(er, [userId, bike, pictureList, successCallback, errorCallback], editBike, true);
            })
    };
}
export const setBikeAsActive = (userId, spaceId) => {
    return dispatch => {
        dispatch(apiLoaderActions(true));
        axios.put(USER_BASE_URL + `setDefaultSpace/${userId}/${spaceId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(apiLoaderActions(false));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                dispatch(updateActiveBikeAction(spaceId));
            })
            .catch(er => {
                console.log(`setDefaultSpace error: `, er.response || er);
                handleServiceErrors(er, [userId, spaceId, newActiveIndex], setBikeAsActive, true);
                dispatch(apiLoaderActions(false));
            })
    };
}
export const deleteBike = (userId, bikeId) => {
    return dispatch => {
        dispatch(apiLoaderActions(true));
        axios.delete(USER_BASE_URL + `deleteSpace/${userId}/${bikeId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(apiLoaderActions(false));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                dispatch(deleteBikeFromListAction(bikeId));
            })
            .catch(er => {
                console.log(`deleteBike: `, er.response);
                handleServiceErrors(er, [userId, bikeId], deleteBike, true);
                dispatch(apiLoaderActions(false));
            })
    };
}
export const getBikeAlbum = (userId, spaceId, pageNumber, successCallback, errorCallback, preference = 15) => {
    return dispatch => {
        dispatch(apiLoaderActions(true));
        axios.get(`${USER_BASE_URL}getPicturesBySpaceId/${userId}/spaceId/${spaceId}?pageNumber=${pageNumber}&preference=${preference}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(({ data }) => {
                dispatch(apiLoaderActions(false));
                if (data.pictures.length > 0) {
                    typeof successCallback === 'function' && successCallback(data);
                    dispatch(updateBikeAlbumAction({ updates: data.pictures, reset: !pageNumber }));
                } else {
                    typeof errorCallback === 'function' && errorCallback({ isEmpty: true });
                }
            }).catch(er => {
                console.log(`getPicturesBySpaceId error: `, er.response || er);
                handleServiceErrors(er, [userId, spaceId], getBikeAlbum, false);
                dispatch(apiLoaderActions(false));
                typeof errorCallback === 'function' && errorCallback(er);
            })
    }
}

export const getRoadBuddies = (userId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.get(GRAPH_BASE_URL + `getRoadBuddies?userId=${userId}&pageNumber=${0}&preference=${4}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("getRoadBuddies success: ", res.data);
                dispatch(replaceFriendListAction({ friendList: res.data.friendList, pageNumber: 0 }))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                dispatch(apiLoaderActions(false))
            })
            .catch(er => {
                console.log(`getRoadBuddies error: `, er.response || er);
                handleServiceErrors(er, [userId], getRoadBuddies, false);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}


export const updateMyWallet = (userId, insurance, roadsideAssistance, successCallback, errorCallback) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(USER_BASE_URL + `updateMyWallet/${userId}`, { insurance, roadsideAssistance }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("updateMyWallet success: ", res.data);
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false));
                dispatch(updateUserMyWalletAction(res.data));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                successCallback(false)
            })
            .catch(er => {
                console.log(`updateMyWallet error: `, er.response || er);
                handleServiceErrors(er, [userId, insurance, roadsideAssistance, successCallback, errorCallback], updateMyWallet, true);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                errorCallback(false)
            })
    };
}
export const getMyWallet = (userId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.get(USER_BASE_URL + `getMyWallet/${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("getMyWallet success: ", res.data);
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false));
                dispatch(storeUserMyWalletAction(res.data))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
            })
            .catch(er => {
                console.log(`getMyWallet error: `, er.response || er);
                handleServiceErrors(er, [userId], getMyWallet, false);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}


export const getPassengerList = (userId, pageNumber, preference, successCallback, errorCallback) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        // axios.get(USER_BASE_URL + `getAllPassengersByUserId/${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        axios.get(USER_BASE_URL + `getAllPassengersByUserId?userId=${userId}&pageNumber=${pageNumber}&preference=${preference}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("getAllPassengersByUserId success: ", res.data);
                // dispatch(toggleLoaderAction(false));
                if (res.status === 200 && res.data.passengerList.length > 0) {
                    dispatch(apiLoaderActions(false))
                    dispatch(replacePassengerListAction({ passengerList: res.data.passengerList, pageNumber: pageNumber }))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    successCallback(res.data)
                }
                else if (res.data.passengerList.length === 0) {
                    dispatch(apiLoaderActions(false));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    successCallback(res.data)
                }
            })
            .catch(er => {
                console.log(`getAllPassengersByUserId error: `, er.response || er);
                handleServiceErrors(er, [userId, pageNumber, preference, successCallback, errorCallback], getPassengerList, false);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                errorCallback(er)
            })
    };
}
export const registerPassenger = (userId, passenger) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.post(USER_BASE_URL + `registerPassenger`, { userId, ...passenger }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('registerPassenger : ', res.data)
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                passenger.passengerId = res.data.passengerId;
                if (res.data.isFriend) {
                    console.log('isFriend True')
                    dispatch(updateCommunityListAction({ userId: res.data.passengerUserId }))
                }
                dispatch(addToPassengerListAction(res.data))
            })
            .catch(er => {
                console.log(`registerPassenger error: `, er.response || er);
                handleServiceErrors(er, [userId, passenger], registerPassenger, true);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const updatePassengerDetails = (psngId, passenger) => {
    const { passengerId, ...passengerDetail } = passenger;
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.patch(USER_BASE_URL + `updatePassengerDetails/${psngId}`, { ...passengerDetail }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("updatePassengerDetails success: ", res.data);
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                dispatch(updatePassengerInListAction(res.data))
            })
            .catch(er => {
                console.log(`updatePassengerDetails error: `, er.response || er);
                handleServiceErrors(er, [passenger], updatePassengerDetails, true);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const deletePassenger = (passengerId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.delete(USER_BASE_URL + `deletePassenger/${passengerId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("deletePassenger success: ", res.data);
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                dispatch(removeFromPassengerListAction(passengerId))
            })
            .catch(er => {
                console.log(`deletePassenger error: `, er.response || er);
                handleServiceErrors(er, [passengerId], deletePassenger, true);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}



export const getCommunityFriendsList = (userId, pageNumber, preference, successCallback, errorCallback) => {
    console.log('pageNumber : ', pageNumber)
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.get(FRIENDS_BASE_URL + `getCommunityFriendsList?userId=${userId}&pageNumber=${pageNumber}&preference=${preference}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("getCommunityFriendsList success: ", res.data);
                if (res.status === 200 && res.data.friendList.length > 0) {
                    dispatch(apiLoaderActions(false))
                    dispatch(replaceCommunityListAction({ communityList: res.data.friendList, pageNumber: pageNumber }))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    dispatch(updatePageNumberAction({ pageNumber: pageNumber }));
                    successCallback(res.data)
                }
                else if (res.data.friendList.length === 0) {
                    dispatch(apiLoaderActions(false));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    successCallback(false)
                }
            })
            .catch(er => {
                console.log(`getCommunityFriendsList error: `, er.response || er);
                handleServiceErrors(er, [userId, pageNumber, preference, successCallback, errorCallback], getCommunityFriendsList, false);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                errorCallback(er)
            })
    };
}



export const getAlbum = (userId, pageNumber, preference, successCallback, errorCallback) => {
    return dispatch => {
        axios.get(USER_BASE_URL + `getAlbumByUserId?userId=${userId}&pageNumber=${pageNumber}&preference${preference}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    if (res.data.pictureList.length > 0) {
                        // const pictureList = res.data.pictureList.map(picId => ({ profilePictureId: picId }));
                        dispatch(replaceAlbumListAction({ pageNumber, pictureList: res.data.pictures }))
                        dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                        dispatch(updatePageNumberAction({ pageNumber: pageNumber }));
                        // dispatch(toggleLoaderAction(false));
                        successCallback(res.data)
                    }
                    else {
                        successCallback(res.data)
                        dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    }
                }
            })
            .catch(er => {
                console.log(`getAlbum error: `, er.response || er);
                handleServiceErrors(er, [userId, pageNumber, preference = 15, successCallback, errorCallback], getAlbum, false);
                // TODO: Dispatch error info action
                errorCallback(er)
            })
    };
}
export const getBuddyAlbum = (userId, friendId, pageNumber, preference, buddyAlbum, successCallback, errorCallback) => {
    console.log('pageNumber : ', pageNumber)
    return dispatch => {
        axios.get(`${USER_BASE_URL}users/${userId}/friend/${friendId}/album?pageNumber=${pageNumber}&preference=${preference}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("getBuddyAlbum success: ", res.data);
                if (res.status === 200) {
                    const updatedBuddyAlbum = [...buddyAlbum, ...res.data.pictures]
                    res.data.pictures.length > 0 && dispatch(updateCurrentFriendAction({ pictures: updatedBuddyAlbum, userId: friendId }));
                    successCallback(res.data)
                }
            })
            .catch(er => {
                console.log(`getBuddyAlbum error: `, er.response || er);
                handleServiceErrors(er, [userId, friendId, pageNumber, preference, successCallback, errorCallback], getBuddyAlbum, false);
                // TODO: Dispatch error info action
                errorCallback(er)
            })
    };
}


export const getAllChats = (userId) => {
    console.log('user id getAllChat : ', userId)
    return dispatch => {
        axios.get(CHAT_BASE_URL + `getAllChats?userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("getAllChats success: ", res.data);
                if (res.status === 200) {
                    dispatch(updateChatListAction({ comingFrom: 'getAllChatsApi', chatList: res.data }));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    // dispatch(toggleLoaderAction(false));
                }
            })
            .catch(er => {
                console.log(`getAllChats error: `, er.response || er);
                handleServiceErrors(er, [userId], getAllChats, false);
                // TODO: Dispatch error info action
            })
    };
}


export const getAllMessages = (id, userId, isGroup) => {
    return dispatch => {
        axios.get(CHAT_BASE_URL + `getAllMessages?id=${id}&userId=${userId}&isGroup=${isGroup}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("getAllMessages success: ", res.data);
                if (res.status === 200) {
                    dispatch(updateChatMessagesAction(res.data));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))

                    // dispatch(toggleLoaderAction(false));
                }
            })
            .catch(er => {
                console.log(`getAllMessages error: `, er);
                handleServiceErrors(er, [id, userId, isGroup], getAllMessages, false);
                // TODO: Dispatch error info action
            })
    };
}

export const sendMessage = (isGroup, id, userId, content, name, nickname, senderPictureId, type = 'text', media) => {
    return dispatch => {
        const body = { senderPictureId, isGroup, id, senderId: userId, senderName: name, senderNickname: nickname, date: new Date().toISOString(), type, content, media };
        axios.post(CHAT_BASE_URL + `sendMessage`, body, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    const messageSent = {
                        type, content, senderPictureId,
                        date: new Date().toISOString(),
                        media: res.data.media,
                        messageId: res.data.messageId,
                        senderId: userId,
                        senderName: name,
                        senderNickname: nickname
                    };
                    dispatch(replaceChatMessagesAction(messageSent));
                    dispatch(updateChatListAction({ comingFrom: 'sendMessgaeApi', newMessage: messageSent, id: id }));
                }
            })
            .catch(er => {
                console.log('sendMessage error : ', er);
            })
    };
}
export const deleteMessagesById = (isGroup, id, userId, messageToBeDeleted, newChatMessages) => {
    console.log('newChatMessages api : ', newChatMessages)
    return dispatch => {
        axios.put(CHAT_BASE_URL + `deleteMessagesById`, { isGroup: isGroup, id: id, userId: userId, messageIdList: messageToBeDeleted }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('deleteMessagesById : ', res.data)
                if (res.status === 200) {
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    dispatch(replaceChatMessagesAction({ comingFrom: 'deleteMessage', messageIds: messageToBeDeleted }))
                    if (newChatMessages) {
                        dispatch(updateChatListAction({ comingFrom: 'sendMessgaeApi', newMessage: newChatMessages, id: id }));
                    }
                }
            })
            .catch(er => {
                handleServiceErrors(er, [isGroup, id, userId, messageToBeDeleted, newChatMessages], deleteMessagesById, true);
                console.log('deleteMessagesById  error : ', er);
            })
    };
}
export const deleteMessagesByIdForEveryone = (isGroup, id, userId, messageToBeDeleted, newChatMessages) => {
    return dispatch => {
        axios.put(CHAT_BASE_URL + `deleteMessagesByIdForEveryone `, { isGroup: isGroup, id: id, userId: userId, messageIdList: messageToBeDeleted }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('deleteMessagesByIdForEveryone  : ', res.data)
                if (res.status === 200) {
                    dispatch(replaceChatMessagesAction({ comingFrom: 'deleteMessage', messageIds: messageToBeDeleted }))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    if (newChatMessages) {
                        dispatch(updateChatListAction({ comingFrom: 'sendMessgaeApi', newMessage: newChatMessages, id: id }));
                    }
                    else {
                        dispatch(updateChatListAction({ comingFrom: 'sendMessgaeApi', newMessage: '', id: id }));
                    }
                }
            })
            .catch(er => {
                handleServiceErrors(er, [isGroup, id, userId, messageToBeDeleted, newChatMessages], deleteMessagesByIdForEveryone, true);
                console.log('deleteMessagesByIdForEveryone   error : ', er);
            })
    };
}

export const deleteAllMessages = (id, userId, isGroup) => {
    return dispatch => {
        axios.delete(CHAT_BASE_URL + `deleteAllMessages?id=${id}&userId=${userId}&isGroup=${isGroup}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("deleteAllMessages success: ", res.data);
                if (res.status === 200) {
                    dispatch(replaceChatMessagesAction({ comingFrom: 'deleteAllMessages', id: id }))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            })
            .catch(er => {
                console.log(`deleteAllMessages error: `, er.response || er);
                handleServiceErrors(er, [isGroup, id, userId, messageToBeDeleted, newChatMessages], deleteAllMessages, true);
                // TODO: Dispatch error info action
            })
    };
}
export const seenMessage = (id, userId, isGroup, comingFrom) => {
    return dispatch => {
        axios.put(CHAT_BASE_URL + `seenMessage?id=${id}&userId=${userId}&isGroup=${isGroup}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("seenMessage success: ", res.data);
                if (res.status === 200) {
                    if (comingFrom === 'chatList') {
                        dispatch(resetMessageCountAction({ id: id, comingFrom: 'seenMessage' }));
                    }

                }
            })
            .catch(er => {
                console.log(`seenMessage error: `, er.response || er);
                // TODO: Dispatch error info action
            })
    };
}

export const createPost = (userId, spaceId, postData, successCallback, errorCallback) => {
    return dispatch => {
        dispatch(apiLoaderActions(true));
        axios.post(`${POSTS_BASE_URL}users/${userId}/posts`, { userId, metaData: { spaceId }, ...postData }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(apiLoaderActions(false));
                    console.log("createPost success: ", res.data);
                    typeof successCallback === 'function' && successCallback(res.data);
                }
            })
            .catch(er => {
                dispatch(apiLoaderActions(false));
                console.log(`createPost error: `, er.response || er);
                typeof errorCallback === 'function' && errorCallback(er.response || er);
                handleServiceErrors(er, [userId, spaceId, postData, successCallback, errorCallback], createPost, true);
            })
    }
}
export const getPosts = (userId, postTypeId, spaceId, pageNumber = 0) => {
    const URL_ENDPOINT = `user/${userId}/postType/${postTypeId}` + (spaceId ? `?spaceId=${spaceId}` : '');
    return axios.get(`${POSTS_BASE_URL}${URL_ENDPOINT}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT });
}

export const deletePost = (postId, successCallback, errorCallback) => {
    return dispatch => {
        dispatch(apiLoaderActions(true));
        axios.delete(`${POSTS_BASE_URL}posts/${postId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(apiLoaderActions(false));
                console.log("deletePost success: ", res);
                typeof successCallback === 'function' && successCallback();
            })
            .catch(er => {
                dispatch(apiLoaderActions(false));
                console.log(`deletePost error: `, er.response || er);
                typeof errorCallback === 'function' && errorCallback(er.response || er);
                handleServiceErrors(er, [postId, successCallback, errorCallback], deletePost, true);
            })
    }
}

export const handleServiceErrors = (error, params, api, isTimeout) => {
    console.log('error.message : ', error.message)
    if (error.message === 'Network Error' && store.getState().PageState.hasNetwork === false && isTimeout === false) {
        store.dispatch(errorHandlingAction({ currentScene: Actions.currentScene, config: error.config, params: params, api: api, isRetryApi: false }));

    }
    else if (error.message === 'Network Error' && store.getState().PageState.hasNetwork === true) {
        console.log('service is down')
        store.dispatch(errorHandlingAction({ currentScene: Actions.currentScene, config: error.config, params: params, api: api, isRetryApi: true }));

    }
    else if (error.message === 'timeout of 10000ms exceeded') {
        console.log('request timeout')
        store.dispatch(errorHandlingAction({ currentScene: Actions.currentScene, config: error.config, params: params, api: api, isRetryApi: true }));

    }

}




