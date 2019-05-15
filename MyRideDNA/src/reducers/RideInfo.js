import { UPDATE_RIDE, CLEAR_RIDE, UPDATE_WAYPOINT, ADD_WAYPOINT, DELETE_WAYPOINT, UPDATE_SOURCE_OR_DESTINATION_NAME, UPDATE_WAYPOINT_NAME, REORDER_SOURCE, REORDER_DESTINATION, REORDER_WAYPOINTS } from "../actions/actionConstants";
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
        fromRideId: null,
        totalDistance: 0,
        totalTime: 0
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
            const waypointIdx = state.ride.waypoints.findIndex(point => point.lng + '' + point.lat === action.data.waypointId);
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
        case REORDER_SOURCE:
            return action.data.to === RIDE_POINT.DESTINATION
                ? {
                    ...state,
                    ride: {
                        ...state.ride,
                        source: state.ride.waypoints[0],
                        waypoints: [
                            ...state.ride.waypoints.slice(1),
                            state.ride.destination
                        ],
                        destination: state.ride.source
                    }
                } : {
                    ...state,
                    ride: {
                        ...state.ride,
                        source: state.ride.waypoints[0],
                        waypoints: [
                            ...state.ride.waypoints.slice(0, action.data.to),
                            state.ride.source,
                            ...state.ride.waypoints.slice(action.data.to + 1)
                        ]
                    }
                }

        case REORDER_DESTINATION:
            const lastWponitIdx = state.ride.waypoints.length - 1;
            console.log(`Reordering destination to ${action.data.to}`);
            return action.data.to === RIDE_POINT.SOURCE
                ? {
                    ...state,
                    ride: {
                        ...state.ride,
                        source: state.ride.destination,
                        waypoints: [
                            state.ride.source,
                            ...state.ride.waypoints.slice(1, lastWponitIdx)
                        ],
                        destination: state.ride.waypoints[lastWponitIdx]
                    }
                } : {
                    ...state,
                    ride: {
                        ...state.ride,
                        waypoints: [
                            ...state.ride.waypoints.slice(0, action.data.to),
                            state.ride.destination,
                            ...state.ride.waypoints.slice(action.data.to + 1)
                        ],
                        destination: state.ride.waypoints[lastWponitIdx]
                    }
                }
        case REORDER_SOURCE:
            return action.data.to === RIDE_POINT.DESTINATION
                ? {
                    ...state,
                    ride: {
                        ...state.ride,
                        source: state.ride.waypoints[0],
                        waypoints: [
                            ...state.ride.waypoints.slice(1),
                            state.ride.destination
                        ],
                        destination: state.ride.source
                    }
                } : {
                    ...state,
                    ride: {
                        ...state.ride,
                        source: state.ride.waypoints[0],
                        waypoints: [
                            ...state.ride.waypoints.slice(0, action.data.to),
                            state.ride.source,
                            ...state.ride.waypoints.slice(action.data.to + 1)
                        ]
                    }
                }

        case REORDER_WAYPOINTS:
            if (action.data.to === RIDE_POINT.SOURCE) {
                return {
                    ...state,
                    ride: {
                        ...state.ride,
                        source: state.ride.waypoints[action.data.from],
                        waypoints: [
                            state.ride.source,
                            ...state.ride.waypoints.slice(0, action.data.from),
                            ...state.ride.waypoints.slice(action.data.from + 1)
                        ]
                    }
                }
            } else if (action.data.to === RIDE_POINT.DESTINATION) {
                return {
                    ...state,
                    ride: {
                        ...state.ride,
                        waypoints: [
                            ...state.ride.waypoints.slice(0, action.data.from),
                            ...state.ride.waypoints.slice(action.data.from + 1),
                            state.ride.destination
                        ],
                        destination: state.ride.waypoints[action.data.from]
                    }
                }
            } else {
                const { lowerIdx, higherIdx } = action.data.from > action.data.to
                    ? { lowerIdx: action.data.to, higherIdx: action.data.from }
                    : { lowerIdx: action.data.from, higherIdx: action.data.to };
                console.log(`Reordering waypoint from ${action.data.from} to ${action.data.to}`);
                console.log('indexes: ', lowerIdx, higherIdx);
                return {
                    ...state,
                    ride: {
                        ...state.ride,
                        waypoints: [
                            ...state.ride.waypoints.slice(0, lowerIdx),
                            state.ride.waypoints[higherIdx],
                            ...state.ride.waypoints.slice(lowerIdx, higherIdx),
                            ...state.ride.waypoints.slice(higherIdx + 1),
                        ]
                    }
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