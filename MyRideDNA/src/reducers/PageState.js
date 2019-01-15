import { TOGGLE_LOADER } from "../actions/actionConstants";

const initialState = {
    showLoader: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case TOGGLE_LOADER:
            return {
                ...state,
                showLoader: action.data
            }
        default: return state
    }
}