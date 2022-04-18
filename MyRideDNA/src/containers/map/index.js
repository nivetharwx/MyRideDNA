import React, { Component } from 'react';
import {
    SafeAreaView, View, TouchableOpacity, Alert,
    Keyboard, Image, BackHandler, Animated,
    DeviceEventEmitter, Text, TextInput, StatusBar,
    AppState, ActivityIndicator, FlatList, Platform,
} from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-community/async-storage';
import { connect, useDispatch } from 'react-redux';
import Geolocation from 'react-native-geolocation-service';

import MapboxGL from '@mapbox/react-native-mapbox-gl';
import Supercluster from 'supercluster';
import Permissions, { RESULTS } from 'react-native-permissions';
import * as turfHelpers from '@turf/helpers';
import { default as turfBBox } from '@turf/bbox';
import { default as turfBBoxPolygon } from '@turf/bbox-polygon';
import { default as turfCircle } from '@turf/circle';
import { default as turfDistance } from '@turf/distance';
import { default as turfTransformRotate } from '@turf/transform-rotate';
import Spinner from 'react-native-loading-spinner-overlay';
import { Icon as NBIcon, Toast, ListItem, Left, Body, Right, CheckBox, Thumbnail } from 'native-base';
// import { BULLSEYE_SIZE, MAP_ACCESS_TOKEN, JS_SDK_ACCESS_TOKEN, PageKeys, WindowDimensions, RIDE_BASE_URL, IS_ANDROID, RECORD_RIDE_STATUS, ICON_NAMES, APP_COMMON_STYLES, widthPercentageToDP, APP_EVENT_NAME, APP_EVENT_TYPE, USER_AUTH_TOKEN, heightPercentageToDP, RIDE_POINT } from '../../constants';
// import { clearRideAction, deviceLocationStateAction, appNavMenuVisibilityAction, screenChangeAction, undoRideAction, redoRideAction, initUndoRedoRideAction, addWaypointAction, updateWaypointAction, deleteWaypointAction, updateRideAction, resetCurrentFriendAction, updateSourceOrDestinationAction, updateWaypointNameAction, resetCurrentGroupAction, hideFriendsLocationAction, resetStateOnLogout, toggleLoaderAction, updateAppStateAction, resetChatMessageAction } from '../../actions';
import { BULLSEYE_SIZE, MAP_ACCESS_TOKEN, JS_SDK_ACCESS_TOKEN, PageKeys, WindowDimensions, RIDE_BASE_URL, IS_ANDROID, RECORD_RIDE_STATUS, ICON_NAMES, APP_COMMON_STYLES, widthPercentageToDP, APP_EVENT_NAME, APP_EVENT_TYPE, USER_AUTH_TOKEN, heightPercentageToDP, RIDE_POINT, UNSYNCED_RIDE, CUSTOM_FONTS, NOTIFICATION_TYPE, RIDE_TYPE } from '../../constants';
import { clearRideAction, deviceLocationStateAction, appNavMenuVisibilityAction, screenChangeAction, undoLastAction, redoLastAction, initUndoRedoAction, addWaypointAction, updateWaypointAction, deleteWaypointAction, updateRideAction, resetCurrentFriendAction, updateSourceOrDestinationAction, updateWaypointNameAction, resetCurrentGroupAction, hideFriendsLocationAction, resetStateOnLogout, toggleLoaderAction, updateAppStateAction, addUnsyncedRideAction, deleteUnsyncedRideAction, resetChatMessageAction, resetErrorHandlingAction, toggleNetworkStatusAction, hideMembersLocationAction, resetCurrentPassengerAction, goToPrevProfileAction, updateUserAction, resetPersonProfileAction, setCurrentFriendAction, resetPersonProfilePicAction, removeTempLocationAction, removeTempMembersLocationAction, apiLoaderActions, replaceGarageInfoAction } from '../../actions';
import { SearchBox, IconicList } from '../../components/inputs';
import { SearchResults, BasePage } from '../../components/pages';
import { Actions } from 'react-native-router-flux';
import { MapControlPair, BasicButton, IconButton, LinkButton, ImageButton } from '../../components/buttons';
import { IconLabelPair, DefaultText } from '../../components/labels';
import WaypointList from './waypoint-list';
import CommentSection from './comment-scetion';
import ItinerarySection from './itinerary-section';

import Base64, { getTimeAsFormattedString, getDistanceAsFormattedString } from '../../util';

import styles from './styles';

import DEFAULT_WAYPOINT_ICON from '../../assets/img/location-pin-red-small.png';
import SELECTED_WAYPOINT_ICON from '../../assets/img/location-pin-red-small.png';
import DEFAULT_SOURCE_ICON from '../../assets/img/source-pin-red.png';
import SELECTED_SOURCE_ICON from '../../assets/img/source-pin-red.png';
import DEFAULT_DESTINATION_ICON from '../../assets/img/destination-pin-red.png';
import SELECTED_DESTINATION_ICON from '../../assets/img/destination-pin-red.png';
import FRIENDS_LOCATION_ICON from '../../assets/img/friends-location.png';

import { createRecordRide, pauseRecordRide, continueRecordRide, addTrackpoints, completeRecordRide, getRideByRideId, createNewRide, replaceRide, pushNotification, getAllNotifications, readNotification, publishEvent, deleteNotifications, logoutUser, updateLocation, getFriendsLocationList, getAllMembersLocation, getAllMembersAndFriendsLocationList, updateRide as updateRideOnServer, getPicture, getPostTypes, getAllChats, sendingTestData, getGarageInfo, handleServiceErrors, getSpaces } from '../../api';

import Bubble from '../../components/bubble';
import MenuModal from '../../components/modal';
import { BasicHeader } from '../../components/headers';
import CreateRide from '../create-ride';

import BackgroundGeolocation from 'react-native-background-geolocation';

import axios from 'axios';
import { BaseModal } from '../../components/modal';
import { Loader } from '../../components/loader';
import BackgroundTimer from 'react-native-background-timer';
import DeviceInfo from 'react-native-device-info';

import { APP_CONFIGS } from '../../config';
import RNFetchBlob from 'rn-fetch-blob';
import messaging from '@react-native-firebase/messaging';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
var PushNotification = require("react-native-push-notification");
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
const DEFAULT_CENTER_COORDS = [-77.019913, 38.892059];

import DurationIcon from '../../assets/img/Time-Ride.svg'
import DistanceIcon from '../../assets/img/Distance-Rides.svg'
import CalendarIcon from '../../assets/img/Date-Rides.svg'
import { CountComponent } from '../../components/count';
import RideList from '../../reducers/RideList';

export class Map extends Component {
    _rideTaskId = null;
    unregisterNetworkListener = null;
    prevUserTrackTime = 0;
    _mapView = null;
    _hiddenMapView = null;
    locationPermission = null;
    // watchID = null;
    isLocationOn = false;
    gpsPoints = [];
    rootScreen = PageKeys.MAP;
    mapCircleTimeout = null;
    bottomLeftDefaultPoint = null;
    fetchDirOnUndoRedo = true;
    // notificationInterval = null;
    hasModifiedRide = false;
    hasManualSnapshot = false;
    prevCoordsStr = '';
    // currentCoordsStr = '';
    locationProximity = null;
    closeRidePressed = false;
    updateStatusLocally = false;
    locationPollInterval = null;
    lastShownFriendLoc = null;
    rideTimeInterval = null;
    timeCount=0
    constructor(props) {
        super(props);
        this.setJWTTokenToHeader(props.user.jwttoken);
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
            isEditableRide: false,
            undoActions: [],
            redoActions: [],
            snapshot: null,
            hideRoute: false,
            optionsBarRightAnim: new Animated.Value(100),
            controlsBarLeftAnim: new Animated.Value(-100),
            waypointListLeftAnim: new Animated.Value(-widthPercentageToDP(100)),
            commentSecAnim: new Animated.Value(-heightPercentageToDP(100)),
            dropdownAnim: new Animated.Value(0),
            currentLocation: null,
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
            commentMode: false,
            onWaypointList: false,
            searchTypes: [
                { label: 'Parking', value: 'parking', icon: { name: 'local-parking', type: 'MaterialIcons' } },
                { label: 'Gas Stations', value: 'fuel', icon: { name: 'local-gas-station', type: 'MaterialIcons' } },
                { label: 'Restaurants', value: 'restaurant', icon: { name: 'restaurant', type: 'MaterialIcons' } },
            ],
            watchId: null,
            isEditableMap: true,
            isVisibleList: false,
            superCluster: null,
            superClusterClusters: [],
            showOptionsModal: false,
            showRecordRideButtons: false,
            showPauseBox: false,
            isVisibleLogoutBox: false,
            defaultCenterCoords: DEFAULT_CENTER_COORDS,
            coords: [],
            recordRideMarker: null,
            checkingAppState: 'foreground',
            bgLocationState: 'off',
            odometer: 0,
            recordRideTime: 0,
            isSearchingAToB: false,
            sourceQuery: 'CURRENT LOCATION',
            destinationQuery: 'CHOOSE DESTINATION',
            sourceLocation: null,
            destinationLocation: null,
            isrideLoadedOnMap: false,
            startTrackingLocation:false,
        };
    }

    setJWTTokenToHeader(jwtToken) { axios.defaults.headers.common['jwtToken'] = jwtToken; }

    componentWillReceiveProps(nextProps) {
        const { ride, isLocationOn, currentScreen } = nextProps;
        // if (this.props.currentScreen !== currentScreen) {
        //     if (currentScreen.name !== Actions.currentScene) {
        //         if (Actions.prevState.routes.length > 1) {
        //             if (Actions.prevState.routes.findIndex(route => route.routeName === currentScreen.name) > -1) {
        //                 Actions.popTo(currentScreen.name, currentScreen.params);
        //                 setTimeout(() => Actions.refresh(currentScreen.params), 0);
        //             } else {
        //                 currentScreen.params && currentScreen.params.comingFrom
        //                     ? Actions.push(currentScreen.name, currentScreen.params)
        //                     : Actions.replace(currentScreen.name, currentScreen.params);
        //             }
        //         } else {
        //             if (currentScreen.name !== this.rootScreen) {
        //                 Actions.push(currentScreen.name, currentScreen.params)
        //             } else {
        //                 Actions.popTo(currentScreen.name, currentScreen.params);
        //                 setTimeout(() => Actions.refresh(currentScreen.params), 0);
        //             }
        //         }
        //     } else if (currentScreen.params && (this.props.currentScreen.params !== currentScreen.params)) {
        //         Actions.refresh(currentScreen.params);
        //     }
        // }
    }

     initializeEmptyRide(updatedState) {
        updatedState.directions = null;
        updatedState.markerCollection = {
            ...this.state.markerCollection,
            features: []
        };
        updatedState.recordRideMarker = null;
        // DOC: Resetting record ride features
        this.gpsPoints.length = 0;
        updatedState.coords = [];
        updatedState.recordRideCollection = {
            type: 'FeatureCollection',
            features: []
        };
        updatedState.odometer = 0;
        updatedState.isSearchingAToB = false;
        updatedState.sourceQuery = 'CURRENT LOCATION';
        updatedState.destinationQuery = 'CHOOSE DESTINATION';
        updatedState.sourceLocation = null;
        updatedState.destinationLocation = null;
    }

    replaceRideApiForCreatedRide = (rideId, body) => {
        replaceRide(rideId, body, (res) => { }, (er) => {
            if (er.message === 'Network Error' && this.props.hasNetwork) {
                Alert.alert(
                    'Something went wrong ',
                    '',
                    [
                        {
                            text: 'Retry ', onPress: () => {
                                this.replaceRideApiForCreatedRide(rideId, body)
                            }
                        },
                        { text: 'Cancel', onPress: () => { this.props.clearRideFromMap() }, style: 'cancel' },
                    ],
                    { cancelable: false }
                )
            }
        });
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



    async componentDidUpdate(prevProps, prevState) {
        if (prevState.bgLocationState === 'on' && this.state.bgLocationState === 'off') {
            if (this.props.user.locationEnable) this.startTrackingLocation();
        }
        if (prevProps.ride !== this.props.ride) {
            // if (prevProps.ride !== this.props.ride || ((prevProps.ride === this.props.ride)&& !this.state.isrideLoadedOnMap && this.props.currentScreen.isRideCalledOnMap)) {
            //     console.log('\n\n\n voming here')
            //   if(this.props.currentScreen.isRideCalledOnMap){
            //       this.setState({isrideLoadedOnMap:true})
            //   }
            let updatedState = {};
            let currentCoordsStr = '';
            const { ride } = this.props;
            if (prevProps.ride.rideId !== ride.rideId) {
                this.initializeEmptyRide(updatedState);
                updatedState.rideUpdateCount = 0;
                updatedState.activeMarkerIndex = -1;
                this.closeRidePressed = false;
                if (ride.userId === this.props.user.userId) {
                    updatedState.isEditableRide = true;
                } else {
                    updatedState.isEditableRide = false;
                }
                this.hasModifiedRide = false;
                this.hasManualSnapshot = false;
                this.locationProximity = null;
                if (ride.rideId === null) {
                    this.prevCoordsStr = '';
                }
                else {
                    if (this.state.showCreateRide === true) {
                        updatedState.showCreateRide = false;
                    }
                    if (ride.isRecorded) {
                        if (ride.status === RECORD_RIDE_STATUS.COMPLETED) {
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
                                const sourceMarker = this.createMarkerFeature([ride.source.lng, ride.source.lat], ICON_NAMES.SOURCE_DEFAULT);
                                updatedState.markerCollection.features = [sourceMarker];
                                // updatedState.recordRideMarker = [{ location: [ride.source.lng, ride.source.lat], name: '', markerType: 'source' }]
                            }
                            console.log('\n\n\n lastStatus : ', lastStatus)
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
                            console.log(tempList,'//// templist')
                            if (ride.destination) {
                                lastStatus = ride.destination.status || RECORD_RIDE_STATUS.COMPLETED;
                                tempList.length > 0 && tempList[tempList.length - 1].geometry.coordinates.push([ride.destination.lng, ride.destination.lat]);
                                // updatedState.recordRideMarker = [...updatedState.recordRideMarker, { location: [ride.destination.lng, ride.destination.lat], name: '', markerType: 'destination' }]
                                const destinationMarker = this.createMarkerFeature([ride.destination.lng, ride.destination.lat], ICON_NAMES.DESTINATION_DEFAULT);
                                // this.setState({
                                //     markerCollection: {
                                //         ...this.state.markerCollection,
                                //         features: [...this.state.markerCollection.features, destinationMarker]
                                //     }
                                // })
                                updatedState.markerCollection.features = [...updatedState.markerCollection.features, destinationMarker];

                            }
                            updatedState.recordRideCollection.features = tempList;
                            updatedState.odometer = ride.totalDistance;
                            updatedState.recordRideTime = ride.totalTime;
                            console.log(updatedState,'///// updated state')
                            // this._mapView.fitBounds([ride.source.lng, ride.source.lat], [ride.destination.lng, ride.destination.lat], 30)
                        } else {
                            console.log('\n\n\n\n\n\n\n\n\n\n else in didupdate')
                            let collection = [];
                            if (ride.source) {
                                collection.push([ride.source.lng, ride.source.lat]);
                                // updatedState.recordRideMarker = [{ location: [ride.source.lng, ride.source.lat], name: '', markerType: 'source' }]
                                const sourceMarker = this.createMarkerFeature([ride.source.lng, ride.source.lat], ICON_NAMES.SOURCE_DEFAULT);
                                updatedState.markerCollection.features = [sourceMarker];
                            }
                            if (ride.trackpoints) {
                                ride.trackpoints.forEach(trackpoint => collection.push([trackpoint.lng, trackpoint.lat]));
                                // this._mapView.moveTo([ride.trackpoints[ride.trackpoints.length - 1].lng, ride.trackpoints[ride.trackpoints.length - 1].lat])
                            }
                            if (ride.destination) {
                                collection.push([ride.destination.lng, ride.destination.lat]);
                            }
                            updatedState.odometer = ride.totalDistance;
                            updatedState.recordRideTime = ride.totalTime;
                            console.log('/////// called  ///////////// ',ride.totalTime)
                            this.timeCount=ride.totalTime
                            BackgroundGeolocation.setOdometer(ride.totalDistance)
                            updatedState.coords = collection;

                        }
                    } else {
                        this.hideAllLocations();
                    }

                    /// called in case of showing a completed ride from atlas

                    if (!ride.isRecorded) {
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
                            console.log(updatedState.markerCollection.features,"///// updatedState.markerCollection.features")
                        }

                        if (ride.destination) {
                            const destinationMarker = this.createMarkerFeature([ride.destination.lng, ride.destination.lat], ICON_NAMES.DESTINATION_DEFAULT);
                            updatedState.markerCollection.features = [...updatedState.markerCollection.features, destinationMarker];
                            currentCoordsStr += ride.destination.lng + ride.destination.lat;
                        }
                    }
                }
                this.setState(updatedState, () => {
                    if (ride.rideId === null) {
                        // this.onPressRecenterMap();
                    } else if (ride.isRecorded) {
                        console.log(updatedState)
                        this.state.recordRideCollection.features.length > 0 && this.getPausedDirection();
                        if (this.state.checkingAppState === 'foreground') {
                            if (this.state.recordRideCollection.features.length > 0) {
                                // DOC: Update the mapbounds to include the recorded ride path
                                const coordinates = this.state.recordRideCollection.features.reduce((list, feature) => {
                                    list.push(...feature.geometry.coordinates);
                                    return list;
                                }, [])
                                // const newBounds = turfBBox({ coordinates:coordinates, type: 'LineString' });
                                this._mapView.fitBounds(coordinates[0], coordinates[coordinates.length - 1], 40, 1000);
                            } 
                            else if (this.state.coords.length > 0) {
                                setTimeout(() => this._mapView.moveTo(this.state.coords[this.state.coords.length - 1], 0), 500);
                            }
                        }
                    } else if (updatedState.markerCollection && updatedState.markerCollection.features.length > 1) {
                        // DOC: Fetch route for build ride if waypoints are more than one
                        if (this.prevCoordsStr !== currentCoordsStr && currentCoordsStr) {
                            this.prevCoordsStr = currentCoordsStr;
                            this.fetchDirections();
                        }
                    }
                    // DOC: Fly to the single point of the build/recorded ride
                    if (!ride.isRecorded && updatedState.markerCollection && updatedState.markerCollection.features.length === 1) {
                        setTimeout(() => this._mapView.moveTo(updatedState.markerCollection.features[0].geometry.coordinates, 0), 500);
                    }
                })
            } else {
                if (!ride.isRecorded) {
                    this.initializeEmptyRide(updatedState);
                    if (ride.source) {
                        const sourceMarker = this.createMarkerFeature([ride.source.lng, ride.source.lat],
                            this.state.activeMarkerIndex === -1
                                ? ICON_NAMES.SOURCE_DEFAULT
                                : this.state.markerCollection.features[this.state.activeMarkerIndex].id === [ride.source.lng, ride.source.lat].join('')
                                    ? ICON_NAMES.SOURCE_SELECTED
                                    : ICON_NAMES.SOURCE_DEFAULT);
                        updatedState.markerCollection.features = [sourceMarker];
                        currentCoordsStr += ride.source.lng + ride.source.lat;
                    }

                    if (ride.waypoints.length > 0) {
                        updatedState.markerCollection.features = ride.waypoints.reduce((arr, loc, idx) => {
                            idx++;
                            arr.push(this.createMarkerFeature([loc.lng, loc.lat],
                                this.state.activeMarkerIndex === -1
                                    ? ICON_NAMES.WAYPOINT_DEFAULT
                                    : this.state.markerCollection.features[this.state.activeMarkerIndex].id === [loc.lng, loc.lat].join('')
                                        ? ICON_NAMES.WAYPOINT_SELECTED
                                        : ICON_NAMES.WAYPOINT_DEFAULT, idx));
                            currentCoordsStr += loc.lng + loc.lat;
                            return arr;
                        }, updatedState.markerCollection.features);
                    }

                    if (ride.destination) {
                        const destinationMarker = this.createMarkerFeature([ride.destination.lng, ride.destination.lat],
                            this.state.activeMarkerIndex === -1
                                ? ICON_NAMES.DESTINATION_DEFAULT
                                : this.state.markerCollection.features[this.state.activeMarkerIndex].id === [ride.destination.lng, ride.destination.lat].join('')
                                    ? ICON_NAMES.DESTINATION_SELECTED
                                    : ICON_NAMES.DESTINATION_DEFAULT);
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
                        this.replaceRideApiForCreatedRide(ride.rideId, body)
                        this.hasModifiedRide = true;
                    }
                    this.setState(updatedState, () => {
                        if (ride.rideId === null) {
                            this.onPressRecenterMap();
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
                        }
                    })
                }
            }
        }

        // if (prevProps.ride.rideId !== this.props.ride.rideId) {
        //     this.initializingRide();
        // }
        // else {
        //     this.updateRideOnMap(prevProps, prevState);
        // }

        // if (prevProps.ride.rideId && !this.props.ride.rideId) {
        // this.setState({ coords: [], recordRideMarker: null})
        // this.closeRidePressed = false;
        // this.hasModifiedRide = false;
        // this.hasManualSnapshot = false;
        // this.locationProximity = null;
        // if (this.props.user.locationEnable) this.startTrackingLocation();
        // }
        if (this.props.ride.isRecorded && (prevState.checkingAppState === 'background' && this.state.checkingAppState === 'foreground')) {
            setTimeout(() => this._mapView.moveTo(this.state.currentLocation.location, 0), 500);
        }
       
        if (this.state.showCreateRide === false && this.props.showCreateRide && prevProps.showCreateRide !== this.props.showCreateRide) {
            this.createRide();
        }
        if (this.state.showRecordRideButtons === false && this.props.showRecordRide && prevProps.showRecordRide !== this.props.showRecordRide) {
            this.onPressRecordRide();
        }
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
                // console.log('\n\n\n closeRidePressed didUpdate called')
                // this.closeRidePressed = false;
                // this.onPressCloseRide();
            }
        }
        if (prevProps.hasNetwork === true && this.props.hasNetwork === false) {
            console.log("Network connection lost");

            Toast.show({ text: 'Network connection lost', position: 'bottom', duration: 0, style: { height: APP_COMMON_STYLES.headerHeight } });

            // DOC: Show specific alert, if user is planning ride
            this.setState({ isEditableMap: false }, () => {
                if (!this.props.ride.isRecorded && (this.props.ride.userId === this.props.user.userId)) {
                    Alert.alert('Network connection lost', 'Your changes will not save. Please try after connecting to internet')
                }
            });

            // DOC: Remove location updation polling
            if (this.locationPollInterval !== null) this.stopUpdatingLocation();
        }

        /// for ride recorded when there was no network
        if (prevProps.hasNetwork === false && this.props.hasNetwork === true) {
            console.log('internet connected ');
            this.setState({ isEditableMap: true});
            Toast.hide();
            const keys = await AsyncStorage.getAllKeys();
            const unSyncedAllRide = keys.filter(key => key.indexOf(UNSYNCED_RIDE) === 0)
            console.log('\n\n\n unSyncedAllRide : ', unSyncedAllRide)
            if (unSyncedAllRide.length > 0) {
                unSyncedAllRide.map(async item => {
                    console.log('\n\n\n item.indexOf(this.props.ride.rideId) : ', this.props.ride , this.props.ride.rideId , (item.indexOf(this.props.ride.rideId) > -1))
                    if (this.props.ride && this.props.ride.rideId && (item.indexOf(this.props.ride.rideId) > -1)) {
                        console.log('\n\n\n unsynced if : ', item)
                        if(this.state.showLoader){
                            this.setState({showLoader:false})
                        }
                        return;
                    }
                    else {
                        console.log('\n\n\n unsynced else : ', item)
                        const unSyncedRide = await AsyncStorage.getItem(item);
                        if (unSyncedRide) {
                            const unSyncedRideData = JSON.parse(unSyncedRide);
                            console.log('unSyncedRideData.unsyncedPoints.length',unSyncedRideData)
                            if( unSyncedRideData.unsyncedPoints[unSyncedRideData.unsyncedPoints.length - 1].status === RECORD_RIDE_STATUS.COMPLETED){
                                if(this.state.showLoader){
                                    this.setState({showLoader:false})
                                }
                            }
                            if (unSyncedRideData.unsyncedPoints.length > 0) {
                                AsyncStorage.removeItem(unSyncedAllRide[0]).then(() => {
                                    this.props.deleteUnsyncedRide(unSyncedRideData.ride.rideId);
                                    // this.hasModifiedRide = true;
                                }).catch(er => {
                                    console.log(er);
                                });
                                this.syncCoordinatesWithServer(unSyncedRideData.mapSnapshot, unSyncedRideData.ride, unSyncedRideData.unsyncedPoints[unSyncedRideData.unsyncedPoints.length - 1].status, unSyncedRideData.unsyncedPoints, true,unSyncedRideData.recordRideDetails);

                            }
                        }else{
                            if(this.state.showLoader){
                                this.setState({showLoader:false})
                            }
                        }
                    }
                })

            }


            // this.retryApiFunc();

            // DOC: Restart location updation polling
            if (this.state.friendsLocationCollection.features.length > 0 && this.locationPollInterval === null) this.startUpdatingLocation();
        }
        if (prevProps.user.locationEnable !== this.props.user.locationEnable) {
            this.props.user.locationEnable
                ? this.startTrackingLocation()
                : this.stopTrackingLocation();
        }
        if ((prevProps.friendsLocationList !== this.props.friendsLocationList) && Object.keys(this.props.friendsLocationList).length > 1) {
            let features = [...this.state.friendsLocationCollection.features];
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
                        if (!features[idx].properties.groupIds || Object.keys(features[idx].properties.groupIds).length === 0)
                            features = [...features.slice(0, idx), ...features.slice(idx + 1)];
                    } else {
                        if (features[idx].properties.isVisible === false && this.lastShownFriendLoc !== `${locInfo.lng}_SPLIT_${locInfo.lat}`) {
                            this.lastShownFriendLoc = `${locInfo.lng}_SPLIT_${locInfo.lat}`;
                        }
                        features[idx].properties.isVisible = true;
                        features[idx].geometry.coordinates = [locInfo.lng, locInfo.lat];
                    }
                } else {
                    if (locInfo.isVisible === true && this.lastShownFriendLoc !== `${locInfo.lng}_SPLIT_${locInfo.lat}`) {
                        this.lastShownFriendLoc = `${locInfo.lng}_SPLIT_${locInfo.lat}`;
                    }
                    features.push(this.createFriendsLocationMarker(locInfo));
                }
            });
            const cluster = new Supercluster({ radius: 40, maxZoom: 20 });
            cluster.load(features);
            this.setState({
                friendsLocationCollection: {
                    ...prevState.friendsLocationCollection,
                    features: features,
                },
                superCluster: cluster
                // friendsImage: friendsImage
            }, () => {
                if (features.length === 0) {
                    this.lastShownFriendLoc = null;
                    this.stopUpdatingLocation();
                } else if (this.locationPollInterval === null) {
                    this.startUpdatingLocation();
                }
                this.updateClusters();
                if (this.lastShownFriendLoc) {
                    const location = this.lastShownFriendLoc.split('_SPLIT_');
                    location[0] = parseFloat(location[0]);
                    location[1] = parseFloat(location[1]);
                    this.onPressRecenterMap(location);
                }
            });
        }
        if ((prevProps.membersLocationList !== this.props.membersLocationList) && Object.keys(this.props.membersLocationList).length > 1) {
            let features = [...this.state.friendsLocationCollection.features];
            Object.keys(this.props.membersLocationList).forEach(k => {
                if (k === 'activeLength') return;
                this.props.membersLocationList[k].members.forEach(locInfo => {
                    const idx = features.findIndex(oldF => oldF.id === locInfo.id);
                    if (idx > -1) {
                        if (locInfo.isVisible === false) {
                            const { [k]: deletedGroupId, ...otherGroupIds } = features[idx].properties.groupIds;
                            features[idx].properties.groupIds = otherGroupIds;
                            if (Object.keys(otherGroupIds).length === 0 && (!this.props.friendsLocationList[locInfo.id] || !this.props.friendsLocationList[locInfo.id].isVisible))
                                features = [...features.slice(0, idx), ...features.slice(idx + 1)];
                        } else {
                            if (features[idx].properties.isVisible === false && this.lastShownFriendLoc !== `${locInfo.lng}_SPLIT_${locInfo.lat}`) {
                                this.lastShownFriendLoc = `${locInfo.lng}_SPLIT_${locInfo.lat}`;
                            }
                            features[idx].properties.isVisible = true;
                            features[idx].geometry.coordinates = [locInfo.lng, locInfo.lat];
                            features[idx].properties.groupIds = { ...features[idx].properties.groupIds, [k]: true };
                        }
                    } else {
                        if (locInfo.isVisible === true && this.lastShownFriendLoc !== `${locInfo.lng}_SPLIT_${locInfo.lat}`) {
                            this.lastShownFriendLoc = `${locInfo.lng}_SPLIT_${locInfo.lat}`;
                        }
                        features.push(this.createFriendsLocationMarker(locInfo, k));
                    }
                });
            });
            const cluster = new Supercluster({ radius: 40, maxZoom: 20 });
            cluster.load(features);
            this.setState({
                friendsLocationCollection: {
                    ...prevState.friendsLocationCollection,
                    features: features,
                },
                superCluster: cluster
            }, () => {
                if (features.length === 0) {
                    this.lastShownFriendLoc = null;
                    this.stopUpdatingLocation();
                } else if (this.locationPollInterval === null) {
                    this.startUpdatingLocation();
                }
                this.updateClusters();
                if (this.lastShownFriendLoc) {
                    const location = this.lastShownFriendLoc.split('_SPLIT_');
                    location[0] = parseFloat(location[0]);
                    location[1] = parseFloat(location[1]);
                    this.onPressRecenterMap(location);
                }
            });
        }
        const prevRide = prevProps.ride;
        const newRide = this.props.ride;
        if (prevRide !== newRide && newRide.isRecorded === false && (prevRide.rideId === null || (prevRide.rideId === newRide.rideId))) {
            if (prevRide.source !== newRide.source) {
                if (prevRide.source === null) {
                    console.log("source added");
                    if (newRide.source && !newRide.source.name) {
                        // this.updateRideOnMap(prevProps, prevState);
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
                    // this.updateRideOnMap(prevProps, prevState);
                    this.getPlaceNameByReverseGeocode([newRide.source.lng, newRide.source.lat],
                        (locationName) => locationName && this.props.updateSourceOrDestination(RIDE_POINT.SOURCE, locationName),
                        (err) => {
                            console.log("Reverse geocoding error for source: ", err);
                        }
                    );
                } else {
                    // this.updateRideOnMap(prevProps, prevState);
                    console.log("source name changed from: ", prevRide.source.name);
                    console.log("to: ", newRide.source.name);
                }
            }
            if (prevRide.destination !== newRide.destination) {
                if (prevRide.destination === null) {
                    if (newRide.destination && !newRide.destination.name) {
                        // this.updateRideOnMap(prevProps, prevState);
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
                    // this.updateRideOnMap(prevProps, prevState);
                    this.getPlaceNameByReverseGeocode([newRide.destination.lng, newRide.destination.lat],
                        (locationName) => locationName && this.props.updateSourceOrDestination(RIDE_POINT.DESTINATION, locationName),
                        (err) => {
                            console.log("Reverse geocoding error for destination: ", err);
                        }
                    );
                } else {
                    // this.updateRideOnMap(prevProps, prevState);
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
                            // this.updateRideOnMap(prevProps, prevState);
                            return;
                        }
                        if (idx !== index) {
                            console.log("reordered waypoint: ", point);
                            // this.updateRideOnMap(prevProps, prevState);
                            this.setState(prevState => ({ rideUpdateCount: prevState.rideUpdateCount + 1 }));
                        }
                    });
                } else if (prevRide.waypoints.length > newRide.waypoints.length) {
                    console.log("Inside waypoints checking - waypoint removed");
                    prevRide.waypoints.some((point, index) => {
                        const hasPoint = newRide.waypoints.some(wpoint => point.lng + '' + point.lat === wpoint.lng + '' + wpoint.lat);
                        if (!hasPoint) {
                            // this.updateRideOnMap(prevProps, prevState);
                            console.log("removed waypoint: ", point);
                        }
                    });
                } else if (prevRide.waypoints.length < newRide.waypoints.length) {
                    console.log("Inside waypoints checking - waypoint added");
                    newRide.waypoints.forEach((point, index) => {
                        const hasPoint = prevRide.waypoints.some(wpoint => point.lng + '' + point.lat === wpoint.lng + '' + wpoint.lat);
                        if (!hasPoint) {
                            // this.updateRideOnMap(prevProps, prevState);
                            console.log('\n\n\n waypoint added : ', point)
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
            if (Actions.currentScene === this.props.lastApi.currentScene && this.props.lastApi.withoutDispatch === false) {
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
        if (prevProps.currentScreen.name !== this.props.currentScreen.name) {
            if (prevProps.currentScreen.name === PageKeys.MAP) {
                this.locationPollInterval !== null && this.stopUpdatingLocation();
            } else if (this.props.currentScreen.name === PageKeys.MAP) {
                if (this.state.friendsLocationCollection.features.length > 0 && this.locationPollInterval === null) this.startUpdatingLocation();
            }
        }

        if (prevProps.currentScreen !== this.props.currentScreen) {
            if (this.props.currentScreen.name !== Actions.currentScene) {
                if (Actions.prevState.routes.length > 1) {
                    if (Actions.prevState.routes.findIndex(route => route.routeName === this.props.currentScreen.name) > -1) {
                        Actions.popTo(this.props.currentScreen.name, this.props.currentScreen.params);
                        setTimeout(() => Actions.refresh(this.props.currentScreen.params), 0);
                    } else {
                        this.props.currentScreen.params && this.props.currentScreen.params.comingFrom
                            ? Actions.push(this.props.currentScreen.name, this.props.currentScreen.params)
                            : Actions.replace(this.props.currentScreen.name, this.props.currentScreen.params);
                    }
                } else {
                    if (this.props.currentScreen.name !== this.rootScreen) {
                        Actions.push(this.props.currentScreen.name, this.props.currentScreen.params)
                    } else {
                        Actions.popTo(this.props.currentScreen.name, this.props.currentScreen.params);
                        setTimeout(() => Actions.refresh(this.props.currentScreen.params), 0);
                    }
                }
            } else if (this.props.currentScreen.params && (prevProps.currentScreen.params !== this.props.currentScreen.params)) {
                Actions.refresh(this.props.currentScreen.params);
            }
        }
    }


    initializingRide = () => {
        const { ride } = this.props;
        if (this.props.ride.ride === null) {
            this.initializeEmptyRide({});
            this.setState({ rideUpdateCount: 0, activeMarkerIndex: -1 });
            this.closeRidePressed = false;
            this.hasModifiedRide = false;
            this.hasManualSnapshot = false;
            this.locationProximity = null;
            this.prevCoordsStr = '';
            return;
        }
        this.initializeEmptyRide({});
        this.setState({ rideUpdateCount: 0, activeMarkerIndex: -1 });
        this.closeRidePressed = false;
        if (ride.userId === this.props.user.userId) {
            this.setState({ isEditableRide: true });
        } else {
            this.setState({ isEditableRide: false });
        }
        this.hasModifiedRide = false;
        this.hasManualSnapshot = false;
        this.locationProximity = null;
        if (ride.rideId === null) this.prevCoordsStr = '';
        if (ride.isRecorded) {
            if (ride.status === RECORD_RIDE_STATUS.COMPLETED) {
                const tempList = [];
                let updateMarker = this.state.recordRideMarker;
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
                    updateMarker = [{ location: [ride.source.lng, ride.source.lat], name: '', markerType: 'source' }]
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
                    updateMarker = [...updateMarker, { location: [ride.destination.lng, ride.destination.lat], name: '', markerType: 'destination' }]
                }
                this.setState({
                    recordRideCollection: {
                        type: 'FeatureCollection',
                        features: tempList
                    },
                    recordRideMarker: updateMarker
                });
                this._mapView.fitBounds([ride.source.lng, ride.source.lat], [ride.destination.lng, ride.destination.lat], 30)
            }
            else {
                if (this.props.ride.status === RECORD_RIDE_STATUS.PAUSED) {
                    let updateMarker = this.state.recordRideMarker;
                    let collection = [];
                    if (ride.source) {
                        collection.push([ride.source.lng, ride.source.lat]);
                        updateMarker = [{ location: [ride.source.lng, ride.source.lat], name: '', markerType: 'source' }]
                    }
                    if (ride.trackpoints) {
                        ride.trackpoints.forEach(trackpoint => collection.push([trackpoint.lng, trackpoint.lat]));
                        this._mapView.moveTo([ride.trackpoints[ride.trackpoints.length - 1].lng, ride.trackpoints[ride.trackpoints.length - 1].lat])
                    }
                    if (ride.destination) {
                        collection.push([ride.destination.lng, ride.destination.lat]);
                    }
                    this.setState({ coords: collection, recordRideMarker: updateMarker });
                }
            }
        }
        else {
            let updateMarker = null;
            if (ride.rideId) {
                if (ride.source) {
                    const sourceMarker = this.createMarkerFeature([ride.source.lng, ride.source.lat], ICON_NAMES.SOURCE_DEFAULT);
                    updateMarker = [sourceMarker];
                    this.currentCoordsStr += ride.source.lng + ride.source.lat;
                    if (ride.waypoints.length === 0 && !ride.destination) {
                        this.locationProximity = [ride.source.lng, ride.source.lat];
                    }
                }

                if (ride.waypoints.length > 0) {
                    let idx = 1;
                    updateMarker = ride.waypoints.reduce((arr, loc) => {
                        arr.push(this.createMarkerFeature([loc.lng, loc.lat], ICON_NAMES.WAYPOINT_DEFAULT, idx));
                        this.currentCoordsStr += loc.lng + loc.lat;
                        idx++;
                        return arr;
                    }, [...updateMarker]);
                }

                if (ride.destination) {
                    const destinationMarker = this.createMarkerFeature([ride.destination.lng, ride.destination.lat], ICON_NAMES.DESTINATION_DEFAULT);
                    updateMarker = [...updateMarker, destinationMarker];
                    this.currentCoordsStr += ride.destination.lng + ride.destination.lat;
                }
                this.setState({
                    markerCollection: {
                        ...this.state.markerCollection,
                        features: updateMarker
                    }
                })
            }
        }
    }

    updateRideOnMap = (prevProps, prevState) => {
        const { ride } = this.props;
        let updatedState = {
            markerCollection: {
                ...this.state.markerCollection,
                features: []
            },
        };
        this.setState({
            markerCollection: {
                ...this.state.markerCollection,
                features: []
            }
        }, () => {
            if (ride.source) {
                const sourceMarker = this.createMarkerFeature([ride.source.lng, ride.source.lat],
                    this.state.activeMarkerIndex === -1
                        ? ICON_NAMES.SOURCE_DEFAULT
                        : this.state.markerCollection.features[this.state.activeMarkerIndex].id === [ride.source.lng, ride.source.lat].join('')
                            ? ICON_NAMES.SOURCE_SELECTED
                            : ICON_NAMES.SOURCE_DEFAULT);
                updatedState.markerCollection.features = [sourceMarker];
                this.currentCoordsStr += ride.source.lng + ride.source.lat;
            }

            if (ride.waypoints.length > 0) {
                updatedState.markerCollection.features = ride.waypoints.reduce((arr, loc, idx) => {
                    idx++;
                    arr.push(this.createMarkerFeature([loc.lng, loc.lat],
                        this.state.activeMarkerIndex === -1
                            ? ICON_NAMES.WAYPOINT_DEFAULT
                            : this.state.markerCollection.features[this.state.activeMarkerIndex].id === [loc.lng, loc.lat].join('')
                                ? ICON_NAMES.WAYPOINT_SELECTED
                                : ICON_NAMES.WAYPOINT_DEFAULT, idx));
                    this.currentCoordsStr += loc.lng + loc.lat;
                    return arr;
                }, updatedState.markerCollection.features);
            }

            if (ride.destination) {
                const destinationMarker = this.createMarkerFeature([ride.destination.lng, ride.destination.lat],
                    this.state.activeMarkerIndex === -1
                        ? ICON_NAMES.DESTINATION_DEFAULT
                        : this.state.markerCollection.features[this.state.activeMarkerIndex].id === [ride.destination.lng, ride.destination.lat].join('')
                            ? ICON_NAMES.DESTINATION_SELECTED
                            : ICON_NAMES.DESTINATION_DEFAULT);
                updatedState.markerCollection.features = [...updatedState.markerCollection.features, destinationMarker];
                this.currentCoordsStr += ride.destination.lng + ride.destination.lat;
            }

            if (this.prevCoordsStr === this.currentCoordsStr && this.currentCoordsStr) {
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
                this.replaceRideApiForCreatedRide(ride.rideId, body)
                this.hasModifiedRide = true;
            }
            this.setState(prevState => updatedState, () => {
                if (updatedState.markerCollection && updatedState.markerCollection.features.length > 1) {
                    if (this.prevCoordsStr !== this.currentCoordsStr && this.currentCoordsStr) {
                        this.prevCoordsStr = this.currentCoordsStr;
                        this.fetchDirections();
                    }
                }
            })

        })

    }


    retryApiFunc = () => {
        if (this.props.lastApi && this.props.lastApi.currentScene === Actions.currentScene) {
            if (this.props.lastApi.api.name === 'getPictureList' || this.props.lastApi.api.name === 'getGarageInfo' || this.props.lastApi.api.name === 'getRidePictureList' || this.props.lastApi.api.name === 'getPicture') {
                this.props.retryLastApiWithoutDispatch(this.props.lastApi.api, this.props.lastApi.params)
            }
            else if (this.props.lastApi.withoutDispatch) {
                this.props.retryLastApiWithoutDispatch(this.props.lastApi.api, this.props.lastApi.params)
            }
            else {
                this.props.retryLastApi(this.props.lastApi.api, this.props.lastApi.params);
            }
        }
    }

    startUpdatingLocation() {
        this.locationPollInterval = setInterval(() => {
            const { features } = this.state.friendsLocationCollection;
            if (features.length > 0) {
                const friendsIdList = new Set();
                const groupIdList = new Set();
                features.forEach(feature => {
                    if (this.props.friendsLocationList[feature.id] !== undefined && this.props.friendsLocationList[feature.id].isVisible) friendsIdList.add(feature.id);
                    if (Object.keys(feature.properties.groupIds || {}).length > 0) groupIdList.add(...Object.keys(feature.properties.groupIds));
                });
                let ids = null;
                if (friendsIdList.size > 0) ids = { ...ids, friendsIdList: [...friendsIdList] };
                if (groupIdList.size > 0) ids = { ...ids, groupIdList: [...groupIdList] };
                if (ids === null) return;
                this.props.getAllMembersAndFriendsLocationList(this.props.user.userId, ids);
            }
        }, APP_CONFIGS.locationUpdateInterval);
    }

    stopUpdatingLocation() {
        clearInterval(this.locationPollInterval);
        this.locationPollInterval = null;
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

    onCloseAppNavMenu = () => this.props.hideAppNavMenu();

    onPressAppNavMenu = ({ screenKey, params = {} }) => {
        if (this.state.rideUpdateCount > 0 && screenKey !== PageKeys.Map) {
            if (this.state.rideUpdateCount > 0 || this.hasModifiedRide) {
                const { ride } = this.props;
                let hasSnapshotResponse = false;
                this.setState({ showLoader: true }, () => {
                    const body = {};
                    if (ride.source) body.source = ride.source;
                    if (ride.destination) body.destination = ride.destination;
                    if (ride.waypoints) body.waypoints = ride.waypoints;
                    if (this.state.directions) {
                        body.totalDistance = this.state.directions.distance;
                        body.totalTime = this.state.directions.duration;
                    }
                    if (this.hasManualSnapshot === false) {
                        this.getMapSnapshot((mapSnapshot = null) => {
                            if (hasSnapshotResponse === true) return;
                            hasSnapshotResponse = true;
                            this.setState({ showLoader: false });
                            if (mapSnapshot) {
                                body.snapshot = { mimeType: 'image/jpeg', picture: mapSnapshot };
                                Toast.show({ text: 'Updating ride... We will let you know once it is completed' });
                            }
                            replaceRide(ride.rideId, body,
                                undefined, undefined,
                                mapSnapshot !== null);
                            if (this.state.activeMarkerIndex !== -1) this.onCloseOptionsBar(true);
                        }, (er) => {
                            console.log(er);
                            replaceRide(ride.rideId, body,
                                () => this.setState({ showLoader: false }),
                                () => this.setState({ showLoader: false }));
                            if (this.state.activeMarkerIndex !== -1) this.onCloseOptionsBar(true);
                        });
                    } else {
                        replaceRide(ride.rideId, body,
                            () => this.setState({ showLoader: false }),
                            () => this.setState({ showLoader: false }));
                        if (this.state.activeMarkerIndex !== -1) this.onCloseOptionsBar(true);
                    }
                });
            }
        }
        // DOC: Remove cached friends profiles
        this.props.resetPersonProfile();
        this.props.removeTempLocation();
        this.props.removeTempMembersLocation();
        this.props.changeScreen({ name: screenKey, params: { ...params } });
    }

    async componentDidMount() {
        
        console.log('\n\n\n\n didMount',this.props.user)

        //***** for clearing all the last ride if app was killed while ride was recording. *****/
        axios.put(RIDE_BASE_URL+`completeRunningRide?userId=${this.props.user.userId}`).then(res=>{
            console.log(res.data+'//////success close unfinished ride')
        }).catch(err=>{
            console.log(err.message+'//////error close unfinished ride')
        })

        //** getting the garage detail to check for bike list before going to record a ride */
        this.props.getGarageInfo(this.props.user.userId);

        this.props.getAllNotifications(this.props.user.userId, 0, new Date().toISOString(), 'map', (res) => {
        }, (err) => {
        });
        if (this.props.spaceList === null) {
            getSpaces(this.props.user.userId, (bikeList) => {
                console.log(bikeList,'//////bike spaces')
                // this.setState({ bikeList }, () => {
                // });
            }, (er) => console.log(er));
        }
        BackgroundGeolocation.onHeartbeat(this.onHeartbeat, this.onError);
        BackgroundGeolocation.onLocation(this.onLocation, this.onError);
        BackgroundGeolocation.ready({
            autoSync: false,
            logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
            reset: false,
            foregroundService: true,
            desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_NAVIGATION,
            distanceFilter: 10,
            startOnBoot: true,
            stopOnTerminate: false,
            heartbeatInterval: 60,
            locationAuthorizationRequest: 'Any'
        }, (state) => {
            console.log("- BackgroundGeolocation is configured and ready: ", state.enabled);

            // DOC: Start location tracking only if user has enabled location sharing
            console.log('\n\n\n !state.enabled && this.props.user.locationEnable : ', !state.enabled)
            if (!state.enabled && this.props.user.locationEnable) {

                this.startTrackingLocation();
            }
        });
        this.props.updateAppState('foreground');
        const friendsIds = await AsyncStorage.getItem('friendIds');
        if (friendsIds && JSON.parse(friendsIds).length > 0) {
            this.props.getFriendsLocationList(this.props.user.userId, JSON.parse(friendsIds), false)
        }
        const lastPoint = await AsyncStorage.getItem('lastLocation');
        if (lastPoint) {
            this.setState({ defaultCenterCoords: JSON.parse(lastPoint) })
        }
        // DOC: Get all post types:
        this.props.getPostTypes();
        this.unregisterNetworkListener = NetInfo.addEventListener(this.handleNetworkConnectivityChange);
        if (this.props.user.isNewUser) {
            this.props.changeScreen({ name: PageKeys.PROFILE, params: { tabProps: { activeTab: 0 } } });
        }

        PushNotification.popInitialNotification((notification) => {
            console.log(notification,'cold start notification')
            
            if (notification) {
                if (IS_ANDROID) {
                    if (notification.userInteraction) {
                        this.handleNotificationTapOnKilledState(notification);
                    }
                } else {
                    PushNotificationIOS.getDeliveredNotifications((notifications = []) => {
                        if (notifications.length === 0) {
                            this.handleNotificationTapOnKilledState(notification);
                        } else if (!notifications.some(notif => notif.userInfo && notif.userInfo['gcm.message_id'] === notification.data['gcm.message_id'])) {
                            this.handleNotificationTapOnKilledState(notification);
                        }
                    });
                }
            }
        });

        this.props.publishEvent({ eventName: APP_EVENT_NAME.USER_EVENT, eventType: APP_EVENT_TYPE.ACTIVE, eventParam: { isLoggedIn: true, userId: this.props.user.userId, deviceId: await DeviceInfo.getUniqueId() } });
        this.props.getAllChats(this.props.user.userId);
        AppState.addEventListener('change', this.handleAppStateChange);
        BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPress);
        this.props.getUserProfilePicture(this.props.user.profilePictureId);
        const keys = await AsyncStorage.getAllKeys();
        const unSyncedAllRide = keys.filter(key => key.indexOf(UNSYNCED_RIDE) === 0)
        console.log('\n\n\n unSyncedAllRide : ', unSyncedAllRide)
        if (unSyncedAllRide.length > 0) {
            unSyncedAllRide.map(async item => {
                console.log('\n\n\n item.indexOf(this.props.ride.rideId) : ', this.props.ride && this.props.ride.ride && (item.indexOf(this.props.ride.rideId) > -1))
                if (this.props.ride && this.props.ride.rideId && (item.indexOf(this.props.ride.rideId) > -1)) {
                    console.log('\n\n\n unsynced if : ', item)
                    return;
                }
                else {
                    const unSyncedRide = await AsyncStorage.getItem(item);
                    if (unSyncedRide) {
                        const unSyncedRideData = JSON.parse(unSyncedRide);
                        if (unSyncedRideData.unsyncedPoints.length > 0) {
                            AsyncStorage.removeItem(unSyncedAllRide[0]).then(() => {
                                this.props.deleteUnsyncedRide(unSyncedRideData.ride.rideId);
                                // this.hasModifiedRide = true;
                            }).catch(er => {
                                console.log(er);
                            });
                            this.syncCoordinatesWithServer(unSyncedRideData.mapSnapshot, unSyncedRideData.ride, unSyncedRideData.unsyncedPoints[unSyncedRideData.unsyncedPoints.length - 1].status, unSyncedRideData.unsyncedPoints, true);
                        }
                    }
                }
            })

        }
    }

    handleNotificationTapOnKilledState(notification) {
        if (typeof notification.data.reference === "string") {
            notificationData = { ...notification.data, reference: JSON.parse(notification.data.reference) }
        }
        this.redirectToTargetScreen(notificationData);
    }

    onHeartbeat = (event) => {
        console.log('called heart beat')
        // DOC: Fetching new location
        BackgroundGeolocation.getCurrentPosition({ samples: 1, persist: true }).then((location) => {
            // if (this.state.isEditableRide && this.props.ride.status === RECORD_RIDE_STATUS.RUNNING && this.props.ride.isRecorded) {
            //     if (this.state.currentLocation === null || this.state.currentLocation.location.join('') != (location.coords.longitude + '' + location.coords.latitude)) {
            //         this.updateRecordRideCoordinate(location.coords, this.props.ride.status);
            //     }
            // }
            if (this.state.isEditableRide && this.state.coords.length > 0) {
                this.updateRecordRideCoordinate(location, this.props.ride.status);
            }
        });
    }

    onLocation = (location) => {
        console.log('on change location',location)
        // location.coords.heading
        // location.coords.accuracy
        // location.coords.speed
        // location.is_moving
        // location.battery: { is_charging, level }
        const lastFetchTime = new Date(location.timestamp).getTime();
        console.log('\n\n\n updateLocation onLocation before if')
        if (this.props.user.locationEnable && lastFetchTime - this.prevUserTrackTime > (this.props.user.timeIntervalInSeconds * 1000)) {
            this.prevUserTrackTime = lastFetchTime;
            if (!this.props.ride || this.props.ride.status !== RECORD_RIDE_STATUS.RUNNING) {
                this.setState({ currentLocation: { location: [location.coords.longitude, location.coords.latitude], name: '' } });
            }
            console.log('\n\n\n updateLocation onLocation in if')
            this.props.updateLocation(this.props.user.userId, { lat: location.coords.latitude, lng: location.coords.longitude });
        }
        if (this.state.isEditableRide && this.state.coords.length > 0) {
            this.updateRecordRideCoordinate(location, this.props.ride.status);
        }
    }

    onError = (error) => {
        console.warn('[location] ERROR -', error);
    }


    handleNetworkConnectivityChange =async (connectionInfo) => {
        if ((connectionInfo.type === 'wifi' || connectionInfo.type === 'cellular') && connectionInfo.isInternetReachable) {
            const keys = await AsyncStorage.getAllKeys();
            const unSyncedAllRide = keys.filter(key => key.indexOf(UNSYNCED_RIDE) === 0)
            if(unSyncedAllRide.length>0){
                this.setState({showLoader:true})
            }
            this.props.toggleNetworkStatus(true);
        } else if (connectionInfo.isInternetReachable === false) {
            this.props.toggleNetworkStatus(false);
        }
    }

    redirectToTargetScreen = (notificationData) => {
        console.log('\n\n\n redirectToTargetScreen on Mpa : ', notificationData)
        const targetScreen = notificationData.reference.targetScreen;
        if (Object.keys(PageKeys).indexOf(targetScreen) === -1) {
            if (targetScreen === 'REQUESTS') {
                store.dispatch(screenChangeAction({ name: PageKeys.NOTIFICATIONS, params: { comingFrom: PageKeys.NOTIFICATIONS, goTo: targetScreen, notificationBody: notificationData } }))
            }
            return;
        }
        if (targetScreen === "FRIENDS_PROFILE") {
            store.dispatch(resetPersonProfileAction({ comingFrom: PageKeys.NOTIFICATIONS }))
            store.dispatch(setCurrentFriendAction({ userId: notificationData.fromUserId }))
            store.dispatch(screenChangeAction({ name: PageKeys[targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: notificationData } }));
        }
        else if (targetScreen === "CHAT") {
            notificationData['isGroup'] = JSON.parse(notificationData.isGroup)
            store.dispatch(screenChangeAction({ name: PageKeys[targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, chatInfo: notificationData } }));
        }
        else if (targetScreen === "POST_DETAIL") {
            if (notificationData.notificationType === NOTIFICATION_TYPE.COMMENT || notificationData.notificationType === NOTIFICATION_TYPE.LIKE) {
                store.dispatch(screenChangeAction({ name: PageKeys[notificationData.reference.targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: notificationData, isEditable: true } }));
            }
            else {
                store.dispatch(screenChangeAction({ name: PageKeys[targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: notificationData, isEditable: true } }));
            }
        }
        else if (targetScreen === "RIDE_DETAILS") {
            if (notificationData.notificationType === NOTIFICATION_TYPE.COMMENT || notificationData.notificationType === NOTIFICATION_TYPE.LIKE) {
                store.dispatch(screenChangeAction({ name: PageKeys[notificationData.reference.targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: notificationData, isEditable: true } }));
            }
            else {
                store.dispatch(screenChangeAction({ name: PageKeys[targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: notificationData, isEditable: true } }));
            }
        }
        else {
            store.dispatch(screenChangeAction({ name: PageKeys[targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: notificationData } }));
        }

        if(targetScreen!== PageKeys.NOTIFICATIONS){
            console.log(notificationData,'//// notificationData')
            store.dispatch(readNotification(notificationData.notifiedUserId,notificationData.id))
        }

    }

    handleAppStateChange = (nextAppState) => {
        console.log(nextAppState)
        if (nextAppState === 'active') {
            if (this.state.friendsLocationCollection.features.length > 0 && this.locationPollInterval === null) this.startUpdatingLocation();
            this.props.updateAppState('foreground');
            this.setState({ checkingAppState: 'foreground' })
        } else {
            if (this.locationPollInterval !== null) this.stopUpdatingLocation();
            this.props.updateAppState('background');
            this.setState({ checkingAppState: 'background' })
            
        }
    }

    startTrackingLocation = () => {
        console.log('\n\n\n startTrackingLocation')
        BackgroundGeolocation.start().then(res => {
            console.log(res,'///// satrt tracking')
            this.setState({ bgLocationState: 'on' })
        });
    }

    stopTrackingLocation = () => {
        BackgroundGeolocation.stop().then(res => {
            // console.log(res,'geolocation stop')
            this.setState({ bgLocationState: 'off' })
        });
    }

    getCurrentLocation = async (recenterMap) => {
        BackgroundGeolocation.getCurrentPosition({
            samples: 1,
            persist: true
        }).then((location) => {
            this.setState({ currentLocation: { location: [location.coords.longitude, location.coords.latitude], name: '' }, }, () => {
                if (recenterMap) {
                    this._mapView.moveTo([location.coords.longitude, location.coords.latitude]);
                }
            });
        }).catch(error => {
            console.log(error.code, error.message);
        })
    }

     sliceIntoChunks(arr, chunkSize) {
        const res = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            if(i<25){
                const chunk = arr.slice(i, i + chunkSize);
                res.push(chunk);
            }else{
                const chunk = arr.slice(i-1, i + chunkSize - 1);
                res.push(chunk);
            }
        }
        return res;
    }

    getMultiRouteMatrixInfo = async (ride,unSyncedPoints, callback) => {
        let totalDistance=0
        let totalDuration=0
        if (ride.source && ride.destination) {
            console.log("Source or destination not found");
            typeof callback === 'function' && callback({ error: "Source or destination not found", distance: 0, duration: 0 });
            return;
        }
        try {
            let newList=[ride.source.lng+','+ride.source.lat+';',...unSyncedPoints.map(data=>{
                return data.loc.join()+';'
            })]
            if(ride.destination){
                newList.push(ride.destination.lng+','+ride.destination.lat)
            }
            console.log(newList,'//// new List')
            let coordsList=this.sliceIntoChunks(newList,25)
            console.log(coordsList,'//////coordList')
            coordsList.forEach(async value=>{
               let pathParam=value.join('').slice(0,-1)
               console.log(pathParam,'pathparam')
               const res = await axios.get(`https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${pathParam}?sources=0&destinations=${value.length-1}&annotations=distance,duration&access_token=${JS_SDK_ACCESS_TOKEN}`);

               if (res.data.code === "Ok") {
                   const { distances, durations } = res.data;
                   console.log("Matrix api success: ", res.data);
                   totalDistance+= distances[0][0]
                   totalDuration+=durations[0][0]
                } else {
                    console.log("Response is not Ok");
                    typeof callback === 'function' && callback({ error: "Response is not Ok", distance: 0, duration: 0 });
                }
            })
            
            typeof callback === 'function' && callback({ distance:totalDistance, duration: totalDuration });
            // const locPathParam = source.join() + ';' + destination.join();
        } catch (er) {
            console.log(`Something went wrong: ${er}`);
            typeof callback === 'function' && callback({ error: `Something went wrong: ${er}`, distance: 0, duration: 0 });
        }
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
        let locPathParam = gpsPoints.reduce((param, coords) => param + coords.join(',') + ';', "");
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
            //     trackpoints = matchings[0].geometry.coordinates.reduce((arr, coords, index) => {
            //         if (!gpsPointTimestamps[index] || (index === matchings[0].geometry.coordinates.length - 1 && gpsPointTimestamps[index + 1])) {
            //             const lastPoint = gpsPointTimestamps[gpsPointTimestamps.length - 1];
            //             arr.push(coords[1], coords[0], lastPoint.date, lastPoint.status);
            //         } else {
            //             arr.push(coords[1], coords[0], gpsPointTimestamps[index].date, gpsPointTimestamps[index].status);
            //         }
            //         return arr;
            //     }, []);
            // } else {
            //     trackpoints = [...actualPoints];
            // }
            //     // TODO: Return distance and duration from matching object (here matchings[0])
            const trackpoints = matchings[0].geometry.coordinates.reduce((arr, coords, index) => {
                if (!gpsPointTimestamps[index] || (index === matchings[0].geometry.coordinates.length - 1 && gpsPointTimestamps[index + 1])) {
                    const lastPoint = gpsPointTimestamps[gpsPointTimestamps.length - 1];
                    arr.push(coords[1], coords[0], lastPoint.heading, lastPoint.accuracy, lastPoint.speed, lastPoint.date, lastPoint.status);
                } else {
                    arr.push(coords[1], coords[0], gpsPointTimestamps[index].heading, gpsPointTimestamps[index].accuracy, gpsPointTimestamps[index].speed, gpsPointTimestamps[index].date, gpsPointTimestamps[index].status);
                }
                return arr;
            }, []);
            callback(res.data, actualPoints, trackpoints, matchings[0].distance);
        } catch (er) {
            console.log("matching error: ", er);
        }
    }

    async updateRecordRideCoordinate(onLocation, status) {
        if(this.state.startTrackingLocation === false) return;
        const location = [onLocation.coords.longitude, onLocation.coords.latitude];
        // DOC: Updating collection collection in the state
        this.gpsPoints.push({ loc: location, heading: onLocation.coords.heading, accuracy: onLocation.coords.accuracy, speed: onLocation.coords.speed, date: new Date().toISOString(), status });
        
        this.setState(prevState => ({
            coords: [...prevState.coords, location],
            currentLocation: { location, name: '' },
            odometer: onLocation.odometer,
        }), () => {
            // if(this.gpsPoints.length === APP_CONFIGS.trackpointCount){
            //     const newPoints = this.gpsPoints;
            //     this.gpsPoints=[];
            //     const oldPoints = await AsyncStorage.getItem('recordRide');
            //     AsyncStorage.setItem('recordRide',JSON.stringify([...JSON.parse(oldPoints),...newPoints]));
            // }
            // const currentZoomLevel = await this._mapView.getZoom();

            if (this.state.checkingAppState === 'foreground') {
                this._mapView.moveTo(location);
            }
            if (this.gpsPoints.length === APP_CONFIGS.trackpointCount) {
                const lastPoints = this.gpsPoints;
                this.gpsPoints = [];
                if (this.props.hasNetwork && !this.props.ride.unsynced) {
                    // DOC: Call road map api of mapbox
                    const actualPoints = lastPoints.reduce((list, item) => {
                        list.push(item.loc[1], item.loc[0], item.heading, item.accuracy, item.speed, item.date, item.status);
                        return list;
                    }, []);
                    const trackpoints = [...actualPoints];
                    this.getRouteMatrixInfo(lastPoints[0].loc, lastPoints[lastPoints.length - 1].loc, ({ error, distance, duration }) => {
                        console.log('\n\n\n addTrackPoint updateRecordRide')
                        this.props.addTrackpoints(true, actualPoints, trackpoints, distance, this.props.ride, this.props.user.userId, (res) => {
                        }, (er) => {
                            this.storeRideAfterServiceIsDown(undefined, this.props.ride, lastPoints,lastPoints[lastPoints.length - 1].status,this.timeCount);
                        });
                    });
                } else {
                    // DOC: Store points on device for syncing later
                    this.storePointsOnDevice(undefined,this.props.ride, lastPoints,null,this.timeCount);
                }
            }
        });
    }


    async storePointsOnDevice(mapSnapshot, ride, points, callback,timeCount) {
        
        console.log('\n\n\n Storing point on Device ',timeCount,this.state.odometer)
        const unSyncedRideStr = await AsyncStorage.getItem(`${UNSYNCED_RIDE}${this.props.ride.rideId}`);
        let unSyncedRide = unSyncedRideStr ? JSON.parse(unSyncedRideStr) : {};

        unSyncedRide.unsyncedPoints = unSyncedRide.unsyncedPoints ? [...unSyncedRide.unsyncedPoints, ...points] : [...points];
        let newRide={...ride,totalDistance:this.state.odometer,timeCount:timeCount}
        console.log(ride,'////ride')
        console.log('\n\n\n JSON.stringify({ride : this.props.ride, unsyncedPoints}) :  ', JSON.stringify({ ride: newRide, unsyncedPoints: unSyncedRide.unsyncedPoints }))
        AsyncStorage.setItem(`${UNSYNCED_RIDE}${this.props.ride.rideId}`, JSON.stringify({ ride: {...ride,totalDistance:this.state.odometer,timeCount:timeCount}, unsyncedPoints: unSyncedRide.unsyncedPoints, mapSnapshot })).then(() => {
            if (!this.props.ride.unsynced) {
                this.props.addUnsyncedRide(this.props.ride.rideId);
                this.props.updateRide({ unsynced: true });
            }
            typeof callback === 'function' && callback({ success: 'Stored ' + JSON.stringify(unSyncedRide.unsyncedPoints) });
        }).catch(error => typeof callback === 'function' && callback({ error }));
    }

    onBackButtonPress = () => {
        
        if (Actions.state.index !== 0) {
            if (Actions.currentScene === PageKeys.FRIENDS_PROFILE) {
                this.popToPrevProfile();
            }
            // else if (Actions.currentScene === PageKeys.PASSENGER_PROFILE) {
            //     console.log('\n\n\n Actions : ', Actions)
            //     console.log('\n\n\n Actions.currentScene : ', Actions.currentScene)
            //     Actions.refresh({ currentPassenger: null });
            // } 
            else {
                Actions.pop();
                this.props.changeScreen({ name: Actions.currentScene });
            }
            // this.stopTrackingRideTime()
            return true;
        } else {
            if (this.state.showCreateRide) {
                this.setState({ showCreateRide: false });
            } else if (this.state.onWaypointList) {
                this.hideWaypointList();
            }
            // this.stopTrackingRideTime()
            return true;
        }
    }

    popToPrevProfile() {
        Actions.pop();
        this.props.goToPrevProfile();
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
        this.locationPermission = IS_ANDROID
            ? await Permissions.check(Permissions.PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
            : await Permissions.check(Permissions.PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        if (!this.props.user.locationEnable) {
            if (this.locationPermission === RESULTS.DENIED) {
                this.locationPermission = IS_ANDROID
                    ? await Permissions.request(Permissions.PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
                    : await Permissions.request(Permissions.PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
            } else if (this.locationPermission === RESULTS.BLOCKED) {
                Alert.alert("Location permission is not enabled", `Accept 'Always' or 'While Using the App' location permission from settings`,
                    [{ text: 'OK', onPress: async () => await Permissions.openSettings() }]);
                // TODO: Cancel option and what to do if user cancels
            }
        }
        if (this.locationPermission === RESULTS.GRANTED) {
            this.getCurrentLocation(true);
        }
    }

    permissionToAccessLocation = async (requiredFor) => {
        if (requiredFor === 'recordRide'||requiredFor ==='findaRide') {
            if (IS_ANDROID) {
                setTimeout(() => Alert.alert("For Recording A Ride Location Permission has to be set to Always", `Accept 'Always' location permission from settings`,
                    [{ text: 'OK', onPress: async () => await Permissions.openSettings() }]), 300)
                    ;
            }
            else {
                this.locationPermission = IS_ANDROID
                    ? await Permissions.request(Permissions.PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
                    : await Permissions.request(Permissions.PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
                if (this.locationPermission === RESULTS.GRANTED) {
                    this.getCurrentLocation(true);
                }
            }
        }
        else {
            this.locationPermission = IS_ANDROID
                ? await Permissions.request(Permissions.PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
                : await Permissions.request(Permissions.PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
            if (this.locationPermission === RESULTS.GRANTED) {
                this.getCurrentLocation(true);
            }
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
        const mapZoomLevel = await this._mapView.getZoom();
        if (this.props.user.showCircle) this.showVisibleCircle(properties, geometry, mapZoomLevel);
        this.updateClusters(mapZoomLevel);
    }

    async showVisibleCircle(properties, geometry, mapZoomLevel) {
        if (this.state.showCreateRide === false) {
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

    async updateClusters(mapZoomLevel) {
        if (mapZoomLevel === undefined) mapZoomLevel = await this._mapView.getZoom();
        const sc = this.state.superCluster;
        if (sc) {
            const bounds = await this._mapView.getVisibleBounds();
            const westLng = bounds[1][0];
            const southLat = bounds[1][1];
            const eastLng = bounds[0][0];
            const northLat = bounds[0][1];
            this.setState({
                mapZoomLevel: mapZoomLevel,
                superClusterClusters: sc.getClusters(
                    [westLng, southLat, eastLng, northLat],
                    Math.round(mapZoomLevel)
                ),
            });
        }
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
                this.props.makeWaypointAsSource(ride, activeMarkerIndex === 0 ? activeMarkerIndex : activeMarkerIndex - 1);
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

    onPressCamera = () => {
        this.hideMapControls();
        const { ride } = this.props;
        let hasSnapshotResponse = null;
        if (this.state.activeMarkerIndex !== -1) this.onCloseOptionsBar(true);
        this.setState({ showLoader: true }, () => {
            this.getMapSnapshot((mapSnapshot = null) => {
                if (hasSnapshotResponse === true) return;
                hasSnapshotResponse = true;
                this.setState({ showLoader: false });
                if (mapSnapshot) {
                    Toast.show({ text: 'Updating snapshot... We will let you know once it is completed' });
                    updateRideOnServer({ rideId: ride.rideId, snapshot: { mimeType: 'image/jpeg', picture: mapSnapshot } }, undefined, undefined, true);
                }
            }, (er) => {
                console.log(er);
                this.setState({ showLoader: false });
            }, true);
        });
    }

    onPressRecenterMap = (location) => {
        const options = {
            centerCoordinate: this.state.defaultCenterCoords,
            zoom: DEFAULT_ZOOM_LEVEL,
            duration: 500,
        };
        if (Array.isArray(location)) {
            options.centerCoordinate = location;
        } else if (this.state.currentLocation) {
            options.centerCoordinate = this.state.currentLocation.location;
        }
        this._mapView.setCamera(options);
        this.lastShownFriendLoc = null;
    }

    onPressBoundRideToScreen = () => {
        const { ride } = this.props;
        let rideBounds = null;
        if (ride.isRecorded) {
            if (this.state.coords.length > 1) {
                rideBounds = turfBBox({ coordinates: this.state.coords, type: 'LineString' });
                this._mapView.fitBounds(rideBounds.slice(0, 2), rideBounds.slice(2), 35, 0);
            } else if (this.state.recordRideCollection.features.length > 0) {
                rideBounds = turfBBox({ coordinates: this.state.recordRideCollection.features[0].geometry.coordinates, type: 'LineString' });
                this._mapView.fitBounds(rideBounds.slice(0, 2), rideBounds.slice(2), 35, 0);
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
        if (!this.props.canUndoRide) return;
        this.setState(prevState => ({ rideUpdateCount: prevState.rideUpdateCount + 1 }), () => {
            this.props.doUndo();
        });
    }

    onPressRedo = () => {
        if (!this.props.canRedoRide) return;
        this.setState(prevState => ({ rideUpdateCount: prevState.rideUpdateCount + 1 }), () => {
            this.props.doRedo();
        });
    }

    onToggleRouteVisibility = () => {
        this.setState((prevState) => ({ hideRoute: !prevState.hideRoute }));
    }

    getMapSnapshot = async (successCallback, errorCallback, userControlled = false) => {
        if (!this._hiddenMapView) {
            typeof errorCallback === 'function' && errorCallback("Hidden map not initialized");
            return;
        }
        let timeout = null;
        try {
            timeout = setTimeout(() => {
                clearTimeout(timeout);
                timeout = null;
                typeof errorCallback === 'function' && errorCallback();
            }, 2000);
            if (userControlled) {
                const bounds = await this._mapView.getVisibleBounds();
                this._hiddenMapView.setCamera({ duration: 1, bounds: { ne: bounds[0], sw: bounds[1] }, mode: MapboxGL.CameraModes.None });
                // this._hiddenMapView.fitBounds(bounds[0], bounds[1], 35, 0);
                setTimeout(async () => {
                    const mapSnapshotString = await this._hiddenMapView.takeSnap(false);
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                        if (typeof successCallback === 'function') {
                            this.hasManualSnapshot = true;
                            successCallback(mapSnapshotString);
                        }
                    }
                }, 500);
            } else {
                const { ride } = this.props;
                let rideBounds = null;
                if (ride.isRecorded) {
                    if (this.state.coords.length > 1) {
                        rideBounds = turfBBox({ coordinates: this.state.coords, type: 'LineString' });
                        this._hiddenMapView.setCamera({ duration: 1, bounds: { ne: rideBounds.slice(0, 2), sw: rideBounds.slice(2) }, mode: MapboxGL.CameraModes.None });
                    } else {
                        this._hiddenMapView.setCamera({ duration: 1, centerCoordinate: this.state.coords[0], mode: MapboxGL.CameraModes.None });
                    }
                } else {
                    if (!this.state.directions) return;
                    rideBounds = turfBBox(this.state.directions.geometry);
                    this._hiddenMapView.setCamera({ duration: 1, bounds: { ne: rideBounds.slice(0, 2), sw: rideBounds.slice(2) }, mode: MapboxGL.CameraModes.None });
                }
                setTimeout(async () => {
                    const mapSnapshotString = await this._hiddenMapView.takeSnap(false);
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                        typeof successCallback === 'function' && successCallback(mapSnapshotString);
                    }
                }, 500);
            }
        } catch (er) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
                typeof errorCallback === 'function' && errorCallback(er);
            }
        }
    }

    onSelectPlace = (place) => {
        // DOC: Useful keys: place.geometry.coordinates and place.place_name
        if (this.props.ride.rideId) {
            const placeKey = place.geometry.coordinates.join('');
            const { features } = this.state.markerCollection;
            const { activeMarkerIndex } = this.state;
            const { ride } = this.props;
            if (features.length > 0 && features[features.length - 1].geometry.coordinates.join('') === placeKey) {
                Toast.show({ text: 'Found the last waypoint same as the selected location', position: 'bottom' });
                return;
            }
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
        } else {
            this.onPressRecenterMap(place.geometry.coordinates);
        }
    }

    renderCurrentLocation(markerInfo) {
        if (markerInfo === null) return;
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
    renderMarker(markerInfo) {
        if (markerInfo === null) return;
        return (
            <MapboxGL.PointAnnotation
                key={markerInfo.location.join('')}
                id={markerInfo.location.join('')}
                coordinate={markerInfo.location}>
                {
                    <View style={[styles.annotationContainer, { backgroundColor: markerInfo.markerType === 'source' ? 'green' : 'orange' }]}>
                        <View style={[styles.annotationFill, { backgroundColor: markerInfo.markerType === 'source' ? 'green' : 'orange', transform: [{ scale: 0.5 }] }]} />
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
    renderIntermediateMarker(markerInfo) {
        if (markerInfo === null) return;
        return (
            <MapboxGL.PointAnnotation
                key={markerInfo.location.join('')}
                id={markerInfo.location.join('')}
                coordinate={markerInfo.location}>
                {
                    <View style={[styles.annotationContainer, { width: 12, height: 12, borderRadius: 6, backgroundColor: 'white' }]}>
                        <View style={[styles.annotationFill, { width: 10, height: 10, borderRadius: 5, backgroundColor: 'blue', transform: [{ scale: 0.5 }] }]} />
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

    onPressDirectionAtoB = () => {
        this.setState(prevState => ({ isSearchingAToB: true }), () => {
            const sourceMarker = this.createMarkerFeature([this.state.currentLocation.location[0], this.state.currentLocation.location[1]], ICON_NAMES.SOURCE_DEFAULT);
            this.setState({
                markerCollection: {
                    ...this.state.markerCollection,
                    features: [sourceMarker]
                }
            })
            this.hideOptionsModal()
        })
    }

    findRide = async () => {
        const tempLocation = IS_ANDROID
            ? await Permissions.check(Permissions.PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION)
            : await Permissions.check(Permissions.PERMISSIONS.IOS.LOCATION_ALWAYS);
        if (tempLocation === RESULTS.DENIED) {
            // this.setState({ showOptionsModal: false });
            Alert.alert(
                "You haven't share your location",
                'Do you want to give Access of your location',
                [
                    {
                        text: 'yes ', onPress: () => {
                            this.permissionToAccessLocation('findaRide')
                        }
                    },
                    { text: 'No', onPress: () => { }, style: 'cancel' },
                ],
                { cancelable: false }
            )
        }
        else if (tempLocation === RESULTS.BLOCKED) {
            this.hideOptionsModal();
            setTimeout(() => Alert.alert("For Finding A Ride Location Permission has to be set to Always", `Accept 'Always' location permission from settings`,
                [{ text: 'OK', onPress: async () => await Permissions.openSettings() }]), 300)
                ;
        }else{
            Actions.push(PageKeys.FIND_RIDE, {});
            this.hideOptionsModal()
        }
    }

    createRide = () => {
        // DOC: Process action only if network is availbale
        // console.log(this.props.hasNetwork)
        // if (!this.props.hasNetwork) return;
        this.setState({ showOptionsModal: false, showLoader: true });
        this.state.controlsBarLeftAnim.__getValue() === 0 && this.hideMapControls();
        this.hideWaypointList();
        BackgroundGeolocation.getCurrentPosition({
            samples: 1,
            persist: true
        }).then(({ coords }) => {
            // console.log(coords)
            this.setState({ showLoader: false, currentLocation: { location: [coords.longitude, coords.latitude], name: '', }, showCreateRide: true });
        }).catch(error => {
            console.log(error.code, error.message);
            this.setState({ showLoader: false });
        })
    }

    onPressRecordRide = async () => {
        const tempLocation = IS_ANDROID
            ? await Permissions.check(Permissions.PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION)
            : await Permissions.check(Permissions.PERMISSIONS.IOS.LOCATION_ALWAYS);
        if (tempLocation === RESULTS.DENIED) {
            // this.setState({ showOptionsModal: false });
            Alert.alert(
                "You haven't share your location",
                'Do you want to give Access of your location',
                [
                    {
                        text: 'yes ', onPress: () => {
                            this.permissionToAccessLocation('recordRide')
                        }
                    },
                    { text: 'No', onPress: () => { }, style: 'cancel' },
                ],
                { cancelable: false }
            )
        }
        else if (tempLocation === RESULTS.BLOCKED) {
            this.hideOptionsModal();
            setTimeout(() => Alert.alert("For Recording A Ride Location Permission has to be set to Always", `Accept 'Always' location permission from settings`,
                [{ text: 'OK', onPress: async () => await Permissions.openSettings() }]), 300)
                ;
        }
        else {
            console.log(this.props.spaceList,'////// spaceList')
            this.setState({ showOptionsModal: false, showRecordRideButtons: true });
        }
    }
    

    startTrackingRideTime = () => {
       console.log('callled stopwatch')
        BackgroundTimer.stopBackgroundTimer()
        BackgroundTimer.runBackgroundTimer(() =>{
            this.timeCount=this.timeCount+1
            console.log(this.timeCount,'////time COunt')
            if((this.timeCount%60)===0){
                this.setState(prevState => ({ recordRideTime: prevState.recordRideTime + 60 }))
            }
        } 
            , 1000)
    }

    stopTrackingRideTime = () => {
        BackgroundTimer.stopBackgroundTimer()
       
    }

   

    startRecordRide = async () => {
        // // DOC: Process action ony if network is available
        if (!this.props.hasNetwork) return;
        if(this.props.spaceList.length===0){
            Alert.alert("Garage Is Empty","You need to have a bike in your garage to record a ride. \n\nWould you like to add a bike to your garage ?",[{
                text:'No',
                style:'cancel',
                onPress:()=>{
                    this.setState({ showOptionsModal: false, showRecordRideButtons: false });
                }
            },{
                text:'Yes',
                style:'default',
                onPress:()=>{
                    Actions.push( PageKeys.PROFILE, { tabProps: { activeTab: 1 }, isEditable:true } )
                }
            }])
        }else{
            this.setState({showLoader:true})
            this.state.controlsBarLeftAnim.__getValue() === 0 && this.hideMapControls();
            const dateTime = new Date();
            let rideDetails = {
                userId: this.props.user.userId,
                name: dateTime.toLocaleString(),
                date: dateTime.toISOString(),
                isRecorded: true,
                startTime: dateTime.toISOString()
            };
            BackgroundGeolocation.getCurrentPosition({ samples: 1, persist: true }).then(({ coords }) => {
                rideDetails.source = {
                    lat: coords.latitude,
                    lng: coords.longitude,
                    date: dateTime.toISOString()
                };
                this.startTrackingRideTime()
                BackgroundGeolocation.resetOdometer();
                this.props.createRecordRide(rideDetails);
                this._mapView.moveTo([rideDetails.source.lng, rideDetails.source.lat], 0);
                this.setState({
                    // recordRideMarker: [{ location: [rideDetails.source.lng, rideDetails.source.lat], name: '', markerType: 'source' }],
                    isEditableRide: true,
                    currentLocation: { location: [coords.longitude, coords.latitude], name: '' },
                    coords: [[coords.longitude, coords.latitude]],
                    showOptionsModal: false,
                    startTrackingLocation:true,
                    showLoader:false
                }, () => {
                    BackgroundGeolocation.setConfig({ isMoving: true }, (state) => {
                        if (!state.enabled) this.startTrackingLocation();
                    });
                });
            }).catch(error => {
                console.log(error.code, error.message);
            })
        }
    }

    getMapSnapShotToStoreInDevice = async (successCallback, errorCallback) => {
        let hasSnapshotResponse = null;
        this.setState({ showLoader: true },()=>{
            this.getMapSnapshot((mapSnapshot = null) => {
                if (hasSnapshotResponse === true) return;
                hasSnapshotResponse = true;
                this.setState({ showLoader: false });
                if (mapSnapshot) {
                    Toast.show({ text: 'Updating snapshot... We will let you know once it is completed' });
                    // updateRideOnServer({ rideId: ride.rideId, snapshot: { mimeType: 'image/jpeg', picture: mapSnapshot } }, undefined, undefined, true);
                    typeof successCallback === 'function' && successCallback(mapSnapshot)
                }
            }, (er) => {
                console.log(er);
                this.setState({ showLoader: false });
                typeof errorCallback === 'function' && errorCallback(er)
            }, true);
        });
    }

    onPressPauseRide = () => {
        const { ride } = this.props;
        let timeCount=this.timeCount
        // DOC: Don't stop tracking location if user has enbled location sharing
        this.stopTrackingRideTime();
        this.stopTrackingLocation();
        this.setState({startTrackingLocation:false})
        if (this.gpsPoints.length > 0) {
            this.gpsPoints[this.gpsPoints.length - 1].status = RECORD_RIDE_STATUS.PAUSED;
        }
        if (this.props.hasNetwork && !this.props.ride.unsynced) {
            this.hasModifiedRide = true;
            if (this.gpsPoints.length >= 1 && this.state.coords.length > 1) {
                let actualPoints = [];
                let trackpoints = [];
                actualPoints = this.gpsPoints.reduce((list, item) => {
                    list.push(item.loc[1], item.loc[0], item.heading, item.accuracy, item.speed, item.date, item.status);
                    return list;
                }, []);
                trackpoints = [...actualPoints];
                const lastPoints = this.gpsPoints;
                this.getRouteMatrixInfo(lastPoints[0].loc, lastPoints[lastPoints.length - 1].loc, ({ error, distance, duration }) => {
                    this.props.pauseRecordRide(false, this.gpsPoints, new Date().toISOString(), actualPoints, trackpoints, distance, ride, this.props.user.userId, false, (res) => {
                        this.gpsPoints = [];
                    }, (er) => {
                        this.getMapSnapShotToStoreInDevice((mapSnapshot) => {
                            this.storeRideAfterServiceIsDown(mapSnapshot, this.props.ride, er.gpsPoints, RECORD_RIDE_STATUS.PAUSED,timeCount);
                            this.gpsPoints = [];
                        }, (er) => {})
                    },timeCount);
                });
            } else {
                let actualPoints = [];
                let trackpoints = [];
                actualPoints = this.gpsPoints.reduce((list, item) => {
                    list.push(item.loc[1], item.loc[0], item.heading, item.accuracy, item.speed, item.date, item.status);
                    return list;
                }, []);
                trackpoints = [...actualPoints];
                this.props.pauseRecordRide(false, this.gpsPoints, new Date().toISOString(), actualPoints, trackpoints, 0, ride, this.props.user.userId, false, (res) => {
                    this.gpsPoints = [];
                }, (er) => {
                    this.getMapSnapShotToStoreInDevice((mapSnapshot) => {
                        this.storeRideAfterServiceIsDown(mapSnapshot, this.props.ride, er.gpsPoints, RECORD_RIDE_STATUS.PAUSED);
                        this.gpsPoints = [];
                    }, (er) => {})
                },timeCount);
            }
        } else {
            this.hasModifiedRide = false;
            if (this.gpsPoints.length > 0) {
                this.getMapSnapShotToStoreInDevice((mapSnapshot) => {
                    this.storePointsOnDevice(mapSnapshot, this.props.ride, this.gpsPoints, ({ error, success }) => {
                        if (error) {
                            this.gpsPoints = [];
                            console.log("Something went wrong while storing points on device: ", error);
                        } else {
                            this.gpsPoints = [];
                            console.log(success);
                            this.props.updateRide({ status: RECORD_RIDE_STATUS.PAUSED });

                        }
                        // this.setState({ showLoader: false });
                    },timeCount);
                }, (er) => {

                })
            } else {
                this.props.updateRide({ status: RECORD_RIDE_STATUS.PAUSED });
            }
        }
        this.setState({ showPauseBox: false });
    }

    onPressContinueRide = () => {
        this.gpsPoints = [];
        BackgroundGeolocation.getState(state => {
            console.log(state,'//// console state')
            if (!state.enabled) this.startTrackingLocation();
            this.setState({startTrackingLocation:true})
            const { ride } = this.props;
            if (this.props.hasNetwork) {
                this.startTrackingRideTime();
                this.props.continueRecordRide(new Date().toISOString(), ride, this.props.user.userId, (res) => {
                    console.log( res ,'/////response' )
                }, (er) => {
                    Alert.alert(
                        'Something went wrong ',
                        '',
                        [
                            {
                                text: 'Retry ', onPress: () => {
                                    this.onPressContinueRide()
                                }
                            },
                            {   
                                text: 'Cancel', onPress: () => { 
                                    this.onPressCloseRide() 
                                }
                                , style: 'cancel' 
                            },
                        ],
                        { cancelable: false }
                    )
                })
            }
            else {
                this.startTrackingRideTime();
                this.props.updateRide({ status: RECORD_RIDE_STATUS.RUNNING });
            }
        })
    }

    onPressStopRide = async () => {
        this.setState({showLoader:true})
        let timeCount=this.timeCount
        let distance=this.state.odometer
        this.stopTrackingRideTime();
        this.stopTrackingLocation();
        const { ride } = this.props;
        console.log(this.gpsPoints,'//// gps points')
        if (this.gpsPoints.length > 0) {
            this.gpsPoints[this.gpsPoints.length - 1].status = RECORD_RIDE_STATUS.COMPLETED;
            // this.setState({ recordRideMarker: [...this.state.recordRideMarker, { location: this.gpsPoints[this.gpsPoints.length - 1].loc, name: '', markerType: 'destination' }] })
            const destinationMarker = this.createMarkerFeature(this.gpsPoints[this.gpsPoints.length - 1].loc, ICON_NAMES.DESTINATION_DEFAULT);
            this.setState({
                markerCollection: {
                    ...this.state.markerCollection,
                    features: [...this.state.markerCollection.features, destinationMarker]
                },
                startTrackingLocation:false
            })
        }
        else {
            // this.setState({ recordRideMarker: [...this.state.recordRideMarker, { location: this.state.coords[this.state.coords.length - 1], name: '', markerType: 'destination' }] })
            const destinationMarker = this.createMarkerFeature(this.state.coords[this.state.coords.length - 1], ICON_NAMES.DESTINATION_DEFAULT);
            this.setState({
                markerCollection: {
                    ...this.state.markerCollection,
                    features: [...this.state.markerCollection.features, destinationMarker]
                },
                startTrackingLocation:false
            })
        }

        if (this.props.hasNetwork) {
            if (this.props.ride.unsynced) {
                console.log('\n\n\n onPressStopRide if ')
                this.closeRidePressed = true;
                const unSyncedRide = await AsyncStorage.getItem(`${UNSYNCED_RIDE}${this.props.ride.rideId}`);
                const unSyncedRideData = JSON.parse(unSyncedRide);
                if (unSyncedRideData.unsyncedPoints) {
                    console.log('\n\n\n onPressStopRide  unsyncedPoints if ')
                    if (unSyncedRideData.unsyncedPoints.length > 0) {
                        AsyncStorage.removeItem(`${UNSYNCED_RIDE}${this.props.ride.rideId}`).then(() => {
                            this.props.deleteUnsyncedRide(this.props.ride.rideId);
                            // this.hasModifiedRide = true;
                        }).catch(er => {
                            console.log(er);
                        });
                        this.gpsPoints = [...unSyncedRideData.unsyncedPoints, ...this.gpsPoints];
                        
                        this.gpsPoints[this.gpsPoints.length - 1].status = RECORD_RIDE_STATUS.COMPLETED;
                        // this.syncCoordinatesWithServer(unSyncedRideData.ride, unSyncedRideData.unsyncedPoints[unSyncedRideData.unsyncedPoints.length - 1].status, unSyncedRideData.unsyncedPoints, false);
                        // this.props.clearRideFromMap();
                    }
                }
            }
            this.hasModifiedRide = true;
            if (this.gpsPoints.length >= 1 && this.state.coords.length > 1) {
                let actualPoints = [];
                let trackpoints = [];
                actualPoints = this.gpsPoints.reduce((list, item) => {
                    list.push(item.loc[1], item.loc[0], item.heading, item.accuracy, item.speed, item.date, item.status);
                    return list;
                }, []);
                trackpoints = [...actualPoints];
                const lastPoints = this.gpsPoints;
                this.getRouteMatrixInfo(lastPoints[0].loc, lastPoints[lastPoints.length - 1].loc, ({ error, distance, duration }) => {
                    this.props.completeRecordRide(false, lastPoints, new Date().toISOString(), actualPoints, trackpoints, distance, ride, this.props.user.userId, false, (res) => {
                        if(this.state.showLoader){
                            this.setState({showLoader:false})
                        }
                        this.createRide();
                        this.timeCount=0
                        this.gpsPoints = [];
                    }, (er) => {
                        this.getMapSnapShotToStoreInDevice((mapSnapshot) => {
                            this.storeRideAfterServiceIsDown(mapSnapshot, this.props.ride, er.gpsPoints, RECORD_RIDE_STATUS.COMPLETED,timeCount);
                            this.gpsPoints = [];
                        }, (er) => {})
                    },timeCount);
                });
            }
            else {
                let actualPoints = [];
                let trackpoints = [];
                actualPoints = this.gpsPoints.reduce((list, item) => {
                    list.push(item.loc[1], item.loc[0], item.heading, item.accuracy, item.speed, item.date, item.status);
                    return list;
                }, []);
                trackpoints = [...actualPoints];
                this.props.completeRecordRide(false, this.gpsPoints, new Date().toISOString(), actualPoints, trackpoints, 0, ride, this.props.user.userId, false, (res) => {
                    if(this.state.showLoader){
                        this.setState({showLoader:false})
                    }
                    this.createRide();
                    this.timeCount=0
                    this.gpsPoints = [];
                }, (er) => {
                    this.getMapSnapShotToStoreInDevice((mapSnapshot) => {
                        this.storeRideAfterServiceIsDown(mapSnapshot, this.props.ride, er.gpsPoints, RECORD_RIDE_STATUS.COMPLETED,timeCount);
                        this.gpsPoints = [];
                    }, (er) => {})
                },timeCount);
            }
        } else {
            this.hasModifiedRide = false;
            if (this.gpsPoints.length > 0) {
                this.gpsPoints[this.gpsPoints.length - 1].status = RECORD_RIDE_STATUS.COMPLETED;
                this.getMapSnapShotToStoreInDevice((mapSnapshot) => {        
                    this.storePointsOnDevice(mapSnapshot, this.props.ride, this.gpsPoints, ({ error, success }) => {
                        if(this.state.showLoader){
                            this.setState({showLoader:false})
                        }
                        if (error) {
                            this.gpsPoints = [];
                            console.log("Something went wrong while storing points on device: ", error);
                        } else {
                            this.gpsPoints = [];
                            console.log(success);
                            this.props.updateRide({ status: RECORD_RIDE_STATUS.COMPLETED });
                            // this.setState({ showRecordRideButtons: false, showCreateRide: false });
                            this.createRide()
                            this.timeCount=0
                            // this.props.clearRideFromMap();
                        }
                    },timeCount);
                }, (er) => {})
            } else {
                console.log('\n\n\n newtork is not there complete ride else : ', this.props.ride.rideId)
                const keys = await AsyncStorage.getAllKeys();
                const unSyncedAllRide = keys.filter(key => key.indexOf(UNSYNCED_RIDE) === 0)
                const unSyncedRideStr = await AsyncStorage.getItem(`${UNSYNCED_RIDE}${this.props.ride.rideId}`);
                let unSyncedRide = unSyncedRideStr ? JSON.parse(unSyncedRideStr) : [];
                // AsyncStorage.removeItem(`${UNSYNCED_RIDE}${this.props.ride.rideId}`).then(() => {
                    //     this.props.deleteUnsyncedRide(this.props.ride.rideId);
                    //     // this.hasModifiedRide = true;
                    // }).catch(er => {
                        //     console.log(er);
                        // });
                        // DOC: Has to update to the server later
                        unSyncedRide.unsyncedPoints[unSyncedRide.unsyncedPoints.length - 1].status = RECORD_RIDE_STATUS.COMPLETED;
                        
                        this.getMapSnapShotToStoreInDevice((mapSnapshot) => {
                            this.storePointsOnDevice(mapSnapshot,this.props.ride, unSyncedRide.unsyncedPoints, ({ error, success }) => {
                                if(this.state.showLoader){
                                    this.setState({showLoader:false})
                                }
                                if (error) {
                                    this.gpsPoints = [];
                                    console.log("Something went wrong while storing points on device: ", error);
                                } else {
                                    this.gpsPoints = [];
                                    console.log(success);
                                    this.props.updateRide({ status: RECORD_RIDE_STATUS.COMPLETED });
                                    // this.setState({ showRecordRideButtons: false, showCreateRide: false });
                                    this.createRide()
                                    this.timeCount=0
                                    this.props.clearRideFromMap();
                                }
                        this.setState({ showLoader: false });
                    },timeCount);
                }, (er) => {})

            }
        }
        
       
    }

    onChangeRecordRideStatus(newStatus) {
        switch (newStatus) {
            case RECORD_RIDE_STATUS.RUNNING:
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

    syncCoordinatesWithServer(mapSnapshot, ride, rideStatus, unsyncedPoints, isNetworkChangeed,rideDescription) {
        console.log('\n\n\n unsyncedPoints syncCoordinatesWithServer: ', unsyncedPoints,ride)
        console.log('\n\n\n rideStatus syncCoordinatesWithServer: ', rideStatus)
        let actualPoints = [];
        let trackpoints = [];
        let timeCount=ride.timeCount?ride.timeCount:0
        actualPoints = unsyncedPoints.reduce((list, item) => {
            list.push(item.loc[1], item.loc[0], item.heading, item.accuracy, item.speed, item.date, item.status);
            return list;
        }, []);
        trackpoints = [...actualPoints];
        if (rideStatus === RECORD_RIDE_STATUS.PAUSED) {
            unsyncedPoints[unsyncedPoints.length - 1].status = rideStatus;
            if (unsyncedPoints.length > 1) {
                console.log(APP_CONFIGS.callRoadMapApi)
                if (APP_CONFIGS.callRoadMapApi === true) {
                    console.log('////entered for getcoordsonroad////')
                    this.getCoordsOnRoad(unsyncedPoints, (responseBody, actualPoints, trackpoints, distance) => {
                        this.props.pauseRecordRide(isNetworkChangeed, unsyncedPoints, new Date().toISOString(), actualPoints, trackpoints, distance, ride, this.props.user.userId, true, (res) => {
                            updateRideOnServer({ rideId: ride.rideId, snapshot: { mimeType: 'image/jpeg', picture: mapSnapshot } }, undefined, undefined, true);
                            if(this.state.showLoader){
                                this.setState({showLoader:false})
                            }
                            this.props.clearRideFromMap();
                        }, (er) => {
                            if(this.state.showLoader){
                                this.setState({showLoader:false})
                            }
                             this.storeRideAfterServiceIsDown(null,ride, er.gpsPoints, RECORD_RIDE_STATUS.PAUSED,timeCount) },timeCount);
                    });
                } else {
                    this.getRouteMatrixInfo(unsyncedPoints[0].loc, unsyncedPoints[unsyncedPoints.length - 1].loc, ({ error, distance, duration }) => {
                        this.props.pauseRecordRide(isNetworkChangeed, unsyncedPoints, unsyncedPoints[unsyncedPoints.length - 1].date, actualPoints, trackpoints,ride.totalDistance, ride, this.props.user.userId, true, (res) => {
                            if(this.state.showLoader){
                                this.setState({showLoader:false})
                            }
                            updateRideOnServer({ rideId: ride.rideId, snapshot: { mimeType: 'image/jpeg', picture: mapSnapshot } }, undefined, undefined, true);
                            this.props.clearRideFromMap();
                        }, (er) => {
                            if(this.state.showLoader){
                                this.setState({showLoader:false})
                            }
                            this.storeRideAfterServiceIsDown(null,ride, er.gpsPoints, unsyncedPoints, RECORD_RIDE_STATUS.PAUSED,timeCount) 
                        }, timeCount);
                    });
                }
                return;
            }
            this.props.pauseRecordRide(isNetworkChangeed, unsyncedPoints, new Date().toISOString(), actualPoints, trackpoints, 0, ride, this.props.user.userId, true, (res) => {
                if(this.state.showLoader){
                    this.setState({showLoader:false})
                }
                updateRideOnServer({ rideId: ride.rideId, snapshot: { mimeType: 'image/jpeg', picture: mapSnapshot } }, undefined, undefined, true);
                this.props.clearRideFromMap();
            }, (er) => {
                if(this.state.showLoader){
                    this.setState({showLoader:false})
                }
                this.storeRideAfterServiceIsDown(null,ride, er.gpsPoints, RECORD_RIDE_STATUS.PAUSED,timeCount)
            },timeCount);
        } else if (rideStatus === RECORD_RIDE_STATUS.COMPLETED) {        
            unsyncedPoints[unsyncedPoints.length - 1].status = rideStatus;
            if (unsyncedPoints.length > 1) {
                if (APP_CONFIGS.callRoadMapApi === true) {
                    console.log('////entered for getcoordsonroad////')
                    this.getCoordsOnRoad(unsyncedPoints, (responseBody, actualPoints, trackpoints, distance) => {
                        this.props.completeRecordRide(isNetworkChangeed, unsyncedPoints, new Date().toISOString(), actualPoints, trackpoints, distance, ride, this.props.user.userId, false, (res) => {
                            updateRideOnServer({ rideId: ride.rideId, snapshot: { mimeType: 'image/jpeg', picture: mapSnapshot } }, undefined, undefined, true);
                        }, (er) => { this.storeRideAfterServiceIsDown(null,ride, er.gpsPoints, RECORD_RIDE_STATUS.COMPLETED,timeCount) },timeCount)
                    });
                } else {
                    console.log(ride.timeCount,ride.totalDistance,unsyncedPoints,'/////time count')
                    this.getRouteMatrixInfo((ride.source?[ride.source.lng,ride.source.lat]:unsyncedPoints[0].loc), (ride.destination?[ride.destination.lng,ride.destination.lat]:unsyncedPoints[unsyncedPoints.length - 1].loc), ({ error, distance, duration }) => {
                    // this.getMultiRouteMatrixInfo(ride,unsyncedPoints, ({ error, distance, duration }) => {
                        // console.log(ride.timeCount,distance,duration,'/////time count')
                        this.props.completeRecordRide(isNetworkChangeed, unsyncedPoints, unsyncedPoints[unsyncedPoints.length - 1].date, actualPoints, trackpoints, ride.totalDistance, ride, this.props.user.userId, false, (res) => {
                            if(this.state.showLoader){
                                this.setState({showLoader:false})
                            }
                            updateRideOnServer({ rideId: ride.rideId, snapshot: { mimeType: 'image/jpeg', picture: mapSnapshot } },()=>{
                                console.log(res, unsyncedPoints[unsyncedPoints.length - 1].date,'//// res of complete ride')
                                if(rideDescription){
                                    const body = {};
                                    
                                        body.name = rideDescription.name;
                                        body.description = rideDescription.description;
                                        body.spaceId = rideDescription.spaceId;
                                        body.privacyMode = rideDescription.privacyMode
                                    
                                    body.source = ride.source;
                                    if (ride.destination) {
                                        body.destination = ride.destination;
                                    }
                                    if (rideStatus === RECORD_RIDE_STATUS.COMPLETED && !ride.destination) {
                                        body.destination = {
                                            "date": unsyncedPoints[unsyncedPoints.length - 1].date,
                                            "lat": unsyncedPoints[unsyncedPoints.length - 1].loc[1],
                                            "lng": unsyncedPoints[unsyncedPoints.length - 1].loc[0],
                                        }
                                    }
                                    if (ride.waypoints) body.waypoints = ride.waypoints;
                                    // if (ride.isRecorded) {
                                    //     body.totalDistance = ride.totalDistance;
                                    //     body.totalTime = ride.totalTime;
                                    // }
                                    console.log(body,'///// body updated after network came ')
                                    replaceRide(ride.rideId, body,undefined,undefined,mapSnapshot !== null)
                                }

                            }, (err)=>{
                                if(this.state.showLoader){
                                    this.setState({showLoader:false})
                                }
                                console.log(err)
                            }, true);

                        }, (er) => {
                            if(this.state.showLoader){
                                this.setState({showLoader:false})
                            } 
                            this.storeRideAfterServiceIsDown(null,ride, er.gpsPoints, RECORD_RIDE_STATUS.COMPLETED,timeCount)},timeCount)
                    });
                }
                return
            }else{
                this.props.completeRecordRide(isNetworkChangeed, unsyncedPoints, new Date().toISOString(), actualPoints, trackpoints, 0, ride, this.props.user.userId, false, (res) => {
                    if(this.state.showLoader){
                        this.setState({showLoader:false})
                    }
                    updateRideOnServer({ rideId: ride.rideId, snapshot: { mimeType: 'image/jpeg', picture: mapSnapshot } }, undefined, undefined, true);
                }, (er) => {
                    if(this.state.showLoader){
                        this.setState({showLoader:false})
                    } 
                    this.storeRideAfterServiceIsDown(null,ride, er.gpsPoints, RECORD_RIDE_STATUS.COMPLETED,timeCount) },timeCount)
            }
        }
        else if (rideStatus === RECORD_RIDE_STATUS.RUNNING) {
            this.getRouteMatrixInfo(unsyncedPoints[0].loc, unsyncedPoints[unsyncedPoints.length - 1].loc, ({ error, distance, duration }) => {
                console.log('\n\n\n addTrackPoint syncWith server')
                this.props.addTrackpoints(false, actualPoints, trackpoints, distance, ride, this.props.user.userId, (res) => {
                    if(this.state.showLoader){
                        this.setState({showLoader:false})
                    }
                }, (er) => {
                    if(this.state.showLoader){
                        this.setState({showLoader:false})
                    }
                    this.storeRideAfterServiceIsDown(null,ride, unsyncedPoints,null,timeCount);
                });
            });
            return;
        }
        this.props.clearRideFromMap();
    }

    storeRideAfterServiceIsDown = (mapSnapshot, ride, unsyncedPoints, status,timeCount) => {
        if (status) {
            this.storePointsOnDevice(mapSnapshot, ride, unsyncedPoints, ({ error, success }) => {
                if (error) {
                    console.log("Something went wrong while storing points on device: ", error);
                } else {
                    console.log(success);
                    this.props.updateRide({ status });
                }
                this.setState({ showLoader: false });
            },timeCount);
        }
        else {
            this.storePointsOnDevice(mapSnapshot, ride, unsyncedPoints,null,timeCount)
        }
    }

    onPressCloseRide = async (recordRideDetails = null) => {
        let timeCount=this.timeCount
        if (this.props.hasNetwork) {
            BackgroundGeolocation.resetOdometer();
            if (this.props.ride.unsynced) {
                console.log('\n\n\n onPressCloseRide if ')
                this.closeRidePressed = true;
                const unSyncedRide = await AsyncStorage.getItem(`${UNSYNCED_RIDE}${this.props.ride.rideId}`);
                const unSyncedRideData = JSON.parse(unSyncedRide);
                if (unSyncedRideData.unsyncedPoints) {
                    console.log('\n\n\n onPressCloseRide  unsyncedPoints if ')
                    if (unSyncedRideData.unsyncedPoints.length > 0) {
                        AsyncStorage.removeItem(`${UNSYNCED_RIDE}${this.props.ride.rideId}`).then(() => {
                            this.props.deleteUnsyncedRide(this.props.ride.rideId);
                            // this.hasModifiedRide = true;
                        }).catch(er => {
                            console.log(er);
                        });
                        this.syncCoordinatesWithServer({...unSyncedRideData.ride,timeCount:timeCount}, unSyncedRideData.unsyncedPoints[unSyncedRideData.unsyncedPoints.length - 1].status, unSyncedRideData.unsyncedPoints, false);
                        // this.props.clearRideFromMap();
                    }
                }
            } else {
                console.log('\n\n\n onPressCloseRide else')
                if (this.state.isEditableRide && this.state.rideUpdateCount > 0 || this.hasModifiedRide) {
                    const { ride } = this.props;
                    let hasSnapshotResponse = null;
                    this.setState({ showLoader: true }, () => {
                        const body = {};
                        if (recordRideDetails!==null) {
                            body.name = recordRideDetails.name;
                            body.description = recordRideDetails.description;
                            body.spaceId = recordRideDetails.spaceId;
                            body.privacyMode = recordRideDetails.privacyMode
                        }
                        if (ride.source) body.source = ride.source;
                        if (ride.destination) {
                            body.destination = ride.destination;
                        }
                        else if (ride.status === RECORD_RIDE_STATUS.COMPLETED && !ride.destination) {
                            body.destination = {
                                "date": new Date().toISOString(),
                                "lat": this.state.coords[this.state.coords.length - 1][1],
                                "lng": this.state.coords[this.state.coords.length - 1][0],
                            }
                        }
                        if (ride.waypoints) body.waypoints = ride.waypoints;
                        if (ride.isRecorded) {
                            body.totalDistance = this.state.odometer;
                            body.totalTime = timeCount;
                        }
                        else if (this.state.directions) {
                            body.totalDistance = this.state.directions.distance;
                            body.totalTime = this.state.directions.duration;
                        }
                        if (this.hasManualSnapshot === false) {
                            this.getMapSnapshot((mapSnapshot = null) => {
                                if (hasSnapshotResponse === true) return;
                                hasSnapshotResponse = true;
                                this.setState({ showLoader: false });
                                if (mapSnapshot) {
                                    body.snapshot = { mimeType: 'image/jpeg', picture: mapSnapshot };
                                    Toast.show({ text: 'Updating ride... We will let you know once it is completed' });
                                }
                                replaceRide(ride.rideId, body,
                                    undefined, undefined,
                                    mapSnapshot !== null);
                                if (this.state.activeMarkerIndex !== -1) this.onCloseOptionsBar(true);
                                this.props.clearRideFromMap();
                            }, (er) => {
                                console.log(er);
                                replaceRide(ride.rideId, body,
                                    () => this.setState({ showLoader: false }),
                                    () => this.setState({ showLoader: false }));
                                if (this.state.activeMarkerIndex !== -1) this.onCloseOptionsBar(true);
                                this.props.clearRideFromMap();
                            });
                        } else {
                            Toast.show({ text: 'Updating ride... We will let you know once it is completed' });
                            replaceRide(ride.rideId, body,
                                () => this.setState({ showLoader: false }),
                                () => this.setState({ showLoader: false }));
                            if (this.state.activeMarkerIndex !== -1) this.onCloseOptionsBar(true);
                            this.props.clearRideFromMap();
                        }
                    });
                } else {
                    if (this.state.activeMarkerIndex !== -1) this.onCloseOptionsBar(true);
                    this.props.clearRideFromMap();
                }
            }
        } else {
            
            if (recordRideDetails) {
                const ride = JSON.parse(await AsyncStorage.getItem(`${UNSYNCED_RIDE}${this.props.ride.rideId}`))
                ride.recordRideDetails={
                    ...recordRideDetails
                }
                console.log(ride,recordRideDetails,'//// ride detail')
                const updatedRide = await AsyncStorage.setItem(`${UNSYNCED_RIDE}${this.props.ride.rideId}`,JSON.stringify(ride))
                console.log(updatedRide,'//// ride detail')
            }
            BackgroundGeolocation.resetOdometer();

            this.props.clearRideFromMap();
        }
        this.setState({ showRecordRideButtons: false, showCreateRide: false });
    }

    async componentWillUnmount() {
        console.log("Map unmounted");
        // BackgroundGeolocation.logger.notice(`.willUnmount123 ${new Date()}`);
        if (this.props.user.locationEnable) {
            AsyncStorage.setItem('lastLocation', JSON.stringify(this.state.currentLocation.location)).then(res => {
            }).catch(er => {
            });
        } else {
            const lastLocation = await AsyncStorage.getItem('lastLocation')
            if (lastLocation) {
                AsyncStorage.removeItem('lastLocation').then((res) => {
                }).catch(er => {
                });
            }
        }
        this.unregisterNetworkListener();
        this.stopTrackingLocation();
        this.stopTrackingRideTime();
        AppState.removeEventListener('change', this.handleAppStateChange);
        BackgroundGeolocation.removeAllListeners();
        clearInterval(this.state.watchId);
        this.stopUpdatingLocation();
        BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPress);
        this.props.publishEvent({ eventName: APP_EVENT_NAME.USER_EVENT, eventType: APP_EVENT_TYPE.INACTIVE, eventParam: { isLoggedIn: false, userId: this.props.user.userId, deviceId: await DeviceInfo.getUniqueId() } });
        this.props.resetStoreToDefault();
    }

    onPressBackButton = () => {
        if (this.state.isSearchingAToB) {
            let updatedState = {};
            this.initializeEmptyRide(updatedState)
            this.setState(updatedState);
        }
        else {
            const { ride } = this.props;
            if (ride.status === null) {
                this.setState({ showOptionsModal: false, showRecordRideButtons: false });
            } else {
                if (ride.status === RECORD_RIDE_STATUS.PAUSED) {
                    this.onPressCloseRide();
                } else {
                    this.setState({ showPauseBox: true });
                }
            }
        }
    }

    renderMapHeaderForRide() {
        const { ride } = this.props;
        const { showRecordRideButtons } = this.state;
        if (ride.status === null || ride.status === RECORD_RIDE_STATUS.COMPLETED) {
            return (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <IconButton iconProps={{ name: 'md-arrow-round-back', type: 'Ionicons', style: { fontSize: 26 } }} style={styles.headerIconCont} onPress={showRecordRideButtons ? this.onPressBackButton : this.onPressCloseRide} />
                        <DefaultText style={{ fontFamily: CUSTOM_FONTS.robotoBold, fontSize: 20, letterSpacing: 0.2, color: '#fff', marginLeft: 17, }}>{showRecordRideButtons ? 'Record a Ride' : ride.name}</DefaultText>
                    </View>
                    {ride.isRecorded === false && showRecordRideButtons === false && <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { fontSize: 18, color: '#fff' } }} style={[styles.headerIconCont, { marginRight: styles.headerIconCont.marginLeft, backgroundColor: '#F5891F', marginRight: 10 }]} onPress={() => this.openSearchResultPage('search')} />}
                </View>
            )
        } else {
            return <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <IconButton iconProps={{ name: 'md-arrow-round-back', type: 'Ionicons', style: { fontSize: 26 } }} style={styles.headerIconCont} onPress={this.onPressBackButton} />
                <DefaultText style={{ fontFamily: CUSTOM_FONTS.robotoBold, fontSize: 20, letterSpacing: 0.2, color: '#fff', marginLeft: 17, }}>{ride.name ? ride.name : 'Record a Ride'}</DefaultText>
            </View>
        }
    }

    renderMapSubHeaderForRide() {
        const { ride } = this.props;
        const { isEditableRide, showRecordRideButtons, directions } = this.state;
        let distance = 0;
        let time = 0;
        if (ride.isRecorded) {
            distance = this.state.odometer;
            time = this.state.recordRideTime
        }
        else {
            distance = directions ? directions.distance : 0;
            time = directions ? directions.duration : 0;
        }
        return <View style={styles.mapSubHeader}>
            <View style={{ height: APP_COMMON_STYLES.headerHeight, width: widthPercentageToDP(100), backgroundColor: '#585756', flexDirection: 'row', justifyContent: (isEditableRide || showRecordRideButtons) ? 'space-between' : null, alignItems: 'center', paddingHorizontal: 20, }}>
                <View style={{ width: (isEditableRide || showRecordRideButtons) ? widthPercentageToDP(50) : widthPercentageToDP(100), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* <Image source={require('../../assets/img/distance.png')} style={[styles.footerIcon, { width: 17 }]} /> */}
                        <DistanceIcon />
                        <DefaultText style={styles.footerText}>{this.getDistanceAsFormattedString(distance, this.props.user.distanceUnit)}</DefaultText>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* <Image source={require('../../assets/img/duration.png')} style={styles.footerIcon} /> */}
                        <DurationIcon />
                        <DefaultText style={styles.footerText}>{this.getTimeAsFormattedString(time)}</DefaultText>
                    </View>
                    {
                        (showRecordRideButtons || (ride.isRecorded && ride.status !== RECORD_RIDE_STATUS.COMPLETED))
                            ? null
                            : <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {/* <Image source={require('../../assets/img/date.png')} style={styles.footerIcon} /> */}
                                <CalendarIcon />
                                <DefaultText style={styles.footerText}>{this.getFormattedDate(ride.date)}</DefaultText>
                            </View>
                    }
                </View>
                {
                    (isEditableRide || showRecordRideButtons)
                        ? (ride.status === RECORD_RIDE_STATUS.RUNNING)
                            ? <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <IconButton iconProps={{ name: 'ios-pause', type: 'Ionicons', style: { fontSize: 26 } }} style={[styles.pauseOrContinue, { backgroundColor: '#EAEAEA' }]} onPress={this.onPressPauseRide} />
                                <BasicButton  title='DONE' style={styles.submitRecordRide} titleStyle={{ letterSpacing: 2.1, fontSize: 14, fontFamily: CUSTOM_FONTS.robotoBold, color: '#3C3C3C' }} onPress={this.onPressDoneBtn} />
                            </View>
                            : ride.status === RECORD_RIDE_STATUS.PAUSED
                                ? <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <IconButton iconProps={{ name: 'ios-play', type: 'Ionicons', style: { fontSize: 26 } }} style={[styles.pauseOrContinue, { backgroundColor: '#81BA41' }]} onPress={this.onPressContinueRide} />
                                    <BasicButton title='DONE' style={styles.submitRecordRide} titleStyle={{ letterSpacing: 2.1, fontSize: 14, fontFamily: CUSTOM_FONTS.robotoBold, color: '#3C3C3C' }} onPress={this.onPressDoneBtn} />
                                </View>
                                : showRecordRideButtons
                                    ? <BasicButton title='START' style={styles.startRecordRide} titleStyle={{ letterSpacing: 2.1, fontSize: 14, fontFamily: CUSTOM_FONTS.robotoBold, color: '#3C3C3C' }} onPress={this.startRecordRide} />
                                    : null
                        : null
                }
            </View>
        </View>
    }

    openSearchResultPage = (searchType) => {
        if (this.locationPermission === RESULTS.DENIED) {
            Alert.alert(
                "You haven't share your location",
                'Do you want to give Access of your location',
                [
                    {
                        text: 'yes ', onPress: () => {
                            this.permissionToAccessLocation()
                        }
                    },
                    { text: 'No', onPress: () => { }, style: 'cancel' },
                ],
                { cancelable: false }
            )
        }
        else {
            if (searchType === 'search') {
                Actions.push(PageKeys.SEARCH_RESULT, { currentLocation: this.state.currentLocation ? { geometry: { coordinates: [...this.state.currentLocation.location] } } : null, searchQuery: '', onPressSearchResult: this.onSelectPlace })
            }
            else if (searchType === 'source') {
                const { sourceQuery } = this.state;
                Actions.push(PageKeys.SEARCH_RESULT, {
                    hasNetwork: this.props.hasNetwork, currentLocation: this.state.currentLocation ? { geometry: { coordinates: [this.state.currentLocation.location[0], this.state.currentLocation.location[1]] } } : null,
                    searchQuery: sourceQuery === 'CURRENT LOCATION' ? '' : sourceQuery === 'Search Location' ? '' : sourceQuery,
                    onPressSearchResult: (item) => this.onSelectDirectionPlace(item, searchType)
                });
            }
            else if (searchType === 'destination') {
                const { destinationQuery } = this.state;
                Actions.push(PageKeys.SEARCH_RESULT, {
                    hasNetwork: this.props.hasNetwork, currentLocation: this.state.currentLocation ? { geometry: { coordinates: [this.state.currentLocation.location[0], this.state.currentLocation.location[1]] } } : null,
                    searchQuery: destinationQuery === 'CHOOSE DESTINATION' ? '' : destinationQuery,
                    onPressSearchResult: (item) => this.onSelectDirectionPlace(item, searchType)
                });
            }
        }
    }

    onSelectDirectionPlace = (place, locationType) => {
        // DOC: Useful keys: place.geometry.coordinates and place.place_name
        if (locationType === 'source') {
            this.setState(prevState => ({
                sourceLocation: { name: place.place_name === 'Current location' ? '' : place.place_name, lat: place.geometry.coordinates[1], lng: place.geometry.coordinates[0] },
                sourceQuery: place.place_name,
            }), () => {
                const sourceMarker = this.createMarkerFeature([place.geometry.coordinates[0], place.geometry.coordinates[1]], ICON_NAMES.SOURCE_DEFAULT);
                this.setState({
                    markerCollection: {
                        ...this.state.markerCollection,
                        features: this.state.markerCollection.features.length === 1 ? [sourceMarker] : [sourceMarker, ...this.state.markerCollection.features.slice(1)]
                    }
                }, () => {
                    this._mapView.moveTo([place.geometry.coordinates[0], place.geometry.coordinates[1]], 0);
                    this.fetchDirections()
                })
            });
        }
        else {
            this.setState(prevState => ({
                destinationLocation: { name: place.place_name === 'Current location' ? '' : place.place_name, lat: place.geometry.coordinates[1], lng: place.geometry.coordinates[0] },
                destinationQuery: place.place_name,
            }), () => {
                const destinationMarker = this.createMarkerFeature([place.geometry.coordinates[0], place.geometry.coordinates[1]], ICON_NAMES.DESTINATION_DEFAULT);
                this.setState(prevState => ({
                    markerCollection: {
                        ...this.state.markerCollection,
                        features: this.state.markerCollection.features.length === 1 ? [...this.state.markerCollection.features, destinationMarker] : [...this.state.markerCollection.features.slice(0, 1), destinationMarker]
                    }
                }), () => this.fetchDirections())
            });
        }
    }

    onPressMap = async (event) => {
        const { geometry, properties } = event;
        let viewCoordinate = await this._mapView.getPointInView(geometry.coordinates);
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

    showMapControls = async () => {
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

    showItinerarySection = () => Actions.push(PageKeys.ITINERARY_SECTION, { isEditable: this.state.isEditableRide, comingFrom: PageKeys.MAP });

    syncRideWithServer(callbackFn) {
        if (this.state.rideUpdateCount === 0) {
            return callbackFn();
        }
        this.setState({ showLoader: true }, () => {
            const { ride } = this.props;
            const body = {};
            if (ride.source) body.source = ride.source;
            if (ride.destination) body.destination = ride.destination;
            if (ride.waypoints) body.waypoints = ride.waypoints;
            if (ride.totalDistance) body.totalDistance = ride.totalDistance;
            if (ride.totalTime) body.totalTime = ride.totalTime;
            this.hasModifiedRide = true;
            replaceRide(ride.rideId, body, () => {
                this.setState({ showLoader: false, rideUpdateCount: 0 }, () => callbackFn());
            }, (er) => {
                this.setState({ showLoader: false }, () => console.log("Something went wrong: ", er));
            });
        });
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
        this.props.logoutUser(this.props.user.userId, this.props.userAuthToken, this.props.deviceToken, (res) => { this.hideLogoutBox() }, (er) => { });
    }

    createFriendsLocationMarker = (locInfo, groupId) => {
        return {
            type: 'Feature',
            id: locInfo.id,
            geometry: {
                type: 'Point',
                coordinates: [locInfo.lng, locInfo.lat],
            },
            properties: typeof groupId === 'undefined'
                ? {
                    // icon: locInfo.userId + ''
                    name: locInfo.name,
                    id: locInfo.id,
                    isVisible: locInfo.isVisible
                } : {
                    groupIds: { [groupId]: true },
                    // icon: locInfo.userId + ''
                    name: locInfo.name,
                    id: locInfo.id,
                    isVisible: locInfo.isVisible
                },
        };
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
        if (this.props.hasNetwork === false) return;
        Animated.timing(this.state.dropdownAnim, {
            toValue: heightPercentageToDP(25),
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
            if (typeof id === 'undefined' || this.props.hasNetwork === false) {
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
                                iconProps={{ name: 'location-on', type: 'MaterialIcons', style: { color: '#fff' } }} />

                            : <IconButton onPress={this.makeWaypointAsSource}
                                style={{ paddingVertical: 5, width: '100%', backgroundColor: 'rgba(0,0,0,0.4)', borderColor: '#acacac', borderTopWidth: 1, borderBottomWidth: 1 }}
                                iconProps={{ name: 'location-on', type: 'MaterialIcons' }} />
                        : null
                }
                {
                    !this.props.ride.source || markerCollection.features.length === 1 || this.isSource(markerCollection.features[activeMarkerIndex])
                        ? null
                        : this.isDestination(markerCollection.features[activeMarkerIndex])
                            ? <IconButton onPress={this.makeDestinationAsWaypoint}
                                style={{ paddingVertical: 5, width: '100%', backgroundColor: '#0083CA', borderBottomColor: '#acacac', borderBottomWidth: 1 }}
                                iconProps={{ name: 'star', type: 'MaterialCommunityIcons', style: { color: '#fff' } }} />
                            : <IconButton onPress={this.makeWaypointAsDestination}
                                style={{ paddingVertical: 5, width: '100%', backgroundColor: 'rgba(0,0,0,0.4)', borderBottomColor: '#acacac', borderBottomWidth: 1 }}
                                iconProps={{ name: 'star', type: 'MaterialCommunityIcons',}} />
                }
                <IconButton onPress={this.onPressDeleteOption} style={{ paddingVertical: 5, width: '100%', borderColor: '#acacac', borderTopWidth: 1, borderBottomWidth: 1 }} iconProps={{ name: 'delete', type: 'MaterialCommunityIcons' }} />
                <IconButton onPress={() => this.syncRideWithServer(this.onPressPointCommentOption)} style={{ paddingVertical: 5, width: '100%', borderColor: '#acacac', borderTopWidth: 1, borderBottomWidth: 1 }} iconProps={{ name: 'comment-text', type: 'MaterialCommunityIcons' }} />
            </View>
            : <View style={{ alignItems: 'center', backgroundColor: '#fff' }}>
                <IconButton onPress={this.onCloseOptionsBar} style={{ paddingVertical: 5, width: '100%', backgroundColor: '#fff' }}
                    iconProps={{ name: 'window-close', type: 'MaterialCommunityIcons' }} />
                <IconButton onPress={() => this.syncRideWithServer(this.onPressPointCommentOption)} style={{ paddingVertical: 5 }} iconProps={{ name: 'comment-text', type: 'MaterialCommunityIcons' }} />
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

    onPressFriendsLocation = (event) => {
        const point = event.nativeEvent.payload;
        const { name, cluster } = point.properties;
        const { coordinates } = point.geometry;
        if (cluster) {
            const sc = this.state.superCluster;
            if (sc) {
                const points = sc
                    .getLeaves(point.properties.cluster_id, Infinity)
                    .map(leaf => ({
                        selectedPointName: leaf.properties.name,
                        selectedPointLat: leaf.geometry.coordinates[1],
                        selectedPointLng: leaf.geometry.coordinates[0],
                    }));
                console.log(points);
                const zoom = sc.getClusterExpansionZoom(point.properties.cluster_id);
                const options = { zoom, duration: 500, centerCoordinate: coordinates };
                this._mapView.setCamera(options);
            }
        } else {
            console.log("friend: ", point.properties);
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

    onPressDoneBtn = () => { this.onPressStopRide(); }

    showOptionsModal = () => this.setState({ showOptionsModal: true });

    hideOptionsModal = () => this.setState({ showOptionsModal: false });

    hidePauseBox = () => this.setState({ showPauseBox: false })

    showLogoutBox = () => this.setState({ isVisibleLogoutBox: true })

    hideLogoutBox = () => this.setState({ isVisibleLogoutBox: false })

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

    getTimeAsFormattedString(timeInSeconds) {
        if (!timeInSeconds) return '0 m';
        const m = Math.floor(timeInSeconds / 60);
        const timeText = `${m} m`;
        return timeText;
    }

    getFormattedDate = (isoDateString = new Date().toISOString(), joinBy = ' ') => {
        // const dateInfo = new Date(isoDateString).toString().substr(4, 12).split(' ');
        // return [dateInfo[0] + '.', (dateInfo[2] + '').slice(-2)].join(joinBy);
        return new Date(isoDateString).toLocaleDateString('en-US');
    }

    renderProgressLine() {
        if (this.state.coords.length < 2) {
            return null;
        }
        const lineString = turfHelpers.lineString(this.state.coords);
        return (
            <MapboxGL.Animated.ShapeSource id='recordRidePathLayer' shape={lineString}>
                <MapboxGL.Animated.LineLayer id='recordRidePath' style={[MapElementStyles.recordRideRoute, { lineColor: 'red' }]} />
            </MapboxGL.Animated.ShapeSource>
        );
    }

    renderRoute() {
        if (!this.state.route) {
            return null;
        }

        return (
            <MapboxGL.ShapeSource id='routeSource' shape={this.state.route}>
                <MapboxGL.LineLayer id='routeFill' style={{ lineColor: 'white', lineWidth: 3, lineOpacity: 0.84, }} />
            </MapboxGL.ShapeSource>
        );
    }

    render() {
        const { isEditableMap, mapViewHeight, directions, markerCollection, recordRideMarker, activeMarkerIndex, controlsBarLeftAnim, waypointListLeftAnim, showCreateRide, currentLocation,
            isEditableRide, snapshot, hideRoute, optionsBarRightAnim, isUpdatingWaypoint, mapRadiusCircle, showLoader, showOptionsModal, showRecordRideButtons, showPauseBox, isVisibleLogoutBox, isSearchingAToB, sourceQuery, destinationQuery } = this.state;
        const { notificationList, ride, showMenu, user, canUndoRide, canRedoRide, friendsLocationList, membersLocationList, FriendGroupList, totalUnseenMessage } = this.props;
        const MAP_VIEW_TOP_OFFSET = showCreateRide ? (CREATE_RIDE_CONTAINER_HEIGHT - WINDOW_HALF_HEIGHT) + (mapViewHeight / 2) - (BULLSEYE_SIZE / 2) : (isEditableRide ? 130 : 60) + (mapViewHeight / 2) - (BULLSEYE_SIZE / 2);
        return (
            <BasePage defaultHeader={false} showShifter={!(showCreateRide || this.state.commentMode)} showLoader={showLoader}>
                {showMenu && <View style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 900 }}>
                    <MenuModal notificationCount={notificationList.totalUnseen} messageCount={totalUnseenMessage}
                        leftIconPress={this.showLogoutBox}
                        isVisible={showMenu} onClose={this.onCloseAppNavMenu} onPressNavMenu={this.onPressAppNavMenu} >
                        {
                            isVisibleLogoutBox && <BaseModal containerStyle={{ marginTop: 198, alignItems: 'center' }} isVisible={isVisibleLogoutBox} onCancel={this.hideLogoutBox} >
                                <View style={styles.pauseBoxCont}>
                                    <DefaultText style={styles.pauseTitle}>Logout of Account</DefaultText>
                                    <DefaultText numberOfLines={3} style={styles.pauseText}>Are you sure you want to logout of your account?</DefaultText>
                                    <View style={styles.btnContainer}>
                                        <BasicButton title='CANCEL' style={[styles.pauseBtn, { backgroundColor: '#8D8D8D' }]} titleStyle={styles.pauseBtnTxt} onPress={this.hideLogoutBox} />
                                        <BasicButton title='CONFIRM' style={[styles.pauseBtn, { backgroundColor: '#2B77B4' }]} titleStyle={styles.pauseBtnTxt} onPress={this.onPressLogout} />
                                    </View>
                                </View>
                            </BaseModal>
                        }
                    </MenuModal>
                </View>}

                {/* Pause confirmation modal starts here */}
                <BaseModal containerStyle={{ justifyContent: 'center', alignItems: 'center' }} isVisible={showPauseBox} onCancel={this.hidePauseBox} >
                    <View style={styles.pauseBoxCont}>
                        <DefaultText style={styles.pauseTitle}>Pause your ride?</DefaultText>
                        <DefaultText numberOfLines={3} style={styles.pauseText}>Would you like to pause your ride so that you can resume it in the future?</DefaultText>
                        <View style={styles.btnContainer}>
                            <BasicButton title='CANCEL' style={[styles.pauseBtn, { backgroundColor: '#8D8D8D' }]} titleStyle={styles.pauseBtnTxt} onPress={this.hidePauseBox} />
                            <BasicButton title='PAUSE' style={[styles.pauseBtn, { backgroundColor: '#81BA41' }]} titleStyle={styles.pauseBtnTxt} onPress={this.onPressPauseRide} />
                        </View>
                    </View>
                </BaseModal>

                {/* Pause confirmation modal ends here */}

                {/* Choosing ride modal starts here */}
                <BaseModal isVisible={showOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                    <View style={{ flexDirection: 'column', justifyContent: 'space-between', flex: 1}}>
                        <View style={{}}>
                            <View style={[styles.mapHeader, { justifyContent: 'space-between' }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <IconButton iconProps={{ name: 'ios-notifications', type: 'Ionicons', style: { fontSize: 26 } }} style={styles.headerIconCont} onPress={() => { this.hideOptionsModal(); Actions.push(PageKeys.NOTIFICATIONS) }} />
                                    {
                                        this.props.notificationCount>0?
                                            <CountComponent notificationCount={this.props.notificationCount} left={43} />:null
                                    } 
                                    <DefaultText style={{ fontFamily: CUSTOM_FONTS.robotoBold, fontSize: 20, letterSpacing: 0.2, color: '#fff', marginLeft: 17, }}>Let's Ride</DefaultText>
                                </View>
                                <IconButton iconProps={{ name: 'close', type: 'FontAwesome', style: { fontSize: 17, color: '#fff' } }} style={[styles.headerIconCont, { width: 26, height: 26, borderRadius: 26, backgroundColor: '#CE0D0D', marginRight: 17 }]} onPress={this.hideOptionsModal} />
                            </View>
                            <View style={{ marginTop: 80, justifyContent: 'center' }}>
                                <TouchableOpacity style={styles.mapOptionContainer} onPress={this.findRide} >
                                    <LinkButton title='FIND A RIDE' titleStyle={[APP_COMMON_STYLES.optionBtnTxt, { fontSize: 20, fontFamily: CUSTOM_FONTS.robotoBold, color: '#2B77B4' }]} onPress={this.findRide} />
                                </TouchableOpacity>
                                {/* <TouchableOpacity style={[styles.mapOptionContainer, { marginTop: 23 }]} onPress={this.createRide} >
                                    <LinkButton title='CREATE A RIDE' titleStyle={[APP_COMMON_STYLES.optionBtnTxt, { fontSize: 20, fontFamily: CUSTOM_FONTS.robotoBold, color: '#F5891F' }]} onPress={this.createRide} />
                                </TouchableOpacity> */}
                                <TouchableOpacity style={[styles.mapOptionContainer, { marginTop: 23 }]} onPress={this.onPressRecordRide} >
                                    <LinkButton title='RECORD A RIDE' titleStyle={[APP_COMMON_STYLES.optionBtnTxt, { fontSize: 20, fontFamily: CUSTOM_FONTS.robotoBold, color: '#F5891F' }]} onPress={this.onPressRecordRide} />
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.mapOptionContainer, { marginTop: 23 }]} onPress={this.onPressDirectionAtoB} >
                                    <LinkButton title='DIRECTIONS' titleStyle={[APP_COMMON_STYLES.optionBtnTxt, { fontSize: 20, fontFamily: CUSTOM_FONTS.robotoBold, color: '#585756' }]} onPress={this.onPressDirectionAtoB} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </BaseModal>
                {/* Choosing ride modal ends here */}

                {
                    !showCreateRide
                        ? <View style={[styles.mapHeader]}>
                            {
                                !isSearchingAToB
                                    ? ride.rideId === null
                                        ? <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', }}>
                                            {(ride.isRecorded || showRecordRideButtons) ? this.renderMapHeaderForRide() : <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <IconButton iconProps={{ name: 'ios-notifications', type: 'Ionicons', style: { fontSize: 26 } }} style={styles.headerIconCont} onPress={() => Actions.push(PageKeys.NOTIFICATIONS)} />
                                                {
                                                    this.props.notificationCount>0?
                                                        <CountComponent notificationCount={this.props.notificationCount} left={43} />:null
                                                 }              
                                                <DefaultText style={{ fontFamily: CUSTOM_FONTS.robotoBold, fontSize: 20, letterSpacing: 0.2, color: '#fff', marginLeft: 17, }}>{"Let's Ride"}</DefaultText>
                                            </View>}
                                            {
                                                ride.rideId || showRecordRideButtons
                                                    ? null
                                                    : <View style={{ flexDirection: 'row' }}>
                                                        <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { fontSize: 18, color: '#fff' } }} style={[styles.headerIconCont, { marginRight: styles.headerIconCont.marginLeft, backgroundColor: '#F5891F', marginRight: 10 }]} onPress={() => this.openSearchResultPage('search')} />
                                                        <IconButton iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: 26, color: '#fff' } }} style={[styles.headerIconCont, { marginRight: styles.headerIconCont.marginLeft, backgroundColor: '#F5891F', marginRight: 10 }]} onPress={this.showOptionsModal} />
                                                    </View>
                                            }
                                        </View>
                                        : this.renderMapHeaderForRide()
                                    : <IconButton iconProps={{ name: 'md-arrow-round-back', type: 'Ionicons', style: { fontSize: 26 } }} style={styles.headerIconCont} onPress={this.onPressBackButton} />
                            }
                        </View>
                        : null
                }
                {
                    !showCreateRide && (ride.rideId || showRecordRideButtons)
                        ? this.renderMapSubHeaderForRide()
                        : null
                }
                {
                    showCreateRide
                        ? <CreateRide containerHeight={CREATE_RIDE_CONTAINER_HEIGHT}
                            title={ride.rideId ? 'Record a Ride' : 'Plan a Ride'}
                            isRecorded={ride.rideId ? true : false}
                            currentLocation={currentLocation} onChangeStartRideFrom={this.onPressRecenterMap}
                            onSubmitRecordRide={(rideDetails) => this.onPressCloseRide(rideDetails)}
                            cancelPopup={ride.rideId ? this.onPressCloseRide : (centerLocation) => this.setState({ showCreateRide: false }, () => this.onPressRecenterMap(centerLocation))} />
                        : null
                }
                {
                    isSearchingAToB && <View style={{ marginVertical: 10 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Image source={require('../../assets/img/source-pin-red.png')} style={{ width: 18, height: 25, marginLeft: 20, alignSelf: 'center', }} />
                            <View style={[styles.locationInputContainer, { width: 300, marginLeft: 30 }]}>
                                <LinkButton numberOfLines={1} style={styles.linkButtonCont} title={sourceQuery} titleStyle={styles.locationLabel} onPress={() => this.openSearchResultPage('source')} />
                                <View style={styles.searchIconContainer}>
                                    <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { color: '#707070', fontSize: 22 }, }} onPress={this.onPressUseCurrentLocation} />
                                </View>
                            </View>
                        </View>
                        <View style={styles.dottedLine}></View>
                        <View style={{ flexDirection: 'row' }}>
                            <Image source={require('../../assets/img/destination-pin-red.png')} style={{ width: 18, height: 25, marginLeft: 20, alignSelf: 'center' }} />
                            <View style={[styles.locationInputContainer, { width: 300, marginLeft: 30 }]}>
                                <LinkButton numberOfLines={1} style={styles.linkButtonCont} title={destinationQuery} titleStyle={styles.locationLabel} onPress={() => this.openSearchResultPage('destination')} />
                                <View style={styles.searchIconContainer}>
                                    <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { color: '#707070', fontSize: 22 }, }} onPress={this.onPressUseCurrentLocation} />
                                </View>
                            </View>
                        </View>
                    </View>
                }
                {
                    (recordRideMarker && recordRideMarker.length > 0) || markerCollection.features.length > 0
                        ? <MapboxGL.MapView
                            // showUserLocation={true}
                            styleURL={MapboxGL.StyleURL.Street}
                            zoomLevel={14}
                            centerCoordinate={this.state.defaultCenterCoords}
                            style={styles.hiddenMapStyles}
                            ref={el => this._hiddenMapView = el}
                        >
                            {this.renderCurrentLocation(currentLocation)}
                            {
                                directions ?
                                    <MapboxGL.ShapeSource id='ridePathLayer' shape={directions.geometry}>
                                        <MapboxGL.LineLayer id='ridePath' style={[{ lineColor: '#008DFF', lineWidth: 5, lineCap: MapboxGL.LineCap.Butt, visibility: 'visible' }, hideRoute ? MapElementStyles.hideRoute : null]} />
                                    </MapboxGL.ShapeSource>
                                    : null
                            }
                            {
                                recordRideMarker
                                    ? recordRideMarker.map(item => this.renderMarker(item))
                                    : markerCollection.features.length > 0
                                        ? <MapboxGL.ShapeSource
                                            id='markers'
                                            shape={markerCollection}
                                            images={shapeSourceImages}
                                            onPress={this.onPressMarker}>
                                            <MapboxGL.SymbolLayer id="exampleIconName" style={[MapElementStyles.icon, MapElementStyles.markerTitle]} />
                                        </MapboxGL.ShapeSource>
                                        : null
                            }

                            {
                                this.state.recordRideCollection.features.length > 0
                                    ? this.renderRecordRidePaths()
                                    : this.renderProgressLine()
                            }
                        </MapboxGL.MapView>
                        : null
                }
                <MapboxGL.MapView
                    // showUserLocation={true}
                    contentInset={10}
                    styleURL={MapboxGL.StyleURL.Street}
                    zoomLevel={15}
                    centerCoordinate={this.state.defaultCenterCoords}
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
                                <MapboxGL.LineLayer id='ridePath' style={[{ lineColor: '#008DFF', lineWidth: 5, lineCap: MapboxGL.LineCap.Butt, visibility: 'visible' }, hideRoute ? MapElementStyles.hideRoute : null]} />
                            </MapboxGL.ShapeSource>
                            : null
                    }
                    {
                        this.state.superClusterClusters
                            ? <MapboxGL.ShapeSource
                                id='friends'
                                shape={{ type: 'FeatureCollection', features: this.state.superClusterClusters }}
                                onPress={this.onPressFriendsLocation}>

                                <MapboxGL.SymbolLayer id="friendLocationIcon"
                                    filter={['all', ['!has', 'point_count'], ['==', 'isVisible', true]]}
                                    style={[MapElementStyles.friendsName, MapElementStyles.friendsIcon]}
                                />
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
                            : this.renderProgressLine()
                    }
                    {
                        user.showCircle && mapRadiusCircle
                            ? <MapboxGL.ShapeSource id='routeSource' shape={mapRadiusCircle}>
                                <MapboxGL.LineLayer id='routeFill' style={MapElementStyles.circleOutline} />
                            </MapboxGL.ShapeSource>
                            : null
                    }
                    {
                        recordRideMarker
                            ? recordRideMarker.map(item => this.renderMarker(item))
                            : markerCollection.features.length > 0
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
                    !ride.isRecorded && <Animated.View style={{ backgroundColor: '#fff', position: 'absolute', zIndex: 800, elevation: 10, top: APP_COMMON_STYLES.headerHeight, width: widthPercentageToDP(50), height: this.state.dropdownAnim }}>
                        {
                            this.state.isVisibleList && this.state.friendsLocationCollection.features.filter(f => f.properties.isVisible).length > 0
                                ? <ListItem icon style={{ borderBottomWidth: 1 }} onPress={this.hideAllLocations}>
                                    <Left style={{ alignItems: 'center', justifyContent: 'center' }}>
                                        <NBIcon name='location-off' type='MaterialIcons' />
                                    </Left>
                                    <Body style={{ borderBottomWidth: 0 }}>
                                        <DefaultText>Hide All</DefaultText>
                                    </Body>
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
                                list.push({ name: this.props.membersLocationList[k].groupName, id: k, isVisible: this.props.membersLocationList[k].members.some(g => g.isVisible), isGroup: true });
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
                                            <DefaultText>{item.name}</DefaultText>
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
                    showCreateRide || (isEditableRide && ride.isRecorded === false)
                        ? <TouchableOpacity style={[styles.bullseye, { marginTop: MAP_VIEW_TOP_OFFSET }]} onPress={this.onBullseyePress}>
                            <NBIcon name='target' type='MaterialCommunityIcons' style={{ fontSize: BULLSEYE_SIZE, color: '#2890FB' }} />
                        </TouchableOpacity>
                        : null
                }
                {
                    !isSearchingAToB && isEditableMap
                        ? <View style={{ position: 'absolute', zIndex: 100, left: 5, top: 140, width: 55 }}>
                            <TouchableOpacity style={{ width: widthPercentageToDP(10), height: widthPercentageToDP(15) }} onPress={this.showMapControls}>
                                <Image source={require('../../assets/img/arrow-right.png')} style={{ flex: 1, width: null, height: null }} />
                            </TouchableOpacity>
                        </View>
                        : null
                }
                <Animated.View style={[{ left: 5, elevation: 10, position: 'absolute', zIndex: 100, top: 140, width: 55 }, { transform: [{ translateX: controlsBarLeftAnim }] }]}>
                    <TouchableOpacity style={{ backgroundColor: '#fff', flex: 1, height: widthPercentageToDP(15) }} onPress={this.hideMapControls}>
                        <Image source={require('../../assets/img/arrow-left.png')} style={{ flex: 1, width: null, height: null }} />
                    </TouchableOpacity>
                    {
                        canUndoRide || canRedoRide
                            ? <View>
                                <IconButton style={[styles.mapControlButton, styles.topBorder]} iconProps={{ name: 'md-undo', type: 'Ionicons' }} onPress={this.onPressUndo} />
                                <IconButton style={[styles.mapControlButton, styles.topBorder]} iconProps={{ name: 'md-redo', type: 'Ionicons' }} onPress={this.onPressRedo} />
                            </View>
                            : null
                    }
                    <IconButton style={[styles.mapControlButton, styles.topBorder]} iconProps={{ name: 'zoom-in', type: 'Foundation' }} onPress={this.onPressZoomIn} />
                    <IconButton style={[styles.mapControlButton, styles.topBorder]} iconProps={{ name: 'zoom-out', type: 'Foundation' }} onPress={this.onPressZoomOut} />
                    <IconButton style={[styles.mapControlButton, styles.topBorder]} iconProps={{ name: 'target', type: 'MaterialCommunityIcons' }} onPress={this.onPressRecenterMap} />
                    {
                        this.state.isEditableRide
                            ? <IconButton style={[styles.mapControlButton, styles.topBorder]} iconProps={{ name: 'camera', type: 'MaterialCommunityIcons' }} onPress={this.onPressCamera} />
                            : null
                    }
                    {
                        ride.rideId
                            ? <IconButton style={[styles.mapControlButton, styles.topBorder]} iconProps={{ name: 'map-marker-circle', type: 'MaterialCommunityIcons' }} onPress={this.onPressBoundRideToScreen} />
                            : null
                    }
                </Animated.View>
                {
                    ride.rideId !== null && ride.isRecorded === false
                        ? <Animated.View style={[{ height: '100%', width: '100%', elevation: 10, position: 'absolute', zIndex: 600 }, { transform: [{ translateX: waypointListLeftAnim }] }]}>
                            <WaypointList isEditable={!ride.isRecorded && ride.userId === user.userId} refreshContent={this.state.refreshWaypointList} onPressOutside={() => this.hideWaypointList()} onCancel={() => this.hideWaypointList()} changeToCommentMode={this.onPressPointCommentOption} changeToItineraryMode={this.changeToItineraryMode} />
                        </Animated.View>
                        : null
                }
                {
                    this.state.commentMode
                        ? <Animated.View style={[{ height: '100%', width: '100%', elevation: 12, position: 'absolute', zIndex: 900 }, { transform: [{ translateY: this.state.commentSecAnim }] }]}>
                            <CommentSection isEditable={this.props.ride.userId === this.props.user.userId} showInEditMode={this.state.onWaypointList} index={activeMarkerIndex} onClose={this.hideCommentSection} />
                        </Animated.View>
                        : null
                }
                {
                    ride.rideId && !ride.isRecorded
                        ? <BasicButton title='DETAILS' style={styles.submitBtn} titleStyle={{ letterSpacing: 1.4, fontSize: 14, fontFamily: CUSTOM_FONTS.robotoBold }} onPress={() => this.syncRideWithServer(this.showItinerarySection)} />
                        : null
                }
                {
                    !ride.isRecorded && activeMarkerIndex > -1
                        ? <Animated.View style={[styles.controlsContainerRight, { transform: [{ translateX: optionsBarRightAnim }] }]}>
                            {
                                this.renderRidePointOptions()
                            }
                        </Animated.View>
                        : null
                }
                {
                    user.showCircle && mapRadiusCircle
                        ? <TouchableOpacity style={{ position: 'absolute', zIndex: 100, elevation: 10, bottom: 20, left: 20 }}>
                            <DefaultText style={{ fontSize: 50, fontWeight: 'bold' }}>{`${this.state.diameter}`}<DefaultText style={{ fontSize: 30 }}> {user.distanceUnit.toUpperCase()}</DefaultText></DefaultText>
                        </TouchableOpacity>
                        : null
                }
            </BasePage>
        );
    }
}

const mapStateToProps = (state) => {
    const { ride } = state.RideInfo.present;
    const { unsyncedRides } = state.RideList;
    const canUndoRide = state.RideInfo.past.length > 0;
    const canRedoRide = state.RideInfo.future.length > 0;
    const { user, userAuthToken, deviceToken } = state.UserAuth;
    const { isLocationOn } = state.GPSState;
    const { notificationList, pageNumber } = state.NotificationList;
    const { totalUnseenMessage } = state.ChatList;
    const { friendsLocationList } = state.FriendList;
    const {spaceList} = state.GarageInfo;
    const { membersLocationList, friendGroupList } = state.FriendGroupList;
    const notificationCount=state.NotificationList.notificationList.totalUnseen
    const { appState, hasNetwork, lastApi, isRetryApi, jwtToken, showMenu, currentScreen } = state.PageState;
    return { ride, isLocationOn, user, userAuthToken, deviceToken, showMenu, friendsLocationList, membersLocationList, friendGroupList, currentScreen, canUndoRide, canRedoRide, notificationList, pageNumber, appState, hasNetwork, unsyncedRides, lastApi, isRetryApi, jwtToken, totalUnseenMessage,notificationCount,spaceList };
}

const mapDispatchToProps = (dispatch) => {
    return {
        apiLoaderActions:(value)=>dispatch(apiLoaderActions(value)),
        getGarageInfo: (userId, successCallback, errorCallback) => {
            dispatch(apiLoaderActions(true));
            getGarageInfo(userId).then(({ data: garage }) => {
                dispatch(apiLoaderActions(false));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                dispatch(replaceGarageInfoAction(garage));
            }).catch(error => {
                dispatch(apiLoaderActions(false));
                console.log(`getGarage error: `, error);
                handleServiceErrors(error, [userId, successCallback, errorCallback], 'getGarageInfo', true, true);
            });
        },
        toggleNetworkStatus: (status) => dispatch(toggleNetworkStatusAction(status)),
        updateDeviceLocationState: (locationState) => dispatch(deviceLocationStateAction(locationState)),
        hideAppNavMenu: () => dispatch(appNavMenuVisibilityAction(false)),
        resetPersonProfilePic: () => dispatch(resetPersonProfilePicAction()),
        removeTempLocation: () => dispatch(removeTempLocationAction()),
        removeTempMembersLocation: () => dispatch(removeTempMembersLocationAction()),
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        changeScreen: (screenKey) => dispatch(screenChangeAction(screenKey)),
        getPostTypes: () => dispatch(getPostTypes()),
        clearRideFromMap: () => dispatch(initUndoRedoAction()),
        submitNewRide: (rideInfo) => dispatch(createNewRide(rideInfo)),
        updateRide: (data) => dispatch(updateRideAction(data)),
        publishEvent: (eventBody) => publishEvent(eventBody),
        pushNotification: (userId) => pushNotification(userId),
        updateLocation: (userId, locationInfo) => updateLocation(userId, locationInfo),
        getAllNotifications: (userId, pageNumber, date, comingFrom, successCallback, errorCallback) => dispatch(getAllNotifications(userId, pageNumber, date, comingFrom, successCallback, errorCallback)),
        getAllChats: (userId) => dispatch(getAllChats(userId)),
        readNotification: (userId, notificationId) => dispatch(readNotification(userId, notificationId)),
        deleteNotifications: (notificationIds) => dispatch(deleteNotifications(notificationIds)),
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
        addTrackpoints: (isNetworkChangeed, actualPoints, trackpoints, distance, ride, userId, successCallback, errorCallback) => dispatch(addTrackpoints(isNetworkChangeed, actualPoints, trackpoints, distance, ride, userId, successCallback, errorCallback)),
        pauseRecordRide: (isNetworkChangeed, gpsPoints, pauseTime, actualPoints, trackpoints, distance, ride, userId, loadRide, successCallback, errorCallback,timeCount) => dispatch(pauseRecordRide(isNetworkChangeed, gpsPoints, pauseTime, actualPoints, trackpoints, distance, ride, userId, false, successCallback, errorCallback,timeCount)),
        continueRecordRide: (resumeTime, ride, userId, successCallback, errorCallback) => dispatch(continueRecordRide(resumeTime, ride, userId, successCallback, errorCallback)),
        completeRecordRide: (isNetworkChangeed, gpsPoints, endTime, actualPoints, trackpoints, distance, ride, userId, loadRide, successCallback, errorCallback,timeCount) => dispatch(completeRecordRide(isNetworkChangeed, gpsPoints, endTime, actualPoints, trackpoints, distance, ride, userId, loadRide, successCallback, errorCallback,timeCount)),
        getRideByRideId: (rideId) => dispatch(getRideByRideId(rideId)),
        resetPersonProfile: () => dispatch(resetPersonProfileAction()),
        resetCurrentGroup: () => dispatch(resetCurrentGroupAction()),
        doUndo: () => dispatch(undoLastAction()),
        doRedo: () => dispatch(redoLastAction()),
        logoutUser: (userId, accessToken, deviceToken, successCallback, errorCallback) => dispatch(logoutUser(userId, accessToken, deviceToken, successCallback, errorCallback)),
        updateSourceOrDestination: (identifier, locationName) => dispatch(updateSourceOrDestinationAction({ identifier, updates: { name: locationName } })),
        updateWaypointName: (waypointId, locationName) => dispatch(updateWaypointNameAction({ waypointId, locationName })),
        hideFriendsLocation: (userId) => dispatch(hideFriendsLocationAction(userId)),
        hideMembersLocation: (groupId) => dispatch(hideMembersLocationAction(groupId)),
        getFriendsLocationList: (userId, friendsIdList) => dispatch(getFriendsLocationList(userId, friendsIdList)),
        getAllMembersLocation: (groupId, userId) => dispatch(getAllMembersLocation(groupId, userId)),
        getAllMembersAndFriendsLocationList: (userId, ids) => dispatch(getAllMembersAndFriendsLocationList(userId, ids)),
        updateAppState: (appState) => dispatch(updateAppStateAction({ appState })),
        resetStoreToDefault: () => dispatch(resetStateOnLogout()),
        resetChatMessage: () => dispatch(resetChatMessageAction()),
        addUnsyncedRide: (unsyncedRideId) => dispatch(addUnsyncedRideAction(unsyncedRideId)),
        deleteUnsyncedRide: (unsyncedRideId) => dispatch(deleteUnsyncedRideAction(unsyncedRideId)),
        retryLastApi: (api, params) => dispatch(api(...params)),
        retryLastApiWithoutDispatch: (api, params) => api(...params),
        resetCurrentPassenger: () => dispatch(resetCurrentPassengerAction()),
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'map', isRetryApi: state })),
        goToPrevProfile: () => dispatch(goToPrevProfileAction()),
        sendingTestData: (data) => sendingTestData(data).then(res => {

        }).catch(er => {
            errorCallback(er);
            console.log('sendingTestData error  : ', er)
        }),
        getUserProfilePicture: (pictureId) => getPicture(pictureId, ({ picture }) => {
            dispatch(updateUserAction({ thumbnailProfilePicture: picture }))
        }, (error) => {
            dispatch(updateUserAction({}))
        }),
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
        textOffset: IS_ANDROID ? [0, -1.5] : [0, -1.5],
        // textHaloColor: 'rgba(235, 134, 30, 0.9)',
    },
    recordRideRoute: {
        lineWidth: 5,
        lineJoin: MapboxGL.LineJoin.Round,
        lineCap: MapboxGL.LineCap.Butt,
        visibility: 'visible',
        lineOpacity: 0.5,
        lineColor: MapboxGL.StyleSheet.identity('lineColor')
    },
    clusterCount: {
        textField: '{point_count}',
        textColor: '#fff',
        textSize: 12,
        textPitchAlignment: 'map',
    },
    clusteredPoints: {
        circlePitchAlignment: 'map',
        circleColor: MapboxGL.StyleSheet.source(
            [
                [25, APP_COMMON_STYLES.headerColor],
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
        circleStrokeWidth: 5,
        circleStrokeColor: 'rgba(20,104,172, 1)',
        circleStrokeOpacity: 0.35
    },
});