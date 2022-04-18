import React, { Component } from 'react';
import { View, ImageBackground, Image, Animated, Alert, ActivityIndicator, FlatList, TextInput, KeyboardAvoidingView, TouchableOpacity, ScrollView, Keyboard, Text } from 'react-native';
import { connect } from 'react-redux';
import styles, { FOOTER_HEIGHT } from './styles';
import { appNavMenuVisibilityAction, resetMessageCountAction, updateChatDatatAction, resetChatMessageAction, screenChangeAction, apiLoaderActions, resetErrorHandlingAction, setCurrentFriendAction } from '../../actions';
import { BasicButton, IconButton, LinkButton } from '../../components/buttons';
import { Thumbnail, Item, Icon as NBIcon, Toast } from 'native-base';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, PageKeys, IS_ANDROID, GET_PICTURE_BY_ID, CHAT_CONTENT_TYPE, CUSTOM_FONTS, THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG, RIDE_TYPE, MEDIUM_TAIL_TAG } from '../../constants';
import { ChatBubble } from '../../components/bubble';
import { sendMessage, getAllMessages, deleteMessagesById, deleteMessagesByIdForEveryone, seenMessage, deleteAllMessages, getPictureList, getRideByRideId, copySharedRide, getAllRidesByUserId, handleServiceErrors, getAllChats, getLikes } from '../../api';
import { getFormattedDateFromISO } from '../../util';
import { BaseModal, GesturedCarouselModal } from '../../components/modal';
import { Actions } from 'react-native-router-flux';
import { DefaultText } from '../../components/labels';
import ImagePicker from 'react-native-image-crop-picker';
import { SquareCard } from '../../components/cards';
import { BasePage } from '../../components/pages';
import RNFetchBlob from 'rn-fetch-blob';
import Permissions from 'react-native-permissions';
import CameraRoll from '@react-native-community/cameraroll';
import store from '../../store';
import ImageViewer from 'react-native-image-viewing'


class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messageToBeSend: '',
            selectedMessage: null,
            messageSelectionMode: false,
            isVisibleDeleteModal: false,
            isNewMessage: false,
            selectedsenderId: null,
            pickerAnim: new Animated.Value(0),
            enlargeContent: null,
            isVisibleMediaOptions: false,
            showSwipingPictureModal: false,
            pictureIds: null,
            isVisibleOptions: false,
            iOSKeyboardHeight: 0,
            showDeactivatedAlert: true,
            showDeleteModal:false,
        };
    }

    componentDidMount() {
        console.log('////component did moount called')
        // console.log('////component did moount called',this.props.comingFrom)
        this.props.getAllMessages(this.props.chatInfo.id, this.props.user.userId, this.props.chatInfo.isGroup)
        this.props.updateChatData(this.props.chatInfo);
        if (this.props.comingFrom === PageKeys.CHAT_LIST) {
            console.log('\n\n\n didMlount chat')
            this.props.seenMessage(this.props.chatInfo.id, this.props.user.userId, this.props.isGroup, 'chatList')
        }
        else {
            this.props.seenMessage(this.props.chatInfo.id, this.props.user.userId, this.props.chatInfo.isGroup, 'chatList')
        }
        // this.props.chatInfo.isGroup && this.props.getPictureList(this.props.chatInfo.memberPictureIdList);
        this.subscribeKeyboardListeners();
        this.props.chatInfo.status === 'deactivated' && this.state.showDeactivatedAlert && this.alertBoxForDeactivatedUser()
        // this.props.seenMessage(this.props.chatInfo.id, this.props.user.userId, this.props.isGroup, 'chatList')
    }

    subscribeKeyboardListeners() {
        if (IS_ANDROID === false) {
            Keyboard.addListener('keyboardDidShow', this.setIOSKeyboardHeight);
            Keyboard.addListener('keyboardWillHide', this.resetIOSKeyboardHeight);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.ride.rideId && (prevProps.ride.rideId !== this.props.ride.rideId)) {
            this.props.changeScreen({ name: PageKeys.MAP });
        }
        if (!prevProps.chatInfo || prevProps.chatInfo.id !== this.props.chatInfo.id) {
            this.props.getAllMessages(this.props.chatInfo.id, this.props.user.userId, this.props.chatInfo.isGroup)
            this.props.updateChatData(this.props.chatInfo)
            this.props.seenMessage(this.props.chatInfo.id, this.props.user.userId, this.props.chatInfo.isGroup, 'chatPage')
        }
        // if (this.props.chatData === null) {
        //     console.log('\n\n\n  Actions.pop   didUpdatechat ')
        //     Actions.pop();
        // }

        if (prevProps.hasNetwork === false && this.props.hasNetwork === true) {
            this.retryApiFunc();
        }

        if (prevProps.isRetryApi === false && this.props.isRetryApi === true) {
            if (Actions.currentScene === this.props.lastApi.currentScene) {
                Alert.alert(
                    'Something went wrong ',
                    '',
                    [
                        {
                            text: 'Retry ', onPress: () => {
                                this.retryApiFunc();
                                this.props.resetErrorHandling(false)
                            }
                        },
                        { text: 'Cancel', onPress: () => { this.props.resetErrorHandling(false) }, style: 'cancel' },
                    ],
                    { cancelable: false }
                )
            }
        }
    }

    retryApiFunc = () => {
        if (this.props.lastApi && this.props.lastApi.currentScene === Actions.currentScene) {
            this.props[`${this.props.lastApi.api}`](...this.props.lastApi.params)
        }
    }

    setIOSKeyboardHeight = (e) => {
        this.setState({ iOSKeyboardHeight: e.endCoordinates.height });
        Actions.currentScene === PageKeys.SELECTED_MEDIA_VIEW && Actions.refresh({ iOSKeyboardHeight: e.endCoordinates.height });
    }

    resetIOSKeyboardHeight = () => {
        this.setState({ iOSKeyboardHeight: 0 });
        Actions.currentScene === PageKeys.SELECTED_MEDIA_VIEW && Actions.refresh({ iOSKeyboardHeight: 0 });
    }


    getImageFromCamera = () => {
        this.hidePicker(0);
        Actions.push(PageKeys.SELECTED_MEDIA_VIEW, {
            fromCamera: true, sendMessage: this.sendMessage, message: this.state.messageToBeSend,
            comingFrom: Actions.currentScene, iOSKeyboardHeight: this.state.iOSKeyboardHeight
        });
    }

    getImageFromGallery = () => {
        this.hidePicker(0);
        Actions.push(PageKeys.SELECTED_MEDIA_VIEW, {
            fromGallery: true, sendMessage: this.sendMessage, message: this.state.messageToBeSend,
            comingFrom: Actions.currentScene, iOSKeyboardHeight: this.state.iOSKeyboardHeight
        });
    }

    getSharableRides = () => {
        this.hidePicker(0);
        Actions.push(PageKeys.SELECTED_MEDIA_VIEW, {
            fromRides: true, userId: this.props.user.userId, shareRide: this.shareRide, message: this.state.messageToBeSend,
            comingFrom: Actions.currentScene, iOSKeyboardHeight: this.state.iOSKeyboardHeight
        });
    }

    showAppNavigation = () => this.props.showAppNavMenu();

    clearChat = () => {
        this.props.deleteAllMessages(this.props.chatInfo.id, this.props.user.userId, this.props.isGroup,(res)=>{
            this.setState({ isVisibleOptions: false, showDeleteModal:false });
            this.onPressBackButton();
        },(er)=>{})
    }

    onChangeMessageToBeSend = (messageToBeSend) => this.setState({ messageToBeSend });

    sendMessage = (message, images) => {
        this.setState({ messageToBeSend: '' });
        Keyboard.dismiss();
        if (message === '' && (!images || images.length === 0)) return;
        const data = {
            userId: this.props.user.userId, name: this.props.user.name, nickname: this.props.user.nickname,
            senderPictureId: this.props.user.profilePictureId,
            content: message,
        };

        if (this.props.chatInfo.isGroup) {
            data.groupIds = [this.props.chatInfo.id]
        }
        else {
            data.userIds = [this.props.chatInfo.id]
        }

        if (images && images.length > 0) {
            data.type = CHAT_CONTENT_TYPE.IMAGE;
            data.media = images;
        } else {
            data.type = CHAT_CONTENT_TYPE.TEXT;
        }
        this.props.sendMessage(data);
    }

    shareRide = (rideId) => {
        const data = {
            userId: this.props.user.userId, name: this.props.user.name, nickname: this.props.user.nickname,
            senderPictureId: this.props.user.profilePictureId,
            content: rideId, type: CHAT_CONTENT_TYPE.RIDE
        };
        if (this.props.chatInfo.isGroup) {
            data.groupIds = [this.props.chatInfo.id]
        }
        else {
            data.userIds = [this.props.chatInfo.id]
        }

        this.props.sendMessage(data);
    }

    chatKeyExtractor = (item) => item.messageId;

    changeToMessageSelectionMode = (messageId, senderId) => {
        this.setState({ messageSelectionMode: true, selectedMessage: { [messageId]: true }, selectedsenderId: { [senderId]: true } });
    }

    getFormattedDateForRide = (isoDateString) => {
        const dateInfo = new Date(isoDateString).toString().substr(4, 12).split(' ');
        return `${dateInfo[0]} ${dateInfo[1]}, ${dateInfo[2]}`;
    }

    onSelectMessage = (messageId, senderId) => {
        Keyboard.dismiss();
        if (this.state.messageSelectionMode === false) return
        if (this.state.selectedMessage && this.state.selectedMessage[messageId]) return this.onUnselectMessage(messageId, senderId);
        this.setState(prevState => ({ selectedMessage: { ...prevState.selectedMessage, [messageId]: true }, selectedsenderId: { ...prevState.selectedsenderId, [senderId]: true } }));
    }

    onUnselectMessage = (messageId, senderId) => this.setState(prevState => {
        const { [messageId]: deletedKey, ...otherKeys } = prevState.selectedMessage;
        const { [senderId]: deletedKeys, ...otherIdKeys } = prevState.selectedsenderId;
        if (Object.keys(otherKeys).length === 0) {
            return { selectedMessage: null, selectedsenderId: null };
        } else {
            return { selectedMessage: { ...otherKeys }, selectedsenderId: { ...otherIdKeys } };
        }
    });

    unSelectAllMessage = () => {
        this.setState({ selectedMessage: null, messageSelectionMode: false })
    }

    openDeleteSingleMessageModal = () => {
        if (Object.keys(this.state.selectedsenderId).every(v => v === this.props.user.userId)) {
            Alert.alert(
                'Delete Messages ?',
                '',
                [
                    {
                        text: 'Delete', onPress: () => {
                            this.deleteMessageForEveryone();
                            this.setState({ messageSelectionMode: false });
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
                        text: 'Delete', onPress: () => {
                            this.deleteMessageForMe();
                            this.setState({ messageSelectionMode: false });
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
        if(this.props.isChatSearchPage){
            Actions.jump(PageKeys.CHAT_LIST);
        }
        else{
            Actions.pop();
        }
    }

    showMediaOptions = () => this.setState({ isVisibleMediaOptions: true });

    hideMediaOptions = () => this.setState({ isVisibleMediaOptions: false });

    showOptionsModal = () => {
        this.state.pickerAnim._value > 0 && this.hidePicker(0);
        this.setState({ isVisibleOptions: true });
    }

    hideOptionsModal = () => this.setState({ isVisibleOptions: false });

    componentWillUnmount() {
        if (this.props.chatList.findIndex(list => list.id === this.props.chatInfo.id) === -1 && this.props.chatMessages.length > 0) {
            this.props.getAllChats(this.props.user.userId)
        }
        this.props.resetChatMessage();
        this.unsubscribeKeyboardListeners();
    }

    unsubscribeKeyboardListeners() {
        if (IS_ANDROID === false) {
            Keyboard.removeListener('keyboardDidShow', this.setIOSKeyboardHeight);
            Keyboard.removeListener('keyboardWillHide', this.resetIOSKeyboardHeight);
        }
    }

    showPicker = () => {
        Keyboard.dismiss();
        Animated.timing(
            this.state.pickerAnim,
            {
                toValue: heightPercentageToDP(100),
                duration: 0,
            }
        ).start();
    }

    hidePicker() {
        Animated.timing(
            this.state.pickerAnim,
            {
                toValue: 0,
                duration: 0,
            }
        ).start();
    }

    openContent = (enlargeContent) => {
        const content = enlargeContent.type === CHAT_CONTENT_TYPE.RIDE ? JSON.parse(enlargeContent.content).name : enlargeContent.content;
        const ids = enlargeContent.media
            ? enlargeContent.media.map(item => ({ id: item, description: content }))
            : content ? [{ description: content }] : [];
        this.setState({ enlargeContent, pictureIds: ids, showSwipingPictureModal: true });
    }

    onCancelVisiblePicture = () => this.setState({ enlargeContent: null, showSwipingPictureModal: false, pictureIds: null });

    onPressAdvanceRight = () => this.setState((prevState) => ({ enlargeContent: { ...prevState.enlargeContent, index: prevState.enlargeContent.index + 1 } }));

    onPressAdvanceLeft = () => this.setState((prevState) => ({ enlargeContent: { ...prevState.enlargeContent, index: prevState.enlargeContent.index - 1 } }));

    renderChatDate = (date) => {
        const todaysDate = getFormattedDateFromISO();
        let chatDate = getFormattedDateFromISO(date);
        if (todaysDate === chatDate) chatDate = 'Today';
        else if (todaysDate.split(' ').slice(-2).join() === chatDate.split(' ').slice(-2).join()) {
            if (todaysDate.split(' ')[0] - chatDate.split(' ')[0] === 1) chatDate = 'Yesterday';
        }
        return <DefaultText style={[styles.time, { paddingVertical: 0, marginVertical: 0, marginTop: 5 }]}>{chatDate}</DefaultText>;
    }

    imgKeyExtractor = (item) => item.localIdentifier;

    loadRideOnMap(item) {
        if (this.state.messageSelectionMode) {
            this.onSelectMessage(item.messageId, item.senderId);
            return;
        }
        this.hideMediaOptions();
        this.onCancelVisiblePicture();
        // console.log(item)
        const ride = JSON.parse(item.content);
        if (this.props.ride.rideId === ride.id) {
            this.props.changeScreen({ name: PageKeys.MAP });
            return;
        }
        if (this.props.ride.rideId) {
            this.props.clearRideFromMap();
        }
        this.props.loadRideOnMap(ride.id, { rideType: ride.isRecorded ? RIDE_TYPE.RECORD_RIDE : RIDE_TYPE.BUILD_RIDE });
    }

    copyRide = () => {
        this.hideMediaOptions();
        this.onCancelVisiblePicture();
        const ride = JSON.parse(this.state.enlargeContent.content);
        this.props.copySharedRide(ride.id, `Copy of ${ride.name}`,
            RIDE_TYPE.BUILD_RIDE, this.props.user.userId, new Date().toISOString(),
            () => Toast.show({ text: 'Ride copied to your created rides' })
        );
    }

    downloadFile = async () => {
        const { enlargeContent } = this.state;
        const IMG_ID = `${enlargeContent.media[enlargeContent.index].replace(THUMBNAIL_TAIL_TAG, '')}`;
        this.hideMediaOptions();
        this.onCancelVisiblePicture();
        Toast.show({ text: `Downloading the image...` });
        if (IS_ANDROID) {
            try {
                const { dirs } = RNFetchBlob.fs;
                await RNFetchBlob.config({ path: `${dirs.PictureDir}/${IMG_ID}.png` }).fetch('GET', `${GET_PICTURE_BY_ID}${IMG_ID}`);
                await RNFetchBlob.fs.scanFile([{ path: `${dirs.PictureDir}/${IMG_ID}.png`, mime: 'image/png' }]);
                Toast.show({ text: `Image has been saved to the gallery` });
                // RNFetchBlob.android.actionViewIntent(`${dirs.PictureDir}/${IMG_ID}.png`, 'image/png'); // DOC: To open default image viewer
            } catch (error) {
                // console.log("Error occured: ", error);
            }
        } else {
            try {
                await CameraRoll.saveToCameraRoll(`${GET_PICTURE_BY_ID}${IMG_ID}`, 'photo');
                Toast.show({ text: `Image has been saved to the gallery` });
            } catch (error) {
                // console.log("Error occured: ", error);
            }
        }
    }

    checkForWritePermission = async () => {
        try {
            const granted = await Permissions.request(
                IS_ANDROID
                    ? Permissions.PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
                    : Permissions.PERMISSIONS.IOS.PHOTO_LIBRARY,
                {
                    title: "Storage Permission",
                    message: "App needs access to memory to download the file "
                }
            );
            if (granted === Permissions.RESULTS.GRANTED) {
                this.downloadFile();
            } else {
                Alert.alert(
                    "Permission Denied!",
                    "You need to give storage permission to download the file"
                );
            }
        } catch (err) {
            console.warn(err);
        }
    }

    renderChatBubble = ({ item, index }) => {
        const { user, chatMessages } = this.props;
        const { selectedMessage, messageSelectionMode } = this.state;
        const showDate = index === chatMessages.length - 1 || new Date(chatMessages[index + 1].date).toString().substring(4, 15) !== new Date(item.date).toString().substring(4, 15);
        if (item.senderId === 'system') {
            return <View style={{ flexDirection: 'column' }}>
                {showDate && this.renderChatDate(item.date)}
                <ChatBubble
                    messageTime={this.getFormattedTime(item.date)}
                    message={item.content}
                    bubbleStyle={{ backgroundColor: `#FBF6EE`, alignSelf: 'center', maxWidth: 250, width: 250 }}
                    onPress={() => this.onSelectMessage(item.messageId, item.senderId)}
                    selectedMessage={selectedMessage && selectedMessage[item.messageId]}
                    showSelectionCircle={messageSelectionMode}
                />
            </View>
        }
        if (item.senderId === user.userId) {
            const isMyLastMsg = index === 0 || chatMessages[index - 1].senderId !== user.userId;
            return <View style={{ flexDirection: 'column' }}>
                {showDate && this.renderChatDate(item.date)}
                {
                    item.type === CHAT_CONTENT_TYPE.TEXT
                        ? <ChatBubble
                            messageTime={this.getFormattedTime(item.date)}
                            message={item.content}
                            bubbleStyle={{ backgroundColor: '#00AEEF', alignSelf: 'flex-end', borderBottomRightRadius: isMyLastMsg ? 0 : null }}
                            bubbleNameStyle={styles.friendName}
                            onPress={() => this.onSelectMessage(item.messageId, item.senderId)}
                            selectedMessage={selectedMessage && selectedMessage[item.messageId]}
                            showSelectionCircle={messageSelectionMode}
                        />
                        : <View style={{ flexDirection: 'row' }}>
                            {
                                this.renderImageContent(item, { backgroundColor: styles.myMsgBubble.backgroundColor, borderBottomRightRadius: isMyLastMsg ? 0 : styles.mediaMsgContainer.borderRadius }, isMyLastMsg)
                            }
                            {
                                messageSelectionMode
                                    ? <TouchableOpacity style={[styles.circle, {
                                        backgroundColor: selectedMessage && selectedMessage[item.messageId]
                                            ? APP_COMMON_STYLES.infoColor : 'rgba(255,255,255, 0.4)'
                                    }]} onPress={() => this.onSelectMessage(item.messageId, item.senderId)}>
                                        {
                                            selectedMessage && selectedMessage[item.messageId]
                                                ? <NBIcon name='check' type='Entypo' style={{ color: '#FFFFFF', left: 2, fontSize: 25, marginRight: 5 }} />
                                                : null
                                        }
                                    </TouchableOpacity>
                                    : null
                            }
                        </View>
                }
                <View style={{ marginRight: messageSelectionMode ? 0 : styles.thumbnail.width + 5 }} />
            </View>
        } else {
            const isMemberLastMsg = index === 0 || chatMessages[index - 1].senderId !== item.senderId;
            return <View style={{ flexDirection: 'column' }}>
                {showDate && this.renderChatDate(item.date)}
                <Item style={{ borderBottomWidth: 0, justifyContent: 'flex-start' }}>
                    {
                        isMemberLastMsg
                            ? item.senderPictureId
                                ? <Thumbnail style={[styles.thumbnail, { marginRight: 5 }]} source={{ uri: `${GET_PICTURE_BY_ID}${item.senderPictureId}` }} />
                                : <View style={{ marginRight: styles.thumbnail.width + 5 }} />
                            : <View style={{ marginRight: styles.thumbnail.width + 5, }} />
                    }
                    {
                        item.type === CHAT_CONTENT_TYPE.TEXT
                            ? <ChatBubble
                                bubbleName={this.props.chatInfo.isGroup ? item.senderName.split(' ')[0] : ''}
                                messageTime={this.getFormattedTime(item.date)}
                                message={item.content}
                                bubbleStyle={{ backgroundColor: '#81c341', borderBottomLeftRadius: isMemberLastMsg ? 0 : null }}
                                bubbleNameStyle={styles.friendName}
                                onPress={() => this.onSelectMessage(item.messageId, item.senderId)}
                                selectedMessage={selectedMessage && selectedMessage[item.messageId]}
                                showSelectionCircle={messageSelectionMode}
                            />
                            : <View style={{ flexDirection: 'row' }}>
                                {
                                    this.renderImageContent(item, { backgroundColor: styles.friendMsgBubble.backgroundColor, borderBottomLeftRadius: isMemberLastMsg ? 0 : styles.mediaMsgContainer.borderRadius }, isMemberLastMsg)
                                }
                                {
                                    messageSelectionMode
                                        ? <TouchableOpacity style={[styles.circle, {
                                            backgroundColor: selectedMessage && selectedMessage[item.messageId]
                                                ? APP_COMMON_STYLES.infoColor : 'rgba(255,255,255, 0.4)'
                                        }]} onPress={() => this.onSelectMessage(item.messageId, item.senderId)}>
                                            {
                                                selectedMessage && selectedMessage[item.messageId]
                                                    ? <NBIcon name='check' type='Entypo' style={{ color: '#FFFFFF', left: 2, fontSize: 25 }} />
                                                    : null
                                            }
                                        </TouchableOpacity>
                                        : null
                                }
                            </View>
                    }
                </Item>
            </View>
        }
    }

    renderImageContent = (item, containerStyle) => {
        let ride = null;
        const { messageSelectionMode } = this.state;
        if (item.type === CHAT_CONTENT_TYPE.RIDE) ride = JSON.parse(item.content);
        const width = (widthPercentageToDP(100) - (styles.chatArea.paddingHorizontal * 2) - styles.thumbnail.width - 10);
        const imgWidth = messageSelectionMode ? width - 48 : width - 18;
        const showName = this.props.chatInfo.isGroup && item.senderId !== this.props.user.userId;
        return <View style={{ flexDirection: 'column', marginLeft: 'auto' }}>
            {
                showName
                    ? <View style={{ height: 15, marginTop: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <DefaultText style={[styles.bubbleName]}>{item.senderName.split(' ')[0] || ''}</DefaultText>
                    </View>
                    : <View style={{ height: 5 }} />
            }
            <TouchableOpacity style={[styles.mediaMsgContainer, containerStyle, { width: messageSelectionMode ? width - 30 : width }]} activeOpacity={1} onPress={() => this.onSelectMessage(item.messageId, item.senderId)}>
                {
                    item.media
                        ? <View style={[styles.imgMsgContainer]}>
                            <TouchableOpacity activeOpacity={0.8} style={[{ width: item.media[1] ? imgWidth / 2 : imgWidth, height: imgWidth / 2 }, styles.imgMsgStyle]} onPress={() => this.onTapImage(item, 0)}>
                                <Image source={{ uri: `${GET_PICTURE_BY_ID}${item.media[0].replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` }} style={styles.squareThumbnail} />
                            </TouchableOpacity>
                            {
                                item.media[1]
                                    ? <TouchableOpacity activeOpacity={0.8} style={[{ width: imgWidth / 2, height: imgWidth / 2 }, styles.imgMsgStyle]} onPress={() => this.onTapImage(item, 1)}>
                                        <Image source={{ uri: `${GET_PICTURE_BY_ID}${item.media[1].replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` }} style={styles.squareThumbnail} />
                                    </TouchableOpacity>
                                    : null
                            }
                            {
                                item.media[2]
                                    ? <TouchableOpacity activeOpacity={0.8} style={[{ width: item.media[3] ? imgWidth / 2 : imgWidth, height: imgWidth / 2 }, styles.imgMsgStyle]} onPress={() => this.onTapImage(item, 2)}>
                                        <Image source={{ uri: `${GET_PICTURE_BY_ID}${item.media[2].replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` }} style={styles.squareThumbnail} />
                                    </TouchableOpacity>
                                    : null
                            }
                            {
                                item.media[3]
                                    ? <TouchableOpacity style={[{ width: imgWidth / 2, height: imgWidth / 2 }, styles.imgMsgStyle]} onPress={() => this.onTapImage(item, 3)}>
                                        <ImageBackground source={{ uri: `${GET_PICTURE_BY_ID}${item.media[3].replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` }} style={[styles.squareThumbnail, { alignItems: 'center' }]}>
                                            {
                                                item.media[4]
                                                    ? <TouchableOpacity activeOpacity={0.8} style={[{ width: imgWidth / 2, height: imgWidth / 2 }, styles.imgMoreContainer]}
                                                        onPress={() => this.onTapImage(item, 3)}>
                                                        <DefaultText style={styles.imgMoreTxt}>+{`${item.media.length - 4}`} more</DefaultText>
                                                    </TouchableOpacity>
                                                    : null
                                            }
                                        </ImageBackground>
                                    </TouchableOpacity>
                                    : null
                            }
                        </View>
                        : ride
                            ? <View style={[styles.imgMsgContainer]}>
                                <TouchableOpacity activeOpacity={0.8} style={[{ width: imgWidth, height: imgWidth / 2 }, styles.imgMsgStyle]} onPress={() => this.onTapImage(item, 0)}>
                                    <Image blurRadius={4} source={require('../../assets/img/ride-placeholder-image.png')} style={styles.squareThumbnail} />
                                </TouchableOpacity>
                            </View>
                            : null
                }
                <View style={{ width: imgWidth }}>
                    {
                        ride
                            ? <DefaultText numberOfLines={3} style={styles.txtWithImg}>{ride.name}</DefaultText>
                            : item.content
                                ? <DefaultText numberOfLines={3} style={styles.txtWithImg}>{item.content}</DefaultText>
                                : null
                    }
                    <View style={styles.imgTimeStatusContainer}>
                        <DefaultText style={styles.msgTime}>{this.getFormattedTime(item.date)}</DefaultText>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    }

    onTapImage = (message, index) => {
        Keyboard.dismiss();
        if (!this.state.messageSelectionMode) {
            this.openContent({ ...message, index });
        } else {
            this.onSelectMessage(message.messageId, message.senderId);
        }
    }

    enableSelectMesage = () => this.setState({ messageSelectionMode: true, isVisibleOptions: false });

    openFriendsProfile = (item) => {
        // console.log('\n\n\n item :', item)
        if (item.memberId === this.props.user.userId) {
            Actions.push(PageKeys.PROFILE, { tabProps: { activeTab: 0 } });
        }
        else if (item.isFriend) {
            this.props.setCurrentFriend({ userId: item.memberId });
            Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: item.memberId });
        }
        else {
            Actions.push(PageKeys.PASSENGER_PROFILE, { isUnknown: true, person: { ...item, userId: item.memberId } })
        }
    }
    
    
    openMembersPage = () => {
        if(this.props.chatInfo.groupName){
            this.hideOptionsModal();
            Actions.push(PageKeys.GROUP, { comingFrom: PageKeys.CHAT, groupData: this.props.chatInfo });
        }
        else{
            this.hideOptionsModal();
            Actions.push(PageKeys.LIKES, { hasNetwork: this.props.hasNetwork,comingFrom:PageKeys.CHAT, groupData: this.props.chatInfo, userId:this.props.user.userId, openFriendsProfile: this.openFriendsProfile });
        }
    }

    alertBoxForDeactivatedUser = () => {
        return Alert.alert(
            '',
            'User has deactivated their account',
            [
                { text: 'Ok', onPress: () => { this.setState({ showDeactivatedAlert: false }) }, style: 'cancel' },
            ],
            { cancelable: false }
        )
    }

    openDeleteModal = () => this.setState({ showDeleteModal: true });

    hideDeleteModal = () => this.setState({ showDeleteModal: false  });

    render() {
        const { chatMessages, totalUnseenMessage } = this.props;
        const { messageToBeSend, selectedMessage, isVisibleOptions, enlargeContent, isVisibleMediaOptions, messageSelectionMode, showSwipingPictureModal, pictureIds, showDeleteModal } = this.state;
        // console.log(pictureIds,'/// message pictureIds')
        const rideContent = enlargeContent && enlargeContent.type === CHAT_CONTENT_TYPE.RIDE ? JSON.parse(enlargeContent.content) : null;
        return <BasePage defaultHeader={false} shifterBottomOffset={this.props.chatInfo.status !== 'deactivated' ? FOOTER_HEIGHT : 0}>
            <View style={[styles.fill, { marginBottom: this.state.iOSKeyboardHeight }]}>
            {enlargeContent && <ImageViewer onImageIndexChange={(index)=>{
                this.setState({selectedIndex:index})
            }} HeaderComponent={()=>{
                return <View style={{height:IS_ANDROID?heightPercentageToDP(6):heightPercentageToDP(10),display:'flex',flexDirection:'row',justifyContent:'flex-end',alignItems:'flex-end',backgroundColor:'rgba(0, 0, 0, 0.37)'}}>
                    <View style={{width:100,height:50,display:'flex',flexDirection:'row',justifyContent:'space-evenly',alignItems:'center'}}>
                     <IconButton style={styles.showOptionModal} iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 20 } }} onPress={this.showMediaOptions} />
                    <NBIcon name='close' fontSize={30} style={{ color: '#fff' }} onPress={this.onCancelVisiblePicture} />
                    {this.state.isVisibleMediaOptions && <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={isVisibleMediaOptions} onCancel={this.hideMediaOptions} onPressOutside={this.hideMediaOptions}>
                                <View style={APP_COMMON_STYLES.optionsContainer}>
                                    {
                                        enlargeContent.type === CHAT_CONTENT_TYPE.RIDE
                                            ? [
                                                <LinkButton key='view-key' style={APP_COMMON_STYLES.optionBtn} title='VIEW' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={() => this.loadRideOnMap(this.state.enlargeContent)} />,
                                                rideContent.creatorId !== this.props.user.userId ? <LinkButton key='copy-key' style={APP_COMMON_STYLES.optionBtn} title='COPY RIDE' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.copyRide} /> : null
                                            ]
                                            : <View>
                                                <LinkButton style={APP_COMMON_STYLES.optionBtn} title='SAVE PHOTO' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.checkForWritePermission} />
                                            </View>
                                    }
        
                                </View>
                            </BaseModal>}
                    </View>
                </View>
            }}   images={pictureIds.map(image=>{
                        return {
                            ...image,uri: `${GET_PICTURE_BY_ID}${image.id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}`
                        }
                    })} keyExtractor={(imgaeSrc,index)=>{
                        return index
                    }} visible={showSwipingPictureModal} onRequestClose={this.onCancelVisiblePicture} FooterComponent={(img)=>{
                        return   ( <View style={{ height: 100,display:'flex',flexDirection:'column',justifyContent:'space-between',backgroundColor:'rgba(0, 0, 0, 0.37)'}}>
                                <DefaultText style={{ fontSize: 16, color: 'white',marginLeft:20 }} text={pictureIds[img.imageIndex].description} numberOfLines={2}/>
                                <Text style={{ fontSize: 16, color: 'white',textAlign:'center',marginBottom:19, }} >{(img.imageIndex+1)+' / '+pictureIds.length}</Text>
                                </View>)
                    }} imageIndex={0} />
                }
                {/* {enlargeContent && <GesturedCarouselModal isVisible={showSwipingPictureModal} onCancel={this.onCancelVisiblePicture}
                    pictureIds={pictureIds}
                    initialCarouselIndex={enlargeContent.index}
                    isGestureEnable={true}
                    isZoomEnable={true}
                    headerChildren={
                        <IconButton style={styles.showOptionModal} iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 20 } }} onPress={this.showMediaOptions} />
                    }
                > */}
                    {/* {this.state.isVisibleMediaOptions && <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={isVisibleMediaOptions} onCancel={this.hideMediaOptions} onPressOutside={this.hideMediaOptions}>
                        <View style={APP_COMMON_STYLES.optionsContainer}>
                            {
                                enlargeContent.type === CHAT_CONTENT_TYPE.RIDE
                                    ? [
                                        <LinkButton key='view-key' style={APP_COMMON_STYLES.optionBtn} title='VIEW' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={() => this.loadRideOnMap(this.state.enlargeContent)} />,
                                        rideContent.creatorId !== this.props.user.userId ? <LinkButton key='copy-key' style={APP_COMMON_STYLES.optionBtn} title='COPY RIDE' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.copyRide} /> : null
                                    ]
                                    : <View>
                                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='SAVE PHOTO' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.checkForWritePermission} />
                                    </View>
                            }

                        </View>
                    </BaseModal>}
                </GesturedCarouselModal>
                } */}
                <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={isVisibleOptions} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                    <View>
                    <View style={APP_COMMON_STYLES.optionsContainer}>
                        {this.props.chatInfo.isGroup && <LinkButton style={APP_COMMON_STYLES.optionBtn} title='VIEW MEMBERS' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openMembersPage} />}
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='EDIT' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.enableSelectMesage} />
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='DELETE CONVERSATION' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openDeleteModal} />
                    </View>
                    { showDeleteModal  &&  <BaseModal containerStyle={{ justifyContent: 'center', alignItems: 'center' }} isVisible={showDeleteModal} onCancel={this.hideDeleteModal} >
                            <View style={styles.deleteBoxCont}>
                                <DefaultText style={styles.deleteTitle}>Delete Conversation</DefaultText>
                                <DefaultText numberOfLines={4} style={styles.deleteText}>Are you sure you want to delete this entire conversation? You will not be able to undo this action.</DefaultText>
                                <View style={styles.btnContainer}>
                                    <BasicButton title='Cancel' style={[styles.actionBtn, { backgroundColor: '#8D8D8D' }]} titleStyle={styles.actionBtnTxt} onPress={this.hideDeleteModal} />
                                    <BasicButton title='Delete' style={styles.actionBtn} titleStyle={styles.actionBtnTxt} onPress={this.clearChat} />
                                </View>
                            </View>
                </BaseModal>
                }
                </View>
                </BaseModal>
                <View style={styles.fill}>
                    {
                        messageSelectionMode
                            ? <View style={[styles.chatHeader, { justifyContent: 'space-between' }]}>
                                <IconButton iconProps={{ name: 'cross', type: 'Entypo', style: { fontSize: 27, color: '#fff' } }} onPress={this.unSelectAllMessage} />
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                    <DefaultText numberOfLines={1} style={[styles.chatHeaderName, { fontFamily: CUSTOM_FONTS.gotham, fontSize: 18 }]}>
                                        {selectedMessage ? `${Object.keys(selectedMessage).length} selected` : 'Tap on message to select/unselect'}
                                    </DefaultText>
                                </View>
                                {
                                    selectedMessage && Object.keys(selectedMessage).length
                                        ? <IconButton iconProps={{ name: 'delete', type: 'MaterialCommunityIcons', style: { fontSize: 25, color: '#fff' } }} onPress={this.openDeleteSingleMessageModal} />
                                        : null
                                }

                            </View>
                            : <View style={styles.chatHeader}>
                                <TouchableOpacity style={styles.iconPadding} onPress={this.onPressBackButton}>
                                    <NBIcon name='md-arrow-round-back' type='Ionicons' style={{
                                        fontSize: 25,
                                        color: 'black'
                                    }} />
                                </TouchableOpacity>
                                <View style={styles.headingView}>
                                    <DefaultText numberOfLines={1} style={styles.chatHeaderName}>
                                        {
                                            this.props.chatInfo.isGroup
                                                ? this.props.chatInfo.groupName
                                                    ? this.props.chatInfo.groupName
                                                    : this.props.chatInfo.memberNameList.reduce((arr, name) => {
                                                        arr.push(name.split(' ')[0]);
                                                        return arr;
                                                    }, []).join(', ')
                                                : this.props.comingFrom === PageKeys.NOTIFICATIONS
                                                    ? this.props.chatInfo.senderName
                                                    : this.props.chatInfo.name
                                        }
                                    </DefaultText>
                                </View>
                                <IconButton iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 25 } }} onPress={this.showOptionsModal} />
                            </View>
                    }
                    <ImageBackground style={styles.fill} source={require('../../assets/img/chat-bg.jpg')}>
                        <View style={styles.fill}>
                            <FlatList
                                keyboardShouldPersistTaps={'handled'}
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
                                messageSelectionMode === false && this.state.isNewMessage
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
                    </ImageBackground>
                    {
                        (this.props.chatInfo.status === 'notFriend' || this.props.chatInfo.status === 'deactivated')
                            ? null
                            : <View style={styles.footer}>
                                <IconButton style={styles.footerLtIcnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: styles.footerLtIcon }} onPress={this.showPicker} />
                                <View style={styles.inputCont}>
                                    <TextInput style={styles.inputBox} value={messageToBeSend} placeholder='Type a message...' placeholderTextColor='#3E3E3E' multiline={true} onChangeText={this.onChangeMessageToBeSend} />
                                </View>
                                <IconButton style={styles.footerRtIcnCont} iconProps={{ name: 'md-arrow-round-back', type: 'Ionicons', style: styles.footerRtIcon }} onPress={() => this.sendMessage(this.state.messageToBeSend)} />
                            </View>
                    }

                    <Animated.View style={[styles.picker, { height: this.state.pickerAnim }]}>
                        <TouchableOpacity activeOpacity={1} style={styles.pickerBackdrop} onPress={() => this.hidePicker(300)}>
                            <View style={[APP_COMMON_STYLES.optionsContainer, { marginBottom: 0 }]}>
                                <LinkButton title='Camera' style={APP_COMMON_STYLES.optionBtn} titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.getImageFromCamera} />
                                <LinkButton title='Gallery' style={APP_COMMON_STYLES.optionBtn} titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.getImageFromGallery} />
                                <LinkButton title='Rides' style={[APP_COMMON_STYLES.optionBtn, styles.noBorder]} titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.getSharableRides} />
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>
        </BasePage>
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { chatMessages, isScroll, totalUnseenMessage, chatData, chatList } = state.ChatList;
    const { hasNetwork, lastApi, isRetryApi } = state.PageState;
    const { ride } = state.RideInfo.present;
    return { user, chatMessages, ride, isScroll, totalUnseenMessage, chatData, chatList, hasNetwork, lastApi, isRetryApi };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        getAllMessages: (id, userId, isGroup) => dispatch(getAllMessages(id, userId, isGroup)),
        seenMessage: (id, userId, isGroup, comingFrom) => dispatch(seenMessage(id, userId, isGroup, comingFrom)),
        deleteAllMessages: (id, userId, isGroup, successCallback, errorCallback) => dispatch(deleteAllMessages(id, userId, isGroup, successCallback, errorCallback)),
        sendMessage: (requestBody) => dispatch(sendMessage(requestBody)),
        deleteMessagesById: (isGroup, id, userId, messageToBeDeleted, newChatMessages) => dispatch(deleteMessagesById(isGroup, id, userId, messageToBeDeleted, newChatMessages)),
        deleteMessagesByIdForEveryone: (isGroup, id, userId, messageToBeDeleted, newChatMessages) => dispatch(deleteMessagesByIdForEveryone(isGroup, id, userId, messageToBeDeleted, newChatMessages)),
        resetMessageCount: () => dispatch(resetMessageCountAction({ resetTotalUnseen: true })),
        updateChatData: (chatData) => dispatch(updateChatDatatAction({ chatData: chatData })),
        getPictureList: (idList) => getPictureList(idList, (pictureObj) => {
            dispatch(updateChatDatatAction({ pictureObj }));
        }, (error) => {
            // console.log('getPictureList error :  ', error);
        }),
        resetChatMessage: () => dispatch(resetChatMessageAction()),
        loadRideOnMap: (rideId, rideInfo) => dispatch(getRideByRideId(rideId, rideInfo)),
        clearRideFromMap: () => dispatch(clearRideAction()),
        changeScreen: (screenKey) => dispatch(screenChangeAction(screenKey)),
        copySharedRide: (rideId, rideName, rideType, userId, date, successCallback, errorCallback) => copySharedRide(rideId, rideName, userId, date).then(res => {
            if (res.status === 200) {
                // console.log('copySharedRide success: ', res.data);
                typeof successCallback === 'function' && successCallback();
                dispatch(apiLoaderActions(false))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
            }
        }).catch(er => {
            // console.log('copySharedRide error: ', er);
            typeof errorCallback === 'function' && errorCallback();
            handleServiceErrors(er, [rideId, rideName, rideType, userId, date, successCallback, errorCallback], 'copySharedRide', true, true);
            dispatch(apiLoaderActions(false));
        }),
        getAllChats: (userId) => dispatch(getAllChats(userId)),
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'chat', isRetryApi: state })),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Chat);

const MAX_FILES_SELECTABLE = 5;
export class SelectedMediaView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            images: props.mediaIds || [],
            sharableRides: [],
            selectedRide: null,
            messageWithImage: props.message || '',
            isLoading: false,
            showAppendMediaOption: props.mediaIds ? false : true,
            showClearMediaOption: (props.mediaIds || props.fromRides) ? false : true,
            iOSKeyboardHeight: props.iOSKeyboardHeight || 0,
        }
    }

    componentDidMount() {
        console.log("CHAT******    from Selected Media View COmp ******",this.props)
        this.state.showAppendMediaOption && this.fetchImage();
        /** DOC: react-native TextInput doesn't understand the 
         *  default value of 'messageWithImage' set in the constructor
         *  reassign the value once again here
         * */
        this.props.message && this.setState({ messageWithImage: this.props.message });
        this.props.comingFrom !== PageKeys.CHAT && this.subscribeKeyboardListeners();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.iOSKeyboardHeight !== this.props.iOSKeyboardHeight) {
            this.setState({ iOSKeyboardHeight: this.props.iOSKeyboardHeight });
        }
        if (prevProps.hasNetwork === false && this.props.hasNetwork === true) {
            this.retryApiFunc();
        }
        if (prevProps.isRetryApi === false && this.props.isRetryApi === true) {
            if (Actions.currentScene === this.props.lastApi.currentScene) {
                Alert.alert(
                    'Something went wrong ',
                    '',
                    [
                        {
                            text: 'Retry ', onPress: () => {
                                this.retryApiFunc();
                                store.dispatch(resetErrorHandlingAction({ comingFrom: 'chat', isRetryApi: false }))
                            }
                        },
                        { text: 'Cancel', onPress: () => { store.dispatch(resetErrorHandlingAction({ comingFrom: 'chat', isRetryApi: false })) }, style: 'cancel' },
                    ],
                    { cancelable: false }
                )
            }
        }
    }

    retryApiFunc = () => {
        if (this.props.lastApi && this.props.lastApi.currentScene === Actions.currentScene) {
            `${this.props.lastApi.api}`(...this.props.lastApi.params)
        }
    }

    setIOSKeyboardHeight = (e) => { this.setState({ iOSKeyboardHeight: e.endCoordinates.height }); }

    resetIOSKeyboardHeight = () => { this.setState({ iOSKeyboardHeight: 0 }); }

    subscribeKeyboardListeners() {
        if (IS_ANDROID === false) {
            Keyboard.addListener('keyboardDidShow', this.setIOSKeyboardHeight);
            Keyboard.addListener('keyboardWillHide', this.resetIOSKeyboardHeight);
        }
    }

    unsubscribeKeyboardListeners() {
        if (IS_ANDROID === false) {
            Keyboard.removeListener('keyboardDidShow', this.setIOSKeyboardHeight);
            Keyboard.removeListener('keyboardWillHide', this.resetIOSKeyboardHeight);
        }
    }

    componentWillUnmount() {
        this.props.comingFrom !== PageKeys.CHAT && this.unsubscribeKeyboardListeners();
    }

    fetchImage(isAppend = false) {
        Keyboard.dismiss();
        if (MAX_FILES_SELECTABLE === this.state.images.length) {
            Alert.alert('Max files reached', `You can upload only ${MAX_FILES_SELECTABLE} files at a time`);
            return;
        }
        !isAppend && this.setState({ messageWithImage: '', images: [] });
        if (this.props.fromGallery) this.getImageFromGallery(isAppend);
        else if (this.props.fromCamera) this.getImageFromCamera(isAppend);
        else if (this.props.fromRides) this.getSharableRides(false);
    }

    getImageFromCamera = async (isAppend) => {
        this.setState({ isLoading: true });
        try {
            const img = await ImagePicker.openCamera({
                mediaType: 'photo',
                enableRotationGesture: true,
                maxFiles: MAX_FILES_SELECTABLE,
                cropping: false,
            });
            ImagePicker.openCropper({ height: img.height, width: img.width, path: img.path, hideBottomControls: true, compressImageQuality: img.size > 600000 ? IS_ANDROID ? 0.4 : 0.2 : 1, }).then(image => {
                if (isAppend) {
                    this.setState({ isLoading: false, images: [...this.state.images, { mimeType: image.mime, path: image.path }] });
                } else {
                    this.setState({ isLoading: false, images: [{ mimeType: image.mime, path: image.path }] });
                }
            })
        } catch (er) {
            this.setState({ isLoading: false });
            if (!isAppend) this.goBack();
            // console.log("Error occurd: ", er);
        }
    }

    getImageFromGallery = async (isAppend) => {
        this.setState({ isLoading: true });
        const remainingLength = MAX_FILES_SELECTABLE - this.state.images.length;
        try {
            // const imgs = await ImagePicker.openPicker({
            //     mediaType: 'photo',
            //     cropping: false,
            //     multiple: true,
            //     maxFiles: MAX_FILES_SELECTABLE,
            // }).slice(0, remainingLength);
            const imgs = (await ImagePicker.openPicker({ mediaType: 'photo', cropping: false, multiple: true, maxFiles: remainingLength, }))
                .slice(0, remainingLength).map(({ mime, path, size, height, width }) => ({ mimeType: mime, path: path, size: size, height, width }));
            const compressedImages = imgs.map(item => {
                if (item.path) {
                    if(item.mimeType === 'image/gif'){
                        return ()=> item
                    }
                    else{
                        return () => ImagePicker.openCropper({ height: item.height, width: item.width, path: item.path, hideBottomControls: true, compressImageQuality: item.size > 600000 ? IS_ANDROID ? 0.4 : 0.2 : 1, })
                    }
                }
            })
            this.setState({ images: this.state.images });
            compressedImages.reduce(async (prevPromise, nextPromise) => {
                await prevPromise;
                const result = await nextPromise();
                this.setState(prevState => ({ isLoading: false, images: [...prevState.images, { mimeType:result.mime?result.mime:result.mimeType, path: result.path }] }));
                return result;
            }, Promise.resolve());
        } catch (er) {
            this.setState({ isLoading: false });
            if (!isAppend) this.goBack();
            // console.log("Error occurd: ", er);
        }
    }

    getSharableRides = async () => {
        this.setState({ isLoading: true });
        getAllRidesByUserId(this.props.userId).then(res => {
            this.setState({ isLoading: false, sharableRides: res.data });
            store.dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            // console.log('getAllRidesByUserId: ', res.data);
        }).catch(er => {
            this.setState({ isLoading: false });
            // console.log('getAllRidesByUserId: ', er.response);
            handleServiceErrors(er, [this.props.userId], 'getAllRidesByUserId', true, true);
        });
    }

    onChangeMessageWithImage = (messageWithImage) => this.setState({ messageWithImage });

    imgKeyExtractor = (item) => item.localIdentifier;

    unselectImg = (idx) => this.setState(prevState => {
        if (prevState.images.length === 1) return { images: [] };
        return { images: prevState.images.filter((img, index) => index !== idx) };
    }, () => {
        if (this.state.images.length > 0) return;
        if (this.props.mediaIds) return this.goBack();
        this.fetchImage();
    });

    renderSelectedMedia = (item, index) => {
        return <View key={item.id || index + ''} style={styles.thumbnailContainer}>
            <Image source={{ uri: item.id ? `${GET_PICTURE_BY_ID}${item.id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` : item.path }} style={styles.squareThumbnail} />
            <IconButton style={styles.closeIconContainer} iconProps={{ name: 'close', type: 'Ionicons', style: styles.closeIcon }} onPress={() => this.unselectImg(index)} />
        </View>
    }

    goBack = () => Actions.pop();

    returnContent = async () => {
        if (this.props.fromRides) {
            this.props.shareRide(this.state.selectedRide.id);
        } else {
            if (this.state.images.length === 0) return;
            if (this.props.mediaIds) {
                const idsObj = this.props.receivers.reduce((idsObj, receiver) => {
                    receiver.isGroup
                        ? idsObj.groupIds.push(receiver.id)
                        : idsObj.ids.push(receiver.id)
                    return idsObj;
                }, { ids: [], groupIds: [] });
                this.props.sendMessage(this.state.images.map(image => image.id), idsObj.ids.length ? idsObj.ids : null, idsObj.groupIds.length ? idsObj.groupIds : null, this.state.messageWithImage);
            } else {
                this.props.sendMessage(this.state.messageWithImage, this.state.images);
            }
        }
        this.goBack();

        // DOC: Code for share contents to Facebook
        // const shareLinkContent = {
        //     contentType: 'link',
        //     contentUrl: "https://facebook.com",
        //     contentDescription: 'Wow, check out this great site!',
        // };
        // const sharePhotoContent = {
        //     contentType: 'photo',
        //     photos: [{ imageUrl: this.state.images[0].path }],
        // };
        // const canShow = await ShareDialog.canShow(sharePhotoContent);
        // if (canShow) {
        //     const result = await ShareDialog.show(sharePhotoContent);
        //     if (result.isCancelled) {
        //         console.log('Share cancelled');
        //     } else {
        //         console.log('Share success with postId: ' + result.postId);
        //     }
        // } else {
        //     ShareApi.share(sharePhotoContent, result => {
        //         if (result.isCancelled) {
        //             console.log('Share cancelled');
        //         } else {
        //             console.log('Share success with postId: ' + result.postId);
        //         }
        //     });
        // }
    }

    toggleRideSelection = ride => this.setState((prevState) => prevState.selectedRide ? { selectedRide: null } : { selectedRide: ride })

    rideKeyExtractor = item => item.id;

    render() {
        const { messageWithImage, images, isLoading, showAppendMediaOption, showClearMediaOption, iOSKeyboardHeight } = this.state;
        const { receivers } = this.props;
        return <BasePage showShifter={false}
            heading={this.props.fromRides
                ? this.state.selectedRide ? `'${this.state.selectedRide.name}' selected` : `Select a ride`
                : images.length > 0 ? `${images.length} selected` : null
            }
            headerRightComponent={
                showClearMediaOption
                    ? <IconButton iconProps={{ name: 'close', type: 'MaterialCommunityIcons', style: { color: '#fff', fontSize: 25 } }} onPress={() => this.fetchImage()} />
                    : this.state.selectedRide
                        ? <LinkButton style={{ justifyContent: 'center' }} title='Done' titleStyle={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }} onPress={this.returnContent} />
                        : null
            }>
            <View style={[styles.fill, { marginBottom: iOSKeyboardHeight }]}>
                {
                    receivers
                        ? <View style={{ paddingVertical: 8, alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, borderBottomColor: '#707070', borderBottomWidth: 0.5 }}>
                            <DefaultText style={{ color: APP_COMMON_STYLES.headerColor, fontSize: 14, fontFamily: CUSTOM_FONTS.robotoBold, marginRight: 10 }}>Share with:</DefaultText>
                            {
                                receivers.map(receiver => {
                                    return <View key={receiver.id || receiver.userId || receiver.groupId}
                                        style={{
                                            marginLeft: 3, marginBottom: 3, padding: 5,
                                            backgroundColor: APP_COMMON_STYLES.infoColor, borderRadius: 20
                                        }}>
                                        <DefaultText style={{ color: '#fff', fontFamily: CUSTOM_FONTS.robotoBold, marginLeft: 2 }}>{receiver.name || receiver.groupName}</DefaultText>
                                    </View>
                                })
                            }
                        </View>
                        : null
                }
                <View style={[styles.fill, { backgroundColor: '#fff' }]}>
                    <ScrollView>
                        {
                            this.props.fromRides
                                ? <FlatList
                                    keyboardShouldPersistTaps={'handled'}
                                    style={{ flexDirection: 'column' }}
                                    columnWrapperStyle={styles.columnWrapper}
                                    numColumns={2}
                                    data={this.state.sharableRides}
                                    keyExtractor={this.rideKeyExtractor}
                                    renderItem={({ item, index }) => (
                                        <View>
                                            <SquareCard
                                                image={item.snapshot ? `${GET_PICTURE_BY_ID}${item.snapshot.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` : null}
                                                placeholderImage={require('../../assets/img/ride-placeholder-image.png')}
                                                title={item.name}
                                                onPress={() => this.toggleRideSelection(item)}
                                                imageStyle={styles.rideImgStyle}
                                                placeholderBlurVal={4}
                                            />
                                            {this.state.selectedRide && this.state.selectedRide.id === item.id && <TouchableOpacity onPress={() => this.toggleRideSelection(item)} style={[styles.imgMoreContainer, { width: styles.rideImgStyle.width, height: styles.rideImgStyle.height }]}><NBIcon name='check' type='MaterialCommunityIcons' style={{ color: '#fff' }} /></TouchableOpacity>}
                                        </View>
                                    )}
                                />
                                : <View style={styles.imagesContainer}>
                                    {images.map(this.renderSelectedMedia)}
                                </View>

                        }
                    </ScrollView>
                    <View style={styles.imgLoaderView}>
                        <ActivityIndicator size='large' animating={isLoading} />
                    </View>
                </View>
                {
                    this.props.fromRides
                        ? null
                        : <View style={[styles.footer, this.props.hasNetwork === false ? { marginBottom: heightPercentageToDP(8.2) } : null]}>
                            {showAppendMediaOption && <IconButton style={{ marginRight: 10, transform: [{ rotateY: '180deg' }] }} iconProps={{ name: 'camera', type: 'Entypo', style: { color: '#fff', fontSize: 18 } }} onPress={() => this.fetchImage(true)} />}
                            <View style={styles.inputCont}>
                                <TextInput style={styles.inputBox} value={messageWithImage} placeholder='Type a message...' placeholderTextColor='#3E3E3E' multiline={true} onChangeText={this.onChangeMessageWithImage} />
                            </View>
                            <IconButton style={styles.footerRtIcnCont} iconProps={{ name: 'md-arrow-round-back', type: 'Ionicons', style: styles.footerRtIcon }} onPress={this.returnContent} />
                        </View>
                }
            </View>
        </BasePage>
    }
}