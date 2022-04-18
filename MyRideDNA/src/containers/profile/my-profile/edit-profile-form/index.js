import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, ScrollView, View, Keyboard, FlatList, KeyboardAvoidingView, TouchableWithoutFeedback } from 'react-native';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, CUSTOM_FONTS, GET_PICTURE_BY_ID, THUMBNAIL_TAIL_TAG, PageKeys, PORTRAIT_TAIL_TAG } from '../../../../constants';
import { Actions } from 'react-native-router-flux';
import { IconicList, IconicDatePicker, LabeledInputPlaceholder } from '../../../../components/inputs';
import { BasicButton, IconButton, ImageButton } from '../../../../components/buttons';
import { SelectedImage } from '../../../../components/images';
import { updateUserInfo } from '../../../../api';
import { Toast } from 'native-base';
import ImagePicker from 'react-native-image-crop-picker';
import { DefaultText } from '../../../../components/labels';
import { BasePage } from '../../../../components/pages';
import DateTimePicker from '@react-native-community/datetimepicker';
class EditProfileForm extends Component {
    fieldRefs = [];
    updatingUser = false;
    constructor(props) {
        super(props);
        this.state = {
            user: {
                ...props.user,
                picture: props.user.profilePictureId ? { profilePictureId: props.user.profilePictureId } : null
            },
            clubs: [],
            deletedClubsIds: [],
            showLoader: false,
            isLoadingProfPic: false,
            isAddingClub: false,
            btmOffset: 0,
            isEditingClubs: false,
            deletedId: null,
        };
        if (!props.user.homeAddress) this.state.user.homeAddress = { address: '', city: '', state: '', zipCode: '' };
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.user !== this.props.user) {
            // DOC: Confirming changes happened due to api call from this form
            if (this.updatingUser === true) {
                Toast.show({ text: 'Profile updated successfully' });
                this.gotoPreviousPage();
            }
        }
    }

    onChangeName = (val) => this.setState(prevState => ({ user: { ...prevState.user, name: val + '' } }));

    onChangeNickName = (val) => this.setState(prevState => ({ user: { ...prevState.user, nickname: val + '' } }));

    onChangeGender = (val) => this.setState(prevState => ({ user: { ...prevState.user, gender: val + '' } }));

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
      this.setState(prevState => ({ user: { ...prevState.user, dob: updatedDate } }))
    }

    onChangeDOBandroid = (val)=>{
        this.setState(prevState => ({ user: { ...prevState.user, dob: new Date(val).toLocaleDateString() } }));
    }

    onChangeStreetAddress = (val) => this.setState(prevState => ({ user: { ...prevState.user, homeAddress: { ...prevState.user.homeAddress, address: val + '' } } }));

    onChangeCity = (val) => this.setState(prevState => ({ user: { ...prevState.user, homeAddress: { ...prevState.user.homeAddress, city: val + '' } } }));

    onChangeState = (val) => this.setState(prevState => ({ user: { ...prevState.user, homeAddress: { ...prevState.user.homeAddress, state: val + '' } } }));

    onChangeCountry = (val) => this.setState(prevState => ({ user: { ...prevState.user, homeAddress: { ...prevState.user.homeAddress, country: val + '' } } }));

    onChangeZipCode = (val) => this.setState(prevState => ({ user: { ...prevState.user, homeAddress: { ...prevState.user.homeAddress, zipCode: val + '' } } }));

    onChangePhone = (val) => this.setState(prevState => ({ user: { ...prevState.user, phoneNumber: val + '' } }));

    onChangeRidingSince = (val) => this.setState(prevState => ({ user: { ...prevState.user, ridingSince: val + '' } }));

    onChangeClubs = (val, index) => this.setState({ clubs: [...this.state.clubs.slice(0, index), { ...this.state.clubs[index], clubName: val }, ...this.state.clubs.slice(index + 1)] });

    gotoPreviousPage = () => Actions.pop();

    hideLoader = () => this.setState({ showLoader: false });

    onPressGalleryIcon = async () => {
        this.setState({ isLoadingProfPic: true });
        try {
            const imageObj = await ImagePicker.openPicker({ cropping: false, hideBottomControls: true });
            ImagePicker.openCropper({ height: imageObj.height, width: imageObj.width, path: imageObj.path, hideBottomControls: true, compressImageQuality: imageObj.size > 600000 ? IS_ANDROID ? 0.4 : 0.2 : 1, }).then(image => {
                this.setState(prevState => ({ user: { ...prevState.user, picture: { mimeType: image.mime, path: image.path } } }));
            })
        } catch (er) {
            this.setState({ isLoadingProfPic: false });
            console.log("Error occurd: ", er);
        }
    }

    onPressCameraIcon = async () => {
        this.setState({ isLoadingProfPic: true });
        try {
            const imageObj = await ImagePicker.openCamera({ cropping: false, hideBottomControls: true, });
            ImagePicker.openCropper({ height: imageObj.height, width: imageObj.width, path: imageObj.path, hideBottomControls: true, compressImageQuality: imageObj.size > 600000 ? IS_ANDROID ? 0.4 : 0.2 : 1, }).then(image => {
                this.setState(prevState => ({ user: { ...prevState.user, picture: { mimeType: image.mime, path: image.path } } }));
            })
        } catch (er) {
            this.setState({ isLoadingProfPic: false });
            console.log("Error occurd: ", er);
        }
    }

    onPressSelectFromAlbum = () => Actions.push(PageKeys.ALBUM, { isSelectMode: true, isMultiSelect: false, getSelectedPhotos: (photoIds) => { this.setState({ user: { ...this.state.user, picture: { id: photoIds[0] } } }) } });

    onSubmit = () => {
        const { deletedClubsIds, isAddingClub, clubs, isEditingClubs, deletedId } = this.state;
        Keyboard.dismiss();
        const { picture, ...otherDetail } = this.state.user;
        const updatedUserDetail = otherDetail;
        if (deletedId) {
            updatedUserDetail.deletedId = deletedId;
        }
        if (deletedClubsIds.length > 0) {
            updatedUserDetail.deletedClubs = deletedClubsIds
        }
        if (isAddingClub) {
            let updatedClubs = clubs.reduce((obj, item) => {
                if (item.clubName !== '') {
                    obj.name.push(item.clubName)
                }
                return obj
            }, ({ name: [] }))
            updatedUserDetail.newClubs = updatedClubs.name
        }
        if (isEditingClubs) {
            let editedClubs = [];
            this.props.user.clubs.forEach((club, idx) => {
                if (this.state.deletedClubsIds.indexOf(club.clubId) === -1 && this.state.clubs.find(c => c.clubId === club.clubId).clubName !== club.clubName) editedClubs.push(this.state.clubs[idx]);
            })
            if (editedClubs.length > 0) updatedUserDetail.editedClubs = editedClubs;
        }
        if (picture && (picture.path || picture.id)) updatedUserDetail.picture = picture;
        if (updatedUserDetail.picture || updatedUserDetail.id) {
            this.props.updateUser(updatedUserDetail);
            Toast.show({ text: 'Uploading image... We will let you know once it is completed' });
            setTimeout(this.gotoPreviousPage, 200);
        } else {
            this.updatingUser = true;
            this.setState({ showLoader: true });
            this.props.updateUser(updatedUserDetail, (res) => {
                this.hideLoader()
            }, (er) => {
                this.hideLoader()
            });
        }
    }

    selectDeleteClubs = (item, index) => {
        if (item.clubId) {
            this.setState(prevState => ({ deletedClubsIds: [...prevState.deletedClubsIds, item.clubId] }))
        } else {
            this.setState(prevState => ({ clubs: [...prevState.clubs.slice(0, index), ...prevState.clubs.slice(index + 1)] }))
        }
    }

    unselectDeletedClubs = (item, index) => this.setState(prevState => ({ deletedClubsIds: prevState.deletedClubsIds.filter(id => id !== item.clubId) }))

    clubsKeyExtractor = (item) => item.clubId;

    unselectProfilePic = () => this.setState(prevState => ({ user: { ...prevState.user, picture: null }, deletedId: this.state.user.profilePictureId }));

    addBottomPaddingForScrollView(index) { this.setState({ btmOffset: index * 20 }); }

    removeBottomPaddingForScrollView = () => this.setState({ btmOffset: 0 });

    addNewClub = () => ((this.state.clubs.length > 0 && this.state.clubs[0].clubName !== '') || (this.state.clubs.length === 0)) && this.setState(prevState => ({ isAddingClub: true, clubs: [{ clubName: '' }, ...prevState.clubs,] }))

    editClubs = () => this.setState(prevState => ({ clubs: this.props.user.clubs, isEditingClubs: true }))

    render() {
        const GENDER_LIST = [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }];
        const { user, showLoader, isAddingClub, clubs, isEditingClubs, deletedClubsIds } = this.state;
        return (
            <BasePage heading={'Edit Profile'} showLoader={showLoader}>
                <KeyboardAvoidingView keyboardVerticalOffset={20} behavior={IS_ANDROID ? null : 'padding'} style={styles.fill}>
                    <ScrollView contentContainerStyle={{ paddingBottom: styles.submitBtn.height, bottom: this.state.btmOffset }}>
                        {
                            user && user.picture && (user.picture.path || user.picture.profilePictureId || user.picture.id)
                                ? <SelectedImage
                                    outerContainer={{ marginTop: APP_COMMON_STYLES.statusBar.height }}
                                    image={{ uri: user.picture.path ? user.picture.path : `${GET_PICTURE_BY_ID}${user.picture.id ? user.picture.id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG) : user.picture.profilePictureId.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` }}
                                    onPressCloseImg={this.unselectProfilePic}
                                />
                                : <View style={styles.imageUploadIconsCont}>
                                    <TouchableWithoutFeedback onPress={this.onPressCameraIcon}>
                                    <View style={styles.imageUploadIcon}>
                                        <ImageButton onPress={this.onPressCameraIcon} imageSrc={require('../../../../assets/img/cam-icon.png')} imgStyles={styles.iconStyle} />
                                        <DefaultText style={styles.uploadImageIconLabel}>{' TAKE \nPHOTO'}</DefaultText>
                                    </View>
                                    </TouchableWithoutFeedback>
                                    <TouchableWithoutFeedback onPress={this.onPressGalleryIcon}>
                                    <View style={styles.imageUploadIcon}>
                                        <ImageButton onPress={this.onPressGalleryIcon} imageSrc={require('../../../../assets/img/upload-icon-orange.png')} imgStyles={styles.iconStyle} />
                                        <DefaultText style={styles.uploadImageIconLabel}>{'UPLOAD \n PHOTO'}</DefaultText>
                                    </View>
                                    </TouchableWithoutFeedback>
                                    <TouchableWithoutFeedback onPress={this.onPressSelectFromAlbum}>
                                    <View style={styles.imageUploadIcon} >
                                        <ImageButton onPress={this.onPressSelectFromAlbum} imageSrc={require('../../../../assets/img/photos-icon.png')} imgStyles={styles.iconStyle} />
                                        <DefaultText style={[styles.uploadImageIconLabel, { letterSpacing: 0.6 }]}>{'SELECT FROM \n MY PHOTOS'}</DefaultText>
                                    </View>
                                    </TouchableWithoutFeedback>
                                </View>
                        }
                        <View style={styles.container}>
                            <LabeledInputPlaceholder
                                containerStyle={{ backgroundColor: '#F4F4F4' }}
                                inputValue={user.name} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[0] = elRef} returnKeyType='next'
                                onChange={this.onChangeName} label='NAME' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                containerStyle={{ backgroundColor: '#F4F4F4' }}
                                inputValue={user.nickname} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[1] = elRef} returnKeyType='next'
                                onChange={this.onChangeNickName} label='NICKNAME' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[2].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                containerStyle={{ backgroundColor: '#F4F4F4' }}
                                inputValue={user.homeAddress.address} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[2] = elRef} returnKeyType='next'
                                onChange={this.onChangeStreetAddress} label='STREET ADDRESS' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[3].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                containerStyle={{ backgroundColor: '#F4F4F4' }}
                                inputValue={user.homeAddress.city} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[3] = elRef} returnKeyType='next'
                                onChange={this.onChangeCity} label='CITY' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[4].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                containerStyle={{ backgroundColor: '#F4F4F4' }}
                                inputValue={user.homeAddress.state} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[4] = elRef} returnKeyType='next'
                                onChange={this.onChangeState} label='STATE' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[5].focus()} hideKeyboardOnSubmit={false} />

                            <LabeledInputPlaceholder
                                containerStyle={{ backgroundColor: '#F4F4F4' }}
                                inputValue={user.homeAddress.zipCode ? user.homeAddress.zipCode + '' : ''}
                                inputType={'postalCode'} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[5] = elRef} returnKeyType='next'
                                onChange={this.onChangeZipCode} label='ZIP CODE' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[6].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                containerStyle={{ backgroundColor: '#F4F4F4' }}
                                inputValue={user.phoneNumber ? user.phoneNumber + '' : ''}
                                inputType={'telephoneNumber'} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[6] = elRef} returnKeyType='next'
                                onChange={this.onChangePhone} label='PHONE' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[7].focus()} hideKeyboardOnSubmit={false} />
                            <IconicList
                                placeholder={'Select any'}
                                pickerStyle={{ borderBottomWidth: 0, paddingTop: IS_ANDROID ? 0 : 10 }}
                                textStyle={{ paddingLeft: 10, fontSize: 14 }}
                                selectedValue={user.gender} values={GENDER_LIST} labelPlaceHolder='GENDER'
                                outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(3), }}
                                containerStyle={{ height: 40 }}
                                labelPlaceHolderStyle={[styles.labelStyle, { marginTop: 2 }]}
                                innerContainerStyle={{ borderBottomWidth: 1, backgroundColor: '#F4F4F4' }} onChange={this.onChangeGender} />
                            
                            <IconicDatePicker
                                pickerBorderIos={{ borderBottomWidth: 1, borderBottomColor: '#000' }}
                                selectedDate={user.dob || new Date()} datePickerStyle={{ paddingLeft: 5, paddingBottom: 1, fontSize: 14 }}
                                outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(3) }}
                                onChange={IS_ANDROID?this.onChangeDOBandroid :this.onChangeDOBios} label='BIRTHDAY' labelStyle={styles.labelStyle} />
                                
                            <LabeledInputPlaceholder
                                containerStyle={{ backgroundColor: '#F4F4F4' }}
                                inputValue={user.ridingSince || ""} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[7] = elRef}
                                onChange={this.onChangeRidingSince} label='RIDING SINCE' labelStyle={styles.labelStyle}
                                returnKeyType='next'
                                hideKeyboardOnSubmit={true}
                            />
                        </View>
                        <View style={styles.clubLabelCont}>
                            <DefaultText style={[styles.labelStyle, { marginLeft: 43, color: '#FFFFFF' }]} text={'CLUB(s)'} />
                            {
                                isEditingClubs
                                    ? null
                                    : isAddingClub
                                        ? <IconButton style={{ marginRight: 20 }} iconProps={{ name: 'ios-add-circle', type: 'Ionicons', style: { fontSize: 20, color: '#fff' } }} onPress={this.addNewClub} />
                                        : <View style={{ flexDirection: 'row' }}>
                                            <BasicButton title='EDIT' style={styles.editBtn} titleStyle={styles.editBtnTitle} onPress={this.editClubs} />
                                            <IconButton style={{ marginRight: 20 }} iconProps={{ name: 'ios-add-circle', type: 'Ionicons', style: { fontSize: 20, color: '#fff' } }} onPress={this.addNewClub} />
                                        </View>
                            }
                        </View>
                        {(isAddingClub || isEditingClubs) && <FlatList
                            data={clubs}
                            renderItem={({ item, index }) => (
                                <View style={styles.editClubCont}>
                                    {(isEditingClubs || isAddingClub) && <IconButton style={{ marginRight: 16 }} iconProps={{ name: 'ios-close-circle', type: 'Ionicons', style: { fontSize: 18, color: deletedClubsIds.some(id => id === item.clubId) ? '#CE0D0D' : '#C4C6C8' } }} onPress={() => deletedClubsIds.some(id => id === item.clubId) ? this.unselectDeletedClubs(item, index) : this.selectDeleteClubs(item, index)} />}
                                    <LabeledInputPlaceholder
                                        onFocus={IS_ANDROID ? null : () => this.addBottomPaddingForScrollView(7 + index + 1)}
                                        onBlur={IS_ANDROID ? null : this.removeBottomPaddingForScrollView}
                                        editable={!deletedClubsIds.some(id => id === item.clubId)}
                                        containerStyle={{ backgroundColor: '#F4F4F4' }}
                                        inputValue={item.clubName} inputStyle={{ paddingBottom: 0, height: 25, width: 254, }}
                                        returnKeyType='next'
                                        onChange={(item) => this.onChangeClubs(item, index)}
                                        hideKeyboardOnSubmit={true}
                                    />
                                </View>
                            )}
                        />
                        }
                        {
                            !isEditingClubs && <FlatList
                                keyboardShouldPersistTaps={'handled'}
                                style={{ marginBottom: heightPercentageToDP(3) }}
                                data={user.clubs}
                                keyExtractor={this.clubsKeyExtractor}
                                renderItem={({ item, index }) => (
                                    <View style={[styles.clubNameCont, styles.clubNameAlignment]}>
                                        <DefaultText style={{ fontSize: 15 }} text={item.clubName} />
                                    </View>
                                )}
                            />

                        }
                        <BasicButton title='UPDATE' style={styles.submitBtn} titleStyle={{ letterSpacing: 1.4, fontSize: 14, fontFamily: CUSTOM_FONTS.robotoBold }} onPress={this.onSubmit} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </BasePage>
        );
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    return { user };
}
const mapDispatchToProps = (dispatch) => {
    return {
        updateUser: (userInfo, successCallback, errorCallback) => dispatch(updateUserInfo(userInfo, successCallback, errorCallback)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(EditProfileForm);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
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
    submitBtn: {
        height: 35,
        backgroundColor: '#f69039',
        width: 213,
        alignSelf: 'center',
        borderRadius: 20,
        marginTop: 20
    },
    clubLabelCont: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: heightPercentageToDP(3),
        width: 309,
        backgroundColor: '#2B77B4',
        height: 30,
        borderTopRightRadius: 15,
        borderBottomRightRadius: 15,
        alignItems: 'center',

    },
    labelStyle: {
        fontSize: 11,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 1.1,
    },
    clubNameCont: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#707070',
        marginTop: 17,
        paddingHorizontal: 10
    },
    clubNameAlignment: {
        marginLeft: 53,
        marginRight: 78,
    },
    editClubCont: {
        marginTop: 17,
        flexDirection: 'row',
        marginRight: 78,
        marginLeft: 22
    },
    container: {
        marginLeft: widthPercentageToDP(12),
        marginTop: heightPercentageToDP(2),
    },
    editBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2B77B4',
        borderWidth: 1,
        borderColor: '#FFFFFF',
        borderRadius: 7,
        paddingVertical: 2,
        paddingHorizontal: 3,
        marginRight: 20
    },
    editBtnTitle: {
        fontSize: 11,
        fontFamily: CUSTOM_FONTS.robotoBold,
        letterSpacing: 1.1
    }
});