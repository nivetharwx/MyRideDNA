import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList } from 'react-native';
import { connect } from 'react-redux';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES } from '../../../constants';
import { IconButton } from '../../../components/buttons';
import { Item } from 'native-base';
import { updateSource, updateWaypoint, updateDestination } from '../../../api';

class CommentSection extends Component {
    txtInputRef = null;
    constructor(props) {
        super(props);
        this.state = {
            showEditConentent: false,
            point: null,
            isSource: false,
            isDestination: false,
        };
    }

    componentDidMount() {
        this.setState({ point: this.getRidePoint(this.props.index) });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.ride !== this.props.ride && this.props.ride) {
            const point = this.getRidePoint(this.props.index);
            this.state.showEditConentent
                ? this.setState({ showEditConentent: false, point })
                : this.setState({ point });
        }
        if (prevProps.index !== this.props.index) {
            this.setState({ point: this.getRidePoint(this.props.index) });
        }
    }

    getRidePoint(index) {
        const { ride } = this.props;
        const ridePoints = ride.waypoints.length + (ride.source ? 1 : 0) + (ride.destination ? 1 : 0);
        if (ride.source && index === 0) {
            return ride.source;
        } else if (ride.destination && index === ridePoints - 1) {
            return ride.destination;
        } else {
            return ride.source ? ride.waypoints[index - 1] : ride.waypoints[index];
        }
    }

    onPressEdit = () => {
        this.setState({ showEditConentent: true }, () => {
            this.txtInputRef.focus();
        });
    }

    onSubmitDescription = ({ nativeEvent }) => {
        this.txtInputRef.blur();
        this.updateDescription({ ...this.state.point, description: '' + nativeEvent.text });
        // this.setState({ showEditConentent: false });
    }

    onPressSubmit = () => {
        const text = this.txtInputRef._lastNativeText;
        this.txtInputRef.blur();
        if (typeof text === 'undefined') {
            this.setState({ showEditConentent: false });
            return;
        }
        this.updateDescription({ ...this.state.point, description: '' + text });
        // this.setState({ showEditConentent: false });
    }

    updateDescription(point) {
        if (this.props.index === 0) {
            console.log("updating source: ", point);
            this.props.updateSource(point, this.props.ride);
        } else if (this.props.ride.destination &&
            (this.props.ride.destination.lng + '' + this.props.ride.destination.lat === point.lng + '' + point.lat)) {
            console.log("updating destination: ", point);
            this.props.updateDestination(point, this.props.ride);
        } else {
            console.log("updating waypoint: ", point);
            this.props.updateWaypoint(point, this.props.ride, this.props.index - 1);
        }
    }

    render() {
        const { onClose, isEditable } = this.props;
        const { showEditConentent, point } = this.state;
        if (point === null) return <View style={styles.modalRoot}>
            <View style={styles.container}></View>
        </View>
        return (
            <View style={styles.modalRoot}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>{point.name}</Text>
                        {
                            isEditable && point.description && !showEditConentent
                                ? <IconButton onPress={this.onPressEdit} style={{ backgroundColor: 'transparent', alignSelf: 'center', alignItems: 'flex-end', justifyContent: 'flex-end' }}
                                    iconProps={{ name: 'edit', type: 'MaterialIcons', style: { color: '#fff' } }} />
                                : null
                        }
                        <IconButton onPress={onClose} style={{ marginLeft: widthPercentageToDP(2), backgroundColor: 'transparent', alignSelf: 'center', alignItems: 'flex-end', justifyContent: 'flex-end' }}
                            iconProps={{ name: 'window-close', type: 'MaterialCommunityIcons', style: { color: '#fff' } }} />
                    </View>
                    <View style={styles.bodyContent}>
                        {
                            isEditable
                                ? <Text style={!point.description ? { color: '#ACACAC' } : null}>{point.description ? point.description : 'Add description'}</Text>
                                : <Text style={!point.description ? { color: '#ACACAC' } : null}>{point.description ? point.description : 'No description added for this point'}</Text>
                        }
                    </View>
                    {
                        showEditConentent || (isEditable && !point.description)
                            ? <Item style={styles.msgInputBoxContainer}>
                                {/* <IconButton style={styles.footerLeftIcon} iconProps={{ name: 'md-attach', type: 'Ionicons' }} /> */}
                                <TextInput multiline={true} ref={el => this.txtInputRef = el} defaultValue={point.description} placeholder='Add description here' style={{ flex: 1, marginRight: widthPercentageToDP(1) }} onSubmitEditing={this.onSubmitDescription} />
                                <IconButton iconProps={{ name: 'md-send', type: 'Ionicons', style: { color: APP_COMMON_STYLES.headerColor } }} onPress={this.onPressSubmit} />
                            </Item>
                            : null
                    }
                </View>
            </View>
        );
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { ride } = state.RideInfo.present;
    return { user, ride };
}
const mapDispatchToProps = (dispatch) => {
    return {
        updateSource: (point, ride) => dispatch(updateSource(point, ride)),
        updateWaypoint: (point, ride, index) => dispatch(updateWaypoint(point, ride, index)),
        updateDestination: (point, ride) => dispatch(updateDestination(point, ride)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(CommentSection);

const styles = StyleSheet.create({
    modalRoot: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        flex: 1,
        // flexDirection: 'row',
    },
    container: {
        marginTop: heightPercentageToDP(25),
        marginHorizontal: widthPercentageToDP(5),
        width: widthPercentageToDP(90),
        height: '50%',
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: APP_COMMON_STYLES.headerColor,
        height: APP_COMMON_STYLES.headerHeight,
        position: 'absolute',
        zIndex: 100,
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: widthPercentageToDP(2)
    },
    headerText: {
        color: 'white',
        fontSize: widthPercentageToDP(4),
        fontWeight: 'bold',
        flex: 1,
        marginLeft: 5
    },
    bodyContent: {
        flex: 1,
        marginTop: APP_COMMON_STYLES.headerHeight,
        paddingVertical: heightPercentageToDP(2),
        paddingHorizontal: widthPercentageToDP(2)
    },
    bodyPadding: {
        paddingBottom: heightPercentageToDP(2)
    },
    msgInputBoxContainer: {
        borderColor: APP_COMMON_STYLES.headerColor,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        height: heightPercentageToDP(8),
        borderRadius: heightPercentageToDP(4),
    },
    footerLeftIcon: {
        marginLeft: 10
    },
});