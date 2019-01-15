import React, { Component } from 'react';
import { SafeAreaView, Animated, DeviceEventEmitter } from 'react-native';
import { connect } from 'react-redux';
import RNSettings from 'react-native-settings';

import { createMaterialTopTabNavigator, NavigationActions } from 'react-navigation';
import Profile from '../profile';
import Rides from '../rides';
import Map from '../map';
import { User } from '../../model/user';
import { TAB_CONTAINER_HEIGHT, PageKeys } from '../../constants';
import { deviceLocationStateAction, appNavMenuVisibilityAction, screenChangeAction } from '../../actions';
import Spinner from 'react-native-loading-spinner-overlay';
import { ShifterButton } from '../../components/buttons';
import { MenuModal } from '../../components/modal';
import { Actions } from 'react-native-router-flux';

class Tabs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showLoader: props.showLoader,
        }
    }

    componentDidMount() {
        //DOC: Listen for device location settings change
        DeviceEventEmitter.addListener(RNSettings.GPS_PROVIDER_EVENT, this.handleGPSProviderEvent);
    }

    toggleAppNavigation = () => this.props.showMenu ? this.props.hideAppNavMenu() : this.props.showAppNavMenu();

    onCloseAppNavMenu = () => this.props.hideAppNavMenu();

    onPressAppNavMenu = (screenKey) => this.props.changeScreen(screenKey);

    componentWillReceiveProps(nextProps) {
        const { showLoader, showMenu, currentScreen } = nextProps;

        if (this.props.showLoader && !showLoader) {
            this.setState({ showLoader: showLoader });
        } else if (showLoader && !this.props.showLoader) {
            this.setState({ showLoader: showLoader });
        }

        // if (this.props.showMenu && !showMenu) {

        // }
        if (this.props.currentScreen !== currentScreen) {
            Actions[currentScreen]();
        }
    }

    handleGPSProviderEvent = (e) => {
        // FIXME: Remove listener as it is listen twice :(
        DeviceEventEmitter.removeListener(RNSettings.GPS_PROVIDER_EVENT, this.handleGPSProviderEvent);
        if (e[RNSettings.LOCATION_SETTING] === RNSettings.DISABLED) {
            this.props.updateDeviceLocationState(false);
        } else if (e[RNSettings.LOCATION_SETTING] === RNSettings.ENABLED) {
            this.props.updateDeviceLocationState(true);
        }
        // FIXME: DeviceEventEmitter listen again with a short delay of 50ms
        setTimeout(() => DeviceEventEmitter.addListener(RNSettings.GPS_PROVIDER_EVENT, this.handleGPSProviderEvent), 50);
    }

    componentWillUnmount() {
        DeviceEventEmitter.removeListener(RNSettings.GPS_PROVIDER_EVENT, this.handleGPSProviderEvent);
    }

    render() {
        const { showMenu } = this.props;
        const { showLoader } = this.state;
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
                <MenuModal isVisible={showMenu} onClose={this.onCloseAppNavMenu} onPressNavMenu={this.onPressAppNavMenu} />
                <Spinner
                    visible={showLoader}
                    textContent={'Loading...'}
                    textStyle={{ color: '#fff' }}
                />
                <AppTabNavigator style={{ display: 'none', height: 0 }} />

                {/* Shifter: - Brings the menu */}
                <ShifterButton onPress={this.toggleAppNavigation} />
            </SafeAreaView>
        );
    }
}

const mapStateToProps = (state) => {
    const { showMenu, currentScreen } = state.TabVisibility;
    const { showLoader } = state.PageState;
    const { user } = state.UserAuth;
    return { showMenu, user, showLoader, currentScreen };
};
const mapDispatchToProps = (dispatch) => {
    return {
        updateDeviceLocationState: (locationState) => dispatch(deviceLocationStateAction(locationState)),
        hideAppNavMenu: () => dispatch(appNavMenuVisibilityAction(false)),
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        changeScreen: (screenKey) => dispatch(screenChangeAction(screenKey))
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Tabs);


const AppTabNavigator = createMaterialTopTabNavigator({
    Rides: {
        screen: Rides,
        navigationOptions: {
            tabBarLabel: 'Rides',
        }
    },
    Profile: {
        screen: Profile,
        navigationOptions: {
            tabBarLabel: 'Profile',
        }
    },
    Map: {
        screen: Map,
        navigationOptions: {
            tabBarLabel: 'Map',

        }
    }
}, {
        initialRouteName: 'Map',
        tabBarPosition: 'bottom',
        tabBarOptions: {
            activeTintColor: 'tomato',
            inactiveTintColor: 'grey',
            style: {
                backgroundColor: '#f2f2f2',
                height: 0,
            },
            indicatorStyle: {
                height: 0
            },
            showIcon: false,
        }
    });