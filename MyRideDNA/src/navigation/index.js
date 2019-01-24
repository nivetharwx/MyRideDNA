import React, { Component } from 'react';
import { Router, Scene } from 'react-native-router-flux';
import { Provider } from 'react-redux';
import { Root } from 'native-base';

import { WindowDimensions, PageKeys } from '../constants';

import SplashScreen from '../containers/splash-screen';
import ForgotPassword from '../containers/forgot-password';
import Login from '../containers/login';
import Profile from '../containers/profile';
import Rides from '../containers/rides';
import { AppNavigationMenu } from '../containers/app-navigation-menu';
import Map from '../containers/map';
import Signup from '../containers/signup';
import { Passengers } from '../containers/passengers';
import { Garage } from '../containers/garage';
import { Notifications } from '../containers/notifications';
import { GalleryView } from '../components/gallery';

import store from '../store/index';
import EditProfile from '../containers/edit-profile';
import Tabs from '../containers/tabs';
import CreateRide from '../containers/create-ride';

export default class Navigation extends Component {
    render() {
        return (
            <Provider store={store}>
                <Root>
                    <Router>
                        <Scene key='root'>
                            <Scene key={PageKeys.SPLASH_SCREEN} component={SplashScreen} hideNavBar initial></Scene>
                            <Scene key={PageKeys.LOGIN} component={Login} hideNavBar></Scene>
                            <Scene key={PageKeys.SIGNUP} component={Signup} hideNavBar></Scene>
                            <Scene key={PageKeys.FORGOT_PASSWORD} component={ForgotPassword} hideNavBar></Scene>
                            <Scene key={PageKeys.TABS} component={Tabs} hideNavBar></Scene>
                            <Scene key={PageKeys.RIDES} component={Rides} hideNavBar></Scene>
                            <Scene key={PageKeys.PROFILE} component={Profile} hideNavBar></Scene>
                            <Scene key={PageKeys.MAP} component={Map} hideNavBar></Scene>
                            <Scene key={PageKeys.CREATE_RIDE} component={CreateRide} hideNavBar></Scene>
                            <Scene key={PageKeys.GALLERY} component={GalleryView} hideNavBar></Scene>
                            <Scene key={PageKeys.EDIT_PROFILE} modal={true} component={EditProfile} hideNavBar></Scene>
                            <Scene key={PageKeys.PASSENGERS} component={Passengers} hideNavBar></Scene>
                            <Scene key={PageKeys.VISIT_GARAGE} component={Garage} hideNavBar></Scene>
                            <Scene key={PageKeys.NOTIFICATIONS} component={Notifications} hideNavBar></Scene>
                            <Scene key={PageKeys.APP_NAVIGATION_MENU} component={AppNavigationMenu} hideNavBar></Scene>
                        </Scene>
                    </Router>
                </Root>
            </Provider>
        );
    }
}