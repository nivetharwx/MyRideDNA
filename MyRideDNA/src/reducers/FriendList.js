import { REPLACE_FRIEND_LIST, UPDATE_FRIEND_LIST, CLEAR_FRIEND_LIST, DELETE_FRIEND, UPDATE_SEARCH_FRIEND_LIST, REPLACE_SEARCH_FRIEND_LIST, CLEAR_SEARCH_FRIEND_LIST, UPDATE_RELATIONSHIP, GET_FRIEND_INFO, RESET_PERSON_PROFILE, UPDATE_FRIEND_IN_LIST, UNFRIEND, UPDATE_ONLINE_STATUS, UPDATE_CURRENT_FRIEND, UPDATE_CURRENT_FRIEND_GARAGE, UPDATE_FRIENDS_LOCATION, REPLACE_FRIENDS_LOCATION, HIDE_FRIENDS_LOCATION, ADD_FRIENDS_LOCATION, REPLACE_FRIEND_INFO, UPDATE_FRIENDS_RIDE_SNAPSHOT, GET_NOT_FRIEND_INFO, UPDATE_FAVOURITE_FRIEND_LIST, SET_CURRENT_FRIEND, UPDATE_PICTURES } from "../actions/actionConstants";
import { FRIEND_TYPE, HEADER_KEYS, RELATIONSHIP, RIDE_TAIL_TAG, THUMBNAIL_TAIL_TAG, PageKeys } from "../constants";

const initialState = {
    allFriends: [],
    paginationNum: 0,
    friendsLocationList: { activeLength: 0 }
};

export default (state = initialState, action) => {
    switch (action.type) {

        case REPLACE_FRIEND_LIST:
            if (action.data.pageNumber === 0) {
                return {
                    ...state,
                    allFriends: getUpdatedFriendList(state.allFriends, action.data.friendList)
                }
            } else {
                return {
                    ...state,
                    allFriends: [
                        ...state.allFriends,
                        ...action.data.friendList
                    ]
                }
            }


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

        case ADD_FRIENDS_LOCATION:
            return {
                ...state,
                friendsLocationList: action.data.reduce((list, locInfo) => {
                    // const friend = state.allFriends.find(frnd => frnd.userId === locInfo.userId);
                    // if (friend) locInfo.profilePicture = friend.profilePicture;
                    locInfo.isVisible = true;
                    list[locInfo.id] = locInfo;
                    list.activeLength = list.activeLength !== undefined ? list.activeLength + 1 : 1;
                    return list;
                }, { ...state.friendsLocationList })
            }

        case HIDE_FRIENDS_LOCATION:
            if (!action.data) {
                return {
                    ...state,
                    friendsLocationList: Object.keys(state.friendsLocationList).reduce((list, k) => {
                        if (k === 'activeLength') return list;
                        list[k] = { ...list[k], isVisible: false };
                        return list;
                    }, { ...state.friendsLocationList, activeLength: 0 })
                }
            }
            return {
                ...state,
                friendsLocationList: {
                    ...state.friendsLocationList,
                    [action.data]: { ...state.friendsLocationList[action.data], isVisible: false },
                    activeLength: state.friendsLocationList.activeLength - 1
                }
            }

        case UPDATE_FRIENDS_LOCATION:
            return {
                ...state,
                friendsLocationList: action.data.reduce((list, locInfo) => {
                    list[locInfo.id] = { ...list[locInfo.id], locInfo };
                    return list;
                }, { ...state.friendsLocationList })
            }

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

        case DELETE_FRIEND:
            return {
                ...state,
                allFriends: [...state.allFriends.slice(0, action.data.index), ...state.allFriends.slice(action.data.index + 1)]
            };

        case UPDATE_ONLINE_STATUS:
            const updatedFriendsList = [...state.allFriends];
            action.data.friendList.forEach(friend => {
                const idx = updatedFriendsList.findIndex(frnd => frnd.userId === friend.userId);
                if (idx > -1) {
                    updatedFriendsList[idx] = { ...updatedFriendsList[idx], isOnline: true };
                }
            });
            return {
                ...state,
                allFriends: updatedFriendsList
            };

        // case UPDATE_FRIEND_IN_LIST:
        //     let index = state.allFriends.findIndex((friend) => { return friend.userId === action.data.userId })
        //     if (index > -1) {
        //         return {
        //             ...state,
        //             allFriends: [
        //                 ...state.allFriends.slice(0, index),
        //                 { ...state.allFriends[index], profilePicture: action.data.profilePicture },
        //                 ...state.allFriends.slice(index + 1)
        //             ]
        //         }
        //     }
        case UPDATE_FRIEND_IN_LIST:
            if (action.data.pictureObj) {
                let updatedFriendList = state.allFriends.map(item => {
                    if (!item.profilePictureId) return item;
                    if (typeof action.data.pictureObj[item.profilePictureId] === 'string') {
                        return { ...item, profilePicture: action.data.pictureObj[item.profilePictureId] }
                    }
                    return item;
                })
                return {
                    ...state,
                    allFriends: updatedFriendList
                }
            }

        case UPDATE_FAVOURITE_FRIEND_LIST:
            const friendIndex = state.allFriends.findIndex(item => item.userId === action.data.friendId);
            const updatedFriend = state.allFriends[friendIndex];
            updatedFriend['favorite'] = action.data.favorite;
            return {
                ...state,
                allFriends: [
                    ...state.allFriends.slice(0, friendIndex),
                    updatedFriend,
                    ...state.allFriends.slice(friendIndex + 1)
                ]
            }
            return state;

        default: return state
    }
}

const getUpdatedFriendList = (oldList, newList) => {
    const allFriends = newList.map(friend => {
        let friendIdx = oldList.findIndex(item => item.userId === friend.userId);
        if (friendIdx > -1) {
            if (oldList[friendIdx].profilePictureId === friend.profilePictureId && oldList[friendIdx].profilePicture) {
                return { ...friend, profilePicture: oldList[friendIdx].profilePicture };
            }
        }
        return friend;
    });
    return allFriends;
}