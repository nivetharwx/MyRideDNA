import { REPLACE_GARAGE_INFO, UPDATE_GARAGE_NAME, UPDATE_BIKE_LIST, CLEAR_GARAGE, ADD_TO_BIKE_LIST, DELETE_BIKE_FROM_LIST, UPDATE_ACTIVE_BIKE, UPDATE_SHORT_SPACE_LIST, REPLACE_SHORT_SPACE_LIST, UPDATE_BIKE_PICTURE, CLEAR_BIKE_ALBUM, UPDATE_BIKE_ALBUM, SET_CURRENT_BIKE_INDEX } from "../actions/actionConstants";
import { PORTRAIT_TAIL_TAG, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG } from "../constants";

const initialState = {
    garageName: null,
    garageId: null,
    spaceList: [],
    currentIndex: -1,
    // shortSpaceList: []
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
        // case REPLACE_SHORT_SPACE_LIST:
        //     return {
        //         ...state,
        //         shortSpaceList: action.data
        //     }

        case ADD_TO_BIKE_LIST:
            return {
                ...state,
                spaceList: [...state.spaceList, action.data.bike]
            }

        case SET_CURRENT_BIKE_INDEX:
            return {
                ...state,
                currentIndex: action.data
            }

        case DELETE_BIKE_FROM_LIST:
            const spaceList = [
                ...state.spaceList.slice(0, action.data.index),
                ...state.spaceList.slice(action.data.index + 1)
            ];
            // DOC: Set first bike as active if only one is there
            if (spaceList.length > 0 && state.spaceList[action.data.index].isDefault) {
                spaceList[0].isDefault = true;
            }
            return {
                ...state,
                spaceList: spaceList
            }

        case UPDATE_ACTIVE_BIKE:
            // const updatedShortSpaceList = [...state.shortSpaceList];
            // updatedShortSpaceList[action.data.prevActiveIndex] = { ...state.shortSpaceList[action.data.prevActiveIndex], isDefault: false };
            // updatedShortSpaceList[action.data.newActiveIndex] = { ...state.shortSpaceList[action.data.newActiveIndex], isDefault: true };
            if (state.spaceList.length > 0) {
                const updatedSpaceList = [...state.spaceList];
                updatedSpaceList[action.data.prevActiveIndex] = { ...state.spaceList[action.data.prevActiveIndex], isDefault: false };
                updatedSpaceList[action.data.newActiveIndex] = { ...state.spaceList[action.data.newActiveIndex], isDefault: true };
                return {
                    ...state,
                    spaceList: [
                        updatedSpaceList[action.data.newActiveIndex],
                        ...updatedSpaceList.slice(0, action.data.newActiveIndex),
                        ...updatedSpaceList.slice(action.data.newActiveIndex + 1),
                    ],
                    // shortSpaceList: [
                    //     updatedShortSpaceList[action.data.newActiveIndex],
                    //     ...updatedShortSpaceList.slice(0, action.data.newActiveIndex),
                    //     ...updatedShortSpaceList.slice(action.data.newActiveIndex + 1),
                    // ]
                }
            }
            return {
                ...state,
                // shortSpaceList: [
                //     updatedShortSpaceList[action.data.newActiveIndex],
                //     ...updatedShortSpaceList.slice(0, action.data.newActiveIndex),
                //     ...updatedShortSpaceList.slice(action.data.newActiveIndex + 1),
                // ]
            }
        case UPDATE_BIKE_LIST:
            if (state.currentIndex === -1) return state;
            return {
                ...state,
                spaceList: [
                    ...state.spaceList.slice(0, state.currentIndex),
                    {
                        ...state.spaceList[state.currentIndex],
                        ...action.data
                    },
                    ...state.spaceList.slice(state.currentIndex + 1)
                ]
            }

        case UPDATE_BIKE_PICTURE:
            const bikeIndex = state.spaceList.findIndex(bike => bike.spaceId === action.data.spaceId);
            if (bikeIndex > -1) {
                return {
                    ...state,
                    spaceList: [
                        ...state.spaceList.slice(0, bikeIndex),
                        {
                            ...state.spaceList[bikeIndex],
                            picture: { ...state.spaceList[bikeIndex].picture, data: action.data.picture }
                        },
                        ...state.spaceList.slice(bikeIndex + 1)
                    ]
                }
            }
            return state;

        case UPDATE_BIKE_ALBUM:
            if (state.currentIndex === -1) return state;
            return {
                ...state,
                spaceList: [
                    ...state.spaceList.slice(0, state.currentIndex),
                    {
                        ...state.spaceList[state.currentIndex],
                        pictures: state.spaceList[state.currentIndex].pictures.map(picture => {
                            const picId = picture.id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG);
                            return typeof action.data.pictureObj[picId] === 'string'
                                ? { ...picture, data: action.data.pictureObj[picId] }
                                : picture;
                        })
                    },
                    ...state.spaceList.slice(state.currentIndex + 1),
                ]
            }

        case CLEAR_BIKE_ALBUM:
            return {
                ...state,
                currentIndex: -1,
                spaceList: [
                    ...state.spaceList.slice(0, state.currentIndex),
                    { ...state.spaceList[state.currentIndex], pictures: [] },
                    ...state.spaceList.slice(state.currentIndex + 1)
                ]
            }

        case CLEAR_GARAGE:
            return {
                ...initialState
            }

        // case UPDATE_SHORT_SPACE_LIST:
        //     const index = state.shortSpaceList.findIndex((item) => item.spaceId === action.data.spaceId);
        //     if (index > -1) {
        //         const bike = state.shortSpaceList[index];
        //         bike.profilePicture = action.data.profilePicture;
        //         console.log('update shortspace list ')
        //         return {
        //             ...state,
        //             shortSpaceList: [
        //                 ...state.shortSpaceList.slice(0, index),
        //                 bike,
        //                 ...state.shortSpaceList.slice(index + 1)
        //             ]
        //         }
        //     }
        //     return state
        default: return state
    }
}