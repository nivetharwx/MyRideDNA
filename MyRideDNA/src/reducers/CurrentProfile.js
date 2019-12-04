import { SET_CURRENT_FRIEND, UPDATE_CURRENT_FRIEND, RESET_PERSON_PROFILE, UPDATE_CURRENT_FRIEND_GARAGE, UPDATE_PICTURES, UPDATE_FRIENDS_RIDE_SNAPSHOT, GO_PREV_PROFILE } from "../actions/actionConstants";
import { PageKeys } from "../constants";
import { undoable } from "./Undoable";

const initialState = {
    prevProfiles: [],
    person: {
        isFriend: false,
        garage: {
            garageId: null
        },
        userId: null,
        rideList: [],
        homeAddress: {},
        passengerList: [],
        friendList: [],
    },
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_CURRENT_FRIEND:
            return {
                ...state,
                prevProfiles: state.person.userId === null
                    ? state.prevProfiles
                    : [...state.prevProfiles, state.person],
                person: {
                    isFriend: false,
                    garage: {
                        garageId: null
                    },
                    rideList: [],
                    homeAddress: {},
                    passengerList: [],
                    friendList: [],
                    ...action.data
                }
            };

        case UPDATE_CURRENT_FRIEND:
            if (state.person.userId === null || (action.data.userId !== state.person.userId)) return state;
            return {
                ...state,
                person: {
                    ...state.person,
                    ...action.data
                }
            };

        case UPDATE_PICTURES:
            if (action.data.type === 'roadBuddies') {
                return {
                    ...state,
                    person: {
                        ...state.person,
                        friendList: state.person.friendList.map(frnd => {
                            if (!frnd.profilePictureId) return frnd;
                            if (typeof action.data.pictureObj[frnd.profilePictureId] === 'string') {
                                return { ...frnd, profilePicture: action.data.pictureObj[frnd.profilePictureId] };
                            }
                            return frnd;
                        })
                    }
                };
            }
            if (action.data.type === 'passenger') {
                return {
                    ...state,
                    person: {
                        ...state.person,
                        passengerList: state.person.passengerList.map(pass => {
                            if (!pass.profilePictureId) return pass;
                            if (typeof action.data.pictureObj[pass.profilePictureId] === 'string') {
                                return { ...pass, profilePicture: action.data.pictureObj[pass.profilePictureId] };
                            }
                            return pass;
                        })
                    }
                };
            }
            if (action.data.type === 'album') {
                return {
                    ...state,
                    person: {
                        ...state.person,
                        pictures: state.person.pictures.map(pic => {
                            if (!pic.id) return pic;
                            if (typeof action.data.pictureObj[pic.id] === 'string') {
                                return { ...pic, data: action.data.pictureObj[pic.id] };
                            }
                            return pic;
                        })
                    }
                };
            }

        case RESET_PERSON_PROFILE:
            if (action.data && action.data.comingFrom === PageKeys.NOTIFICATIONS) {
                return {
                    ...state,
                    prevProfiles: [],
                    person: {
                        garage: {
                            garageId: null
                        },
                        userId: null,
                        rideList: [],
                        homeAddress: {},
                        passengerList: [],
                        friendList: []
                    }
                }
            }
            else {
                return {
                    ...state,
                    prevProfiles: [],
                    person: {
                        garage: {
                            garageId: null
                        },
                        ...state.person,
                        userId: null,
                        rideList: [],
                        homeAddress: {},
                        passengerList: [],
                        friendList: []
                    }
                }
            }

        case GO_PREV_PROFILE: {
            const prevPerson = { ...state.prevProfiles[state.prevProfiles.length - 1] };
            return {
                ...state,
                prevProfiles: [...state.prevProfiles.slice(0, -1)],
                person: prevPerson
            }
        }

        case UPDATE_CURRENT_FRIEND_GARAGE:
            if ((state.person.userId === null) || (action.data.userId !== state.person.userId)) return state;
            let idx = state.person.garage.spaceList.findIndex((garageSpaceList) => garageSpaceList.spaceId === action.data.spaceId)
            if (idx > -1) {
                const bike = state.person.garage.spaceList[idx];
                bike.profilePicture = action.data.profilePicture;
                return {
                    ...state,
                    person: {
                        ...state.person,
                        garage: {
                            ...state.person.garage,
                            spaceList: [
                                ...state.person.garage.spaceList.slice(0, idx),
                                bike,
                                ...state.person.garage.spaceList.slice(idx + 1)
                            ]
                        }
                    }
                }
            }
            return state;

        case UPDATE_FRIENDS_RIDE_SNAPSHOT:
            if (state.person.userId === null || (action.data.userId !== state.person.userId)) return state;
            updatedRideList = state.person.rideList.map(ride => {
                if (!ride.snapshotId) return ride;
                let id = ride.snapshotId.replace(THUMBNAIL_TAIL_TAG, RIDE_TAIL_TAG);
                if (typeof action.data.pictureObject[id] === 'string') {
                    return { ...ride, snapshot: action.data.pictureObject[id] };
                }
                return ride;
            });
            return { ...state, person: { ...state.person, rideList: updatedRideList } };

        default: return state
    }
}