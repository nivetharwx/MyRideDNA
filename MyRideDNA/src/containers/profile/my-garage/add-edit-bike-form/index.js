import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, ScrollView, View, Keyboard, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, } from 'react-native';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, CUSTOM_FONTS, PageKeys, GET_PICTURE_BY_ID, THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG } from '../../../../constants';
import { Actions } from 'react-native-router-flux';
import { LabeledInputPlaceholder } from '../../../../components/inputs';
import { BasicButton, ImageButton, } from '../../../../components/buttons';
import { SelectedImage } from '../../../../components/images';
import ImagePicker from 'react-native-image-crop-picker';
import { addBikeToGarage, editBike } from '../../../../api';
import { DefaultText } from '../../../../components/labels';
import { Toast } from 'native-base';
import { BasePage } from '../../../../components/pages';

class AddBikeForm extends Component {
    fieldRefs = [];
    constructor(props) {
        super(props);
        this.state = {
            bikeImage: this.props.bike && this.props.bike.picture && this.props.bike.picture.id ? { profilePictureId: this.props.bike.picture.id } : null,
            bike: { ...props.bike },
            showLoader: false,
            deletedId:null
        };
        if (typeof this.state.bike.pictures === 'undefined') this.state.bike.pictures = [];
    }

    onPressCameraIcon = async () => {
        try {
            const imgObj = await ImagePicker.openCamera({ cropping: false, hideBottomControls: true });
            ImagePicker.openCropper({height:imgObj.height, width:imgObj.width, path: imgObj.path, hideBottomControls: true, compressImageQuality: imgObj.size > 600000 ? IS_ANDROID ? 0.4 : 0.2 : 1, }).then(image => {
                this.setState({ bikeImage: { mimeType: image.mime, path: image.path } });
            })
        } catch (er) { console.log("Error occurd: ", er); }
    }

    onPressGalleryIcon = async () => {
        try {
            const imgObj = await ImagePicker.openPicker({ cropping: false, hideBottomControls: true });
            ImagePicker.openCropper({ height:imgObj.height, width:imgObj.width,path: imgObj.path, hideBottomControls: true, compressImageQuality: imgObj.size > 600000 ? IS_ANDROID ? 0.4 : 0.2 : 1, }).then(image => {
                this.setState({ bikeImage: { mimeType: image.mime, path: image.path } });
            })
        } catch (er) { console.log("Error occurd: ", er); }
    }

    onPressSelectFromAlbum = () => Actions.push(PageKeys.ALBUM, { isSelectMode: true, isMultiSelect: false, getSelectedPhotos: (photoIds) => this.setState({ bikeImage: { id: photoIds[0] } }) });

    onChangeNickname = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, name: val + '' } }));

    onChangeMake = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, make: val } }));

    onChangeModel = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, model: val } }));

    onChangeYear = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, year: val } }));

    onChangeMilage = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, mileage: val } }));

    onChangeNotes = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, notes: val } }));

    hideLoader = () => this.setState({ showLoader: false });

    gotoPreviousPage = () => Actions.pop();

    onSubmit = () => {
        Keyboard.dismiss();
        const { bike, bikeImage } = this.state;
        if (!bike.name || bike.name.trim().length === 0) {
            Alert.alert('Field Error', 'Please enter a bike name');
            return;
        }
        const { picture, ...otherData } = bike;
        const bikeDetail = otherData;
        if (bikeImage && (bikeImage.path || bikeImage.id)) bikeDetail.picture = bikeImage;
        if(this.state.deletedId){
            bikeDetail.deletedId = this.state.deletedId
        }
        if (bikeDetail.picture) {
            this.props[bike.spaceId ? `editBike` : `addBikeToGarage`](this.props.user.userId, bikeDetail);
            Toast.show({ text: 'Uploading image... We will let you know once it is completed' });
            setTimeout(this.gotoPreviousPage, 200);
        } else {
            this.setState({ showLoader: true });
            this.props[bike.spaceId ? `editBike` : `addBikeToGarage`](this.props.user.userId, bikeDetail, () => {
                this.hideLoader();
                this.gotoPreviousPage();
            }, this.hideLoader);
        }
    }

    unselectProfilePic = () => {
        console.log('\n\n\n unSelectProfilePage : ', this.state.bikeImage.profilePictureId);
        this.setState({ bikeImage: null, deletedId:this.state.bikeImage.profilePictureId })
    }

    render() {
        const { bike, showLoader, bikeImage } = this.state;
        return (
            <BasePage showLoader={showLoader} heading={!bike.spaceId ? 'Add Bike' : 'Edit Bike'}>
                <KeyboardAvoidingView keyboardVerticalOffset={20} behavior={IS_ANDROID ? null : 'padding'} style={styles.fill}>
                    <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={{ paddingBottom: styles.submitBtn.height }}>
                        {
                            bikeImage && (bikeImage.path || bikeImage.profilePictureId || bikeImage.id)
                                ? <SelectedImage
                                    outerContainer={{ marginTop: APP_COMMON_STYLES.statusBar.height }}
                                    image={{ uri: bikeImage.path ? bikeImage.path : `${GET_PICTURE_BY_ID}${bikeImage.id ? bikeImage.id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG) : bikeImage.profilePictureId.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` }}
                                    onPressCloseImg={this.unselectProfilePic}
                                />
                                : <View style={styles.imageUploadIconsCont}>
                                    <TouchableWithoutFeedback onPress={this.onPressCameraIcon} >
                                    <View style={styles.imageUploadIcon}>
                                        <ImageButton onPress={this.onPressCameraIcon} imageSrc={require('../../../../assets/img/cam-icon.png')} imgStyles={styles.iconStyle} />
                                        <DefaultText style={styles.uploadImageIconLabel}>{' TAKE \nPHOTO'}</DefaultText>
                                    </View>
                                    </TouchableWithoutFeedback>
                                    <TouchableWithoutFeedback onPress={this.onPressGalleryIcon}>
                                    <View style={styles.imageUploadIcon}>
                                        <ImageButton  onPress={this.onPressGalleryIcon} imageSrc={require('../../../../assets/img/upload-icon-orange.png')} imgStyles={styles.iconStyle} />
                                        <DefaultText style={styles.uploadImageIconLabel}>{'UPLOAD \n PHOTO'}</DefaultText>
                                    </View>
                                    </TouchableWithoutFeedback>
                                    <TouchableWithoutFeedback onPress={this.onPressSelectFromAlbum}>
                                    <View style={styles.imageUploadIcon}>
                                        <ImageButton onPress={this.onPressSelectFromAlbum} imageSrc={require('../../../../assets/img/photos-icon.png')} imgStyles={styles.iconStyle} />
                                        <DefaultText style={[styles.uploadImageIconLabel, { letterSpacing: 0.6 }]}>{'SELECT FROM \n MY PHOTOS'}</DefaultText>
                                    </View>
                                    </TouchableWithoutFeedback>
                                </View>
                        }
                        <View style={styles.container}>
                            <LabeledInputPlaceholder
                                containerStyle={{ backgroundColor: '#F4F4F4' }}
                                inputValue={bike.name || ''} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[0] = elRef} returnKeyType='next'
                                onChange={this.onChangeNickname} label='NICKNAME' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                containerStyle={{ backgroundColor: '#F4F4F4' }}
                                inputValue={bike.make || ''} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[1] = elRef} returnKeyType='next'
                                onChange={this.onChangeMake} label='MAKE' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[2].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                containerStyle={{ backgroundColor: '#F4F4F4' }}
                                inputValue={bike.model || ''} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[2] = elRef} returnKeyType='next'
                                onChange={this.onChangeModel} label='MODEL' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[3].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                containerStyle={{ backgroundColor: '#F4F4F4' }}
                                inputValue={bike.year ? bike.year + '' : ''} inputStyle={{ paddingBottom: 0 }} inputType={'postalCode'}
                                outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[3] = elRef} returnKeyType='next'
                                onChange={this.onChangeYear} label='YEAR' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[4].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                containerStyle={{ backgroundColor: '#F4F4F4' }}
                                inputValue={bike.mileage ? bike.mileage + '' : ''} inputStyle={{ paddingBottom: 0 }} inputType={'postalCode'}
                                outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[4] = elRef}
                                onChange={this.onChangeMilage} label='MILEAGE' labelStyle={styles.labelStyle}
                                hideKeyboardOnSubmit={true}
                                onSubmit={this.onSubmit}
                            />
                        </View>
                        <BasicButton title={!bike.spaceId ? 'ADD BIKE' : 'UPDATE'} style={styles.submitBtn} titleStyle={{ letterSpacing: 1.4, fontSize: 14, fontFamily: CUSTOM_FONTS.robotoBold }} onPress={this.onSubmit} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </BasePage>
        );
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { currentBike: bike } = state.GarageInfo;
    return { user, bike };
}
const mapDispatchToProps = (dispatch) => {
    return {
        addBikeToGarage: (userId, bike, successCallback, errorCallback) => dispatch(addBikeToGarage(userId, bike, successCallback, errorCallback)),
        editBike: (userId, bike, successCallback, errorCallback) => dispatch(editBike(userId, bike, successCallback, errorCallback)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(AddBikeForm);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff',
    },
    submitBtn: {
        height: 35,
        backgroundColor: '#f69039',
        width: 213,
        alignSelf: 'center',
        borderRadius: 20,
        marginVertical: 30
    },
    labelStyle: {
        fontSize: 11,
        letterSpacing: 1.1,
        fontFamily: CUSTOM_FONTS.robotoSlabBold
    },
    imageUploadIconsCont: {
        paddingHorizontal: 20,
        height: heightPercentageToDP(25),
        width: widthPercentageToDP(100),
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    imageUploadIcon: {
        alignItems: 'center',
        flex: 1
    },
    iconStyle: {
        width: 41,
        height: 33
    },
    uploadImageIconLabel: {
        letterSpacing: 1.8,
        marginTop: 15,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        color: '#000'
    },
    container: {
        marginLeft: widthPercentageToDP(12),
        marginTop: heightPercentageToDP(2),
    },
});