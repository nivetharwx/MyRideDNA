import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Animated, FlatList, View, Alert, ActivityIndicator, Easing } from 'react-native';
import { Tabs, Tab } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { DefaultText } from '../../components/labels';
import { APP_COMMON_STYLES, PageKeys, CUSTOM_FONTS, widthPercentageToDP, heightPercentageToDP, RELATIONSHIP, GET_PICTURE_BY_ID } from '../../constants';
import { SearchBoxFilter } from '../../components/inputs';
import { IconButton, ShifterButton } from '../../components/buttons';
import { getRoadBuddiesById, sendFriendRequest, approveFriendRequest, rejectFriendRequest, cancelFriendRequest, getMutualFriends } from '../../api';
import { HorizontalCard } from '../../components/cards';
import { setCurrentFriendAction, goToPrevProfileAction, resetPersonProfileAction, updateCurrentFriendAction } from '../../actions';
import { BasePage } from '../../components/pages';
import { getCurrentProfileState } from '../../selectors';


class BuddyFriends extends Component {
    filteredFriends = [];
    _screenIndex = null;
    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            isLoading: false,
            spinValue: new Animated.Value(0),
            searchQuery: '',
            pageNumber: 0,
            showLoader: false,
        }
    }

    componentDidMount() {
        this._screenIndex = this.props.screens.length;
        this.props.getRoadBuddiesById(this.props.user.userId, this.props.person.userId, 0, this.props.person.friendList, (res) => {
            if (res.friendList.length > 0) {
                this.setState({ pageNumber: 1, hasRemainingList: res.remainingList > 0 })
            }
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.screens.length > this.props.screens.length) {
            if (this.props.screens.length === this._screenIndex) {
                if (!this.props.person.isFriend) {
                    this.onPressBackButton();
                } else {
                    this.setState({ showLoader: false });
                }
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

            }
        });

    }

    onChangeTab = ({ from, i }) => {
        this.setState({ activeTab: i }, () => {
            if (i === 1) {
                this.setState({ searchQuery: '', pageNumber: 0 });
                this.props.getMutualFriends(this.props.user.userId, this.props.person.userId, 0, 10, undefined, (res) => {
                    if (res.friendList.length > 0) {
                        this.setState({ pageNumber: 1, hasRemainingList: res.remainingList > 0 })
                    }
                }, (error) => {
                })
            }
            else if (i === 0) {
                this.setState({ searchQuery: '', });
            }
        });
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
    }


    loadMoreData = (distanceFromEnd, type) => {
        if (this.state.isLoading === false && distanceFromEnd < 0) return;
        this.setState((prevState) => ({ isLoading: true }), () => {
            if (type === 'allBuddies') {
                this.props.getRoadBuddiesById(this.props.user.userId, this.props.person.userId, this.state.pageNumber, this.props.person.friendList, (res) => {
                    if (res.friendList.length > 0) {
                        this.setState({ pageNumber: this.state.pageNumber + 1, hasRemainingList: res.remainingList > 0 })
                    }
                    this.setState({ isLoading: false })
                }, (error) => {
                    this.setState({ isLoading: false })
                });
            }
            else if (type === 'mutualFriends') {
                this.props.getMutualFriends(this.props.user.userId, this.props.person.userId, this.state.pageNumber, 10, this.props.person.mutualFriends, (res) => {
                    if (res.friendList.length > 0) {
                        this.setState({ pageNumber: this.state.pageNumber + 1, hasRemainingList: res.remainingList > 0 })
                    }
                    this.setState({ isLoading: false })
                }, (er) => {
                    this.setState({ isLoading: false })
                })
            }
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

    onPressBackButton = () => {
        Actions.pop();
        this.props.goToPrevProfile();
    }

    friendKeyExtractor = (item) => item.userId;

    openFriendsProfileTab = (friend, type) => {
        if (this.state.searchQuery !== '')
            this.setState(prevState => ({ searchQuery: '' }));
        friend = friend || this.state.selectedPerson;
        if (friend.relationship === RELATIONSHIP.FRIEND || type === 'mutualFriends') {
            this.openProfile(friend.userId)
        }
        else {
            Actions.push(PageKeys.PASSENGER_PROFILE, { isUnknown: true, person: friend })
        }
    }
    openProfile = (userId) => {
        this.props.setCurrentFriend({ userId });
        this.setState({ searchQuery: '', isVisibleOptionsModal: false, showLoader: true });
        Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: userId });
    }

    onChangeSearchValue = (val) => this.setState({ searchQuery: val })

    approvingFriendRequest = (item) => this.props.approvedRequest(this.props.user.userId, item.userId, new Date().toISOString(), this.props.person.friendList, this.props.person.userId);

    rejectingFriendRequest = (item) => this.props.rejectRequest(this.props.user.userId, item.userId, this.props.person.friendList, this.props.person.userId);

    cancelingFriendRequest = (item) => this.props.cancelRequest(this.props.user.userId, item.userId, this.props.person.friendList, this.props.person.userId);

    sendFriendRequest = (item) => {
        const { user } = this.props;
        const requestBody = {
            senderId: user.userId,
            senderName: user.name,
            senderNickname: user.nickname,
            senderEmail: user.email,
            userId: item.userId,
            name: item.name,
            nickname: item.nickname,
            actionDate: new Date().toISOString()
        };
        this.props.sendFriendRequest(requestBody, item.userId, this.props.person.friendList, this.props.person.userId);
    }

    acceptRejectFriendRequest = (item) => {
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

    cancelFriendRequest = (item) => {
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

    getActions = (item) => {
        switch (item.relationship) {
            case RELATIONSHIP.RECIEVED_REQUEST: return { isIconImage: true, imgSrc: require('../../assets/img/accept-reject.png'), id: 4, onPressActions: () => this.acceptRejectFriendRequest(item), imgStyle: { height: 23, width: 26, marginTop: 6 } }
            case RELATIONSHIP.SENT_REQUEST: return { isIconImage: true, imgSrc: require('../../assets/img/add-frnd-frm-comm-success-green.png'), id: 4, onPressActions: () => this.cancelFriendRequest(item), imgStyle: { height: 23, width: 26, marginTop: 6 } }
            case RELATIONSHIP.UNKNOWN: return { isIconImage: true, imgSrc: require('../../assets/img/add-friend-from-community.png'), id: 4, onPressActions: () => this.sendFriendRequest(item), imgStyle: { height: 23, width: 26, marginTop: 6 } }
            default: return { isIconImage: true, imgSrc: require('../../assets/img/chat.png'), id: 4, onPressActions: () => this.openChatPage(item), imgStyle: { height: 23, width: 26, marginTop: 6 } }
        }
    }

    _renderItem = (item, index, type) => {
        return (
            <HorizontalCard
                horizontalCardPlaceholder={require('../../assets/img/friend-profile-pic.png')}
                item={item}
                onPressLeft={() => this.openFriendsProfileTab(item, type)}
                thumbnail={item.profilePictureId ? `${GET_PICTURE_BY_ID}${item.profilePictureId}` : null}
                cardOuterStyle={styles.horizontalCardOuterStyle}
                actionsBar={{
                    online: true,
                    actions: [
                        this.getActions(item)
                    ]
                }}
            />
        )
    }
    renderList = (data, type) => {
        return <FlatList
            contentContainerStyle={[{ paddingBottom: this.state.hasRemainingList ? 40 : 0 }, styles.friendList]}
            keyboardShouldPersistTaps={'handled'}
            showsVerticalScrollIndicator={false}
            style={{ flexDirection: 'column' }}
            data={data}
            keyExtractor={this.friendKeyExtractor}
            renderItem={({ item, index }) => this._renderItem(item, index, type)}
            ListFooterComponent={this.renderFooter}
            onEndReached={({ distanceFromEnd }) => this.loadMoreData(distanceFromEnd, type)}
            onEndReachedThreshold={0.1}
        />
    }

    render() {
        const { searchQuery, activeTab } = this.state;
        const { person } = this.props;
        this.filteredFriends = searchQuery === '' ? (activeTab && activeTab === 1 ? person.mutualFriends : person.friendList) : (activeTab && activeTab === 1 ? person.mutualFriends : person.friendList).filter(friend => {
            return (friend.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 ||
                (friend.nickname ? friend.nickname.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 : false))
        });
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        return (
            <BasePage heading={`${person.name}'s Road Crew`} showLoader={this.state.showLoader} onBackButtonPress={this.onPressBackButton}>
                <Tabs tabContainerStyle={APP_COMMON_STYLES.tabContainer} onChangeTab={this.onChangeTab} tabBarActiveTextColor='#fff' tabBarInactiveTextColor='#fff' tabBarUnderlineStyle={{ height: 0 }}>
                    <Tab heading='ALL' tabStyle={[styles.inActiveTab, styles.borderRightWhite]} activeTabStyle={[styles.activeTab, styles.borderRightWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                        <View style={{ marginHorizontal: widthPercentageToDP(8), flex: 1 }}>
                            <SearchBoxFilter
                                searchQuery={searchQuery} onChangeSearchValue={this.onChangeSearchValue}
                                placeholder='Name' outerContainer={{ marginTop: 16 }} />
                            {
                                this.renderList(this.filteredFriends, 'allBuddies')
                            }
                            {
                                this.props.hasNetwork === false && ((person.friendList && person.friendList.length === 0) || !person.friendList) && <View style={{ flexDirection: 'column', justifyContent: 'space-between', height: 100, position: 'absolute', top: heightPercentageToDP(20), left: widthPercentageToDP(27) }}>
                                    <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                                    <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                                </View>
                            }

                        </View>
                    </Tab>
                    <Tab heading='MUTUAL' tabStyle={[styles.inActiveTab, styles.borderRightWhite]} activeTabStyle={[styles.activeTab, styles.borderRightWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                        <View style={{ marginHorizontal: widthPercentageToDP(8), flex: 1 }}>
                            <SearchBoxFilter
                                searchQuery={searchQuery} onChangeSearchValue={this.onChangeSearchValue}
                                placeholder='Name' outerContainer={{ marginTop: 16 }} />
                            {
                                this.renderList(this.filteredFriends, 'mutualFriends')
                            }
                            {
                                this.props.hasNetwork === false && ((person.mutualFriends && person.mutualFriends.length === 0) || !person.mutualFriends) && <View style={{ flexDirection: 'column', justifyContent: 'space-between', height: 100, position: 'absolute', top: heightPercentageToDP(20), left: widthPercentageToDP(20) }}>
                                    <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                                    <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                                </View>
                            }
                        </View>
                    </Tab>
                </Tabs>
            </BasePage>
        )
    }
}

const mapStateToProps = (state, props) => {
    const { user } = state.UserAuth;
    const { pageNumber, hasNetwork } = state.PageState;
    const { screens } = state.FriendsProfiles;
    return { user, pageNumber, hasNetwork, screens, person: getCurrentProfileState(state, props) };
};
const mapDispatchToProps = (dispatch) => {
    return {
        getRoadBuddiesById: (userId, friendId, pageNumber, friendList, successCallback, errorCallback) => dispatch(getRoadBuddiesById(userId, friendId, pageNumber, friendList, successCallback, errorCallback)),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
        goToPrevProfile: () => dispatch(goToPrevProfileAction()),
        resetPersonProfile: () => dispatch(resetPersonProfileAction()),
        sendFriendRequest: (requestBody, personId, friendList, currentPersonId) => dispatch(sendFriendRequest(requestBody, (res) => {
            const personIdx = friendList.findIndex(friend => friend.userId === personId);
            const buddyFriend = { ...friendList[personIdx], relationship: RELATIONSHIP.SENT_REQUEST }
            const updatedBuddyFriendList = [
                ...friendList.slice(0, personIdx),
                buddyFriend,
                ...friendList.slice(personIdx + 1)
            ];
            dispatch(updateCurrentFriendAction({ friendList: updatedBuddyFriendList, userId: currentPersonId }));
        }, (error) => {
        })),
        approvedRequest: (userId, personId, actionDate, friendList, currentPersonId) => dispatch(approveFriendRequest(userId, personId, actionDate, (res) => {
            const personIdx = friendList.findIndex(friend => friend.userId === personId);
            const buddyFriend = { ...friendList[personIdx], relationship: RELATIONSHIP.FRIEND }
            const updatedBuddyFriendList = [
                ...friendList.slice(0, personIdx),
                buddyFriend,
                ...friendList.slice(personIdx + 1)
            ];
            dispatch(updateCurrentFriendAction({ friendList: updatedBuddyFriendList, userId: currentPersonId }));
        }, (error) => {
        })),
        rejectRequest: (userId, personId, friendList, currentPersonId) => dispatch(rejectFriendRequest(userId, personId, (res) => {
            const personIdx = friendList.findIndex(friend => friend.userId === personId);
            const buddyFriend = { ...friendList[personIdx], relationship: RELATIONSHIP.UNKNOWN }
            const updatedBuddyFriendList = [
                ...friendList.slice(0, personIdx),
                buddyFriend,
                ...friendList.slice(personIdx + 1)
            ];
            dispatch(updateCurrentFriendAction({ friendList: updatedBuddyFriendList, userId: currentPersonId }));
        }, (error) => {
        })),
        cancelRequest: (userId, personId, friendList, currentPersonId) => dispatch(cancelFriendRequest(userId, personId, (res) => {
            const personIdx = friendList.findIndex(friend => friend.userId === personId);
            const buddyFriend = { ...friendList[personIdx], relationship: RELATIONSHIP.UNKNOWN }
            const updatedBuddyFriendList = [
                ...friendList.slice(0, personIdx),
                buddyFriend,
                ...friendList.slice(personIdx + 1)
            ];
            dispatch(updateCurrentFriendAction({ friendList: updatedBuddyFriendList, userId: currentPersonId }));
        }, (error) => {
        })),
        getMutualFriends: (userId, friendId, pageNumber, preference, mutualFriends, successCallback, errorCallback) => dispatch(getMutualFriends(userId, friendId, pageNumber, preference, mutualFriends, successCallback, errorCallback)),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(BuddyFriends);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    inActiveTab: {
        backgroundColor: '#81BA41'
    },
    borderRightWhite: {
        borderRightWidth: 1,
        borderColor: '#fff'
    },
    activeTab: {
        backgroundColor: '#000000'
    },
    tabText: {
        fontSize: 13,
        fontFamily: CUSTOM_FONTS.robotoBold,
        letterSpacing: 0.6
    },
    friendList: {
        marginTop: 20,
    },
    horizontalCardOuterStyle: {
        marginBottom: heightPercentageToDP(4),
    }
});