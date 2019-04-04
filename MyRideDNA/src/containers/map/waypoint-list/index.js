import React from 'react';
import { StyleSheet, FlatList, View, TouchableWithoutFeedback, TouchableOpacity, Text, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { BaseModal } from '../../../components/modal';
import { widthPercentageToDP, heightPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, WindowDimensions, TAB_CONTAINER_HEIGHT, JS_SDK_ACCESS_TOKEN, RIDE_POINT } from '../../../constants';
import { Icon as NBIcon, Tabs, ScrollableTab, TabHeading, Tab } from 'native-base';
import { updateWaypointNameAction, updateSourceOrDestinationNameAction } from '../../../actions';
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: JS_SDK_ACCESS_TOKEN });

const BOTTOM_TAB_HEIGHT = heightPercentageToDP(7);
const BOTTOM_TAB_CONTAINER_WIDTH = widthPercentageToDP(65);
class WaypointList extends React.Component {
    tabsRef = null;
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0
        };
    }

    componentDidMount() {
        // TODO: Have to update ride without updating undo/redo actions
        const { ride } = this.props;
        if (ride.source) {
            this.getPlaceNameByReverseGeocode([ride.source.lng, ride.source.lat],
                (locationName) => {
                    locationName && this.props.updateSourceOrDestinationName(RIDE_POINT.SOURCE, locationName);
                },
                (err) => {
                    console.log("Reverse geocoding error for source: ", err);
                }
            );
        }
        ride.waypoints.forEach(waypoint => this.getPlaceNameByReverseGeocode([waypoint.lng, waypoint.lat],
            (locationName) => {
                locationName && this.props.updateWaypointName(waypoint.id, locationName);
            },
            (err) => {
                console.log("Reverse geocoding error for waypoint: ", err);
            }
        ));
        if (ride.destination) {
            this.getPlaceNameByReverseGeocode([ride.destination.lng, ride.destination.lat],
                (locationName) => {
                    locationName && this.props.updateSourceOrDestinationName(RIDE_POINT.DESTINATION, locationName);
                },
                (err) => {
                    console.log("Reverse geocoding error for destination: ", err);
                }
            );
        }
    }

    getPlaceNameByReverseGeocode = async (location, successCallback, errorCallback) => {
        try {
            const { body } = await geocodingClient.reverseGeocode({
                query: location,
                types: ['place', 'locality', 'address']
            }).send();
            if (body.features) {
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

    onCloseModal = () => {
        this.props.onCancel();
    }

    onChangeTab = ({ from, i }) => {
        this.setState({ activeTab: i });
    }

    render() {
        const { onPressOutside, user, ride } = this.props;
        const { activeTab } = this.state;
        console.log("waypoints: ", ride);
        return (
            <View style={styles.modalRoot}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.iconPadding} onPress={this.onCloseModal}>
                            <NBIcon name='md-arrow-round-back' type='Ionicons' />
                        </TouchableOpacity>
                        <Text style={styles.headerText}>Waypoints - {ride.name.length > 10 ? ride.name.substring(0, 10) + '...' : ride.name}</Text>
                    </View>
                    {/* <Tabs locked={true} onChangeTab={this.onChangeTab} style={{ backgroundColor: '#fff', marginTop: APP_COMMON_STYLES.headerHeight }} renderTabBar={() => <ScrollableTab tabsContainerStyle={{ width: BOTTOM_TAB_CONTAINER_WIDTH }} style={{ width: BOTTOM_TAB_CONTAINER_WIDTH }} ref={elRef => this.tabsRef = elRef} activeTab={activeTab} backgroundColor='#E3EED3' underlineStyle={{ height: 0 }} />}>
                        <Tab heading={<TabHeading style={{ width: BOTTOM_TAB_CONTAINER_WIDTH / 2, backgroundColor: activeTab === 0 ? '#81BB41' : '#E3EED3', borderColor: '#fff', borderRightWidth: 0.5 }}>
                            <Text style={{ fontSize: widthPercentageToDP(2.8), fontWeight: 'bold', color: activeTab === 0 ? '#fff' : '#000' }}>WAYPOINTS</Text>
                        </TabHeading>}>

                        </Tab>
                        <Tab heading={<TabHeading style={{ width: BOTTOM_TAB_CONTAINER_WIDTH / 2, backgroundColor: activeTab === 1 ? '#81BB41' : '#E3EED3', borderColor: '#fff', borderLeftWidth: 0.5 }}>
                            <Text style={{ fontSize: widthPercentageToDP(2.8), fontWeight: 'bold', color: activeTab === 1 ? '#fff' : '#000' }}>CURRENT RIDE</Text>
                        </TabHeading>}>

                        </Tab>
                    </Tabs> */}
                </View>
                <TouchableWithoutFeedback onPress={onPressOutside}>
                    <View style={{ flex: 1 }} />
                </TouchableWithoutFeedback>
            </View >
        );
    }

}
const mapStateToProps = (state) => {
    const { ride } = state.RideInfo.present;
    const { user } = state.UserAuth;
    return { user, ride };
}
const mapDipatchToProps = (dispatch) => {
    return {
        updateSourceOrDestinationName: (identifier, locationName) => dispatch(updateSourceOrDestinationNameAction({ identifier, locationName })),
        updateWaypointName: (waypointId, locationName) => dispatch(updateWaypointNameAction({ waypointId, locationName })),
    };
}
export default connect(mapStateToProps, mapDipatchToProps)(WaypointList);

const styles = StyleSheet.create({
    modalRoot: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        flex: 1,
        flexDirection: 'row',
    },
    container: {
        width: BOTTOM_TAB_CONTAINER_WIDTH,
        height: '100%',
        backgroundColor: '#fff'
    },
    header: {
        backgroundColor: APP_COMMON_STYLES.headerColor,
        height: APP_COMMON_STYLES.headerHeight,
        position: 'absolute',
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row'
    },
    headerText: {
        color: 'white',
        fontSize: widthPercentageToDP(4),
        fontWeight: 'bold',
        flex: 1,
        marginLeft: 5
    },
    safePadding: {
        paddingTop: heightPercentageToDP(2)
    },
    iconPadding: {
        // position: 'absolute',
        // zIndex: 100,
        marginLeft: 5,
        padding: 5,
        backgroundColor: 'white',
        borderRadius: 19,
        height: 38,
        width: 38,
        alignItems: 'center',
        justifyContent: 'center'
    },
    bottomTabContainer: {
        position: 'absolute',
        zIndex: 900,
        bottom: 0,
        height: '100%',
        width: BOTTOM_TAB_CONTAINER_WIDTH,
    },
    bottomTab: {
        height: 0,
        width: '50%',
    }
});