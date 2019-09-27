import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Animated, ScrollView, Text, Keyboard, FlatList, View, Image, ImageBackground, TouchableOpacity, TouchableHighlight, Alert, ActivityIndicator, Easing } from 'react-native';
import { getAllFriends, getAllFriends1, searchForFriend, sendFriendRequest, cancelFriendRequest, approveFriendRequest, rejectFriendRequest, doUnfriend, getAllOnlineFriends, getPicture, getFriendsLocationList } from '../../../api';
import { FRIEND_TYPE, widthPercentageToDP, APP_COMMON_STYLES, WindowDimensions, heightPercentageToDP, RELATIONSHIP, PageKeys } from '../../../constants';
import { BaseModal } from '../../../components/modal';
import { LinkButton, IconButton } from '../../../components/buttons';
import { ThumbnailCard } from '../../../components/cards';
import { openFriendProfileAction, updateFriendInListAction, screenChangeAction, resetCurrentFriendAction, hideFriendsLocationAction } from '../../../actions';
import { FloatingAction } from 'react-native-floating-action';
import { Icon as NBIcon, Thumbnail } from 'native-base';
import { Actions } from 'react-native-router-flux';


const FLOAT_ACTION_IDS = {
    BTN_ADD_FRIEND: 'btn_add_friend',
    BTN_ONLINE_FRIENDS: 'btn_online_friends',
    BTN_ALL_FRIENDS: 'btn_all_friends',
};
const ACTIVE_FILTER_COLOR = '#81BB41';
const ACTIVE_FLOAT_ACTION_STYLE = {
    color: ACTIVE_FILTER_COLOR,
    textBackground: ACTIVE_FILTER_COLOR,
    textColor: '#fff',
};
const DEFAULT_FLOAT_ACTION_STYLE = {
    color: APP_COMMON_STYLES.headerColor,
    textBackground: APP_COMMON_STYLES.headerColor,
    textColor: '#fff',
};
const FLOAT_ACTIONS = [{
    text: 'Send freind request',
    icon: <NBIcon name='add-user' type='Entypo' style={{ color: '#fff' }} />,
    name: FLOAT_ACTION_IDS.BTN_ADD_FRIEND,
    position: 1,
    ...DEFAULT_FLOAT_ACTION_STYLE
}, {
    text: 'Online friends',
    icon: <NBIcon name='people' type='MaterialIcons' style={{ color: '#fff' }} />,
    name: FLOAT_ACTION_IDS.BTN_ONLINE_FRIENDS,
    position: 2,
    ...DEFAULT_FLOAT_ACTION_STYLE
}, {
    text: 'All friends',
    icon: <NBIcon name='people-outline' type='MaterialIcons' style={{ color: '#fff' }} />,
    name: FLOAT_ACTION_IDS.BTN_ALL_FRIENDS,
    position: 3,
    ...ACTIVE_FLOAT_ACTION_STYLE
},];

class AllFriendsTab extends Component {
    FRIEND_OPTIONS = [{ text: 'Profile', id: 'profile', handler: () => this.openFriendsProfileTab() }, { text: 'Rides', id: 'rides', handler: () => this.openFriendRideTab() }, { text: 'Chat', id: 'chat', handler: () => { this.openChatPage() } }, { text: 'Garage', id: 'garage', handler: () => this.openFriendGarageTab() }, { text: 'Unfriend', id: 'unfriend', handler: () => this.doUnfriend() }, { text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() }];
    UNKNOWN_OPTIONS = [{ text: 'Profile', id: 'profile', handler: () => { } }, { text: 'Rides', id: 'rides', handler: () => { } }, { text: 'Send\nRequest', id: 'sendRequest', handler: () => this.sendFriendRequest() }, { text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() }];
    SENT_REQUEST_OPTIONS = [{ text: 'Profile', id: 'profile', handler: () => { } }, { text: 'Rides', id: 'rides', handler: () => { } }, { text: 'Cancel\nRequest', id: 'cancelRequest', handler: () => this.cancelFriendRequest() }, { text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() }];
    RECEIVED_REQUEST_OPTIONS = [{ text: 'Profile', id: 'profile', handler: () => { } }, { text: 'Rides', id: 'rides', handler: () => { } }, { text: 'Accept\nRequest', id: 'acceptRequest', handler: () => { } }, { text: 'Reject\nRequest', id: 'rejectRequest', handler: () => { } }, { text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() }];
    searchResImageRef = [];
    friendsImageRef = [];
    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            isVisibleOptionsModal: false,
            selectedPerson: null,
            selectedPersonImg: null,
            friendsFilter: FLOAT_ACTION_IDS.BTN_ALL_FRIENDS,
            refreshList: false,
            isLoading: false,
            isLoadingData: false,
            filteredFriends: [],
            spinValue: new Animated.Value(0),
        }
    }

    componentDidMount() {
        const actionBtnIdx = FLOAT_ACTIONS.findIndex(actionBtn => actionBtn.color === ACTIVE_FILTER_COLOR);
        if (actionBtnIdx !== -1 && actionBtnIdx !== FLOAT_ACTIONS.length - 1) {
            FLOAT_ACTIONS[actionBtnIdx] = { ...FLOAT_ACTIONS[actionBtnIdx], ...DEFAULT_FLOAT_ACTION_STYLE };
            FLOAT_ACTIONS[FLOAT_ACTIONS.length - 1] = { ...FLOAT_ACTIONS[FLOAT_ACTIONS.length - 1], ...ACTIVE_FLOAT_ACTION_STYLE };
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.friendsLocationList !== this.props.friendsLocationList) {
            if (this.props.friendsLocationList && prevState.isVisibleOptionsModal === true) {
                this.setState({ isVisibleOptionsModal: false }, () => {
                    this.props.changeScreen({ name: PageKeys.MAP });
                })
            }
        }
        if (prevProps.allFriends !== this.props.allFriends) {
            // this.setState(prevState => ({ refreshList: !prevState.refreshList }));
            if (prevState.isRefreshing === true) {
                this.setState({ isRefreshing: false });
            }
            // this.props.allFriends.forEach((friend) => {
            //     if (!friend.profilePicture && friend.profilePictureId) {
            //         this.props.getPicture(friend.profilePictureId, friend.userId)
            //     }
            // })
            // this.props.getAllOnlineFriends(this.props.user.userId);
        }
        // if (this.props.refreshContent === true && prevProps.refreshContent === false) {
        //     this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0);
        // }
        // if (prevProps.searchQuery !== this.props.searchQuery && this.props.searchQuery.slice(-1) !== '') {
        //     Keyboard.dismiss();
        //     this.props.searchForFriend(this.props.searchQuery, this.props.user.userId, 0);
        // }
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
                this.props.getAllChats(this.props.user.userId);
            }
        });

    }

    openFriendRideTab = () => {
        const { selectedPerson } = this.state;
        this.openProfile(selectedPerson.userId, FRIEND_TYPE.ALL_FRIENDS, 2)
    }
    openFriendGarageTab = () => {
        const { selectedPerson } = this.state;
        this.openProfile(selectedPerson.userId, FRIEND_TYPE.ALL_FRIENDS, 1)
    }
    openFriendsProfileTab = () => {
        const { selectedPerson } = this.state;
        this.openProfile(selectedPerson.userId, FRIEND_TYPE.ALL_FRIENDS, 0)
    }
    sendFriendRequest = (person) => {
        const { user } = this.props;
        const { selectedPerson } = this.state;
        person = person || selectedPerson;
        const requestBody = {
            senderId: user.userId,
            senderName: user.name,
            senderNickname: user.nickname,
            senderEmail: user.email,
            userId: person.userId,
            name: person.name,
            nickname: person.nickname,
            email: person.email,
            actionDate: new Date().toISOString()
        };
        if (this.state.isVisibleOptionsModal) this.onCancelOptionsModal();
        this.props.sendFriendRequest(requestBody, person.userId);
    }

    cancelFriendRequest = (person) => {
        const { user } = this.props;
        const { selectedPerson } = this.state;
        person = person || selectedPerson;
        this.props.cancelFriendRequest(user.userId, person.userId);
        if (this.state.isVisibleOptionsModal) this.onCancelOptionsModal();
    }

    approveFriendRequest = (person) => {
        const { user } = this.props;
        const { selectedPerson } = this.state;
        person = person || selectedPerson;
        this.props.approveFriendRequest(user.userId, person.userId, new Date().toISOString());
        if (this.state.isVisibleOptionsModal) this.onCancelOptionsModal();
    }

    rejectFriendRequest = (person) => {
        const { user } = this.props;
        const { selectedPerson } = this.state;
        person = person || selectedPerson;
        this.props.rejectFriendRequest(user.userId, person.userId);
        if (this.state.isVisibleOptionsModal) this.onCancelOptionsModal();
    }

    doUnfriend = (person) => {
        const { user } = this.props;
        const { selectedPerson } = this.state;
        person = person || selectedPerson;

        Alert.alert(
            'Confirmation to unfriend',
            `Do you want to unfriend ${person.name}?`,
            [
                {
                    text: 'Yes', onPress: () => {
                        this.props.doUnfriend(user.userId, person.userId);
                        if (this.state.isVisibleOptionsModal)
                            this.onCancelOptionsModal();
                    }
                },
                { text: 'Cancel', onPress: () => { }, style: 'cancel' },
            ],
            { cancelable: false }
        );
    }

    openChatPage = (person) => {
        const { selectedPerson } = this.state;
        person = person || selectedPerson;
        person['isGroup'] = false
        person['id'] = person.userId
        Actions.push(PageKeys.CHAT, { chatInfo: person })
        if (this.state.isVisibleOptionsModal)
            this.onCancelOptionsModal();
    }

    onPullRefresh = () => {
        this.setState({ isRefreshing: true });
        // TODO: Do API call based on searchfriend or all friends
        // this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, false, (res) => {
        // }, (err) => {
        // })
        this.props.getAllFriends1(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, false, (res) => {
        }, (err) => {
        })
    }

    showOptionsModal = (userId) => {
        let person = null;
        if (this.props.searchQuery.trim().length > 0) {
            const index = this.state.filteredFriends.findIndex(item => item.userId === userId)
            person = this.state.filteredFriends[index];
        }
        else {
            const index = this.props.allFriends.findIndex(item => item.userId === userId)
            person = this.props.allFriends[index];
        }
        // this.props.searchQuery.trim().length > 0 ? this.props.searchFriendList[index] : this.props.allFriends[index];
        this.setState({ selectedPerson: person, isVisibleOptionsModal: true });
    }

    onCancelOptionsModal = () => this.setState({ isVisibleOptionsModal: false, selectedPerson: null })

    toggleFriendsLocation = (index = -1) => {
        index === -1
            ? this.props.getFriendsLocationList(this.props.user.userId, [this.state.selectedPerson.userId])
            : this.setState({ isVisibleOptionsModal: false }, () => {
                this.props.hideFriendsLocation([this.props.friendsLocationList[index]]);
            });
    }

    renderMenuOptions = () => {
        if (this.state.selectedPerson === null) return;
        let options = null;
        let locInfoIdx = -1;
        if (this.props.friendsLocationList) {
            locInfoIdx = this.props.friendsLocationList.findIndex(f => f.id === this.state.selectedPerson.userId);
        }
        if (this.state.selectedPerson.isOnline && this.state.selectedPerson.locationEnable) {
            options = [
                ...this.FRIEND_OPTIONS.slice(0, 3),
                {
                    text: locInfoIdx > -1 ? `Hide\nlocation` : `Show\nlocation`, id: 'location', handler: () => this.toggleFriendsLocation(locInfoIdx)
                },
                ...this.FRIEND_OPTIONS.slice(3),
            ]
        } else {
            options = this.FRIEND_OPTIONS;
        }
        // switch (this.state.selectedPerson.relationship) {
        //     case RELATIONSHIP.FRIEND:
        //         if (this.state.selectedPerson.isOnline && this.state.selectedPerson.locationEnable) {
        //             options = [
        //                 ...this.FRIEND_OPTIONS.slice(0, 3),
        //                 { text: `Show\nlocation`, id: 'location', handler: () => this.showFriendsLocation() },
        //                 ...this.FRIEND_OPTIONS.slice(3),
        //             ]
        //         } else {
        //             options = this.FRIEND_OPTIONS;
        //         }
        //         break;
        //     case RELATIONSHIP.RECIEVED_REQUEST:
        //         options = this.RECEIVED_REQUEST_OPTIONS;
        //         break;
        //     case RELATIONSHIP.SENT_REQUEST:
        //         options = this.SENT_REQUEST_OPTIONS;
        //         break;
        //     case RELATIONSHIP.UNKNOWN:
        //         options = this.UNKNOWN_OPTIONS;
        //         break;
        //     default:
        //         options = this.FRIEND_OPTIONS;
        //         break;
        // }
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

    friendKeyExtractor = (item) => item.userId;

    getActionsForRelationship = (person) => {
        switch (person.relationship) {
            case RELATIONSHIP.FRIEND:
                return null;
            case RELATIONSHIP.RECIEVED_REQUEST:
                return [
                    { title: 'Accept', onPress: () => this.approveFriendRequest(person), titleStyle: styles.relationshipAction },
                    { title: 'Reject', onPress: () => this.rejectFriendRequest(person), titleStyle: styles.relationshipAction },
                ]
            case RELATIONSHIP.SENT_REQUEST:
                return [
                    { title: 'Cancel Request', onPress: () => this.cancelFriendRequest(person), titleStyle: styles.relationshipAction }
                ]
            case RELATIONSHIP.UNKNOWN:
                return [
                    { title: 'Send Request', onPress: () => this.sendFriendRequest(person), titleStyle: styles.relationshipAction }
                ]
        }
    }

    openProfile = (userId, friendType, activeTab) => {
        this.props.resetCurrentFriend();
        // if (this.props.searchFriendList.length > 0) {
        //     const person = this.props.searchFriendList[index];
        //     this.searchResImageRef[index].measure((x, y, width, height, pageX, pageY) => {
        //         const userInfo = { userId: person.userId, image: require('../../../assets/img/friend-profile-pic.png') };
        //         const oldPosition = { pageX, pageY, width, height };
        //         this.props.openUserProfile({ personInfo: userInfo, oldPosition });
        //     });
        // } else {
        //     const person = this.props.allFriends[index];
        //     this.friendsImageRef[index].measure((x, y, width, height, pageX, pageY) => {
        //         const userInfo = { userId: person.userId, image: require('../../../assets/img/friend-profile-pic.png') };
        //         const oldPosition = { pageX, pageY, width, height };
        //         this.props.openUserProfile({ personInfo: userInfo, oldPosition });
        //     });
        // }
        // if (typeof index !== 'number') {
        //     index = this.props.allFriends.findIndex(person => person.userId === this.state.selectedPerson.userId);
        // }
        if (this.state.isVisibleOptionsModal) {
            this.setState({ isVisibleOptionsModal: false })
        }
        Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: userId, friendType: FRIEND_TYPE.ALL_FRIENDS, activeTab: activeTab });
    }

    filterOnlineFriends() {
        this.removeFriendsFilter(false);
        const onlineFilterIdx = FLOAT_ACTIONS.findIndex(actionBtn => actionBtn.name === FLOAT_ACTION_IDS.BTN_ONLINE_FRIENDS);
        FLOAT_ACTIONS[onlineFilterIdx] = { ...FLOAT_ACTIONS[onlineFilterIdx], ...ACTIVE_FLOAT_ACTION_STYLE };
        this.setState({ friendsFilter: FLOAT_ACTION_IDS.BTN_ONLINE_FRIENDS });
    }

    removeFriendsFilter(setDefaultActiveOption) {
        // DOC: `All friends` option will be the last (bottom-most) option
        const activeFilterIdx = FLOAT_ACTIONS.findIndex(actionBtn => actionBtn.name === this.state.friendsFilter);
        FLOAT_ACTIONS[activeFilterIdx] = { ...FLOAT_ACTIONS[activeFilterIdx], ...DEFAULT_FLOAT_ACTION_STYLE };
        if (setDefaultActiveOption) {
            FLOAT_ACTIONS[FLOAT_ACTIONS.length - 1] = { ...FLOAT_ACTIONS[FLOAT_ACTIONS.length - 1], ...ACTIVE_FLOAT_ACTION_STYLE };
            this.setState({ friendsFilter: FLOAT_ACTION_IDS.BTN_ALL_FRIENDS });
        }
    }

    onSelectFloatActionOptions = (name) => {
        switch (name) {
            case FLOAT_ACTION_IDS.BTN_ONLINE_FRIENDS:
                if (this.state.friendsFilter !== FLOAT_ACTION_IDS.BTN_ONLINE_FRIENDS) {
                    this.filterOnlineFriends();
                }
                break;
            case FLOAT_ACTION_IDS.BTN_ALL_FRIENDS:
                this.removeFriendsFilter(true);
                break;
            case FLOAT_ACTION_IDS.BTN_ADD_FRIEND:
                Actions.push(PageKeys.CONTACTS_SECTION);
                break;
        }
    }

    loadMoreData = () => {
        if (this.state.isLoadingData && this.state.isLoading === false) {
            this.setState({ isLoading: true, isLoadingData: false })
            // this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, true);
            // this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, this.props.pageNumber, false, (res) => {
            //     this.setState({ isLoading: false })
            // }, (err) => {
            //     this.setState({ isLoading: false })
            // });
            this.props.getAllFriends1(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, this.props.pageNumber, false, (res) => {
                this.setState({ isLoading: false })
            }, (err) => {
                this.setState({ isLoading: false })
            });
        }
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


    render() {
        const { isRefreshing, isVisibleOptionsModal, friendsFilter } = this.state;
        const { allFriends, searchQuery, searchFriendList, user, friendsLocationList } = this.props;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        if (friendsFilter === FLOAT_ACTION_IDS.BTN_ALL_FRIENDS) {
            this.state.filteredFriends = searchQuery === '' ? allFriends : allFriends.filter(friend => {
                return (friend.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 ||
                    (friend.nickname ? friend.nickname.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 : false))
            });
        } else if (friendsFilter === FLOAT_ACTION_IDS.BTN_ONLINE_FRIENDS) {
            const onlineFriends = allFriends.filter(friend => friend.isOnline);
            this.state.filteredFriends = searchQuery === '' ? onlineFriends : onlineFriends.filter(friend => {
                return (friend.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 ||
                    (friend.nickname ? friend.nickname.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 : false))
            });
        }
        return (
            <View style={styles.fill}>
                <BaseModal isVisible={isVisibleOptionsModal} onCancel={this.onCancelOptionsModal} onPressOutside={this.onCancelOptionsModal}>
                    <View style={[APP_COMMON_STYLES.menuOptContainer, user.handDominance === 'left' ? APP_COMMON_STYLES.leftDominantCont : null]}>
                        {
                            this.renderMenuOptions()
                        }
                    </View>
                </BaseModal>
                {
                    allFriends.length === 0
                        ?
                        this.props.hasNetwork === false ?
                            <View style={{ flex: 1, position: 'absolute', top: heightPercentageToDP(30) }}>
                                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                    <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(15), flex: 1, marginLeft: widthPercentageToDP(40) } }} onPress={this.retryApiFunction} />
                                </Animated.View>
                                <Text style={{ marginLeft: widthPercentageToDP(13), fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</Text>
                                <Text style={{ marginTop: heightPercentageToDP(2), marginLeft: widthPercentageToDP(25) }}>Please connect to internet </Text>
                            </View>
                            :
                            <ImageBackground source={require('../../../assets/img/profile-bg.png')} style={styles.backgroundImage} />
                        :
                        this.state.filteredFriends.length > 0
                            ?
                            <FlatList
                                style={{ flexDirection: 'column' }}
                                contentContainerStyle={styles.friendList}
                                numColumns={2}
                                data={this.state.filteredFriends}
                                refreshing={isRefreshing}
                                onRefresh={this.onPullRefresh}
                                keyExtractor={this.friendKeyExtractor}
                                extraData={this.state}
                                renderItem={({ item, index }) => (
                                    <View style={{ flex: 1, maxWidth: widthPercentageToDP(50) }}>
                                        <View style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', width: '80%', height: widthPercentageToDP(15), position: 'absolute', zIndex: 100, justifyContent: 'space-between' }}>
                                            {
                                                item.isOnline
                                                    ? <View style={{ backgroundColor: '#37B603', width: widthPercentageToDP(6), height: widthPercentageToDP(6), borderRadius: widthPercentageToDP(3), elevation: 10 }} />
                                                    : null
                                            }
                                            {
                                                item.isOnline && item.locationEnable
                                                    ? <IconButton iconProps={{ name: 'location-on', type: 'MaterialIcons', style: { color: friendsLocationList && friendsLocationList.findIndex(f => f.id === item.userId) > -1 ? APP_COMMON_STYLES.headerColor : '#ACACAC', fontSize: widthPercentageToDP(7) } }} />
                                                    : null
                                            }
                                        </View>
                                        <ThumbnailCard
                                            thumbnailPlaceholder={require('../../../assets/img/friend-profile-pic.png')}
                                            item={item}
                                            thumbnailRef={imgRef => this.friendsImageRef[index] = imgRef}
                                            onLongPress={() => this.showOptionsModal(item.userId)}
                                            onPress={() => this.openProfile(item.userId, FRIEND_TYPE.ALL_FRIENDS)}
                                        />
                                    </View>
                                )}
                                ListFooterComponent={this.renderFooter}
                                onEndReached={this.loadMoreData}
                                onEndReachedThreshold={0.1}
                                onMomentumScrollBegin={() => this.setState({ isLoadingData: true })}
                            />
                            :
                            this.props.hasNetwork
                                ? <ImageBackground source={require('../../../assets/img/profile-bg.png')} style={styles.backgroundImage}>
                                    <Text style={{ color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(6), fontWeight: 'bold', letterSpacing: 1 }}>{`No friends found`}</Text>
                                </ImageBackground>
                                :
                                <View style={{ flex: 1, position: 'absolute', top: heightPercentageToDP(30) }}>
                                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                        <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(15), flex: 1, marginLeft: widthPercentageToDP(40) } }} onPress={this.retryApiFunction} />
                                    </Animated.View>
                                    <Text style={{ marginLeft: widthPercentageToDP(13), fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</Text>
                                    <Text style={{ marginTop: heightPercentageToDP(2), marginLeft: widthPercentageToDP(25) }}>Please connect to internet </Text>
                                </View>
                }
                <FloatingAction
                    floatingIcon={<NBIcon name='menu' type='MaterialIcons' style={{ color: '#fff' }} />}
                    actions={FLOAT_ACTIONS}
                    color={APP_COMMON_STYLES.headerColor}
                    position={user.handDominance === 'left' ? 'right' : 'left'}
                    onPressItem={this.onSelectFloatActionOptions}
                    listenKeyboard={true}
                />
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { allFriends, paginationNum, searchFriendList, friendsLocationList } = state.FriendList;
    const { pageNumber, hasNetwork } = state.PageState;
    return { user, allFriends, paginationNum, searchFriendList, friendsLocationList, pageNumber, hasNetwork };
};
const mapDispatchToProps = (dispatch) => {
    return {
        getAllFriends: (friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback) => dispatch(getAllFriends(friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback)),
        getAllFriends1: (friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback) => dispatch(getAllFriends1(friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback)),
        getAllOnlineFriends: (userId) => dispatch(getAllOnlineFriends(userId)),
        searchForFriend: (searchParam, userId, pageNumber) => dispatch(searchForFriend(searchParam, userId, pageNumber)),
        sendFriendRequest: (requestBody, personId) => dispatch(sendFriendRequest(requestBody, personId)),
        cancelFriendRequest: (userId, personId) => dispatch(cancelFriendRequest(userId, personId)),
        approveFriendRequest: (userId, personId, actionDate) => dispatch(approveFriendRequest(userId, personId, actionDate)),
        rejectFriendRequest: (userId, personId) => dispatch(rejectFriendRequest(userId, personId)),
        doUnfriend: (userId, personId) => dispatch(doUnfriend(userId, personId)),
        openUserProfile: (profileInfo) => dispatch(openFriendProfileAction(profileInfo)),
        getPicture: (pictureId, friendId) => getPicture(pictureId, ({ picture, pictureId }) => {
            dispatch(updateFriendInListAction({ profilePicture: picture, userId: friendId }))
        }, (error) => {
            dispatch(updateFriendInListAction({ userId: friendId }))
        }),
        changeScreen: (screenProps) => dispatch(screenChangeAction(screenProps)),
        getFriendsLocationList: (userId, friendsIdList) => dispatch(getFriendsLocationList(userId, friendsIdList)),
        resetCurrentFriend: () => dispatch(resetCurrentFriendAction()),
        hideFriendsLocation: (list) => dispatch(hideFriendsLocationAction(list)),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(AllFriendsTab);

const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    backgroundImage: {
        height: null,
        width: null,
        flex: 1,
        alignItems: 'center',
        paddingTop: heightPercentageToDP(5)
    },
    friendList: {
        marginHorizontal: widthPercentageToDP(5),
        paddingTop: widthPercentageToDP(5)
    },
    relationshipAction: {
        color: APP_COMMON_STYLES.headerColor
    },
});