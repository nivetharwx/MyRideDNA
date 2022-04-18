import { UPDATE_JOURNAL, DELETE_JOURNAL, REPLACE_JOURNAL, UPDATE_LIKE_AND_COMMENT_COUNT } from "../actions/actionConstants";

const initialState = { journal: null, };

export default (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_JOURNAL:
            return {
                ...state,
                journal: action.data.reset
                    ? action.data.updates
                    : action.data.isNewPost ? [...action.data.updates, ...state.journal] : [...state.journal, ...action.data.updates]
            }

        case REPLACE_JOURNAL:
            return {
                ...state,
                journal: state.journal ? state.journal.map(post => post.id === action.data.id ? action.data : post) : state.journal
            }

        case DELETE_JOURNAL:
            return {
                ...state,
                journal: state.journal ? state.journal.filter(post => post.id !== action.data.id) : state.journal
            }

        case UPDATE_LIKE_AND_COMMENT_COUNT:
            if (state.journal === null) return state;
            return {
                ...state,
                journal: state.journal.map(post => {
                    return post.id === action.data.id
                        ? action.data.isUpdateLike
                            ? { ...post, numberOfLikes: post.numberOfLikes + (action.data.isAdded ? 1 : -1), isLike: action.data.isLike ? (action.data.isAdded ? true : false) : post.isLike }
                            : { ...post, numberOfComments: action.data.numberOfComments ? action.data.numberOfComments : (post.numberOfComments + (action.data.isAdded ? 1 : -1)) }
                        : post;
                })
            }

        default: return state
    }
}