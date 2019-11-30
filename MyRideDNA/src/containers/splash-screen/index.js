import React from 'react';
import {
    View, StyleSheet,
    Image, ImageBackground, StatusBar, Animated, Easing
} from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-community/async-storage';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { USER_AUTH_TOKEN, PageKeys, WindowDimensions, USER_BASE_URL, DEVICE_TOKEN, UNSYNCED_RIDE } from '../../constants';
import { Icon as NBIcon, Toast } from 'native-base';
import { storeUserAction, updateTokenAction, replaceUnsyncedRidesAction } from '../../actions';
import axios from 'axios';

class SplashScreen extends React.Component {
    unregisterNetworkListener = null;
    constructor(props) {
        super(props);
        this.state = {
            spinValue: new Animated.Value(0),
            pageOpacity: new Animated.Value(1),
        }
    }

    async componentDidMount() {
        console.log('componentDidMount splash screen')
        const keys = await AsyncStorage.getAllKeys();
        this.props.updateUnsyncedRides(keys.filter(key => key.indexOf(UNSYNCED_RIDE) === 0));
        this.unregisterNetworkListener = NetInfo.addEventListener(this.handleFirstConnectivityChange);
        this.doAnimateLoader();
    }


    componentDidUpdate(prevProps) {
        if (prevProps.user !== this.props.user) {
            if (this.props.user.userId) {
                Actions.reset(PageKeys.MAP);
            }
        }
    }

    handleFirstConnectivityChange = async (connectionInfo) => {
        if ((connectionInfo.type === 'wifi' || connectionInfo.type === 'cellular') && connectionInfo.isInternetReachable) {
            Toast.hide();
            if (this.props.user === null || this.props.user.userId === null) {
                this.doAuthTokenVerfication();
            }
        } else if (connectionInfo.isInternetReachable === false) {
            Toast.show({ text: 'Network connection lost', position: 'bottom', duration: 0 });
        }
    }

    async doAuthTokenVerfication() {
        var userAuthToken = await AsyncStorage.getItem(USER_AUTH_TOKEN);
        var deviceToken = await AsyncStorage.getItem(DEVICE_TOKEN);
        console.log('userAuthToken : ', userAuthToken)
        if (userAuthToken) {
            this.props.updateToken({ userAuthToken, deviceToken });
            axios.post(USER_BASE_URL + 'loginUserUsingAccessToken', { accessToken: userAuthToken, date: new Date().toISOString() }, { timeout: 15000 })
                .then(res => {
                    console.log('loginUserUsingAccessToken success : ', res.data);
                    if (res.status === 200) {
                        if (!res.data.clubs) {
                            console.log('clubs not existing')
                            res.data.clubs = [];
                        }
                        this.props.storeUser(res.data);
                    }
                })
                .catch(error => {
                    console.log('error: ', error);
                    console.log('error: ', error.message);
                    if ((error.message === 'Network Error' || error.message === 'timeout of 15000ms exceeded') && store.getState().PageState.hasNetwork === true) {
                        setTimeout(() => this.doAuthTokenVerfication(), 250);
                    }
                    else {
                        Actions.reset(PageKeys.LOGIN);
                    }
                    console.log(error.response ? error.response.data : error.response);
                })
        }
        else {
            Actions.reset(PageKeys.LOGIN);
        }
    }

    doAnimateLoader() {
        this.state.spinValue.setValue(0);
        Animated.timing(this.state.spinValue, {
            toValue: 1,
            duration: 5000,
            easing: Easing.linear,
            useNativeDriver: true
        }).start(() => this.doAnimateLoader());
    }

    componentWillUnmount() {
        this.unregisterNetworkListener && this.unregisterNetworkListener();
    }

    render() {
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        return (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <StatusBar
                    backgroundColor="black"
                    barStyle="default"
                />
                <ImageBackground source={require('../../assets/img/logo-sky-bg.jpg')}
                    style={styles.splashBackground} resizeMode='cover'>
                    <Image source={require('../../assets/img/logo-high-res.png')} style={styles.logo} resizeMode='center' />
                </ImageBackground>
                <Animated.View style={[styles.loader, { transform: [{ rotate: spin }] }]}>
                    <NBIcon name='spinner' type='EvilIcons' style={{ fontSize: 100, color: '#EB861E' }} />
                </Animated.View>
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
        updateToken: (token) => dispatch(updateTokenAction(token)),
        storeUser: (userInfo) => dispatch(storeUserAction(userInfo)),
        updateUnsyncedRides: (unsyncedRides) => dispatch(replaceUnsyncedRidesAction(unsyncedRides))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SplashScreen);

const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    splashBackground: {
        height: null,
        width: null,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 50
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    loader: {
        position: 'absolute',
        top: (WindowDimensions.height / 2 + 100),
        left: (WindowDimensions.width / 2 - 50)
    }
});