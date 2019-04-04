import { UPDATE_RIDE, CLEAR_RIDE, UPDATE_WAYPOINT, LOAD_RIDE, ADD_WAYPOINT, DELETE_WAYPOINT, UPDATE_SOURCE_OR_DESTINATION_NAME, UPDATE_WAYPOINT_NAME } from "../actions/actionConstants";
import { undoable } from "./Undoable";
import { RIDE_POINT } from "../constants";

const initialState = {
    ride: {
        name: null,
        privacyMode: 'private',
        rideId: null, //'TEST'
        userId: null, //'5b974dba33db83149624f2f3'
        date: null,
        waypoints: [],
        trackpoints: [],
        source: null, /* {
            name: '',
            address: '',
            lat: 12.9127212,
            lng: 77.6525048
        } */
        destination: null,
        isHighway: true,
        isRecorded: false,
        status: null,
        fromRideId: null
    }
};

const rideInfo = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_RIDE:
            return {
                ...state,
                ride: {
                    ...state.ride,
                    ...action.data
                }
            }
        case ADD_WAYPOINT:
            return {
                ...state,
                ride: {
                    ...state.ride,
                    waypoints: [
                        ...state.ride.waypoints.slice(0, action.data.index),
                        action.data.waypoint,
                        ...state.ride.waypoints.slice(action.data.index)
                    ]
                }
            }
        case UPDATE_WAYPOINT:
            return {
                ...state,
                ride: {
                    ...state.ride,
                    waypoints: [
                        ...state.ride.waypoints.slice(0, action.data.index),
                        action.data.waypoint,
                        ...state.ride.waypoints.slice(action.data.index + 1)
                    ]
                }
            }
        case UPDATE_SOURCE_OR_DESTINATION_NAME:
            if (state.ride.rideId === null) return state;
            if (action.data.identifier === RIDE_POINT.SOURCE) {
                if (state.ride.source === null) return state;
                return {
                    ...state,
                    ride: {
                        ...state.ride,
                        source: {
                            ...state.ride.source,
                            name: action.data.locationName
                        }
                    }
                }
            } else if (action.data.identifier === RIDE_POINT.DESTINATION) {
                if (state.ride.destination === null) return state;
                return {
                    ...state,
                    ride: {
                        ...state.ride,
                        destination: {
                            ...state.ride.destination,
                            name: action.data.locationName
                        }
                    }
                }
            }
        case UPDATE_WAYPOINT_NAME:
            if (state.ride.rideId === null) return state;
            const waypointIdx = state.ride.waypoints.findIndex(point => point.id === action.data.waypointId);
            if (waypointIdx === -1) return state;
            const waypoint = state.ride.waypoints[waypointIdx];
            waypoint.name = action.data.locationName;
            return {
                ...state,
                ride: {
                    ...state.ride,
                    waypoints: [
                        ...state.ride.waypoints.slice(0, waypointIdx),
                        waypoint,
                        ...state.ride.waypoints.slice(waypointIdx + 1)
                    ]
                }
            }
        case DELETE_WAYPOINT:
            return {
                ...state,
                ride: {
                    ...state.ride,
                    waypoints: [
                        ...state.ride.waypoints.slice(0, action.data.index),
                        ...state.ride.waypoints.slice(action.data.index + 1)
                    ]
                }
            }
        case CLEAR_RIDE:
            return {
                ...initialState
            }
        default: return state
    }
}
const undoableRideInfo = undoable(rideInfo);
export default undoableRideInfo;