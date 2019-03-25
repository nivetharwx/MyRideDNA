import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Platform, StatusBar, View, Text, ImageBackground, Image, FlatList, ScrollView, AsyncStorage } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { PageKeys, widthPercentageToDP, heightPercentageToDP, APP_COMMON_STYLES, USER_AUTH_TOKEN, IS_ANDROID, THUMBNAIL_TAIL_TAG } from '../../../constants/index';
import { IconButton } from '../../../components/buttons';
import { Thumbnail } from '../../../components/images';
import { appNavMenuVisibilityAction, updateUserAction } from '../../../actions';
import { Accordion } from 'native-base';
import ImagePicker from 'react-native-image-crop-picker';
import { logoutUser, updateProfilePicture, getPicture, getSpaceList } from '../../../api';
import { Loader } from '../../../components/loader';

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
    constructor(props) {
        super(props);
        this.state = {
            activeTab: -1,
            bikes: [10, 20, 30, 40, 50],
            isLoadingProfPic: false,
            profilePicId: props.user.profilePictureId
        };
        console.log("Version: ", Platform.Version);
    }

    componentWillMount() {
        StatusBar.setBarStyle('light-content');
    }

    componentDidMount() {
        this.props.getSpaceList(this.props.user.userId);
        if (this.props.user.profilePictureId && !this.props.user.profilePicture) {
            this.setState({ isLoadingProfPic: true });
            this.props.getUserProfilePicture(this.state.profilePicId);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.user !== this.props.user) {
            if (!prevProps.user.profilePicture || prevProps.user.profilePictureId !== this.state.profilePicId) {
                if (this.state.profilePicId.indexOf(THUMBNAIL_TAIL_TAG) > -1) {
                    setTimeout(() => {
                        this.setState(prevState => ({ profilePicId: prevState.profilePicId.replace(THUMBNAIL_TAIL_TAG, '') }), () => {
                            this.props.getUserProfilePicture(this.state.profilePicId)
                        });
                    }, 300);
                } else {
                    this.setState({ isLoadingProfPic: false });
                }
            }
        }
    }

    onSpaceLongPress = (newSpaceIndex) => {
        // TODO: Scroll to 0th index after setting active bike
    }

    renderAccordionItem = (item) => {
        if (item.title === 'Change profile') {
            return (
                <View style={styles.rowContent}>
                    {
                        item.content.map(props => <IconButton key={props.name} iconProps={props} onPress={props.onPress} />)
                    }
                </View>
            );
        } else {
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
                        data={this.props.shortSpaceList}
                        keyExtractor={(item, index) => item.spaceId}
                        renderItem={({ item, index }) => <Thumbnail horizontal={false} height={heightPercentageToDP(12)} width={widthPercentageToDP(28)} active={item.isDefault} imagePath={require('../../../assets/img/harley.jpg')} title={item.name} onLongPress={item.isDefault ? null : () => this.onSpaceLongPress(index)} />}
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
        // TODO: Store accesstoken initially while login and use it here,
        const accessToken = await AsyncStorage.getItem(USER_AUTH_TOKEN);
        this.props.logoutUser(this.props.user.userId, accessToken);
    }

    render() {
        const { user, shortSpaceList } = this.props;
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
                                    ? <Loader show={isLoadingProfPic} />
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
                    <Accordion dataArray={[{ title: 'Change profile', content: [this.PROFILE_ICONS.gallery, this.PROFILE_ICONS.camera, this.PROFILE_ICONS.passengers, this.PROFILE_ICONS.edit] },
                    { title: 'Change bike', content: [] }]}
                        renderContent={this.renderAccordionItem} headerStyle={styles.accordionHeader} />
                </ScrollView>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { shortSpaceList } = state.GarageInfo;
    return { user, shortSpaceList };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        logoutUser: (userId, accessToken) => dispatch(logoutUser(userId, accessToken)),
        getUserProfilePicture: (pictureId) => getPicture(pictureId, ({ picture }) => {
            dispatch(updateUserAction({ profilePicture: picture }))
        }, (error) => {
            dispatch(updateUserAction({}))
        }),
        getSpaceList: (userId) => dispatch(getSpaceList(userId)),
        updateProfilePicture: (profilePicStr, mimeType, userId) => dispatch(updateProfilePicture(profilePicStr, mimeType, userId)),
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
        justifyContent: 'space-around'
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