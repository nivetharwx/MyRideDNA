import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, KeyboardAvoidingView, StatusBar, Platform, ScrollView, View, Keyboard, Alert, TextInput, Text } from 'react-native';
import { BasicHeader } from '../../../../components/headers';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, IS_ANDROID } from '../../../../constants';
import { Actions } from 'react-native-router-flux';
import { LabeledInput, IconicList, IconicDatePicker, IconicInput } from '../../../../components/inputs';
import { BasicButton } from '../../../../components/buttons';
import { Thumbnail } from '../../../../components/images';
import ImageCropPicker from 'react-native-image-crop-picker';
import { addBikeToGarage, editBike, updateUserInfo } from '../../../../api';
import { toggleLoaderAction } from '../../../../actions';
import { DatePicker, Icon as NBIcon, Toast } from 'native-base';

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
            }
        };
        if (!props.user.homeAddress) {
            this.state.user.homeAddress = { address: '', city: '', state: '', country: '', zipCode: '' };
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.user !== this.props.user) {
            // DOC: Confirming changes happened due to api call from this form
            if (this.updatingUser === true) {
                Toast.show({
                    text: 'Profile updated successfully',
                    buttonText: 'Okay'
                });
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

    onChangeAddress = (val) => {
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

    onPressBackButton = () => Actions.pop();

    onSubmit = () => {
        Keyboard.dismiss();
        this.updatingUser = true;
        this.props.updateUser(this.state.user);
    }

    render() {
        const GENDER_LIST = [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }];
        const { user } = this.state;
        console.log('user : ', user)
        return (
            <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <KeyboardAvoidingView behavior={IS_ANDROID ? null : 'padding'} style={styles.fill}>
                    <BasicHeader title='Edit Profile' leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }} />
                    <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
                        <LabeledInput containerStyle={{ marginHorizontal: widthPercentageToDP(2) }} inputValue={user.email} editable={false} />
                        <LabeledInput containerStyle={{ marginHorizontal: widthPercentageToDP(2) }} inputValue={user.name} inputRef={elRef => this.fieldRefs[0] = elRef} returnKeyType='next' onChange={this.onChangeName} placeholder='Name' onSubmit={() => this.fieldRefs[0].focus()} hideKeyboardOnSubmit={false} />
                        <LabeledInput containerStyle={{ marginHorizontal: widthPercentageToDP(2) }} inputValue={user.nickname} inputRef={elRef => this.fieldRefs[1] = elRef} returnKeyType='next' onChange={this.onChangeNickName} placeholder='Nick Name' onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false} />

                        <IconicList
                            selectedValue={user.gender} placeholder='Gender' values={GENDER_LIST}
                            onChange={this.onChangeGender} />
                        <IconicDatePicker selectedDate={user.dob} onChange={this.onChangeDOB} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <LabeledInput containerStyle={{ flex: 1, marginHorizontal: widthPercentageToDP(2) }} inputValue={user.homeAddress.address} inputRef={elRef => this.fieldRefs[2] = elRef} returnKeyType='next' onChange={this.onChangeAddress} placeholder='Building number, street' onSubmit={() => this.fieldRefs[2].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInput containerStyle={{ flex: 1, marginHorizontal: widthPercentageToDP(2) }} inputValue={user.homeAddress.city} inputRef={elRef => this.fieldRefs[3] = elRef} returnKeyType='next' onChange={this.onChangeCity} placeholder='City' onSubmit={() => this.fieldRefs[3].focus()} hideKeyboardOnSubmit={false} />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <LabeledInput containerStyle={{ flex: 1, marginHorizontal: widthPercentageToDP(2) }} inputValue={user.homeAddress.state} inputRef={elRef => this.fieldRefs[4] = elRef} returnKeyType='next' onChange={this.onChangeState} placeholder='State' onSubmit={() => this.fieldRefs[4].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInput containerStyle={{ flex: 1, marginHorizontal: widthPercentageToDP(2) }} inputValue={user.homeAddress.country} inputRef={elRef => this.fieldRefs[5] = elRef} onChange={this.onChangeCountry} placeholder='Country' onSubmit={() => { }} hideKeyboardOnSubmit={true} />
                        </View>
                    </ScrollView>
                    <BasicButton title='SUBMIT' style={styles.submitBtn} onPress={this.onSubmit} />
                </KeyboardAvoidingView>
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
        updateUser: (userInfo) => dispatch(updateUserInfo(userInfo)),
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
        height: heightPercentageToDP(8.5),
    },
    formFieldIcon: {
        color: '#999999'
    },
    addressInput: {
        width: '48%',
        borderBottomColor: '#D4D4D4',
        borderBottomWidth: 1
    }
});