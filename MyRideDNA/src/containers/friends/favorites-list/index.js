import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Animated, FlatList, View, ActivityIndicator, Easing } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { widthPercentageToDP, heightPercentageToDP, APP_COMMON_STYLES, PageKeys, FRIEND_TYPE } from '../../../constants';
import { LabeledInputPlaceholder, SearchBoxFilter } from '../../../components/inputs';
import { IconButton } from '../../../components/buttons';
import { HorizontalCard } from '../../../components/cards';
import { getFriendsLocationList, getAllFriends } from '../../../api';
import { hideFriendsLocationAction, setCurrentFriendAction } from '../../../actions';
import { DefaultText } from '../../../components/labels';

const FILTERED_ACTION_IDS = {
    BTN_ALL_FRIENDS: 'btn_all_friends',
    LOCATION_ENABLE_FRIENDS: 'location-enable-friends',
    LOCATION_ENABLE: 'location-enable',
    VISIBLE_ON_MAP_FRIENDS: 'visible-on-map-friends',
    VISIBLE_ON_MAP: 'visible-on-map',
};


class FavoriteListTab extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedFriendList: [],
            isRefreshing: false,
            isLoading: false,
            isLoadingData: false,
            spinValue: new Animated.Value(0),
            searchQuery: '',
            isFilter: null,
            friendsFilter: FILTERED_ACTION_IDS.BTN_ALL_FRIENDS,
            spinValue: new Animated.Value(0),
        };
    }

    componentDidMount() { }

    componentDidUpdate(prevProps, prevState) {
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
                this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, false, (res) => {
                }, (err) => {
                })
            }
        });

    }

    onPullRefresh = () => {
        if (this.state.searchQuery !== '')
            this.setState(prevState => ({ searchQuery: '' }));
        this.setState({ isRefreshing: true });
        this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, false, (res) => {
        }, (err) => {
        })
    }

    componentWillUnmount() { }

    openChatPage = (person) => {
        const { selectedPerson } = this.state;
        person = person || selectedPerson;
        person['isGroup'] = false;
        person['id'] = person.userId;
        Actions.push(PageKeys.CHAT, { chatInfo: person })
        if (this.state.isVisibleOptionsModal)
            this.onCancelOptionsModal();
        if (this.state.searchQuery !== '')
            this.setState(prevState => ({ searchQuery: '' }));
    }

    openFriendsProfileTab = (friend) => {
        if (this.state.searchQuery !== '')
            this.setState(prevState => ({ searchQuery: '' }));
        friend = friend || this.state.selectedPerson;
        this.openProfile(friend.userId)
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

    toggleMembersLocation = (isVisible, groupId) => {
        groupId = groupId || this.state.selectedGroup.groupId
        isVisible
            ? this.setState({ isVisibleOptionsModal: false }, () => {
                this.props.hideMembersLocation(groupId);
            })
            : this.props.getAllMembersLocation(groupId, this.props.user.userId)
    }

    showOptionsModal = (index) => {
        this.setState({ selectedGroup: this.props.friendGroupList[index], isVisibleOptionsModal: true });
    }

    renderMenuOptions = () => {
        if (this.state.selectedGroup === null) return;
        const index = this.props.friendGroupList.findIndex(item => item.groupId === this.state.selectedGroup.groupId);
        const options = [{ text: 'Open group', id: 'openGroup', handler: () => this.openGroupInfo(index) }, { text: 'Chat', id: 'openChat', handler: () => this.openChatPage(index) }, { text: 'Exit group', id: 'exitGroup', handler: () => this.showExitGroupConfirmation() }];
        const isVisible = this.props.membersLocationList !== null && this.props.membersLocationList[this.state.selectedGroup.groupId] !== undefined && this.props.membersLocationList[this.state.selectedGroup.groupId].filter(f => !f.isVisible).length === 0;
        options.push({ text: isVisible === false ? `Show\nlocation` : `Hide\nlocation`, id: 'location', handler: () => this.toggleMembersLocation(isVisible) });
        options.push({ text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() });
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

    toggleFriendsLocation = (isVisible, friendId) => {
        friendId = friendId || this.state.selectedPerson.userId;
        isVisible
            ? this.setState({ isVisibleOptionsModal: false }, () => {
                this.props.hideFriendsLocation(friendId);
            })
            : this.props.getFriendsLocationList(this.props.user.userId, [friendId])
    }

    render() {
        const { searchQuery, isRefreshing, friendsFilter } = this.state;
        const { allFriends, friendsLocationList } = this.props;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        let filteredFriends = [];
        if (friendsFilter === FILTERED_ACTION_IDS.BTN_ALL_FRIENDS) {
            filteredFriends = searchQuery === '' ? allFriends : allFriends.filter(friend => {
                return (friend.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 ||
                    (friend.nickname ? friend.nickname.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 : false))
            });
        }
        else if (friendsFilter === FILTERED_ACTION_IDS.LOCATION_ENABLE_FRIENDS) {
            const locationEnabledFriends = allFriends.filter(friend => friend.locationEnable);
            filteredFriends = searchQuery === '' ? locationEnabledFriends : locationEnabledFriends.filter(friend => {
                return (friend.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 ||
                    (friend.nickname ? friend.nickname.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 : false))
            });
        }
        else if (friendsFilter === FILTERED_ACTION_IDS.VISIBLE_ON_MAP_FRIENDS) {
            const friendsVisibleOnMap = allFriends.filter(friend => friendsLocationList[friend.userId] && friendsLocationList[friend.userId].isVisible === true);
            filteredFriends = searchQuery === '' ? friendsVisibleOnMap : friendsVisibleOnMap.filter(friend => {
                return (friend.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 ||
                    (friend.nickname ? friend.nickname.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 : false))
            });
        }
        return (
            <View style={styles.fill}>
                <View style={{ flex: 1, marginHorizontal: widthPercentageToDP(8) }}>
                    <SearchBoxFilter
                        searchQuery={searchQuery} onChangeSearchValue={this.onChangeSearchValue}
                        placeholder='Name' outerContainer={{ marginTop: 16 }}
                        footer={<View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, borderBottomWidth: 1, borderBottomColor: '#868686', paddingBottom: 16 }}>
                            <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { color: this.state.isFilter === FILTERED_ACTION_IDS.LOCATION_ENABLE ? '#2B77B4' : '#C4C6C8', fontSize: 23 } }} onPress={() => this.filterLocationEnableFriends()} />
                            <IconButton iconProps={{ name: 'location-arrow', type: 'FontAwesome', style: { color: this.state.isFilter === FILTERED_ACTION_IDS.VISIBLE_ON_MAP ? '#81BA41' : '#C4C6C8', fontSize: 23 } }} onPress={() => this.filterVisibleOnMapFriends()} />
                        </View>}
                    />
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        style={{ flexDirection: 'column' }}
                        contentContainerStyle={styles.friendList}
                        data={filteredFriends.filter(item => item.favorite)}
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
                                    actions: [
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
                        <DefaultText style={{ marginTop: heightPercentageToDP(2), marginLeft: widthPercentageToDP(25) }}>Please connect to internet</DefaultText>
                    </View>
                }
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { allFriends, friendsLocationList } = state.FriendList;
    const { pageNumber, hasNetwork } = state.PageState;
    return { user, pageNumber, hasNetwork, allFriends, friendsLocationList };
};
const mapDispatchToProps = (dispatch) => {
    return {
        getAllFriends: (friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback) => dispatch(getAllFriends(friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback)),
        getFriendsLocationList: (userId, friendsIdList) => dispatch(getFriendsLocationList(userId, friendsIdList)),
        hideFriendsLocation: (userId) => dispatch(hideFriendsLocationAction(userId)),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(FavoriteListTab);

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
    horizontalCardOuterStyle: {
        marginBottom: heightPercentageToDP(4),
    },
    friendList: {
        paddingTop: 16
    },
    searchCont: {
        marginBottom: 0,
        flex: 1,
        width: widthPercentageToDP(47),
    }
});
