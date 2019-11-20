import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StatusBar, Animated, View, Easing } from 'react-native';
import { BasicHeader } from '../../components/headers';
import { Tabs, Tab } from 'native-base';
import { heightPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, FRIEND_TYPE, PageKeys } from '../../constants';
import styles from './styles';
import AllFriendsTab from './all-friends';
import GroupListTab from './group-list';
import FavoriteListTab from './favorites-list';
import { appNavMenuVisibilityAction, updateFriendInListAction, resetCurrentFriendAction, updateFriendRequestListAction } from '../../actions';
import { ShifterButton } from '../../components/buttons';
import { logoutUser, getAllFriendRequests, cancelFriendRequest, approveFriendRequest, rejectFriendRequest, createFriendGroup, getAllFriends, getAllFriends1, readNotification, getPictureList, getFriendGroups } from '../../api';
import { Loader } from '../../components/loader';
import { Actions } from 'react-native-router-flux';

const BOTTOM_TAB_HEIGHT = heightPercentageToDP(7);
class Friends extends Component {
    tabsRef = null;
    friendsTabsRef = null;
    viewImage = null;
    oldPosition = {};
    position = new Animated.ValueXY();
    dimensions = new Animated.ValueXY();
    animation = new Animated.Value(0);
    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            headerSearchMode: false,
            searchQuery: '',
            activeTab: -1,
            groupTabPressed: false,
            friendsActiveTab: 0,
        };
    }

    componentDidMount() {
        setTimeout(() => {
            if (this.props.comingFrom === PageKeys.NOTIFICATIONS || this.props.comingFrom === 'notificationPage' || this.props.comingFrom === PageKeys.FRIENDS) {
                switch (this.props.goTo) {
                    case 'REQUESTS':
                        this.tabsRef.goToPage(2);
                        this.props.readNotification(this.props.user.userId, this.props.notificationBody.id);
                        break;
                    case 'GROUP':
                        this.tabsRef.goToPage(1);
                        break;
                    default:
                        this.tabsRef.goToPage(0);
                }
            }
            else {
                this.tabsRef.goToPage(0)
            }
        }, 0);
        this.props.getAllRequest(this.props.user.userId, true);
        this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, true, (res) => {
        }, (err) => {
        });
    }


    componentDidUpdate(prevProps, prevState) {
        if (this.props.comingFrom === PageKeys.NOTIFICATIONS || this.props.comingFrom === 'notificationPage') {
            if (!prevProps.notificationBody || prevProps.notificationBody.id !== this.props.notificationBody.id) {
                switch (this.props.goTo) {
                    case 'REQUESTS':
                        // this.props.isRefresh && this.state.activeTab !== 2 && this.tabsRef.goToPage(2);
                        this.props.getAllRequest(this.props.user.userId, true);
                        break;
                    case 'GROUP':
                        // this.state.activeTab !== 1 && this.tabsRef.goToPage(1);
                        break;
                    default:
                    // this.state.activeTab !== 0 && this.tabsRef.goToPage(0);
                }
            }
        }

        if (prevProps.personInfo !== this.props.personInfo) {
            if (this.props.personInfo === null) {
                this.closeProfile();
            } else {
                this.openProfile();
            }
        }

        if (prevProps.allFriends !== this.props.allFriends) {
            const pictureIdList = [];
            this.props.allFriends.forEach((friend) => {
                if (!friend.profilePicture && friend.profilePictureId) {
                    pictureIdList.push(friend.profilePictureId);
                }
            })
            if (pictureIdList.length > 0) {
                this.props.getPictureList(pictureIdList);
            }
        }

        if (prevProps.allFriendRequests !== this.props.allFriendRequests) {
            const requestIdList = [];
            if (prevState.isRefreshing === true) {
                this.setState({ isRefreshing: false });
            }
            this.props.allFriendRequests.forEach((friendRequestPic) => {
                if (!friendRequestPic.profilePicture && friendRequestPic.profilePictureId) {
                    requestIdList.push(friendRequestPic.profilePictureId);
                }
            })
            if (requestIdList.length > 0) {
                this.props.getFriendRequestPic(requestIdList)
            }
        }
    }

    toggleAppNavigation = () => this.props.showAppNavMenu();

    onChangeTab = ({ from, i }) => {
        this.setState({ activeTab: i, headerSearchMode: false }, () => {
            if (this.state.activeTab === 2) {
                this.props.getAllRequest(this.props.user.userId, true);
            }
            if (i === 0 || i === 1 || i === 2) {
                this.setState({ searchQuery: '' })
            }
        });
        if (from === 2 && i === 0) {
            this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, true, (res) => {
            }, (err) => {
            });
        }
        if (from === 1 && i === 0) {
            this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, true, (res) => {
            }, (err) => {
            });
        }
        if (i === 1) {
            this.props.getFriendGroups(this.props.user.userId, true, 0, (res) => {
            }, (err) => {
            });
        }
    }

    onChangeFriendsTab = ({ from, i }) => {
        this.setState({ friendsActiveTab: i });
    }

    onPressLogout = async () => {
        this.props.logoutUser(this.props.user.userId, this.props.userAuthToken, this.props.deviceToken);
    }

    onPressBackButton = () => Actions.pop();

    render() {
        const { searchQuery, activeTab } = this.state;
        return (
            <View style={styles.fill}>
                {
                    this.state.selectedPersonImg
                        ? null
                        : <View style={APP_COMMON_STYLES.statusBar}>
                            <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                        </View>
                }
                <View style={{ flex: 1 }}>
                    <BasicHeader
                        title='Road Buddies'
                        leftIconProps={this.props.comingFrom === PageKeys.PROFILE ? { reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton } : null}
                    />
                    <Tabs tabContainerStyle={APP_COMMON_STYLES.tabContainer} ref={elRef => this.tabsRef = elRef} onChangeTab={this.onChangeTab} tabBarActiveTextColor='#fff' tabBarInactiveTextColor='#fff' style={{ marginTop: APP_COMMON_STYLES.headerHeight }} tabBarUnderlineStyle={{ height: 0 }}>
                        <Tab heading='ALL BUDDIES' tabStyle={[styles.inActiveTab, styles.borderRightWhite]} activeTabStyle={[styles.activeTab, styles.borderRightWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                            <AllFriendsTab refreshContent={activeTab === 0} searchQuery={searchQuery} />
                        </Tab>
                        <Tab heading='FAVORITES' tabStyle={[styles.inActiveTab, styles.borderRightWhite, styles.borderLeftWhite]} activeTabStyle={[styles.activeTab, styles.borderRightWhite, styles.borderLeftWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                            <FavoriteListTab />
                        </Tab>
                        <Tab heading='GROUPS' tabStyle={[styles.inActiveTab, styles.borderLeftWhite]} activeTabStyle={[styles.activeTab, styles.borderLeftWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                            <GroupListTab refreshContent={activeTab === 2} onPressAddGroup={this.onPressCreateGroup} />
                        </Tab>
                    </Tabs>
                    {/* Shifter: - Brings the app navigation menu */}
                    <ShifterButton onPress={this.toggleAppNavigation}
                        containerStyles={[{ bottom: this.state.selectedPersonImg ? IS_ANDROID ? BOTTOM_TAB_HEIGHT : BOTTOM_TAB_HEIGHT - 8 : 0 }, this.props.hasNetwork === false ? { bottom: heightPercentageToDP(8.5) } : null]}
                        alignLeft={this.props.user.handDominance === 'left'} />
                </View>
                <Loader isVisible={this.props.showLoader} />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user, userAuthToken, deviceToken } = state.UserAuth;
    const { allFriends, paginationNum } = state.FriendList;
    const { personInfo, oldPosition } = state.PageOverTab;
    const { allFriendRequests } = state.FriendRequest;
    const { showLoader, hasNetwork } = state.PageState;
    return { user, personInfo, oldPosition, allFriendRequests, allFriends, paginationNum, userAuthToken, deviceToken, showLoader, hasNetwork };
}
const mapDispatchToProps = (dispatch) => {
    return {
        getAllFriends: (friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback) => dispatch(getAllFriends(friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback)),
        getAllFriends1: (friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback) => dispatch(getAllFriends1(friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback)),
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        logoutUser: (userId, accessToken, deviceToken) => dispatch(logoutUser(userId, accessToken, deviceToken)),
        getAllRequest: (userId, toggleLoader) => dispatch(getAllFriendRequests(userId, toggleLoader)),
        cancelRequest: (userId, personId, requestId) => dispatch(cancelFriendRequest(userId, personId, requestId)),
        approvedRequest: (userId, personId, actionDate, requestId) => dispatch(approveFriendRequest(userId, personId, actionDate, requestId)),
        rejectRequest: (userId, personId, requestId) => dispatch(rejectFriendRequest(userId, personId, requestId)),
        createFriendGroup: (newGroupInfo) => dispatch(createFriendGroup(newGroupInfo)),
        getPictureList: (pictureIdList) => getPictureList(pictureIdList, (pictureObj) => {
            dispatch(updateFriendInListAction({ pictureObj }))
        }, (error) => {
            console.log('getPictureList all friend error : ', error)
        }),
        getFriendRequestPic: (requestIdList) => getPictureList(requestIdList, (pictureObj) => {
            dispatch(updateFriendRequestListAction({ pictureObj }))
        }, (error) => {
            console.log('getPictureList friendRequest error :  ', error)
        }),
        resetCurrentFriend: () => dispatch(resetCurrentFriendAction()),
        readNotification: (userId, notificationId) => dispatch(readNotification(userId, notificationId)),
        getFriendGroups: (userId, toggleLoader, pageNumber, successCallback, errorCallback) => dispatch(getFriendGroups(userId, toggleLoader, pageNumber, successCallback, errorCallback)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Friends);