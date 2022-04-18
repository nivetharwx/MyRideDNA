import React, { Component } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { createNewRide, getAllRides, getRideByRideId, addLike, unLike, handleServiceErrors } from '../../api';
import Geolocation from 'react-native-geolocation-service';
import { LinkButton, IconButton, ImageButton } from '../../components/buttons';
import { Thumbnail } from 'native-base';
import { IS_ANDROID, widthPercentageToDP, APP_COMMON_STYLES, CUSTOM_FONTS, PageKeys, GET_PICTURE_BY_ID, THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG, RIDE_TYPE, heightPercentageToDP } from '../../constants';
import { BasePage } from '../../components/pages';
import { DefaultText } from '../../components/labels';
import { PostCard } from '../../components/cards';
import { Slider } from '../../components/controls';
import { updatePublicRidesAction, screenChangeAction, clearRideAction, clearPublicRidesAction, updateRideInListAction, setCurrentFriendAction, resetErrorHandlingAction } from '../../actions';
import { BaseModal } from '../../components/modal';
import Permissions from 'react-native-permissions';
import DurationIcon from '../../assets/img/Time-Ride.svg'
import DistanceIcon from '../../assets/img/Distance-Rides.svg'
import CalendarIcon from '../../assets/img/Date-Rides.svg'


const NUM_OF_DESC_LINES = 2;
const PAGE_H_MARGIN = 27;
class FindRide extends Component {
    _postType = 'ride';
    locationPermission = null;
    constructor(props) {
        super(props);
        this.state = {
            searchQuery: 'CURRENT LOCATION',
            currentLocation: this.props.currentLocation || null,
            hasRemainingList: false,
            showMoreSections: {},
            initialLocation: null,
            radius: 0.1,
            isLoading: false,
            pageNumber: 0,
            showOptionsModal: false,
            selectedRide: null,
        };
    }

    async componentDidMount() {
        this.locationPermission = IS_ANDROID
            ? await Permissions.request(Permissions.PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
            : await Permissions.request(Permissions.PERMISSIONS.IOS.LOCATION_ALWAYS);
            console.log(this.locationPermission,"//// loaction permission")
        if (this.locationPermission === 'granted') {
            this.getCurrentLocation()
        }
        else {
            this.setState({ searchQuery: 'Search Location' })
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if ((prevState.initialLocation && this.state.initialLocation) && ((prevState.initialLocation.lat !== this.state.initialLocation.lat) || (prevState.initialLocation.lng !== this.state.initialLocation.lng))) {
            this.setState({ pageNumber: 0 })
            this.props.getAllRides(this.props.user.userId, this.state.initialLocation.lat, this.state.initialLocation.lng, this.state.radius, this.props.user.distanceUnit, 0, this.fetchSuccessCallback, this.fetchErrorCallback)
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

    retryApiFunc = () => {
        if (this.props.lastApi && this.props.lastApi.currentScene === Actions.currentScene) {
            this.props[`${this.props.lastApi.api}`](...this.props.lastApi.params)
        }
    }

    getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            ({ coords }) => {
                this.setState({
                    currentLocation: {
                        name: '',
                        lat: coords.latitude,
                        lng: coords.longitude
                    },
                    initialLocation: {
                        name: '',
                        lat: coords.latitude,
                        lng: coords.longitude
                    },
                });
                this.props.getAllRides(this.props.user.userId, coords.latitude, coords.longitude, this.state.radius, this.props.user.distanceUnit, 0, this.fetchSuccessCallback, this.fetchErrorCallback)
            },
            (error) => {
                console.log(error.code, error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }

    fetchSuccessCallback = (res) => {
        this.setState(prevState => ({ isLoading: false, pageNumber: res.rides.length > 0 ? this.state.pageNumber + 1 : this.state.pageNumber, hasRemainingList: res.remainingList > 0 }));
    }

    fetchErrorCallback = (er) => {
        this.setState({ isLoading: false });
    }

    onSelectPlace = (place) => {
        console.log('\n\n\n place : ', place)
        // DOC: Useful keys: place.geometry.coordinates and place.place_name
        this.setState({
            initialLocation: { name: place.place_name === 'Current location' ? '' : place.place_name, lat: place.geometry.coordinates[1], lng: place.geometry.coordinates[0] },
            searchQuery: place.place_name,
        });
    }

    onPressUseCurrentLocation = () => {
        if (this.state.currentLocation) {
            this.setState({
                searchQuery: 'CURRENT LOCATION', initialLocation: {
                    name: '',
                    lat: this.state.currentLocation.lat,
                    lng: this.state.currentLocation.lng
                }
            });
        }
        else {
            this.setState({ searchQuery: 'Search Location', initialLocation: null })
            this.props.clearPublicRides()
        }
    }

    onDescriptionLayout({ nativeEvent: { lines } }, id) {
        lines.length >= NUM_OF_DESC_LINES && this.setState(prevState => ({ showMoreSections: { ...prevState.showMoreSections, [id]: true } }));
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
        const timeText = `${m} m`;
        return timeText;
    }

    gotoItinerary = (isEditing) => {
        if (this.props.ride.rideId === this.state.selectedRide.rideId) {
            Actions.push(PageKeys.ITINERARY_SECTION, { ride: this.state.selectedRide, comingFrom: PageKeys.RIDES, isEditingRide: isEditing });
        }
        else {
            this.props.clearRideFromMap();
            Actions.push(PageKeys.ITINERARY_SECTION, { ride: this.state.selectedRide, comingFrom: PageKeys.RIDES, isEditingRide: isEditing });
        }
        this.setState({ isVisibleOptionsModal: false });


        this.hideOptionsModal()
    }

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
        ,post:ride});
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

    renderPostCard = ({ item, index }) => {
        return (
            <PostCard
                onPress={() => this.onPressRide(item)}
                headerContent={
                    <View style={styles.headerContainer}>
                        <View style={styles.topHeader}>
                            <View style={{ flexDirection: 'row', marginBottom:2 }}>
                                <ImageButton pictureStyle={{ resizeMode: null }} imgStyles={{ height: 40, width: 40, borderRadius: 20, overflow: 'hidden' }} imageSrc={item.creatorProfilePictureId ? { uri: `${GET_PICTURE_BY_ID}${item.creatorProfilePictureId}` } : require('../../assets/img/friend-profile-pic.png')} onPress={() => this.openFriendsProfile(item)} />
                                <DefaultText style={styles.name}>{item.creatorName}</DefaultText>
                            </View>
                            <IconButton style={{ marginRight: 10 }} iconProps={{ name: 'options', type: 'SimpleLineIcons', style: styles.headerIcon }} onPress={() => this.showOptionsModal(item)} />
                        </View>
                        <View style={styles.bottomHeader}>
                            <View style={{ flexDirection: 'row' }}>
                                {/* <ImageButton imageSrc={require('../../assets/img/distance.png')} imgStyles={styles.footerIcon} /> */}
                                <View style={{ marginTop: 8 }}>
                                    <DistanceIcon />
                                </View>
                                <DefaultText style={styles.footerText}>{this.getDistanceAsFormattedString(item.totalDistance, this.props.user.distanceUnit)}</DefaultText>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                {/* <ImageButton imageSrc={require('../../assets/img/duration.png')} imgStyles={styles.footerIcon} /> */}
                                <View style={{ marginTop: 8 }}>
                                    <DurationIcon />
                                </View>
                                <DefaultText style={styles.footerText}>{this.getTimeAsFormattedString(item.totalTime)}</DefaultText>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                {/* <ImageButton imageSrc={require('../../assets/img/date.png')} imgStyles={styles.footerIcon} /> */}
                                <View style={{ marginTop: 8 }}>
                                    <CalendarIcon />
                                </View>
                                <DefaultText style={styles.footerText}>{this.getFormattedDate(item.date)}</DefaultText>
                            </View>
                        </View>

                    </View>
                }
                image={item.snapshotId ? `${GET_PICTURE_BY_ID}${item.snapshotId.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` : null}
                placeholderImage={require('../../assets/img/ride-placeholder-image.png')}
                placeholderImgHeight={220}
                placeholderBlur={6}
                footerContent={
                    <View>
                        <View style={styles.postCardFtrIconCont}>
                            <View style={styles.likesCont}>
                                <IconButton iconProps={{ name: 'like1', type: 'AntDesign', style: { color: item.isLiked ? '#2B77B4' : '#fff', fontSize: 22 } }} onPress={() => this.toggleLikeAction(item, RIDE_TYPE.PUBLIC_RIDE)} />
                                <LinkButton style={{ alignSelf: 'center' }} title={item.numberOfLikes + ' Likes'} titleStyle={styles.postCardFtrIconTitle} onPress={() => item.numberOfLikes > 0 && this.openLikesPage(item)} />
                            </View>
                            <IconButton title={item.numberOfComments + ' Comments'} titleStyle={styles.postCardFtrIconTitle} iconProps={{ name: 'ios-chatbubbles', type: 'Ionicons', style: { color: '#fff', fontSize: 22 } }} onPress={() => this.openCommentPage(item, RIDE_TYPE.PUBLIC_RIDE)} />
                        </View>
                        <View style={styles.postCardFtrTxtCont}>
                            <DefaultText style={styles.postCardFtrTitle}>{item.name}</DefaultText>
                            <DefaultText onTextLayout={(evt) => this.onDescriptionLayout(evt, item.rideId)} numberOfLines={NUM_OF_DESC_LINES}>{item.description}</DefaultText>{this.state.showMoreSections[item.rideId] ? <DefaultText>more</DefaultText> : null}
                        </View>
                    </View>
                }
            />
        );
    }

    openSearchResultPage = () => {
        const { searchQuery } = this.state;
        Actions.push(PageKeys.SEARCH_RESULT, {
            hasNetwork: this.props.hasNetwork, currentLocation: this.state.currentLocation ? { geometry: { coordinates: [this.state.currentLocation.lng, this.state.currentLocation.lat] } } : null,
            searchQuery: searchQuery === 'CURRENT LOCATION' ? '' : searchQuery === 'Search Location' ? '' : searchQuery,
            onPressSearchResult: this.onSelectPlace
        });
    }

    onChangeRadiusValue = (radius) => {
        radius = Math.round(radius) === 0 ? 0.1 : Math.round(radius);
        this.setState({ radius, pageNumber: 0 })
        if (this.state.initialLocation) {
            this.props.getAllRides(this.props.user.userId, this.state.initialLocation.lat, this.state.initialLocation.lng, radius, this.props.user.distanceUnit, 0, this.fetchSuccessCallback, this.fetchErrorCallback)
        }
    }

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.isLoading === true || distanceFromEnd < 0) return;
        this.setState({ isLoading: true }, () => {
            this.props.getAllRides(this.props.user.userId, this.state.initialLocation.lat, this.state.initialLocation.lng, this.state.radius, this.props.user.distanceUnit, this.state.pageNumber, this.fetchSuccessCallback, this.fetchErrorCallback)
        });
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

    showOptionsModal = (item) => this.setState({ showOptionsModal: true, selectedRide: item });

    hideOptionsModal = () => this.setState({ showOptionsModal: false, selectedRide: null });

    onPressRide = async (ride) => {
        this.hideOptionsModal();
        const rideDetail = this.state.selectedRide || ride;
        if (!rideDetail) return;
        if (this.props.hasNetwork) {
            this.props.changeScreen({ name: PageKeys.MAP });
            this.props.loadRideOnMap(rideDetail.rideId);
        } else {
            console.log("No network found");
        }
    }

    componentWillUnmount() {
        this.props.clearPublicRides()
    }


    render() {
        const { searchQuery, showOptionsModal, currentLocation } = this.state;
        const { publicRides } = this.props;
        return (
            <BasePage heading={'Find a Ride'} rootContainerSafePadding={20}>
                <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={showOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                    <View style={APP_COMMON_STYLES.optionsContainer}>
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='SHOW ON THE MAP' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.onPressRide} />
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='VIEW DETAILS' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={()=>this.gotoItinerary(false)} />
                    </View>
                </BaseModal>
                <View style={styles.locationInputContainer}>
                    <LinkButton numberOfLines={1} style={styles.linkButtonCont} title={searchQuery} titleStyle={styles.locationLabel} onPress={this.openSearchResultPage} />
                    <View style={styles.searchIconContainer}>
                        <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { color: '#707070', fontSize: 22 }, }} onPress={this.openSearchResultPage} />
                    </View>
                </View>
                <View style={styles.sliderContainer}>
                    <Slider onChangeRadiusValue={(radius) => this.onChangeRadiusValue(radius)} />
                </View>
                <FlatList
                    contentContainerStyle={[{ paddingBottom: this.state.hasRemainingList ? 40 : 0 }, styles.listContent]}
                    showsVerticalScrollIndicator={false}
                    data={publicRides}
                    keyExtractor={this.journalKeyExtractor}
                    renderItem={this.renderPostCard}
                    initialNumToRender={4}
                    ListFooterComponent={this.renderFooter}
                    onEndReached={this.loadMoreData}
                    onEndReachedThreshold={0.1}
                />
                {
                    this.props.hasNetwork === false && publicRides.length === 0 && <View style={{ flexDirection: 'column', justifyContent: 'space-between', height: 100, position: 'absolute', top: heightPercentageToDP(40), left: widthPercentageToDP(27) }}>
                        <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                        <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                    </View>
                }
            </BasePage>
        );
    }
}

const mapStateToProps = (state) => {
    const { publicRides } = state.RideList;
    const { user } = state.UserAuth;
    const { currentBike: bike } = state.GarageInfo;
    const { ride, isSyncing } = state.RideInfo.present;
    const { showLoader, hasNetwork, lastApi, isRetryApi } = state.PageState
    return { ride, user, bike, publicRides, hasNetwork, lastApi, isRetryApi };
}

const mapDispatchToProps = (dispatch) => {
    return {
        submitForm: (rideInfo) => dispatch(createNewRide(rideInfo)),
        getAllRides: (userId, lat, lng, radius, unit, pageNumber, successCallback, errorCallback) => getAllRides(userId, lat, lng, radius, unit, pageNumber).then(res => {
            console.log('getAllRides success :', res.data)
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
            dispatch(updatePublicRidesAction({ rides: res.data.rides, reset: !pageNumber }));
            typeof successCallback === 'function' && successCallback(res.data);
        })
            .catch(er => {
                console.log('getAllRides error :', er)
                handleServiceErrors(er, [userId, lat, lng, radius, unit, pageNumber, successCallback, errorCallback], 'getAllRides', false, true);
            }),
        changeScreen: (screenKey) => dispatch(screenChangeAction(screenKey)),
        clearRideFromMap: () => dispatch(clearRideAction()),
        loadRideOnMap: (rideId) => dispatch(getRideByRideId(rideId)),
        clearPublicRides: () => dispatch(clearPublicRidesAction()),
        addLike: (rideId, postType, rideType, numberOfLikes) => addLike(rideId, postType).then(res => {
            console.log('addLike sucess : ', res);
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            dispatch(updateRideInListAction({ ride: { isLiked: true, rideId, numberOfLikes: numberOfLikes + 1 }, rideType }));
        }).catch(er => {
            console.log('addLike error : ', er)
            handleServiceErrors(er, [rideId, postType, rideType, numberOfLikes], 'addLike', false, true);
        }),
        unLike: (rideId, userId, rideType, numberOfLikes) => unLike(rideId, userId).then(res => {
            console.log('unLike sucess : ', res);
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            dispatch(updateRideInListAction({ ride: { isLiked: false, rideId, numberOfLikes: numberOfLikes - 1 }, rideType }));
        }).catch(er => {
            console.log('unLike error : ', er)
            handleServiceErrors(er, [rideId, userId, rideType, numberOfLikes], 'unLike', false, true);
        }),
        updateCommentsCount: (rideId, rideType, numberOfComments) => dispatch(updateRideInListAction({ ride: { rideId, numberOfComments }, rideType })),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'find_ride', isRetryApi: state })),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FindRide);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff',
    },
    locationInputContainer: {
        borderWidth: 1,
        borderColor:'#707070',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderRadius: 13,
        height: 37,
        zIndex: 999,
        backgroundColor: '#ffffff',
        alignSelf: 'center',
        marginHorizontal: PAGE_H_MARGIN,
    },
    linkButtonCont: {
        flex: 2.89,
        backgroundColor: '#fff',
        marginLeft: 10,
        height: 20,
        marginTop: 6,
    },
    locationLabel: {
        borderBottomWidth: 0,
        fontSize: 15,
        backgroundColor: '#fff', color: APP_COMMON_STYLES.headerColor
    },
    searchIconContainer: {
        flex: 1,
        backgroundColor: '#C4C6C8',
        borderTopRightRadius: 13,
        borderBottomRightRadius: 13,
        justifyContent: 'center'
    },
    sliderContainer: {
        height: 120,
        backgroundColor: '#E6E6E6',
        marginTop: -15,
        paddingTop: 20,
        marginHorizontal: PAGE_H_MARGIN
    },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        alignItems: 'center'
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
    postCardFtrTitle: {
        fontSize: 13,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 1.3
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
    thumbnail: {
        height: widthPercentageToDP(10),
        width: widthPercentageToDP(10),
        borderRadius: 17,
        alignSelf: 'flex-end'
    },
    name: {
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        fontSize: 12,
        alignSelf: 'center',
        marginLeft: 10
    },
    bottomHeader: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        height: 40,
        backgroundColor: '#585756',
    },
    listContent: {
        marginTop: 15
    },
    likesCont: {
        flexDirection: 'row'
    },

});