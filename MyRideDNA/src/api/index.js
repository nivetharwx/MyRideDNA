import {
    updateSignupResultAction, updateRideAction, updateWaypointAction, updateUserAction, toggleLoaderAction,
    replaceRideListAction, deleteRideAction, updateRideListAction, updateEmailStatusAction, updateFriendListAction, replaceFriendListAction, replaceGarageInfoAction, updateBikeListAction, addToBikeListAction, deleteBikeFromListAction, updateActiveBikeAction, updateGarageNameAction, replaceShortSpaceListAction, replaceSearchFriendListAction, updateRelationshipAction, createFriendGroupAction, replaceFriendGroupListAction, addMembersToCurrentGroupAction, resetMembersFromCurrentGroupAction, updateMemberAction, removeMemberAction, addWaypointAction,
    deleteWaypointAction, removeFriendGroupAction, updatePasswordSuccessAction, updatePasswordErrorAction, screenChangeAction, addToPassengerListAction, replacePassengerListAction, updatePassengerInListAction, updateFriendAction, doUnfriendAction, updateFriendRequestResponseAction, updateOnlineStatusAction, resetNotificationListAction, updateNotificationAction, deleteNotificationsAction, replaceFriendRequestListAction, updateFriendRequestListAction, updateInvitationResponseAction, updateCurrentFriendAction, resetStateOnLogout, addFriendsLocationAction, apiLoaderActions, replaceFriendInfooAction, updateNotificationCountAction, isloadingDataAction
} from '../actions';
import { USER_BASE_URL, RIDE_BASE_URL, RECORD_RIDE_STATUS, RIDE_TYPE, PageKeys, USER_AUTH_TOKEN, FRIENDS_BASE_URL, HEADER_KEYS, RELATIONSHIP, GRAPH_BASE_URL, NOTIFICATIONS_BASE_URL, EVENTS_BASE_URL, APP_EVENT_NAME, APP_EVENT_TYPE, DEVICE_TOKEN } from '../constants';
import axios from 'axios';

import { AsyncStorage } from 'react-native';

import Base64 from '../util';
import { Actions } from 'react-native-router-flux';

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
                    errorCallback(res.data);
                } else {
                    successCallback(res.data);
                }
            }
        })
        .catch(er => {
            errorCallback(er.response || er);
        })
}
export const getPictureList = (pictureIdList, successCallback, errorCallback) => {
    axios.put(USER_BASE_URL + `getPictureList`, { pictureIdList }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        .then(res => {
            if (res.status === 200) {
                if (Object.keys(res.data).length === 0) {
                    errorCallback(res.data);
                } else {
                    successCallback(res.data);
                }
            }
        })
        .catch(er => {
            errorCallback(er.response || er);
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
export const getAllNotifications = (userId, pageNumber) => {
    console.log('pageNumber redux : ', pageNumber)
    return dispatch => {  
        dispatch(isloadingDataAction(true))
        axios.get(NOTIFICATIONS_BASE_URL + `getNotifications?userId=${userId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('getNotifications : ', res.data)
                if (res.status === 200 && res.data.notification.length > 0) {
                    dispatch(isloadingDataAction(false))
                    dispatch(resetNotificationListAction({ notificationData: res.data, pageNumber: pageNumber + 1 }));
                }
                else if(res.data.notification.length === 0){
                    dispatch(isloadingDataAction(false))
                }
            })
            .catch(er => {
                dispatch(isloadingDataAction(false))
                console.log("getNotifications error: ", er.response || er);
            })
    }
}
export const seenNotification = (userId) => {
    return dispatch => {
        axios.get(NOTIFICATIONS_BASE_URL + `seenNotification?userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log('seenNotification : ', res.data)
                    dispatch(updateNotificationCountAction(res.data));
                }
            })
            .catch(er => {
                console.log("seenNotification error: ", er.response || er);
            })
    }
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
    return dispatch => {
        axios.put(NOTIFICATIONS_BASE_URL + `deleteNotifications`, { notificationIds: [notificationIds] }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log("deleteNotifications success: ", res.data || res);
                    dispatch(deleteNotificationsAction({ notificationIds }));
                }
            })
            .catch(er => {
                console.log("deleteNotifications error: ", er.response || er);
            })
    }
}
export const deleteAllNotifications = (userId) => {
    return dispatch => {
        axios.delete(NOTIFICATIONS_BASE_URL + `deleteAllNotifications?userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log("deleteAllNotifications success: ", res.data || res);
                    dispatch(updateNotificationAction({ notificationId, notification: res.data }));
                }
            })
            .catch(er => {
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
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.post(USER_BASE_URL + `logoutUser`, { userId, accessToken, registrationToken: deviceToken }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
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
                    setTimeout(() => { dispatch(resetStateOnLogout()) }, 1000)
                }
            })
            .catch(er => {
                console.log(er.response);
                dispatch(apiLoaderActions(false))
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
        axios.post(USER_BASE_URL + 'registerUser', user, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(updateSignupResultAction(res.data));
                }
            })
            .catch(error => {
                dispatch(updateSignupResultAction(error.response.data));
                // TODO: Dispatch error info action
            })
    };
}
export const updateUserInfo = (userData, successCallback, errorCallback) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(USER_BASE_URL + 'updateUserDetails', userData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateUserAction(userData));
                    successCallback(false)
                }
            })
            .catch(er => {
                errorCallback(false)
                console.log("updateUserInfo: ", er.response || er);
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
                }
            })
            .catch(er => {
                console.log("updatePassword error: ", er.response || er);
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
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
                    dispatch(updateUserAction(userSettings));
                }
            })
            .catch(er => {
                console.log("updateUserSettings error: ", er.response || er);
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
                }
            })
            .catch(er => {
                console.log("updateShareLocationState: ", er.response || er);
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
                }
            })
            .catch(er => {
                // dispatch(profileLoaderActions(false))
                console.log(er.response);
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
export const getAllBuildRides = (userId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.get(RIDE_BASE_URL + `getAllBuildRides?userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log('getAllBuildRides : ', res.data);
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(replaceRideListAction({ rideType: RIDE_TYPE.BUILD_RIDE, rideList: res.data }));
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
export const getAllPublicRides = (userId, toggleLoader) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        toggleLoader && dispatch(apiLoaderActions(true))
        axios.get(RIDE_BASE_URL + `getAllPublicRides?userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    console.log('getAllPublic : ', res.data)
                    dispatch(apiLoaderActions(false))
                    dispatch(replaceRideListAction({ rideType: RIDE_TYPE.SHARED_RIDE, rideList: res.data }));
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
export const getAllRecordedRides = (userId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.get(RIDE_BASE_URL + `getAllRecordRides?userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log('getAllRecordRides : ', res.data);
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(replaceRideListAction({ rideType: RIDE_TYPE.RECORD_RIDE, rideList: res.data }));
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
                }
            })
            .catch(er => {
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
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
                console.log(er.response);
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
export const deleteRide = (rideId, index, rideType) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.delete(RIDE_BASE_URL + `deleteRide?rideId=${rideId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(deleteRideAction({ rideType, index }));
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
export const addTrackpoints = (trackpoints, distance, ride, userId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.post(RIDE_BASE_URL + `addTrackpoints?rideId=${ride.rideId}&userId=${userId}`,
            { trackpoints: Base64.encode(trackpoints.join()), distance }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(updateRideAction({ ...ride, trackpoints: [...ride.trackpoints, ...trackpoints] }));
                }
            })
            .catch(er => {
                console.log("addTrackpoints error: ", er || er.response);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const pauseRecordRide = (pauseTime, trackpoints, distance, ride, userId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `pauseRecordRide?rideId=${ride.rideId}&userId=${userId}`,
            { trackpoints: Base64.encode(trackpoints.join()), pauseTime, distance }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(updateRideAction({ ...ride, trackpoints: [...ride.trackpoints, ...trackpoints], ...res.data }));
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
export const completeRecordRide = (endTime, trackpoints, distance, ride, userId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `completeRecordRide?rideId=${ride.rideId}&userId=${userId}`,
            { trackpoints: Base64.encode(trackpoints.join()), endTime, distance }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(updateRideAction({ ...ride, trackpoints: [...ride.trackpoints, ...trackpoints], status: RECORD_RIDE_STATUS.COMPLETED }));
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
                    dispatch(updateRideAction({ ...ride, ...res.data }));
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
                console.log(er.response);
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
                console.log(er.response);
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
                console.log(er.response);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const updateWaypoint = (waypoint, ride, index) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `updateWaypoint?rideId=${ride.rideId}&index=${index}`, waypoint, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    return dispatch(updateWaypointAction({ index, waypoint }));
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
export const updateSource = (waypoint, ride) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `updateSource?rideId=${ride.rideId}`, waypoint, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    return dispatch(updateRideAction({ source: waypoint }));
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
                console.log(er.response);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const updateDestination = (waypoint, ride) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `updateDestination?rideId=${ride.rideId}`, waypoint, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    return dispatch(updateRideAction({ destination: waypoint }));
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
                console.log(er.response);
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
                console.log(er.response);
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
                console.log(er.response);
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
                console.log(er.response);
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
                console.log(er.response);
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
                console.log("Synced with server");
                successCallback && successCallback();
            }
        })
        .catch(er => {
            console.log(er.response || er);
            errorCallback && errorCallback(er.response || er);
            // ToDo handle timeout error seperately for map
        })
}
export const getRideByRideId = (rideId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.get(RIDE_BASE_URL + `getRideByRideId?rideId=${rideId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(updateRideAction({ ...res.data }));
                }
            })
            .catch(er => {
                console.log(`getRideByRideId: ${RIDE_BASE_URL}getRideByRideId?rideId=${rideId}`, er.response);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const getAllFriends = (friendType, userId, pageNumber, toggleLoader) => {
    return dispatch => {
        toggleLoader && dispatch(apiLoaderActions(true))
        // pageNumber > 0 && dispatch(toggleLoaderAction(true));
        pageNumber > 0 && dispatch(apiLoaderActions(true));
        // axios.get(FRIENDS_BASE_URL + `getFriendList?userId=${userId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        axios.get(GRAPH_BASE_URL + `getFriendList?userId=${userId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false));
                    // DOC: Calling for getting online friends
                    // dispatch(getAllOnlineFriends(userId));
                    if (pageNumber === 0) {
                        dispatch(replaceFriendListAction({ friendType, friendList: res.data }))
                    } else {
                        dispatch(updateFriendListAction({ friendType, friendList: res.data }))
                    }
                }
            })
            .catch(er => {
                console.log(`getAllFriends: `, er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false));
            })
    };
}
export const getUserById = (userId) => {
    return dispatch => {
        dispatch(apiLoaderActions(true));
        axios.get(GRAPH_BASE_URL + `getUserById?userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log('getUserById : ', res)
                    dispatch(replaceFriendInfooAction(res.data));
                    dispatch(apiLoaderActions(false));
                }
            })
            .catch(er => {
                console.log(`getUserById: `, er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false));
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
export const searchForFriend = (searchParam, userId, pageNumber) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        axios.get(FRIENDS_BASE_URL + `searchFriend?searchParam=${searchParam}&userId=${userId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    return dispatch(replaceSearchFriendListAction(res.data));
                }
            })
            .catch(er => {
                console.log(`searchFriend: `, er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
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
                    console.log("sendInvitationOrRequest: ", res.data);
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(updateInvitationResponseAction(res.data));
                }
            })
            .catch(er => {
                console.log(`sendInvitationOrRequest: `, er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                dispatch(updateInvitationResponseAction({ error: er.response.data || "Something went wrong" }));
            })
    };
}
export const sendFriendRequest = (requestBody) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.post(FRIENDS_BASE_URL + `sendFriendRequest`, requestBody, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log("sendFriendRequest: ", res.data);
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(updateFriendRequestResponseAction(res.data));
                }
            })
            .catch(er => {
                console.log(`sendFriendRequest: `, er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                dispatch(updateFriendRequestResponseAction({ error: er.response.data || "Something went wrong" }));
            })
    };
}
export const cancelFriendRequest = (senderId, personId, requestId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.delete(FRIENDS_BASE_URL + `cancelFriendRequest?senderId=${senderId}&userId=${personId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log('cancelFriendRequest sucess : ', res)
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(updateFriendRequestListAction({ id: requestId }))
                    return dispatch(updateRelationshipAction({ personId, relationship: RELATIONSHIP.UNKNOWN }));
                }
            })
            .catch(er => {
                console.log(`cancelFriendRequest: `, er, er.response);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
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
                }
            })
            .catch(err => {
                dispatch(apiLoaderActions(false))
                console.log(err)
            })
    }
}
export const approveFriendRequest = (senderId, personId, actionDate, requestId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(FRIENDS_BASE_URL + `approveFriendRequest?senderId=${senderId}&userId=${personId}&date=${actionDate}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log('approveFriendRequest sucess: ', res)
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    dispatch(updateFriendRequestListAction({ id: requestId }))
                    return dispatch(updateRelationshipAction({ personId, relationship: RELATIONSHIP.FRIEND }));
                }
            })
            .catch(er => {
                console.log(`approveFriendRequest: `, er, er.response);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const rejectFriendRequest = (senderId, personId, requestId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(FRIENDS_BASE_URL + `rejectFriendRequest?senderId=${senderId}&userId=${personId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {

                    console.log('rejectFriendRequest success: ', res)
                    dispatch(updateFriendRequestListAction({ id: requestId }))
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    return dispatch(updateRelationshipAction({ personId, relationship: RELATIONSHIP.UNKNOWN }));
                }
            })
            .catch(er => {
                console.log(`rejectFriendRequest error : `, er, er.response);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const doUnfriend = (senderId, personId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.delete(FRIENDS_BASE_URL + `unfriend?senderId=${senderId}&userId=${personId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log('unfriend sucess : ', res)
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    return dispatch(doUnfriendAction({ personId }));
                }
            })
            .catch(er => {
                console.log(`unfriend: `, er.response || er);
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
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    console.log('getFriendsLocationList sucess : ', res);
                    res.data.length > 0 && dispatch(addFriendsLocationAction(res.data));
                }
            })
            .catch(er => {
                console.log(`getFriendLocationList: `, er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const getFriendGroups = (userId, toggleLoader) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        toggleLoader && dispatch(apiLoaderActions(true))
        axios.get(FRIENDS_BASE_URL + `getFriendGroups?memberId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    return dispatch(replaceFriendGroupListAction(res.data))
                }
            })
            .catch(er => {
                console.log(`getFriendGroups: `, er.response);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const createFriendGroup = (newGroupInfo) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.post(FRIENDS_BASE_URL + `createFriendGroup`, newGroupInfo, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log(`createFriendGroup : `, res.data);
                    newGroupInfo.groupId = res.data.groupId;
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    return dispatch(createFriendGroupAction(newGroupInfo))
                }
            })
            .catch(er => {
                console.log(`createFriendGroup error: `, er.response);
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
                    console.log('exitFriendGroup : ', res.data);
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    return dispatch(removeFriendGroupAction(groupId))
                }
            })
            .catch(er => {
                console.log(`exitFriendGroup: `, er.response);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const getAllGroupMembers = (groupId, userId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.get(FRIENDS_BASE_URL + `getAllGroupMembers?groupId=${groupId}&memberId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log('getAllGroupMembers sucess: ', res.data);
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    return dispatch(resetMembersFromCurrentGroupAction(res.data))
                }
            })
            .catch(er => {
                console.log(`getAllGroupMembers error: `, er.response ? er.response : er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
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
                    console.log('addMembers sucess: ', res.data);
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    return dispatch(addMembersToCurrentGroupAction(res.data))
                }
            })
            .catch(er => {
                console.log(`addMembers error: `, er.response ? er.response : er);
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
                    console.log(res.data);
                    // setTimeout(() => dispatch(toggleLoaderAction(false)), 1000);
                    dispatch(apiLoaderActions(false))
                    return dispatch(updateMemberAction({ memberId, updates: { isAdmin: true } }));
                }
            })
            .catch(er => {
                console.log(`makeMemberAsAdmin: `, er.response ? er.response : er);
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
                    console.log(res.data);
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    return dispatch(updateMemberAction({ memberId, updates: { isAdmin: false } }));
                }
            })
            .catch(er => {
                console.log(`dismissMemberAsAdmin: `, er.response ? er.response : er);
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
                    console.log(res.data);
                    // dispatch(toggleLoaderAction(false));
                    dispatch(apiLoaderActions(false))
                    return dispatch(removeMemberAction(memberId));
                }
            })
            .catch(er => {
                console.log(`removeMember: `, er.response ? er.response : er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const getSpaceList = (userId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true));
        axios.get(USER_BASE_URL + `getSpaceList?userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("getSpaceList success: ", res.data);
                dispatch(apiLoaderActions(false));
                // dispatch(toggleLoaderAction(false));
                dispatch(replaceShortSpaceListAction(res.data))
            })
            .catch(er => {
                console.log(`getSpaceList: `, er.response);
                // TODO: Dispatch error info action
                dispatch(apiLoaderActions(false));
                // dispatch(toggleLoaderAction(false));
            })
    };
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
            successCallback(res.data);
        })
        .catch(er => {
            console.log("getGarage error: ", er.response || er);
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
                return dispatch(updateGarageNameAction(garageName))
            })
            .catch(er => {
                console.log(`updateGarageName: `, er.response);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false));
            })
    };
}
export const addBikeToGarage = (userId, bike, pictureList, successCallback, errorCallback) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        axios.put(USER_BASE_URL + `addSpace/${userId}`, { ...bike, pictureList }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('add bike to garage : ', res)
                if (res.status === 200) {
                    // console.log(`addSpace success: `, res.data);
                    // dispatch(toggleLoaderAction(false));
                    bike.pictureIdList = res.data.pictureIdList || [];
                    bike.pictureList = res.data.pictureList || [];
                    bike.spaceId = res.data.spaceId;
                    dispatch(addToBikeListAction({ bike }));
                    successCallback(true)
                }
            })
            .catch(er => {
                errorCallback(false)
                console.log(`addSpace error: `, er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
            })
    };
}
export const editBike = (userId, bike, pictureList, index, successCallback, errorCallback) => {
    // export const editBike = (userId, bike, index) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(USER_BASE_URL + `updateSpace/${userId}`, { ...bike, pictureList }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("updateSpace success: ", res.data);
                bike.pictureIdList = res.data.pictureIdList || [];
                // dispatch(toggleLoaderAction(false));
                dispatch(updateBikeListAction({ index, bike }));
                successCallback(true)
                // console.log("updateSpace success: ", res.data);
                // dispatch(toggleLoaderAction(false));
                // dispatch(updateBikeListAction({ index, bike }))
            })
            .catch(er => {
                errorCallback(false)
                console.log("updateSpace error: ", er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
            })
    };
}
export const addPictures = (userId, bike, pictureList) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(USER_BASE_URL + `addPictures`, { userId, spaceId: bike.spaceId, pictureList }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("addPictures success: ", res.data);
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                if (!bike.pictureIdList) bike.pictureIdList = [];
                bike.pictureIdList = [...bike.pictureIdList, ...res.data.pictureIds];
                dispatch(updateBikeListAction({ bike }));
            })
            .catch(er => {
                console.log(`addPictures error: `, er.response || er);
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                dispatch(updateBikeListAction({}));
                // TODO: Dispatch error info action
            })
    }
}
export const setBikeAsActive = (userId, spaceId, prevActiveIndex, newActiveIndex) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true));
        axios.put(USER_BASE_URL + `setDefaultSpace/${userId}/${spaceId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("setDefaultSpace success: ", res.data);
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false));
                return dispatch(updateActiveBikeAction({ prevActiveIndex, newActiveIndex }))
            })
            .catch(er => {
                console.log(`setDefaultSpace: `, er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false));
            })
    };
}
export const deleteBike = (userId, bikeId, index) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true));
        axios.delete(USER_BASE_URL + `deleteSpace/${userId}/${bikeId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false));
                return dispatch(deleteBikeFromListAction({ index }))
            })
            .catch(er => {
                console.log(`deleteBike: `, er.response);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false));
            })
    };
}
export const getPassengerList = (userId) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.get(USER_BASE_URL + `getAllPassengersByUserId/${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("getAllPassengersByUserId success: ", res.data);
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                dispatch(replacePassengerListAction(Array.isArray(res.data) ? res.data : []))
            })
            .catch(er => {
                console.log(`getAllPassengersByUserId error: `, er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const registerPassenger = (userId, passenger) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.post(USER_BASE_URL + `registerPassenger`, { userId, ...passenger }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                passenger.passengerId = res.data.passengerId;
                dispatch(addToPassengerListAction(passenger))
            })
            .catch(er => {
                console.log(`registerPassenger error: `, er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}
export const updatePassengerDetails = (passenger) => {
    return dispatch => {
        // dispatch(toggleLoaderAction(true));
        dispatch(apiLoaderActions(true))
        axios.put(USER_BASE_URL + `updatePassengerDetails`, passenger, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("updatePassengerDetails success: ", res.data);
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                dispatch(updatePassengerInListAction(passenger))
            })
            .catch(er => {
                console.log(`updatePassengerDetails error: `, er.response || er);
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
                dispatch(updatePassengerInListAction(passengerId))
            })
            .catch(er => {
                console.log(`deletePassenger error: `, er.response || er);
                // TODO: Dispatch error info action
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
            })
    };
}