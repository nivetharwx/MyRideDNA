import { UPDATE_EMAIL_STATUS, REPLACE_ALBUM_LIST, UPDATE_ALBUM_LIST, CLEAR_ALBUM, DELETE_PICTURE_FROM_ALBUM } from "../actions/actionConstants";
import { MEDIUM_TAIL_TAG, THUMBNAIL_TAIL_TAG } from "../constants";

const initialState = {
    albumList: [],
};

export default (state = initialState, action) => {
    switch (action.type) {
        case REPLACE_ALBUM_LIST:
            if (action.data.pageNumber === 0) {
                return {
                    ...state,
                    albumList: action.data.pictureList
                }
            }
            else {
                return {
                    ...state,
                    albumList: action.data.isNewPic ? [...action.data.pictureList, ...state.albumList] : [...state.albumList, ...action.data.pictureList]
                }
            }


        case UPDATE_ALBUM_LIST:
            return {
                ...state,
                albumList: state.albumList.map(picture => {
                    return picture.id === action.data.id ?
                        { ...picture, ...action.data }
                        : picture
                })
            }

        case CLEAR_ALBUM:
            return {
                albumList: []
            }
        case DELETE_PICTURE_FROM_ALBUM:
            return {
                ...state,
                albumList: state.albumList.filter(({ id }) => id !== action.data[0].pictureName)
            }

        default: return state
    }
}