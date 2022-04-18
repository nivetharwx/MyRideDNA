import React, { Component } from 'react';
import { View, FlatList, Alert, StyleSheet, ActivityIndicator, Easing, Animated, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { connect } from 'react-redux';
import { Tab, Tabs, Toast, Thumbnail } from "native-base";
import { PageKeys, RIDE_TYPE, APP_COMMON_STYLES, widthPercentageToDP, THUMBNAIL_TAIL_TAG, JS_SDK_ACCESS_TOKEN, RECORD_RIDE_STATUS, UNSYNCED_RIDE, heightPercentageToDP, GET_PICTURE_BY_ID, PORTRAIT_TAIL_TAG, CUSTOM_FONTS, RIDE_SORT_OPTIONS, CHAT_CONTENT_TYPE } from '../../constants';
import { LinkButton, ImageButton, IconButton, BasicButton } from '../../components/buttons';
import { appNavMenuVisibilityAction, screenChangeAction, clearRideAction, apiLoaderActions, updateRideInListAction, updateRideAction, isRemovedAction, deleteUnsyncedRideAction, updateRideListAction, resetErrorHandlingAction, deleteRideAction, updateRideLikeAndCommentAction, setCurrentFriendAction } from '../../actions';
import { PostCard } from '../../components/cards';
import { getAllBuildRides, getRideByRideId, deleteRide, getAllRecordedRides, copyRide, getAllPublicRides, copySharedRide, updateRide, pauseRecordRide, completeRecordRide, handleServiceErrors, addLike, unLike, sendMessage } from '../../api';
import { SearchBoxFilter } from '../../components/inputs';
import { DefaultText } from '../../components/labels';
import { BaseModal } from '../../components/modal';
import axios from 'axios';
import { APP_CONFIGS } from '../../config';
import { Actions } from 'react-native-router-flux';
import { BasePage } from '../../components/pages';
import DurationIcon from '../../assets/img/Time-Ride.svg'
import DistanceIcon from '../../assets/img/Distance-Rides.svg'
import CalendarIcon from '../../assets/img/Date-Rides.svg'

const NUM_OF_DESC_LINES = 3;
const tabCode= {
    0:RIDE_TYPE.BUILD_RIDE,
    1:RIDE_TYPE.RECORD_RIDE,
    2:RIDE_TYPE.SHARED_RIDE
}
export class Rides extends Component {
    _postType = 'ride';
    _listRef = null;
    tabsRef = null;
    callInitiatedObj = {};
    _searchQueryTimeout = null;
    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            activeTab: 0,
            searchQuery: '',
            newRideName: '',
            isVisibleRenameModal: false,
            isVisibleOptionsModal: false,
            selectedRide: null,
            isLoadingData: false,
            isLoading: false,
            spinValue: new Animated.Value(0),
            showFilter: false,
            showMoreSection: {},
            hasRemainingList: false,
            pageNumber: 0,
            sortBy: RIDE_SORT_OPTIONS.DATE,
            showRequestModal:false,
        };
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

    componentDidMount() { 
        console.log(this.props,'props/////')
        this.fetchRides(); 
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.ride.rideId && (prevProps.ride.rideId !== this.props.ride.rideId)) {
            this.props.changeScreen({ name: PageKeys.MAP});
            return;
        }
        const { activeTab } = this.state;
        if (prevState.activeTab !== activeTab) {
            if (activeTab === 0) this.fetchRides(this.props.buildRides.length === 0);
            else if (activeTab === 1) this.fetchRides(this.props.recordedRides.length === 0);
            else if (activeTab === 2) this.fetchRides(this.props.sharedRides.length === 0);
        }

        if (prevProps.hasNetwork === false && this.props.hasNetwork === true) {
            this.retryApiFunction();
        }

        if (prevProps.isRetryApi === false && this.props.isRetryApi === true) {
            if (Actions.currentScene === this.props.lastApi.currentScene) {
                Alert.alert(
                    'Something went wrong ',
                    '',
                    [
                        {
                            text: 'Retry ', onPress: () => {
                                this.retryApiFunction();
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

    retryApiFunc = () => {
        if (this.props.lastApi && this.props.lastApi.currentScene === Actions.currentScene) {
            this.props[`${this.props.lastApi.api}`](...this.props.lastApi.params)
        }
    }

    fetchRides = (showLoader = true, pageNumber = 0) => {
        const { activeTab, sortBy, searchQuery } = this.state;
        switch (activeTab) {
            case 0: this.props.getAllBuildRides(this.props.user.userId, showLoader, pageNumber, (res) => {
                if (res.rides.length > 0) {
                    this.setState({ pageNumber: pageNumber + 1, showFilter: true, hasRemainingList: res.remainingList > 0, isLoading: false, }, () => {
                        pageNumber === 0 && this._listRef && this._listRef.scrollToOffset({ animated: true, offset: 0 });
                    });
                } else {
                    this.setState({ showFilter: false, isLoading: false, });
                }
            }, (err) => { }, sortBy, searchQuery);
                break;
            case 1: this.props.getAllRecordedRides(this.props.user.userId, showLoader, pageNumber, (res) => {
                if (res.rides.length > 0) {
                    this.setState({ pageNumber: pageNumber + 1, showFilter: true, hasRemainingList: res.remainingList > 0, isLoading: false, }, () => {
                        pageNumber === 0 && this._listRef && this._listRef.scrollToOffset({ animated: true, offset: 0 });
                    });
                } else {
                    this.setState({ showFilter: false, isLoading: false, });
                }
            }, (err) => { }, sortBy, searchQuery);
                break;
            case 2: this.props.getAllPublicRides(this.props.user.userId, showLoader, pageNumber, (res) => {
                if (res.rides.length > 0) {
                    this.setState({ pageNumber: pageNumber + 1, showFilter: true, hasRemainingList: res.remainingList > 0, isLoading: false, }, () => {
                        pageNumber === 0 && this._listRef && this._listRef.scrollToOffset({ animated: true, offset: 0 });
                    });
                } else {
                    this.setState({ showFilter: false, isLoading: false, });
                }
            }, (err) => { }, sortBy, searchQuery);
                break;
        }
    }

    retryApiFunction = () => {
        this.state.spinValue.setValue(0);
        Animated.timing(this.state.spinValue, {
            toValue: 1,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: true
        }).start(() => {
            if (this.props.hasNetwork === true) {
                this.fetchRides();
            }
        });
    }

    onPullRefresh = () => {
        this.setState({ isRefreshing: true });
        this.props.getAllPublicRides(this.props.user.userId, false, 0, (res) => {
        }, (err) => { });
    }

    showDeleteSuccessMessage() {
        Toast.show({
            text: 'Ride removed successfully',
            buttonText: 'Okay'
        });
        this.props.isRemovedAction(false);
    }

    onChangeTab = ({ from, i }) => {
        
        this.setState({ activeTab: i, searchQuery: '', sortBy: RIDE_SORT_OPTIONS.DATE, showFilter: false });
    }

    keyExtractor = (item) => item.rideId;

    deleteRideConfirmation = () => {
        const { selectedRide } = this.state;
        this.setState({ isVisibleOptionsModal: false, showRequestModal:false }, () => {
            setTimeout(() => {
                if (this.props.ride.rideId === selectedRide.rideId) {
                    this.props.clearRideFromMap();
                }
                AsyncStorage.removeItem(`${UNSYNCED_RIDE}${selectedRide.rideId}`).then(() => this.props.deleteRide(selectedRide.rideId, selectedRide.rideType));
            }, 100);
        })
    }

    onPressRide = async (ride = null) => {
        this.hideOptionsModal();
        const selectedRide = this.state.selectedRide === null ? ride : this.state.selectedRide;
        if (!selectedRide) return;
        if (this.props.hasNetwork) {
            if (this.props.ride.rideId === selectedRide.rideId) {
                this.props.changeScreen({ name: PageKeys.MAP });
                return;
            }
            if (this.props.ride.rideId) {
                this.props.clearRideFromMap();
            }
            let rideType = RIDE_TYPE.BUILD_RIDE;
            if (this.state.activeTab === 1) {
                rideType = RIDE_TYPE.RECORD_RIDE;
            } else if (this.state.activeTab === 2) {
                rideType = RIDE_TYPE.SHARED_RIDE;
            }
            console.log('////selected ride////',selectedRide,selectedRide.unsynced)
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
            this.props.loadRideOnMap(selectedRide.rideId, { rideType });
        } else {
            console.log("No network found");
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

    copyRide = () => {
        const { rideId, name } = this.state.selectedRide;
        this.props.copySharedRide(rideId, `Copy of ${name}`,
            RIDE_TYPE.BUILD_RIDE, this.props.user.userId, new Date().toISOString());
        this.setState({ isVisibleRenameModal: false, isVisibleOptionsModal: false });
    }

    getTimeAsFormattedString(timeInSeconds) {
        if (!timeInSeconds) return '0 m';
        const m = Math.floor(timeInSeconds / 60);
        const timeText = `${m} m`;
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

    getDateAndTime = (date) => {
        if (!date) return '';
        const dateFormat = { day: 'numeric', year: '2-digit', month: 'short' };
        return new Date(date).toLocaleDateString('en-IN', dateFormat) + ', ' + new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    getFormattedDate = (isoDateString = new Date().toISOString(), joinBy = ' ') => {
        // const dateInfo = new Date(isoDateString).toString().substr(4, 12).split(' ');
        // return [dateInfo[0] + '.', (dateInfo[2] + '').slice(-2)].join(joinBy);
        return new Date(isoDateString).toLocaleDateString('en-US');
    }

    goToRideDetails = () => {
        const { selectedRide } = this.state
        Actions.push(PageKeys.RIDE_DETAILS, { rideId: selectedRide.rideId, rideType: selectedRide.rideType, isEditable: selectedRide.creatorId === this.props.user.userId });
        this.hideOptionsModal()
    }

    renderRideInfo = (item) => {
        return <View style={{ flexDirection: 'row', justifyContent: 'space-around', height: 40, backgroundColor: '#585756', }}>
            <View style={{ flexDirection: 'row' }}>
                {/* <ImageButton imageSrc={require('../../assets/img/distance.png')} imgStyles={styles.footerIcon} /> */}
                <View style={{ marginTop: 8 }}>
                    <DistanceIcon />
                </View>
                <DefaultText style={styles.footerText}>{this.getDistanceAsFormattedString(item.totalDistance, this.props.user.distanceUnit)}</DefaultText>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <View style={{ marginTop: 8 }}>
                    <DurationIcon />
                </View>
                {/* <ImageButton imageSrc={require('../../assets/img/duration.png')} imgStyles={styles.footerIcon} /> */}
                <DefaultText style={styles.footerText}>{this.getTimeAsFormattedString(item.totalTime)}</DefaultText>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <View style={{ marginTop: 8 }}>
                    <CalendarIcon />
                </View>
                {/* <ImageButton imageSrc={require('../../assets/img/date.png')} imgStyles={styles.footerIcon} /> */}
                <DefaultText style={styles.footerText}>{this.getFormattedDate(item.date)}</DefaultText>
            </View>
        </View>
    }

    onDescriptionLayout({ nativeEvent: { lines } }, id) { lines.length >= NUM_OF_DESC_LINES && this.setState(prevState => ({ showMoreSection: { ...prevState.showMoreSection, [id]: true } })); }

    toggleLikeAction(ride, rideType) {
        if (ride.isLiked) {
            this.props.unLike(ride.rideId, this.props.user.userId, rideType, ride.numberOfLikes);
        } else {
            this.props.addLike(ride.rideId, this._postType, rideType, ride.numberOfLikes);
        }
    }

    openLikesPage(ride) { Actions.push(PageKeys.LIKES, { hasNetwork: this.props.hasNetwork, id: ride.rideId, type: this._postType, openFriendsProfile: this.openFriendsProfile }); }

    openCommentPage(ride, rideType) {
        Actions.push(PageKeys.COMMENTS, {
            postId: ride.rideId, postType: this._postType, isEditable: ride.creatorId === this.props.user.userId,
            onUpdatesuccess: (commentsCount) => this.props.updateCommentsCount(ride.rideId, rideType, commentsCount)
            ,post:ride
        });
    }

    openFriendsProfile = (item) => {
        const personId = item.creatorId || item.userId;
        if (personId === this.props.user.userId) {
            Actions.push(PageKeys.PROFILE, { tabProps: { activeTab: 0 } });
        }
        else if (item.isFriend) {
            this.props.setCurrentFriend({ userId: personId });
            Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: personId });
        }
        else {
            Actions.push(PageKeys.PASSENGER_PROFILE, { isUnknown: true, person: { ...item, userId: personId } })
        }
    }

    renderRides(ride, rideType) {
        console.log(ride)
        return <PostCard
            onPress={() => this.onPressRide(ride)}
            outerContainer={{ paddingBottom: 32 }}
            headerContent={<View>
                <View style={styles.headerContainer}>
                    <View style={{ flexDirection:'row', flex: 1 }}>
                        {rideType !== RIDE_TYPE.SHARED_RIDE && <DefaultText style={styles.nameOfRide}>{ride.name}</DefaultText>}
                        {rideType === RIDE_TYPE.SHARED_RIDE && <ImageButton pictureStyle={{ resizeMode: null }} imgStyles={{ height: 40, width: 40, borderRadius: 20, overflow: 'hidden' }} imageSrc={ride.creatorProfilePictureId ? { uri: `${GET_PICTURE_BY_ID}${ride.creatorProfilePictureId.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` } : require('../../assets/img/profile-pic-placeholder.png')} onPress={() => this.openFriendsProfile(ride)} />}
                        {/* {rideType === RIDE_TYPE.SHARED_RIDE && <Thumbnail  style={{ height: 40, width: 40 }} source={ride.creatorProfilePictureId ? { uri: `${GET_PICTURE_BY_ID}${ride.creatorProfilePictureId.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` } : require('../../assets/img/profile-pic-placeholder.png')} />} */}
                        {rideType === RIDE_TYPE.SHARED_RIDE && <DefaultText style={styles.nameOfRide}>{ride.creatorName}</DefaultText>}
                    </View>
                    <IconButton iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#8D8D8D', fontSize: 20 } }} onPress={() => this.showOptionsModal({ ...ride, rideType })} />
                </View>
                {rideType !== RIDE_TYPE.SHARED_RIDE && <View style={{paddingHorizontal:20,flexDirection: rideType !== RIDE_TYPE.SHARED_RIDE?'column':'row', flex: 1 }}>
                    <DefaultText numberOfLines={NUM_OF_DESC_LINES} style={{
                    fontSize: 13,
                    color: ride.description&&(ride.description.length>0)?'#585756':'#e0dfdc',
                    padding: 10,
                    paddingTop:0
                    }}>{ride.description&&(ride.description.length>0)?ride.description:'Description'}</DefaultText>
                </View>}
                {this.renderRideInfo(ride)}
            </View>}
            image={ride.snapshotId ? `${GET_PICTURE_BY_ID}${ride.snapshotId.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` : null}
            // image={ride.snapshot}
            // placeholderImage={require('../../assets/img/ride-placeholder-image.png')}
            placeholderImage={{uri:ride.snapshot}}
            placeholderImgHeight={220}
            placeholderBlur={0}
            footerContent={<View>
                <View style={styles.postCardFtrIconCont}>
                    <View style={styles.likesCont}>
                        <IconButton iconProps={{ name: 'like1', type: 'AntDesign', style: { color: ride.isLiked ? '#2B77B4' : '#fff', fontSize: 22 } }} onPress={() => this.toggleLikeAction(ride, rideType)} />
                        <LinkButton style={{ alignSelf: 'center' }} title={ride.numberOfLikes + ' Likes'} titleStyle={styles.postCardFtrIconTitle} onPress={() => ride.numberOfLikes > 0 && this.openLikesPage(ride)} />
                    </View>
                    <IconButton title={ride.numberOfComments + ' Comments'} titleStyle={styles.postCardFtrIconTitle} iconProps={{ name: 'ios-chatbubbles', type: 'Ionicons', style: { color: '#fff', fontSize: 22 } }} onPress={() => this.openCommentPage(ride, rideType)} />
                </View>
                {
                    rideType === RIDE_TYPE.SHARED_RIDE && <View style={styles.postCardFtrTxtCont}>
                        <DefaultText style={styles.postCardFtrTitle}>{ride.name}</DefaultText>
                        <DefaultText onTextLayout={(evt) => this.onDescriptionLayout(evt, ride.rideId)} numberOfLines={NUM_OF_DESC_LINES}>{ride.description}</DefaultText>{this.state.showMoreSection[ride.rideId] ? <DefaultText>more</DefaultText> : null}
                    </View>
                }
            </View>}
        />
    }

    getDateLabel(hourDiff) {
        var days = parseInt(parseInt(hourDiff) / 24);
        if (days >= 365) {
            days = parseInt(days / 365);
            days = days > 1 ? days + ' years ago' : days + ' year ago';
        } else if (days >= 30) {
            days = parseInt(days / 30);
            days = days > 1 ? days + ' months ago' : days + ' month ago';
        } else if (days >= 7) {
            days = parseInt(days / 7);
            days = days > 1 ? days + ' weeks ago' : days + ' week ago';
        } else if (days >= 1) {
            days = days > 1 ? days + ' days ago' : days + ' day ago';
        } else if (hourDiff >= 1) {
            hourDiff = parseInt(hourDiff);
            days = hourDiff > 1 ? hourDiff + ' hours ago' : hourDiff + ' hour ago';
        } else if (hourDiff * 60 >= 1) {
            let mintDiff = parseInt(hourDiff * 60);
            days = mintDiff > 1 ? mintDiff + ' minutes ago' : mintDiff + ' minute ago';
        } else {
            days = 'just now';
        }
        return days;
    }

    loadMoreData = () => {
        if (this.state.hasRemainingList === true && this.state.isLoadingData && this.state.isLoading === false) {
            this.setState({ isLoading: true, isLoadingData: false });
            this.fetchRides(false, this.state.pageNumber);
        }
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

    onChangeSearchValue = (val = '') => {
        clearTimeout(this._searchQueryTimeout);
        this.setState({ searchQuery: val });
        this._searchQueryTimeout = setTimeout(() => this.fetchRides(), 300);
    }

    showOptionsModal = (item) => this.setState({ isVisibleOptionsModal: true, selectedRide: item });

    hideOptionsModal = () => this.setState({ isVisibleOptionsModal: false, selectedRide: null });

    showRenameModal = () => this.setState({ isVisibleRenameModal: true, isVisibleOptionsModal: false })

    onCancelRenameForm = () => this.setState({ isVisibleRenameModal: false, newRideName: '', selectedRide: null });

    chageSortOption(value) { this.setState({ sortBy: value }, () => this.fetchRides()); }

    gotoItinerary = (isEditing) => {
        
        if (this.props.ride.rideId === this.state.selectedRide.rideId) {
            Actions.push(PageKeys.ITINERARY_SECTION, { ride: this.state.selectedRide, comingFrom: PageKeys.RIDES, isEditingRide: isEditing,rideType:tabCode[this.state.activeTab] });
        }
        else {
            this.props.clearRideFromMap();
            Actions.push(PageKeys.ITINERARY_SECTION, { ride: this.state.selectedRide, comingFrom: PageKeys.RIDES, isEditingRide: isEditing,rideType:tabCode[this.state.activeTab]  });
        }
        this.setState({ isVisibleOptionsModal: false });
    }

    renderSearchbox = (showFilter, isShared = false) => {
        const { searchQuery, sortBy } = this.state;
        return <SearchBoxFilter
            searchQuery={searchQuery} onChangeSearchValue={this.onChangeSearchValue}
            placeholder='Name' outerContainer={{ marginTop: 20, marginHorizontal: widthPercentageToDP(8), marginBottom: 15 }}
            footer={showFilter && <View style={styles.filterContainer}>
                <DefaultText style={{ fontFamily: CUSTOM_FONTS.roboto, paddingLeft: 15 }}>SORT:</DefaultText>
                <LinkButton style={{ paddingHorizontal: 10, borderRightWidth: 1 }} title='DATE' titleStyle={[styles.filterIcon, sortBy === RIDE_SORT_OPTIONS.DATE ? styles.activeSortOption : null]} onPress={() => this.chageSortOption(RIDE_SORT_OPTIONS.DATE)} />
                <LinkButton style={{ paddingHorizontal: 10, borderRightWidth: 1 }} title='DISTANCE' titleStyle={[styles.filterIcon, sortBy === RIDE_SORT_OPTIONS.DISTANCE ? styles.activeSortOption : null]} onPress={() => this.chageSortOption(RIDE_SORT_OPTIONS.DISTANCE)} />
                <LinkButton style={{ paddingHorizontal: 10 }} title='TIME' titleStyle={[styles.filterIcon, sortBy === RIDE_SORT_OPTIONS.TIME ? styles.activeSortOption : null]} onPress={() => this.chageSortOption(RIDE_SORT_OPTIONS.TIME)} />
                {isShared && <LinkButton style={{ paddingHorizontal: 10, borderLeftWidth: 1 }} title='AUTHOR' titleStyle={[styles.filterIcon, sortBy === RIDE_SORT_OPTIONS.AUTHOR ? styles.activeSortOption : null]} onPress={() => this.chageSortOption(RIDE_SORT_OPTIONS.AUTHOR)} />}
            </View>}
        />
    }

    shareRides = (rideId, ids, groupIds) => {
        if (!rideId || (!ids && !groupIds)) return;
        const data = {
            userId: this.props.user.userId, name: this.props.user.name, nickname: this.props.user.nickname,
            senderPictureId: this.props.user.profilePictureId,
            content: rideId,
            type: CHAT_CONTENT_TYPE.RIDE
        };
        if (ids) {
            data.userIds = ids
        }
        if (groupIds) {
            data.groupIds = groupIds
        }
        this.props.shareRides(data);
    }

    goToChatList = () => {
        this.hideOptionsModal();
        if (this.state.selectedRide.privacyMode === 'private') return;
        Actions.push(PageKeys.CHAT_LIST, { isShareMode: true, isSharingRide: true, rideId: this.state.selectedRide.rideId, callbackFn: this.shareRides })
    }

    openRequestModal = () => this.setState({ showRequestModal: true, });

    hideRequestModal = () => this.setState({ showRequestModal: false});

    render() {
        const { isRefreshing, showFilter, isVisibleOptionsModal, selectedRide, activeTab, showRequestModal } = this.state;
        const { buildRides, recordedRides, sharedRides, showLoader, hasNetwork,notificationCount } = this.props;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        return (
            <BasePage showLoader={showLoader} loaderText={this.props.ride.unsynced ? 'You have unsynced data. Please wait to finish' : 'Loading...'} heading={'Atlas'}
                headerLeftIconProps={{ reverse: true, name: 'ios-notifications', type: 'Ionicons', onPress: () => Actions.push(PageKeys.NOTIFICATIONS) }}
                headerRightIconProps={activeTab === 2 ? null : { reverse: true, name: 'md-add', type: 'Ionicons', containerStyle: styles.headerRtIconContainer, style: styles.addIcon, onPress: () => this.props.changeScreen({ name: PageKeys.MAP, params: activeTab === 0 ? { showCreateRide: {active:true}} : { showRecordRide: {active:true}}}) }}
                notificationCount={notificationCount}>
                <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={isVisibleOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                    <View>
                    <View style={APP_COMMON_STYLES.optionsContainer}>
                        {
                            selectedRide && selectedRide.rideType === RIDE_TYPE.SHARED_RIDE
                                ? <LinkButton style={APP_COMMON_STYLES.optionBtn} title='COPY RIDE' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.copyRide} />
                                : <LinkButton style={APP_COMMON_STYLES.optionBtn} title='EDIT DETAILS' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={() => this.gotoItinerary(true)} />
                        }
                        {
                            selectedRide && selectedRide.rideType !== RIDE_TYPE.SHARED_RIDE && selectedRide.privacyMode !== 'private'
                                ? <LinkButton style={APP_COMMON_STYLES.optionBtn} title='SHARE RIDE' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.goToChatList} />
                                : null
                        }
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='SHOW ON THE MAP' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.onPressRide} />
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='VIEW DETAILS' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={() => this.gotoItinerary(false)} />
                        {selectedRide && selectedRide.rideType !== RIDE_TYPE.SHARED_RIDE && <LinkButton style={APP_COMMON_STYLES.optionBtn} title='DELETE' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openRequestModal}
                            disabled={selectedRide && this.props.ride.rideId === selectedRide.rideId && selectedRide.status === RECORD_RIDE_STATUS.RUNNING} />}
                    </View>
                    {
                        showRequestModal && <BaseModal containerStyle={{ justifyContent: 'center', alignItems: 'center' }} isVisible={showRequestModal} onCancel={this.hideRequestModal} >
                            <View style={styles.deleteBoxCont}>
                                <DefaultText style={styles.deleteTitle}>Delete Ride</DefaultText>
                                <DefaultText numberOfLines={4} style={styles.deleteText}>{`Are you sure you want to delete this Ride from your Atlas? You will not be able to undo this action.`}</DefaultText>
                                <View style={styles.btnContainer}>
                                    <BasicButton title='CANCEL' style={[styles.actionBtn, { backgroundColor: '#8D8D8D' }]} titleStyle={styles.actionBtnTxt} onPress={this.hideRequestModal} />
                                    <BasicButton title='DELETE' style={styles.actionBtn} titleStyle={styles.actionBtnTxt} onPress={this.deleteRideConfirmation} />
                                </View>
                            </View>
                        </BaseModal>
                    }
                    </View>
                </BaseModal>
                <Tabs tabContainerStyle={APP_COMMON_STYLES.tabContainer} ref={elRef => this.tabsRef = elRef} onChangeTab={this.onChangeTab} tabBarActiveTextColor='#fff' tabBarInactiveTextColor='#fff' tabBarUnderlineStyle={{ height: 0 }}>
                    <Tab heading='PLANNED' tabStyle={[styles.inActiveTab, styles.borderRightWhite]} activeTabStyle={[styles.activeTab, styles.borderRightWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                        <View >
                            {this.renderSearchbox(showFilter)}
                            {
                                buildRides.length > 0
                                    ? <FlatList
                                        ref={elRef => this._listRef = elRef}
                                        contentContainerStyle={{ paddingBottom: this.state.hasRemainingList ? 40 : 22 }}
                                        keyboardShouldPersistTaps={'handled'}
                                        style={showFilter ? { marginTop: 50 } : { marginTop: 12 }}
                                        data={buildRides}
                                        renderItem={({ item }) => this.renderRides(item, RIDE_TYPE.BUILD_RIDE)}
                                        keyExtractor={this.keyExtractor}
                                        ListFooterComponent={this.renderFooter}
                                        onEndReached={this.loadMoreData}
                                        onEndReachedThreshold={0.1}
                                        onMomentumScrollBegin={() => this.setState({ isLoadingData: true })}
                                    />
                                    : hasNetwork
                                        ? null
                                        : <View style={{ flexDirection: 'column', justifyContent: 'space-between', position: 'absolute', top: heightPercentageToDP(20), left: widthPercentageToDP(27), height: 100, }}>
                                            <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                                            <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                                        </View>
                            }
                        </View>
                    </Tab>
                    <Tab
                        heading='RECORDED' tabStyle={[styles.inActiveTab, styles.borderRightWhite]} activeTabStyle={[styles.activeTab, styles.borderRightWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                        <View>
                            {this.renderSearchbox(showFilter)}
                            {
                                recordedRides.length > 0
                                    ? <FlatList
                                        ref={elRef => this._listRef = elRef}
                                        contentContainerStyle={{ paddingBottom: this.state.hasRemainingList ? 40 : 22 }}
                                        keyboardShouldPersistTaps={'handled'}
                                        style={showFilter ? { marginTop: 50 } : { marginTop: 12 }}
                                        data={recordedRides}
                                        renderItem={({ item }) => this.renderRides(item, RIDE_TYPE.RECORD_RIDE)}
                                        keyExtractor={this.keyExtractor}
                                        ListFooterComponent={this.renderFooter}
                                        onEndReached={this.loadMoreData}
                                        onEndReachedThreshold={0.1}
                                        onMomentumScrollBegin={() => this.setState({ isLoadingData: true })}
                                    />
                                    : hasNetwork
                                        ? null
                                        : <View style={{ flexDirection: 'column', justifyContent: 'space-between', position: 'absolute', top: heightPercentageToDP(20), left: widthPercentageToDP(27), height: 100, }}>
                                            <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                                            <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                                        </View>
                            }
                        </View>
                    </Tab>
                    <Tab heading='SHARED' tabStyle={[styles.inActiveTab, styles.borderRightWhite]} activeTabStyle={[styles.activeTab, styles.borderRightWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                        <View>
                            {this.renderSearchbox(showFilter, true)}
                            {
                                sharedRides.length > 0
                                    ? <FlatList
                                        ref={elRef => this._listRef = elRef}
                                        contentContainerStyle={{ paddingBottom: this.state.hasRemainingList ? 40 : 22 }}
                                        keyboardShouldPersistTaps={'handled'}
                                        style={showFilter ? { marginTop: 50 } : { marginTop: 12 }}
                                        data={sharedRides}
                                        refreshing={isRefreshing}
                                        onRefresh={this.onPullRefresh}
                                        renderItem={({ item }) => this.renderRides(item, RIDE_TYPE.SHARED_RIDE)}
                                        keyExtractor={this.keyExtractor}
                                        ListFooterComponent={this.renderFooter}
                                        onEndReached={this.loadMoreData}
                                        onEndReachedThreshold={0.1}
                                        onMomentumScrollBegin={() => this.setState({ isLoadingData: true })}
                                    />
                                    : hasNetwork
                                        ? null
                                        : <View style={{ flexDirection: 'column', justifyContent: 'space-between', position: 'absolute', top: heightPercentageToDP(20), left: widthPercentageToDP(27), height: 100, }}>
                                            <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                                            <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                                        </View>
                            }
                        </View>
                    </Tab>
                </Tabs>
            </BasePage >
        );
    }

    componentWillUnmount() {
        clearTimeout(this._searchQueryTimeout);
        console.log("Rides unmounted");
    }
}

const mapStateToProps = (state) => {
    const { user, userAuthToken, deviceToken } = state.UserAuth;
    const { buildRides, recordedRides, sharedRides, isRemoved, unsyncedRides } = state.RideList;
    const { ride, isSyncing } = state.RideInfo.present;
    const { showLoader, hasNetwork, lastApi, isRetryApi } = state.PageState;
    const notificationCount=state.NotificationList.notificationList.totalUnseen
    return { user, userAuthToken, deviceToken, buildRides, recordedRides, sharedRides,notificationCount, unsyncedRides, ride, showLoader, isRemoved, hasNetwork, lastApi, isRetryApi, isSyncing };
}

const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        shareRides: (requestBody) => dispatch(sendMessage(requestBody)),
        getAllBuildRides: (userId, showLoader, pageNumber, successCallback, errorCallback, sortBy, filterByName) => dispatch(getAllBuildRides(userId, showLoader, pageNumber, successCallback, errorCallback, sortBy, filterByName)),
        getAllRecordedRides: (userId, showLoader, pageNumber, successCallback, errorCallback, sortBy, filterByName) => dispatch(getAllRecordedRides(userId, showLoader, pageNumber, successCallback, errorCallback, sortBy, filterByName)),
        getAllPublicRides: (userId, showLoader, pageNumber, successCallback, errorCallback, sortBy, filterByName) => dispatch(getAllPublicRides(userId, showLoader, pageNumber, successCallback, errorCallback, sortBy, filterByName)),
        loadRideOnMap: (rideId, rideInfo) => dispatch(getRideByRideId(rideId, rideInfo)),
        updateRideInList: (updates, rideType, updateActiveRide) => {
            dispatch(apiLoaderActions(true));
            updateRide(updates, () => {
                dispatch(apiLoaderActions(false));
                dispatch(updateRideInListAction({ ride: updates, rideType }));
                updateActiveRide === true && dispatch(updateRideAction(updates));
            }, (err) => dispatch(apiLoaderActions(false)))
        },
        deleteRide: (rideId, rideType) => {
            dispatch(apiLoaderActions(true))
            deleteRide(rideId).then(res => {
                console.log('deleteRide : ', res.data)
                dispatch(apiLoaderActions(false))
                dispatch(isRemovedAction(true))
                dispatch(deleteRideAction({ rideType, rideId }));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
            })
                .catch(er => {
                    console.log(er.response);
                    handleServiceErrors(er, [rideId, rideType], 'deleteRide', true, true);
                    dispatch(apiLoaderActions(false))
                })
        },
        copyRide: (rideId, rideName, rideType, date) => dispatch(copyRide(rideId, rideName, rideType, date)),
        copySharedRide: (rideId, rideName, rideType, userId, date, successCallback, errorCallback) => copySharedRide(rideId, rideName, userId, date).then(res => {
            if (res.status === 200) {
                console.log('copySharedRide : ', res.data);
                Toast.show({ text: 'Ride copied to your created rides' });
                typeof successCallback === 'function' && successCallback();
                dispatch(apiLoaderActions(false))
                dispatch(updateRideListAction({ rideType, rideList: [res.data] }));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
            }
        }).catch(er => {
            console.log(er.response);
            typeof errorCallback === 'function' && errorCallback();
            handleServiceErrors(er, [rideId, rideName, rideType, userId, date, successCallback, errorCallback], 'copySharedRide', true, true);
            dispatch(apiLoaderActions(false));
        }),
        changeScreen: (screenProps) => dispatch(screenChangeAction(screenProps)),
        clearRideFromMap: () => dispatch(clearRideAction()),
        isRemovedAction: (state) => dispatch(isRemovedAction(false)),
        pauseRecordRide: (pauseTime, actualPoints, trackpoints, distance, ride, userId, loadRide) => dispatch(pauseRecordRide(false,pauseTime, actualPoints, trackpoints, distance, ride, userId, loadRide)),
        completeRecordRide: (endTime, actualPoints, trackpoints, distance, ride, userId, loadRide) => dispatch(completeRecordRide(endTime, actualPoints, trackpoints, distance, ride, userId, loadRide)),
        updateRide: (data) => dispatch(updateRideAction(data)),
        deleteUnsyncedRide: (unsyncedRideId) => dispatch(deleteUnsyncedRideAction(unsyncedRideId)),
        addLike: (rideId, postType, rideType) => addLike(rideId, postType).then(res => {
            console.log('addLike sucess : ', res);
            dispatch(updateRideLikeAndCommentAction({ isUpdateLike: true, isLiked: true, rideId, isAdded: true, rideType }));
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
        }).catch(er => {
            console.log('addLike error : ', er)
            handleServiceErrors(er, [rideId, postType, rideType], 'addLike', true, true);
        }),
        unLike: (rideId, userId, rideType) => unLike(rideId, userId).then(res => {
            console.log('unLike sucess : ', res);
            dispatch(updateRideLikeAndCommentAction({ isUpdateLike: true, isLiked: true, rideId, isAdded: false, rideType }));
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
        }).catch(er => {
            console.log('unLike error : ', er)
            handleServiceErrors(er, [rideId, userId, rideType], 'unLike', true, true);
        }),
        updateCommentsCount: (rideId, rideType, numberOfComments) => dispatch(updateRideInListAction({ ride: { rideId, numberOfComments }, rideType })),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'ride', isRetryApi: state })),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Rides);

const styles = StyleSheet.create({
    tabContentCont: {
        paddingHorizontal: 0,
    },
    headerRtIconContainer: {
        height: 27,
        width: 27,
        backgroundColor: '#F5891F',
        borderRadius: 13.5
    },
    addIcon: {
        color: '#fff',
        fontSize: 19
    },
    activeTab: {
        backgroundColor: '#000000'
    },
    inActiveTab: {
        backgroundColor: '#81BA41'
    },
    borderRightWhite: {
        borderRightWidth: 1,
        borderColor: '#fff'
    },
    borderLeftWhite: {
        borderLeftWidth: 1,
        borderColor: '#fff'
    },
    tabText: {
        fontSize: 13,
        fontFamily: CUSTOM_FONTS.robotoBold,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E6E6E6',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
        position: 'absolute',
        top: 20,
        paddingTop: 30,
        paddingBottom: 20,
        width: widthPercentageToDP(84),
    },
    filterIcon: {
        color: '#000000',
        fontSize: 12,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    activeSortOption: {
        color: APP_COMMON_STYLES.headerColor
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        padding: 3
    },
    nameOfRide: {
        fontFamily: CUSTOM_FONTS.robotoBold,
        fontSize: 14,
        color: '#585756',
        // alignSelf: 'center',
        padding: 10
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
    postCardFtrTitle: {
        fontSize: 13,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 1.3
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
        height: 263,
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
});