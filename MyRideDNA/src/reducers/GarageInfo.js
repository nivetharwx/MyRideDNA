import { REPLACE_GARAGE_INFO, UPDATE_GARAGE_NAME, UPDATE_BIKE_LIST, CLEAR_GARAGE, ADD_TO_BIKE_LIST, DELETE_BIKE_FROM_LIST, UPDATE_ACTIVE_BIKE, UPDATE_SHORT_SPACE_LIST, REPLACE_SHORT_SPACE_LIST, UPDATE_BIKE_PICTURE, CLEAR_BIKE_ALBUM, UPDATE_BIKE_ALBUM, GET_CURRENT_BIKE, SET_CURRENT_BIKE_ID, UPDATE_BIKE_WISH_LIST, UPDATE_BIKE_CUSTOMIZATIONS, GET_CURRENT_BIKE_SPEC, UPDATE_BIKE_LOGGED_RIDE, DELETE_BIKE_SPECS, UPDATE_BIKE_SPECS, EDIT_CURRENT_BIKE_SPECS, DELETE_PICTURE_FROM_BIKE_ALBUM, UPDATE_CURRENT_BIKE_LIKE_AND_COMMENT_COUNT, UPDATE_DESC_IN_BIKE_ALBUM } from "../actions/actionConstants";
import { PORTRAIT_TAIL_TAG, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, POST_TYPE } from "../constants";
import { Actions } from "react-native-router-flux";

const initialState = {
    garageName: null,
    garageId: null,
    spaceList: [],
    currentBike: null,
    currentBikeSpec: null,
    
};

export default (state = initialState, action) => {
    const updatedCurrentBike = { ...state }
    switch (action.type) {
        case REPLACE_GARAGE_INFO:
            const activeIndex = action.data.spaceList.findIndex(bike => bike.isDefault);
            if (activeIndex === -1 || activeIndex === 0) {
                return {
                    ...state,
                    ...action.data
                }
            } else {
                return {
                    ...state,
                    ...action.data,
                    spaceList: [
                        action.data.spaceList[activeIndex],
                        ...action.data.spaceList.slice(0, activeIndex),
                        ...action.data.spaceList.slice(activeIndex + 1),
                    ]
                }
            }
        case UPDATE_GARAGE_NAME:
            return {
                ...state,
                garageName: action.data
            }

        case ADD_TO_BIKE_LIST:
            return {
                ...state,
                spaceList: [...state.spaceList, action.data.bike]
            }

        case GET_CURRENT_BIKE:
            if (!action.data) {
                return {
                    ...state,
                    currentBike: null,
                    getCurrentBikeSpec: null,
                }
            }
            return {
                ...state,
                currentBike: state.spaceList.find(({ spaceId }) => spaceId === action.data)
            }

        case UPDATE_BIKE_WISH_LIST:
            if (state.currentBike === null) return state;
            return {
                ...state,
                currentBike: {
                    ...state.currentBike,
                    wishList: action.data.reset
                        ? action.data.updates
                        : [...state.currentBike.wishList, ...action.data.updates]
                },
            }

        case UPDATE_BIKE_CUSTOMIZATIONS:
            if (state.currentBike === null) return state;
            return {
                ...state,
                currentBike: {
                    ...state.currentBike,
                    customizations: action.data.reset
                        ? action.data.updates
                        : [...state.currentBike.customizations, ...action.data.updates]
                },
            }
        case UPDATE_BIKE_LOGGED_RIDE:
            if (state.currentBike === null) return state;
            return {
                ...state,
                currentBike: {
                    ...state.currentBike,
                    loggedRides: action.data.reset
                        ? action.data.updates
                        : [...state.currentBike.loggedRides, ...action.data.updates]
                }
            }

        case UPDATE_BIKE_ALBUM:
            if (state.currentBike === null) return state;
            return {
                ...state,
                currentBike: {
                    ...state.currentBike,
                    pictures: action.data.reset
                        ? action.data.updates
                        : action.data.isNewPic ? [...action.data.updates, ...state.currentBike.pictures] : [...state.currentBike.pictures, ...action.data.updates]
                }
            }

        case CLEAR_BIKE_ALBUM:
            if (state.currentBike === null) return state;
            return {
                ...state,
                currentBike: { ...state.currentBike, pictures: [] }
            }

        case SET_CURRENT_BIKE_ID:
            if (action.data === null) {
                return {
                    ...state,
                    currentBikeId: null,
                    spaceList: state.spaceList.map(space => {
                        return state.currentBikeId === space.spaceId
                            ? { ...space, customizations: null, wishList: null, loggedRides: null, stories: null }
                            : space;
                    })
                }
            }
            return {
                ...state,
                currentBikeId: action.data
            }

        case GET_CURRENT_BIKE_SPEC:
            if (state.currentBike === null) return state;
            if (!action.data) {
                return {
                    ...state,
                    currentBikeSpec: null,
                }
            }
            if (action.data.postType === POST_TYPE.WISH_LIST) {
                return {
                    ...state,
                    currentBikeSpec: state.currentBike.wishList.find(({ id }) => id === action.data.postId),
                }
            } else if (action.data.postType === POST_TYPE.MY_RIDE) {
                return {
                    ...state,
                    currentBikeSpec: state.currentBike.customizations.find(({ id }) => id === action.data.postId),
                }
            }

        case DELETE_BIKE_FROM_LIST:
            const updatedList = state.spaceList.reduce((list, bike, idx, arr) => {
                if (bike.spaceId === action.data) {
                    if (bike.isDefault && arr.length > 1) {
                        arr[idx + 1] = { ...arr[idx + 1], isDefault: true };
                    }
                    return list;
                }
                list.push(bike);
                return list;
            }, []);
            return {
                ...state,
                spaceList: updatedList,
                currentBike: !state.currentBike || state.currentBike.spaceId === action.data
                    ? null
                    : state.currentBike && state.currentBike.spaceId === updatedList[0].spaceId
                        ? { ...state.currentBike, isDefault: true }
                        : state.currentBike
            }

        case UPDATE_ACTIVE_BIKE:
            if (state.spaceList.length > 0) {
                return {
                    ...state,
                    spaceList: state.spaceList.reduce((list, bike, idx) => {
                        if (idx === 0) {
                            list.push({ ...bike, isDefault: false });
                        } else if (bike.spaceId === action.data) {
                            list = [{ ...bike, isDefault: true }, ...list];
                        }
                        else {
                            list.push(bike);
                        }
                        return list;
                    }, []),
                    currentBike: state.currentBike && state.currentBike.spaceId === action.data
                        ? { ...state.currentBike, isDefault: true } : state.currentBike
                }
            }
            return state;

        case UPDATE_BIKE_LIST:
            return {
                ...state,
                spaceList: state.spaceList.map((bike) => {
                    return action.data.spaceId === bike.spaceId
                        ? { ...bike, ...action.data }
                        : bike;
                }),
                currentBike: state.currentBike && state.currentBike.spaceId === action.data.spaceId ? { ...state.currentBike, ...action.data } : state.currentBike
            }

        // case UPDATE_BIKE_PICTURE:
        //     if (state.currentBikeId === null) return state;
        //     return {
        //         ...state,
        //         spaceList: state.spaceList.map((bike) => {
        //             return state.currentBikeId === bike.spaceId
        //                 ? { ...bike, picture: { ...bike.picture, data: action.data.picture } }
        //                 : bike;
        //         })
        //     }

        case DELETE_BIKE_SPECS:
            if (action.data.postType === POST_TYPE.MY_RIDE) {
                const specIdx = state.currentBike.customizations.findIndex(spec => spec.id === action.data.id)
                return {
                    ...state,
                    currentBike: {
                        ...state.currentBike,
                        customizations: [...state.currentBike.customizations.slice(0, specIdx), ...state.currentBike.customizations.slice(specIdx + 1)]
                    }
                }
            }
            else if (action.data.postType === POST_TYPE.WISH_LIST) {
                const specIdx = state.currentBike.wishList.findIndex(spec => spec.id === action.data.id)
                return {
                    ...state,
                    currentBike: {
                        ...state.currentBike,
                        wishList: [...state.currentBike.wishList.slice(0, specIdx), ...state.currentBike.wishList.slice(specIdx + 1)]
                    }
                }
            }
            else if (action.data.postType === POST_TYPE.LOGGED_RIDES) {
                return {
                    ...state,
                    currentBike: {
                        ...state.currentBike,
                        loggedRides: state.currentBike.loggedRides.filter(ride => ride.rideId !== action.data.rideId)
                    }
                }
            }
            else return state

        case UPDATE_BIKE_SPECS:
            // const spec = getPostType(action.data.postType)
            // updatedCurrentBike.currentBike[spec] = [action.data.postData, ...updatedCurrentBike.currentBike[spec]]
            // return updatedCurrentBike;
            if (action.data.postType === POST_TYPE.MY_RIDE) {
                return {
                    ...state,
                    currentBike: {
                        ...state.currentBike,
                        customizations: [action.data.postData, ...state.currentBike.customizations]
                    }
                }
            }
            else if (action.data.postType === POST_TYPE.WISH_LIST) {
                return {
                    ...state,
                    currentBike: {
                        ...state.currentBike,
                        wishList: [action.data.postData, ...state.currentBike.wishList]
                    }
                }
            }

        case EDIT_CURRENT_BIKE_SPECS:
            if (action.data.postType === POST_TYPE.MY_RIDE) {
                const specIdx = state.currentBike.customizations.findIndex(spec => spec.id === action.data.id)
                return {
                    ...state,
                    currentBike: {
                        ...state.currentBike,
                        customizations: [...state.currentBike.customizations.slice(0, specIdx), action.data.postData, ...state.currentBike.customizations.slice(specIdx + 1)]
                    },
                    currentBikeSpec: action.data.postData
                }
            }
            else if (action.data.postType === POST_TYPE.WISH_LIST) {
                const specIdx = state.currentBike.wishList.findIndex(spec => spec.id === action.data.id)
                return {
                    ...state,
                    currentBike: {
                        ...state.currentBike,
                        wishList: [...state.currentBike.wishList.slice(0, specIdx), action.data.postData, ...state.currentBike.wishList.slice(specIdx + 1)]
                    },
                    currentBikeSpec: action.data.postData
                }
            }
            else if (action.data.postType === POST_TYPE.LOGGED_RIDES) {
                return {
                    ...state,
                    currentBike: {
                        ...state.currentBike,
                        loggedRides: state.currentBike.loggedRides.map(ride => {
                            if (ride.rideId === action.data.ride.rideId) {
                                return { ...ride, ...action.data.ride };
                            }
                            return ride;
                        })
                    },
                }
            }
            else return state

        case UPDATE_CURRENT_BIKE_LIKE_AND_COMMENT_COUNT:
            if (state.currentBike === null) return state;
            if (state.currentBike.loggedRides && state.currentBike.loggedRides.length === 0) return state;
            return {
                ...state,
                currentBike: {
                    ...state.currentBike,
                    loggedRides: state.currentBike.loggedRides.map(ride => {
                        return ride.rideId === action.data.rideId
                            ? action.data.isUpdateLike
                                ? { ...ride, numberOfLikes: ride.numberOfLikes + (action.data.isAdded ? 1 : -1), isLiked: action.data.isLiked ? (action.data.isAdded ? true : false) : ride.isLiked }
                                : { ...ride, numberOfComments: action.data.numberOfComments?action.data.numberOfComments:0}
                            : ride
                    })
                },
            }

        case DELETE_PICTURE_FROM_BIKE_ALBUM:
            return {
                ...state,
                currentBike: {
                    ...state.currentBike,
                    pictures: state.currentBike.pictures.filter(({ id }) => id !== action.data[0].pictureName)
                }
            }
        case UPDATE_DESC_IN_BIKE_ALBUM:
            if (state.currentBike === null) return state;
            return {
                ...state,
                currentBike: {
                    ...state.currentBike,
                    pictures: state.currentBike.pictures.map(picture => {
                        return picture.id === action.data.id ?
                            { ...picture, ...action.data }
                            : picture
                    })
                }
            }
        default: return state
    }
}

const getPostType = (postType) => {
    switch (postType) {
        case POST_TYPE.MY_RIDE: return 'customizations'
        case POST_TYPE.WISH_LIST: return 'wishList'
        case POST_TYPE.LOGGED_RIDES: return 'loggedRides'
    }
}