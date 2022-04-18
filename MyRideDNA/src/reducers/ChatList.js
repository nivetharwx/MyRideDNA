import { UPDATE_CHAT_MESSAGES, REPLACE_CHAT_MESSAGES, UPDATE_CHAT_LIST, REPLACE_CHAT_LIST, RESET_CHAT_MESSAGES, RESET_MESSAGE_COUNT, UPDATE_CHAT_DATA_LIST, UPDATE_MESSAGE_COUNT, UPDATE_CHAT_PIC, UPDATE_GROUP_CHAT_PIC, CLEAR_CHAT_LIST } from "../actions/actionConstants";
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
                console.log('///get all chat ' + JSON.stringify(action.data.totalUnseenMessage))
                return {
                    ...state,
                    chatList: action.data.chats,
                    totalUnseenMessage: action.data.totalUnseenMessage
                }
            }
            else if (action.data.id) {
                const index = state.chatList.findIndex(list => list.id === action.data.id)
                console.log('message data',action.data,state,index)
                if (index > -1) {
                    return {
                        ...state,
                        chatList: [
                            {
                                ...state.chatList[index],
                                message: action.data.comingFrom === PageKeys.NOTIFICATIONS ? {
                                    ...action.data.messageBody,
                                    media: action.data.messageBody.media ? JSON.parse(action.data.messageBody.media) : null,
                                    seenUser: action.data.messageBody.seenUser ? JSON.parse(action.data.messageBody.seenUser) : []
                                } : {
                                        ...action.data.messageBody,
                                        media: action.data.messageBody.media ? action.data.messageBody.media : null,
                                        seenUser: action.data.messageBody.seenUser ? action.data.messageBody.seenUser : []
                                    }
                            },
                            ...state.chatList.slice(0, index),
                            ...state.chatList.slice(index + 1)
                        ]
                    }
                }else{
                    console.log(state)
                    
                    return {
                        ...state,
                        chatList: [
                            {
                                id:action.data.id,
                                name:action.data.messageBody.senderName,
                                nickname:action.data.messageBody.senderNickname,
                                profilePictureId:action.data.messageBody.senderPictureId,
                                date:action.data.messageBody.date,
                                status:action.data.messageBody.status,
                                ...action.data.messageBody,
                                ...(action.data.messageBody.memberPictureIdList && {profilePictureIdList : JSON.parse(action.data.messageBody.memberPictureIdList)}),
                                ...(action.data.messageBody.exceptUser && {exceptUser : JSON.parse(action.data.messageBody.exceptUser)}),
                                ...(action.data.messageBody.memberPictureIdList && {memberNameList : JSON.parse(action.data.messageBody.memberPictureIdList)}),
                                ...(action.data.messageBody.seenUser && {seenUser: JSON.parse(action.data.messageBody.seenUser)}),
                                isGroup:action.data.messageBody.isGroup=='true'?true:false,
                                message: action.data.comingFrom === PageKeys.NOTIFICATIONS ? {
                                    ...action.data.messageBody,
                                    media: action.data.messageBody.media ? JSON.parse(action.data.messageBody.media) : null,
                                    seenUser: action.data.messageBody.seenUser ? JSON.parse(action.data.messageBody.seenUser) : []
                                } : {
                                        ...action.data.messageBody,
                                        media: action.data.messageBody.media ? action.data.messageBody.media : null,
                                        seenUser: action.data.messageBody.seenUser ? action.data.messageBody.seenUser : []
                                    },
                                totalUnseenMessage:1
                            },
                            ...state.chatList
                        ]
                    }

                }
            }
            return state


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
                console.log('replace notification',action.data)
                if (state.chatData.id === action.data.notificationBody.id) {
                    return {
                        ...state,
                        chatMessages: [
                            {
                                ...action.data.notificationBody,
                                media: action.data.notificationBody.media ? JSON.parse(action.data.notificationBody.media) : null,
                                seenUser: action.data.notificationBody.seenUser ? JSON.parse(action.data.notificationBody.seenUser) : []
                            },
                            ...state.chatMessages,
                        ],
                    }
                }
                else {
                    return state
                }
            }
            else if (action.data.comingFrom === 'deleteAllMessages') {
                return {
                    ...state,
                    chatMessages: [],
                    chatList: state.chatList.filter(item=>item.id !==action.data.id)
                }
            }
            else if (action.data.comingFrom === 'fcmDeletForEveryone') {
                const updatedMessage = state.chatMessages.filter(msg => action.data.notificationBody.messageIdList.indexOf(msg.messageId) === -1);
                const index = state.chatList.findIndex(list => list.id === action.data.notificationBody.id)
                if (updatedMessage.length === 0) {
                    if (index > -1) {
                        const { ['message']: deletedKey, ...otherKeys } = state.chatList[index];
                        const chatListData = { ...otherKeys, totalUnseenMessage: state.totalUnseenMessage === 0 ? state.totalUnseenMessage : state.totalUnseenMessage - 1 }
                        return {
                            ...state,
                            chatMessages: updatedMessage,
                            chatList: [
                                ...state.chatList.slice(0, index),
                                chatListData,
                                ...state.chatList.slice(index + 1)
                            ],

                        }
                    }
                    else {
                        return {
                            ...state,
                            chatMessages: updatedMessage,
                        }
                    }
                }
                else {
                    if (index > -1) {
                        const updatedList = state.chatList[index];
                        updatedList.message = updatedMessage[0];
                        const chatListData = { ...updatedList, totalUnseenMessage: state.totalUnseenMessage === 0 ? state.totalUnseenMessage : state.totalUnseenMessage - 1 }
                        return {
                            ...state,
                            chatMessages: updatedMessage,
                            chatList: [
                                ...state.chatList.slice(0, index),
                                chatListData,
                                ...state.chatList.slice(index + 1)
                            ],
                        }
                    }
                    else {
                        return {
                            ...state,
                            chatMessages: updatedMessage,
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
                // totalUnseenMessage: 0,
                chatData: null
            }

        case RESET_MESSAGE_COUNT:
            console.log('state', state, '\n\n total unssen messages ',action.data.comingFrom)
            if (action.data.comingFrom === "seenMessage") {
                let totalUnseenMessage=0
                let newList= state.chatList.map(item=>{
                    if(item.id !== action.data.id){
                        totalUnseenMessage+=item.totalUnseenMessage
                    }
                    return item.id === action.data.id
                    ?{...item, totalUnseenMessage:0}
                    :item
                })
                // let totalUnseenMessage=newList.reduce((firstItem,secondItem)=>{
                //     return firstItem+=secondItem.totalUnseenMessage
                // },0)
                console.log(totalUnseenMessage,'////totalUnseen')
                    return {
                        ...state,
                        chatList: newList,
                        // totalUnseenMessage: state.totalUnseenMessage - (action.data.unSeenmessageCount?action.data.unSeenmessageCount:state.chatList.length>0?state.chatList[state.chatList.findIndex(list => list.id === action.data.id)].totalUnseenMessage:0)
                        totalUnseenMessage: totalUnseenMessage
                    }
            }
            else if (action.data.resetTotalUnseen) {
                return {
                    ...state,
                    // totalUnseenMessage: 0
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
            console.log('\n\n\n UPDATE_CHAT_DATA_LIST : ', UPDATE_CHAT_DATA_LIST)
            console.log('LOGGED BY NIVETHA 1....***************************',action.data.chatData.profilePictureId);
            if (action.data.chatData && !action.data.chatData.profilePictureId && action.data.chatData.isGroup === false) {
            // if (action.data.chatData && !action.data.chatData.profilePictureId && action.data.chatData.isGroup === false) {
                // action.data.chatData['profilePictureId'] = action.data.chatData.id + '_thumb';
                console.log('LOGGED BY NIVETHA 2.....***************************',action.data.chatData.profilePictureId);

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
            if (action.data.id) {
                const index = state.chatList.findIndex(chat => chat.id === action.data.id)
                if (index > -1) {
                    const updatedChatLIst = state.chatList[index];
                    updatedChatLIst.totalUnseenMessage = state.chatList[index].totalUnseenMessage + 1
                    console.log(updatedChatLIst)
                    return {
                        ...state,
                        chatList: [
                            ...state.chatList.slice(0, index),
                            updatedChatLIst,
                            ...state.chatList.slice(index + 1)
                        ],
                        totalUnseenMessage: state.totalUnseenMessage + 1
                    }
                }else{
                    return {
                        ...state,
                        totalUnseenMessage: state.totalUnseenMessage + 1
                    }
                }
            }
            else {
                return {
                    ...state,
                    totalUnseenMessage: state.totalUnseenMessage + 1
                }
            }

        case CLEAR_CHAT_LIST:
            return {
                chatMessages: [],
                chatList: [],
                // totalUnseenMessage: 0,
                chatData: null
            }

        default: return state
    }
}