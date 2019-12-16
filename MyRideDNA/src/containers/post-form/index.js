import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, StatusBar, ScrollView, View, ImageBackground, Alert, TextInput, FlatList } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { BasicHeader } from '../../components/headers';
import ImagePicker from 'react-native-image-crop-picker';
import { DefaultText } from '../../components/labels';
import { APP_COMMON_STYLES, PageKeys, CUSTOM_FONTS, heightPercentageToDP, widthPercentageToDP, POST_TYPE, IS_ANDROID, USER_BASE_URL } from '../../constants';
import { ImageButton, ShifterButton, SwitchIconButton, IconButton, LinkButton, BasicButton } from '../../components/buttons';
import { appNavMenuVisibilityAction, updatePageContentStatusAction } from '../../actions';
import { IconicList, LabeledInputPlaceholder } from '../../components/inputs';
import { Icon as NBIcon, Thumbnail, Toast } from 'native-base';
import { createPost, getSpaces } from '../../api';
import { Loader } from '../../components/loader';

const CONTAINER_H_SPACE = widthPercentageToDP(6);

class PostForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedBikeId: props.currentBikeId || null,
            isPrivate: (props.postType === POST_TYPE.WISH_LIST || props.postType === POST_TYPE.MY_RIDE) ? false : true,
            selectedImgs: [],
            title: '',
            description: '',
            bikeList: [],
            isLoadingImage: false,
        };
    }

    componentDidMount() {
        if (this.props.bike === null) {
            getSpaces(this.props.user.userId, (bikeList) => {
                this.setState({ bikeList }, () => {
                    if (this.state.selectedBikeId === null) {
                        this.setState({ selectedBikeId: this.state.bikeList[0].spaceId });
                    }
                });
            }, (er) => console.log(er));
        }
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

    onPressBackButton = () => Actions.pop();

    onPressCameraIcon = async () => {
        try {
            this.setState({ isLoadingImage: true });
            const imgs = await ImagePicker.openCamera({
                width: 300,
                height: 300,
                includeBase64: true,
                multiple: true,
                maxFiles: 5,
                cropping: false, // DOC: Setting this to true (in openCamera) is not working as expected (19-12-2018).
            });
            this.setState({ isLoadingImage: false, selectedImgs: imgs.slice(0, 5).map(item => ({ mimeType: item.mime, picture: item.data })) });
        } catch (er) {
            this.setState({ isLoadingImage: false });
            console.log("Error occurd: ", er);
        }
    }

    onPressGalleryIcon = async () => {
        try {
            this.setState({ isLoadingImage: true });
            const imgs = await ImagePicker.openPicker({
                width: 300,
                height: 300,
                cropping: false,
                multiple: true,
                maxFiles: 5,
                includeBase64: true,
            });
            this.setState({ isLoadingImage: false, selectedImgs: imgs.slice(0, 5).map(item => ({ mimeType: item.mime, picture: item.data, path: item.path })) });
        } catch (er) {
            this.setState({ isLoadingImage: false });
            console.log("Error occurd: ", er);
        }
    }

    onChangeBike = (val) => this.setState({ selectedBikeId: val });

    onChangePrivacyMode = (val) => this.setState({ isPrivate: val });

    onChangeTitle = (val) => this.setState({ title: val });

    onChangeDescription = (val) => this.setState({ description: val });

    imgKeyExtractor = (item) => item.localIdentifier;

    unselectImg = (idx) => this.setState(prevState => {
        return {
            selectedImgs: [
                ...prevState.selectedImgs.slice(0, idx),
                { ...prevState.selectedImgs.slice(idx), isHidden: true },
                ...prevState.selectedImgs.slice(idx + 1)
            ]
        }
    });

    renderSelectedImg = ({ item, index }) => {
        return <View style={[styles.thumbnailContainer, item.isHidden ? { display: 'none' } : null]}>
            <ImageBackground source={{ uri: `data:${item.mimeType};base64,${item.picture}` }} style={styles.thumbnail}>
                <IconButton style={styles.closeIconContainer} iconProps={{ name: 'close', type: 'Ionicons', style: styles.closeIcon }} onPress={() => this.unselectImg(index)} />
            </ImageBackground>
        </View>
    }

    onSubmit = () => {
        const { postType, postTypes, currentBikeId, user, bike, comingFrom } = this.props;
        const { bikeList, title, description, selectedImgs, isPrivate, selectedBikeId } = this.state;

        if (selectedImgs.length > 0 || title || description) {
            const postProps = { title, description, isPrivate, postTypeId: postTypes[postType].id, pictures: selectedImgs };
            this.props.createPost(user.userId, selectedBikeId, postType, postProps, this.onPressBackButton);
        } else {
            Alert.alert('Please check the fields', 'Please select any image or enter title/description');
        }
        // this.props.createPost(user.userId, selectedBikeId, postType, postProps, () => {
        //     const selBike = bike ? bike.spaceId : bikeList.length > 0 ? bikeList[0].spaceId : null;
        //     this.setState({ title: '', description: '', selectedImgs: [], selectedBikeId: selBike, isPrivate: (postType === POST_TYPE.WISH_LIST || postType === POST_TYPE.MY_RIDE) ? false : true });
        // });
        // let formdata = new FormData();
        // formdata.append("picture", {
        //     uri: selectedImgs[0].path,
        //     type: selectedImgs[0].mimeType,
        // });
        // axios.put(`${USER_BASE_URL}updateProfilePictureMutliPart?userId=${user.userId}`, formdata)
        //     .then(res => console.log(res)).catch(er => console.log(er));
    }

    renderHeader = () => {
        let title = '';
        switch (this.props.postType) {
            case POST_TYPE.WISH_LIST:
                title = 'Add to Wish List';
                break;
            case POST_TYPE.MY_RIDE:
                title = 'Add to My Ride';
                break;
            default:
                title = 'New Post';
        }
        return <BasicHeader style={{ top: APP_COMMON_STYLES.statusBar.height }} title={title} leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }} />
    }

    renderFormFields = () => {
        const { selectedImgs, title, description, selectedBikeId, isPrivate, bikeList, isLoadingImage } = this.state;
        const { currentBikeId, bike } = this.props;
        const BIKE_LIST = [];
        if (!bike) {
            bikeList.forEach(bike => BIKE_LIST.push({ label: bike.name, value: bike.spaceId }));
        } else {
            BIKE_LIST.push({ label: bike.name, value: bike.spaceId });
        }
        if (this.props.postType === POST_TYPE.WISH_LIST || this.props.postType === POST_TYPE.MY_RIDE) {
            return <View style={styles.fill}>
                <View style={{ marginHorizontal: CONTAINER_H_SPACE }}>
                    {
                        selectedImgs.filter(item => item.isHidden).length !== selectedImgs.length
                            ? <FlatList
                                style={styles.listStyles}
                                numColumns={5}
                                columnWrapperStyle={styles.imgPreviewArea}
                                data={selectedImgs}
                                keyExtractor={this.imgKeyExtractor}
                                renderItem={this.renderSelectedImg}
                            />
                            : null
                    }
                </View>
                <View style={{ flex: 1, marginLeft: widthPercentageToDP(12) }}>
                    <LabeledInputPlaceholder
                        inputValue={title} inputStyle={{ paddingBottom: 0 }}
                        outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                        returnKeyType='next'
                        onChange={this.onChangeTitle} label='ITEM NAME' labelStyle={styles.labelStyle}
                        hideKeyboardOnSubmit={false} />
                    <LabeledInputPlaceholder
                        inputValue={description}
                        inputStyle={{ paddingBottom: 0 }}
                        multiline={true}
                        outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                        returnKeyType='next'
                        onChange={this.onChangeDescription} label='ADDITIONAL INFO' labelStyle={styles.labelStyle}
                        hideKeyboardOnSubmit={true} />
                </View>
                <BasicButton disabled={isLoadingImage} title='ADD ITEM' style={styles.submitBtn} titleStyle={styles.submitBtnTxt} onPress={this.onSubmit} />
            </View>
        }
        return <View style={styles.fill}>
            <View style={styles.rootContainer}>
                {
                    selectedImgs.filter(item => item.isHidden).length !== selectedImgs.length
                        ? <FlatList
                            style={styles.listStyles}
                            numColumns={5}
                            columnWrapperStyle={styles.imgPreviewArea}
                            data={selectedImgs}
                            keyExtractor={this.imgKeyExtractor}
                            renderItem={this.renderSelectedImg}
                        />
                        : null
                }
                <View style={styles.fill}>
                    <TextInput value={title} placeholder='POST TITLE' placeholderTextColor={APP_COMMON_STYLES.infoColor} style={styles.postTitle} autoCapitalize='characters' onChangeText={this.onChangeTitle} />
                    <TextInput value={description} placeholder='Write a caption' placeholderTextColor='#707070' multiline={true} style={styles.descrArea} onChangeText={this.onChangeDescription} />
                </View>
            </View>
            <View style={styles.btmContainer}>
                <IconicList
                    disabled={typeof currentBikeId !== 'undefined' || BIKE_LIST.length === 0}
                    selectedValue={selectedBikeId}
                    dropdownIcon={<NBIcon name='caret-down' type='FontAwesome' style={styles.dropdownIcon} />}
                    placeholder='SELECT A BIKE'
                    placeholderStyle={styles.dropdownPlaceholderTxt}
                    textStyle={styles.dropdownTxt}
                    pickerStyle={styles.dropdownStyle}
                    values={BIKE_LIST}
                    onChange={this.onChangeBike} />
                <View style={styles.hDivider} />
                <View style={styles.switchBtnContainer}>
                    <DefaultText style={styles.switchBtnLbl}>{isPrivate ? 'PRIVATE' : 'PUBLIC'}</DefaultText>
                    <SwitchIconButton
                        activeIcon={<NBIcon name='close' type='FontAwesome' style={[styles.switchIcon, { alignSelf: 'flex-start' }]} />}
                        inactiveIcon={<NBIcon name='eye' type='MaterialCommunityIcons' style={[styles.switchIcon, { alignSelf: 'flex-end' }]} />}
                        value={isPrivate} onChangeValue={this.onChangePrivacyMode} />
                </View>
            </View>
            <BasicButton disabled={isLoadingImage} title='POST' style={styles.submitBtn} titleStyle={styles.submitBtnTxt} onPress={this.onSubmit} />
        </View>
    }

    render() {
        const { user, currentBikeId, postType, showLoader } = this.props;
        const { selectedBikeId, isPrivate, selectedImgs, title, description, bikeList } = this.state;
        return <View style={styles.fill}>
            <View style={APP_COMMON_STYLES.statusBar}>
                <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
            </View>
            {this.renderHeader()}
            <ScrollView style={{ backgroundColor: '#fff' }} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
                <View style={[styles.btnContainer, postType === POST_TYPE.MY_RIDE || postType === POST_TYPE.WISH_LIST ? { backgroundColor: '#fff' } : null]}>
                    {/* TODO: Images below has to be changed with proper color (Need to get from the Platypus) */}
                    <View style={styles.galleryBtnContainer}>
                        <ImageButton onPress={this.onPressCameraIcon} imageSrc={postType !== POST_TYPE.MY_RIDE && postType !== POST_TYPE.WISH_LIST ? require('../../assets/img/cam-icon-gray.png') : require('../../assets/img/cam-icon.png')} imgStyles={{ width: 45, height: 37 }} />
                        <DefaultText style={styles.galleryLabel}>{' TAKE \nPHOTO'}</DefaultText>
                    </View>
                    <View style={styles.galleryBtnContainer}>
                        <ImageButton onPress={this.onPressGalleryIcon} imageSrc={postType !== POST_TYPE.MY_RIDE && postType !== POST_TYPE.WISH_LIST ? require('../../assets/img/photos-icon-gray.png') : require('../../assets/img/photos-icon.png')} imgStyles={{ width: 41, height: 33 }} />
                        <DefaultText style={styles.galleryLabel}>{'UPLOAD \n PHOTO'}</DefaultText>
                    </View>
                </View>
                {
                    this.renderFormFields()
                }
            </ScrollView>
            <Loader isVisible={showLoader} />
            {/* Shifter: - Brings the app navigation menu */}
            <ShifterButton onPress={this.showAppNavMenu} alignLeft={user.handDominance === 'left'} />
        </View>
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { postTypes, showLoader } = state.PageState;
    const { currentBike: bike } = state.GarageInfo;
    return { user, postTypes, showLoader, bike };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        createPost: (userId, spaceId, postType, postData, successCallback, errorCallback) => dispatch(createPost(userId, spaceId, postData, (res) => {
            dispatch(updatePageContentStatusAction({ type: postType }));
            typeof successCallback === 'function' && successCallback(res);
        }, errorCallback)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(PostForm);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
    },
    galleryLabel: {
        letterSpacing: 2,
        marginTop: 15,
        fontFamily: CUSTOM_FONTS.robotoSlabBold
    },
    galleryBtnContainer: {
        alignSelf: 'center',
        alignItems: 'center'
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginTop: APP_COMMON_STYLES.headerHeight,
        backgroundColor: '#C4C6C8',
        height: heightPercentageToDP(30)
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#ffffff'
    },
    rootContainer: {
        flex: 1,
        marginHorizontal: CONTAINER_H_SPACE,
        marginTop: 10
    },
    btmContainer: {
        marginBottom: 50,
    },
    thumbnailContainer: {
        alignSelf: 'flex-start',
        width: 50,
        height: 50,
        marginRight: (widthPercentageToDP(100) - (CONTAINER_H_SPACE * 2) - (5 * 50) - 5) / 4
    },
    thumbnail: {
        flex: 1,
        width: null,
        height: null,
        alignItems: 'flex-end'
    },
    closeIconContainer: {
        height: 18,
        width: 18,
        borderRadius: 18,
        backgroundColor: '#F5891F',
        top: -5,
        right: -5
    },
    closeIcon: {
        fontSize: 19,
        color: '#fff'
    },
    imgPreviewArea: {
        flex: 1,
        paddingVertical: 10,
        paddingRight: 5
    },
    listStyles: {
        flexGrow: 0
    },
    hDivider: {
        backgroundColor: '#C4C6C8',
        marginTop: 10,
        height: 1.5
    },
    dropdownStyle: {
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#B2B2B2',
        height: 26,
        paddingHorizontal: 10,
        width: widthPercentageToDP(100) - CONTAINER_H_SPACE * 2,
        marginHorizontal: CONTAINER_H_SPACE
    },
    dropdownTxt: {
        top: 3,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        color: '#585756',
        fontSize: 12
    },
    dropdownPlaceholderTxt: {
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        fontSize: 12,
        top: 3
    },
    switchBtnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: widthPercentageToDP(4),
        marginHorizontal: CONTAINER_H_SPACE
    },
    switchBtnLbl: {
        alignSelf: 'center',
        letterSpacing: 1,
        color: '#585756',
        fontFamily: CUSTOM_FONTS.robotoSlabBold
    },
    switchIcon: {
        color: '#fff',
        paddingHorizontal: 10,
        fontSize: widthPercentageToDP(6)
    },
    dropdownIcon: {
        color: APP_COMMON_STYLES.infoColor,
        height: 26,
        marginRight: 0
    },
    postTitle: {
        fontSize: 13,
        color: APP_COMMON_STYLES.infoColor,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 1.2
    },
    descrArea: {
        fontSize: 13,
        marginVertical: 5
    },
    submitBtn: {
        height: heightPercentageToDP(9),
        backgroundColor: APP_COMMON_STYLES.infoColor
    },
    submitBtnTxt: {
        letterSpacing: 2,
        fontSize: 20,
        fontFamily: CUSTOM_FONTS.robotoSlabBold
    },
    labelStyle: {
        fontSize: 11,
        letterSpacing: 1.1,
        fontFamily: CUSTOM_FONTS.robotoSlabBold
    }
});