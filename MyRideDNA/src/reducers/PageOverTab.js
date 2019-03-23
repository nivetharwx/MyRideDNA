import { UPDATE_IMAGE_INFO, CLEAR_IMAGE_INFO } from "../actions/actionConstants";

const initialState = {
    oldPosition: null,
    personInfo: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_IMAGE_INFO:
            return {
                ...action.data
            }
        case CLEAR_IMAGE_INFO:
            return {
                ...initialState
            }
        default: return state
    }
}