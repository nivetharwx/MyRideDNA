import { UPDATE_EMAIL_STATUS, REPLACE_ALBUM_LIST } from "../actions/actionConstants";

const initialState = {
    albumList:[]
};

export default (state = initialState, action) => {
    switch (action.type) {
        case REPLACE_ALBUM_LIST:
            return {
                ...state,
                albumList:action.data
            }
        default: return state
    }
}