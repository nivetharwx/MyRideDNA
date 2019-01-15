import { UPDTAE_RIDE, CLEAR_RIDE, UPDATE_WAYPOINT } from "../actions/actionConstants";

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
    },
    rides: []
};

export default (state = initialState, action) => {
    switch (action.type) {
        case UPDTAE_RIDE:
            return {
                ...state,
                ride: {
                    ...state.ride,
                    ...action.data
                }
            }
        case UPDATE_WAYPOINT:
            return {
                ...state,
                ...action.data
            }
        case CLEAR_RIDE:
            return {
                ...initialState
            }
        default: return state
    }
}