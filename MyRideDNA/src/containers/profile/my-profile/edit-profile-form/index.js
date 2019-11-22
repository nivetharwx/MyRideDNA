import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, KeyboardAvoidingView, StatusBar, Platform, ScrollView, View, Keyboard, Alert, TextInput, Text, FlatList } from 'react-native';
import { BasicHeader } from '../../../../components/headers';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, CUSTOM_FONTS } from '../../../../constants';
import { Actions } from 'react-native-router-flux';
import { LabeledInput, IconicList, IconicDatePicker, IconicInput, LabeledInputPlaceholder } from '../../../../components/inputs';
import { BasicButton, IconButton, ImageButton, ShifterButton } from '../../../../components/buttons';
import { Thumbnail } from '../../../../components/images';
import ImageCropPicker from 'react-native-image-crop-picker';
import { addBikeToGarage, editBike, updateUserInfo, updateProfilePicture, addClubs, updateClubs, removeClubs } from '../../../../api';
import { toggleLoaderAction, appNavMenuVisibilityAction } from '../../../../actions';
import { DatePicker, Icon as NBIcon, Toast } from 'native-base';
import { Loader } from '../../../../components/loader';
import ImagePicker from 'react-native-image-crop-picker';
import { DefaultText } from '../../../../components/labels';

class EditProfileForm extends Component {
    fieldRefs = [];
    vScroll = null;
    changedDetails = {};
    updatingUser = false;
    constructor(props) {
        super(props);
        this.state = {
            user: {
                ...props.user
            },
            club: '',
            showLoader: false,
            isLoadingProfPic: false,
            isAddingClub: false,
            activeClubId: null,
            profilePicObj: null
        };
        if (!props.user.homeAddress) {
            this.state.user.homeAddress = { address: '', city: '', state: '', zipCode: '' };
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.user !== this.props.user) {
            if (prevProps.user.clubs !== this.props.user.clubs) {
                this.setState({
                    user: {
                        ...this.props.user
                    }
                })
            }
            // DOC: Confirming changes happened due to api call from this form
            if (this.updatingUser === true) {
                Toast.show({ text: 'Profile updated successfully' });
                this.onPressBackButton();
            }
        }
    }

    onChangeName = (val) => {
        // this.changedDetails['name'] = val;
        this.setState(prevState => ({ user: { ...prevState.user, name: val + '' } }));
    }

    onChangeNickName = (val) => {
        // this.changedDetails['nickname'] = val;
        this.setState(prevState => ({ user: { ...prevState.user, nickname: val + '' } }));
    }

    onChangeGender = (val) => {
        // this.changedDetails['gender'] = val;
        this.setState(prevState => ({ user: { ...prevState.user, gender: val + '' } }));
    }

    onChangeDOB = (val) => {
        // this.changedDetails['dob'] = new Date(val).toISOString();
        this.setState(prevState => ({ user: { ...prevState.user, dob: new Date(val).toISOString() } }));
    }

    onChangeStreetAddress = (val) => {
        // this.changedDetails['homeAddress'] = {
        //     ...this.changedDetails.homeAddress,
        //     address: val
        // };
        this.setState(prevState => ({ user: { ...prevState.user, homeAddress: { ...prevState.user.homeAddress, address: val + '' } } }));
    }

    onChangeCity = (val) => {
        // this.changedDetails['homeAddress'] = {
        //     ...this.changedDetails.homeAddress,
        //     city: val
        // };
        this.setState(prevState => ({ user: { ...prevState.user, homeAddress: { ...prevState.user.homeAddress, city: val + '' } } }));
    }

    onChangeState = (val) => {
        // this.changedDetails['homeAddress'] = {
        //     ...this.changedDetails.homeAddress,
        //     state: val
        // };
        this.setState(prevState => ({ user: { ...prevState.user, homeAddress: { ...prevState.user.homeAddress, state: val + '' } } }));
    }

    onChangeCountry = (val) => {
        // this.changedDetails['homeAddress'] = {
        //     ...this.changedDetails.homeAddress,
        //     country: val
        // };
        this.setState(prevState => ({ user: { ...prevState.user, homeAddress: { ...prevState.user.homeAddress, country: val + '' } } }));
    }

    onChangeZipCode = (val) => {
        // this.changedDetails['homeAddress'] = {
        //     ...this.changedDetails.homeAddress,
        //     zipCode: val
        // };
        this.setState(prevState => ({ user: { ...prevState.user, homeAddress: { ...prevState.user.homeAddress, zipCode: val + '' } } }));
    }
    onChangePhone = (val) => {
        // this.changedDetails['gender'] = val;
        this.setState(prevState => ({ user: { ...prevState.user, phoneNumber: val + '' } }));
    }
    onChangeRidingSince = (val) => {
        // this.changedDetails['gender'] = val;
        this.setState(prevState => ({ user: { ...prevState.user, ridingSince: val + '' } }));
    }
    // onChangeClubs = (val) => {
    //     // this.changedDetails['gender'] = val;
    //     this.setState(prevState => ({ user: { ...prevState.user, club: val + '' } }));
    // }
    onChangeClubs = (val) => {
        // this.changedDetails['gender'] = val;
        this.setState({ club: val });
    }

    onPressBackButton = () => Actions.pop();
    hideLoader = () => {
        this.setState({ showLoader: false });
    }
    onSubmit = () => {
        Keyboard.dismiss();
        // this.state.user.clubList = this.state.user.club.split(",");
        this.updatingUser = true;
        this.setState({ showLoader: true })
        this.props.updateUser(this.state.user, (res) => {
            this.hideLoader()
        }, (err) => {
            this.hideLoader()
        });
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
            Toast.show({ text: 'One image selected' });
            this.setState(prevState => ({ user: { ...prevState.user, mimeType: imageObj.mime, profilePicture: imageObj.data } }));
            // this.props.updateProfilePicture(imageObj.data, imageObj.mime, this.props.user.userId);
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
            Toast.show({ text: 'One image selected' });
            this.setState(prevState => ({ user: { ...prevState.user, mimeType: imageObj.mime, profilePicture: imageObj.data } }));
            // this.props.updateProfilePicture(imageObj.data, imageObj.mime, this.props.user.userId);
        } catch (er) {
            this.setState({ isLoadingProfPic: false });
            console.log("Error occurd: ", er);
        }

    }

    clubFormat = () => {
        const clubList = this.state.user.club.split(",");
        for (var i = 0; i < clubList.length - 1; i++) {
            if (clubList[i].trim() === clubList[i + 1].trim()) {
                console.log('club already present : ', clubList[i + 1]);
            }
        }
    }

    addingClub = () => {
        this.props.addClubs(this.props.user.userId, this.state.club, this.props.user.clubs)
        this.setState({ isAddingClub: false, club: '' })
    }

    editClub = (item) => {
        this.props.updateClubs(this.props.user.userId, this.state.club, item.clubId, this.props.user.clubs)
        this.setState({ activeClubId: null, club: '' })
    }

    deleteClub = (item) => {
        this.props.removeClubs(this.props.user.userId, item.clubId, this.props.user.clubs)
    }

    clubsKeyExtractor = (item) => item.clubId;

    showAppNavMenu = () => this.props.showAppNavMenu();

    render() {
        const GENDER_LIST = [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }];
        const { user, showLoader, isAddingClub, club, activeClubId } = this.state;
        return (
            <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <KeyboardAvoidingView behavior={IS_ANDROID ? null : 'padding'} style={styles.fill}>
                    <BasicHeader title='Edit Profile' leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }} />
                    <ScrollView keyboardShouldPersistTaps='always'>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 41 + APP_COMMON_STYLES.headerHeight }}>
                            <View style={{ alignSelf: 'center', alignItems: 'center' }}>
                                <ImageButton onPress={this.onPressCameraIcon} imageSrc={require('../../../../assets/img/cam-icon.png')} imgStyles={{ width: 45, height: 37 }} />
                                <DefaultText style={{ letterSpacing: 2, marginTop: 15, fontFamily: CUSTOM_FONTS.robotoSlabBold, color: '#000', fontSize: 12 }}>{' TAKE \nPHOTO'}</DefaultText>
                            </View>
                            <View style={{ alignSelf: 'center', alignItems: 'center' }}>
                                <ImageButton onPress={this.onPressGalleryIcon} imageSrc={require('../../../../assets/img/photos-icon.png')} imgStyles={{ width: 41, height: 33 }} />
                                <DefaultText style={{ letterSpacing: 2, marginTop: 15, fontFamily: CUSTOM_FONTS.robotoSlabBold, color: '#000', fontSize: 12 }}>{'UPLOAD \n PHOTO'}</DefaultText>
                            </View>
                        </View>
                        <View style={{ marginLeft: widthPercentageToDP(12), marginTop: heightPercentageToDP(3) }}>

                            {/* <LabeledInputPlaceholder containerStyle={{ }} inputValue={user.homeAddress.country} inputRef={elRef => this.fieldRefs[5] = elRef} onChange={this.onChangeCountry} placeholder='Country' onSubmit={() => { }} hideKeyboardOnSubmit={true} /> */}
                            <LabeledInputPlaceholder
                                inputValue={user.name} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[0] = elRef} returnKeyType='next'
                                onChange={this.onChangeName} label='NAME' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false} />

                            <LabeledInputPlaceholder
                                inputValue={user.nickname} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[1] = elRef} returnKeyType='next'
                                onChange={this.onChangeNickName} label='NICKNAME' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[2].focus()} hideKeyboardOnSubmit={false} />

                            <LabeledInputPlaceholder
                                inputValue={user.homeAddress.address} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[2] = elRef} returnKeyType='next'
                                onChange={this.onChangeStreetAddress} label='STREET ADDRESS' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[3].focus()} hideKeyboardOnSubmit={false} />

                            <LabeledInputPlaceholder
                                inputValue={user.homeAddress.city} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[3] = elRef} returnKeyType='next'
                                onChange={this.onChangeCity} label='CITY' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[4].focus()} hideKeyboardOnSubmit={false} />

                            <LabeledInputPlaceholder
                                inputValue={user.homeAddress.state} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[4] = elRef} returnKeyType='next'
                                onChange={this.onChangeState} label='STATE' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[5].focus()} hideKeyboardOnSubmit={false} />

                            <LabeledInputPlaceholder
                                inputValue={user.homeAddress.zipCode || ""} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[5] = elRef} returnKeyType='next'
                                onChange={this.onChangeZipCode} label='ZIP CODE' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[6].focus()} hideKeyboardOnSubmit={false} />

                            <LabeledInputPlaceholder
                                inputValue={user.phoneNumber || ""} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[6] = elRef} returnKeyType='next'
                                onChange={this.onChangePhone} label='PHONE' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[7].focus()} hideKeyboardOnSubmit={false} />

                            <IconicList
                                pickerStyle={{ borderBottomWidth: 0 }}
                                selectedValue={user.gender} values={GENDER_LIST} labelPlaceHolder='GENDER'
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                                labelPlaceHolderStyle={[styles.labelStyle, { marginTop: heightPercentageToDP(1) }]}
                                innerContainerStyle={{ borderBottomWidth: 1 }} onChange={this.onChangeGender} />

                            <IconicDatePicker
                                selectedDate={user.dob} datePickerStyle={{ paddingLeft: 0, paddingBottom: 1, fontSize: heightPercentageToDP(2.3) }}
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                                onChange={this.onChangeDOB} label='BIRTHDAY' labelStyle={styles.labelStyle} />


                            <LabeledInputPlaceholder
                                inputValue={user.ridingSince || ""} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[7] = elRef} returnKeyType='next'
                                onChange={this.onChangeRidingSince} label='RIDING SINCE' labelStyle={styles.labelStyle}
                                hideKeyboardOnSubmit={false} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: heightPercentageToDP(3) }}>
                                <Text style={[styles.labelStyle, { marginLeft: 0 }]}>CLUB(s)</Text>
                                <IconButton style={styles.roundBtnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: widthPercentageToDP(5), color: '#fff' } }} onPress={() => this.setState({ isAddingClub: true, activeClubId: null, club: '' })} />
                            </View>
                            {
                                isAddingClub ?
                                    <View style={{ marginTop: heightPercentageToDP(3), flexDirection: 'row' }}>
                                        <LabeledInputPlaceholder
                                            inputValue={club} inputStyle={{ paddingBottom: 0, borderWidth: 1, height: heightPercentageToDP(4.2), width: widthPercentageToDP(55), borderRadius: 3 }}
                                            inputRef={elRef => this.fieldRefs[7] = elRef} returnKeyType='next'
                                            onChange={this.onChangeClubs}
                                            hideKeyboardOnSubmit={false} />
                                        <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-around', marginTop: heightPercentageToDP(0.5) }}>
                                            <IconButton style={[styles.roundBtnCont, { backgroundColor: APP_COMMON_STYLES.infoColor }]} iconProps={{ name: 'check', type: 'AntDesign', style: { fontSize: widthPercentageToDP(5), color: '#fff' } }} onPress={this.addingClub} />
                                            <IconButton style={[styles.roundBtnCont, { backgroundColor: APP_COMMON_STYLES.infoColor }]} iconProps={{ name: 'close', type: 'AntDesign', style: { fontSize: widthPercentageToDP(5), color: '#fff' } }} onPress={() => this.setState({ isAddingClub: false, club: '' })} />
                                        </View>
                                    </View>
                                    :
                                    null
                            }
                            {
                                user.clubs ?
                                    <FlatList
                                        style={{ marginBottom: heightPercentageToDP(3) }}
                                        data={user.clubs}
                                        contentContainerStyle={styles.clubList}
                                        keyExtractor={this.clubsKeyExtractor}
                                        renderItem={({ item, index }) => (
                                            <View>
                                                {
                                                    activeClubId === item.clubId
                                                        ?
                                                        <View style={{ marginVertical: heightPercentageToDP(2), flexDirection: 'row' }}>
                                                            <LabeledInputPlaceholder
                                                                inputValue={club} inputStyle={{ paddingBottom: 0, borderWidth: 1, height: heightPercentageToDP(4.2), width: widthPercentageToDP(55), borderRadius: 3 }}
                                                                inputRef={elRef => this.fieldRefs[7] = elRef} returnKeyType='next'
                                                                onChange={this.onChangeClubs}
                                                                hideKeyboardOnSubmit={false} />
                                                            <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-around', marginTop: heightPercentageToDP(0.5) }}>
                                                                <IconButton style={[styles.roundBtnCont, { backgroundColor: APP_COMMON_STYLES.infoColor }]} iconProps={{ name: 'check', type: 'AntDesign', style: { fontSize: widthPercentageToDP(3), color: '#fff' } }} onPress={() => this.editClub(item)} />
                                                                <IconButton style={[styles.roundBtnCont, { backgroundColor: APP_COMMON_STYLES.infoColor }]} iconProps={{ name: 'close', type: 'AntDesign', style: { fontSize: widthPercentageToDP(3), color: '#fff' } }} onPress={() => this.setState({ activeClubId: null, club: '' })} />
                                                            </View>
                                                        </View>
                                                        :
                                                        <View style={{ paddingVertical: heightPercentageToDP(1.5), flexDirection: 'row', justifyContent: 'space-between' }}>
                                                            <Text style={{ color: '#000', fontSize: heightPercentageToDP(2) }}>{item.clubName}</Text>
                                                            <View style={{ flexDirection: 'row', marginRight: widthPercentageToDP(10), justifyContent: 'space-around' }}>
                                                                <IconButton style={[styles.roundBtnCont, { backgroundColor: APP_COMMON_STYLES.infoColor }]} iconProps={{ name: 'edit', type: 'FontAwesome', style: { fontSize: widthPercentageToDP(3), color: '#fff' } }} onPress={() => this.setState({ activeClubId: item.clubId, isAddingClub: false, club: item.clubName })} />
                                                                <IconButton style={[styles.roundBtnCont, { backgroundColor: APP_COMMON_STYLES.infoColor }]} iconProps={{ name: 'delete', type: 'AntDesign', style: { fontSize: widthPercentageToDP(3), color: '#fff' } }} onPress={() => this.deleteClub(item)} />
                                                            </View>
                                                        </View>
                                                }
                                            </View>
                                        )}
                                    />
                                    : null
                            }
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
    return { user };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        updateUser: (userInfo, successCallback, errorCallback) => dispatch(updateUserInfo(userInfo, successCallback, errorCallback)),
        updateProfilePicture: (profilePicStr, mimeType, userId) => dispatch(updateProfilePicture(profilePicStr, mimeType, userId)),
        addClubs: (userId, clubName, clubs) => dispatch(addClubs(userId, clubName, clubs)),
        updateClubs: (userId, clubName, clubId, clubs) => dispatch(updateClubs(userId, clubName, clubId, clubs)),
        removeClubs: (userId, clubId, clubs) => dispatch(removeClubs(userId, clubId, clubs)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(EditProfileForm);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
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
        height: heightPercentageToDP(9),
        backgroundColor: '#f69039',
        marginTop: heightPercentageToDP(8)
    },
    formFieldIcon: {
        color: '#999999'
    },
    addressInput: {
        width: '48%',
        borderBottomColor: '#D4D4D4',
        borderBottomWidth: 1
    },
    labelStyle: {
        fontSize: 11,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 1.1,
    },
    clubList: {
        marginHorizontal: widthPercentageToDP(1),
        paddingTop: widthPercentageToDP(1),
    },
    roundBtnCont: {
        height: widthPercentageToDP(5),
        width: widthPercentageToDP(5),
        borderRadius: widthPercentageToDP(2.5),
        backgroundColor: '#a8a8a8',
        marginRight: 20
    },
});