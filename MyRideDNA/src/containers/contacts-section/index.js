import React, { PureComponent } from 'react';
import { View, StatusBar, Animated, Keyboard, FlatList, ActivityIndicator, Text, AppState, ScrollView, Alert } from 'react-native';
import { connect } from 'react-redux';
import { BasicHeader } from '../../components/headers';
import { Actions } from 'react-native-router-flux';
import { Icon as NBIcon, Tabs, Tab, TabHeading, ScrollableTab, Item, Toast, ListItem, Left, Body, Thumbnail, Right, CheckBox } from 'native-base';
import styles from './styles';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, IS_ANDROID, RELATIONSHIP, PageKeys, CUSTOM_FONTS } from '../../constants';
import { IconLabelPair, DefaultText } from '../../components/labels';
import { IconButton } from '../../components/buttons';
import { HorizontalCard } from '../../components/cards';
import Contacts from 'react-native-contacts';
import Permissions from 'react-native-permissions';
import { searchForFriend, sendFriendRequest, sendInvitationOrRequest, cancelFriendRequest, approveFriendRequest, rejectFriendRequest } from '../../api';
import { clearSearchFriendListAction, resetFriendRequestResponseAction, resetInvitationResponseAction, updateSearchListAction, updateFriendRequestResponseAction } from '../../actions';
import { isValidEmailFormat } from '../../util';
import { LabeledInputPlaceholder, SearchBoxFilter } from '../../components/inputs';

class ContactsSection extends PureComponent {
    searchQueryTimeout = null;
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0,
            canSubmit: false,
            recieverEmail: '',
            hasOpenedSettings: false,
            isVisibleSearchModal: false,
            searchName: '',
            selectedMember: null,
            userEnteredEmail: '',
            customMessage: '',
            spinValue: new Animated.Value(0),
            isLoading: false,
            isLoadingData: false
        };
    }

    async componentDidMount() {
        AppState.addEventListener('change', this.handleAppStateChange);
        try {
            await Permissions.request('contacts');
            this.readDeviceContacts();
        } catch (er) {
            console.log("Error: ", er);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.searchResults !== this.props.searchResults) {
            if (this.props.searchResults === null) {
                this.setState({ isVisibleSearchModal: false });
            } else {
                if (this.state.isVisibleSearchModal === false) {
                    this.setState({ isVisibleSearchModal: true });
                }
            }
        }
        if (prevProps.friendRequestSuccess !== this.props.friendRequestSuccess) {
            if (this.props.friendRequestSuccess !== null) {
                Toast.show({
                    text: "Friend request sent successfully",
                    buttonText: 'Okay',
                    type: 'success',
                    position: 'bottom',
                    onClose: () => this.props.clearFriendRequestResponse()
                });
                this.setState({ selectedMember: null, searchName: null, userEnteredEmail: '', customMessage: '', canSubmit: false });
            }
        } else if (prevProps.friendRequestError !== this.props.friendRequestError) {
            if (this.props.friendRequestError !== null) {
                Toast.show({
                    text: this.props.friendRequestError.userMessage,
                    buttonText: 'Okay',
                    position: 'bottom',
                    type: 'danger',
                    onClose: () => this.props.clearFriendRequestResponse()
                });
            }
        }
        if (prevProps.invitationSuccess !== this.props.invitationSuccess) {
            if (this.props.invitationSuccess !== null) {
                Toast.show({
                    text: "Request sent successfully",
                    buttonText: 'Okay',
                    type: 'success',
                    position: 'bottom',
                    onClose: () => this.props.clearInvitationResponse()
                });
                this.setState({ selectedMember: null, searchName: null, userEnteredEmail: '', customMessage: '', canSubmit: false });
            }
        } else if (prevProps.invitationError !== this.props.invitationError) {
            if (this.props.invitationError !== null) {
                Toast.show({
                    text: this.props.invitationError.userMessage,
                    buttonText: 'Okay',
                    position: 'bottom',
                    type: 'danger',
                    onClose: () => this.props.clearInvitationResponse()
                });
            }
        }
    }

    readDeviceContacts = () => {
        Contacts.getAll((err, contacts) => {
            if (err === 'denied') {
                Toast.show({
                    text: 'Please accept request to access your contacts',
                    buttonText: 'OK',
                    duration: 2000,
                    onClose: async (e) => {
                        if (e === 'user') {
                            await Permissions.openSettings();
                            this.setState({ hasOpenedSettings: true });
                        }
                    }
                });
                return;
            }
            setTimeout(() => {
                this.setState({
                    deviceContacts: contacts.reduce((list, contact) => {
                        list.push({
                            id: contact.recordID,
                            thumbnailPath: contact.thumbnailPath,
                            email: contact.emailAddresses.length > 0 ? contact.emailAddresses[0].email : null,
                            name: contact.givenName ? contact.middleName ? contact.givenName + contact.middleName : contact.givenName : '',
                            note: contact.note
                        })
                        return list;
                    }, [])
                });
            }, 0);
        });
    }

    handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'active') {
            if (this.state.hasOpenedSettings) {
                this.setState({ hasOpenedSettings: false });
                this.readDeviceContacts();
            }
        }
    }

    contactKeyExtractor = (item) => item.id;

    renderDeviceContact = ({ item, index }) => {
        return <ListItem disabled={item.email === null} avatar style={{ marginLeft: 0 }}>
            <Left style={{ paddingLeft: 5 }}>
                {
                    item.thumbnailPath
                        ? <Thumbnail source={{ uri: item.thumbnailPath }} />
                        : <View style={{ alignItems: 'center', justifyContent: 'center', width: widthPercentageToDP(10), height: widthPercentageToDP(10), borderWidth: 2, borderColor: '#6B7663', borderRadius: widthPercentageToDP(5), backgroundColor: item.email === null ? '#6B7663' : '#FFF' }}>
                            <DefaultText style={{ color: item.email === null ? '#FFF' : '#6B7663', fontFamily: CUSTOM_FONTS.robotoBold }}>{item.name.charAt(0)}</DefaultText>
                        </View>
                }
            </Left>
            <Body>
                <DefaultText>{item.name}</DefaultText>
                {
                    item.note
                        ? <DefaultText note>{item.note}</DefaultText>
                        : null
                }
            </Body>
            <Right style={{ borderBottomWidth: 0 }}>

            </Right>
        </ListItem>
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this.handleAppStateChange);
    }

    onPressBackButton = () => {
        this.props.clearSearchResults();
        Actions.pop();
    }

    onChangeTab = ({ from, i }) => {
        this.setState({ activeTab: i });
    }

    onCancelSearchModal = () => {
        this.setState({ isVisibleSearchModal: false });
    }

    searchResultsKeyExtractor = (item) => item.userId;

    selectCommunityMember = (index) => {
        Keyboard.dismiss();
        this.setState({
            selectedMember: this.props.searchResults[index],
            searchName: this.props.searchResults[index].name,
            canSubmit: true
        }, () => {
            this.props.clearSearchResults();
        });
    }

    renderFooter = () => {
        if (this.state.isLoading) {
            return (
                <View
                    style={{
                        paddingVertical: 20,
                        borderTopWidth: 1,
                        borderColor: "#CED0CE"
                    }}
                >
                    <ActivityIndicator animating size="large" />
                </View>
            );
        }
        return null
    }

    loadMoreData = () => {
        if (this.state.isLoadingData && this.state.isLoading === false && this.state.searchName !== '') {
            this.setState({ isLoading: true, isLoadingData: false })
            this.props.searchForFriend(this.state.searchName, this.props.user.userId, this.props.pageNumber, 10);
        }
    }

    onChangeSearchQuery = (val) => {
        this.setState({ searchQuery: val });
    }

    onClearUserEnteredEmail = () => this.setState({ userEnteredEmail: '', canSubmit: false });

    onClearCustomMessage = () => this.setState({ customMessage: '' });

    searchInCommunity = (val) => {
        clearTimeout(this.searchQueryTimeout);
        this.setState({ searchName: val }, () => this.state.searchName === '' && this.props.clearSearchResults());
        this.searchQueryTimeout = setTimeout(() => {
            if (this.state.searchName !== '') {
                this.props.searchForFriend(val, this.props.user.userId, 0, 10);
            }
        }, 300);
    }

    onChangeEmail = (val) => this.setState({ userEnteredEmail: val });

    onChangeCustomMessage = (val) => this.setState({ customMessage: val });

    validateEmail = () => {
        if (this.state.userEnteredEmail !== '' && isValidEmailFormat(this.state.userEnteredEmail)) {
            this.setState({ canSubmit: true });
        }
    }

    sendInvitationOrRequest = () => {
        if (this.state.selectedMember !== null) {
            this.sendFriendRequest();
        } else {
            this.sendFriendInvitation();
        }
    }

    openChatPage = (person) => {
        person['isGroup'] = false;
        person['id'] = person.userId;
        Actions.push(PageKeys.CHAT, { chatInfo: person });
    }

    sendFriendRequest = (selectedMember = this.state.selectedMember) => {
        const { user } = this.props;
        const requestBody = {
            senderId: user.userId,
            senderName: user.name,
            senderNickname: user.nickname,
            senderEmail: user.email,
            userId: selectedMember.userId,
            name: selectedMember.name,
            nickname: selectedMember.nickname,
            email: selectedMember.email,
            actionDate: new Date().toISOString()
        };
        this.props.sendFriendRequest(requestBody);
    }

    cancelingFriendRequest = (item) => {
        this.props.cancelRequest(this.props.user.userId, item.userId, item.id);
    }

    approvingFriendRequest = (item) => {
        this.props.approvedRequest(this.props.user.userId, item.userId, new Date().toISOString(), item.id);
    }
    rejectingFriendRequest = (item) => {
        this.props.rejectRequest(this.props.user.userId, item.userId, item.id);
    }

    sendFriendInvitation = () => {
        // TODO: Pass proper params customMessage, email, userId
        // TODO: Check this.state.customMessage add default message if empty
        console.log("sendFriendInvitation called");
        const { user } = this.props;
        this.props.sendInvitationOrRequest({
            senderId: user.userId,
            senderName: user.name,
            senderNickname: user.nickname,
            senderEmail: user.email,
            emailList: [this.state.userEnteredEmail],
            date: new Date().toISOString()
        })
    }

    renderCommunityMember = ({ item, index }) => {
        return (
            <ListItem avatar onPress={() => this.selectCommunityMember(index)}>
                <Left style={{ alignItems: 'center', justifyContent: 'center' }}>
                    {
                        item.profilePictureThumbnail
                            ? <Thumbnail source={{ uri: 'Image URL' }} />
                            : <NBIcon active name="person" type='MaterialIcons' style={{ width: widthPercentageToDP(6), color: '#fff' }} />
                    }
                </Left>
                <Body>
                    <DefaultText style={{ color: '#fff' }}>{item.name}</DefaultText>
                    <DefaultText style={{ color: '#fff' }} note></DefaultText>
                </Body>
                <Right>

                </Right>
            </ListItem>
        );
    }

    renderFooter = () => {
        if (this.state.isLoading) {
            return (
                <View
                    style={{
                        paddingVertical: 20,
                        borderTopWidth: 1,
                        borderColor: "#CED0CE"
                    }}
                >
                    <ActivityIndicator animating size="large" />
                </View>
            );
        }
        return null
    }

    retryApiFunction = () => {
        this.state.spinValue.setValue(0);
        Animated.timing(this.state.spinValue, {
            toValue: 1,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: true
        }).start(() => {
            if (this.props.hasNetwork === true) {
                this.props.searchForFriend(this.state.searchName, this.props.user.userId, this.props.pageNumber, 10);
            }
        });

    }

    renderIconOnOffline = (spin) => {
        return (<View style={{ flex: 1, position: 'absolute', top: 23 }}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(15), flex: 1, marginLeft: widthPercentageToDP(40) } }} onPress={this.retryApiFunction} />
            </Animated.View>
            <DefaultText style={{ marginLeft: widthPercentageToDP(13), fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</DefaultText>
            <DefaultText style={{ marginTop: heightPercentageToDP(2), marginLeft: widthPercentageToDP(25) }}>Please connect to internet </DefaultText>
        </View>);
    }

    getRightIconProps = (item) => {
        if (item.relationship === RELATIONSHIP.UNKNOWN) {
            return { righticonImage: require('../../assets/img/add-friend-from-community.png') }
        }
        else if (item.relationship === RELATIONSHIP.SENT_REQUEST) {
            return { righticonImage: require('../../assets/img/cancel.png'), imgStyles: { width: 23, height: 23 } }
        }
        else if (item.relationship === RELATIONSHIP.RECIEVED_REQUEST) {
            return { righticonImage: require('../../assets/img/accept-reject.png'), imgStyles: { width: 35, height: 35 } }
        }
        else {
            return { righticonImage: require('../../assets/img/chat-high-res.png') }
        }
        // { righticonImage: item.relationship === RELATIONSHIP.UNKNOWN ? require('../../assets/img/add-friend-from-community.png') : require('../../assets/img/chat-high-res.png') }
    }

    onPressRightIconProps = (item) => {
        if (item.relationship === RELATIONSHIP.UNKNOWN) {
            this.sendFriendRequest(item)
        }
        else if (item.relationship === RELATIONSHIP.SENT_REQUEST) {
            Alert.alert(
                'Do you want to cancel request ?',
                '',
                [
                    {
                        text: 'Yes ', onPress: () => {
                            this.cancelingFriendRequest(item)
                        }
                    },
                    { text: 'No', onPress: () => { }, style: 'cancel' },
                ],
                { cancelable: false }
            )
        }
        else if (item.relationship === RELATIONSHIP.RECIEVED_REQUEST) {
            Alert.alert(
                'Do you want to accept request ?',
                '',
                [
                    { text: 'cancel', onPress: () => { }, style: 'cancel' },
                    {
                        text: 'Accept ', onPress: () => {
                            this.approvingFriendRequest(item)
                        }
                    },
                    {
                        text: 'Reject', onPress: () => {
                            this.rejectingFriendRequest(item)
                        }
                    },
                ],
                { cancelable: false }
            )
        }
        else {
            this.openChatPage(item)
        }
        // () => item.relationship === RELATIONSHIP.UNKNOWN ? this.sendFriendRequest(item) : this.openChatPage(item)
    }

    render() {
        const { activeTab, searchName } = this.state;
        const { user, searchResults } = this.props;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        return (
            <View style={styles.rootContainer}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={styles.fill}>
                    <BasicHeader title='Add A Road Buddy' leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }} />
                    <Tabs tabContainerStyle={APP_COMMON_STYLES.tabContainer} onChangeTab={this.onChangeTab} tabBarActiveTextColor='#fff' tabBarInactiveTextColor='#fff' style={{ marginTop: APP_COMMON_STYLES.headerHeight }} tabBarUnderlineStyle={{ height: 0 }}>
                        <Tab heading='COMMUNITY' tabStyle={[styles.inActiveTab, styles.borderRightWhite]} activeTabStyle={[styles.activeTab, styles.borderRightWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                            <View style={{ marginHorizontal: widthPercentageToDP(8) }}>
                                <SearchBoxFilter
                                    searchQuery={searchName} onChangeSearchValue={this.searchInCommunity}
                                    placeholder='Name' outerContainer={{ marginTop: 16 }} />
                                <View style={{ borderBottomWidth: 3, borderBottomColor: '#F5891F', marginTop: 16 }}>
                                    <DefaultText style={{ marginLeft: widthPercentageToDP(3), fontFamily: CUSTOM_FONTS.robotoBold, letterSpacing: 0.6, marginBottom: 2 }}>SEARCH RESULTS</DefaultText>
                                </View>
                                <View style={{ marginTop: 16 }}>
                                    <FlatList
                                        // style={{ marginBottom: heightPercentageToDP(20) }}
                                        data={searchResults}
                                        keyExtractor={this.searchResultsKeyExtractor}
                                        keyboardShouldPersistTaps='handled'
                                        renderItem={({ item, index }) => (
                                            <HorizontalCard
                                                item={item}
                                                thumbnail={item.profilePicture}
                                                horizontalCardPlaceholder={require('../../assets/img/profile-pic.png')}
                                                cardOuterStyle={styles.horizontalCardOuterStyle}
                                                rightProps={this.getRightIconProps(item)}
                                                onPress={() => this.onPressRightIconProps(item)}
                                            />
                                        )}
                                        ListFooterComponent={this.renderFooter}
                                        onEndReached={this.loadMoreData}
                                        onEndReachedThreshold={0.1}
                                        onMomentumScrollBegin={() => this.setState({ isLoadingData: true })}
                                    />
                                    {this.props.hasNetwork === false && this.renderIconOnOffline(spin)}
                                </View>
                            </View>
                        </Tab>
                        <Tab heading='CONTACTS' tabStyle={[styles.inActiveTab, styles.borderLeftWhite, styles.borderRightWhite]} activeTabStyle={[styles.activeTab, styles.borderLeftWhite, styles.borderRightWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>

                        </Tab>
                        <Tab heading='FACEBOOK' tabStyle={[styles.inActiveTab, styles.borderLeftWhite]} activeTabStyle={[styles.activeTab, styles.borderLeftWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>

                        </Tab>
                    </Tabs>
                </View>
            </View >
        );
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { pageNumber } = state.PageState;
    const { searchResults, friendRequestSuccess, friendRequestError, invitationSuccess, invitationError } = state.CommunitySearchList;
    return { user, searchResults, friendRequestSuccess, friendRequestError, invitationSuccess, invitationError, pageNumber };
};
const mapDispatchToProps = (dispatch) => {
    return {
        searchForFriend: (searchParam, userId, pageNumber, preference) => dispatch(searchForFriend(searchParam, userId, pageNumber, preference)),
        clearSearchResults: () => dispatch(clearSearchFriendListAction()),
        clearFriendRequestResponse: () => dispatch(resetFriendRequestResponseAction()),
        clearInvitationResponse: () => dispatch(resetInvitationResponseAction()),
        sendFriendRequest: (requestBody) => dispatch(sendFriendRequest(requestBody, (res) => {
            dispatch(updateSearchListAction({ userId: requestBody.userId, relationship: RELATIONSHIP.SENT_REQUEST }));
        }, (error) => {
            dispatch(updateFriendRequestResponseAction({ error: error.response.data || "Something went wrong" }));
        })),
        sendInvitationOrRequest: (requestBody) => dispatch(sendInvitationOrRequest(requestBody)),
        cancelRequest: (userId, personId, requestId) => dispatch(cancelFriendRequest(userId, personId, requestId, (res) => {
            dispatch(updateSearchListAction({ userId: personId, relationship: RELATIONSHIP.UNKNOWN }))
        }, (error) => {
        })),
        approvedRequest: (userId, personId, actionDate, requestId) => dispatch(approveFriendRequest(userId, personId, actionDate, requestId, (res) => {
            dispatch(updateSearchListAction({ userId: personId, relationship: RELATIONSHIP.FRIEND }));
        }, (error) => {
        })),
        rejectRequest: (userId, personId, requestId) => dispatch(rejectFriendRequest(userId, personId, requestId, (res) => {
            dispatch(updateSearchListAction({ userId: personId, relationship: RELATIONSHIP.UNKNOWN }));
        }, (error) => {
        })),
        // updateSearchList:(userId, relationship) => dispatch(updateSearchListAction({userId, relationship}))
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(ContactsSection);