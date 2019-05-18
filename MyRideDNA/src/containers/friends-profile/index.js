import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, StatusBar, ImageBackground, ScrollView, FlatList, TouchableOpacity, Alert } from 'react-native';
import { heightPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, WindowDimensions, widthPercentageToDP, THUMBNAIL_TAIL_TAG, RELATIONSHIP, PageKeys, MEDIUM_TAIL_TAG, FRIEND_TYPE } from '../../constants/index';
import { ShifterButton, IconButton } from '../../components/buttons';
import { appNavMenuVisibilityAction, getFriendsInfoAction, resetCurrentFriendAction, updateCurrentFriendAction, toggleLoaderAction, screenChangeAction, updateCurrentFriendGarageAction, apiLoaderActions, initUndoRedoRideAction } from '../../actions';
import { Tabs, Tab, ScrollableTab, TabHeading, Accordion, ListItem, Left } from 'native-base';
import { BasicHeader } from '../../components/headers';
import { Actions } from 'react-native-router-flux';
import { ImageLoader, Loader } from '../../components/loader';
import styles from './styles';
import { getPicture, getGarageInfo, getFriendsRideList, getRideByRideId, doUnfriend, getFriendsLocationList, getUserById, getAllFriends, readNotification } from '../../api';
import { BasicCard } from '../../components/cards';

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
            ]

        };
    }

    componentDidMount() {
        if (this.state.activeTab !== 0) {
            setTimeout(() => {
                this.tabsRef.props.goToPage(this.state.activeTab);
                this.setState({ activeTab: this.state.activeTab });
            }, 50);
        }
        if (this.props.comingFrom === PageKeys.NOTIFICATIONS) {
            this.props.getUserById(this.props.notificationBody.fromUserId);
            this.props.readNotification(this.props.user.userId, this.props.notificationBody.id);
        } else if (this.props.comingFrom === 'notificationPage') {
            this.props.getUserById(this.props.notificationBody.fromUserId);
            this.props.readNotification(this.props.user.userId, this.props.notificationBody.id);
        }
        else {
            this.props.getFriendsInfo(this.props.friendIdx, this.props.friendType);
        }

    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.friendsLocationList !== this.props.friendsLocationList) {
            if (this.props.friendsLocationList) {
                this.props.changeScreen({ name: PageKeys.MAP });
            }
        }
        if (prevProps.currentFriend !== this.props.currentFriend) {
            if (this.props.currentFriend.userId === null) {
                if (this.props.comingFrom === PageKeys.NOTIFICATIONS) {
                    this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, true);
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
            }
        }
    }

    showFriendsLocation = () => {
        this.props.getFriendsLocationList(this.props.user.userId, [this.props.currentFriend.userId]);
    }

    onPressChatIcon = () => {
        Actions.push(PageKeys.CHAT, { friend: this.props.currentFriend });
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
    onPressRide(rideId) {
        if (this.props.ride.rideId) {
            this.props.clearRideFromMap();
        }
        this.props.changeScreen({ name: PageKeys.MAP });
        this.props.loadRideOnMap(rideId);
    }
    rideKeyExtractor = (item) => item.rideId;
    onPressBackButton = () => {
        this.props.resetCurrentFriend();
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

    render() {
        const { user, currentFriend } = this.props;
        const { activeTab, isLoadingProfPic, friendsProfileIcons } = this.state;
        return currentFriend === null
            ? <View style={styles.fill} />
            : <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={{ flex: 1 }}>
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
                        <Tab heading={<TabHeading style={[styles.bottomTab, { height: BOTTOM_TAB_HEIGHT, backgroundColor: activeTab === 0 ? '#0083CA' : '#6C6C6B' }]}>
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
                                <ScrollView styles={styles.scrollBottom} contentContainerStyle={styles.scrollBottomContent}>
                                    <Accordion expanded={0} dataArray={[{ title: 'Actions', content: friendsProfileIcons }]}
                                        renderContent={this.renderAccordionItem} headerStyle={styles.accordionHeader} />
                                </ScrollView>
                            </View>
                        </Tab>
                        <Tab heading={<TabHeading style={[styles.bottomTab, { height: BOTTOM_TAB_HEIGHT, backgroundColor: activeTab === 1 ? '#0083CA' : '#6C6C6B', borderLeftWidth: 2, borderLeftColor: '#fff', borderRightWidth: 1, borderRightColor: '#fff' }]}>
                            <Text style={{ color: '#fff', fontSize: widthPercentageToDP(3) }}>GARAGE</Text>
                        </TabHeading>}>
                            <View style={{ backgroundColor: '#fff', flex: 1 }}>
                                {currentFriend.garage ? <View style={styles.content}>
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
                                                subHeading={`${item.make}-${item.model}, ${item.year}`}
                                                notes={item.notes}
                                            // onLongPress={() => this.showOptionsModal(index)}
                                            >
                                            </BasicCard>
                                        }}
                                    />
                                </View> : null}
                            </View>
                        </Tab>
                        <Tab heading={<TabHeading style={[styles.bottomTab, { height: BOTTOM_TAB_HEIGHT, backgroundColor: activeTab === 2 ? '#0083CA' : '#6C6C6B', borderLeftWidth: 1, borderLeftColor: '#fff', borderRightWidth: 2, borderRightColor: '#fff' }]}>
                            <Text style={{ color: '#fff', fontSize: widthPercentageToDP(3) }}>RIDES</Text>
                        </TabHeading>}>
                            <View style={{ backgroundColor: '#fff', flex: 1 }}>

                                {
                                    currentFriend.rideList && currentFriend.rideList.length > 0 ?
                                        <FlatList
                                            data={currentFriend.rideList}
                                            renderItem={({ item, index }) => <ListItem style={{ marginLeft: 0, paddingLeft: 10, backgroundColor: index % 2 === 0 ? '#fff' : '#F3F2F2' }}>
                                                <Left style={{ flex: 1 }}>
                                                    <TouchableOpacity style={{ flex: 1 }}
                                                        onPress={() => this.onPressRide(item.rideId)}>
                                                        <Text>{item.name}</Text>
                                                    </TouchableOpacity>
                                                </Left>
                                            </ListItem>}
                                            keyExtractor={this.rideKeyExtractor}
                                        />
                                        : <ImageBackground source={require('../../assets/img/empty-rides-bg.png')} style={{ width: '100%', height: '100%' }} />
                                }
                            </View>
                        </Tab>
                        <Tab heading={<TabHeading style={[styles.bottomTab, { height: BOTTOM_TAB_HEIGHT, backgroundColor: activeTab === 3 ? '#0083CA' : '#6C6C6B' }]}>
                            <Text style={{ color: '#fff', fontSize: widthPercentageToDP(3) }}>VEST</Text>
                        </TabHeading>}>
                            <View style={{ backgroundColor: 'rgba(149, 165, 166, 1)', flex: 1, }}>
                                <ImageBackground source={require('../../assets/img/vest.png')} style={{ width: '100%', height: '100%' }} imageStyle={{ opacity: 0.5 }}></ImageBackground>
                                <Text style={{ position: 'absolute', width: '100%', textAlign: 'center', marginTop: heightPercentageToDP(20), fontWeight: 'bold', fontSize: 80, color: 'rgba(rgba(46, 49, 49, 1))' }}> VEST</Text>
                                <Text style={{ position: 'absolute', width: '100%', textAlign: 'center', marginTop: heightPercentageToDP(40), fontSize: 50, color: 'rgba(rgba(46, 49, 49, 1))' }}>Coming Soon...</Text>

                            </View>
                        </Tab>
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
    const { showLoader } = state.PageState;
    return { user, showMenu, currentFriend, friendsLocationList, showLoader, ride };
};
const mapDispatchToProps = (dispatch) => {
    return {
        getAllFriends: (friendType, userId, pageNumber, toggleLoader) => dispatch(getAllFriends(friendType, userId, pageNumber, toggleLoader)),
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        getFriendsInfo: (friendIdx, friendType) => dispatch(getFriendsInfoAction({ index: friendIdx, friendType })),
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
            // dispatch(toggleLoaderAction(true));
            dispatch(apiLoaderActions(true))
            getGarageInfo(friendId, (garage) => {
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                dispatch(updateCurrentFriendAction({ garage, userId: friendId }));
            }, (error) => {
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false))
                console.log(`getGarage error: `, error);
            })
        },
        getFirendsRideInfo: (friendId, relationship) => {
            dispatch(getFriendsRideList(friendId, relationship))
        },
        loadRideOnMap: (rideId) => dispatch(getRideByRideId(rideId)),
        changeScreen: (screenKey) => dispatch(screenChangeAction(screenKey)),
        doUnfriend: (userId, personId) => dispatch(doUnfriend(userId, personId)),
        getFriendsLocationList: (userId, friendsIdList) => dispatch(getFriendsLocationList(userId, friendsIdList)),
        readNotification: (userId, notificationId) => dispatch(readNotification(userId, notificationId)),
        clearRideFromMap: () => dispatch(initUndoRedoRideAction()),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(FriendsProfile);