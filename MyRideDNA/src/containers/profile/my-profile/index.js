import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Platform, StatusBar, View, Text, ImageBackground, Image, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Actions } from 'react-native-router-flux';
import { PageKeys, widthPercentageToDP, heightPercentageToDP, APP_COMMON_STYLES, USER_AUTH_TOKEN, IS_ANDROID, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, WindowDimensions, FRIEND_TYPE, CUSTOM_FONTS } from '../../../constants/index';
import { BasicHeader } from '../../../components/headers';
import { IconButton, LinkButton } from '../../../components/buttons';
import { Thumbnail } from '../../../components/images';
import { appNavMenuVisibilityAction, updateUserAction, updateShortSpaceListAction, updateBikePictureListAction, toggleLoaderAction, replaceGarageInfoAction, updateMyProfileLastOptionsAction, apiLoaderActions, screenChangeAction, updateFriendInListAction, updatePassengerInListAction, setCurrentFriendAction } from '../../../actions';
import { Accordion } from 'native-base';
import ImagePicker from 'react-native-image-crop-picker';
import { logoutUser, updateProfilePicture, getPicture, getSpaceList, setBikeAsActive, getGarageInfo, getRoadBuddies, getPictureList, getMyWallet, getPassengerList } from '../../../api';
import { ImageLoader } from '../../../components/loader';
import { SmallCard } from '../../../components/cards';
import { getFormattedDateFromISO } from '../../../util';
import { DefaultText } from '../../../components/labels';

const hasIOSAbove10 = parseInt(Platform.Version) > 10;
const clubDummyData = [{ name: 'Black Rebel Motorcycle Club', id: "1" }, { name: 'Hell’s Angels', id: "2" }, { name: 'Milwaukee Outlaws', id: "3" }]
const roadbuddiesDummyData = [{ name: 'person1', id: '1' }, { name: 'person2', id: '2' }, { name: 'person3', id: '3' }, { name: 'person4', id: '4' }]
class MyProfileTab extends Component {
    // DOC: Icon format is for Icon component from NativeBase Library
    PROFILE_ICONS = {
        gallery: { name: 'md-photos', type: 'Ionicons', style: { color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(7) }, onPress: () => this.onPressGalleryIcon() },
        camera: { name: 'camera', type: 'FontAwesome', style: { color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(6) }, onPress: () => this.onPressCameraIcon() },
        passengers: { name: 'users', type: 'Entypo', style: { color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(6) }, onPress: () => Actions.push(PageKeys.PASSENGERS) },
        edit: { name: 'account-edit', type: 'MaterialCommunityIcons', style: { color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(8) }, onPress: () => Actions.push(PageKeys.EDIT_PROFILE_FORM) },
    };
    hScrollView = null;
    profilePicture = null;
    constructor(props) {
        super(props);
        this.state = {
            activeTab: -1,
            bikes: [10, 20, 30, 40, 50],
            isLoadingProfPic: false,
            pictureLoader: {},
        };
    }

    componentWillMount() {
        StatusBar.setBarStyle('light-content');
        this.props.getRoadBuddies(this.props.user.userId);
        this.props.getMyWallet(this.props.user.userId);
        this.props.getPassengerList(this.props.user.userId, 0, 4, (res) => { }, (err) => { });
    }

    async componentDidMount() {
        // this.props.getSpaceList(this.props.user.userId);
        if (this.props.garage.garageId === null) {
            // this.props.getGarageInfo(this.props.user.userId);
        }
        if (this.props.user.profilePictureId && !this.props.user.profilePicture) {
            this.profilePicture = await AsyncStorage.getItem('profilePicture');
            if (this.profilePicture) {
                this.profilePicture = JSON.parse(this.profilePicture);
                if (Object.keys(this.profilePicture)[0] === this.props.user.profilePictureId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)) {
                    this.props.updateUser({ profilePicture: this.profilePicture[this.props.user.profilePictureId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)] });
                    return;
                }
            }
            if (this.props.user.profilePictureId) {
                this.setState({ isLoadingProfPic: true });
                this.props.getUserProfilePicture(this.props.user.profilePictureId);
            }
        }


    }

    async componentDidUpdate(prevProps, prevState) {
        if (prevProps.user.profilePictureId !== this.props.user.profilePictureId || !this.props.user.profilePicture) {
            if (this.profilePicture) {
                if (Object.keys(this.profilePicture)[0] === this.props.user.profilePictureId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)) {
                    this.props.updateUser({ profilePicture: this.profilePicture[this.props.user.profilePictureId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)] });
                    return;
                }
            }
            if (this.props.user.profilePictureId) {
                this.props.getUserProfilePicture(this.props.user.profilePictureId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG));
            }
        } else if (prevState.isLoadingProfPic) {
            if (this.props.user.profilePicture) {
                this.profilePicture = {};
                this.profilePicture[this.props.user.profilePictureId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)] = this.props.user.profilePicture;
                AsyncStorage.setItem('profilePicture', JSON.stringify(this.profilePicture));
            }
            this.setState({ isLoadingProfPic: false });
        }

        if (prevProps.allFriends !== this.props.allFriends) {
            const pictureIdList = [];
            this.props.allFriends.forEach((friend) => {
                if (!friend.profilePicture && friend.profilePictureId) {
                    pictureIdList.push(friend.profilePictureId);
                }
            })
            if (pictureIdList.length > 0) {
                this.props.getPictureList(pictureIdList, 'roadBuddies');
            }
        }

        if (prevProps.passengerList !== this.props.passengerList) {
            const pictureIdList = [];
            this.props.passengerList.forEach((passenger) => {
                if (!passenger.profilePicture && passenger.profilePictureId) {
                    pictureIdList.push(passenger.profilePictureId);
                }
            })
            if (pictureIdList.length > 0) {
                this.props.getPictureList(pictureIdList, 'passenger');
            }
        }
    }

    // onSpaceLongPress = (newSpaceIndex) => {
    //      if (newSpaceIndex === 0) return;
    //      this.hScrollView.scrollToIndex({ index: 0, animated: true });
    //     console.log('onSpaceLongPress : ',newSpaceIndex)
    //     const prevActiveBikeIndex = this.props.shortSpaceList.findIndex(bike => bike.isDefault);
    //     this.props.setBikeAsActive(this.props.user.userId, this.props.shortSpaceList[newSpaceIndex].spaceId, prevActiveBikeIndex, newSpaceIndex);
    // }
    onSpaceLongPress = (newSpaceIndex) => {
        if (newSpaceIndex === 0) return;
        this.hScrollView.scrollToIndex({ index: 0, animated: true });
        const prevActiveBikeIndex = this.props.garage.spaceList.findIndex(bike => bike.isDefault);
        this.props.setBikeAsActive(this.props.user.userId, this.props.garage.spaceList[newSpaceIndex].spaceId, prevActiveBikeIndex, newSpaceIndex);
    }

    renderAccordionItem = (item) => {
        if (item.title === 'Change profile') {
            this.props.updateMyProfileLastOptions(0)
            return (
                <View style={[styles.rowContent, this.props.hasNetwork === false ? { padding: heightPercentageToDP(2) } : { padding: heightPercentageToDP(5) }]}>
                    {
                        item.content.map(props => <IconButton key={props.name} iconProps={props} onPress={props.onPress} />)
                    }
                </View>
            );
        } else {
            this.props.updateMyProfileLastOptions(1)
            return (
                <View style={[styles.rowContent, !this.props.hasNetwork === false ? { padding: heightPercentageToDP(2) } : { padding: heightPercentageToDP(5) }]}>
                    <FlatList
                        horizontal={true}
                        data={this.props.garage.spaceList}
                        keyExtractor={(item, index) => item.spaceId}
                        renderItem={({ item, index }) => <View>
                            <Thumbnail
                                horizontal={false}
                                height={heightPercentageToDP(12)}
                                width={widthPercentageToDP(28)}
                                active={item.isDefault}
                                imagePath={item.pictureList ? { uri: item.pictureList[0] } : require('../../../assets/img/harley.jpg')}
                                title={item.name}
                                onLongPress={() => this.onSpaceLongPress(index)}
                            />
                            {
                                this.state.pictureLoader[item.spaceId]
                                    ? <ImageLoader show={this.state.pictureLoader[item.spaceId]} />
                                    : null
                            }
                        </View>}
                        ref={view => this.hScrollView = view}
                    />
                </View>
            );
        }
    }

    onPressLogout = async () => {
        this.props.logoutUser(this.props.user.userId, this.props.userAuthToken, this.props.deviceToken);
    }
    clubsKeyExtractor = (item) => item.clubId;

    roadBuddiesKeyExtractor = (item) => item.userId;

    passengerListKeyExtractor = (item) => item.passengerId;

    onPressFriendsPage = () => {
        store.dispatch(screenChangeAction({ name: PageKeys.FRIENDS, params: { comingFrom: PageKeys.PROFILE } }));
    }

    openPassengerProfile = (item, index) => {
        if (item.isFriend) {
            this.openRoadBuddy(item.passengerUserId);
        }
        else {
            Actions.push(PageKeys.PASSENGER_PROFILE, { passengerIdx: index });
        }
        // Actions.push(PageKeys.PASSENGER_PROFILE, { passengerIdx: index });
    }

    openRoadBuddy = (userId) => {
        this.props.setCurrentFriend({ userId });
        Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: userId });
    }

    render() {
        const { user, allFriends, passengerList } = this.props;
        const { isLoadingProfPic } = this.state;
        return (
            <View style={styles.fill}>
                <View style={styles.header}>
                    <IconButton iconProps={{ name: 'ios-notifications', type: 'Ionicons', style: { fontSize: 26 } }}
                        style={styles.headerIconCont} onPress={() => Actions.push(PageKeys.NOTIFICATIONS)} />
                    <View style={styles.titleContainer}>
                        <DefaultText style={styles.title} >{user.name}</DefaultText>
                        <DefaultText style={styles.subTitle}>{user.nickname ? user.nickname.toUpperCase() : null}</DefaultText>
                    </View>
                </View>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: APP_COMMON_STYLES.tabContainer.height }}>
                    <View style={styles.profilePic}>
                        <ImageBackground source={user.profilePicture ? { uri: user.profilePicture } : require('../../../assets/img/profile-pic.png')} style={{ height: null, width: null, flex: 1, borderRadius: 0 }}>
                            {
                                isLoadingProfPic
                                    ? <ImageLoader show={isLoadingProfPic} />
                                    : null
                            }
                        </ImageBackground>
                    </View>
                    <Image source={require('../../../assets/img/profile-bg.png')} style={styles.profilePicBtmBorder} />
                    <View style={styles.container}>
                        <View style={styles.basicAlignment}>
                            <View style={{ flexDirection: 'column' }}>
                                <DefaultText style={styles.labels}>LOCATION</DefaultText>
                                <DefaultText style={styles.labelsData}>{user.homeAddress.city ? user.homeAddress.city : '__ '}, {user.homeAddress.state ? user.homeAddress.state : '__'}</DefaultText>
                            </View>
                            <IconButton iconProps={{ name: 'account-edit', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(8), color: '#f69039' } }} onPress={() => Actions.push(PageKeys.EDIT_PROFILE_FORM)} />
                        </View>
                        <View style={[styles.basicAlignment, styles.horizontalContainer]}>
                            <View style={styles.individualComponent}>
                                <DefaultText style={styles.labels}>DOB</DefaultText>
                                <DefaultText style={styles.labelsData}>{user.dob ? getFormattedDateFromISO(user.dob) : '---'}</DefaultText>
                            </View>
                            <View style={styles.individualComponent}>
                                <DefaultText style={[styles.labels, { paddingHorizontal: 9 }]}>YEARS RIDING</DefaultText>
                                <DefaultText style={styles.labelsData}>{user.ridingSince ? new Date().getFullYear() - user.ridingSince : 0}</DefaultText>
                            </View>
                            <View style={styles.individualComponent}>
                                <DefaultText style={styles.labels}>MEMBER SINCE</DefaultText>
                                <DefaultText style={[styles.labelsData, { alignSelf: 'center' }]}>{new Date(user.dateOfRegistration).getFullYear()}</DefaultText>
                            </View>
                        </View>
                        <View style={styles.clubContainer}>
                            <DefaultText style={styles.labels}>CLUBS</DefaultText>
                            <FlatList
                                style={{ marginBottom: 9 }}
                                data={user.clubs}
                                keyExtractor={this.clubsKeyExtractor}
                                renderItem={({ item, index }) => (
                                    <View style={{ paddingVertical: 2 }}>
                                        <DefaultText style={styles.labelsData}>{item.clubName}</DefaultText>
                                    </View>
                                )}
                            />
                        </View>
                        <View style={{ marginTop: 19 }}>
                            <View style={styles.basicAlignment}>
                                <TouchableOpacity style={styles.basicAlignment} onPress={this.onPressFriendsPage}>
                                    <DefaultText style={[styles.labelsData, { letterSpacing: 1.8, paddingRight: 8 }]}>Road Buddies</DefaultText>
                                    <DefaultText style={[styles.labelsData, { letterSpacing: 1.8, color: '#F5891F' }]}>[see all]</DefaultText>
                                </TouchableOpacity>
                                <IconButton style={styles.addBtnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: 10, color: '#fff' } }} onPress={() => Actions.push(PageKeys.CONTACTS_SECTION)} />
                            </View>
                            {
                                allFriends.length > 0
                                    ?
                                    <View style={styles.greyBorder}>
                                        <FlatList
                                            style={{ flexDirection: 'column' }}
                                            numColumns={4}
                                            data={allFriends.slice(0, 4)}
                                            keyExtractor={this.roadBuddiesKeyExtractor}
                                            renderItem={({ item, index }) => (
                                                <SmallCard
                                                    smallardPlaceholder={require('../../../assets/img/profile-pic.png')}
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
                                <TouchableOpacity style={styles.basicAlignment} onPress={() => Actions.push(PageKeys.PASSENGERS)}>
                                    <DefaultText style={[styles.labelsData, { letterSpacing: 1.8, paddingRight: 8 }]}>Passengers</DefaultText>
                                    <DefaultText style={[styles.labelsData, { letterSpacing: 1.8, color: '#F5891F' }]}>[see all]</DefaultText>
                                </TouchableOpacity>
                                <IconButton style={styles.addBtnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: 10, color: '#fff' } }} onPress={() => Actions.push(PageKeys.PASSENGER_FORM, { passengerIdx: -1 })} />
                            </View>
                            {
                                passengerList.length > 0
                                    ?
                                    <View style={styles.greyBorder}>
                                        <FlatList
                                            style={{ flexDirection: 'column' }}
                                            numColumns={4}
                                            data={passengerList.slice(0, 4)}
                                            keyExtractor={this.passengerListKeyExtractor}
                                            renderItem={({ item, index }) => (
                                                <SmallCard
                                                    smallardPlaceholder={require('../../../assets/img/profile-pic.png')}
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
                    <TouchableOpacity style={styles.usersExtraDetailContainer} onPress={() => Actions.push(PageKeys.MY_WALLET_FORM)}>
                        <ImageBackground source={require('../../../assets/img/my-wallet.png')} style={styles.usersExtraDetail}>
                            <DefaultText style={styles.txtOnImg}>My Wallet</DefaultText>
                        </ImageBackground>
                    </TouchableOpacity >
                    <View style={styles.usersExtraDetailContainer}>
                        <ImageBackground source={require('../../../assets/img/my-journal.png')} style={styles.usersExtraDetail}>
                            <DefaultText style={styles.txtOnImg}>My Journal</DefaultText>
                        </ImageBackground>
                    </View>
                    <View style={styles.usersExtraDetailContainer}>
                        <ImageBackground source={require('../../../assets/img/my-vest.png')} style={styles.usersExtraDetail}>
                            <DefaultText style={styles.txtOnImg}>My Vest</DefaultText>
                        </ImageBackground>
                    </View>
                    <TouchableOpacity style={styles.usersExtraDetailContainer} onPress={() => Actions.push(PageKeys.ALBUM)}>
                        <ImageBackground source={require('../../../assets/img/my-photos.png')} style={styles.usersExtraDetail}>
                            <DefaultText style={styles.txtOnImg}>My Photos</DefaultText>
                        </ImageBackground>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user, userAuthToken, deviceToken } = state.UserAuth;
    const { profileLastOptions, hasNetwork } = state.PageState;
    const { allFriends } = state.FriendList;
    const { passengerList } = state.PassengerList;
    const garage = { garageId, garageName, spaceList, activeBikeIndex } = state.GarageInfo;
    return { user, userAuthToken, deviceToken, garage, profileLastOptions, hasNetwork, allFriends, passengerList };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        logoutUser: (userId, accessToken, deviceToken) => dispatch(logoutUser(userId, accessToken, deviceToken)),
        updateUser: (updates) => dispatch(updateUserAction(updates)),
        getUserProfilePicture: (pictureId) => getPicture(pictureId, ({ picture }) => {
            pictureId.indexOf(THUMBNAIL_TAIL_TAG) > -1
                ? dispatch(updateUserAction({ thumbnailProfilePicture: picture }))
                : dispatch(updateUserAction({ profilePicture: picture }))
        }, (error) => {
            dispatch(updateUserAction({}))
        }),
        getSpaceList: (userId) => dispatch(getSpaceList(userId)),
        updateProfilePicture: (profilePicStr, mimeType, userId) => dispatch(updateProfilePicture(profilePicStr, mimeType, userId)),

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
        getPictureList: (pictureIdList, callingFrom) => getPictureList(pictureIdList, (pictureObj) => {

            if (callingFrom === 'roadBuddies') {
                dispatch(updateFriendInListAction({ pictureObj }))
            }
            else {
                dispatch(updatePassengerInListAction({ pictureObj }))
            }
        }, (error) => {
            console.log('getPictureList error : ', error)
        }),
        getMyWallet: (userId) => dispatch(getMyWallet(userId)),
        getPassengerList: (userId, pageNumber, preference, successCallback, errorCallback) => dispatch(getPassengerList(userId, pageNumber, preference, successCallback, errorCallback)),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(MyProfileTab);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    rowContent: {
        flexDirection: 'row',
        justifyContent: 'space-around',
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
    titleContainer: {
        flexDirection: 'column',
        marginLeft: 17,
        justifyContent: 'center',
        alignSelf: 'center'
    },
    container: {
        marginHorizontal: 27,
        marginTop: 26
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
        fontFamily: CUSTOM_FONTS.gothamBold
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
    profilePicBtmBorder: {
        width: '100%',
        height: 13
    },
    profilePic: {
        height: 255,
        width: WindowDimensions.width,
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
        height: 14,
        width: 14,
        borderRadius: 7,
        backgroundColor: '#a8a8a8',
        marginRight: 10
    },
    greyBorder: {
        borderTopWidth: 13,
        borderTopColor: '#DCDCDE'
    },
    txtOnImg: {
        color: '#fff',
        fontSize: 18,
        letterSpacing: 2.7,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
    },
    imageStyle: {
        marginRight: widthPercentageToDP(1.8),
        height: widthPercentageToDP(100 / 5),
        width: widthPercentageToDP(100 / 5)
    }
});