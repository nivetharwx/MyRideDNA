import React, { Component } from 'react';
import { SafeAreaView, AsyncStorage } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';

import DeviceInfo from 'react-native-device-info'; // DOC: Check https://www.npmjs.com/package/react-native-device-info#usage
import Md5 from 'react-native-md5'; // DOC: Check https://www.npmjs.com/package/react-native-md5

import { LoginScreen } from './login';
import { loginUser } from '../../api';
import { PageKeys, ACCESS_TOKEN, USER_BASE_URL } from '../../constants';
import { storeUserAction } from '../../actions';

class Login extends Component {
    // TODO: Create splash screen and do authToken login there
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            spinner: false,
            isVisiblePassword: false
        };
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
        const { username, password } = this.state;
        const userData = {};
        userData.deviceId = DeviceInfo.getUniqueID();
        userData.date = new Date().toISOString();
        userData.email = 'madhavan.v@reactiveworks.in'; // FIXME: Remove static value
        userData.password = Md5.hex_md5(890 + ''); // FIXME: Remove static value

        this.setState({ spinner: !this.state.spinner });
        axios.post(USER_BASE_URL + 'loginUser', userData)
            .then(res => {
                if (res.status === 200) {
                    AsyncStorage.setItem(ACCESS_TOKEN, res.data.accessToken);
                    this.props.storeUser(res.data.user);
                    this.setState({ spinner: !this.state.spinner });
                    Actions.reset(PageKeys.MAP);
                }
            })
            .catch(er => {
                console.log(er);
                this.setState({ spinner: !this.state.spinner });
            });
    }

    onSignupPress = () => {
        Actions.push('signup');
    }

    togglePasswordVisibility = () => {
        this.setState(prevState => ({ isVisiblePassword: !prevState.isVisiblePassword }));
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <Spinner
                    visible={this.state.spinner}
                    textContent={'Loading...'}
                    textStyle={{ color: '#fff' }}
                />
                <LoginScreen
                    onEmailChange={(value) => this.onEmailChange(value)}
                    onPasswordChange={(value) => this.onPasswordChange(value)}
                    togglePasswordVisibility={this.togglePasswordVisibility}
                    onSubmit={this.onSubmit} onSignupPress={this.onSignupPress}
                    isVisiblePassword={this.state.isVisiblePassword}
                />
            </SafeAreaView>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    return { user };
}

const mapDispatchToProps = (dispatch) => {
    return {
        loginUser: (userData) => dispatch(loginUser(userData)),
        storeUser: (userInfo) => dispatch(storeUserAction(userInfo))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);