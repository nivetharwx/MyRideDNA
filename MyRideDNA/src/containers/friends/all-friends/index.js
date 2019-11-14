import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Animated, ScrollView, Text, Keyboard, FlatList, View, Image, ImageBackground, TouchableOpacity, TouchableHighlight, Alert, ActivityIndicator, Easing } from 'react-native';
import { getAllFriends, getAllFriends1, searchForFriend, sendFriendRequest, cancelFriendRequest, approveFriendRequest, rejectFriendRequest, doUnfriend, getAllOnlineFriends, getPicture, getFriendsLocationList, addFavorite, removeFavorite } from '../../../api';
import { FRIEND_TYPE, widthPercentageToDP, APP_COMMON_STYLES, WindowDimensions, heightPercentageToDP, RELATIONSHIP, PageKeys } from '../../../constants';
import { BaseModal } from '../../../components/modal';
import { LinkButton, IconButton, ImageButton } from '../../../components/buttons';
import { ThumbnailCard, HorizontalCard } from '../../../components/cards';
import { openFriendProfileAction, updateFriendInListAction, screenChangeAction, hideFriendsLocationAction, setCurrentFriendAction } from '../../../actions';
import { FloatingAction } from 'react-native-floating-action';
import { Icon as NBIcon, Thumbnail } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { LabeledInputPlaceholder } from '../../../components/inputs';


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
        // TODO: Do API call based on searchfriend or all friends
        // this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, false, (res) => {
        // }, (err) => {
        // })
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
        // this.props.searchQuery.trim().length > 0 ? this.props.searchFriendList[index] : this.props.allFriends[index];
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

    openProfile = (userId) => {
        if (this.state.searchQuery !== '')
            this.setState(prevState => ({ searchQuery: '' }));
        this.props.setCurrentFriend({ userId });
        if (this.state.isVisibleOptionsModal) {
            this.setState({ isVisibleOptionsModal: false })
        }
        Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: userId });
    }

    filterOnlineFriends() {
        this.removeFriendsFilter(false);
        const onlineFilterIdx = FLOAT_ACTIONS.findIndex(actionBtn => actionBtn.name === FILTERED_ACTION_IDS.BTN_ONLINE_FRIENDS);
        FLOAT_ACTIONS[onlineFilterIdx] = { ...FLOAT_ACTIONS[onlineFilterIdx], ...ACTIVE_FLOAT_ACTION_STYLE };
        this.setState({ friendsFilter: FILTERED_ACTION_IDS.BTN_ONLINE_FRIENDS });
    }

    removeFriendsFilter(setDefaultActiveOption) {
        // DOC: `All friends` option will be the last (bottom-most) option
        const activeFilterIdx = FLOAT_ACTIONS.findIndex(actionBtn => actionBtn.name === this.state.friendsFilter);
        FLOAT_ACTIONS[activeFilterIdx] = { ...FLOAT_ACTIONS[activeFilterIdx], ...DEFAULT_FLOAT_ACTION_STYLE };
        if (setDefaultActiveOption) {
            FLOAT_ACTIONS[FLOAT_ACTIONS.length - 1] = { ...FLOAT_ACTIONS[FLOAT_ACTIONS.length - 1], ...ACTIVE_FLOAT_ACTION_STYLE };
            this.setState({ friendsFilter: FILTERED_ACTION_IDS.BTN_ALL_FRIENDS });
        }
    }

    onSelectFloatActionOptions = (name) => {
        switch (name) {
            case FILTERED_ACTION_IDS.BTN_ONLINE_FRIENDS:
                if (this.state.friendsFilter !== FILTERED_ACTION_IDS.BTN_ONLINE_FRIENDS) {
                    this.filterOnlineFriends();
                }
                break;
            case FILTERED_ACTION_IDS.BTN_ALL_FRIENDS:
                this.removeFriendsFilter(true);
                break;
            case FILTERED_ACTION_IDS.BTN_ADD_FRIEND:
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
        const { allFriends, searchFriendList, user, friendsLocationList } = this.props;
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
                <View style={{ marginHorizontal: widthPercentageToDP(9), marginTop: 16, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', borderRadius: 20, height: 37 }}>
                    <View style={{ flex: 2.89 }}>
                        <LabeledInputPlaceholder
                            placeholder='Name'
                            inputValue={searchQuery} inputStyle={{ borderBottomWidth: 0, width: widthPercentageToDP(47), marginLeft: 15, backgroundColor: '#fff' }}
                            returnKeyType='next'
                            onChange={this.onChangeSearchValue}
                            hideKeyboardOnSubmit={false}
                            containerStyle={styles.searchCont} />
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#C4C6C8', borderTopRightRadius: 20, borderBottomRightRadius: 20, justifyContent: 'center' }}>
                        <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { color: '#707070', fontSize: 22 } }} />
                    </View>
                    {/* rightIcon={{name:'user', type:'FontAwesome', style:styles.rightIconStyle}} /> */}

                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, borderBottomWidth: 1, borderBottomColor: '#868686', marginHorizontal: widthPercentageToDP(9), paddingBottom: 16 }}>
                    <ImageButton imageSrc={require('../../../assets/img/add-person-icon.png')} imgStyles={{ width: 23, height: 26 }} onPress={() => {
                        Actions.push(PageKeys.CONTACTS_SECTION);
                        if (this.state.searchQuery !== '')
                            this.setState(prevState => ({ searchQuery: '' }));
                    }} />
                    {/* <IconButton iconProps={{ name: 'star', type: 'Entypo', style: { color: this.state.isFilter === FILTERED_ACTION_IDS.FAVOURITE ? '#CE0D0D' : '#C4C6C8', fontSize: 23 } }} onPress={() => this.filterFavouriteFriend()} /> */}
                    <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { color: this.state.isFilter === FILTERED_ACTION_IDS.LOCATION_ENABLE ? '#2B77B4' : '#C4C6C8', fontSize: 23 } }} onPress={() => this.filterLocationEnableFriends()} />
                    <IconButton iconProps={{ name: 'location-arrow', type: 'FontAwesome', style: { color: this.state.isFilter === FILTERED_ACTION_IDS.VISIBLE_ON_MAP ? '#81BA41' : '#C4C6C8', fontSize: 23 } }} onPress={() => this.filterVisibleOnMapFriends()} />
                </View>
                <FlatList
                    style={{ flexDirection: 'column' }}
                    contentContainerStyle={styles.friendList}
                    data={this.filteredFriends}
                    refreshing={isRefreshing}
                    onRefresh={this.onPullRefresh}
                    keyExtractor={this.friendKeyExtractor}
                    extraData={this.state}
                    renderItem={({ item, index }) => (
                        <View style={{ flex: 1, maxWidth: widthPercentageToDP(50) }}>
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
                        </View>
                    )}
                    ListFooterComponent={this.renderFooter}
                    onEndReached={this.loadMoreData}
                    onEndReachedThreshold={0.1}
                    onMomentumScrollBegin={() => this.setState({ isLoadingData: true })}
                />
                {
                    this.props.hasNetwork === false && allFriends.length === 0 && <View style={{ flex: 1, position: 'absolute', top: heightPercentageToDP(30) }}>
                        <Animated.View style={{ transform: [{ rotate: spin }] }}>
                            <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(15), flex: 1, marginLeft: widthPercentageToDP(40) } }} onPress={this.retryApiFunction} />
                        </Animated.View>
                        <Text style={{ marginLeft: widthPercentageToDP(13), fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</Text>
                        <Text style={{ marginTop: heightPercentageToDP(2), marginLeft: widthPercentageToDP(25) }}>Please connect to internet </Text>
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
        marginHorizontal: widthPercentageToDP(5),
        paddingTop: 16
    },
    relationshipAction: {
        color: APP_COMMON_STYLES.headerColor
    },
    horizontalCardOuterStyle: {
        marginHorizontal: widthPercentageToDP(4),
        marginBottom: heightPercentageToDP(4),
    },
    searchCont: {
        marginBottom: 0,
        flex: 1,
        width: widthPercentageToDP(47),
    },
});