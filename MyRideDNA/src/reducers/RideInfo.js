import { UPDATE_RIDE, CLEAR_RIDE, UPDATE_WAYPOINT, LOAD_RIDE, ADD_WAYPOINT, DELETE_WAYPOINT } from "../actions/actionConstants";
import { undoable } from "./Undoable";

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