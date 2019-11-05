import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StatusBar, Animated, Text, View, FlatList, Easing } from 'react-native';
import { BasicHeader } from '../../components/headers';
import { Tabs, Tab, TabHeading, ScrollableTab, ListItem, Left, Body, Right, Icon as NBIcon, Toast, Thumbnail } from 'native-base';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, USER_AUTH_TOKEN, WindowDimensions, FRIEND_TYPE, PageKeys, RELATIONSHIP } from '../../constants';
import styles from './styles';
import AllFriendsTab from './all-friends';
import GroupListTab from './group-list';
import { appNavMenuVisibilityAction, updateFriendInListAction, resetCurrentFriendAction, updateFriendRequestListAction } from '../../actions';
import { ShifterButton, IconButton, LinkButton } from '../../components/buttons';
import { IconLabelPair } from '../../components/labels';
import { logoutUser, getAllFriendRequests, getPicture, cancelFriendRequest, approveFriendRequest, rejectFriendRequest, createFriendGroup, getAllFriends, getAllFriends1, readNotification, getPictureList, getFriendGroups } from '../../api';
import { BaseModal } from '../../components/modal';
import { LabeledInput } from '../../components/inputs';
import { getFormattedDateFromISO } from '../../util';
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
            isVisibleGroupModal: false,
            newGroupName: '',
            spinValue: new Animated.Value(0),
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
        // this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, true, (res) => {
        // }, (err) => {
        // });
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


        // if (prevProps.allFriends !== this.props.allFriends) {
        //     this.props.allFriends.forEach((friend) => {
        //         if (!friend.profilePicture && friend.profilePictureId) {
        //             this.props.getPicture(friend.profilePictureId, friend.userId)
        //         }
        //     })
        // }
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

        // if (prevProps.allFriendRequests !== this.props.allFriendRequests) {
        //     if (prevState.isRefreshing === true) {
        //         this.setState({ isRefreshing: false });
        //     }
        //     this.props.allFriendRequests.forEach((friendRequestPic) => {
        //         if (!friendRequestPic.profilePicture && friendRequestPic.profilePictureId) {
        //             this.props.getFriendRequestPic(friendRequestPic.profilePictureId, friendRequestPic.id)
        //         }
        //     })
        // }
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

    onPullRefresh = () => {
        this.setState({ isRefreshing: true });
        this.props.getAllRequest(this.props.user.userId, false);
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

    openProfile = () => {
        const { pageX, pageY, width, height } = this.props.oldPosition;
        this.position.setValue({ x: pageX, y: pageY });
        this.dimensions.setValue({ x: width, y: height });

        this.setState({ selectedPersonImg: this.props.personInfo.image }, () => {
            this.viewImage.measure((dx, dy, dWidth, dHeight, dPageX, dPageY) => {
                Animated.parallel([
                    Animated.timing(this.position.x, {
                        toValue: (dWidth / 2) - (widthPercentageToDP(100) * 65 / 200),
                        duration: 300
                    }),
                    Animated.timing(this.position.y, {
                        toValue: heightPercentageToDP(100) * 10 / 100,
                        duration: 300
                    }),
                    Animated.timing(this.dimensions.x, {
                        toValue: widthPercentageToDP(100) * 65 / 100,
                        duration: 300
                    }),
                    Animated.timing(this.dimensions.y, {
                        toValue: widthPercentageToDP(100) * 65 / 100,
                        duration: 300
                    }),
                    Animated.timing(this.animation, {
                        toValue: 1,
                        duration: 300
                    }),
                ]).start(() => StatusBar.setBarStyle('light-content'));
            });
        });
    }

    cancelingFriendRequest = (item) => {
        this.props.cancelRequest(this.props.user.userId, item.userId, item.id);
    }

    approvingFriendRequest = (item) => {
        this.props.approvedRequest(this.props.user.userId, item.userId, new Date().toISOString(), item.id);
    }
    rejectingFriendRequest = (item) => {
        this.props.rejectRequest(this.props.user.userId, item.userId, item.id);
    }
    closeProfile = () => {
        Animated.parallel([
            Animated.timing(this.position.x, {
                toValue: this.props.oldPosition.pageX,
                duration: 300
            }),
            Animated.timing(this.position.y, {
                toValue: this.props.oldPosition.pageX,
                duration: 300
            }),
            Animated.timing(this.dimensions.x, {
                toValue: this.props.oldPosition.width,
                duration: 300
            }),
            Animated.timing(this.dimensions.y, {
                toValue: this.props.oldPosition.height,
                duration: 300
            }),
            Animated.timing(this.animation, {
                toValue: 0,
                duration: 300
            }),
        ]).start(() => {
            this.setState({ selectedPersonImg: null });
        });
    }

    onPressLogout = async () => {
        this.props.logoutUser(this.props.user.userId, this.props.userAuthToken, this.props.deviceToken);
    }

    renderFriendRequestList = ({ item, index }) => {
        if (item.requestType === "sentRequest") {
            return (
                <ListItem avatar style={{ marginLeft: 0, paddingLeft: 10, backgroundColor: index % 2 === 0 ? '#fff' : '#F3F2F2' }} >
                    <Left style={{ alignItems: 'center', justifyContent: 'center' }} onPress={() => this.openUserProfile(item.userId)}>
                        <Thumbnail style={styles.thumbnail} source={item.profilePicture ? { uri: item.profilePicture } : item.profilePictureId ? null : require('../../assets/img/friend-profile-pic.png')} />
                    </Left>
                    <Body onPress={() => this.openUserProfile(item.userId)}>
                        {/* <Text>{`${item.name} (${item.nickname})`}</Text> */}
                        <View style={{ flexDirection: 'row' }}>
                            <Text>{`${item.name}`}</Text>
                            {item.nickname ?
                                <Text>{` (${item.nickname})`}</Text>
                                : null
                            }
                            <IconButton iconProps={{ name: 'call-made', type: 'MaterialCommunityIcons', style: { color: '#81BB41', fontSize: 13 } }} />
                        </View>
                        <Text>{getFormattedDateFromISO(item.actionDate, '/')}</Text>
                    </Body>
                    <Right>
                        <IconButton iconProps={{ name: 'close', type: 'MaterialIcons', style: { fontSize: 25, color: '#6B7663' } }} onPress={() => this.cancelingFriendRequest(item)} />
                    </Right>
                </ListItem>
            )
        }
        else {
            return (
                <ListItem avatar style={{ marginLeft: 0, paddingLeft: 10, backgroundColor: index % 2 === 0 ? '#fff' : '#F3F2F2' }}>
                    <Left onPress={() => this.openUserProfile(item.userId)}>
                        <Thumbnail style={styles.thumbnail} source={item.profilePicture ? { uri: item.profilePicture } : item.profilePictureId ? null : require('../../assets/img/friend-profile-pic.png')} />
                    </Left>
                    <Body onPress={() => this.openUserProfile(item.userId)}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text>{`${item.name}`}</Text>
                            {item.nickname ?
                                <Text>{` (${item.nickname})`}</Text>
                                : null
                            }
                            <IconButton iconProps={{ name: 'call-received', type: 'MaterialCommunityIcons', style: { color: '#81BB41', fontSize: 13 } }} />
                        </View>
                        <Text>{getFormattedDateFromISO(item.actionDate, '/')}</Text>
                        {/* <Text>{item.senderName}</Text>
                        <Text>({item.senderNickname})</Text> */}
                    </Body>
                    <Right style={{ flexDirection: 'row' }}>
                        <IconButton iconProps={{ name: 'add-user', type: 'Entypo', style: { fontSize: 25, color: '#6B7663' } }} onPress={() => this.approvingFriendRequest(item)} />
                        <IconButton iconProps={{ name: 'remove-user', type: 'Entypo', style: { fontSize: 25, marginLeft: widthPercentageToDP(4), color: '#6B7663' } }} onPress={() => this.rejectingFriendRequest(item)} />
                    </Right>
                </ListItem>
            )
        }
    }

    requestKeyExtractor = (item) => item.id;

    onCancelGroupForm = () => {
        this.setState({ isVisibleGroupModal: false, newGroupName: '' });
    }

    onSubmitGroupForm = () => {
        const { newGroupName } = this.state;
        if (newGroupName.trim().length === 0) {
            Toast.show({
                text: 'Please provide a group name',
                buttonText: 'Okay'
            });
        } else {
            this.isAddingGroup = true;
            this.props.createFriendGroup({
                groupName: newGroupName,
                createdBy: this.props.user.userId,
                createdDate: new Date().toISOString(),
            });
            this.setState({
                isVisibleGroupModal: false
            })
        }
    }

    onPressCreateGroup = () => {
        this.setState({ isVisibleGroupModal: true })
    }

    openUserProfile = (item) => {
        console.log(item);
        // Actions.push(PageKeys.FRIENDS_PROFILE, { relationshipStatus: RELATIONSHIP.UNKNOWN, person: item, activeTab: 0 });
    }

    render() {
        const { headerSearchMode, searchQuery, activeTab, friendsActiveTab, isRefreshing } = this.state;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        const activeImageStyle = {
            width: this.dimensions.x,
            height: this.dimensions.y,
            left: this.position.x,
            top: this.position.y
        };
        const animatedContentY = this.animation.interpolate({
            inputRange: [0, 1],
            outputRange: [-150, 0]
        });
        const animatedContentOpacity = this.animation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 1, 1]
        });
        const animatedContentStyle = {
            opacity: animatedContentOpacity,
            transform: [{
                translateY: animatedContentY
            }]
        };
        const animatedCrossOpacity = {
            opacity: this.animation
        };

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
                    {
                        this.state.activeTab === 1
                            ?
                            // <BasicHeader title='Road Buddies' searchIconProps={{ name: 'search', type: 'FontAwesome', onPress: () => this.setState({ headerSearchMode: true }) }} searchbarMode={headerSearchMode}
                            <BasicHeader title='Road Buddies' searchbarMode={headerSearchMode}
                                searchValue={searchQuery} onChangeSearchValue={(val) => this.setState({ searchQuery: val })} onCancelSearchMode={() => this.setState({ headerSearchMode: false, searchQuery: '' })}
                                onClearSearchValue={() => this.setState({ searchQuery: '' })}
                                leftIconProps={{ reverse: true, name: 'md-add', type: 'Ionicons', onPress: this.onPressCreateGroup }}
                            // rightIconProps={{ name: 'md-exit', type: 'Ionicons', style: { fontSize: widthPercentageToDP(8), color: '#fff' }, onPress: this.onPressLogout }} 
                            />
                            : this.state.activeTab === 2 ?
                                <BasicHeader title='Road Buddies'
                                // rightIconProps={{ name: 'md-exit', type: 'Ionicons', style: { fontSize: widthPercentageToDP(8), color: '#fff' }, onPress: this.onPressLogout }} 
                                />
                                :
                                // <BasicHeader title='Road Buddies' searchIconProps={{ name: 'search', type: 'FontAwesome', onPress: () => this.setState({ headerSearchMode: true }) }} searchbarMode={headerSearchMode}
                                <BasicHeader title='Road Buddies' searchbarMode={headerSearchMode}
                                    searchValue={searchQuery} onChangeSearchValue={(val) => this.setState({ searchQuery: val })} onCancelSearchMode={() => this.setState({ headerSearchMode: false, searchQuery: '' })}
                                    onClearSearchValue={() => this.setState({ searchQuery: '' })}
                                // rightIconProps={{ name: 'md-exit', type: 'Ionicons', style: { fontSize: widthPercentageToDP(8), color: '#fff' }, onPress: this.onPressLogout }} 
                                />
                    }

                    <BaseModal alignCenter={true} isVisible={this.state.isVisibleGroupModal} onCancel={this.onCancelGroupForm} onPressOutside={this.onCancelGroupForm}>
                        <View style={{ backgroundColor: '#fff', width: WindowDimensions.width * 0.6, padding: 20, elevation: 3 }}>
                            <LabeledInput placeholder='Enter group name here' onChange={(val) => this.setState({ newGroupName: val })}
                                onSubmit={this.onSubmitGroupForm} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                <LinkButton title='Submit' onPress={this.onSubmitGroupForm} />
                                <LinkButton title='Cancel' onPress={this.onCancelGroupForm} />
                            </View>
                        </View>
                    </BaseModal>

                    <Tabs tabContainerStyle={APP_COMMON_STYLES.tabContainer} ref={elRef => this.tabsRef = elRef} onChangeTab={this.onChangeTab} tabBarActiveTextColor='#fff' tabBarInactiveTextColor='#fff' style={{ marginTop: APP_COMMON_STYLES.headerHeight }} tabBarUnderlineStyle={{ height: 0 }}>
                        <Tab heading='ALL BUDDIES' tabStyle={[styles.inActiveTab, styles.borderRightWhite]} activeTabStyle={[styles.activeTab, styles.borderRightWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                            <AllFriendsTab refreshContent={activeTab === 0} searchQuery={searchQuery} />
                        </Tab>
                        <Tab heading='FAVORITES' tabStyle={[styles.inActiveTab, styles.borderRightWhite, styles.borderLeftWhite]} activeTabStyle={[styles.activeTab, styles.borderRightWhite, styles.borderLeftWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
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
        // getPicture: (userId, accessToken) => dispatch(getPicture(userId)),
        createFriendGroup: (newGroupInfo) => dispatch(createFriendGroup(newGroupInfo)),
        // getPicture: (pictureId, friendId) => getPicture(pictureId, ({ picture, pictureId }) => {
        //     dispatch(updateFriendInListAction({ profilePicture: picture, userId: friendId }))
        // }, (error) => {
        //     dispatch(updateFriendInListAction({ userId: friendId }))
        // }),
        getPictureList: (pictureIdList) => getPictureList(pictureIdList, (pictureObj) => {
            dispatch(updateFriendInListAction({ pictureObj }))
        }, (error) => {
            console.log('getPictureList all friend error : ', error)
            // dispatch(updateFriendInListAction({ userId: friendId }))
        }),
        // getFriendRequestPic: (pictureId, id) => getPicture(pictureId, ({ picture, pictureId }) => {
        //     dispatch(updateFriendRequestListAction({ profilePicture: picture, id: id }))
        // }, (error) => {
        //     dispatch(updateFriendRequestListAction({ id: id }))
        // }),
        getFriendRequestPic: (requestIdList) => getPictureList(requestIdList, (pictureObj) => {
            dispatch(updateFriendRequestListAction({ pictureObj }))
        }, (error) => {
            console.log('getPictureList friendRequest error :  ', error)
            // dispatch(updateFriendRequestListAction({ id: id }))
        }),
        resetCurrentFriend: () => dispatch(resetCurrentFriendAction()),
        readNotification: (userId, notificationId) => dispatch(readNotification(userId, notificationId)),
        getFriendGroups: (userId, toggleLoader, pageNumber, successCallback, errorCallback) => dispatch(getFriendGroups(userId, toggleLoader, pageNumber, successCallback, errorCallback)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Friends);