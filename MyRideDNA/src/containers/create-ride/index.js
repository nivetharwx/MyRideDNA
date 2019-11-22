import React, { Component } from 'react';
import {
    Platform,
    View,
    ScrollView,
    Keyboard,
    TextInput,
    Text,
    KeyboardAvoidingView
} from 'react-native';
import { connect } from 'react-redux';

import { Switch } from 'react-native-switch';

import { RideInfo } from '../../model/map-models';
import { BasicHeader } from '../../components/headers';
import { SearchBox } from '../../components/inputs';
import styles from './styles';
import { Actions } from 'react-native-router-flux';
import { createNewRide } from '../../api';

import Geolocation from 'react-native-geolocation-service';
import { SwitchIconButton, LinkButton } from '../../components/buttons';

import { Icon as NBIcon, Item, Toast } from 'native-base';
import { WindowDimensions, JS_SDK_ACCESS_TOKEN, IS_ANDROID, widthPercentageToDP, heightPercentageToDP, APP_COMMON_STYLES } from '../../constants';
import { SearchResults } from '../../components/pages';
import { DefaultText } from '../../components/labels';


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
            startRideFrom: null,
            currentLocation: this.props.currentLocation || null
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
        if (placeQuery === '') {
            this.setState({ searchQuery: placeQuery });
            return;
        }
        if (placeQuery === 'Current location' || (this.state.startRideFrom && this.state.startRideFrom.name === placeQuery)) return;
        this.setState({ searchQuery: placeQuery });
        if (placeQuery.length < 2) return;

        const lastCharacter = placeQuery.slice(-1);
        if (lastCharacter === ' ') return;
        const config = {
            query: placeQuery,
            limit: 10
        };
        if (this.props.currentLocation) {
            config.proximity = this.props.currentLocation.location;
        }
        const response = await geocodingClient.forwardGeocode(config).send();
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
        if (this.state.searchQuery === '' || this.state.startRideFrom === null || this.state.startRideFrom.name !== this.state.searchQuery) {
            this.setState({ placeSearchList: [], searchQuery: 'Current location' });
        } else {
            this.setState({ placeSearchList: [] });
        }
    }

    onSubmitForm = () => {
        const { ride, startRideFrom, searchQuery } = this.state;
        if (ride.name === null || ride.name.trim().length === 0) {
            Toast.show({
                text: 'Enter Ride Name',
                buttonText: 'Okay'
            });
            return
        };
        let rideDetails = {
            name: ride.name,
            privacyMode: ride.privacyMode,
            userId: this.props.user.userId,
            date: new Date().toISOString(),
            isRecorded: false
        };
        if (startRideFrom !== null && searchQuery !== '') {
            rideDetails = {
                ...rideDetails,
                source: startRideFrom
            };
            this.props.onSubmitForm(rideDetails);
            // Actions.pop();
            this.props.cancelPopup([startRideFrom.lng, startRideFrom.lat]);
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
                        this.props.cancelPopup([coords.longitude, coords.latitude]);
                    },
                    (error) => {
                        // TODO: Handle no starting point
                        console.log(error.code, error.message);
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
                );
            } else {
                rideDetails = {
                    ...rideDetails,
                    source: {
                        name: this.props.currentLocation.name,
                        lat: this.props.currentLocation.location[1],
                        lng: this.props.currentLocation.location[0]
                    }
                }
                this.props.onSubmitForm(rideDetails);
                this.props.cancelPopup(this.props.currentLocation.location);
            }
        }
    }

    onPressUseCurrentLocation = () => {
        this.setState({ searchQuery: 'Current location', placeSearchList: [], startRideFrom: null });
        this.props.onChangeStartRideFrom(this.props.currentLocation);
    }

    render() {
        const { ride, searchQuery, placeSearchList, startRideFrom } = this.state;
        return (
            <View style={{ height: this.props.containerHeight, zIndex: 500, elevation: 11, backgroundColor: 'transparent' }}>
                <View style={{ height: (WindowDimensions.height / 2) }}>
                    <BasicHeader headerHeight={HEADER_HEIGHT} leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                        title='Create Ride' />
                    {
                        placeSearchList.length > 0 ?
                            <SearchResults style={{ top: 0, marginTop: 0, height: heightPercentageToDP(35) }} data={placeSearchList} onPressClose={this.onPressSearchResultsClose} onSelectItem={this.onSelectPlace} />
                            : null
                    }
                    <ScrollView style={{ backgroundColor: 'white', flex: 1, paddingTop: HEADER_HEIGHT }} contentContainerStyle={{ flex: 1 }}>
                        <View style={{ maxHeight: FORM_AREA_HEIGHT, flex: 1, justifyContent: 'space-around' }}>
                            <Item style={{ marginLeft: widthPercentageToDP(4), marginRight: widthPercentageToDP(4), paddingTop: heightPercentageToDP(4) }}>
                                {/* <NBIcon name='highway' type='MaterialCommunityIcons' style={styles.formFieldIcon} /> */}
                                <TextInput style={{ flex: 1 }} textContentType='name' keyboardType='default' placeholder='New ride name' onChangeText={this.onChangeRideName} />
                            </Item>
                            {/* <Item style={{ borderBottomWidth: 0, marginLeft: widthPercentageToDP(4), marginRight: widthPercentageToDP(4), marginTop: heightPercentageToDP(4) }}>
                                <NBIcon name='eye' type='MaterialCommunityIcons' style={styles.formFieldIcon} />
                                
                            </Item> */}
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginRight: widthPercentageToDP(4) }}>
                                <DefaultText style={{ alignSelf: 'center', letterSpacing: 3 }}>{ride.privacyMode === 'private' ? 'PRIVATE' : 'PUBLIC'}</DefaultText>
                                <SwitchIconButton
                                    activeIcon={<NBIcon name='close' type='FontAwesome' style={{ color: '#fff', alignSelf: 'flex-start', paddingHorizontal: 10, fontSize: widthPercentageToDP(6) }} />}
                                    inactiveIcon={<NBIcon name='eye' type='MaterialCommunityIcons' style={{ color: '#fff', alignSelf: 'flex-end', paddingHorizontal: 10, fontSize: widthPercentageToDP(6) }} />}
                                    value={ride.privacyMode === 'private'} onChangeValue={this.onChangePrivacyMode} />
                            </View>
                            <Item style={{ marginLeft: widthPercentageToDP(4), marginRight: widthPercentageToDP(4) }}>
                                {/* <NBIcon name='map-pin' type='FontAwesome' style={[styles.formFieldIcon, { paddingHorizontal: widthPercentageToDP(2) }]} /> */}
                                <DefaultText style={{ color: '#8C8C8C' }}>Start ride from: </DefaultText>
                                <SearchBox value={searchQuery} onFocus={() => this.setState({ searchQuery: '' })} hideIcon={true} onTextChange={this.onSearchPlace} onPressClear={() => this.setState({ searchQuery: '', })} />
                            </Item>
                            <LinkButton style={{ alignSelf: 'flex-end', marginRight: widthPercentageToDP(4) }} title='Use my current location' titleStyle={{ color: APP_COMMON_STYLES.headerColor }} onPress={this.onPressUseCurrentLocation} />
                        </View>
                    </ScrollView>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: 'rgba(82, 137, 25, 0.8)', height: 100, minHeight: 100, alignItems: 'center' }}>
                    <LinkButton title='SUBMIT' onPress={this.onSubmitForm} titleStyle={{ fontSize: 18, color: '#fff' }} />
                    {/* <LinkButton title='CANCEL' onPress={this.onPressBackButton} titleStyle={{ fontSize: 18, color: '#fff' }} /> */}
                </View>
                {/* {
                    placeSearchList.length > 0 ?
                        <SearchResults style={{ marginTop: ((WindowDimensions.height / 2) - HEADER_HEIGHT) }} data={placeSearchList} onPressClose={this.onPressSearchResultsClose} onSelectItem={this.onSelectPlace} />
                        : null
                } */}
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { ride } = state.RideInfo;
    const { user } = state.UserAuth;
    return { ride, user };
}

const mapDispatchToProps = (dispatch) => {
    return {
        submitForm: (rideInfo) => dispatch(createNewRide(rideInfo))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateRide);