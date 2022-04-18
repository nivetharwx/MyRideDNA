import { SET_CURRENT_FRIEND, UPDATE_CURRENT_FRIEND, GO_PREV_PROFILE } from "../actions/actionConstants";

const initialState = { profiles: {}, screens: [] };

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_CURRENT_FRIEND:
            return {
                ...state,
                profiles: state.profiles[action.data.userId]
                    ? state.profiles
                    : {
                        ...state.profiles,
                        [action.data.userId]: {
                            isFriend: false,
                            garage: { garageId: null },
                            rideList: [],
                            homeAddress: {},
                            passengerList: [],
                            friendList: [],
                            profilePictureId: null,
                            ...action.data
                        }
                    },
                screens: [...state.screens, { userId: action.data.userId, index: state.screens.length + 1 }]
            }

        case UPDATE_CURRENT_FRIEND:
            return {
                ...state,
                profiles: state.profiles[action.data.userId]
                    ? { ...state.profiles, [action.data.userId]: { ...state.profiles[action.data.userId], ...action.data } }
                    : state.profiles
            };

        case GO_PREV_PROFILE: {
            return {
                ...state,
                profiles: state.screens.length === 1 ? {} : state.profiles,
                screens: state.screens.slice(0, state.screens.length - 1)
            }
        }

        default: return state
    }
}