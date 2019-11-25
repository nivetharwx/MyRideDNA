import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, StatusBar, ScrollView, View, Keyboard, Alert, TextInput, FlatList } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { BasicHeader } from '../../components/headers';
import ImagePicker from 'react-native-image-crop-picker';
import { DefaultText } from '../../components/labels';
import { APP_COMMON_STYLES, PageKeys, CUSTOM_FONTS, heightPercentageToDP, widthPercentageToDP } from '../../constants';
import { ImageButton, ShifterButton } from '../../components/buttons';
import { appNavMenuVisibilityAction } from '../../actions';
import { IconicList } from '../../components/inputs';
import { Icon as NBIcon } from 'native-base';

const CONTAINER_H_SPACE = 6;

class PostForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedBike: ''
        };
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
                cropping: false, // DOC: Setting this to true (in openCamera) is not working as expected (19-12-2018).
            });
            this.setState(prevState => ({ selectedImgs: imgs }));
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
                includeBase64: true,
            });
            this.setState(prevState => ({ selectedImgs: imgs }));
        } catch (er) {
            console.log("Error occurd: ", er);
        }
    }

    onChangeBike = (val) => this.setState({ selectedBike: val });

    render() {
        const { user, comingFrom, bikeList } = this.props;
        const { selectedBike } = this.state;
        const BIKE_LIST = bikeList.map(bike => ({ label: bike.name, value: bike.spaceId }));
        return <View style={styles.fill}>
            <View style={APP_COMMON_STYLES.statusBar}>
                <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
            </View>
            <View style={styles.fill}>
                <BasicHeader title={'New Post'} leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }} />
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled' contentContainerStyle={styles.scrollView}>
                    <View style={styles.btnContainer}>
                        {/* TODO: Images below has to be changed with proper color (Need to get from the Platypus) */}
                        <View style={styles.galleryBtnContainer}>
                            <ImageButton onPress={this.onPressCameraIcon} imageSrc={require('../../assets/img/cam-icon.png')} imgStyles={{ width: 45, height: 37 }} />
                            <DefaultText style={styles.galleryLabel}>{' TAKE \nPHOTO'}</DefaultText>
                        </View>
                        <View style={styles.galleryBtnContainer}>
                            <ImageButton onPress={this.onPressGalleryIcon} imageSrc={require('../../assets/img/photos-icon.png')} imgStyles={{ width: 41, height: 33 }} />
                            <DefaultText style={styles.galleryLabel}>{'UPLOAD \n PHOTO'}</DefaultText>
                        </View>
                    </View>
                    <View style={styles.rootContainer}>
                        {
                            comingFrom === PageKeys.ALBUM
                                ? <View>
                                    <DefaultText style={{ color: APP_COMMON_STYLES.infoColor, fontFamily: CUSTOM_FONTS.robotoSlabBold, letterSpacing: 1.2 }}>POST TITLE</DefaultText>
                                    <TextInput placeholde='Write a caption' placeholderTextColor='#000000' style={{ fontSize: 13 }} />
                                </View>
                                : null
                        }
                        <View style={styles.fill}>

                        </View>
                        <View style={styles.btmContainer}>
                            <IconicList
                                selectedValue={selectedBike}
                                dropdownIcon={<NBIcon name='caret-down' type='FontAwesome' style={{ color: APP_COMMON_STYLES.infoColor, height: 26, marginRight: 0 }} />}
                                placeholder='SELECT A BIKE'
                                placeholderStyle={{ fontFamily: CUSTOM_FONTS.robotoSlabBold, fontSize: 12, top: 3 }}
                                textStyle={{ top: 3, fontFamily: CUSTOM_FONTS.robotoSlabBold, color: '#585756', fontSize: 12 }}
                                pickerStyle={{ borderRadius: 50, borderWidth: 1, borderColor: '#B2B2B2', height: 26, paddingHorizontal: 10, width: widthPercentageToDP(100 - CONTAINER_H_SPACE * 2) }}
                                values={BIKE_LIST}
                                onChange={this.onChangeBike} />
                        </View>
                    </View>
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
        marginHorizontal: widthPercentageToDP(CONTAINER_H_SPACE),
        marginTop: 22
    },
    btmContainer: {

    }
});