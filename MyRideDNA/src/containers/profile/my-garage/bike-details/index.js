import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, ScrollView, ImageBackground, Image, StatusBar, FlatList, Alert } from 'react-native';
import { APP_COMMON_STYLES, widthPercentageToDP, PageKeys, CUSTOM_FONTS, heightPercentageToDP, POST_TYPE, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, GET_PICTURE_BY_ID } from '../../../../constants';
import { Actions } from 'react-native-router-flux';
import { IconButton, ShifterButton, LinkButton } from '../../../../components/buttons';
import { appNavMenuVisibilityAction, updateBikePictureAction, setCurrentBikeIdAction, updateBikeListAction, updateLatestPostPictureListAction } from '../../../../actions';
import { DefaultText } from '../../../../components/labels';
import { BaseModal } from '../../../../components/modal';
import { ImageLoader } from '../../../../components/loader';
import { SmallCard } from '../../../../components/cards';
import { setBikeAsActive, deleteBike, getPicture, getPosts, getPictureList } from '../../../../api';

class BikeDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showOptionsModal: false,
            isLoadingProfPic: false,
        };
    }

    componentDidMount() {
        this.props.getPosts(this.props.user.userId, POST_TYPE.WISH_LIST, this.props.postTypes[POST_TYPE.WISH_LIST].id, this.props.bike.spaceId);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.currentBikeIndex === -1) return this.onPressBackButton();
        if (this.props.bike.picture) {
            // if (!prevProps.bike.picture || prevProps.bike.picture.id !== this.props.bike.picture.id) {
            //     this.setState({ isLoadingProfPic: true });
            //     this.props.getBikePicture(this.props.bike.picture.id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG), this.props.bike.spaceId);
            // }
            // if (this.props.bike.picture.data && this.state.isLoadingProfPic) this.setState({ isLoadingProfPic: false });
        }
        if (prevProps.bike.customizations !== this.props.bike.customizations) {
            // const myRidePicIds = this.props.bike.customizations.reduce((obj, item) => {
            //     // TODO: Have to change when API changes the pictureIds key with pictures key
            //     if (item.pictureIds && item.pictureIds[0] && !item.pictureIds[0].data) {
            //         obj[item.id] = item.pictureIds[0].id;
            //     }
            //     return obj;
            // }, {});
            // if (Object.keys(myRidePicIds).length > 0) this.props.getPostsPictures(myRidePicIds, POST_TYPE.MY_RIDE);
        }
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

    openBikeForm = () => {
        this.hideOptionsModal();
        Actions.push(PageKeys.ADD_BIKE_FORM, {});
    }

    openBikeAlbum = () => {
        Actions.push(PageKeys.BIKE_ALBUM);
    }

    makeAsActiveBike = () => {
        this.props.setBikeAsActive(this.props.user.userId, this.props.bike.spaceId, this.props.currentBikeIndex);
    }

    onPressBackButton = () => Actions.pop();

    onPressDeleteBike = () => {
        setTimeout(() => {
            Alert.alert(
                'Remove confirmation',
                `Are you sure to remove ${this.props.bike.name} from your list?`,
                [
                    {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    { text: 'Remove', onPress: () => this.props.deleteBike(this.props.user.userId, this.props.bike.spaceId, this.props.currentBikeIndex) },
                ]
            );
        }, 100);
        this.hideOptionsModal();
    }

    addStoryFromRoad = () => Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: POST_TYPE.STORIES_FROM_ROAD, currentBikeId: this.props.bike.spaceId });

    addWish = () => Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: POST_TYPE.WISH_LIST, currentBikeId: this.props.bike.spaceId });

    addMyRide = () => Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: POST_TYPE.MY_RIDE, currentBikeId: this.props.bike.spaceId });

    showOptionsModal = () => this.setState({ showOptionsModal: true });

    hideOptionsModal = () => this.setState({ showOptionsModal: false });

    openMyRidePage = () => Actions.push(PageKeys.BIKE_SPECS, { comingFrom: Actions.currentScene, postType: POST_TYPE.MY_RIDE });

    openWishListPage = () => Actions.push(PageKeys.BIKE_SPECS, { comingFrom: Actions.currentScene, postType: POST_TYPE.WISH_LIST });

    postKeyExtractor = item => item.id;

    renderSmallCard(item, postType) {
        return <SmallCard
            image={item.pictureIds && item.pictureIds[0] ? `${GET_PICTURE_BY_ID}${item.pictureIds[0].id}` : null}
            onPress={() => {
                if (postType === POST_TYPE.MY_RIDE) console.log("Open MyRide Item page for ", item);
                else if (postType === POST_TYPE.WISH_LIST) console.log("Open WisList Item page for ", item);
            }}
            imageStyle={styles.imageStyle}
        />
    }

    componentWillUnmount() {
        this.props.setCurrentBikeId(null);
    }

    render() {
        const { user, bike } = this.props;
        const { showOptionsModal, isLoadingProfPic } = this.state;
        return (
            <View style={styles.fill}>
                <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={showOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                    <View style={APP_COMMON_STYLES.optionsContainer}>
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='EDIT BIKE' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openBikeForm} />
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='DELETE BIKE' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.onPressDeleteBike} />
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='CANCEL' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.hideOptionsModal} />
                    </View>
                </BaseModal>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={styles.header}>
                    <IconButton iconProps={{ name: 'md-arrow-round-back', type: 'Ionicons', style: { fontSize: 27 } }}
                        style={styles.headerIconCont} onPress={this.onPressBackButton} />
                    <View style={styles.headingContainer}>
                        <DefaultText style={styles.heading}>
                            {user.name}
                        </DefaultText>
                        {
                            user.nickname ?
                                <DefaultText style={styles.subheading}>
                                    {user.nickname.toUpperCase()}
                                </DefaultText>
                                : null
                        }
                    </View>
                    <IconButton style={{ padding: 10 }} iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 20 } }} onPress={this.showOptionsModal} />
                </View>
                {
                    bike === null
                        ? null
                        : <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={[styles.bikePic, styles.bikeBtmBorder, bike.isDefault ? styles.activeBorder : null]}>
                                {/* TODO: Have to request portrait image here */}
                                <ImageBackground source={bike.picture && bike.picture.id ? { uri: `${GET_PICTURE_BY_ID}${bike.picture.id}` } : require('../../../../assets/img/bike_placeholder.png')} style={{ height: null, width: null, flex: 1, borderRadius: 0 }}>
                                    {
                                        isLoadingProfPic
                                            ? <ImageLoader show={isLoadingProfPic} />
                                            : null
                                    }
                                </ImageBackground>
                            </View>
                            <ImageBackground source={require('../../../../assets/img/odometer-small.png')} style={{ position: 'absolute', marginTop: styles.bikePic.height - 55.5, alignSelf: 'center', height: 111, width: 118, justifyContent: 'center' }}>
                                <DefaultText style={styles.miles}>114,526</DefaultText>
                            </ImageBackground>
                            <View style={styles.odometerLblContainer}>
                                <DefaultText style={styles.odometerLbl}>TOTAL</DefaultText>
                                <DefaultText style={styles.odometerLbl}>MILES</DefaultText>
                            </View>
                            <View style={{ marginHorizontal: 20, marginTop: 20 }}>
                                <DefaultText style={styles.title}>{bike.name}</DefaultText>
                                <DefaultText numberOfLines={1} style={styles.subtitle}>{`${bike.make || ''}${bike.model ? ' - ' + bike.model : ''} ${bike.notes || ''}`}</DefaultText>
                                {
                                    bike.isDefault
                                        ? <DefaultText style={styles.activeBikeTxt}>Active Bike</DefaultText>
                                        : <LinkButton style={styles.activeBikeBtn} title='Set as Active Bike' titleStyle={styles.activeBikeBtnTxt} onPress={this.makeAsActiveBike} />
                                }
                            </View>
                            <View style={{ marginHorizontal: 20, flex: 1 }}>
                                <View style={styles.hDivider} />
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <LinkButton style={styles.sectionLinkBtn} onPress={this.openMyRidePage}>
                                            <DefaultText style={styles.sectionLinkTxt}>My Ride</DefaultText>
                                            <DefaultText style={[styles.sectionLinkTxt, { color: APP_COMMON_STYLES.infoColor, marginLeft: 8 }]}>[see all]</DefaultText>
                                        </LinkButton>
                                        <IconButton style={styles.addBtnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: 10, color: '#fff' } }} onPress={this.addMyRide} />
                                    </View>
                                    {
                                        bike.customizations
                                            ? <FlatList
                                                style={styles.list}
                                                numColumns={4}
                                                data={bike.customizations.slice(0, 4)}
                                                keyExtractor={this.postKeyExtractor}
                                                renderItem={({ item }) => this.renderSmallCard(item, POST_TYPE.MY_RIDE)}
                                            />
                                            : null
                                    }
                                </View>
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <LinkButton style={styles.sectionLinkBtn} onPress={this.openWishListPage}>
                                            <DefaultText style={styles.sectionLinkTxt}>Wish List</DefaultText>
                                            <DefaultText style={[styles.sectionLinkTxt, { color: APP_COMMON_STYLES.infoColor, marginLeft: 8 }]}>[see all]</DefaultText>
                                        </LinkButton>
                                        <IconButton style={styles.addBtnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: 10, color: '#fff' } }} onPress={this.addWish} />
                                    </View>
                                    {
                                        bike.wishList
                                            ? <FlatList
                                                style={styles.list}
                                                numColumns={4}
                                                data={bike.wishList.slice(0, 4)}
                                                keyExtractor={this.postKeyExtractor}
                                                renderItem={({ item }) => this.renderSmallCard(item, POST_TYPE.WISH_LIST)}
                                            />
                                            : null
                                    }
                                </View>
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <LinkButton style={styles.sectionLinkBtn}>
                                            <DefaultText style={styles.sectionLinkTxt}>Logged Rides</DefaultText>
                                            <DefaultText style={[styles.sectionLinkTxt, { color: APP_COMMON_STYLES.infoColor, marginLeft: 8 }]}>[see all]</DefaultText>
                                        </LinkButton>
                                        <IconButton style={styles.addBtnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: 10, color: '#fff' } }} onPress={() => null} />
                                    </View>
                                    <FlatList style={styles.list} />
                                </View>
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <LinkButton style={styles.sectionLinkBtn}>
                                            <DefaultText style={styles.sectionLinkTxt}>Stories from the Road</DefaultText>
                                            <DefaultText style={[styles.sectionLinkTxt, { color: APP_COMMON_STYLES.infoColor, marginLeft: 8 }]}>[see all]</DefaultText>
                                        </LinkButton>
                                        <IconButton style={styles.addBtnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: 10, color: '#fff' } }} onPress={this.addStoryFromRoad} />
                                    </View>
                                    <View style={styles.greyBorder} />
                                </View>
                            </View>
                            <LinkButton style={styles.fullWidthImgLink} onPress={this.openBikeAlbum}>
                                <ImageBackground source={require('../../../../assets/img/my-photos.png')} style={styles.imgBG}>
                                    <DefaultText style={styles.txtOnImg}>Photos</DefaultText>
                                </ImageBackground>
                            </LinkButton>
                        </ScrollView>
                }
                {/* Shifter: - Brings the app navigation menu */}
                <ShifterButton onPress={this.showAppNavMenu} size={18} alignLeft={this.props.user.handDominance === 'left'} />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { postTypes, hasNetwork } = state.PageState;
    const { currentBikeId, activeBikeIndex } = state.GarageInfo;
    const currentBikeIndex = state.GarageInfo.spaceList.findIndex(({ spaceId }) => spaceId === currentBikeId);
    const bike = currentBikeIndex === -1 ? null : state.GarageInfo.spaceList[currentBikeIndex];
    return { user, postTypes, hasNetwork, bike, activeBikeIndex, currentBikeIndex };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        setBikeAsActive: (userId, spaceId, index) => dispatch(setBikeAsActive(userId, spaceId, index)),
        deleteBike: (userId, bikeId, index) => dispatch(deleteBike(userId, bikeId, index)),
        // getBikePicture: (pictureId, spaceId) => getPicture(pictureId, (response) => {
        //     dispatch(updateBikePictureAction({ spaceId, picture: response.picture }))
        // }, (error) => console.log("getPicture error: ", error)),
        setCurrentBikeId: (bikeId) => dispatch(setCurrentBikeIdAction(bikeId)),
        getPosts: (userId, postType, postTypeId, spaceId, successCallback, errorCallback) => dispatch(getPosts(userId, postTypeId, spaceId, (res) => {
            if (typeof successCallback === 'function') successCallback(res);
            switch (postType) {
                case POST_TYPE.WISH_LIST:
                    dispatch(updateBikeListAction({ wishList: res }));
                    break;
                case POST_TYPE.MY_RIDE:
                    dispatch(updateBikeListAction({ customizations: res }));
                    break;
                case POST_TYPE.STORIES_FROM_ROAD:
                    break;
                case POST_TYPE.LOGGED_RIDES:
                    break;
            }
        }, (err) => {
            if (typeof errorCallback === 'function') errorCallback(err);
        })),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(BikeDetails);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff',
    },
    pageContent: {

    },
    header: {
        height: APP_COMMON_STYLES.headerHeight,
        backgroundColor: APP_COMMON_STYLES.headerColor,
        flexDirection: 'row',
        elevation: 30,
        shadowOffset: { width: 0, height: 8 },
        shadowColor: '#000000',
        shadowOpacity: 0.9,
        shadowRadius: 5,
        zIndex: 999,
        paddingLeft: 17,
        paddingRight: 25
    },
    headerIconCont: {
        paddingHorizontal: 0,
        width: widthPercentageToDP(9),
        height: widthPercentageToDP(9),
        borderRadius: widthPercentageToDP(9) / 2,
        backgroundColor: '#fff',
        alignSelf: 'center',
    },
    headingContainer: {
        flex: 1,
        marginLeft: 17,
        justifyContent: 'center',
        alignSelf: 'center'
    },
    heading: {
        fontSize: 20,
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: CUSTOM_FONTS.gothamBold,
        letterSpacing: 0.2
    },
    subheading: {
        color: '#C4C4C4',
        fontFamily: CUSTOM_FONTS.gothamBold,
        letterSpacing: 1.08
    },
    rightIconPropsStyle: {
        height: widthPercentageToDP(7),
        width: widthPercentageToDP(7),
        backgroundColor: '#F5891F',
        borderRadius: widthPercentageToDP(3.5),
        marginRight: 17,
        alignSelf: 'center'
    },
    imgContainer: {
        width: widthPercentageToDP(100),
        height: 175,
        borderBottomWidth: 4
    },
    bikePic: {
        height: 232,
        width: widthPercentageToDP(100),
    },
    bikeBtmBorder: {
        borderBottomWidth: 4,
        borderBottomColor: APP_COMMON_STYLES.headerColor
    },
    activeBorder: {
        borderBottomColor: APP_COMMON_STYLES.infoColor
    },
    activeIndicator: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: APP_COMMON_STYLES.infoColor
    },
    odometerLblContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 5
    },
    odometerLbl: {
        color: '#6E6E6E',
        letterSpacing: 2.2,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        marginHorizontal: 72
    },
    title: {
        marginTop: 25,
        fontSize: 19,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    subtitle: {
        marginTop: 5,
    },
    activeBikeTxt: {
        marginTop: 16,
        color: '#fff',
        letterSpacing: 0.6,
        fontSize: 12,
        backgroundColor: APP_COMMON_STYLES.infoColor,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: widthPercentageToDP(3.5),
        alignSelf: 'flex-start',
        overflow: 'hidden'
    },
    activeBikeBtnTxt: {
        color: '#585756',
        letterSpacing: 0.6
    },
    activeBikeBtn: {
        marginTop: 16,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 50,
        borderWidth: 1.2,
        borderColor: APP_COMMON_STYLES.infoColor,
        alignSelf: 'flex-start'
    },
    miles: {
        letterSpacing: 0.3,
        textAlign: 'center',
        color: '#fff',
        fontSize: 22,
        fontFamily: CUSTOM_FONTS.dinCondensedBold
    },
    list: {
        borderTopWidth: 13,
        borderTopColor: '#DCDCDE',
        flexGrow: 0
    },
    sectionLinkBtn: {
        paddingHorizontal: 0,
        flexDirection: 'row'
    },
    sectionLinkTxt: {
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        fontSize: 12,
        paddingBottom: 7,
        letterSpacing: 1.8
    },
    addBtnCont: {
        height: 14,
        width: 14,
        borderRadius: 7,
        backgroundColor: '#a8a8a8',
        marginRight: 10
    },
    section: {
        marginTop: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    greyBorder: {
        borderTopWidth: 13,
        borderTopColor: '#DCDCDE',
    },
    fullWidthImgLink: {
        flex: 1,
        paddingHorizontal: 0,
        marginTop: 20,
        borderTopWidth: 9,
        borderTopColor: '#f69039',
        elevation: 20,
        height: heightPercentageToDP(30)
    },
    imgBG: {
        flex: 1,
        height: null,
        width: null,
        justifyContent: 'center',
        paddingLeft: 20
    },
    txtOnImg: {
        color: '#fff',
        fontSize: 18,
        letterSpacing: 2.7,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
    },
    hDivider: {
        backgroundColor: '#B1B1B1',
        height: 1.5,
        marginTop: 8
    },
});