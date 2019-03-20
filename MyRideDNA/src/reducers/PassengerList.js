import { REPLACE_PASSENGER_LIST, ADD_PASSENGER_TO_LIST, REMOVE_PASSENGER_FROM_LIST } from "../actions/actionConstants";

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
        case REMOVE_PASSENGER_FROM_LIST:
            const passengerIdx = state.passengerList.findIndex(passenger => passenger.userId === action.data);
            return {
                ...state,
                friendGroupList: [
                    ...state.passengerList.slice(0, passengerIdx),
                    ...state.passengerList.slice(passengerIdx + 1)
                ],
            }
        default: return state
    }
}