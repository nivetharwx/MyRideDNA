import { REPLACE_FRIEND_GROUP_LIST, ADD_FRIEND_GROUP_TO_LIST, ADD_MEMBERS_TO_CURRENT_GROUP, UPDATE_MEMBER_IN_CURRENT_GROUP, UPDATE_CURRENT_GROUP, RESET_CURRENT_GROUP, RESET_MEMBERS_FROM_CURRENT_GROUP, RESET_MEMBERS_IN_CURRENT_GROUP, GET_GROUP_INFO, REMOVE_MEMBER_FROM_CURRENT_GROUP, REMOVE_FRIEND_GROUP_FROM_LIST, HIDE_MEMBERS_LOCATION, ADD_MEMBERS_LOCATION, UPDATE_MEMBERS_LOCATION, UPDATE_GROUPS_LOCATION } from "../actions/actionConstants";

const initialState = {
    friendGroupList: [],
    // currentGroup: null,
    currentGroup: { groupMembers: [] },
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
            if (action.data.pictureObj) {
                let updatedGroupList = state.friendGroupList.map(item => {
                    if (!item.profilePictureId) return item;
                    if (typeof action.data.pictureObj[item.profilePictureId] === 'string') {
                        return { ...item, profilePicture: action.data.pictureObj[item.profilePictureId] }
                    }
                    return item;
                })
                return {
                    ...state,
                    friendGroupList: updatedGroupList
                }
            }
            else {
                if (!action.data.groupMembers) action.data.groupMembers = [];
                return {
                    ...state,
                    friendGroupList: [
                        ...state.friendGroupList,
                        ...action.data
                    ]
                }
            }
        case REMOVE_FRIEND_GROUP_FROM_LIST:
            const groupIndex = state.friendGroupList.findIndex(group => group.groupId === action.data);
            const selGroupId = state.friendGroupList[groupIndex].groupId;
            return {
                ...state,
                friendGroupList: [
                    ...state.friendGroupList.slice(0, groupIndex),
                    ...state.friendGroupList.slice(groupIndex + 1)
                ],
                currentGroup: state.currentGroup && selGroupId === state.currentGroup.groupId ? { groupMembers: [] } : state.currentGroup
            }
        case RESET_CURRENT_GROUP:
            return {
                ...state,
                currentGroup: { groupMembers: [] }
            }
        case UPDATE_CURRENT_GROUP:
            const index = state.friendGroupList.findIndex(group => group.groupId === action.data.groupId)
            let updatedGroup = state.friendGroupList[index];
            updatedGroup = { ...updatedGroup, ...action.data }
            return {
                ...state,
                currentGroup: { ...state.currentGroup, ...action.data },
                friendGroupList: [
                    ...state.friendGroupList.slice(0, index),
                    updatedGroup,
                    ...state.friendGroupList.slice(index + 1)
                ]
            }
        case RESET_MEMBERS_IN_CURRENT_GROUP:
            if (action.data.pageNumber === 0) {
                let indexGroup = state.friendGroupList.findIndex(group => group.groupId === action.data.groupId)
                action.data.members[0].name = 'You';
                action.data.members[0].nickname = '';
                const groupMembers = action.data.members.map(member => {
                    let memberIdx = state.currentGroup.groupMembers.findIndex(item => item.memberId === member.memberId);
                    if (memberIdx > -1) {
                        if (state.currentGroup.groupMembers[memberIdx].profilePictureId === member.profilePictureId && state.currentGroup.groupMembers[memberIdx].profilePicture) {
                            return { ...member, profilePicture: state.currentGroup.groupMembers[memberIdx].profilePicture };
                        }
                    }
                    return member;
                });
                return {
                    ...state,
                    // currentGroup: { ...state.currentGroup, ...groupMembers, groupId: action.data.groupId, groupName: action.data.groupName, userId: action.data.userId }
                    currentGroup: { ...state.friendGroupList[indexGroup], groupMembers }
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

        case ADD_MEMBERS_TO_CURRENT_GROUP:
            return {
                ...state,
                currentGroup: { ...state.currentGroup, groupMembers: [...state.currentGroup.groupMembers, ...action.data] }
            }

        case REMOVE_MEMBER_FROM_CURRENT_GROUP:
            const memberIndex = state.currentGroup.groupMembers.findIndex(member => member.memberId === action.data);
            if (memberIndex > -1) {
                return {
                    ...state,
                    currentGroup: {
                        ...state.currentGroup,
                        groupMembers: [
                            ...state.currentGroup.groupMembers.slice(0, memberIndex),
                            ...state.currentGroup.groupMembers.slice(memberIndex + 1)
                        ]
                    }
                }
            }
            return state
        // case UPDATE_MEMBER_IN_CURRENT_GROUP:
        //     const memberIdx = state.currentGroup.groupMembers.findIndex(member => member.memberId === action.data.memberId);
        //     if (memberIdx > -1) {
        //         return {
        //             ...state,
        //             currentGroup: {
        //                 ...state.currentGroup,
        //                 groupMembers: [
        //                     ...state.currentGroup.groupMembers.slice(0, memberIdx),
        //                     { ...state.currentGroup.groupMembers[memberIdx], ...action.data.updates },
        //                     ...state.currentGroup.groupMembers.slice(memberIdx + 1)
        //                 ]
        //             }
        //         }
        //     }
        case UPDATE_MEMBER_IN_CURRENT_GROUP:
            if (action.data.pictureObj) {
                let updatedGroupMemberList = state.currentGroup.groupMembers.map(item => {
                    if (!item.profilePictureId) return item;
                    if (typeof action.data.pictureObj[item.profilePictureId] === 'string') {
                        return { ...item, profilePicture: action.data.pictureObj[item.profilePictureId] }
                    }
                    return item;
                })
                return {
                    ...state,
                    currentGroup: {
                        ...state.currentGroup,
                        groupMembers: updatedGroupMemberList
                    }
                }
            }
            else if (action.data.updates) {
                const memberIdx = state.currentGroup.groupMembers.findIndex(member => member.memberId === action.data.memberId);
                if (memberIdx > -1) {
                    return {
                        ...state,
                        currentGroup: {
                            ...state.currentGroup,
                            groupMembers: [
                                ...state.currentGroup.groupMembers.slice(0, memberIdx),
                                { ...state.currentGroup.groupMembers[memberIdx], ...action.data.updates },
                                ...state.currentGroup.groupMembers.slice(memberIdx + 1)
                            ]
                        }
                    }
                }
            }
            return state

        case ADD_MEMBERS_LOCATION:
            return {
                ...state,
                membersLocationList: action.data.list.reduce((list, locInfo) => {
                    locInfo.isVisible = true;
                    list[action.data.groupId].push(locInfo);
                    list.activeLength = list.activeLength !== undefined ? list.activeLength + 1 : 1;
                    return list;
                }, { ...state.membersLocationList, [action.data.groupId]: [] })
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
                    [action.data]: state.membersLocationList[action.data].map(locInfo => ({ ...locInfo, isVisible: false })),
                    activeLength: state.membersLocationList.activeLength - 1
                }
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

        case GET_GROUP_INFO:
            return {
                ...state,
                currentGroup: state.friendGroupList[action.data]
            }
        default: return state
    }
}