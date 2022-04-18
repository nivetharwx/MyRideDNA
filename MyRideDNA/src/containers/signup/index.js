import React, { Component } from 'react';
import { View, ScrollView, StyleSheet, Alert, Image, Text, Switch, TouchableHighlight, TouchableOpacity, Linking } from 'react-native';
import { connect } from 'react-redux';
import { IconicList, LabeledInputPlaceholder } from '../../components/inputs';
import { APP_COMMON_STYLES, IS_ANDROID, heightPercentageToDP, CUSTOM_FONTS, USER_BASE_URL, DEVICE_TOKEN } from '../../constants';
import { IconButton, LinkButton } from '../../components/buttons';
import { isValidEmailFormat } from '../../util';
import { validateEmailOnServer, registerUser } from '../../api';
import Md5 from 'react-native-md5';
import { toggleNetworkStatusAction } from '../../actions';
import { DefaultText } from '../../components/labels';
import { Actions } from 'react-native-router-flux';
import { BasePage } from '../../components/pages';
import { GoogleSignin } from '@react-native-community/google-signin';
import AsyncStorage from '@react-native-community/async-storage';
import DeviceInfo from 'react-native-device-info';
import Axios from 'axios';

const ITEM_H_PADDING = 50;

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
            termsAccepted:false,
            deviceToken:null
        };
    }

    componentDidMount(){
        const userData=this.props.userData
        if(userData){
            this.setState({
                user:{...this.state.user,name:userData.name,email:userData.email}
            })
        }
    }

    componentDidUpdate(prevProps) {
        console.log('componentDidUpdate signup')
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

        if (prevProps.hasNetwork === true && this.props.hasNetwork === false) {
            Toast.show({ text: 'Network connection lost', position: 'bottom', duration: 0 });
        }
        if (prevProps.hasNetwork === false && this.props.hasNetwork === true) {
            Toast.hide()
        }
    }
    onPressBackButton = () => {
        Actions.pop();
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

    passwordFormat = () => {
        if (typeof this.state.user.password === 'undefined') return;
        if (this.state.user.password.length < 5) {
            Alert.alert('Error', 'Password should be greater than 5 character');
        } else if (this.state.user.password.search(/\d/) == -1) {
            Alert.alert('Error', 'Password should contain one number');
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
            this.props.registerUser({ ...this.state.user, password: Md5.hex_md5(this.state.user.password + '') }, (res) => {
                this.setState({ showLoader: false });
            }, (er) => {
                this.setState({ showLoader: false });
            });
        }
    }

    doGoogleLogin = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const { user } = await GoogleSignin.signIn();
            console.log(user)
            const tokens= await GoogleSignin.getTokens()
            // console.log(tokens)
            user.signUpSource = 'google';
            user.accessToken = tokens.accessToken
            this.fetchingDeviceToken(user);
        } catch (error) {
            console.log('error google : ', error);
        }
    }

    fetchingDeviceToken = async (user) => {
        if (this.state.deviceToken === null) {
            const deviceToken = await AsyncStorage.getItem(DEVICE_TOKEN);
            if (deviceToken === null) {
                const token = await messaging().getToken();
                AsyncStorage.setItem(DEVICE_TOKEN, token);
                this.setState({ deviceToken: token }, () => this.thirdPartyLogin(user));
            }
            else {
                this.setState({ deviceToken }, () => this.thirdPartyLogin(user));
            }
        } else {
            this.thirdPartyLogin(user);
        }
    }

    thirdPartyLogin = async (user) => {
        this.setState({ showLoader: !this.state.showLoader });
        console.log(JSON.stringify({ ...user, platform: IS_ANDROID ? 'android' : 'ios', date: new Date().toISOString(), registrationToken: this.state.deviceToken, deviceId: await DeviceInfo.getUniqueId() }))
        Axios.post(USER_BASE_URL + 'loginUserUsingThirdParty', { ...user, platform: IS_ANDROID ? 'android' : 'ios', date: new Date().toISOString(), registrationToken: this.state.deviceToken, deviceId: await DeviceInfo.getUniqueId() })
            .then(res => {
                this.setState({ showLoader: !this.state.showLoader });
                console.log('loginUserUsingThirdParty : ', res.data)
                if(res.data.status!=="unRegistered"){
                    Alert.alert('Account Already Exist',"Oops! it looks like you are already registered with MyRideDNA.",
                    [
                        { text: "Ok", onPress: () => {
                            
                        } }
                      ])
                }else{
                    const userData=res.data.user
                    this.setState({
                        user:{...this.state.user,name:userData.name,email:userData.email}
                    })
                }

            })
            .catch(error => {
                console.log('loginUserUsingThirdParty error : ', error.message)
            })
    }


    render() {
        const { user, hidePasswd, hideConfPasswd, showLoader, confirmPassword } = this.state;
        return (
            <BasePage defaultHeader={true} heading={'Signup'} showLoader={showLoader} showShifter={false}>
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: 'white', marginTop: APP_COMMON_STYLES.statusBar.height, marginHorizontal: ITEM_H_PADDING }} contentContainerStyle={{}}>
                        <LabeledInputPlaceholder
                            containerStyle={{ borderBottomColor: '#9A9A9A', borderBottomWidth: 1 }}
                            inputValue={user.name} inputStyle={{ paddingBottom: 0 }}
                            outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                            inputRef={elRef => this.fieldRefs[0] = elRef} returnKeyType='next'
                            onChange={this.onChangeName}
                            placeholder={'Name'}
                            placeholderColor={'#9A9A9A'}
                            onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false} />
                        <IconicList
                            iconProps={IS_ANDROID ? {} : { type: 'MaterialIcons', name: 'arrow-drop-down', style: { color: APP_COMMON_STYLES.infoColor, fontSize: 28 } }}
                            pickerStyle={[{ borderBottomWidth: 0 }, IS_ANDROID ? { flex: 1 } : null]}
                            textStyle={{ paddingLeft: 10, fontSize: 14, bottom: 6 }}
                            selectedValue={user.gender}
                            values={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]}
                            placeholder={'Gender'}
                            outerContainer={{ flex: 1, alignItems: 'flex-end' }}
                            containerStyle={[styles.itemTopMargin, { flex: 1, borderBottomColor: '#9A9A9A', borderBottomWidth: 1 }]}
                            innerContainerStyle={{ height: 24 }}
                            onChange={this.onGenderChange} />
                        <LabeledInputPlaceholder
                            containerStyle={{ borderBottomColor: '#9A9A9A', borderBottomWidth: 1 }}
                            inputValue={user.email} inputStyle={{ paddingBottom: 0 }}
                            outerContainer={styles.itemTopMargin}
                            inputRef={elRef => this.fieldRefs[1] = elRef} returnKeyType='next'
                            onChange={this.onEmailChange}
                            placeholder={'Email'}
                            placeholderColor={'#9A9A9A'}
                            onBlur={this.validateEmail}
                            onSubmit={() => this.fieldRefs[2].focus()} hideKeyboardOnSubmit={false} />
                        <LabeledInputPlaceholder
                            containerStyle={{ borderBottomColor: '#9A9A9A', borderBottomWidth: 1, flex: 0, }}
                            inputValue={user.password} inputStyle={{ paddingBottom: 0, }}
                            outerContainer={styles.itemTopMargin}
                            inputRef={elRef => this.fieldRefs[2] = elRef} returnKeyType='next'
                            secureTextEntry={hidePasswd}
                            onBlur={this.passwordFormat}
                            placeholder={'Password'}
                            placeholderColor={'#9A9A9A'}
                            onChange={this.onPasswordsChange}
                            onSubmit={() => this.fieldRefs[3].focus()} hideKeyboardOnSubmit={false}
                            iconProps={{ name: hidePasswd ? 'eye' : 'eye-off', type: 'MaterialCommunityIcons', style: { fontSize: 15, paddingRight: 0, color: 'white' }, onPress: this.togglePasswordVisibility, containerStyle: { backgroundColor: '#0083CA', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 11 } }}
                        />
                        <LabeledInputPlaceholder
                            containerStyle={{ borderBottomColor: '#9A9A9A', borderBottomWidth: 1, flex: 0, }}
                            inputValue={confirmPassword} inputStyle={{ paddingBottom: 0, }}
                            outerContainer={styles.itemTopMargin}
                            inputRef={elRef => this.fieldRefs[3] = elRef} returnKeyType='next'
                            secureTextEntry={hideConfPasswd}
                            placeholder={'Confirm Password'}
                            onChange={this.onConfrimPasswordChange}
                            hideKeyboardOnSubmit={true}
                            placeholderColor={'#9A9A9A'}
                            iconProps={{ name: hideConfPasswd ? 'eye' : 'eye-off', type: 'MaterialCommunityIcons', style: { fontSize: 15, paddingRight: 0, color: 'white' }, onPress: this.toggleConfirmPasswordVisibility, containerStyle: { backgroundColor: '#0083CA', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 11 } }}
                        />
                        <View style={styles.termsAndConditions}>
                            <Text style={styles.termsAndConditionsText}>I have read and agree to the <Text style={{color:APP_COMMON_STYLES.infoColor}} onPress={()=>{
                                Linking.openURL('https://mrdna-test.point2value.com/terms-and-conditions')
                            }}>Terms of Services</Text> and <Text style={{color:APP_COMMON_STYLES.infoColor}}>Privacy Policy</Text></Text>
                            <Switch trackColor={{true:APP_COMMON_STYLES.infoColor,false:'default'}} thumbColor={null} value={this.state.termsAccepted} onChange={()=>{
                                this.setState({
                                    termsAccepted:!this.state.termsAccepted
                                })
                            }}/>
                        </View>
                        <LinkButton style={{ alignSelf: 'center', width: 210, backgroundColor: APP_COMMON_STYLES.infoColor, borderRadius: 23, marginTop: 55 }} title={`LET'S RIDE`} titleStyle={{ color: '#FFFFFF', fontSize: 17, fontFamily: CUSTOM_FONTS.robotoBold, textAlign: 'center', paddingVertical: 14, paddingHorizontal: 20, letterSpacing: 0.9 }} disabled={!this.state.termsAccepted} onPress={this.onSubmit} />
                        {/* <LinkButton style={{ alignSelf: 'center', marginTop: 20, marginBottom: 10 }} title='Privacy policy' titleStyle={{ color: '#9A9A9A', fontSize: 17 }} /> */}
                        
                    </ScrollView>
                    <View style={{ paddingVertical: heightPercentageToDP(7.5), backgroundColor: '#585756', alignItems: 'center' }}>
                        <View style={{ alignItems: 'center', justifyContent: 'space-around' }}>
                            <LinkButton disabled={!this.state.termsAccepted} onPress={() => { this.doGoogleLogin() }} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 9, width: 210, borderRadius: 5 }}>
                                <View style={{ height: 23, width: 23 }}>
                                    <Image source={require('../../assets/img/google-logo.png')} style={{ flex: 1, height: null, width: null }} />
                                </View>
                                <DefaultText text={'Signup with Google'} style={{ marginLeft: 15, color: '#575555', fontSize: 14 }} fontFamily={CUSTOM_FONTS.robotoBold} />
                            </LinkButton>
                            {/* <IconButton onPress={() => { }} style={{ marginTop: 15, backgroundColor: '#FFFFFF', padding: 7, width: 210, borderRadius: 5 }} iconProps={{ name: 'facebook-official', type: 'FontAwesome', style: { height: 30, width: 30, color: '#3B5998' } }}
                                title={'Continue with Facebbok'}
                                titleStyle={{ fontFamily: CUSTOM_FONTS.robotoBold, marginLeft: 7, color: '#575555', fontSize: 14 }}
                            /> */}
                        </View>
                    </View>
                </View>
            </BasePage>
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
        registerUser: (user, successCallback, errorCallback) => dispatch(registerUser(user, successCallback, errorCallback)),
        toggleNetworkStatus: (status) => dispatch(toggleNetworkStatusAction(status)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup);

const styles = StyleSheet.create({
    itemTopMargin: {
        marginTop: 25
    },
    termsAndConditions:{
        width:'100%',
        display:"flex",
        flexDirection:'row',
        marginTop:65,
        justifyContent:'space-between',
    },
    termsAndConditionsText:{
        width:'80%',
        fontSize:13,
        fontStyle:CUSTOM_FONTS.robotoBold['normal'],
        fontWeight:'500'
    }
});