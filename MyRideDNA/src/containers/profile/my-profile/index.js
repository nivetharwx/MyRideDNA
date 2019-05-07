import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Platform, StatusBar, View, Text, ImageBackground, Image, FlatList, ScrollView, AsyncStorage } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { PageKeys, widthPercentageToDP, heightPercentageToDP, APP_COMMON_STYLES, USER_AUTH_TOKEN, IS_ANDROID, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG } from '../../../constants/index';
import { IconButton } from '../../../components/buttons';
import { Thumbnail } from '../../../components/images';
import { appNavMenuVisibilityAction, updateUserAction, updateShortSpaceListAction, updateBikePictureListAction, toggleLoaderAction, replaceGarageInfoAction, updateMyProfileLastOptionsAction, apiLoaderActions } from '../../../actions';
import { Accordion } from 'native-base';
import ImagePicker from 'react-native-image-crop-picker';
import { logoutUser, updateProfilePicture, getPicture, getSpaceList, setBikeAsActive, getGarageInfo } from '../../../api';
import { ImageLoader } from '../../../components/loader';

const hasIOSAbove10 = parseInt(Platform.Version) > 10;
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
    }

    async componentDidMount() {
        // this.props.getSpaceList(this.props.user.userId);
        if (this.props.garage.garageId === null) {
            this.props.getGarageInfo(this.props.user.userId);
        }
        if (!this.props.user.profilePicture) {
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
            this.props.getUserProfilePicture(this.props.user.profilePictureId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG));
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
                <View style={styles.rowContent}>
                    {
                        item.content.map(props => <IconButton key={props.name} iconProps={props} onPress={props.onPress} />)
                    }
                </View>
            );
        } else {
            this.props.updateMyProfileLastOptions(1)
            return (
                <View style={styles.rowContent}>
                    {/* <ScrollView
                        showsHorizontalScrollIndicator={false}
                        horizontal={true}
                        contentContainerStyle={styles.horizontalScroll}>
                        <FlatList
                            horizontal={true}
                            data={this.state.bikes}
                            keyExtractor={(item, index) => index + ''}
                            // FIXME: Pass active based on active bike
                            renderItem={({ item, index }) => <Thumbnail horizontal={false} height={heightPercentageToDP(12)} width={widthPercentageToDP(28)} active={index === 0} imagePath={require('../../../assets/img/harley.jpg')} title={`Harley Space - ${item}`} onLongPress={index != 0 ? () => this.onSpaceLongPress(index) : null} />}
                            ref={view => this.hScrollView = view}
                        />
                    </ScrollView> */}
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

    onPressGalleryIcon = async () => {
        this.setState({ isLoadingProfPic: true });
        try {
            const imageObj = await ImagePicker.openPicker({
                width: 300,
                height: 300,
                cropping: false,
                includeBase64: true,
            });
            this.props.updateProfilePicture(imageObj.data, imageObj.mime, this.props.user.userId);
        } catch (er) {
            this.setState({ isLoadingProfPic: false });
            console.log("Error occurd: ", er);
        }
    }

    onPressCameraIcon = async () => {
        this.setState({ isLoadingProfPic: true });
        try {
            const imageObj = await ImagePicker.openCamera({
                width: 300,
                height: 300,
                includeBase64: true,
                cropping: false, // DOC: Setting this to true (in openCamera) is not working as expected (19-12-2018).
            });
            this.props.updateProfilePicture(imageObj.data, imageObj.mime, this.props.user.userId);
        } catch (er) {
            this.setState({ isLoadingProfPic: false });
            console.log("Error occurd: ", er);
        }
    }

    onPressLogout = async () => {
        this.props.logoutUser(this.props.user.userId, this.props.userAuthToken, this.props.deviceToken);
    }

    render() {
        const { user } = this.props;
        const { isLoadingProfPic } = this.state;
        return (
            <View style={styles.fill}>
                {
                    // IS_ANDROID
                    //     ? null
                    //     : <View style={APP_COMMON_STYLES.appBar} />
                }
                <ImageBackground source={require('../../../assets/img/profile-bg.png')} style={styles.profileBG}>
                    <View style={styles.profilePic}>
                        <ImageBackground source={user.profilePicture ? { uri: user.profilePicture } : require('../../../assets/img/profile-pic.png')} style={{ height: null, width: null, flex: 1, borderRadius: 5 }}>
                            {
                                isLoadingProfPic
                                    ? <ImageLoader show={isLoadingProfPic} />
                                    : null
                            }
                        </ImageBackground>
                    </View>
                    <View style={styles.profileHeader}>
                        <IconButton iconProps={{ name: 'bell', type: 'FontAwesome', style: { fontSize: widthPercentageToDP(5) } }}
                            style={[styles.headerIcon, { marginLeft: widthPercentageToDP(1) }]} onPress={() => Actions.push(PageKeys.NOTIFICATIONS)} />
                        <Text style={styles.title}
                            renderToHardwareTextureAndroid collapsable={false}>
                            {user.name}
                            <Text style={{ color: APP_COMMON_STYLES.infoColor, fontWeight: 'bold' }}>
                                {'  '}{user.nickname}
                            </Text>
                        </Text>
                        <IconButton iconProps={{ name: 'md-exit', type: 'Ionicons', style: { fontSize: widthPercentageToDP(8), color: APP_COMMON_STYLES.infoColor } }}
                            style={[styles.headerIcon, { backgroundColor: 'transparent' }]} onPress={this.onPressLogout} />
                    </View>
                </ImageBackground>
                <ScrollView styles={styles.scrollBottom} contentContainerStyle={styles.scrollBottomContent}>
                    <Accordion expanded={this.props.profileLastOptions} dataArray={[{ title: 'Change profile', content: [this.PROFILE_ICONS.gallery, this.PROFILE_ICONS.camera, this.PROFILE_ICONS.passengers, this.PROFILE_ICONS.edit] },
                    { title: 'Change bike', content: [] }]}
                        renderContent={this.renderAccordionItem} headerStyle={styles.accordionHeader} />
                </ScrollView>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user, userAuthToken, deviceToken } = state.UserAuth;
    const { profileLastOptions } = state.PageState;
    // const { shortSpaceList } = state.GarageInfo;
    const garage = { garageId, garageName, spaceList, activeBikeIndex } = state.GarageInfo;
    // return { user, shortSpaceList };
    return { user, userAuthToken, deviceToken, garage, profileLastOptions };
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
        // getBikePicture: (pictureId, spaceId) => getPicture(pictureId, ({ picture }) => {
        //     dispatch(updateShortSpaceListAction({ profilePicture: picture, spaceId }))
        // }, (error) => {
        //     dispatch(updateShortSpaceListAction({ spaceId }))
        // }),
        getBikePicture: (pictureId, spaceId) => getPicture(pictureId, (response) => {
            dispatch(updateBikePictureListAction({ spaceId, ...response }))
        }, (error) => console.log("getPicture error: ", error)),

        setBikeAsActive: (userId, spaceId, prevActiveIndex, index) => dispatch(setBikeAsActive(userId, spaceId, prevActiveIndex, index)),
        getGarageInfo: (userId) => {
            // dispatch(toggleLoaderAction(true));
            dispatch(apiLoaderActions(true));
            console.log("loader enabled");
            getGarageInfo(userId, (garage) => {
                dispatch(replaceGarageInfoAction(garage))
                // setTimeout(() => dispatch(toggleLoaderAction(false)), 100);
                dispatch(apiLoaderActions(false))
                console.log("loader disabled");
            }, (error) => {
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false));
                console.log(`getGarage error: `, error);
            })
        },
        updateMyProfileLastOptions: (expanded) => dispatch(updateMyProfileLastOptionsAction({ expanded }))
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(MyProfileTab);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    rowContent: {
        padding: heightPercentageToDP(5),
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
    headerIcon: {
        paddingHorizontal: 0,
        width: widthPercentageToDP(9),
        height: widthPercentageToDP(9),
        borderRadius: widthPercentageToDP(9) / 2,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        flex: 1,
        marginLeft: widthPercentageToDP(3),
        alignSelf: 'center',
        fontSize: widthPercentageToDP(5),
        color: 'white',
        alignItems: 'flex-start',
        fontWeight: 'bold',
        backgroundColor: 'transparent',
    },
    profileBG: {
        width: '100%',
        height: heightPercentageToDP(55),
        paddingTop: IS_ANDROID ? 0 : hasIOSAbove10 ? heightPercentageToDP(1.5) : 0
    },
    profilePic: {
        height: widthPercentageToDP(65),
        width: widthPercentageToDP(65),
        alignSelf: 'center',
        marginTop: heightPercentageToDP(10),
        borderWidth: 1,
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
});