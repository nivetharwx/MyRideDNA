import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, StatusBar, Image, ImageBackground, Animated, ScrollView, FlatList, TouchableOpacity, Alert, Easing } from 'react-native';
import { heightPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, WindowDimensions, widthPercentageToDP, THUMBNAIL_TAIL_TAG, RELATIONSHIP, PageKeys, MEDIUM_TAIL_TAG, FRIEND_TYPE, RIDE_TAIL_TAG } from '../../constants/index';
import { ShifterButton, IconButton } from '../../components/buttons';
import { appNavMenuVisibilityAction, getFriendsInfoAction, resetCurrentFriendAction, updateCurrentFriendAction, toggleLoaderAction, screenChangeAction, updateCurrentFriendGarageAction, apiLoaderActions, initUndoRedoRideAction, updateFriendsRideSnapshotAction, getNotFriendsInfoAction } from '../../actions';
import { Tabs, Tab, ScrollableTab, TabHeading, Accordion, ListItem, Left, Right, Card, CardItem, Thumbnail, Body, Button, Icon as NBIcon } from 'native-base';
import { BasicHeader } from '../../components/headers';
import { Actions } from 'react-native-router-flux';
import { ImageLoader, Loader } from '../../components/loader';
import styles from './styles';
import { getPicture, getGarageInfo, getFriendsRideList, getRideByRideId, doUnfriend, getFriendsLocationList, getUserById, getAllFriends,getAllFriends1, readNotification, getPictureList, getRidePictureList } from '../../api';
import { BasicCard } from '../../components/cards';
import { IconLabelPair } from '../../components/labels';

const BOTTOM_TAB_HEIGHT = heightPercentageToDP(7);
class FriendsProfile extends Component {
    // DOC: Icon format is for Icon component from NativeBase Library
    // FRIENDS_PROFILE_ICONS = 
    tabsRef = null;
    constructor(props) {
        super(props);
        this.state = {
            activeTab: props.activeTab || 0,
            isLoadingProfPic: false,
            profilePicId: null,
            friendsProfileIcons: [
                { name: 'ios-chatbubbles', type: 'Ionicons', style: { color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(7) }, onPress: () => this.onPressChatIcon() },
                { name: 'account-remove', type: 'MaterialCommunityIcons', style: { color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(7) }, onPress: () => this.onPressUnfriendIcon() },
                // { name: 'ios-shirt', type: 'Ionicons', style: { color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(7) }, onPress: () => console.log("Vest pressed") },
            ],
            totalTabs: 4,
            spinValue: new Animated.Value(0),
        };
    }

    componentDidMount() {
        if (this.state.activeTab !== 0) {
            setTimeout(() => {
                this.tabsRef.props.goToPage(this.state.activeTab);
                this.setState({ activeTab: this.state.activeTab });
            }, 50);
        }
        if (this.props.comingFrom === PageKeys.NOTIFICATIONS || this.props.comingFrom === 'notificationPage') {
            this.props.getUserById(this.props.notificationBody.fromUserId);
            this.props.readNotification(this.props.user.userId, this.props.notificationBody.id);
        }
        // else if (this.props.comingFrom === 'notificationPage') {
        //     this.props.getUserById(this.props.notificationBody.fromUserId);
        //     this.props.readNotification(this.props.user.userId, this.props.notificationBody.id);
        // }
        else if (this.props.relationshipStatus === RELATIONSHIP.UNKNOWN) {
            this.props.getFriendsNotFirend(this.props.person);
            this.setState({ totalTabs: 3 })
        }
        else {
            this.props.getFriendsInfo(this.props.frienduserId, this.props.friendType);
        }

    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.ride.rideId && (prevProps.ride.rideId !== this.props.ride.rideId)) {
            this.props.changeScreen({ name: PageKeys.MAP });
        }
        if (prevProps.friendsLocationList !== this.props.friendsLocationList) {
            if (this.props.friendsLocationList) {
                this.props.changeScreen({ name: PageKeys.MAP });
            }
        }
        if (prevProps.currentFriend !== this.props.currentFriend) {
            if (this.props.currentFriend.userId === null) {
                if (this.props.comingFrom === PageKeys.NOTIFICATIONS) {
                    // this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, true, (res) => {
                    // }, (err) => {
                    // });
                    this.props.getAllFriends1(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, true, (res) => {
                    }, (err) => {
                    });
                }
                Actions.pop();
                return;
            }
            if (this.state.activeTab === 0) {
                if (prevProps.currentFriend.userId === null) {
                    if (this.props.currentFriend.locationEnable && this.props.currentFriend.isOnline) {
                        if (this.state.friendsProfileIcons.findIndex(icon => icon.name === 'location-on') === -1) {
                            console.log("pushing location icon");
                            this.setState(prevState => ({
                                friendsProfileIcons: [...prevState.friendsProfileIcons, { name: 'location-on', type: 'MaterialIcons', style: { color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(7) }, onPress: () => this.showFriendsLocation() }]
                            }));
                        }
                    }
                    if (this.props.currentFriend.profilePictureId) {
                        this.setState({ profilePicId: this.props.currentFriend.profilePictureId, isLoadingProfPic: true });
                        this.props.getProfilePicture(this.props.currentFriend.profilePictureId, this.props.currentFriend.userId, this.props.friendType);
                    }
                    return;
                }

                if (this.state.profilePicId) {
                    if (this.state.profilePicId.indexOf(THUMBNAIL_TAIL_TAG) > -1) {
                        // setTimeout(() => {
                        //     this.setState(prevState => ({ profilePicId: prevState.profilePicId.replace(THUMBNAIL_TAIL_TAG, '') }), () => {
                        //         this.props.getProfilePicture(this.state.profilePicId, this.props.currentFriend.userId, this.props.friendType);
                        //     });
                        // }, 300);
                        this.setState(prevState => ({ profilePicId: prevState.profilePicId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG) }), () => {
                            this.props.getProfilePicture(this.state.profilePicId, this.props.currentFriend.userId, this.props.friendType);
                        });
                    } else {
                        this.setState({ isLoadingProfPic: false });
                    }
                }
            }
            else if (this.state.activeTab === 1) {
                if (prevProps.currentFriend.garage.garageId !== this.props.currentFriend.garage.garageId) {
                    this.props.currentFriend.garage.spaceList.forEach((bikeDetail) => {
                        if (bikeDetail.pictureIdList.length > 0) {
                            this.props.getGaragePicture(bikeDetail.pictureIdList[0].replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG), bikeDetail.spaceId, this.props.currentFriend.userId)
                        }
                    })
                    return;
                }
            } else if (this.state.activeTab === 2) {
                let ridePicIdList = this.props.currentFriend.rideList.reduce((list, ride) => {
                    if (ride.snapshotId && !ride.snapshot) {
                        list.push(ride.snapshotId.replace(THUMBNAIL_TAIL_TAG, RIDE_TAIL_TAG));
                    }
                    return list;
                }, []);
                if (ridePicIdList.length > 0) {
                    this.props.getRidePictureList(ridePicIdList, this.props.currentFriend.userId);
                }
                // this.props.getFirendsRideInfo(this.props.currentFriend.userId, RELATIONSHIP.FRIEND)
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

    showFriendsLocation = () => {
        this.props.getFriendsLocationList(this.props.user.userId, [this.props.currentFriend.userId]);
    }

    onPressChatIcon = () => {
        console.log('this.props.currentFriend : ', this.props.currentFriend)
        const friendDetail = this.props.currentFriend;
        friendDetail['id'] = this.props.currentFriend.userId;
        friendDetail['isGroup'] = false;
        Actions.push(PageKeys.CHAT, { isGroup: false, chatInfo: friendDetail });
    }

    onPressUnfriendIcon = () => {
        Alert.alert(
            'Confirmation to unfriend',
            `Do you want to unfriend ${this.props.currentFriend.name}?`,
            [
                {
                    text: 'Yes', onPress: () => {
                        this.props.doUnfriend(this.props.user.userId, this.props.currentFriend.userId);

                    }
                },
                { text: 'Cancel', onPress: () => { }, style: 'cancel' },
            ],
            { cancelable: false }
        );
    }

    onPressRide(ride) {
        if (this.props.ride.rideId) {
            if (this.props.ride.rideId === ride.rideId) {
                this.props.changeScreen({ name: PageKeys.MAP });
                return;
            } else {
                this.props.clearRideFromMap();
            }
        }
        this.props.loadRideOnMap(ride.rideId, { creatorName: this.props.currentFriend.name, creatorNickname: this.props.currentFriend.nickname, creatorProfilePictureId: this.props.currentFriend.profilePictureId });
    }

    rideKeyExtractor = (item) => item.rideId;

    onPressBackButton = () => {
        this.props.resetCurrentFriend()
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

    onChangeTab = ({ from, i }) => {
        this.setState({ activeTab: i }, () => {
            if (this.state.activeTab === 1) {
                // GARAGE Tab

                if (this.props.currentFriend.garage.garageId === null) {
                    this.props.getGarageInfo(this.props.currentFriend.userId, this.props.friendType);
                }
            }
            else if (this.state.activeTab === 2) {
                this.props.getFirendsRideInfo(this.props.currentFriend.userId, RELATIONSHIP.FRIEND)
            }
        });
    }


    renderAccordionItem = (item) => {
        return (
            <View style={styles.rowContent}>
                {
                    item.content.map(props => <IconButton key={props.name} iconProps={props} onPress={props.onPress} />)
                }
            </View>
        );
    }

    getDateLabel(hourDiff) {
        var days = parseInt(parseInt(hourDiff) / 24);
        if (days >= 365) {
            days = parseInt(days / 365);
            days = days > 1 ? days + ' years ago' : days + ' year ago';
        } else if (days >= 30) {
            days = parseInt(days / 30);
            days = days > 1 ? days + ' months ago' : days + ' month ago';
        } else if (days >= 7) {
            days = parseInt(days / 7);
            days = days > 1 ? days + ' weeks ago' : days + ' week ago';
        } else if (days >= 1) {
            days = days > 1 ? days + ' days ago' : days + ' day ago';
        } else if (hourDiff >= 1) {
            hourDiff = parseInt(hourDiff);
            days = hourDiff > 1 ? hourDiff + ' hours ago' : hourDiff + ' hour ago';
        } else if (hourDiff * 60 >= 1) {
            let mintDiff = parseInt(hourDiff * 60);
            days = mintDiff > 1 ? mintDiff + ' minutes ago' : mintDiff + ' minute ago';
        } else {
            days = 'just now';
        }
        return days;
    }

    getTimeAsFormattedString(estimatedTime) {
        if (!estimatedTime) {
            return '0 h 0 m';
        }
        let h = Math.floor(estimatedTime / 3600);
        let m = Math.floor(estimatedTime % 3600 / 60);
        let timeText = '';
        if (h > 0) {
            timeText += `${h} h`;
        }
        if (m > 0) {
            timeText += ` ${m} m`;
        }
        return timeText;
    }

    getDistanceAsFormattedString(distance, distanceUnit) {
        if (!distance) {
            return '0 ' + distanceUnit;
        }
        if (distanceUnit === 'km') {
            return (distance / 1000).toFixed(2) + ' km';
        } else {
            return (distance * 0.000621371192).toFixed(2) + ' mi';
        }
    }

    renderRides = ({ item, index }) => {
        return <Card>
            <CardItem bordered>
                <Body>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Text style={{ fontWeight: 'bold', fontSize: widthPercentageToDP(3.8) }}>{item.name}</Text>
                            <Text note></Text>
                        </View>
                        {
                            // this.state.activeTab !== 2
                            //     ? <Text style={{ color: item.privacyMode === 'private' ? '#6B7663' : APP_COMMON_STYLES.infoColor }}>{item.privacyMode.toUpperCase()}</Text>
                            //     : null
                        }
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <IconLabelPair iconProps={{ name: 'road-variant', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(5) } }} text={this.getDistanceAsFormattedString(item.totalDistance, this.props.user.distanceUnit)}
                            textStyle={{ fontSize: widthPercentageToDP(3.5) }} />
                        <IconLabelPair iconProps={{ name: 'access-time', type: 'MaterialIcons', style: { fontSize: widthPercentageToDP(5) } }} text={this.getTimeAsFormattedString(item.totalTime)}
                            textStyle={{ fontSize: widthPercentageToDP(3.5) }} />
                    </View>
                </Body>
            </CardItem>
            <CardItem cardBody button onPress={() => this.onPressRide(item)}>
                {
                    item.snapshot
                        ? <Image resizeMode='stretch' source={{ uri: item.snapshot }} style={{ height: 200, width: null, flex: 1 }} />
                        : <ImageBackground blurRadius={3} resizeMode='cover' source={require('../../assets/img/ride-placeholder-image.png')} style={{ height: 200, width: null, flex: 1 }} />
                }
            </CardItem>
            <CardItem>
                {
                    item.privacyMode === 'public'
                        ? <Left>
                            {/* <Button style={{ justifyContent: 'space-between' }} transparent>
                                <NBIcon active name="thumbs-up" />
                                <Text>{item.totalLikes !== 1 ? item.totalLikes + ' Likes' : '1 Like'}</Text>
                            </Button>
                            <Button style={{ justifyContent: 'space-between' }} transparent>
                                <NBIcon active name="chatbubbles" />
                                <Text>{item.totalComments !== 1 ? item.totalComments + ' Comments' : '1 Comment'}</Text>
                            </Button> */}
                            <IconButton title={item.totalLikes !== 1 ? item.totalLikes + ' Likes' : '1 Like'} titleStyle={{ marginLeft: 8 }} iconProps={{ name: 'ios-thumbs-up', type: 'Ionicons', style: { color: APP_COMMON_STYLES.headerColor } }} />
                        </Left>
                        : <Left></Left>
                }
                {
                    item.privacyMode === 'public'
                        ? <Body>
                            {/* <Button transparent>
                        <NBIcon active name="chatbubbles" />
                        <Text>{item.totalComments !== 1 ? item.totalComments + ' Comments' : '1 Comment'}</Text>
                    </Button> */}
                            <IconButton title={item.totalComments !== 1 ? item.totalComments + ' Comments' : '1 Comment'} titleStyle={{ marginLeft: 8 }} iconProps={{ name: 'ios-chatbubbles', type: 'Ionicons', style: { color: APP_COMMON_STYLES.headerColor } }} />
                        </Body>
                        : <Body></Body>
                }
                <Right>
                    <Text note>{this.getDateLabel((Date.now() - new Date(item.date).getTime()) / 1000 / 60 / 60)}</Text>
                </Right>
            </CardItem>
        </Card>
    }

    render() {
        const { user, currentFriend } = this.props;
        const { activeTab, isLoadingProfPic, friendsProfileIcons } = this.state;
        console.log('currentFriend : ', currentFriend)
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        return currentFriend === null
            ? <View style={styles.fill} />
            : <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                <StatusBar translucent backgroundColor='black' barStyle="light-content" />
                </View>
                <View style={[{ flex: 1 }, !this.props.hasNetwork ? { marginBottom: heightPercentageToDP(8.2) } : null]}>
                    <BasicHeader title={<Text style={{
                        fontSize: widthPercentageToDP(5),
                        color: 'white',
                        fontWeight: 'bold',
                        backgroundColor: 'transparent',
                    }}
                        renderToHardwareTextureAndroid collapsable={false}>
                        {currentFriend.name}
                        <Text style={{ color: APP_COMMON_STYLES.infoColor }}>
                            {'  '}{currentFriend.nickname}
                        </Text>
                    </Text>} leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }} />
                    <Tabs onChangeTab={this.onChangeTab} style={styles.bottomTabContainer} tabBarPosition='bottom' renderTabBar={() => <ScrollableTab ref={elRef => this.tabsRef = elRef} style={{ backgroundColor: '#6C6C6B', height: BOTTOM_TAB_HEIGHT }} underlineStyle={{ height: 0 }} />}>
                        <Tab heading={<TabHeading style={[styles.bottomTab, { height: BOTTOM_TAB_HEIGHT, width: widthPercentageToDP(100 / this.state.totalTabs), backgroundColor: activeTab === 0 ? '#0083CA' : '#6C6C6B' }]}>
                            <Text style={{ color: '#fff', fontSize: widthPercentageToDP(3) }}>PROFILE</Text>
                        </TabHeading>}>
                            <View style={{ backgroundColor: '#fff', flex: 1 }}>
                                <ImageBackground source={require('../../assets/img/profile-bg.png')} style={styles.profileBG}>
                                    <View style={styles.profilePic}>
                                        <ImageBackground source={currentFriend.profilePicture ? { uri: currentFriend.profilePicture } : require('../../assets/img/profile-pic.png')} style={{ height: null, width: null, flex: 1, borderRadius: 5 }}>
                                            {
                                                isLoadingProfPic
                                                    ? <ImageLoader show={isLoadingProfPic} />
                                                    : null
                                            }
                                        </ImageBackground>
                                    </View>
                                </ImageBackground>
                                {
                                    this.props.relationshipStatus === RELATIONSHIP.UNKNOWN ? null
                                        :
                                        <ScrollView styles={styles.scrollBottom} contentContainerStyle={styles.scrollBottomContent}>
                                            <Accordion expanded={0} dataArray={[{ title: 'Actions', content: friendsProfileIcons }]}
                                                renderContent={this.renderAccordionItem} headerStyle={styles.accordionHeader} />
                                        </ScrollView>
                                }
                            </View>
                        </Tab>
                        <Tab heading={<TabHeading style={[styles.bottomTab, { height: BOTTOM_TAB_HEIGHT, width: widthPercentageToDP(100 / this.state.totalTabs), backgroundColor: activeTab === 1 ? '#0083CA' : '#6C6C6B', borderLeftWidth: 2, borderLeftColor: '#fff', borderRightWidth: 1, borderRightColor: '#fff' }]}>
                            <Text style={{ color: '#fff', fontSize: widthPercentageToDP(3) }}>GARAGE</Text>
                        </TabHeading>}>
                            <View style={{ backgroundColor: '#fff', flex: 1 }}>
                                {
                                    currentFriend.garage.spaceList && currentFriend.garage.spaceList.length > 0 ?
                                        <View style={styles.content}>
                                            <FlatList
                                                data={currentFriend.garage.spaceList}
                                                keyExtractor={(item, index) => item.spaceId + ''}
                                                showsVerticalScrollIndicator={false}
                                                extraData={this.state}
                                                renderItem={({ item, index }) => {
                                                    return <BasicCard
                                                        isActive={false}
                                                        // FIXME: Change this based on pictureIdList
                                                        media={item.profilePicture ? { uri: item.profilePicture } : require('../../assets/img/bike_placeholder.png')}
                                                        mainHeading={item.name}
                                                        subHeading={`${item.make ? item.make + '-' : ''}${item.model ? item.model + ',' : ''}${item.year ? item.year : ''}`}
                                                        notes={item.notes}
                                                    // onLongPress={() => this.showOptionsModal(index)}
                                                    >
                                                    </BasicCard>
                                                }}
                                            />
                                        </View> :
                                        this.props.hasNetwork ?
                                            null
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
                        </Tab>
                        <Tab heading={<TabHeading style={[styles.bottomTab, { height: BOTTOM_TAB_HEIGHT, width: widthPercentageToDP(100 / this.state.totalTabs), backgroundColor: activeTab === 2 ? '#0083CA' : '#6C6C6B', borderLeftWidth: 1, borderLeftColor: '#fff', borderRightWidth: 2, borderRightColor: '#fff' }]}>
                            <Text style={{ color: '#fff', fontSize: widthPercentageToDP(3) }}>RIDES</Text>
                        </TabHeading>}>
                            <View style={{ backgroundColor: '#fff', flex: 1 }}>

                                {
                                    currentFriend.rideList.length > 0 ?
                                        <FlatList
                                            data={currentFriend.rideList}
                                            renderItem={this.renderRides}
                                            keyExtractor={this.rideKeyExtractor}
                                        />
                                        :
                                        this.props.hasNetwork ?
                                            <ImageBackground source={require('../../assets/img/empty-rides-bg.png')} style={{ width: '100%', height: '100%' }} />
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
                        </Tab>
                        {
                            this.props.relationshipStatus === RELATIONSHIP.UNKNOWN ? null
                                :
                                <Tab heading={<TabHeading style={[styles.bottomTab, { height: BOTTOM_TAB_HEIGHT, width: widthPercentageToDP(100 / this.state.totalTabs), backgroundColor: activeTab === 3 ? '#0083CA' : '#6C6C6B' }]}>
                                    <Text style={{ color: '#fff', fontSize: widthPercentageToDP(3) }}>VEST</Text>
                                </TabHeading>}>
                                    <View style={{ backgroundColor: 'rgba(149, 165, 166, 1)', flex: 1, }}>
                                        <ImageBackground source={require('../../assets/img/vest.png')} style={{ width: '100%', height: '100%' }} imageStyle={{ opacity: 0.5 }}></ImageBackground>
                                        <Text style={{ position: 'absolute', width: '100%', textAlign: 'center', marginTop: heightPercentageToDP(20), fontWeight: 'bold', fontSize: 80, color: 'rgba(rgba(46, 49, 49, 1))' }}> VEST</Text>
                                        <Text style={{ position: 'absolute', width: '100%', textAlign: 'center', marginTop: heightPercentageToDP(40), fontSize: 50, color: 'rgba(rgba(46, 49, 49, 1))' }}>Coming Soon...</Text>

                                    </View>
                                </Tab>}
                    </Tabs>

                    {/* Shifter: - Brings the app navigation menu */}
                    <ShifterButton onPress={this.showAppNavMenu}
                        containerStyles={{ bottom: IS_ANDROID ? BOTTOM_TAB_HEIGHT : BOTTOM_TAB_HEIGHT - 8 }} size={18} alignLeft={user.handDominance === 'left'} />
                </View>
                <Loader isVisible={this.props.showLoader} />
            </View >
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { ride } = state.RideInfo.present;
    const { showMenu } = state.TabVisibility;
    const { currentFriend, friendsLocationList } = state.FriendList;
    const { showLoader, hasNetwork } = state.PageState;
    return { user, showMenu, currentFriend, friendsLocationList, showLoader, ride, hasNetwork };
};
const mapDispatchToProps = (dispatch) => {
    return {
        getAllFriends: (friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback) => dispatch(getAllFriends(friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback)),
        getAllFriends1: (friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback) => dispatch(getAllFriends1(friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback)),
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        getFriendsInfo: (frienduserId, friendType) => dispatch(getFriendsInfoAction({ userId: frienduserId, friendType })),
        getFriendsNotFirend: (notFriendData) => dispatch(getNotFriendsInfoAction({ notFriendData })),
        resetCurrentFriend: () => dispatch(resetCurrentFriendAction()),
        getUserById: (userId) => dispatch(getUserById(userId)),
        getProfilePicture: (pictureId, friendId, friendType) => getPicture(pictureId, ({ picture, pictureId }) => {
            dispatch(updateCurrentFriendAction({ profilePicture: picture, userId: friendId }))
        }, (error) => {
            dispatch(updateCurrentFriendAction({ userId: friendId }))
        }),
        getGaragePicture: (pictureId, spaceId, userId) => getPicture(pictureId, ({ picture }) => {
            dispatch(updateCurrentFriendGarageAction({ profilePicture: picture, spaceId, userId }))
        }, (error) => {
            dispatch(updateCurrentFriendGarageAction({ spaceId, userId }))
        }),
        getGarageInfo: (friendId, friendType) => {
            dispatch(apiLoaderActions(true))
            getGarageInfo(friendId, (garage) => {
                dispatch(apiLoaderActions(false))
                dispatch(updateCurrentFriendAction({ garage, userId: friendId }));
            }, (error) => {
                dispatch(apiLoaderActions(false))
                console.log(`getGarage error: `, error);
            })
        },
        getFirendsRideInfo: (friendId, relationship) => {
            dispatch(getFriendsRideList(friendId, relationship))
        },
        getRidePictureList: (pictureIdList, userId) => {
            getRidePictureList(pictureIdList, (response) => {
                dispatch(updateFriendsRideSnapshotAction({ userId, pictureObject: response }))
            }, (error) => console.log("getRidePictureList-ride error: ", error))
        },
        loadRideOnMap: (rideId, rideInfo) => dispatch(getRideByRideId(rideId, rideInfo)),
        changeScreen: (screenKey) => dispatch(screenChangeAction(screenKey)),
        doUnfriend: (userId, personId) => dispatch(doUnfriend(userId, personId)),
        getFriendsLocationList: (userId, friendsIdList) => dispatch(getFriendsLocationList(userId, friendsIdList)),
        readNotification: (userId, notificationId) => dispatch(readNotification(userId, notificationId)),
        clearRideFromMap: () => dispatch(initUndoRedoRideAction()),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(FriendsProfile);