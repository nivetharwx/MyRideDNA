import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Platform, StatusBar, View, Text, ImageBackground, Image, FlatList, ScrollView, BackHandler, TouchableOpacity } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { PageKeys, widthPercentageToDP, heightPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, WindowDimensions, FRIEND_TYPE, CUSTOM_FONTS } from '../../constants/index';
import { IconButton, LinkButton, ShifterButton } from '../../components/buttons';
import { appNavMenuVisibilityAction, updateUserAction, updateBikePictureListAction, replaceGarageInfoAction, updateMyProfileLastOptionsAction, apiLoaderActions, screenChangeAction, setCurrentFriendAction, updateCurrentFriendAction, updatePicturesAction, undoLastAction, resetCurrentFriendAction, goToPrevProfileAction } from '../../actions';
import { logoutUser, updateProfilePicture, getPicture, getSpaceList, setBikeAsActive, getGarageInfo, getRoadBuddies, getPictureList, getFriendInfo, getFriendProfile, getPassengersById, getRoadBuddiesById, getUserProfile } from '../../api';
import { ImageLoader } from '../../components/loader';
import { SmallCard } from '../../components/cards';
import { BasicHeader } from '../../components/headers';
import { DefaultText } from '../../components/labels';
import { getFormattedDateFromISO } from '../../util';

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
                    <View style={styles.header}>
                        <IconButton iconProps={{ name: 'md-arrow-round-back', type: 'Ionicons', style: { fontSize: 27 } }}
                            style={styles.headerIconCont} onPress={this.popToPrevProfile} />
                        <View style={styles.titleContainer}>
                            <DefaultText style={styles.title} >{person.name}</DefaultText>
                            <DefaultText style={styles.subTitle}>{person.nickname ? person.nickname.toUpperCase() : null}</DefaultText>
                        </View>
                    </View>
                    <ScrollView contentContainerStyle={{ paddingBottom: APP_COMMON_STYLES.tabContainer.height }}>
                        <View style={styles.profilePic}>
                            <ImageBackground source={person.profilePicture ? { uri: person.profilePicture } : require('../../assets/img/profile-pic.png')} style={{ height: null, width: null, flex: 1, borderRadius: 0 }}>
                                {
                                    isLoadingProfPic
                                        ? <ImageLoader show={isLoadingProfPic} />
                                        : null
                                }
                            </ImageBackground>
                        </View>
                        <Image source={require('../../assets/img/profile-bg.png')} style={styles.profilePicBtmBorder} />
                        <View style={styles.container}>
                            <View style={{ flexDirection: 'column' }}>
                                <DefaultText style={styles.labels}>LOCATION</DefaultText>
                                <DefaultText style={styles.labelsData}>{person.homeAddress.city ? person.homeAddress.city : '__ '}, {person.homeAddress.state ? person.homeAddress.state : '__'}</DefaultText>
                            </View>
                            <View style={[styles.basicAlignment, styles.horizontalContainer]}>
                                <View style={styles.individualComponent}>
                                    <DefaultText style={styles.labels}>DOB</DefaultText>
                                    <DefaultText style={styles.labelsData}>{person.dob ? getFormattedDateFromISO(person.dob) : '---'}</DefaultText>
                                </View>
                                <View style={styles.individualComponent}>
                                    <DefaultText style={[styles.labels, { paddingHorizontal: 9 }]}>YEARS RIDING</DefaultText>
                                    <DefaultText style={styles.labelsData}>{person.ridingSince ? new Date().getFullYear() - person.ridingSince : 0}</DefaultText>
                                </View>
                                <View style={styles.individualComponent}>
                                    <DefaultText style={styles.labels}>MEMBER SINCE</DefaultText>
                                    <DefaultText style={[styles.labelsData, { alignSelf: 'center' }]}>{new Date(person.dateOfRegistration).getFullYear()}</DefaultText>
                                </View>
                            </View>
                            <View style={styles.clubContainer}>
                                <DefaultText style={styles.labels}>CLUBS</DefaultText>
                                <FlatList
                                    style={{ marginBottom: 9 }}
                                    data={person.clubs}
                                    keyExtractor={this.clubsKeyExtractor}
                                    renderItem={({ item, index }) => (
                                        <View style={{ paddingVertical: 2 }}>
                                            <DefaultText style={styles.labelsData}>{item.clubName}</DefaultText>
                                        </View>
                                    )}
                                />
                            </View>


                            {
                                this.props.person.isFriend
                                    ? <View>
                                        <View style={{ marginTop: 19 }}>
                                            <View style={styles.basicAlignment}>
                                                <TouchableOpacity style={styles.basicAlignment} >
                                                    <DefaultText style={[styles.labelsData, { letterSpacing: 1.8, paddingRight: 8 }]}>Road Buddies</DefaultText>
                                                    <DefaultText style={[styles.labelsData, { letterSpacing: 1.8, color: '#F5891F' }]}>[see all]</DefaultText>
                                                </TouchableOpacity>
                                            </View>
                                            {
                                                person.friendList.length > 0
                                                    ?
                                                    <View style={styles.greyBorder}>
                                                        <FlatList
                                                            style={{ flexDirection: 'column' }}
                                                            numColumns={4}
                                                            data={person.friendList.slice(0, 4)}
                                                            keyExtractor={this.roadBuddiesKeyExtractor}
                                                            renderItem={({ item, index }) => (
                                                                <SmallCard
                                                                    smallardPlaceholder={require('../../assets/img/profile-pic.png')}
                                                                    item={item}
                                                                    onPress={() => this.openRoadBuddy(item.userId)}
                                                                    imageStyle={styles.imageStyle}
                                                                />
                                                            )}
                                                        />

                                                    </View>
                                                    : null
                                            }
                                        </View>



                                        <View style={{ marginTop: 19 }}>
                                            <View style={styles.basicAlignment}>
                                                <TouchableOpacity style={styles.basicAlignment}>
                                                    <DefaultText style={[styles.labelsData, { letterSpacing: 1.8, paddingRight: 8 }]}>Passengers</DefaultText>
                                                    <DefaultText style={[styles.labelsData, { letterSpacing: 1.8, color: '#F5891F' }]}>[see all]</DefaultText>
                                                </TouchableOpacity>
                                            </View>
                                            {
                                                person.passengerList.length > 0
                                                    ?
                                                    <View style={styles.greyBorder}>
                                                        <FlatList
                                                            style={{ flexDirection: 'column' }}
                                                            numColumns={4}
                                                            data={person.passengerList.slice(0, 4)}
                                                            keyExtractor={this.passengerListKeyExtractor}
                                                            renderItem={({ item, index }) => (
                                                                <SmallCard
                                                                    smallardPlaceholder={require('../../assets/img/profile-pic.png')}
                                                                    item={item}
                                                                    onPress={() => this.openPassengerProfile(item, index)}
                                                                    imageStyle={styles.imageStyle}
                                                                />
                                                            )}
                                                        />
                                                    </View>
                                                    : null
                                            }
                                        </View>
                                    </View>
                                    : null
                            }
                        </View>
                        <View style={styles.usersExtraDetailContainer}>
                            <ImageBackground source={require('../../assets/img/my-journal.png')} style={styles.usersExtraDetail}>
                                <DefaultText style={styles.txtOnImg}>Journal</DefaultText>
                            </ImageBackground>
                        </View>
                        <View style={styles.usersExtraDetailContainer}>
                            <ImageBackground source={require('../../assets/img/my-vest.png')} style={styles.usersExtraDetail}>
                                <DefaultText style={styles.txtOnImg}>Vest</DefaultText>
                            </ImageBackground>
                        </View>
                        <View style={styles.usersExtraDetailContainer}>
                            <ImageBackground source={require('../../assets/img/my-photos.png')} style={styles.usersExtraDetail}>
                                <DefaultText style={styles.txtOnImg}>Photos</DefaultText>
                            </ImageBackground>
                        </View>

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
        color: '#FFFFFF',
        backgroundColor: 'transparent',
        letterSpacing: 0.8,
        fontFamily: CUSTOM_FONTS.gothamBold
    },
    subTitle: {
        color: '#C4C4C4',
        fontSize: 12,
        letterSpacing: 1.08,
        fontFamily: CUSTOM_FONTS.gothamBold,
    },
    profilePicBtmBorder: {
        width: '100%',
        height: 13
    },
    profilePic: {
        height: 255,
        width: WindowDimensions.width
    },
    container: {
        marginHorizontal: 27,
        marginTop: 26
    },
    basicAlignment: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    horizontalContainer: {
        borderTopWidth: 1,
        borderColor: '#0090b1',
        marginTop: heightPercentageToDP(2),
        height: 47,
    },
    individualComponent: {
        borderRightWidth: 1,
        borderColor: '#0090b1',
        alignItems: 'center',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-evenly'
    },
    clubContainer: {
        flexDirection: 'column',
        marginTop: 17,
        borderBottomWidth: 1,
        borderBottomColor: '#B1B1B1',
    },
    labels: {
        letterSpacing: 1.6,
        fontSize: 8,
        color: '#707070',
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
    },
    labelsData: {
        color: '#000',
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        fontSize: 12,
        paddingBottom: 7
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
    header: {
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
    titleContainer: {
        flexDirection: 'column',
        marginLeft: 17,
        justifyContent: 'center',
        alignSelf: 'center'
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
        color: '#fff',
        fontSize: 18,
        letterSpacing: 2.7,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
    },
    greyBorder: {
        borderTopWidth: 13,
        borderTopColor: '#DCDCDE'
    },
    imageStyle: {
        marginRight: widthPercentageToDP(1.8),
        height: widthPercentageToDP(100 / 5),
        width: widthPercentageToDP(100 / 5)
    }
});