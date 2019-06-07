import { REPLACE_FRIEND_LIST, UPDATE_FRIEND_LIST, CLEAR_FRIEND_LIST, DELETE_FRIEND, UPDATE_SEARCH_FRIEND_LIST, REPLACE_SEARCH_FRIEND_LIST, CLEAR_SEARCH_FRIEND_LIST, UPDATE_RELATIONSHIP, GET_FRIEND_INFO, RESET_CURRENT_FRIEND, UPDATE_FRIEND_IN_LIST, UNFRIEND, UPDATE_ONLINE_STATUS, UPDATE_CURRENT_FRIEND, UPDATE_CURRENT_FRIEND_GARAGE, UPDATE_FRIENDS_LOCATION, REPLACE_FRIENDS_LOCATION, HIDE_FRIENDS_LOCATION, ADD_FRIENDS_LOCATION, REPLACE_FRIEND_INFO, UPDATE_FRIENDS_RIDE_SNAPSHOT } from "../actions/actionConstants";
import { FRIEND_TYPE, HEADER_KEYS, RELATIONSHIP, RIDE_TAIL_TAG, THUMBNAIL_TAIL_TAG } from "../constants";

const initialState = {
    allFriends: [],
    // onlineFriends: [],
    paginationNum: 0,
    // searchFriendList: [],
    currentFriend: {
        garage: {
            garageId: null
        },
        userId: null,
        rideList: [],
    },
    friendsLocationList: null
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

        case REPLACE_FRIENDS_LOCATION:
            return {
                ...state,
                friendsLocationList: action.data.map(locInfo => {
                    locInfo.isVisible = true;
                    // const friend = state.allFriends.find(frnd => frnd.userId === locInfo.userId);
                    // if (friend) locInfo.profilePicture = friend.profilePicture;
                    return locInfo;
                })
            }

        case ADD_FRIENDS_LOCATION:
            const updatedLocList = state.friendsLocationList ? [...state.friendsLocationList] : [];
            return {
                ...state,
                friendsLocationList: action.data.reduce((list, locInfo) => {
                    locInfo.isVisible = true;
                    // const friend = state.allFriends.find(frnd => frnd.userId === locInfo.userId);
                    // if (friend) locInfo.profilePicture = friend.profilePicture;
                    list.push(locInfo);
                    return list;
                }, updatedLocList)
            }

        case HIDE_FRIENDS_LOCATION:
            const updatedList = [...state.friendsLocationList];
            if (!action.data) {
                return {
                    ...state,
                    friendsLocationList: null,
                    currentFriend: {
                        garage: {
                            garageId: null
                        },
                        userId: null,
                        rideList: []
                    }
                }
            }
            action.data.forEach(locInfo => {
                const idx = updatedList.findIndex(info => info.userId === locInfo.userId);
                updatedList[idx] = { ...updatedList[idx], isVisible: false };
            });
            return {
                ...state,
                friendsLocationList: action.data.length === updatedList.length ? null : updatedList
            }

        case GET_FRIEND_INFO:
            const index = state.allFriends.findIndex(item => item.userId === action.data.userId);
            const friend = state.allFriends[index];
            if (!friend.profilePictureId) {
                friend.profilePictureId = null;
            }
            return {
                ...state,
                currentFriend: {
                    garage: {
                        garageId: null
                    },
                    userId: null,
                    rideList: [],
                    ...friend
                }
            };

        case REPLACE_FRIEND_INFO:
            return {
                ...state,
                currentFriend: {
                    ...action.data,
                    garage: {
                        garageId: null
                    },
                    rideList: []
                }
            }

        case UNFRIEND:
            const personIndex = state.allFriends.findIndex(person => person.userId === action.data.personId);

            if (personIndex > -1) {
                if (state.allFriends[personIndex].userId === state.currentFriend.userId) {
                    return {
                        ...state,
                        allFriends: [
                            ...state.allFriends.slice(0, personIndex),
                            ...state.allFriends.slice(personIndex + 1)
                        ],
                        currentFriend: {
                            garage: {
                                garageId: null
                            },
                            userId: null,
                            rideList: []
                        }
                    }
                }
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
            if (state.currentFriend.userId === null || (action.data.userId !== state.currentFriend.userId)) return state;
            return {
                ...state,
                currentFriend: {
                    ...state.currentFriend,
                    ...action.data
                }
            };

        case UPDATE_FRIENDS_RIDE_SNAPSHOT:
            if (state.currentFriend.userId === null || (action.data.userId !== state.currentFriend.userId)) return state;
            updatedRideList = state.currentFriend.rideList.map(ride => {
                if (!ride.snapshotId) return ride;
                let id = ride.snapshotId.replace(THUMBNAIL_TAIL_TAG, RIDE_TAIL_TAG);
                if (typeof action.data.pictureObject[id] === 'string') {
                    return { ...ride, snapshot: action.data.pictureObject[id] };
                }
                return ride;
            });
            return { ...state, currentFriend: { ...state.currentFriend, rideList: updatedRideList } };

        case UPDATE_CURRENT_FRIEND_GARAGE:
            if ((state.currentFriend.userId === null) || (action.data.userId !== state.currentFriend.userId)) return state;
            let idx = state.currentFriend.garage.spaceList.findIndex((garageSpaceList) => garageSpaceList.spaceId === action.data.spaceId)
            if (idx > -1) {
                const bike = state.currentFriend.garage.spaceList[idx];
                bike.profilePicture = action.data.profilePicture;
                return {
                    ...state,
                    currentFriend: {
                        ...state.currentFriend,
                        garage: {
                            ...state.currentFriend.garage,
                            spaceList: [
                                ...state.currentFriend.garage.spaceList.slice(0, idx),
                                bike,
                                ...state.currentFriend.garage.spaceList.slice(idx + 1)
                            ]
                        }
                    }
                }
            }
            return state;


        case RESET_CURRENT_FRIEND:
            return {
                ...state,
                currentFriend: {
                    garage: {
                        garageId: null
                    },
                    userId: null,
                    rideList: [],
                }
            }

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