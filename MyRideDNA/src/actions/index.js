import {
    LOGIN_RESPONSE, APP_NAV_MENU_VISIBILITY, UPDATE_RIDE, CLEAR_RIDE,
    DEVICE_GPS_STATE, UPDATE_WAYPOINT, CURRENT_USER, UPDATE_USER, TOGGLE_LOADER, SCREEN_CHANGE,
    UPDATE_SIGNUP_RESULT, TOGGLE_NETWORK_STATUS, UPDATE_FRIEND_LIST, REPLACE_FRIEND_LIST, DELETE_FRIEND, UPDATE_GARAGE_NAME, UPDATE_BIKE_LIST, ADD_TO_BIKE_LIST, REPLACE_GARAGE_INFO, DELETE_BIKE_FROM_LIST, UPDATE_ACTIVE_BIKE, REPLACE_SHORT_SPACE_LIST,
    REPLACE_SEARCH_RESULTS, CLEAR_SEARCH_RESULTS, UPDATE_RELATIONSHIP, UPDATE_IMAGE_INFO, ADD_FRIEND_GROUP_TO_LIST, REPLACE_FRIEND_GROUP_LIST, UPDATE_CURRENT_GROUP, RESET_CURRENT_GROUP, ADD_MEMBERS_TO_CURRENT_GROUP, RESET_MEMBERS_IN_CURRENT_GROUP,
    GET_GROUP_INFO, UPDATE_MEMBER_IN_CURRENT_GROUP, REMOVE_MEMBER_FROM_CURRENT_GROUP, REDO, UNDO, INIT_UNDO_REDO, ADD_WAYPOINT, DELETE_WAYPOINT, REMOVE_FRIEND_GROUP_FROM_LIST, UPDATE_PASSWORD_SUCCESS, UPDATE_PASSWORD_ERROR, RESET_PASSWORD_ERROR, GET_FRIEND_INFO, RESET_CURRENT_FRIEND, ADD_PASSENGER_TO_LIST,
    REMOVE_PASSENGER_FROM_LIST, REPLACE_PASSENGER_LIST, UPDATE_PASSENGER_IN_LIST, UPDATE_FRIEND_IN_LIST, UNFRIEND, UPDATE_FRIEND_REQUEST_RESPONSE, CLEAR_FRIEND_REQUEST_RESPONSE, UPDATE_ONLINE_STATUS, RESET_NOTIFICATION_LIST, UPDATE_NOTIFICATION_IN_LIST, CLEAR_NOTIFICATION_LIST, DELETE_NOTIFICATIONS_FROM_LIST,
    UPDATE_FRIEND_INVITATION_RESPONSE, CLEAR_FRIEND_INVITATION_RESPONSE, UPDATE_BIKE_PICTURE_LIST, REPLACE_FRIENDS_REQUEST_LIST, UPDATE_FRIEND_REQUEST_LIST, UPDATE_CURRENT_FRIEND, REPLACE_RIDE_LIST, UPDATE_RIDE_LIST, DELETE_RIDE, LOAD_RIDE, UPDATE_EMAIL_STATUS, UPDATE_SOURCE_OR_DESTINATION_NAME, UPDATE_WAYPOINT_NAME,
    UPDATE_CURRENT_FRIEND_GARAGE,
    REORDER_WAYPOINTS,
    REORDER_SOURCE,
    REORDER_DESTINATION,
    UPDATE_SHORT_SPACE_LIST
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
        type: UPDATE_RIDE,
        data: data
    }
);
export const addWaypointAction = (data) => (
    {
        type: ADD_WAYPOINT,
        data: data
    }
);
export const deleteWaypointAction = (data) => (
    {
        type: DELETE_WAYPOINT,
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
export const undoRideAction = (data) => (
    {
        type: UNDO,
        data: data
    }
);
export const redoRideAction = (data) => (
    {
        type: REDO,
        data: data
    }
);
export const initUndoRedoRideAction = (data) => (
    {
        type: INIT_UNDO_REDO,
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
export const replaceShortSpaceListAction = (data) => (
    {
        type: REPLACE_SHORT_SPACE_LIST,
        data: data
    }
);
export const updateGarageNameAction = (data) => (
    {
        type: UPDATE_GARAGE_NAME,
        data: data
    }
);
export const updateShortSpaceListAction = (data) => (
    {
        type: UPDATE_SHORT_SPACE_LIST,
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
export const updateBikePictureListAction = (data) => (
    {
        type: UPDATE_BIKE_PICTURE_LIST,
        data: data
    }
);
export const updateFriendListAction = (data) => (
    {
        type: UPDATE_FRIEND_LIST,
        data: data
    }
);
export const updateOnlineStatusAction = (data) => (
    {
        type: UPDATE_ONLINE_STATUS,
        data: data
    }
);
export const doUnfriendAction = (data) => (
    {
        type: UNFRIEND,
        data: data
    }
);
export const replaceSearchFriendListAction = (data) => (
    {
        type: REPLACE_SEARCH_RESULTS,
        data: data
    }
);
export const updateRelationshipAction = (data) => (
    {
        type: UPDATE_RELATIONSHIP,
        data: data
    }
);
export const replaceFriendRequestListAction = (data) => (
    {
        type: REPLACE_FRIENDS_REQUEST_LIST,
        data: data
    }
)

export const updateFriendRequestListAction = (data) => (
    {
        type: UPDATE_FRIEND_REQUEST_LIST,
        data: data
    }
)
export const clearSearchFriendListAction = (data) => (
    {
        type: CLEAR_SEARCH_RESULTS,
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
export const openFriendProfileAction = (data) => (
    {
        type: UPDATE_IMAGE_INFO,
        data: data
    }
);
export const updateFriendInListAction = (data) => (
    {
        type: UPDATE_FRIEND_IN_LIST,
        data: data
    }
);
export const getFriendsInfoAction = (data) => (
    {
        type: GET_FRIEND_INFO,
        data: data
    }
);
export const resetCurrentFriendAction = (data) => (
    {
        type: RESET_CURRENT_FRIEND,
        data: data
    }
);
export const updateCurrentFriendAction = (data) => (
    {
        type: UPDATE_CURRENT_FRIEND,
        data: data
    }
);

export const updateCurrentFriendGarageAction = (data) => (
    {
        type: UPDATE_CURRENT_FRIEND_GARAGE,
        data: data
    }
)
export const replaceFriendGroupListAction = (data) => (
    {
        type: REPLACE_FRIEND_GROUP_LIST,
        data: data
    }
);
export const createFriendGroupAction = (data) => (
    {
        type: ADD_FRIEND_GROUP_TO_LIST,
        data: data
    }
);
export const removeFriendGroupAction = (data) => (
    {
        type: REMOVE_FRIEND_GROUP_FROM_LIST,
        data: data
    }
);
export const updateFriendRequestResponseAction = (data) => (
    {
        type: UPDATE_FRIEND_REQUEST_RESPONSE,
        data: data
    }
);
export const resetFriendRequestResponseAction = (data) => (
    {
        type: CLEAR_FRIEND_REQUEST_RESPONSE,
        data: data
    }
);
export const updateInvitationResponseAction = (data) => (
    {
        type: UPDATE_FRIEND_INVITATION_RESPONSE,
        data: data
    }
);
export const resetInvitationResponseAction = (data) => (
    {
        type: CLEAR_FRIEND_INVITATION_RESPONSE,
        data: data
    }
);
export const resetCurrentGroupAction = (data) => (
    {
        type: RESET_CURRENT_GROUP,
        data: data
    }
);
export const updateCurrentGroupAction = (data) => (
    {
        type: UPDATE_CURRENT_GROUP,
        data: data
    }
);
export const addMembersToCurrentGroupAction = (data) => (
    {
        type: ADD_MEMBERS_TO_CURRENT_GROUP,
        data: data
    }
);
export const resetMembersFromCurrentGroupAction = (data) => (
    {
        type: RESET_MEMBERS_IN_CURRENT_GROUP,
        data: data
    }
);
export const updateMemberAction = (data) => (
    {
        type: UPDATE_MEMBER_IN_CURRENT_GROUP,
        data: data
    }
);
export const removeMemberAction = (data) => (
    {
        type: REMOVE_MEMBER_FROM_CURRENT_GROUP,
        data: data
    }
);
export const getGroupInfoAction = (data) => (
    {
        type: GET_GROUP_INFO,
        data: data
    }
);
export const updatePasswordSuccessAction = (data) => (
    {
        type: UPDATE_PASSWORD_SUCCESS,
        data: data
    }
);
export const updatePasswordErrorAction = (data) => (
    {
        type: UPDATE_PASSWORD_ERROR,
        data: data
    }
);
export const resetPasswordErrorAction = (data) => (
    {
        type: RESET_PASSWORD_ERROR,
        data: data
    }
);
export const replacePassengerListAction = (data) => (
    {
        type: REPLACE_PASSENGER_LIST,
        data: data
    }
);
export const addToPassengerListAction = (data) => (
    {
        type: ADD_PASSENGER_TO_LIST,
        data: data
    }
);
export const updatePassengerInListAction = (data) => (
    {
        type: UPDATE_PASSENGER_IN_LIST,
        data: data
    }
);
export const removeFromPassengerListAction = (data) => (
    {
        type: REMOVE_PASSENGER_FROM_LIST,
        data: data
    }
);
export const resetNotificationListAction = (data) => (
    {
        type: RESET_NOTIFICATION_LIST,
        data: data
    }
);
export const updateNotificationAction = (data) => (
    {
        type: UPDATE_NOTIFICATION_IN_LIST,
        data: data
    }
);
export const deleteNotificationsAction = (data) => (
    {
        type: DELETE_NOTIFICATIONS_FROM_LIST,
        data: data
    }
);
export const clearNotificationListAction = (data) => (
    {
        type: CLEAR_NOTIFICATION_LIST,
        data: data
    }
);
export const updateSourceOrDestinationNameAction = (data) => (
    {
        type: UPDATE_SOURCE_OR_DESTINATION_NAME,
        data: data
    }
);
export const updateWaypointNameAction = (data) => (
    {
        type: UPDATE_WAYPOINT_NAME,
        data: data
    }
);
export const reorderRideSourceAction = (data) => (
    {
        type: REORDER_SOURCE,
        data: data
    }
);
export const reorderRideDestinationAction = (data) => (
    {
        type: REORDER_DESTINATION,
        data: data
    }
);
export const reorderRideWaypointsAction = (data) => (
    {
        type: REORDER_WAYPOINTS,
        data: data
    }
);