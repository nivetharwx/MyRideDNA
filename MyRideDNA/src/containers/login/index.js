import React, { Component } from 'react';
import { View, StatusBar, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from "@react-native-community/netinfo";
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import axios from 'axios';
import firebase from 'react-native-firebase';

import DeviceInfo from 'react-native-device-info'; // DOC: Check https://www.npmjs.com/package/react-native-device-info#usage
import Md5 from 'react-native-md5'; // DOC: Check https://www.npmjs.com/package/react-native-md5

import { LoginScreen } from './login';
import { PageKeys, USER_AUTH_TOKEN, USER_BASE_URL, DEVICE_TOKEN, IS_ANDROID } from '../../constants';
import { storeUserAction, toggleNetworkStatusAction, updateTokenAction } from '../../actions';
import ForgotPassword from '../forgot-password';
import { Loader } from '../../components/loader'
import { Toast } from 'native-base';
import { AccessToken, LoginManager } from 'react-native-fbsdk';
// import { GoogleSignin } from 'react-native-google-signin';

// GoogleSignin.configure();

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
            deviceToken: null
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
                    const token = await firebase.messaging().getToken();
                    console.log("TOKEN - firebase.messaging().getToken() at login", token);
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

    doLogin = async () => {
        const { username, password, deviceToken } = this.state;
        const userData = {};
        // DOC: Newly added for the working of notification based on platform
        userData.platform = IS_ANDROID ? 'android' : 'ios';
        userData.registrationToken = deviceToken;
        userData.deviceId = await DeviceInfo.getUniqueId();
        userData.date = new Date().toISOString();
        userData.email = username;//'madhavan.v@reactiveworks.in'; // FIXME: Remove static value
        userData.password = Md5.hex_md5(password + '');//Md5.hex_md5(890 + ''); // FIXME: Remove static value

        this.setState({ spinner: !this.state.spinner });
        axios.post(USER_BASE_URL + 'loginUser', userData)
            .then(res => {
                if (res.status === 200) {
                    console.log('login : ', res.data);
                    if (!res.data.clubs) {
                        console.log('clubs not existing')
                        res.data.clubs = [];
                    }
                    AsyncStorage.setItem(USER_AUTH_TOKEN, res.data.accessToken);
                    this.props.updateToken({ userAuthToken: res.data.accessToken, deviceToken });
                    console.log("updateToken called: ", { userAuthToken: res.data.accessToken, deviceToken });
                    this.props.storeUser(res.data.user);
                    this.setState({ spinner: !this.state.spinner });
                    Actions.reset(PageKeys.MAP);
                }
            })
            .catch(error => {
                // TODO: Handle network error separately
                this.setState({ spinner: !this.state.spinner }, () => {
                    setTimeout(() => {
                        Alert.alert('Login failed', error.response.data.userMessage);
                    }, 100);
                });
            });
    }

    onSignupPress = () => {
        Actions.push(PageKeys.SIGNUP);
    }

    toggleForgotPasswordForm = () => {
        this.setState(prevState => ({ showForgotPasswordModal: !prevState.showForgotPasswordModal }));
    }

    togglePasswordVisibility = () => {
        this.setState(prevState => ({ isVisiblePassword: !prevState.isVisiblePassword }));
    }


    fetchingDeviceToken = async (user) => {
        if (this.state.deviceToken === null) {
            const deviceToken = await AsyncStorage.getItem(DEVICE_TOKEN);
            if (deviceToken === null) {
                const token = await firebase.messaging().getToken();
                console.log("TOKEN (getFCMToken) at login", token);
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
        axios.post(USER_BASE_URL + 'loginUserUsingThirdParty', { ...user, platform: IS_ANDROID ? 'android' : 'ios', date: new Date().toISOString(), registrationToken: this.state.deviceToken, deviceId: await DeviceInfo.getUniqueId() })
            .then(res => {
                console.log('loginUserUsingThirdParty success: ', res)
                AsyncStorage.setItem(USER_AUTH_TOKEN, res.data.accessToken);
                this.props.updateToken({ userAuthToken: res.data.accessToken, deviceToken: this.state.deviceToken });
                console.log("updateToken called: ", { userAuthToken: res.data.accessToken, deviceToken: this.state.deviceToken });
                res.data.user.isNewUser = res.data.isNewUser
                this.props.storeUser(res.data.user);
                console.log('newUser : ', res.data.user)
                if (res.data.isNewUser) {
                    Actions.reset(PageKeys.MAP);
                }
                else {
                    Actions.reset(PageKeys.MAP);
                }
            })
            .catch(error => {
                console.log('loginUserUsingThirdParty error : ', error)
            })
    }

    doFacebookLogin = () => {
        console.log('facebook login')
        LoginManager.logInWithPermissions(["public_profile", "email"]).then((result) => {
            console.log('login data : ', result)
            if (result.isCancelled) {
                console.log("Login cancelled");
            } else {
                AccessToken.getCurrentAccessToken().then((data) => {
                    console.log('data : ', data);
                    const { accessToken } = data;
                    axios.get('https://graph.facebook.com/v2.5/me?fields=email,name,friends,picture&access_token=' + accessToken)
                        .then((res) => {
                            var user = {};
                            console.log('res : ', res)
                            user.name = res.data.name;
                            user.email = res.data.email;
                            user.signupSource = 'facebook';
                            this.fetchingDeviceToken(user);
                        })
                        .catch((error) => {
                            console.log('error : ', error)
                        })
                })
            }
        })
            .catch(error => {
                console.log("Login fail with error: " + error);
            })
    }

    // doGoogleLogin = async () =>{
    //     console.log('googleLogin working')
    //     try {
    //         await GoogleSignin.hasPlayServices();
    //         const userInfo = await GoogleSignin.signIn();
    //         console.log('userinfo google : ',userInfo)
    //         userInfo.user.signUpSource='google'
    //         this.fetchingDeviceToken(userInfo.user)
    //       } catch (error) {
    //           console.log('error google : ',error)
    //       }
    // }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <StatusBar
                    translucent
                    backgroundColor="#7AC0E9"
                    barStyle="default"
                />
                {/* <Spinner
                    visible={this.state.spinner}
                    textContent={'Loading...'}
                    textStyle={{ color: '#fff' }}
                /> */}
                <Loader isVisible={this.state.spinner} onCancel={() => this.setState({ spinner: false })} />
                <ForgotPassword isVisible={this.state.showForgotPasswordModal} onCancel={this.toggleForgotPasswordForm} onPressOutside={this.toggleForgotPasswordForm} />
                <LoginScreen
                    onEmailChange={(value) => this.onEmailChange(value)}
                    onPasswordChange={(value) => this.onPasswordChange(value)}
                    togglePasswordVisibility={this.togglePasswordVisibility}
                    onSubmit={this.onSubmit} onSignupPress={this.onSignupPress}
                    onForgotPasswordPress={this.toggleForgotPasswordForm}
                    isVisiblePassword={this.state.isVisiblePassword}
                    // doGoogleLogin={this.doGoogleLogin}
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
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);