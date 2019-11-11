import { UPDATE_CHAT_MESSAGES, REPLACE_CHAT_MESSAGES, UPDATE_CHAT_LIST, REPLACE_CHAT_LIST, RESET_CHAT_MESSAGES, RESET_MESSAGE_COUNT, UPDATE_CHAT_DATA_LIST, UPDATE_MESSAGE_COUNT, UPDATE_CHAT_PIC, UPDATE_GROUP_CHAT_PIC } from "../actions/actionConstants";
import { PageKeys } from "../constants";


const initialState = {
    chatMessages: [],
    chatList: [],
    totalUnseenMessage: 0,
    chatData: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_CHAT_LIST:
            if (action.data.comingFrom === 'getAllChatsApi') {
                return {
                    ...state,
                    chatList: action.data.chatList
                }
            }
            else if (action.data.comingFrom === 'sendMessgaeApi' && state.chatList.length > 0) {
                const index = state.chatList.findIndex(list => list.id === action.data.id)
                if (index > -1) {
                    const newChat = { ...state.chatList[index] };
                    newChat.message = action.data.newMessage
                    return {
                        ...state,
                        chatList: [
                            ...state.chatList.slice(0, index),
                            newChat,
                            ...state.chatList.slice(index + 1)
                        ]
                    }
                }
            }
            else {
                if (action.data.comingFrom === PageKeys.NOTIFICATIONS) {
                    const index = state.chatList.findIndex(list => list.id === action.data.id)
                    if (index > -1) {
                        const newChat = { ...state.chatList[index] };
                        newChat.message = action.data.newMessage
                        return {
                            ...state,
                            chatList: [
                                newChat,
                                ...state.chatList.slice(0, index),
                                ...state.chatList.slice(index + 1)
                            ]
                        }
                    }
                }
            }
            return {
                ...state,
            }


        case UPDATE_CHAT_PIC:
            return {
                ...state,
                chatList: state.chatList.map(item => {
                    const picId = item.profilePictureId || item.groupProfilePictureId;
                    if (!picId) return item;
                    return { ...item, profilePicture: action.data.pictureObj[picId] };
                })
            }

        case UPDATE_GROUP_CHAT_PIC:
            return {
                ...state,
                chatList: state.chatList.map(item => {
                    if (item.isGroup === false) return item;
                    if (!action.data.groupPicObj[item.id]) return item;
                    return { ...item, profilePictureList: action.data.groupPicObj[item.id] };
                })
            }

        case UPDATE_CHAT_MESSAGES:
            return {
                ...state,
                chatMessages: action.data
            }
        case REPLACE_CHAT_MESSAGES:
            if (action.data.comingFrom === 'deleteMessage') {
                // const updatedChatMessages = action.data.messageIds.map(deletedMessage => {
                //     const index = state.chatMessages.findIndex(message => deletedMessage === message.messageId)
                //     return [...state.chatMessages.slice(0, index), ...state.chatMessages.slice(index + 1)]
                // })
                // console.log('updatedChatMessages : ', updatedChatMessages)
                // return { ...state, chatMessages: updatedChatMessages[updatedChatMessages.length - 1] }
                return { ...state, chatMessages: state.chatMessages.filter(msg => action.data.messageIds.indexOf(msg.messageId) === -1) }
            }
            else if (action.data.comingFrom === PageKeys.NOTIFICATIONS) {
                if (state.chatData.id === action.data.notificationBody.id) {
                    return {
                        ...state,
                        chatMessages: [
                            action.data.notificationBody,
                            ...state.chatMessages,
                        ],
                        totalUnseenMessage: state.totalUnseenMessage + 1
                    }
                }
                else {
                    return state
                }

            }
            else if (action.data.comingFrom === 'deleteAllMessages') {
                const index = state.chatList.findIndex(list => list.id === action.data.id);
                const { ['message']: deletedKey, ...otherKeys } = state.chatList[index];

                return {
                    ...state,
                    chatMessages: [],
                    chatList: [
                        ...state.chatList.slice(0, index),
                        otherKeys,
                        ...state.chatList.slice(index + 1)
                    ]
                }
            }
            else if (action.data.comingFrom === 'fcmDeletForEveryone') {
                if (state.chatMessages.length === 0) {
                    return state
                }
                else {
                    const updatedMessage = state.chatMessages.filter(msg => action.data.notificationBody.messageIdList.indexOf(msg.messageId) === -1);
                    if (updatedMessage.length === 0) {
                        const index = state.chatList.findIndex(list => list.id === action.data.notificationBody.id)
                        const { ['message']: deletedKey, ...otherKeys } = state.chatList[index];

                        return {
                            ...state,
                            chatMessages: updatedMessage,
                            chatList: [
                                ...state.chatList.slice(0, index),
                                otherKeys,
                                ...state.chatList.slice(index + 1)
                            ]
                        }
                    }
                    else {
                        const index = state.chatList.findIndex(list => list.id === action.data.notificationBody.id)
                        const updatedList = state.chatList[index];
                        updatedList.message = updatedMessage[0];
                        return {
                            ...state,
                            chatMessages: updatedMessage,
                            chatList: [
                                ...state.chatList.slice(0, index),
                                updatedList,
                                ...state.chatList.slice(index + 1)
                            ]
                        }
                    }

                }

            }
            else {
                return {
                    ...state,
                    chatMessages: [
                        action.data,
                        ...state.chatMessages,
                    ]

                }
            }

        case RESET_CHAT_MESSAGES:
            return {
                ...state,
                chatMessages: [],
                totalUnseenMessage: 0,
                chatData: null
            }

        case RESET_MESSAGE_COUNT:
            if (action.data.comingFrom === "seenMessage") {
                const index = state.chatList.findIndex(chat => chat.id === action.data.id)
                if (index > -1) {
                    const updatedChatLIst = state.chatList[index];
                    updatedChatLIst.totalUnseenMessage = 0
                    return {
                        ...state,
                        chatList: [
                            ...state.chatList.slice(0, index),
                            updatedChatLIst,
                            ...state.chatList.slice(index + 1)
                        ]
                    }
                }
            }
            else if (action.data.resetTotalUnseen) {
                return {
                    ...state,
                    totalUnseenMessage: 0
                }
            }

        // case UPDATE_CHAT_DATA_LIST:
        //     console.log('UPDATE_CHAT_DATA_LIST  : ',action.data)
        //     if(action.data.comingFrom === "notifications"){
        //         action.data.chatData['profilePictureId'] = action.data.chatData.id + '_thumb'
        //         return {
        //             ...state,
        //             chatData:action.data.chatData
        //         }
        //     }
        //     else if(action.data.comingFrom === "updatePicture"){
        //         const updateChatData = state.chatData;
        //         updateChatData['profilePicture'] = action.data.profilePicture
        //         return {
        //             ...state,
        //             chatData:updateChatData
        //         }
        //     }
        //     else{
        //         return{
        //             ...state,
        //             chatData:action.data.chatData
        //         }
        //     }
        case UPDATE_CHAT_DATA_LIST:
            if (action.data.chatData && !action.data.chatData.profilePictureId && action.data.chatData.isGroup === false) {
                action.data.chatData['profilePictureId'] = action.data.chatData.id + '_thumb';
                return {
                    ...state,
                    chatData: action.data.chatData
                }
            }
            else if (action.data.profilePicture) {
                const updateChatData = state.chatData;
                updateChatData['profilePicture'] = action.data.profilePicture
                return {
                    ...state,
                    chatData: updateChatData
                }
            }
            else if (action.data.pictureObj) {
                return {
                    ...state,
                    chatData: {
                        ...state.chatData,
                        memberPictures: action.data.pictureObj
                    }
                }
            }
            else {
                return {
                    ...state,
                    chatData: action.data.chatData
                }
            }

        case UPDATE_MESSAGE_COUNT:
            const index = state.chatList.findIndex(chat => chat.id === action.data.id)
            if (index > -1) {
                const updatedChatLIst = state.chatList[index];
                updatedChatLIst.totalUnseenMessage = state.chatList[index].totalUnseenMessage + 1
                return {
                    ...state,
                    chatList: [
                        ...state.chatList.slice(0, index),
                        updatedChatLIst,
                        ...state.chatList.slice(index + 1)
                    ]
                }
            }



        default: return state
    }
}