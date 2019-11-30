import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, StatusBar, ScrollView, View, ImageBackground, Alert, TextInput, FlatList } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { BasicHeader } from '../../components/headers';
import ImagePicker from 'react-native-image-crop-picker';
import { DefaultText } from '../../components/labels';
import { APP_COMMON_STYLES, PageKeys, CUSTOM_FONTS, heightPercentageToDP, widthPercentageToDP, POST_TYPE } from '../../constants';
import { ImageButton, ShifterButton, SwitchIconButton, IconButton, LinkButton, BasicButton } from '../../components/buttons';
import { appNavMenuVisibilityAction } from '../../actions';
import { IconicList } from '../../components/inputs';
import { Icon as NBIcon, Thumbnail } from 'native-base';
import { addPicturesToBike } from '../../api';

const CONTAINER_H_SPACE = widthPercentageToDP(6);

class PostForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedBike: props.activeBike || null,
            isPrivate: true,
            selectedImgs: [],
            title: '',
            caption: '',
        };
    }

    componentDidMount() {
        if (this.state.selectedBike === null && this.props.bikeList.length > 0) {
            this.setState({ selectedBike: this.props.bikeList[0].spaceId });
        }
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

    onPressBackButton = () => Actions.pop();

    onPressCameraIcon = async () => {
        try {
            const imgs = await ImagePicker.openCamera({
                width: 300,
                height: 300,
                includeBase64: true,
                multiple: true,
                maxFiles: 5,
                cropping: false, // DOC: Setting this to true (in openCamera) is not working as expected (19-12-2018).
            });
            this.setState({ selectedImgs: imgs.slice(0, 5).map(item => ({ mimeType: item.mime, picture: item.data })) });
        } catch (er) {
            console.log("Error occurd: ", er);
        }
    }

    onPressGalleryIcon = async () => {
        try {
            const imgs = await ImagePicker.openPicker({
                width: 300,
                height: 300,
                cropping: false,
                multiple: true,
                maxFiles: 5,
                includeBase64: true,
            });
            this.setState({ selectedImgs: imgs.slice(0, 5).map(item => ({ mimeType: item.mime, picture: item.data })) });
        } catch (er) {
            console.log("Error occurd: ", er);
        }
    }

    onChangeBike = (val) => this.setState({ selectedBike: val });

    onChangePrivacyMode = (val) => this.setState({ isPrivate: val });
    
    onChangeTitle = (val) => this.setState({ title: val });

    onChangeCaption = (val) => this.setState({ caption: val });

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
        // return <View style={styles.thumbnailContainer}>
        //     <Thumbnail source={{ uri: `data:${item.mime};base64,${item.data}` }} style={styles.thumbnail} />
        //     <IconButton style={styles.closeIconContainer} iconProps={{ name: 'close', type: 'Ionicons', style: styles.closeIcon }} onPress={() => this.unselectImg(index)} />
        // </View>
    }

    onSubmit = () => {
        if (postType !== POST_TYPE.IMAGE_UPLOAD) {
            const bike = this.props.bikeList.find(bike => bike.spaceId === this.selectedBike);
            this.props.addPicturesToBike(this.props.useruserId, bike, this.state.selectedImgs, this.state.isPrivate);
        }
    }

    render() {
        const { user, bikeList, activeBike, postType } = this.props;
        const { selectedBike, isPrivate, selectedImgs, title, caption } = this.state;
        const BIKE_LIST = bikeList.map(bike => ({ label: bike.name, value: bike.spaceId }));
        return <View style={styles.fill}>
            <View style={APP_COMMON_STYLES.statusBar}>
                <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
            </View>
            <View style={styles.fill}>
                <BasicHeader title={postType === POST_TYPE.IMAGE_UPLOAD ? 'Upload Image' : 'New Post'} leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }} />
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled' contentContainerStyle={styles.scrollView}>
                    <View style={styles.btnContainer}>
                        {/* TODO: Images below has to be changed with proper color (Need to get from the Platypus) */}
                        <View style={styles.galleryBtnContainer}>
                            <ImageButton onPress={this.onPressCameraIcon} imageSrc={require('../../assets/img/cam-icon-gray.png')} imgStyles={{ width: 45, height: 37 }} />
                            <DefaultText style={styles.galleryLabel}>{' TAKE \nPHOTO'}</DefaultText>
                        </View>
                        <View style={styles.galleryBtnContainer}>
                            <ImageButton onPress={this.onPressGalleryIcon} imageSrc={require('../../assets/img/photos-icon-gray.png')} imgStyles={{ width: 41, height: 33 }} />
                            <DefaultText style={styles.galleryLabel}>{'UPLOAD \n PHOTO'}</DefaultText>
                        </View>
                    </View>
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
                        {
                            postType === POST_TYPE.IMAGE_UPLOAD
                                ? <View style={styles.fill}>
                                    {/* <DefaultText style={styles.postTitle}>POST TITLE</DefaultText> */}
                                    <TextInput value={title} placeholder='POST TITLE' placeholderTextColor={APP_COMMON_STYLES.infoColor} style={styles.postTitle} autoCapitalize='characters' onChangeText={this.onChangeTitle} />
                                    <TextInput value={caption} placeholder='Write a caption' placeholderTextColor='#707070' multiline={true} style={styles.descrArea} onChangeText={this.onChangeCaption} />
                                </View>
                                : null
                        }
                    </View>
                    <View style={styles.btmContainer}>
                        <IconicList
                            disabled={typeof activeBike !== 'undefined'}
                            selectedValue={selectedBike}
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
                    <BasicButton title={postType === POST_TYPE.IMAGE_UPLOAD ? 'SUBMIT' : 'POST'} style={styles.submitBtn} titleStyle={styles.submitBtnTxt} onPress={this.onSubmit} />
                </ScrollView>
                {/* Shifter: - Brings the app navigation menu */}
                <ShifterButton onPress={this.showAppNavMenu} alignLeft={user.handDominance === 'left'} />
            </View>
        </View>
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { spaceList: bikeList } = state.GarageInfo;
    return { user, bikeList };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        addPicturesToBike: (userId, bike, pictureList, isPrivate) => dispatch(addPicturesToBike(userId, bike, pictureList, isPrivate))
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
    }
});