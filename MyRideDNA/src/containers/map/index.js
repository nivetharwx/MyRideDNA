import React, { Component } from 'react';
import {
    SafeAreaView, View, TouchableOpacity, Alert,
    Keyboard, Image, BackHandler, Animated,
    DeviceEventEmitter, Text, AsyncStorage, StatusBar
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
import { BULLSEYE_SIZE, MAP_ACCESS_TOKEN, JS_SDK_ACCESS_TOKEN, PageKeys, WindowDimensions, RIDE_BASE_URL, IS_ANDROID, RECORD_RIDE_STATUS, ICON_NAMES, APP_COMMON_STYLES } from '../../constants';
import { clearRideAction, deviceLocationStateAction, appNavMenuVisibilityAction, screenChangeAction } from '../../actions';
import { SearchBox } from '../../components/inputs';
import { SearchResults } from '../../components/pages';
import { Actions } from 'react-native-router-flux';
import { MapControlPair, BasicButton, IconButton, ShifterButton, LinkButton } from '../../components/buttons';
import { IconLabelPair } from '../../components/labels';

import Base64 from '../../util';

import styles from './styles';

import DEFAULT_WAYPOINT_ICON from '../../assets/img/location-pin-red-small.png';
import SELECTED_WAYPOINT_ICON from '../../assets/img/location-pin-green-small.png';
import DEFAULT_SOURCE_ICON from '../../assets/img/source-pin-red.png';
import SELECTED_SOURCE_ICON from '../../assets/img/source-pin-green.png';
import DEFAULT_DESTINATION_ICON from '../../assets/img/destination-pin-red.png';
import SELECTED_DESTINATION_ICON from '../../assets/img/destination-pin-green.png';

import { updateRide, addWaypoint, addSource, createRecordRide, pauseRecordRide, updateWaypoint, updateSource, updateDestination, makeWaypointAsDestination, makeDestinationAsWaypoint, makeSourceAsWaypoint, makeWaypointAsSource, continueRecordRide, addTrackpoints, completeRecordRide, deleteWaypoint, deleteDestination, deleteSource, getRideByRideId, createNewRide } from '../../api';

import Bubble from '../../components/bubble';
import MenuModal from '../../components/modal';
import { BasicHeader } from '../../components/headers';
import { CreateRide } from '../create-ride';

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


export class Map extends Component {
    _mapView = null;
    _searchRef = null;
    locationPermission = null;
    watchID = null;
    isLocationOn = false;
    gpsPointTimestamps = [];
    rootScreen = PageKeys.MAP;
    mapCircleTimeout = null;
    bottomLeftDefaultPoint = null;
    constructor(props) {
        super(props);
        this.state = {
            mapZoomLevel: 15,
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
            radius: 0,
            calloutOffsets: [],
            showCreateRide: false
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
                updatedState.directions = null;
                updatedState.markerCollection = {
                    ...this.state.markerCollection,
                    features: []
                };
                if (ride.isRecorded === false && ride.userId === this.props.user.userId) {
                    updatedState.isEditable = true;
                } else {
                    updatedState.isEditable = false;
                }

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
                        updatedState.markerCollection.features = ride.waypoints.reduce((arr, loc) => {
                            arr.push(this.createMarkerFeature([loc.lng, loc.lat], ICON_NAMES.WAYPOINT_DEFAULT));
                            return arr;
                        }, [...updatedState.markerCollection.features]);
                    }

                    if (ride.destination) {
                        const destinationMarker = this.createMarkerFeature([ride.destination.lng, ride.destination.lat], ICON_NAMES.DESTINATION_DEFAULT);
                        updatedState.markerCollection.features = [...updatedState.markerCollection.features, destinationMarker];
                    }
                }
            } else {
                if (ride.isRecorded && (this.props.ride.status != ride.status)) {
                    if (ride.status != null && (ride.status != RECORD_RIDE_STATUS.RUNNING || this.props.ride.status != null)) {
                        this.onChangeRecordRideStatus(ride.status);
                    }
                }
            }
        }
        if (this.props.currentScreen !== currentScreen && currentScreen !== Actions.currentScene) {
            currentScreen !== this.rootScreen
                ? Actions.push(currentScreen, {})
                : Actions.popTo(currentScreen, {})
        }
        if (Object.keys(updatedState).length > 0) {
            this.setState(updatedState, () => {
                // DOC: Fetch route for build ride if waypoints are more than one
                if (!ride.isRecorded && updatedState.markerCollection && updatedState.markerCollection.features.length > 1) {
                    this.fetchDirections();
                }
            });
        }
    }

    toggleAppNavigation = () => this.props.showMenu ? this.props.hideAppNavMenu() : this.props.showAppNavMenu();

    onCloseAppNavMenu = () => this.props.hideAppNavMenu();

    onPressAppNavMenu = (screenKey) => this.props.changeScreen(screenKey);

    async componentDidMount() {
        //DOC: Listen for device location settings change
        // DeviceEventEmitter.addListener(RNSettings.GPS_PROVIDER_EVENT, this.handleGPSProviderEvent);

        BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPress);

        this.locationPermission = await Permissions.request('location');
        if (this.locationPermission === 'authorized') {
            this.getCurrentLocation();
            // this.watchLocation();
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

    getCurrentLocation = async () => {
        Geolocation.getCurrentPosition(
            ({ coords }) => {
                this.setState({ currentLocation: { location: [coords.longitude, coords.latitude], name: '' } });
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
        this.watchID = setInterval(() => {
            Geolocation.getCurrentPosition(
                ({ coords }) => {
                    if (this.state.currentLocation === null || this.state.currentLocation.location.join('') != (coords.longitude + '' + coords.latitude)) {
                        const { gpsPointCollection } = this.state;
                        const feature = gpsPointCollection.features[0];
                        let points = [...feature.geometry.coordinates, [coords.longitude, coords.latitude]];
                        trackpointTick++;
                        if (trackpointTick === (this.props.user.timeIntervalInSeconds || 5)) {
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
        try {
            const response = await mapMatchingClient
                .getMatch({
                    points: gpsPoints.reduce((arr, coord) => {
                        arr.push({ coordinates: coord });
                        return arr
                    }, []),
                    // timestamps: gpsPointTimestamps,  // TODO: Failed the param timestamps in mapbox api
                    tidy: true,
                    geometries: 'geojson',
                })
                .send();
            const { matchings } = response.body;
            if (matchings.length === 0) {
                console.log("No matching coords found");
                callback(response.body, [], 0);
                return;
            }
            // TODO: Return distance and duration from matching object (here matchings[0])
            const trackpoints = matchings[0].geometry.coordinates.reduce((arr, coord, index) => {
                arr.push(coord[1], coord[0], gpsPointTimestamps[index]);
                return arr;
            }, []);
            callback(response.body, trackpoints, matchings[0].distance);
        } catch (er) {
            console.log(er);
        }
    }

    onBackButtonPress = () => {
        if (Actions.state.index != 0) {
            Actions.pop();
            this.props.changeScreen(Actions.currentScene);
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
        if (this.state.showCreateRide === false) {
            const mapZoomLevel = await this._mapView.getZoom();
            if (this.state.mapZoomLevel != mapZoomLevel) {
                const { circle, radius, coords } = this.getVisibleMapInfo(properties, geometry);
                this.setState({ mapZoomLevel, mapRadiusCircle: circle, radius: radius.toFixed(2) }, () => {
                    clearTimeout(this.mapCircleTimeout);
                    this.mapCircleTimeout = setTimeout(() => this.setState({ mapRadiusCircle: null }), 2500);
                });
            }
            // const { circle, radius } = this.getVisibleMapInfo(properties, geometry);
            // this.setState({ mapRadiusCircle: circle, radius: radius.toFixed(2) }, () => setTimeout(() => this.setState({ mapRadiusCircle: null }), 3000));
        }
    }

    getVisibleMapInfo(regionProp, regionGeo) {
        const bottomRight = [regionProp.visibleBounds[0][0], regionProp.visibleBounds[1][1]];
        const bottomLeft = regionProp.visibleBounds[1];
        const center = regionGeo.coordinates;
        const fromPoint = turfHelpers.point(bottomLeft);
        const toPoint = turfHelpers.point(bottomRight);
        const options = { units: 'kilometers' };
        const distanceBtwn = turfDistance(fromPoint, toPoint, options);
        const radius = distanceBtwn / 2;
        const mapRadiusCircle = turfCircle(center, radius, options);
        return { radius, circle: mapRadiusCircle };
    }

    toggleReplaceOption = () => this.setState({ isUpdatingWaypoint: !this.state.isUpdatingWaypoint });

    createMarkerFeature = (coords, iconName) => {
        return {
            type: 'Feature',
            id: coords.join(''),
            geometry: {
                type: 'Point',
                coordinates: coords,
            },
            properties: {
                icon: iconName || ICON_NAMES.WAYPOINT_DEFAULT,
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
        this.setState((prevState) => {
            const { features } = prevState.markerCollection;
            const undoActions = [...prevState.undoActions];
            const redoActions = [...prevState.redoActions];
            if (undoActions.length === 10) undoActions.shift();
            if (redoActions.length > 0) redoActions.splice(0);

            return {
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
            if (ride.source && index === 0) {
                this.props.deleteSource(ride);
            } else if (ride.destination && index === this.state.markerCollection.features.length - 2) {
                this.props.deleteDestination(ride);
            } else {
                const indexOnServer = index - 1;
                this.props.deleteWaypoint(ride, indexOnServer);
            }
            this.fetchDirections();
        });
    }

    makeWaypointAsSource = () => {
        const { activeMarkerIndex } = this.state;
        const { ride } = this.props;
        this.setState(prevState => {
            const { features } = prevState.markerCollection;
            return {
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
            this.fetchDirections();
        });
    }

    makeSourceAsWaypoint = () => {
        const { ride } = this.props;
        this.setState(prevState => {
            const { activeMarkerIndex } = prevState;
            const { features } = prevState.markerCollection;
            return {
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
            this.fetchDirections();
        });
    }

    makeWaypointAsDestination = () => {
        const { activeMarkerIndex } = this.state;
        const { ride } = this.props;
        this.setState(prevState => {
            const { activeMarkerIndex } = prevState;
            const { features } = prevState.markerCollection;
            return {
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
            this.fetchDirections();
        });
    }

    makeDestinationAsWaypoint = () => {
        const { ride } = this.props;
        this.setState(prevState => {
            const { activeMarkerIndex } = prevState;
            const { features } = prevState.markerCollection;
            return {
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
            this.fetchDirections();
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
        const newMarker = this.createMarkerFeature(mapCenter, markerIcon);

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
            const undoActions = [...prevState.undoActions];
            const redoActions = [...prevState.redoActions];
            if (undoActions.length === 10) undoActions.shift();
            if (redoActions.length > 0) redoActions.splice(0);
            undoActions.push({
                action: 'insert',
                opppositeAction: 'delete',
                actionFunctionName: 'addWaypointAtIndex',
                actionParams: { p1: index, p2: marker },
                oppositeActionFunctionName: 'deleteWaypointFromIndex',
                oppositeActionParams: { p1: index }
            });
            const prevMarker = features[this.state.activeMarkerIndex];
            const isDestinationSelected = this.isDestination(features[this.state.activeMarkerIndex]);
            return {
                markerCollection: {
                    ...prevState.markerCollection,
                    ...{
                        features: isDestinationSelected
                            ? [...features.slice(0, index), marker, { ...prevMarker, properties: { ...prevMarker.properties, icon: ICON_NAMES.DESTINATION_DEFAULT } }]
                            : [...features.slice(0, index), marker, ...features.slice(index)]
                    }
                },
                undoActions: undoActions,
                redoActions: redoActions,
                activeMarkerIndex: isDestinationSelected ? -1 : this.state.activeMarkerIndex
            }
        }, () => {
            // DOC: Call the callback function, if any.
            callback && callback();

            this.onCloseOptionsBar();
            const { ride } = this.props;
            let waypoint = { name: '', address: '', lat: marker.geometry.coordinates[1], lng: marker.geometry.coordinates[0] };
            if (!ride.source) {
                this.props.addSource(waypoint, ride);
            } else {
                const indexOnServer = index - 1;
                this.props.addWaypoint(waypoint, ride, indexOnServer);
            }
            this.fetchDirections();
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
                this.props.updateWaypoint(waypoint, ride, indexOnServer);
            }
            this.fetchDirections();
        });
    }

    onPressRecenterMap = (location, showBullseye) => {
        // this.setState({
        //     gpsPointCollection: {
        //         ...this.state.gpsPointCollection,
        //         ...{
        //             "type": "FeatureCollection", "features": [{
        //                 "type": "Feature", "geometry": {
        //                     "type": "LineString", "coordinates":
        //                         [[77.651344, 12.911957], [77.649152, 12.910999], [77.649218, 12.907848], [77.648865, 12.905623]]
        //                 }
        //             }]
        //         }
        //     },
        //     mapMatchinRoute: {
        //         "type": "FeatureCollection", "features": [{
        //             "type": "Feature", "geometry": {
        //                 "type": "LineString", "coordinates": [[77.651344, 12.911957],
        //                 [77.649043, 12.911912],
        //                 [77.649143, 12.911331],
        //                 [77.649152, 12.910999],
        //                 [77.649348, 12.908728],
        //                 [77.649218, 12.907848],
        //                 [77.649059, 12.907002],
        //                 [77.649042, 12.906533],
        //                 [77.648979, 12.906174],
        //                 [77.649002, 12.905715],
        //                 [77.648873, 12.905726],
        //                 [77.648865, 12.905623]]
        //             }
        //         }]
        //     },
        //     // directions: matchings[0]
        // });
        if (Array.isArray(location)) {
            this._mapView.flyTo(location, 500);
        } else if (this.state.currentLocation) {
            this._mapView.flyTo(this.state.currentLocation.location, 500);
        }
        // this.props.getRideByRideId(this.props.ride.rideId); // 5b8fd4f233db8371791bea06, 5b9bcc1e33db83297d119a7d, 5b9cfcab33db83297d119aaa
    }

    onPressZoomIn = () => {
        this.setState((prevState) => ({ mapZoomLevel: prevState.mapZoomLevel + 1 }),
            () => this._mapView.zoomTo(this.state.mapZoomLevel, 100));
    }

    onPressZoomOut = () => {
        this.setState((prevState) => ({ mapZoomLevel: prevState.mapZoomLevel - 1 }),
            () => this._mapView.zoomTo(this.state.mapZoomLevel, 100));
    }

    onPressUndo = () => {
        if (this.state.undoActions.length === 0) return;

        const undoActions = [...this.state.undoActions];
        const redoActions = [...this.state.redoActions];
        const lastIndex = undoActions.length - 1;
        let lastAction = undoActions[lastIndex];
        undoActions.splice(lastIndex, 1);
        redoActions.push(this.doSwap(lastAction));
        this.setState({ undoActions, redoActions },
            () => this[lastAction.actionFunctionName](lastAction.actionParams.p1, lastAction.actionParams.p2));
    }

    onPressRedo = () => {
        if (this.state.redoActions.length === 0) return;

        const undoActions = [...this.state.undoActions];
        const redoActions = [...this.state.redoActions];
        const lastIndex = redoActions.length - 1;
        let lastAction = redoActions[lastIndex];
        redoActions.splice(lastIndex, 1);
        undoActions.push(this.doSwap(lastAction));
        this.setState({ undoActions, redoActions },
            () => this[lastAction.actionFunctionName](lastAction.actionParams.p1, lastAction.actionParams.p2));
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
        const newMarker = this.createMarkerFeature(place.geometry.coordinates, markerIcon);

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

        this.setState({ showCreateRide: true });

        // this.watchID != null && clearInterval(this.watchID);
        // AsyncStorage.setItem('recordRidePath', JSON.stringify(this.state.gpsPointCollection));
        // AsyncStorage.setItem('recordPointTimestamps', JSON.stringify(this.gpsPointTimestamps));

        // this.setState({
        //     gpsPointCollection: {
        //         ...this.state.gpsPointCollection,
        //         ...{ "type": "FeatureCollection", "features": [{ "type": "Feature", "geometry": { "type": "LineString", "coordinates": [[77.6526567, 12.9126067], [77.6526567, 12.9126067], [77.6526567, 12.9126067], [77.6516437, 12.9146619], [77.6516437, 12.9146619], [77.6520067, 12.911325], [77.6520067, 12.911325], [77.6520067, 12.911325], [77.6533969, 12.9098469], [77.6533969, 12.9098469], [77.6533969, 12.9098469], [77.6533969, 12.9098469], [77.6533969, 12.9098469], [77.6516437, 12.9146619], [77.6516437, 12.9146619]] } }] }
        //     },
        //     // mapMatchinRoute: { "type": "FeatureCollection", "features": [{ "type": "Feature", "geometry": { "type": "LineString", "coordinates": [[77.652604, 12.912557], [77.651892, 12.911474], [77.653386, 12.909838], [77.651896, 12.911372], [77.653579, 12.912393]] } }] },
        //     directions: { "confidence": 5.398283819957328e-9, "geometry": { "coordinates": [[77.652658, 12.912558], [77.65186, 12.912542], [77.651896, 12.911372], [77.652007, 12.911373], [77.652007, 12.911373], [77.652007, 12.911373], [77.65356, 12.911416], [77.653387, 12.909848], [77.653387, 12.909848], [77.653387, 12.909848]], "type": "LineString" }, "legs": [{ "summary": "", "weight": 92.7, "duration": 65.4, "steps": [], "distance": 228.8 }, { "summary": "", "weight": 0, "duration": 0, "steps": [], "distance": 0 }, { "summary": "", "weight": 0, "duration": 0, "steps": [], "distance": 0 }, { "summary": "", "weight": 191, "duration": 141.1, "steps": [], "distance": 343.9 }, { "summary": "", "weight": 0, "duration": 0, "steps": [], "distance": 0 }, { "summary": "", "weight": 0, "duration": 0, "steps": [], "distance": 0 }], "weight_name": "routability", "weight": 283.7, "duration": 206.5, "distance": 572.7 }
        // });


        // mapMatchingClient
        //     .getMatch({
        //         points: [[77.6526053, 12.9127161], [77.652008, 12.9123407], [77.6517796, 12.9119714], [77.6518378, 12.9118826], [77.6523563, 12.9114709], [77.6525564, 12.9113683], [77.6534699, 12.9114137], [77.6533004, 12.9121327], [77.6534368, 12.9126408], [77.6529647, 12.912626]]
        //             .reduce((arr, coord) => {
        //                 arr.push({ coordinates: coord });
        //                 return arr
        //             }, []),
        //         // timestamps: this.gpsPointTimestamps,  // FIXME: Failed the param timestamps in mapbox api
        //         tidy: true,
        //         geometries: 'geojson',
        //     })
        //     .send()
        //     .then(response => {
        //         this.gpsPointTimestamps.length = 0; // DOC: Resetting gpsPointTimestamps array to empty.
        //         console.log(JSON.stringify(response.body));
        //         const { matchings } = response.body;
        //         this.setState({
        //             gpsPointCollection: {
        //                 ...this.state.gpsPointCollection,
        //                 ...{ "type": "FeatureCollection", "features": [{ "type": "Feature", "geometry": { "type": "LineString", "coordinates": [[77.6526053, 12.9127161], [77.652008, 12.9123407], [77.6517796, 12.9119714], [77.6518378, 12.9118826], [77.6523563, 12.9114709], [77.6525564, 12.9113683], [77.6534699, 12.9114137], [77.6533004, 12.9121327], [77.6534368, 12.9126408], [77.6529647, 12.912626]] } }] }
        //             },
        //             // mapMatchinRoute: { "type": "FeatureCollection", "features": [{ "type": "Feature", "geometry": { "type": "LineString", "coordinates": [[77.652604, 12.912557], [77.651892, 12.911474], [77.653386, 12.909838], [77.651896, 12.911372], [77.653579, 12.912393]] } }] },
        //             directions: matchings[0]
        //         });
        //     })
    }

    onPressRecordRide = () => {
        console.log("RecordRide called");
        // this.watchLocation(); // FIXME: Remove this and Uncomment following

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
                        lat: currentLocation.location[1],
                        lng: currentLocation.location[0],
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
        console.log("PauseRide called");
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
        console.log("StopRide called");
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
        this.props.clearRideFromMap();
    }

    componentWillUnmount() {
        console.log("Map unmounted");
        // DeviceEventEmitter.removeListener(RNSettings.GPS_PROVIDER_EVENT, this.handleGPSProviderEvent);
        // this.watchID != null && Geolocation.clearWatch(this.watchID);
        this.watchID != null && clearInterval(this.watchID);
        BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPress);
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

        // this.setState({ calloutOffsets: [properties.screenPointX, properties.screenPointY] });

        // let geoCoordinate = await this._mapView.getCoordinateFromView([properties.screenPointX, properties.screenPointY]);
        // console.log("WindowDimensions: ", WindowDimensions);
        // console.log("viewCoordinate: ", viewCoordinate = [viewCoordinate[1], viewCoordinate[0]]);
        // console.log("geoCoordinate: ", geoCoordinate);
        // console.log("coords: ", coords);
        // if (this.state.isEditable) {
        //     this.addMarkerFeature(geometry.coordinates);
        // }
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

    onCloseOptionsBar = () => {
        const { markerCollection, activeMarkerIndex } = this.state;
        if (activeMarkerIndex === -1) {
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
        this.setState({
            markerCollection: {
                ...markerCollection,
                features: this.changeDataAtIndex(markerCollection.features, activeMarkerIndex,
                    { ...prevMarker, properties: { ...prevMarker.properties, icon: defaultIcon } })
            },
            activeMarkerIndex: -1
        }, () => {
            Animated.timing(
                this.state.optionsBarRightAnim,
                {
                    toValue: 100,
                    duration: 500,
                    useNativeDriver: true
                }
            ).start()
        });
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
            if (activeMarkerIndex === 0 && ride.source) {
                selectedIcon = ICON_NAMES.SOURCE_DEFAULT;
            } else if (isDestinationSelected) {
                selectedIcon = ICON_NAMES.DESTINATION_DEFAULT;
            }
            const prevMarker = markerCollection.features[activeMarkerIndex];
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

    render() {
        const { mapViewHeight, directions, markerCollection, activeMarkerIndex, gpsPointCollection, controlsBarLeftAnim, showCreateRide, currentLocation,
            searchResults, searchQuery, isEditable, snapshot, hideRoute, optionsBarRightAnim, isUpdatingWaypoint, mapRadiusCircle } = this.state;
        const { ride, showMenu, showLoader, user } = this.props;
        const MAP_VIEW_TOP_OFFSET = showCreateRide ? (CREATE_RIDE_CONTAINER_HEIGHT - WINDOW_HALF_HEIGHT) + (mapViewHeight / 2) - (BULLSEYE_SIZE / 2) : (isEditable ? 130 : 60) + (mapViewHeight / 2) - (BULLSEYE_SIZE / 2);
        return (
            <View style={{ flex: 1 }}>
                {/* <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View> */}
                <MenuModal isVisible={showMenu} onClose={this.onCloseAppNavMenu} onPressNavMenu={this.onPressAppNavMenu} alignCloseIconLeft={user.handDominance === 'left'} />
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
                                            ? <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                                                <LinkButton style={{ paddingVertical: 20 }} title='+ RIDE' titleStyle={{ color: '#fff', fontSize: 16 }} onPress={this.createRide} />
                                                <LinkButton style={{ paddingVertical: 20 }} title='RECORD RIDE' titleStyle={{ color: '#fff', fontSize: 16 }} onPress={this.onPressRecordRide} />
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
                                    <IconLabelPair iconProps={{ name: 'road-variant', type: 'MaterialCommunityIcons' }} text={this.getDistanceAsFormattedString(directions ? directions.distance : null, 'KM')}
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
                                cancelPopup={() => this.setState({ showCreateRide: false }, () => this.onPressRecenterMap())} />
                            : null
                    }
                    <MapboxGL.MapView
                        styleURL={MapboxGL.StyleURL.Street}
                        zoomLevel={15}
                        centerCoordinate={[
                            77.651657,
                            12.913511
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
                            this.state.mapMatchinRoute ?
                                <MapboxGL.ShapeSource id='mapMatchingLayer' shape={this.state.mapMatchinRoute}>
                                    <MapboxGL.LineLayer id='mapMatchingPath' style={[{ lineColor: 'green', lineWidth: 3, lineCap: MapboxGL.LineCap.Butt, visibility: 'visible' }, hideRoute ? MapboxStyles.hideRoute : null]} />
                                </MapboxGL.ShapeSource>
                                : null
                        }
                        {
                            gpsPointCollection.features[0].geometry.coordinates.length >= 2 ?
                                <MapboxGL.ShapeSource id='recordRidePathLayer' shape={gpsPointCollection}>
                                    <MapboxGL.LineLayer id='recordRidePath' style={[{ lineColor: 'red', lineWidth: 1, lineCap: MapboxGL.LineCap.Butt, visibility: 'visible' }, hideRoute ? MapboxStyles.hideRoute : null]} />
                                </MapboxGL.ShapeSource>
                                : null
                        }
                        {/* <MapboxGL.ShapeSource id='markers' shape={markerCollection} onPress={this.onPressMarker}>
                            <MapboxGL.SymbolLayer id="waypoint" style={MapboxStyles.symbol} />
                        </MapboxGL.ShapeSource> */}
                        {
                            mapRadiusCircle
                                ? <MapboxGL.ShapeSource id='routeSource' shape={mapRadiusCircle}>
                                    <MapboxGL.LineLayer id='routeFill' style={MapboxStyles.circleOutline} />
                                    {/* <MapboxGL.CircleLayer id='circleFill' style={[MapboxStyles.circleRoute, { circleRadius: parseFloat(this.state.radius) }]} /> */}
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
                                    <MapboxGL.SymbolLayer id="exampleIconName" style={MapboxStyles.icon} />
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
                        <IconButton style={[styles.mapControlButton, { backgroundColor: 'transparent' }]} iconProps={{ name: 'controller-play', type: 'Entypo', style: { fontSize: 40, elevation: 10 } }} onPress={this.showMapControls} />
                    </View>
                    <Animated.View style={[{ left: 5, elevation: 10, position: 'absolute', zIndex: 100, top: 140, width: 55 }, { transform: [{ translateX: controlsBarLeftAnim }] }]}>
                        <IconButton style={styles.mapControlButton} iconProps={{ name: 'controller-play', type: 'Entypo', style: { fontSize: 40, elevation: 10, transform: [{ rotate: '180deg' }] } }} onPress={this.hideMapControls} />
                        {
                            this.state.undoActions.length > 0 || this.state.redoActions.length > 0
                                ? <View>
                                    <IconButton style={[styles.mapControlButton, styles.topBorder]} iconProps={{ name: 'md-undo', type: 'Ionicons' }} onPress={this.onPressUndo} />
                                    <IconButton style={[styles.mapControlButton, styles.topBorder]} iconProps={{ name: 'md-redo', type: 'Ionicons' }} onPress={this.onPressRedo} />
                                </View>
                                : null
                        }
                        <IconButton style={[styles.mapControlButton, styles.topBorder]} iconProps={{ name: 'zoom-in', type: 'Foundation' }} onPress={this.onPressZoomIn} />
                        <IconButton style={[styles.mapControlButton, styles.topBorder]} iconProps={{ name: 'zoom-out', type: 'Foundation' }} onPress={this.onPressZoomOut} />
                        <IconButton style={[styles.mapControlButton, styles.topBorder]} iconProps={{ name: 'target', type: 'MaterialCommunityIcons' }} onPress={this.onPressRecenterMap} />
                        {/* <IconButton style={styles.mapControlButton} iconProps={{ name: 'arrow-left-bold-circle', type: 'MaterialCommunityIcons', style: styles.whiteColor }} onPress={this.hideMapControls} />
                        <IconButton style={[styles.mapControlButton, styles.buttonGap]} iconProps={{ name: 'md-undo', type: 'Ionicons', style: styles.whiteColor }} onPress={this.onPressUndo} />
                        <IconButton style={[styles.mapControlButton, styles.buttonGap]} iconProps={{ name: 'md-redo', type: 'Ionicons', style: styles.whiteColor }} onPress={this.onPressRedo} />
                        <IconButton style={[styles.mapControlButton, styles.buttonGap]} iconProps={{ name: 'zoom-in', type: 'Foundation', style: styles.whiteColor }} onPress={this.onPressZoomIn} />
                        <IconButton style={[styles.mapControlButton, styles.buttonGap]} iconProps={{ name: 'zoom-out', type: 'Foundation', style: styles.whiteColor }} onPress={this.onPressZoomOut} />
                        <IconButton style={[styles.mapControlButton, styles.buttonGap]} iconProps={{ name: 'target', type: 'MaterialCommunityIcons', style: styles.whiteColor }} onPress={this.onPressRecenterMap} /> */}
                    </Animated.View>
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
                                    <IconLabelPair iconProps={{ name: 'road-variant', type: 'MaterialCommunityIcons' }} text={this.getDistanceAsFormattedString(directions ? directions.distance : null, 'km')} />
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
                                    <IconButton onPress={this.onCloseOptionsBar} style={{ paddingVertical: 5, backgroundColor: '#fff' }}
                                        iconProps={{ name: 'window-close', type: 'MaterialCommunityIcons' }} />
                                    <IconButton onPress={this.toggleReplaceOption} style={{ paddingVertical: 5, borderColor: '#acacac', borderTopWidth: 1, borderBottomWidth: 1 }}
                                        iconProps={{ name: isUpdatingWaypoint ? 'cancel' : 'edit-location', type: 'MaterialIcons' }} />
                                    {
                                        markerCollection.features.length > 1
                                            ? this.isSource(markerCollection.features[activeMarkerIndex])
                                                ? <IconButton onPress={this.makeSourceAsWaypoint}
                                                    style={{ paddingVertical: 5, paddingHorizontal: 17, backgroundColor: '#0083CA', borderColor: '#acacac', borderTopWidth: 1, borderBottomWidth: 1 }}
                                                    iconProps={{ name: 'map-pin', type: 'FontAwesome', style: { color: '#fff' } }} />

                                                : <IconButton onPress={this.makeWaypointAsSource}
                                                    style={{ paddingVertical: 5, paddingHorizontal: 17, borderColor: '#acacac', borderTopWidth: 1, borderBottomWidth: 1 }}
                                                    iconProps={{ name: 'map-pin', type: 'FontAwesome' }} />
                                            : null
                                    }
                                    {
                                        markerCollection.features.length > 1
                                            ? this.isDestination(markerCollection.features[activeMarkerIndex])
                                                ? <IconButton onPress={this.makeDestinationAsWaypoint}
                                                    style={{ paddingVertical: 5, backgroundColor: '#0083CA', borderBottomColor: '#acacac', borderBottomWidth: 1 }}
                                                    iconProps={{ name: 'flag-variant', type: 'MaterialCommunityIcons', style: { color: '#fff' } }} />
                                                : <IconButton onPress={this.makeWaypointAsDestination}
                                                    style={{ paddingVertical: 5, backgroundColor: 'rgba(0,0,0,0.4)', borderBottomColor: '#acacac', borderBottomWidth: 1 }}
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
                    mapRadiusCircle
                        ? <TouchableOpacity style={{ position: 'absolute', zIndex: 100, elevation: 10, bottom: 20, left: 20 }}>
                            <Text style={{ fontSize: 50, fontWeight: 'bold' }}>{`${this.state.radius}`}<Text style={{ fontSize: 30 }}> KM</Text></Text>
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
    const { ride } = state.RideInfo;
    const { user } = state.UserAuth;
    const { isLocationOn } = state.GPSState;
    const { showLoader } = state.PageState;
    return { ride, isLocationOn, user, showMenu, currentScreen, showLoader };
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateDeviceLocationState: (locationState) => dispatch(deviceLocationStateAction(locationState)),
        hideAppNavMenu: () => dispatch(appNavMenuVisibilityAction(false)),
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        changeScreen: (screenKey) => dispatch(screenChangeAction(screenKey)),
        clearRideFromMap: () => dispatch(clearRideAction()),
        updateRide: (data) => dispatch(updateRide(data)),
        addSource: (waypoint, ride) => dispatch(addSource(waypoint, ride)),
        updateSource: (waypoint, ride) => dispatch(updateSource(waypoint, ride)),
        deleteSource: (ride) => dispatch(deleteSource(ride)),
        addWaypoint: (waypoint, ride, index) => dispatch(addWaypoint(waypoint, ride, index)),
        updateWaypoint: (waypoint, ride, index) => dispatch(updateWaypoint(waypoint, ride, index)),
        deleteWaypoint: (ride, index) => dispatch(deleteWaypoint(ride, index)),
        updateDestination: (waypoint, ride) => dispatch(updateDestination(waypoint, ride)),
        deleteDestination: (ride) => dispatch(deleteDestination(ride)),
        makeWaypointAsSource: (ride, index) => dispatch(makeWaypointAsSource(ride, index)),
        makeSourceAsWaypoint: (ride) => dispatch(makeSourceAsWaypoint(ride)),
        makeWaypointAsDestination: (ride, index) => dispatch(makeWaypointAsDestination(ride, index)),
        makeDestinationAsWaypoint: (ride) => dispatch(makeDestinationAsWaypoint(ride)),
        createRecordRide: (rideInfo) => dispatch(createRecordRide(rideInfo)),
        addTrackpoints: (trackpoints, distance, ride, userId) => dispatch(addTrackpoints(trackpoints, distance, ride, userId)),
        pauseRecordRide: (pauseTime, trackpoints, distance, ride, userId) => dispatch(pauseRecordRide(pauseTime, trackpoints, distance, ride, userId)),
        continueRecordRide: (resumeTime, ride, userId) => dispatch(continueRecordRide(resumeTime, ride, userId)),
        completeRecordRide: (endTime, trackpoints, distance, ride, userId) => dispatch(completeRecordRide(endTime, trackpoints, distance, ride, userId)),
        getRideByRideId: (rideId) => dispatch(getRideByRideId(rideId)),
        submitNewRide: (rideInfo) => dispatch(createNewRide(rideInfo))
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
        iconSize: IS_ANDROID ? 1 : 2,
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
    }
});