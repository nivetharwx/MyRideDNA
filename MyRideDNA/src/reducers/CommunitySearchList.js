import { REPLACE_SEARCH_RESULTS, CLEAR_SEARCH_RESULTS, UPDATE_FRIEND_REQUEST_RESPONSE, CLEAR_FRIEND_REQUEST_RESPONSE } from "../actions/actionConstants";

const initialState = {
    paginationNum: 0,
    searchResults: null,
    friendRequestSuccess: null,
    friendRequestError: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case REPLACE_SEARCH_RESULTS:
            return {
                ...state,
                searchResults: action.data
            };

        case UPDATE_FRIEND_REQUEST_RESPONSE:
            if (action.data.error) {
                return {
                    ...state,
                    friendRequestError: action.data.error
                };
            }
            return {
                ...state,
                friendRequestSuccess: action.data
            };

        case CLEAR_FRIEND_REQUEST_RESPONSE:
            return {
                ...state,
                friendRequestError: null,
                friendRequestSuccess: null
            };

        case CLEAR_SEARCH_RESULTS:
            return {
                ...state,
                searchResults: null
            };

        default: return state
    }
}