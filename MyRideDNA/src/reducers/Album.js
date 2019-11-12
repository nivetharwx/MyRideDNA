import { UPDATE_EMAIL_STATUS, REPLACE_ALBUM_LIST, UPDATE_ALBUM_LIST } from "../actions/actionConstants";
import { MEDIUM_TAIL_TAG, THUMBNAIL_TAIL_TAG } from "../constants";

const initialState = {
    albumList: []
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
                    albumList: [
                        ...state.albumList,
                        ...action.data.pictureList
                    ]
                }
            }


        case UPDATE_ALBUM_LIST:
            if (action.data.pictureObj) {
                let updatedAlbumList = state.albumList.map(item => {
                    if (!item.profilePictureId) return item;
                    if (typeof action.data.pictureObj[item.profilePictureId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)] === 'string') {
                        return { ...item, profilePicture: action.data.pictureObj[item.profilePictureId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)] }
                    }
                    return item;
                })
                return {
                    ...state,
                    albumList: updatedAlbumList
                }
            }
        default: return state
    }
}