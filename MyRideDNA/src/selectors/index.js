import { createSelector } from 'reselect';
import { RIDE_TYPE, POST_TYPE } from '../constants';

const getPassenger = ({ PassengerList, FriendsProfiles }, { onPassenger }) => onPassenger ? PassengerList.passengerList : FriendsProfiles.profiles[FriendsProfiles.screens.slice(-1)[0].userId].passengerList;
const getCurrentPassengerId = (undefined, { passengerId }) => passengerId;

const getRideList = ({ RideList }, { rideType }) => rideType === RIDE_TYPE.BUILD_RIDE ? RideList.buildRides : rideType === RIDE_TYPE.RECORD_RIDE ? RideList.recordedRides : rideType === RIDE_TYPE.SHARED_RIDE ? RideList.sharedRides : RideList.publicRides;
const getRideId = (undefined, { rideId }) => rideId;
const getRideType = (undefined, { rideType }) => rideType;

const getLoggedRideList = ({ GarageInfo }) => GarageInfo.currentBike.loggedRides ? GarageInfo.currentBike.loggedRides : null;
const getLoggedRideId = (undefined, { rideId }) => rideId;

const getPosts = ({ Journal }) => Journal.journal;
const getPostId = (undefined, { postId }) => postId;

const getProfiles = ({ FriendsProfiles }) => FriendsProfiles.profiles;
const getFriendId = (undefined, props) => props.frienduserId || props.notificationBody.fromUserId;

export const getCurrentPassengerState = createSelector(
    [getPassenger, getCurrentPassengerId],
    (passengers, psngId) => {
        let currentPassengerIndex = -1;
        const passenger = passengers.find(({ passengerId }, index) => {
            if (passengerId === psngId) {
                currentPassengerIndex = index;
                return true;
            }
            return false;
        });
        return { ...passenger, currentPassengerIndex };
    }
);
export const getCurrentRideState = createSelector(
    [getRideList, getRideId, getRideType],
    (rides, id, rideType) => {
        let currentRideIndex = -1;
        const ride = rides.find(({ rideId }, index) => {
            if (rideId === id) {
                currentRideIndex = index;
                return true;
            }
            return false;
        });
        return { ...ride, rideType, currentRideIndex };
    }
);
export const getCurrentLoggedRideState = createSelector(
    [getLoggedRideList, getLoggedRideId],
    (rides, id) => {
        if (!rides) return null;
        let currentLoggedRideIndex = -1;
        const ride = rides.find(({ rideId }, index) => {
            if (rideId === id) {
                currentLoggedRideIndex = index;
                return true;
            }
            return false;
        });
        return { ...ride, currentLoggedRideIndex };
    }
);
export const getCurrentPostState = createSelector(
    [getPosts, getPostId],
    (posts, postId) => {
        let currentPostIndex = -1;
        let post = null;
        if (posts && posts.length > 0) {
            post = posts.find(({ id }, index) => {
                if (id === postId) {
                    currentPostIndex = index;
                    return true;
                }
                return false;
            });
        }
        return currentPostIndex > -1 ? { ...post, currentPostIndex } : null;
    }
);
export const getCurrentProfileState = createSelector(
    [getProfiles, getFriendId],
    (profiles, friendId) => profiles[friendId] || null
);

