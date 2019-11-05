import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Platform, StatusBar, View, Text, ImageBackground, Image, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Actions } from 'react-native-router-flux';
import { PageKeys, widthPercentageToDP, heightPercentageToDP, APP_COMMON_STYLES, USER_AUTH_TOKEN, IS_ANDROID, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, WindowDimensions, FRIEND_TYPE } from '../../../constants/index';
import { BasicHeader } from '../../../components/headers';
import { IconButton, LinkButton } from '../../../components/buttons';
import { Thumbnail } from '../../../components/images';
import { appNavMenuVisibilityAction, updateUserAction, updateShortSpaceListAction, updateBikePictureListAction, toggleLoaderAction, replaceGarageInfoAction, updateMyProfileLastOptionsAction, apiLoaderActions, screenChangeAction, updateFriendInListAction, updatePassengerInListAction, setCurrentFriendAction } from '../../../actions';
import { Accordion } from 'native-base';
import ImagePicker from 'react-native-image-crop-picker';
import { logoutUser, updateProfilePicture, getPicture, getSpaceList, setBikeAsActive, getGarageInfo, getRoadBuddies, getPictureList, getMyWallet, getPassengerList } from '../../../api';
import { ImageLoader } from '../../../components/loader';
import { SmallCard } from '../../../components/cards';

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
        if (prevProps.garage.spaceList !== this.props.garage.spaceList) {
            this.props.garage.spaceList.forEach((bike, index) => {
                if (!bike.pictureList && bike.pictureIdList.length > 0) {
                    if (!this.state.pictureLoader[bike.spaceId]) {
                        this.setState(prevState => {
                            const updatedPictureLoader = { ...prevState.pictureLoader };
                            updatedPictureLoader[bike.spaceId] = true;
                            return { pictureLoader: updatedPictureLoader }
                        }, () => {
                            this.props.getBikePicture(bike.pictureIdList[0].replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG), bike.spaceId)
                        });
                    }
                } else {
                    this.setState(prevState => {
                        const updatedPictureLoader = { ...prevState.pictureLoader };
                        updatedPictureLoader[bike.spaceId] = false;
                        return { pictureLoader: updatedPictureLoader }
                    });
                }
            })
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
        console.log('onSpaceLongPress : ', newSpaceIndex)
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
                <View style={{ height: IS_ANDROID ? 0 : heightPercentageToDP(4), backgroundColor: 'black' }}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={styles.mapHeader}>
                    <IconButton iconProps={{ name: 'bell', type: 'FontAwesome', style: { fontSize: widthPercentageToDP(5) } }}
                        style={styles.headerIconCont} onPress={() => Actions.push(PageKeys.NOTIFICATIONS)} />
                    <View style={{ flexDirection: 'column', marginLeft: 17, justifyContent: 'center', alignSelf: 'center' }}>
                        <Text style={styles.title}>
                            {user.name}
                        </Text>
                        {
                            user.nickname ?
                                <Text style={{ color: 'rgba(189, 195, 199, 1)', fontWeight: 'bold' }}>
                                    {user.nickname.toUpperCase()}
                                </Text>
                                : null
                        }

                    </View>
                </View>
                <ScrollView>
                    <View style={styles.profilePic}>
                        <ImageBackground source={user.profilePicture ? { uri: user.profilePicture } : require('../../../assets/img/profile-pic.png')} style={{ height: null, width: null, flex: 1, borderRadius: 0 }}>
                            {/* <ImageBackground source={require('../../../assets/img/profile-pic.png')} style={{ height: null, width: null, flex: 1, borderRadius: 5 }}> */}
                            {
                                isLoadingProfPic
                                    ? <ImageLoader show={isLoadingProfPic} />
                                    : null
                            }
                        </ImageBackground>
                    </View>
                    <Image source={require('../../../assets/img/profile-bg.png')} style={styles.profilePicBtmBorder} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'column', marginLeft: widthPercentageToDP(8), marginTop: heightPercentageToDP(2) }}>
                            <Text style={{ letterSpacing: 1, fontSize: 11, color: '#a8a8a8', fontWeight: '600' }}>LOCATION</Text>
                            <Text style={{ fontWeight: 'bold', color: '#000' }}>{user.homeAddress.city}, {user.homeAddress.state}</Text>
                        </View>
                        <IconButton iconProps={{ name: 'account-edit', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(8), color: '#f69039' } }}
                            style={{ marginRight: widthPercentageToDP(6), marginTop: heightPercentageToDP(1.5) }} onPress={() => Actions.push(PageKeys.EDIT_PROFILE_FORM)} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#0090b1', marginLeft: widthPercentageToDP(8), marginRight: widthPercentageToDP(11.22), marginTop: heightPercentageToDP(2) }}>
                        <View style={{ width: widthPercentageToDP(18) }}>
                            <Text style={{ fontSize: 11, marginTop: heightPercentageToDP(1), color: '#a8a8a8', fontWeight: '600' }}>DOB</Text>
                            <Text style={{ color: '#000', fontWeight: 'bold', marginTop: heightPercentageToDP(0.7) }}>{new Date(user.dob).toLocaleDateString('en-IN', { day: 'numeric', year: '2-digit', month: 'short' })}</Text>
                        </View>
                        <View style={{ borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#0090b1', width: widthPercentageToDP(28), alignItems: 'center' }}>
                            <Text style={{ fontSize: 10, marginTop: heightPercentageToDP(1), letterSpacing: 1.5, color: '#a8a8a8', fontWeight: '600' }}>YEARS RIDING</Text>
                            <Text style={{ color: '#000', fontWeight: 'bold', marginTop: heightPercentageToDP(0.7) }}>{user.ridingSince ? new Date().getFullYear() - user.ridingSince : 0}</Text>
                        </View>
                        <View style={{ borderRightWidth: 1, borderColor: '#0090b1', width: widthPercentageToDP(28), alignItems: 'flex-start' }}>
                            <Text style={{ fontSize: 10, marginTop: heightPercentageToDP(1), letterSpacing: 1.5, color: '#a8a8a8', fontWeight: '600' }}>MEMBER SINCE</Text>
                            <Text style={{ color: '#000', fontWeight: 'bold', marginTop: heightPercentageToDP(0.7), alignSelf: 'center' }}>{new Date(user.dateOfRegistration).getFullYear()}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'column', marginHorizontal: widthPercentageToDP(8), marginTop: heightPercentageToDP(4), borderBottomWidth: 1, borderBottomColor: '#B1B1B1' }}   >
                        <Text style={{ letterSpacing: 3, fontSize: 11, color: '#a8a8a8', fontWeight: '600' }}>CLUBS</Text>
                        {
                            user.clubs ?
                                <FlatList
                                    style={{ marginBottom: heightPercentageToDP(3) }}
                                    data={user.clubs}
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
                    <View style={{ marginLeft: widthPercentageToDP(8), marginTop: heightPercentageToDP(2), marginRight: widthPercentageToDP(7) }}>
                        <View style={{ flexDirection: 'row', marginTop: heightPercentageToDP(2), justifyContent: 'space-between', paddingBottom: 3 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ letterSpacing: 3, fontSize: 15, color: '#000', fontWeight: '600' }}>Road Buddies</Text>
                                <LinkButton title='[see all]' titleStyle={{ color: '#f69039', fontSize: 16, fontWeight: 'bold' }} onPress={this.onPressFriendsPage} />
                            </View>
                            <IconButton style={styles.addBtnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: widthPercentageToDP(5), color: '#fff' } }} onPress={() => Actions.push(PageKeys.CONTACTS_SECTION)} />
                        </View>
                        <View style={{ borderTopWidth: 15, borderTopColor: '#DCDCDE' }}>
                            <FlatList
                                style={{ flexDirection: 'column' }}
                                numColumns={4}
                                data={allFriends.slice(0, 4)}
                                keyExtractor={this.roadBuddiesKeyExtractor}
                                renderItem={({ item, index }) => (
                                    <View style={{ marginRight: widthPercentageToDP(1.5) }}>
                                        {
                                            <SmallCard
                                                smallardPlaceholder={require('../../../assets/img/profile-pic.png')}
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
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ letterSpacing: 3, fontSize: 15, color: '#000', fontWeight: '600' }}>Passengers</Text>
                                <LinkButton style={{}} title='[see all]' titleStyle={{ color: '#f69039', fontSize: 16, fontWeight: 'bold' }} onPress={() => Actions.push(PageKeys.PASSENGERS)} />
                            </View>
                            <IconButton style={styles.addBtnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: widthPercentageToDP(5), color: '#fff' } }} onPress={() => Actions.push(PageKeys.PASSENGER_FORM, { passengerIdx: -1 })} />
                        </View>
                        <View style={{ borderTopWidth: 15, borderTopColor: '#DCDCDE' }}>
                            <FlatList
                                style={{ flexDirection: 'column' }}
                                numColumns={4}
                                data={passengerList.slice(0, 4)}
                                keyExtractor={this.passengerListKeyExtractor}
                                renderItem={({ item, index }) => (
                                    <View style={{ marginRight: widthPercentageToDP(1.5) }}>
                                        <SmallCard
                                            smallardPlaceholder={require('../../../assets/img/profile-pic.png')}
                                            item={item}
                                            onPress={() => this.openPassengerProfile(item, index)}
                                        />
                                    </View>
                                )}
                            />
                        </View>
                    </View>
                    <TouchableOpacity style={styles.usersExtraDetailContainer} onPress={() => Actions.push(PageKeys.MY_WALLET_FORM)}>
                        <ImageBackground source={require('../../../assets/img/my-wallet.png')} style={styles.usersExtraDetail}>
                            <Text style={styles.txtOnImg}>My Wallet</Text>
                        </ImageBackground>
                    </TouchableOpacity >
                    <View style={styles.usersExtraDetailContainer}>
                        <ImageBackground source={require('../../../assets/img/my-journal.png')} style={styles.usersExtraDetail}>
                            <Text style={styles.txtOnImg}>My Journal</Text>
                        </ImageBackground>
                    </View>
                    <View style={styles.usersExtraDetailContainer}>
                        <ImageBackground source={require('../../../assets/img/my-vest.png')} style={styles.usersExtraDetail}>
                            <Text style={styles.txtOnImg}>My Vest</Text>
                        </ImageBackground>
                    </View>
                    <TouchableOpacity style={styles.usersExtraDetailContainer} onPress={() => Actions.push(PageKeys.ALBUM)}>
                        {/* <TouchableOpacity style={styles.usersExtraDetailContainer}> */}
                        <ImageBackground source={require('../../../assets/img/my-photos.png')} style={styles.usersExtraDetail}>
                            <Text style={styles.txtOnImg}>My Photos</Text>
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
        fontSize: widthPercentageToDP(6),
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
        height: widthPercentageToDP(5),
        width: widthPercentageToDP(5),
        borderRadius: widthPercentageToDP(2.5),
        backgroundColor: '#a8a8a8',
        marginRight: 10
    },
    txtOnImg: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
        letterSpacing: 2
    }
});