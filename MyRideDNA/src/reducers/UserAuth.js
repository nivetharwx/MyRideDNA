import { LOGIN_RESPONSE, CURRENT_USER, UPDATE_USER } from "../actions/actionConstants";

const initialState = {
    // loginResponse: null
    user: null
};

export default (state = initialState, action) => {
    switch(action.type) {
        case LOGIN_RESPONSE: 
            return {
                ...state,
                loginResponse: action.data
            }
        case CURRENT_USER: 
            return {
                ...state,
                user: action.data
            }
        case UPDATE_USER: 
            return {
                ...state,
                user: {
                    ...state.user,
                    ...action.data
                }
            }
        default: return state
    }
}