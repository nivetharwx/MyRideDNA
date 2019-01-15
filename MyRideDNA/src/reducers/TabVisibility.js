import { APP_NAV_MENU_VISIBILITY, SCREEN_CHANGE } from "../actions/actionConstants";
import { PageKeys } from "../constants";

const initialState = {
    showMenu: false,
    currentScreen: PageKeys.MAP
};

export default (state = initialState, action) => {
    switch (action.type) {
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