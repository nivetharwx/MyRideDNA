import { REPLACE_GARAGE_INFO, UPDATE_GARAGE_NAME, UPDATE_BIKE_LIST, CLEAR_GARAGE, ADD_TO_BIKE_LIST, DELETE_BIKE_FROM_LIST, UPDATE_ACTIVE_BIKE, UPDATE_SHORT_SPACE_LIST, REPLACE_SHORT_SPACE_LIST, UPDATE_BIKE_PICTURE, CLEAR_BIKE_ALBUM, UPDATE_BIKE_ALBUM, GET_CURRENT_BIKE, SET_CURRENT_BIKE_ID, UPDATE_BIKE_WISH_LIST, UPDATE_BIKE_CUSTOMIZATIONS } from "../actions/actionConstants";
import { PORTRAIT_TAIL_TAG, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG } from "../constants";

const initialState = {
    garageName: null,
    garageId: null,
    spaceList: [],
    currentBike: null,
    currentBikeSpec: null
};

export default (state = initialState, action) => {
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
            if (action.data === null) {
                return {
                    ...state,
                    currentBike: null,
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

        case UPDATE_BIKE_ALBUM:
            if (state.currentBike === null) return state;
            return {
                ...state,
                currentBike: {
                    ...state.currentBike,
                    pictures: action.data.reset
                        ? action.data.updates
                        : [...state.currentBike.pictures, ...action.data.updates]
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

        // case GET_CURRENT_BIKE_SPEC:
        //     if (action.data === null) {
        //         return {
        //             ...state,
        //             currentBikeSpec: null,
        //         }
        //     }
        //     return {
        //         ...state,
        //         currentBike: state.spaceList.find(({ spaceId }) => spaceId === action.data)
        //     }

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

        default: return state
    }
}