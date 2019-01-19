import { LOGIN_RESPONSE, APP_NAV_MENU_VISIBILITY, UPDTAE_RIDE, CLEAR_RIDE, 
    DEVICE_GPS_STATE, UPDATE_WAYPOINT, CURRENT_USER, UPDATE_USER, TOGGLE_LOADER, SCREEN_CHANGE, UPDATE_RIDE_LIST, LOAD_RIDE, DELETE_RIDE } from './actionConstants';

export const toggleLoaderAction = (data) => (
    {
        type: TOGGLE_LOADER,
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