import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, ScrollView, View, Keyboard, Alert, KeyboardAvoidingView, Animated, TouchableWithoutFeedback } from 'react-native';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, CUSTOM_FONTS, PageKeys, GET_PICTURE_BY_ID, THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG } from '../../../constants';
import { Actions } from 'react-native-router-flux';
import { IconicList, IconicDatePicker, LabeledInputPlaceholder } from '../../../components/inputs';
import { BasicButton, ImageButton } from '../../../components/buttons';
import { SelectedImage } from '../../../components/images';
import { registerPassenger, updatePassengerDetails } from '../../../api';
import { Toast } from 'native-base';
import ImagePicker from 'react-native-image-crop-picker';
import { DefaultText } from '../../../components/labels';

class PaasengerFormDisplay extends Component {
    fieldRefs = [];
    constructor(props) {
        super(props);
        this.state = {
            passenger: props.passengerIdx >= 0 ? props.passengerList[props.passengerIdx] : {},
            picture: props.passengerIdx >= 0 ? { profilePictureId: props.passengerList[props.passengerIdx].profilePictureId } : null,
            elementPadding: 0,
            currentFieldIdx: -1,
            listBottomOffset: 0,
            deletedId: null,
        };
        if (!this.state.passenger.homeAddress) {
            this.state.passenger['homeAddress'] = { city: '', state: '' };
        }
    }

    onChangeName = (val) => this.setState(prevState => ({ passenger: { ...prevState.passenger, name: val + '' } }));

    onChangeGender = (val) => this.setState(prevState => ({ passenger: { ...prevState.passenger, gender: val + '' } }));

    isIsoDate = (str) => {
        if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
        var d = new Date(str); 
        return d.toISOString()===str;
      }

    onChangeDOBios = (event, date) => {
        let updatedDate = date;
        if(this.isIsoDate(date) === false){
            updatedDate = new Date(date).toISOString();
        }
        this.setState(prevState => ({ passenger: { ...prevState.passenger, dob: updatedDate } }))
    }

    onChangeDOBandroid = (val) => this.setState(prevState => ({ passenger: { ...prevState.passenger, dob: new Date(val).toISOString() } }));

    onChangeCity = (val) => this.setState(prevState => ({ passenger: { ...prevState.passenger, homeAddress: { ...prevState.passenger.homeAddress, city: val + '' } } }));

    onChangeState = (val) => this.setState(prevState => ({ passenger: { ...prevState.passenger, homeAddress: { ...prevState.passenger.homeAddress, state: val + '' } } }));

    onChangePhone = (val) => this.setState(prevState => ({ passenger: { ...prevState.passenger, phoneNumber: val + '' } }));

    gotoPreviousPage = () => Actions.pop();

    onSubmit = () => {
        Keyboard.dismiss();
        const { passenger, picture, deletedId } = this.state;
        if (!passenger.name || passenger.name.trim().length === 0) {
            Alert.alert('Field Error', 'Please enter a passenger name');
            return;
        }
        const passengerDetail = { ...passenger };
        if (picture && (picture.path || picture.id)) passengerDetail.picture = picture;
        if (deletedId) {
            passengerDetail.deletedId = deletedId;
        }
        if (!passengerDetail.passengerId) {
            if (passengerDetail.picture) {
                this.props.registerPassenger({ ...passengerDetail, userId: this.props.user.userId, });
                Toast.show({ text: 'Uploading image... We will let you know once it is completed' });
                setTimeout(this.gotoPreviousPage, 200);
            } else {
                this.props.registerPassenger({ ...passengerDetail, userId: this.props.user.userId, });
                setTimeout(this.gotoPreviousPage, 200);
            }
        } else {
            if (passengerDetail.picture) {
                this.props.updatePassengerDetails(passengerDetail.passengerId, passengerDetail);
                Toast.show({ text: 'Uploading image... We will let you know once it is completed' });
                setTimeout(this.gotoPreviousPage, 200);
            } else {
                this.props.updatePassengerDetails(passengerDetail.passengerId, passengerDetail);
                setTimeout(this.gotoPreviousPage, 200);
            }
        }
    }

    onPressGalleryIcon = async () => {
        this.setState({ isLoadingProfPic: true });
        try {
            const imageObj = await ImagePicker.openPicker({ cropping: false, hideBottomControls: true });
            ImagePicker.openCropper({ height: imageObj.height, width: imageObj.width, path: imageObj.path, hideBottomControls: true, compressImageQuality: imageObj.size > 600000 ? IS_ANDROID ? 0.4 : 0.2 : 1, }).then(image => {
                this.setState({ picture: { mimeType: image.mime, path: image.path } });
            })
        } catch (er) {
            this.setState({ isLoadingProfPic: false });
            console.log("Error occurd: ", er);
        }
    }

    onPressCameraIcon = async () => {
        this.setState({ isLoadingProfPic: true });
        try {
            const imageObj = await ImagePicker.openCamera({ mediaType: 'photo', cropping: false, hideBottomControls: true });
            ImagePicker.openCropper({ height: imageObj.height, width: imageObj.width, path: imageObj.path, hideBottomControls: true, compressImageQuality: imageObj.size > 600000 ? IS_ANDROID ? 0.4 : 0.2 : 1, }).then(image => {
                this.setState({ picture: { mimeType: image.mime, path: image.path } });
            })
        } catch (er) {
            this.setState({ isLoadingProfPic: false });
            console.log("Error occurd: ", er);
        }
    }

    onPressSelectFromAlbum = () => Actions.push(PageKeys.ALBUM, { isSelectMode: true, isMultiSelect: false, getSelectedPhotos: (photoIds) => this.setState({ picture: { id: photoIds[0] } }) });

    unselectProfilePic = () => this.setState(prevState => ({ picture: null, deletedId: this.state.picture.profilePictureId }));

    addBottomPaddingForScrollView(index) { this.setState({ listBottomOffset: index * 20 }); }

    removeBottomPaddingForScrollView = () => this.setState({ listBottomOffset: 0 });

    render() {
        const { passenger, picture } = this.state;
        const { topMargin, passengerIdx } = this.props;
        const GENDER_LIST = [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }];
        return (
            <KeyboardAvoidingView keyboardVerticalOffset={20} behavior={IS_ANDROID ? null : 'padding'} style={styles.fill}>
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled' contentContainerStyle={[{ paddingBottom: passengerIdx >= 0 ? 50 : this.state.listBottomOffset }, topMargin]}>
                    {
                        picture && (picture.path || picture.profilePictureId || picture.id)
                            ? <SelectedImage
                                outerContainer={{ marginTop: APP_COMMON_STYLES.statusBar.height }}
                                image={{ uri: picture.path ? picture.path : `${GET_PICTURE_BY_ID}${picture.id ? picture.id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG) : picture.profilePictureId.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` }}
                                onPressCloseImg={this.unselectProfilePic}
                            />
                            : <View style={styles.imageUploadIconsCont}>
                                <TouchableWithoutFeedback onPress={this.onPressCameraIcon}>
                                <View style={styles.imageUploadIcon}>
                                    <ImageButton onPress={this.onPressCameraIcon} imageSrc={require('../../../assets/img/cam-icon.png')} imgStyles={styles.iconStyle} />
                                    <DefaultText style={styles.uploadImageIconLabel}>{' TAKE \nPHOTO'}</DefaultText>
                                </View>
                                </TouchableWithoutFeedback>
                                <TouchableWithoutFeedback onPress={this.onPressGalleryIcon}>
                                <View style={styles.imageUploadIcon}>
                                    <ImageButton onPress={this.onPressGalleryIcon} imageSrc={require('../../../assets/img/upload-icon-orange.png')} imgStyles={styles.iconStyle} />
                                    <DefaultText style={styles.uploadImageIconLabel}>{'UPLOAD \n PHOTO'}</DefaultText>
                                </View>
                                </TouchableWithoutFeedback>
                                <TouchableWithoutFeedback onPress={this.onPressSelectFromAlbum}>
                                <View style={styles.imageUploadIcon}>
                                    <ImageButton onPress={this.onPressSelectFromAlbum} imageSrc={require('../../../assets/img/photos-icon.png')} imgStyles={styles.iconStyle} />
                                    <DefaultText style={[styles.uploadImageIconLabel, { letterSpacing: 0.6 }]}>{'SELECT FROM \n MY PHOTOS'}</DefaultText>
                                </View>
                                </TouchableWithoutFeedback>
                            </View>
                    }
                    <View style={styles.container}>
                        <LabeledInputPlaceholder
                            containerStyle={{ backgroundColor: '#F4F4F4' }}
                            onFocus={IS_ANDROID ? null : () => this.addBottomPaddingForScrollView(0)}
                            onBlur={IS_ANDROID ? null : this.removeBottomPaddingForScrollView}
                            inputValue={passenger.name} inputStyle={{ paddingBottom: 0 }}
                            outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(4) }}
                            inputRef={elRef => this.fieldRefs[0] = elRef} returnKeyType='next'
                            onChange={this.onChangeName} label='NAME' labelStyle={styles.labelStyle}
                            onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false} />
                        <LabeledInputPlaceholder
                            containerStyle={{ backgroundColor: '#F4F4F4' }}
                            onFocus={IS_ANDROID ? null : () => this.addBottomPaddingForScrollView(1)}
                            onBlur={IS_ANDROID ? null : this.removeBottomPaddingForScrollView}
                            inputValue={passenger.homeAddress.city} inputStyle={{ paddingBottom: 0 }}
                            outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(4) }}
                            inputRef={elRef => this.fieldRefs[1] = elRef} returnKeyType='next'
                            onChange={this.onChangeCity} label='CITY' labelStyle={styles.labelStyle}
                            onSubmit={() => this.fieldRefs[2].focus()} hideKeyboardOnSubmit={false} />
                        <LabeledInputPlaceholder
                            containerStyle={{ backgroundColor: '#F4F4F4' }}
                            onFocus={IS_ANDROID ? null : () => this.addBottomPaddingForScrollView(2)}
                            onBlur={IS_ANDROID ? null : this.removeBottomPaddingForScrollView}
                            inputValue={passenger.homeAddress.state} inputStyle={{ paddingBottom: 0 }}
                            outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(4) }}
                            inputRef={elRef => this.fieldRefs[2] = elRef} returnKeyType='next'
                            onChange={this.onChangeState} label='STATE' labelStyle={styles.labelStyle}
                            onSubmit={() => this.fieldRefs[3].focus()} hideKeyboardOnSubmit={false} />
                        <LabeledInputPlaceholder
                            containerStyle={{ backgroundColor: '#F4F4F4' }}
                            onFocus={IS_ANDROID ? null : () => this.addBottomPaddingForScrollView(3)}
                            onBlur={IS_ANDROID ? null : this.removeBottomPaddingForScrollView}
                            inputValue={passenger.phoneNumber ? passenger.phoneNumber + "" : passenger.phoneNumber} inputStyle={{ paddingBottom: 0 }}
                            outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(4) }}
                            inputRef={elRef => this.fieldRefs[3] = elRef} returnKeyType='next'
                            onChange={this.onChangePhone} label='PHONE' labelStyle={styles.labelStyle}
                            hideKeyboardOnSubmit={true}
                            inputType="telephoneNumber"
                        />
                        <IconicList
                            pickerStyle={{ borderBottomWidth: 0, paddingTop: IS_ANDROID ? 0 : 10 }}
                            textStyle={{ paddingLeft: 10, fontSize: 14 }}
                            selectedValue={passenger.gender}
                            values={GENDER_LIST}
                            labelPlaceHolder='GENDER'
                            placeholder={'Select any'}
                            outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(3) }}
                            containerStyle={{ height: 40 }}
                            labelPlaceHolderStyle={[styles.labelStyle, { marginTop: 2 }]}
                            innerContainerStyle={{ borderBottomWidth: 1, backgroundColor: '#F4F4F4' }} onChange={this.onChangeGender} />
                        <IconicDatePicker
                            pickerBorderIos={{ borderBottomWidth: 1, borderBottomColor: '#000' }}
                            selectedDate={passenger.dob || new Date()} datePickerStyle={{ paddingLeft: 5, paddingBottom: 1, fontSize: 14 }}
                            outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(4) }}
                            onChange={IS_ANDROID?this.onChangeDOBandroid :this.onChangeDOBios} label='BIRTHDAY' labelStyle={styles.labelStyle} />
                    </View>
                    <BasicButton title={passengerIdx >= 0 ? 'UPDATE' : 'ADD PASSENGER'} style={[styles.submitBtn]} titleStyle={{ letterSpacing: 1.4, fontSize: 14, fontFamily: CUSTOM_FONTS.robotoBold }} onPress={this.onSubmit} />
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { passengerList } = state.PassengerList;
    return { user, passengerList };
}
const mapDispatchToProps = (dispatch) => {
    return {
        registerPassenger: (passenger) => dispatch(registerPassenger(passenger)),
        updatePassengerDetails: (passengerId, passenger) => dispatch(updatePassengerDetails(passengerId, passenger)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(PaasengerFormDisplay);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    submitBtn: {
        height: 35,
        backgroundColor: '#f69039',
        width: 213,
        alignSelf: 'center',
        borderRadius: 20,
        marginVertical: 30,
    },
    labelStyle: {
        color: '#000',
        fontSize: 10,
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