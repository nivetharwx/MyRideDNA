import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, StatusBar, ScrollView, View, Keyboard, Alert, KeyboardAvoidingView, ImageBackground } from 'react-native';
import { BasicHeader } from '../../../../components/headers';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, CUSTOM_FONTS } from '../../../../constants';
import { Actions } from 'react-native-router-flux';
import { LabeledInput, LabeledInputPlaceholder, IconicList, IconicDatePicker } from '../../../../components/inputs';
import { BasicButton, ShifterButton, ImageButton, IconButton } from '../../../../components/buttons';
import { Thumbnail } from '../../../../components/images';
import ImagePicker from 'react-native-image-crop-picker';
import { addBikeToGarage, editBike } from '../../../../api';
import { toggleLoaderAction, appNavMenuVisibilityAction } from '../../../../actions';
import { Loader } from '../../../../components/loader';
import { DefaultText } from '../../../../components/labels';

class AddBikeForm extends Component {
    fieldRefs = [];
    constructor(props) {
        super(props);
        this.state = {
            bikeImages: [],
            bike: { ...props.bike },
            showLoader: false
        };
        if (typeof this.state.bike.pictures === 'undefined') {
            this.state.bike.pictures = [];
        }
    }

    componentDidUpdate(prevProps, prevState) { }

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
            this.setState({ bikeImages: imgs.slice(0, 5).map(({ mime, data }) => ({ mimeType: mime, picture: data })) });
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
            this.setState({ bikeImages: imgs.slice(0, 5).map(({ mime, data }) => ({ mimeType: mime, picture: data })) });
        } catch (er) {
            console.log("Error occurd: ", er);
        }
    }

    onChangeNickname = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, name: val + '' } }));

    onChangeMake = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, make: val } }));

    onChangeModel = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, model: val } }));

    onChangeYear = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, year: val } }));

    onChangeMilage = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, milage: val } }));

    onChangeNotes = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, notes: val } }));

    hideLoader = () => this.setState({ showLoader: false });

    onPressBackArrow = () => Actions.pop();

    showAppNavMenu = () => this.props.showAppNavMenu();

    onSubmit = () => {
        Keyboard.dismiss();
        const { bike, bikeImages } = this.state;
        if (!bike.name || bike.name.trim().length === 0) {
            Alert.alert('Field Error', 'Please enter a bike name');
            return;
        }
        const pictures = [...bikeImages];
        if (!bike.spaceId) {
            this.setState({ showLoader: true });
            this.props.addBikeToGarage(this.props.user.userId, bike, pictures, () => {
                this.hideLoader();
                this.onPressBackArrow();
            }, this.hideLoader);
        } else {
            this.setState({ showLoader: true });
            this.props.editBike(this.props.user.userId, bike, pictures, this.props.currentBikeIndex, () => {
                this.hideLoader();
                this.onPressBackArrow();
            }, this.hideLoader);
        }
    }

    render() {
        const { bike, showLoader } = this.state;
        const { currentBikeIndex, user } = this.props;
        return (
            <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <KeyboardAvoidingView behavior={IS_ANDROID ? null : 'padding'} style={styles.fill}>
                    <BasicHeader title={currentBikeIndex === -1 ? 'Add Bike' : 'Edit Bike'} leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackArrow }} />
                    <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={{ marginTop: 41 + APP_COMMON_STYLES.headerHeight }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                            <View style={{ alignSelf: 'center', alignItems: 'center' }}>
                                <ImageButton onPress={this.onPressCameraIcon} imageSrc={require('../../../../assets/img/cam-icon.png')} imgStyles={{ width: 45, height: 37 }} />
                                <DefaultText style={{ letterSpacing: 1.8, marginTop: 15, fontFamily: CUSTOM_FONTS.robotoSlabBold }}>{' TAKE \nPHOTO'}</DefaultText>
                            </View>
                            <View style={{ alignSelf: 'center', alignItems: 'center' }}>
                                <ImageButton onPress={this.onPressGalleryIcon} imageSrc={require('../../../../assets/img/photos-icon.png')} imgStyles={{ width: 41, height: 33 }} />
                                <DefaultText style={{ letterSpacing: 2, marginTop: 15, fontFamily: CUSTOM_FONTS.robotoSlabBold }}>{'UPLOAD \n PHOTO'}</DefaultText>
                            </View>
                        </View>
                        <View style={{ marginLeft: widthPercentageToDP(12), marginTop: heightPercentageToDP(3) }}>
                            <LabeledInputPlaceholder
                                inputValue={bike.name || ''} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[0] = elRef} returnKeyType='next'
                                onChange={this.onChangeNickname} label='NICKNAME' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                inputValue={bike.make || ''} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[1] = elRef} returnKeyType='next'
                                onChange={this.onChangeMake} label='MAKE' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[2].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                inputValue={bike.model || ''} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[2] = elRef} returnKeyType='next'
                                onChange={this.onChangeModel} label='MODEL' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[3].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                inputValue={bike.year ? bike.year + '' : ''} inputStyle={{ paddingBottom: 0 }} inputType={'postalCode'}
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[3] = elRef} returnKeyType='next'
                                onChange={this.onChangeYear} label='YEAR' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[4].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                inputValue={bike.milage ? bike.milage + '' : ''} inputStyle={{ paddingBottom: 0 }} inputType={'postalCode'}
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[4] = elRef} returnKeyType='next'
                                onChange={this.onChangeMilage} label='MILAGE' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[5].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                inputValue={bike.notes} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[5] = elRef} returnKeyType='next'
                                onChange={this.onChangeNotes} label='NOTES' labelStyle={styles.labelStyle}
                                hideKeyboardOnSubmit={true} />
                        </View>
                        <BasicButton title='UPDATE' style={styles.submitBtn} titleStyle={{ letterSpacing: 2, fontSize: 20, fontFamily: CUSTOM_FONTS.robotoSlabBold }} onPress={this.onSubmit} />
                    </ScrollView>
                </KeyboardAvoidingView>
                <Loader isVisible={showLoader} />
                {/* Shifter: - Brings the app navigation menu */}
                <ShifterButton onPress={this.showAppNavMenu} size={18} alignLeft={user.handDominance === 'left'} />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { currentBikeId } = state.GarageInfo;
    const currentBikeIndex = state.GarageInfo.spaceList.findIndex(({ spaceId }) => spaceId === currentBikeId);
    const bike = currentBikeIndex === -1 ? null : state.GarageInfo.spaceList[currentBikeIndex];
    return { user, currentBikeIndex, bike };
}
const mapDispatchToProps = (dispatch) => {
    return {
        addBikeToGarage: (userId, bike, pictureList, successCallback, errorCallback) => dispatch(addBikeToGarage(userId, bike, pictureList, successCallback, errorCallback)),
        editBike: (userId, bike, pictureList, index, successCallback, errorCallback) => dispatch(editBike(userId, bike, pictureList, index, successCallback, errorCallback)),
        toggleLoader: (toggleValue) => dispatch(toggleLoaderAction(toggleValue)),
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(AddBikeForm);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff',
    },
    form: {
        marginTop: APP_COMMON_STYLES.headerHeight,
    },
    formContent: {
        paddingTop: 20,
    },
    submitBtn: {
        height: heightPercentageToDP(8.5),
        marginTop: heightPercentageToDP(3)
    },
    imageUploadBtn: {
        marginLeft: 10,
        height: heightPercentageToDP(5),
        width: '50%'
    },
    imgContainer: {
        marginTop: heightPercentageToDP(2),
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    labelStyle: {
        fontSize: 11,
        letterSpacing: 1.1,
        fontFamily: CUSTOM_FONTS.robotoSlabBold
    }
});