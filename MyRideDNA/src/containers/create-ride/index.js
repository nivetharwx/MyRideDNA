import React, { Component } from 'react';
import {
    Platform,
    View,
    ScrollView,
    Keyboard
} from 'react-native';
import { connect } from 'react-redux';

import { Switch } from 'react-native-switch';

import { RideInfo } from '../../model/map-models';
import { BasicHeader } from '../../components/headers';
import { IconicInput, SearchBox } from '../../components/inputs';
import styles from './styles';
import { Actions } from 'react-native-router-flux';
import { createNewRide } from '../../api';

import Geolocation from 'react-native-geolocation-service';
import { SwitchIconButton, LinkButton } from '../../components/buttons';
import { IconLabelPair } from '../../components/labels';

import { Icon as NBIcon } from 'native-base';
import { WindowDimensions, JS_SDK_ACCESS_TOKEN, IS_ANDROID, widthPercentageToDP } from '../../constants';
import { SearchResults } from '../../components/pages';

const ANDROID_HEADER_HEIGHT = 50;
const IOS_HEADER_HEIGHT = 90;
const HEADER_HEIGHT = IS_ANDROID ? ANDROID_HEADER_HEIGHT : IOS_HEADER_HEIGHT;
const FORM_AREA_HEIGHT = (WindowDimensions.height / 2) - HEADER_HEIGHT;
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: JS_SDK_ACCESS_TOKEN });
export class CreateRide extends Component {
    constructor(props) {
        super(props);
        this.state = {
            privacyMode: 'private',
            rideName: '',
            ride: new RideInfo(props.ride),
            searchQuery: 'Current location',
            placeSearchList: [],
            startRideFrom: null
        };
    }

    componentDidMount() {
        if (this.props.currentLocation === null) {
            Geolocation.getCurrentPosition(
                ({ coords }) => {
                    this.props.onChangeStartRideFrom([coords.longitude, coords.latitude]);
                    this.setState({
                        currentLocation: {
                            name: '',
                            lat: coords.latitude,
                            lng: coords.longitude
                        },
                        startRideFrom: {
                            name: '',
                            lat: coords.latitude,
                            lng: coords.longitude
                        }
                    });
                },
                (error) => {
                    console.log(error.code, error.message);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        } else {
            const { currentLocation } = this.props;
            this.setState({
                currentLocation: {
                    name: currentLocation.name,
                    lat: currentLocation.location[1],
                    lng: currentLocation.location[0]
                },
                startRideFrom: {
                    name: currentLocation.name,
                    lat: currentLocation.location[1],
                    lng: currentLocation.location[0]
                }
            });
        }
        // TODO: Call geocoding API to get address of the location
    }

    onPressBackButton = () => {
        // Actions.pop();
        this.props.cancelPopup();
    }

    onChangeRideName = (name) => {
        const { ride } = this.state;
        this.setState({ ride: { ...ride, name } });
    }

    onChangePrivacyMode = (isPrivate) => {
        this.setState({ ride: { ...this.state.ride, privacyMode: isPrivate ? 'private' : 'public' } });
    }

    onSearchPlace = async (placeQuery) => {
        if (placeQuery === 'Current location' || (this.state.startRideFrom && this.state.startRideFrom.name === placeQuery)) return;
        this.setState({ searchQuery: placeQuery });
        if (placeQuery.length < 2) return;

        const lastCharacter = placeQuery.slice(-1);
        if (lastCharacter === ' ') return;
        const response = await geocodingClient.forwardGeocode({
            query: placeQuery,
            limit: 10
        }).send();
        this.setState({ placeSearchList: response.body.features });
    }

    onSelectPlace = (place) => {
        // DOC: Useful keys: place.geometry.coordinates and place.place_name
        Keyboard.dismiss();
        this.setState({
            startRideFrom: { name: place.place_name, lat: place.geometry.coordinates[1], lng: place.geometry.coordinates[0] },
            searchQuery: place.place_name,
            placeSearchList: [],
        }, () => this.props.onChangeStartRideFrom(place.geometry.coordinates));
    }

    onPressSearchResultsClose = () => {
        Keyboard.dismiss();
        if (this.state.startRideFrom === null || this.state.startRideFrom.name !== this.state.searchQuery) {
            this.setState({ placeSearchList: [], searchQuery: '' });
        } else {
            this.setState({ placeSearchList: [] });
        }
    }

    onSubmitForm = () => {
        const { ride, startRideFrom } = this.state;
        if (ride.name === null || ride.name.trim().length === 0) return;
        let rideDetails = {
            name: ride.name,
            privacyMode: ride.privacyMode,
            userId: this.props.user.userId,
            date: new Date().toISOString(),
            isRecorded: false
        };
        if (startRideFrom !== null) {
            rideDetails = {
                ...rideDetails,
                source: startRideFrom
            };
            this.props.onSubmitForm(rideDetails);
            // Actions.pop();
            this.props.cancelPopup();
        } else {
            this.setState({ searchQuery: 'Current location' });
            if (this.props.currentLocation === null) {
                Geolocation.getCurrentPosition(
                    ({ coords }) => {
                        this.props.onChangeStartRideFrom([coords.longitude, coords.latitude]);
                        // TODO: Call geocoding API to get address of the location
                        rideDetails = {
                            ...rideDetails,
                            source: {
                                name: '',
                                lat: coords.latitude,
                                lng: coords.longitude
                            }
                        };
                        this.props.onSubmitForm(rideDetails);
                        this.props.cancelPopup();
                    },
                    (error) => {
                        // TODO: Handle no starting point
                        console.log(error.code, error.message);
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
                );
            }
        }
    }

    render() {
        const { ride, searchQuery, placeSearchList, startRideFrom } = this.state;
        return (
            <View style={{ height: this.props.containerHeight, zIndex: 500, backgroundColor: 'transparent' }}>
                <View style={{ height: (WindowDimensions.height / 2) }}>
                    <BasicHeader headerHeight={HEADER_HEIGHT} leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                        title='Create Ride' />
                    <ScrollView style={{ backgroundColor: 'white', flex: 1, marginTop: HEADER_HEIGHT }} contentContainerStyle={{ flex: 1 }}>
                        <View style={{ maxHeight: FORM_AREA_HEIGHT }}>
                            <IconicInput iconProps={{ style: styles.formFieldIcon, name: 'highway', type: 'MaterialCommunityIcons' }}
                                inputType='name' placeholder='Ride name' value={ride.name} onChange={this.onChangeRideName} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', minHeight: 100, alignItems: 'center' }}>
                                <IconLabelPair iconProps={{ style: { ...styles.formFieldIcon, fontSize: 22, paddingHorizontal: 8, alignSelf: 'center' }, name: 'eye', type: 'MaterialCommunityIcons' }}
                                    text={ride.privacyMode === 'private' ? 'Private' : 'Public'} textStyle={{ fontWeight: 'normal' }} />
                                <SwitchIconButton
                                    activeIcon={<NBIcon name='close' type='FontAwesome' style={{ color: '#fff', alignSelf: 'flex-start', paddingHorizontal: 10, fontSize: widthPercentageToDP(6) }} />}
                                    inactiveIcon={<NBIcon name='eye' type='MaterialCommunityIcons' style={{ color: '#fff', alignSelf: 'flex-end', paddingHorizontal: 10, fontSize: widthPercentageToDP(6) }} />}
                                    value={ride.privacyMode === 'private'} onChangeValue={this.onChangePrivacyMode} />
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', minHeight: 100, alignItems: 'center' }}>
                                <IconLabelPair iconProps={{ style: { ...styles.formFieldIcon, fontSize: 22, paddingHorizontal: 8, alignSelf: 'center' }, name: 'map-pin', type: 'FontAwesome' }}
                                    text='Start ride from: ' textStyle={{ fontWeight: 'normal' }} />
                                <SearchBox value={searchQuery} hideIcon={true} hideBoxStyle={true} onTextChange={this.onSearchPlace} onPressClear={() => this.setState({ searchQuery: '' })} />
                            </View>
                        </View>
                    </ScrollView>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(82, 137, 25, 0.8)', height: 100, minHeight: 100, alignItems: 'center' }}>
                    <LinkButton title='SUBMIT' onPress={this.onSubmitForm} titleStyle={{ fontSize: 18, color: '#fff' }} />
                    <LinkButton title='CANCEL' onPress={this.onPressBackButton} titleStyle={{ fontSize: 18, color: '#fff' }} />
                </View>
                {
                    placeSearchList.length > 0 ?
                        <SearchResults style={{ marginTop: ((WindowDimensions.height / 2) - HEADER_HEIGHT) }} data={placeSearchList} onPressClose={this.onPressSearchResultsClose} onSelectItem={this.onSelectPlace} />
                        : null
                }
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { ride } = state.RideInfo;
    const { user } = state.UserAuth;
    console.log("mapStateToProps: ", { ride, user });
    return { ride, user };
}

const mapDispatchToProps = (dispatch) => {
    return {
        submitForm: (rideInfo) => dispatch(createNewRide(rideInfo))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateRide);