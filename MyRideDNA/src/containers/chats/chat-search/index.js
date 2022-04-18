import React, { Component } from 'react';
import { View, Keyboard, Animated, ActivityIndicator, Alert, FlatList, TextInput, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import styles from '../styles';
import { IconButton, LinkButton } from '../../../components/buttons';
import { Thumbnail, Icon as NBIcon, ListItem, Left, Toast } from 'native-base';
import { APP_COMMON_STYLES, heightPercentageToDP, PageKeys, IS_ANDROID, GET_PICTURE_BY_ID, CHAT_CONTENT_TYPE, CUSTOM_FONTS, widthPercentageToDP } from '../../../constants';
import { Actions } from 'react-native-router-flux';
import { DefaultText } from '../../../components/labels';
import { BasePage } from '../../../components/pages';
import { searchFriendsForChat, sendMessage, handleServiceErrors } from '../../../api';
import { resetErrorHandlingAction } from '../../../actions';

class ChatSearch extends Component {
    _searchQueryTimeout = null;
    _messageInputRef = null;
    _hasCalledSendMessageAPI = false;
    constructor(props) {
        super(props);
        this.state = {
            messageToBeSend: '',
            pickerAnim: new Animated.Value(0),
            searchResults: [],
            selectionList: [],
            searchQuery: '',
            pageNumber: 0,
            isLoading: false,
            hasRemainingList: false,
            iOSKeyboardHeight: 0
        };
    }


    componentDidMount() {
        this.subscribeKeyboardListeners();
    }

    componentDidUpdate(prevProps, prevState) {
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
        this._messageInputRef.isFocused() && this.setState({ iOSKeyboardHeight: e.endCoordinates.height });
    }

    resetIOSKeyboardHeight = () => {
        this.setState({ iOSKeyboardHeight: 0 });
    }

    subscribeKeyboardListeners() {
        if (IS_ANDROID === false) {
            Keyboard.addListener('keyboardDidShow', this.setIOSKeyboardHeight);
            Keyboard.addListener('keyboardWillHide', this.resetIOSKeyboardHeight);
        }
    }

    searchFriend(searchParam, appendResults = false) {
        this.props.searchFriendsForChat(searchParam, this.props.user.userId, this.state.pageNumber, (res) => {
            if (this.state.searchQuery === '') return;
            this.setState(prevState => {
                return {
                    searchResults: appendResults
                        ? [...prevState.searchResults, ...this._markSelectedFriend(prevState.selectionList, res.data.friendList)]
                        : this._markSelectedFriend(prevState.selectionList, res.data.friendList),
                    pageNumber: res.data.friendList.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber,
                    hasRemainingList: res.data.remainingList > 0,
                    isLoading: false,
                };
            });
        }, (er) => { })
    }

    _markSelectedFriend(selectedList, newList) {
        selectedList.forEach(friend => {
            const idx = newList.findIndex(user => user.userId === friend.userId);
            if (idx > -1) newList[idx].isSelected = true;
        });
        return newList;
    }

    getImageFromCamera = () => {
        this.hidePicker(0);
        Actions.push(PageKeys.SELECTED_MEDIA_VIEW, { fromCamera: true, sendMessage: this.sendMessage, message: this.state.messageToBeSend, receivers: this.state.selectionList });
    }

    getImageFromGallery = () => {
        this.hidePicker(0);
        Actions.push(PageKeys.SELECTED_MEDIA_VIEW, { fromGallery: true, sendMessage: this.sendMessage, message: this.state.messageToBeSend, receivers: this.state.selectionList });
    }

    getSharableRides = () => {
        this.hidePicker(0);
        Actions.push(PageKeys.SELECTED_MEDIA_VIEW, { fromRides: true, userId: this.props.user.userId, shareRide: this.shareRide, message: this.state.messageToBeSend, receivers: this.state.selectionList });
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
            userIds: this.state.selectionList.map(friend => friend.userId)
        };
        if (images && images.length > 0) {
            data.type = CHAT_CONTENT_TYPE.IMAGE;
            data.media = images;
        } else {
            data.type = CHAT_CONTENT_TYPE.TEXT;
        }

        if (data.userIds.length > 1) {
            data.isAnonymousGroup = true
        }
        data.successCallback = this.sendMessageSuccessCallback;
        this.props.sendMessage(data);
        this._hasCalledSendMessageAPI = true;
    }

    shareRide = (rideId) => {
        const data = {
            userId: this.props.user.userId, name: this.props.user.name, nickname: this.props.user.nickname,
            senderPictureId: this.props.user.profilePictureId,
            content: rideId, type: CHAT_CONTENT_TYPE.RIDE,
            userIds: this.state.selectionList.map(friend => friend.userId)
        };
        if (data.userIds.length > 1) {
            data.isAnonymousGroup = true
        }
        data.successCallback = this.sendMessageSuccessCallback;
        this.props.sendMessage(data);
        this._hasCalledSendMessageAPI = true;
    }

    sendMessageSuccessCallback = (data) => {
        const memberName = this.state.selectionList.reduce((obb, detail) => {
            obb.name.push(detail.name)
            return obb;
        }, { name: [] })
        var chatInfo = data;
        if (memberName.name.length === 1) {
            chatInfo.name = memberName.name[0];
            chatInfo.id = this.state.selectionList[0].userId;
            chatInfo.isGroup = false;
        }
        else {
            chatInfo.memberNameList = memberName.name;
            chatInfo.id = data.reference.groupId;
            chatInfo.isGroup = true
        }
        Actions.push(PageKeys.CHAT, { comingFrom: PageKeys.CHAT_LIST, isGroup: data.isAnonymousGroup ? data.isAnonymousGroup : false, chatInfo: chatInfo, isChatSearchPage : true, });
        Toast.show({ text: 'Message sent successfully' })
    };

    componentWillUnmount() {
        this._hasCalledSendMessageAPI && this.props.onDismiss().then((res) => console.log(res));
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

    onChangeSearchQuery = (text) => {
        clearTimeout(this._searchQueryTimeout);
        this.setState({ searchQuery: text, pageNumber: 0 },
            () => this.state.searchQuery === ''
                ? this.clearSearchResults()
                : this._searchQueryTimeout = setTimeout(() => this.searchFriend(text), 200)
        );
    }

    userIdKeyExtractor = item => item.userId;

    clearSearchQuery = () => this.setState({ searchQuery: '', searchResults: [] });

    clearSearchResults = () => this.setState({ searchResults: [] });

    selectFriend(index) {
        this.setState(prevState => {
            return {
                selectionList: [...prevState.selectionList, prevState.searchResults[index]],
                searchResults: [
                    ...prevState.searchResults.slice(0, index),
                    { ...prevState.searchResults[index], isSelected: true },
                    ...prevState.searchResults.slice(index + 1)
                ]
            }
        });
    }

    removeFromSelected(userId) {
        this.setState(prevState => {
            return {
                selectionList: prevState.selectionList.filter((friend) => friend.userId !== userId),
                searchResults: prevState.searchResults ? prevState.searchResults.map(friend => {
                    return friend.userId === userId
                        ? { ...friend, isSelected: false }
                        : friend
                }) : null
            }
        });
    }

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.isLoading === true || distanceFromEnd < 0) return;
        this.setState({ isLoading: true });
        this.searchFriend(this.state.searchQuery, true);
    }

    renderFooter = () => {
        return this.state.isLoading
            ? <View style={{ paddingVertical: 20, borderTopWidth: 1, borderColor: "#CED0CE" }}>
                <ActivityIndicator animating size="large" />
            </View>
            : null;
    }

    render() {
        const { messageToBeSend, selectionList, searchResults, searchQuery, hasRemainingList, iOSKeyboardHeight } = this.state;
        return <BasePage heading={'New Message'} showShifter={false} rootContainerSafePadding={20}>
            <View style={[styles.fill, { backgroundColor: '#FFFFFF' }, { marginBottom: iOSKeyboardHeight }]}>
                <View style={styles.fill}>
                    <View style={{ minHeight: 50, borderBottomColor: '#707070', borderBottomWidth: 0.5 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}>
                            <DefaultText style={{ color: APP_COMMON_STYLES.headerColor, fontSize: 14, fontFamily: CUSTOM_FONTS.robotoBold, marginRight: 10 }}>TO:</DefaultText>
                            <View style={{ flex: 1, justifyContent: 'center', flexDirection: 'row' }}>
                                <TextInput value={searchQuery} placeholderTextColor={'#9A9A9A'} placeholder='Input name here' style={{ flex: 1, color: '#000000' }} onChangeText={this.onChangeSearchQuery} />
                                {searchQuery.length > 0 && <IconButton iconProps={{ name: 'clear', type: 'MaterialIcons', style: { fontSize: 20 } }} onPress={this.clearSearchQuery} />}
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 5, paddingTop: 5 }}>
                            {
                                selectionList.map(friend => {
                                    return <IconButton key={friend.userId} onPress={() => this.removeFromSelected(friend.userId)} title={friend.name} titleStyle={{ color: '#fff', fontFamily: CUSTOM_FONTS.robotoBold, marginLeft: 2, }} style={{ marginLeft: 3, marginBottom: 3, padding: 5, backgroundColor: APP_COMMON_STYLES.infoColor, borderRadius: 20 }} iconProps={{ name: 'close', type: 'FontAwesome', style: { color: '#fff', fontSize: 14 } }} />
                                })
                            }
                        </View>
                    </View>
                    <View style={{ flex: 1 }}>
                        {searchResults && searchResults.length === 0 && searchQuery !== '' && <DefaultText style={{ textAlign: 'center', marginTop: 10, fontSize: 18, color: APP_COMMON_STYLES.infoColor, fontFamily: CUSTOM_FONTS.robotoBold }}>Not found</DefaultText>}
                        <FlatList
                            contentContainerStyle={{ paddingBottom: hasRemainingList ? 40 : 0 }}
                            keyboardShouldPersistTaps={'handled'}
                            data={searchResults}
                            keyExtractor={this.userIdKeyExtractor}
                            ListFooterComponent={this.renderFooter}
                            onEndReached={this.loadMoreData}
                            onEndReachedThreshold={0.1}
                            renderItem={({ item, index }) => {
                                return <ListItem noIndent style={styles.itemCont} onPress={() => item.isSelected ? this.removeFromSelected(item.userId) : this.selectFriend(index)}>
                                    <Left style={styles.leftCont}>
                                        <View style={{
                                            marginRight: 15, height: 48, width: 48,
                                            alignSelf: 'center'
                                        }}>
                                            {
                                                item.profilePictureId
                                                    ? <Thumbnail style={{ flex: 1, width: null, height: null, backgroundColor: '#6C6C6B', borderRadius: 24 }}
                                                        source={{ uri: `${GET_PICTURE_BY_ID}${item.profilePictureId}` }} />
                                                    : <IconButton disabled style={{
                                                        flex: 1, backgroundColor: '#6C6C6B',
                                                        paddingLeft: 12, borderRadius: 24
                                                    }}
                                                        iconProps={{
                                                            name: 'user', type: 'FontAwesome', style: {
                                                                color: '#ffffff', width: 32,
                                                                height: 30, alignSelf: 'center'
                                                            }
                                                        }} />
                                            }
                                            {item.isSelected && <View style={{
                                                width: '100%', height: '100%', borderRadius: 24,
                                                position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)',
                                                alignItems: 'center', justifyContent: 'center'
                                            }}><NBIcon name='check' type='Entypo' style={{ color: '#fff', fontSize: 20 }} /></View>}
                                        </View>
                                        <DefaultText style={{
                                            fontSize: 14, color: '#1D527C',
                                            fontFamily: CUSTOM_FONTS.robotoBold,
                                            alignSelf: 'center'
                                        }}>{item.name}</DefaultText>
                                    </Left>
                                </ListItem>
                            }}
                        />
                        {
                            this.props.hasNetwork === false && ((searchResults && searchResults.length === 0 || !searchResults)) && <View style={{ flexDirection: 'column', justifyContent: 'space-between', position: 'absolute', top: heightPercentageToDP(15), left: widthPercentageToDP(27), height: 100, }}>
                                <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                                <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                            </View>
                        }

                    </View>
                </View>
                <View style={[styles.footer, this.props.hasNetwork === false ? { marginBottom: heightPercentageToDP(8.2) } : null]}>
                <IconButton disabled={searchResults.length===0} style={styles.footerLtIcnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: styles.footerLtIcon }} onPress={this.showPicker} />
                    <View style={styles.inputCont}>
                        <TextInput ref={elRef => this._messageInputRef = elRef} style={styles.inputBox} value={messageToBeSend} placeholder='Type a message...' placeholderTextColor='#3E3E3E' multiline={true} onChangeText={this.onChangeMessageToBeSend} />
                    </View>
                    <IconButton style={styles.footerRtIcnCont} iconProps={{ name: 'md-arrow-round-back', type: 'Ionicons', style: styles.footerRtIcon }} onPress={() => this.sendMessage(this.state.messageToBeSend)} />
                </View>
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
        </BasePage>
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { hasNetwork, lastApi, isRetryApi } = state.PageState;
    return { user, hasNetwork, lastApi, isRetryApi };
}
const mapDispatchToProps = (dispatch) => {
    return {
        sendMessage: (requestBody) => dispatch(sendMessage(requestBody)),
        searchFriendsForChat: (searchParam, userId, pageNumber, successCallback, errorCallback) => searchFriendsForChat(searchParam, userId, pageNumber).then(res => {
            console.log('searchFriendsForChat success : ', res.data)
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            successCallback(res)
        }).catch(er => {
            console.log('searchFriendsForChat error : ', er)
            errorCallback(er)
            handleServiceErrors(er, [searchParam, userId, pageNumber, successCallback, errorCallback], 'searchFriendsForChat', true, true);
        }),
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'chat_search', isRetryApi: state })),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(ChatSearch);