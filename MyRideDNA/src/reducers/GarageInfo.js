import { REPLACE_GARAGE_INFO, UPDATE_GARAGE_NAME, UPDATE_BIKE_LIST, CLEAR_GARAGE, ADD_TO_BIKE_LIST, DELETE_BIKE_FROM_LIST, UPDATE_ACTIVE_BIKE, UPDATE_SHORT_SPACE_LIST, REPLACE_SHORT_SPACE_LIST } from "../actions/actionConstants";

const initialState = {
    garageName: null,
    garageId: null,
    spaceList: [],
    shortSpaceList: []
};

export default (state = initialState, action) => {
    switch (action.type) {
        case REPLACE_GARAGE_INFO:
            const activeIndex = action.data.spaceList.findIndex(bike => bike.isDefault);
            if (activeIndex === -1 || activeIndex === 0) {
                return {
                    ...action.data
                }
            } else {
                return {
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
        case REPLACE_SHORT_SPACE_LIST:
            return {
                ...state,
                shortSpaceList: action.data
            }
        case UPDATE_SHORT_SPACE_LIST:
            return {
                ...state,
                shortSpaceList: []
            }
        case ADD_TO_BIKE_LIST:
            return {
                ...state,
                spaceList: action.data.index >= 0
                    ? [
                        ...state.spaceList.slice(0, action.data.index),
                        action.data.bike,
                        ...state.spaceList.slice(action.data.index)
                    ]
                    : [...state.spaceList, action.data.bike]
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
            const updatedSpaceList = [...state.spaceList];
            updatedSpaceList[action.data.prevActiveIndex].isDefault = false;
            updatedSpaceList[action.data.newActiveIndex].isDefault = true;
            return {
                ...state,
                spaceList: [
                    updatedSpaceList[action.data.newActiveIndex],
                    ...updatedSpaceList.slice(0, action.data.newActiveIndex),
                    ...updatedSpaceList.slice(action.data.newActiveIndex + 1)
                ]
            }
        case UPDATE_BIKE_LIST:
            return {
                ...state,
                spaceList: [
                    ...state.spaceList.slice(0, action.data.index),
                    action.data.bike,
                    ...state.spaceList.slice(action.data.index + 1)
                ]
            }
        case CLEAR_GARAGE:
            return {
                ...initialState
            }
        default: return state
    }
}