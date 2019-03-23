import {
    updateSignupResultAction, updateRideAction, updateWaypointAction, updateUserAction, toggleLoaderAction,
    replaceRideListAction, deleteRideAction, updateRideListAction, updateEmailStatusAction, updateFriendListAction, replaceFriendListAction, replaceGarageInfoAction, updateBikeListAction, addToBikeListAction, deleteBikeFromListAction, updateActiveBikeAction, updateGarageNameAction, replaceShortSpaceListAction, replaceSearchFriendListAction, updateRelationshipAction, createFriendGroupAction, replaceFriendGroupListAction, addMembersToCurrentGroupAction, resetMembersFromCurrentGroupAction, updateMemberAction, removeMemberAction, addWaypointAction, deleteWaypointAction, removeFriendGroupAction, updatePasswordSuccessAction, updatePasswordErrorAction, screenChangeAction, addToPassengerListAction, replacePassengerListAction, updatePassengerInListAction, updateFriendAction
} from '../actions';
import { USER_BASE_URL, RIDE_BASE_URL, RECORD_RIDE_STATUS, RIDE_TYPE, PageKeys, USER_AUTH_TOKEN, FRIENDS_BASE_URL, HEADER_KEYS, RELATIONSHIP, GRAPH_BASE_URL, NOTIFICATIONS_BASE_URL } from '../constants';
import axios from 'axios';

import { AsyncStorage } from 'react-native';

import Base64 from '../util';
import { Actions } from 'react-native-router-flux';

const CancelToken = axios.CancelToken;
const axiosSource = CancelToken.source();
const API_TIMEOUT = 15 * 1000; // 15 seconds

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
                    console.log("getPicture empty response: ", res.data);
                    errorCallback(res.data);
                } else {
                    console.log("getPicture success response: ", res.data);
                    successCallback(res.data);
                }
            }
        })
        .catch(er => {
            console.log("getPicture error response: ", er.response);
            errorCallback(er.response);
            console.log("getPicture error: ", er.response || er);
        })
}
export const pushNotification = (userId) => {
    axios.get(NOTIFICATIONS_BASE_URL + `pushNotification/${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        .then(res => {
            if (res.status === 200) {
                console.log("pushNotification success: ", res.data);
            }
        })
        .catch(er => {
            console.log("pushNotification error: ", er.response || er);
        })
}
export const logoutUser = (userId, accessToken) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.post(USER_BASE_URL + `logoutUser`, { userId, accessToken }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    // TODO: Clear store
                    AsyncStorage.removeItem(USER_AUTH_TOKEN).then(() => {
                        Actions.reset(PageKeys.LOGIN);
                    });
                }
            })
            .catch(er => {
                console.log(er.response);
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
export const updateUserInfo = (userData) => {
    console.log("updateUserInfo with ", userData);
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(USER_BASE_URL + 'updateUserDetails', userData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log("updateUserInfo: ", res.data);
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateUserAction(userData));
                }
            })
            .catch(er => {
                console.log("updateUserInfo: ", er.response || er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const updatePassword = (passwordInfo) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(USER_BASE_URL + 'updatePassword', passwordInfo, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log("updatePassword success: ", res.data);
                    dispatch(toggleLoaderAction(false));
                    dispatch(updatePasswordSuccessAction(res.data));
                }
            })
            .catch(er => {
                console.log("updatePassword error: ", er.response || er);
                dispatch(toggleLoaderAction(false));
                dispatch(updatePasswordErrorAction(er.response.data));
            })
    };
}
export const updateShareLocationState = (userId, shareLocState) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(USER_BASE_URL + 'shareLocationEnableOrDisable', { userId, locationEnable: shareLocState }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log("updateShareLocationState: ", res.data);
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateUserAction({ locationEnable: shareLocState }));
                }
            })
            .catch(er => {
                console.log("updateShareLocationState: ", er.response || er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const updateProfilePicture = (profilePicStr, mimeType, userId) => {
    return dispatch => {
        axios.put(USER_BASE_URL + 'updateProfilePicture', { userId, profilePicture: profilePicStr, mimeType }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(updateUserAction({ ...res.data, profilePicture: `data:${mimeType};base64,${profilePicStr}` }));
                }
            })
            .catch(er => {
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
        dispatch(toggleLoaderAction(true));
        axios.get(RIDE_BASE_URL + `getAllBuildRides?userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(replaceRideListAction({ rideType: RIDE_TYPE.BUILD_RIDE, rideList: res.data }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const getAllPublicRides = (userId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.get(RIDE_BASE_URL + `getAllPublicRides?userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(replaceRideListAction({ rideType: RIDE_TYPE.SHARED_RIDE, rideList: res.data }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const getAllRecordedRides = (userId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.get(RIDE_BASE_URL + `getAllRecordRides?userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(replaceRideListAction({ rideType: RIDE_TYPE.RECORD_RIDE, rideList: res.data }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}

export const getFriendsRideList = (friendUserId,relationship) =>{
    return dispatch => {
        dispatch(toggleLoaderAction(true));  
        axios.get(RIDE_BASE_URL + `getFriendRides?userId=${friendUserId}&relationshipStatus=${relationship}`) 
        .then(res => {
            if(res.status === 200){
                dispatch(toggleLoaderAction(false));   
                dispatch(updateFriendAction({rideList:res.data}));
                console.log('getFriendRides : ',res)
            }
        })
        .catch(er => {
            dispatch(toggleLoaderAction(false)); 
            console.log('friendsRideError : ',er)
        }) 
    }
}
export const createNewRide = (rideData) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.post(RIDE_BASE_URL + 'createRide', rideData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateRideAction({ ...rideData, ...res.data }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const createRecordRide = (rideData) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.post(RIDE_BASE_URL + 'createRecordRide', rideData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateRideAction({ ...rideData, ...res.data }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const copySharedRide = (rideId, name, rideType, userId, date) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `copySharedRide?rideId=${rideId}`, { name, userId, date }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateRideListAction({ rideType, rideList: [res.data] }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const copyRide = (rideId, name, rideType, date) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `copyRide?rideId=${rideId}`, { name, date }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateRideListAction({ rideType, rideList: [res.data] }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const renameRide = (ride, rideType, userId, index) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `renameRecordRide`, { rideId: ride.rideId, name: ride.name, userId }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateRideListAction({ rideType, rideList: [ride], index }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const deleteRide = (rideId, index, rideType) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.delete(RIDE_BASE_URL + `deleteRide?rideId=${rideId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(deleteRideAction({ rideType, index }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const addTrackpoints = (trackpoints, distance, ride, userId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.post(RIDE_BASE_URL + `addTrackpoints?rideId=${ride.rideId}&userId=${userId}`,
            { trackpoints: Base64.encode(trackpoints.join()), distance }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateRideAction({ ...ride, trackpoints: [...ride.trackpoints, ...trackpoints] }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const pauseRecordRide = (pauseTime, trackpoints, distance, ride, userId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `pauseRecordRide?rideId=${ride.rideId}&userId=${userId}`,
            { trackpoints: Base64.encode(trackpoints.join()), pauseTime, distance }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateRideAction({ ...ride, trackpoints: [...ride.trackpoints, ...trackpoints], ...res.data }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const completeRecordRide = (endTime, trackpoints, distance, ride, userId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `completeRecordRide?rideId=${ride.rideId}&userId=${userId}`,
            { trackpoints: Base64.encode(trackpoints.join()), endTime, distance }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateRideAction({ ...ride, trackpoints: [...ride.trackpoints, ...trackpoints], status: RECORD_RIDE_STATUS.COMPLETED }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const continueRecordRide = (resumeTime, ride, userId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `resumeRecordRide?rideId=${ride.rideId}&userId=${userId}`, { resumeTime }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateRideAction({ ...ride, ...res.data }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}

export const addSource = (waypoint, ride) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `addSource?rideId=${ride.rideId}`, waypoint, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateRideAction({ source: waypoint }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const addWaypoint = (waypoint, ride, index) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `addWaypoint?rideId=${ride.rideId}&index=${index}`, waypoint, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(addWaypointAction({ index, waypoint }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const deleteWaypoint = (ride, index) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.delete(RIDE_BASE_URL + `deleteWaypoint?rideId=${ride.rideId}&index=${index}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(deleteWaypointAction({ index }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const updateWaypoint = (waypoint, ride, index) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `updateWaypoint?rideId=${ride.rideId}&index=${index}`, waypoint, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateWaypointAction({ index, waypoint }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const updateSource = (waypoint, ride) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `updateSource?rideId=${ride.rideId}`, waypoint, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateRideAction({ source: waypoint }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const deleteSource = (ride) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.delete(RIDE_BASE_URL + `deleteSource?rideId=${ride.rideId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateRideAction({ source: null }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const updateDestination = (waypoint, ride) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `updateDestination?rideId=${ride.rideId}`, waypoint, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateRideAction({ destination: waypoint }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const makeWaypointAsSource = (ride, index) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `makeWaypointAsSource?rideId=${ride.rideId}&index=${index}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateRideAction({
                        waypoints: [...ride.waypoints.slice(index + 1)],
                        source: ride.waypoints[index]
                    }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const makeSourceAsWaypoint = (ride) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `makeSourceAsWaypoint?rideId=${ride.rideId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateRideAction({
                        waypoints: [ride.source, ...ride.waypoints],
                        source: null
                    }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const makeWaypointAsDestination = (ride, index) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `makeWaypointAsDestination?rideId=${ride.rideId}&index=${index}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateRideAction({
                        waypoints: [...ride.waypoints.slice(0, index)],
                        destination: ride.waypoints[index]
                    }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const makeDestinationAsWaypoint = (ride) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `makeDestinationAsWaypoint?rideId=${ride.rideId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateRideAction({
                        waypoints: [...ride.waypoints, ride.destination],
                        destination: null
                    }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const deleteDestination = (ride) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.delete(RIDE_BASE_URL + `deleteDestination?rideId=${ride.rideId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateRideAction({ destination: null }));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
// DOC: This API call is for syncing the state of ride with the server. There will not be any dispatcher
export const replaceRide = (rideId, ride) => {
    axios.put(RIDE_BASE_URL + `replaceRide?rideId=${rideId}`, ride, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
        .then(res => {
            if (res.status === 200) {
                console.log("Synced with server");
            }
        })
        .catch(er => {
            console.log(er.response);
        })
}
export const getRideByRideId = (rideId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.get(RIDE_BASE_URL + `getRideByRideId?rideId=${rideId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateRideAction({ ...res.data }));
                }
            })
            .catch(er => {
                console.log(`getRideByRideId: ${RIDE_BASE_URL}getRideByRideId?rideId=${rideId}`, er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const getAllFriends = (friendType, userId, pageNumber) => {
    return dispatch => {
        pageNumber > 0 && dispatch(toggleLoaderAction(true));
        axios.get(FRIENDS_BASE_URL + `getFriendList?userId=${userId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    if (pageNumber === 0) {
                        return dispatch(replaceFriendListAction({ friendType, friendList: res.data }))
                    } else {
                        dispatch(toggleLoaderAction(false));
                        return dispatch(updateFriendListAction({ friendType, friendList: res.data }))
                    }
                }
            })
            .catch(er => {
                console.log(`getAllFriends: `, er.response);
                // TODO: Dispatch error info action
                pageNumber > 0 && dispatch(toggleLoaderAction(false));
            })
    };
}
export const getAllOnlineFriends = (friendType, userId, pageNumber) => {
    return dispatch => {
        pageNumber > 0 && dispatch(toggleLoaderAction(true));
        axios.get(GRAPH_BASE_URL + `getOnlineFriends?userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateFriendListAction({ friendType, friendList: res.data }))
                }
            })
            .catch(er => {
                console.log(`getAllOnlineFriends: `, er.response ? er.response : er);
                // TODO: Dispatch error info action
                pageNumber > 0 && dispatch(toggleLoaderAction(false));
            })
    };
}
export const searchForFriend = (searchParam, userId, pageNumber) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.get(FRIENDS_BASE_URL + `searchFriend?searchParam=${searchParam}&userId=${userId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log(res.data);
                    dispatch(toggleLoaderAction(false));
                    return dispatch(replaceSearchFriendListAction(res.data));
                }
            })
            .catch(er => {
                console.log(`searchForFriend: `, er, er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const sendFriendRequest = (requestBody, personId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.post(FRIENDS_BASE_URL + `sendFriendRequest`, requestBody, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateRelationshipAction({ personId, relationship: RELATIONSHIP.SENT_REQUEST }));
                }
            })
            .catch(er => {
                console.log(`sendFriendRequest: `, er, er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const cancelFriendRequest = (senderId, personId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.delete(FRIENDS_BASE_URL + `cancelFriendRequest?senderId=${senderId}&userId=${personId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateRelationshipAction({ personId, relationship: RELATIONSHIP.UNKNOWN }));
                }
            })
            .catch(er => {
                console.log(`cancelFriendRequest: `, er, er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const approveFriendRequest = (senderId, personId, actionDate) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(FRIENDS_BASE_URL + `approveFriendRequest?senderId=${senderId}&userId=${personId}&date=${actionDate}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateRelationshipAction({ personId, relationship: RELATIONSHIP.FRIEND }));
                }
            })
            .catch(er => {
                console.log(`cancelFriendRequest: `, er, er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const rejectFriendRequest = (senderId, personId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(FRIENDS_BASE_URL + `rejectFriendRequest?senderId=${senderId}&userId=${personId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateRelationshipAction({ personId, relationship: RELATIONSHIP.UNKNOWN }));
                }
            })
            .catch(er => {
                console.log(`cancelFriendRequest: `, er, er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const doUnfriend = (senderId, personId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.delete(FRIENDS_BASE_URL + `unfriend?senderId=${senderId}&userId=${personId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateRelationshipAction({ personId, relationship: RELATIONSHIP.UNKNOWN }));
                }
            })
            .catch(er => {
                console.log(`doUnfriend: `, er, er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const getFriendGroups = (userId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.get(FRIENDS_BASE_URL + `getFriendGroups?memberId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(replaceFriendGroupListAction(res.data))
                }
            })
            .catch(er => {
                console.log(`getFriendGroups: `, er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const createFriendGroup = (newGroupInfo) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.post(FRIENDS_BASE_URL + `createFriendGroup`, newGroupInfo, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    newGroupInfo.groupId = res.data.groupId;
                    dispatch(toggleLoaderAction(false));
                    return dispatch(createFriendGroupAction(newGroupInfo))
                }
            })
            .catch(er => {
                console.log(`createFriendGroup: `, er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const exitFriendGroup = (groupId, memberId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(FRIENDS_BASE_URL + `exitFriendGroup?memberId=${memberId}&groupId=${groupId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(removeFriendGroupAction(groupId))
                }
            })
            .catch(er => {
                console.log(`exitFriendGroup: `, er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const getAllGroupMembers = (groupId, userId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.get(FRIENDS_BASE_URL + `getAllGroupMembers?groupId=${groupId}&memberId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log(res.data);
                    dispatch(toggleLoaderAction(false));
                    return dispatch(resetMembersFromCurrentGroupAction(res.data))
                }
            })
            .catch(er => {
                console.log(`addMembers: `, er.response ? er.response : er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const addMembers = (groupId, memberDetails) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(FRIENDS_BASE_URL + `addMembers?groupId=${groupId}`, memberDetails, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log(res.data);
                    dispatch(toggleLoaderAction(false));
                    return dispatch(addMembersToCurrentGroupAction(res.data))
                }
            })
            .catch(er => {
                console.log(`addMembers: `, er.response ? er.response : er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const makeMemberAsAdmin = (groupId, memberId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(FRIENDS_BASE_URL + `makeMemberAsAdmin?groupId=${groupId}&memberId=${memberId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log(res.data);
                    setTimeout(() => dispatch(toggleLoaderAction(false)), 1000);
                    return dispatch(updateMemberAction({ memberId, updates: { isAdmin: true } }));
                }
            })
            .catch(er => {
                console.log(`makeMemberAsAdmin: `, er.response ? er.response : er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const dismissMemberAsAdmin = (groupId, memberId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(FRIENDS_BASE_URL + `dismissMemberAsAdmin?groupId=${groupId}&memberId=${memberId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log(res.data);
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateMemberAction({ memberId, updates: { isAdmin: false } }));
                }
            })
            .catch(er => {
                console.log(`dismissMemberAsAdmin: `, er.response ? er.response : er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const removeMember = (groupId, memberId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(FRIENDS_BASE_URL + `removeMember?groupId=${groupId}&memberId=${memberId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log(res.data);
                    dispatch(toggleLoaderAction(false));
                    return dispatch(removeMemberAction(memberId));
                }
            })
            .catch(er => {
                console.log(`removeMember: `, er.response ? er.response : er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const getSpaceList = (userId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.get(USER_BASE_URL + `getSpaceList?userId=${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("getSpaceList success: ", res.data);
                dispatch(toggleLoaderAction(false));
                return dispatch(replaceShortSpaceListAction(res.data))
            })
            .catch(er => {
                console.log(`getSpaceList: `, er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
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
            errorCallback(er.response || er);
        })
}
export const updateGarageName = (garageName, garageId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(USER_BASE_URL + 'updateGarage', { garageName, garageId }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(toggleLoaderAction(false));
                return dispatch(updateGarageNameAction(garageName))
            })
            .catch(er => {
                console.log(`updateGarageName: `, er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const addBikeToGarage = (userId, bike, index) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(USER_BASE_URL + `addSpace/${userId}`, bike, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                bike.spaceId = res.data.spaceId;
                dispatch(toggleLoaderAction(false));
                // DOC: Updating the bike pictureList by combining mimeType and image string
                bike.pictureList = bike.pictureList.reduce((arr, { mimeType, image }) => {
                    arr.push(`data:${mimeType};base64,${image}`)
                    return arr;
                }, []);
                console.log(bike.pictureList);
                return dispatch(addToBikeListAction({ index, bike }))
            })
            .catch(er => {
                console.log(`addBikeToGarage: `, er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const editBike = (userId, bike, oldImages, index) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(USER_BASE_URL + `updateSpace/${userId}`, bike, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(toggleLoaderAction(false));
                // DOC: Updating the bike details with current and old images
                bike.pictureList = [...oldImages, ...bike.pictureList.reduce((arr, { mimeType, image }) => {
                    arr.push(`data:${mimeType};base64,${image}`)
                    return arr;
                }, [])];
                return dispatch(updateBikeListAction({ index, bike }))
            })
            .catch(er => {
                console.log(`editBike: `, er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const setBikeAsActive = (userId, bike, prevActiveIndex, newActiveIndex) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(USER_BASE_URL + `setDefaultSpace/${userId}/${bike.spaceId}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(toggleLoaderAction(false));
                return dispatch(updateActiveBikeAction({ prevActiveIndex, newActiveIndex, bike }))
            })
            .catch(er => {
                console.log(`setBikeAsActive: `, er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const deleteBike = (userId, bikeId, index) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.delete(USER_BASE_URL + `deleteSpace/${userId}/${bikeId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(toggleLoaderAction(false));
                return dispatch(deleteBikeFromListAction({ index }))
            })
            .catch(er => {
                console.log(`deleteBike: `, er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const getPassengerList = (userId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.get(USER_BASE_URL + `getAllPassengersByUserId/${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("getAllPassengersByUserId success: ", res.data);
                dispatch(toggleLoaderAction(false));
                dispatch(replacePassengerListAction(Array.isArray(res.data) ? res.data : []))
            })
            .catch(er => {
                console.log(`getAllPassengersByUserId error: `, er.response || er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const registerPassenger = (userId, passenger) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.post(USER_BASE_URL + `registerPassenger`, { userId, ...passenger }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                dispatch(toggleLoaderAction(false));
                passenger.passengerId = res.data.passengerId;
                dispatch(addToPassengerListAction(passenger))
            })
            .catch(er => {
                console.log(`registerPassenger error: `, er.response || er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const updatePassengerDetails = (passenger) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(USER_BASE_URL + `updatePassengerDetails`, passenger, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("updatePassengerDetails success: ", res.data);
                dispatch(toggleLoaderAction(false));
                dispatch(updatePassengerInListAction(passenger))
            })
            .catch(er => {
                console.log(`updatePassengerDetails error: `, er.response || er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const deletePassenger = (passengerId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.delete(USER_BASE_URL + `deletePassenger/${passengerId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("deletePassenger success: ", res.data);
                dispatch(toggleLoaderAction(false));
                dispatch(updatePassengerInListAction(passengerId))
            })
            .catch(er => {
                console.log(`deletePassenger error: `, er.response || er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}