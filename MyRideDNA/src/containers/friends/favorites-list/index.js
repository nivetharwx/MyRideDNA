import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, TouchableWithoutFeedback, Animated, Text, Alert, Keyboard, FlatList, View, ImageBackground, ActivityIndicator, Easing } from 'react-native';
import { ListItem, Left, Thumbnail, Body, Right, Icon as NBIcon, CheckBox, Toast } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { widthPercentageToDP, heightPercentageToDP, APP_COMMON_STYLES, PageKeys, FRIEND_TYPE } from '../../../constants';
import { LabeledInputPlaceholder } from '../../../components/inputs';
import { IconButton } from '../../../components/buttons';
import { HorizontalCard } from '../../../components/cards';
import { getFriendsLocationList, getAllFriends } from '../../../api';
import { hideFriendsLocationAction, setCurrentFriendAction } from '../../../actions';

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

    componentDidMount() {
    }


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
        // TODO: Do API call based on searchfriend or all friends
        // this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, false, (res) => {
        // }, (err) => {
        // })
        this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, false, (res) => {
        }, (err) => {
        })
    }


    componentWillUnmount() {
    }



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
                <View style={{ marginHorizontal: widthPercentageToDP(9), marginTop: 16, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', borderRadius: 20, height: 37 }}>
                    <View style={{ flex: 2.89 }}>
                        <LabeledInputPlaceholder
                            placeholder='Name'
                            inputValue={searchQuery} inputStyle={{ paddingBottom: 0, borderBottomWidth: 0, width: widthPercentageToDP(47), marginLeft: 15, backgroundColor: '#fff' }}
                            returnKeyType='next'
                            onChange={this.onChangeSearchValue}
                            hideKeyboardOnSubmit={false}
                            containerStyle={styles.searchCont} />
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#C4C6C8', borderTopRightRadius: 20, borderBottomRightRadius: 20, justifyContent: 'center' }}>
                        <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { color: '#707070', fontSize: 22 } }} />
                    </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, borderBottomWidth: 1, borderBottomColor: '#868686', marginHorizontal: widthPercentageToDP(9), paddingBottom: 16 }}>
                    {/* <IconButton iconProps={{ name: 'star', type: 'Entypo', style: { color: this.state.isFilter === FILTERED_ACTION_IDS.FAVOURITE ? '#CE0D0D' : '#C4C6C8', fontSize: 23 } }} onPress={() => this.filterFavouriteFriend()} /> */}
                    <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { color: this.state.isFilter === FILTERED_ACTION_IDS.LOCATION_ENABLE ? '#2B77B4' : '#C4C6C8', fontSize: 23 } }} onPress={() => this.filterLocationEnableFriends()} />
                    <IconButton iconProps={{ name: 'location-arrow', type: 'FontAwesome', style: { color: this.state.isFilter === FILTERED_ACTION_IDS.VISIBLE_ON_MAP ? '#81BA41' : '#C4C6C8', fontSize: 23 } }} onPress={() => this.filterVisibleOnMapFriends()} />
                </View>
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
                        filteredFriends.length > 0
                            ?
                            <FlatList
                                style={{ flexDirection: 'column' }}
                                contentContainerStyle={styles.friendList}
                                data={filteredFriends}
                                refreshing={isRefreshing}
                                onRefresh={this.onPullRefresh}
                                keyExtractor={this.friendKeyExtractor}
                                extraData={this.state}
                                renderItem={({ item, index }) => (
                                    item.favorite ?
                                        <View style={{ flex: 1, maxWidth: widthPercentageToDP(50) }}>
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
                                        </View>
                                        : null
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
        marginHorizontal: widthPercentageToDP(4),
        marginBottom: heightPercentageToDP(4),
    },
    friendList: {
        marginHorizontal: widthPercentageToDP(5),
        paddingTop: 16
    },
});
