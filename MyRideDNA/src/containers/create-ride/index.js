import React, { Component } from 'react';
import {
    Platform,
    View,
    ScrollView,
    Keyboard,
    TextInput,
    Text,
    KeyboardAvoidingView,
    TouchableOpacity
} from 'react-native';
import { connect } from 'react-redux';

import { Switch } from 'react-native-switch';

import { BasicHeader } from '../../components/headers';
import { SearchBox, LabeledInputPlaceholder, IconicList } from '../../components/inputs';
import styles from './styles';
import { Actions } from 'react-native-router-flux';
import { createNewRide, getSpaces } from '../../api';

import Geolocation from 'react-native-geolocation-service';
import { SwitchIconButton, LinkButton, IconButton, BasicButton } from '../../components/buttons';

import { Icon as NBIcon, Item, Toast } from 'native-base';
import { WindowDimensions, JS_SDK_ACCESS_TOKEN, IS_ANDROID, widthPercentageToDP, heightPercentageToDP, APP_COMMON_STYLES, CUSTOM_FONTS, PageKeys } from '../../constants';
import { SearchResults } from '../../components/pages';
import { DefaultText } from '../../components/labels';


const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: JS_SDK_ACCESS_TOKEN });
class CreateRide extends Component {
    fieldRefs = [];
    constructor(props) {
        super(props);
        this.state = {
            selectedBikeId: null,
            rideDescription: '',
            ride: {},
            searchQuery: 'Current location',
            placeSearchList: [],
            bikeList: [],
            startRideFrom: null,
            currentLocation: this.props.currentLocation || null,
            isPrivate: true
        };
    }

    componentDidMount() {
        console.log(this.props)
       this.setState({bikeList:this.props.spaceList})
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
    onChangeRideDescription = (description) => {
        const { ride } = this.state;
        this.setState({ ride: { ...ride, description } });
    }

    onChangeBike = (val) => {
        const { ride } = this.state;
        this.setState({ ride: { ...ride, selectedBikeId: val } });
    }
    onChangePrivacyMode = (val) => {
        const { ride } = this.state;
        this.setState({ isPrivate: val });
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
        const { ride, startRideFrom, searchQuery, isPrivate } = this.state;
        if (!ride.name || ride.name.trim().length === 0) {
            Toast.show({
                text: 'Enter Ride Name',
                buttonText: 'Okay'
            });
            return
        };
        if (this.props.isRecorded) {
            let rideDetails = {
                name: ride.name?ride.name:'',
                description: ride.description?ride.description:'',
                privacyMode: isPrivate ? 'private' : 'public',
                spaceId: ride.selectedBikeId ? ride.selectedBikeId : ''
            };
            console.log(rideDetails,'///// Ride Details')
            this.props.onSubmitRecordRide(rideDetails)
        }
        else {
            let rideDetails = {
                name: ride.name ,
                description: ride.description,
                privacyMode: isPrivate ? 'private' : 'public',
                userId: this.props.user.userId,
                date: new Date().toISOString(),
                isRecorded: false,
                spaceId: ride.selectedBikeId
            };
            if (startRideFrom !== null && searchQuery !== '') {
                rideDetails = {
                    ...rideDetails,
                    source: startRideFrom
                };
                this.props.submitForm(rideDetails);
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
                            this.props.submitForm(rideDetails);
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
                    this.props.submitForm(rideDetails);
                    this.props.cancelPopup(this.props.currentLocation.location);
                }
            }
        }
    }



    onPressUseCurrentLocation = () => {
        this.setState({ searchQuery: 'Current location', placeSearchList: [], startRideFrom: null });
        this.props.onChangeStartRideFrom(this.props.currentLocation);
    }

    onSelectLocation = (item) => {
        item.id === 'CURRENT_LOCATION'
            ? this.onPressUseCurrentLocation()
            : this.onSelectPlace(item);
    }

    openSearchResultPage = () => {
        const { searchQuery } = this.state;
        Actions.push(PageKeys.SEARCH_RESULT, { currentLocation: { geometry: { coordinates: [this.state.currentLocation.lng, this.state.currentLocation.lat] } }, searchQuery: searchQuery === 'Current location' ? '' : searchQuery, onPressSearchResult: (item) => this.onSelectLocation(item) })
    }

    render() {
        const { ride, searchQuery, placeSearchList, startRideFrom, rideDescription, bikeList, selectedBikeId, isPrivate } = this.state;
        const { bike, title, isRecorded } = this.props;
        const BIKE_LIST = [];
        if (!bike) {
            const updatedBikeList = bikeList.reduce((obj, item) => {
                if (item.isDefault) {
                    obj.filtered.push(item);
                }
                else {
                    obj.remaning.push(item)
                }
                return obj;
            }, ({ filtered: [], remaning: [] }))
            if (bikeList.length > 0) {
                BIKE_LIST.push({ label: updatedBikeList.filtered[0].name, value: updatedBikeList.filtered[0].spaceId });
                updatedBikeList.remaning.forEach(bike => BIKE_LIST.push({ label: bike.name, value: bike.spaceId }));
            }
        }
        console.log(title,'/////// title')
        return (
            <View style={{ height: this.props.containerHeight, zIndex: 500, elevation: 11, backgroundColor: 'transparent' }}>
                <View style={{ height: (WindowDimensions.height / 2) }}>
                    <BasicHeader leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                        title={title} />
                    {
                        placeSearchList.length > 0 ?
                            <SearchResults style={{ top: 0, marginTop: 0, height: heightPercentageToDP(35) }} data={placeSearchList} onPressClose={this.onPressSearchResultsClose} onSelectItem={this.onSelectPlace} />
                            : null
                    }
                    <ScrollView style={{ backgroundColor: 'white' }} contentContainerStyle={{}}>
                        <View style={{ marginTop: 70 }}>
                            <LabeledInputPlaceholder
                                containerStyle={{ backgroundColor: '#F4F4F4' }}
                                inputValue={ride.name} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3), marginLeft: 28, }}
                                inputRef={elRef => this.fieldRefs[0] = elRef} returnKeyType='next'
                                onChange={this.onChangeRideName} label='RIDE NAME' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                containerStyle={{ backgroundColor: '#F4F4F4' }}
                                inputValue={ride.description}
                                inputStyle={{ paddingBottom: 0 }}
                                multiline={true}
                                inputRef={elRef => this.fieldRefs[1] = elRef}
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3), marginLeft: 28, }}
                                returnKeyType='next'
                                onChange={this.onChangeRideDescription} label='RIDE DESCRIPTION' labelStyle={styles.labelStyle}
                                hideKeyboardOnSubmit={true} />
                            <View style={styles.hDivider} />
                            {title!=='Plan a Ride'?<View style={styles.dropdownContainer}>
                                <IconicList
                                    disabled={BIKE_LIST.length === 0}
                                    iconProps={IS_ANDROID ? {} : { type: 'MaterialIcons', name: 'arrow-drop-down', style: { color: APP_COMMON_STYLES.infoColor, fontSize: 28 } }}
                                    pickerStyle={[{ borderBottomWidth: 0 }, IS_ANDROID ? { flex: 1 } : null]}
                                    textStyle={{left:8, fontSize: 14, bottom: 7 }}
                                    selectedValue={ride.selectedBikeId}
                                    values={BIKE_LIST}
                                    placeholder={'SELECT A BIKE'}
                                    outerContainer={{ flex: 1, alignItems: 'flex-end' }}
                                    containerStyle={{ flex: 1 }}
                                    innerContainerStyle={{ height: 24 }}
                                    onChange={this.onChangeBike} />
                            </View>:null}
                            <View style={styles.switchBtnContainer}>
                                <LinkButton style={[styles.grayBorderBtn, { marginRight: 17 }, isPrivate ? null : styles.greenLinkBtn]} title='ROAD CREW' titleStyle={[styles.grayBorderBtnText, { color: isPrivate ? '#9A9A9A' : '#fff' }]} onPress={() => isPrivate === true && this.onChangePrivacyMode(false)} />
                                <LinkButton style={[styles.grayBorderBtn, isPrivate ? styles.redLinkBtn : null]} title='ONLY ME' titleStyle={[styles.grayBorderBtnText, { color: isPrivate ? '#fff' : '#9A9A9A' }]} onPress={() => isPrivate === false && this.onChangePrivacyMode(true)} />
                            </View>
                            {
                                isRecorded ?
                                    null
                                    : <View style={styles.btmContainer}>
                                        <DefaultText style={styles.btmLabelTxt}>START RIDE FROM</DefaultText>
                                        <View style={styles.currentLctnCont} >
                                            <LinkButton numberOfLines={1} style={{ width: 120 }} title={searchQuery} titleStyle={{ color: APP_COMMON_STYLES.headerColor, letterSpacing:searchQuery === 'Current location'?2:0 }} onPress={this.openSearchResultPage} />
                                            {/* <DefaultText numberOfLines={1} style={{width:120}}>{searchQuery}</DefaultText> */}
                                            {
                                                searchQuery === 'Current location'
                                                ?null
                                                : <IconButton iconProps={{ name: 'close', type: 'FontAwesome', style: { fontSize: 10, color: '#fff' } }} style={[styles.closeIconCont, { backgroundColor: '#CE0D0D' }]} onPress={this.onPressUseCurrentLocation} />
                                            }
                                        </View>
                                    </View>
                            }
                        </View>
                    </ScrollView>
                </View>
                <BasicButton title='ADD RIDE' style={styles.submitBtn} titleStyle={{ letterSpacing: 2, fontSize: 20, fontFamily: CUSTOM_FONTS.robotoSlabBold }} onPress={this.onSubmitForm} />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { ride } = state.RideInfo;
    const { user } = state.UserAuth;
    const { spaceList,currentBike: bike } = state.GarageInfo;
    return { ride, user, bike,spaceList };
}

const mapDispatchToProps = (dispatch) => {
    return {
        submitForm: (rideInfo) => dispatch(createNewRide(rideInfo)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateRide);