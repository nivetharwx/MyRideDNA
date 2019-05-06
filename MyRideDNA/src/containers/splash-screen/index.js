import React from 'react';
import {
    View, AsyncStorage, NetInfo, Alert, StyleSheet, Text,
    Image, ImageBackground, StatusBar, Animated, Easing
} from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { USER_AUTH_TOKEN, PageKeys, WindowDimensions, USER_BASE_URL, DEVICE_TOKEN } from '../../constants';
import { Icon as NBIcon } from 'native-base';
import { storeUserAction, updateTokenAction } from '../../actions';
import axios from 'axios';

class SplashScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            spinValue: new Animated.Value(0),
            pageOpacity: new Animated.Value(1),
        }
    }

    async componentDidMount() {
        const connectionInfo = await NetInfo.getConnectionInfo();
        if (connectionInfo.type === 'none') {
            Alert.alert('Network Error', 'Failed to connect to internet');
        } else {
            this.handleFirstConnectivityChange(connectionInfo)
        }
        this.doAnimateLoader();
        NetInfo.addEventListener(
            'connectionChange',
            this.handleFirstConnectivityChange
        );
    }


    componentDidUpdate(prevProps) {
        if (prevProps.user !== this.props.user) {
            if (this.props.user.userId) {
                Actions.reset(PageKeys.MAP);
                // Animated.timing(this.state.pageOpacity, {
                //     toValue: 0,
                //     duration: 1500,
                //     easing: Easing.linear
                // }).start(() => setTimeout(() => Actions.reset(PageKeys.MAP), 100));
            }
        }
    }
    handleFirstConnectivityChange = async (connectionInfo) => {
        if (connectionInfo.type === 'wifi' || connectionInfo.type === 'cellular') {
            var userAuthToken = await AsyncStorage.getItem(USER_AUTH_TOKEN);
            var deviceToken = await AsyncStorage.getItem(DEVICE_TOKEN);
            var bgTimeTrackList = await AsyncStorage.getItem('bgTimeTrackList');
            console.log("bgTimeTrackList: ", bgTimeTrackList);
            if (userAuthToken) {
                this.props.updateToken({ userAuthToken, deviceToken });
                console.log("updateToken called: ", { userAuthToken, deviceToken });
                axios.post(USER_BASE_URL + 'loginUserUsingAccessToken', { accessToken: userAuthToken, date: new Date().toISOString() }, { timeout: 15000 })
                    .then(res => {
                        if (res.status === 200) {
                            this.props.storeUser(res.data);
                        }
                    })
                    .catch(error => {
                        console.log(error.response.data);
                        Actions.reset(PageKeys.LOGIN);
                    })
            }
            else {
                Actions.reset(PageKeys.LOGIN);
            }
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


{/* <Animated.View style={[styles.fill, { opacity: this.state.pageOpacity }]}>
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
            </Animated.View> */}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    return { user };
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateToken: (token) => dispatch(updateTokenAction(token)),
        storeUser: (userInfo) => dispatch(storeUserAction(userInfo)),
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