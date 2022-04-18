import React, { Component } from 'react';
import { View, StatusBar, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from "@react-native-community/netinfo";
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import axios from 'axios';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info'; // DOC: Check https://www.npmjs.com/package/react-native-device-info#usage
import Md5 from 'react-native-md5'; // DOC: Check https://www.npmjs.com/package/react-native-md5

import { LoginScreen } from './login';
import { PageKeys, USER_AUTH_TOKEN, USER_BASE_URL, DEVICE_TOKEN, IS_ANDROID, CUSTOM_FONTS } from '../../constants';
import { storeUserAction, toggleNetworkStatusAction, updateTokenAction, updateJwtTokenAction } from '../../actions';
import ForgotPassword from '../forgot-password';
import { Loader } from '../../components/loader'
import { Toast } from 'native-base';
import { AccessToken, LoginManager } from 'react-native-fbsdk';
import { GoogleSignin } from '@react-native-community/google-signin';
import { BaseModal } from '../../components/modal';
import { BasicButton } from '../../components/buttons';
import { activateUserAccount } from '../../api';
import { LoginStyles } from './styles';
import { DefaultText } from '../../components/labels';


GoogleSignin.configure({
    webClientId:'72747364788-llavih65vml24e11hsttntmatgps275q.apps.googleusercontent.com'
});

class Login extends Component {
    unregisterNetworkListener = null;
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            spinner: false,
            isVisiblePassword: false,
            showForgotPasswordModal: false,
            deviceToken: null,
            isVisibleActivateModal: false,
            userData: null,
            isVisibleForgotPasswordModal: false
        };
    }

    async componentDidMount() {
        if (!this.props.hasNetwork) {
            Toast.show({ text: 'Network connection lost', position: 'bottom', duration: 0 });
        }

        const deviceToken = await AsyncStorage.getItem(DEVICE_TOKEN);
        this.setState({ deviceToken });

        this.unregisterNetworkListener = NetInfo.addEventListener(this.handleFirstConnectivityChange);
    }

    handleFirstConnectivityChange = (connectionInfo) => {
        if ((connectionInfo.type === 'wifi' || connectionInfo.type === 'cellular') && connectionInfo.isInternetReachable) {
            Toast.hide();
            this.props.toggleNetworkStatus(true);
        } else if (connectionInfo.isInternetReachable === false) {
            this.props.toggleNetworkStatus(false);
            Toast.show({ text: 'Network connection lost', position: 'bottom', duration: 0 });
        }
    }

     componentDidUpdate(){
         console.log('component did updae called login')
     }
     
    componentWillUnmount() {
        this.unregisterNetworkListener && this.unregisterNetworkListener();
    }

    onEmailChange = (username) => {
        this.setState({ username });
    }

    onPasswordChange = (password) => {
        this.setState({ password });
    }

    validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    onSubmit = async () => {
        if (this.state.deviceToken === null) {
            const deviceToken = await AsyncStorage.getItem(DEVICE_TOKEN);
            if (deviceToken === null) {
                try {
                    const token = await messaging().getToken();
                    if (token) {
                        AsyncStorage.setItem(DEVICE_TOKEN, token);
                        this.setState({ deviceToken: token }, () => this.doLogin());
                    }
                } catch (er) {
                    console.log("firebase.messaging().getToken() error: ", er);
                }
            }
            else {
                this.setState({ deviceToken }, () => this.doLogin());
            }
        } else {
            this.doLogin();
        }
    }

    openMapPage = () => {
        const { userData } = this.state;
        AsyncStorage.setItem(USER_AUTH_TOKEN, userData.accessToken);
        this.props.updateToken({ userAuthToken: userData.accessToken, deviceToken: this.state.deviceToken });
        if (!userData.user.homeAddress) userData.user.homeAddress = {};
        this.props.storeUser(userData.user);
        Actions.reset(PageKeys.MAP);
    }

    doLogin = async () => {
        const { username, password, deviceToken } = this.state;
        const userData = {};
        // DOC: Newly added for the working of notification based on platform
        userData.platform = IS_ANDROID ? 'android' : 'ios';
        userData.registrationToken = deviceToken;
        userData.deviceId = await DeviceInfo.getUniqueId();
        userData.date = new Date().toISOString();
        userData.email = username;
        userData.password = Md5.hex_md5(password + '');

        this.setState({ spinner: !this.state.spinner });
        axios.post(USER_BASE_URL + 'loginUser', userData)
            .then(res => {
                console.log('loginUser : ', res.data);
                if (res.status === 200) {
                    res.data.user.jwttoken = res.data.jwttoken;
                    this.setState({ userData: res.data, spinner: !this.state.spinner }, () => res.data.user.accountStatus === 'deactivated' ? this.showActivateModal() : this.openMapPage());
                }
            })
            .catch(error => {
                if (error.message === 'Network Error' && this.props.hasNetwork === true) {
                    this.setState({ spinner: !this.state.spinner });
                    Alert.alert(
                        'Something went wrong ',
                        'Please try again after sometime',
                        [
                            { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                        ],
                        { cancelable: false }
                    )
                }
                else if (error.message === 'Network Error' && store.getState().PageState.hasNetwork === false) {
                    this.setState({ spinner: !this.state.spinner });
                }
                else {
                    this.setState({ spinner: !this.state.spinner }, () => {
                        setTimeout(() => {
                            Alert.alert('Login failed', error.response.data.userMessage);
                        }, 100);
                    });
                }
                // TODO: Handle network error separately
            });
    }

    onSignupPress = () => {
        Actions.push(PageKeys.SIGNUP);
    }

    openForgotPasswordModal = () => {
        this.setState(prevState => ({ isVisibleForgotPasswordModal: true }));
    }
    hideForgotPasswordModal = () => {
        this.setState({ isVisibleForgotPasswordModal: false })
    }

    togglePasswordVisibility = () => {
        this.setState(prevState => ({ isVisiblePassword: !prevState.isVisiblePassword }));
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
        this.setState({ spinner: !this.state.spinner });
        console.log(JSON.stringify({ ...user, platform: IS_ANDROID ? 'android' : 'ios', date: new Date().toISOString(), registrationToken: this.state.deviceToken, deviceId: await DeviceInfo.getUniqueId() }))
        axios.post(USER_BASE_URL + 'loginUserUsingThirdParty', { ...user, platform: IS_ANDROID ? 'android' : 'ios', date: new Date().toISOString(), registrationToken: this.state.deviceToken, deviceId: await DeviceInfo.getUniqueId() })
            .then(res => {
                console.log('loginUserUsingThirdParty : ', res.data)
                // if(res.data.status!=="unRegistered"){
                    res.data.user.isNewUser = res.data.isNewUser;
                    res.data.user.jwttoken = res.data.jwttoken;
                    this.setState({ userData: res.data, spinner: !this.state.spinner }, () => res.data.user.accountStatus === 'deactivated' ? this.showActivateModal() : this.openMapPage());
                // }else{
                //     Alert.alert('No Account Found',"Oops! It looks like you have not registered with MyRideDNA yet. \n\nWould you like to sign-up?",
                //     [
                //         {
                //           text: "No",
                //           onPress: () => {
                //               this.setState({
                //                 spinner: false,
                //                 isVisiblePassword: false,
                //                 showForgotPasswordModal: false,
                //                 isVisibleActivateModal: false,
                //                 userData: null,
                //                 isVisibleForgotPasswordModal: false
                //               })
                //           },
                //           style: "cancel"
                //         },
                //         { text: "Yes", onPress: () => {
                //             this.setState({
                //                 spinner: false,
                //                 isVisiblePassword: false,
                //                 showForgotPasswordModal: false,
                //                 isVisibleActivateModal: false,
                //                 userData: null,
                //                 isVisibleForgotPasswordModal: false
                //               })
                //             Actions.push(PageKeys.SIGNUP,{
                //                 userData:res.data.user
                //             });
                //         } }
                //       ]
                //  )
                // }

            })
            .catch(error => {
                console.log('loginUserUsingThirdParty error : ', error.message)
            })
    }

    doFacebookLogin = async () => {
        try {
            const result = await LoginManager.logInWithPermissions(["public_profile", "email"]);
            if (result.isCancelled) {
            } else {
                const { accessToken } = await AccessToken.getCurrentAccessToken();
                const res = await axios.get('https://graph.facebook.com/v2.5/me?fields=email,name,friends,picture&access_token=' + accessToken);
                var user = {};
                user.name = res.data.name;
                user.email = res.data.email;
                user.signupSource = 'facebook';
                this.fetchingDeviceToken(user);
            }
        } catch (error) {
            console.log("Login fail with error: " + error);
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

    activateAccount = () => {
        this.props.activateUserAccount(this.state.userData.user.userId, (res) => {
            this.openMapPage()
        }, (error) => {
            if (error.message === 'Network Error' && this.props.hasNetwork === true) {
                this.setState({ spinner: !this.state.spinner });
                Alert.alert(
                    'Something went wrong ',
                    'Please try again after sometime',
                    [
                        { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                    ],
                    { cancelable: false }
                )
            }
            else if (error.message === 'Network Error' && store.getState().PageState.hasNetwork === false) {
                this.setState({ spinner: !this.state.spinner });
            }
            else {
                this.setState({ spinner: !this.state.spinner }, () => {
                    setTimeout(() => {
                        Alert.alert('Login failed', error.response.data.userMessage);
                    }, 100);
                });
            }
        })
    }

    showActivateModal = () => this.setState({ isVisibleActivateModal: true });

    hideActivateModal = () => {
        this.setState({ isVisibleActivateModal: false, })
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <StatusBar translucent={true} backgroundColor="transparent" />
                <BaseModal containerStyle={{ justifyContent: 'center', alignItems: 'center' }} isVisible={this.state.isVisibleActivateModal} onCancel={this.hideActivateModal} >
                    <View style={LoginStyles.alertBoxCont}>
                        <DefaultText style={LoginStyles.alertBoxTitle}>Reactivate Account</DefaultText>
                        <DefaultText numberOfLines={3} style={LoginStyles.alertBoxText}>This account has been deactivated. Do you wish to reactivate this account?</DefaultText>
                        <View style={LoginStyles.btnContainer}>
                            <BasicButton title='CANCEL' style={[LoginStyles.actionBtn, { backgroundColor: '#8D8D8D' }]} titleStyle={LoginStyles.actionBtnTxt} onPress={this.hideActivateModal} />
                            <BasicButton title='CONFIRM' style={LoginStyles.actionBtn} titleStyle={LoginStyles.actionBtnTxt} onPress={this.activateAccount} />
                        </View>
                    </View>
                </BaseModal>
                <BaseModal containerStyle={LoginStyles.baseModalContainerStyle} isVisible={this.state.isVisibleForgotPasswordModal} onCancel={this.hideForgotPasswordModal} onPressOutside={this.hideForgotPasswordModal}>
                    <View style={LoginStyles.optionsContainer}>
                        <View style={LoginStyles.optionsView}>
                            <DefaultText style={{ color: '#2B77B4', fontFamily: CUSTOM_FONTS.robotoBold, fontSize: 20, letterSpacing: 0.2 }}>FORGOT PASSWORD</DefaultText>
                            <ForgotPassword isVisible={this.state.isVisibleForgotPasswordModal} onCancel={this.hideForgotPasswordModal} onPressOutside={this.hideForgotPasswordModal} />
                        </View>
                    </View>
                </BaseModal>
                <Loader isVisible={this.state.spinner} onCancel={() => this.setState({ spinner: false })} />
                <LoginScreen
                    onEmailChange={(value) => this.onEmailChange(value)}
                    onPasswordChange={(value) => this.onPasswordChange(value)}
                    togglePasswordVisibility={this.togglePasswordVisibility}
                    onSubmit={this.onSubmit} onSignupPress={this.onSignupPress}
                    onForgotPasswordPress={this.openForgotPasswordModal}
                    isVisiblePassword={this.state.isVisiblePassword}
                    doGoogleLogin={this.doGoogleLogin}
                    doFacebookLogin={this.doFacebookLogin}
                />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { hasNetwork } = state.PageState;
    return { user, hasNetwork };
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateToken: (token) => dispatch(updateTokenAction(token)),
        storeUser: (userInfo) => dispatch(storeUserAction(userInfo)),
        toggleNetworkStatus: (status) => dispatch(toggleNetworkStatusAction(status)),
        updateJwtToken: (unsyncedRides) => dispatch(updateJwtTokenAction(unsyncedRides)),
        activateUserAccount: (userId, successCallback, errorCallback) => activateUserAccount(userId).then(res => {
            console.log('activateUserAccount success  : ', res)
            typeof successCallback === 'function' && successCallback()
        }).catch(er => {
            errorCallback(er);
            console.log('activateUserAccount error  : ', er)
        })
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);