import React, { Component } from 'react';
import { SafeAreaView, View, AsyncStorage, StatusBar, NetInfo, Alert } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';

import DeviceInfo from 'react-native-device-info'; // DOC: Check https://www.npmjs.com/package/react-native-device-info#usage
import Md5 from 'react-native-md5'; // DOC: Check https://www.npmjs.com/package/react-native-md5

import { LoginScreen } from './login';
import { PageKeys, USER_AUTH_TOKEN, USER_BASE_URL } from '../../constants';
import { storeUserAction, toggleNetworkStatusAction } from '../../actions';
import ForgotPassword from '../forgot-password';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            spinner: false,
            isVisiblePassword: false,
            showForgotPasswordModal: false,
        };
    }

    componentWillMount() {
        NetInfo.getConnectionInfo().then((connectionInfo) => { });

        NetInfo.addEventListener(
            'connectionChange',
            this.handleFirstConnectivityChange
        );
    }

    componentDidUpdate(prevProps) {
        if (!this.props.hasNetwork) {
            this.showNetworkError();
        }
    }

    showNetworkError() {
        Alert.alert('Network Info', "Please connect to a network to continue", undefined, { cancelable: false });
    }

    handleFirstConnectivityChange = (connectionInfo) => {
        if (connectionInfo.type === 'wifi' || connectionInfo.type === 'cellular') {
            this.props.toggleNetworkStatus(true);
        } else if (connectionInfo.type === 'none') {
            this.props.toggleNetworkStatus(false);
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
        const { username, password } = this.state;
        const userData = {};
        userData.deviceId = DeviceInfo.getUniqueID();
        userData.date = new Date().toISOString();
        userData.email = username;//'madhavan.v@reactiveworks.in'; // FIXME: Remove static value
        userData.password = Md5.hex_md5(password + '');//Md5.hex_md5(890 + ''); // FIXME: Remove static value

        this.setState({ spinner: !this.state.spinner });
        axios.post(USER_BASE_URL + 'loginUser', userData)
            .then(res => {
                if (res.status === 200) {
                    AsyncStorage.setItem(USER_AUTH_TOKEN, res.data.accessToken);
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
                <Spinner
                    visible={this.state.spinner}
                    textContent={'Loading...'}
                    textStyle={{ color: '#fff' }}
                />
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
        storeUser: (userInfo) => dispatch(storeUserAction(userInfo)),
        toggleNetworkStatus: (status) => dispatch(toggleNetworkStatusAction(status)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);