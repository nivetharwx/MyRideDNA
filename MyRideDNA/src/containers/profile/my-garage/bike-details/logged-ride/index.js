import React, { Component } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Animated, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { connect } from 'react-redux';
import { BasicButton, IconButton, ImageButton, LinkButton } from '../../../../../components/buttons';
import { THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG, CUSTOM_FONTS, GET_PICTURE_BY_ID, APP_COMMON_STYLES, RIDE_TYPE, PageKeys, POST_TYPE, UNSYNCED_RIDE, heightPercentageToDP, widthPercentageToDP } from '../../../../../constants';
import { DefaultText } from '../../../../../components/labels';
import { updateBikeLoggedRideAction, editBikeListAction, clearRideAction, screenChangeAction, apiLoaderActions, isRemovedAction, deleteBikeSpecsAction, resetErrorHandlingAction, updateCurrentBikeLikeAndCommentCountAction, setCurrentFriendAction } from '../../../../../actions';
import { PostCard } from '../../../../../components/cards';
import { getRecordRides, getFriendRecordedRides, addLike, unLike, getRideByRideId, pauseRecordRide, completeRecordRide, deleteRide, handleServiceErrors } from '../../../../../api';
import { BasePage } from '../../../../../components/pages';
import { Actions } from 'react-native-router-flux';
import { BaseModal } from '../../../../../components/modal';
import { APP_CONFIGS } from '../../../../../config';
import axios from 'axios';
import DurationIcon from '../../../../../assets/img/Time-Ride.svg'
import DistanceIcon from '../../../../../assets/img/Distance-Rides.svg'
import CalendarIcon from '../../../../../assets/img/Date-Rides.svg'

const NUM_OF_DESC_LINES = 3;
class LogggedRide extends Component {
    _postType = 'ride';
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            spinValue: new Animated.Value(0),
            pageNumber: 0,
            loggedRides: [],
            hasRemainingList: false,
            showMoreSection: {},
            isVisibleOptionsModal: false,
            selectedRide: null,
            showDeleteModal: false,
        };
    }

    componentDidMount() {
        if (this.props.isEditable) {
            this.props.getRecordRides(this.props.user.userId, this.props.spaceId, this.state.pageNumber, this.fetchSuccessCallback, this.fetchErrorCallback);
        } else {
            this.getFriendRecordRide(this.props.user.userId, this.props.friendId, this.props.spaceId, this.state.pageNumber)
        }
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.props.ride.rideId && (prevProps.ride.rideId !== this.props.ride.rideId)) {
            this.props.changeScreen({ name: PageKeys.MAP });
            return;
        }
        if (prevProps.hasNetwork === false && this.props.hasNetwork === true) {
            this.retryApiFunc();
        }

        if (prevProps.isRetryApi === false && this.props.isRetryApi === true) {
            if (Actions.currentScene === this.props.lastApi.currentScene) {
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
    }

    getFriendRecordRide(userId, friendId, spaceId, pageNumber, preference) {
        this.props.getFriendRecordedRides(userId, friendId, spaceId, pageNumber, (res) => {
            if (pageNumber === 0) {
                this.setState((prevState) => ({ loggedRides: res.rides, pageNumber: res.rides.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber, hasRemainingList: res.remainingList > 0 }))
            }
            else {
                this.setState((prevState) => ({ loggedRides: [...prevState.loggedRides, ...res.rides], pageNumber: res.rides.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber, hasRemainingList: res.remainingList > 0 }))
            }
        }, (er) => { })
    }

    retryApiFunc = () => {
        if (this.props.lastApi && this.props.lastApi.currentScene === Actions.currentScene) {
            this.props[`${this.props.lastApi.api}`](...this.props.lastApi.params)
        }
    }


    getFormattedDate = (isoDateString = new Date().toISOString(), joinBy = ' ') => {
        // const dateInfo = new Date(isoDateString).toString().substr(4, 12).split(' ');
        // return [dateInfo[0], (dateInfo[2] + '').slice(-2)].join(joinBy);
        return new Date(isoDateString).toLocaleDateString('en-US');
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

    getTimeAsFormattedString(timeInSeconds) {
        if (!timeInSeconds) return '0 m';
        const m = Math.floor(timeInSeconds / 60);
        return `${m} m`;
    }

    rideKeyExtractor = item => item.rideId;

    openCommentPage(ride) {
        Actions.push(PageKeys.COMMENTS, {
            postId: ride.rideId, isEditable: this.props.isEditable, postType: this._postType,
            onUpdatesuccess: (commentsCount) => {
                console.log('\n\n\n commentsCount : ', commentsCount)
                this.props.isEditable
                    ? this.props.updateCommentsCount(ride.rideId, commentsCount)
                    : this.setState(prevState => ({
                        loggedRides: prevState.loggedRides.map(item => {
                            return ride.rideId === item.rideId ? { ...item, numberOfComments: commentsCount } : item;
                        })
                    }));
            }
        });
    }

    openFriendsProfile = (item) => {
        if (item.userId === this.props.user.userId) {
            Actions.push(PageKeys.PROFILE, { tabProps: { activeTab: 0 } });
        }
        else if (item.isFriend) {
            this.props.setCurrentFriend({ userId: item.userId });
            Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: item.userId });
        }
        else {
            Actions.push(PageKeys.PASSENGER_PROFILE, { isUnknown: true, person: { ...item, userId: item.userId } })
        }
    }

    openLikesPage(ride) { Actions.push(PageKeys.LIKES, { hasNetwork: this.props.hasNetwork, id: ride.rideId, type: this._postType, openFriendsProfile: this.openFriendsProfile }); }

    toggleLikeAction = (item) => {
        if (item.isLiked) {
            this.props.unLike(item.rideId, this.props.user.userId, item.numberOfLikes, this.props.isEditable, (res) => {
                this.setState(prevState => ({
                    loggedRides: prevState.loggedRides.map(ride => {
                        return ride.rideId === item.rideId ? { ...ride, numberOfLikes: item.numberOfLikes - 1, isLiked: false } : ride;
                    })
                }));
            });
        }
        else {
            this.props.addLike(item.rideId, this._postType, item.numberOfLikes, this.props.isEditable, (res) => {
                this.setState(prevState => ({
                    loggedRides: prevState.loggedRides.map(ride => {
                        return ride.rideId === item.rideId ? { ...ride, numberOfLikes: item.numberOfLikes + 1, isLiked: true } : ride;
                    })
                }));
            });
        }
    }

    updateLoggedRideData = (item) => {
        this.setState({
            loggedRides: this.state.loggedRides.map(ride => {
                return ride.rideId === item.rideId ?
                    { ...ride, ...item }
                    : ride
            })
        })
    }

    goToRideDetails = () => {
        const ride = this.state.selectedRide;
        if (this.props.isEditable) {
            Actions.push(PageKeys.LOGGED_RIDE_DETAIL, { rideId: ride.rideId, isEditable: this.props.isEditable });
        }
        else {
            Actions.push(PageKeys.LOGGED_RIDE_DETAIL, { rideId: ride.rideId, currentRide: ride, isEditable: this.props.isEditable, updateLoggedRideData: this.updateLoggedRideData });
        }
        this.hideOptionsModal()
    }

    onDescriptionLayout({ nativeEvent: { lines } }, id) { lines.length >= NUM_OF_DESC_LINES && this.setState(prevState => ({ showMoreSection: { ...prevState.showMoreSection, [id]: true } })); }

    renderRideInfo = (item) => {
        return <View style={{ flexDirection: 'row', justifyContent: 'space-around', height: 40, backgroundColor: '#585756', }}>
            <View style={{ flexDirection: 'row' }}>
                {/* <ImageButton imageSrc={require('../../../../../assets/img/distance.png')} imgStyles={styles.footerIcon} /> */}
                <View style={{ marginTop: 8 }}>
                    <DistanceIcon />
                </View>
                <DefaultText style={styles.footerText}>{this.getDistanceAsFormattedString(item.totalDistance, this.props.user.distanceUnit)}</DefaultText>
            </View>
            <View style={{ flexDirection: 'row' }}>
                {/* <ImageButton imageSrc={require('../../../../../assets/img/duration.png')} imgStyles={styles.footerIcon} /> */}
                <View style={{ marginTop: 8 }}>
                    <DurationIcon />
                </View>
                <DefaultText style={styles.footerText}>{this.getTimeAsFormattedString(item.totalTime)}</DefaultText>
            </View>
            <View style={{ flexDirection: 'row' }}>
                {/* <ImageButton imageSrc={require('../../../../../assets/img/date.png')} imgStyles={styles.footerIcon} /> */}
                <View style={{ marginTop: 8 }}>
                    <CalendarIcon />
                </View>
                <DefaultText style={styles.footerText}>{this.getFormattedDate(item.date)}</DefaultText>
            </View>
        </View>
    }

    renderPostCard = ({ item, index }) => {
        return <PostCard
            onPress={() => this.onPressRide(item)}
            headerContent={<View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <DefaultText style={styles.nameOfRide}>{item.name ? item.name : 'Name of Ride'}</DefaultText>
                    {this.props.isEditable && <IconButton style={{ alignSelf: 'flex-end', paddingVertical: 10, paddingRight: 20 }} iconProps={{ name: 'options', type: 'SimpleLineIcons', style: styles.headerIcon }} onPress={() => this.showOptionsModal(item)} />}
                </View>
                {this.renderRideInfo(item)}
            </View>}
            image={(item.picture && item.picture.id) ? `${GET_PICTURE_BY_ID}${item.picture.id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` : null}
            placeholderImage={require('../../../../../assets/img/ride-placeholder-image.png')}
            placeholderImgHeight={220}
            placeholderBlur={6}
            footerContent={<View>
                <View style={styles.postCardFtrIconCont}>
                    <View style={styles.likesCont}>
                        <IconButton iconProps={{ name: 'like1', type: 'AntDesign', style: { color: item.isLiked ? '#2B77B4' : '#fff', fontSize: 22 } }} onPress={() => this.toggleLikeAction(item)} />
                        <LinkButton style={{ alignSelf: 'center' }} title={item.numberOfLikes + ' Likes'} titleStyle={styles.postCardFtrIconTitle} onPress={() => item.numberOfLikes > 0 && this.openLikesPage(item)} />
                    </View>
                    <IconButton title={item.numberOfComments + ' Comments'} titleStyle={styles.postCardFtrIconTitle} iconProps={{ name: 'ios-chatbubbles', type: 'Ionicons', style: { color: '#fff', fontSize: 22 } }} onPress={() => this.openCommentPage(item)} />
                </View>
                <View style={styles.postCardFtrTxtCont}>
                </View>
            </View>}
        />
    }

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.isLoading === true || distanceFromEnd < 0) return;
        this.setState({ isLoading: true }, () => {
            if (this.props.isEditable) {
                this.props.getRecordRides(this.props.user.userId, this.props.spaceId, this.state.pageNumber, this.fetchSuccessCallback, this.fetchErrorCallback);
            } else {
                this.getFriendRecordRide(this.props.user.userId, this.props.friendId, this.props.spaceId, this.state.pageNumber)
            }
        });
    }

    fetchSuccessCallback = (res) => {
        this.setState(prevState => ({ isLoading: false, pageNumber: res.rides.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber, hasRemainingList: res.remainingList > 0 }));
    }

    fetchErrorCallback = (er) => this.setState({ isLoading: false });

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
        return null;
    }

    gotoItinerary = (isEditing) => {
        if (this.props.ride.rideId === this.state.selectedRide.rideId) {
            Actions.push(PageKeys.ITINERARY_SECTION, { ride: this.state.selectedRide, comingFrom: PageKeys.LOGGED_RIDE, isEditingRide: isEditing });
        }
        else {
            this.props.clearRideFromMap();
            Actions.push(PageKeys.ITINERARY_SECTION, { ride: this.state.selectedRide, comingFrom: PageKeys.LOGGED_RIDE, isEditingRide: isEditing });
        }
        this.setState({ isVisibleOptionsModal: false });
    }

    onPressRide = async (item) => {
        this.hideOptionsModal();
        const selectedRide = this.state.selectedRide === null ? item : this.state.selectedRide;
        if (!selectedRide) return;
        if (this.props.hasNetwork) {
            if (this.props.ride.rideId === selectedRide.rideId) {
                this.props.changeScreen({ name: PageKeys.MAP });
                return;
            }
            if (this.props.ride.rideId) {
                this.props.clearRideFromMap();
            }
            if (selectedRide.unsynced === true) {
                const unsyncedPoints = await AsyncStorage.getItem(`${UNSYNCED_RIDE}${selectedRide.rideId}`);
                if (unsyncedPoints) {
                    const points = JSON.parse(unsyncedPoints);
                    if (points.length > 0) {
                        this.syncCoordinatesWithServer(selectedRide, points[points.length - 1].status, points);
                        return;
                    }
                }
            }
            this.props.loadRideOnMap(selectedRide.rideId, { rideType: RIDE_TYPE.RECORD_RIDE });
        } else {
            console.log("No network found");
        }
    }
    syncCoordinatesWithServer(ride, rideStatus, unsyncedPoints) {
        let actualPoints = [];
        let trackpoints = [];
        actualPoints = unsyncedPoints.reduce((list, item) => {
            list.push(item.loc[1], item.loc[0], item.heading, item.accuracy, item.speed, item.date, item.status);
            return list;
        }, []);
        trackpoints = [...actualPoints];
        if (rideStatus === RECORD_RIDE_STATUS.PAUSED) {
            unsyncedPoints[unsyncedPoints.length - 1].status = rideStatus;
            if (unsyncedPoints.length > 1) {
                if (APP_CONFIGS.callRoadMapApi === true) {
                    console.log('////entered for getcoordsonroad////')
                    this.getCoordsOnRoad(unsyncedPoints, (responseBody, actualPoints, trackpoints, distance) => {
                        this.props.pauseRecordRide(new Date().toISOString(), actualPoints, trackpoints, distance, ride, this.props.user.userId, true);
                    });
                } else {
                    this.getRouteMatrixInfo(unsyncedPoints[0].loc, unsyncedPoints[unsyncedPoints.length - 1].loc, ({ error, distance, duration }) => {
                        this.props.pauseRecordRide(new Date().toISOString(), actualPoints, trackpoints, distance, ride, this.props.user.userId, true);
                    });
                }
                return;
            }
            this.props.pauseRecordRide(new Date().toISOString(), actualPoints, trackpoints, 0, ride, this.props.user.userId, true);
        } else if (rideStatus === RECORD_RIDE_STATUS.COMPLETED) {
            unsyncedPoints[unsyncedPoints.length - 1].status = rideStatus;
            if (unsyncedPoints.length > 1) {
                if (APP_CONFIGS.callRoadMapApi === true) {
                    console.log('////entered for getcoordsonroad////')
                    this.getCoordsOnRoad(unsyncedPoints, (responseBody, actualPoints, trackpoints, distance) => {
                        this.props.completeRecordRide(new Date().toISOString(), actualPoints, trackpoints, distance, ride, this.props.user.userId, true)
                    });
                } else {
                    this.getRouteMatrixInfo(unsyncedPoints[0].loc, unsyncedPoints[unsyncedPoints.length - 1].loc, ({ error, distance, duration }) => {
                        this.props.completeRecordRide(new Date().toISOString(), actualPoints, trackpoints, distance, ride, this.props.user.userId, true)
                    });
                }
                return;
            }
            this.props.completeRecordRide(new Date().toISOString(), actualPoints, trackpoints, 0, ride, this.props.user.userId, true);
        }
    }

    getRouteMatrixInfo = async (source = null, destination = null, callback) => {
        if (!source || !destination) {
            typeof callback === 'function' && callback({ error: "Source or destination not found", distance: 0, duration: 0 });
            return;
        }
        try {
            const locPathParam = source.join() + ';' + destination.join();
            const res = await axios.get(`https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${locPathParam}?sources=0&destinations=1&annotations=distance,duration&access_token=${JS_SDK_ACCESS_TOKEN}`);
            if (res.data.code === "Ok") {
                const { distances, durations } = res.data;
                typeof callback === 'function' && callback({ distance: distances[0][0], duration: durations[0][0] });
            } else {
                typeof callback === 'function' && callback({ error: "Response is not Ok", distance: 0, duration: 0 });
            }
        } catch (er) {
            typeof callback === 'function' && callback({ error: `Something went wrong: ${er}`, distance: 0, duration: 0 });
        }
    }

    async getCoordsOnRoad(gpsPointTimestamps, callback) {
        const actualPoints = [];
        const gpsPoints = gpsPointTimestamps.reduce((list, item) => {
            list.push(item.loc);
            actualPoints.push(item.loc[1], item.loc[0], item.date, item.status);
            return list;
        }, []);
        let locPathParam = gpsPoints.reduce((param, coord) => param + coord.join(',') + ';', "");
        locPathParam = locPathParam.slice(0, locPathParam.length - 1);
        console.log(locPathParam);
        try {
            const res = await axios.get(`https://api.mapbox.com/matching/v5/mapbox/driving/${locPathParam}?tidy=true&geometries=geojson&access_token=${JS_SDK_ACCESS_TOKEN}`);
            const { matchings } = res.data;
            console.log(res.data);
            if (res.data.code === "NoRoute" || (matchings && matchings.length === 0)) {
                console.log("No matching coords found");
                callback(res.data, [], [], 0);
                return;
            }
            // TODO: Return distance and duration from matching object (here matchings[0])
            const trackpoints = matchings[0].geometry.coordinates.reduce((arr, coord, index) => {
                if (gpsPointTimestamps[index]) {
                    arr.push(coord[1], coord[0], gpsPointTimestamps[index].date, gpsPointTimestamps[index].status);
                } else {
                    const lastPoint = gpsPointTimestamps[gpsPointTimestamps.length - 1];
                    arr.push(coord[1], coord[0], lastPoint.date, lastPoint.status);
                }
                return arr;
            }, []);
            callback(res.data, actualPoints, trackpoints, matchings[0].distance);
        } catch (er) {
            console.log("matching error: ", er);
        }
    }

    deleteRide = () => {
        const { selectedRide } = this.state;
        if (this.props.ride.rideId === selectedRide.rideId) {
            this.props.clearRideFromMap();
        }
        AsyncStorage.removeItem(`${UNSYNCED_RIDE}${selectedRide.rideId}`).then(() => this.props.deleteRide(selectedRide.rideId, selectedRide.rideType));
        this.hideDeleteModal();
        this.hideOptionsModal();
    }

    showOptionsModal = (item) => this.setState({ isVisibleOptionsModal: true, selectedRide: item });

    hideOptionsModal = () => this.setState({ isVisibleOptionsModal: false, selectedRide: null });

    openDeleteModal = (item) => this.setState({ showDeleteModal: true });

    hideDeleteModal = () => this.setState({ showDeleteModal: false});


    render() {
        const { bike, isEditable } = this.props;
        const { loggedRides, isVisibleOptionsModal, selectedRide, showDeleteModal } = this.state;
        if (isEditable && !bike) return null;
        return (
            <BasePage heading={'Logged Rides'}>
                <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={isVisibleOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                    <View style={APP_COMMON_STYLES.optionsContainer}>
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='EDIT' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={() => this.gotoItinerary(true)} />
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='VIEW DETAIL' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={() => this.gotoItinerary(false)} />
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='SHOW ON THE MAP' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.onPressRide} />
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='DELETE' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openDeleteModal}
                            disabled={selectedRide && this.props.ride.rideId === selectedRide.rideId && selectedRide.status === RECORD_RIDE_STATUS.RUNNING} />
                             {
                        showDeleteModal && <BaseModal containerStyle={{ justifyContent: 'center', alignItems: 'center' }} isVisible={showDeleteModal} onCancel={this.hideDeleteModal} >
                            <View style={styles.deleteBoxCont}>
                                <DefaultText style={styles.deleteTitle}>Delete Ride</DefaultText>
                                <DefaultText  style={styles.deleteText}>{`Are you sure you want to delete this Ride from your Logged Rides? Doing so will also remove this ride from your Atlas. You will not be able to undo this action`}</DefaultText>
                                <View style={styles.btnContainer}>
                                    <BasicButton title='CANCEL' style={[styles.actionBtn, { backgroundColor: '#8D8D8D' }]} titleStyle={styles.actionBtnTxt} onPress={this.hideDeleteModal} />
                                    <BasicButton title='DELETE' style={styles.actionBtn} titleStyle={styles.actionBtnTxt} onPress={()=>this.deleteRide()} />
                                </View>
                            </View>
                        </BaseModal>
                    }
                    </View>
                </BaseModal>
               
                <FlatList
                    contentContainerStyle={{ paddingBottom: this.state.hasRemainingList ? 40 : 0 }}
                    showsVerticalScrollIndicator={false}
                    data={isEditable ? bike.loggedRides : loggedRides}
                    keyExtractor={this.rideKeyExtractor}
                    renderItem={this.renderPostCard}
                    initialNumToRender={4}
                    ListFooterComponent={this.renderFooter}
                    onEndReached={this.loadMoreData}
                    onEndReachedThreshold={0.1}
                />
                {
                    this.props.hasNetwork === false && (this.props.isEditable ? ((bike.loggedRides && bike.loggedRides.length === 0) || !bike.loggedRides) : ((loggedRides && loggedRides.length === 0) || !loggedRides)) && <View style={{ flexDirection: 'column', justifyContent: 'space-between', position: 'absolute', top: heightPercentageToDP(20), left: widthPercentageToDP(27), height: 100, }}>
                        <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                        <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                    </View>
                }
            </BasePage>
        )
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { hasNetwork, lastApi, isRetryApi } = state.PageState;
    const { currentBike: bike } = state.GarageInfo;
    const { ride } = state.RideInfo.present;
    return { user, hasNetwork, lastApi, isRetryApi, bike, ride };
}
const mapDispatchToProps = (dispatch) => {
    return {
        getRecordRides: (userId, spaceId, pageNumber, successCallback, errorCallback) => dispatch(getRecordRides(userId, spaceId, pageNumber, (res) => {
            if (typeof successCallback === 'function') successCallback(res);
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            dispatch(updateBikeLoggedRideAction({ updates: res.rides, reset: !pageNumber }))
        }, (err) => {
            if (typeof errorCallback === 'function') errorCallback(err);
            handleServiceErrors(err, [userId, spaceId, pageNumber, successCallback, errorCallback], 'getRecordRides', true, true);
        })),
        addLike: (rideId, postType, numberOfLikes, isEditable, successCallback) => addLike(rideId, postType).then(res => {
            console.log('addLike sucess : ', res);
            isEditable
                ? dispatch(updateCurrentBikeLikeAndCommentCountAction({ isUpdateLike: true, isLiked: true, rideId, isAdded: true }))
                : typeof successCallback === 'function' && successCallback();
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
        }).catch(er => {
            console.log('addLike error : ', er)
            handleServiceErrors(er, [rideId, postType, numberOfLikes, isEditable, successCallback], 'addLike', true, true);
        }),
        unLike: (rideId, userId, numberOfLikes, isEditable, successCallback) => unLike(rideId, userId).then(res => {
            console.log('unLike sucess : ', res);
            isEditable
                ? dispatch(updateCurrentBikeLikeAndCommentCountAction({ isUpdateLike: true, isLiked: true, rideId, isAdded: false }))
                : typeof successCallback === 'function' && successCallback();
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
        }).catch(er => {
            console.log('unLike error : ', er)
            handleServiceErrors(er, [rideId, userId, numberOfLikes, isEditable, successCallback], 'unLike', true, true);
        }),
        updateCommentsCount: (rideId, numberOfComments) => dispatch(updateCurrentBikeLikeAndCommentCountAction({ rideId, numberOfComments })),
        changeScreen: (screenProps) => dispatch(screenChangeAction(screenProps)),
        clearRideFromMap: () => dispatch(clearRideAction()),
        loadRideOnMap: (rideId, rideInfo) => dispatch(getRideByRideId(rideId, rideInfo)),
        pauseRecordRide: (pauseTime, actualPoints, trackpoints, distance, ride, userId, loadRide) => dispatch(pauseRecordRide(false,pauseTime, actualPoints, trackpoints, distance, ride, userId, loadRide)),
        completeRecordRide: (endTime, actualPoints, trackpoints, distance, ride, userId, loadRide) => dispatch(completeRecordRide(endTime, actualPoints, trackpoints, distance, ride, userId, loadRide)),
        deleteRide: (rideId) => {
            dispatch(apiLoaderActions(true))
            deleteRide(rideId).then(res => {
                console.log('deleteRide loggedRide: ', res.data)
                dispatch(apiLoaderActions(false))
                dispatch(isRemovedAction(true))
                dispatch(deleteBikeSpecsAction({ rideId, postType: POST_TYPE.LOGGED_RIDES }))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
            })
                .catch(er => {
                    console.log(er.response);
                    handleServiceErrors(er, [rideId], 'deleteRide', true, true);
                    dispatch(apiLoaderActions(false))
                })
        },
        getFriendRecordedRides: (userId, friendId, spaceId, pageNumber, successCallback, errorCallback) => getFriendRecordedRides(userId, friendId, spaceId, pageNumber).then(res => {
            console.log('getFriendRecordedRides success : ', res)
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            successCallback(res.data)
        }).catch(er => {
            console.log('getFriendRecordedRides error : ', er)
            errorCallback(er)
            handleServiceErrors(er, [userId, friendId, spaceId, pageNumber, successCallback, errorCallback], 'getFriendRecordedRides', true, true);
        }),
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'logged_ride', isRetryApi: state })),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
    };

}
export default connect(mapStateToProps, mapDispatchToProps)(LogggedRide);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff',
    },
    nameOfRide: {
        fontSize: 14,
        color: '#585756',
        fontFamily: CUSTOM_FONTS.robotoBold,
        alignSelf: 'center',
        padding: 10,
        marginLeft: 20
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
    },
    postCardFtrIconTitle: {
        color: '#fff',
        marginLeft: 10
    },
    postCardFtrDate: {
        marginTop: 6,
        fontSize: 9,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 0.9,
        color: '#8D8D8D'
    },
    postCardFtrIconCont: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        height: 40,
        backgroundColor: '#585756'
    },
    postCardFtrTxtCont: {
        marginHorizontal: 26,
        marginVertical: 10
    },
    likesCont: {
        flexDirection: 'row'
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    actionBtn: {
        height: 35,
        backgroundColor: '#2B77B4',
        width: 125,
        alignSelf: 'center',
        borderRadius: 20,
        marginTop: 20
    },
    actionBtnTxt: {
        letterSpacing: 1.4,
        fontSize: 14,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    deleteBoxCont: {
        height: 320,
        width: 327,
        backgroundColor: '#F4F4F4',
        borderRadius: 20,
        padding: 31,
        paddingRight: 40
    },
    deleteTitle: {
        color: '#585756',
        fontFamily: CUSTOM_FONTS.robotoBold,
        fontSize: 20
    },
    deleteText: {
        color: '#585756',
        fontFamily: CUSTOM_FONTS.roboto,
        fontSize: 17,
        letterSpacing: 0.17,
        marginTop: 30
    },
})  