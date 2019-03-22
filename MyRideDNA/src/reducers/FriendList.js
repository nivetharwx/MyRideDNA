import { REPLACE_FRIEND_LIST, UPDATE_FRIEND_LIST, CLEAR_FRIEND_LIST, DELETE_FRIEND, UPDATE_SEARCH_FRIEND_LIST, REPLACE_SEARCH_FRIEND_LIST, CLEAR_SEARCH_FRIEND_LIST, UPDATE_SEARCH_FRIEND_RELATIONSHIP, GET_FRIEND_INFO, RESET_CURRENT_FRIEND, UPDTAE_FRIEND_IN_LIST } from "../actions/actionConstants";
import { FRIEND_TYPE, HEADER_KEYS, RELATIONSHIP } from "../constants";

const initialState = {
    allFriends: [],
    onlineFriends: [],
    paginationNum: 0,
    searchFriendList: [],
    currentFriend: null
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

        case GET_FRIEND_INFO:
            var friendKey = getFriendListByType(action.data.friendType);
            updatedState.currentFriend = state[friendKey][action.data.index];
            if (!updatedState.currentFriend.profilePictureId) {
                updatedState.currentFriend.profilePictureId = null;
            }
            return updatedState;

        case UPDTAE_FRIEND_IN_LIST:
            var friendKey = getFriendListByType(action.data.friendType);
            const friendIdx = updatedState[friendKey].findIndex(friend => friend.userId === action.data.friend.userId);
            updatedState.currentFriend = {
                ...state.currentFriend,
                ...action.data.friend
            };
            // updatedState[friendKey] = [...state[friendKey].slice(0, friendIdx), { ...state[friendKey][friendIdx], ...action.data.friend }, ...state[friendKey].slice(friendIdx + 1)];
            return updatedState;

        case RESET_CURRENT_FRIEND:
            return {
                ...state,
                currentFriend: null
            }

        case REPLACE_SEARCH_FRIEND_LIST:
            return {
                ...state,
                searchFriendList: action.data
            }

        case CLEAR_SEARCH_FRIEND_LIST:
            return {
                ...state,
                searchFriendList: []
            }

        case UPDATE_SEARCH_FRIEND_RELATIONSHIP:
            let personIndex = state.searchFriendList.findIndex(person => person.userId === action.data.personId);
            if (personIndex > -1) {
                return {
                    ...state,
                    searchFriendList: [
                        ...state.searchFriendList.slice(0, personIndex),
                        { ...state.searchFriendList[personIndex], relationship: action.data.relationship },
                        ...state.searchFriendList.slice(personIndex + 1)
                    ]
                }
            }
            return state;

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