import React, { Component } from 'react';
import {
    SafeAreaView, View, TouchableOpacity, Alert,
    Keyboard, Image, BackHandler, Animated,
    DeviceEventEmitter, Text, AsyncStorage, StatusBar,
    AppState
} from 'react-native';
import { connect } from 'react-redux';

import RNSettings from 'react-native-settings';
import Geolocation from 'react-native-geolocation-service';

import MapboxGL from '@mapbox/react-native-mapbox-gl';
import Permissions from 'react-native-permissions';
import * as turfHelpers from '@turf/helpers';
import { default as turfBBox } from '@turf/bbox';
import { default as turfBBoxPolygon } from '@turf/bbox-polygon';
import { default as turfCircle } from '@turf/circle';
import { default as turfDistance } from '@turf/distance';
import { default as turfTransformRotate } from '@turf/transform-rotate';
import Spinner from 'react-native-loading-spinner-overlay';
import { Icon as NBIcon } from 'native-base';
import { BULLSEYE_SIZE, MAP_ACCESS_TOKEN, JS_SDK_ACCESS_TOKEN, PageKeys, WindowDimensions, RIDE_BASE_URL, IS_ANDROID, RECORD_RIDE_STATUS, ICON_NAMES, APP_COMMON_STYLES, widthPercentageToDP, APP_EVENT_NAME, APP_EVENT_TYPE, USER_AUTH_TOKEN, heightPercentageToDP, RIDE_POINT } from '../../constants';
import { clearRideAction, deviceLocationStateAction, appNavMenuVisibilityAction, screenChangeAction, undoRideAction, redoRideAction, initUndoRedoRideAction, addWaypointAction, updateWaypointAction, deleteWaypointAction, updateRideAction, resetCurrentFriendAction, updateSourceOrDestinationNameAction, updateWaypointNameAction, resetCurrentGroupAction, hideFriendsLocationAction, resetStateOnLogout } from '../../actions';
import { SearchBox } from '../../components/inputs';
import { SearchResults } from '../../components/pages';
import { Actions } from 'react-native-router-flux';
import { MapControlPair, BasicButton, IconButton, ShifterButton, LinkButton } from '../../components/buttons';
import { IconLabelPair } from '../../components/labels';
import WaypointList from './waypoint-list';

import Base64 from '../../util';

import styles from './styles';

import DEFAULT_WAYPOINT_ICON from '../../assets/img/location-pin-red-small.png';
import SELECTED_WAYPOINT_ICON from '../../assets/img/location-pin-green-small.png';
import DEFAULT_SOURCE_ICON from '../../assets/img/source-pin-red.png';
import SELECTED_SOURCE_ICON from '../../assets/img/source-pin-green.png';
import DEFAULT_DESTINATION_ICON from '../../assets/img/destination-pin-red.png';
import SELECTED_DESTINATION_ICON from '../../assets/img/destination-pin-green.png';
import FRIENDS_LOCATION_ICON from '../../assets/img/friends-location.png';

import { updateRide, addWaypoint, addSource, createRecordRide, pauseRecordRide, updateWaypoint, updateSource, updateDestination, makeWaypointAsDestination, makeDestinationAsWaypoint, makeSourceAsWaypoint, makeWaypointAsSource, continueRecordRide, addTrackpoints, completeRecordRide, deleteWaypoint, deleteDestination, deleteSource, getRideByRideId, createNewRide, replaceRide, pushNotification, getAllNotifications, readNotification, publishEvent, deleteAllNotifications, deleteNotifications, logoutUser, updateLocation } from '../../api';

import Bubble from '../../components/bubble';
import MenuModal from '../../components/modal';
import { BasicHeader } from '../../components/headers';
import { CreateRide } from '../create-ride';
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation';
import axios from 'axios';

MapboxGL.setAccessToken(MAP_ACCESS_TOKEN);
// DOC: JS mapbox library to make direction api calls
const mbxDirections = require('@mapbox/mapbox-sdk/services/directions');
const directionsClient = mbxDirections({ accessToken: JS_SDK_ACCESS_TOKEN });
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: JS_SDK_ACCESS_TOKEN });
const mbxMapMatching = require('@mapbox/mapbox-sdk/services/map-matching');
const mapMatchingClient = mbxMapMatching({ accessToken: JS_SDK_ACCESS_TOKEN });
const shapeSourceImages = {
    waypointDefault: DEFAULT_WAYPOINT_ICON,
    waypointSelected: SELECTED_WAYPOINT_ICON,
    sourceDefault: DEFAULT_SOURCE_ICON,
    sourceSelected: SELECTED_SOURCE_ICON,
    destinationDefault: DEFAULT_DESTINATION_ICON,
    destinationSelected: SELECTED_DESTINATION_ICON
};

const WINDOW_HALF_HEIGHT = (WindowDimensions.height / 2);
const CREATE_RIDE_CONTAINER_HEIGHT = WindowDimensions.height;
const RIDE_UPDATE_COUNT_TO_SYNC = 5;
const DEFAULT_ZOOM_DIFFERENCE = 1;
const DEFAULT_ZOOM_LEVEL = 15;

export class Map extends Component {
    prevUserTrackTime = 0;
    _mapView = null;
    _searchRef = null;
    locationPermission = null;
    watchID = null;
    isLocationOn = false;
    gpsPointTimestamps = [];
    rootScreen = PageKeys.MAP;
    mapCircleTimeout = null;
    bottomLeftDefaultPoint = null;
    fetchDirOnUndoRedo = true;
    notificationInterval = null;
    constructor(props) {
        super(props);
        this.state = {
            mapZoomLevel: DEFAULT_ZOOM_LEVEL,
            directions: null,
            markerCollection: {
                type: 'FeatureCollection',
                features: []
            },
            mapViewHeight: 0,
            activeMarkerIndex: -1,
            isUpdatingWaypoint: false,
            searchResults: [],
            searchQuery: '',
            isEditable: false,
            undoActions: [],
            redoActions: [],
            snapshot: null,
            hideRoute: false,
            optionsBarRightAnim: new Animated.Value(100),
            controlsBarLeftAnim: new Animated.Value(-100),
            waypointListLeftAnim: new Animated.Value(-widthPercentageToDP(100)),
            currentLocation: null,
            gpsPointCollection:
            {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "geometry": {
                            "type": "LineString",
                            "coordinates": []
                        }
                    }
                ]
            },
            mapMatchinRoute: null,
            mapRadiusCircle: null,
            diameter: 0,
            calloutOffsets: [],
            showCreateRide: false,
            rideUpdateCount: 0,
            friendsLocationCollection: {
                type: 'FeatureCollection',
                features: []
            },
            friendsImage: {}
        };
    }

    componentWillReceiveProps(nextProps) {
        // console.log(this.props.ride === nextProps.ride); // DOC: false when something changes in ride
        const { ride, isLocationOn, currentScreen } = nextProps;
        let updatedState = {};

        if (this.isLocationOn != isLocationOn) {
            this.isLocationOn = isLocationOn;
            if (isLocationOn === false) this.getCurrentLocation();
        }
        if (this.props.ride != ride) {            // DOC: Reset directions and markerCollection when redux clear the ride
            if (this.props.ride.rideId != ride.rideId) {
                this.initializeEmptyRide(updatedState);
                updatedState.rideUpdateCount = 0;
                if (ride.isRecorded === false && ride.userId === this.props.user.userId) {
                    updatedState.isEditable = true;
                } else {
                    updatedState.isEditable = false;
                }

                // TODO: Loading different ride
                if (ride.rideId) {
                    if (this.state.showCreateRide === true) {
                        updatedState.showCreateRide = false;
                    }

                    if (ride.isRecorded) {
                        updatedState.gpsPointCollection.features[0].geometry.coordinates = ride.trackpoints.reduce((arr, trackpoint) => {
                            arr.push([trackpoint.lng, trackpoint.lat]);
                            return arr;
                        }, []);
                    }

                    if (ride.source) {
                        const sourceMarker = this.createMarkerFeature([ride.source.lng, ride.source.lat], ICON_NAMES.SOURCE_DEFAULT);
                        updatedState.markerCollection.features = [sourceMarker];
                    }

                    if (ride.waypoints.length > 0) {
                        let idx = 1;
                        updatedState.markerCollection.features = ride.waypoints.reduce((arr, loc) => {
                            arr.push(this.createMarkerFeature([loc.lng, loc.lat], ICON_NAMES.WAYPOINT_DEFAULT, idx));
                            idx++;
                            return arr;
                        }, [...updatedState.markerCollection.features]);
                    }

                    if (ride.destination) {
                        const destinationMarker = this.createMarkerFeature([ride.destination.lng, ride.destination.lat], ICON_NAMES.DESTINATION_DEFAULT);
                        updatedState.markerCollection.features = [...updatedState.markerCollection.features, destinationMarker];
                    }
                }
            } else {
                if (ride.isRecorded) {
                    if (this.props.ride.status != ride.status) {
                        if (ride.status != null && (ride.status != RECORD_RIDE_STATUS.RUNNING || this.props.ride.status != null)) {
                            this.onChangeRecordRideStatus(ride.status);
                        }
                    }
                } else {
                    // TODO: Check for changing the waypoint order

                    this.initializeEmptyRide(updatedState);
                    // if (this.props.ride.source === null) {
                    //     if (ride.source) {
                    //         console.log("Adding source again");
                    //         this.props.addSource(ride.source, ride);
                    //     }
                    // } else {
                    //     if (ride.source === null) {
                    //         console.log("Deleting source again");
                    //         this.props.deleteSource(ride);
                    //     } else {
                    //         console.log("Updating source again");
                    //         this.props.updateSource(ride.source, ride);
                    //     }
                    // }

                    if (ride.source) {
                        const sourceMarker = this.createMarkerFeature([ride.source.lng, ride.source.lat], ICON_NAMES.SOURCE_DEFAULT);
                        updatedState.markerCollection.features = [sourceMarker];
                    }

                    if (ride.waypoints.length > 0) {
                        let idx = 1;
                        updatedState.markerCollection.features = ride.waypoints.reduce((arr, loc) => {
                            arr.push(this.createMarkerFeature([loc.lng, loc.lat], ICON_NAMES.WAYPOINT_DEFAULT, idx));
                            idx++;
                            return arr;
                        }, updatedState.markerCollection.features);
                    }

                    if (ride.destination) {
                        const destinationMarker = this.createMarkerFeature([ride.destination.lng, ride.destination.lat], ICON_NAMES.DESTINATION_DEFAULT);
                        updatedState.markerCollection.features = [...updatedState.markerCollection.features, destinationMarker];
                    }

                    // DOC: Calls replace ride API after each 5 updates on current ride to sync with server:
                    if (this.state.rideUpdateCount === RIDE_UPDATE_COUNT_TO_SYNC) {
                        updatedState.rideUpdateCount = 0;
                        replaceRide(ride.rideId, { source: ride.source, destination: ride.destination, waypoints: ride.waypoints });
                    }
                }
            }
        }
        if (this.props.currentScreen !== currentScreen && currentScreen.name !== Actions.currentScene) {
            if (Actions.prevState.routes.length > 1) {
                if (Actions.prevState.routes.findIndex(route => route.routeName === currentScreen.name) > -1) {
                    Actions.popTo(currentScreen.name, {})
                } else {
                    Actions.replace(currentScreen.name, currentScreen.params);
                }
            } else {
                currentScreen.name !== this.rootScreen
                    ? Actions.push(currentScreen.name, currentScreen.params)
                    : Actions.popTo(currentScreen.name, {})
            }
        }
        if (Object.keys(updatedState).length > 0) {
            this.setState(updatedState, () => {
                // DOC: Fetch route for build ride if waypoints are more than one
                if (!ride.isRecorded && updatedState.markerCollection && updatedState.markerCollection.features.length > 1) {
                    this.fetchDirections();
                }
                if (ride.isRecorded) {
                    let coordinates = [];
                    if (ride.source) {
                        coordinates.push([ride.source.lng, ride.source.lat]);
                    }
                    coordinates.push(...this.state.gpsPointCollection.features[0].geometry.coordinates);
                    if (ride.destination) {
                        coordinates.push([ride.destination.lng, ride.destination.lat]);
                    }
                    // DOC: Update the mapbounds to include the recorded ride path
                    const newBounds = turfBBox({ coordinates, type: 'LineString' });
                    this._mapView.fitBounds(newBounds.slice(0, 2), newBounds.slice(2), 20, 1000);
                }
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.user.locationEnable !== this.props.user.locationEnable) {
            this.props.user.locationEnable
                ? this.startTrackingLocation()
                : this.stopTrackingLocation();
        }
        if (prevProps.friendsLocationList !== this.props.friendsLocationList) {
            if (this.props.friendsLocationList === null) {
                this.setState({
                    friendsLocationCollection: {
                        type: 'FeatureCollection',
                        features: []
                    }
                });
                return;
            }
            // let friendsImage = {};
            const features = this.props.friendsLocationList.map(locInfo => {
                // locInfo.profilePicture
                //     ? friendsImage[locInfo.userId] = { uri: 'http://104.43.254.82:5051/getPictureById/5ca43ade33db83341960ee1b_thumb.jpeg' }
                //     // ? friendsImage[locInfo.userId] = { uri: locInfo.profilePicture }
                //     : friendsImage[locInfo.userId] = DEFAULT_WAYPOINT_ICON;
                // friendsImage[locInfo.userId + ''] = { uri:  };
                return this.createFriendsLocationMarker(locInfo);
            });
            this.setState({
                friendsLocationCollection: {
                    ...prevState.friendsLocationCollection,
                    features: features
                },
                // friendsImage: friendsImage
            }, () => {
                const newFriendLocation = this.props.friendsLocationList[this.props.friendsLocationList.length - 1];
                this.onPressRecenterMap([newFriendLocation.lng, newFriendLocation.lat]);
            });
        }
        const prevRide = prevProps.ride;
        const newRide = this.props.ride;
        if (prevRide !== newRide && newRide.isRecorded === false && (prevRide.rideId === null || (prevRide.rideId === newRide.rideId))) {
            if (prevRide.source !== newRide.source) {
                if (prevRide.source === null) {
                    console.log("source added");
                    if (!newRide.source.name) {
                        this.getPlaceNameByReverseGeocode([newRide.source.lng, newRide.source.lat],
                            (locationName) => locationName && this.props.updateSourceOrDestinationName(RIDE_POINT.SOURCE, locationName),
                            (err) => {
                                console.log("Reverse geocoding error for source: ", err);
                            }
                        );
                    }
                }
                else if (newRide.source === null) console.log("source removed");
                else if (prevRide.source.lng + '' + prevRide.source.lat !==
                    newRide.source.lng + '' + newRide.source.lat) {
                    console.log("source changed");
                    this.setState(prevState => ({ rideUpdateCount: prevState.rideUpdateCount + 1 }));
                    this.getPlaceNameByReverseGeocode([newRide.source.lng, newRide.source.lat],
                        (locationName) => locationName && this.props.updateSourceOrDestinationName(RIDE_POINT.SOURCE, locationName),
                        (err) => {
                            console.log("Reverse geocoding error for source: ", err);
                        }
                    );
                } else {
                    console.log("source name changed from: ", prevRide.source.name);
                    console.log("to: ", newRide.source.name);
                }
            }
            if (prevRide.destination !== newRide.destination) {
                if (prevRide.destination === null) {
                    if (!newRide.destination.name) {
                        this.getPlaceNameByReverseGeocode([newRide.destination.lng, newRide.destination.lat],
                            (locationName) => locationName && this.props.updateSourceOrDestinationName(RIDE_POINT.DESTINATION, locationName),
                            (err) => {
                                console.log("Reverse geocoding error for destination: ", err);
                            }
                        );
                    }
                }
                else if (newRide.destination === null) console.log("destination removed");
                else if (prevRide.destination.lng + '' + prevRide.destination.lat !==
                    newRide.destination.lng + '' + newRide.destination.lat) {
                    console.log("destination changed");
                    this.setState(prevState => ({ rideUpdateCount: prevState.rideUpdateCount + 1 }));
                    this.getPlaceNameByReverseGeocode([newRide.destination.lng, newRide.destination.lat],
                        (locationName) => locationName && this.props.updateSourceOrDestinationName(RIDE_POINT.DESTINATION, locationName),
                        (err) => {
                            console.log("Reverse geocoding error for destination: ", err);
                        }
                    );
                } else {
                    console.log("destination name changed from: ", prevRide.destination.name);
                    console.log("to: ", newRide.destination.name);
                }
            }
            if (prevRide.waypoints !== newRide.waypoints) {
                if (prevRide.waypoints.length === newRide.waypoints.length) {
                    console.log("Inside waypoints checking - equal length");
                    prevRide.waypoints.forEach((point, index) => {
                        const idx = newRide.waypoints.findIndex(wpoint => point.lng + '' + point.lat === wpoint.lng + '' + wpoint.lat);
                        if (idx === -1) {
                            console.log("replaced waypoint from: ", point);
                            console.log("to: ", newRide.waypoints[index]);
                            if (!newRide.waypoints[index].name) {
                                this.getPlaceNameByReverseGeocode([newRide.waypoints[index].lng, newRide.waypoints[index].lat],
                                    (locationName) => locationName && this.props.updateWaypointName(newRide.waypoints[index].lng + '' + newRide.waypoints[index].lat, locationName),
                                    (err) => {
                                        console.log("Reverse geocoding error for replaced waypoint: ", err);
                                    }
                                );
                            }
                            this.setState(prevState => ({ rideUpdateCount: prevState.rideUpdateCount + 1 }));
                            return;
                        }
                        if (idx !== index) {
                            console.log("reordered waypoint: ", point);
                            this.setState(prevState => ({ rideUpdateCount: prevState.rideUpdateCount + 1 }));
                        }
                    });
                } else if (prevRide.waypoints.length > newRide.waypoints.length) {
                    console.log("Inside waypoints checking - waypoint removed");
                    prevRide.waypoints.some((point, index) => {
                        const hasPoint = newRide.waypoints.some(wpoint => point.lng + '' + point.lat === wpoint.lng + '' + wpoint.lat);
                        if (!hasPoint) {
                            console.log("removed waypoint: ", point);
                        }
                    });
                } else if (prevRide.waypoints.length < newRide.waypoints.length) {
                    console.log("Inside waypoints checking - waypoint added");
                    newRide.waypoints.forEach((point, index) => {
                        const hasPoint = prevRide.waypoints.some(wpoint => point.lng + '' + point.lat === wpoint.lng + '' + wpoint.lat);
                        if (!hasPoint) {
                            console.log("added waypoint: ", point);
                            if (!point.name) {
                                this.getPlaceNameByReverseGeocode([point.lng, point.lat],
                                    (locationName) => locationName && this.props.updateWaypointName(point.lng + '' + point.lat, locationName),
                                    (err) => {
                                        console.log("Reverse geocoding error for newly added waypoint: ", err);
                                    }
                                );
                            }
                        }
                    });
                }
            }
            if (this.props.ride.rideId === null) {
                this.onPressRecenterMap();
            }
        }
    }

    initializeEmptyRide(updatedState) {
        updatedState.directions = null;
        updatedState.markerCollection = {
            ...this.state.markerCollection,
            features: []
        };

        // DOC: Resetting record ride features
        this.gpsPointTimestamps.length = 0;
        updatedState.gpsPointCollection = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": []
                    }
                }
            ]
        };
    }


    getPlaceNameByReverseGeocode = async (location, successCallback, errorCallback) => {
        try {
            const { body } = await geocodingClient.reverseGeocode({
                query: location,
                types: ['place', 'locality', 'address']
            }).send();
            if (body.features) {
                console.log("Reverse geocoding success: ", JSON.parse(JSON.stringify(body)));
                let locationName = '';
                body.features.some(feature => {
                    if (feature.id.indexOf('locality.') > -1 || feature.id.indexOf('place.') > -1 || feature.id.indexOf('address.') > -1) {
                        locationName = feature.text;
                        return true;
                    }
                    return false;
                });
                successCallback(locationName);
            }
        } catch (er) {
            console.log("Reverse geocoding error: ", er);
            errorCallback(er);
        }
    }

    toggleAppNavigation = () => this.props.showMenu ? this.props.hideAppNavMenu() : this.props.showAppNavMenu();

    onCloseAppNavMenu = () => this.props.hideAppNavMenu();

    onPressAppNavMenu = (screenKey) => {
        if (this.state.rideUpdateCount > 0 && screenKey !== PageKeys.Map) {
            const { ride } = this.props;
            if (ride.rideId) {
                replaceRide(ride.rideId, { source: ride.source, destination: ride.destination, waypoints: ride.waypoints });
            }
        }
        this.props.changeScreen({ name: screenKey });
    }

    async componentDidMount() {
        this.props.publishEvent({ eventName: APP_EVENT_NAME.USER_EVENT, eventType: APP_EVENT_TYPE.ACTIVE, eventParam: { isLoggedIn: true, userId: this.props.user.userId } });
        this.props.pushNotification(this.props.user.userId);
        this.props.getAllNotifications(this.props.user.userId);
        this.notificationInterval = setInterval(() => {
            this.props.getAllNotifications(this.props.user.userId);
        }, 60 * 1000);
        if (this.props.user.locationEnable) this.startTrackingLocation();
        // AppState.addEventListener('change', this.handleAppStateChange);
        BackgroundGeolocation.on('location', (location) => {
            // TODO: Has to change default timeIntervalInSeconds from the backend (60 seconds)
            console.log("checking time gap: ", location.time - this.prevUserTrackTime, this.props.user.timeIntervalInSeconds * 1000);
            if (location.time - this.prevUserTrackTime > (this.props.user.timeIntervalInSeconds * 1000)) {
                this.prevUserTrackTime = location.time;
                this.props.updateLocation(this.props.user.userId, { lat: location.latitude, lng: location.longitude });

                // TODO: Need to understand about the task
                // BackgroundGeolocation.startTask(taskKey => {
                //     BackgroundGeolocation.endTask(taskKey);
                // });
            }
        });
        BackgroundGeolocation.on('stationary', (stationaryLocation) => {
            console.log("Got stationary location: ", stationaryLocation);
        });
        BackgroundGeolocation.on('error', (error) => {
            console.log('[ERROR] BackgroundGeolocation error: ', error);
        });
        BackgroundGeolocation.on('start', () => {
            console.log('[INFO] BackgroundGeolocation service has been started');
        });
        BackgroundGeolocation.on('stop', () => {
            console.log('[INFO] BackgroundGeolocation service has been stopped');
        });
        BackgroundGeolocation.on('background', () => {
            // this.props.publishEvent({ eventName: APP_EVENT_NAME.USER_EVENT, eventType: APP_EVENT_TYPE.INACTIVE, eventParam: { isLoggedIn: true, userId: this.props.user.userId } });
        });

        BackgroundGeolocation.on('foreground', () => {
            // this.props.publishEvent({ eventName: APP_EVENT_NAME.USER_EVENT, eventType: APP_EVENT_TYPE.ACTIVE, eventParam: { isLoggedIn: true, userId: this.props.user.userId } });
        });
        BackgroundGeolocation.checkStatus(status => {
            // console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
            // console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
            // console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);
            if (!status.isRunning && this.props.user.locationEnable) {
                this.startTrackingLocation();
            }
        });

        //DOC: Listen for device location settings change
        // DeviceEventEmitter.addListener(RNSettings.GPS_PROVIDER_EVENT, this.handleGPSProviderEvent);

        BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPress);
    }

    handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'active') {
            this.props.publishEvent({ eventName: APP_EVENT_NAME.USER_EVENT, eventType: APP_EVENT_TYPE.ACTIVE, eventParam: { userId: this.props.user.userId } });
        } else {
            this.props.publishEvent({ eventName: APP_EVENT_NAME.USER_EVENT, eventType: APP_EVENT_TYPE.INACTIVE, eventParam: { userId: this.props.user.userId } });
        }
    }

    startTrackingLocation = () => {
        // Geolocation.getCurrentPosition(
        //     ({ coords }) => {
        //         this.props.updateLocation(this.props.user.userId, { lat: coords.latitude, lng: coords.longitude, lastUpdatedTime: new Date().toISOString() });
        //     },
        //     (error) => {
        //         console.log(error.code, error.message);
        //     },
        //     { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        // );
        // this.trackLocationInterval = setInterval(() => {
        //     Geolocation.getCurrentPosition(
        //         ({ coords }) => {
        //             this.props.updateLocation(this.props.user.userId, { lat: coords.latitude, lng: coords.longitude, lastUpdatedTime: new Date().toISOString() });
        //         },
        //         (error) => {
        //             console.log(error.code, error.message);
        //         },
        //         { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        //     );
        // }, this.props.user.timeIntervalInSeconds * 1000);
        BackgroundGeolocation.start()
    }

    stopTrackingLocation = () => {
        // clearInterval(this.trackLocationInterval);
        BackgroundGeolocation.stop();
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

    getCurrentLocation = async (recenterMap) => {
        Geolocation.getCurrentPosition(
            ({ coords }) => {
                this.setState({ currentLocation: { location: [coords.longitude, coords.latitude], name: '' } }, () => {
                    if (recenterMap) {
                        this._mapView.flyTo(this.state.currentLocation.location, 500);
                    }
                });
            },
            (error) => {
                console.log(error.code, error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }

    watchLocation = async () => {
        // this.watchID = Geolocation.watchPosition(({ coords }) => {
        //     this.setState({ currentLocation: { latitude: coords.latitude, longitude: coords.longitude } })
        // }, err => console.log("watchPosition error: ", err),
        //     { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
        let trackpointTick = 0;
        let updatedgpsPointCollection = {};
        this.stopTrackingLocation();
        this.watchID = setInterval(() => {
            Geolocation.getCurrentPosition(
                ({ coords }) => {
                    if (this.state.currentLocation === null || this.state.currentLocation.location.join('') != (coords.longitude + '' + coords.latitude)) {
                        const { gpsPointCollection } = this.state;
                        const feature = gpsPointCollection.features[0];
                        let points = [...feature.geometry.coordinates, [coords.longitude, coords.latitude]];
                        trackpointTick++;
                        if (trackpointTick === 5) {
                            updatedgpsPointCollection.gpsPointCollection = {
                                ...gpsPointCollection,
                                features: [{
                                    ...feature, geometry: {
                                        ...feature.geometry,
                                        coordinates: points
                                    }
                                }]
                            }
                            this.gpsPointTimestamps.push(new Date().toISOString()); // TODO: Use Date.now() for sending to mapbox api, if it is supporting timestamps
                            trackpointTick = 0;
                            if (this.gpsPointTimestamps.length === 100) {
                                this.getCoordsOnRoad(points.slice(-this.gpsPointTimestamps.length), this.gpsPointTimestamps, (responseBody, trackpoints, distance) => this.props.addTrackpoints(trackpoints, distance, ride, this.props.user.userId));
                                this.gpsPointTimestamps = [];
                            }
                        }
                        this.setState({ ...updatedgpsPointCollection, currentLocation: { location: [coords.longitude, coords.latitude], name: '' } });
                    }

                },
                (error) => {
                    console.log(error.code, error.message);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        }, 1000);
    }

    async getCoordsOnRoad(gpsPoints, gpsPointTimestamps, callback) {
        let locPathParam = gpsPoints.reduce((param, coord) => param + coord.join(',') + ';', "");
        locPathParam = locPathParam.slice(0, locPathParam.length - 1);
        axios.get(`https://api.mapbox.com/matching/v5/mapbox/driving/${locPathParam}?tidy=true&geometries=geojson&access_token=${JS_SDK_ACCESS_TOKEN}`)
            .then(res => {
                const { matchings } = res.data;
                // const { matchings } = { "matchings": [{ "confidence": 0.9857242020570576, "geometry": { "coordinates": [[-117.172834, 32.712036], [-117.172907, 32.712246], [-117.17292, 32.71244], [-117.172922, 32.71256]], "type": "LineString" }, "legs": [{ "summary": "", "weight": 2.3, "duration": 2.3, "steps": [], "distance": 24.4 }, { "summary": "", "weight": 2.1, "duration": 2.1, "steps": [], "distance": 21.7 }, { "summary": "", "weight": 1.3, "duration": 1.3, "steps": [], "distance": 13.3 }], "weight_name": "routability", "weight": 5.7, "duration": 5.7, "distance": 59.39999999999999 }], "tracepoints": [{ "alternatives_count": 0, "waypoint_index": 0, "matchings_index": 0, "distance": 1.3853542029671861, "name": "North Harbor Drive", "location": [-117.172834, 32.712036] }, { "alternatives_count": 0, "waypoint_index": 1, "matchings_index": 0, "distance": 2.569666519692723, "name": "North Harbor Drive", "location": [-117.172907, 32.712246] }, { "alternatives_count": 0, "waypoint_index": 2, "matchings_index": 0, "distance": 0.9374409048322664, "name": "North Harbor Drive", "location": [-117.17292, 32.71244] }, { "alternatives_count": 9, "waypoint_index": 3, "matchings_index": 0, "distance": 0.18748818070001655, "name": "North Harbor Drive", "location": [-117.172922, 32.71256] }], "code": "Ok" };
                if (matchings.length === 0) {
                    console.log("No matching coords found");
                    callback(res.data, [], 0);
                    return;
                }
                // TODO: Return distance and duration from matching object (here matchings[0])
                const trackpoints = matchings[0].geometry.coordinates.reduce((arr, coord, index) => {
                    arr.push(coord[1], coord[0], gpsPointTimestamps[index]);
                    return arr;
                }, []);
                callback(res.data, trackpoints, matchings[0].distance);
            })
            .catch(er => {
                console.log("matching error: ", er);
            });
    }

    onBackButtonPress = () => {
        if (Actions.state.index != 0) {
            if (Actions.currentScene === PageKeys.FRIENDS_PROFILE) {
                this.props.resetCurrentFriend();
                // this.props.changeScreen(Actions.currentScene);
            } else if (Actions.currentScene === PageKeys.GROUP) {
                this.props.resetCurrentGroup();
                // this.props.changeScreen(Actions.currentScene);
            } else {
                Actions.pop();
                this.props.changeScreen({ name: Actions.currentScene });
            }
            return true;
        } else {
            return true;
        }
    }

    async fetchDirections() {
        const { features } = this.state.markerCollection;
        const { directions } = this.state;
        if (features.length >= 2) {
            try {
                const response = await directionsClient.getDirections({
                    waypoints: features.reduce((arr, feature) => {
                        arr.push({ coordinates: feature.geometry.coordinates });
                        return arr;
                    }, []),
                    overview: 'full',
                    geometries: 'geojson'
                }).send();

                Keyboard.dismiss();
                const responseBody = response.body;
                // DOC: Update the mapbounds to include the direction results
                const newBounds = turfBBox(responseBody.routes[0].geometry);
                this._mapView.fitBounds(newBounds.slice(0, 2), newBounds.slice(2), 20, 1000);

                this.setState({ directions: responseBody.routes[0] });
            } catch (err) {
                console.log("Error in getDirections(): ", err);
            }
        } else {
            directions && this.setState({ directions: null });
        }
    }

    onFinishMapLoading = async () => {
        console.log("Map loaded");
        this.locationPermission = await Permissions.request('location');
        if (this.locationPermission === 'authorized') {
            this.getCurrentLocation(true);
        }
    }

    getRegionForCoordinates(points) {
        // points should be an array of { latitude: X, longitude: Y }
        let minX, maxX, minY, maxY;

        // init first point
        ((point) => {
            minX = point.latitude;
            maxX = point.latitude;
            minY = point.longitude;
            maxY = point.longitude;
        })(points[0]);

        // calculate rect
        points.map((point) => {
            minX = Math.min(minX, point.latitude);
            maxX = Math.max(maxX, point.latitude);
            minY = Math.min(minY, point.longitude);
            maxY = Math.max(maxY, point.longitude);
        });

        const midX = (minX + maxX) / 2;
        const midY = (minY + maxY) / 2;
        const deltaX = (maxX - minX);
        const deltaY = (maxY - minY);

        return {
            latitude: midX,
            longitude: midY,
            latitudeDelta: deltaX,
            longitudeDelta: deltaY
        };
    }

    onRegionDidChange = async ({ properties, geometry }) => {
        if (this.props.user.showCircle === false) return;
        if (this.state.showCreateRide === false) {
            const mapZoomLevel = await this._mapView.getZoom();
            if (this.state.mapZoomLevel != mapZoomLevel) {
                const { circle, diameter, coords } = this.getVisibleMapInfo(properties, geometry);
                this.setState({ mapZoomLevel, mapRadiusCircle: circle, diameter: diameter.toFixed(2) }, () => {
                    clearTimeout(this.mapCircleTimeout);
                    this.mapCircleTimeout = setTimeout(() => this.setState({ mapRadiusCircle: null }), 2500);
                });
            }
        }
    }

    getVisibleMapInfo(regionProp, regionGeo) {
        const bottomRight = [regionProp.visibleBounds[0][0], regionProp.visibleBounds[1][1]];
        const bottomLeft = regionProp.visibleBounds[1];
        const center = regionGeo.coordinates;
        const fromPoint = turfHelpers.point(bottomLeft);
        const toPoint = turfHelpers.point(bottomRight);
        const options = { units: this.props.user.distanceUnit === 'km' ? 'kilometers' : 'miles' };
        const distanceBtwn = turfDistance(fromPoint, toPoint, options);
        const radius = distanceBtwn / 2;
        const mapRadiusCircle = turfCircle(center, radius, options);
        return { diameter: distanceBtwn, circle: mapRadiusCircle };
    }

    toggleReplaceOption = () => this.setState({ isUpdatingWaypoint: !this.state.isUpdatingWaypoint });

    createMarkerFeature = (coords, iconName, title = '') => {
        return {
            type: 'Feature',
            id: coords.join(''),
            geometry: {
                type: 'Point',
                coordinates: coords,
            },
            properties: {
                icon: iconName || ICON_NAMES.WAYPOINT_DEFAULT,
                title: 29
            },
        };
    }

    showDeleteConfirmation = (index) => {
        let point = 'waypoint';
        if (this.isSource(this.state.markerCollection.features[index])) {
            point = 'source';
        } else if (this.isDestination(this.state.markerCollection.features[index])) {
            point = 'destination';
        }

        Alert.alert(
            'Delete confirmation',
            `Are you sure to delete ${point}?`,
            [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'Delete', onPress: () => this.deleteWaypointFromIndex(index) },
            ],
            { cancelable: false }
        )
    }

    onPressDeleteOption = () => {
        this.deleteWaypointFromIndex(this.state.activeMarkerIndex);
    }

    deleteWaypointFromIndex = (index) => {
        const deletingSource = this.isSource(this.state.markerCollection.features[index]);
        let deletingDestination = false;
        let deletingLastWaypoint = index === this.state.markerCollection.features.length - 1;
        if (deletingLastWaypoint === true) {
            deletingDestination = this.isDestination(this.state.markerCollection.features[index]);
        }
        this.setState((prevState) => {
            const { features } = prevState.markerCollection;
            const undoActions = [...prevState.undoActions];
            const redoActions = [...prevState.redoActions];
            if (undoActions.length === 10) undoActions.shift();
            if (redoActions.length > 0) redoActions.splice(0);

            return {
                rideUpdateCount: prevState.rideUpdateCount + 1,
                markerCollection: {
                    ...prevState.markerCollection,
                    ...{
                        features: [...features.slice(0, index), ...features.slice(index + 1)]
                    }
                },
                activeMarkerIndex: -1
            }
        }, () => {
            this.onCloseOptionsBar();
            const { ride } = this.props;
            if (deletingSource) {
                this.props.deleteSource(ride);
            } else if (deletingDestination) {
                this.props.deleteDestination(ride);
            } else {
                const indexOnServer = index - 1;
                this.props.deleteWaypoint(ride, indexOnServer);
            }
            // this.fetchDirections();
        });
    }

    makeWaypointAsSource = () => {
        const { activeMarkerIndex } = this.state;
        const { ride } = this.props;
        this.setState(prevState => {
            const { features } = prevState.markerCollection;
            return {
                rideUpdateCount: prevState.rideUpdateCount + 1,
                markerCollection: {
                    ...prevState.markerCollection,
                    features: [{
                        ...features[activeMarkerIndex],
                        properties: { ...features[activeMarkerIndex].properties, icon: ICON_NAMES.SOURCE_DEFAULT }
                    }, ...features.slice(activeMarkerIndex + 1)]
                },
                activeMarkerIndex: -1
            }
        }, () => {
            this.onCloseOptionsBar();
            this.props.makeWaypointAsSource(ride, activeMarkerIndex - 1);
            console.log("makeWaypointAsSource called");
            console.log(JSON.parse(JSON.stringify(this.state.markerCollection.features)));
            // this.fetchDirections();
        });
    }

    makeSourceAsWaypoint = () => {
        const { ride } = this.props;
        this.setState(prevState => {
            const { activeMarkerIndex } = prevState;
            const { features } = prevState.markerCollection;
            return {
                rideUpdateCount: prevState.rideUpdateCount + 1,
                markerCollection: {
                    ...prevState.markerCollection,
                    features: [{
                        ...features[activeMarkerIndex],
                        properties: { ...features[activeMarkerIndex].properties, icon: 'waypointDefault' }
                    }, ...features.slice(0, activeMarkerIndex)]
                },
                activeMarkerIndex: -1
            }
        }, () => {
            this.onCloseOptionsBar();
            this.props.makeSourceAsWaypoint(ride);
            // this.fetchDirections();
        });
    }

    makeWaypointAsDestination = () => {
        const { activeMarkerIndex } = this.state;
        const { ride } = this.props;
        this.setState(prevState => {
            const { activeMarkerIndex } = prevState;
            const { features } = prevState.markerCollection;
            return {
                rideUpdateCount: prevState.rideUpdateCount + 1,
                markerCollection: {
                    ...prevState.markerCollection,
                    features: [...features.slice(0, activeMarkerIndex),
                    {
                        ...features[activeMarkerIndex],
                        properties: { ...features[activeMarkerIndex].properties, icon: ICON_NAMES.DESTINATION_DEFAULT }
                    }]
                },
                activeMarkerIndex: -1
            }
        }, () => {
            this.onCloseOptionsBar();
            this.props.makeWaypointAsDestination(ride, activeMarkerIndex - 1);
            // this.fetchDirections();
        });
    }

    makeDestinationAsWaypoint = () => {
        const { ride } = this.props;
        this.setState(prevState => {
            const { activeMarkerIndex } = prevState;
            const { features } = prevState.markerCollection;
            return {
                rideUpdateCount: prevState.rideUpdateCount + 1,
                markerCollection: {
                    ...prevState.markerCollection,
                    features: [...features.slice(0, activeMarkerIndex),
                    {
                        ...features[activeMarkerIndex],
                        properties: { ...features[activeMarkerIndex].properties, icon: 'waypointDefault' }
                    }]
                },
                activeMarkerIndex: -1
            }
        }, () => {
            this.onCloseOptionsBar();
            this.props.makeDestinationAsWaypoint(ride);
            // this.fetchDirections();
        });
    }

    onBullseyePress = async () => {
        if (this.state.showCreateRide === true) return;
        const mapCenter = await this._mapView.getCenter();
        const { ride } = this.props;
        let nextWaypointIndex = this.state.markerCollection.features.length;
        const isDestinationSelected = ride.destination && (this.state.activeMarkerIndex === (nextWaypointIndex - 1) || this.state.activeMarkerIndex === -1);
        let markerIcon = ICON_NAMES.WAYPOINT_DEFAULT;
        if (nextWaypointIndex === 0 || (this.state.isUpdatingWaypoint && this.state.activeMarkerIndex === 0)) {
            markerIcon = ICON_NAMES.SOURCE_DEFAULT;
        } else if (isDestinationSelected && this.state.isUpdatingWaypoint) {
            markerIcon = ICON_NAMES.DESTINATION_DEFAULT;
        }
        let newMarker = null;
        if (markerIcon === ICON_NAMES.WAYPOINT_DEFAULT) {
            newMarker = this.createMarkerFeature(mapCenter, markerIcon, this.props.ride.waypoints.length + 1);
        } else {
            newMarker = this.createMarkerFeature(mapCenter, markerIcon);
        }

        if (this.state.isUpdatingWaypoint) { //DOC: nextWaypointIndex will be the activeMarkerIndex of the array
            nextWaypointIndex = this.state.activeMarkerIndex;
            this.updateWaypointAtIndex(nextWaypointIndex, newMarker);
        } else {
            if (isDestinationSelected) { //DOC: nextWaypointIndex will be the second last index of the array (array.length - 2)
                nextWaypointIndex -= 1;
            } else if (this.state.activeMarkerIndex > -1) { //DOC: nextWaypointIndex will be the new index to the array (array.length + 1)
                nextWaypointIndex = this.state.activeMarkerIndex + 1;
            }
            this.addWaypointAtIndex(nextWaypointIndex, newMarker);
        }
    }

    // DOC: Adds waypoint at given index or at the end
    addWaypointAtIndex(index, marker, callback) {
        this.setState((prevState) => {
            const { features } = prevState.markerCollection;
            if (prevState.activeMarkerIndex === -1) {
                return {
                    rideUpdateCount: prevState.rideUpdateCount + 1,
                    markerCollection: {
                        ...prevState.markerCollection,
                        features: [...features, marker]
                    }
                }
            } else {
                const prevMarker = features[prevState.activeMarkerIndex];
                const isDestinationSelected = this.isDestination(prevMarker);
                return {
                    rideUpdateCount: prevState.rideUpdateCount + 1,
                    markerCollection: {
                        ...prevState.markerCollection,
                        features: [
                            ...features.slice(0, prevState.activeMarkerIndex),
                            marker,
                            ...features.slice(prevState.activeMarkerIndex)
                        ]
                    },
                    activeMarkerIndex: isDestinationSelected ? -1 : prevState.activeMarkerIndex
                }
            }
        }, () => {
            // DOC: Call the callback function, if any.
            callback && callback();

            this.onCloseOptionsBar();
            const { ride } = this.props;
            let waypoint = { name: '', address: '', lat: marker.geometry.coordinates[1], lng: marker.geometry.coordinates[0] };
            if (!ride.source) {
                this.props.addSource(waypoint);
            } else {
                const indexOnServer = index - 1;
                this.props.addWaypoint(waypoint, indexOnServer);
            }
            // this.fetchDirections();
        });
    }

    // DOC: Updates or replaces waypoint at given index
    updateWaypointAtIndex(index, marker, callback) {
        this.setState((prevState) => {
            const { features } = prevState.markerCollection;
            const undoActions = [...prevState.undoActions];
            const redoActions = [...prevState.redoActions];
            if (undoActions.length === 10) undoActions.shift();
            if (redoActions.length > 0) redoActions.splice(0);
            undoActions.push({
                action: 'update',
                opppositeAction: 'update',
                actionFunctionName: 'updateWaypointAtIndex',
                actionParams: { p1: index, p2: marker },
                oppositeActionFunctionName: 'updateWaypointAtIndex',
                oppositeActionParams: { p1: index, p2: features[index] }
            });

            return {
                rideUpdateCount: prevState.rideUpdateCount + 1,
                markerCollection: {
                    ...prevState.markerCollection,
                    ...{ features: [...features.slice(0, index), marker, ...features.slice(index + 1)] }
                },
                undoActions: undoActions,
                redoActions: redoActions,
                isUpdatingWaypoint: false,
                activeMarkerIndex: -1
            }
        }, () => {
            // DOC: Call the callback function, if any.
            callback && callback();

            this.onCloseOptionsBar();
            const { ride } = this.props;
            let waypoint = { name: '', address: '', lat: marker.geometry.coordinates[1], lng: marker.geometry.coordinates[0] };
            const indexOnServer = index - 1;
            if (index === 0) {
                this.props.updateSource(waypoint, ride);
            } else if (ride.destination && index === this.state.markerCollection.features.length - 1) {
                this.props.updateDestination(waypoint, ride);
            } else {
                this.props.updateWaypoint(waypoint, indexOnServer);
            }
            // this.fetchDirections();
        });
    }

    onPressRecenterMap = (location) => {
        const options = {
            zoom: DEFAULT_ZOOM_LEVEL,
            duration: 500,
            // mode: MapboxGL.CameraModes.Flight
        };
        this._mapView.setCamera(options);
        if (Array.isArray(location)) {
            // this.setState({ mapZoomLevel: DEFAULT_ZOOM_LEVEL }, () => {
            //     this._mapView.flyTo(location, 300);
            // });
            options.centerCoordinate = location;
            this._mapView.setCamera(options);
        } else if (this.state.currentLocation) {
            // this.setState({ mapZoomLevel: DEFAULT_ZOOM_LEVEL }, () => {
            //     this._mapView.flyTo(this.state.currentLocation.location, 500);
            // });
            options.centerCoordinate = this.state.currentLocation.location;
            this._mapView.setCamera(options);
        }
    }

    onPressZoomIn = () => {
        this.mapZoom(true);
    }

    onPressZoomOut = () => {
        this.mapZoom(false);
    }

    async mapZoom(isZoomIn) {
        clearTimeout(this.mapCircleTimeout);
        const zoom = await this._mapView.getZoom();
        const center = await this._mapView.getCenter();
        let options = {
            centerCoordinate: center,
            zoom: zoom + DEFAULT_ZOOM_DIFFERENCE * (isZoomIn ? 1 : -1),
            duration: 300
        };
        this._mapView.setCamera(options);
    }

    onPressUndo = () => {
        if (!this.props.canUndo) return;
        this.setState(prevState => ({ rideUpdateCount: prevState.rideUpdateCount + 1 }), () => {
            this.props.doUndo();
        });
    }

    onPressRedo = () => {
        if (!this.props.canRedo) return;
        this.setState(prevState => ({ rideUpdateCount: prevState.rideUpdateCount + 1 }), () => {
            this.props.doRedo();
        });
    }

    doSwap(actionObject) {
        let temp = actionObject.action;
        actionObject.action = actionObject.opppositeAction;
        actionObject.opppositeAction = temp;

        temp = actionObject.actionFunctionName;
        actionObject.actionFunctionName = actionObject.oppositeActionFunctionName;
        actionObject.oppositeActionFunctionName = temp;

        temp = actionObject.actionParams;
        actionObject.actionParams = actionObject.oppositeActionParams;
        actionObject.oppositeActionParams = temp;
        return actionObject;
    }

    onToggleRouteVisibility = () => {
        this.setState((prevState) => ({ hideRoute: !prevState.hideRoute }));
    }

    onPressMapCamera = () => {
        const { directions } = this.state;
        if (directions) {
            const mapBounds = turfBBox(directions.geometry);
            this._mapView.fitBounds(mapBounds.slice(0, 2), mapBounds.slice(2), 20, 0);
        }
        setTimeout(() => this._mapView.takeSnap(false).then(mapBase64 => {
            this.setState({ snapshot: mapBase64 }, () => console.log("State updated: ", this.state));
        }), 300);
    }

    onPressClear = () => {
        this.setState({ searchQuery: '' });
    }

    onPressSearchResultsClose = () => {
        Keyboard.dismiss();
        this.setState({ searchResults: [], searchQuery: '' });
    }

    onSelectPlace = (place) => {
        // DOC: Useful keys: place.geometry.coordinates and place.place_name
        Keyboard.dismiss();
        const placeKey = place.geometry.coordinates.join('');
        const { features } = this.state.markerCollection;
        const { activeMarkerIndex } = this.state;
        const { ride } = this.props;
        if (features.length > 0 && features[features.length - 1].geometry.coordinates.join('') === placeKey) {
            console.log("Found the last place same as this");
            return;
        }
        this.onPressSearchResultsClose();

        let nextWaypointIndex = features.length;
        const isDestinationSelected = ride.destination && (activeMarkerIndex === (nextWaypointIndex - 1) || activeMarkerIndex === -1);
        let markerIcon = ICON_NAMES.WAYPOINT_DEFAULT;
        if (nextWaypointIndex === 0 || (this.state.isUpdatingWaypoint && activeMarkerIndex === 0)) {
            markerIcon = ICON_NAMES.SOURCE_DEFAULT;
        } else if (isDestinationSelected && this.state.isUpdatingWaypoint) {
            markerIcon = ICON_NAMES.DESTINATION_DEFAULT;
        }
        let newMarker = null;
        if (markerIcon === ICON_NAMES.WAYPOINT_DEFAULT) {
            newMarker = this.createMarkerFeature(place.geometry.coordinates, markerIcon, this.props.ride.waypoints.length + 1);
        } else {
            newMarker = this.createMarkerFeature(place.geometry.coordinates, markerIcon);
        }

        if (this.state.isUpdatingWaypoint) { //DOC: nextWaypointIndex will be the activeMarkerIndex of the array
            nextWaypointIndex = activeMarkerIndex;
            this.updateWaypointAtIndex(nextWaypointIndex, newMarker, () => this._mapView.flyTo(place.geometry.coordinates, 500));
        } else {
            if (isDestinationSelected) { //DOC: nextWaypointIndex will be the second last index of the array (array.length - 2)
                nextWaypointIndex -= 1;
            } else if (activeMarkerIndex > -1) { //DOC: nextWaypointIndex will be the new index to the array (array.length + 1)
                nextWaypointIndex = activeMarkerIndex + 1;
            }
            this.addWaypointAtIndex(nextWaypointIndex, newMarker, () => this._mapView.flyTo(place.geometry.coordinates, 500));
        }
    }

    onSearchPlace = async (placeQuery) => {
        this.setState({ searchQuery: placeQuery });
        if (placeQuery.length < 2) return;
        const lastCharacter = placeQuery.slice(-1);
        if (lastCharacter === ' ') return;
        const response = await geocodingClient.forwardGeocode({
            query: placeQuery,
            limit: 10
        }).send();
        this.setState({ searchResults: response.body.features });
    }

    renderCurrentLocation(markerInfo) {
        return (
            <MapboxGL.PointAnnotation
                key={markerInfo.location.join('')}
                id={markerInfo.location.join('')}
                coordinate={markerInfo.location}>
                {
                    <View style={[styles.annotationContainer, { backgroundColor: 'rgba(19, 0, 231, 0.3)' }]}>
                        <View style={[styles.annotationFill, { backgroundColor: 'rgb(19, 0, 231)', transform: [{ scale: 0.5 }] }]} />
                    </View>
                }
                <MapboxGL.Callout
                    tipStyle={{ color: '#00ADEE' }}
                    contentStyle={{ backgroundColor: '#00ADEE', borderWidth: 2, borderColor: '#fff', borderRadius: 5 }}
                    textStyle={{ color: '#fff', fontSize: 16, padding: 8, borderRadius: 5 }}
                    title={markerInfo.name || 'Unknown'} />
            </MapboxGL.PointAnnotation>
        );
    }

    createRide = () => {
        // Actions.push(PageKeys.CREATE_RIDE);
        this.hideMapControls();
        this.hideWaypointList();
        this.setState({ showCreateRide: true });
    }

    onPressRecordRide = () => {
        this.hideMapControls();
        const { currentLocation } = this.state;
        const dateTime = new Date().toISOString();
        let rideDetails = {
            userId: this.props.user.userId,
            name: new Date().toLocaleString(),
            date: dateTime,
            isRecorded: true,
            startTime: new Date().toISOString()
        };
        if (currentLocation) {
            rideDetails.source = {
                lat: currentLocation.location[1],
                lng: currentLocation.location[0],
                date: dateTime
            };

            this.props.createRecordRide(rideDetails);

            this.watchLocation();
            return;
        } else {
            Geolocation.getCurrentPosition(
                ({ coords }) => {
                    rideDetails.source = {
                        lat: coords.latitude,
                        lng: coords.longitude,
                        date: dateTime
                    };

                    this.props.createRecordRide(rideDetails);

                    this.setState({ currentLocation: { location: [coords.longitude, coords.latitude], name: '' } }, () => {
                        this.watchLocation();
                    });
                },
                (error) => {
                    console.log(error.code, error.message);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        }
    }

    onPressPauseRide = () => {
        const { ride } = this.props;
        this.watchID != null && clearInterval(this.watchID);
        const { gpsPointCollection } = this.state;
        if (this.gpsPointTimestamps.length > 1) {
            this.getCoordsOnRoad(gpsPointCollection.features[0].geometry.coordinates.slice(-this.gpsPointTimestamps.length),
                this.gpsPointTimestamps, (responseBody, trackpoints, distance) => {
                    this.props.pauseRecordRide(new Date().toISOString(), trackpoints, distance, ride, this.props.user.userId)
                });
            this.gpsPointTimestamps = [];
        } else {
            this.props.pauseRecordRide(new Date().toISOString(), [], 0, ride, this.props.user.userId);
        }
    }

    onPressContinueRide = () => {
        console.log("ContinueRide called");
        const { ride } = this.props;
        this.props.continueRecordRide(new Date().toISOString(), ride, this.props.user.userId);
    }

    onPressStopRide = () => {
        const { ride } = this.props;
        this.watchID != null && clearInterval(this.watchID);
        const { gpsPointCollection } = this.state;
        if (this.gpsPointTimestamps.length > 1) {
            this.getCoordsOnRoad(gpsPointCollection.features[0].geometry.coordinates.slice(-this.gpsPointTimestamps.length),
                this.gpsPointTimestamps, (responseBody, trackpoints, distance) => {
                    this.props.completeRecordRide(new Date().toISOString(), trackpoints, distance, ride, this.props.user.userId)
                });
        } else {
            this.props.completeRecordRide(new Date().toISOString(), [], 0, ride, this.props.user.userId);
        }
    }

    onChangeRecordRideStatus(newStatus) {
        switch (newStatus) {
            case RECORD_RIDE_STATUS.RUNNING:
                this.watchLocation();
                break;
            case RECORD_RIDE_STATUS.PAUSED:
                break;
            case RECORD_RIDE_STATUS.COMPLETED:
                console.log("RECORD_RIDE_STATUS: ", this.props.ride);
                this.gpsPointTimestamps = [];
                // TODO: Call our API and show the result on map
                this.props.getRideByRideId(this.props.ride.rideId);
                break;
        }
    }

    onPressCloseRide = () => {
        if (this.state.rideUpdateCount > 0) {
            const { ride } = this.props;
            replaceRide(ride.rideId, { source: ride.source, destination: ride.destination, waypoints: ride.waypoints });
        }
        if (this.state.activeMarkerIndex !== -1) this.onCloseOptionsBar(true);
        this.props.clearRideFromMap();
    }

    componentWillUnmount() {
        console.log("Map unmounted");
        this.stopTrackingLocation();
        BackgroundGeolocation.removeAllListeners();
        // DeviceEventEmitter.removeListener(RNSettings.GPS_PROVIDER_EVENT, this.handleGPSProviderEvent);
        // this.watchID != null && Geolocation.clearWatch(this.watchID);
        this.watchID != null && clearInterval(this.watchID);
        this.notificationInterval != null && clearInterval(this.notificationInterval);
        BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPress);
        this.props.resetStoreToDefault();
    }

    renderMapControlsForRide() {
        const { ride } = this.props;
        if (ride.rideId && (ride.status === null || ride.status === RECORD_RIDE_STATUS.COMPLETED)) {
            return (
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <LinkButton style={{ paddingVertical: 20 }} title='CLOSE RIDE' titleStyle={{ color: '#fff', fontSize: 16 }} onPress={this.onPressCloseRide} />
                </View>
            )
        } else if (ride.status === RECORD_RIDE_STATUS.PAUSED) {
            return (
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <LinkButton style={{ paddingVertical: 20 }} title='CONTINUE' titleStyle={{ color: '#fff', fontSize: 16 }} onPress={this.onPressContinueRide} />
                    <LinkButton style={{ paddingVertical: 20 }} title='STOP' titleStyle={{ color: '#fff', fontSize: 16 }} onPress={this.onPressStopRide} />
                    <LinkButton style={{ paddingVertical: 20 }} title='CLOSE RIDE' titleStyle={{ color: '#fff', fontSize: 16 }} onPress={this.onPressCloseRide} />
                </View>
            )
        } else {
            return (
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <LinkButton style={{ paddingVertical: 20 }} title='PAUSE' titleStyle={{ color: '#fff', fontSize: 16 }} onPress={this.onPressPauseRide} />
                    <LinkButton style={{ paddingVertical: 20 }} title='STOP' titleStyle={{ color: '#fff', fontSize: 16 }} onPress={this.onPressStopRide} />
                </View>
            )
        }
    }

    onPressMap = async (event) => {
        const { geometry, properties } = event;
        let viewCoordinate = await this._mapView.getPointInView(geometry.coordinates);
    }

    getTimeAsFormattedString(estimatedTime) {
        if (!estimatedTime) {
            return '0 h 0 m';
        }
        let h = Math.floor(estimatedTime / 3600);
        let m = Math.floor(estimatedTime % 3600 / 60);
        let timeText = '';
        if (h > 0) {
            timeText += `${h} h`;
        }
        if (m > 0) {
            timeText += ` ${m} m`;
        }
        return timeText;
    }

    getDistanceAsFormattedString(distance, distanceUnit) {
        if (!distance) {
            return '0 ' + distanceUnit;
        }
        if (distanceUnit === 'km') {
            return (distance / 1000).toFixed(2) + ' km';
        } else {
            return (distance * 0.000621371192).toFixed(2) + ' mi';
        }
    }

    changeDataAtIndex(arr, index, data) {
        return [...arr.slice(0, index), data, ...arr.slice(index + 1)]
    }

    onCloseOptionsBar = (cancelMarkerUpdate) => {
        const { markerCollection, activeMarkerIndex } = this.state;
        if (activeMarkerIndex === -1 || cancelMarkerUpdate) {
            Animated.timing(
                this.state.optionsBarRightAnim,
                {
                    toValue: 100,
                    duration: 500,
                    useNativeDriver: true
                }
            ).start()
            return;
        }
        const prevMarker = markerCollection.features[activeMarkerIndex];
        let defaultIcon = 'waypointDefault';
        if (activeMarkerIndex === 0 && this.props.ride.source) {
            defaultIcon = ICON_NAMES.SOURCE_DEFAULT;
        } else if (this.isDestination(prevMarker)) {
            defaultIcon = ICON_NAMES.DESTINATION_DEFAULT;
        }
        Animated.timing(
            this.state.optionsBarRightAnim,
            {
                toValue: 100,
                duration: 500,
                useNativeDriver: true
            }
        ).start(() => {
            setTimeout(() => {
                this.setState({
                    markerCollection: {
                        ...markerCollection,
                        features: this.changeDataAtIndex(markerCollection.features, activeMarkerIndex,
                            { ...prevMarker, properties: { ...prevMarker.properties, icon: defaultIcon } })
                    },
                    activeMarkerIndex: -1
                });
            }, 100)
        })
    }

    isDestination(markerFeature) {
        const { ride } = this.props;
        return ride.destination && (ride.destination.lng + '' + ride.destination.lat === markerFeature.id);
    }

    isSource(markerFeature) {
        const { ride } = this.props;
        return ride.source && (ride.source.lng + '' + ride.source.lat === markerFeature.id);
    }

    showMapControls = () => {
        Animated.timing(
            this.state.controlsBarLeftAnim,
            {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }
        ).start();
    }

    hideMapControls = () => {
        Animated.timing(
            this.state.controlsBarLeftAnim,
            {
                toValue: -100,
                duration: 300,
                useNativeDriver: true
            }
        ).start();
    }

    showWaypointList = () => {
        Animated.timing(
            this.state.waypointListLeftAnim,
            {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }
        ).start();
    }

    hideWaypointList = () => {
        Animated.timing(
            this.state.waypointListLeftAnim,
            {
                toValue: -widthPercentageToDP(100),
                duration: 300,
                useNativeDriver: true
            }
        ).start();
    }

    onPressMarker = (e) => {
        const { ride, user } = this.props;
        if (ride.isRecorded === true || ride.userId !== user.userId) return;

        const selectedFeature = e.nativeEvent.payload;
        const selectedMarkerIndex = this.state.markerCollection.features.findIndex(marker => marker.geometry.coordinates.join('') === selectedFeature.id);
        const { activeMarkerIndex, markerCollection, optionsBarRightAnim } = this.state;
        const isDestinationSelected = this.isDestination(selectedFeature);
        let updatedState = {};
        if (activeMarkerIndex > -1) {
            let selectedIcon = ICON_NAMES.WAYPOINT_DEFAULT;
            const prevMarker = markerCollection.features[activeMarkerIndex];
            if (activeMarkerIndex === 0 && ride.source) {
                selectedIcon = ICON_NAMES.SOURCE_DEFAULT;
            } else if (this.isDestination(prevMarker)) {
                selectedIcon = ICON_NAMES.DESTINATION_DEFAULT;
            }
            updatedState.markerCollection = {
                ...markerCollection,
                features: this.changeDataAtIndex(markerCollection.features, activeMarkerIndex,
                    { ...prevMarker, properties: { ...prevMarker.properties, icon: selectedIcon } })
            };
            updatedState.activeMarkerIndex = -1;
        }
        if (activeMarkerIndex != selectedMarkerIndex) {
            let activeIcon = ICON_NAMES.WAYPOINT_SELECTED;
            if (selectedMarkerIndex === 0 && ride.source) {
                activeIcon = ICON_NAMES.SOURCE_SELECTED;
            } else if (isDestinationSelected) {
                activeIcon = ICON_NAMES.DESTINATION_SELECTED;
            }
            const selMarker = markerCollection.features[selectedMarkerIndex];
            updatedState.markerCollection
                ? updatedState.markerCollection = {
                    ...updatedState.markerCollection,
                    features: this.changeDataAtIndex(updatedState.markerCollection.features, selectedMarkerIndex,
                        { ...selMarker, properties: { ...selMarker.properties, icon: activeIcon } })
                }
                : updatedState.markerCollection = {
                    ...markerCollection,
                    features: this.changeDataAtIndex(markerCollection.features, selectedMarkerIndex,
                        { ...selMarker, properties: { ...selMarker.properties, icon: activeIcon } })
                }
            updatedState.activeMarkerIndex = selectedMarkerIndex;
        }
        this.setState(updatedState, () => {
            Animated.timing(
                optionsBarRightAnim,
                {
                    toValue: optionsBarRightAnim._value == 100 ? 0 : 100,
                    duration: 500,
                    useNativeDriver: true
                }
            ).start()
        });
    }

    onPressLogout = async () => {
        const accessToken = await AsyncStorage.getItem(USER_AUTH_TOKEN);
        this.props.logoutUser(this.props.user.userId, accessToken);
    }

    createFriendsLocationMarker = (locInfo) => {
        return {
            type: 'Feature',
            id: locInfo.userId,
            geometry: {
                type: 'Point',
                coordinates: [locInfo.lng, locInfo.lat],
            },
            properties: {
                // icon: locInfo.userId + ''
                name: locInfo.name
            },
        };
    }

    render() {
        const { mapViewHeight, directions, markerCollection, activeMarkerIndex, gpsPointCollection, controlsBarLeftAnim, waypointListLeftAnim, showCreateRide, currentLocation,
            searchResults, searchQuery, isEditable, snapshot, hideRoute, optionsBarRightAnim, isUpdatingWaypoint, mapRadiusCircle } = this.state;
        const { notificationList, ride, showMenu, showLoader, user, canUndo, canRedo } = this.props;
        const MAP_VIEW_TOP_OFFSET = showCreateRide ? (CREATE_RIDE_CONTAINER_HEIGHT - WINDOW_HALF_HEIGHT) + (mapViewHeight / 2) - (BULLSEYE_SIZE / 2) : (isEditable ? 130 : 60) + (mapViewHeight / 2) - (BULLSEYE_SIZE / 2);
        return (
            <View style={{ flex: 1 }}>
                <MenuModal notificationCount={notificationList.length} isVisible={showMenu} onClose={this.onCloseAppNavMenu} onPressNavMenu={this.onPressAppNavMenu} alignCloseIconLeft={user.handDominance === 'left'} />
                <Spinner
                    visible={showLoader}
                    textContent={'Loading...'}
                    textStyle={{ color: '#fff' }}
                />
                <View style={[styles.fillParent, { flexShrink: 1 }]}>
                    {
                        !showCreateRide
                            ? <View style={styles.mapHeader}>
                                {
                                    searchResults.length === 0
                                        ? ride.rideId === null
                                            ? <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <LinkButton style={{ paddingVertical: 20 }} title='+ RIDE' titleStyle={{ color: '#fff', fontSize: 16 }} onPress={this.createRide} />
                                                    <LinkButton style={{ paddingVertical: 20 }} title='RECORD RIDE' titleStyle={{ color: '#fff', fontSize: 16 }} onPress={this.onPressRecordRide} />
                                                    {
                                                        this.props.friendsLocationList
                                                            ? <LinkButton style={{ paddingVertical: 20 }} title='HIDE FRIENDS' titleStyle={{ color: '#fff', fontSize: 16 }} onPress={this.props.hideFriendsLocation} />
                                                            : null
                                                    }
                                                </View>
                                                <IconButton iconProps={{ name: 'md-exit', type: 'Ionicons', style: { fontSize: widthPercentageToDP(8), color: '#fff' } }}
                                                    style={styles.logoutIcon} onPress={this.onPressLogout} />
                                            </View>
                                            : this.renderMapControlsForRide()
                                        : null
                                }
                            </View>
                            : null
                    }
                    {
                        !showCreateRide && ride.rideId
                            ? <View style={styles.mapSubHeader}>
                                <View style={{ width: '30%', backgroundColor: '#EB861E', borderWidth: 4, borderColor: '#fff', elevation: 10, shadowOffset: { width: 5, height: 5 }, shadowColor: "grey", shadowOpacity: 0.5, shadowRadius: 10 }}>
                                    <IconLabelPair iconProps={{ name: 'road-variant', type: 'MaterialCommunityIcons' }} text={this.getDistanceAsFormattedString(directions ? directions.distance : null, user.distanceUnit)}
                                        textStyle={{ color: '#fff' }} />
                                    <IconLabelPair iconProps={{ name: 'access-time', type: 'MaterialIcons' }} text={this.getTimeAsFormattedString(directions ? directions.duration : null)}
                                        textStyle={{ color: '#fff' }} />
                                </View>
                                {
                                    isEditable
                                        ? <SearchBox value={searchQuery} onPressClear={this.onPressClear}
                                            onTextChange={this.onSearchPlace} style={{ marginHorizontal: 5, justifyContent: 'center' }} />
                                        : null
                                }
                            </View>
                            : null
                    }
                    {
                        showCreateRide
                            ? <CreateRide containerHeight={CREATE_RIDE_CONTAINER_HEIGHT} onSubmitForm={this.props.submitNewRide}
                                user={this.props.user} ride={this.props.ride}
                                currentLocation={currentLocation} onChangeStartRideFrom={this.onPressRecenterMap}
                                cancelPopup={(centerLocation) => this.setState({ showCreateRide: false }, () => this.onPressRecenterMap(centerLocation))} />
                            : null
                    }
                    <MapboxGL.MapView
                        styleURL={MapboxGL.StyleURL.Street}
                        zoomLevel={15}
                        centerCoordinate={[
                            4.895168,
                            52.370216
                        ]}
                        style={[styles.fillParent, { marginTop: showCreateRide ? -WINDOW_HALF_HEIGHT : 0 }]}
                        showUserLocation={false /* onUserLocationUpdate={(e) => { console.log(e.coords) }} */}
                        ref={el => this._mapView = el}
                        onDidFinishLoadingMap={this.onFinishMapLoading}
                        onRegionDidChange={this.onRegionDidChange}
                        compassEnabled={true}
                        onLayout={({ nativeEvent }) => {
                            const { height } = nativeEvent.layout;
                            height != this.state.mapViewHeight && this.setState({ mapViewHeight: height })
                        }}
                        zoomEnabled={!showCreateRide}
                        scrollEnabled={!showCreateRide}
                        pitchEnabled={!showCreateRide}
                        rotateEnabled={!showCreateRide}
                    >
                        {
                            currentLocation ? this.renderCurrentLocation(currentLocation) : null
                        }
                        {
                            directions ?
                                <MapboxGL.ShapeSource id='ridePathLayer' shape={directions.geometry}>
                                    <MapboxGL.LineLayer id='ridePath' style={[{ lineColor: 'blue', lineWidth: 5, lineCap: MapboxGL.LineCap.Butt, visibility: 'visible' }, hideRoute ? MapboxStyles.hideRoute : null]} />
                                </MapboxGL.ShapeSource>
                                : null
                        }
                        {
                            this.state.friendsLocationCollection.features.length > 0
                                ? <MapboxGL.ShapeSource
                                    id='friends'
                                    shape={this.state.friendsLocationCollection}
                                    // images={this.state.friendsImage}
                                    onPress={({ nativeEvent }) => console.log("onPressFriendsLocationMarker: ", nativeEvent)}>
                                    <MapboxGL.SymbolLayer id="friendLocationIcon" style={[MapboxStyles.friendsName, MapboxStyles.friendsIcon]} />
                                </MapboxGL.ShapeSource>
                                : null
                        }
                        {
                            this.state.mapMatchinRoute ?
                                <MapboxGL.ShapeSource id='mapMatchingLayer' shape={this.state.mapMatchinRoute}>
                                    <MapboxGL.LineLayer id='mapMatchingPath' style={[{ lineColor: 'green', lineWidth: 3, lineCap: MapboxGL.LineCap.Butt, visibility: 'visible' }, hideRoute ? MapboxStyles.hideRoute : null]} />
                                </MapboxGL.ShapeSource>
                                : null
                        }
                        {
                            gpsPointCollection.features[0].geometry.coordinates.length >= 2 ?
                                <MapboxGL.ShapeSource id='recordRidePathLayer' shape={gpsPointCollection}>
                                    <MapboxGL.LineLayer id='recordRidePath' style={[{ lineColor: 'red', lineWidth: 3, lineCap: MapboxGL.LineCap.Butt, visibility: 'visible' }, hideRoute ? MapboxStyles.hideRoute : null]} />
                                </MapboxGL.ShapeSource>
                                : null
                        }
                        {
                            user.showCircle && mapRadiusCircle
                                ? <MapboxGL.ShapeSource id='routeSource' shape={mapRadiusCircle}>
                                    <MapboxGL.LineLayer id='routeFill' style={MapboxStyles.circleOutline} />
                                </MapboxGL.ShapeSource>
                                : null
                        }
                        {
                            markerCollection.features.length > 0
                                ? <MapboxGL.ShapeSource
                                    id='markers'
                                    shape={markerCollection}
                                    images={shapeSourceImages}
                                    onPress={this.onPressMarker}>
                                    <MapboxGL.SymbolLayer id="exampleIconName" style={[MapboxStyles.icon, MapboxStyles.markerTitle]} />
                                </MapboxGL.ShapeSource>
                                : null
                        }

                    </MapboxGL.MapView>
                    {
                        showCreateRide || (isEditable && searchResults.length === 0) ?
                            <TouchableOpacity style={[styles.bullseye, { marginTop: MAP_VIEW_TOP_OFFSET }]} onPress={this.onBullseyePress}>
                                <NBIcon name='target' type='MaterialCommunityIcons' style={{ fontSize: BULLSEYE_SIZE, color: '#2890FB' }} />
                            </TouchableOpacity>
                            : null
                    }
                    {
                        this.state.calloutOffsets.length > 0
                            ? <View style={{ position: 'absolute', zIndex: 100, borderWidth: 2, borderColor: 'red', top: this.state.calloutOffsets[0], left: this.state.calloutOffsets[1] }}>
                                <Text>CALL_OUT</Text>
                            </View>
                            : null
                    }
                    <View style={{ position: 'absolute', zIndex: 100, left: 5, top: 140, width: 55 }}>
                        {/* <IconButton style={[styles.mapControlButton, { backgroundColor: 'transparent' }]} iconProps={{ name: 'controller-play', type: 'Entypo', style: { fontSize: 40, elevation: 10 } }} onPress={this.showMapControls} /> */}
                        <TouchableOpacity style={{ width: widthPercentageToDP(10), height: widthPercentageToDP(15) }} onPress={this.showMapControls}>
                            <Image source={require('../../assets/img/arrow-right.png')} style={{ flex: 1, width: null, height: null }} />
                        </TouchableOpacity>
                    </View>
                    <Animated.View style={[{ left: 5, elevation: 10, position: 'absolute', zIndex: 100, top: 140, width: 55 }, { transform: [{ translateX: controlsBarLeftAnim }] }]}>
                        {/* <IconButton style={styles.mapControlButton} iconProps={{ name: 'controller-play', type: 'Entypo', style: { fontSize: 40, elevation: 10, transform: [{ rotate: '180deg' }] } }} onPress={this.hideMapControls} /> */}
                        <TouchableOpacity style={{ backgroundColor: '#fff', flex: 1, height: widthPercentageToDP(15) }} onPress={this.hideMapControls}>
                            <Image source={require('../../assets/img/arrow-left.png')} style={{ flex: 1, width: null, height: null }} />
                        </TouchableOpacity>
                        {
                            // this.state.undoActions.length > 0 || this.state.redoActions.length > 0
                            //     ? <View>
                            //         <IconButton style={[styles.mapControlButton, styles.topBorder]} iconProps={{ name: 'md-undo', type: 'Ionicons' }} onPress={this.onPressUndo} />
                            //         <IconButton style={[styles.mapControlButton, styles.topBorder]} iconProps={{ name: 'md-redo', type: 'Ionicons' }} onPress={this.onPressRedo} />
                            //     </View>
                            //     : null
                            canUndo || canRedo
                                ? <View>
                                    <IconButton style={[styles.mapControlButton, styles.topBorder]} iconProps={{ name: 'md-undo', type: 'Ionicons' }} onPress={this.onPressUndo} />
                                    <IconButton style={[styles.mapControlButton, styles.topBorder]} iconProps={{ name: 'md-redo', type: 'Ionicons' }} onPress={this.onPressRedo} />
                                </View>
                                : null
                        }
                        <IconButton style={[styles.mapControlButton, styles.topBorder]} iconProps={{ name: 'zoom-in', type: 'Foundation' }} onPress={this.onPressZoomIn} />
                        <IconButton style={[styles.mapControlButton, styles.topBorder]} iconProps={{ name: 'zoom-out', type: 'Foundation' }} onPress={this.onPressZoomOut} />
                        {
                            ride.rideId !== null && ride.isRecorded === false
                                ? <IconButton style={[styles.mapControlButton, styles.topBorder]} iconProps={{ name: 'map-marker-multiple', type: 'MaterialCommunityIcons' }} onPress={this.showWaypointList} />
                                : null
                        }
                        <IconButton style={[styles.mapControlButton, styles.topBorder]} iconProps={{ name: 'target', type: 'MaterialCommunityIcons' }} onPress={this.onPressRecenterMap} />
                        {/* <IconButton style={styles.mapControlButton} iconProps={{ name: 'arrow-left-bold-circle', type: 'MaterialCommunityIcons', style: styles.whiteColor }} onPress={this.hideMapControls} />
                        <IconButton style={[styles.mapControlButton, styles.buttonGap]} iconProps={{ name: 'md-undo', type: 'Ionicons', style: styles.whiteColor }} onPress={this.onPressUndo} />
                        <IconButton style={[styles.mapControlButton, styles.buttonGap]} iconProps={{ name: 'md-redo', type: 'Ionicons', style: styles.whiteColor }} onPress={this.onPressRedo} />
                        <IconButton style={[styles.mapControlButton, styles.buttonGap]} iconProps={{ name: 'zoom-in', type: 'Foundation', style: styles.whiteColor }} onPress={this.onPressZoomIn} />
                        <IconButton style={[styles.mapControlButton, styles.buttonGap]} iconProps={{ name: 'zoom-out', type: 'Foundation', style: styles.whiteColor }} onPress={this.onPressZoomOut} />
                        <IconButton style={[styles.mapControlButton, styles.buttonGap]} iconProps={{ name: 'target', type: 'MaterialCommunityIcons', style: styles.whiteColor }} onPress={this.onPressRecenterMap} /> */}
                    </Animated.View>
                    {
                        ride.rideId !== null && ride.isRecorded === false
                            ? <Animated.View style={[{ height: '100%', width: '100%', elevation: 11, position: 'absolute', zIndex: 110 }, { transform: [{ translateX: waypointListLeftAnim }] }]}>
                                <WaypointList onPressOutside={this.hideWaypointList} onCancel={this.hideWaypointList} />
                            </Animated.View>
                            : null
                    }
                    {
                        snapshot ? <Bubble onPress={() => this.setState({ snapshot: null })}>
                            <View style={{ height: 250, width: 280 }}>
                                <Image source={{ uri: snapshot }} style={{ flex: 1, height: null, width: null }} />
                            </View>
                        </Bubble> : null
                    }
                    {/* <View style={{
                        position: 'absolute',
                        width: WindowDimensions.width, flexDirection: 'row', height: 70,
                        elevation: 8, marginTop: 5, justifyContent: 'flex-end'
                    }}>
                        {
                            isEditable ? <SearchBox value={searchQuery} onPressClear={this.onPressClear}
                                onTextChange={this.onSearchPlace} style={{ marginLeft: 5 }} /> : null
                        }
                        {
                            searchResults.length === 0
                                ? ride.rideId === null
                                    ? <View style={{ flexDirection: 'row' }}>
                                        <BasicButton title='Ride' iconProps={{ name: 'add', type: 'MaterialIcons' }}
                                            style={{ height: 40, marginLeft: 5 }} onPress={this.createRide} />
                                        <BasicButton title='Record Ride' style={{ height: 40, marginLeft: 5 }} onPress={this.onPressRecordRide} />
                                    </View>
                                    : this.renderMapControlsForRide()
                                : null
                        }
                    </View> */}
                    {
                        searchResults.length > 0 ?
                            <SearchResults style={{ marginTop: 132 }} data={searchResults} onPressClose={this.onPressSearchResultsClose} onSelectItem={this.onSelectPlace} />
                            : null
                    }
                    {/* {
                        ride.rideId ?
                            <View style={styles.controlsContainerTopLeft}>
                                <View style={styles.controlsWrapperTopLeft}>
                                    <IconLabelPair iconProps={{ name: 'road-variant', type: 'MaterialCommunityIcons' }} text={this.getDistanceAsFormattedString(directions ? directions.distance : null, user.distanceUnit)} />
                                    <IconLabelPair iconProps={{ name: 'access-time', type: 'MaterialIcons' }} text={this.getTimeAsFormattedString(directions ? directions.duration : null)} />
                                </View>
                            </View> : null
                    } */}

                    {/* <View style={styles.controlsContainerLeft}>
                        {
                            isEditable ?
                                <MapControlPair firstIcon={{ name: 'undo', type: 'MaterialIcons', onPress: this.onPressUndo }}
                                    secondIcon={{ name: 'redo', type: 'MaterialIcons', onPress: this.onPressRedo }} containerStyle={{ marginBottom: 5 }} />
                                : null
                        }
                        <MapControlPair firstIcon={{ name: 'zoom-in', type: 'Foundation', onPress: this.onPressZoomIn }}
                            secondIcon={{ name: 'zoom-out', type: 'Foundation', onPress: this.onPressZoomOut }} containerStyle={{ marginTop: 5 }} />
                    </View> */}
                    {
                        activeMarkerIndex > -1
                            ? <Animated.View style={[styles.controlsContainerRight, { transform: [{ translateX: optionsBarRightAnim }] }]}>
                                <View style={{ alignItems: 'center', backgroundColor: '#fff' }}>
                                    <IconButton onPress={this.onCloseOptionsBar} style={{ paddingVertical: 5, width: '100%', backgroundColor: '#fff' }}
                                        iconProps={{ name: 'window-close', type: 'MaterialCommunityIcons' }} />
                                    <IconButton onPress={this.toggleReplaceOption} style={{ paddingVertical: 5, width: '100%', borderColor: '#acacac', borderTopWidth: 1, borderBottomWidth: 1 }}
                                        iconProps={{ name: isUpdatingWaypoint ? 'cancel' : 'edit-location', type: 'MaterialIcons' }} />
                                    {
                                        markerCollection.features.length > 1
                                            ? this.isSource(markerCollection.features[activeMarkerIndex])
                                                ? <IconButton onPress={this.makeSourceAsWaypoint}
                                                    style={{ paddingVertical: 5, width: '100%', backgroundColor: '#0083CA', borderColor: '#acacac', borderTopWidth: 1, borderBottomWidth: 1 }}
                                                    iconProps={{ name: 'map-pin', type: 'FontAwesome', style: { color: '#fff' } }} />

                                                : <IconButton onPress={this.makeWaypointAsSource}
                                                    style={{ paddingVertical: 5, width: '100%', borderColor: '#acacac', borderTopWidth: 1, borderBottomWidth: 1 }}
                                                    iconProps={{ name: 'map-pin', type: 'FontAwesome' }} />
                                            : null
                                    }
                                    {
                                        markerCollection.features.length > 1
                                            ? this.isDestination(markerCollection.features[activeMarkerIndex])
                                                ? <IconButton onPress={this.makeDestinationAsWaypoint}
                                                    style={{ paddingVertical: 5, width: '100%', backgroundColor: '#0083CA', borderBottomColor: '#acacac', borderBottomWidth: 1 }}
                                                    iconProps={{ name: 'flag-variant', type: 'MaterialCommunityIcons', style: { color: '#fff' } }} />
                                                : <IconButton onPress={this.makeWaypointAsDestination}
                                                    style={{ paddingVertical: 5, width: '100%', backgroundColor: 'rgba(0,0,0,0.4)', borderBottomColor: '#acacac', borderBottomWidth: 1 }}
                                                    iconProps={{ name: 'flag-variant', type: 'MaterialCommunityIcons' }} />
                                            : null
                                    }
                                    <IconButton onPress={this.onPressDeleteOption} style={{ paddingVertical: 5 }} iconProps={{ name: 'delete', type: 'MaterialCommunityIcons' }} />
                                </View>
                            </Animated.View>
                            : null
                    }
                </View>

                {
                    user.showCircle && mapRadiusCircle
                        ? <TouchableOpacity style={{ position: 'absolute', zIndex: 100, elevation: 10, bottom: 20, left: 20 }}>
                            <Text style={{ fontSize: 50, fontWeight: 'bold' }}>{`${this.state.diameter}`}<Text style={{ fontSize: 30 }}> {user.distanceUnit.toUpperCase()}</Text></Text>
                        </TouchableOpacity>
                        : null
                }
                {/* Shifter: - Brings the app navigation menu */}
                {
                    !showCreateRide
                        ? <ShifterButton onPress={this.toggleAppNavigation} alignLeft={user.handDominance === 'left'} />
                        : null
                }
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { showMenu, currentScreen } = state.TabVisibility;
    const { ride } = state.RideInfo.present;
    const canUndo = state.RideInfo.past.length > 0;
    const canRedo = state.RideInfo.future.length > 0;
    const { user } = state.UserAuth;
    const { isLocationOn } = state.GPSState;
    const { showLoader } = state.PageState;
    const { notificationList } = state.NotificationList;
    const { friendsLocationList } = state.FriendList;
    return { ride, isLocationOn, user, showMenu, friendsLocationList, currentScreen, showLoader, canUndo, canRedo, notificationList };
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateDeviceLocationState: (locationState) => dispatch(deviceLocationStateAction(locationState)),
        hideAppNavMenu: () => dispatch(appNavMenuVisibilityAction(false)),
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        changeScreen: (screenKey) => dispatch(screenChangeAction(screenKey)),
        clearRideFromMap: () => dispatch(initUndoRedoRideAction()),
        submitNewRide: (rideInfo) => dispatch(createNewRide(rideInfo)),
        updateRide: (data) => dispatch(updateRide(data)),
        publishEvent: (eventBody) => publishEvent(eventBody),
        pushNotification: (userId) => pushNotification(userId),
        updateLocation: (userId, locationInfo) => updateLocation(userId, locationInfo),
        getAllNotifications: (userId) => dispatch(getAllNotifications(userId)),
        readNotification: (userId, notificationId) => dispatch(readNotification(userId, notificationId)),
        deleteNotifications: (notificationIds) => dispatch(deleteNotifications(notificationIds)),
        deleteAllNotifications: (userId) => dispatch(deleteAllNotifications(userId)),


        // addSource: (waypoint, ride) => dispatch(addSource(waypoint, ride)),
        addSource: (waypoint) => dispatch(updateRideAction({ source: waypoint })),
        // updateSource: (waypoint, ride) => dispatch(updateSource(waypoint, ride)),
        updateSource: (waypoint) => dispatch(updateRideAction({ source: waypoint })),
        // deleteSource: (ride) => dispatch(deleteSource(ride)),
        deleteSource: (ride) => dispatch(updateRideAction({ source: null })),
        // addWaypoint: (waypoint, ride, index) => dispatch(addWaypoint(waypoint, ride, index)),
        addWaypoint: (waypoint, index) => dispatch(addWaypointAction({ index, waypoint })),
        // updateWaypoint: (waypoint, ride, index) => dispatch(updateWaypoint(waypoint, ride, index)),
        updateWaypoint: (waypoint, index) => dispatch(updateWaypointAction({ index, waypoint })),
        // deleteWaypoint: (ride, index) => dispatch(deleteWaypoint(ride, index)),
        deleteWaypoint: (ride, index) => dispatch(deleteWaypointAction({ index })),
        // updateDestination: (waypoint, ride) => dispatch(updateDestination(waypoint, ride)),
        updateDestination: (waypoint, ride) => dispatch(updateDestination(waypoint, ride)),
        // deleteDestination: (ride) => dispatch(deleteDestination(ride)),
        deleteDestination: (ride) => dispatch(updateRideAction({ destination: null })),
        // makeWaypointAsSource: (ride, index) => dispatch(makeWaypointAsSource(ride, index)),
        makeWaypointAsSource: (ride, index) => dispatch(updateRideAction({
            waypoints: [...ride.waypoints.slice(index + 1)],
            source: ride.waypoints[index]
        })),
        // makeSourceAsWaypoint: (ride) => dispatch(makeSourceAsWaypoint(ride)),
        makeSourceAsWaypoint: (ride) => dispatch(updateRideAction({
            waypoints: [ride.source, ...ride.waypoints],
            source: null
        })),
        // makeWaypointAsDestination: (ride, index) => dispatch(makeWaypointAsDestination(ride, index)),
        makeWaypointAsDestination: (ride, index) => dispatch(updateRideAction({
            waypoints: [...ride.waypoints.slice(0, index)],
            destination: ride.waypoints[index]
        })),
        // makeDestinationAsWaypoint: (ride) => dispatch(makeDestinationAsWaypoint(ride)),
        makeDestinationAsWaypoint: (ride) => dispatch(updateRideAction({
            waypoints: [...ride.waypoints, ride.destination],
            destination: null
        })),
        createRecordRide: (rideInfo) => dispatch(createRecordRide(rideInfo)),
        addTrackpoints: (trackpoints, distance, ride, userId) => dispatch(addTrackpoints(trackpoints, distance, ride, userId)),
        pauseRecordRide: (pauseTime, trackpoints, distance, ride, userId) => dispatch(pauseRecordRide(pauseTime, trackpoints, distance, ride, userId)),
        continueRecordRide: (resumeTime, ride, userId) => dispatch(continueRecordRide(resumeTime, ride, userId)),
        completeRecordRide: (endTime, trackpoints, distance, ride, userId) => dispatch(completeRecordRide(endTime, trackpoints, distance, ride, userId)),
        getRideByRideId: (rideId) => dispatch(getRideByRideId(rideId)),
        resetCurrentFriend: () => dispatch(resetCurrentFriendAction()),
        resetCurrentGroup: () => dispatch(resetCurrentGroupAction()),
        doUndo: () => dispatch(undoRideAction()),
        doRedo: () => dispatch(redoRideAction()),
        logoutUser: (userId, accessToken) => dispatch(logoutUser(userId, accessToken)),
        updateSourceOrDestinationName: (identifier, locationName) => dispatch(updateSourceOrDestinationNameAction({ identifier, locationName })),
        updateWaypointName: (waypointId, locationName) => dispatch(updateWaypointNameAction({ waypointId, locationName })),
        hideFriendsLocation: () => dispatch(hideFriendsLocationAction()),
        resetStoreToDefault: () => dispatch(resetStateOnLogout())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);

const MapboxStyles = MapboxGL.StyleSheet.create({
    symbol: {
        iconImage: DEFAULT_WAYPOINT_ICON,
        iconSize: 1,
        // iconOffset: [0, -32],
        iconAllowOverlap: true
    },
    showRoute: {
        visibility: 'visible'
    },
    hideRoute: {
        visibility: 'none'
    },
    icon: {
        iconImage: '{icon}',
        iconSize: 1,
        iconOffset: MapboxGL.StyleSheet.source(
            [
                [ICON_NAMES.SOURCE_DEFAULT, [1, -25]],
                [ICON_NAMES.SOURCE_SELECTED, [1, -25]],
                [ICON_NAMES.DESTINATION_DEFAULT, [10, -25]],
                [ICON_NAMES.DESTINATION_SELECTED, [10, -25]],
                ['waypointDefault', [0, -20]],
                ['waypointSelected', [0, -20]]
            ],
            'icon',
            MapboxGL.InterpolationMode.Categorical,
        ),
    },
    circleRoute: {
        circleStrokeColor: 'transparent',
        // circleColor: '#81BB41',
        // circleOpacity: 0.5
    },
    circleOutline: {
        lineColor: '#81BB41',
        lineWidth: 5,
        lineOpacity: 0.84,
        // lineDasharray: [2, 2],
    },
    friendsName: {
        textField: '{name}',
        textMaxWidth: 50,
        textColor: '#fff',
        textAnchor: 'center',
        textHaloColor: 'rgba(235, 134, 30, 0.9)',
        textHaloWidth: 2,
        textOffset: IS_ANDROID ? [0, -3.4] : [0, -3]
    },
    friendsIcon: {
        iconImage: FRIENDS_LOCATION_ICON,
        // iconSize: IS_ANDROID ? 1 : 0.25,
        iconAnchor: 'bottom',
    },
    markerTitle: {
        textField: '{title}',
        textMaxWidth: 10,
        textColor: '#fff',
        textAnchor: 'center',
        textHaloWidth: 2,
        // textSize: IS_ANDROID ? 16 : 10,
        textOffset: IS_ANDROID ? [0, -1.5] : [0, -2.3],
        textHaloColor: 'rgba(235, 134, 30, 0.9)',
    }
});