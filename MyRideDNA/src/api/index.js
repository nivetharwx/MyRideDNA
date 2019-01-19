import { loginAction, updateRideAction, updateWaypointAction, updateUserAction, toggleLoaderAction, updateRideListAction, deleteRideAction } from '../actions';
import { USER_BASE_URL, RIDE_BASE_URL, RECORD_RIDE_STATUS, RIDE_TYPE } from '../constants';
import axios from 'axios';
import Base64 from '../util';

export const updateUserInfo = (userData) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(USER_BASE_URL + 'updateUserDetails', userData)
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateUserAction(userData));
                }
            })
            .catch(er => {
                console.log(er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const getAllBuildRides = (userId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.get(RIDE_BASE_URL + `getAllBuildRides?userId=${userId}`)
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateRideListAction({ rideType: RIDE_TYPE.BUILD_RIDE, rideList: res.data }));
                }
            })
            .catch(er => {
                console.log(er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const getAllRecordedRides = (userId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.get(RIDE_BASE_URL + `getAllRecordRides?userId=${userId}`)
            .then(res => {
                if (res.status === 200) {
                    console.log(`getAllRecordedRides: ${RIDE_BASE_URL}getAllRecordRides?userId=${userId}`, res.data);
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateRideListAction({ rideType: RIDE_TYPE.RECORD_RIDE, rideList: res.data }));
                }
            })
            .catch(er => {
                console.log(`getAllRecordedRides: ${RIDE_BASE_URL}getAllRecordRides?userId=${userId}`, er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const createNewRide = (rideData) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.post(RIDE_BASE_URL + 'createRide', rideData)
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateRideAction({ ...rideData, ...res.data }));
                }
            })
            .catch(er => {
                console.log(er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const createRecordRide = (rideData) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.post(RIDE_BASE_URL + 'createRecordRide', rideData)
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateRideAction({ ...rideData, ...res.data }));
                }
            })
            .catch(er => {
                console.log(er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const deleteRide = (rideId, index, rideType) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.delete(RIDE_BASE_URL + `deleteRide?rideId=${rideId}`)
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(deleteRideAction({ rideType, index }));
                }
            })
            .catch(er => {
                console.log(er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const addTrackpoints = (trackpoints, ride, userId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.post(RIDE_BASE_URL + `addTrackpoints?rideId=${ride.rideId}&userId=${userId}`, { trackpoints: Base64.encode(trackpoints.join()) })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateRideAction({ ...ride, trackpoints: [...ride.trackpoints, ...trackpoints] }));
                }
            })
            .catch(er => {
                console.log(er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const pauseRecordRide = (pauseTime, trackpoints, ride, userId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `pauseRecordRide?rideId=${ride.rideId}&userId=${userId}`, { trackpoints: Base64.encode(trackpoints.join()), pauseTime })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateRideAction({ ...ride, trackpoints: [...ride.trackpoints, ...trackpoints], ...res.data }));
                }
            })
            .catch(er => {
                console.log(er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const completeRecordRide = (endTime, trackpoints, ride, userId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `completeRecordRide?rideId=${ride.rideId}&userId=${userId}`, { trackpoints: Base64.encode(trackpoints.join()), endTime })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateRideAction({ ...ride, trackpoints: [...ride.trackpoints, ...trackpoints], status: RECORD_RIDE_STATUS.COMPLETED }));
                }
            })
            .catch(er => {
                console.log(er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const continueRecordRide = (resumeTime, ride, userId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `resumeRecordRide?rideId=${ride.rideId}&userId=${userId}`, { resumeTime })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateRideAction({ ...ride, ...res.data }));
                }
            })
            .catch(er => {
                console.log(er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}

export const updateRide = (data) => {
    return dispatch => {
        return dispatch(updateRideAction(data))
    };
}
export const addSource = (waypoint, ride) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `addSource?rideId=${ride.rideId}`, waypoint)
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateRideAction({ source: waypoint }));
                }
            })
            .catch(er => {
                console.log(er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const addWaypoint = (waypoint, ride, index) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `addWaypoint?rideId=${ride.rideId}&index=${index}`, waypoint)
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
                console.log(er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const deleteWaypoint = (ride, index) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.delete(RIDE_BASE_URL + `deleteWaypoint?rideId=${ride.rideId}&index=${index}`)
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
                console.log(er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const updateWaypoint = (waypoint, ride, index) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `updateWaypoint?rideId=${ride.rideId}&index=${index}`, waypoint)
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
                console.log(er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const updateSource = (waypoint, ride) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `updateSource?rideId=${ride.rideId}`, waypoint)
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
                console.log(er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const deleteSource = (ride) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.delete(RIDE_BASE_URL + `deleteSource?rideId=${ride.rideId}`)
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
                console.log(er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const updateDestination = (waypoint, ride) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `updateDestination?rideId=${ride.rideId}`, waypoint)
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
                console.log(er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const makeWaypointAsSource = (ride, index) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `makeWaypointAsSource?rideId=${ride.rideId}&index=${index}`)
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
                console.log(er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const makeSourceAsWaypoint = (ride) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `makeSourceAsWaypoint?rideId=${ride.rideId}`)
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
                console.log(er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const makeWaypointAsDestination = (ride, index) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `makeWaypointAsDestination?rideId=${ride.rideId}&index=${index}`)
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
                console.log(er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const makeDestinationAsWaypoint = (ride) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `makeDestinationAsWaypoint?rideId=${ride.rideId}`)
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
                console.log(er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const deleteDestination = (ride) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.delete(RIDE_BASE_URL + `deleteDestination?rideId=${ride.rideId}`, {})
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
                console.log(er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}
export const getRideByRideId = (rideId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.get(RIDE_BASE_URL + `getRideByRideId?rideId=${rideId}`, {})
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    return dispatch(updateRideAction({ ...res.data }));
                }
            })
            .catch(er => {
                console.log(`getRideByRideId: ${RIDE_BASE_URL}getRideByRideId?rideId=${rideId}`, er);
                // TODO: Dispatch error info action
                dispatch(toggleLoaderAction(false));
            })
    };
}