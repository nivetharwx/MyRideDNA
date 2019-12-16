import React, { Component } from 'react';
import { View, Keyboard, ImageBackground, Text, Alert, StatusBar, FlatList, TextInput, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import styles from './styles';
import { appNavMenuVisibilityAction, resetMessageCountAction, updateChatDatatAction, resetChatMessageAction } from '../../actions';
import { ShifterButton, IconButton, LinkButton } from '../../components/buttons';
import { Thumbnail, Item, Icon as NBIcon } from 'native-base';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, PageKeys, IS_ANDROID, GET_PICTURE_BY_ID } from '../../constants';
import { ChatBubble } from '../../components/bubble';
import { sendMessage, getAllMessages, deleteMessagesById, deleteMessagesByIdForEveryone, seenMessage, getPicture, deleteAllMessages, getPictureList } from '../../api';
import { getFormattedDateFromISO } from '../../util';
import { BaseModal } from '../../components/modal';
import { Actions } from 'react-native-router-flux';
import { DefaultText } from '../../components/labels';

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
            selectedsenderId: null,
            iOSKeyboardShown: false
        };
    }

    componentDidMount() {
        lastDateTime = null;
        Keyboard.addListener('keyboardWillShow', this.toggleIOSKeyboardStatus);
        Keyboard.addListener('keyboardWillHide', this.toggleIOSKeyboardStatus);
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
        this.props.updateChatData(this.props.chatInfo);
        if (this.props.comingFrom === PageKeys.CHAT_LIST) {
            this.props.seenMessage(this.props.chatInfo.id, this.props.user.userId, this.props.isGroup, 'chatList')
        }
        else {
            this.props.seenMessage(this.props.chatInfo.id, this.props.user.userId, this.props.chatInfo.isGroup, 'chatPage')
        }
        this.props.chatInfo.isGroup && this.props.getPictureList(this.props.chatInfo.memberPictureIdList);
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevProps.chatInfo || prevProps.chatInfo.id !== this.props.chatInfo.id) {
            this.props.getAllMessages(this.props.chatInfo.id, this.props.user.userId, this.props.chatInfo.isGroup)
            this.props.updateChatData(this.props.chatInfo)
            this.props.seenMessage(this.props.chatInfo.id, this.props.user.userId, this.props.chatInfo.isGroup, 'chatPage')
        }
        if (this.props.chatData === null) {
            Actions.pop();
        }
        if (prevProps.chatData !== this.props.chatData) {
            // if (this.props.chatData.profilePictureId && !this.props.chatData.profilePicture) {
            //     this.props.getPicture(this.props.chatData.profilePictureId);
            // }
        }
    }

    toggleIOSKeyboardStatus = () => this.setState(prevState => ({ iOSKeyboardShown: !prevState.iOSKeyboardShown }));

    showAppNavigation = () => this.props.showAppNavMenu();

    clearChat = () => {
        this.props.deleteAllMessages(this.props.chatInfo.id, this.props.user.userId, this.props.isGroup)
        this.setState({ isVisibleOptionsModal: false })
    }

    onChangeMessageToBeSend = (messageToBeSend) => {
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
            this.props.sendMessage(this.props.chatInfo.isGroup, this.props.chatInfo.id, this.props.user.userId, this.state.messageToBeSend, this.props.user.name, this.props.user.nickname, this.props.user.profilePictureId);
        }

        this.setState({ messageToBeSend: '' })
    }

    chatKeyExtractor = (item) => item.messageId;

    changeToMessageSelectionMode = (messageId, senderId) => {
        this.setState({ messageSelectionMode: true, selectedMessage: { [messageId]: true }, selectedsenderId: { [senderId]: true } });
    }

    onSelectMessage = (messageId, senderId) => {
        if (this.state.messageSelectionMode === false) return
        if (this.state.selectedMessage[messageId]) return this.onUnselectMessage(messageId, senderId);
        this.setState(prevState => ({ selectedMessage: { ...prevState.selectedMessage, [messageId]: true }, selectedsenderId: { ...prevState.selectedsenderId, [senderId]: true } }));
    }

    onUnselectMessage = (messageId, senderId) => this.setState(prevState => {
        const { [messageId]: deletedKey, ...otherKeys } = prevState.selectedMessage;
        const { [senderId]: deletedKeys, ...otherIdKeys } = prevState.selectedsenderId;
        if (Object.keys(otherKeys).length === 0) {
            return { selectedMessage: null, messageSelectionMode: false, selectedsenderId: null };
        } else {
            return { selectedMessage: { ...otherKeys }, selectedsenderId: { ...otherIdKeys } };
        }
    });

    unSelectAllMessage = () => {
        this.setState({ selectedMessage: null, messageSelectionMode: false })
    }

    openDeleteModal = () => {
        // this.setState({ isVisibleDeleteModal: true })
        if (Object.keys(this.state.selectedsenderId).every(v => v === this.props.user.userId)) {
            Alert.alert(
                'Delete Messages ?',
                '',
                [
                    {
                        text: 'Delete For Everyone ', onPress: () => {
                            this.deleteMessageForEveryone()
                        }
                    },
                    { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                ],
                { cancelable: false }
            );
        }
        else {
            Alert.alert(
                'Delete Messages ?',
                '',
                [
                    {
                        text: 'Delete For Me ', onPress: () => {
                            this.deleteMessageForMe()
                        }
                    },
                    { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                ],
                { cancelable: false }
            );
        }

    }

    deleteMessageForMe = () => {
        const newChatMessages = this.props.chatMessages.filter(msg => Object.keys(this.state.selectedMessage).indexOf(msg.messageId) === -1)
        if (newChatMessages.length > 0) {
            this.props.deleteMessagesById(this.props.chatInfo.isGroup, this.props.chatInfo.id, this.props.user.userId, Object.keys(this.state.selectedMessage), newChatMessages[0])
        }
        else {
            this.props.deleteMessagesById(this.props.chatInfo.isGroup, this.props.chatInfo.id, this.props.user.userId, Object.keys(this.state.selectedMessage))
        }

        this.setState({ isVisibleDeleteModal: false, selectedMessage: null })
    }

    deleteMessageForEveryone = () => {
        const newChatMessages = this.props.chatMessages.filter(msg => Object.keys(this.state.selectedMessage).indexOf(msg.messageId) === -1)
        if (newChatMessages.length > 0) {
            this.props.deleteMessagesByIdForEveryone(this.props.chatInfo.isGroup, this.props.chatInfo.id, this.props.user.userId, Object.keys(this.state.selectedMessage), newChatMessages[0])
        }
        else {
            this.props.deleteMessagesByIdForEveryone(this.props.chatInfo.isGroup, this.props.chatInfo.id, this.props.user.userId, Object.keys(this.state.selectedMessage))
        }
        this.setState({ isVisibleDeleteModal: false, selectedMessage: null })
    }

    onCancelDeleteModal = () => {
        this.setState({ isVisibleDeleteModal: false })
    }

    onViewableItemsChanged = ({ viewableItems, changed }) => {
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
        const dateFormat = { month: 'numeric', day: 'numeric', year: '2-digit' };
        const newDate = new Date(item.date);
        return newDate.toLocaleDateString('en-US', dateFormat) + ' ' + newDate.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
    }

    getFormattedTime = (dateTime) => {
        const time = new Date(dateTime).toTimeString().substring(0, 5).split(':');
        let period = time[0] < 12 ? 'AM' : 'PM';
        if (time[0] > 12) {
            time[0] = time[0] - 12;
        }
        return `${time.join(':')} ${period}`;
    }

    onPressBackButton = () => {
        Actions.pop();
    }

    onCancelOptionsModal = () => this.setState({ isVisibleOptionsModal: false });

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

    componentWillUnmount() {
        Keyboard.removeListener('keyboardWillShow', this.toggleIOSKeyboardStatus);
        Keyboard.removeListener('keyboardWillHide', this.toggleIOSKeyboardStatus);
        this.props.resetChatMessage();
    }

    renderChatDate = (date) => {
        const todaysDate = getFormattedDateFromISO();
        let chatDate = getFormattedDateFromISO(date);
        if (todaysDate === chatDate) chatDate = 'Today';
        else if (todaysDate.split(' ').slice(-2).join() === chatDate.split(' ').slice(-2).join()) {
            if (todaysDate.split(' ')[0] - chatDate.split(' ')[0] === 1) chatDate = 'Yesterday';
        }
        return chatDate; //<DefaultText style={styles.time}>{chatDate}</DefaultText>
    }

    render() {
        const { user, chatMessages, totalUnseenMessage, chatData } = this.props;
        const { messageToBeSend, selectedMessage, isVisibleDeleteModal, isVisibleOptionsModal } = this.state;
        return <View style={styles.fill}>
            <View style={APP_COMMON_STYLES.statusBar}>
                <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
            </View>
            <View style={styles.fill}>
                {
                    selectedMessage
                        ? <View style={[styles.chatHeader, { justifyContent: 'space-between' }]}>
                            <IconButton iconProps={{ name: 'cross', type: 'Entypo', style: { fontSize: 27, color: '#fff' } }} onPress={this.unSelectAllMessage} />
                            <IconButton iconProps={{ name: 'delete', type: 'MaterialCommunityIcons', style: { fontSize: 25, color: '#fff' } }} onPress={this.openDeleteModal} />
                        </View>
                        : <View style={styles.chatHeader}>
                            <TouchableOpacity style={styles.iconPadding} onPress={this.onPressBackButton}>
                                <NBIcon name='md-arrow-round-back' type='Ionicons' style={{
                                    fontSize: 25,
                                    color: 'black'
                                }} />
                            </TouchableOpacity>
                            {
                                // chatData !== null
                                //     ? chatData.profilePicture
                                //         ? <Thumbnail style={styles.thumbnail} source={{ uri: chatData.profilePicture }} />
                                //         : <View style={styles.groupIconStyle}>
                                //             <IconButton iconProps={{ name: 'user', type: 'FontAwesome', style: { color: 'white', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(5), marginLeft: widthPercentageToDP(7), marginTop: heightPercentageToDP(0.8) } }} />
                                //         </View>
                                //     : <View style={styles.groupIconStyle}>
                                //         <IconButton iconProps={{ name: 'user', type: 'FontAwesome', style: { color: 'white', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(5), marginLeft: widthPercentageToDP(7), marginTop: heightPercentageToDP(0.8) } }} />
                                //     </View>
                            }
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                {
                                    <DefaultText numberOfLines={1} style={styles.chatHeaderName}>
                                        {
                                            this.props.chatInfo.isGroup
                                                ? this.props.chatInfo.groupName
                                                : this.props.comingFrom === PageKeys.NOTIFICATIONS
                                                    ? this.props.chatInfo.senderName
                                                    : this.props.chatInfo.name
                                        }
                                    </DefaultText>
                                }
                            </View>
                            <IconButton iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 25 } }} onPress={this.showOptionsModal} />
                        </View>
                }
                <KeyboardAvoidingView behavior={IS_ANDROID ? null : 'padding'} style={[styles.fill, !IS_ANDROID && this.state.iOSKeyboardShown ? { marginBottom: 35 } : null]}>
                    <ImageBackground style={styles.fill} source={require('../../assets/img/chat-bg.jpg')}>
                        <BaseModal isVisible={isVisibleOptionsModal} onCancel={this.onCancelOptionsModal} onPressOutside={this.onCancelOptionsModal}>
                            <View style={[APP_COMMON_STYLES.menuOptContainer, user.handDominance === 'left' ? APP_COMMON_STYLES.leftDominantCont : null]}>
                                {
                                    this.renderMenuOptions()
                                }
                            </View>
                        </BaseModal>
                        <View style={styles.fill}>
                            <FlatList
                                ref={'flatList'}
                                contentContainerStyle={styles.chatArea}
                                data={chatMessages}
                                keyExtractor={this.chatKeyExtractor}
                                inverted={true}
                                onViewableItemsChanged={this.onViewableItemsChanged}
                                extraData={{ selectedMsg: this.state.selectedMessage, thumbnailPics: this.props.memberPictures }}
                                // onContentSizeChange={() => { this.refs.flatList.scrollToEnd({ animated: false }) }}
                                renderItem={({ item, index }) => {
                                    const showDate = index === chatMessages.length - 1 || chatMessages[index + 1].date.substring(0, 10) !== item.date.substring(0, 10);
                                    if (item.senderId === user.userId) {
                                        const isMyLastMsg = index === 0 || chatMessages[index - 1].senderId !== user.userId;
                                        return <View style={{ flexDirection: 'column', marginTop: 2 }}>
                                            {/* {showDate && this.renderChatDate(item.date)} */}
                                            <Item style={{ borderBottomWidth: 0, justifyContent: 'flex-end' }}>
                                                <ChatBubble
                                                    messageTime={this.getFormattedTime(item.date)}
                                                    messageDate={showDate && this.renderChatDate(item.date)}
                                                    message={item.content}
                                                    bubbleStyle={[styles.myMsgBubble, isMyLastMsg ? { borderBottomRightRadius: 0 } : null]}
                                                    bubbleNameStyle={styles.friendName}
                                                    onLongPress={() => this.changeToMessageSelectionMode(item.messageId, item.senderId)}
                                                    selectedMessage={selectedMessage && selectedMessage[item.messageId]}
                                                    onPress={() => this.onSelectMessage(item.messageId, item.senderId)}
                                                />
                                                {/* {
                                                    isMyLastMsg
                                                        ? <Thumbnail style={[styles.thumbnail, { marginLeft: 5 }]} source={{ uri: user.thumbnailProfilePicture }} />
                                                        : <View style={{ marginRight: styles.thumbnail.width + 5 }} />
                                                } */}
                                                <View style={{ marginRight: styles.thumbnail.width + 5 }} />
                                            </Item>
                                        </View>
                                    } else {
                                        const isMemberLastMsg = index === 0 || chatMessages[index - 1].senderId !== item.senderId;
                                        return <View style={{ flexDirection: 'column', marginTop: 2 }}>
                                            {/* {showDate && this.renderChatDate(item.date)} */}
                                            <Item style={{ borderBottomWidth: 0 }}>
                                                {
                                                    isMemberLastMsg
                                                        ? this.props.chatInfo.isGroup
                                                            ? (chatData && chatData.memberPictures)
                                                                ? <Thumbnail style={[styles.thumbnail, { marginRight: 5 }]} source={{ uri: `${GET_PICTURE_BY_ID}${item.senderPictureId}` }} />
                                                                : <View style={{ marginRight: styles.thumbnail.width + 5 }} />
                                                            : <Thumbnail style={[styles.thumbnail, { marginRight: 5 }]} source={{ uri: `${GET_PICTURE_BY_ID}${chatData.profilePictureId}` }} />
                                                        : <View style={{ marginRight: styles.thumbnail.width + 5 }} />
                                                }
                                                <ChatBubble
                                                    bubbleName={this.props.chatInfo.isGroup ? item.senderName.split(' ')[0] : ''}
                                                    messageTime={this.getFormattedTime(item.date)}
                                                    messageDate={showDate && this.renderChatDate(item.date)}
                                                    message={item.content}
                                                    bubbleStyle={[styles.friendMsgBubble, isMemberLastMsg ? { borderBottomLeftRadius: 0 } : null]}
                                                    bubbleNameStyle={styles.friendName}
                                                    onLongPress={() => this.changeToMessageSelectionMode(item.messageId, item.senderId)}
                                                    selectedMessage={selectedMessage && selectedMessage[item.messageId]}
                                                    onPress={() => this.onSelectMessage(item.messageId, item.senderId)}
                                                />
                                            </Item>
                                        </View>
                                    }
                                }}
                            />
                            {
                                this.state.isNewMessage
                                    ? <View>
                                        <IconButton style={styles.scrollToLastIcnCont} iconProps={{ name: 'angle-double-down', type: 'FontAwesome', style: { color: 'black' } }} onPress={this.goToLastMessage} />
                                        {
                                            totalUnseenMessage > 0 ?
                                                <View style={{ backgroundColor: APP_COMMON_STYLES.infoColor, position: 'absolute', bottom: heightPercentageToDP(6), right: widthPercentageToDP(7), height: heightPercentageToDP(3), minWidth: widthPercentageToDP(5), borderRadius: widthPercentageToDP(3), textAlign: 'center', justifyContent: 'center' }}>
                                                    <DefaultText style={{ color: '#FFFFFF', textAlign: 'center', fontSize: heightPercentageToDP(1.7) }}>{totalUnseenMessage}</DefaultText>
                                                </View>
                                                : null
                                        }
                                    </View>
                                    : null
                            }

                        </View>
                        <ShifterButton onPress={this.showAppNavigation} containerStyles={styles.shifterContainer} alignLeft={this.props.user.handDominance === 'left'} />
                    </ImageBackground>
                    <View style={[styles.footer, this.props.hasNetwork === false ? { marginBottom: heightPercentageToDP(8.2) } : null]}>
                        <View style={styles.inputCont}>
                            <TextInput style={styles.inputBox} value={messageToBeSend} placeholder='Type a message...' placeholderTextColor='#3E3E3E' multiline={true} onChangeText={this.onChangeMessageToBeSend} />
                        </View>
                        {/* <IconButton style={styles.footerRtIcnCont} iconProps={{ name: 'md-send', type: 'Ionicons', style: styles.footerRightIcon }} onPress={() => this.sendMessage()} /> */}
                        <IconButton style={styles.footerRtIcnCont} iconProps={{ name: 'md-arrow-round-back', type: 'Ionicons', style: styles.footerRightIcon }} onPress={() => this.sendMessage()} />
                    </View>
                </KeyboardAvoidingView>
            </View>
        </View >
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { chatMessages, isScroll, totalUnseenMessage, chatData, chatList } = state.ChatList;
    const { hasNetwork } = state.PageState
    return { user, chatMessages, isScroll, totalUnseenMessage, chatData, chatList, hasNetwork };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        getAllMessages: (id, userId, isGroup) => dispatch(getAllMessages(id, userId, isGroup)),
        seenMessage: (id, userId, isGroup, comingFrom) => dispatch(seenMessage(id, userId, isGroup, comingFrom)),
        deleteAllMessages: (id, userId, isGroup) => dispatch(deleteAllMessages(id, userId, isGroup)),
        sendMessage: (isGroup, id, userId, content, name, nickname, picId) => dispatch(sendMessage(isGroup, id, userId, content, name, nickname, picId)),
        deleteMessagesById: (isGroup, id, userId, messageToBeDeleted, newChatMessages) => dispatch(deleteMessagesById(isGroup, id, userId, messageToBeDeleted, newChatMessages)),
        deleteMessagesByIdForEveryone: (isGroup, id, userId, messageToBeDeleted, newChatMessages) => dispatch(deleteMessagesByIdForEveryone(isGroup, id, userId, messageToBeDeleted, newChatMessages)),
        resetMessageCount: () => dispatch(resetMessageCountAction({ resetTotalUnseen: true })),
        updateChatData: (chatData) => dispatch(updateChatDatatAction({ chatData: chatData })),
        getPicture: (pictureId) => getPicture(pictureId, (response) => {
            console.log('getPicture chat : ', response);
            dispatch(updateChatDatatAction({ profilePicture: response.picture }))
        }, (error) => console.log("getPicture error: ", error)),
        getPictureList: (idList) => getPictureList(idList, (pictureObj) => {
            dispatch(updateChatDatatAction({ pictureObj }));
        }, (error) => {
            console.log('getPictureList error :  ', error);
        }),
        resetChatMessage: () => dispatch(resetChatMessageAction())
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Chat);