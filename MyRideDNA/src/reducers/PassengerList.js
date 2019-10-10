import { REPLACE_PASSENGER_LIST, ADD_PASSENGER_TO_LIST, REMOVE_PASSENGER_FROM_LIST, UPDATE_PASSENGER_IN_LIST, GET_PASSENGER_INFO, UPDATE_CURRENT_PASSENGER, RESET_CURRENT_PASSENGER } from "../actions/actionConstants";
import passengers from "../containers/passengers";

const initialState = {
    passengerList: [],
    currentPassenger : {
        passengerId:null
    }
};

export default (state = initialState, action) => {
    switch (action.type) {
        case REPLACE_PASSENGER_LIST:
            return {
                ...state,
                passengerList: action.data
            }
        case ADD_PASSENGER_TO_LIST:
            return {
                ...state,
                passengerList: [
                    ...state.passengerList,
                    action.data
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
                return {
                    ...state,
                    passengerList: [
                        ...state.passengerList.slice(0, passengerIndex),
                        action.data,
                        ...state.passengerList.slice(passengerIndex + 1)
                    ],
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
                const {profilePicture, ...otherPassengerKey} = passenger
                return {
                    ...state,
                    currentPassenger: {
                        passengerId:null,
                        ...otherPassengerKey
                    }
                }

        case UPDATE_CURRENT_PASSENGER:
            const psng = state.currentPassenger;
            psng['profilePicture'] = action.data.profilePicture 
            return {
                ...state,
                currentPassenger:{
                    passengerId:null,
                    ...psng
                }
            } 
            
        case RESET_CURRENT_PASSENGER:
            return {
                ...state,
                currentPassenger:{
                    passengerId:null
                }
            }    

        default: return state
    }
}