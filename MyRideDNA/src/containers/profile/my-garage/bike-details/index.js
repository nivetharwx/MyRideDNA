import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, ScrollView, ImageBackground, FlatList, Alert } from 'react-native';
import { APP_COMMON_STYLES, widthPercentageToDP, PageKeys, CUSTOM_FONTS, heightPercentageToDP, POST_TYPE, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, GET_PICTURE_BY_ID, RIDE_TYPE } from '../../../../constants';
import { Actions } from 'react-native-router-flux';
import { BasicButton, IconButton, LinkButton } from '../../../../components/buttons';
import { updatePageContentStatusAction, getCurrentBikeAction, updateBikeWishListAction, updateBikeCustomizationsAction, updateBikeLoggedRideAction, getCurrentBikeSpecAction, resetErrorHandlingAction, screenChangeAction, clearRideAction } from '../../../../actions';
import { DefaultText } from '../../../../components/labels';
import { BaseModal } from '../../../../components/modal';
import { SmallCard } from '../../../../components/cards';
import { setBikeAsActive, deleteBike, getPosts, getRecordRides, getFriendsPosts, getFriendRecordedRides, getRideByRideId, pauseRecordRide, completeRecordRide } from '../../../../api';
import { BasePage } from '../../../../components/pages';
import { Toast } from 'native-base'
import AsyncStorage from '@react-native-community/async-storage';

class BikeDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showOptionsModal: false,
            bikePost: {
                myRide: null,
                wishList: null,
                loggedRide: null,
                showRequestModal:false,
            }
        };
    }

    componentDidMount() {
        if (this.props.bike) {
            if (this.props.isEditable === true) {
                if (this.props.isLoadedPostTypes) {
                    this.props.getPosts(this.props.user.userId, POST_TYPE.WISH_LIST, this.props.postTypes[POST_TYPE.WISH_LIST].id, this.props.bike.spaceId);
                    this.props.getPosts(this.props.user.userId, POST_TYPE.MY_RIDE, this.props.postTypes[POST_TYPE.MY_RIDE].id, this.props.bike.spaceId);
                }
                this.props.getRecordRides(this.props.user.userId, this.props.bike.spaceId);
            } else {
                if (this.props.isLoadedPostTypes) {
                    this.getFriendsPosts(this.props.user.userId, POST_TYPE.MY_RIDE, this.props.postTypes[POST_TYPE.MY_RIDE].id, this.props.friend.userId, this.props.bike.spaceId);
                    this.getFriendsPosts(this.props.user.userId, POST_TYPE.WISH_LIST, this.props.postTypes[POST_TYPE.WISH_LIST].id, this.props.friend.userId, this.props.bike.spaceId);
                }
                this.getFriendRecordRide(this.props.user.userId, this.props.friend.userId, this.props.bike.spaceId, 0)
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.ride.rideId && (prevProps.ride.rideId !== this.props.ride.rideId)) {
            this.props.changeScreen({ name: PageKeys.MAP });
            return;
        }
        if (this.props.updatePageContent && (!prevProps.updatePageContent || prevProps.updatePageContent !== this.props.updatePageContent)) {
            if (this.props.isLoadedPostTypes) this.fetchUpdates(this.props.updatePageContent.type);
        }
        if (prevProps.bike === null && this.props.bike !== null) {
            this.props.getRecordRides(this.props.user.userId, this.props.bike.spaceId)
            if (this.props.isLoadedPostTypes) {
                this.props.getPosts(this.props.user.userId, POST_TYPE.WISH_LIST, this.props.postTypes[POST_TYPE.WISH_LIST].id, this.props.bike.spaceId);
                this.props.getPosts(this.props.user.userId, POST_TYPE.MY_RIDE, this.props.postTypes[POST_TYPE.MY_RIDE].id, this.props.bike.spaceId);
            }
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

    getFriendsPosts(userId, postType, postTypeId, friendId, spaceId) {
        this.props.getFriendsPosts(userId, postTypeId, friendId, spaceId, 0, (res) => {
            switch (postType) {
                case POST_TYPE.WISH_LIST: this.setState((prevState) => ({ bikePost: { ...prevState.bikePost, wishList: res.posts } }))
                    break;
                case POST_TYPE.MY_RIDE: this.setState((prevState) => ({ bikePost: { ...prevState.bikePost, myRide: res.posts } }))
                    break;
                case POST_TYPE.STORIES_FROM_ROAD:
                    break;
            }
        }, (er) => { })
    }

    getFriendRecordRide(userId, friendId, spaceId, pageNumber) {
        this.props.getFriendRecordedRides(userId, friendId, spaceId, pageNumber, (res) => {
            this.setState((prevState) => ({ bikePost: { ...prevState.bikePost, loggedRide: res.rides } }))
        }, (er) => { })
    }

    fetchUpdates(updatedContentType) {
        switch (updatedContentType) {
            case POST_TYPE.WISH_LIST:
                this.props.getPosts(this.props.user.userId, POST_TYPE.WISH_LIST, this.props.postTypes[POST_TYPE.WISH_LIST].id, this.props.bike.spaceId);
                break;
            case POST_TYPE.MY_RIDE:
                this.props.getPosts(this.props.user.userId, POST_TYPE.MY_RIDE, this.props.postTypes[POST_TYPE.MY_RIDE].id, this.props.bike.spaceId);
                break;
        }
    }

    openBikeForm = () => {
        this.hideOptionsModal();
        Actions.push(PageKeys.ADD_BIKE_FORM, {});
    }

    openBikeAlbum = () => {
        if (this.props.isEditable) {
            Actions.push(PageKeys.BIKE_ALBUM, { isEditable: this.props.isEditable });
        }
        else {
            Actions.push(PageKeys.BIKE_ALBUM, { spaceId: this.props.bike.spaceId, friendId: this.props.friend.userId, isEditable: this.props.isEditable });
        }

    }

    makeAsActiveBike = () => {
        this.props.setBikeAsActive(this.props.user.userId, this.props.bike.spaceId, this.props.bike.spaceId);
    }

    onPressBackButton = () => Actions.pop();

    onPressDeleteBike = () => {
        this.props.deleteBike(this.props.user.userId, this.props.bike.spaceId,(res)=>{
            
            this.onPressBackButton();
        },(er)=>{
        })
        this.hideRequestModal();
        this.hideOptionsModal();
        // setTimeout(() => {
        //     Alert.alert(
        //         'Remove confirmation',
        //         `Are you sure you want to delete ${this.props.bike.name} from your list?`,
        //         [
        //             {
        //                 text: 'Cancel',
        //                 onPress: () => console.log('Cancel Pressed'),
        //                 style: 'cancel',
        //             },
        //             { text: 'Remove', onPress: () => this.props.deleteBike(this.props.user.userId, this.props.bike.spaceId) },
        //         ]
        //     );
        // }, 50);
    }

    addWish = () => {
        if (this.props.isLoadedPostTypes === false) {
            Toast.show({ text: 'Something went wrong. Please try again later' });
            return;
        }
        Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: POST_TYPE.WISH_LIST, currentBikeId: this.props.bike.spaceId });
    }

    addMyRide = () => {
        if (this.props.isLoadedPostTypes === false) {
            Toast.show({ text: 'Something went wrong. Please try again later' });
            return;
        }
        Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: POST_TYPE.MY_RIDE, currentBikeId: this.props.bike.spaceId });
    }

    showOptionsModal = () => this.setState({ showOptionsModal: true });

    hideOptionsModal = () => this.setState({ showOptionsModal: false });

    openMyRidePage = () => {
        if (this.props.isEditable) {
            Actions.push(PageKeys.BIKE_SPEC_LIST, { comingFrom: Actions.currentScene, postType: POST_TYPE.MY_RIDE, spaceId: this.props.bike.spaceId, isEditable: this.props.isEditable });
        }
        else {
            Actions.push(PageKeys.BIKE_SPEC_LIST, { comingFrom: Actions.currentScene, postType: POST_TYPE.MY_RIDE, spaceId: this.props.bike.spaceId, friendId: this.props.friend.userId, isEditable: this.props.isEditable });
        }
    }

    openWishListPage = () => {
        if (this.props.isEditable) {
            Actions.push(PageKeys.BIKE_SPEC_LIST, { comingFrom: Actions.currentScene, postType: POST_TYPE.WISH_LIST, spaceId: this.props.bike.spaceId, isEditable: this.props.isEditable });
        }
        else {
            Actions.push(PageKeys.BIKE_SPEC_LIST, { comingFrom: Actions.currentScene, postType: POST_TYPE.WISH_LIST, spaceId: this.props.bike.spaceId, friendId: this.props.friend.userId, isEditable: this.props.isEditable });
        }
    }

    openLoggedRidePage = () => {
        if (this.props.isEditable) {
            Actions.push(PageKeys.LOGGED_RIDE, { comingFrom: Actions.currentScene, postType: POST_TYPE.LOGGED_RIDES, isEditable: this.props.isEditable, spaceId: this.props.bike.spaceId })
        }
        else {
            Actions.push(PageKeys.LOGGED_RIDE, { comingFrom: Actions.currentScene, postType: POST_TYPE.LOGGED_RIDES, isEditable: this.props.isEditable, spaceId: this.props.bike.spaceId, friendId: this.props.friend.userId })
        }
    };

    openBikeSpecPage = (postType, item) => {
        if (this.props.isEditable) {
            this.props.getCurrentBikeSpec(postType, item.id);
            Actions.push(PageKeys.BIKE_SPEC, { comingFrom: Actions.currentScene, postType, postId: item.id, isEditable: this.props.isEditable });
        }
        else {
            Actions.push(PageKeys.BIKE_SPEC, { comingFrom: Actions.currentScene, postType, bikeDetail: item, isEditable: this.props.isEditable });
        }

    }

    postKeyExtractor = item => item.id;

    loggedRideKeyExtractor = item => item.rideId;

    getLoggedRideDate = (date => {
        var getDate = new Date(date).getDate();
        var getMonth = new Date(date).getMonth() + 1;
        return `${getMonth}/${getDate}`
    })

    renderSmallCard(postType, pictureId, title, item) {
        return <SmallCard
            showLoader={this.props.apiCallsInProgress[item.id]}
            numberOfPicUploading={item.numberOfPicUploading || null}
            image={pictureId && postType !== POST_TYPE.LOGGED_RIDES ? `${GET_PICTURE_BY_ID}${pictureId}` : null}
            imageStyle={styles.imageStyle}
            placeholderImage={postType === POST_TYPE.MY_RIDE ? require('../../../../assets/img/my-ride.png') : postType === POST_TYPE.WISH_LIST ? require('../../../../assets/img/wishlist.png') : null}
            customPlaceholder={
                postType === POST_TYPE.LOGGED_RIDES ?
                    <ImageBackground style={{ width: null, height: null, flex: 1, justifyContent: 'center', alignItems: 'center' }} source={require('../../../../assets/img/textured-black-background.png')}>
                        <DefaultText style={[styles.squareCardTitle, { fontSize: 26, fontFamily: CUSTOM_FONTS.dinCondensedBold }]}>{this.getLoggedRideDate(item.date)}</DefaultText>
                    </ImageBackground>
                    :
                    null
            }
            onPress={() => {
                if (postType === POST_TYPE.MY_RIDE) this.openBikeSpecPage(postType, item);
                else if (postType === POST_TYPE.WISH_LIST) this.openBikeSpecPage(postType, item);
                else if (postType === POST_TYPE.LOGGED_RIDES) this.onPressRide(item);
            }}
        />
    }

    openBikeJournal = () => {
        if (this.props.isEditable) {
            Actions.push(PageKeys.JOURNAL, { personId: this.props.user.userId, isEditable: this.props.isEditable, spaceId: this.props.bike.spaceId, })
        }
        else {
            Actions.push(PageKeys.JOURNAL, { personId: this.props.friend.userId, isEditable: this.props.isEditable, spaceId: this.props.bike.spaceId, person: this.props.friend })
        }
    }

    onPressRide = async (selectedRide) => {
        this.hideOptionsModal();
        console.log('////// selected ride /////', selectedRide)
        if (!selectedRide) return;
        if (this.props.hasNetwork) {
            if (this.props.ride.rideId === selectedRide.rideId) {
                this.props.changeScreen({ name: PageKeys.MAP });
                return;
            }
            if (this.props.ride.rideId) {
                this.props.clearRideFromMap();
            }
            console.log('////// selected ride /////', selectedRide.unsynced)
            if (selectedRide.unsynced === true) {
                const unsyncedPoints = await AsyncStorage.getItem(`${UNSYNCED_RIDE}${selectedRide.rideId}`);
                console.log('//// usynced points /////',unsyncedPoints)
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

    componentWillUnmount() {
        this.props.getCurrentBike(null);
    }

    renderHeader(name = '', nickname = '', isEditable = false) {
        return <View style={styles.header}>
            <IconButton iconProps={{ name: 'md-arrow-round-back', type: 'Ionicons', style: { fontSize: 27 } }}
                style={styles.headerIconCont} onPress={this.onPressBackButton} />
            <View style={styles.headingContainer}>
                <DefaultText style={styles.heading}>{name}</DefaultText>
                {nickname.length > 0 ? <DefaultText style={styles.subheading}>{nickname.toUpperCase()}</DefaultText> : null}
            </View>
            {isEditable && <IconButton style={{ padding: 10 }} iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 20 } }} onPress={this.showOptionsModal} />}
        </View>
    }

    openRequestModal = () => this.setState({ showRequestModal: true, });

    hideRequestModal = () => this.setState({ showRequestModal: false});

    render() {
        const { user, bike } = this.props;
        const { showOptionsModal, bikePost, showRequestModal } = this.state;
        if (!bike) return null;
        return (
            <BasePage defaultHeader={false}>
                <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={showOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                    <View>
                    <View style={APP_COMMON_STYLES.optionsContainer}>
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='EDIT BIKE' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openBikeForm} />
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='DELETE BIKE' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openRequestModal} />
                    </View>
                    {
                        showRequestModal && <BaseModal containerStyle={{ justifyContent: 'center', alignItems: 'center' }} isVisible={showRequestModal} onCancel={this.hideRequestModal} >
                            <View style={styles.deleteBoxCont}>
                                <DefaultText style={styles.deleteTitle}>Delete Bike</DefaultText>
                                <DefaultText numberOfLines={4} style={styles.deleteText}>{`Are you sure you want to delete this bike from your Garage? You will not be able to undo this action.`}</DefaultText>
                                <View style={styles.btnContainer}>
                                    <BasicButton title='CANCEL' style={[styles.actionBtn, { backgroundColor: '#8D8D8D' }]} titleStyle={styles.actionBtnTxt} onPress={this.hideRequestModal} />
                                    <BasicButton title='DELETE' style={styles.actionBtn} titleStyle={styles.actionBtnTxt} onPress={()=>this.onPressDeleteBike()} />
                                </View>
                            </View>
                        </BaseModal>
                    }
                    </View>
                </BaseModal>
                {this.props.isEditable
                    ? this.renderHeader(user.name, user.nickname, true)
                    : this.renderHeader(this.props.friend.name, this.props.friend.nickname, false)
                }
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={[styles.bikePic, styles.bikeBtmBorder, bike.isDefault ? styles.activeBorder : null]}>
                        <ImageBackground source={bike.picture ? { uri: `${GET_PICTURE_BY_ID}${bike.picture.id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}` } : require('../../../../assets/img/bike_placeholder.png')} style={{ height: null, width: null, flex: 1, borderRadius: 0 }} />
                    </View>
                    <ImageBackground source={require('../../../../assets/img/odometer-small.png')} style={[styles.odometerImage, { marginTop: styles.bikePic.height - 55.5, }]}>
                        <DefaultText style={[styles.miles, { fontSize: 12 }]}>{`Coming\nsoon`}</DefaultText>
                    </ImageBackground>
                    <View style={styles.odometerLblContainer}>
                        <DefaultText style={styles.odometerLbl}>TOTAL</DefaultText>
                        <DefaultText style={styles.odometerLbl}>MILES</DefaultText>
                    </View>
                    <View style={styles.container}>
                        <DefaultText style={styles.title}>{bike.name}</DefaultText>
                        <DefaultText numberOfLines={1} style={styles.subtitle}>{`${bike.make || ''}${bike.model ? ' - ' + bike.model : ''} ${bike.notes || ''}`}</DefaultText>
                        {
                            bike.isDefault
                                ? <DefaultText style={styles.activeBikeTxt}>Active Bike</DefaultText>
                                : this.props.isEditable
                                    ? <LinkButton style={styles.activeBikeBtn} title='Set as Active Bike' titleStyle={styles.activeBikeBtnTxt} onPress={this.makeAsActiveBike} />
                                    : null
                        }
                        <View style={styles.hDivider} />
                        {
                            this.props.isEditable || (bikePost.myRide && bikePost.myRide.length > 0)
                                ? <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <LinkButton activeOpacity={!this.props.isEditable || !bike.customizations || bike.customizations.length === 0 ? 1 : 0.7} style={styles.sectionLinkBtn} onPress={!this.props.isEditable || (bike.customizations && bike.customizations.length > 0) ? this.openMyRidePage : null}>
                                            <DefaultText style={styles.sectionLinkTxt}>My Ride</DefaultText>
                                            {
                                                !this.props.isEditable || (bike.customizations && bike.customizations.length > 0)
                                                    ? <DefaultText style={[styles.sectionLinkTxt, { color: APP_COMMON_STYLES.infoColor, marginLeft: 8 }]}>[see all]</DefaultText>
                                                    : null
                                            }
                                        </LinkButton>
                                        {this.props.isEditable && <IconButton style={styles.addBtnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: 10, color: '#fff' } }} onPress={this.addMyRide} />}
                                    </View>
                                    <View style={styles.greyBorder} />
                                    <FlatList
                                        style={styles.list}
                                        numColumns={4}
                                        data={bike.customizations ? bike.customizations.slice(0, 4) : bikePost.myRide ? bikePost.myRide.slice(0, 4) : null}
                                        keyExtractor={this.postKeyExtractor}
                                        renderItem={({ item }) => this.renderSmallCard(POST_TYPE.MY_RIDE, item.pictureIds && item.pictureIds[0] ? item.pictureIds[0].id : null, item.name, item)}
                                    />
                                </View>
                                : null
                        }
                        {
                            this.props.isEditable || (bikePost.wishList && bikePost.wishList.length > 0)
                                ? <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <LinkButton activeOpacity={!this.props.isEditable || !bike.wishList || bike.wishList.length === 0 ? 1 : 0.7} style={styles.sectionLinkBtn} onPress={!this.props.isEditable || (bike.wishList && bike.wishList.length > 0) ? this.openWishListPage : null}>
                                            <DefaultText style={styles.sectionLinkTxt}>Wish List</DefaultText>
                                            {
                                                !this.props.isEditable || (bike.wishList && bike.wishList.length > 0)
                                                    ? <DefaultText style={[styles.sectionLinkTxt, { color: APP_COMMON_STYLES.infoColor, marginLeft: 8 }]}>[see all]</DefaultText>
                                                    : null
                                            }
                                        </LinkButton>
                                        {this.props.isEditable && <IconButton style={styles.addBtnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: 10, color: '#fff' } }} onPress={this.addWish} />}
                                    </View>
                                    <View style={styles.greyBorder} />
                                    <FlatList
                                        style={styles.list}
                                        numColumns={4}
                                        data={bike.wishList ? bike.wishList.slice(0, 4) : bikePost.wishList ? bikePost.wishList.slice(0, 4) : null}
                                        keyExtractor={this.postKeyExtractor}
                                        renderItem={({ item }) => this.renderSmallCard(POST_TYPE.WISH_LIST, item.pictureIds && item.pictureIds[0] ? item.pictureIds[0].id : null, item.name, item)}
                                    />

                                </View>
                                : null
                        }
                        {
                            (bikePost.loggedRide && bikePost.loggedRide.length > 0) || (bike.loggedRides && bike.loggedRides.length > 0)
                                ? <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <LinkButton activeOpacity={!this.props.isEditable || !bike.loggedRides || bike.loggedRides.length === 0 ? 1 : 0.7} style={styles.sectionLinkBtn} onPress={!this.props.isEditable || (bike.loggedRides && bike.loggedRides.length > 0) ? this.openLoggedRidePage : null}>
                                            <DefaultText style={styles.sectionLinkTxt}>Logged Rides</DefaultText>
                                            {
                                                !this.props.isEditable || (bike.loggedRides && bike.loggedRides.length > 0)
                                                    ? <DefaultText style={[styles.sectionLinkTxt, { color: APP_COMMON_STYLES.infoColor, marginLeft: 8 }]}>[see all]</DefaultText>
                                                    : null
                                            }
                                        </LinkButton>
                                    </View>
                                    <View style={styles.greyBorder} />
                                    <FlatList
                                        style={styles.list}
                                        numColumns={4}
                                        data={bike.loggedRides ? bike.loggedRides.slice(0, 4) : bikePost.loggedRide ? bikePost.loggedRide.slice(0, 4) : null}
                                        keyExtractor={this.loggedRideKeyExtractor}
                                        renderItem={({ item }) => this.renderSmallCard(POST_TYPE.LOGGED_RIDES, item.picture ? item.picture.id : null, item.totalDistance, item)}
                                    />
                                </View>
                                : null
                        }
                    </View>
                    <LinkButton style={styles.fullWidthImgLink} onPress={this.openBikeJournal}>
                        <ImageBackground source={require('../../../../assets/img/my-journal.png')} style={styles.imgBG}>
                        <DefaultText style={styles.txtOnImg}>Stories From </DefaultText>
                                            <DefaultText style={styles.txtOnImg}>The Road</DefaultText>
                        </ImageBackground>
                    </LinkButton>
                    <LinkButton style={styles.fullWidthImgLink} onPress={this.openBikeAlbum}>
                        <ImageBackground source={require('../../../../assets/img/my-photos.png')} style={styles.imgBG}>
                            <DefaultText style={styles.txtOnImg}>Photos</DefaultText>
                        </ImageBackground>
                    </LinkButton>
                </ScrollView>
            </BasePage>
        );
    }
}

const mapStateToProps = (state, props) => {
    const { user } = state.UserAuth;
    const { ride } = state.RideInfo.present;
    const { postTypes, hasNetwork, lastApi, isRetryApi, updatePageContent, apiCallsInProgress } = state.PageState;
    if (props.isEditable) {

        const { currentBike: bike, activeBikeIndex } = state.GarageInfo;
        return { user, postTypes, hasNetwork, updatePageContent, bike, activeBikeIndex, lastApi, isRetryApi, ride, apiCallsInProgress, isLoadedPostTypes: Object.keys(postTypes).length > 0 };
    } else {
        return { user, postTypes, hasNetwork, updatePageContent, lastApi, isRetryApi, ride, apiCallsInProgress, isLoadedPostTypes: Object.keys(postTypes).length > 0 };
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        setBikeAsActive: (userId, spaceId) => dispatch(setBikeAsActive(userId, spaceId)),
        deleteBike: (userId, bikeId, successCallback, errorCallback) => dispatch(deleteBike(userId, bikeId, successCallback, errorCallback)),
        getCurrentBike: (bikeId) => dispatch(getCurrentBikeAction(bikeId)),
        getRecordRides: (userId, spaceId, successCallback, errorCallback) => dispatch(getRecordRides(userId, spaceId, 0, (res) => {
            if (typeof successCallback === 'function') successCallback(res);
            console.log('getRecordRide sucess bike-deatil : ', res)
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            dispatch(updateBikeLoggedRideAction({ updates: res.rides, reset: true }))
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
        }, (err) => {
            if (typeof errorCallback === 'function') errorCallback(err);
            handleServiceErrors(er, [userId, spaceId, successCallback, errorCallback], 'getRecordRides', true, true);
        })),
        getPosts: (userId, postType, postTypeId, spaceId) => getPosts(userId, postTypeId, spaceId, 0)
            .then(({ data }) => {
                console.log(`getPost ${postType} : `, data)
                dispatch(updatePageContentStatusAction(null));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                if (typeof successCallback === 'function') successCallback(data);
                switch (postType) {
                    case POST_TYPE.WISH_LIST:
                        dispatch(updateBikeWishListAction({ updates: data.posts, reset: true }));
                        break;
                    case POST_TYPE.MY_RIDE:
                        dispatch(updateBikeCustomizationsAction({ updates: data.posts, reset: true }));
                        break;
                    case POST_TYPE.STORIES_FROM_ROAD:
                        break;
                }
            }).catch(err => {
                typeof errorCallback === 'function' && errorCallback(err)
                handleServiceErrors(er, [userId, postType, postTypeId, spaceId], 'getPosts', true, true);
            }),
        getCurrentBikeSpec: (postType, postId) => dispatch(getCurrentBikeSpecAction({ postType, postId })),
        getFriendRecordedRides: (userId, friendId, spaceId, pageNumber, successCallback, errorCallback) => getFriendRecordedRides(userId, friendId, spaceId, pageNumber).then(res => {
            console.log('getFriendRecordedRides success : ', res)
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            successCallback(res.data)
        }).catch(er => {
            console.log('getFriendRecordedRides error : ', er)
            errorCallback(er)
            handleServiceErrors(er, [userId, friendId, spaceId, pageNumber, successCallback, errorCallback], 'getFriendRecordedRides', true, true);
        }),
        getFriendsPosts: (userId, postTypeId, friendId, spaceId, pageNumber, successCallback, errorCallback) => getFriendsPosts(userId, postTypeId, friendId, spaceId, pageNumber).then(res => {
            console.log('getFriendsPosts success : ', res)
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            successCallback(res.data)
        }).catch(er => {
            console.log('getFriendsPosts error : ', er)
            errorCallback(er)
            handleServiceErrors(er, [userId, postTypeId, friendId, spaceId, pageNumber, successCallback, errorCallback], 'getFriendsPosts', true, true);
        }),
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'bike_detail', isRetryApi: state })),
        changeScreen: (screenProps) => dispatch(screenChangeAction(screenProps)),
        clearRideFromMap: () => dispatch(clearRideAction()),
        loadRideOnMap: (rideId, rideInfo) => dispatch(getRideByRideId(rideId, rideInfo)),
        pauseRecordRide: (pauseTime, actualPoints, trackpoints, distance, ride, userId, loadRide) => dispatch(pauseRecordRide(false, pauseTime, actualPoints, trackpoints, distance, ride, userId, loadRide)),
        completeRecordRide: (endTime, actualPoints, trackpoints, distance, ride, userId, loadRide) => dispatch(completeRecordRide(endTime, actualPoints, trackpoints, distance, ride, userId, loadRide)),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(BikeDetails);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        marginHorizontal: 27,
        marginTop: 20
    },
    header: {
        height: APP_COMMON_STYLES.headerHeight,
        backgroundColor: APP_COMMON_STYLES.headerColor,
        flexDirection: 'row',
        elevation: 30,
        shadowOffset: { width: 0, height: 8 },
        shadowColor: '#000000',
        shadowOpacity: 0.9,
        shadowRadius: 5,
        zIndex: 999,
        paddingLeft: 17,
        paddingRight: 25
    },
    headerIconCont: {
        paddingHorizontal: 0,
        width: widthPercentageToDP(9),
        height: widthPercentageToDP(9),
        borderRadius: widthPercentageToDP(9) / 2,
        backgroundColor: '#fff',
        alignSelf: 'center',
    },
    headingContainer: {
        flex: 1,
        marginLeft: 17,
        justifyContent: 'center',
        alignSelf: 'center'
    },
    heading: {
        fontSize: 20,
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: CUSTOM_FONTS.gothamBold,
        letterSpacing: 0.2
    },
    subheading: {
        color: '#C4C4C4',
        fontFamily: CUSTOM_FONTS.gothamBold,
        letterSpacing: 1.08
    },
    bikePic: {
        height: 232,
        width: widthPercentageToDP(100),
    },
    bikeBtmBorder: {
        borderBottomWidth: 4,
        borderBottomColor: APP_COMMON_STYLES.headerColor
    },
    activeBorder: {
        borderBottomColor: APP_COMMON_STYLES.infoColor
    },
    odometerImage: {
        position: 'absolute',
        alignSelf: 'center',
        height: 111,
        width: 118,
        justifyContent: 'center'
    },
    odometerLblContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 5
    },
    odometerLbl: {
        color: '#6E6E6E',
        letterSpacing: 2.2,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        marginHorizontal: 72
    },
    title: {
        marginTop: 25,
        fontSize: 19,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    subtitle: {
        marginTop: 5,
    },
    activeBikeTxt: {
        marginTop: 16,
        color: '#fff',
        letterSpacing: 0.6,
        fontSize: 12,
        backgroundColor: APP_COMMON_STYLES.infoColor,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: widthPercentageToDP(3.5),
        alignSelf: 'flex-start',
        overflow: 'hidden'
    },
    activeBikeBtnTxt: {
        color: '#585756',
        letterSpacing: 0.6
    },
    activeBikeBtn: {
        marginTop: 16,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 50,
        borderWidth: 1.2,
        borderColor: APP_COMMON_STYLES.infoColor,
        alignSelf: 'flex-start'
    },
    miles: {
        letterSpacing: 0.3,
        textAlign: 'center',
        color: '#fff',
        fontSize: 22,
        fontFamily: CUSTOM_FONTS.dinCondensedBold
    },
    list: {
        flexGrow: 0,
    },
    sectionLinkBtn: {
        paddingHorizontal: 0,
        flexDirection: 'row'
    },
    sectionLinkTxt: {
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        fontSize: 12,
        paddingBottom: 7,
        letterSpacing: 1.8
    },
    addBtnCont: {
        height: 14,
        width: 14,
        borderRadius: 7,
        backgroundColor: '#a8a8a8',
        marginRight: 10
    },
    section: {
        marginTop: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greyBorder: {
        height: 13,
        backgroundColor: '#D9D9D9'
    },
    fullWidthImgLink: {
        flex: 1,
        marginTop: 20,
        borderTopWidth: 9,
        borderTopColor: '#f69039',
        elevation: 20,
        height: heightPercentageToDP(30)
    },
    imgBG: {
        flex: 1,
        height: null,
        width: null,
        justifyContent: 'center',
        paddingLeft: 52,
        paddingTop: 23
    },
    txtOnImg: {
        color: '#fff',
        fontSize: 18,
        letterSpacing: 1.8,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
    },
    hDivider: {
        backgroundColor: '#B1B1B1',
        height: 1.5,
        marginTop: 8
    },
    imageStyle: {
        marginRight: widthPercentageToDP(1.8),
        height: widthPercentageToDP(100 / 5),
        width: widthPercentageToDP(100 / 5)
    },
    squareCardTitle: {
        fontFamily: CUSTOM_FONTS.dinCondensed,
        color: '#FFFFFF',
        fontSize: 30
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