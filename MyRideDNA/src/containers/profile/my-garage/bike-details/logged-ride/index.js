import React, { Component } from 'react';
import { View, ImageBackground, StatusBar, FlatList, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { connect } from 'react-redux';
import { IconButton, ShifterButton, ImageButton } from '../../../../../components/buttons';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, PageKeys, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, POST_TYPE, PORTRAIT_TAIL_TAG, CUSTOM_FONTS, GET_PICTURE_BY_ID, RIDE_TYPE } from '../../../../../constants';
import { Actions } from 'react-native-router-flux';
import { BasicHeader } from '../../../../../components/headers';
import { DefaultText } from '../../../../../components/labels';
import { appNavMenuVisibilityAction, updateBikeLoggedRideAction, screenChangeAction, clearRideAction } from '../../../../../actions';
import { RideCard } from '../../../../../components/cards';
import { getRecordRides, getRideByRideId } from '../../../../../api';

const loggedRideDummy = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }]
class LogggedRide extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            spinValue: new Animated.Value(0),
            pageNumber: 1,
        };
    }
    componentDidMount() {

    }
    componentDidUpdate(prevProps, prevState) {

    }

    showAppNavMenu = () => this.props.showAppNavMenu()

    onPressBackButton = () => Actions.pop();

    getFormattedDate = (isoDateString = new Date().toISOString(), joinBy = ' ') => {
        const dateInfo = new Date(isoDateString).toString().substr(4, 12).split(' ');
        return [dateInfo[0], (dateInfo[2] + '').slice(-2)].join(joinBy);
    }


    _renderItem = ({ item, index }) => {
        return (
            <RideCard
                headerContent={<View style={styles.rideCardHeader}>
                    <DefaultText style={{ fontSize: 19, color: '#585756', fontFamily: CUSTOM_FONTS.robotoBold }}>{item.name ? item.name : 'Name of Ride'}</DefaultText>
                    <IconButton iconProps={{ name: 'options', type: 'SimpleLineIcons', style: styles.headerIcon }} />
                </View>
                }
                image={item.picture ? `${GET_PICTURE_BY_ID}${item.picture.id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` : null}
                rideCardPlaceholder={require('../../../../../assets/img/ride-placeholder-image.png')}

                footerContent={<View style={{ flexDirection: 'row', justifyContent: 'space-around', height: 40, backgroundColor: '#585756', }}>
                    <View style={{ flexDirection: 'row' }}>
                        <ImageButton imageSrc={require('../../../../../assets/img/distance.png')} imgStyles={styles.footerIcon} />
                        <DefaultText style={styles.footerText}>{`${item.totalDistance} ${this.props.user.distanceUnit === 'km' ? 'km' : 'mi'}`}</DefaultText>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <ImageButton imageSrc={require('../../../../../assets/img/duration.png')} imgStyles={styles.footerIcon} />
                        <DefaultText style={styles.footerText}>{item.totalTime} m</DefaultText>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <ImageButton imageSrc={require('../../../../../assets/img/date.png')} imgStyles={styles.footerIcon} />
                        <DefaultText style={styles.footerText}>{this.getFormattedDate(item.date)}</DefaultText>
                    </View>
                </View>}
            />
        );
    }

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.isLoading === true || distanceFromEnd < 0) return;
        this.setState({ isLoading: true }, () => {
            this.props.getRecordRides(this.props.user.userId, this.props.bike.spaceId, this.state.pageNumber, this.fetchSuccessCallback, this.fetchErrorCallback);
        });
    }

    fetchSuccessCallback = (res) => {
        this.setState(prevState => ({ isLoading: false, pageNumber: res.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber }));
    }

    fetchErrorCallback = (er) => {
        this.setState({ isLoading: false });
    }

    renderFooter = () => {
        if (this.state.isLoading) {
            return (
                <View
                    style={{
                        paddingVertical: 20,
                        borderTopWidth: 1,
                        borderColor: "#CED0CE"
                    }}
                >
                    <ActivityIndicator animating size="large" />
                </View>
            );
        }
        return null
    }

    render() {
        const { bike } = this.props
        return (
            <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={styles.fill}>
                    <BasicHeader title='Logged Rides' leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }} />
                    <View style={{ flex: 1 }}>
                        <FlatList
                            style={{ flexDirection: 'column' }}
                            contentContainerStyle={styles.loggedRideList}
                            data={bike.loggedRides}
                            renderItem={this._renderItem}
                            initialNumToRender={4}
                            ListFooterComponent={this.renderFooter}
                            onEndReached={this.loadMoreData}
                            onEndReachedThreshold={0.1}

                        />
                    </View>
                </View>
                <ShifterButton onPress={this.showAppNavMenu} size={18} alignLeft={this.props.user.handDominance === 'left'} />
            </View>
        )
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { hasNetwork } = state.PageState;
    const { currentBike: bike } = state.GarageInfo;
    const { ride } = state.RideInfo.present;
    return { user, hasNetwork, bike, ride };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        getRecordRides: (userId, spaceId, pageNumber, successCallback, errorCallback) => dispatch(getRecordRides(userId, spaceId, pageNumber, (res) => {
            if (typeof successCallback === 'function') successCallback(res);
            console.log('getRecordRides loggedRide :', res);
            dispatch(updateBikeLoggedRideAction({ updates: res, reset: !pageNumber }))
        }, (err) => {
            if (typeof errorCallback === 'function') errorCallback(err);
        })),
        changeScreen: (screenKey) => dispatch(screenChangeAction(screenKey)),
        clearRideFromMap: () => dispatch(clearRideAction()),
        loadRideOnMap: (rideId, rideInfo) => dispatch(getRideByRideId(rideId, rideInfo)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(LogggedRide);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loggedRideList: {
        marginTop: APP_COMMON_STYLES.headerHeight,
    },
    rideCardHeader: {
        flexDirection: 'row',
        height: 50,
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingHorizontal: 26
    },
    headerIcon: {
        color: '#8D8D8D',
        fontSize: 19,
    },
    footerIcon: {
        height: 23,
        width: 26,
        marginTop: 8
    },
    footerText: {
        color: '#EAEAEA',
        fontSize: 15,
        fontFamily: CUSTOM_FONTS.robotoBold,
        marginTop: 11,
        marginLeft: 5
    }
})  