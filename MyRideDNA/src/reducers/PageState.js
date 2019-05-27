import { TOGGLE_LOADER, TOGGLE_NETWORK_STATUS, UPDATE_MYPROFILE_LAST_OPTION, PROFILE_LOADER, UPDATE_APPSTATE, UPDATE_PAGENUMBER } from "../actions/actionConstants";
import { Actions } from "react-native-router-flux";

const initialState = {
    showLoader: false,
    hasNetwork: true,
    profileLastOptions: 0,
    loader: false,
    appState: 'foreground',
    pageNumber: 0
};

export default (state = initialState, action) => {
    switch (action.type) {
        case TOGGLE_LOADER:
            return {
                ...state,
                showLoader: action.data
            }
        case TOGGLE_NETWORK_STATUS:
            return {
                ...state,
                hasNetwork: action.data
            }
        case UPDATE_MYPROFILE_LAST_OPTION:
            return {
                ...state,
                profileLastOptions: action.data.expanded
            }
        case UPDATE_APPSTATE:
            return {
                ...state,
                appState: action.data.appState
            }
        // case PROFILE_LOADER:
        //     return{
        //         ...state,
        //         loader:action.data
        //     } 
        case UPDATE_PAGENUMBER:
            return {
                ...state,
                pageNumber: action.data.pageNumber + 1,
            }
        default: return state
    }
}