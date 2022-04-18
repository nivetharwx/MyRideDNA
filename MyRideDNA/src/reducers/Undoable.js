import { UNDO, REDO, INIT_UNDO_REDO, UPDATE_SOURCE_OR_DESTINATION, UPDATE_WAYPOINT_NAME } from "../actions/actionConstants";

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
                }
                else if (newPresent.ride.isRecorded || present.ride.rideId === null || (present.ride.rideId !== newPresent.ride.rideId)) {
                    return {
                        past: [],
                        present: newPresent,
                        future: []
                    }
                } else if (action.type === UPDATE_SOURCE_OR_DESTINATION ||
                    action.type === UPDATE_WAYPOINT_NAME) {
                    return {
                        past: [...past],
                        present: newPresent,
                        future: [...future]
                    }
                }
                else {
                    if (action.data.isUndoable === false) {
                        // to update data of waypoint in past array
                        // to update data of waypoint in future array
                        return {
                            past: past.map((item) => {
                                if (action.data.source) {
                                    return {
                                        ...item, ride: { ...item.ride, source: { ...item.ride.source, description: action.data.source.description, name: action.data.source.name, pictureList: action.data.source.pictureList } }
                                    }
                                }
                                else if (action.data.destination) {
                                    return {
                                        ...item, ride: { ...item.ride, destination: { ...item.ride.destination, description: action.data.destination.description, name: action.data.destination.name, pictureList: action.data.destination.pictureList } }
                                    }
                                }
                                else if (action.data.updates) {
                                    return {
                                        ...item, ride: {
                                            ...item.ride, waypoints: item.ride.waypoints.map(point => {
                                                if (point.lng && point.lat && ((point.lng + "." + point.lat) === action.data.combinedCoordinates)) {
                                                    return { ...point, description: action.data.updates.description, name: action.data.updates.name, pictureList: action.data.updates.pictureList }
                                                }
                                                else {
                                                    return point
                                                }
                                            })
                                        }
                                    }
                                }
                                else return item
                            }),
                            present: newPresent,
                            future: future.map((item) => {
                                if (action.data.source) {
                                    return {
                                        ...item, ride: { ...item.ride, source: { ...item.ride.source, description: action.data.source.description, name: action.data.source.name, pictureList: action.data.source.pictureList } }
                                    }
                                }
                                else if (action.data.destination) {
                                    return {
                                        ...item, ride: { ...item.ride, destination: { ...item.ride.destination, description: action.data.destination.description, name: action.data.destination.name, pictureList: action.data.destination.pictureList } }
                                    }
                                }
                                else if (action.data.updates) {
                                    return {
                                        ...item, ride: {
                                            ...item.ride, waypoints: item.ride.waypoints.map(point => {
                                                if (point.lng && point.lat && ((point.lng + "." + point.lat) === action.data.combinedCoordinates)) {
                                                    return { ...point, description: action.data.updates.description, name: action.data.updates.name, pictureList: action.data.updates.pictureList }
                                                }
                                                else {
                                                    return point
                                                }
                                            })
                                        }
                                    }
                                }
                                else return item
                            })
                        }
                    }
                    else {
                        return {
                            past: [...past, present],
                            present: newPresent,
                            future: []
                        }
                    }
                }
        }
    }
}