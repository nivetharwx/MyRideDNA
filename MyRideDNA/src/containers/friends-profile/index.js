import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Platform, StatusBar, View, Text, ImageBackground, Image, FlatList, ScrollView, BackHandler } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { PageKeys, widthPercentageToDP, heightPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, WindowDimensions, FRIEND_TYPE } from '../../constants/index';
import { IconButton, LinkButton, ShifterButton } from '../../components/buttons';
import { appNavMenuVisibilityAction, updateUserAction, updateBikePictureListAction, replaceGarageInfoAction, updateMyProfileLastOptionsAction, apiLoaderActions, screenChangeAction, setCurrentFriendAction, updateCurrentFriendAction, updatePicturesAction, undoLastAction, resetCurrentFriendAction, goToPrevProfileAction } from '../../actions';
import { logoutUser, updateProfilePicture, getPicture, getSpaceList, setBikeAsActive, getGarageInfo, getRoadBuddies, getPictureList, getFriendInfo, getFriendProfile, getPassengersById, getRoadBuddiesById, getUserProfile } from '../../api';
import { ImageLoader } from '../../components/loader';
import { SmallCard } from '../../components/cards';
import { BasicHeader } from '../../components/headers';

const hasIOSAbove10 = parseInt(Platform.Version) > 10;
class FriendsProfile extends Component {
    // DOC: Icon format is for Icon component from NativeBase Library
    profilePicture = null;
    isLoadingPassPic = false;
    isLoadingFrndsPic = false;
    constructor(props) {
        super(props);
        this.state = {
            activeTab: -1,
            bikes: [10, 20, 30, 40, 50],
            isLoadingProfPic: false,
            pictureLoader: {},
        };
    }

    async componentDidMount() {
        // if (this.props.person.isFriend) {
        //     this.props.getFriendProfile(this.props.user.userId, this.props.frienduserId);
        //     this.props.getFriendsPassengersByFriendId(this.props.user.userId, this.props.frienduserId);
        //     this.props.getRoadBuddiesByFriendId(this.props.user.userId, this.props.frienduserId);
        // } else {
        //     this.props.getUserProfile(this.props.frienduserId);
        // }
        this.props.getUserProfile(this.props.user.userId, this.props.frienduserId);
    }

    async componentDidUpdate(prevProps, prevState) {
        if (prevProps.person !== this.props.person) {
            console.log("this.props.person: ", this.props.person);
            if (prevProps.person.userId !== this.props.person.userId) {
                this.isLoadingPassPic = false;
                this.isLoadingFrndsPic = false;
            }
            if (prevProps.person.isFriend === false && this.props.person.isFriend === true) {
                this.props.getPassengersById(this.props.user.userId, this.props.frienduserId, 0);
                this.props.getRoadBuddiesById(this.props.user.userId, this.props.frienduserId, 0);
            }
            if (!this.state.isLoadingProfPic && !this.props.person.profilePicture && this.props.person.profilePictureId) {
                this.setState({ isLoadingProfPic: true });
                this.props.getProfilePicture(this.props.person.profilePictureId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG), this.props.person.userId);
            } else if (this.state.isLoadingProfPic && this.props.person.profilePicture) {
                this.setState({ isLoadingProfPic: false });
            }
            if (prevProps.person.passengerList !== this.props.person.passengerList) {
                if (!this.isLoadingPassPic) {
                    const passPicIdList = [];
                    this.props.person.passengerList.forEach((passenger) => {
                        if (!passenger.profilePicture && passenger.profilePictureId) {
                            passPicIdList.push(passenger.profilePictureId);
                        }
                    })
                    if (passPicIdList.length > 0) {
                        this.isLoadingPassPic = true;
                        this.props.getPictureList(passPicIdList, 'passenger', () => this.isLoadingPassPic = false, () => this.isLoadingPassPic = false);
                    }
                }
            }
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
    }

    clubsKeyExtractor = (item) => item.clubId;

    roadBuddiesKeyExtractor = (item) => item.userId;

    passengerListKeyExtractor = (item) => item.passengerId;

    onPressFriendsPage = () => {
        this.props.changeScreen({ name: PageKeys.FRIENDS, params: { comingFrom: PageKeys.PROFILE } });
    }

    openPassengerProfile = (item, index) => {
        if (item.isFriend) {
            this.openRoadBuddy(item.passengerUserId);
        } else {
            Actions.push(PageKeys.PASSENGER_PROFILE, { passengerIdx: index });
        }
    }

    openRoadBuddy = (userId) => {
        if (userId === this.props.user.userId) {
            this.props.changeScreen({ name: PageKeys.PROFILE });
        } else {
            this.props.setCurrentFriend({ userId });
            Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: userId });
        }
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

    popToPrevProfile = () => {
        Actions.pop();
        this.props.hasPrevProfiles
            ? this.props.goToPrevProfile()
            : this.props.resetCurrentFriend();
    }

    render() {
        const { person } = this.props;
        const { isLoadingProfPic } = this.state;
        return (
            <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent barStyle="light-content" />
                </View>
                <View style={styles.fill}>
                    <View style={styles.mapHeader}>
                        <IconButton iconProps={{ name: 'md-arrow-round-back', type: 'Ionicons', style: { fontSize: 27 } }}
                            style={styles.headerIconCont} onPress={this.popToPrevProfile} />
                        <View style={{ flex: 1, flexDirection: 'column', marginLeft: 17, alignSelf: 'center' }}>
                            <Text style={styles.title}>
                                {person.name}
                            </Text>
                            {
                                person.nickname ?
                                    <Text style={{ color: 'rgba(189, 195, 199, 1)', fontWeight: 'bold', fontSize: 12 }}>
                                        {person.nickname.toUpperCase()}
                                    </Text>
                                    : null
                            }

                        </View>
                    </View>
                    <ScrollView>
                        <View style={styles.profilePic}>
                            <ImageBackground source={person.profilePicture ? { uri: person.profilePicture } : require('../../assets/img/profile-pic.png')} style={{ height: null, width: null, flex: 1, borderRadius: 0 }}>
                                {/* <ImageBackground source={require('../../assets/img/profile-pic.png')} style={{ height: null, width: null, flex: 1, borderRadius: 5 }}> */}
                                {
                                    isLoadingProfPic
                                        ? <ImageLoader show={isLoadingProfPic} />
                                        : null
                                }
                            </ImageBackground>
                        </View>
                        <Image source={require('../../assets/img/profile-bg.png')} style={styles.profilePicBtmBorder} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'column', marginLeft: widthPercentageToDP(8), marginTop: heightPercentageToDP(2) }}>
                                <Text style={{ letterSpacing: 1, fontSize: 11, color: '#a8a8a8', fontWeight: '600' }}>LOCATION</Text>
                                <Text style={{ fontWeight: 'bold', color: '#000' }}>{person.homeAddress.city ? person.homeAddress.city : '__ '}, {person.homeAddress.state ? person.homeAddress.state : '__'}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#0090b1', marginLeft: widthPercentageToDP(8), marginRight: widthPercentageToDP(11.22), marginTop: heightPercentageToDP(2) }}>
                            <View style={{ width: widthPercentageToDP(18) }}>
                                <Text style={{ fontSize: 11, marginTop: heightPercentageToDP(1), color: '#a8a8a8', fontWeight: '600' }}>DOB</Text>
                                <Text style={{ color: '#000', fontWeight: 'bold', marginTop: heightPercentageToDP(0.7) }}>{person.dob ? new Date(person.dob).toLocaleDateString('en-IN', { day: 'numeric', year: '2-digit', month: 'short' }) : '---'}</Text>
                            </View>
                            <View style={{ borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#0090b1', width: widthPercentageToDP(28), alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, marginTop: heightPercentageToDP(1), letterSpacing: 1.5, color: '#a8a8a8', fontWeight: '600' }}>YEARS RIDING</Text>
                                <Text style={{ color: '#000', fontWeight: 'bold', marginTop: heightPercentageToDP(0.7) }}>{person.ridingSince ? new Date().getFullYear() - person.ridingSince : 0}</Text>
                            </View>
                            <View style={{ borderRightWidth: 1, borderColor: '#0090b1', width: widthPercentageToDP(28), alignItems: 'flex-start' }}>
                                <Text style={{ fontSize: 10, marginTop: heightPercentageToDP(1), letterSpacing: 1.5, color: '#a8a8a8', fontWeight: '600' }}>MEMBER SINCE</Text>
                                <Text style={{ color: '#000', fontWeight: 'bold', marginTop: heightPercentageToDP(0.7), alignSelf: 'center' }}>{new Date(person.dateOfRegistration).getFullYear()}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'column', marginHorizontal: widthPercentageToDP(8), marginTop: heightPercentageToDP(4), borderBottomWidth: 1, borderBottomColor: '#B1B1B1' }}   >
                            <Text style={{ letterSpacing: 3, fontSize: 11, color: '#a8a8a8', fontWeight: '600' }}>CLUBS</Text>
                            {
                                person.clubs ?
                                    <FlatList
                                        style={{ marginBottom: heightPercentageToDP(3) }}
                                        data={person.clubs}
                                        contentContainerStyle={styles.clubList}
                                        keyExtractor={this.clubsKeyExtractor}
                                        renderItem={({ item, index }) => (
                                            <View style={{ flexDirection: 'column', paddingVertical: heightPercentageToDP(0.5) }}>
                                                <Text style={{ color: '#000', fontWeight: '600' }}>{item.clubName}</Text>
                                            </View>
                                        )}
                                    />
                                    : null
                            }
                        </View>
                        {
                            this.props.person.isFriend
                                ? <View>
                                    <View style={{ marginLeft: widthPercentageToDP(8), marginTop: heightPercentageToDP(2), marginRight: widthPercentageToDP(7) }}>
                                        <View style={{ flexDirection: 'row', marginTop: heightPercentageToDP(2), justifyContent: 'space-between', paddingBottom: 3 }}>
                                            <Text style={{ letterSpacing: 3, fontSize: 15, color: '#000', fontWeight: '600' }}>Road Buddies</Text>
                                            {/* <LinkButton title='[see all]' titleStyle={{ color: '#f69039', fontSize: 16, fontWeight: 'bold' }} onPress={this.onPressFriendsPage} /> */}
                                        </View>
                                        <View style={{ borderTopWidth: 15, borderTopColor: '#DCDCDE' }}>
                                            <FlatList
                                                style={{ flexDirection: 'column' }}
                                                numColumns={4}
                                                data={person.friendList.slice(0, 4)}
                                                keyExtractor={this.roadBuddiesKeyExtractor}
                                                renderItem={({ item, index }) => (
                                                    <View style={{ marginRight: widthPercentageToDP(1.5) }}>
                                                        {
                                                            <SmallCard
                                                                smallardPlaceholder={require('../../assets/img/profile-pic.png')}
                                                                item={item}
                                                                onPress={() => this.openRoadBuddy(item.userId)}
                                                            />
                                                        }
                                                    </View>
                                                )}
                                            />

                                        </View>
                                    </View>
                                    <View style={{ marginLeft: widthPercentageToDP(8), marginTop: heightPercentageToDP(2), marginRight: widthPercentageToDP(7) }}>
                                        <View style={{ flexDirection: 'row', marginTop: heightPercentageToDP(2), justifyContent: 'space-between', paddingBottom: 3 }}>
                                            <Text style={{ letterSpacing: 3, fontSize: 15, color: '#000', fontWeight: '600' }}>Passengers</Text>
                                            {/* <LinkButton style={{}} title='[see all]' titleStyle={{ color: '#f69039', fontSize: 16, fontWeight: 'bold' }} onPress={() => Actions.push(PageKeys.PASSENGERS)} /> */}
                                        </View>
                                        <View style={{ borderTopWidth: 15, borderTopColor: '#DCDCDE' }}>
                                            <FlatList
                                                style={{ flexDirection: 'column' }}
                                                numColumns={4}
                                                data={person.passengerList.slice(0, 4)}
                                                keyExtractor={this.passengerListKeyExtractor}
                                                renderItem={({ item, index }) => (
                                                    <View style={{ marginRight: widthPercentageToDP(1.5) }}>
                                                        <SmallCard
                                                            smallardPlaceholder={require('../../assets/img/profile-pic.png')}
                                                            item={item}
                                                            onPress={() => this.openPassengerProfile(item, index)}
                                                        />
                                                    </View>
                                                )}
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.usersExtraDetailContainer}>
                                        <ImageBackground source={require('../../assets/img/my-journal.png')} style={styles.usersExtraDetail}>
                                            <Text style={styles.txtOnImg}>Journal</Text>
                                        </ImageBackground>
                                    </View>
                                    <View style={styles.usersExtraDetailContainer}>
                                        <ImageBackground source={require('../../assets/img/my-vest.png')} style={styles.usersExtraDetail}>
                                            <Text style={styles.txtOnImg}>Vest</Text>
                                        </ImageBackground>
                                    </View>
                                    <View style={styles.usersExtraDetailContainer}>
                                        <ImageBackground source={require('../../assets/img/my-photos.png')} style={styles.usersExtraDetail}>
                                            <Text style={styles.txtOnImg}>Photos</Text>
                                        </ImageBackground>
                                    </View>
                                </View>
                                : null
                        }
                    </ScrollView>
                </View>
                {/* Shifter: - Brings the app navigation menu */}
                <ShifterButton onPress={this.showAppNavMenu} containerStyles={this.props.hasNetwork === false ? { bottom: heightPercentageToDP(8.5) } : null} alignLeft={this.props.user.handDominance === 'left'} />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user, userAuthToken, deviceToken } = state.UserAuth;
    const { profileLastOptions, hasNetwork } = state.PageState;
    const { person } = state.CurrentProfile;
    const hasPrevProfiles = state.CurrentProfile.prevProfiles.length > 0;
    const garage = { garageId, garageName, spaceList, activeBikeIndex } = state.GarageInfo;
    return { user, userAuthToken, deviceToken, garage, profileLastOptions, hasNetwork, person, hasPrevProfiles };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        logoutUser: (userId, accessToken, deviceToken) => dispatch(logoutUser(userId, accessToken, deviceToken)),
        updateUser: (updates) => dispatch(updateUserAction(updates)),
        getProfilePicture: (pictureId, friendId) => getPicture(pictureId, ({ picture, pictureId }) => {
            dispatch(updateCurrentFriendAction({ profilePicture: picture, userId: friendId }))
        }, (error) => {
            dispatch(updateCurrentFriendAction({ userId: friendId }))
        }),
        getSpaceList: (userId) => dispatch(getSpaceList(userId)),
        updateProfilePicture: (profilePicStr, mimeType, userId) => dispatch(updateProfilePicture(profilePicStr, mimeType, userId)),
        getBikePicture: (pictureId, spaceId) => getPicture(pictureId, (response) => {
            dispatch(updateBikePictureListAction({ spaceId, ...response }))
        }, (error) => console.log("getPicture error: ", error)),

        setBikeAsActive: (userId, spaceId, prevActiveIndex, index) => dispatch(setBikeAsActive(userId, spaceId, prevActiveIndex, index)),
        getGarageInfo: (userId) => {
            dispatch(apiLoaderActions(true));
            getGarageInfo(userId, (garage) => {
                dispatch(replaceGarageInfoAction(garage))
                dispatch(apiLoaderActions(false))
            }, (error) => {
                dispatch(apiLoaderActions(false));
                console.log(`getGarage error: `, error);
            })
        },
        updateMyProfileLastOptions: (expanded) => dispatch(updateMyProfileLastOptionsAction({ expanded })),
        getRoadBuddies: (userId) => dispatch(getRoadBuddies(userId)),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
        getFriendInfo: (friendType, userId, friendIdList) => dispatch(getFriendInfo(friendType, userId, friendIdList)),
        getFriendProfile: (userId, friendId) => dispatch(getFriendProfile(userId, friendId)),
        getUserProfile: (userId, friendId) => dispatch(getUserProfile(userId, friendId)),
        getPassengersById: (userId, friendId, pageNumber) => dispatch(getPassengersById(userId, friendId, pageNumber)),
        getRoadBuddiesById: (userId, friendId, pageNumber) => dispatch(getRoadBuddiesById(userId, friendId, pageNumber)),
        getPictureList: (pictureIdList, callingFrom) => getPictureList(pictureIdList, (pictureObj) => {
            dispatch(updatePicturesAction({ pictureObj, type: callingFrom }))
        }, (error) => {
            console.log('getPictureList error : ', error)
        }),
        goToPrevProfile: () => dispatch(goToPrevProfileAction()),
        resetCurrentFriend: () => dispatch(resetCurrentFriendAction()),
        changeScreen: (screenProps) => dispatch(screenChangeAction(screenProps)),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(FriendsProfile);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    rowContent: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    profileHeader: {
        position: 'absolute',
        zIndex: 50,
        width: '100%',
        height: heightPercentageToDP(6),
        flexDirection: 'row',
        marginTop: IS_ANDROID ? 0 : hasIOSAbove10 ? APP_COMMON_STYLES.statusBar.height : 0
    },
    headerIconCont: {
        paddingHorizontal: 0,
        width: widthPercentageToDP(9),
        height: widthPercentageToDP(9),
        borderRadius: widthPercentageToDP(9) / 2,
        backgroundColor: '#fff',
        alignSelf: 'center',
        marginLeft: 17
    },
    title: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
        backgroundColor: 'transparent',
    },
    profilePicBtmBorder: {
        width: '100%',
        height: 13
    },
    profilePic: {
        height: 255,
        width: WindowDimensions.width
    },
    scrollBottomContent: {
        flex: 1
    },
    accordionHeader: {
        backgroundColor: 'transparent',
        marginHorizontal: widthPercentageToDP(10),
        borderBottomWidth: 1,
        borderBottomColor: '#000'
    },
    horizontalScroll: {
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
    },

    //  new Design styles
    mapHeader: {
        height: APP_COMMON_STYLES.headerHeight,
        backgroundColor: APP_COMMON_STYLES.headerColor,
        flexDirection: 'row',
        elevation: 30,
        shadowOffset: { width: 0, height: 8 },
        shadowColor: '#000000',
        shadowOpacity: 0.9,
        shadowRadius: 5,
        zIndex: 999
    },
    clubList: {
        marginHorizontal: widthPercentageToDP(1),
        paddingTop: widthPercentageToDP(1),
    },
    usersExtraDetail: {
        width: WindowDimensions.width,
        height: heightPercentageToDP(30),
        justifyContent: 'center',
        paddingLeft: 20
    },
    usersExtraDetailContainer: {
        marginTop: 20,
        borderTopWidth: 9,
        borderTopColor: '#f69039',
        elevation: 20,
    },
    addBtnCont: {
        height: 18,
        width: 18,
        borderRadius: 9,
        backgroundColor: '#a8a8a8',
        marginRight: 10
    },
    txtOnImg: {
        marginLeft: widthPercentageToDP(5),
        marginTop: 30,
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
        letterSpacing: 2
    }
});