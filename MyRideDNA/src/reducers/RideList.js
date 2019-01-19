import { UPDATE_RIDE_LIST, CLEAR_RIDE_LIST, DELETE_RIDE } from "../actions/actionConstants";
import { RIDE_TYPE } from "../constants";

const initialState = {
    buildRides: [],
    recordedRides: [],
    sharedRides: []
};

export default (state = initialState, action) => {
    const updatedState = { ...state };
    switch (action.type) {
        case UPDATE_RIDE_LIST:
            var rideKey = getRideListByType(action.data.rideType);
            updatedState[rideKey] = [...action.data.rideList];
            return updatedState;
        case DELETE_RIDE:
            var rideKey = getRideListByType(action.data.rideType);
            updatedState[rideKey] = [...state[rideKey].slice(0, action.data.index), ...state[rideKey].slice(action.data.index + 1)];
            return updatedState;
        case CLEAR_RIDE_LIST:
            var rideKey = getRideListByType(action.data.rideType);
            updatedState[rideKey] = [];
            return updatedState;
        default: return state
    }
}

const getRideListByType = (rideType) => {
    switch (rideType) {
        case RIDE_TYPE.BUILD_RIDE:
            return 'buildRides'
        case RIDE_TYPE.RECORD_RIDE:
            return 'recordedRides'
        // TODO: Create for shared rides also
    }
}