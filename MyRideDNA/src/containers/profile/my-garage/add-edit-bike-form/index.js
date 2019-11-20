import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, StatusBar, ScrollView, View, Keyboard, Alert, KeyboardAvoidingView, Text } from 'react-native';
import { BasicHeader } from '../../../../components/headers';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, CUSTOM_FONTS } from '../../../../constants';
import { Actions } from 'react-native-router-flux';
import { LabeledInput, LabeledInputPlaceholder, IconicList, IconicDatePicker } from '../../../../components/inputs';
import { BasicButton, ShifterButton, ImageButton, IconButton } from '../../../../components/buttons';
import { Thumbnail } from '../../../../components/images';
import ImageCropPicker from 'react-native-image-crop-picker';
import { addBikeToGarage, editBike, addPictures } from '../../../../api';
import { toggleLoaderAction, appNavMenuVisibilityAction } from '../../../../actions';
import { Loader } from '../../../../components/loader';

class AddBikeForm extends Component {
    fieldRefs = [];
    constructor(props) {
        super(props);
        this.state = {
            bikeImages: [],
            bike: props.bikeIndex >= 0 ? props.spaceList[props.bikeIndex] : {},
            showLoader: false
        };
        if (typeof this.state.bike.pictureList === 'undefined') {
            this.state.bike.pictureList = [];
        }
    }

    componentDidUpdate(prevProps, prevState) {
        // if (prevProps.spaceList !== this.props.spaceList) {
        //     // if (this.state.bikeImages.length > 0) {
        //     //     const newBike = this.props.spaceList[this.props.spaceList.length - 1];
        //     //     this.props.addPictures(this.props.user.userId, newBike, this.state.bikeImages);
        //     //     this.setState({ bikeImages: [] });
        //     // } else {
        //     //     Actions.pop();
        //     // }
        //     this.setState({ bikeImages: [] });
        //     Actions.pop();
        // }
    }

    onPressUploadImages = async () => {
        this.props.toggleLoader(true);
        try {
            const imageList = await ImageCropPicker.openPicker({
                width: 300,
                height: 300,
                cropping: false,
                includeBase64: true,
                multiple: true,
                mediaType: 'photo',
                compressImageQuality: 0.8,
            });
            this.setState({
                bikeImages: imageList.reduce((arr, { mime, data }) => {
                    arr.push({ mimeType: mime, picture: data });
                    return arr;
                }, [])
            });
            this.props.toggleLoader(false);
        } catch (er) {
            this.props.toggleLoader(false);
            console.log("Error occurd: ", er);
        }
    }

    onChangeNickname = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, name: val + '' } }));

    onChangeMake = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, make: val } }));

    onChangeModel = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, model: val } }));

    onChangeYear = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, year: val } }));

    onChangeMilage = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, milage: val } }));

    onChangeNotes = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, notes: val } }));

    hideLoader = () => {
        this.setState({ showLoader: false });
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

    onSubmit = () => {
        Keyboard.dismiss();
        const { bike, bikeImages } = this.state;
        if (!bike.name || bike.name.trim().length === 0) {
            Alert.alert('Field Error', 'Please enter a bike name');
            return;
        }
        const pictureList = [...bikeImages];
        if (!bike.spaceId) {
            this.setState({ showLoader: true });
            this.props.addBikeToGarage(this.props.user.userId, bike, pictureList, (res) => {
                this.hideLoader()
            }, (err) => {
                this.hideLoader()
            });
        } else {
            this.setState({ showLoader: true });
            this.props.editBike(this.props.user.userId, bike, pictureList, this.props.bikeIndex, (res) => {
                this.hideLoader()
            }, (err) => {
                this.hideLoader()
            });
        }
    }

    render() {
        const { bikeImages, bike, showLoader } = this.state;
        const { bikeIndex, user } = this.props;
        return (
            <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <KeyboardAvoidingView behavior={IS_ANDROID ? null : 'padding'} style={styles.fill}>
                    <BasicHeader title={bikeIndex === -1 ? 'Add Bike' : 'Edit Bike'} leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: () => Actions.pop() }} />
                    <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={{ marginTop: 41 + APP_COMMON_STYLES.headerHeight }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                            <View style={{ alignSelf: 'center', alignItems: 'center' }}>
                                <ImageButton onPress={this.onPressCameraIcon} imageSrc={require('../../../../assets/img/cam-icon.png')} imgStyles={{ width: 45, height: 37 }} />
                                <Text style={{ letterSpacing: 1.8, marginTop: 15, fontFamily: CUSTOM_FONTS.robotoSlabBold, color: '#000', fontSize: 12 }}>{' TAKE \nPHOTO'}</Text>
                            </View>
                            <View style={{ alignSelf: 'center', alignItems: 'center' }}>
                                <ImageButton onPress={this.onPressGalleryIcon} imageSrc={require('../../../../assets/img/photos-icon.png')} imgStyles={{ width: 41, height: 33 }} />
                                <Text style={{ letterSpacing: 2, marginTop: 15, fontFamily: CUSTOM_FONTS.robotoSlabBold, color: '#000', fontSize: 12 }}>{'UPLOAD \n PHOTO'}</Text>
                            </View>
                        </View>
                        <View style={{ marginLeft: widthPercentageToDP(12), marginTop: heightPercentageToDP(3) }}>

                            {/* <LabeledInputPlaceholder containerStyle={{ }} inputValue={user.homeAddress.country} inputRef={elRef => this.fieldRefs[5] = elRef} onChange={this.onChangeCountry} placeholder='Country' onSubmit={() => { }} hideKeyboardOnSubmit={true} /> */}
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
                                inputValue={bike.year} inputStyle={{ paddingBottom: 0 }} inputType={'postalCode'}
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[3] = elRef} returnKeyType='next'
                                onChange={this.onChangeYear} label='YEAR' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[4].focus()} hideKeyboardOnSubmit={false} />

                            <LabeledInputPlaceholder
                                inputValue={bike.milage || ''} inputStyle={{ paddingBottom: 0 }} inputType={'postalCode'}
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

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: heightPercentageToDP(3) }}>
                                <IconButton style={styles.roundBtnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: widthPercentageToDP(5), color: '#fff' } }} onPress={() => this.setState({ isAddingClub: true, activeClubId: null, club: '' })} />
                            </View>
                        </View>
                        <BasicButton title='UPDATE' style={styles.submitBtn} titleStyle={{ letterSpacing: 2, fontSize: 20, fontFamily: CUSTOM_FONTS.robotoSlabBold }} onPress={this.onSubmit} />
                    </ScrollView>
                </KeyboardAvoidingView>
                <Loader isVisible={showLoader} />
                {/* Shifter: - Brings the app navigation menu */}
                <ShifterButton onPress={this.showAppNavMenu} size={18} alignLeft={this.props.user.handDominance === 'left'} />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { spaceList } = state.GarageInfo;
    return { user, spaceList };
}
const mapDispatchToProps = (dispatch) => {
    return {
        addBikeToGarage: (userId, bike, pictureList, successCallback, errorCallback) => dispatch(addBikeToGarage(userId, bike, pictureList, successCallback, errorCallback)),
        editBike: (userId, bike, pictureList, index, successCallback, errorCallback) => dispatch(editBike(userId, bike, pictureList, index, successCallback, errorCallback)),
        // editBike: (userId, bike, index) => dispatch(editBike(userId, bike, index)),
        toggleLoader: (toggleValue) => dispatch(toggleLoaderAction(toggleValue)),
        addPictures: (userId, bike, pictureList) => dispatch(addPictures(userId, bike, pictureList)),
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(AddBikeForm);

const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    form: {
        marginTop: APP_COMMON_STYLES.headerHeight,
    },
    formContent: {
        paddingTop: 20,
        // flex: 1,
        // justifyContent: 'space-around'
    },
    submitBtn: {
        height: heightPercentageToDP(8.5),
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
        color: '#000',
        fontSize: 11,
        letterSpacing: 1.1,
        fontFamily: CUSTOM_FONTS.robotoSlabBold
    }
});