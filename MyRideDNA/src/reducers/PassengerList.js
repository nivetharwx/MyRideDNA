import { REPLACE_PASSENGER_LIST, ADD_PASSENGER_TO_LIST, REMOVE_PASSENGER_FROM_LIST, UPDATE_PASSENGER_IN_LIST } from "../actions/actionConstants";

const initialState = {
    passengerList: [],
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
            const passengerIndex = state.passengerList.findIndex(passenger => passenger.passengerId === action.data.passengerId);
            return {
                ...state,
                passengerList: [
                    ...state.passengerList.slice(0, passengerIndex),
                    { ...state.passengerList[passengerIndex], ...action.data },
                    ...state.passengerList.slice(passengerIndex + 1)
                ],
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
        default: return state
    }
}