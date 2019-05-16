import { UPDATE_RIDE_LIST, CLEAR_RIDE_LIST, DELETE_RIDE, REPLACE_RIDE_LIST, UPDATE_RIDE_SNAPSHOT, UPDATE_RIDE_CREATOR_PICTURE } from "../actions/actionConstants";
import { RIDE_TYPE, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG } from "../constants";

const initialState = {
    buildRides: [],
    recordedRides: [],
    sharedRides: []
};

export default (state = initialState, action) => {
    const updatedState = { ...state };
    switch (action.type) {

        case REPLACE_RIDE_LIST:
            var rideKey = getRideListByType(action.data.rideType);
            updatedState[rideKey] = [...action.data.rideList];
            return updatedState;

        case UPDATE_RIDE_LIST:
            var rideKey = getRideListByType(action.data.rideType);
            updatedState[rideKey] = typeof action.data.index === 'number' && action.data.index >= 0
                ? [...state[rideKey].slice(0, action.data.index), ...action.data.rideList, ...state[rideKey].slice(action.data.index + 1)]
                : [...state[rideKey], ...action.data.rideList]
            return updatedState;

        case UPDATE_RIDE_SNAPSHOT:
            var rideKey = getRideListByType(action.data.rideType);
            updatedState[rideKey] = updatedState[rideKey].map(ride => {
                if (!ride.snapshotId) return ride;
                let id = ride.snapshotId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG);
                if (typeof action.data.pictureObject[id] === 'string') {
                    return { ...ride, snapshot: action.data.pictureObject[id] };
                }
                return ride;
            });
            return updatedState;

        case UPDATE_RIDE_CREATOR_PICTURE:
            // var rideKey = getRideListByType(action.data.rideType);
            // const rideIndex = updatedState[rideKey].findIndex(ride => ride.rideId === action.data.rideId);
            // updatedState[rideKey] = rideIndex >= 0
            //     ? [...state[rideKey].slice(0, rideIndex), { ...state[rideKey][rideIndex], creatorProfilePicture: action.data.picture }, ...state[rideKey].slice(rideIndex + 1)]
            //     : [...state[rideKey], ...action.data.rideList]
            // return updatedState;
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
            var rideKey = getRideListByType(action.data.rideType);
            updatedState[rideKey] = [...state[rideKey].slice(0, action.data.index), ...state[rideKey].slice(action.data.index + 1)];
            return updatedState;

        case CLEAR_RIDE_LIST:
            var rideKey = getRideListByType(action.data.rideType);
            updatedState[rideKey] = [];
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
    }
}