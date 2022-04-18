import React from 'react';
import { StyleSheet, FlatList, TextInput, View, TouchableWithoutFeedback, TouchableOpacity, Text, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { BaseModal } from '../../../components/modal';
import { widthPercentageToDP, heightPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, WindowDimensions, TAB_CONTAINER_HEIGHT, JS_SDK_ACCESS_TOKEN, RIDE_POINT, APP_EVENT_TYPE, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, GET_PICTURE_BY_ID } from '../../../constants';
import { Icon as NBIcon, Tabs, ScrollableTab, TabHeading, Tab, ListItem, Left, Body, Right, Item, Thumbnail } from 'native-base';
import { updateWaypointNameAction, updateSourceOrDestinationNameAction, reorderRideSourceAction, reorderRideDestinationAction, reorderRideWaypointsAction, apiLoaderActions, updateRideAction, updateRideInListAction } from '../../../actions';
import { IconLabelPair, DefaultText } from '../../../components/labels';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { IconButton, SwitchIconButton, LinkButton } from '../../../components/buttons';
import { getFormattedDateFromISO } from '../../../util';
import { updateRide } from '../../../api';
import { BasePage } from '../../../components/pages';

const BOTTOM_TAB_HEIGHT = heightPercentageToDP(7);
const BOTTOM_TAB_CONTAINER_WIDTH = widthPercentageToDP(90);
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
            activeDescriptionIdx: -1,
            isEditingName: false,
            rideName: props.ride.name + ''
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
        this.setState(prevState => ({ points }), () => console.log("points: ", points));
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
                { isDescription: true, index: index + 1, description: points[index].description || '' },
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
                    { isDescription: true, index: index + 1, description: points[index].description || '' },
                    ...points.slice(index + 1)],
                    isEditable: false,
                    activeDescriptionIdx: index + 1
                }));
            });
        }
    }

    onPressEditDescription = (index) => {
        this.props.changeToCommentMode(index);
        this.toggleDescription(this.state.activeDescriptionIdx - 1);
    }

    renderRidePoint = ({ item, index, move, moveEnd, isActive }) => {
        if (item.isDescription) {
            return <ListItem avatar onPress={() => this.props.isEditable && this.onPressEditDescription(index - 1)}>
                {
                    this.props.isEditable
                        ? <Left>
                            <View style={[styles.itemNumber, { backgroundColor: APP_COMMON_STYLES.headerColor }]}>
                                {
                                    item.description
                                        ? <NBIcon name='edit' type='MaterialIcons' style={styles.whiteFont} />
                                        : <NBIcon name='add' type='MaterialIcons' style={styles.whiteFont} />
                                }
                            </View>
                        </Left>
                        : null
                }
                <Body style={{ flex: 1, justifyContent: 'center' }}>
                    <DefaultText style={!item.description ? { top: 5, paddingBottom: 10 } : null}>{item.description || (this.props.isEditable ? 'Add description' : 'No description added for this point')}</DefaultText>
                </Body>
            </ListItem>
        }
        return this.state.isEditable
            ? <ListItem avatar onLongPress={move} onPressOut={moveEnd} onPress={() => this.toggleDescription(index)}
                style={{ backgroundColor: isActive ? APP_COMMON_STYLES.infoColor : '#fff' }}>
                <Left style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <View style={[styles.itemNumber, { backgroundColor: APP_COMMON_STYLES.infoColor }]}>
                        {
                            index === 0
                                ? <NBIcon name='map-pin' type='FontAwesome' style={[styles.whiteFont, { paddingLeft: widthPercentageToDP(1) }]} />
                                : index === this.state.points.length - 1 && this.props.ride.destination
                                    ? <NBIcon name='flag-variant' type='MaterialCommunityIcons' style={styles.whiteFont} />
                                    : <DefaultText style={styles.whiteFont}>{index}</DefaultText>
                        }
                    </View>
                </Left>
                <Body style={{ height: '100%' }}>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <DefaultText>{item.name || 'Unknown'}</DefaultText>
                    </View>
                </Body>
                <Right>
                    <NBIcon name='drag-handle' type='MaterialIcons' />
                </Right>
            </ListItem>
            : <ListItem avatar onPress={() => this.toggleDescription(index)}>
                <Left style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <View style={[styles.itemNumber, { backgroundColor: APP_COMMON_STYLES.infoColor }]}>
                        {
                            this.renderItemIcon(index)
                        }
                    </View>
                </Left >
                <Body style={{ height: '100%' }}>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <DefaultText>{item.name || 'Unknown'}</DefaultText>
                    </View>
                </Body>
            </ListItem>
    }

    renderItemIcon = (index) => {
        if (index === 0) {
            return <NBIcon name='map-pin' type='FontAwesome' style={[styles.whiteFont, { paddingLeft: widthPercentageToDP(1) }]} />;
        } else {
            if (this.state.activeDescriptionIdx === -1) {
                if (index === this.state.points.length - 1 && this.props.ride.destination) {
                    return <NBIcon name='map-pin' type='FontAwesome' style={[styles.whiteFont, { paddingLeft: widthPercentageToDP(1) }]} />;
                } else {
                    return <DefaultText style={styles.whiteFont}>{index}</DefaultText>;
                }
            } else {
                const length = this.state.points.length;
                if (this.props.ride.destination && ((this.state.activeDescriptionIdx === length - 1 && index === length - 2) || (
                    this.state.activeDescriptionIdx !== length - 1 && index === length - 1))) {
                    return <NBIcon name='flag-variant' type='MaterialCommunityIcons' style={styles.whiteFont} />;
                } else if (index > this.state.activeDescriptionIdx) {
                    return <DefaultText style={styles.whiteFont}>{index - 1}</DefaultText>;
                } else {
                    return <DefaultText style={styles.whiteFont}>{index}</DefaultText>;
                }
            }
        }
    }

    onPressEditRideName = () => this.setState({ isEditingName: true });

    onChangeName = val => this.setState({ rideName: val + '' });

    onPressSubmitRideName = () => {
        const { rideId, rideType } = this.props.ride;
        const updatedRide = { rideId, name: this.state.rideName };
        this.props.updateRide(updatedRide, rideType);
        this.setState({ isEditingName: false });
    }

    onChangePrivacyMode = (isPrivate) => {
        const { rideId, privacyMode, rideType } = this.props.ride;
        const updatedRide = { rideId };
        updatedRide.privacyMode = privacyMode === 'private' ? 'public' : 'private';
        this.props.updateRide(updatedRide, rideType);
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
    }

    pointKeyExtractor = item => item.id || item.lng + '' + item.lat;

    render() {
        const { onPressOutside, user, ride } = this.props;
        const { points, isEditable, isEditingName, rideName } = this.state;
        return (
            <View style={styles.modalRoot}>
                <View style={styles.container}>
                    <BasePage heading={'Waypoints'} showShifter={false} onBackButtonPress={this.onCloseModal}>
                        <View style={styles.bodyContent}>
                            <View style={styles.rideInfo}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Item style={{ flexDirection: 'row', flex: 1, borderBottomWidth: 0, justifyContent: 'space-between' }}>
                                        <IconLabelPair
                                            iconProps={{ name: 'navigation', type: 'MaterialCommunityIcons' }}
                                            text={rideName}
                                        />
                                        <IconLabelPair
                                            iconProps={{ name: 'calendar-today', type: 'MaterialCommunityIcons' }}
                                            text={getFormattedDateFromISO(ride.date)}
                                        />
                                    </Item>
                                </View>
                                {ride.creatorId !== user.userId && <View style={{ marginLeft: 5, marginTop: 15, flexDirection: 'row', alignItems: 'center' }}>
                                    <Thumbnail style={{ height: 30, width: 30 }} source={ride.creatorProfilePictureId ? { uri: `${GET_PICTURE_BY_ID}${ride.creatorProfilePictureId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}` } : require('../../../assets/img/profile-pic-placeholder.png')} />
                                    <DefaultText style={{ marginLeft: 10 }}>{ride.creatorName + '  '}
                                        {
                                            ride.creatorNickname && <DefaultText style={{ color: APP_COMMON_STYLES.infoColor }}>{`${ride.creatorNickname}`}</DefaultText>
                                        }
                                    </DefaultText>
                                </View>}
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
                                        keyboardShouldPersistTaps={'handled'}
                                        data={points}
                                        renderItem={this.renderRidePoint}
                                        keyExtractor={this.pointKeyExtractor}
                                    />
                            }
                        </View>
                    </BasePage>
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
        updateRide: (updates, rideType) => {
            dispatch(apiLoaderActions(true));
            updateRide(updates, () => {
                dispatch(apiLoaderActions(false));
                dispatch(updateRideAction(updates));
                dispatch(updateRideInListAction({ ride: updates, rideType }));
            }, (err) => dispatch(apiLoaderActions(false)))
        },
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
        zIndex: 999,
        elevation: 10,
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row'
    },
    headerText: {
        color: 'white',
        fontSize: widthPercentageToDP(4),
        fontWeight: 'bold',
        flex: 1,
        marginLeft: widthPercentageToDP(2)
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
        marginTop: 10
    },
    itemNumber: {
        // backgroundColor: APP_COMMON_STYLES.infoColor,
        width: widthPercentageToDP(10),
        height: widthPercentageToDP(10),
        borderRadius: widthPercentageToDP(5),
        alignItems: 'center',
        justifyContent: 'center'
    },
    whiteFont: {
        color: '#fff',
    },
    rideInfo: {
        // height: heightPercentageToDP(15),
        padding: widthPercentageToDP(2),
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        justifyContent: 'space-between'
    }
});