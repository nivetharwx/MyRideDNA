import React from 'react';
import { StyleSheet, FlatList, View, TouchableWithoutFeedback, TouchableOpacity, Text, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { BaseModal } from '../../../components/modal';
import { widthPercentageToDP, heightPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, WindowDimensions, TAB_CONTAINER_HEIGHT, JS_SDK_ACCESS_TOKEN, RIDE_POINT } from '../../../constants';
import { Icon as NBIcon, Tabs, ScrollableTab, TabHeading, Tab, ListItem, Left, Body, Right } from 'native-base';
import { updateWaypointNameAction, updateSourceOrDestinationNameAction, reorderRideSourceAction, reorderRideDestinationAction, reorderRideWaypointsAction } from '../../../actions';
import { IconLabelPair } from '../../../components/labels';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { IconButton } from '../../../components/buttons';
import { getFormattedDateFromISO } from '../../../util';

const BOTTOM_TAB_HEIGHT = heightPercentageToDP(7);
const BOTTOM_TAB_CONTAINER_WIDTH = widthPercentageToDP(70);
class WaypointList extends React.Component {
    tabsRef = null;
    constructor(props) {
        super(props);
        const points = [];
        if (props.ride.source) points.push(props.ride.source);
        props.ride.waypoints.reduce((arr, waypoint) => {
            arr.push(waypoint);
            return arr;
        }, points);
        if (props.ride.destination) points.push(props.ride.destination);
        this.state = {
            activeTab: 0,
            points: points,
            isEditable: props.isEditable,
            activeDescriptionIdx: -1
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.ride !== this.props.ride) {
            if (this.props.ride.rideId) {
                this.updatePoints();
            }
        }
    }

    updatePoints = () => {
        const points = [];
        if (this.props.ride.source) points.push({ ...this.props.ride.source });
        this.props.ride.waypoints.reduce((arr, waypoint) => {
            arr.push({ ...waypoint });
            return arr;
        }, points);
        if (this.props.ride.destination) points.push({ ...this.props.ride.destination });
        this.setState({ points });
    }

    componentDidMount() {

    }

    onCloseModal = () => {
        this.props.onCancel();
    }

    onChangeTab = ({ from, i }) => {
        this.setState({ activeTab: i });
    }

    renderSeparator = ({ leadingItem, highlighted }) => {
        return (<View style={{ alignItems: 'center' }}>
            <View style={{ width: widthPercentageToDP(3), height: widthPercentageToDP(3), borderRadius: widthPercentageToDP(1.5), backgroundColor: '#ACACAC' }} />
            <View style={{ width: widthPercentageToDP(1), height: heightPercentageToDP(2), backgroundColor: '#ACACAC' }} />
            <View style={{ width: widthPercentageToDP(3), height: widthPercentageToDP(3), borderRadius: widthPercentageToDP(1.5), backgroundColor: '#ACACAC' }} />
        </View>)
    }

    toggleDescription = (index) => {
        if (this.state.activeDescriptionIdx === -1) {
            this.setState(({ points }) => ({
                points: [...points.slice(0, index + 1),
                { isDescription: true, index: index + 1, description: points[index].description || `${points[index].name} description \n ${points[index].name} description` },
                ...points.slice(index + 1)],
                activeDescriptionIdx: index + 1,
                isEditable: false
            }));
        } else {
            this.setState(({ points }) => ({
                points: [...points.slice(0, this.state.activeDescriptionIdx), ...points.slice(this.state.activeDescriptionIdx + 1)]
            }), () => {
                if (this.state.activeDescriptionIdx === index + 1) {
                    this.setState(prevState => ({
                        isEditable: this.props.isEditable,
                        activeDescriptionIdx: -1
                    }));
                    return;
                }
                if (index > this.state.activeDescriptionIdx) {
                    index--;
                }
                this.setState(({ points }) => ({
                    points: [...points.slice(0, index + 1),
                    { isDescription: true, index: index + 1, description: points[index].description || `${points[index].name} description \n ${points[index].name} description` },
                    ...points.slice(index + 1)],
                    isEditable: false,
                    activeDescriptionIdx: index + 1
                }));
            });
        }
    }

    renderRidePoint = ({ item, index, move, moveEnd, isActive }) => {
        let indexLabel = index;
        if (item.isDescription) {
            return <ListItem>
                <Body style={{ height: '100%' }}>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text>{item.description}</Text>
                    </View>
                </Body>
            </ListItem >
        }
        if (this.state.activeDescriptionIdx !== -1 && index > this.state.activeDescriptionIdx) indexLabel--;
        return this.state.isEditable
            ? <ListItem avatar onLongPress={move} onPressOut={moveEnd} onPress={() => this.toggleDescription(index)}
                style={{ backgroundColor: isActive ? APP_COMMON_STYLES.infoColor : '#fff' }}>
                <Left style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <View style={styles.itemNumber}>
                        {/* <Text style={styles.whiteFont}>{
                            index === 0
                                ? 'S'
                                : index === this.state.points.length - 1 && this.props.ride.destination
                                    ? 'D'
                                    : index
                        }</Text> */}
                        {
                            index === 0
                                ? <NBIcon name='map-pin' type='FontAwesome' style={styles.whiteFont} />
                                : index === this.state.points.length - 1 && this.props.ride.destination
                                    ? <NBIcon name='flag-variant' type='MaterialCommunityIcons' style={styles.whiteFont} />
                                    : <Text style={styles.whiteFont}>{index}</Text>
                        }
                    </View>
                </Left>
                <Body style={{ height: '100%' }}>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text>{item.name || 'Unknown'}</Text>
                    </View>
                </Body>
                <Right>
                    <NBIcon name='drag-handle' type='MaterialIcons' />
                </Right>
            </ListItem>
            : <ListItem avatar onPress={() => this.toggleDescription(index)}>
                <Left style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <View style={styles.itemNumber}>
                        {
                            this.renderItemIcon(index)
                        }
                    </View>
                </Left >
                <Body style={{ height: '100%' }}>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text>{item.name || 'Unknown'}</Text>
                    </View>
                </Body>
            </ListItem >
    }

    renderItemIcon = (index) => {
        if (index === 0) {
            return <NBIcon name='map-pin' type='FontAwesome' style={styles.whiteFont} />;
        } else {
            if (this.state.activeDescriptionIdx === -1) {
                if (index === this.state.points.length - 1 && this.props.ride.destination) {
                    return <NBIcon name='map-pin' type='FontAwesome' style={styles.whiteFont} />;
                } else {
                    return <Text style={styles.whiteFont}>{index}</Text>;
                }
            } else {
                const length = this.state.points.length;
                if (this.props.ride.destination && ((this.state.activeDescriptionIdx === length - 1 && index === length - 2) || (
                    this.state.activeDescriptionIdx !== length - 1 && index === length - 1))) {
                    return <NBIcon name='flag-variant' type='MaterialCommunityIcons' style={styles.whiteFont} />;
                } else if (index > this.state.activeDescriptionIdx) {
                    return <Text style={styles.whiteFont}>{index - 1}</Text>;
                } else {
                    return <Text style={styles.whiteFont}>{index}</Text>;
                }
            }
        }
    }

    onChangeOrder = ({ from, to, data }) => {
        if (from === to) return;
        const { ride } = this.props;
        const { points } = this.state;
        const lastIndex = points.length - 1;
        if (from === 0) {
            if (ride.destination && to === lastIndex) {
                this.props.reorderRideSource(RIDE_POINT.DESTINATION);
            } else {
                this.props.reorderRideSource(to - 1);
            }
        } else if (ride.destination && from === lastIndex) {
            if (to === 0) {
                this.props.reorderRideDestination(RIDE_POINT.SOURCE);
            } else {
                this.props.reorderRideDestination(to - 1);
            }
        } else {
            if (to === 0) {
                this.props.reorderRideWaypoints(from - 1, RIDE_POINT.SOURCE);
            } else if (ride.destination && to === lastIndex) {
                this.props.reorderRideWaypoints(from - 1, RIDE_POINT.DESTINATION);
            } else {
                this.props.reorderRideWaypoints(from - 1, to - 1);
            }
        }
        // this.setState({ points: data });
    }

    pointKeyExtractor = item => item.id || item.lng + '' + item.lat;

    render() {
        const { onPressOutside, user, ride } = this.props;
        const { points, isEditable } = this.state;
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
                    <View style={styles.bodyContent}>
                        <View style={styles.rideInfo}>
                            <IconLabelPair
                                iconProps={{ name: 'navigation', type: 'MaterialCommunityIcons' }}
                                text={ride.name}
                            />
                            {/* <IconLabelPair
                                iconProps={{ name: 'ios-person', type: 'Ionicons' }}
                                text={ride.createdBy}
                            /> */}
                            <IconLabelPair
                                iconProps={{ name: 'calendar-today', type: 'MaterialCommunityIcons' }}
                                text={getFormattedDateFromISO(ride.date)}
                            />
                        </View>
                        {
                            isEditable
                                ? <DraggableFlatList
                                    data={points}
                                    renderItem={this.renderRidePoint}
                                    keyExtractor={this.pointKeyExtractor}
                                    onMoveEnd={this.onChangeOrder}
                                />
                                : <FlatList
                                    data={points}
                                    renderItem={this.renderRidePoint}
                                    keyExtractor={this.pointKeyExtractor}
                                // ItemSeparatorComponent={this.renderSeparator}
                                />
                        }
                    </View>
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
        reorderRideSource: (to) => dispatch(reorderRideSourceAction({ to })),
        reorderRideDestination: (to) => dispatch(reorderRideDestinationAction({ to })),
        reorderRideWaypoints: (from, to) => dispatch(reorderRideWaypointsAction({ from, to })),
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
        zIndex: 100,
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
    },
    bodyContent: {
        flex: 1,
        marginTop: APP_COMMON_STYLES.headerHeight
    },
    itemNumber: {
        backgroundColor: APP_COMMON_STYLES.infoColor,
        width: widthPercentageToDP(10),
        height: widthPercentageToDP(10),
        borderRadius: widthPercentageToDP(5),
        alignItems: 'center',
        justifyContent: 'center'
    },
    whiteFont: {
        color: '#fff'
    },
    rideInfo: {
        padding: widthPercentageToDP(2),
        borderBottomWidth: 1,
        borderBottomColor: '#000'
    }
});