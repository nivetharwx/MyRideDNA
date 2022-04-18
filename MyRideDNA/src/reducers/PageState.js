import { TOGGLE_LOADER, TOGGLE_NETWORK_STATUS, UPDATE_MYPROFILE_LAST_OPTION, PROFILE_LOADER, UPDATE_APPSTATE, UPDATE_PAGENUMBER, ERROR_HANDLING, RESET_ERROR_HANDLING, UPDATE_POST_TYPES, UPDATE_PAGE_CONTENT_STATUS, UPDATE_JWT_TOKEN, TOGGLE_API_CALL_INFO, SCREEN_CHANGE, APP_NAV_MENU_VISIBILITY } from "../actions/actionConstants";
import { Actions } from "react-native-router-flux";
import { PageKeys } from "../constants";

const initialState = {
    showLoader: false,
    hasNetwork: true,
    profileLastOptions: 0,
    loader: false,
    appState: 'background',
    pageNumber: 0,
    lastApi: null,
    isRetryApi: false,
    postTypes: {},
    updatePageContent: null,
    jwtToken: null,
    apiCallsInProgress: {},
    showMenu: false,
    currentScreen: {
        name: PageKeys.MAP,
        params: {}
    }
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
        case UPDATE_POST_TYPES:
            return {
                ...state,
                postTypes: action.data
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
        case ERROR_HANDLING:
            return {
                ...state,
                lastApi: {
                    currentScene: action.data.currentScene,
                    config: action.data.config,
                    api: action.data.api,
                    params: action.data.params,
                    withoutDispatch: action.data.withoutDispatch
                },
                isRetryApi: action.data.isRetryApi,
            }
        case RESET_ERROR_HANDLING: {
            if (action.data.comingFrom === 'api') {
                return {
                    ...state,
                    isRetryApi: action.data.isRetryApi,
                    lastApi: null
                }
            }
            else {
                return {
                    ...state,
                    isRetryApi: action.data.isRetryApi
                }
            }

        }
        case UPDATE_PAGE_CONTENT_STATUS:
            return {
                ...state,
                updatePageContent: action.data
            }

        case UPDATE_JWT_TOKEN:
            return {
                ...state,
                jwtToken: action.data
            }

        case TOGGLE_API_CALL_INFO:
            if (action.data.status === true) {
                return {
                    ...state,
                    apiCallsInProgress: { ...state.apiCallsInProgress, [action.data.id]: true }
                }
            } else {
                const { [action.data.id]: deleted, ...other } = state.apiCallsInProgress;
                return {
                    ...state,
                    apiCallsInProgress: { ...other }
                }
            }

        case APP_NAV_MENU_VISIBILITY:
            return {
                ...state,
                showMenu: action.data
            }

        case SCREEN_CHANGE:
            return {
                ...state,
                showMenu: false,
                currentScreen: action.data
            }

        default: return state
    }
}