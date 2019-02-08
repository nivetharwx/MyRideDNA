import {
    updateSignupResultAction, updateRideAction, updateWaypointAction, updateUserAction, toggleLoaderAction,
    replaceRideListAction, deleteRideAction, updateRideListAction, updateEmailStatusAction, updateFriendListAction, replaceFriendListAction, replaceGarageInfoAction, updateBikeListAction, addToBikeListAction, deleteBikeFromListAction, updateActiveBikeAction, updateGarageNameAction
} from '../actions';
import { USER_BASE_URL, RIDE_BASE_URL, RECORD_RIDE_STATUS, RIDE_TYPE, PageKeys, USER_AUTH_TOKEN, FRIENDS_BASE_URL } from '../constants';
import axios from 'axios';

import { AsyncStorage } from 'react-native';

import Base64 from '../util';
import { Actions } from 'react-native-router-flux';

const CancelToken = axios.CancelToken;
const axiosSource = CancelToken.source();
const API_TIMEOUT = 15 * 1000; // 15 seconds

export const logoutUser = (userId, accessToken) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.post(USER_BASE_URL + `logoutUser`, { userId, accessToken }, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    // TODO: Clear store
                    AsyncStorage.removeItem(USER_AUTH_TOKEN).then(() => {
                        Actions.reset(PageKeys.LOGIN)
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
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(USER_BASE_URL + 'updateUserDetails', userData, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateUserAction(userData));
                }
            })
            .catch(er => {
                console.log(er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
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
                    console.log("getAllPublicRides: ", res.data);
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
                    return dispatch(updateWaypointAction({
                        ride: {
                            ...ride,
                            waypoints: [...ride.waypoints.slice(0, index), waypoint, ...ride.waypoints.slice(index)]
                        }
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
export const deleteWaypoint = (ride, index) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.delete(RIDE_BASE_URL + `deleteWaypoint?rideId=${ride.rideId}&index=${index}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateWaypointAction({
                        ride: {
                            ...ride,
                            waypoints: [...ride.waypoints.slice(0, index), ...ride.waypoints.slice(index + 1)]
                        }
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
export const updateWaypoint = (waypoint, ride, index) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `updateWaypoint?rideId=${ride.rideId}&index=${index}`, waypoint, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateWaypointAction({
                        ride: {
                            ...ride,
                            waypoints: [...ride.waypoints.slice(0, index), waypoint, ...ride.waypoints.slice(index + 1)]
                        }
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
export const updateSource = (waypoint, ride) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `updateSource?rideId=${ride.rideId}`, waypoint, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateWaypointAction({
                        ride: {
                            ...ride,
                            source: waypoint
                        }
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
export const deleteSource = (ride) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.delete(RIDE_BASE_URL + `deleteSource?rideId=${ride.rideId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateWaypointAction({
                        ride: {
                            ...ride,
                            source: null
                        }
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
export const updateDestination = (waypoint, ride) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `updateDestination?rideId=${ride.rideId}`, waypoint, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateWaypointAction({
                        ride: {
                            ...ride,
                            destination: waypoint
                        }
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
export const makeWaypointAsSource = (ride, index) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `makeWaypointAsSource?rideId=${ride.rideId}&index=${index}`, undefined, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log("makeWaypointAsSource response: ", {
                        ...ride,
                        waypoints: [...ride.waypoints.slice(index + 1)],
                        source: ride.waypoints[index]
                    });
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateWaypointAction({
                        ride: {
                            ...ride,
                            waypoints: [...ride.waypoints.slice(index + 1)],
                            source: ride.waypoints[index]
                        }
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
                    return dispatch(updateWaypointAction({
                        ride: {
                            ...ride,
                            waypoints: [ride.source, ...ride.waypoints],
                            source: null
                        }
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
                    return dispatch(updateWaypointAction({
                        ride: {
                            ...ride,
                            waypoints: [...ride.waypoints.slice(0, index)],
                            destination: ride.waypoints[index]
                        }
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
                    return dispatch(updateWaypointAction({
                        ride: {
                            ...ride,
                            waypoints: [...ride.waypoints, ride.destination],
                            destination: null
                        }
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
                    return dispatch(updateWaypointAction({
                        ride: {
                            ...ride,
                            destination: null
                        }
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
export const searchForFriend = (searchParam, userId, pageNumber) => {
    return dispatch => {
        axios.get(FRIENDS_BASE_URL + `searchFriend?searchParam=${searchParam}&userId=${userId}&pageNumber=${pageNumber}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                if (res.status === 200) {
                    console.log(`searchForFriend request: `, `searchFriend?searchParam=${searchParam}&userId=${userId}&pageNumber=${pageNumber}`);
                    console.log(`searchForFriend response: `, res.data);
                }
            })
            .catch(er => {
                console.log(`searchForFriend: `, er.response);
                // TODO: Dispatch error info action
            })
    };
}
export const getGarageInfo = (userId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.get(USER_BASE_URL + `getGarage/${userId}`, { cancelToken: axiosSource.token, timeout: API_TIMEOUT })
            .then(res => {
                console.log("getGarageInfo: ", res);
                dispatch(toggleLoaderAction(false));
                return dispatch(replaceGarageInfoAction(res.data))
            })
            .catch(er => {
                console.log(`getGarageInfo: `, er.response);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
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
                bike.picturesList = [...oldImages, ...bike.picturesList];
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
                console.log(`getGarageInfo: `, er.response);
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