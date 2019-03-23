import { REPLACE_SEARCH_RESULTS, CLEAR_SEARCH_RESULTS } from "../actions/actionConstants";

const initialState = {
    paginationNum: 0,
    searchResults: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case REPLACE_SEARCH_RESULTS:
            return {
                ...state,
                searchResults: action.data
            }

        case CLEAR_SEARCH_RESULTS:
            return {
                ...state,
                searchResults: null
            }
        default: return state
    }
}