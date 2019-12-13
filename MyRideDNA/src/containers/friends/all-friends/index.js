import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Animated, FlatList, View, Alert, ActivityIndicator, Easing } from 'react-native';
import { getAllFriends, getAllFriends1, searchForFriend, sendFriendRequest, cancelFriendRequest, approveFriendRequest, rejectFriendRequest, doUnfriend, getAllOnlineFriends, getPicture, getFriendsLocationList, addFavorite, removeFavorite } from '../../../api';
import { FRIEND_TYPE, widthPercentageToDP, APP_COMMON_STYLES, heightPercentageToDP, RELATIONSHIP, PageKeys } from '../../../constants';
import { BaseModal } from '../../../components/modal';
import { LinkButton, IconButton, ImageButton } from '../../../components/buttons';
import { HorizontalCard } from '../../../components/cards';
import { openFriendProfileAction, updateFriendInListAction, screenChangeAction, hideFriendsLocationAction, setCurrentFriendAction } from '../../../actions';
import { Icon as NBIcon } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { LabeledInputPlaceholder, SearchBoxFilter } from '../../../components/inputs';
import { DefaultText } from '../../../components/labels';


const FILTERED_ACTION_IDS = {
    BTN_ADD_FRIEND: 'btn_add_friend',
    BTN_ONLINE_FRIENDS: 'btn_online_friends',
    BTN_ALL_FRIENDS: 'btn_all_friends',
    FAVOURITE_FRIENDS: 'favourite-friends',
    FAVOURITE: 'favourite',
    LOCATION_ENABLE_FRIENDS: 'location-enable-friends',
    LOCATION_ENABLE: 'location-enable',
    VISIBLE_ON_MAP_FRIENDS: 'visible-on-map-friends',
    VISIBLE_ON_MAP: 'visible-on-map',
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
    name: FILTERED_ACTION_IDS.BTN_ADD_FRIEND,
    position: 1,
    ...DEFAULT_FLOAT_ACTION_STYLE
}, {
    text: 'Online friends',
    icon: <NBIcon name='people' type='MaterialIcons' style={{ color: '#fff' }} />,
    name: FILTERED_ACTION_IDS.BTN_ONLINE_FRIENDS,
    position: 2,
    ...DEFAULT_FLOAT_ACTION_STYLE
}, {
    text: 'All friends',
    icon: <NBIcon name='people-outline' type='MaterialIcons' style={{ color: '#fff' }} />,
    name: FILTERED_ACTION_IDS.BTN_ALL_FRIENDS,
    position: 3,
    ...ACTIVE_FLOAT_ACTION_STYLE
},];

class AllFriendsTab extends Component {
    filteredFriends = []
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
            friendsFilter: FILTERED_ACTION_IDS.BTN_ALL_FRIENDS,
            isFilter: null,
            refreshList: false,
            isLoading: false,
            isLoadingData: false,
            filteredFriends: [],
            spinValue: new Animated.Value(0),
            searchQuery: ''
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
            if (this.props.friendsLocationList.activeLength > prevProps.friendsLocationList.activeLength) {
                this.setState({ isVisibleOptionsModal: false }, () => {
                    this.props.changeScreen({ name: PageKeys.MAP });
                })
            }
        }
        if (prevProps.allFriends !== this.props.allFriends) {
            if (prevState.isRefreshing === true) {
                this.setState({ isRefreshing: false });
            }
        }
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
        if (this.state.searchQuery !== '')
            this.setState(prevState => ({ searchQuery: '' }));
        const { selectedPerson } = this.state;
        this.openProfile(selectedPerson.userId)
    }

    openFriendGarageTab = () => {
        if (this.state.searchQuery !== '')
            this.setState(prevState => ({ searchQuery: '' }));
        const { selectedPerson } = this.state;
        this.openProfile(selectedPerson.userId)
    }

    openFriendsProfileTab = (friend) => {
        if (this.state.searchQuery !== '')
            this.setState(prevState => ({ searchQuery: '' }));
        friend = friend || this.state.selectedPerson;
        this.openProfile(friend.userId)
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
            actionDate: new Date().toISOString(),
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
        person['isGroup'] = false;
        person['id'] = person.userId;
        Actions.push(PageKeys.CHAT, { chatInfo: person });
        if (this.state.isVisibleOptionsModal)
            this.onCancelOptionsModal();
        if (this.state.searchQuery !== '')
            this.setState(prevState => ({ searchQuery: '' }));
    }

    onPullRefresh = () => {
        if (this.state.searchQuery !== '')
            this.setState(prevState => ({ searchQuery: '' }));
        this.setState({ isRefreshing: true });
        this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, false, (res) => {
        }, (err) => {
        })
    }

    showOptionsModal = (userId) => {
        let person = null;
        if (this.props.searchQuery.trim().length > 0) {
            const index = this.filteredFriends.findIndex(item => item.userId === userId)
            person = this.filteredFriends[index];
        }
        else {
            const index = this.props.allFriends.findIndex(item => item.userId === userId)
            person = this.props.allFriends[index];
        }
        this.setState({ selectedPerson: person, isVisibleOptionsModal: true });
    }

    onCancelOptionsModal = () => this.setState({ isVisibleOptionsModal: false, selectedPerson: null })

    toggleFriendsLocation = (isVisible, friendId) => {
        friendId = friendId || this.state.selectedPerson.userId;
        isVisible
            ? this.setState({ isVisibleOptionsModal: false }, () => {
                this.props.hideFriendsLocation(friendId);
            })
            : this.props.getFriendsLocationList(this.props.user.userId, [friendId])
    }

    renderMenuOptions = () => {
        if (this.state.selectedPerson === null) return;
        let options = null;
        const isVisible = this.props.friendsLocationList !== null && this.props.friendsLocationList[this.state.selectedPerson.userId] !== undefined && this.props.friendsLocationList[this.state.selectedPerson.userId].isVisible;
        if (this.state.selectedPerson.isOnline && this.state.selectedPerson.locationEnable) {
            options = [
                ...this.FRIEND_OPTIONS.slice(0, 3),
                {
                    text: isVisible ? `Hide\nlocation` : `Show\nlocation`, id: 'location', handler: () => this.toggleFriendsLocation(isVisible)
                },
                ...this.FRIEND_OPTIONS.slice(3),
            ]
        } else {
            options = this.FRIEND_OPTIONS;
        }
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

    openProfile = (userId) => {
        if (this.state.searchQuery !== '')
            this.setState(prevState => ({ searchQuery: '' }));
        this.props.setCurrentFriend({ userId });
        if (this.state.isVisibleOptionsModal) {
            this.setState({ isVisibleOptionsModal: false })
        }
        Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: userId });
    }

    loadMoreData = () => {
        if (this.state.isLoadingData && this.state.isLoading === false) {
            this.setState({ isLoading: true, isLoadingData: false })
            this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, this.props.pageNumber, false, (res) => {
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

    onChangeSearchValue = (val) => { this.setState({ searchQuery: val }) }

    toggleFavouriteFriend = (friend) => {
        friend = friend || this.state.selectedPerson;
        if (friend.favorite) {
            this.props.removeFavorite(friend.userId, this.props.user.userId)
        }
        else {
            this.props.addFavorite(friend.userId, this.props.user.userId)
        }

    }

    filterFavouriteFriend = () => {
        if (this.state.isFilter === FILTERED_ACTION_IDS.FAVOURITE) {
            this.setState({ friendsFilter: FILTERED_ACTION_IDS.BTN_ALL_FRIENDS, isFilter: null })
        }
        else {
            this.setState({ friendsFilter: FILTERED_ACTION_IDS.FAVOURITE_FRIENDS, isFilter: FILTERED_ACTION_IDS.FAVOURITE })
        }
    }

    filterLocationEnableFriends = () => {
        if (this.state.isFilter === FILTERED_ACTION_IDS.LOCATION_ENABLE) {
            this.setState({ friendsFilter: FILTERED_ACTION_IDS.BTN_ALL_FRIENDS, isFilter: null })
        }
        else {
            this.setState({ friendsFilter: FILTERED_ACTION_IDS.LOCATION_ENABLE_FRIENDS, isFilter: FILTERED_ACTION_IDS.LOCATION_ENABLE })
        }
    }

    filterVisibleOnMapFriends = () => {
        if (this.state.isFilter === FILTERED_ACTION_IDS.VISIBLE_ON_MAP) {
            this.setState({ friendsFilter: FILTERED_ACTION_IDS.BTN_ALL_FRIENDS, isFilter: null })
        }
        else {
            this.setState({ friendsFilter: FILTERED_ACTION_IDS.VISIBLE_ON_MAP_FRIENDS, isFilter: FILTERED_ACTION_IDS.VISIBLE_ON_MAP })
        }
    }

    render() {
        const { isRefreshing, isVisibleOptionsModal, friendsFilter, searchQuery } = this.state;
        const { allFriends, user, friendsLocationList } = this.props;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });

        if (friendsFilter === FILTERED_ACTION_IDS.BTN_ALL_FRIENDS) {
            this.filteredFriends = searchQuery === '' ? allFriends : allFriends.filter(friend => {
                return (friend.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 ||
                    (friend.nickname ? friend.nickname.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 : false))
            });
        } else if (friendsFilter === FILTERED_ACTION_IDS.BTN_ONLINE_FRIENDS) {
            const onlineFriends = allFriends.filter(friend => friend.isOnline);
            this.filteredFriends = searchQuery === '' ? onlineFriends : onlineFriends.filter(friend => {
                return (friend.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 ||
                    (friend.nickname ? friend.nickname.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 : false))
            });
        }
        else if (friendsFilter === FILTERED_ACTION_IDS.FAVOURITE_FRIENDS) {
            const favouriteFriends = allFriends.filter(friend => friend.favorite);
            this.filteredFriends = searchQuery === '' ? favouriteFriends : favouriteFriends.filter(friend => {
                return (friend.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 ||
                    (friend.nickname ? friend.nickname.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 : false))
            });
        }
        else if (friendsFilter === FILTERED_ACTION_IDS.LOCATION_ENABLE_FRIENDS) {
            const locationEnabledFriends = allFriends.filter(friend => friend.locationEnable);
            this.filteredFriends = searchQuery === '' ? locationEnabledFriends : locationEnabledFriends.filter(friend => {
                return (friend.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 ||
                    (friend.nickname ? friend.nickname.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 : false))
            });
        }
        else if (friendsFilter === FILTERED_ACTION_IDS.VISIBLE_ON_MAP_FRIENDS) {
            const friendsVisibleOnMap = allFriends.filter(friend => friendsLocationList[friend.userId] && friendsLocationList[friend.userId].isVisible === true);
            this.filteredFriends = searchQuery === '' ? friendsVisibleOnMap : friendsVisibleOnMap.filter(friend => {
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
                <View style={{ marginHorizontal: widthPercentageToDP(8) }}>
                    <SearchBoxFilter
                        searchQuery={searchQuery} onChangeSearchValue={this.onChangeSearchValue}
                        placeholder='Name' outerContainer={{ marginTop: 16 }}
                        footer={<View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, borderBottomWidth: 1, borderBottomColor: '#868686', paddingBottom: 16 }}>
                            <ImageButton imageSrc={require('../../../assets/img/add-person-icon.png')} imgStyles={{ width: 23, height: 26 }} onPress={() => {
                                Actions.push(PageKeys.CONTACTS_SECTION);
                                if (this.state.searchQuery !== '')
                                    this.setState(prevState => ({ searchQuery: '' }));
                            }} />
                            <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { color: this.state.isFilter === FILTERED_ACTION_IDS.LOCATION_ENABLE ? '#2B77B4' : '#C4C6C8', fontSize: 23 } }} onPress={() => this.filterLocationEnableFriends()} />
                            <IconButton iconProps={{ name: 'location-arrow', type: 'FontAwesome', style: { color: this.state.isFilter === FILTERED_ACTION_IDS.VISIBLE_ON_MAP ? '#81BA41' : '#C4C6C8', fontSize: 23 } }} onPress={() => this.filterVisibleOnMapFriends()} />
                        </View>}
                    />
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        style={{ flexDirection: 'column' }}
                        contentContainerStyle={styles.friendList}
                        data={this.filteredFriends}
                        refreshing={isRefreshing}
                        onRefresh={this.onPullRefresh}
                        keyExtractor={this.friendKeyExtractor}
                        extraData={this.state}
                        renderItem={({ item, index }) => (
                            <HorizontalCard
                                horizontalCardPlaceholder={require('../../../assets/img/friend-profile-pic.png')}
                                item={item}
                                onPressLeft={() => this.openFriendsProfileTab(item)}
                                thumbnail={item.profilePicture}
                                cardOuterStyle={styles.horizontalCardOuterStyle}
                                actionsBar={{
                                    online: true,
                                    actions: [{ name: item.favorite ? 'star' : 'star-outlined', id: 1, type: 'Entypo', color: item.favorite ? '#CE0D0D' : '#C4C6C8', onPressActions: () => this.toggleFavouriteFriend(item) },
                                    { name: 'search', id: 2, type: 'FontAwesome', color: item.locationEnable ? '#2B77B4' : '#C4C6C8' },
                                    { name: 'location-arrow', id: 3, type: 'FontAwesome', color: friendsLocationList[item.userId] !== undefined && friendsLocationList[item.userId].isVisible ? '#81BA41' : '#C4C6C8', onPressActions: () => this.toggleFriendsLocation(friendsLocationList[item.userId] !== undefined && friendsLocationList[item.userId].isVisible, item.userId) },
                                    { isIconImage: true, imgSrc: require('../../../assets/img/chat.png'), id: 4, onPressActions: () => this.openChatPage(item), imgStyle: { height: 23, width: 26, marginTop: 6 } }]
                                }}
                            />
                        )}
                        ListFooterComponent={this.renderFooter}
                        onEndReached={this.loadMoreData}
                        onEndReachedThreshold={0.1}
                        onMomentumScrollBegin={() => this.setState({ isLoadingData: true })}
                    />
                </View>
                {
                    this.props.hasNetwork === false && allFriends.length === 0 && <View style={{ flex: 1, position: 'absolute', top: heightPercentageToDP(30) }}>
                        <Animated.View style={{ transform: [{ rotate: spin }] }}>
                            <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(15), flex: 1, marginLeft: widthPercentageToDP(40) } }} onPress={this.retryApiFunction} />
                        </Animated.View>
                        <DefaultText style={{ marginLeft: widthPercentageToDP(13), fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</DefaultText>
                        <DefaultText style={{ marginTop: heightPercentageToDP(2), marginLeft: widthPercentageToDP(25) }}>Please connect to internetF</DefaultText>
                    </View>
                }
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
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
        hideFriendsLocation: (userId) => dispatch(hideFriendsLocationAction(userId)),
        addFavorite: (userId, senderId) => dispatch(addFavorite(userId, senderId)),
        removeFavorite: (userId, senderId) => dispatch(removeFavorite(userId, senderId))
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
        // marginHorizontal: widthPercentageToDP(3),
        paddingTop: 16
    },
    relationshipAction: {
        color: APP_COMMON_STYLES.headerColor
    },
    horizontalCardOuterStyle: {
        // marginHorizontal: widthPercentageToDP(4),
        marginBottom: heightPercentageToDP(4),
    },
    searchCont: {
        marginBottom: 0,
        flex: 1,
        width: widthPercentageToDP(47),
    },
});