import { REPLACE_FRIEND_LIST, UPDATE_FRIEND_LIST, CLEAR_FRIEND_LIST, DELETE_FRIEND, UPDATE_SEARCH_FRIEND_LIST, REPLACE_SEARCH_FRIEND_LIST, CLEAR_SEARCH_FRIEND_LIST, UPDATE_RELATIONSHIP, GET_FRIEND_INFO, RESET_CURRENT_FRIEND, UPDATE_FRIEND_IN_LIST, UNFRIEND, UPDATE_ONLINE_STATUS, UPDATE_CURRENT_FRIEND } from "../actions/actionConstants";
import { FRIEND_TYPE, HEADER_KEYS, RELATIONSHIP } from "../constants";

const initialState = {
    allFriends: [],
    // onlineFriends: [],
    paginationNum: 0,
    // searchFriendList: [],
    currentFriend: null
};

export default (state = initialState, action) => {
    switch (action.type) {

        case REPLACE_FRIEND_LIST:
            return {
                ...state,
                allFriends: action.data.friendList
            };

        case UPDATE_FRIEND_LIST:
            if (typeof action.data.index === 'number' && action.data.index >= 0) {
                return {
                    ...state,
                    allFriends: [...state.allFriends.slice(0, action.data.index), ...action.data.friendList, ...state.allFriends.slice(action.data.index + 1)]
                }
            } else {
                const { paginationNum } = state;
                action.data.friendList.length > 0 && paginationNum++;
                return {
                    ...state,
                    allFriends: [...state.allFriends, ...action.data.friendList],
                    paginationNum
                }
            }

        case GET_FRIEND_INFO:
            const currentFriend = state.allFriends[action.data.index];
            if (!currentFriend.profilePictureId) {
                currentFriend.profilePictureId = null;
            }
            return {
                ...state,
                currentFriend
            };

        case UNFRIEND:
            const personIndex = state.allFriends.findIndex(person => person.userId === action.data.personId);
            if (personIndex > -1) {
                return {
                    ...state,
                    allFriends: [
                        ...state.allFriends.slice(0, personIndex),
                        ...state.allFriends.slice(personIndex + 1)
                    ]
                }
            }
            return state;

        case UPDATE_CURRENT_FRIEND:
        if (state.currentFriend === null || (action.data.userId !== state.currentFriend.userId)) return state;
            return {
                ...state,
                currentFriend: {
                    ...state.currentFriend,
                    ...action.data
                }
            };

        case RESET_CURRENT_FRIEND:
            return {
                ...state,
                currentFriend: null
            }

        case DELETE_FRIEND:
            return {
                ...state,
                allFriends: [...state.allFriends.slice(0, action.data.index), ...state.allFriends.slice(action.data.index + 1)]
            };

        case UPDATE_ONLINE_STATUS:
            const { allFriends } = state;
            action.data.friendList.forEach(friend => {
                const idx = allFriends.findIndex(frnd => frnd.userId === friend.userId);
                if (idx > -1) {
                    allFriends[idx].isOnline = true;
                }
            });
            return {
                ...state,
                allFriends: allFriends
            };

        case UPDATE_FRIEND_IN_LIST:
            let index = state.allFriends.findIndex((friend) => { return friend.userId === action.data.userId })
            if (index > -1) {
                const friend = state.allFriends[index];
                friend.profilePicture = action.data.profilePicture;
                return {
                    ...state,
                    allFriends: [
                        ...state.allFriends.slice(0, index),
                        friend,
                        ...state.allFriends.slice(index + 1)
                    ]
                }
            }
            return state;
        // case CLEAR_FRIEND_LIST:
        //     // var friendKey = getFriendListByType(action.data.friendType);
        //     // updatedState.allFriends = [];
        //     return {
        //         ...state,
        //         allFriends: []
        //     };

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