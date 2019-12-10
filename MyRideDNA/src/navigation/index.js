import React, { Component } from 'react';
import { Router, Scene } from 'react-native-router-flux';
import { Provider } from 'react-redux';
import { Root } from 'native-base';

import { WindowDimensions, PageKeys } from '../constants';

import SplashScreen from '../containers/splash-screen';
import ForgotPassword from '../containers/forgot-password';
import Login from '../containers/login';
import Profile from '../containers/profile';
import FriendsProfile from '../containers/friends-profile';
import Friends from '../containers/friends';
import Group from '../containers/friends/group';
import GroupForm from '../containers/friends/group-list/add-edit-group-form';
import Rides from '../containers/rides';
import Map from '../containers/map';
import WaypointList from '../containers/map/waypoint-list';
import CommentSection from '../containers/map/comment-scetion';
import Chat from '../containers/chats';
import Signup from '../containers/signup';
import Passengers from '../containers/passengers';
import PaasengerForm from '../containers/passengers/add-edit-passenger-from';
import PassengersProfile from '../containers/passengers/passenger-profile';
import Notifications from '../containers/notifications';
import { GalleryView } from '../components/gallery';

import store from '../store/index';
import ContactsSection from '../containers/contacts-section';
import CreateRide from '../containers/create-ride';
import AddBikeForm from '../containers/profile/my-garage/add-edit-bike-form';
import EditProfileForm from '../containers/profile/my-profile/edit-profile-form';
import MyWalletForm from '../containers/profile/my-profile/my-wallet-form';
import Settings from '../containers/settings';
import Offers from '../containers/offers';
import ChatList from '../containers/chats/chat-list';
import Album from '../containers/album';
import BikeDetails from '../containers/profile/my-garage/bike-details';
import BikeAlbum from '../containers/profile/my-garage/bike-details/bike-album';
import BikeSpecs from '../containers/profile/my-garage/bike-details/bike-specs';
import LogggedRide from '../containers/profile/my-garage/bike-details/logged-ride';
import PostForm from '../containers/post-form';
import BuddyFriends from '../containers/buddy-friends';
import BuddyPassengers from '../containers/buddy-passengers';
import BuddyAlbum from '../containers/buddy-album';

export default class Navigation extends Component {
    render() {
        return (
            <Provider store={store}>
                <Root>
                    <Router>
                        <Scene key='root'>
                            <Scene gesturesEnabled={false} key={PageKeys.SPLASH_SCREEN} component={SplashScreen} hideNavBar initial></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.LOGIN} component={Login} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.SIGNUP} component={Signup} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.FRIENDS} component={Friends} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.GROUP} component={Group} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.GROUP_FORM} component={GroupForm} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.FORGOT_PASSWORD} component={ForgotPassword} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.RIDES} component={Rides} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.PROFILE} component={Profile} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.SETTINGS} component={Settings} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.EDIT_PROFILE_FORM} component={EditProfileForm} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.MY_WALLET_FORM} component={MyWalletForm} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.ADD_BIKE_FORM} component={AddBikeForm} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.MAP} component={Map} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.WAYPOINTLIST} component={WaypointList} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.COMMENT_SECTION} component={CommentSection} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.CREATE_RIDE} component={CreateRide} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.GALLERY} component={GalleryView} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.PASSENGERS} component={Passengers} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.PASSENGER_FORM} component={PaasengerForm} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.PASSENGER_PROFILE} component={PassengersProfile} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.NOTIFICATIONS} component={Notifications} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.CONTACTS_SECTION} component={ContactsSection} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.FRIENDS_PROFILE} component={FriendsProfile} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.CHAT} component={Chat} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.OFFERS} component={Offers} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.CHAT_LIST} component={ChatList} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.ALBUM} component={Album} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.BIKE_DETAILS} component={BikeDetails} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.BIKE_ALBUM} component={BikeAlbum} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.BIKE_SPECS} component={BikeSpecs} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.LOGGED_RIDE} component={LogggedRide} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.POST_FORM} component={PostForm} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.BUDDY_FRIENDS} component={BuddyFriends} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.BUDDY_PASSENGERS} component={BuddyPassengers} hideNavBar></Scene>
                            <Scene gesturesEnabled={false} key={PageKeys.BUDDY_ALBUM} component={BuddyAlbum} hideNavBar></Scene>
                        </Scene>
                    </Router>
                </Root>
            </Provider>
        );
    }
}