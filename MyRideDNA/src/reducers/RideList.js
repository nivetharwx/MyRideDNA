import { UPDATE_RIDE_LIST, CLEAR_RIDE_LIST, DELETE_RIDE, REPLACE_RIDE_LIST, UPDATE_RIDE_SNAPSHOT, UPDATE_RIDE_CREATOR_PICTURE, UPDATE_RIDE_IN_LIST, IS_REMOVED, DELETE_UNSYNCED_RIDE, REPLACE_UNSYNCED_RIDES, ADD_UNSYNCED_RIDE, UPDATE_PUBLIC_RIDES, CLEAR_PUBLIC_RIDES, UPDATE_RIDE_LIKE_AND_COMMENT_COUNT } from "../actions/actionConstants";
import { RIDE_TYPE, THUMBNAIL_TAIL_TAG, RIDE_TAIL_TAG, UNSYNCED_RIDE } from "../constants";

const initialState = {
    buildRides: [],
    recordedRides: [],
    sharedRides: [],
    isRemoved: false,
    unsyncedRides: [],
    publicRides: [],
    rideComments: null,
};

export default (state = initialState, action) => {
    const updatedState = { ...state };
    switch (action.type) {
        case REPLACE_RIDE_LIST:
            var rideKey = getRideListByType(action.data.rideType);
            const rideList = action.data.rideList.map(ride => {
                return state.unsyncedRides.indexOf(`${UNSYNCED_RIDE}${ride.rideId}`) > -1
                    ? { ...ride, unsynced: true } : ride;
            });
            updatedState[rideKey] = action.data.appendToList ? [...updatedState[rideKey], ...rideList] : rideList;
            return updatedState;

        case UPDATE_RIDE_LIST:
            var rideKey = getRideListByType(action.data.rideType);
            updatedState[rideKey] = [...action.data.rideList, ...state[rideKey]]
            return updatedState;

        case REPLACE_UNSYNCED_RIDES:
            return { ...state, unsyncedRides: action.data };

        case ADD_UNSYNCED_RIDE:
            updatedState.recordedRides = state.recordedRides.map(ride => {
                if (ride.rideId === action.data) {
                    return { ...ride, unsynced: true };
                }
                return ride;
            });
            updatedState.unsyncedRides = [...updatedState.unsyncedRides, `${UNSYNCED_RIDE}${action.data}`];
            return updatedState;

        case DELETE_UNSYNCED_RIDE:
            updatedState.recordedRides = state.recordedRides.map(ride => {
                return ride.rideId === action.data ? { ...ride, unsynced: false } : ride;
            });
            const keyIdx = state.unsyncedRides.indexOf(`${UNSYNCED_RIDE}${action.data}`);
            if (keyIdx > -1) {
                return {
                    ...updatedState,
                    unsyncedRides: [...state.unsyncedRides.slice(0, keyIdx), ...state.unsyncedRides.slice(keyIdx + 1)]
                }
            }
            return updatedState;

        case UPDATE_RIDE_SNAPSHOT:
            var rideKey = getRideListByType(action.data.rideType);
            updatedState[rideKey] = updatedState[rideKey].map(ride => {
                return ride.rideId === action.data.rideId
                ?{...ride,snapshotId:action.data.snapshotId}
                :ride
            });
            return updatedState;

        case UPDATE_RIDE_IN_LIST:
            var rideKey = getRideListByType(action.data.rideType);
            updatedState[rideKey] = updatedState[rideKey].map(ride => {
                if (ride.rideId === action.data.ride.rideId) {
                    return { ...ride, ...action.data.ride };
                }
                return ride;
            });
            return updatedState;

        case UPDATE_RIDE_CREATOR_PICTURE:
            var rideKey = getRideListByType(action.data.rideType);
            updatedState[rideKey] = updatedState[rideKey].map(ride => {
                if (!ride.creatorProfilePictureId) return ride;
                if (typeof action.data.pictureObject[ride.creatorProfilePictureId] === 'string') {
                    return { ...ride, creatorProfilePicture: action.data.pictureObject[ride.creatorProfilePictureId] };
                }
                return ride;
            });
            return updatedState;

        case DELETE_RIDE:
            const rideType = getRideListByType(action.data.rideType);
            const rideIndex = state[rideType].findIndex(ride => ride.rideId === action.data.rideId);
            if (rideType === 'recordedRides') {
                const unsyncedKeyIdx = updatedState.unsyncedRides.indexOf(`${UNSYNCED_RIDE}${state.recordedRides[rideIndex].rideId}`);
                if (unsyncedKeyIdx > -1) {
                    updatedState.unsyncedRides = [...updatedState.unsyncedRides.slice(0, unsyncedKeyIdx), ...updatedState.unsyncedRides.slice(unsyncedKeyIdx + 1)];
                }
            }
            updatedState[rideType] = [...state[rideType].slice(0, rideIndex), ...state[rideType].slice(rideIndex + 1)];
            return updatedState;

        case CLEAR_RIDE_LIST:
            var rideKey = getRideListByType(action.data.rideType);
            updatedState[rideKey] = [];
            return updatedState;


        case IS_REMOVED:
            return {
                ...state,
                isRemoved: action.data
            }

        case UPDATE_PUBLIC_RIDES:
            return {
                ...state,
                publicRides: action.data.reset ?
                    action.data.rides
                    : [...state.publicRides, ...action.data.rides]
            }

        case CLEAR_PUBLIC_RIDES:
            return {
                ...state,
                publicRides: []
            }
        case UPDATE_RIDE_LIKE_AND_COMMENT_COUNT:
            var rideKey = getRideListByType(action.data.rideType);
            if (updatedState[rideKey].length === 0) return state;
            updatedState[rideKey] = updatedState[rideKey].map(ride => {
                return ride.rideId === action.data.rideId
                    ? action.data.isUpdateLike
                        ? { ...ride, numberOfLikes: ride.numberOfLikes + (action.data.isAdded ? 1 : -1), isLiked: (action.data.isLiked ? (action.data.isAdded ? true : false) : ride.isLiked) }
                        : { ...ride, numberOfComments: action.data.numberOfComments ? action.data.numberOfComments : (ride.numberOfComments + (action.data.isAdded ? 1 : -1)) }
                    : ride;
            });
            return updatedState;

        default: return state
    }
}

const getRideListByType = (rideType) => {
    switch (rideType) {
        case RIDE_TYPE.BUILD_RIDE:
            return 'buildRides'
        case RIDE_TYPE.RECORD_RIDE:
            return 'recordedRides'
        case RIDE_TYPE.SHARED_RIDE:
            return 'sharedRides'
        case RIDE_TYPE.PUBLIC_RIDE:
            return 'publicRides'
    }
}