import { LOGIN_RESPONSE, CURRENT_USER, UPDATE_USER, UPDATE_EMAIL_STATUS, UPDATE_SIGNUP_RESULT } from "../actions/actionConstants";

const initialState = {
    // loginResponse: null
    user: null,
    emailStatus: { isExists: false },
    signupResult: '',
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