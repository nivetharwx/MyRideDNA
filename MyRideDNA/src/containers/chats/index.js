import React, { Component } from 'react';
import { View, Keyboard, ImageBackground, Image, Animated, Alert, StatusBar, ActivityIndicator, FlatList, TextInput, KeyboardAvoidingView, TouchableOpacity, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import styles, { FOOTER_HEIGHT } from './styles';
import { appNavMenuVisibilityAction, resetMessageCountAction, updateChatDatatAction, resetChatMessageAction } from '../../actions';
import { ShifterButton, IconButton, LinkButton } from '../../components/buttons';
import { Thumbnail, Item, Icon as NBIcon } from 'native-base';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, PageKeys, IS_ANDROID, GET_PICTURE_BY_ID, CHAT_CONTENT_TYPE, CUSTOM_FONTS, THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG, ScreenDimensions } from '../../constants';
import { ChatBubble } from '../../components/bubble';
import { sendMessage, getAllMessages, deleteMessagesById, deleteMessagesByIdForEveryone, seenMessage, getPicture, deleteAllMessages, getPictureList } from '../../api';
import { getFormattedDateFromISO } from '../../util';
import { BaseModal } from '../../components/modal';
import { Actions } from 'react-native-router-flux';
import { DefaultText } from '../../components/labels';
import ImagePicker from 'react-native-image-crop-picker';

class Chat extends Component {
    CHAT_OPTIONS = [{ text: 'Clear Chat', id: 'clearAll', handler: () => this.clearChat() }, { text: 'Close', id: 'close', handler: () => this.hideOptionsModal() }];
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
            iOSKeyboardShown: false,
            pickerAnim: new Animated.Value(0),
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

    getImageFromCamera = () => {
        this.hidePicker(0);
        Actions.push(PageKeys.SELECTED_IMAGES_VIEW, { fromGallery: false, sendMessage: this.sendMessage });
    }

    getImageFromGallery = () => {
        this.hidePicker(0);
        Actions.push(PageKeys.SELECTED_IMAGES_VIEW, { fromGallery: true, sendMessage: this.sendMessage });
    }

    toggleIOSKeyboardStatus = () => {
        this.setState(prevState => ({ iOSKeyboardShown: !prevState.iOSKeyboardShown }));
    }

    showAppNavigation = () => this.props.showAppNavMenu();

    clearChat = () => {
        this.setState({ isVisibleOptionsModal: false });
        setTimeout(() => Alert.alert(
            'Delete Confirmation',
            'Are you sure to delete all the messages?',
            [
                {
                    text: 'Delete', onPress: () => this.props.deleteAllMessages(this.props.chatInfo.id, this.props.user.userId, this.props.isGroup)
                },
                { text: 'Cancel', onPress: () => { }, style: 'cancel' },
            ],
            { cancelable: false }
        ), 100);
    }

    onChangeMessageToBeSend = (messageToBeSend) => {
        this.setState({ messageToBeSend });
    }

    sendMessage = (message, images) => {
        // if (this.props.isGroup) {
        //     this.props.sendMessage(this.props.isGroup, this.props.group.groupId, this.props.user.userId, this.state.messageToBeSend, this.props.user.name, this.props.user.nickname);
        //     this.setState({ messageToBeSend: '' })
        // }
        // else {
        //     this.props.sendMessage(this.props.isGroup, this.props.friend.userId, this.props.user.userId, this.state.messageToBeSend, this.props.user.nickname);
        //     
        // }
        // const imgsToSend = this.state.selectedImgs.filter(item => !item.isHidden);
        // if (message === '' && images.length === 0) return;

        const data = [this.props.chatInfo.isGroup, this.props.chatInfo.id, this.props.user.userId, message, this.props.user.name, this.props.user.nickname, this.props.user.profilePictureId];
        if (images.length > 0) {
            data.push(CHAT_CONTENT_TYPE.IMAGE);
            data.push(images);
        } else {
            data.push(CHAT_CONTENT_TYPE.TEXT);
            this.setState({ messageToBeSend: '' });
        }
        this.props.sendMessage(...data);
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

    showOptionsModal = () => {
        this.state.pickerAnim.__getValue() > 0 && this.hidePicker(0);
        this.setState({ isVisibleOptionsModal: true });
    }

    hideOptionsModal = () => this.setState({ isVisibleOptionsModal: false });

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

    componentWillUnmount() {
        Keyboard.removeListener('keyboardWillShow', this.toggleIOSKeyboardStatus);
        Keyboard.removeListener('keyboardWillHide', this.toggleIOSKeyboardStatus);
        this.props.resetChatMessage();
    }

    showPicker = () => {
        Animated.timing(
            this.state.pickerAnim,
            {
                toValue: heightPercentageToDP(100),
                duration: 300,
                // useNativeDriver: true
            }
        ).start();
    }

    hidePicker(delay = 300) {
        Animated.timing(
            this.state.pickerAnim,
            {
                toValue: 0,
                duration: delay,
                // useNativeDriver: true
            }
        ).start();
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

    imgKeyExtractor = (item) => item.localIdentifier;

    renderChatBubble = ({ item, index }) => {
        const { user, chatMessages } = this.props;
        const { selectedMessage } = this.state;
        const showDate = index === chatMessages.length - 1 || chatMessages[index + 1].date.substring(0, 10) !== item.date.substring(0, 10);
        if (item.senderId === user.userId) {
            const isMyLastMsg = index === 0 || chatMessages[index - 1].senderId !== user.userId;
            return <View style={{ flexDirection: 'column', marginTop: 2 }}>
                {/* {showDate && this.renderChatDate(item.date)} */}
                <Item style={{ borderBottomWidth: 0, justifyContent: 'flex-end' }}>
                    {
                        item.type === CHAT_CONTENT_TYPE.TEXT
                            ? <ChatBubble
                                messageTime={this.getFormattedTime(item.date)}
                                messageDate={showDate && this.renderChatDate(item.date)}
                                message={item.content}
                                bubbleStyle={[styles.myMsgBubble, isMyLastMsg ? { borderBottomRightRadius: 0 } : null]}
                                bubbleNameStyle={styles.friendName}
                                onLongPress={() => this.changeToMessageSelectionMode(item.messageId, item.senderId)}
                                selectedMessage={selectedMessage && selectedMessage[item.messageId]}
                                onPress={() => this.onSelectMessage(item.messageId, item.senderId)}
                            />
                            : this.renderImageContent(item, { backgroundColor: selectedMessage && selectedMessage[item.messageId] ? '#99C8F7' : styles.myMsgBubble.backgroundColor, borderBottomRightRadius: isMyLastMsg ? 0 : styles.mediaMsgContainer.borderRadius })
                    }
                    <View style={{ marginRight: styles.thumbnail.width + 5 }} />
                </Item>
            </View>
        } else {
            const isMemberLastMsg = index === 0 || chatMessages[index - 1].senderId !== item.senderId;
            return <View style={{ flexDirection: 'column', marginTop: 2 }}>
                {/* {showDate && this.renderChatDate(item.date)} */}
                <Item style={{ borderBottomWidth: 0, justifyContent: 'flex-start' }}>
                    {
                        isMemberLastMsg
                            ? item.senderPictureId
                                ? <Thumbnail style={[styles.thumbnail, { marginRight: 5 }]} source={{ uri: `${GET_PICTURE_BY_ID}${item.senderPictureId}` }} />
                                : <View style={{ marginRight: styles.thumbnail.width + 5 }} />
                            : <View style={{ marginRight: styles.thumbnail.width + 5 }} />
                    }
                    {
                        item.type === CHAT_CONTENT_TYPE.TEXT
                            ? <ChatBubble
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
                            : this.renderImageContent(item, { backgroundColor: selectedMessage && selectedMessage[item.messageId] ? '#99C8F7' : styles.friendMsgBubble.backgroundColor, borderBottomLeftRadius: isMemberLastMsg ? 0 : styles.mediaMsgContainer.borderRadius })
                    }
                </Item>
            </View>
        }
    }

    renderImageContent = (item, containerStyle) => {
        const width = (widthPercentageToDP(100) - (styles.chatArea.paddingHorizontal * 2) - styles.thumbnail.width - 10);
        const imgWidth = width - 18;
        return <TouchableOpacity activeOpacity={1} style={[styles.mediaMsgContainer, containerStyle]}
            onLongPress={() => this.changeToMessageSelectionMode(item.messageId, item.senderId)} onPress={() => this.onSelectMessage(item.messageId, item.senderId)}>
            <View style={[styles.imgMsgContainer, { width }]}>
                <TouchableOpacity activeOpacity={0.8} style={[{ width: item.media[1] ? imgWidth / 2 : imgWidth, height: imgWidth / 2 }, styles.imgMsgStyle]} onLongPress={() => this.changeToMessageSelectionMode(item.messageId, item.senderId)} onPress={() => this.onTapImage(item)}>
                    <Image source={{ uri: `${GET_PICTURE_BY_ID}${item.media[0].replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` }} style={styles.squareThumbnail} />
                </TouchableOpacity>
                {
                    item.media[1]
                        ? <TouchableOpacity activeOpacity={0.8} style={[{ width: imgWidth / 2, height: imgWidth / 2 }, styles.imgMsgStyle]} onLongPress={() => this.changeToMessageSelectionMode(item.messageId, item.senderId)} onPress={() => this.onTapImage(item)}>
                            <Image source={{ uri: `${GET_PICTURE_BY_ID}${item.media[1].replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` }} style={styles.squareThumbnail} />
                        </TouchableOpacity>
                        : null
                }
                {
                    item.media[2]
                        ? <TouchableOpacity activeOpacity={0.8} style={[{ width: item.media[3] ? imgWidth / 2 : imgWidth, height: imgWidth / 2 }, styles.imgMsgStyle]} onLongPress={() => this.changeToMessageSelectionMode(item.messageId, item.senderId)} onPress={() => this.onTapImage(item)}>
                            <Image source={{ uri: `${GET_PICTURE_BY_ID}${item.media[2].replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` }} style={styles.squareThumbnail} />
                        </TouchableOpacity>
                        : null
                }
                {
                    item.media[3]
                        ? <View style={[{ width: imgWidth / 2, height: imgWidth / 2 }, styles.imgMsgStyle]}>
                            <ImageBackground source={{ uri: `${GET_PICTURE_BY_ID}${item.media[3].replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` }} style={[styles.squareThumbnail, { alignItems: 'center' }]}>
                                {
                                    item.media[4]
                                        ? <TouchableOpacity activeOpacity={0.8} style={[{ width: imgWidth / 2, height: imgWidth / 2 }, styles.imgMoreContainer]}
                                            onLongPress={() => this.changeToMessageSelectionMode(item.messageId, item.senderId)} onPress={() => this.onTapImage(item)}>
                                            <DefaultText style={styles.imgMoreTxt}>+{`${item.media.length - 4}`} more</DefaultText>
                                        </TouchableOpacity>
                                        : null
                                }
                            </ImageBackground>
                        </View>
                        : null
                }
            </View>
            <View style={{ width: imgWidth }}>
                {
                    item.content
                        ? <DefaultText style={styles.txtWithImg}>{item.content}</DefaultText>
                        : null
                }
                <DefaultText style={styles.msgTime}>{this.getFormattedTime(item.date)}</DefaultText>
            </View>
        </TouchableOpacity>
    }

    onTapImage = ({ messageId, senderId }) => {
        if (!this.state.messageSelectionMode) {
            console.log("Enlarge image");
        } else {
            this.onSelectMessage(messageId, senderId);
        }
    }

    render() {
        const { chatMessages, totalUnseenMessage } = this.props;
        const { messageToBeSend, selectedMessage, isVisibleOptionsModal } = this.state;
        return <View style={styles.fill}>
            <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={isVisibleOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                <View style={APP_COMMON_STYLES.optionsContainer}>
                    <LinkButton style={APP_COMMON_STYLES.optionBtn} title='CLEAR CHAT' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.clearChat} />
                    <LinkButton style={APP_COMMON_STYLES.optionBtn} title='CANCEL' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.hideOptionsModal} />
                </View>
            </BaseModal>
            <View style={APP_COMMON_STYLES.statusBar}>
                <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
            </View>
            <View style={styles.fill}>
                {
                    selectedMessage
                        ? <View style={[styles.chatHeader, { justifyContent: 'space-between' }]}>
                            <IconButton iconProps={{ name: 'cross', type: 'Entypo', style: { fontSize: 27, color: '#fff' } }} onPress={this.unSelectAllMessage} />
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                <DefaultText numberOfLines={1} style={[styles.chatHeaderName, { fontFamily: CUSTOM_FONTS.gotham }]}>
                                    {`${Object.keys(selectedMessage).length} selected`}
                                </DefaultText>
                            </View>
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
                                // null
                                //     ? chatData.profilePicture
                                //         ? <Thumbnail style={styles.thumbnail} source={{ uri: chatData.profilePicture }} />
                                //         : <View style={styles.groupIconStyle}>
                                //             <IconButton iconProps={{ name: 'user', type: 'FontAwesome', style: { color: 'white', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(5), marginLeft: widthPercentageToDP(7), marginTop: heightPercentageToDP(0.8) } }} />
                                //         </View>
                                //     : <View style={styles.groupIconStyle}>
                                //         <IconButton iconProps={{ name: 'user', type: 'FontAwesome', style: { color: 'white', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(5), marginLeft: widthPercentageToDP(7), marginTop: heightPercentageToDP(0.8) } }} />
                                //     </View>
                            }
                            <View style={styles.headingView}>
                                <DefaultText numberOfLines={1} style={styles.chatHeaderName}>
                                    {
                                        this.props.chatInfo.isGroup
                                            ? this.props.chatInfo.groupName
                                            : this.props.comingFrom === PageKeys.NOTIFICATIONS
                                                ? this.props.chatInfo.senderName
                                                : this.props.chatInfo.name
                                    }
                                </DefaultText>
                            </View>
                            <IconButton iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 25 } }} onPress={this.showOptionsModal} />
                        </View>
                }
                <KeyboardAvoidingView behavior={IS_ANDROID ? null : 'padding'} style={[styles.fill, !IS_ANDROID && this.state.iOSKeyboardShown ? { marginBottom: 35 } : null]}>
                    <ImageBackground style={styles.fill} source={require('../../assets/img/chat-bg.jpg')}>
                        <View style={styles.fill}>
                            <FlatList
                                ref={'flatList'}
                                contentContainerStyle={styles.chatArea}
                                data={chatMessages}
                                keyExtractor={this.chatKeyExtractor}
                                inverted={true}
                                onViewableItemsChanged={this.onViewableItemsChanged}
                                extraData={{ selectedMsg: this.state.selectedMessage, thumbnailPics: this.props.memberPictures }}
                                renderItem={this.renderChatBubble}
                            />
                            {
                                this.state.isNewMessage
                                    ? <View>
                                        <IconButton style={styles.scrollToLastIcnCont} iconProps={{ name: 'angle-double-down', type: 'FontAwesome', style: { color: 'black' } }} onPress={this.goToLastMessage} />
                                        {
                                            totalUnseenMessage > 0 ?
                                                <View style={styles.unseenMsgCountView}>
                                                    <DefaultText style={styles.unseenMsgCountTxt}>{totalUnseenMessage}</DefaultText>
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
                        <IconButton style={{ marginRight: 10, transform: [{ rotateY: '180deg' }] }} iconProps={{ name: 'camera', type: 'Entypo', style: { color: '#fff', fontSize: 18 } }} onPress={this.showPicker} />
                        <View style={styles.inputCont}>
                            <TextInput style={styles.inputBox} value={messageToBeSend} placeholder='Type a message...' placeholderTextColor='#3E3E3E' multiline={true} onChangeText={this.onChangeMessageToBeSend} />
                        </View>
                        <IconButton style={styles.footerRtIcnCont} iconProps={{ name: 'md-arrow-round-back', type: 'Ionicons', style: styles.footerRightIcon }} onPress={() => this.sendMessage(this.state.messageToBeSend)} />
                    </View>
                    <Animated.View style={[styles.picker, { height: this.state.pickerAnim }]}>
                        <TouchableOpacity activeOpacity={1} style={styles.pickerBackdrop} onPress={() => this.hidePicker(300)}>
                            <View style={APP_COMMON_STYLES.optionsContainer}>
                                <LinkButton title='Camera' style={APP_COMMON_STYLES.optionBtn} titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.getImageFromCamera} />
                                <LinkButton title='Gallery' style={[APP_COMMON_STYLES.optionBtn, styles.noBorder]} titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.getImageFromGallery} />
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </View>
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
        sendMessage: (isGroup, id, userId, content, name, nickname, picId, type, media) => dispatch(sendMessage(isGroup, id, userId, content, name, nickname, picId, type, media)),
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

const MAX_FILES_SELECTABLE = 5;
export class SelectedImagesView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            images: [],
            messageWithImage: '',
            isLoadingImage: false,
        }
    }

    componentDidMount() {
        this.fetchImage();
    }

    fetchImage(isAppend = false) {
        !isAppend && this.setState({ messageWithImage: '', images: [] });
        this.props.fromGallery
            ? this.getImageFromGallery(isAppend)
            : this.getImageFromCamera(isAppend);
    }

    getImageFromCamera = async (isAppend) => {
        this.setState({ isLoadingImage: true });
        try {
            const imgs = await ImagePicker.openCamera({
                mediaType: 'photo',
                width: 300,
                height: 300,
                includeBase64: true,
                multiple: true,
                maxFiles: MAX_FILES_SELECTABLE,
                cropping: false, // DOC: Setting this to true (in openCamera) is not working as expected (19-12-2018).
            });
            if (isAppend) {
                const remainingLength = (MAX_FILES_SELECTABLE - this.state.images.length) + this.state.images.filter(item => item.isHidden).length;
                this.setState({ isLoadingImage: false, images: [...this.state.images, ...imgs.slice(0, remainingLength).map(item => ({ mimeType: item.mime, image: item.data }))] });
            } else {
                this.setState({ isLoadingImage: false, images: imgs.slice(0, MAX_FILES_SELECTABLE).map(item => ({ mimeType: item.mime, image: item.data })) });
            }
        } catch (er) {
            this.setState({ isLoadingImage: false });
            if (!isAppend) this.goBack();
            console.log("Error occurd: ", er);
        }
    }

    getImageFromGallery = async (isAppend) => {
        this.setState({ isLoadingImage: true });
        try {
            const imgs = await ImagePicker.openPicker({
                mediaType: 'photo',
                width: 300,
                height: 300,
                cropping: false,
                multiple: true,
                maxFiles: MAX_FILES_SELECTABLE,
                includeBase64: true,
            });
            if (isAppend) {
                const remainingLength = (MAX_FILES_SELECTABLE - this.state.images.length) + this.state.images.filter(item => item.isHidden).length;
                this.setState({ isLoadingImage: false, images: [...this.state.images, ...imgs.slice(0, remainingLength).map(item => ({ mimeType: item.mime, image: item.data }))] });
            } else {
                this.setState({ isLoadingImage: false, images: imgs.slice(0, MAX_FILES_SELECTABLE).map(item => ({ mimeType: item.mime, image: item.data })) });
            }
        } catch (er) {
            this.setState({ isLoadingImage: false });
            if (!isAppend) this.goBack();
            console.log("Error occurd: ", er);
        }
    }

    onChangeMessageWithImage = (messageWithImage) => this.setState({ messageWithImage });

    imgKeyExtractor = (item) => item.localIdentifier;

    unselectImg = (idx) => this.setState(prevState => {
        const hiddenImgCount = prevState.images.filter(item => item.isHidden).length + 1;
        if (hiddenImgCount === prevState.images.length) {
            return { images: [] };
        } else {
            const newArr = [
                ...prevState.images.slice(0, idx),
                { ...prevState.images.slice(idx), isHidden: true },
                ...prevState.images.slice(idx + 1)
            ];
            return { images: newArr };
        }
    }, () => {
        if (this.state.images.length > 0) return;
        this.fetchImage();
    });

    renderSelectedImg = (item, index) => {
        return <View key={index + ''} style={[styles.thumbnailContainer, item.isHidden ? { display: 'none' } : null]}>
            <ImageBackground source={{ uri: `data:${item.mimeType};base64,${item.image}` }} style={styles.squareThumbnail}>
                <IconButton style={styles.closeIconContainer} iconProps={{ name: 'close', type: 'Ionicons', style: styles.closeIcon }} onPress={() => this.unselectImg(index)} />
            </ImageBackground>
        </View>
    }

    goBack = () => Actions.pop();

    returnContent = () => {
        if (this.state.images.length === 0) return;
        this.props.sendMessage(this.state.messageWithImage, this.state.images.filter(item => !item.isHidden));
        this.goBack();
    }

    render() {
        const { messageWithImage, images, isLoadingImage } = this.state;
        const selectedImgCount = images.filter(item => !item.isHidden).length;
        return <View style={styles.fill}>
            <View style={APP_COMMON_STYLES.statusBar}>
                <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
            </View>
            <View style={styles.fill}>
                <View style={styles.chatHeader}>
                    <TouchableOpacity style={styles.iconPadding} onPress={this.goBack}>
                        <NBIcon name='md-arrow-round-back' type='Ionicons' style={{
                            fontSize: 25,
                            color: 'black'
                        }} />
                    </TouchableOpacity>
                    <View style={styles.headingView}>
                        {selectedImgCount > 0 ? <DefaultText numberOfLines={1} style={styles.chatHeaderName}>{`${selectedImgCount} selected`}</DefaultText> : null}
                    </View>
                    <IconButton iconProps={{ name: 'close', type: 'MaterialCommunityIcons', style: { color: '#fff', fontSize: 25 } }} onPress={() => this.fetchImage()} />
                </View>
                <KeyboardAvoidingView behavior={IS_ANDROID ? null : 'padding'} style={[styles.fill]}>
                    <View style={[styles.fill, { backgroundColor: '#fff' }]}>
                        <ScrollView>
                            <View style={styles.imagesContainer}>
                                {
                                    images.filter(item => item.isHidden).length !== images.length
                                        ? images.map(this.renderSelectedImg)
                                        : null
                                }
                            </View>
                        </ScrollView>
                        <View style={styles.imgLoaderView}>
                            <ActivityIndicator size='large' animating={isLoadingImage} />
                        </View>
                    </View>
                    <View style={[styles.footer, this.props.hasNetwork === false ? { marginBottom: heightPercentageToDP(8.2) } : null]}>
                        <IconButton style={{ marginRight: 10, transform: [{ rotateY: '180deg' }] }} iconProps={{ name: 'camera', type: 'Entypo', style: { color: '#fff', fontSize: 18 } }} onPress={() => this.fetchImage(true)} />
                        <View style={styles.inputCont}>
                            <TextInput style={styles.inputBox} value={messageWithImage} placeholder='Type a message...' placeholderTextColor='#3E3E3E' multiline={true} onChangeText={this.onChangeMessageWithImage} />
                        </View>
                        <IconButton style={styles.footerRtIcnCont} iconProps={{ name: 'md-arrow-round-back', type: 'Ionicons', style: styles.footerRightIcon }} onPress={this.returnContent} />
                    </View>
                </KeyboardAvoidingView>
            </View>
        </View>
    }
}