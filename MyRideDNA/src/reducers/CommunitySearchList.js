import { REPLACE_SEARCH_RESULTS, CLEAR_SEARCH_RESULTS, UPDATE_FRIEND_REQUEST_RESPONSE, CLEAR_FRIEND_REQUEST_RESPONSE, UPDATE_FRIEND_INVITATION_RESPONSE, CLEAR_FRIEND_INVITATION_RESPONSE } from "../actions/actionConstants";

const initialState = {
    paginationNum: 0,
    searchResults: [],
    friendRequestSuccess: null,
    friendRequestError: null,
    invitationSuccess: null,
    invitationError: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case REPLACE_SEARCH_RESULTS:
            if (action.data.pageNumber === 0) {
                return {
                    ...state,
                    searchResults: action.data.results
                };
            } else {
                return {
                    ...state,
                    searchResults: [...state.searchResults, ...action.data.results]
                };
            }

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

        case UPDATE_FRIEND_INVITATION_RESPONSE:
            if (action.data.error) {
                return {
                    ...state,
                    invitationError: action.data.error
                };
            }
            return {
                ...state,
                invitationSuccess: action.data
            };

        case CLEAR_FRIEND_INVITATION_RESPONSE:
            return {
                ...state,
                invitationError: null,
                invitationSuccess: null
            };

        case CLEAR_SEARCH_RESULTS:
            return {
                ...state,
                searchResults: []
            };

        default: return state
    }
}