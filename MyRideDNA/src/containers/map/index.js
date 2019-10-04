import React, { Component } from 'react';
import {
    SafeAreaView, View, TouchableOpacity, Alert,
    Keyboard, Image, BackHandler, Animated,
    DeviceEventEmitter, Text, TextInput, StatusBar,
    AppState, ActivityIndicator, FlatList,
} from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-community/async-storage';
import { connect } from 'react-redux';
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
import { Icon as NBIcon, Toast, ListItem, Left, Body, Right, CheckBox } from 'native-base';
// import { BULLSEYE_SIZE, MAP_ACCESS_TOKEN, JS_SDK_ACCESS_TOKEN, PageKeys, WindowDimensions, RIDE_BASE_URL, IS_ANDROID, RECORD_RIDE_STATUS, ICON_NAMES, APP_COMMON_STYLES, widthPercentageToDP, APP_EVENT_NAME, APP_EVENT_TYPE, USER_AUTH_TOKEN, heightPercentageToDP, RIDE_POINT } from '../../constants';
// import { clearRideAction, deviceLocationStateAction, appNavMenuVisibilityAction, screenChangeAction, undoRideAction, redoRideAction, initUndoRedoRideAction, addWaypointAction, updateWaypointAction, deleteWaypointAction, updateRideAction, resetCurrentFriendAction, updateSourceOrDestinationAction, updateWaypointNameAction, resetCurrentGroupAction, hideFriendsLocationAction, resetStateOnLogout, toggleLoaderAction, updateAppStateAction, resetChatMessageAction } from '../../actions';
import { BULLSEYE_SIZE, MAP_ACCESS_TOKEN, JS_SDK_ACCESS_TOKEN, PageKeys, WindowDimensions, RIDE_BASE_URL, IS_ANDROID, RECORD_RIDE_STATUS, ICON_NAMES, APP_COMMON_STYLES, widthPercentageToDP, APP_EVENT_NAME, APP_EVENT_TYPE, USER_AUTH_TOKEN, heightPercentageToDP, RIDE_POINT, UNSYNCED_RIDE } from '../../constants';
import { clearRideAction, deviceLocationStateAction, appNavMenuVisibilityAction, screenChangeAction, undoRideAction, redoRideAction, initUndoRedoRideAction, addWaypointAction, updateWaypointAction, deleteWaypointAction, updateRideAction, resetCurrentFriendAction, updateSourceOrDestinationAction, updateWaypointNameAction, resetCurrentGroupAction, hideFriendsLocationAction, resetStateOnLogout, toggleLoaderAction, updateAppStateAction, addUnsyncedRideAction, deleteUnsyncedRideAction, resetChatMessageAction, resetErrorHandlingAction, toggleNetworkStatusAction, hideMembersLocationAction } from '../../actions';
import { SearchBox, IconicList } from '../../components/inputs';
import { SearchResults } from '../../components/pages';
import { Actions } from 'react-native-router-flux';
import { MapControlPair, BasicButton, IconButton, ShifterButton, LinkButton } from '../../components/buttons';
import { IconLabelPair } from '../../components/labels';
import WaypointList from './waypoint-list';
import CommentSection from './comment-scetion';
import ItinerarySection from './itinerary-section';

import Base64 from '../../util';

import styles from './styles';

import DEFAULT_WAYPOINT_ICON from '../../assets/img/location-pin-red-small.png';
import SELECTED_WAYPOINT_ICON from '../../assets/img/location-pin-green-small.png';
import DEFAULT_SOURCE_ICON from '../../assets/img/source-pin-red.png';
import SELECTED_SOURCE_ICON from '../../assets/img/source-pin-green.png';
import DEFAULT_DESTINATION_ICON from '../../assets/img/destination-pin-red.png';
import SELECTED_DESTINATION_ICON from '../../assets/img/destination-pin-green.png';
import FRIENDS_LOCATION_ICON from '../../assets/img/friends-location.png';

import { createRecordRide, pauseRecordRide, updateDestination, continueRecordRide, addTrackpoints, completeRecordRide, getRideByRideId, createNewRide, replaceRide, pushNotification, getAllNotifications, readNotification, publishEvent, deleteAllNotifications, deleteNotifications, logoutUser, updateLocation, getFriendsLocationList, getAllMembersLocation } from '../../api';

import Bubble from '../../components/bubble';
import MenuModal from '../../components/modal';
import { BasicHeader } from '../../components/headers';
import { CreateRide } from '../create-ride';

import BackgroundGeolocation from 'react-native-background-geolocation';

import axios from 'axios';
import { BaseModal } from '../../components/modal';
import { Loader } from '../../components/loader';

import DeviceInfo from 'react-native-device-info';

import { APP_CONFIGS } from '../../config';

import firebase from 'react-native-firebase';

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
    unregisterNetworkListener = null;
    prevUserTrackTime = 0;
    _mapView = null;
    _hiddenMapView = null;
    _searchRef = null;
    locationPermission = null;
    // watchID = null;
    isLocationOn = false;
    gpsPoints = [];
    rootScreen = PageKeys.MAP;
    mapCircleTimeout = null;
    bottomLeftDefaultPoint = null;
    fetchDirOnUndoRedo = true;
    // notificationInterval = null;
    trackpointTick = 0;
    hasModifiedRide = false;
    prevCoordsStr = '';
    locationProximity = null;
    closeRidePressed = false;
    updateStatusLocally = false;
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
            isEditableRide: false,
            undoActions: [],
            redoActions: [],
            snapshot: null,
            hideRoute: false,
            optionsBarRightAnim: new Animated.Value(100),
            controlsBarLeftAnim: new Animated.Value(-100),
            waypointListLeftAnim: new Animated.Value(-widthPercentageToDP(100)),
            commentSecAnim: new Animated.Value(-heightPercentageToDP(100)),
            itinerarySecAnim: new Animated.Value(heightPercentageToDP(100)),
            searchbarAnim: new Animated.Value(-widthPercentageToDP(100)),
            dropdownAnim: new Animated.Value(0),
            currentLocation: null,
            gpsPointCollection: {
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        geometry: {
                            type: "LineString",
                            coordinates: []
                        },
                        properties: {}
                    }
                ]
            },
            recordRideCollection: {
                type: 'FeatureCollection',
                features: []
            },
            mapMatchinRoute: null,
            mapRadiusCircle: null,
            diameter: 0,
            showCreateRide: false,
            rideUpdateCount: 0,
            friendsLocationCollection: {
                type: 'FeatureCollection',
                features: []
            },
            friendsImage: {},
            showLoader: false,
            refreshWaypointList: false,
            snapMode: false,
            commentMode: false,
            onWaypointList: false,
            onItinerary: false,
            isSearchHeader: false,
            // activeSearch: this.defaultSearch,
            searchTypes: [
                { label: 'Parking', value: 'parking', icon: { name: 'local-parking', type: 'MaterialIcons' } },
                { label: 'Gas Stations', value: 'fuel', icon: { name: 'local-gas-station', type: 'MaterialIcons' } },
                { label: 'Restaurants', value: 'restaurant', icon: { name: 'restaurant', type: 'MaterialIcons' } },
            ],
            watchId: null,
            isEditableMap: true,
            isVisibleList: false
        };
    }

    componentWillReceiveProps(nextProps) {
        // console.log(this.props.ride === nextProps.ride); // DOC: false when something changes in ride
        const { ride, isLocationOn, currentScreen } = nextProps;
        let updatedState = {};
        let currentCoordsStr = '';

        if (this.isLocationOn != isLocationOn) {
            this.isLocationOn = isLocationOn;
            if (isLocationOn === false) this.getCurrentLocation();
        }
        if (this.props.ride != ride) {            // DOC: Reset directions and markerCollection when redux clear the ride
            if (this.props.ride.rideId !== ride.rideId) {
                this.initializeEmptyRide(updatedState);
                updatedState.rideUpdateCount = 0;
                updatedState.activeMarkerIndex = -1;
                this.closeRidePressed = false;
                if (ride.isRecorded === false && ride.userId === this.props.user.userId) {
                    updatedState.isEditableRide = true;
                } else {
                    updatedState.isEditableRide = false;
                }
                this.hasModifiedRide = false;
                this.locationProximity = null;
                if (ride.rideId === null) this.prevCoordsStr = '';

                // TODO: Loading different ride
                if (ride.rideId) {
                    if (this.state.showCreateRide === true) {
                        updatedState.showCreateRide = false;
                    }

                    if (ride.isRecorded) {
                        let collection = [];//updatedState.gpsPointCollection.features[0].geometry.coordinates;
                        if (ride.source) {
                            collection.push([ride.source.lng, ride.source.lat]);
                        }
                        updatedState.gpsPointCollection.features[0].geometry.coordinates = ride.trackpoints.reduce((arr, trackpoint) => {
                            arr.push([trackpoint.lng, trackpoint.lat]);
                            return arr;
                        }, collection);
                        if (ride.destination) {
                            collection.push([ride.destination.lng, ride.destination.lat]);
                        }
                        updatedState.gpsPointCollection.features[0].geometry.coordinates = collection;
                        if (ride.status === RECORD_RIDE_STATUS.COMPLETED) {
                            collection = null;
                            const tempList = [];
                            let lastStatus = null;
                            if (ride.source) {
                                lastStatus = ride.source.status || RECORD_RIDE_STATUS.RUNNING;
                                tempList.push({
                                    type: "Feature",
                                    geometry: {
                                        type: "LineString",
                                        coordinates: [[ride.source.lng, ride.source.lat]]
                                    },
                                    properties: { pathType: lastStatus, hasDirection: lastStatus !== RECORD_RIDE_STATUS.PAUSED, index: 0, lineColor: lastStatus === RECORD_RIDE_STATUS.PAUSED ? '#6C6C6B' : 'red' }
                                });
                            }
                            ride.trackpoints.reduce((list, point, idx) => {
                                if (point.status === lastStatus || point.status === RECORD_RIDE_STATUS.COMPLETED) {
                                    list[list.length - 1].geometry.coordinates.push([point.lng, point.lat]);
                                } else {
                                    lastStatus = point.status === RECORD_RIDE_STATUS.PAUSED ? point.status : RECORD_RIDE_STATUS.RUNNING;
                                    list.length > 0 && list[list.length - 1].geometry.coordinates.push([point.lng, point.lat]);
                                    list[list.length] = {
                                        type: "Feature",
                                        geometry: {
                                            type: "LineString",
                                            coordinates: [[point.lng, point.lat]]
                                        },
                                        properties: { pathType: lastStatus, hasDirection: lastStatus !== RECORD_RIDE_STATUS.PAUSED, index: list.length, lineColor: lastStatus === RECORD_RIDE_STATUS.PAUSED ? '#6C6C6B' : 'red' }
                                    };
                                }
                                return list;
                            }, tempList);
                            if (ride.destination) {
                                lastStatus = ride.destination.status || RECORD_RIDE_STATUS.COMPLETED;
                                tempList.length > 0 && tempList[tempList.length - 1].geometry.coordinates.push([ride.destination.lng, ride.destination.lat]);
                            }
                            updatedState.recordRideCollection = {
                                type: 'FeatureCollection',
                                features: tempList
                            };
                        }
                    }

                    if (ride.source) {
                        const sourceMarker = this.createMarkerFeature([ride.source.lng, ride.source.lat], ICON_NAMES.SOURCE_DEFAULT);
                        updatedState.markerCollection.features = [sourceMarker];
                        currentCoordsStr += ride.source.lng + ride.source.lat;
                        if (ride.waypoints.length === 0 && !ride.destination) {
                            this.locationProximity = [ride.source.lng, ride.source.lat];
                        }
                    }

                    if (ride.waypoints.length > 0) {
                        let idx = 1;
                        updatedState.markerCollection.features = ride.waypoints.reduce((arr, loc) => {
                            arr.push(this.createMarkerFeature([loc.lng, loc.lat], ICON_NAMES.WAYPOINT_DEFAULT, idx));
                            currentCoordsStr += loc.lng + loc.lat;
                            idx++;
                            return arr;
                        }, [...updatedState.markerCollection.features]);
                    }

                    if (ride.destination) {
                        const destinationMarker = this.createMarkerFeature([ride.destination.lng, ride.destination.lat], ICON_NAMES.DESTINATION_DEFAULT);
                        updatedState.markerCollection.features = [...updatedState.markerCollection.features, destinationMarker];
                        currentCoordsStr += ride.destination.lng + ride.destination.lat;
                    }
                }
            } else {
                if (ride.isRecorded) {
                    if (this.props.ride.status != ride.status) {
                        if (ride.status != null && (ride.status != RECORD_RIDE_STATUS.RUNNING || this.props.ride.status != null)) {
                            this.onChangeRecordRideStatus(ride.status);
                        }
                    }
                    if (this.props.ride.destination !== ride.destination) {
                        const destinationMarker = this.createMarkerFeature([ride.destination.lng, ride.destination.lat], ICON_NAMES.DESTINATION_DEFAULT);
                        updatedState.markerCollection = { ...this.state.markerCollection };
                        updatedState.markerCollection.features = [...updatedState.markerCollection.features, destinationMarker];
                    }
                } else {
                    this.initializeEmptyRide(updatedState);
                    if (ride.source) {
                        const sourceMarker = this.createMarkerFeature([ride.source.lng, ride.source.lat], ICON_NAMES.SOURCE_DEFAULT);
                        updatedState.markerCollection.features = [sourceMarker];
                        currentCoordsStr += ride.source.lng + ride.source.lat;
                    }

                    if (ride.waypoints.length > 0) {
                        updatedState.markerCollection.features = ride.waypoints.reduce((arr, loc, idx) => {
                            idx++;
                            arr.push(this.createMarkerFeature([loc.lng, loc.lat], ICON_NAMES.WAYPOINT_DEFAULT, idx));
                            currentCoordsStr += loc.lng + loc.lat;
                            return arr;
                        }, updatedState.markerCollection.features);
                    }

                    if (ride.destination) {
                        const destinationMarker = this.createMarkerFeature([ride.destination.lng, ride.destination.lat], ICON_NAMES.DESTINATION_DEFAULT);
                        updatedState.markerCollection.features = [...updatedState.markerCollection.features, destinationMarker];
                        currentCoordsStr += ride.destination.lng + ride.destination.lat;
                    }

                    if (this.prevCoordsStr === currentCoordsStr && currentCoordsStr) {
                        updatedState.directions = this.state.directions;
                    }

                    // DOC: Calls replace ride API after each 5 updates on current ride to sync with server:
                    if (this.state.rideUpdateCount === RIDE_UPDATE_COUNT_TO_SYNC) {
                        updatedState.rideUpdateCount = 0;
                        const body = {};
                        if (ride.source) body.source = ride.source;
                        if (ride.destination) body.destination = ride.destination;
                        if (ride.waypoints) body.waypoints = ride.waypoints;
                        if (ride.totalDistance) body.totalDistance = ride.totalDistance;
                        if (ride.totalTime) body.totalTime = ride.totalTime;
                        replaceRide(ride.rideId, body);
                        this.hasModifiedRide = true;
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
            this.setState(prevState => updatedState, () => {
                if (ride.rideId === null) {
                    this.onPressRecenterMap();
                } else if (ride.isRecorded) {
                    this.state.recordRideCollection.features.length > 0 && this.getPausedDirection();
                    let coordinates = [];
                    if (ride.source) {
                        coordinates.push([ride.source.lng, ride.source.lat]);
                    }
                    coordinates.push(...this.state.gpsPointCollection.features[0].geometry.coordinates);
                    if (ride.destination) {
                        coordinates.push([ride.destination.lng, ride.destination.lat]);
                    }
                    if (coordinates.length > 1) {
                        // DOC: Update the mapbounds to include the recorded ride path
                        const newBounds = turfBBox({ coordinates, type: 'LineString' });
                        this._mapView.fitBounds(newBounds.slice(0, 2), newBounds.slice(2), 20, 1000);
                        setTimeout(() => this._hiddenMapView && this._hiddenMapView.fitBounds(newBounds.slice(0, 2), newBounds.slice(2), 35, 0), 1000);
                    }
                } else if (updatedState.markerCollection && updatedState.markerCollection.features.length > 1) {
                    // DOC: Fetch route for build ride if waypoints are more than one
                    if (this.prevCoordsStr !== currentCoordsStr && currentCoordsStr) {
                        this.prevCoordsStr = currentCoordsStr;
                        this.fetchDirections();
                    }
                }
                // DOC: Fly to the single point of the build/recorded ride
                if (updatedState.markerCollection && updatedState.markerCollection.features.length === 1) {
                    this._mapView.flyTo(updatedState.markerCollection.features[0].geometry.coordinates, 500);
                    setTimeout(() => this._hiddenMapView && this._hiddenMapView.flyTo(updatedState.markerCollection.features[0].geometry.coordinates, 0), 1000);
                }
            });
        }
    }

    initializeEmptyRide(updatedState) {
        updatedState.directions = null;
        updatedState.markerCollection = {
            ...this.state.markerCollection,
            features: []
        };

        // DOC: Resetting record ride features
        this.gpsPoints.length = 0;
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
        updatedState.recordRideCollection = {
            type: 'FeatureCollection',
            features: []
        };
    }

    getPausedDirection = () => {
        const { recordRideCollection } = this.state;
        pausedPathFeatures = recordRideCollection.features.filter(path => path.properties.pathType === RECORD_RIDE_STATUS.PAUSED && path.properties.hasDirection === false);
        const pathPromises = [];
        pausedPathFeatures.forEach(feature => {
            pathPromises.push(directionsClient.getDirections({
                waypoints: feature.geometry.coordinates.reduce((list, coords) => {
                    list.push({ coordinates: coords });
                    return list;
                }, []),
                overview: 'full',
                geometries: 'geojson'
            }).send());
        });
        Promise.all(pathPromises).then((result) => {
            const updatedFeatures = [...recordRideCollection.features];
            result.forEach(({ body }, idx) => {
                if (body.routes && body.routes[0]) {
                    let item = updatedFeatures[pausedPathFeatures[idx].properties.index];
                    item = { ...item, geometry: { ...body.routes[0].geometry } };
                    updatedFeatures[pausedPathFeatures[idx].properties.index] = item;
                }
            });
            this.setState(prevState => ({ recordRideCollection: { ...prevState.recordRideCollection, features: updatedFeatures } }));
        }).catch((err) => {
            console.log(err);
        });
    }



    componentDidUpdate(prevProps, prevState) {
        if (this.props.ride.rideId) {
            if (prevProps.ride.unsynced === true && this.props.ride.unsynced === false) {
                if (this.props.unsyncedRides.indexOf(`${UNSYNCED_RIDE}${this.props.ride.rideId}`) > -1) {
                    AsyncStorage.removeItem(`${UNSYNCED_RIDE}${this.props.ride.rideId}`).then(() => {
                        this.props.deleteUnsyncedRide(this.props.ride.rideId);
                        // this.hasModifiedRide = true;
                    }).catch(er => {
                        console.log(er);
                    });
                }
            } else if (this.closeRidePressed) {
                this.closeRidePressed = false;
                this.onPressCloseRide();
            }
        }
        if (prevProps.hasNetwork === true && this.props.hasNetwork === false) {
            console.log("Network connection lost");
            // Alert.alert('Network Error', 'Failed to connect to internet');
            Toast.show({ text: 'Network connection lost', position: 'bottom', duration: 0, style: { height: heightPercentageToDP(8.2) } });

            // DOC: Show specific alert, if user is planning ride
            this.setState({ isEditableMap: false }, () => {
                if (!this.props.ride.isRecorded && (this.props.ride.userId === this.props.user.userId)) {
                    Alert.alert('Network connection lost', 'Your changes will not save. Please try after connecting to internet')
                }
            });
        }
        if (prevProps.hasNetwork === false && this.props.hasNetwork === true) {
            console.log('internet connected ');
            this.setState({ isEditableMap: true });
            Toast.hide();
            this.retryApiFunc();
        }
        if (prevProps.user.locationEnable !== this.props.user.locationEnable) {
            this.props.user.locationEnable
                ? this.startTrackingLocation()
                : this.stopTrackingLocation();
        }
        if ((prevProps.friendsLocationList !== this.props.friendsLocationList) && Object.keys(this.props.friendsLocationList).length > 1) {
            const features = [...this.state.friendsLocationCollection.features];
            // let friendsImage = {};
            Object.keys(this.props.friendsLocationList).forEach(k => {
                if (k === 'activeLength') return;
                const locInfo = this.props.friendsLocationList[k];
                // locInfo.profilePicture
                //     ? friendsImage[locInfo.userId] = { uri: 'http://104.43.254.82:5051/getPictureById/5ca43ade33db83341960ee1b_thumb.jpeg' }
                //     // ? friendsImage[locInfo.userId] = { uri: locInfo.profilePicture }
                //     : friendsImage[locInfo.userId] = DEFAULT_WAYPOINT_ICON;
                // friendsImage[locInfo.userId + ''] = { uri:  };
                const idx = features.findIndex(oldF => oldF.id === locInfo.id);
                if (idx > -1) {
                    if (locInfo.isVisible === false) {
                        features.splice(idx, 1);
                    } else {
                        features[idx].properties.isVisible = true;
                        features[idx].geometry.coordinates = [locInfo.lng, locInfo.lat];
                    }
                } else {
                    features.push(this.createFriendsLocationMarker(locInfo, locInfo.id));
                }
            });
            this.setState({
                friendsLocationCollection: {
                    ...prevState.friendsLocationCollection,
                    features: features
                },
                // friendsImage: friendsImage
            }, () => {
                console.log(this.state.friendsLocationCollection.features);
                this.onPressRecenterMap();
            });
        }
        if ((prevProps.membersLocationList !== this.props.membersLocationList) && Object.keys(this.props.membersLocationList).length > 1) {
            const features = [...this.state.friendsLocationCollection.features];
            Object.keys(this.props.membersLocationList).forEach(k => {
                if (k === 'activeLength') return;
                this.props.membersLocationList[k].forEach(locInfo => {
                    const idx = features.findIndex(oldF => oldF.id === locInfo.id);
                    if (idx > -1) {
                        if (locInfo.isVisible === false) {
                            features.splice(idx, 1);
                        } else {
                            features[idx].properties.isVisible = true;
                            features[idx].geometry.coordinates = [locInfo.lng, locInfo.lat];
                        }
                    } else {
                        features.push(this.createFriendsLocationMarker(locInfo, locInfo.id));
                    }
                });
            });
            this.setState({
                friendsLocationCollection: {
                    ...prevState.friendsLocationCollection,
                    features: features
                },
            }, () => {
                this.onPressRecenterMap();
            });
        }
        if ((prevProps.friendsLocationList.activeLength > 0 || prevProps.membersLocationList.activeLength > 0) && (this.props.friendsLocationList.activeLength === 0 && this.props.membersLocationList.activeLength === 0)) {
            this.setState({
                friendsLocationCollection: {
                    type: 'FeatureCollection',
                    features: []
                }
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
                            (locationName) => locationName && this.props.updateSourceOrDestination(RIDE_POINT.SOURCE, locationName),
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
                        (locationName) => locationName && this.props.updateSourceOrDestination(RIDE_POINT.SOURCE, locationName),
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
                            (locationName) => locationName && this.props.updateSourceOrDestination(RIDE_POINT.DESTINATION, locationName),
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
                        (locationName) => locationName && this.props.updateSourceOrDestination(RIDE_POINT.DESTINATION, locationName),
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

        if (prevProps.isRetryApi === false && this.props.isRetryApi === true) {
            if (Actions.currentScene === this.props.lastApi.currentScene) {
                Alert.alert(
                    'Something went wrong ',
                    '',
                    [
                        {
                            text: 'Retry ', onPress: () => {
                                this.retryApiFunc();
                                this.props.resetErrorHandling(false)
                            }
                        },
                        { text: 'Cancel', onPress: () => { this.props.resetErrorHandling(false) }, style: 'cancel' },
                    ],
                    { cancelable: false }
                )
            }
        }
    }

    retryApiFunc = () => {
        if (this.props.lastApi && this.props.lastApi.currentScene === Actions.currentScene) {
            if (this.props.lastApi.api.name === 'getPictureList' || this.props.lastApi.api.name === 'getGarageInfo' || this.props.lastApi.api.name === 'getRidePictureList' || this.props.lastApi.api.name === 'getPicture') {
                this.props.retryLastApiWithoutDispatch(this.props.lastApi.api, this.props.lastApi.params)
            }
            else {
                this.props.retryLastApi(this.props.lastApi.api, this.props.lastApi.params);
            }
        }
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
                this.setState(prevState => ({ refreshWaypointList: true }), () => {
                    setTimeout(() => this.setState(prevState => ({ refreshWaypointList: false })), 50);
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
            if (this.state.rideUpdateCount > 0 || this.hasModifiedRide) {
                const { ride } = this.props;
                let hasSnapshotResponse = false;
                this.setState({ showLoader: true, snapMode: true }, () => {
                    this.getMapSnapshot((mapSnapshot) => {
                        if (hasSnapshotResponse === true) return;
                        hasSnapshotResponse = true;
                        const body = {};
                        if (ride.source) body.source = ride.source;
                        if (ride.destination) body.destination = ride.destination;
                        if (ride.waypoints) body.waypoints = ride.waypoints;
                        if (ride.totalDistance) body.totalDistance = ride.totalDistance;
                        if (ride.totalTime) body.totalTime = ride.totalTime;
                        if (mapSnapshot) body.snapshot = { mimeType: 'image/jpeg', picture: mapSnapshot };
                        replaceRide(ride.rideId, body,
                            () => this.setState({ showLoader: false, snapMode: false }),
                            () => this.setState({ showLoader: false, snapMode: false }));
                    }, (er) => {
                        console.log(er);
                        const body = {};
                        if (ride.source) body.source = ride.source;
                        if (ride.destination) body.destination = ride.destination;
                        if (ride.waypoints) body.waypoints = ride.waypoints;
                        if (ride.totalDistance) body.totalDistance = ride.totalDistance;
                        if (ride.totalTime) body.totalTime = ride.totalTime;
                        replaceRide(ride.rideId, body,
                            () => this.setState({ showLoader: false, snapMode: false }),
                            () => this.setState({ showLoader: false, snapMode: false }));
                    });
                });
            }
        }
        this.props.changeScreen({ name: screenKey });
    }

    async componentDidMount() {
        this.unregisterNetworkListener = NetInfo.addEventListener(this.handleNetworkConnectivityChange);
        if (this.props.user.isNewUser) {
            this.props.changeScreen({ name: PageKeys.PROFILE })
        }
        const notificationOpen = await firebase.notifications().getInitialNotification();
        if (notificationOpen) {
            console.log("InitialNotification received map: ", notificationOpen.notification);
            this.redirectToTargetScreen(JSON.parse(notificationOpen.notification._data.reference).targetScreen, notificationOpen.notification._data)
        }
        BackgroundGeolocation.onLocation(this.onLocation, this.onError);
        BackgroundGeolocation.onMotionChange(this.onMotionChange);
        BackgroundGeolocation.onActivityChange(this.onActivityChange);
        BackgroundGeolocation.onProviderChange(this.onProviderChange);
        BackgroundGeolocation.onHeartbeat(this.onHeartbeat);
        BackgroundGeolocation.ready({
            reset: false,
            foregroundService: true,
            desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
            distanceFilter: 10,
            notification: {
                channelName: "Default",
                color: "black",
                smallIcon: "@drawable/myridedna_notif_icon",
                text: "Location Service activated",
                title: "MyRideDNA"
            },
            heartbeatInterval: 60
        }, (state) => {
            console.log("- BackgroundGeolocation is configured and ready: ", state.enabled);

            // DOC: Start location tracking only if user has enabled location sharing
            if (!state.enabled && this.props.user.locationEnable) {
                this.startTrackingLocation();
            }
        });

        this.trackpointTick = 0;
        this.props.publishEvent({ eventName: APP_EVENT_NAME.USER_EVENT, eventType: APP_EVENT_TYPE.ACTIVE, eventParam: { isLoggedIn: true, userId: this.props.user.userId, deviceId: await DeviceInfo.getUniqueId() } });
        this.props.pushNotification(this.props.user.userId);
        this.props.getAllNotifications(this.props.user.userId, 0, new Date().toISOString(), 'map', (res) => {
        }, (err) => {
        });
        AppState.addEventListener('change', this.handleAppStateChange);
        BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPress);

    }

    onHeartbeat = (event) => {
        console.log(`[onHeartbeat - ${new Date()}] `, event);

        // DOC: Fetching new location
        BackgroundGeolocation.getCurrentPosition({
            samples: 1,
            persist: true
        }).then((location) => {
            if (this.props.ride.status === RECORD_RIDE_STATUS.RUNNING && this.props.ride.isRecorded) {
                if (this.state.currentLocation === null || this.state.currentLocation.location.join('') != (location.coords.longitude + '' + location.coords.latitude)) {
                    this.updateRecordRideCoordinate(location.coords, this.props.ride.status);
                }
            }
        });
    }

    onLocation = (location) => {
        // location.coords.heading
        // location.coords.accuracy
        // location.coords.speed
        // location.is_moving
        // location.battery: { is_charging, level }
        const lastFetchTime = new Date(location.timestamp).getTime();
        if (this.props.user.locationEnable && lastFetchTime - this.prevUserTrackTime > (this.props.user.timeIntervalInSeconds * 1000)) {
            this.prevUserTrackTime = lastFetchTime;
            this.props.updateLocation(this.props.user.userId, { lat: location.coords.latitude, lng: location.coords.longitude });
        }
        if (this.props.ride.status === RECORD_RIDE_STATUS.RUNNING && this.props.ride.isRecorded) {
            if (this.state.currentLocation === null || this.state.currentLocation.location.join('') != (location.coords.longitude + '' + location.coords.latitude)) {
                this.updateRecordRideCoordinate(location.coords, this.props.ride.status);
            }
        }
    }

    onError = (error) => {
        console.warn('[location] ERROR -', error);
    }

    onActivityChange = async (event) => {
        console.log('[activitychange] -', event);  // eg: 'on_foot', 'still', 'in_vehicle'
    }

    onProviderChange = (provider) => {
        console.log('[providerchange] -', provider.enabled, provider.status);
    }

    onMotionChange = (event) => {
        console.log('[motionchange] -', event.isMoving, event.location);
    }

    handleNetworkConnectivityChange = (connectionInfo) => {
        if (connectionInfo.type === 'wifi' || connectionInfo.type === 'cellular') {
            this.props.toggleNetworkStatus(true);
        } else if (connectionInfo.type === 'none') {
            this.props.toggleNetworkStatus(false);
        }
    }

    redirectToTargetScreen(targetScreen, notifData) {
        if (Object.keys(PageKeys).indexOf(targetScreen) === -1) {
            if (targetScreen === 'REQUESTS') {
                console.log('store.getState().TabVisibility.currentScreen.name : ', store.getState().TabVisibility.currentScreen.name)
                store.getState().TabVisibility.currentScreen.name !== PageKeys.FRIENDS
                    ? store.dispatch(screenChangeAction({ name: PageKeys.FRIENDS, params: { comingFrom: PageKeys.NOTIFICATIONS, goTo: targetScreen, notificationBody: notifData } }))
                    : Actions.refresh({ comingFrom: PageKeys.NOTIFICATIONS, goTo: targetScreen, notificationBody: notifData });
            }
            return;
        }
        if (targetScreen === "FRIENDS_PROFILE") {
            store.dispatch(resetCurrentFriendAction({ comingFrom: PageKeys.NOTIFICATIONS }))
            store.dispatch(screenChangeAction({ name: PageKeys[targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: notifData } }));
        }
        else if (targetScreen === "CHAT") {
            notifData['isGroup'] = JSON.parse(notifData.isGroup)
            store.dispatch(screenChangeAction({ name: PageKeys[targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, chatInfo: notifData } }));
        }
        else {
            store.dispatch(screenChangeAction({ name: PageKeys[targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: notifData } }));
        }

    }

    handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'active') {
            this.props.updateAppState('foreground');
        } else {
            this.props.updateAppState('background');
        }
    }

    startTrackingLocation = () => {
        BackgroundGeolocation.start();
    }

    stopTrackingLocation = () => {
        // clearInterval(this.trackLocationInterval);
        BackgroundGeolocation.stop();
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
        //     this.stopTrackingLocation();
        //     let watchId = setInterval(() => {
        //         Geolocation.getCurrentPosition(
        //             ({ coords }) => {
        //                 if (this.state.currentLocation === null || this.state.currentLocation.location.join('') != (coords.longitude + '' + coords.latitude)) {
        //                     this.updateRecordRideCoordinate([coords.longitude, coords.latitude], this.props.ride.status);
        //                 }
        //             },
        //             (error) => {
        //                 console.log(error.code, error.message);
        //             },
        //             { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        //         );
        //     }, APP_CONFIGS.trackGPSInterval);
        //     this.setState({ watchId });
    }

    getRouteMatrixInfo = async (source = null, destination = null, callback) => {
        if (!source || !destination) {
            console.log("Source or destination not found");
            typeof callback === 'function' && callback({ error: "Source or destination not found", distance: 0, duration: 0 });
            return;
        }
        try {
            const locPathParam = source.join() + ';' + destination.join();
            const res = await axios.get(`https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${locPathParam}?sources=0&destinations=1&annotations=distance,duration&access_token=${JS_SDK_ACCESS_TOKEN}`);
            if (res.data.code === "Ok") {
                const { distances, durations } = res.data;
                console.log("Matrix api success: ", res.data);
                typeof callback === 'function' && callback({ distance: distances[0][0], duration: durations[0][0] });
            } else {
                console.log("Response is not Ok");
                typeof callback === 'function' && callback({ error: "Response is not Ok", distance: 0, duration: 0 });
            }
        } catch (er) {
            console.log(`Something went wrong: ${er}`);
            typeof callback === 'function' && callback({ error: `Something went wrong: ${er}`, distance: 0, duration: 0 });
        }
    }

    async getCoordsOnRoad(gpsPointTimestamps, callback) {
        const actualPoints = [];
        const gpsPoints = gpsPointTimestamps.reduce((list, item) => {
            list.push(item.loc);
            actualPoints.push(item.loc[1], item.loc[0], item.heading, item.accuracy, item.speed, item.date, item.status);
            return list;
        }, []);
        let locPathParam = gpsPoints.reduce((param, coord) => param + coord.join(',') + ';', "");
        locPathParam = locPathParam.slice(0, locPathParam.length - 1);
        try {
            const res = await axios.get(`https://api.mapbox.com/matching/v5/mapbox/driving/${locPathParam}?tidy=true&geometries=geojson&access_token=${JS_SDK_ACCESS_TOKEN}`);
            const { matchings } = res.data;
            if (res.data.code === "NoRoute" || (matchings && matchings.length === 0)) {
                console.log("No matching coords found");
                callback(res.data, [], [], 0);
                return;
            }
            // let trackpoints = [];
            // if (APP_CONFIGS.callRoadMapApi === true) {
            //     trackpoints = matchings[0].geometry.coordinates.reduce((arr, coord, index) => {
            //         if (!gpsPointTimestamps[index] || (index === matchings[0].geometry.coordinates.length - 1 && gpsPointTimestamps[index + 1])) {
            //             const lastPoint = gpsPointTimestamps[gpsPointTimestamps.length - 1];
            //             arr.push(coord[1], coord[0], lastPoint.date, lastPoint.status);
            //         } else {
            //             arr.push(coord[1], coord[0], gpsPointTimestamps[index].date, gpsPointTimestamps[index].status);
            //         }
            //         return arr;
            //     }, []);
            // } else {
            //     trackpoints = [...actualPoints];
            // }
            //     // TODO: Return distance and duration from matching object (here matchings[0])
            const trackpoints = matchings[0].geometry.coordinates.reduce((arr, coord, index) => {
                if (!gpsPointTimestamps[index] || (index === matchings[0].geometry.coordinates.length - 1 && gpsPointTimestamps[index + 1])) {
                    const lastPoint = gpsPointTimestamps[gpsPointTimestamps.length - 1];
                    arr.push(coord[1], coord[0], lastPoint.heading, lastPoint.accuracy, lastPoint.speed, lastPoint.date, lastPoint.status);
                } else {
                    arr.push(coord[1], coord[0], gpsPointTimestamps[index].heading, gpsPointTimestamps[index].accuracy, gpsPointTimestamps[index].speed, gpsPointTimestamps[index].date, gpsPointTimestamps[index].status);
                }
                return arr;
            }, []);
            callback(res.data, actualPoints, trackpoints, matchings[0].distance);
        } catch (er) {
            console.log("matching error: ", er);
        }
    }

    async updateRecordRideCoordinate(coords, status) {
        const location = [coords.longitude, coords.latitude];
        // DOC: Updating collection collection in the state
        this.trackpointTick++;
        const { gpsPointCollection } = this.state;
        const feature = gpsPointCollection.features[0];
        let points = [...feature.geometry.coordinates, location];
        let updatedCollection = {
            ...gpsPointCollection,
            features: [{
                ...feature, geometry: {
                    ...feature.geometry,
                    coordinates: points
                }
            }]
        }
        this.setState({ gpsPointCollection: updatedCollection, currentLocation: { location, name: '' } }, () => {
            console.log("gpsPointCollection coordinates count: ", this.state.gpsPointCollection.features[0].geometry.coordinates.length);
            if (APP_CONFIGS.callRoadMapApi === false || this.trackpointTick === 5) {
                this.trackpointTick = 0;
                this.gpsPoints.push({ loc: location, heading: coords.heading, accuracy: coords.accuracy, speed: coords.speed, date: new Date().toISOString(), status });
                // const currentZoomLevel = await this._mapView.getZoom();
                const options = {
                    // zoom: currentZoomLevel,
                    duration: 100,
                    centerCoordinate: location
                };
                this._mapView.setCamera(options);
                if (this.gpsPoints.length === APP_CONFIGS.trackpointCount) {
                    const gpsPoints = this.gpsPoints;
                    this.gpsPoints = [];
                    console.log("Update trackpoints to server or store locally");
                    if (this.props.hasNetwork && !this.props.ride.unsynced) {
                        // DOC: Call road map api of mapbox
                        if (APP_CONFIGS.callRoadMapApi === true) {
                            this.getCoordsOnRoad(gpsPoints, (responseBody, actualPoints, trackpoints, distance) => {
                                this.props.addTrackpoints(actualPoints, trackpoints, distance, this.props.ride, this.props.user.userId);
                                gpsPoints.length = 0;
                            });
                        } else {
                            const actualPoints = gpsPoints.reduce((list, item) => {
                                list.push(item.loc[1], item.loc[0], item.heading, item.accuracy, item.speed, item.date, item.status);
                                return list;
                            }, []);
                            const trackpoints = [...actualPoints];
                            console.log("Check for matrixPointCount");
                            if (gpsPoints.length % APP_CONFIGS.matrixPointCount === 0) {
                                console.log("Call matrix api");
                                const lastPoints = gpsPoints.slice(-(APP_CONFIGS.matrixPointCount + 1));
                                gpsPoints.length = 0;
                                this.getRouteMatrixInfo(lastPoints[0].loc, lastPoints[lastPoints.length - 1].loc, ({ error, distance, duration }) => {
                                    console.log("Call addTrackpoints api with distance");
                                    this.props.addTrackpoints(actualPoints, trackpoints, distance, this.props.ride, this.props.user.userId);
                                });
                            } else {
                                console.log("Call addTrackpoints api without distance");
                                this.props.addTrackpoints(actualPoints, trackpoints, 0, this.props.ride, this.props.user.userId);
                                gpsPoints.length = 0;
                            }
                        }
                    } else {
                        // DOC: Store points on device for syncing later
                        this.storePointsOnDevice(gpsPoints);
                    }
                }
            }
        });
    }

    async storePointsOnDevice(points, callback) {
        const unsyncedPointsStr = await AsyncStorage.getItem(`${UNSYNCED_RIDE}${this.props.ride.rideId}`);
        let unsyncedPoints = unsyncedPointsStr ? JSON.parse(unsyncedPointsStr) : [];
        unsyncedPoints = [...unsyncedPoints, ...points];
        AsyncStorage.setItem(`${UNSYNCED_RIDE}${this.props.ride.rideId}`, JSON.stringify(unsyncedPoints)).then(() => {
            if (!this.props.ride.unsynced) {
                this.props.addUnsyncedRide(this.props.ride.rideId);
                this.props.updateRide({ unsynced: true });
            }
            typeof callback === 'function' && callback({ success: 'Stored ' + JSON.stringify(unsyncedPoints) });
        }).catch(error => typeof callback === 'function' && callback({ error }));
    }

    onBackButtonPress = () => {
        if (Actions.state.index !== 0) {
            if (Actions.currentScene === PageKeys.FRIENDS_PROFILE) {
                this.props.resetCurrentFriend()
                // this.props.changeScreen(Actions.currentScene);
            } else if (Actions.currentScene === PageKeys.GROUP) {
                this.props.resetCurrentGroup();
                // this.props.changeScreen(Actions.currentScene);
            } else if (Actions.currentScene === PageKeys.CHAT) {
                this.props.resetChatMessage();
            }
            else {
                Actions.pop();
                this.props.changeScreen({ name: Actions.currentScene });
            }
            return true;
        } else {
            if (this.state.onItinerary) {
                this.hideItinerarySection();
            } else if (this.state.showCreateRide) {
                this.setState({ showCreateRide: false });
            } else if (this.state.onWaypointList) {
                this.hideWaypointList();
            }
            return true;
        }
    }

    async fetchDirections() {
        const { features } = this.state.markerCollection;
        const { directions } = this.state;
        if (features.length >= 2) {
            try {
                this.setState({ showLoader: true });
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
                this._hiddenMapView && this._hiddenMapView.fitBounds(newBounds.slice(0, 2), newBounds.slice(2), 35, 0);
                this.setState(prevState => ({ directions: responseBody.routes[0], showLoader: false }));
            } catch (err) {
                this.setState(prevState => ({ showLoader: false }));
                console.log("Error in getDirections(): ", err);
            }
        } else {
            directions && this.setState(prevState => ({ directions: null }));
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
                title: title
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

    onPressPointCommentOption = (index) => {
        if (typeof index === 'undefined') this.setState({ commentMode: true }, () => this.showCommentSection());
        else {
            this.updateSelectedPointIcon(this.state.markerCollection.features[index], () => {
                this.setState({ commentMode: true }, () => {
                    if (this.state.activeMarkerIndex > -1) this.showCommentSection();
                });
            });
        }
    }

    getRidePointOnActiveIndex(index) {
        const { ride } = this.props;
        const ridePoints = ride.waypoints.length + (ride.source ? 1 : 0) + (ride.destination ? 1 : 0);
        if (ride.source && index === 0) {
            return ride.source;
        } else if (ride.destination && index === ridePoints) {
            return ride.destination;
        } else {
            return ride.source ? ride.waypoints[index - 1] : ride.waypoints[index];
        }
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
                activeMarkerIndex: -1
            }
        }, () => {
            this.onCloseOptionsBar(false);
            const { ride } = this.props;
            if (deletingSource) {
                this.props.deleteSource(ride);
            } else if (deletingDestination) {
                this.props.deleteDestination(ride);
            } else {
                const indexOnServer = index - 1;
                this.props.deleteWaypoint(ride, indexOnServer);
            }
        });
    }

    makeWaypointAsSource = () => {
        const { activeMarkerIndex } = this.state;
        const { ride } = this.props;
        this.setState(prevState => {
            const { features } = prevState.markerCollection;
            return {
                rideUpdateCount: prevState.rideUpdateCount + 1,
                activeMarkerIndex: -1
            }
        }, () => {
            this.onCloseOptionsBar(false, () => {
                this.props.makeWaypointAsSource(ride, activeMarkerIndex - 1);
                this.setState(prevState => ({ refreshWaypointList: true }), () => {
                    setTimeout(() => this.setState(prevState => ({ refreshWaypointList: false })), 50);
                });
            });
        });
    }

    makeSourceAsWaypoint = () => {
        const { ride } = this.props;
        this.setState(prevState => {
            const { activeMarkerIndex } = prevState;
            const { features } = prevState.markerCollection;
            return {
                rideUpdateCount: prevState.rideUpdateCount + 1,
                activeMarkerIndex: -1
            }
        }, () => {
            this.onCloseOptionsBar(false, () => {
                this.props.makeSourceAsWaypoint(ride);
                this.setState(prevState => ({ refreshWaypointList: true }), () => {
                    setTimeout(() => this.setState(prevState => ({ refreshWaypointList: false })), 50);
                });
            });
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
                activeMarkerIndex: -1
            }
        }, () => {
            this.onCloseOptionsBar(false, () => {
                this.props.makeWaypointAsDestination(ride, activeMarkerIndex - 1);
                this.setState(prevState => ({ refreshWaypointList: true }), () => {
                    setTimeout(() => this.setState(prevState => ({ refreshWaypointList: false })), 50);
                });
            });
        });
    }

    makeDestinationAsWaypoint = () => {
        const { ride } = this.props;
        this.setState(prevState => {
            const { activeMarkerIndex } = prevState;
            const { features } = prevState.markerCollection;
            return {
                rideUpdateCount: prevState.rideUpdateCount + 1,
                activeMarkerIndex: -1
            }
        }, () => {
            this.onCloseOptionsBar(false, () => {
                this.props.makeDestinationAsWaypoint(ride);
                this.setState(prevState => ({ refreshWaypointList: true }), () => {
                    setTimeout(() => this.setState(prevState => ({ refreshWaypointList: false })), 50);
                });
            });
        });
    }

    onBullseyePress = async () => {
        if (this.state.showCreateRide === true || !this.state.isEditableMap) return;
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
            this.locationProximity = mapCenter;
            this.updateWaypointAtIndex(nextWaypointIndex, newMarker);
        } else {
            if (isDestinationSelected) { //DOC: nextWaypointIndex will be the second last index of the array (array.length - 2)
                nextWaypointIndex -= 1;
            } else if (this.state.activeMarkerIndex > -1) { //DOC: nextWaypointIndex will be the new index to the array (array.length + 1)
                nextWaypointIndex = this.state.activeMarkerIndex + 1;
            }
            this.locationProximity = mapCenter;
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
                }
            } else {
                const prevMarker = features[prevState.activeMarkerIndex];
                const isDestinationSelected = this.isDestination(prevMarker);
                return {
                    rideUpdateCount: prevState.rideUpdateCount + 1,
                    activeMarkerIndex: isDestinationSelected ? -1 : prevState.activeMarkerIndex
                }
            }
        }, () => {
            // DOC: Call the callback function, if any.
            callback && callback();

            this.onCloseOptionsBar(false, () => {
                const { ride } = this.props;
                let waypoint = { name: '', address: '', lat: marker.geometry.coordinates[1], lng: marker.geometry.coordinates[0] };
                if (!ride.source) {
                    this.props.addSource(waypoint);
                } else {
                    const indexOnServer = index - 1;
                    this.props.addWaypoint(waypoint, indexOnServer);
                }
            });
        });
    }

    // DOC: Updates or replaces waypoint at given index
    updateWaypointAtIndex(index, marker, callback) {
        this.setState((prevState) => {
            const { features } = prevState.markerCollection;
            return {
                rideUpdateCount: prevState.rideUpdateCount + 1,
                isUpdatingWaypoint: false,
                activeMarkerIndex: -1
            }
        }, () => {
            // DOC: Call the callback function, if any.
            callback && callback();

            this.onCloseOptionsBar(false, () => {
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
            });
        });
    }

    onPressRecenterMap = (location) => {
        const options = {
            zoom: DEFAULT_ZOOM_LEVEL,
            duration: 500,
        };
        if (Array.isArray(location)) {
            options.centerCoordinate = location;
            this._mapView.setCamera(options);
        } else if (this.state.currentLocation) {
            options.centerCoordinate = this.state.currentLocation.location;
            this._mapView.setCamera(options);
        }
    }

    onPressBoundRideToScreen = () => {
        const { ride } = this.props;
        let rideBounds = null;
        if (ride.isRecorded) {
            let coordinates = [];
            if (ride.source) {
                coordinates.push([ride.source.lng, ride.source.lat]);
            }
            coordinates.push(...this.state.gpsPointCollection.features[0].geometry.coordinates);
            if (ride.destination) {
                coordinates.push([ride.destination.lng, ride.destination.lat]);
            }
            if (coordinates.length > 1) {
                rideBounds = turfBBox({ coordinates, type: 'LineString' });
                this._mapView.fitBounds(rideBounds.slice(0, 2), rideBounds.slice(2), 35, 0);
            } else {
                this._mapView.flyTo(coordinates[0], 0);
            }
        } else {
            if (!this.state.directions) return;
            rideBounds = turfBBox(this.state.directions.geometry);
            this._mapView.fitBounds(rideBounds.slice(0, 2), rideBounds.slice(2), 35, 0);
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

    onToggleRouteVisibility = () => {
        this.setState((prevState) => ({ hideRoute: !prevState.hideRoute }));
    }

    getMapSnapshot = (successCallback, errorCallback) => {
        let timeout = null;
        try {
            timeout = setTimeout(() => {
                clearTimeout(timeout);
                typeof errorCallback === 'function' && errorCallback();
            }, 2000);
            const { ride } = this.props;
            let rideBounds = null;
            if (ride.isRecorded) {
                let coordinates = [];
                if (ride.source) {
                    coordinates.push([ride.source.lng, ride.source.lat]);
                }
                coordinates.push(...this.state.gpsPointCollection.features[0].geometry.coordinates);
                if (ride.destination) {
                    coordinates.push([ride.destination.lng, ride.destination.lat]);
                }
                if (coordinates.length > 1) {
                    // DOC: Update the mapbounds to include the recorded ride path
                    rideBounds = turfBBox({ coordinates, type: 'LineString' });
                    this._hiddenMapView && this._hiddenMapView.fitBounds(rideBounds.slice(0, 2), rideBounds.slice(2), 35, 0);
                } else {
                    if (this._hiddenMapView) {
                        this._hiddenMapView.flyTo(coordinates[0], 0);
                    }
                }
            } else {
                if (!this.state.directions) return;
                rideBounds = turfBBox(this.state.directions.geometry);
                this._hiddenMapView && this._hiddenMapView.fitBounds(rideBounds.slice(0, 2), rideBounds.slice(2), 35, 0);
            }
            this._hiddenMapView && this._hiddenMapView.takeSnap(false).then(mapSnapshotString => {
                if (timeout) {
                    clearTimeout(timeout);
                    console.log("mapSnapshotString: ", mapSnapshotString);
                    typeof successCallback === 'function' && successCallback(mapSnapshotString);
                }
            });
        } catch (er) {
            if (timeout) {
                clearTimeout(timeout);
                typeof errorCallback === 'function' && errorCallback(er);
            }
        }
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
            Toast.show({ text: 'Found the last place same as this', position: 'top' });
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
            this.locationProximity = place.geometry.coordinates;
            this.updateWaypointAtIndex(nextWaypointIndex, newMarker, () => this._mapView.flyTo(place.geometry.coordinates, 500));
        } else {
            if (isDestinationSelected) { //DOC: nextWaypointIndex will be the second last index of the array (array.length - 2)
                nextWaypointIndex -= 1;
            } else if (activeMarkerIndex > -1) { //DOC: nextWaypointIndex will be the new index to the array (array.length + 1)
                nextWaypointIndex = activeMarkerIndex + 1;
            }
            this.locationProximity = place.geometry.coordinates;
            this.addWaypointAtIndex(nextWaypointIndex, newMarker, () => this._mapView.flyTo(place.geometry.coordinates, 500));
        }
    }

    onSearchPlace = async (placeQuery) => {
        this.setState({ searchQuery: placeQuery });
        if (placeQuery.length < 2) return;
        const lastCharacter = placeQuery.slice(-1);
        if (lastCharacter === ' ') return;
        const config = { query: placeQuery, limit: 10 };
        if (this.locationProximity || this.state.currentLocation) {
            config.proximity = this.locationProximity || this.state.currentLocation.location;
        }
        // if (this.state.activeSearch.value !== 'all') {
        //     config.types = [`poi.${this.state.activeSearch.value}`];
        // }
        try {
            const response = await geocodingClient.forwardGeocode(config).send();
            this.setState({ searchResults: response.body.features });
        } catch (er) {
            console.log("forwardgeocoding error: ", config, er);
        }
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
        // DOC: Process action ony if network is availbale
        if (!this.props.hasNetwork) return;

        this.state.controlsBarLeftAnim.__getValue() === 0 && this.hideMapControls();
        this.hideWaypointList();
        Geolocation.getCurrentPosition(
            ({ coords }) => {
                this.setState({ currentLocation: { location: [coords.longitude, coords.latitude], name: '' }, showCreateRide: true });
            },
            (error) => {
                console.log(error.code, error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }

    onPressRecordRide = () => {
        // DOC: Process action ony if network is availbale
        if (!this.props.hasNetwork) return;

        this.state.controlsBarLeftAnim.__getValue() === 0 && this.hideMapControls();
        this.trackpointTick = 0;
        const dateTime = new Date().toISOString();
        let rideDetails = {
            userId: this.props.user.userId,
            name: new Date().toLocaleString(),
            date: dateTime,
            isRecorded: true,
            startTime: new Date().toISOString()
        };
        Geolocation.getCurrentPosition(
            ({ coords }) => {
                rideDetails.source = {
                    lat: coords.latitude,
                    lng: coords.longitude,
                    date: dateTime
                };

                this.props.createRecordRide(rideDetails);
                this.trackpointTick++;
                let updatedCollection = {
                    ...this.state.gpsPointCollection,
                    features: [{
                        ...this.state.gpsPointCollection.features[0], geometry: {
                            ...this.state.gpsPointCollection.features[0].geometry,
                            coordinates: [[coords.longitude, coords.latitude]]
                        }
                    }]
                }
                this.setState({ gpsPointCollection: updatedCollection, currentLocation: { location: [coords.longitude, coords.latitude], name: '' } }, () => {
                    // this.watchLocation();
                    BackgroundGeolocation.setConfig({
                        preventSuspend: true,
                        isMoving: true
                    }).then((state) => {
                        console.log('[setConfig] success: ', state);
                        if (!state.enabled) this.startTrackingLocation();
                    })
                });
            },
            (error) => {
                console.log(error.code, error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }

    onPressPauseRide = () => {
        const { ride } = this.props;
        // DOC: Don't stop tracking location if user has enbled location sharing
        if (!this.props.user.locationEnable) this.stopTrackingLocation();
        BackgroundGeolocation.setConfig({
            preventSuspend: false,
            isMoving: false
        }, (state) => {
            // BackgroundGeolocation.removeListener('heartbeat', this.onHeartbeat);
            this.stopTrackingLocation();
        });
        const { gpsPointCollection } = this.state;
        const points = gpsPointCollection.features[0].geometry.coordinates;
        if (this.trackpointTick >= 1 && APP_CONFIGS.callRoadMapApi) {
            const lastPoints = points.slice(-this.trackpointTick);
            this.gpsPoints = lastPoints.reduce((list, point) => {
                list.push({ date: new Date().toISOString(), loc: point, status: RECORD_RIDE_STATUS.RUNNING });
                return list;
            }, this.gpsPoints);
        }
        if (this.gpsPoints.length > 0) this.gpsPoints[this.gpsPoints.length - 1].status = RECORD_RIDE_STATUS.PAUSED;
        if (this.props.hasNetwork && !this.props.ride.unsynced) {
            this.hasModifiedRide = true;
            if (this.gpsPoints.length > 1) {
                if (APP_CONFIGS.callRoadMapApi) {
                    this.getCoordsOnRoad(this.gpsPoints, (responseBody, actualPoints, trackpoints, distance) => {
                        this.props.pauseRecordRide(new Date().toISOString(), actualPoints, trackpoints, distance, ride, this.props.user.userId)
                    });
                } else {
                    let actualPoints = [];
                    let trackpoints = [];
                    actualPoints = this.gpsPoints.reduce((list, item) => {
                        list.push(item.loc[1], item.loc[0], item.heading, item.accuracy, item.speed, item.date, item.status);
                        return list;
                    }, []);
                    trackpoints = [...actualPoints];
                    const lastPointCounts = points.length % APP_CONFIGS.matrixPointCount;
                    if (lastPointCounts !== 0) {
                        const lastPoints = points.slice(-(lastPointCounts + 1));
                        this.getRouteMatrixInfo(lastPoints[0], lastPoints[lastPoints.length - 1], ({ error, distance, duration }) => {
                            console.log(`lastPoints: ${distance}`);
                            this.props.pauseRecordRide(new Date().toISOString(), actualPoints, trackpoints, distance, ride, this.props.user.userId)
                        });
                    } else {
                        this.props.pauseRecordRide(new Date().toISOString(), actualPoints, trackpoints, 0, ride, this.props.user.userId)
                    }
                }
                this.gpsPoints = [];
            } else {
                let actualPoints = [];
                let trackpoints = [];
                actualPoints = this.gpsPoints.reduce((list, item) => {
                    list.push(item.loc[1], item.loc[0], item.heading, item.accuracy, item.speed, item.date, item.status);
                    return list;
                }, []);
                trackpoints = [...actualPoints];
                // DOC: Calculate distance between last two points
                if (this.gpsPoints === 1 && points.length >= 2) {
                    const lastPoints = points.slice(-2);
                    this.getRouteMatrixInfo(lastPoints[0], lastPoints[1], ({ error, distance, duration }) => {
                        console.log(`last two points: ${distance}`);
                        this.props.pauseRecordRide(new Date().toISOString(), actualPoints, trackpoints, distance, ride, this.props.user.userId)
                    });
                } else {
                    this.props.pauseRecordRide(new Date().toISOString(), actualPoints, trackpoints, 0, ride, this.props.user.userId)
                }
                this.gpsPoints = [];
            }
        } else {
            this.hasModifiedRide = false;
            if (this.gpsPoints.length > 0) {
                this.setState({ showLoader: true });
                this.storePointsOnDevice(this.gpsPoints, ({ error, success }) => {
                    if (error) {
                        this.gpsPoints = [];
                        console.log("Something went wrong while storing points on device: ", error);
                    } else {
                        this.gpsPoints = [];
                        console.log(success);
                        this.props.updateRide({ status: RECORD_RIDE_STATUS.PAUSED });
                    }
                    this.setState({ showLoader: false });
                });
            } else {
                this.props.updateRide({ status: RECORD_RIDE_STATUS.PAUSED });
            }
        }
    }

    onPressContinueRide = () => {
        BackgroundGeolocation.start(state => {
            if (!state.enabled) this.startTrackingLocation();
            const { ride } = this.props;
            this.props.continueRecordRide(new Date().toISOString(), ride, this.props.user.userId);
        });
    }

    onPressStopRide = () => {
        const { ride } = this.props;
        BackgroundGeolocation.setConfig({
            preventSuspend: false,
            isMoving: false
        }, (state) => {
            // DOC: Don't stop tracking location if user has enbled location sharing
            if (!this.props.user.locationEnable) this.stopTrackingLocation();
        });
        const { gpsPointCollection } = this.state;
        const points = gpsPointCollection.features[0].geometry.coordinates;
        if (this.trackpointTick >= 1) {
            const lastPoints = gpsPointCollection.features[0].geometry.coordinates.slice(-this.trackpointTick);
            this.gpsPoints = lastPoints.reduce((list, point) => {
                list.push({ date: new Date().toISOString(), loc: point, status: RECORD_RIDE_STATUS.RUNNING });
                return list;
            }, this.gpsPoints);
        }
        if (this.gpsPoints.length > 0) this.gpsPoints[this.gpsPoints.length - 1].status = RECORD_RIDE_STATUS.COMPLETED;
        if (this.props.hasNetwork && !this.props.ride.unsynced) {
            this.hasModifiedRide = true;
            if (this.gpsPoints.length > 1) {
                if (APP_CONFIGS.callRoadMapApi) {
                    this.getCoordsOnRoad(this.gpsPoints, (responseBody, actualPoints, trackpoints, distance) => {
                        this.props.completeRecordRide(new Date().toISOString(), actualPoints, trackpoints, distance, ride, this.props.user.userId)
                    });
                } else {
                    let actualPoints = [];
                    let trackpoints = [];
                    actualPoints = this.gpsPoints.reduce((list, item) => {
                        list.push(item.loc[1], item.loc[0], item.heading, item.accuracy, item.speed, item.date, item.status);
                        return list;
                    }, []);
                    trackpoints = [...actualPoints];
                    const lastPointCount = points.length % APP_CONFIGS.matrixPointCount;
                    if (lastPointCount !== 0) {
                        const lastPoints = points.slice(-(lastPointCount + 1));
                        this.getRouteMatrixInfo(lastPoints[0], lastPoints[lastPoints.length - 1], ({ error, distance, duration }) => {
                            this.props.completeRecordRide(new Date().toISOString(), actualPoints, trackpoints, distance, ride, this.props.user.userId)
                        });
                    } else {
                        this.props.completeRecordRide(new Date().toISOString(), actualPoints, trackpoints, 0, ride, this.props.user.userId)
                    }
                }
                this.gpsPoints = [];
            } else {
                let actualPoints = [];
                let trackpoints = [];
                actualPoints = this.gpsPoints.reduce((list, item) => {
                    list.push(item.loc[1], item.loc[0], item.heading, item.accuracy, item.speed, item.date, item.status);
                    return list;
                }, []);
                trackpoints = [...actualPoints];
                // DOC: Calculate distance between last two points
                if (this.gpsPoints === 1 && points.length >= 2) {
                    const lastPoints = points.slice(-2);
                    this.getRouteMatrixInfo(lastPoints[0], lastPoints[1], ({ error, distance, duration }) => {
                        this.props.completeRecordRide(new Date().toISOString(), actualPoints, trackpoints, distance, ride, this.props.user.userId)
                    });
                } else {
                    this.props.completeRecordRide(new Date().toISOString(), actualPoints, trackpoints, 0, ride, this.props.user.userId)
                }
                this.gpsPoints = [];
            }
        } else {
            this.hasModifiedRide = false;
            if (this.gpsPoints.length > 0) {
                this.gpsPoints[this.gpsPoints.length - 1].status = RECORD_RIDE_STATUS.COMPLETED;
                this.setState({ showLoader: true });
                this.storePointsOnDevice(this.gpsPoints, ({ error, success }) => {
                    if (error) {
                        this.gpsPoints = [];
                        console.log("Something went wrong while storing points on device: ", error);
                    } else {
                        this.gpsPoints = [];
                        console.log(success);
                        this.props.updateRide({ status: RECORD_RIDE_STATUS.COMPLETED });
                    }
                    this.setState({ showLoader: false });
                });
            } else {
                // DOC: Has to update to the server later
                this.props.updateRide({ status: RECORD_RIDE_STATUS.COMPLETED });
            }
        }
    }

    onChangeRecordRideStatus(newStatus) {
        switch (newStatus) {
            case RECORD_RIDE_STATUS.RUNNING:
                this.trackpointTick = 0;
                // this.watchLocation();
                break;
            case RECORD_RIDE_STATUS.PAUSED:
                break;
            case RECORD_RIDE_STATUS.COMPLETED:
                clearInterval(this.state.watchId);
                this.gpsPoints = [];
                // TODO: Call our API and show the result on map
                // this.props.getRideByRideId(this.props.ride.rideId);
                break;
        }
    }

    syncCoordinatesWithServer(ride, rideStatus, unsyncedPoints) {
        let actualPoints = [];
        let trackpoints = [];
        actualPoints = unsyncedPoints.reduce((list, item) => {
            list.push(item.loc[1], item.loc[0], item.heading, item.accuracy, item.speed, item.date, item.status);
            return list;
        }, []);
        trackpoints = [...actualPoints];
        if (rideStatus === RECORD_RIDE_STATUS.PAUSED) {
            unsyncedPoints[unsyncedPoints.length - 1].status = rideStatus;
            if (unsyncedPoints.length > 1) {
                if (APP_CONFIGS.callRoadMapApi === true) {
                    this.getCoordsOnRoad(unsyncedPoints, (responseBody, actualPoints, trackpoints, distance) => {
                        this.props.pauseRecordRide(new Date().toISOString(), actualPoints, trackpoints, distance, ride, this.props.user.userId, true);
                    });
                } else {
                    this.getRouteMatrixInfo(unsyncedPoints[0].loc, unsyncedPoints[unsyncedPoints.length - 1].loc, ({ error, distance, duration }) => {
                        this.props.pauseRecordRide(new Date().toISOString(), actualPoints, trackpoints, distance, ride, this.props.user.userId, true);
                    });
                }
                return;
            }
            this.props.pauseRecordRide(new Date().toISOString(), actualPoints, trackpoints, 0, ride, this.props.user.userId, true);
        } else if (rideStatus === RECORD_RIDE_STATUS.COMPLETED) {
            unsyncedPoints[unsyncedPoints.length - 1].status = rideStatus;
            if (unsyncedPoints.length > 1) {
                if (APP_CONFIGS.callRoadMapApi === true) {
                    this.getCoordsOnRoad(unsyncedPoints, (responseBody, actualPoints, trackpoints, distance) => {
                        this.props.completeRecordRide(new Date().toISOString(), actualPoints, trackpoints, distance, ride, this.props.user.userId, true)
                    });
                } else {
                    this.getRouteMatrixInfo(unsyncedPoints[0].loc, unsyncedPoints[unsyncedPoints.length - 1].loc, ({ error, distance, duration }) => {
                        this.props.completeRecordRide(new Date().toISOString(), actualPoints, trackpoints, distance, ride, this.props.user.userId, true)
                    });
                }
                return;
            }
            this.props.completeRecordRide(new Date().toISOString(), actualPoints, trackpoints, 0, ride, this.props.user.userId, true);
        }
    }

    onPressCloseRide = async () => {
        if (this.state.isSearchHeader) this.hideSearchbar();
        if (this.props.hasNetwork) {
            if (this.props.ride.unsynced) {
                this.closeRidePressed = true;
                const unsyncedPoints = await AsyncStorage.getItem(`${UNSYNCED_RIDE}${this.props.ride.rideId}`);
                if (unsyncedPoints) {
                    const points = JSON.parse(unsyncedPoints);
                    if (points.length > 0) {
                        this.syncCoordinatesWithServer(this.props.ride, points[points.length - 1].status, points);
                    }
                }
            } else {
                if (this.props.ride.userId === this.props.user.userId && this.state.rideUpdateCount > 0 || this.hasModifiedRide) {
                    const { ride } = this.props;
                    let hasSnapshotResponse = null;
                    this.setState({ showLoader: true, snapMode: true }, () => {
                        this.getMapSnapshot((mapSnapshot) => {
                            if (hasSnapshotResponse === true) return;
                            hasSnapshotResponse = true;
                            const body = {};
                            if (ride.source) body.source = ride.source;
                            if (ride.destination) body.destination = ride.destination;
                            if (ride.waypoints) body.waypoints = ride.waypoints;
                            if (this.state.directions) {
                                body.totalDistance = this.state.directions.distance;
                                body.totalTime = this.state.directions.duration;
                            }
                            if (mapSnapshot) body.snapshot = { mimeType: 'image/jpeg', picture: mapSnapshot };
                            replaceRide(ride.rideId, body,
                                () => this.setState({ showLoader: false, snapMode: false }),
                                () => this.setState({ showLoader: false, snapMode: false }));
                            if (this.state.activeMarkerIndex !== -1) this.onCloseOptionsBar(true);
                            this.props.clearRideFromMap();
                        }, (er) => {
                            console.log(er);
                            const body = {};
                            if (ride.source) body.source = ride.source;
                            if (ride.destination) body.destination = ride.destination;
                            if (ride.waypoints) body.waypoints = ride.waypoints;
                            if (ride.totalDistance) body.totalDistance = ride.totalDistance;
                            if (ride.totalTime) body.totalTime = ride.totalTime;
                            replaceRide(ride.rideId, body,
                                () => this.setState({ showLoader: false, snapMode: false }),
                                () => this.setState({ showLoader: false, snapMode: false }));
                            if (this.state.activeMarkerIndex !== -1) this.onCloseOptionsBar(true);
                            this.props.clearRideFromMap();
                        });
                    });
                } else {
                    if (this.state.activeMarkerIndex !== -1) this.onCloseOptionsBar(true);
                    this.props.clearRideFromMap();
                }
            }
        } else {
            this.props.clearRideFromMap();
        }
    }

    async componentWillUnmount() {
        console.log("Map unmounted");
        this.unregisterNetworkListener();
        this.stopTrackingLocation();
        AppState.removeEventListener('change', this.handleAppStateChange);
        BackgroundGeolocation.removeAllListeners();
        // this.watchID != null && Geolocation.clearWatch(this.watchID);
        clearInterval(this.state.watchId);
        // this.notificationInterval != null && clearInterval(this.notificationInterval);
        BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPress);
        this.props.publishEvent({ eventName: APP_EVENT_NAME.USER_EVENT, eventType: APP_EVENT_TYPE.INACTIVE, eventParam: { isLoggedIn: false, userId: this.props.user.userId, deviceId: await DeviceInfo.getUniqueId() } });
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

    onCloseOptionsBar = (cancelMarkerUpdate, callback) => {
        const { markerCollection, activeMarkerIndex } = this.state;
        if (activeMarkerIndex === -1 || cancelMarkerUpdate === true) {
            Animated.timing(
                this.state.optionsBarRightAnim,
                {
                    toValue: 100,
                    duration: 500,
                    useNativeDriver: true
                }
            ).start(() => typeof callback === 'function' && callback())
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
                }, () => typeof callback === 'function' && callback());
            }, 0)
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
        ).start(() => this.setState({ onWaypointList: true }));
    }

    hideWaypointList = (callback) => {
        Animated.timing(
            this.state.waypointListLeftAnim,
            {
                toValue: -widthPercentageToDP(100),
                duration: 300,
                useNativeDriver: true
            }
        ).start(() => {
            if (this.state.activeMarkerIndex > -1) {
                this.onCloseOptionsBar(false);
                this.setState(prevState => ({ onWaypointList: false }), () => typeof callback === 'function' && callback());
            } else {
                this.setState({ onWaypointList: false }, () => typeof callback === 'function' && callback())
            }
        });
    }

    showCommentSection = () => {
        Animated.timing(
            this.state.commentSecAnim,
            {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }
        ).start();
    }

    hideCommentSection = () => {
        Animated.timing(
            this.state.commentSecAnim,
            {
                toValue: -heightPercentageToDP(100),
                duration: 300,
                useNativeDriver: true
            }
        ).start(() => this.setState({ commentMode: false }));
    }

    showItinerarySection = () => {
        Animated.timing(
            this.state.itinerarySecAnim,
            {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }
        ).start(() => this.setState({ onItinerary: true }));
    }

    hideItinerarySection = () => {
        Animated.timing(
            this.state.itinerarySecAnim,
            {
                toValue: heightPercentageToDP(100),
                duration: 300,
                useNativeDriver: true
            }
        ).start(() => this.setState({ onItinerary: false }));
    }

    changeToItineraryMode = () => {
        this.hideMapControls();
        this.hideWaypointList(() => {
            this.showItinerarySection();
        });
    }

    onPressMarker = (e) => {
        if (this.props.ride.isRecorded === true) return;
        const selectedFeature = e.nativeEvent.payload;
        this.updateSelectedPointIcon(selectedFeature, () => {
            Animated.timing(
                this.state.optionsBarRightAnim,
                {
                    toValue: this.state.optionsBarRightAnim._value == 100 ? 0 : 100,
                    duration: 500,
                    useNativeDriver: true
                }
            ).start()
        });
    }

    updateSelectedPointIcon(selectedFeature, callback) {
        const selectedMarkerIndex = this.state.markerCollection.features.findIndex(marker => marker.geometry.coordinates.join('') === selectedFeature.id);
        const { activeMarkerIndex, markerCollection } = this.state;
        const isDestinationSelected = this.isDestination(selectedFeature);
        let updatedState = {};
        if (activeMarkerIndex > -1 && !(this.state.onWaypointList && (activeMarkerIndex === selectedMarkerIndex))) {
            let selectedIcon = ICON_NAMES.WAYPOINT_DEFAULT;
            const prevMarker = markerCollection.features[activeMarkerIndex];
            if (activeMarkerIndex === 0 && this.props.ride.source) {
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
        if (activeMarkerIndex !== selectedMarkerIndex) {
            let activeIcon = ICON_NAMES.WAYPOINT_SELECTED;
            if (selectedMarkerIndex === 0 && this.props.ride.source) {
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
        if (typeof callback === 'function') {
            this.setState(updatedState, () => callback());
        } else {
            this.setState(updatedState);
        }
    }

    onPressLogout = async () => {
        // DOC: Process action ony if network is availbale
        if (!this.props.hasNetwork) return;

        this.props.logoutUser(this.props.user.userId, this.props.userAuthToken, this.props.deviceToken);
    }

    createFriendsLocationMarker = (locInfo, id) => {
        return {
            type: 'Feature',
            id: id,
            geometry: {
                type: 'Point',
                coordinates: [locInfo.lng, locInfo.lat],
            },
            properties: {
                // icon: locInfo.userId + ''
                name: locInfo.name,
                id: id,
                isVisible: locInfo.isVisible
            },
        };
    }

    showSearchbar = () => {
        this.setState({ isSearchHeader: true }, () => {
            Animated.timing(this.state.searchbarAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }).start()
        });
    }

    hideSearchbar = () => {
        Animated.timing(this.state.searchbarAnim, {
            toValue: -widthPercentageToDP(100),
            duration: 300,
            useNativeDriver: true
        }).start(() => this.setState({ isSearchHeader: false }));
    }

    openTrackingList = () => {
        if (Object.keys({ ...this.props.friendsLocationList, ...this.props.membersLocationList }).length === 1) {
            Alert.alert('No recent tracking', `You don't have any recent location trackings`);
            return;
        }
        if (this.state.isVisibleList) {
            this.closeTrackingList();
            return;
        }
        Animated.timing(this.state.dropdownAnim, {
            toValue: heightPercentageToDP(18),
            duration: 0,
        }).start(() => {
            this.setState({ isVisibleList: true });
        });
    }

    closeTrackingList = (id, turnOn, isGroup) => {
        Animated.timing(this.state.dropdownAnim, {
            toValue: 0,
            duration: 0,
        }).start(() => {
            if (typeof id === 'undefined') {
                return this.setState({ isVisibleList: false });
            }
            this.setState({ isVisibleList: false }, () => {
                if (isGroup) {
                    turnOn
                        ? this.props.getAllMembersLocation(id, this.props.user.userId)
                        : this.props.hideMembersLocation(id)
                } else {
                    turnOn
                        ? this.props.getFriendsLocationList(this.props.user.userId, [id])
                        : this.props.hideFriendsLocation(id)
                }
            });
        });
    }

    renderRidePointOptions = () => {
        const { isUpdatingWaypoint, markerCollection, activeMarkerIndex } = this.state;
        return this.props.ride.userId === this.props.user.userId
            ? <View style={{ alignItems: 'center', backgroundColor: '#fff' }}>
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
                                style={{ paddingVertical: 5, width: '100%', backgroundColor: 'rgba(0,0,0,0.4)', borderColor: '#acacac', borderTopWidth: 1, borderBottomWidth: 1 }}
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
                <IconButton onPress={this.onPressDeleteOption} style={{ paddingVertical: 5, width: '100%', borderColor: '#acacac', borderTopWidth: 1, borderBottomWidth: 1 }} iconProps={{ name: 'delete', type: 'MaterialCommunityIcons' }} />
                <IconButton onPress={() => this.onPressPointCommentOption()} style={{ paddingVertical: 5, width: '100%', borderColor: '#acacac', borderTopWidth: 1, borderBottomWidth: 1 }} iconProps={{ name: 'comment-text', type: 'MaterialCommunityIcons' }} />
            </View>
            : <View style={{ alignItems: 'center', backgroundColor: '#fff' }}>
                <IconButton onPress={this.onCloseOptionsBar} style={{ paddingVertical: 5, width: '100%', backgroundColor: '#fff' }}
                    iconProps={{ name: 'window-close', type: 'MaterialCommunityIcons' }} />
                <IconButton onPress={() => this.onPressPointCommentOption()} style={{ paddingVertical: 5 }} iconProps={{ name: 'comment-text', type: 'MaterialCommunityIcons' }} />
            </View>
    }

    hideAllLocations = () => {
        this.closeTrackingList();
        if (this.props.friendsLocationList.activeLength > 0) {
            this.props.hideFriendsLocation();
        }
        if (this.props.membersLocationList.activeLength > 0) {
            this.props.hideMembersLocation();
        }
    }

    renderRecordRidePaths = () => {
        const { features } = this.state.recordRideCollection;
        return <MapboxGL.ShapeSource
            id='recordRidePathLayer'
            shape={this.state.recordRideCollection}>
            {
                features.map((feature, idx) => {
                    return <MapboxGL.LineLayer
                        key={`recordRidePath${idx}`}
                        id={`recordRidePath${idx}`}
                        style={MapElementStyles.recordRideRoute}
                    />
                })
            }
        </MapboxGL.ShapeSource>
    }

    render() {
        const { isEditableMap, mapViewHeight, directions, markerCollection, activeMarkerIndex, gpsPointCollection, controlsBarLeftAnim, waypointListLeftAnim, showCreateRide, currentLocation,
            searchResults, searchQuery, isEditableRide, snapshot, hideRoute, optionsBarRightAnim, isUpdatingWaypoint, mapRadiusCircle, showLoader, searchbarAnim, isSearchHeader } = this.state;
        const { notificationList, ride, showMenu, user, canUndo, canRedo, friendsLocationList, membersLocationList, FriendGroupList } = this.props;
        const MAP_VIEW_TOP_OFFSET = showCreateRide ? (CREATE_RIDE_CONTAINER_HEIGHT - WINDOW_HALF_HEIGHT) + (mapViewHeight / 2) - (BULLSEYE_SIZE / 2) : (isEditableRide ? 130 : 60) + (mapViewHeight / 2) - (BULLSEYE_SIZE / 2);
        const searchCancelAnim = searchbarAnim.interpolate({
            inputRange: [-widthPercentageToDP(100), 0],
            outputRange: [0, 1]
        });
        const searchClearAnim = searchbarAnim.interpolate({
            inputRange: [-widthPercentageToDP(100), 0],
            outputRange: [0, 1]
        });
        return (
            <View style={{ flex: 1 }}>
                {/* <MenuModal notificationCount={notificationList.notification.length} isVisible={showMenu} onClose={this.onCloseAppNavMenu} onPressNavMenu={this.onPressAppNavMenu} alignCloseIconLeft={user.handDominance === 'left'} /> */}
                <MenuModal notificationCount={notificationList.totalUnseen} isVisible={showMenu} onClose={this.onCloseAppNavMenu} onPressNavMenu={this.onPressAppNavMenu} alignCloseIconLeft={user.handDominance === 'left'} />
                {/* <Spinner
                    visible={showLoader}
                    textContent={'Loading...'}
                    textStyle={{ color: '#fff' }}
                /> */}
                <View style={[styles.fillParent, { flexShrink: 1 }]}>
                    {
                        !showCreateRide
                            ? <View style={styles.mapHeader}>
                                {
                                    searchResults.length === 0
                                        ? ride.rideId === null
                                            ? <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                                                {/* {
                                                    this.state.friendsLocationCollection.features.length > 0
                                                        ? <View style={{ flexDirection: 'row' }}>
                                                            <LinkButton style={{ paddingVertical: 20 }} title='HIDE FRIENDS' titleStyle={{ color: '#fff', fontSize: 16 }} onPress={this.openTrackingList} />
                                                        </View>
                                                        : <View style={{ flexDirection: 'row' }}>
                                                            <LinkButton style={{ paddingVertical: 20 }} title='+ RIDE' titleStyle={{ color: '#fff', fontSize: 16 }} onPress={this.createRide} />
                                                            <LinkButton style={{ paddingVertical: 20 }} title='RECORD RIDE' titleStyle={{ color: '#fff', fontSize: 16 }} onPress={this.onPressRecordRide} />
                                                        </View>
                                                } */}
                                                <View style={{ flexDirection: 'row' }}>
                                                    <LinkButton style={{ paddingVertical: 20 }} title='TRACKING' titleStyle={{ color: '#fff', fontSize: 16 }} onPress={this.openTrackingList} />
                                                    <LinkButton style={{ paddingVertical: 20 }} title='+ RIDE' titleStyle={{ color: '#fff', fontSize: 16 }} onPress={this.createRide} />
                                                    <LinkButton style={{ paddingVertical: 20 }} title='RECORD' titleStyle={{ color: '#fff', fontSize: 16 }} onPress={this.onPressRecordRide} />
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
                        !showCreateRide && ride.rideId && !isSearchHeader
                            ? <View style={styles.mapSubHeader}>
                                {
                                    ride.isRecorded
                                        ? <View style={{ width: '30%', justifyContent: 'space-around', backgroundColor: '#EB861E', borderWidth: 4, borderColor: '#fff', elevation: 10, shadowOffset: { width: 5, height: 5 }, shadowColor: "grey", shadowOpacity: 0.5, shadowRadius: 10 }}>
                                            <IconLabelPair iconProps={{ name: 'road-variant', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(5) } }} text={this.getDistanceAsFormattedString(ride.totalDistance, user.distanceUnit)}
                                                textStyle={{ color: '#fff', fontSize: widthPercentageToDP(3.5) }} />
                                            <IconLabelPair iconProps={{ name: 'access-time', type: 'MaterialIcons', style: { fontSize: widthPercentageToDP(5) } }} text={this.getTimeAsFormattedString(ride.totalTime)}
                                                textStyle={{ color: '#fff', fontSize: widthPercentageToDP(3.5) }} />
                                        </View>
                                        : <View style={{ width: '30%', justifyContent: 'space-around', backgroundColor: '#EB861E', borderWidth: 4, borderColor: '#fff', elevation: 10, shadowOffset: { width: 5, height: 5 }, shadowColor: "grey", shadowOpacity: 0.5, shadowRadius: 10 }}>
                                            <IconLabelPair iconProps={{ name: 'road-variant', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(5) } }} text={this.getDistanceAsFormattedString(directions ? directions.distance : null, user.distanceUnit)}
                                                textStyle={{ color: '#fff', fontSize: widthPercentageToDP(3.5) }} />
                                            <IconLabelPair iconProps={{ name: 'access-time', type: 'MaterialIcons', style: { fontSize: widthPercentageToDP(5) } }} text={this.getTimeAsFormattedString(directions ? directions.duration : null)}
                                                textStyle={{ color: '#fff', fontSize: widthPercentageToDP(3.5) }} />
                                        </View>
                                }
                                {
                                    isEditableRide
                                        ? <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around' }}>
                                            <IconButton iconProps={{ name: 'restaurant', type: 'MaterialIcons', style: { color: APP_COMMON_STYLES.infoColor } }} />
                                            <IconButton iconProps={{ name: 'gas-station', type: 'MaterialCommunityIcons', style: { color: APP_COMMON_STYLES.infoColor } }} />
                                            {/* <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { color: APP_COMMON_STYLES.infoColor } }} /> */}
                                            <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { color: APP_COMMON_STYLES.headerColor } }} onPress={this.showSearchbar} />
                                        </View>
                                        : null
                                    // isEditableRide
                                    //     ? <SearchBox value={searchQuery} onPressClear={this.onPressClear}
                                    //         onTextChange={this.onSearchPlace} style={{ marginHorizontal: 5, justifyContent: 'center' }} />
                                    //     : null
                                }
                            </View>
                            : isSearchHeader ?
                                <Animated.View style={{ ...styles.mapSubHeader, flexDirection: 'row', transform: [{ translateX: searchbarAnim }] }}>
                                    <Animated.View style={{ marginHorizontal: widthPercentageToDP(1), alignItems: 'center', justifyContent: 'center', opacity: searchCancelAnim }}>
                                        <IconButton onPress={this.hideSearchbar} iconProps={{ name: 'md-arrow-round-back', type: 'Ionicons', style: { fontSize: 25, } }} />
                                    </Animated.View>
                                    <View style={{ flex: 1, justifyContent: 'center' }}>
                                        <TextInput style={{ borderBottomWidth: 2 }}
                                            value={searchQuery} onChangeText={this.onSearchPlace} autoFocus={true}
                                        />
                                    </View>
                                    <Animated.View style={{ marginLeft: widthPercentageToDP(1), alignItems: 'center', justifyContent: 'center', opacity: searchClearAnim }}>
                                        <IconButton onPress={this.onPressClear} iconProps={{ name: 'close-circle', type: 'MaterialCommunityIcons', style: { fontSize: 25, } }} />
                                    </Animated.View>
                                    {/* <IconButton style={{ marginHorizontal: widthPercentageToDP(1) }} iconProps={this.state.activeSearch.icon} onPress={this.openDropdown} /> */}
                                </Animated.View>
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
                    {
                        markerCollection.features.length > 0
                            ? <MapboxGL.MapView
                                styleURL={MapboxGL.StyleURL.Street}
                                zoomLevel={14}
                                centerCoordinate={[
                                    4.895168,
                                    52.370216
                                ]}
                                style={styles.hiddenMapStyles}
                                ref={el => this._hiddenMapView = el}
                            >
                                {
                                    currentLocation ? this.renderCurrentLocation(currentLocation) : null
                                }
                                {
                                    directions ?
                                        <MapboxGL.ShapeSource id='ridePathLayer' shape={directions.geometry}>
                                            <MapboxGL.LineLayer id='ridePath' style={[{ lineColor: 'blue', lineWidth: 5, lineCap: MapboxGL.LineCap.Butt, visibility: 'visible' }, hideRoute ? MapElementStyles.hideRoute : null]} />
                                        </MapboxGL.ShapeSource>
                                        : null
                                }
                                <MapboxGL.ShapeSource
                                    id='markers'
                                    shape={markerCollection}
                                    images={shapeSourceImages}
                                    onPress={this.onPressMarker}>
                                    <MapboxGL.SymbolLayer id="exampleIconName" style={[MapElementStyles.icon, MapElementStyles.markerTitle]} />
                                </MapboxGL.ShapeSource>
                                {
                                    this.state.recordRideCollection.features.length > 0
                                        ? this.renderRecordRidePaths()
                                        : gpsPointCollection.features[0].geometry.coordinates.length >= 2 ?
                                            <MapboxGL.Animated.ShapeSource id='recordRidePathLayer' shape={gpsPointCollection}>
                                                <MapboxGL.Animated.LineLayer id='recordRidePath' style={[MapElementStyles.recordRideRoute, { lineColor: 'red' }]} />
                                            </MapboxGL.Animated.ShapeSource>
                                            : null
                                }
                            </MapboxGL.MapView>
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
                        ref={el => this._mapView = el}
                        onDidFinishLoadingMap={this.onFinishMapLoading}
                        onRegionDidChange={this.onRegionDidChange}
                        compassEnabled={true}
                        onLayout={({ nativeEvent }) => {
                            const { height } = nativeEvent.layout;
                            height != this.state.mapViewHeight && this.setState({ mapViewHeight: height })
                        }}
                        surfaceView={true}
                        zoomEnabled={isEditableMap && !showCreateRide}
                        scrollEnabled={isEditableMap && !showCreateRide}
                        pitchEnabled={isEditableMap && !showCreateRide}
                        rotateEnabled={isEditableMap && !showCreateRide}
                    >
                        {
                            currentLocation ? this.renderCurrentLocation(currentLocation) : null
                        }
                        {
                            directions ?
                                <MapboxGL.ShapeSource id='ridePathLayer' shape={directions.geometry}>
                                    <MapboxGL.LineLayer id='ridePath' style={[{ lineColor: 'blue', lineWidth: 5, lineCap: MapboxGL.LineCap.Butt, visibility: 'visible' }, hideRoute ? MapElementStyles.hideRoute : null]} />
                                </MapboxGL.ShapeSource>
                                : null
                        }
                        {
                            this.state.friendsLocationCollection.features.length > 0
                                ? <MapboxGL.ShapeSource
                                    id='friends'
                                    shape={this.state.friendsLocationCollection}
                                    // images={this.state.friendsImage}
                                    cluster
                                    clusterRadius={50}
                                    clusterMaxZoom={14}
                                    onPress={({ nativeEvent }) => console.log("onPressFriendsLocationMarker: ", JSON.stringify(nativeEvent))}>

                                    <MapboxGL.SymbolLayer id="friendLocationIcon"
                                        filter={['all', ['!has', 'point_count'], ['==', 'isVisible', true]]}
                                        style={[MapElementStyles.friendsName, MapElementStyles.friendsIcon]}
                                    />
                                    {/* DOC: Clustered symbol count and circle icon */}
                                    <MapboxGL.SymbolLayer
                                        id="pointCount"
                                        style={MapElementStyles.clusterCount}
                                    />
                                    <MapboxGL.CircleLayer
                                        id="clusteredPoints"
                                        belowLayerID="pointCount"
                                        filter={['has', 'point_count']}
                                        style={MapElementStyles.clusteredPoints}
                                    />
                                </MapboxGL.ShapeSource>
                                : null
                        }
                        {
                            this.state.mapMatchinRoute ?
                                <MapboxGL.ShapeSource id='mapMatchingLayer' shape={this.state.mapMatchinRoute}>
                                    <MapboxGL.LineLayer id='mapMatchingPath' style={[{ lineColor: 'green', lineWidth: 3, lineCap: MapboxGL.LineCap.Butt, visibility: 'visible' }, hideRoute ? MapElementStyles.hideRoute : null]} />
                                </MapboxGL.ShapeSource>
                                : null
                        }
                        {
                            this.state.recordRideCollection.features.length > 0
                                ? this.renderRecordRidePaths()
                                : gpsPointCollection.features[0].geometry.coordinates.length >= 2 ?
                                    <MapboxGL.Animated.ShapeSource id='recordRidePathLayer' shape={gpsPointCollection}>
                                        <MapboxGL.Animated.LineLayer id='recordRidePath' style={[MapElementStyles.recordRideRoute, { lineColor: 'red' }]} />
                                    </MapboxGL.Animated.ShapeSource>
                                    : null
                        }
                        {
                            user.showCircle && mapRadiusCircle
                                ? <MapboxGL.ShapeSource id='routeSource' shape={mapRadiusCircle}>
                                    <MapboxGL.LineLayer id='routeFill' style={MapElementStyles.circleOutline} />
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
                                    <MapboxGL.SymbolLayer id="exampleIconName" style={[MapElementStyles.icon, MapElementStyles.markerTitle]} />
                                </MapboxGL.ShapeSource>
                                : null
                        }

                    </MapboxGL.MapView>
                    {
                        <Animated.View style={{ backgroundColor: '#fff', position: 'absolute', zIndex: 800, elevation: 10, top: APP_COMMON_STYLES.headerHeight, width: widthPercentageToDP(50), height: this.state.dropdownAnim }}>
                            {
                                this.state.isVisibleList && this.state.friendsLocationCollection.features.length > 0
                                    ? <ListItem icon style={{ borderBottomWidth: 1 }} onPress={this.hideAllLocations}>
                                        <Left style={{ alignItems: 'center', justifyContent: 'center' }}>
                                            <NBIcon name='location-off' type='MaterialIcons' />
                                        </Left>
                                        <Body style={{ borderBottomWidth: 0 }}>
                                            <Text>Hide All</Text>
                                        </Body>
                                        {/* <Right style={{ borderBottomWidth: 0 }}>
                                            <CheckBox checked={item.isVisible} />
                                        </Right> */}
                                    </ListItem>
                                    : null
                            }
                            <FlatList
                                data={[...Object.keys(this.props.friendsLocationList).reduce((list, k) => {
                                    if (k === 'activeLength') return list;
                                    list.push({ name: this.props.friendsLocationList[k].name, id: k, isVisible: this.props.friendsLocationList[k].isVisible });
                                    return list;
                                }, []),
                                ...Object.keys(this.props.membersLocationList).reduce((list, k) => {
                                    if (k === 'activeLength') return list;
                                    list.push({ name: this.props.friendGroupList.find(g => g.groupId === k).groupName, id: k, isVisible: this.props.membersLocationList[k].some(g => g.isVisible), isGroup: true });
                                    return list;
                                }, [])]}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => {
                                    return (
                                        <ListItem icon style={{ borderBottomWidth: 1 }} onPress={() => this.closeTrackingList(item.id, !item.isVisible, item.isGroup)}>
                                            <Left style={{ alignItems: 'center', justifyContent: 'center' }}>
                                                {
                                                    item.isGroup
                                                        ? <NBIcon name='account-group' type='MaterialCommunityIcons' />
                                                        : <NBIcon name='person' type='MaterialIcons' />
                                                }
                                            </Left>
                                            <Body style={{ borderBottomWidth: 0 }}>
                                                <Text>{item.name}</Text>
                                            </Body>
                                            <Right style={{ borderBottomWidth: 0 }}>
                                                <CheckBox onPress={() => this.closeTrackingList(item.id, !item.isVisible, item.isGroup)} checked={item.isVisible} />
                                            </Right>
                                        </ListItem>
                                    )
                                }}
                            />
                        </Animated.View>
                    }
                    {
                        showCreateRide || (isEditableRide && searchResults.length === 0) ?
                            <TouchableOpacity style={[styles.bullseye, { marginTop: MAP_VIEW_TOP_OFFSET }]} onPress={this.onBullseyePress}>
                                <NBIcon name='target' type='MaterialCommunityIcons' style={{ fontSize: BULLSEYE_SIZE, color: '#2890FB' }} />
                            </TouchableOpacity>
                            : null
                    }
                    {/* <Animated.View style={{ backgroundColor: '#fff', paddingHorizontal: widthPercentageToDP(2), position: 'absolute', zIndex: 800, elevation: 10, top: heightPercentageToDP(18), right: 0, height: this.state.dropdownAnim }}>
                        <FlatList
                            data={this.state.searchTypes}
                            keyExtractor={item => item.value}
                            renderItem={({ item, index }) => {
                                return <IconButton style={{ marginVertical: heightPercentageToDP(1) }} iconProps={item.icon} onPress={() => this.closeDropdown(index)} />
                            }}
                        />
                    </Animated.View> */}
                    {
                        isEditableMap
                            ? <View style={{ position: 'absolute', zIndex: 100, left: 5, top: 140, width: 55 }}>
                                {/* <IconButton style={[styles.mapControlButton, { backgroundColor: 'transparent' }]} iconProps={{ name: 'controller-play', type: 'Entypo', style: { fontSize: 40, elevation: 10 } }} onPress={this.showMapControls} /> */}
                                <TouchableOpacity style={{ width: widthPercentageToDP(10), height: widthPercentageToDP(15) }} onPress={this.showMapControls}>
                                    <Image source={require('../../assets/img/arrow-right.png')} style={{ flex: 1, width: null, height: null }} />
                                </TouchableOpacity>
                            </View>
                            : null
                    }
                    <Animated.View style={[{ left: 5, elevation: 10, position: 'absolute', zIndex: 100, top: 140, width: 55 }, { transform: [{ translateX: controlsBarLeftAnim }] }]}>
                        {/* <IconButton style={styles.mapControlButton} iconProps={{ name: 'controller-play', type: 'Entypo', style: { fontSize: 40, elevation: 10, transform: [{ rotate: '180deg' }] } }} onPress={this.hideMapControls} /> */}
                        <TouchableOpacity style={{ backgroundColor: '#fff', flex: 1, height: widthPercentageToDP(15) }} onPress={this.hideMapControls}>
                            <Image source={require('../../assets/img/arrow-left.png')} style={{ flex: 1, width: null, height: null }} />
                        </TouchableOpacity>
                        {
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
                        {
                            ride.rideId
                                ? <IconButton style={[styles.mapControlButton, styles.topBorder]} iconProps={{ name: 'map-marker-circle', type: 'MaterialCommunityIcons' }} onPress={this.onPressBoundRideToScreen} />
                                : null
                        }
                    </Animated.View>
                    {
                        ride.rideId !== null && ride.isRecorded === false
                            ? <Animated.View style={[{ height: '100%', width: '100%', elevation: 11, position: 'absolute', zIndex: 110 }, { transform: [{ translateX: waypointListLeftAnim }] }]}>
                                <WaypointList isEditable={!ride.isRecorded && ride.userId === user.userId} refreshContent={this.state.refreshWaypointList} onPressOutside={() => this.hideWaypointList()} onCancel={() => this.hideWaypointList()} changeToCommentMode={this.onPressPointCommentOption} changeToItineraryMode={this.changeToItineraryMode} />
                            </Animated.View>
                            : null
                    }
                    {
                        this.state.commentMode
                            ? <Animated.View style={[{ height: '100%', width: '100%', elevation: 12, position: 'absolute', zIndex: 120 }, { transform: [{ translateY: this.state.commentSecAnim }] }]}>
                                <CommentSection isEditable={this.props.ride.userId === this.props.user.userId} index={activeMarkerIndex} onClose={this.hideCommentSection} />
                            </Animated.View>
                            : null
                    }
                    {
                        ride.rideId && !ride.isRecorded
                            ? <TouchableOpacity style={{ position: 'absolute', zIndex: 100, left: widthPercentageToDP(45), bottom: 0, width: widthPercentageToDP(10), height: widthPercentageToDP(15) }} onPress={this.showItinerarySection}>
                                <Image source={require('../../assets/img/arrow-right.png')} style={{ flex: 1, width: null, height: null, transform: [{ rotate: '270deg' }] }} />
                            </TouchableOpacity>
                            : null
                    }
                    {
                        <Animated.View style={[{ height: heightPercentageToDP(100), width: '100%', elevation: 12, position: 'absolute', zIndex: 999 }, { transform: [{ translateY: this.state.itinerarySecAnim }] }]}>
                            <ItinerarySection onClose={this.hideItinerarySection} isEditable={this.props.ride.userId === this.props.user.userId} />
                        </Animated.View>
                    }
                    {
                        searchResults.length > 0 ?
                            <SearchResults style={{ marginTop: 0 }} data={searchResults} onPressClose={this.onPressSearchResultsClose} onSelectItem={this.onSelectPlace} />
                            : null
                    }
                    {
                        activeMarkerIndex > -1
                            ? <Animated.View style={[styles.controlsContainerRight, { transform: [{ translateX: optionsBarRightAnim }] }]}>
                                {
                                    this.renderRidePointOptions()
                                }
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
                    showCreateRide || this.state.onItinerary
                        ? null
                        : <ShifterButton onPress={this.toggleAppNavigation} containerStyles={this.props.hasNetwork === false ? { bottom: heightPercentageToDP(8.5) } : null} alignLeft={user.handDominance === 'left'} />
                }
                <Loader isVisible={showLoader} />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { showMenu, currentScreen } = state.TabVisibility;
    const { ride } = state.RideInfo.present;
    const { unsyncedRides } = state.RideList;
    const canUndo = state.RideInfo.past.length > 0;
    const canRedo = state.RideInfo.future.length > 0;
    const { user, userAuthToken, deviceToken } = state.UserAuth;
    const { isLocationOn } = state.GPSState;
    // const {showLoader} = state.PageState;
    const { notificationList, pageNumber } = state.NotificationList;
    const { friendsLocationList } = state.FriendList;
    const { membersLocationList, friendGroupList } = state.FriendGroupList;
    const { appState, hasNetwork, lastApi, isRetryApi } = state.PageState;
    return { ride, isLocationOn, user, userAuthToken, deviceToken, showMenu, friendsLocationList, membersLocationList, friendGroupList, currentScreen, canUndo, canRedo, notificationList, pageNumber, appState, hasNetwork, unsyncedRides, lastApi, isRetryApi };
}

const mapDispatchToProps = (dispatch) => {
    return {
        toggleNetworkStatus: (status) => dispatch(toggleNetworkStatusAction(status)),
        updateDeviceLocationState: (locationState) => dispatch(deviceLocationStateAction(locationState)),
        hideAppNavMenu: () => dispatch(appNavMenuVisibilityAction(false)),
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        changeScreen: (screenKey) => dispatch(screenChangeAction(screenKey)),
        clearRideFromMap: () => dispatch(initUndoRedoRideAction()),
        submitNewRide: (rideInfo) => dispatch(createNewRide(rideInfo)),
        updateRide: (data) => dispatch(updateRideAction(data)),
        publishEvent: (eventBody) => publishEvent(eventBody),
        pushNotification: (userId) => pushNotification(userId),
        updateLocation: (userId, locationInfo) => updateLocation(userId, locationInfo),
        getAllNotifications: (userId, pageNumber, date, comingFrom, successCallback, errorCallback) => dispatch(getAllNotifications(userId, pageNumber, date, comingFrom, successCallback, errorCallback)),
        readNotification: (userId, notificationId) => dispatch(readNotification(userId, notificationId)),
        deleteNotifications: (notificationIds) => dispatch(deleteNotifications(notificationIds)),
        deleteAllNotifications: (userId) => dispatch(deleteAllNotifications(userId)),
        hideLoader: () => dispatch(toggleLoaderAction(false)),
        addSource: (waypoint) => dispatch(updateRideAction({ source: waypoint })),
        updateSource: (waypoint) => dispatch(updateRideAction({ source: waypoint })),
        deleteSource: (ride) => dispatch(updateRideAction({ source: null })),
        addWaypoint: (waypoint, index) => dispatch(addWaypointAction({ index, waypoint })),
        updateWaypoint: (waypoint, index) => dispatch(updateWaypointAction({ index, updates: waypoint })),
        deleteWaypoint: (ride, index) => dispatch(deleteWaypointAction({ index })),
        updateDestination: (waypoint) => dispatch(updateRideAction({ destination: waypoint })),
        deleteDestination: (ride) => dispatch(updateRideAction({ destination: null })),
        makeWaypointAsSource: (ride, index) => dispatch(updateRideAction({
            waypoints: [...ride.waypoints.slice(index + 1)],
            source: ride.waypoints[index]
        })),
        makeSourceAsWaypoint: (ride) => dispatch(updateRideAction({
            waypoints: [ride.source, ...ride.waypoints],
            source: null
        })),
        makeWaypointAsDestination: (ride, index) => dispatch(updateRideAction({
            waypoints: [...ride.waypoints.slice(0, index)],
            destination: ride.waypoints[index]
        })),
        makeDestinationAsWaypoint: (ride) => dispatch(updateRideAction({
            waypoints: [...ride.waypoints, ride.destination],
            destination: null
        })),
        createRecordRide: (rideInfo) => dispatch(createRecordRide(rideInfo)),
        addTrackpoints: (actualPoints, trackpoints, distance, ride, userId) => dispatch(addTrackpoints(actualPoints, trackpoints, distance, ride, userId)),
        pauseRecordRide: (pauseTime, actualPoints, trackpoints, distance, ride, userId) => dispatch(pauseRecordRide(pauseTime, actualPoints, trackpoints, distance, ride, userId)),
        continueRecordRide: (resumeTime, ride, userId) => dispatch(continueRecordRide(resumeTime, ride, userId)),
        completeRecordRide: (endTime, actualPoints, trackpoints, distance, ride, userId) => dispatch(completeRecordRide(endTime, actualPoints, trackpoints, distance, ride, userId)),
        getRideByRideId: (rideId) => dispatch(getRideByRideId(rideId)),
        resetCurrentFriend: () => dispatch(resetCurrentFriendAction()),
        resetCurrentGroup: () => dispatch(resetCurrentGroupAction()),
        doUndo: () => dispatch(undoRideAction()),
        doRedo: () => dispatch(redoRideAction()),
        logoutUser: (userId, accessToken, deviceToken) => dispatch(logoutUser(userId, accessToken, deviceToken)),
        updateSourceOrDestination: (identifier, locationName) => dispatch(updateSourceOrDestinationAction({ identifier, updates: { name: locationName } })),
        updateWaypointName: (waypointId, locationName) => dispatch(updateWaypointNameAction({ waypointId, locationName })),
        hideFriendsLocation: (userId) => dispatch(hideFriendsLocationAction(userId)),
        hideMembersLocation: (groupId) => dispatch(hideMembersLocationAction(groupId)),
        getFriendsLocationList: (userId, friendsIdList) => dispatch(getFriendsLocationList(userId, friendsIdList)),
        getAllMembersLocation: (groupId, userId) => dispatch(getAllMembersLocation(groupId, userId)),
        updateAppState: (appState) => dispatch(updateAppStateAction({ appState })),
        resetStoreToDefault: () => dispatch(resetStateOnLogout()),
        resetChatMessage: () => dispatch(resetChatMessageAction()),
        addUnsyncedRide: (unsyncedRideId) => dispatch(addUnsyncedRideAction(unsyncedRideId)),
        deleteUnsyncedRide: (unsyncedRideId) => dispatch(deleteUnsyncedRideAction(unsyncedRideId)),
        retryLastApi: (api, params) => dispatch(api(...params)),
        retryLastApiWithoutDispatch: (api, params) => api(...params),
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'map', isRetryApi: state }))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);

const MapElementStyles = MapboxGL.StyleSheet.create({
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
        iconAllowOverlap: true,
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
        textOffset: IS_ANDROID ? [0, -3.4] : [0, -3],
        textAllowOverlap: true
    },
    friendsIcon: {
        iconImage: FRIENDS_LOCATION_ICON,
        // iconSize: IS_ANDROID ? 1 : 0.25,
        iconAnchor: 'bottom',
        iconAllowOverlap: true
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
    },
    recordRideRoute: {
        lineWidth: 5,
        lineJoin: MapboxGL.LineJoin.Round,
        lineCap: MapboxGL.LineCap.Butt,
        visibility: 'visible',
        lineOpacity: 0.50,
        lineColor: MapboxGL.StyleSheet.identity('lineColor')
    },
    clusterCount: {
        textField: '{point_count}',
        textSize: 12,
        textPitchAlignment: 'map',
    },
    clusteredPoints: {
        circlePitchAlignment: 'map',
        circleColor: MapboxGL.StyleSheet.source(
            [
                [25, 'yellow'],
                [50, 'red'],
                [75, 'blue'],
                [100, 'orange'],
                [300, 'pink'],
                [750, 'white'],
            ],
            'point_count',
            MapboxGL.InterpolationMode.Exponential,
        ),
        circleRadius: MapboxGL.StyleSheet.source(
            [[0, 15], [100, 20], [750, 30]],
            'point_count',
            MapboxGL.InterpolationMode.Exponential,
        ),
        circleOpacity: 0.84,
        circleStrokeWidth: 2,
        circleStrokeColor: 'white',
    }
});