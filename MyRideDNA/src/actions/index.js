import {
    LOGIN_RESPONSE, APP_NAV_MENU_VISIBILITY, UPDTAE_RIDE, CLEAR_RIDE,
    DEVICE_GPS_STATE, UPDATE_WAYPOINT, CURRENT_USER, UPDATE_USER, TOGGLE_LOADER, SCREEN_CHANGE,
    UPDATE_RIDE_LIST, LOAD_RIDE, DELETE_RIDE, REPLACE_RIDE_LIST, UPDATE_EMAIL_STATUS, UPDATE_SIGNUP_RESULT, TOGGLE_NETWORK_STATUS, UPDATE_FRIEND_LIST, REPLACE_FRIEND_LIST, DELETE_FRIEND, UPDTAE_GARAGE_INFO, UPDTAE_GARAGE_NAME, UPDATE_BIKE_LIST, ADD_TO_BIKE_LIST, REPLACE_GARAGE_INFO, DELETE_BIKE_FROM_LIST, UPDATE_ACTIVE_BIKE
} from './actionConstants';

export const toggleLoaderAction = (data) => (
    {
        type: TOGGLE_LOADER,
        data: data
    }
);
export const toggleNetworkStatusAction = (data) => (
    {
        type: TOGGLE_NETWORK_STATUS,
        data: data
    }
);
export const loginAction = (data) => (
    {
        type: LOGIN_RESPONSE,
        data: data
    }
);
export const storeUserAction = (data) => (
    {
        type: CURRENT_USER,
        data: data
    }
);
export const updateSignupResultAction = (data) => (
    {
        type: UPDATE_SIGNUP_RESULT,
        data: data
    }
);
export const updateEmailStatusAction = (data) => (
    {
        type: UPDATE_EMAIL_STATUS,
        data: data
    }
);
export const updateUserAction = (data) => (
    {
        type: UPDATE_USER,
        data: data
    }
);
export const appNavMenuVisibilityAction = (data) => (
    {
        type: APP_NAV_MENU_VISIBILITY,
        data: data
    }
);
export const screenChangeAction = (data) => (
    {
        type: SCREEN_CHANGE,
        data: data
    }
);
export const replaceRideListAction = (data) => (
    {
        type: REPLACE_RIDE_LIST,
        data: data
    }
);
export const updateRideListAction = (data) => (
    {
        type: UPDATE_RIDE_LIST,
        data: data
    }
);
export const updateRideAction = (data) => (
    {
        type: UPDTAE_RIDE,
        data: data
    }
);
export const updateWaypointAction = (data) => (
    {
        type: UPDATE_WAYPOINT,
        data: data
    }
);
export const clearRideAction = (data) => (
    {
        type: CLEAR_RIDE,
        data: data
    }
);
export const loadRideAction = (data) => (
    {
        type: LOAD_RIDE,
        data: data
    }
);
export const deleteRideAction = (data) => (
    {
        type: DELETE_RIDE,
        data: data
    }
);
export const deviceLocationStateAction = (data) => (
    {
        type: DEVICE_GPS_STATE,
        data: data
    }
);
export const replaceGarageInfoAction = (data) => (
    {
        type: REPLACE_GARAGE_INFO,
        data: data
    }
);
export const updateGarageNameAction = (data) => (
    {
        type: UPDTAE_GARAGE_NAME,
        data: data
    }
);
export const addToBikeListAction = (data) => (
    {
        type: ADD_TO_BIKE_LIST,
        data: data
    }
);
export const deleteBikeFromListAction = (data) => (
    {
        type: DELETE_BIKE_FROM_LIST,
        data: data
    }
);
export const updateActiveBikeAction = (data) => (
    {
        type: UPDATE_ACTIVE_BIKE,
        data: data
    }
);
export const updateBikeListAction = (data) => (
    {
        type: UPDATE_BIKE_LIST,
        data: data
    }
);
export const updateFriendListAction = (data) => (
    {
        type: UPDATE_FRIEND_LIST,
        data: data
    }
);
export const replaceFriendListAction = (data) => (
    {
        type: REPLACE_FRIEND_LIST,
        data: data
    }
);
export const deleteFriendAction = (data) => (
    {
        type: DELETE_FRIEND,
        data: data
    }
);