import React, { Component } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, TextInput, SafeAreaView, Platform, StatusBar, Alert } from 'react-native';
import { Icon as NBIcon, Item } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';

import { IconicInput, IconicList, LabeledInput } from '../../components/inputs';
import { BasicHeader } from '../../components/headers';

import { LoginStyles } from '../../containers/login/styles';
import { WindowDimensions, APP_COMMON_STYLES, IS_ANDROID, widthPercentageToDP } from '../../constants';
import { LoginButton, SocialButtons, IconButton, RoundButton } from '../../components/buttons';
import { isValidEmailFormat } from '../../util';
import Spinner from 'react-native-loading-spinner-overlay';
import { validateEmailOnServer, registerUser } from '../../api';
import Md5 from 'react-native-md5';
import { toggleNetworkStatusAction } from '../../actions';
// import Snackbar from 'react-native-snackbar';

const ANDROID_HEADER_HEIGHT = 50;
const IOS_HEADER_HEIGHT = 90;
const HEADER_HEIGHT = IS_ANDROID ? ANDROID_HEADER_HEIGHT : IOS_HEADER_HEIGHT;

class Signup extends Component {
    isVerifyingEmail = false;
    fieldRefs = [];
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            hidePasswd: true,
            hideConfPasswd: true,
            confirmPassword: '',
            showLoader: false,
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.emailStatus !== this.props.emailStatus) {
            this.isVerifyingEmail = false;
        }
        if (prevProps.signupResult !== this.props.signupResult) {
            this.setState({ showLoader: false }, () => {
                if (this.props.signupResult.success) {
                    setTimeout(() => {
                        Alert.alert('Registration success', this.props.signupResult.success);
                    }, 100);
                    this.onPressBackButton();
                } else {
                    setTimeout(() => {
                        Alert.alert('Registration failed', this.props.signupResult.userMessage);
                    }, 100);
                }
            });
        }
    }

    onChangeName = (name) => {
        this.setState(prevState => ({ user: { ...prevState.user, name: name + '' } }));
    }

    onEmailChange = (email) => {
        this.setState(prevState => ({ user: { ...prevState.user, email: email + '' } }));
    }

    onGenderChange = (gender) => {
        this.setState(prevState => ({ user: { ...prevState.user, gender } }));
    }

    showNetworkError() {
        Alert.alert('Network Info', "Please connect to a network to continue", undefined, { cancelable: false });
    }

    validateEmail = () => {
        if (!this.props.hasNetwork) {
            this.showNetworkError();
            return;
        }
        if (isValidEmailFormat(this.state.user.email)) {
            this.isVerifyingEmail = true;
            this.props.validateEmailOnServer(this.state.user.email);
        } else {
            if (this.state.user.email && this.state.user.email.length > 0) {
                Alert.alert('Error', 'Entered email is not in the proper format');
            }
        }
    }

    onPasswordsChange = (passwd) => {
        this.setState(prevState => ({ user: { ...prevState.user, password: passwd } }));
    }

    onConfrimPasswordChange = (confirmPassword) => {
        this.setState({ confirmPassword });
    }

    validateFields() {
        if (!this.state.user.name) {
            Alert.alert('Field Error', 'Please provide your name');
            return false;
        }
        if (!this.isVerifyingEmail) {
            if (this.props.emailStatus.isExists === true) {
                Alert.alert('Email exists', 'Entered email is already registered with MyRideDNA');
                return false;
            } else if (!this.state.user.email) {
                Alert.alert('Field Error', 'Please provide your email');
                return false;
            }
        } else {
            return false
        }
        if (this.state.user.password !== this.state.confirmPassword) {
            Alert.alert('Field Error', 'Entered passwords are not matching');
            return false;
        }
        return true;
    }

    togglePasswordVisibility = () => {
        this.setState(prevState => ({ hidePasswd: !prevState.hidePasswd }));
    }

    toggleConfirmPasswordVisibility = () => {
        this.setState(prevState => ({ hideConfPasswd: !prevState.hideConfPasswd }));
    }

    onSubmit = () => {
        if (!this.props.hasNetwork) {
            this.showNetworkError();
            return;
        }
        // TODO: All validations
        if (this.validateFields()) {
            this.setState({ showLoader: true });
            this.props.registerUser({ ...this.state.user, password: Md5.hex_md5(this.state.user.password + '') });
        }
    }

    onPressBackButton = () => {
        Actions.pop();
    }

    render() {
        const { user, hidePasswd, hideConfPasswd, showLoader, confirmPassword } = this.state;
        return (
            <View style={{ flex: 1 }}>

                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <Spinner
                        visible={showLoader}
                        textContent={'Loading...'}
                        textStyle={{ color: '#fff' }}
                    />
                    <BasicHeader title='Signup' leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }} searchbarMode={false} />
                    <ScrollView style={{ backgroundColor: 'white', marginTop: HEADER_HEIGHT }} contentContainerStyle={{ paddingTop: 20, justifyContent: 'space-between' }}>
                        <LabeledInput inputRef={elRef => this.fieldRefs[0] = elRef} returnKeyType='next' onChange={this.onChangeName} placeholder='Name' onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false} />
                        <IconicList
                            selectedValue={user.gender} placeholder='Gender' values={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]}
                            onChange={this.onGenderChange} />
                        <LabeledInput onBlur={this.validateEmail} inputRef={elRef => this.fieldRefs[1] = elRef} returnKeyType='next' onChange={this.onEmailChange} placeholder='Email' inputType='emailAddress' onSubmit={() => this.fieldRefs[2].focus()} hideKeyboardOnSubmit={false} />
                        <Item style={{ marginLeft: widthPercentageToDP(4) }}>
                            <TextInput secureTextEntry={hidePasswd} style={{ flex: 1 }} value={user.password} ref={elRef => this.fieldRefs[2] = elRef} returnKeyType='next' onChangeText={this.onPasswordsChange} placeholder='New Password' onSubmitEditing={() => this.fieldRefs[3].focus()} blurOnSubmit={false} />
                            <IconButton onPress={this.togglePasswordVisibility} style={{ backgroundColor: '#0083CA', alignItems: 'center', justifyContent: 'center', width: widthPercentageToDP(8), height: widthPercentageToDP(8), borderRadius: widthPercentageToDP(4) }} iconProps={{ name: hidePasswd ? 'eye' : 'eye-off', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(6), paddingRight: 0, color: 'white' } }} />
                        </Item>
                        <Item style={{ marginLeft: widthPercentageToDP(4) }}>
                            <TextInput secureTextEntry={hideConfPasswd} style={{ flex: 1 }} value={confirmPassword} ref={elRef => this.fieldRefs[3] = elRef} returnKeyType='next' onChangeText={this.onConfrimPasswordChange} placeholder='Confirm Password' onSubmitEditing={() => { }} blurOnSubmit={true} />
                            <IconButton onPress={this.toggleConfirmPasswordVisibility} style={{ backgroundColor: '#0083CA', alignItems: 'center', justifyContent: 'center', width: widthPercentageToDP(8), height: widthPercentageToDP(8), borderRadius: widthPercentageToDP(4) }} iconProps={{ name: hideConfPasswd ? 'eye' : 'eye-off', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(6), paddingRight: 0, color: 'white' } }} />
                        </Item>
                        <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10, justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <RoundButton title='GO' style={{ height: 100, width: 100, borderRadius: 100 }} titleStyle={{ fontSize: 25 }} onPress={this.onSubmit} />
                            <TouchableOpacity><Text style={{ color: '#0083CA', fontSize: 17 }}>Privacy policy</Text></TouchableOpacity>
                        </View>
                        <View style={{ paddingVertical: (WindowDimensions.height * 5) / 100, backgroundColor: '#EB861E', alignItems: 'flex-end', paddingEnd: 10 }}>
                            <View style={{ flexDirection: 'row', width: '50%', justifyContent: 'space-around' }}>
                                <IconButton onPress={() => { }} style={{ paddingHorizontal: 0 }} iconProps={{ name: 'facebook', type: 'MaterialCommunityIcons', style: { backgroundColor: '#fff', color: '#EB861E', fontSize: 60, borderRadius: 5 } }} />
                                <IconButton onPress={() => { }} style={{ paddingHorizontal: 0 }} iconProps={{ name: 'google-', type: 'Entypo', style: { backgroundColor: '#fff', color: '#EB861E', fontSize: 60, borderRadius: 5 } }} />
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { emailStatus, signupResult, user } = state.UserAuth;
    const { hasNetwork } = state.PageState;
    return { emailStatus, signupResult, user, hasNetwork };
}

const mapDispatchToProps = (dispatch) => {
    return {
        validateEmailOnServer: (email) => dispatch(validateEmailOnServer(email)),
        registerUser: (user) => dispatch(registerUser(user)),
        toggleNetworkStatus: (status) => dispatch(toggleNetworkStatusAction(status)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup);

const styles = StyleSheet.create({
    formFieldIcon: {
        color: '#999999'
    },
    termsConditionLink: {
        marginLeft: 20,
        marginVertical: 20,
        color: '#EB861E',
        fontSize: 18
    },
    signupButton: {
        backgroundColor: '#EB861E',
        paddingVertical: 6,
        borderRadius: 5,
        marginHorizontal: 20,
        width: WindowDimensions.width - 40,
    },
    socialButton: {
        flexDirection: 'row',
        height: 40,
        alignItems: 'center',
        borderRadius: 5,
        paddingHorizontal: 10
    }
});