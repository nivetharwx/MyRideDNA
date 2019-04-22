import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Animated, ScrollView, Text, Keyboard, FlatList, View, Image, ImageBackground, TouchableOpacity, TouchableHighlight, Alert } from 'react-native';
import { getAllFriends, searchForFriend, sendFriendRequest, cancelFriendRequest, approveFriendRequest, rejectFriendRequest, doUnfriend, getAllOnlineFriends, getPicture, getFriendsLocationList } from '../../../api';
import { FRIEND_TYPE, widthPercentageToDP, APP_COMMON_STYLES, WindowDimensions, heightPercentageToDP, RELATIONSHIP, PageKeys } from '../../../constants';
import { BaseModal } from '../../../components/modal';
import { LinkButton } from '../../../components/buttons';
import { ThumbnailCard } from '../../../components/cards';
import { openFriendProfileAction, updateFriendInListAction, screenChangeAction } from '../../../actions';
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
    FRIEND_OPTIONS = [{ text: 'Profile', id: 'profile', handler: () => this.openProfile() }, { text: 'Rides', id: 'rides', handler: () => this.openProfile(undefined, undefined, 2) }, { text: 'Chat', id: 'chat', handler: () => { this.openChatPage() } }, { text: 'Call', id: 'call', handler: () => { } }, { text: 'Garage', id: 'garage', handler: () => this.openProfile(undefined, undefined, 1) }, { text: 'Unfriend', id: 'unfriend', handler: () => this.doUnfriend() }, { text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() }];
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
            refreshList: false
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

        Actions.push(PageKeys.CHAT, { friend: person })
        if (this.state.isVisibleOptionsModal)
            this.onCancelOptionsModal();
    }

    onPullRefresh = () => {
        this.setState({ isRefreshing: true });
        // TODO: Do API call based on searchfriend or all friends
        this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, this.props.paginationNum)
    }

    showOptionsModal = (index) => {
        const person = this.props.searchQuery.trim().length > 0 ? this.props.searchFriendList[index] : this.props.allFriends[index];
        this.setState({ selectedPerson: person, isVisibleOptionsModal: true });
    }

    onCancelOptionsModal = () => this.setState({ isVisibleOptionsModal: false, selectedPerson: null })

    showFriendsLocation = () => {
        this.props.getFriendsLocationList(this.props.user.userId, [this.state.selectedPerson.userId]);
    }

    renderMenuOptions = () => {
        if (this.state.selectedPerson === null) return;
        let options = null;
        if (this.state.selectedPerson.isOnline && this.state.selectedPerson.locationEnable) {
            options = [
                ...this.FRIEND_OPTIONS.slice(0, 3),
                { text: `Show\nlocation`, id: 'location', handler: () => this.showFriendsLocation() },
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

    openProfile = (index, friendType, activeTab) => {
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
        if (typeof index !== 'number') {
            index = this.props.allFriends.findIndex(person => person.userId === this.state.selectedPerson.userId);
        }
        if (this.state.isVisibleOptionsModal) {
            this.setState({ isVisibleOptionsModal: false })
        }
        Actions.push(PageKeys.FRIENDS_PROFILE, { friendIdx: index, friendType: FRIEND_TYPE.ALL_FRIENDS, activeTab: activeTab });
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

    render() {
        const { isRefreshing, isVisibleOptionsModal, friendsFilter } = this.state;
        const { allFriends, searchQuery, searchFriendList, user } = this.props;
        let filteredFriends = [];
        if (friendsFilter === FLOAT_ACTION_IDS.BTN_ALL_FRIENDS) {
            filteredFriends = searchQuery === '' ? allFriends : allFriends.filter(friend => {
                return (friend.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 ||
                    friend.nickname.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1)
            });
        } else if (friendsFilter === FLOAT_ACTION_IDS.BTN_ONLINE_FRIENDS) {
            const onlineFriends = allFriends.filter(friend => friend.isOnline);
            filteredFriends = searchQuery === '' ? onlineFriends : onlineFriends.filter(friend => {
                return (friend.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 ||
                    friend.nickname.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1)
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
                        ? <ImageBackground source={require('../../../assets/img/profile-bg.png')} style={styles.backgroundImage} />
                        : filteredFriends.length === 0
                            ? <ImageBackground source={require('../../../assets/img/profile-bg.png')} style={styles.backgroundImage}>
                                <Text style={{ color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(6), fontWeight: 'bold', letterSpacing: 1 }}>{`No friends found`}</Text>
                            </ImageBackground>
                            : <FlatList
                                style={{ flexDirection: 'column' }}
                                contentContainerStyle={styles.friendList}
                                numColumns={2}
                                data={filteredFriends}
                                refreshing={isRefreshing}
                                onRefresh={this.onPullRefresh}
                                keyExtractor={this.friendKeyExtractor}
                                extraData={this.state}
                                renderItem={({ item, index }) => (
                                    // <Thumbnail source={item.profilePicture ? { uri: item.profilePicture } : require('../../../assets/img/friend-profile-pic.png')} />
                                    <ThumbnailCard
                                        thumbnailPlaceholder={require('../../../assets/img/friend-profile-pic.png')}
                                        item={item}
                                        thumbnailRef={imgRef => this.friendsImageRef[index] = imgRef}
                                        onLongPress={() => this.showOptionsModal(index)}
                                        onPress={() => this.openProfile(index, FRIEND_TYPE.ALL_FRIENDS)}
                                    />
                                )}
                            />
                }
                <FloatingAction
                    floatingIcon={<NBIcon name='menu' type='MaterialIcons' style={{ color: '#fff' }} />}
                    actions={FLOAT_ACTIONS}
                    color={APP_COMMON_STYLES.headerColor}
                    position={user.handDominance === 'left' ? 'right' : 'left'}
                    onPressItem={this.onSelectFloatActionOptions}
                />
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { allFriends, paginationNum, searchFriendList, friendsLocationList } = state.FriendList;
    return { user, allFriends, paginationNum, searchFriendList, friendsLocationList };
};
const mapDispatchToProps = (dispatch) => {
    return {
        getAllFriends: (friendType, userId, pageNumber) => dispatch(getAllFriends(friendType, userId, pageNumber)),
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