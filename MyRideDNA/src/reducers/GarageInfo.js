import { REPLACE_GARAGE_INFO, UPDATE_GARAGE_NAME, UPDATE_BIKE_LIST, CLEAR_GARAGE, ADD_TO_BIKE_LIST, DELETE_BIKE_FROM_LIST, UPDATE_ACTIVE_BIKE, UPDATE_SHORT_SPACE_LIST, REPLACE_SHORT_SPACE_LIST, UPDATE_BIKE_PICTURE, CLEAR_BIKE_ALBUM, UPDATE_BIKE_ALBUM, SET_CURRENT_BIKE_ID } from "../actions/actionConstants";
import { PORTRAIT_TAIL_TAG, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG } from "../constants";

const initialState = {
    garageName: null,
    garageId: null,
    spaceList: [],
    currentBikeId: null,
    activeBikeIndex: 0
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

        case SET_CURRENT_BIKE_ID:
            return {
                ...state,
                currentBikeId: action.data
            }

        case DELETE_BIKE_FROM_LIST:
            const spaceList = [
                ...state.spaceList.slice(0, action.data),
                ...state.spaceList.slice(action.data + 1)
            ];
            // DOC: Set first bike as active if only one is there
            if (spaceList.length > 0 && state.spaceList[action.data].isDefault) {
                spaceList[0].isDefault = true;
            }
            return {
                ...state,
                spaceList: spaceList,
                currentBikeId: state.spaceList[action.data].spaceId === state.currentBikeId ? null : state.currentBikeId
            }

        case UPDATE_ACTIVE_BIKE:
            if (state.spaceList.length > 0) {
                const updatedSpaceList = [...state.spaceList];
                updatedSpaceList[state.activeBikeIndex] = { ...state.spaceList[state.activeBikeIndex], isDefault: false };
                updatedSpaceList[action.data] = { ...state.spaceList[action.data], isDefault: true };
                return {
                    ...state,
                    spaceList: [
                        updatedSpaceList[action.data],
                        ...updatedSpaceList.slice(0, action.data),
                        ...updatedSpaceList.slice(action.data + 1)
                    ],
                    activeBikeIndex: action.data
                }
            }
            return state;

        case UPDATE_BIKE_LIST:
            const bikeIdx = state.spaceList.findIndex(({ spaceId }) => state.currentBikeId === spaceId);
            if (bikeIdx === -1) return state;
            return {
                ...state,
                spaceList: [
                    ...state.spaceList.slice(0, bikeIdx),
                    {
                        ...state.spaceList[bikeIdx],
                        ...action.data
                    },
                    ...state.spaceList.slice(bikeIdx + 1)
                ]
            }

        case UPDATE_BIKE_PICTURE:
            const bikeIndex = state.spaceList.findIndex(({ spaceId }) => spaceId === action.data.spaceId);
            if (bikeIndex === -1) return state;
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

        case UPDATE_BIKE_ALBUM:
            const bIndex = state.spaceList.findIndex(({ spaceId }) => state.currentBikeId === spaceId);
            if (bIndex === -1) return state;
            return {
                ...state,
                spaceList: [
                    ...state.spaceList.slice(0, bIndex),
                    {
                        ...state.spaceList[bIndex],
                        pictures: state.spaceList[bIndex].pictures.map(picture => {
                            const picId = picture.id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG);
                            return typeof action.data.pictureObj[picId] === 'string'
                                ? { ...picture, data: action.data.pictureObj[picId] }
                                : picture;
                        })
                    },
                    ...state.spaceList.slice(bIndex + 1),
                ]
            }

        case CLEAR_BIKE_ALBUM:
            const bIdx = state.spaceList.findIndex(({ spaceId }) => state.currentBikeId === spaceId);
            if (bIdx === -1) return state;
            return {
                ...state,
                spaceList: [
                    ...state.spaceList.slice(0, bIdx),
                    { ...state.spaceList[bIdx], pictures: [] },
                    ...state.spaceList.slice(bIdx + 1)
                ]
            }

        case CLEAR_GARAGE:
            return {
                ...initialState
            }

        default: return state
    }
}