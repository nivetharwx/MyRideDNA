import { LOGIN_RESPONSE, CURRENT_USER, UPDATE_USER, UPDATE_EMAIL_STATUS, UPDATE_SIGNUP_RESULT, UPDATE_PASSWORD_SUCCESS, UPDATE_PASSWORD_ERROR, RESET_PASSWORD_ERROR } from "../actions/actionConstants";

const initialState = {
    // loginResponse: null
    user: null,
    emailStatus: { isExists: false },
    signupResult: '',
    updatePasswordError: '',
    updatePasswordSuccess: ''
};

export default (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_EMAIL_STATUS:
            return {
                ...state,
                emailStatus: { isExists: action.data }
            }
        case UPDATE_SIGNUP_RESULT:
            return {
                ...state,
                signupResult: action.data
            }
        case CURRENT_USER:
            action.data.locationEnable = action.data.locationEnable || false;
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
        case UPDATE_PASSWORD_SUCCESS:
            return {
                ...state,
                updatePasswordSuccess: action.data
            }
        case UPDATE_PASSWORD_ERROR:
            return {
                ...state,
                updatePasswordError: action.data
            }
        case RESET_PASSWORD_ERROR:
            return {
                ...state,
                updatePasswordError: null
            }
        default: return state
    }
}