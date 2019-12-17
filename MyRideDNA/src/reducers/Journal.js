import { UPDATE_JOURNAL } from "../actions/actionConstants";

const initialState = {
    journal: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_JOURNAL:
            return {
                ...state,
                journal: action.data.reset
                    ? action.data.updates
                    : [...state.journal, ...action.data.updates]
            }

        default: return state
    }
}