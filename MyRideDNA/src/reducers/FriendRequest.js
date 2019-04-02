import { REPLACE_FRIENDS_REQUEST_LIST, UPDATE_FRIEND_REQUEST_LIST } from "../actions/actionConstants";

const initialState = {
    allFriendRequests: [],
};


export default (state = initialState, action) => {
    switch (action.type) {
        case REPLACE_FRIENDS_REQUEST_LIST:
            return {
                ...state,
                allFriendRequests: action.data
            }
        case UPDATE_FRIEND_REQUEST_LIST:
            let index = state.allFriendRequests.findIndex((requests) => { return requests.id === action.data })
            return {...state, allFriendRequests:[...state.allFriendRequests.slice(0, index), ...state.allFriendRequests.slice(index +1)]}
        default: return state
    }
}