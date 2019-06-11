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
        // case UPDATE_FRIEND_REQUEST_LIST:
        //     let index = state.allFriendRequests.findIndex((requests) => { return requests.id === action.data.id })
        //     if(action.data.profilePicture){
        //         const friendRequest = state.allFriendRequests[index];
        //         friendRequest.profilePicture = action.data.profilePicture;
        //         return {...state, allFriendRequests:[...state.allFriendRequests.slice(0, index),friendRequest, ...state.allFriendRequests.slice(index +1)]}    
        //     }else {
        //     return {...state, allFriendRequests:[...state.allFriendRequests.slice(0, index), ...state.allFriendRequests.slice(index +1)]}
        //     }
        case UPDATE_FRIEND_REQUEST_LIST:
            if (action.data.pictureObj) {
                let updatedRequestList = state.allFriendRequests.map(item => {
                    if (!item.profilePictureId) return item;
                    if (typeof action.data.pictureObj[item.profilePictureId] === 'string') {
                        return { ...item, profilePicture: action.data.pictureObj[item.profilePictureId] }
                    }
                    return item;
                })
                return { ...state, allFriendRequests: updatedRequestList }
            } else {
                let index = state.allFriendRequests.findIndex((requests) => { return requests.id === action.data.id })
                return { ...state, allFriendRequests: [...state.allFriendRequests.slice(0, index), ...state.allFriendRequests.slice(index + 1)] }
            }
        default: return state
    }
}