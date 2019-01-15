import { loginAction, updateRideAction, updateWaypointAction, updateUserAction, toggleLoaderAction } from '../actions';
import { USER_BASE_URL, RIDE_BASE_URL, RECORD_RIDE_STATUS } from '../constants';
import axios from 'axios';
import Base64 from '../util';

// export const loginUser = (userData) => {
//     return dispatch => {
//         axios.post(USER_BASE_URL + 'loginUser', userData)
//             .then(res => {
//                 if (res.status === 200) {
//                     dispatch(loginAction(res.data))
//                 }
//             })
//             .catch(er => console.log(er))
//     };
// }

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
            .catch(er => console.log(er))
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
            .catch(er => console.log(er))
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
            .catch(er => console.log(er))
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
            .catch(er => console.log(er))
    };
}
export const pauseRecordRide = (trackpoints, ride, userId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `pauseRecordRide?rideId=${ride.rideId}&userId=${userId}`, { trackpoints: Base64.encode(trackpoints.join()) })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateRideAction({ ...ride, trackpoints: [...ride.trackpoints, ...trackpoints], ...res.data }));
                }
            })
            .catch(er => console.log(er))
    };
}
export const completeRecordRide = (trackpoints, ride, userId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `completeRecordRide?rideId=${ride.rideId}&userId=${userId}`, { trackpoints: Base64.encode(trackpoints.join()) })
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateRideAction({ ...ride, trackpoints: [...ride.trackpoints, ...trackpoints], status: RECORD_RIDE_STATUS.COMPLETED }));
                }
            })
            .catch(er => console.log(er))
    };
}
export const continueRecordRide = (ride, userId) => {
    return dispatch => {
        dispatch(toggleLoaderAction(true));
        axios.put(RIDE_BASE_URL + `resumeRecordRide?rideId=${ride.rideId}&userId=${userId}`)
            .then(res => {
                if (res.status === 200) {
                    dispatch(toggleLoaderAction(false));
                    dispatch(updateRideAction({ ...ride, ...res.data }));
                }
            })
            .catch(er => console.log(er))
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
            .catch(er => console.log(er))
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
            .catch(er => console.log(er))
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
            .catch(er => console.log(er))
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
            .catch(er => console.log(er))
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
            .catch(er => console.log(er))
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
            .catch(er => console.log(er))
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
            .catch(er => console.log(er))
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
            .catch(er => console.log(er))
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
            .catch(er => console.log(er))
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
            .catch(er => console.log(er))
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
            .catch(er => console.log(er))
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
            .catch(er => console.log(er))
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
            .catch(er => console.log(er));
    };
}