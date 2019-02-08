import { REPLACE_FRIEND_LIST, UPDATE_FRIEND_LIST, CLEAR_FRIEND_LIST, DELETE_FRIEND } from "../actions/actionConstants";
import { FRIEND_TYPE } from "../constants";

const initialState = {
    allFriends: [],
    onlineFriends: [],
    paginationNum: 0,
};

export default (state = initialState, action) => {
    const updatedState = { ...state };
    switch (action.type) {

        case REPLACE_FRIEND_LIST:
            var friendKey = getFriendListByType(action.data.friendType);
            updatedState[friendKey] = [...action.data.friendList];
            return updatedState;

        case UPDATE_FRIEND_LIST:
            var friendKey = getFriendListByType(action.data.friendType);
            if (typeof action.data.index === 'number' && action.data.index >= 0) {
                updatedState[friendKey] = [...state[friendKey].slice(0, action.data.index), ...action.data.friendList, ...state[friendKey].slice(action.data.index + 1)];
            } else {
                updatedState[friendKey] = [...state[friendKey], ...action.data.friendList];
                action.data.friendList.length > 0 && updatedState.paginationNum++; // DOC: Update pagination number
            }
            return updatedState;

        case DELETE_FRIEND:
            var friendKey = getFriendListByType(action.data.friendType);
            updatedState[friendKey] = [...state[friendKey].slice(0, action.data.index), ...state[friendKey].slice(action.data.index + 1)];
            return updatedState;

        case CLEAR_FRIEND_LIST:
            var friendKey = getFriendListByType(action.data.friendType);
            updatedState[friendKey] = [];
            return updatedState;

        default: return state
    }
}

const getFriendListByType = (friendType) => {
    switch (friendType) {
        case FRIEND_TYPE.ALL_FRIENDS:
            return 'allFriends'
        case FRIEND_TYPE.ONLINE_FRIENDS:
            return 'onlineFriends'
    }
}