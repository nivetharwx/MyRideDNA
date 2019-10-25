import { REPLACE_PASSENGER_LIST, ADD_PASSENGER_TO_LIST, REMOVE_PASSENGER_FROM_LIST, UPDATE_PASSENGER_IN_LIST, GET_PASSENGER_INFO, UPDATE_CURRENT_PASSENGER, RESET_CURRENT_PASSENGER, REPLACE_COMMUNITY_LIST, UPDATE_COMMUNITY_LIST, RESET_COMMUNITY_LIST } from "../actions/actionConstants";
import passengers from "../containers/passengers";
import { Actions } from "react-native-router-flux";

const initialState = {
    passengerList: [],
    currentPassenger: {
        passengerId: null
    },
    communityList: [],
};

export default (state = initialState, action) => {
    switch (action.type) {
        case REPLACE_PASSENGER_LIST:
            if (action.data.pageNumber === 0) {
                return {
                    ...state,
                    passengerList: action.data.passengerList
                }
            }
            else {
                return {
                    ...state,
                    passengerList: [...state.passengerList, ...action.data.passengerList]
                }
            }
        case ADD_PASSENGER_TO_LIST:
            return {
                ...state,
                passengerList: [
                    action.data,
                    ...state.passengerList,
                ]
            }
        case UPDATE_PASSENGER_IN_LIST:
            if (action.data.pictureObj) {
                let updatedPassengerList = state.passengerList.map(item => {
                    if (!item.profilePictureId) return item;
                    if (typeof action.data.pictureObj[item.profilePictureId] === 'string') {
                        return { ...item, profilePicture: action.data.pictureObj[item.profilePictureId] }
                    }
                    return item;
                })
                return {
                    ...state,
                    passengerList: updatedPassengerList
                }
            }
            else {
                // const passengerIndex = state.passengerList.findIndex(passenger => passenger.passengerId === action.data.passengerId);
                // return {
                //     ...state,
                //     passengerList: [
                //         ...state.passengerList.slice(0, passengerIndex),
                //         { ...state.passengerList[passengerIndex], ...action.data },
                //         ...state.passengerList.slice(passengerIndex + 1)
                //     ],
                // }
                const passengerIndex = state.passengerList.findIndex(passenger => passenger.passengerId === action.data.passengerId);
                if (state.currentPassenger.passengerId !== null && state.currentPassenger.passengerId === action.data.passengerId) {
                    const updatedCurrentPassenger = action.data
                    return {
                        ...state,
                        passengerList: [
                            ...state.passengerList.slice(0, passengerIndex),
                            action.data,
                            ...state.passengerList.slice(passengerIndex + 1)
                        ],
                        currentPassenger: updatedCurrentPassenger
                    }
                }
                else {
                    return {
                        ...state,
                        passengerList: [
                            ...state.passengerList.slice(0, passengerIndex),
                            action.data,
                            ...state.passengerList.slice(passengerIndex + 1)
                        ]
                    }
                }

            }

        case REMOVE_PASSENGER_FROM_LIST:
            const passengerIdx = state.passengerList.findIndex(passenger => passenger.passengerId === action.data);
            return {
                ...state,
                passengerList: [
                    ...state.passengerList.slice(0, passengerIdx),
                    ...state.passengerList.slice(passengerIdx + 1)
                ],
            }

        case GET_PASSENGER_INFO:
            const passenger = state.passengerList[action.data]
            const { profilePicture, ...otherPassengerKey } = passenger
            return {
                ...state,
                currentPassenger: {
                    passengerId: null,
                    ...otherPassengerKey
                }
            }

        case UPDATE_CURRENT_PASSENGER:
            const psng = state.currentPassenger;
            psng['profilePicture'] = action.data.profilePicture
            return {
                ...state,
                currentPassenger: {
                    passengerId: null,
                    ...psng
                }
            }

        case RESET_CURRENT_PASSENGER:
            return {
                ...state,
                currentPassenger: {
                    passengerId: null
                }
            }

        case REPLACE_COMMUNITY_LIST:
            if (action.data.pageNumber === 0) {
                return {
                    ...state,
                    communityList: action.data.communityList
                }
            }
            else {
                return {
                    ...state,
                    communityList: [...state.communityList, ...action.data.communityList]
                }
            }

        case UPDATE_COMMUNITY_LIST:
            if (action.data.pictureObj) {
                let updatedCommunityList = state.communityList.map(item => {
                    if (!item.profilePictureId) return item;
                    if (typeof action.data.pictureObj[item.profilePictureId] === 'string') {
                        return { ...item, profilePicture: action.data.pictureObj[item.profilePictureId] }
                    }
                    return item;
                })
                return {
                    ...state,
                    communityList: updatedCommunityList
                }
            }
            else {
                const communityIndex = state.communityList.findIndex(item => item.userId === action.data.userId)
                updatedCommnuity = state.communityList[communityIndex];
                console.log('updatedCommnuity : ', updatedCommnuity)
                updatedCommnuity.isPassenger = true
                return {
                    ...state,
                    communityList: [
                        ...state.communityList.slice(0, communityIndex),
                        updatedCommnuity,
                        ...state.communityList.slice(communityIndex + 1),
                    ]
                }
            }
        case RESET_COMMUNITY_LIST:
            return {
                ...state,
                communityList: []
            }
        default: return state
    }
}