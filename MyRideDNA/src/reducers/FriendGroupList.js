import { REPLACE_FRIEND_GROUP_LIST, ADD_FRIEND_GROUP_TO_LIST, ADD_MEMBERS_TO_CURRENT_GROUP, UPDATE_MEMBER_IN_CURRENT_GROUP, UPDTAE_CURRENT_GROUP, RESET_CURRENT_GROUP, RESET_MEMBERS_FROM_CURRENT_GROUP } from "../actions/actionConstants";

const initialState = {
    friendGroupList: [],
    currentGroup: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case REPLACE_FRIEND_GROUP_LIST:
            return {
                ...state,
                friendGroupList: action.data.map(group => {
                    if (!group.groupMembers) group.groupMembers = [];
                    return group;
                }),
                currentGroup: null
            }
        case ADD_FRIEND_GROUP_TO_LIST:
            if (!action.data.groupMembers) action.data.groupMembers = [];
            return {
                ...state,
                friendGroupList: [
                    ...state.friendGroupList,
                    action.data
                ],
                currentGroup: action.data
            }
        case RESET_CURRENT_GROUP:
            return {
                ...state,
                currentGroup: action.data === null ? null : state.friendGroupList[action.data]
            }
        case UPDTAE_CURRENT_GROUP:
            return {
                ...state,
                currentGroup: { ...state.currentGroup, ...action.data }
            }
        case RESET_MEMBERS_FROM_CURRENT_GROUP:
            return {
                ...state,
                currentGroup: { ...state.currentGroup, groupMembers: action.data }
            }
        case ADD_MEMBERS_TO_CURRENT_GROUP:
            return {
                ...state,
                currentGroup: { ...state.currentGroup, groupMembers: [...state.currentGroup.groupMembers, ...action.data] }
            }
        case UPDATE_MEMBER_IN_CURRENT_GROUP:
            const memberIdx = state.currentGroup.groupMembers.findIndex(member => member.memberId === action.data.memberId);
            if (memberIdx > -1) {
                return {
                    ...state,
                    currentGroup: {
                        ...state.currentGroup,
                        groupMembers: [
                            ...state.currentGroup.groupMembers.slice(0, memberIdx),
                            { ...state.currentGroup.groupMembers[memberIdx], ...action.data },
                            ...state.currentGroup.groupMembers.slice(memberIdx + 1)
                        ]
                    }
                }
            } else {
                return state
            }
        default: return state
    }
}