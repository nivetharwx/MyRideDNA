import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Animated, FlatList, View, Alert, ActivityIndicator, Easing, StatusBar } from 'react-native';
import { Icon as NBIcon, Tabs, Tab } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { DefaultText } from '../../components/labels';
import { APP_COMMON_STYLES, PageKeys, CUSTOM_FONTS, widthPercentageToDP, heightPercentageToDP, FRIEND_TYPE, RELATIONSHIP, GET_PICTURE_BY_ID } from '../../constants';
import { BasicHeader } from '../../components/headers';
import { LabeledInputPlaceholder, SearchBoxFilter } from '../../components/inputs';
import { IconButton } from '../../components/buttons';
import { getRoadBuddiesById, getPictureList, sendFriendRequest, approveFriendRequest, rejectFriendRequest, cancelFriendRequest, getMutualFriends } from '../../api';
import { HorizontalCard } from '../../components/cards';
import { setCurrentFriendAction, goToPrevProfileAction, resetPersonProfileAction, updatePicturesAction, updateCurrentFriendAction } from '../../actions';


class BuddyFriends extends Component {
    filteredFriends = []
    isLoadingFrndsPic = false;
    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            isLoading: false,
            isLoadingData: false,
            spinValue: new Animated.Value(0),
            searchQuery: '',
            pageNumber: 1
        }
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.person.friendList !== this.props.person.friendList) {
            // if (!this.isLoadingFrndsPic) {
            //     const frndPicIdList = [];
            //     this.props.person.friendList.forEach((frnd) => {
            //         if (!frnd.profilePicture && frnd.profilePictureId) {
            //             frndPicIdList.push(frnd.profilePictureId);
            //         }
            //     })
            //     if (frndPicIdList.length > 0) {
            //         this.isLoadingFrndsPic = true;
            //         this.props.getPictureList(frndPicIdList, 'roadBuddies', () => this.isLoadingFrndsPic = false, () => this.isLoadingFrndsPic = false);
            //     }
            // }
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
                }, (error) => {
                })
            }
        });
    }



    // sendFriendRequest = (person) => {
    //     const { user } = this.props;
    //     const { selectedPerson } = this.state;
    //     person = person || selectedPerson;
    //     const requestBody = {
    //         senderId: user.userId,
    //         senderName: user.name,
    //         senderNickname: user.nickname,
    //         senderEmail: user.email,
    //         userId: person.userId,
    //         name: person.name,
    //         nickname: person.nickname,
    //         email: person.email,
    //         actionDate: new Date().toISOString(),
    //     };
    //     if (this.state.isVisibleOptionsModal) this.onCancelOptionsModal();
    //     this.props.sendFriendRequest(requestBody, person.userId);
    // }



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
                        this.setState({ pageNumber: this.state.pageNumber + 1 })
                    }
                    this.setState({ isLoading: false })
                }, (error) => {
                    this.setState({ isLoading: false })
                });
            }
            else if (type === 'mutualFriends') {
                this.props.getMutualFriends(this.props.user.userId, this.props.person.userId, this.state.pageNumber, 10, this.props.person.mutualFriends, (res) => {
                    if (res.friendList.length > 0) {
                        this.setState({ pageNumber: this.state.pageNumber + 1 })
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
        Actions.pop()
        this.props.hasPrevProfiles
            ? this.props.goToPrevProfile()
            : this.props.resetPersonProfile();
    }

    friendKeyExtractor = (item) => item.userId;

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
    onChangeSearchValue = (val) => { this.setState({ searchQuery: val }) }

    approvingFriendRequest = (item) => {
        this.props.approvedRequest(this.props.user.userId, item.userId, new Date().toISOString(), item.id, this.props.person.friendList, this.props.person.userId);
    }
    rejectingFriendRequest = (item) => {
        this.props.rejectRequest(this.props.user.userId, item.userId, item.id, this.props.person.friendList, this.props.person.userId);
    }
    cancelingFriendRequest = (item) => {
        this.props.cancelRequest(this.props.user.userId, item.userId, item.id, this.props.person.friendList, this.props.person.userId);
    }

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
            // email: item.email,
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
            case RELATIONSHIP.SENT_REQUEST: return { isIconImage: true, imgSrc: require('../../assets/img/cancel.png'), id: 4, onPressActions: () => this.cancelFriendRequest(item), imgStyle: { height: 23, width: 26, marginTop: 6 } }
            case RELATIONSHIP.UNKNOWN: return { isIconImage: true, imgSrc: require('../../assets/img/add-friend-from-community.png'), id: 4, onPressActions: () => this.sendFriendRequest(item), imgStyle: { height: 23, width: 26, marginTop: 6 } }
            default: return { isIconImage: true, imgSrc: require('../../assets/img/chat.png'), id: 4, onPressActions: () => this.openChatPage(item), imgStyle: { height: 23, width: 26, marginTop: 6 } }
        }
        // return { isIconImage: true, imgSrc: require('../../assets/img/chat.png'), id: 4, onPressActions: () => this.openChatPage(item), imgStyle: { height: 23, width: 26, marginTop: 6 } }
    }

    _renderItem = ({ item, index }) => {
        return (
            <HorizontalCard
                horizontalCardPlaceholder={require('../../assets/img/friend-profile-pic.png')}
                item={item}
                onPressLeft={() => this.openFriendsProfileTab(item)}
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
            showsVerticalScrollIndicator={false}
            style={{ flexDirection: 'column' }}
            contentContainerStyle={styles.friendList}
            data={data}
            keyExtractor={this.friendKeyExtractor}
            renderItem={this._renderItem}
            ListFooterComponent={this.renderFooter}
            onEndReached={({ distanceFromEnd }) => this.loadMoreData(distanceFromEnd, type)}
            onEndReachedThreshold={0.1}
        />
    }

    render() {
        const { searchQuery, isRefreshing } = this.state;
        const { person } = this.props;
        this.filteredFriends = searchQuery === '' ? person.friendList : person.friendList.filter(friend => {
            return (friend.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 ||
                (friend.nickname ? friend.nickname.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 : false))
        });
        return (
            <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent barStyle="light-content" />
                </View>
                <View style={styles.fill}>
                    <BasicHeader
                        title='Road Buddies'
                        leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                    />

                    <Tabs tabContainerStyle={APP_COMMON_STYLES.tabContainer} onChangeTab={this.onChangeTab} tabBarActiveTextColor='#fff' tabBarInactiveTextColor='#fff' style={{ marginTop: APP_COMMON_STYLES.headerHeight }} tabBarUnderlineStyle={{ height: 0 }}>
                        <Tab heading='ALL BUDDIES' tabStyle={[styles.inActiveTab, styles.borderRightWhite]} activeTabStyle={[styles.activeTab, styles.borderRightWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                            <View style={{ marginHorizontal: widthPercentageToDP(8), flex: 1 }}>
                                <SearchBoxFilter
                                    searchQuery={searchQuery} onChangeSearchValue={this.onChangeSearchValue}
                                    placeholder='Name' outerContainer={{ marginTop: 16 }} />
                                {
                                    this.renderList(this.filteredFriends, 'allBuddies')
                                }
                                {
                                    this.props.hasNetwork === false && person.friendList.length === 0 && <View style={{ flex: 1, position: 'absolute', top: heightPercentageToDP(30) }}>
                                        <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                            <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(15), flex: 1, marginLeft: widthPercentageToDP(40) } }} onPress={this.retryApiFunction} />
                                        </Animated.View>
                                        <DefaultText style={{ marginLeft: widthPercentageToDP(13), fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</DefaultText>
                                        <DefaultText style={{ marginTop: heightPercentageToDP(2), marginLeft: widthPercentageToDP(25) }}>Please connect to internet </DefaultText>
                                    </View>
                                }

                            </View>
                        </Tab>
                        <Tab heading='MUTUAL BUDDIES' tabStyle={[styles.inActiveTab, styles.borderRightWhite]} activeTabStyle={[styles.activeTab, styles.borderRightWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                            <View style={{ marginHorizontal: widthPercentageToDP(8), flex: 1 }}>
                                <SearchBoxFilter
                                    searchQuery={searchQuery} onChangeSearchValue={this.onChangeSearchValue}
                                    placeholder='Name' outerContainer={{ marginTop: 16 }} />
                                {
                                    this.renderList(person.mutualFriends, 'mutualFriends')
                                }
                            </View>
                        </Tab>
                    </Tabs>
                </View>

            </View>
        )
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { allFriends, paginationNum, searchFriendList, friendsLocationList } = state.FriendList;
    const { pageNumber, hasNetwork } = state.PageState;
    const { person } = state.CurrentProfile;
    const hasPrevProfiles = state.CurrentProfile.prevProfiles.length > 0;
    return { user, allFriends, paginationNum, searchFriendList, friendsLocationList, pageNumber, hasNetwork, person, hasPrevProfiles };
};
const mapDispatchToProps = (dispatch) => {
    return {
        getRoadBuddiesById: (userId, friendId, pageNumber, friendList, successCallback, errorCallback) => dispatch(getRoadBuddiesById(userId, friendId, pageNumber, friendList, successCallback, errorCallback)),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
        goToPrevProfile: () => dispatch(goToPrevProfileAction()),
        resetPersonProfile: () => dispatch(resetPersonProfileAction()),
        // getPictureList: (pictureIdList, callingFrom) => getPictureList(pictureIdList, (pictureObj) => {
        //     dispatch(updatePicturesAction({ pictureObj, type: callingFrom }))
        // }, (error) => {
        //     console.log('getPictureList error : ', error)
        // }),
        sendFriendRequest: (requestBody, personId, friendList, currentPersonId) => dispatch(sendFriendRequest(requestBody, (res) => {
            const personIdx = friendList.findIndex(friend => friend.userId === personId);
            const buddyFriend = { ...friendList[personIdx], relationship: RELATIONSHIP.SENT_REQUEST }
            const updatedBuddyFriendList = [
                ...friendList.slice(0, personIdx),
                buddyFriend,
                ...friendList.slice(personIdx + 1)
            ];
            dispatch(updateCurrentFriendAction({ friendList: updatedBuddyFriendList, userId: currentPersonId }));
            // dispatch(updateSearchListAction({userId: requestBody.userId, relationship: RELATIONSHIP.SENT_REQUEST }));
        }, (error) => {
            // dispatch(updateFriendRequestResponseAction({ error: error.response.data || "Something went wrong" }));
        })),
        approvedRequest: (userId, personId, actionDate, requestId, friendList, currentPersonId) => dispatch(approveFriendRequest(userId, personId, actionDate, requestId, (res) => {
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
        rejectRequest: (userId, personId, requestId, friendList, currentPersonId) => dispatch(rejectFriendRequest(userId, personId, requestId, (res) => {
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
        cancelRequest: (userId, personId, requestId, friendList, currentPersonId) => dispatch(cancelFriendRequest(userId, personId, requestId, (res) => {
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
    searchCont: {
        marginBottom: 0,
        flex: 1,
        width: widthPercentageToDP(47),
    },
    friendList: {
        marginTop: 20,
    },
    horizontalCardOuterStyle: {
        // marginHorizontal: widthPercentageToDP(4),
        marginBottom: heightPercentageToDP(4),
    }
});