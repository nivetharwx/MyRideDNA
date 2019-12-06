import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Animated, FlatList, View, Alert, ActivityIndicator, Easing, StatusBar } from 'react-native';
import { Icon as NBIcon, Tabs, Tab } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { DefaultText } from '../../components/labels';
import { APP_COMMON_STYLES, PageKeys, CUSTOM_FONTS, widthPercentageToDP, heightPercentageToDP, FRIEND_TYPE, RELATIONSHIP } from '../../constants';
import { BasicHeader } from '../../components/headers';
import { LabeledInputPlaceholder } from '../../components/inputs';
import { IconButton } from '../../components/buttons';
import { getRoadBuddiesById, getPictureList, sendFriendRequest, approveFriendRequest, rejectFriendRequest, cancelFriendRequest } from '../../api';
import { HorizontalCard } from '../../components/cards';
import { setCurrentFriendAction, goToPrevProfileAction, resetPersonProfileAction, updatePicturesAction } from '../../actions';


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
            if (!this.isLoadingFrndsPic) {
                const frndPicIdList = [];
                this.props.person.friendList.forEach((frnd) => {
                    if (!frnd.profilePicture && frnd.profilePictureId) {
                        frndPicIdList.push(frnd.profilePictureId);
                    }
                })
                if (frndPicIdList.length > 0) {
                    this.isLoadingFrndsPic = true;
                    this.props.getPictureList(frndPicIdList, 'roadBuddies', () => this.isLoadingFrndsPic = false, () => this.isLoadingFrndsPic = false);
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


    loadMoreData = () => {
        if (this.state.isLoadingData && this.state.isLoading === false) {
            this.setState({ isLoading: true, isLoadingData: false })
            this.props.getRoadBuddiesById(this.props.user.userId, this.props.person.userId, this.state.pageNumber, this.props.person.friendList, (res) => {
                if (res.friendList.length > 0) {
                    this.setState({ pageNumber: this.state.pageNumber + 1 })
                }
                this.setState({ isLoading: false })
            }, (error) => {
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
        this.props.approvedRequest(this.props.user.userId, item.userId, new Date().toISOString(), item.id);
    }
    rejectingFriendRequest = (item) => {
        this.props.rejectRequest(this.props.user.userId, item.userId, item.id);
    }
    cancelingFriendRequest = (item) => {
        this.props.cancelRequest(this.props.user.userId, item.userId, item.id);
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
            case RELATIONSHIP.FRIEND: return { isIconImage: true, imgSrc: require('../../assets/img/chat.png'), id: 4, onPressActions: () => this.openChatPage(item), imgStyle: { height: 23, width: 26, marginTop: 6 } }
        }
        // return { isIconImage: true, imgSrc: require('../../assets/img/chat.png'), id: 4, onPressActions: () => this.openChatPage(item), imgStyle: { height: 23, width: 26, marginTop: 6 } }
    }

    _renderItem = ({ item, index }) => {
        return (
            <HorizontalCard
                horizontalCardPlaceholder={require('../../assets/img/friend-profile-pic.png')}
                item={item}
                onPressLeft={() => this.openFriendsProfileTab(item)}
                thumbnail={item.profilePicture}
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

                    <Tabs tabContainerStyle={APP_COMMON_STYLES.tabContainer} tabBarActiveTextColor='#fff' tabBarInactiveTextColor='#fff' style={{ marginTop: APP_COMMON_STYLES.headerHeight }} tabBarUnderlineStyle={{ height: 0 }}>
                        <Tab heading='ALL BUDDIES' tabStyle={[styles.inActiveTab, styles.borderRightWhite]} activeTabStyle={[styles.activeTab, styles.borderRightWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                            <View style={{ marginHorizontal: widthPercentageToDP(8), flex: 1 }}>
                                <View style={{ marginTop: 16, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', borderRadius: 20, height: 37 }}>
                                    <View style={{ flex: 2.89 }}>
                                        <LabeledInputPlaceholder
                                            placeholder='Name'
                                            inputValue={searchQuery} inputStyle={{ borderBottomWidth: 0, width: widthPercentageToDP(47), marginLeft: 15, backgroundColor: '#fff' }}
                                            returnKeyType='next'
                                            onChange={this.onChangeSearchValue}
                                            hideKeyboardOnSubmit={true}
                                            containerStyle={styles.searchCont} />
                                    </View>
                                    <View style={{ flex: 1, backgroundColor: '#C4C6C8', borderTopRightRadius: 20, borderBottomRightRadius: 20, justifyContent: 'center' }}>
                                        <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { color: '#707070', fontSize: 22 } }} />
                                    </View>
                                </View>
                                <FlatList
                                    showsVerticalScrollIndicator={false}
                                    style={{ flexDirection: 'column' }}
                                    contentContainerStyle={styles.friendList}
                                    data={this.filteredFriends}
                                    refreshing={isRefreshing}
                                    onRefresh={this.onPullRefresh}
                                    keyExtractor={this.friendKeyExtractor}
                                    extraData={this.state}
                                    renderItem={this._renderItem}
                                    ListFooterComponent={this.renderFooter}
                                    onEndReached={this.loadMoreData}
                                    onEndReachedThreshold={0.1}
                                    onMomentumScrollBegin={() => this.setState({ isLoadingData: true })}
                                />
                                {/* rightIcon={{name:'user', type:'FontAwesome', style:styles.rightIconStyle}} /> */}
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
        getPictureList: (pictureIdList, callingFrom) => getPictureList(pictureIdList, (pictureObj) => {
            dispatch(updatePicturesAction({ pictureObj, type: callingFrom }))
        }, (error) => {
            console.log('getPictureList error : ', error)
        }),
        sendFriendRequest: (requestBody) => dispatch(sendFriendRequest(requestBody)),
        approvedRequest: (userId, personId, actionDate, requestId) => dispatch(approveFriendRequest(userId, personId, actionDate, requestId, (res) => {
            dispatch(updateSearchListAction({ userId: personId, relationship: RELATIONSHIP.FRIEND }));
        }, (error) => {
        })),
        rejectRequest: (userId, personId, requestId) => dispatch(rejectFriendRequest(userId, personId, requestId, (res) => {
            dispatch(updateSearchListAction({ userId: personId, relationship: RELATIONSHIP.UNKNOWN }));
        }, (error) => {
        })),
        cancelRequest: (userId, personId, requestId) => dispatch(cancelFriendRequest(userId, personId, requestId, (res) => {
            dispatch(updateSearchListAction({ userId: personId, relationship: RELATIONSHIP.UNKNOWN }))
        }, (error) => {
        })),
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