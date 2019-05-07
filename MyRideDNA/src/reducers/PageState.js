import { TOGGLE_LOADER, TOGGLE_NETWORK_STATUS, UPDATE_MYPROFILE_LAST_OPTION, PROFILE_LOADER } from "../actions/actionConstants";
import { Actions } from "react-native-router-flux";

const initialState = {
    showLoader: false,
    hasNetwork: true,
    profileLastOptions:0,
    loader:false 
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
                profileLastOptions:action.data.expanded
            }  
        case PROFILE_LOADER:
            return{
                ...state,
                loader:action.data
            }    
        default: return state
    }
}