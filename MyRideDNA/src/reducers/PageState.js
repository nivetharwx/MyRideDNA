import { TOGGLE_LOADER, TOGGLE_NETWORK_STATUS } from "../actions/actionConstants";

const initialState = {
    showLoader: false,
    hasNetwork: true,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case TOGGLE_LOADER:
            return {
                ...state,
                showLoader: action.data
            }
        case TOGGLE_NETWORK_STATUS:
            return {
                ...state,
                hasNetwork: action.data
            }
        default: return state
    }
}