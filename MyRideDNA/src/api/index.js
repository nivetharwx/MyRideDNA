import {
    updateSignupResultAction, updateRideAction, updateWaypointAction, updateUserAction, toggleLoaderAction,
    replaceRideListAction, deleteRideAction, updateRideListAction, updateEmailStatusAction, updateFriendListAction, replaceFriendListAction, replaceGarageInfoAction, updateBikeListAction, addToBikeListAction, deleteBikeFromListAction, updateActiveBikeAction, updateGarageNameAction, replaceShortSpaceListAction, replaceSearchListAction, updateRelationshipAction, createFriendGroupAction, replaceFriendGroupListAction, resetMembersFromCurrentGroupAction, addWaypointAction,
    deleteWaypointAction, removeFriendGroupAction, updatePasswordSuccessAction, updatePasswordErrorAction, screenChangeAction, addToPassengerListAction, replacePassengerListAction, updatePassengerInListAction, updateFriendAction, doUnfriendAction, updateFriendRequestResponseAction, updateOnlineStatusAction, resetNotificationListAction, updateNotificationAction, deleteNotificationsAction, replaceFriendRequestListAction, updateFriendRequestListAction, updateInvitationResponseAction, updateCurrentFriendAction, resetStateOnLogout, addFriendsLocationAction,
    apiLoaderActions, replaceFriendInfooAction, resetNotificationCountAction, isloadingDataAction, updateRideInListAction, updateSourceOrDestinationAction, updatePageNumberAction, isRemovedAction, removeFromPassengerListAction, updateChatMessagesAction, replaceChatMessagesAction, updateChatListAction, updateFriendChatPicAction, resetMessageCountAction, storeUserAction, errorHandlingAction, resetErrorHandlingAction, addMembersLocationAction, storeUserMyWalletAction, updateUserMyWalletAction, updateFriendsLocationAction, updateGroupsLocationAction,
    replaceAlbumListAction, updateFavouriteFriendAction, replaceCommunityListAction, updateCommunityListAction, updateCurrentGroupAction, updateSearchListAction, updatePostTypesAction, removeFromPrevProfileAction, updateBikeAlbumAction, toggleApiCallInfoAction, updateFavouriteFriendGroupAction, updateFavouriteList
} from '../actions';
import { USER_BASE_URL, RIDE_BASE_URL, RECORD_RIDE_STATUS, RIDE_TYPE, PageKeys, USER_AUTH_TOKEN, FRIENDS_BASE_URL, HEADER_KEYS, RELATIONSHIP, GRAPH_BASE_URL, NOTIFICATIONS_BASE_URL, EVENTS_BASE_URL, APP_EVENT_NAME, APP_EVENT_TYPE, DEVICE_TOKEN, RIDE_POINT, CHAT_BASE_URL, POSTS_BASE_URL, CHAT_CONTENT_TYPE, RIDE_SORT_OPTIONS, POST_TYPE } from '../constants';
import axios from 'axios';

import { Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import Base64 from '../util';
import { Actions } from 'react-native-router-flux';
import DeviceInfo from 'react-native-device-info';
import store from '../store';
import { Toast } from 'native-base';
import RNFetchBlob from 'rn-fetch-blob';
import { createIconSetFromFontello } from 'react-native-vector-icons';
import { UPDATE_FAVOURITE_LIST } from '../actions/actionConstants';
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
            if (res.data.picture === '') {
            } else {
                successCallback(res.data);
                store.dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
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
            if (Object.keys(res.data).length === 0) {
                // handleServiceErrors(er, [pictureIdList, successCallback, errorCallback], getPictureList, false);
            } else {
                successCallback(res.data);
                store.dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
            }
        })
        .catch(er => {
            handleServiceErrors(er, [pictureIdList, successCallback, errorCallback], getPictureList, false);
        })
}
export const getPostTypes = () => {
    return dispatch => {
        axios.get(`${POSTS_BASE_URL}postTypes`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => dispatch(updatePostTypesAction(res.data)))
            .catch(er => {
                logErrorResponse(er, 'getPostTypes');
                handleServiceErrors(er, [], getPostTypes, false);
            })
    }
}
export const getRidePictureList = (pictureIdList, successCallback, errorCallback) => {
    axios.put(RIDE_BASE_URL + `getPictureList`, { pictureIdList }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        .then(res => {
            if (Object.keys(res.data).length === 0) {
                handleServiceErrors(er, [pictureIdList, successCallback, errorCallback], getRidePictureList, false);
            } else {
                successCallback(res.data);
                store.dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
            }
        })
        .catch(er => {
            errorCallback(er.response || er);
            handleServiceErrors(er, [pictureIdList, successCallback, errorCallback], getRidePictureList, false);
        })
}
export const pushNotification = (userId) => {
    axios.get(NOTIFICATIONS_BASE_URL + `pushNotification?userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        .then(res => console.log("pushNotification success: ", res.data || res))
        .catch(er => {
            // console.log("pushNotification error: ", er.response || er);
        })
}
export const getAllNotifications = (userId, pageNumber, date, comingFrom, successCallback, errorCallback) => {
    return dispatch => {
        axios.get(NOTIFICATIONS_BASE_URL + `getNotifications?userId=${userId}&pageNumber=${pageNumber}&date=${date}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                // console.log('getAllNotifications : ', res.data)
                dispatch(resetNotificationListAction(res.data));
                dispatch(apiLoaderActions(false));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                if (comingFrom === 'notification') seenNotification(userId);
                successCallback(res.data);
            })
            .catch(er => {
                handleServiceErrors(er, [userId, pageNumber, date, comingFrom, successCallback, errorCallback], getAllNotifications, false);
                errorCallback(er)
                console.log("getNotifications error: ", er.response || er);
            })
    }
}
const seenNotification = (userId) => {
    axios.get(NOTIFICATIONS_BASE_URL + `seenNotification?userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        .then(res => {
            console.log('seenNotification : ', res.data)
            store.dispatch(resetNotificationCountAction(res.data));
        })
        .catch(er => {
            console.log("seenNotification error: ", er.response || er);
        })
}
export const readNotification = (userId, notificationId) => {
    return dispatch => {
        axios.put(NOTIFICATIONS_BASE_URL + `readNotification`, { notifiedUserId: userId, id: notificationId }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("readNotification success: ", res.data || res);
                dispatch(getAllNotifications(userId,0,new Date(),'',(res)=>{
                    console.log(res,'/////// response')
                },()=>{}))
                // dispatch(updateNotificationAction({ id: notificationId, status: res.data }));
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
                dispatch(apiLoaderActions(false))
                console.log("deleteNotifications success: ", res.data || res);
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                dispatch(deleteNotificationsAction({ notificationIds }));
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
                dispatch(apiLoaderActions(false))
                console.log("deleteAllNotifications success: ", res.data || res);
                dispatch(updateNotificationAction({ notificationId, notification: res.data }));
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
            console.log("publishEvent success: ", res.data || res);
        })
        .catch(er => {
            console.log("publishEvent error: ", er.response || er);
        })
}
export const updateLocation = (userId, locationInfo) => {
    axios.put(GRAPH_BASE_URL + `updateLocation?userId=${userId}`, locationInfo, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        .then(res => {
            console.log("updateLocation success: ", res.data || res);
        })
        .catch(er => {
            console.log("updateLocation error: ", er.response || er);
        })
}
export const logoutUser = (userId, accessToken, deviceToken, successCallback, errorCallback) => {
    return async (dispatch) => {
        dispatch(apiLoaderActions(true))
        axios.post(USER_BASE_URL + `logoutUser`, { userId, accessToken, registrationToken: deviceToken, deviceId: await DeviceInfo.getUniqueId() }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('logoutUser : ', res.data)
                // firebase.notifications().removeAllDeliveredNotifications();
                dispatch(apiLoaderActions(false))
                // DOC: Updating user active | isLoggedIn with publish event
                publishEvent({ eventName: APP_EVENT_NAME.USER_EVENT, eventType: APP_EVENT_TYPE.INACTIVE, eventParam: { isLoggedIn: false, userId: userId } });
                AsyncStorage.removeItem(USER_AUTH_TOKEN).then(() => {
                    Actions.reset(PageKeys.LOGIN);
                });
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                setTimeout(() => { dispatch(resetStateOnLogout()) }, 1000)
                successCallback(res.data)
            })
            .catch(er => {
                errorCallback(er)
                console.log(er.response);
                dispatch(apiLoaderActions(false))
                handleServiceErrors(er, [userId, accessToken, deviceToken, successCallback, errorCallback], logoutUser, true);
            })
    };
}
export const validateEmailOnServer = (email) => {
    return dispatch => {
        axios.get(USER_BASE_URL + `isEmailPresent/${email}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(updateEmailStatusAction(res.data));
            })
            .catch(er => {
                if (er.message === 'Network Error' && store.getState().PageState.hasNetwork === true) {
                    Alert.alert(
                        'Something went wrong ',
                        'Please try again after sometime',
                        [
                            { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                        ],
                        { cancelable: false }
                    )
                }
                console.log(er.response);
            })
    };
}
export const registerUser = (user, successCallback, errorCallback) => {
    return dispatch => {
        axios.post(USER_BASE_URL + 'registerUser', user, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('registerUser :', res)
                dispatch(updateSignupResultAction(res.data));
                successCallback();
            })
            .catch(error => {
                console.log('registerUser error : ', error)
                errorCallback();
                if (error.message === 'Network Error' && store.getState().PageState.hasNetwork === true) {
                    Alert.alert(
                        'Something went wrong ',
                        'Please try again after sometime',
                        [
                            { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                        ],
                        { cancelable: false }
                    )
                }
                else if (error.message === 'Network Error' && store.getState().PageState.hasNetwork === false) {
                }
                else {
                    dispatch(updateSignupResultAction(error.response.data));
                }
            })
    };
}
export const updateUserInfo = (userData, successCallback, errorCallback) => {
    const { picture, ...data } = userData;
    var formData = new FormData();
    if (picture) {
        if (picture.path) {
            formData.append("image", {
                uri: picture.path,
                type: picture.mimeType,
                name: picture.path.substring(picture.path.lastIndexOf('/') + 1),
            });
        } else if (picture.id) formData.append("id", picture.id);
    }
    formData.append("data", JSON.stringify(data));
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(USER_BASE_URL + 'updateUserDetails', formData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('updateUserDetails : ', res.data);
                dispatch(toggleLoaderAction(false));
                if (!res.data.profilePictureId && data.deletedId) {
                    dispatch(updateUserAction({ ...res.data, profilePictureId: null }));
                }
                else {
                    dispatch(updateUserAction(res.data));
                }
                picture && (picture.path || picture.id) && Toast.show({ text: 'User details updated successfully' });
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                successCallback && successCallback(true);
            })
            .catch(er => {
                dispatch(toggleLoaderAction(false));
                errorCallback && errorCallback(false);
                console.log("updateUserInfo: ", er.response || er);
                handleServiceErrors(er, [userData, successCallback, errorCallback], updateUserInfo, true);
            })
    };
}

export const updatePassword = (passwordInfo) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(USER_BASE_URL + 'updatePassword', passwordInfo, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("updatePassword success: ", res.data);
                dispatch(apiLoaderActions(false))
                dispatch(updatePasswordSuccessAction(res.data));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
            })
            .catch(er => {
                console.log("updatePassword error: ", er.response || er);
                dispatch(apiLoaderActions(false))
                handleServiceErrors(er, [passwordInfo], updatePassword, true);
                dispatch(updatePasswordErrorAction(er.response.data));
            })
    };
}
export const updateUserSettings = (userSettings) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(USER_BASE_URL + 'updateUserSettings', userSettings, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("updateUserSettings success: ", res.data);
                dispatch(apiLoaderActions(false))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                dispatch(updateUserAction(userSettings));
            })
            .catch(er => {
                console.log("updateUserSettings error: ", er.response || er);
                handleServiceErrors(er, [userSettings], updateUserSettings, true);
                dispatch(apiLoaderActions(false))
            })
    };
}
export const updateShareLocationState = (userId, shareLocState) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(USER_BASE_URL + 'shareLocationEnableOrDisable', { userId, locationEnable: shareLocState }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("updateShareLocationState: ", res.data);
                dispatch(apiLoaderActions(false))
                dispatch(updateUserAction({ locationEnable: shareLocState }));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
            })
            .catch(er => {
                console.log("updateShareLocationState: ", er.response || er);
                handleServiceErrors(er, [userId, shareLocState], updateShareLocationState, true);
                dispatch(apiLoaderActions(false))
            })
    };
}

export const makeProfilePicture = (userId, pictureId) => {
    return axios.put(USER_BASE_URL + `updatePicture?userId=${userId}&pictureId=${pictureId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}
export const getAllRides = (userId, lat, lng, radius, unit, pageNumber) => {
    return axios.get(RIDE_BASE_URL + `getAllRidesBySource?sortBy=${'date'}&lat=${lat}&lng=${lng}&radius=${radius}&sortingOrder=${'ASC'}&pageNumber=${pageNumber}&unit=${unit}&userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}
export const getAllBuildRides = (userId, showLoader, pageNumber, successCallback, errorCallback, sortBy = RIDE_SORT_OPTIONS.DATE, filterByName = '') => {
    return dispatch => {
        showLoader && dispatch(apiLoaderActions(true));
        axios.get(RIDE_BASE_URL + `getAllBuildRides?sortBy=${sortBy}&filterByName=${filterByName}&userId=${userId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                // var b = res.data.rides.reduce((obb, item1)=>{
                //     var {snapshot, ...otherkeys1} = item1
                //     obb.ftr.push(otherkeys1)
                //     return obb;
                //     },({ftr:[]}))
                //     console.log('\n\n\n getAllBuildRides : ', b)
                dispatch(apiLoaderActions(false));
                dispatch(replaceRideListAction({ rideType: RIDE_TYPE.BUILD_RIDE, rideList:res.data.rides, appendToList: pageNumber > 0 }));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                successCallback(res.data);
            })
            .catch(er => {
                console.log(er.response);
                dispatch(apiLoaderActions(false));
                handleServiceErrors(er, [userId, showLoader, pageNumber, successCallback, errorCallback, sortBy = RIDE_SORT_OPTIONS.DATE, filterByName = ''], getAllBuildRides, false);
                errorCallback(er);
            })
    };
}
export const getAllPublicRides = (userId, showLoader, pageNumber, successCallback, errorCallback, sortBy = RIDE_SORT_OPTIONS.DATE, filterByName = '') => {
    return dispatch => {
        showLoader && dispatch(apiLoaderActions(true));
        axios.get(RIDE_BASE_URL + `getAllPublicRides?sortBy=${sortBy}&filterByName=${filterByName}&userId=${userId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(apiLoaderActions(false));
                const updatedRide = res.data.rides.map(ride=>{
                    const {snapshot,...otherKeys} = ride;
                    return  otherKeys;
                }) 
                dispatch(replaceRideListAction({ rideType: RIDE_TYPE.SHARED_RIDE, rideList: updatedRide, appendToList: pageNumber > 0 }));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                successCallback(res.data);
            })
            .catch(er => {
                console.log(er.response);
                handleServiceErrors(er, [userId, showLoader, pageNumber, successCallback, errorCallback, sortBy = RIDE_SORT_OPTIONS.DATE, filterByName = ''], getAllPublicRides, false);
                dispatch(apiLoaderActions(false));
                errorCallback(er);
            })
    };
}
export const getAllRecordedRides = (userId, showLoader, pageNumber, successCallback, errorCallback, sortBy = RIDE_SORT_OPTIONS.DATE, filterByName = '') => {
    return dispatch => {
        showLoader && dispatch(apiLoaderActions(true));
        axios.get(RIDE_BASE_URL + `getAllRecordRides?sortBy=${sortBy}&filterByName=${filterByName}&userId=${userId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(apiLoaderActions(false));
                dispatch(replaceRideListAction({ rideType: RIDE_TYPE.RECORD_RIDE, rideList: res.data.rides, appendToList: pageNumber > 0 }));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                successCallback(res.data);
            })
            .catch(er => {
                console.log(er.response);
                handleServiceErrors(er, [userId, showLoader, pageNumber, successCallback, errorCallback, sortBy = RIDE_SORT_OPTIONS.DATE, filterByName = ''], getAllRecordedRides, false);
                dispatch(apiLoaderActions(false));
                errorCallback(er);
            })
    };
}
export const getAllRidesByUserId = (userId) => {
    return axios.get(RIDE_BASE_URL + `getAllRidesByUserId?userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT });
}
export const getRecordRides = (userId, spaceId, pageNumber = 0, successCallback, errorCallback) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.get(RIDE_BASE_URL + `getRecordRides?userId=${userId}&pageNumber=${pageNumber}&spaceId=${spaceId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('getRecordRides : ', res.data);
                dispatch(apiLoaderActions(false));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                successCallback(res.data);
            })
            .catch(er => {
                console.log(er.response);
                handleServiceErrors(er, [userId, pageNumber, spaceId, successCallback, errorCallback], getRecordRides, false);
                dispatch(apiLoaderActions(false))
                errorCallback(er);
            })
    };
}
export const getFriendsRideList = (friendUserId, relationship) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.get(RIDE_BASE_URL + `getFriendRides?userId=${friendUserId}&relationshipStatus=${relationship}`, header)
            .then(res => {
                dispatch(apiLoaderActions(false))
                dispatch(updateCurrentFriendAction({ rideList: res.data, userId: friendUserId }));
                console.log('getFriendRides : ', res)
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
            })
            .catch(er => {
                dispatch(apiLoaderActions(false))
                handleServiceErrors(er, [friendUserId, relationship], getFriendsRideList, false);
                console.log('friendsRideError : ', er)
            })
    }
}
export const getFriendRecordedRides = (userId, friendId, spaceId, pageNumber) => {
    console.log('\n\n\n getFriendRecordedRides api : ', userId, friendId, spaceId, pageNumber)
    return axios.get(RIDE_BASE_URL + `getFriendRecordedRides?userId=${userId}&friendId=${friendId}&spaceId=${spaceId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}
export const getFriendsPicturesBySpaceId = (friendId, spaceId, pageNumber, preference) => {
    return axios.get(USER_BASE_URL + `getFriendsPicturesBySpaceId/${friendId}/${spaceId}?pageNumber=${pageNumber}&preference=${preference}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}
export const createNewRide = (rideData) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.post(RIDE_BASE_URL + 'createRide', rideData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                dispatch(apiLoaderActions(false))
                dispatch(updateRideAction({ ...rideData, ...res.data }));
            })
            .catch(er => {
                handleServiceErrors(er, [rideData], createNewRide, true);
                console.log(er.response);
                dispatch(apiLoaderActions(false))
            })
    };
}
export const createRecordRide = (rideData) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.post(RIDE_BASE_URL + 'createRecordRide', rideData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('\n\n\n createRecordRide : ', res.data)
                dispatch(apiLoaderActions(false))
                dispatch(updateRideAction({ ...rideData, ...res.data }));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
            })
            .catch(er => {
                console.log('\n\n\n createRecordRirde er :', er.response || er);
                handleServiceErrors(er, [rideData], createRecordRide, true);
                dispatch(apiLoaderActions(false))
            })
    };
}
export const copySharedRide = (rideId, name, userId, date) => {
    return axios.put(RIDE_BASE_URL + `copySharedRide?rideId=${rideId}`, { name, userId, date }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT });
}
export const copyRide = (rideId, name, rideType, date) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `copyRide?rideId=${rideId}`, { name, date }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(apiLoaderActions(false))
                dispatch(updateRideListAction({ rideType, rideList: [res.data] }));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
            })
            .catch(er => {
                console.log(er.response);
                handleServiceErrors(er, [rideId, name, rideType, date], copyRide, true);
                dispatch(apiLoaderActions(false))
            })
    };
}

export const deleteRide = (rideId) => {
    return axios.delete(RIDE_BASE_URL + `deleteRide?rideId=${rideId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}
export const addTrackpoints = (isNetworkChangeed,actualPoints, trackpoints, distance, ride, userId, successCallback, errorCallback) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `addTrackpoints?rideId=${ride.rideId}&userId=${userId}`,
            { actualPoints: Base64.encode(actualPoints.join()), trackpoints: Base64.encode(trackpoints.join()), distance }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log(res,'// trackpoint added')
                // Toast.show({ text: 'addTrackpoints successful' });
                dispatch(apiLoaderActions(false))
                if(isNetworkChangeed ){
                    dispatch(updateRideAction({ ...ride, trackpoints: [...ride.trackpoints, ...trackpoints], totalDistance: distance }));
                }
                successCallback(res)
            })
            .catch(er => {
                console.log("addTrackpoints error: ", er.response || er);
                dispatch(apiLoaderActions(false))
                if (er.message === 'Network Error' && store.getState().PageState.hasNetwork === true) {
                    errorCallback(er);
                }
            })
    };
}
export const pauseRecordRide = (isNetworkChangeed,gpsPoints, pauseTime, actualPoints, trackpoints, distance, ride, userId, loadRide, successCallback, errorCallback,timeCount) => {
    console.log('\n\n\n pauseRecordRide actualPoints : ', actualPoints,timeCount)
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `pauseRecordRide?rideId=${ride.rideId}&userId=${userId}`,
            { actualPoints: Base64.encode(actualPoints.join()), trackpoints: Base64.encode(trackpoints.join()), pauseTime, distance,totalTime:timeCount}, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('\n\n\n pauseRecordRide : ', res.data)
                Toast.show({ text: 'pauseRecordRide successful' });
                if(isNetworkChangeed === false){
                    const updatedRide = { ...ride, trackpoints: ride.trackpoints ? [...ride.trackpoints, ...trackpoints] : trackpoints, ...res.data, unsynced: false, status: RECORD_RIDE_STATUS.PAUSED, totalDistance: distance };
                    if (loadRide) {
                        dispatch(getRideByRideId(updatedRide.rideId, updatedRide));
                    } else {
                        dispatch(apiLoaderActions(false))
                        dispatch(updateRideAction(updatedRide));
                    }
                }
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                successCallback(res)
            })
            .catch(er => {
                console.log("pauseRecordRide error: ", er || er.response);
                if (er.message === 'Network Error' && store.getState().PageState.hasNetwork === true) {
                    errorCallback({ gpsPoints });
                }
                dispatch(apiLoaderActions(false))
            })
    };
}
export const completeRecordRide = (isNetworkChangeed,gpsPoints, endTime, actualPoints, trackpoints, distance, ride, userId, loadRide, successCallback, errorCallback,timeCount) => {
    return dispatch => {
        // dispatch(apiLoaderActions(true))
        console.log(`completeRecordRide: `, { actualPoints, trackpoints, endTime, distance,timeCount },{isNetworkChangeed,gpsPoints, endTime, actualPoints, trackpoints, distance, ride, userId, loadRide, successCallback, errorCallback,timeCount});
        axios.put(RIDE_BASE_URL + `completeRecordRide?rideId=${ride.rideId}&userId=${userId}`,
            { actualPoints: Base64.encode(actualPoints.join()), trackpoints: Base64.encode(trackpoints.join()), endTime, distance ,totalTime:timeCount}, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('\n\n\n completedRide : ', res.data)
                Toast.show({ text: 'completeRecordride successful' });
                // dispatch(apiLoaderActions(false))
                if(isNetworkChangeed === false){
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
                if (loadRide) {
                    dispatch(getRideByRideId(updatedRide.rideId, updatedRide));
                } else {
                    dispatch(updateRideAction(updatedRide));
                }
                }
                
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                successCallback(res)
            })
            .catch(er => {
                console.log("\n\n\n completeRecordRide error: ", er || er.response);
                if (er.message === 'Network Error' && store.getState().PageState.hasNetwork === true) {
                    errorCallback({ gpsPoints });
                }
                dispatch(apiLoaderActions(false))
            })
    };
}
export const continueRecordRide = (resumeTime, ride, userId, successCallback, errorCallback) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `resumeRecordRide?rideId=${ride.rideId}&userId=${userId}`, { resumeTime }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('\n\n\n continueRecordRide : ', res.data)
                dispatch(apiLoaderActions(false))
                dispatch(updateRideAction({ ...ride, ...res.data, status: RECORD_RIDE_STATUS.RUNNING }));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                successCallback(res)
            })
            .catch(er => {
                console.log("resumeRecordRide error: ", er || er.response);
                dispatch(apiLoaderActions(false))
                if (er.message === 'Network Error' && store.getState().PageState.hasNetwork === true) {
                    errorCallback(er);
                }
            })
    };
}
export const updateRide = (updates, successCallback = null, errorCallback = null, isAsync = false) => {
    console.log('\n\n\n updates : ', updates)
    if (isAsync) store.dispatch(toggleApiCallInfoAction({ id: updates.rideId, status: true }));
    axios.put(RIDE_BASE_URL + `updateRide`, updates, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        .then(res => {
            console.log('\n\n\n updateRide : ', res.data)
            if (isAsync) {
                store.dispatch(toggleApiCallInfoAction({ id: updates.rideId, status: false }));
                Toast.show({ text: `${(updates.snapshot ? 'Snapshot of map' : 'Ride')} updated successfully` });
               store.dispatch(getAllBuildRides(store.getState().UserAuth.user.userId, false, 0, undefined, undefined, sortBy = RIDE_SORT_OPTIONS.DATE, filterByName = ''))
            }
            successCallback && successCallback(res.data);
            store.dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
        })
        .catch(er => {
            handleServiceErrors(er, [updates, successCallback = null, errorCallback = null, isAsync = false], updateRide, true);
            console.log(er.response || er);
            errorCallback(er.response || er);
        })
}
export const addSource = (waypoint, ride) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `addSource?rideId=${ride.rideId}`, waypoint, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('\n\n\n addSource  : ', res.data)
                dispatch(apiLoaderActions(false))
                dispatch(updateRideAction({ source: waypoint }));
            })
            .catch(er => {
                console.log(er.response || er);
                dispatch(apiLoaderActions(false))
            })
    };
}
export const addWaypoint = (waypoint, ride, index) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `addWaypoint?rideId=${ride.rideId}&index=${index}`, waypoint, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('\n\n\n addWaypoint : ', res.data)
                dispatch(apiLoaderActions(false))
                return dispatch(addWaypointAction({ index, waypoint }));
            })
            .catch(er => {
                console.log(er.response || er);
                dispatch(apiLoaderActions(false))
            })
    };
}
export const deleteWaypoint = (ride, index) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.delete(RIDE_BASE_URL + `deleteWaypoint?rideId=${ride.rideId}&index=${index}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(apiLoaderActions(false))
                return dispatch(deleteWaypointAction({ index }));
            })
            .catch(er => {
                console.log(er.response || er);
                dispatch(apiLoaderActions(false))
            })
    };
}
export const updateWaypoint = (updates, waypoint, rideId, index, updateRideOnMap = true, combinedCoordinates = null, isUndoable = true, successCallback = null,onDismiss=null) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        const { pictureList, ids, ...data } = updates;
        console.log('////// updates', updates)
        const formData = new FormData();
        console.log(pictureList,'/////// pictures list')
        if (pictureList) {
            pictureList.forEach(({ mimeType, path }) => {
                formData.append("images", {
                    uri: path,
                    type: mimeType,
                    name: path.substring(path.lastIndexOf('/') + 1),
                });
            });
        }
        if (ids) {
            ids.forEach(id => {
                formData.append('ids', id)
            })
        }
        formData.append('data', JSON.stringify(data));
        
        axios.put(RIDE_BASE_URL + `updateWaypoint?rideId=${rideId}&index=${index}`, formData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(apiLoaderActions(false));
                console.log('updateWaypoint : ', res.data)
                Toast.show({ text: 'Waypoint updated successfully' });
                successCallback && successCallback();
                onDismiss && onDismiss().then((res) => { console.log('//////////// Dismissed') })
                updateRideOnMap && dispatch(updateWaypointAction({ index, updates: { ...updates, pictureList: res.data.pictureList }, isUndoable, combinedCoordinates }));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
            })
            .catch(er => {
                
                handleServiceErrors(er, [updates, waypoint, rideId, index, updateRideOnMap = true, successCallback = null], updateRide, true);
                console.log(er.response || er);
                dispatch(apiLoaderActions(false));
            })
    };
}
export const updateSource = (updates, waypoint, rideId, updateRideOnMap = true, isUndoable = true, successCallback = null,onDismiss=null) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        const { pictureList, ids, ...data } = updates;
        const formData = new FormData();
        if (pictureList) {
            pictureList.forEach(({ mimeType, path }) => {
                formData.append("images", {
                    uri: path,
                    type: mimeType,
                    name: path.substring(path.lastIndexOf('/') + 1),
                });
            });
        }
        if (ids) {
            ids.forEach(id => {
                formData.append('ids', id)
            })
        }
        formData.append('data', JSON.stringify(data));
        axios.put(RIDE_BASE_URL + `updateSource?rideId=${rideId}`, formData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('updateSource : ', res.data)
                dispatch(apiLoaderActions(false));
                // Toast.show({ text: 'Source point updated successfully' });
                Toast.show({text: 'Source point updated successfully'})
                successCallback && successCallback();
                onDismiss && onDismiss().then((res) => { console.log('//////////// Dismissed') })
                updateRideOnMap && dispatch(updateRideAction({ source: { ...waypoint, ...updates, pictureList: res.data.pictureList }, isUndoable }));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
            })
            .catch(er => {
                handleServiceErrors(er, [updates, waypoint, rideId, updateRideOnMap = true, successCallback = null], updateSource, true);
                console.log(er.response || er);
                dispatch(apiLoaderActions(false));
            })
    };
}
export const deleteSource = (ride) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.delete(RIDE_BASE_URL + `deleteSource?rideId=${ride.rideId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(apiLoaderActions(false))
                return dispatch(updateRideAction({ source: null }));
            })
            .catch(er => {
                console.log(er.response || er);
                dispatch(apiLoaderActions(false))
            })
    };
}
export const updateDestination = (updates, waypoint, rideId, updateRideOnMap = true, isUndoable = true, successCallback = null,onDismiss=null) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        const { pictureList, ids, ...data } = updates;
        const formData = new FormData();
        if (pictureList) {
            pictureList.forEach(({ mimeType, path }) => {
                formData.append("images", {
                    uri: path,
                    type: mimeType,
                    name: path.substring(path.lastIndexOf('/') + 1),
                });
            });
        }
        if (ids) {
            ids.forEach(id => {
                formData.append('ids', id)
            })
        }
        formData.append('data', JSON.stringify(data));
        axios.put(RIDE_BASE_URL + `updateDestination?rideId=${rideId}`, formData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('updateDestination :', res.data)
                dispatch(apiLoaderActions(false));
                Toast.show({ text: 'Destination point updated successfully' });
                successCallback && successCallback();
                onDismiss && onDismiss().then((res) => { console.log('//////////// Dismissed') })
                updateRideOnMap && dispatch(updateRideAction({ destination: { ...waypoint, ...updates, pictureList: res.data.pictureList }, isUndoable }));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
            })
            .catch(er => {
                handleServiceErrors(er, [updates, waypoint, rideId, updateRideOnMap = true, successCallback = null], updateDestination, true);
                console.log(er.response || er);
                dispatch(apiLoaderActions(false));
            })
    };
}
export const makeWaypointAsSource = (ride, index) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `makeWaypointAsSource?rideId=${ride.rideId}&index=${index}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(apiLoaderActions(false))
                return dispatch(updateRideAction({
                    waypoints: [...ride.waypoints.slice(index + 1)],
                    source: ride.waypoints[index]
                }));
            })
            .catch(er => {
                console.log(er.response || er);
                dispatch(apiLoaderActions(false))
            })
    };
}
export const makeSourceAsWaypoint = (ride) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `makeSourceAsWaypoint?rideId=${ride.rideId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(apiLoaderActions(false))
                return dispatch(updateRideAction({
                    waypoints: [ride.source, ...ride.waypoints],
                    source: null
                }));
            })
            .catch(er => {
                console.log(er.response || er);
                dispatch(apiLoaderActions(false))
            })
    };
}
export const makeWaypointAsDestination = (ride, index) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `makeWaypointAsDestination?rideId=${ride.rideId}&index=${index}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(apiLoaderActions(false))
                return dispatch(updateRideAction({
                    waypoints: [...ride.waypoints.slice(0, index)],
                    destination: ride.waypoints[index]
                }));
            })
            .catch(er => {
                console.log(er.response || er);
                dispatch(apiLoaderActions(false))
            })
    };
}
export const makeDestinationAsWaypoint = (ride) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `makeDestinationAsWaypoint?rideId=${ride.rideId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(apiLoaderActions(false))
                return dispatch(updateRideAction({
                    waypoints: [...ride.waypoints, ride.destination],
                    destination: null
                }));
            })
            .catch(er => {
                console.log(er.response || er);
                dispatch(apiLoaderActions(false))
            })
    };
}
export const deleteDestination = (ride) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.delete(RIDE_BASE_URL + `deleteDestination?rideId=${ride.rideId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(apiLoaderActions(false))
                return dispatch(updateRideAction({ destination: null }));
            })
            .catch(er => {
                console.log(er.response || er);
                dispatch(apiLoaderActions(false))
            })
    };
}
// DOC: This API call is for syncing the state of ride with the server
export const replaceRide = (rideId, ride, successCallback, errorCallback, isAsync = false) => {
    if (isAsync) store.dispatch(toggleApiCallInfoAction({ id: rideId, status: true }));
    axios.put(RIDE_BASE_URL + `replaceRide?rideId=${rideId}`, ride, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        .then(res => {
            console.log('\n\n\n replace Ride : ', res.data)
            if (isAsync) {
                store.dispatch(toggleApiCallInfoAction({ id: rideId, status: false }));
                Toast.show({ text: `${(ride.snapshot ? 'Snapshot of map' : 'Ride')} updated successfully` });
               store.dispatch(getAllBuildRides(store.getState().UserAuth.user.userId, false, 0, undefined, undefined, sortBy = RIDE_SORT_OPTIONS.DATE, filterByName = ''))
            }   
            successCallback && successCallback();
        })
        .catch(er => {
            console.log(er.response || er);
            errorCallback && errorCallback(er.response || er);
            // handleServiceErrors(er, [rideId, ride, successCallback, errorCallback, isAsync = false], replaceRide, true);
            // TODO: handle timeout error seperately for map
        })
}
export const getRideByRideId = (rideId, rideInfo = {}) => {
    console.log('called after show on map')
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.get(RIDE_BASE_URL + `getRideByRideId?rideId=${rideId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('getRideByRideId :', res.data)
                dispatch(apiLoaderActions(false))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                // if(res.data.isRecorded === false && res.data.creatorId === store.getState().UserAuth.user.userId){
                //     console.log('\n\n\n coming in delete if')
                //     dispatch(deleteRideAction({ rideType:RIDE_TYPE.BUILD_RIDE, rideId }));
                // }
                dispatch(updateRideAction({ ...rideInfo, ...res.data }));
            })
            .catch(er => {
                console.log(`getRideByRideId: ${RIDE_BASE_URL}getRideByRideId?rideId=${rideId}`, er.response);
                handleServiceErrors(er, [rideId, rideInfo = {}], getRideByRideId, true);
                dispatch(apiLoaderActions(false))
            })
    };
}

export const getRideInfo = (rideId) => axios.get(RIDE_BASE_URL + `getRideByRideId?rideId=${rideId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT });

export const getWaypointPictureList = (id, pictureIdList) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `getWaypointPictureList`, { id, pictureIdList }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
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
            })
            .catch(er => {
                console.log(`getWaypointPictureList error: ${RIDE_BASE_URL}getWaypointPictureList`, { id, pictureIdList }, er.response || er);
                dispatch(apiLoaderActions(false))
            })
    };
}
export const deleteWaypointPicture = (ride, id, pictureIdList) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(RIDE_BASE_URL + `deleteWaypointPicture`, { rideId: ride.rideId, id, pictureIdList }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
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
            })
            .catch(er => {
                console.log(`deleteWaypointPicture error: ${RIDE_BASE_URL}deleteWaypointPicture`, { rideId, id, pictureIdList }, er.response || er);
                dispatch(apiLoaderActions(false))
            })
    };
}
export const getAllFriends = (friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback,searchQuery,locationEnable) => {
    return dispatch => {
        toggleLoader && dispatch(apiLoaderActions(true))
        const url=GRAPH_BASE_URL + `getFriendList?userId=${userId}&pageNumber=${pageNumber}&searchParam=${searchQuery}`+(locationEnable?`&location=${locationEnable}`:'')
        console.log(url,'//// url ')
        axios.get(url, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('getAllFriend sucess : ', res.data)
                if (res.data.friendList.length > 0) {
                    dispatch(apiLoaderActions(false));
                    dispatch(replaceFriendListAction({ friendList: res.data.friendList, pageNumber: pageNumber }))
                    dispatch(updatePageNumberAction({ pageNumber: pageNumber }));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    successCallback(res.data);
                }
                else if (res.data.friendList.length === 0) {
                    dispatch(apiLoaderActions(false));
                    dispatch(replaceFriendListAction({ friendList: res.data.friendList, pageNumber: pageNumber }))
                    dispatch(updatePageNumberAction({ pageNumber: pageNumber }));
                    successCallback(res.data);
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            })
            .catch(er => {
                console.log(`getAllFriends: `, er.response || er);
                dispatch(apiLoaderActions(false));
                handleServiceErrors(er, [friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback], getAllFriends, false);
            })
    };
}

export const getAllFriendsForGroup = (userId, pageNumber) => {
    return   axios.get(GRAPH_BASE_URL + `getFriendList?userId=${userId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}


export const getPassengersById = (userId, friendId, pageNumber, passengerList, successCallback, errorCallback) => {
    return dispatch => {
        dispatch(apiLoaderActions(true));
        axios.get(USER_BASE_URL + `getAllFriendsPassenger?userId=${userId}&friendId=${friendId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                // console.log('getAllFriendsPassenger : ', res.data)
                if (res.data.passengerList.length > 0) {
                    let updatedPassengerList = []
                    dispatch(apiLoaderActions(false));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                    if (pageNumber === 0) {
                        updatedPassengerList = res.data.passengerList
                    }
                    else {
                        updatedPassengerList = [...passengerList, ...res.data.passengerList]
                    }
                    res.data.passengerList.length > 0 && dispatch(updateCurrentFriendAction({ passengerList: updatedPassengerList, userId: friendId }));
                    successCallback(res.data);
                } else {
                    dispatch(apiLoaderActions(false));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    successCallback(res.data);
                }
            })
            .catch(er => {
                console.log(`getPassengersById error: `, er.response || er);
                dispatch(apiLoaderActions(false));
                handleServiceErrors(er, [userId, friendId, pageNumber, passengerList, successCallback, errorCallback], getPassengersById, false);
                errorCallback(er);
            })
    };
}
export const getRoadBuddiesById = (userId, friendId, pageNumber, friendList, successCallback, errorCallback) => {
    return dispatch => {
        dispatch(apiLoaderActions(true));
        axios.get(GRAPH_BASE_URL + `getRoadBuddiesById?userId=${userId}&friendId=${friendId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                // console.log('getRoadBuddiesById : ', res.data);
                let updatedBuddyFriendList = []
                dispatch(apiLoaderActions(false));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                if (pageNumber === 0) {
                    updatedBuddyFriendList = res.data.friendList
                }
                else {
                    updatedBuddyFriendList = [...friendList, ...res.data.friendList]
                }
                res.data.friendList.length > 0 && dispatch(updateCurrentFriendAction({ friendList: updatedBuddyFriendList, userId: friendId }));
                successCallback(res.data)
            })
            .catch(er => {
                console.log(`getRoadBuddiesById error: `, er.response || er);
                dispatch(apiLoaderActions(false));
                handleServiceErrors(er, [userId, friendId, pageNumber, friendList, successCallback, errorCallback], getRoadBuddiesById, false);
                errorCallback(er)
            })
    };
}
export const getMutualFriends = (userId, friendId, pageNumber, preference, mutualFriends = [], successCallback, errorCallback) => {
    return dispatch => {
        dispatch(apiLoaderActions(true));
        axios.get(GRAPH_BASE_URL + `getMutualFriends?userId=${userId}&friendId=${friendId}&pageNumber=${pageNumber}&preference=${preference}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('getMutualFriends : ', res.data)
                dispatch(apiLoaderActions(false));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                updatedMutualFriendList = [...mutualFriends, ...res.data.friendList]
                res.data.friendList.length > 0 && dispatch(updateCurrentFriendAction({ mutualFriends: updatedMutualFriendList, userId: friendId }));
                successCallback(res.data)
            })
            .catch(er => {
                console.log(`getMutualFriends error: `, er.response || er);
                dispatch(apiLoaderActions(false));
                handleServiceErrors(er, [userId, friendId, pageNumber, preference, mutualFriends = [], successCallback, errorCallback], getMutualFriends, false);
                errorCallback(er)
            })
    };
}
export const getUserProfile = (userId, friendId) => {
    console.log('getUserProfile : ', userId, friendId)
    return axios.get(USER_BASE_URL + `getUserProfile?userId=${userId}&friendId=${friendId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}

export const getUser = (userId, successCallback, errorCallback) => {
    return dispatch => {
        axios.get(USER_BASE_URL + `getUser?id=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(({ data }) => {
                dispatch(updateUserAction(data));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                typeof successCallback === 'function' && successCallback();
            })
            .catch(er => {
                console.log(`getUser: `, er.response || er);
                typeof errorCallback === 'function' && errorCallback();
                handleServiceErrors(er, [userId, successCallback, errorCallback], getUser, false);
            })
    };
}

export const searchForFriend = (searchParam, userId, pageNumber, preference, filterProps = { searchType: 'fullSearch' }) => {
    let URL = FRIENDS_BASE_URL + `searchFriend?searchParam=${searchParam}&userId=${userId}&pageNumber=${pageNumber}&searchType=${filterProps.searchType}`;
    if (filterProps.groupId) URL += `&groupId=${filterProps.groupId}`;
    return axios.get(URL, { cancelToken: axiosSource.token, timeout: API_TIMEOUT });
}

export const searchForGroup = (memberId, searchParam, pageNumber, preference) => {
    return axios.get(FRIENDS_BASE_URL + `searchGroup?memberId=${memberId}&searchParam=${searchParam}&pageNumber=${pageNumber}&preference=${preference}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}

export const invitationStatus = (invitationDetail) => {
    return axios.post(FRIENDS_BASE_URL + `invitationStatus`, invitationDetail, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}


export const addFavorite = (userId, senderId) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(FRIENDS_BASE_URL + `addFavorite`, { userId, senderId }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('addFavorite : ', res.data)
                dispatch(apiLoaderActions(false));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                dispatch(updateFavouriteFriendAction({ friendId: userId, favorite: true }))
                dispatch(updateFavouriteFriendGroupAction({ friendId: userId, favorite: true }))
            })
            .catch(er => {
                console.log(`addFavorite error: `, er.response || er);
                handleServiceErrors(er, [userId, senderId], addFavorite, true);
                dispatch(apiLoaderActions(false))
            })
    };
}
export const removeFavorite = (userId, senderId) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(FRIENDS_BASE_URL + `removeFavorite`, { userId, senderId }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('removeFavorite : ', res.data)
                dispatch(apiLoaderActions(false));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                dispatch(updateFavouriteFriendAction({ friendId: userId, favorite: false }))
                dispatch(updateFavouriteFriendGroupAction({ friendId: userId, favorite: false }))
            })
            .catch(er => {
                console.log(`removeFavorite error: `, er.response || er);
                handleServiceErrors(er, [userId, senderId], removeFavorite, true);
                dispatch(apiLoaderActions(false))
            })
    };
}
export const sendInvitation = (requestBody, successCallback, errorCallback) => {
    console.log('\n\n\n requestBody : ', requestBody)
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.post(FRIENDS_BASE_URL + `sendInvitation`, requestBody, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('sendInvitation : ', res.data)
                dispatch(apiLoaderActions(false))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                // dispatch(updateInvitationResponseAction(res.data));
                successCallback(res.data)
            })
            .catch(er => {
                console.log(`sendInvitation error: `, er.response || er);
                dispatch(apiLoaderActions(false))
                handleServiceErrors(er, [requestBody, successCallback, errorCallback], sendInvitationOrRequest, true);
                // dispatch(updateInvitationResponseAction({ error: er.response.data || "Something went wrong" }));
                errorCallback(er);
            })
    };
}
export const sendFriendRequest = (requestBody, successCallback, errorCallback) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.post(FRIENDS_BASE_URL + `sendFriendRequest`, requestBody, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(apiLoaderActions(false))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                typeof successCallback === "function" && successCallback(res.data)
            })
            .catch(er => {
                console.log(`sendFriendRequest: `, er.response || er);
                dispatch(apiLoaderActions(false))
                handleServiceErrors(er, [requestBody, successCallback, errorCallback], sendFriendRequest, true);
                typeof errorCallback === "function" && errorCallback(er);
            })
    };
}
export const cancelFriendRequest = (senderId, personId, successCallback, errorCallback) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.delete(FRIENDS_BASE_URL + `cancelFriendRequest?senderId=${senderId}&userId=${personId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('cancelFriendRequest : ', res.data)
                dispatch(apiLoaderActions(false))
                // dispatch(updateFriendRequestListAction({ id: requestId }))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                // dispatch(updateRelationshipAction({ personId, relationship: RELATIONSHIP.UNKNOWN }));
                typeof successCallback === "function" && successCallback(res.data)
            })
            .catch(er => {
                console.log(`cancelFriendRequest: `, er, er.response);
                handleServiceErrors(er, [senderId, personId, , successCallback, errorCallback], cancelFriendRequest, true);
                dispatch(apiLoaderActions(false))
                typeof errorCallback === "function" && errorCallback(er);
            })
    };
}

export const approveFriendRequest = (senderId, personId, actionDate, successCallback, errorCallback) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(FRIENDS_BASE_URL + `approveFriendRequest?senderId=${senderId}&userId=${personId}&date=${actionDate}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('approveFriendRequest : ', res.data)
                dispatch(apiLoaderActions(false))
                // dispatch(updateFriendRequestListAction({ id: requestId }))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                // dispatch(updateRelationshipAction({ personId, relationship: RELATIONSHIP.FRIEND }));
                typeof successCallback === 'function' && successCallback(res.data)
            })
            .catch(er => {
                console.log(`approveFriendRequest: `, er, er.response);
                handleServiceErrors(er, [senderId, personId, actionDate, successCallback, errorCallback], approveFriendRequest, true);
                dispatch(apiLoaderActions(false))
                typeof errorCallback === 'function' && errorCallback(er)
            })
    };
}
export const rejectFriendRequest = (senderId, personId, successCallback, errorCallback) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(FRIENDS_BASE_URL + `rejectFriendRequest?senderId=${senderId}&userId=${personId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('rejectFriendRequest : ', res.data)
                // dispatch(updateFriendRequestListAction({ id: requestId }))
                dispatch(apiLoaderActions(false))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                // dispatch(updateRelationshipAction({ personId, relationship: RELATIONSHIP.UNKNOWN }));
                typeof successCallback === 'function' && successCallback(res.data)
            })
            .catch(er => {
                console.log(`rejectFriendRequest error : `, er, er.response);
                handleServiceErrors(er, [senderId, personId, successCallback, errorCallback], rejectFriendRequest, true);
                dispatch(apiLoaderActions(false))
                typeof errorCallback === 'function' && errorCallback(er)
            })
    };
}
export const doUnfriend = (senderId, personId, passengerId, successCallback, errorCallback) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.delete(FRIENDS_BASE_URL + `unfriend?senderId=${senderId}&userId=${personId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('doUnfriend : ', res.data)
                dispatch(apiLoaderActions(false))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                dispatch(removeFromPrevProfileAction({ userId: personId }))
                dispatch(doUnfriendAction({ personId }));
                passengerId && dispatch(removeFromPassengerListAction({ passengerId, personId }));
                dispatch(updateCurrentFriendAction({ isFriend: false, userId: personId }));
                successCallback(res.data)
            })
            .catch(er => {
                errorCallback(er);
                console.log(`unfriend: `, er.response || er);
                handleServiceErrors(er, [senderId, personId], doUnfriend, true);
                dispatch(apiLoaderActions(false))
            })
    };
}
export const getFriendsLocationList = (userId, friendsIdList, isTempLocation = false) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(GRAPH_BASE_URL + `getFriendsLocationList`, { userId, friendsIdList }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('getFriendsLocationList : ', res.data)
                dispatch(apiLoaderActions(false));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                const updatedLOcation = res.data.map(item => {
                    return { ...item, isTempLocation }
                })
                res.data.length > 0 && dispatch(addFriendsLocationAction(updatedLOcation));
            })
            .catch(er => {
                console.log(`getFriendLocationList: `, er.response || er);
                handleServiceErrors(er, [userId, friendsIdList], getFriendsLocationList, true);
                dispatch(apiLoaderActions(false))
            })
    };
}

export const getFavouriteList= (userId, pageNumber, toggleLoader, successCallback, errorCallback,searchValue,refreshed=false,locationEnable)=>{
    console.log(userId, toggleLoader, pageNumber,)
    return (dispatch)=>{
        toggleLoader && dispatch(apiLoaderActions(true))
        axios.get(GRAPH_BASE_URL +`getFavoriteList?userId=${userId}&pageNumber=${pageNumber}&preference=10&searchParam=${searchValue}`+(locationEnable?`&location=${locationEnable}`:''),{ cancelToken: axiosSource.token, timeout: API_TIMEOUT }).then((res)=>{
          
                dispatch(apiLoaderActions(false));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                dispatch(updateFavouriteList({
                    type:UPDATE_FAVOURITE_LIST,
                    data:{friendsList:res.data.friendList,refreshed:refreshed}
                }))
                successCallback(res.data);
            
        })
        .catch(er => {
            dispatch(apiLoaderActions(false));
            handleServiceErrors(er, [ userId, pageNumber, toggleLoader, successCallback, errorCallback], getFavouriteList, false);
        })
    }
}
export const getFriendGroups = (userId, toggleLoader, pageNumber, preference, successCallback, errorCallback,searchValue) => {
    return dispatch => {
        toggleLoader && dispatch(apiLoaderActions(true))
        axios.get(FRIENDS_BASE_URL + `getFriendGroups?memberId=${userId}&pageNumber=${pageNumber}&preference=${preference}&groupName=${searchValue}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.data.groups.length > 0) {
                    console.log('getFriendGroups : ', res.data)
                    dispatch(replaceFriendGroupListAction({ groupList: res.data.groups, pageNumber: pageNumber }))
                    dispatch(apiLoaderActions(false))
                    dispatch(updatePageNumberAction({ pageNumber: pageNumber }));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    successCallback(res.data)
                } else if (res.data.groups.length === 0) {
                    dispatch(apiLoaderActions(false));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    successCallback(res.data)
                }
            })
            .catch(er => {
                handleServiceErrors(er, [userId, toggleLoader, pageNumber, preference, successCallback, errorCallback], getFriendGroups, false);
                dispatch(apiLoaderActions(false))
                errorCallback(er)

            })
    };
}
export const createFriendGroup = (newGroupInfo) => {
    return dispatch => {
        let formData = new FormData();
        const { picture, ...data } = newGroupInfo;
        if (picture) {
            if (picture.path) {
                formData.append("image", {
                    uri: picture.path,
                    type: picture.mimeType,
                    name: picture.path.substring(picture.path.lastIndexOf('/') + 1),
                });
            }
            else if (picture.id) {
                formData.append("id", picture.id)
            }
        }
        formData.append("data", JSON.stringify(data));
        axios.post(FRIENDS_BASE_URL + `createFriendGroup`, formData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('createFriendGroup : ', res.data);
                Toast.show({ text: 'Group created successfully' });
                newGroupInfo.groupId = res.data.groupId;
                newGroupInfo.profilePictureId = res.data.profilePictureId;
                newGroupInfo.locationEnable = res.data.locationEnable
                dispatch(apiLoaderActions(false))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                return dispatch(createFriendGroupAction(newGroupInfo))
            })
            .catch(er => {
                console.log(`createFriendGroup error: `, er.response);
                handleServiceErrors(er, [newGroupInfo], createFriendGroup, true);
                dispatch(apiLoaderActions(false))
            })
    };
}
export const updateFriendGroup = (updatedGroupInfo, isAsync, successCallback, errorCallback) => {
    return dispatch => {
        if (isAsync) dispatch(toggleApiCallInfoAction({ id: updatedGroupInfo.groupId, status: true }));
        let formData = new FormData();
        const { picture, ...data } = updatedGroupInfo;
        if (picture) {
            if (picture.path) {
                formData.append("image", {
                    uri: picture.path,
                    type: picture.mimeType,
                    name: picture.path.substring(picture.path.lastIndexOf('/') + 1),
                });
            }
            else if (picture.id) {
                formData.append("id", picture.id)
            }
        }
        formData.append("data", JSON.stringify(data));
        // dispatch(apiLoaderActions(true))
        axios.put(FRIENDS_BASE_URL + `updateFriendGroup`, formData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('updateFriendGroup success : ', res.data)
                Toast.show({ text: 'Group updated successfully' });
                const { memberList, ...otherData } = res.data
                let updateGroup = {}
                updateGroup.otherDetail = otherData;
                if (memberList.length > 0) {
                    updateGroup.addMembers = [];
                    memberList.forEach(members => {
                        updateGroup.addMembers.push(members)
                    })
                }
                if (updatedGroupInfo.deletedIds) {
                    updateGroup.deletedmembers = updatedGroupInfo.deletedIds
                }
                if (isAsync) {
                    dispatch(toggleApiCallInfoAction({ id: updatedGroupInfo.groupId, status: false }));
                }

                if (!res.data.profilePictureId && data.deletedId) {
                    dispatch(updateCurrentGroupAction({
                        ...updateGroup,
                        otherDetail: {
                            ...updateGroup.otherDetail,
                            profilePictureId: null
                        }
                    }))
                }
                else {
                    dispatch(updateCurrentGroupAction(updateGroup))
                }
                dispatch(apiLoaderActions(false))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                successCallback(res.data);
            })
            .catch(er => {
                console.log(`updatedGroupInfo error: `, er.response);
                handleServiceErrors(er, [updatedGroupInfo], updateFriendGroup, true);
                dispatch(apiLoaderActions(false))
            })
    };
}
export const exitFriendGroup = (groupId, memberId) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(FRIENDS_BASE_URL + `exitFriendGroup?memberId=${memberId}&groupId=${groupId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log('exitFriendGroup : ', res.data)
                    dispatch(apiLoaderActions(false))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    return dispatch(removeFriendGroupAction(groupId))
                }
            })
            .catch(er => {
                console.log(`exitFriendGroup error: `, er.response);
                handleServiceErrors(er, [groupId, memberId], exitFriendGroup, true);
                dispatch(apiLoaderActions(false))
            })
    };
}
export const deleteFriendGroup = (groupId) => {
    return axios.delete(`${FRIENDS_BASE_URL}deleteFriendGroup?groupId=${groupId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}
export const getAllGroupLocation = (groupIds) => {
    return axios.post(`${GRAPH_BASE_URL}getAllGroupLocation`, { groupIds }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}
export const getGroupMembers = (groupId, userId, allMembers, pageNumber) => {
    return axios.get(GRAPH_BASE_URL + `getMembers?groupId=${groupId}&memberId=${userId}&allMembers=${allMembers}` + (allMembers ? '' : `&pageNumber=${pageNumber}`), { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}

export const getAllMembersLocation = (groupId, userId, isTempLocation) => {
    return dispatch => {
        dispatch(apiLoaderActions(true));
        axios.get(GRAPH_BASE_URL + `getAllMembersLocation?userId=${userId}&groupId=${groupId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(apiLoaderActions(false));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                res.data.length > 0 && dispatch(addMembersLocationAction({ list: res.data, groupId, isTempLocation }));
            })
            .catch(er => {
                console.log(`getAllMembersLocation error: `, er.response || er);
                dispatch(apiLoaderActions(false));
                handleServiceErrors(er, [groupId, userId], getAllMembersLocation, false);
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
                handleServiceErrors(er, [userId, ids], getAllMembersAndFriendsLocationList, false);
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
            handleServiceErrors(er, [userId, successCallback, errorCallback], getSpaces, false);
            typeof errorCallback === 'function' && errorCallback(er.response || er);
        })
}
export const getGarageInfo = (userId) => {
    return axios.get(USER_BASE_URL + `getGarage/${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}

export const addBikeToGarage = (userId, bike, successCallback, errorCallback) => {
    return dispatch => {
        const { picture, ...data } = bike
        let formData = new FormData();
        if (picture) {
            if (picture.path) {
                formData.append("image", {
                    uri: picture.path,
                    type: picture.mimeType,
                    name: picture.path.substring(picture.path.lastIndexOf('/') + 1),
                });
            }
            else if (picture.id) {
                formData.append("id", picture.id)
            }
        }
        formData.append("data", JSON.stringify(data));
        axios.put(USER_BASE_URL + `addSpace/${userId}`, formData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                bike.spaceId = res.data.spaceId;
                console.log('addSpace : ', res.data);
                bike.picture = res.data.picture;
                bike.isDefault = res.data.isDefault;
                dispatch(addToBikeListAction({ bike }));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                Toast.show({ text: 'Bike created successfully' });
                successCallback && successCallback(true);
            })
            .catch(er => {
                console.log(`addSpace error: `, er.response || er);
                errorCallback && errorCallback(false);
                handleServiceErrors(er, [userId, bike, successCallback, errorCallback], addBikeToGarage, true);
            })
    };
}
export const editBike = (userId, bike, successCallback, errorCallback) => {
    console.log('\n\n\n bike : ', bike)
    return dispatch => {
        const { picture, ...data } = bike
        let formData = new FormData();
        if (picture) {
            if (picture.path) {
                formData.append("image", {
                    uri: picture.path,
                    type: picture.mimeType,
                    name: picture.path.substring(picture.path.lastIndexOf('/') + 1),
                });
            }
            else if (picture.id) {
                formData.append("id", picture.id)
            }
        }
        formData.append("data", JSON.stringify(data));
        axios.put(USER_BASE_URL + `updateSpace/${userId}`, formData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(({ data }) => {
                console.log('updateSpace : ', data);
                bike.picture = data.picture;
                dispatch(updateBikeListAction(bike));
                Toast.show({ text: 'Bike details updated successfully' });
                successCallback && successCallback(true);
            })
            .catch(er => {
                console.log("updateSpace error: ", er.response || er);
                errorCallback && errorCallback(false);
                handleServiceErrors(er, [userId, bike, successCallback, errorCallback], editBike, true);
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
                handleServiceErrors(er, [userId, spaceId], setBikeAsActive, true);
                dispatch(apiLoaderActions(false));
            })
    };
}
export const deleteBike = (userId, bikeId, successCallback, errorCallback) => {
    return dispatch => {
        dispatch(apiLoaderActions(true));
        axios.delete(USER_BASE_URL + `deleteSpace/${userId}/${bikeId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                successCallback(res)
                dispatch(apiLoaderActions(false));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                dispatch(deleteBikeFromListAction(bikeId));
            })
            .catch(er => {
                console.log(`deleteBike: `, er.response);
                errorCallback(er)
                handleServiceErrors(er, [userId, bikeId], deleteBike, true);
                dispatch(apiLoaderActions(false));
            })
    };
}
export const getBikeAlbum = (userId, spaceId, pageNumber, preference = 15, successCallback, errorCallback) => {
    return dispatch => {
        dispatch(apiLoaderActions(true));
        axios.get(`${USER_BASE_URL}getPicturesBySpaceId/${userId}/spaceId/${spaceId}?pageNumber=${pageNumber}&preference=${preference}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(({ data }) => {
                console.log('bike-album : ', data)
                dispatch(apiLoaderActions(false));
                typeof successCallback === 'function' && successCallback(data);
                dispatch(updateBikeAlbumAction({ updates: data.pictures, reset: !pageNumber, isNewPic: false }));
            }).catch(er => {
                console.log(`getPicturesBySpaceId error: `, er.response || er);
                handleServiceErrors(er, [userId, spaceId, pageNumber, preference = 15, successCallback, errorCallback], getBikeAlbum, false);
                dispatch(apiLoaderActions(false));
                typeof errorCallback === 'function' && errorCallback(er);
            })
    }
}

export const makeBikeProfilePicture = (userId, spaceId, pictureId) => {
    return axios.put(USER_BASE_URL + `user/${userId}/space/${spaceId}?pictureId=${pictureId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT });
}

export const getRoadBuddies = (userId) => {
    return dispatch => {
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
                dispatch(apiLoaderActions(false))
            })
    };
}
export const updateMyWallet = (userId, insurance, roadsideAssistance, successCallback, errorCallback) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.put(USER_BASE_URL + `updateMyWallet/${userId}`, { insurance, roadsideAssistance }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("updateMyWallet success: ", res.data);
                dispatch(apiLoaderActions(false));
                dispatch(updateUserMyWalletAction(res.data));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                successCallback(false)
            })
            .catch(er => {
                console.log(`updateMyWallet error: `, er.response || er);
                handleServiceErrors(er, [userId, insurance, roadsideAssistance, successCallback, errorCallback], updateMyWallet, true);
                dispatch(apiLoaderActions(false))
                errorCallback(false)
            })
    };
}
export const getMyWallet = (userId) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.get(USER_BASE_URL + `getMyWallet/${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("getMyWallet success: ", res.data);
                dispatch(apiLoaderActions(false));
                dispatch(storeUserMyWalletAction(res.data))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
            })
            .catch(er => {
                console.log(`getMyWallet error: `, er.response || er);
                handleServiceErrors(er, [userId], getMyWallet, false);
                dispatch(apiLoaderActions(false))
            })
    };
}
export const getPassengerList = (userId, pageNumber, preference, successCallback, errorCallback) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.get(USER_BASE_URL + `getAllPassengersByUserId?userId=${userId}&pageNumber=${pageNumber}&preference=${preference}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("getAllPassengersByUserId success: ", res.data);
                if (res.data.passengerList.length > 0) {
                    dispatch(apiLoaderActions(false))
                    dispatch(replacePassengerListAction({ passengerList: res.data.passengerList, pageNumber: pageNumber }))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    successCallback(res.data)
                } else {
                    dispatch(apiLoaderActions(false));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    successCallback(res.data)
                }
            })
            .catch(er => {
                console.log(`getAllPassengersByUserId error: `, er.response || er);
                handleServiceErrors(er, [userId, pageNumber, preference, successCallback, errorCallback], getPassengerList, false);
                dispatch(apiLoaderActions(false))
                errorCallback(er)
            })
    };
}
export const registerPassenger = (passenger) => {
    return dispatch => {
        let formData = new FormData();
        const { picture, ...data } = passenger;
        if (picture) {
            if (picture.path) {
                formData.append("image", {
                    uri: picture.path,
                    type: picture.mimeType,
                    name: picture.path.substring(picture.path.lastIndexOf('/') + 1),
                });
            }
            else if (picture.id) {
                formData.append("id", picture.id)
            }
        }
        formData.append("data", JSON.stringify(data));
        dispatch(apiLoaderActions(true))
        axios.post(USER_BASE_URL + `registerPassenger`, formData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('registerPassenger : ', res.data)
                dispatch(apiLoaderActions(false))
                Toast.show({ text: 'passenger created successfully' });
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                passenger.passengerId = res.data.passengerId;
                if (res.data.isFriend) {
                    console.log('isFriend True')
                    dispatch(updateCommunityListAction({ userId: res.data.passengerUserId, passengerId: res.data.passengerId }))
                }
                dispatch(addToPassengerListAction(res.data))
            })
            .catch(er => {
                console.log(`registerPassenger error: `, er.response || er);
                handleServiceErrors(er, [passenger], registerPassenger, true);
                dispatch(apiLoaderActions(false))
            })
    };
}
export const updatePassengerDetails = (psngId, passenger) => {
    return dispatch => {
        let formData = new FormData();
        const { passengerId, picture, ...passengerDetail } = passenger;
        if (picture) {
            if (picture.path) {
                formData.append("image", {
                    uri: picture.path,
                    type: picture.mimeType,
                    name: picture.path.substring(picture.path.lastIndexOf('/') + 1),
                });
            }
            else if (picture.id) {
                formData.append("id", picture.id)
            }
        }
        formData.append("data", JSON.stringify(passengerDetail));
        dispatch(apiLoaderActions(true))
        axios.patch(USER_BASE_URL + `updatePassengerDetails/${psngId}`, formData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("updatePassengerDetails success: ", res.data);
                dispatch(apiLoaderActions(false))
                Toast.show({ text: 'passenger details updated successfully' });
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                dispatch(updatePassengerInListAction(res.data))
            })
            .catch(er => {
                console.log(`updatePassengerDetails error: `, er.response || er);
                handleServiceErrors(er, [psngId, passenger], updatePassengerDetails, true);
                dispatch(apiLoaderActions(false))
            })
    };
}
export const deletePassenger = (passengerId) => {
    return axios.delete(USER_BASE_URL + `deletePassenger/${passengerId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT });
}
export const getCommunityFriendsList = (userId, pageNumber, preference, successCallback, errorCallback) => {
    return dispatch => {
        dispatch(apiLoaderActions(true))
        axios.get(FRIENDS_BASE_URL + `getCommunityFriendsList?userId=${userId}&pageNumber=${pageNumber}&preference=${preference}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("getCommunityFriendsList success: ", res.data);
                if (res.data.friendList.length > 0) {
                    dispatch(apiLoaderActions(false))
                    dispatch(replaceCommunityListAction({ communityList: res.data.friendList, pageNumber: pageNumber }))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    dispatch(updatePageNumberAction({ pageNumber: pageNumber }));
                    successCallback(res.data)
                } else {
                    dispatch(apiLoaderActions(false));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    successCallback(res.data)
                }
            })
            .catch(er => {
                console.log(`getCommunityFriendsList error: `, er.response || er);
                handleServiceErrors(er, [userId, pageNumber, preference, successCallback, errorCallback], getCommunityFriendsList, false);
                dispatch(apiLoaderActions(false))
                errorCallback(er)
            })
    };
}
export const getAlbum = (userId, pageNumber, preference, successCallback, errorCallback) => {
    return dispatch => {
        axios.get(USER_BASE_URL + `getAlbumByUserId?userId=${userId}&pageNumber=${pageNumber}&preference=${preference}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('getAlbumByUserId : ', res.data)
                if (res.data.pictureList.length > 0) {
                    dispatch(replaceAlbumListAction({ pageNumber, pictureList: res.data.pictures }))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    dispatch(updatePageNumberAction({ pageNumber: pageNumber }));
                    successCallback(res.data)
                } else {
                    successCallback(res.data)
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            })
            .catch(er => {
                console.log(`getAlbum error: `, er.response || er);
                handleServiceErrors(er, [userId, pageNumber, preference = 15, successCallback, errorCallback], getAlbum, false);
                errorCallback(er)
            })
    };
}
export const updatePictureDetails = (pictureDetails, userId) => {
    console.log('\n\n\n updatePicture Detail : ', pictureDetails);
    return axios.put(USER_BASE_URL + `updatePictureDetails?userId=${userId}`, pictureDetails, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}
export const deletePictures = (userId, pictureList) => {
    return axios.put(USER_BASE_URL + `deletePictures?userId=${userId}`, { pictureList }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}
export const getBuddyAlbum = (userId, friendId, pageNumber, preference, buddyAlbum, successCallback, errorCallback) => {
    return dispatch => {
        axios.get(`${USER_BASE_URL}users/${userId}/friend/${friendId}/album?pageNumber=${pageNumber}&preference=${preference}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("getBuddyAlbum success: ", res.data);
                const updatedBuddyAlbum = [...buddyAlbum, ...res.data.pictures]
                res.data.pictures.length > 0 && dispatch(updateCurrentFriendAction({ pictures: updatedBuddyAlbum, userId: friendId }));
                successCallback(res.data)
            })
            .catch(er => {
                console.log(`getBuddyAlbum error: `, er.response || er);
                handleServiceErrors(er, [userId, friendId, pageNumber, preference, buddyAlbum, successCallback, errorCallback], getBuddyAlbum, false);
                errorCallback(er)
            })
    };
}
export const getAllChats = (userId, searchParams, successCallback, errorCallback) => {
    return dispatch => {
        axios.get(CHAT_BASE_URL + `getAllChats?userId=${userId}`+(searchParams && searchParams.length>0?`&searchParam=${searchParams}`:''), { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("getAllChats success: ", res.data);
                if(searchParams && searchParams.length>0){
                    successCallback && successCallback(res.data)
                }
                else{
                  
                    dispatch(updateChatListAction({ comingFrom: 'getAllChatsApi', chats: res.data.chats, totalUnseenMessage: res.data.totalUnseenMessage }));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            })
            .catch(er => {
                console.log(`getAllChats error: `, er.response || er);
                errorCallback && errorCallback(er);
                handleServiceErrors(er, [userId], getAllChats, false);
            })
    };
}
export const getAllMessages = (id, userId, isGroup) => {
    return dispatch => {
        axios.get(CHAT_BASE_URL + `getAllMessages?id=${id}&userId=${userId}&isGroup=${isGroup}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log(" ************RESponses for MESSAGE API*******************",res.data);
                dispatch(updateChatMessagesAction(res.data));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
            })
            .catch(er => {
                console.log(`getAllMessages error: `, er);
                handleServiceErrors(er, [id, userId, isGroup], getAllMessages, false);
            })
    };
}
export const sendMessage = ({ isAnonymousGroup, userIds, groupIds, userId, content, name, nickname, senderPictureId, type = CHAT_CONTENT_TYPE.TEXT, media, mediaIds, successCallback }) => {
    return dispatch => {
        const body = { isAnonymousGroup, senderPictureId, senderId: userId, senderName: name, senderNickname: nickname, date: new Date().toISOString(), type, content };
        let formData = new FormData();
        if (userIds) {
            userIds.forEach((id) => formData.append("userIds", id));
        }
        if (groupIds) {
            groupIds.forEach((groupId) => formData.append("groupIds", groupId));
        }
        if (media) {
            media.forEach(({ mimeType, path }) => {
                formData.append("media", {
                    uri: path,
                    type: mimeType,
                    name: path.substring(path.lastIndexOf('/') + 1),
                });
            });
        } else if (mediaIds) {
            mediaIds.forEach((id) => formData.append("mediaIds", id));
        }
        Object.keys(body).forEach(key => {
            if (body[key] === null || body[key] === undefined || body[key] === '') return;
            formData.append(key, body[key]);
        });
        axios.post(CHAT_BASE_URL + `sendMessage1`, formData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('sendMessage : ', res.data);
                successCallback && successCallback(res.data);
                if (Actions.currentScene !== PageKeys.CHAT && Actions.currentScene !== PageKeys.CHAT_LIST) return;
                const messageSent = {
                    type, senderPictureId,
                    date: new Date().toISOString(),
                    media: res.data.media,
                    messageId: res.data.messageId,
                    senderId: userId,
                    senderName: name,
                    senderNickname: nickname
                };
                if (type === CHAT_CONTENT_TYPE.RIDE) {
                    messageSent.content = res.data.content;
                } else {
                    messageSent.content = content;
                }
                dispatch(replaceChatMessagesAction(messageSent));
                if ((userIds && userIds.length === 1) || (groupIds && groupIds.length === 1)) {
                    dispatch(updateChatListAction({ comingFrom: 'sendMessgaeApi', messageBody: messageSent, id: userIds && userIds.length === 1 ? userIds[0] : groupIds[0] }));
                }
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            })
            .catch(error => {
                console.log('\n\n\n error : ', error)
                // handleServiceErrors(error, [{ isAnonymousGroup, userIds, groupIds, userId, content, name, nickname, senderPictureId, type = CHAT_CONTENT_TYPE.TEXT, media, mediaIds, successCallback }], sendMessage, true);
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log('sendMessage error: ', error.response.data);
                    console.log('sendMessage error: ', error.response.status);
                    console.log('sendMessage error: ', error.response.headers);
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    console.log('sendMessage error: ', error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('sendMessage error: ', error.message);
                }
            })
    };
}
export const deleteMessagesById = (isGroup, id, userId, messageToBeDeleted, newChatMessages) => {
    return dispatch => {
        axios.put(CHAT_BASE_URL + `deleteMessagesById`, { isGroup: isGroup, id: id, userId: userId, messageIdList: messageToBeDeleted }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('deleteMessagesById : ', res.data)
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                dispatch(replaceChatMessagesAction({ comingFrom: 'deleteMessage', messageIds: messageToBeDeleted }))
                if (newChatMessages) {
                    dispatch(updateChatListAction({ comingFrom: 'sendMessgaeApi', messageBody: newChatMessages, id: id }));
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
        axios.put(CHAT_BASE_URL + `deleteMessagesByIdForEveryone`, { isGroup: isGroup, id: id, userId: userId, messageIdList: messageToBeDeleted }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('deleteMessagesByIdForEveryone  : ', res.data)
                dispatch(replaceChatMessagesAction({ comingFrom: 'deleteMessage', messageIds: messageToBeDeleted }))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                if (newChatMessages) {
                    dispatch(updateChatListAction({ comingFrom: 'sendMessgaeApi', messageBody: newChatMessages, id: id }));
                }
                else {
                    dispatch(updateChatListAction({ comingFrom: 'sendMessgaeApi', messageBody: '', id: id }));
                }
            })
            .catch(error => {
                if (error.response) {
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    console.log(error.request);
                } else {
                    console.log('Error', error.message);
                }
                console.log(error.config);
                handleServiceErrors(error, [isGroup, id, userId, messageToBeDeleted, newChatMessages], deleteMessagesByIdForEveryone, true);
                console.log('deleteMessagesByIdForEveryone   error : ', error);
            })
    };
}
export const deleteAllMessages = (id, userId, isGroup, successCallback, errorCallback) => {
    return dispatch => {
        axios.delete(CHAT_BASE_URL + `deleteAllMessages?id=${id}&userId=${userId}&isGroup=${isGroup}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("deleteAllMessages success: ", res.data);
                dispatch(replaceChatMessagesAction({ comingFrom: 'deleteAllMessages', id: id }))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                successCallback(res.data);
            })
            .catch(er => {
                errorCallback(er);
                console.log(`deleteAllMessages error: `, er.response || er);
                handleServiceErrors(er, [id, userId, isGroup], deleteAllMessages, true);
            })
    };
}
export const seenMessage = (id, userId, isGroup, comingFrom) => {
    return dispatch => {
        axios.get(CHAT_BASE_URL + `seenMessage?id=${id}&userId=${userId}&isGroup=${isGroup}`, { cancelToken: axiosSource.token, timeout:10000 })
            .then(res => {
                console.log('\n\n\n id : ', id, isGroup, userId)
                console.log("seenMessage success: ", res);
                console.log("seenMessage success: ", res.data);
                console.log(comingFrom === 'chatList'||comingFrom ==='chatPage')
                if (comingFrom === 'chatList'||comingFrom ==='chatPage') {
                    let chatData = store.getState().ChatList.chatData
                    dispatch(resetMessageCountAction({ id: id, comingFrom: 'seenMessage', unSeenmessageCount:res.data.messageCount}));
                }
            })
            .catch(er => {
                console.log(`seenMessage error: `, er.response || er);
            })
    };
}
export const createPost = (postType, userId, spaceId, postData, isAsync, showLoader, successCallback, errorCallback) => {
    return dispatch => {
        showLoader && dispatch(apiLoaderActions(true));
        const { pictures, ids, fromIndex, toIndex, ...data } = postData;
        const formData = new FormData();
        if (spaceId) data.metaData = { spaceId };
        if (postType === POST_TYPE.ALBUM) {
            if (pictures) {
                formData.append("images", {
                    uri: pictures.path,
                    type: pictures.mimeType,
                    name: pictures.path.substring(pictures.path.lastIndexOf('/') + 1),
                });
            }
            formData.append('data', JSON.stringify({ ...data, fromIndex, toIndex }));
        }
        else {
            formData.append('data', JSON.stringify(data));
        }
        axios.post(`${POSTS_BASE_URL}users/${userId}/posts`, formData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(apiLoaderActions(false));
                console.log("createPost success: ", res.data);
                if (isAsync) Toast.show({ text: 'Post created successfully' });
                typeof successCallback === 'function' && successCallback(res.data);
            })
            .catch(er => {
                dispatch(apiLoaderActions(false));
                console.log(`createPost error: `, er.response || er);
                if (isAsync) Toast.show({ text: 'Something went wrong' });
                typeof errorCallback === 'function' && errorCallback(er.response || er);
                handleServiceErrors(er, [userId, spaceId, postData, isAsync, showLoader, successCallback, errorCallback], createPost, true);
            })
    }
}
export const addPictureInAlbum = (userId, spaceId, postData) => {
    const { pictures, ...data } = postData;
    const formData = new FormData();
    if (pictures) {
        formData.append("images", {
            uri: pictures.path,
            type: pictures.mimeType,
            name: pictures.path.substring(pictures.path.lastIndexOf('/') + 1),
        });
    }
    if (spaceId) data.metaData = { spaceId };
    formData.append('data', JSON.stringify(data));
    return axios.post(`${POSTS_BASE_URL}users/${userId}/posts`, formData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}
export const updatePost = (spaceId, postData, postId, isAsync, showLoader, successCallback, errorCallback) => {
    return dispatch => {
        if (isAsync) dispatch(toggleApiCallInfoAction({ id: postId, status: true }));
        showLoader && dispatch(apiLoaderActions(true));
        const { pictures, ids, ...data } = postData;
        const formData = new FormData();
        if (pictures) {
            pictures.forEach(({ mimeType, path }) => {
                formData.append("images", {
                    uri: path,
                    type: mimeType,
                    name: path.substring(path.lastIndexOf('/') + 1),
                });
            });
        }
        if (ids) {
            ids.forEach(id => {
                formData.append("ids", id);
            });
        }
        if (spaceId) data.metaData = { spaceId };
        formData.append('data', JSON.stringify(data));
        console.log('fromData updatePost : ', formData)
        axios.patch(`${POSTS_BASE_URL}post/${postId}`, formData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log('updatePost : ', res.data)
                dispatch(apiLoaderActions(false));
                if (isAsync) {
                    dispatch(toggleApiCallInfoAction({ id: postId, status: false }));
                    Toast.show({ text: 'Post updated successfully' });
                }
                typeof successCallback === 'function' && successCallback(res.data);
            })
            .catch(er => {
                dispatch(apiLoaderActions(false));
                console.log(`updatePost error: `, er.response || er);
                if (isAsync) {
                    dispatch(toggleApiCallInfoAction({ id: postId, status: false }));
                    Toast.show({ text: 'Something went wrong' });
                }
                typeof errorCallback === 'function' && errorCallback(er.response || er);
                handleServiceErrors(er, [spaceId, postData, postId, isAsync, showLoader, successCallback, errorCallback], updatePost, true);
            })
    }
}
export const getPosts = (userId, postTypeId, spaceId, pageNumber, preference = 10) => {
    const URL_ENDPOINT = `user/${userId}/postType/${postTypeId}?pageNumber=${pageNumber}&preference=${preference}` + (spaceId ? `&spaceId=${spaceId}` : '');
    return axios.get(`${POSTS_BASE_URL}${URL_ENDPOINT}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT });
}

export const getPostDetail = (postId) => {
    const URL_ENDPOINT = `posts/${postId}`
    return axios.get(`${POSTS_BASE_URL}${URL_ENDPOINT}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT });
}

export const getComments = (postId, postType, pageNumber, preference = 15) => {
    return axios.get(`${POSTS_BASE_URL}comments/${postId}/${postType}?pageNumber=${pageNumber}&preference=${preference}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT });
}
export const addComment = (postId, commentData) => {
    return axios.post(`${POSTS_BASE_URL}comments/${postId}`, commentData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}
export const deleteComment = (commentId, userId) => {
    return axios.delete(`${POSTS_BASE_URL}comments/${commentId}/${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}
export const getLikes = (postId, postType) => {
    return axios.get(`${POSTS_BASE_URL}likes/${postId}/${postType}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}
export const addLike = (postId, postType) => {
    return axios.post(`${POSTS_BASE_URL}likes/${postId}/${postType}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}
export const unLike = (postId, userId) => {
    return axios.delete(`${POSTS_BASE_URL}likes/${userId}/${postId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}
export const getFriendsPosts = (userId, postTypeId, friendId, spaceId, pageNumber) => {
    const URL_ENDPOINT = `posts/user/${userId}/postType/${postTypeId}/friends/${friendId}?pageNumber=${pageNumber}` + (spaceId ? `&spaceId=${spaceId}` : '');
    return axios.get(`${POSTS_BASE_URL}${URL_ENDPOINT}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT });
}
export const deletePost = (postId) => {
    return axios.delete(`${POSTS_BASE_URL}posts/${postId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}
export const searchFriendsForChat = (searchParam, userId, pageNumber, preference = 15) => {
    let URL = GRAPH_BASE_URL + `searchFriends?searchParam=${searchParam}&userId=${userId}&pageNumber=${pageNumber}&preference=${preference}`;
    return axios.get(URL, { cancelToken: axiosSource.token, timeout: API_TIMEOUT });
}

export const searchingOnChat = (searchParam, userId) => {
    let URL = FRIENDS_BASE_URL + `searchingOnChat?searchParam=${searchParam}&userId=${userId}`;
    return axios.get(URL, { cancelToken: axiosSource.token, timeout: API_TIMEOUT });
}

export const deactivateUserAccount = (userId) => {
    return axios.delete(`${USER_BASE_URL}deleteUserAccount/${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}
export const activateUserAccount = (userId) => {
    return axios.patch(`${USER_BASE_URL}activateUserAccount/${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}
export const sendingTestData = (data) => {
    return axios.post(`https://beta.api.myridedna.com/users/`, data, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
}

export const getFriendNewsFeed = (userId, pageNumber, preference = 10) => {
    const URL_ENDPOINT = `newsFeed/user/${userId}?pageNumber=${pageNumber}&preference=${preference}`;
    return axios.get(`${POSTS_BASE_URL}${URL_ENDPOINT}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT });
}


logErrorResponse = (error, apiName) => {
    console.log(`\n\n\n ${apiName} failed \n\n\n`)
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log('response.data error: ', error.response.data);
        console.log('response.status error: ', error.response.status);
        console.log('response.header error: ', error.response.headers);
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log('response.request error: ', error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        console.log('response.message error: ', error.message);
    }
}

export const handleServiceErrors = (error, params, api, isTimeout, withoutDispatch = false) => {
    console.log('handleServiceErrors',error.config)
    console.log('error.message 123 : ', error.message)
    if (error.message === 'Network Error' && store.getState().PageState.hasNetwork === false && isTimeout === false) {
        store.dispatch(errorHandlingAction({ currentScene: Actions.currentScene, config: error.config, params: params, api: api, isRetryApi: false, withoutDispatch }));

    }
    else if (error.message === 'Network Error' && store.getState().PageState.hasNetwork === true) {
        console.log('service is down')
        store.dispatch(errorHandlingAction({ currentScene: Actions.currentScene, config: error.config, params: params, api: api, isRetryApi: true, withoutDispatch }));

    }
    else if (error.message === 'timeout of 10000ms exceeded') {
        console.log('request timeout')
        store.dispatch(errorHandlingAction({ currentScene: Actions.currentScene, config: error.config, params: params, api: api, isRetryApi: true, withoutDispatch }));

    }
}