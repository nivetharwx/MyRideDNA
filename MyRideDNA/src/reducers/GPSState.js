import { DEVICE_GPS_STATE } from "../actions/actionConstants";
import { DEVICE_LOCATION_STATE } from "../constants";

const initialState = {
    isLocationOn: false
};

export default (state = initialState, action) => {
    switch (action.type) {
        case DEVICE_GPS_STATE:
            return {
                ...state,
                isLocationOn: action.data
            }
        default: return state
    }
}