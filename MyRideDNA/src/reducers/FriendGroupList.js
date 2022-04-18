import { REPLACE_FRIEND_GROUP_LIST, ADD_FRIEND_GROUP_TO_LIST, UPDATE_CURRENT_GROUP, RESET_CURRENT_GROUP, RESET_MEMBERS_FROM_CURRENT_GROUP, RESET_MEMBERS_IN_CURRENT_GROUP, REMOVE_FRIEND_GROUP_FROM_LIST, HIDE_MEMBERS_LOCATION, ADD_MEMBERS_LOCATION, UPDATE_MEMBERS_LOCATION, UPDATE_GROUPS_LOCATION, CLEAR_GROUP_SEARCH_RESULTS, REPLACE_GROUP_SEARCH_RESULTS, UPDATE_FRIEND_GROUP_LIST, UPDATE_FAVOURITE_FRIEND_GROUP_LIST, REMOVE_TEMP_MEMBERS_LOCATION, UPDATE_GROUP_MEMBERS } from "../actions/actionConstants";
import { Actions } from "react-native-router-flux";

const initialState = {
    friendGroupList: [],
    currentGroup: { groupMembers: [] },
    searchGroup: [],
    membersLocationList: { activeLength: 0 }
};

export default (state = initialState, action) => {
    switch (action.type) {
        case REPLACE_FRIEND_GROUP_LIST:
            if (action.data.pageNumber === 0) {
                return {
                    ...state,
                    friendGroupList: action.data.groupList,
                    currentGroup: { groupMembers: [] }
                }
            } else {
                return {
                    ...state,
                    friendGroupList: [
                        ...state.friendGroupList,
                        ...action.data.groupList
                    ],
                    currentGroup: { groupMembers: [] }
                }
            }

        case ADD_FRIEND_GROUP_TO_LIST:
            if (!action.data.groupMembers) action.data.groupMembers = [];
            return {
                ...state,
                friendGroupList: [
                    action.data,
                    ...state.friendGroupList,
                ]
            }
        case REMOVE_FRIEND_GROUP_FROM_LIST:
            return {
                ...state,
                friendGroupList: state.friendGroupList.filter(group => group.groupId !== action.data),
                currentGroup: state.currentGroup && state.currentGroup.groupId === action.data ? { groupMembers: [] } : state.currentGroup
            }
        case UPDATE_FRIEND_GROUP_LIST:
            return {
                ...state,
                friendGroupList: state.friendGroupList.map(group => {
                    if (action.data[group.groupId]) return { ...group, locationEnable: action.data[group.groupId] }
                    return group
                })
            }

        case RESET_CURRENT_GROUP:
            return {
                ...state,
                currentGroup: { groupMembers: [] }
            }
        case UPDATE_CURRENT_GROUP:
            let updatedCurrentGroup = { ...state.currentGroup, ...action.data.otherDetail };
            if (action.data.deletedmembers) {
                updatedCurrentGroup = {
                    ...updatedCurrentGroup,
                    groupMembers: updatedCurrentGroup.groupMembers.filter(item => action.data.deletedmembers.indexOf(item.memberId) === -1)
                }
            }
            if (action.data.addMembers) {
                updatedCurrentGroup = {
                    ...updatedCurrentGroup,
                    groupMembers: [...updatedCurrentGroup.groupMembers, ...action.data.addMembers]
                }
            }
            return {
                ...state,
                currentGroup: updatedCurrentGroup,
                friendGroupList: state.friendGroupList.map(group => {
                    return group.groupId === action.data.otherDetail.groupId ?
                        { ...group, ...action.data.otherDetail }
                        : group
                })
            }

        case UPDATE_GROUP_MEMBERS:
            return {
                ...state,
                currentGroup: {
                    ...state.currentGroup,
                    groupMembers: state.currentGroup.groupMembers.map(item => {
                        if (item.memberId === action.data.memberId) {
                            return { ...item, relationship: action.data.relationship }
                        }
                        else {
                            return item;
                        }
                    })
                }
            }
        case RESET_MEMBERS_IN_CURRENT_GROUP:
            if (action.data.pageNumber === 0) {
                if (state.friendGroupList.length > 0) {
                    return {
                        ...state,
                        currentGroup: {
                            ...state.friendGroupList.filter(group => group.groupId === action.data.groupId)[0],
                            groupMembers: action.data.members
                        }
                    }
                }
                else {
                    return {
                        ...state,
                        currentGroup: { ...action.data, groupMembers: action.data.members }
                    }
                }

            }
            else {
                return {
                    ...state,
                    currentGroup: {
                        ...state.currentGroup,
                        groupMembers: [
                            ...state.currentGroup.groupMembers,
                            ...action.data.members
                        ]
                    }
                }
            }

        case ADD_MEMBERS_LOCATION:
            return {
                ...state,
                membersLocationList: action.data.list.reduce((list, locInfo) => {
                    locInfo.isVisible = true;
                    list[action.data.groupId].members.push(locInfo);
                    list.activeLength = list.activeLength !== undefined ? list.activeLength + 1 : 1;
                    return list;
                }, { ...state.membersLocationList, [action.data.groupId]: { members: [], name: action.data.groupName, isTempLocation: action.data.isTempLocation } })
            }

        case HIDE_MEMBERS_LOCATION:
            if (!action.data) {
                return {
                    ...state,
                    membersLocationList: Object.keys(state.membersLocationList).reduce((list, k) => {
                        if (k === 'activeLength') return list;
                        list[k] = list[k].map(locInfo => ({ ...locInfo, isVisible: false }));
                        return list;
                    }, { ...state.membersLocationList, activeLength: 0 })
                }
            }
            return {
                ...state,
                membersLocationList: {
                    ...state.membersLocationList,
                    [action.data]: {
                        ...state.membersLocationList[action.data],
                        members: state.membersLocationList[action.data].members.map(locInfo => ({ ...locInfo, isVisible: false })),
                    },
                    activeLength: state.membersLocationList.activeLength - state.membersLocationList[action.data].members.length
                }
            }

        case REMOVE_TEMP_MEMBERS_LOCATION:
            return {
                ...state,
                membersLocationList: Object.keys(state.membersLocationList).reduce((list, k) => {
                    if (list[k].isTempLocation && list[k].members.some(item => item.isVisible)) {
                        return {
                            ...list,
                            [k]: {
                                ...list[k],
                                members: list[k].members.map(locInfo => ({ ...locInfo, isVisible: false })),
                            },
                            activeLength: list.activeLength - list[k].members.length
                        }
                    }
                    else {
                        return list;
                    }
                }, { ...state.membersLocationList })
            }

        case UPDATE_GROUPS_LOCATION:
            return {
                ...state,
                membersLocationList: Object.keys(action.data).reduce((list, k) => {
                    const isVisible = list[k][0].isVisible;
                    list[k] = action.data[k].map(locInfo => ({ ...locInfo, isVisible }));
                    return list;
                }, { ...state.membersLocationList })
            }


        case CLEAR_GROUP_SEARCH_RESULTS:
            return {
                ...state,
                searchGroup: []
            }
        case REPLACE_GROUP_SEARCH_RESULTS:
            if (action.data.pageNumber === 0) {
                return {
                    ...state,
                    searchGroup: action.data.results
                };
            } else {
                return {
                    ...state,
                    searchGroup: [...state.searchGroup, ...action.data.results]
                };
            }

        case UPDATE_FAVOURITE_FRIEND_GROUP_LIST:
            return {
                ...state,
                currentGroup: {
                    ...state.currentGroup,
                    groupMembers: state.currentGroup.groupMembers.map(item => {
                        if (action.data.friendId === item.memberId) {
                            return { ...item, favorite: action.data.favorite }
                        }
                        return item
                    })
                }
            }
            return state;
        default: return state
    }
}