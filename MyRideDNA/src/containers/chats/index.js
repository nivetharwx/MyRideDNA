import React, { Component } from 'react';
import { View, ImageBackground, Text, Alert, StatusBar, ScrollView, FlatList, TextInput, KeyboardAvoidingView, TouchableOpacity, AsyncStorage } from 'react-native';
import { connect } from 'react-redux';
import styles from './styles';
import { appNavMenuVisibilityAction, resetMessageCountAction, updateChatDatatAction, resetChatMessageAction } from '../../actions';
import { ShifterButton, IconButton, LinkButton } from '../../components/buttons';
import { Thumbnail, Item, List, Icon as NBIcon } from 'native-base';
import { APP_COMMON_STYLES, widthPercentageToDP, WindowDimensions, heightPercentageToDP, PageKeys } from '../../constants';
import { ChatBubble } from '../../components/bubble';
import { sendMessgae, getAllMessages, deleteMessagesById, deleteMessagesByIdForEveryone, seenMessage, getPicture, deleteAllMessages } from '../../api';
import { getFormattedDateFromISO } from '../../util';
import { BaseModal } from '../../components/modal';
import { ActionConst, Actions } from 'react-native-router-flux';
import FCM from 'react-native-fcm';

class Chat extends Component {
    CHAT_OPTIONS = [{ text: 'Clear Chat', id: 'clearAll', handler: () => this.clearChat() }, { text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() }];
    constructor(props) {
        super(props);
        this.state = {
            messageToBeSend: '',
            selectedMessage: null,
            messageSelectionMode: false,
            isVisibleDeleteModal: false,
            isNewMessage: false,
            isVisibleOptionsModal: false,
        };
    }
    componentDidMount() {
        // if (this.props.comingFrom === PageKeys.NOTIFICATIONS) {
        //     this.props.getAllMessages(this.props.chatInfo.id, this.props.user.userId, this.props.chatInfo.isGroup)
        //     this.props.updateChatData(this.props.chatInfo)
        // }
        // else if (this.props.comingFrom === PageKeys.CHAT_LIST) {
        //     this.props.getAllMessages(this.props.chatInfo.id, this.props.user.userId, this.props.chatInfo.isGroup)
        //     this.props.updateChatData(this.props.chatInfo)

        // }
        // else {
        //     this.props.getAllMessages(this.props.chatInfo.id, this.props.user.userId, this.props.chatInfo.isGroup)
        //     this.props.updateChatData(this.props.chatInfo)
        // }
        this.props.getAllMessages(this.props.chatInfo.id, this.props.user.userId, this.props.chatInfo.isGroup)
        this.props.updateChatData(this.props.chatInfo)
        if (this.props.comingFrom === PageKeys.CHAT_LIST) {
            this.props.seenMessage(this.props.chatInfo.id, this.props.user.userId, this.props.isGroup, 'chatList')
        }
        else {
            this.props.seenMessage(this.props.chatInfo.id, this.props.user.userId, this.props.isGroup, 'chatPage')
        }
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.chatData !== this.props.chatData) {
            if (this.props.chatData === null) {
                Actions.pop();
            }
            else if (this.props.chatData.profilePictureId && !this.props.chatData.profilePicture) {
                this.props.getPicture(this.props.chatData.profilePictureId);
            }
        }
    }

    showAppNavigation = () => this.props.showAppNavMenu();
    clearChat = () => {
        this.props.deleteAllMessages(this.props.chatInfo.id, this.props.user.userId, this.props.isGroup)
        this.setState({ isVisibleOptionsModal: false })
    }
    OnChangeMessageToBeSend = (messageToBeSend) => {
        this.setState({ messageToBeSend })
    }
    sendMessage = () => {
        // if (this.props.isGroup) {
        //     this.props.sendMessage(this.props.isGroup, this.props.group.groupId, this.props.user.userId, this.state.messageToBeSend, this.props.user.name, this.props.user.nickname);
        //     this.setState({ messageToBeSend: '' })
        // }
        // else {
        //     this.props.sendMessage(this.props.isGroup, this.props.friend.userId, this.props.user.userId, this.state.messageToBeSend, this.props.user.nickname);
        //     
        // }
        if (this.state.messageToBeSend !== '') {
            this.props.sendMessage(this.props.chatInfo.isGroup, this.props.chatInfo.id, this.props.user.userId, this.state.messageToBeSend, this.props.user.name, this.props.user.nickname);
        }

        this.setState({ messageToBeSend: '' })
    }
    chatKeyExtractor = (item) => item.messageId;

    changeToMessageSelectionMode = (messageId) => {
        console.log('openMessageHandler index : ', messageId);
        this.setState({ messageSelectionMode: true, selectedMessage: { [messageId]: true } });
    }

    onSelectMessage = (messageId) => {
        if (this.state.messageSelectionMode === false) return
        if (this.state.selectedMessage[messageId]) return this.onUnselectMessage(messageId);
        this.setState(prevState => ({ selectedMessage: { ...prevState.selectedMessage, [messageId]: true } }));
    }
    onUnselectMessage = (messageId) => this.setState(prevState => {
        const { [messageId]: deletedKey, ...otherKeys } = prevState.selectedMessage;
        if (Object.keys(otherKeys).length === 0) {
            return { selectedMessage: null, messageSelectionMode: false };
        } else {
            return { selectedMessage: { ...otherKeys } };
        }
    });
    unSelectAllMessage = () => {
        this.setState({ selectedMessage: null, messageSelectionMode: false })
    }
    openDeleteModal = () => {
        // this.setState({ isVisibleDeleteModal: true })
        Alert.alert(
            'Delete Messages ?',
            '',
            [
                {
                    text: 'delete my messages', onPress: () => {
                        this.deleteMessageForMe()
                    }
                },
                { text: 'Cancel', onPress: () => { }, style: 'cancel' },
            ],
            { cancelable: false }
        );
    }
    deleteMessageForMe = () => {
        console.log('coming inside dlete for me ');
        // if (this.props.comingFrom === PageKeys.NOTIFICATIONS) {
        //     this.props.deleteMessagesById(this.props.notificationBody.isGroup, this.props.notificationBody.id, this.props.user.userId, Object.keys(this.state.selectedMessage))
        // }
        // else if (this.props.isGroup) {
        //     this.props.deleteMessagesById(this.props.isGroup, this.props.group.groupId, this.props.user.userId, Object.keys(this.state.selectedMessage))
        // }
        // else {
        //     this.props.deleteMessagesById(this.props.isGroup, this.props.friend.userId, this.props.user.userId, Object.keys(this.state.selectedMessage))
        // }
        const newChatMessages = this.props.chatMessages.filter(msg => Object.keys(this.state.selectedMessage).indexOf(msg.messageId) === -1)
        console.log('newChatMessages : ', newChatMessages);
        if (newChatMessages.length > 0) {
            this.props.deleteMessagesById(this.props.chatInfo.isGroup, this.props.chatInfo.id, this.props.user.userId, Object.keys(this.state.selectedMessage), newChatMessages[0])
        }
        else {
            this.props.deleteMessagesById(this.props.chatInfo.isGroup, this.props.chatInfo.id, this.props.user.userId, Object.keys(this.state.selectedMessage))
        }

        this.setState({ isVisibleDeleteModal: false, selectedMessage: null })
    }
    deleteMessageForEveryone = () => {
        // if (this.props.comingFrom === PageKeys.NOTIFICATIONS) {
        //     this.props.deleteMessagesByIdForEveryone(this.props.notificationBody.isGroup, this.props.notificationBody.id, this.props.user.userId, Object.keys(this.state.selectedMessage))
        // }
        // else if (this.props.isGroup) {
        //     this.props.deleteMessagesByIdForEveryone(this.props.isGroup, this.props.group.groupId, this.props.user.userId, Object.keys(this.state.selectedMessage))
        // }
        // else {
        //     this.props.deleteMessagesByIdForEveryone(this.props.isGroup, this.props.friend.userId, this.props.user.userId, Object.keys(this.state.selectedMessage))
        // }
        this.props.deleteMessagesByIdForEveryone(this.props.chatInfo.isGroup, this.props.chatInfo.id, this.props.user.userId, Object.keys(this.state.selectedMessage))

        this.setState({ isVisibleDeleteModal: false, selectedMessage: null })
    }
    onCancelDeleteModal = () => {
        this.setState({ isVisibleDeleteModal: false })
    }

    onViewableItemsChanged = ({ viewableItems, changed }) => {
        console.log('ViewwableItems : ', viewableItems)
        // viewableItems.map(vItem => {
        //     console.log('vItem.item.messageId  : ',vItem.item.messageId );
        //     console.log('this.props.chatMessages[0].messageId  : ',this.props.chatMessages[0].messageId );
        //     if (vItem.item.messageId === this.props.chatMessages[0].messageId) {
        //         console.log('inside if ')
        //         this.props.resetMessageCount()
        //         this.setState({ isNewMessage: false })
        //         return 
        //     }
        //     else {
        //         if (viewableItems.length === 1) {
        //             this.setState({ isNewMessage: false })
        //         }
        //         else {
        //             this.setState({ isNewMessage: true })
        //         }

        //     }
        // })
        if (viewableItems.length === 0) {
            this.setState({ isNewMessage: false })
        }
        else if (viewableItems[0].item.messageId === this.props.chatMessages[0].messageId) {
            this.props.resetMessageCount()
            this.setState({ isNewMessage: false })
        }
        else {
            if (viewableItems.length === 1) {
                this.setState({ isNewMessage: false })
            }
            else {
                this.setState({ isNewMessage: true })
            }
        }
    }
    goToLastMessage = () => {
        this.refs.flatList.scrollToOffset({ offset: 0, animated: true });
    }

    getDateAndTime = (item) => {
        return new Date(item.date).toLocaleDateString() + ', ' + new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    onPressBackButton = () => {
        this.props.resetChatMessage();
    }
    onCancelOptionsModal = () => this.setState({ isVisibleOptionsModal: false })
    renderMenuOptions = () => {
        let options = null;
        options = this.CHAT_OPTIONS;
        return (
            options.map(option => (
                <LinkButton
                    key={option.id}
                    onPress={option.handler}
                    highlightColor={APP_COMMON_STYLES.infoColor}
                    style={APP_COMMON_STYLES.menuOptHighlight}
                    title={option.text}
                    titleStyle={APP_COMMON_STYLES.menuOptTxt}
                />
            ))
        )
    }

    showOptionsModal = () => {
        this.setState({ isVisibleOptionsModal: true });
    }


    render() {
        const { user, chatMessages, totalUnseenMessage, chatData } = this.props;
        const { messageToBeSend, selectedMessage, isVisibleDeleteModal, isVisibleOptionsModal } = this.state;
        console.log('chatMessage : ', chatMessages);
        return <View style={styles.fill}>
            <View style={APP_COMMON_STYLES.statusBar}>
                <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColorDark} barStyle="light-content" />
            </View>
            <View style={styles.fill}>
                <ImageBackground style={styles.chatBackgroundImage} source={require('../../assets/img/chat-bg.jpg')}>
                    {
                        selectedMessage ?
                            <View style={styles.deleteButtonChatHeader}>
                                <IconButton titleStyle={{ color: '#fff', fontWeight: 'bold', fontSize: widthPercentageToDP(4) }} iconProps={{ name: 'window-close', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(8), color: '#fff' } }} onPress={this.unSelectAllMessage} />
                                <View style={{ flex: 1, alignSelf: 'flex-start' }}>
                                    <IconButton titleStyle={{ color: '#fff', fontWeight: 'bold', fontSize: widthPercentageToDP(4) }} iconProps={{ name: 'delete', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(8), color: '#fff' } }} onPress={this.openDeleteModal} />
                                </View>
                                {/* <IconButton style={{ marginRight: widthPercentageToDP(3) }} iconProps={{ name: 'md-more', type: 'Ionicons', style: { color: '#fff' } }} onPress={this.showOptionsModal} /> */}
                            </View>
                            :
                            <View style={styles.chatHeader}>
                                {/* <View style={{marginRight:widthPercentageToDP(4),backgroundColor:'#fff',width:widthPercentageToDP(8),height:heightPercentageToDP(6),borderRadius:widthPercentageToDP(5)}}>
                                    <IconButton style={{textAlign:'center'}} iconProps={{ name: 'md-arrow-round-back', type: 'Ionicons', style: {fontSize: widthPercentageToDP(6), } }} />
                                </View> */}
                                <View style={{ marginHorizontal: widthPercentageToDP(3), alignItems: 'center', justifyContent: 'center' }}>
                                    <TouchableOpacity style={styles.iconPadding} onPress={this.onPressBackButton}>
                                        <NBIcon name='md-arrow-round-back' type='Ionicons' style={{
                                            fontSize: 25,
                                            color: 'black'
                                        }} />
                                    </TouchableOpacity>
                                </View>
                                {
                                    chatData !== null ?
                                        chatData.profilePicture ?
                                            <Thumbnail style={styles.thumbnail} source={{ uri: chatData.profilePicture }} />
                                            :
                                            <View style={styles.groupIconStyle}>
                                                <IconButton iconProps={{ name: 'user', type: 'FontAwesome', style: { color: 'white', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(5), marginLeft: widthPercentageToDP(7), marginTop: heightPercentageToDP(0.8) } }} />
                                            </View>
                                        :
                                        <View style={styles.groupIconStyle}>
                                            <IconButton iconProps={{ name: 'user', type: 'FontAwesome', style: { color: 'white', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(5), marginLeft: widthPercentageToDP(7), marginTop: heightPercentageToDP(0.8) } }} />
                                        </View>
                                }

                                {
                                    this.props.comingFrom === PageKeys.NOTIFICATIONS ?
                                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                            {
                                                this.props.chatInfo.isGroup ?
                                                    <Text style={styles.chatHeaderName}>{this.props.chatInfo.groupName}</Text>
                                                    :
                                                    <View>
                                                        <Text style={styles.chatHeaderName}>{this.props.chatInfo.senderName}</Text>
                                                        {/* <Text style={styles.chatHeaderNickname}>randomNickname</Text> */}
                                                    </View>
                                            }

                                        </View>
                                        :
                                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={styles.chatHeaderName}>{this.props.chatInfo.isGroup ? this.props.chatInfo.groupName : this.props.chatInfo.name}</Text>
                                            {/* {
                                                this.props.chatInfo.isGroup ?
                                                    null :
                                                    <Text style={styles.chatHeaderNickname}>{this.props.chatInfo.nickname}</Text>
                                            } */}

                                        </View>
                                }
                                {/* <IconButton style={{ marginRight: widthPercentageToDP(3) }} iconProps={{ name: 'md-more', type: 'Ionicons', style: { color: '#fff' } }} onPress={this.showOptionsModal} /> */}
                            </View>
                    }

                    {/* <BaseModal alignCenter={true} isVisible={isVisibleDeleteModal} onCancel={this.onCancelDeleteModal} onPressOutside={this.onCancelDeleteModal}>
                        <View style={{ borderRadius: widthPercentageToDP(3), backgroundColor: '#fff', height: WindowDimensions.height / 3, width: WindowDimensions.width * 0.8, padding: 20, elevation: 3 }}>
                            <Text style={{ fontSize: widthPercentageToDP(5) }}>Delete Message?</Text>
                            <View style={{ marginTop: heightPercentageToDP(6) }}>
                                <Text style={{ fontSize: widthPercentageToDP(4), color: '#6C6C6B', alignSelf: 'flex-end' }} onPress={this.deleteMessageForMe}>DELETE FOR ME</Text>
                                <Text style={{ fontSize: widthPercentageToDP(4), color: '#6C6C6B', marginTop: heightPercentageToDP(3), alignSelf: 'flex-end' }} onPress={this.onCancelDeleteModal}>CANCEL</Text>
                                <Text style={{ fontSize: widthPercentageToDP(4), color: '#6C6C6B', marginTop: heightPercentageToDP(3), alignSelf: 'flex-end' }} onPress={this.deleteMessageForEveryone}>DELETE FOR EVERYONE</Text>
                            </View>
                        </View>
                    </BaseModal> */}
                    <BaseModal isVisible={isVisibleOptionsModal} onCancel={this.onCancelOptionsModal} onPressOutside={this.onCancelOptionsModal}>
                        <View style={[APP_COMMON_STYLES.menuOptContainer, user.handDominance === 'left' ? APP_COMMON_STYLES.leftDominantCont : null]}>
                            {
                                this.renderMenuOptions()
                            }
                        </View>
                    </BaseModal>
                    <View style={styles.rootContainer}>
                        <FlatList
                            ref={'flatList'}
                            style={styles.chatArea}
                            contentContainerStyle={{ paddingBottom: 10 }}
                            data={chatMessages}
                            keyExtractor={this.chatKeyExtractor}
                            inverted={true}
                            onViewableItemsChanged={this.onViewableItemsChanged}
                            // onContentSizeChange={() => { this.refs.flatList.scrollToEnd({ animated: false }) }}
                            renderItem={({ item, index }) => {
                                return item.senderId === user.userId
                                    ?
                                    <ChatBubble
                                        bubbleName='Me,'
                                        messageTime={this.getDateAndTime(item)}
                                        message={item.content}
                                        bubbleStyle={styles.friendChatBubble}
                                        bubbleNameStyle={styles.friendName}
                                        onLongPress={() => this.changeToMessageSelectionMode(item.messageId)}
                                        selectedMessage={selectedMessage && selectedMessage[item.messageId]}
                                        onPress={() => this.onSelectMessage(item.messageId)}
                                    />
                                    : <ChatBubble
                                        bubbleName={item.senderName + ','}
                                        messageTime={this.getDateAndTime(item)}
                                        message={item.content}
                                        onLongPress={() => this.changeToMessageSelectionMode(item.messageId)}
                                        selectedMessage={selectedMessage && selectedMessage[item.messageId]}
                                        onPress={() => this.onSelectMessage(item.messageId)}
                                    />
                            }}

                        />
                        {
                            this.state.isNewMessage ?
                                <View>
                                    <View style={{ backgroundColor: '#6C6C6B', position: 'absolute', bottom: heightPercentageToDP(3), right: widthPercentageToDP(2), height: heightPercentageToDP(5), width: widthPercentageToDP(8), borderRadius: widthPercentageToDP(6) }}>
                                        <IconButton iconProps={{ name: 'angle-double-down', type: 'FontAwesome', style: { color: 'black' } }} onPress={this.goToLastMessage} />
                                    </View>
                                    {
                                        this.props.comingFrom === PageKeys.NOTIFICATIONS ?
                                            totalUnseenMessage > 0 ?
                                                <View style={{ backgroundColor: APP_COMMON_STYLES.infoColor, position: 'absolute', bottom: heightPercentageToDP(6), right: widthPercentageToDP(7), height: heightPercentageToDP(3), minWidth: widthPercentageToDP(5), borderRadius: widthPercentageToDP(3), textAlign: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: heightPercentageToDP(1.7) }}>{totalUnseenMessage}</Text>
                                                </View>
                                                : null
                                            :
                                            totalUnseenMessage > 0 ?
                                                <View style={{ backgroundColor: APP_COMMON_STYLES.infoColor, position: 'absolute', bottom: heightPercentageToDP(6), right: widthPercentageToDP(7), height: heightPercentageToDP(3), minWidth: widthPercentageToDP(5), borderRadius: widthPercentageToDP(3), textAlign: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: heightPercentageToDP(1.7) }}>{totalUnseenMessage}</Text>
                                                </View>
                                                : null

                                    }

                                </View>
                                : null
                        }

                    </View>

                    <Item style={styles.msgInputBoxContainer}>
                        {/* <IconButton style={styles.footerLeftIcon} iconProps={{ name: 'md-attach', type: 'Ionicons' }} /> */}
                        <TextInput value={messageToBeSend} placeholder='Type a message' style={{ flex: 1, marginRight: widthPercentageToDP(1) }} onChangeText={this.OnChangeMessageToBeSend} />
                        <IconButton iconProps={{ name: 'md-send', type: 'Ionicons', style: { color: APP_COMMON_STYLES.headerColor } }} onPress={() => this.sendMessage()} />
                    </Item>

                    {/* <ShifterButton onPress={this.showAppNavigation} containerStyles={styles.shifterContainer} alignLeft={this.props.user.handDominance === 'left'} /> */}
                </ImageBackground>
            </View>
        </View >
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { chatMessages, isScroll, totalUnseenMessage, chatData, chatList } = state.ChatList;
    return { user, chatMessages, isScroll, totalUnseenMessage, chatData, chatList };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        getAllMessages: (id, userId, isGroup) => dispatch(getAllMessages(id, userId, isGroup)),
        seenMessage: (id, userId, isGroup, comingFrom) => dispatch(seenMessage(id, userId, isGroup, comingFrom)),
        deleteAllMessages: (id, userId, isGroup) => dispatch(deleteAllMessages(id, userId, isGroup)),
        sendMessage: (isGroup, id, userId, content, userName, userNickname) => dispatch(sendMessgae(isGroup, id, userId, content, userName, userNickname)),
        deleteMessagesById: (isGroup, id, userId, messageToBeDeleted, newChatMessages) => dispatch(deleteMessagesById(isGroup, id, userId, messageToBeDeleted, newChatMessages)),
        deleteMessagesByIdForEveryone: (isGroup, id, userId, messageToBeDeleted) => dispatch(deleteMessagesByIdForEveryone(isGroup, id, userId, messageToBeDeleted)),
        resetMessageCount: () => dispatch(resetMessageCountAction({ resetTotalUnseen: true })),
        updateChatData: (chatData) => dispatch(updateChatDatatAction({ chatData: chatData })),
        getPicture: (pictureId) => getPicture(pictureId, (response) => {
            console.log('getPicture chat : ', response);
            dispatch(updateChatDatatAction({ profilePicture: response.picture }))
        }, (error) => console.log("getPicture error: ", error)),
        resetChatMessage: () => dispatch(resetChatMessageAction())
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Chat);