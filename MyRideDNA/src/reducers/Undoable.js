import { UNDO, REDO, INIT_UNDO_REDO, UPDATE_SOURCE_OR_DESTINATION_NAME, UPDATE_WAYPOINT_NAME } from "../actions/actionConstants";

export function undoable(reducer) {
    // Call the reducer with empty action to populate the initial state
    const initialState = {
        past: [],
        present: reducer(undefined, {}),
        future: [],
    }

    // Return a reducer that handles undo and redo
    return function (state = initialState, action) {
        const { past, present, future } = state

        switch (action.type) {
            case UNDO:
                const previous = past[past.length - 1]
                const newPast = past.slice(0, past.length - 1)
                return {
                    past: newPast,
                    present: previous,
                    future: [present, ...future]
                }
            case REDO:
                const next = future[0]
                const newFuture = future.slice(1)
                return {
                    past: [...past, present],
                    present: next,
                    future: newFuture
                }
            case INIT_UNDO_REDO:
                return initialState;
            default:
                // Delegate handling the action to the passed reducer
                const newPresent = reducer(present, action)
                if (present === newPresent) {
                    return state
                } else if (present.ride.rideId === null && newPresent.ride.rideId !== null) {
                    return {
                        past: [],
                        present: newPresent,
                        future: []
                    }
                } else if (action.type === UPDATE_SOURCE_OR_DESTINATION_NAME ||
                    action.type === UPDATE_WAYPOINT_NAME) {
                    return {
                        past: [...past],
                        present: newPresent,
                        future: [...future]
                    }
                }
                return {
                    past: [...past, present],
                    present: newPresent,
                    future: []
                }
        }
    }
}