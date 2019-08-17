import React, { Component } from 'react';
import { SafeAreaView, View, AsyncStorage, StatusBar, NetInfo, Alert } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import FCM, { NotificationActionType, NotificationType, FCMEvent, RemoteNotificationResult, WillPresentNotificationResult } from "react-native-fcm";

import DeviceInfo from 'react-native-device-info'; // DOC: Check https://www.npmjs.com/package/react-native-device-info#usage
import Md5 from 'react-native-md5'; // DOC: Check https://www.npmjs.com/package/react-native-md5

import { LoginScreen } from './login';
import { PageKeys, USER_AUTH_TOKEN, USER_BASE_URL, DEVICE_TOKEN } from '../../constants';
import { storeUserAction, toggleNetworkStatusAction, updateTokenAction } from '../../actions';
import ForgotPassword from '../forgot-password';
import { Loader } from '../../components/loader'
import { Toast } from 'native-base';

class Login extends Component {
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

    async componentWillMount() {
        NetInfo.getConnectionInfo().then((connectionInfo) => {
            if (connectionInfo.type === 'none') {
                Toast.show({ text: 'Network connection lost', position: 'bottom', duration: 0 });
            }
        });

        NetInfo.addEventListener(
            'connectionChange',
            this.handleFirstConnectivityChange
        );
        const deviceToken = await AsyncStorage.getItem(DEVICE_TOKEN);
        this.setState({ deviceToken });
    }

    componentDidUpdate(prevProps) {
        if (!this.props.hasNetwork) {
            // this.showNetworkError();
        }
    }

    showNetworkError() {
        Alert.alert('Network Info', "Please connect to a network to continue", undefined, { cancelable: false });
    }

    handleFirstConnectivityChange = (connectionInfo) => {
        if (connectionInfo.type === 'wifi' || connectionInfo.type === 'cellular') {
            console.log('internet connected');
            Toast.hide();
            this.props.toggleNetworkStatus(true);
        } else if (connectionInfo.type === 'none') {
            this.props.toggleNetworkStatus(false);
            Toast.show({ text: 'Network connection lost', position: 'bottom', duration: 0 });
        }
    }

    componentWillUnmount() {
        NetInfo.removeEventListener(
            'connectionChange',
            this.handleFirstConnectivityChange
        );
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
        if (!this.props.hasNetwork) {
            this.showNetworkError();
            return;
        }
        if (this.state.deviceToken === null) {
            const deviceToken = await AsyncStorage.getItem(DEVICE_TOKEN);
            if (deviceToken === null) {
                FCM.getFCMToken().then(token => {
                    console.log("TOKEN (getFCMToken) at login", token);
                    AsyncStorage.setItem(DEVICE_TOKEN, token);
                    this.setState({ deviceToken: token }, () => this.doLogin());
                });
            }
            else {
                this.setState({ deviceToken }, () => this.doLogin());
            }
        } else {
            this.doLogin();
        }
    }

    doLogin = () => {
        const { username, password, deviceToken } = this.state;
        const userData = {};

        userData.registrationToken = deviceToken;
        userData.deviceId = DeviceInfo.getUniqueID();
        userData.date = new Date().toISOString();
        userData.email = username;//'madhavan.v@reactiveworks.in'; // FIXME: Remove static value
        userData.password = Md5.hex_md5(password + '');//Md5.hex_md5(890 + ''); // FIXME: Remove static value

        this.setState({ spinner: !this.state.spinner });
        axios.post(USER_BASE_URL + 'loginUser', userData)
            .then(res => {
                if (res.status === 200) {
                    AsyncStorage.setItem(USER_AUTH_TOKEN, res.data.accessToken);
                    this.props.updateToken({ userAuthToken: res.data.accessToken, deviceToken });
                    console.log("updateToken called: ", { userAuthToken: res.data.accessToken, deviceToken });
                    this.props.storeUser(res.data.user);
                    this.setState({ spinner: !this.state.spinner });
                    Actions.reset(PageKeys.MAP);
                }
            })
            .catch(error => {
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