import React, { Component } from 'react';
import { View, Text, StyleSheet, StatusBar, ImageBackground } from 'react-native';
import { Actions } from 'react-native-router-flux';

import { BasicHeader } from '../../components/headers';
import { heightPercentageToDP, APP_COMMON_STYLES, widthPercentageToDP } from '../../constants';
import { ShifterButton } from '../../components/buttons';
import { appNavMenuVisibilityAction } from '../../actions';
import { connect } from 'react-redux';
import { logoutUser } from '../../api';

class Offers extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    toggleAppNavigation = () => this.props.showAppNavMenu();

    componentWillUnmount() {
    }

    onPressLogout = async () => {
        this.props.logoutUser(this.props.user.userId, this.props.userAuthToken, this.props.deviceToken);
    }

    render() {
        const { user } = this.props;
        return (
            <View style={{ flex: 1 }}>
                <View style={APP_COMMON_STYLES.statusBar}>
                <StatusBar translucent backgroundColor='black' barStyle="light-content" />
                </View>
                <View style={{ flex: 1 }}>
                    <BasicHeader title='Offers' rightIconProps={{ name: 'md-exit', type: 'Ionicons', style: { fontSize: widthPercentageToDP(8), color: '#fff' }, onPress: this.onPressLogout }} />
                    <View style={styles.contentBody}>
                        <View style={{ backgroundColor: 'rgba(149, 165, 166, 1)', flex: 1, }}>
                            <ImageBackground source={require('../../assets/img/offers.png')} style={{ width: '100%', height: '100%' }} imageStyle={{ opacity: 0.2 }} ></ImageBackground>
                            <Text style={{ position: 'absolute', width: '100%', textAlign: 'center', marginTop: heightPercentageToDP(40), fontSize: 50, color: 'rgba(rgba(46, 49, 49, 1))' }}>Coming Soon...</Text>

                        </View>
                    </View>
                    {/* Shifter: - Brings the app navigation menu */}
                    <ShifterButton onPress={this.toggleAppNavigation} containerStyles={this.props.hasNetwork === false ? { bottom: heightPercentageToDP(8.5) } : null} alignLeft={user.handDominance === 'left'} />
                </View>
            </View>
        );
    }
}
const mapStateToProps = (state) => {
    const { user, userAuthToken, deviceToken } = state.UserAuth;
    const { hasNetwork } = state.PageState
    return { user, userAuthToken, deviceToken, hasNetwork };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        logoutUser: (userId, accessToken, deviceToken) => dispatch(logoutUser(userId, accessToken, deviceToken)),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Offers);

const styles = StyleSheet.create({
    contentBody: {
        marginTop: APP_COMMON_STYLES.headerHeight,
        backgroundColor: '#fff',
        justifyContent: 'center',
        flex: 1
    },
    name: {
        fontWeight: 'bold',
        fontSize: 15
    },
    message: {
        fontSize: 13
    },
    listItem: {
        marginLeft: 0,
        paddingLeft: 10,
        height: heightPercentageToDP(10),
        borderBottomWidth: 1,
        borderBottomColor: '#000'
    },
    noBorderTB: {
        borderBottomWidth: 0,
        borderTopWidth: 0,
    },
    itemBody: {
        height: '100%',
        justifyContent: 'center'
    },
    avatarContainer: {
        height: '100%',
        paddingTop: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    bottomImage: {
        height: '100%',
        width: '100%',
        flexShrink: 1
    }
});