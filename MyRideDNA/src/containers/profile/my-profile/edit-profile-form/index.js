import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, SafeAreaView, StatusBar, ScrollView, View, Keyboard, Alert, TextInput, Text } from 'react-native';
import { BasicHeader } from '../../../../components/headers';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES } from '../../../../constants';
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
            if (this.changedDetails.userId) {
                Toast.show({
                    text: 'Profile updated successfully',
                    buttonText: 'Okay'
                });
                this.onPressBackButton();
            }
        }
    }

    onChangeName = (val) => {
        this.changedDetails['name'] = val;
        this.setState(prevState => ({ user: { ...prevState.user, name: val + '' } }));
    }

    onChangeNickname = (val) => {
        this.changedDetails['nickname'] = val;
        this.setState(prevState => ({ user: { ...prevState.user, nickname: val + '' } }));
    }

    onChangeGender = (val) => {
        this.changedDetails['gender'] = val;
        this.setState(prevState => ({ user: { ...prevState.user, gender: val + '' } }));
    }

    onChangeDOB = (val) => {
        this.changedDetails['dob'] = new Date(val).toISOString();
        this.setState(prevState => ({ user: { ...prevState.user, dob: this.changedDetails.dob } }));
    }

    onChangeAddress = (val) => {
        this.changedDetails['homeAddress'] = {
            ...this.changedDetails.homeAddress,
            address: val
        };
        this.setState(prevState => ({ user: { ...prevState.user, homeAddress: { ...prevState.user.homeAddress, address: val + '' } } }));
    }

    onChangeCity = (val) => {
        this.changedDetails['homeAddress'] = {
            ...this.changedDetails.homeAddress,
            city: val
        };
        this.setState(prevState => ({ user: { ...prevState.user, homeAddress: { ...prevState.user.homeAddress, city: val + '' } } }));
    }

    onChangeState = (val) => {
        this.changedDetails['homeAddress'] = {
            ...this.changedDetails.homeAddress,
            state: val
        };
        this.setState(prevState => ({ user: { ...prevState.user, homeAddress: { ...prevState.user.homeAddress, state: val + '' } } }));
    }

    onChangeCountry = (val) => {
        this.changedDetails['homeAddress'] = {
            ...this.changedDetails.homeAddress,
            country: val
        };
        this.setState(prevState => ({ user: { ...prevState.user, homeAddress: { ...prevState.user.homeAddress, country: val + '' } } }));
    }

    onChangeZipCode = (val) => {
        this.changedDetails['homeAddress'] = {
            ...this.changedDetails.homeAddress,
            zipCode: val
        };
        this.setState(prevState => ({ user: { ...prevState.user, homeAddress: { ...prevState.user.homeAddress, zipCode: val + '' } } }));
    }

    onPressBackButton = () => Actions.pop();

    onSubmit = () => {
        Keyboard.dismiss();
        if (Object.keys(this.changedDetails).length > 0) {
            this.changedDetails.userId = this.state.user.userId;
            this.changedDetails.email = this.state.user.email;
            this.props.updateUser(this.changedDetails);
        } else {
            Toast.show({
                text: 'Profile updated successfully',
                buttonText: 'Okay',
                onClose: this.onPressBackButton
            });
        }
    }

    render() {
        const GENDER_LIST = [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }];
        const { user } = this.state;
        return (
            <View style={[styles.fill, { paddingBottom: 20 }]}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={styles.fill}>
                    <BasicHeader title='Edit Profile' leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }} />
                    <ScrollView style={styles.formContent}>
                        <IconicInput iconProps={{ name: 'md-person', type: 'Ionicons' }} inputType='name' placeholder='Name' value={user.name}
                            onChange={this.onChangeName} />
                        <IconicInput iconProps={{ name: 'md-person', type: 'Ionicons' }} inputType='name' placeholder='Nick Name' value={user.nickname}
                            onChange={this.onChangeNickname} />
                        <IconicList iconProps={{ name: 'transgender', type: 'FontAwesome' }} selectedValue={user.gender} placeholder='Gender'
                            onChange={this.onChangeGender} values={GENDER_LIST}></IconicList>
                        <IconicDatePicker iconProps={{ name: 'calendar', type: 'Foundation' }} onChange={this.onChangeDOB} selectedDateString={user.dob} />
                        <View style={{ marginVertical: 10 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ paddingLeft: 10, paddingRight: 5, justifyContent: 'center', alignItems: 'center' }}>
                                    <NBIcon name='address-card' type='FontAwesome' style={{ fontSize: 14, color: '#a9a9a9' }} />
                                </View>
                                <Text style={{ marginLeft: 5, fontSize: 16 }}>Address</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: 10 }}>
                                <TextInput style={styles.addressInput} placeholder='Building number, Street line' textContentType='addressCity'
                                    onChangeText={this.onChangeAddress} value={user.homeAddress.address} />
                                <TextInput style={styles.addressInput} placeholder='City' textContentType='addressCity'
                                    onChangeText={this.onChangeCity} value={user.homeAddress.city} />
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: 10 }}>
                                <TextInput style={{ width: '48%', borderBottomColor: '#D4D4D4', borderBottomWidth: 1 }} placeholder='State' textContentType='addressState'
                                    onChangeText={this.onChangeState} value={user.homeAddress.state} />
                                <TextInput style={styles.addressInput} placeholder='Country' textContentType='countryName'
                                    onChangeText={this.onChangeCountry} value={user.homeAddress.country} />
                            </View>
                            <TextInput style={[styles.addressInput, { marginLeft: 10 }]} placeholder='Postal code' textContentType='postalCode' keyboardType='numeric'
                                onChangeText={this.onChangeZipCode} value={user.homeAddress.zipCode} />
                        </View>
                    </ScrollView>
                    <BasicButton title='SUBMIT' style={styles.submitBtn} onPress={this.onSubmit} />
                </View>
            </View>
        );
    }
}

{/* <LabeledInput inputValue={user.name} inputRef={elRef => this.fieldRefs[0] = elRef} returnKeyType='next' onChange={this.onChangeName} placeholder='Name' onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false} />
                    <IconicList iconProps={{ style: styles.formFieldIcon, name: 'transgender', type: 'FontAwesome' }}
                        selectedValue={user.gender} placeholder='Gender' values={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]}
                        onChange={this.onChangeGender} />
                    <LabeledInput inputValue={user.dob} inputRef={elRef => this.fieldRefs[1] = elRef} returnKeyType='next' onChange={this.onChangeDOB} placeholder='DOB' onSubmit={() => this.fieldRefs[2].focus()} hideKeyboardOnSubmit={false} />
                    <IconicDatePicker />
                    <LabeledInput inputValue={user.address} inputRef={elRef => this.fieldRefs[2] = elRef} returnKeyType='next' onChange={this.onChangeAddress} placeholder='Building number, street' onSubmit={() => this.fieldRefs[3].focus()} hideKeyboardOnSubmit={false} />
                    <LabeledInput inputValue={user.city} inputRef={elRef => this.fieldRefs[3] = elRef} returnKeyType='next' onChange={this.onChangeCity} placeholder='City' onSubmit={() => this.fieldRefs[4].focus()} hideKeyboardOnSubmit={false} />
                    <LabeledInput inputValue={user.state} inputRef={elRef => this.fieldRefs[4] = elRef} returnKeyType='next' onChange={this.onChangeState} placeholder='State' onSubmit={() => this.fieldRefs[5].focus()} hideKeyboardOnSubmit={false} />
                    <LabeledInput inputValue={user.country} inputRef={elRef => this.fieldRefs[5] = elRef} onChange={this.onChangeCountry} placeholder='Country' onSubmit={() => { }} hideKeyboardOnSubmit={true} /> */}

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
        flex: 1
    },
    formContent: {
        marginTop: APP_COMMON_STYLES.headerHeight,
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