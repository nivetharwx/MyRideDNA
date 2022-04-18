import React, { Component } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, ScrollView, FlatList, } from 'react-native';
import { connect } from 'react-redux';
import { appNavMenuVisibilityAction, apiLoaderActions, updateRideInListAction, updateRideAction, updateRideLikeAndCommentAction, screenChangeAction, clearRideAction, resetErrorHandlingAction } from '../../../actions';
import { Actions } from 'react-native-router-flux';
import { APP_COMMON_STYLES, GET_PICTURE_BY_ID, THUMBNAIL_TAIL_TAG, CUSTOM_FONTS, RIDE_TYPE, MEDIUM_TAIL_TAG, widthPercentageToDP, PageKeys, IS_ANDROID, JS_SDK_ACCESS_TOKEN, UNSYNCED_RIDE } from '../../../constants';
import { PostCard } from '../../../components/cards';
import { DefaultText } from '../../../components/labels';
import { ImageButton, LinkButton, IconButton } from '../../../components/buttons';
import { getCurrentRideState } from '../../../selectors';
import { updateRide, getSpaces, addLike, unLike, addComment, deleteComment, getComments, getPostDetail, getRideByRideId, getRideInfo, pauseRecordRide, completeRecordRide, handleServiceErrors } from '../../../api';
import { LabeledInputPlaceholder } from '../../../components/inputs';
import { BasePage } from '../../../components/pages';
import { getFormattedDateFromISO } from '../../../util';
import { BaseModal } from '../../../components/modal';
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';

const CONTAINER_H_SPACE = 33.5;
export class RideDetails extends Component {
    _postType = 'ride';
    constructor(props) {
        super(props);
        this.state = {
            bikeList: [],
            rideDescription: props.currentRide ? props.currentRide.description : '',
            bikeId: props.currentRide ?
                props.currentRide.rideType === RIDE_TYPE.SHARED_RIDE ?
                    props.currentRide.space ?
                        props.currentRide.space.id
                        : null
                    : props.currentRide.spaceId
                : null,
            privacyMode: !props.currentRide || props.currentRide.privacyMode,
            showCommentBox: false,
            commentText: '',
            isVisibleCommentMenu: false,
            enableDeleteOption: false,
            comments: null,
            currentBikeName: '',
            showChildComments: {},
            parentCommentId: null,
            numberOfComments: 0,
            mainParentCommentId: null,
            commentCount: (this.props.currentRide && this.props.currentRide.numberOfComments) || 0,
            likesCount: (this.props.currentRide && this.props.currentRide.numberOfLikes) || 0,
            isLike: (this.props.currentRide && this.props.currentRide.isLike) || false,
        }
    }

    componentDidMount() {
        if (this.props.comingFrom === PageKeys.NOTIFICATIONS) {
            this.props.getRideInfo(this.props.notificationBody.reference.tragetId, (res) => {
                this.setState({ likesCount: res.numberOfLikes, commentCount: res.numberOfComments, isLike: res.isLiked })
                Actions.refresh({ currentRide: res });
                this.fetchTopThreeComments();
            })
        }
        else {
            if (this.props.isEditable && this.props.currentRide.rideType !== RIDE_TYPE.SHARED_RIDE) {
                getSpaces(this.props.user.userId, (bikeList) => {
                    const bike = bikeList.find(({ spaceId }) => spaceId === this.props.currentRide.spaceId);
                    const name = bike ? bike.name : '';
                    this.setState({ bikeList: bikeList.reverse(), currentBikeName: name });
                }, (er) => console.log(er));
            }
            this.fetchTopThreeComments();
        }
    }

    fetchTopThreeComments() {
        getComments(this.props.currentRide.rideId, this._postType, 0, 3).then(res => {
            this.setState({ comments: res.data.comments.length > 0 ? res.data.comments : null });
        }).catch(er => console.log('getComment error : ', er));
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.currentRide && this.props.currentRide.currentRideIndex === -1) {
            Actions.pop();
            return;
        }
        if (prevProps.currentRide && (prevProps.currentRide.numberOfComments !== this.props.currentRide.numberOfComments)) {
            this.fetchTopThreeComments();
            this.setState({ commentCount: this.props.postData.numberOfComments })
        }
        if (prevProps.currentRide && (prevProps.currentRide.numberOfLikes !== this.props.currentRide.numberOfLikes)) {
            this.setState({ likesCount: this.props.currentRide.numberOfLikes })
        }
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

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

    getFormattedDate = (isoDateString = new Date().toISOString(), joinBy = ' ') => {
        const dateInfo = new Date(isoDateString).toString().substr(4, 12).split(' ');
        return [dateInfo[0] + '.', (dateInfo[2] + '').slice(-2)].join(joinBy);
    }

    // onChangePrivacyMode = (selectedMode) => {
    //     // if (this.props.currentRide.privacyMode === 'private' && selectedMode === 'public') {
    //     //     this.props.updateRideInList({ rideId: this.props.currentRide.rideId, privacyMode: 'public' }, this.props.currentRide.rideType, this.props.currentRide.rideId === this.props.ride.rideId);
    //     // }
    //     // else if (this.props.currentRide.privacyMode === 'public' && selectedMode === 'private') {
    //     //     this.props.updateRideInList({ rideId: this.props.currentRide.rideId, privacyMode: 'private' }, this.props.currentRide.rideType, this.props.currentRide.rideId === this.props.ride.rideId);
    //     // }
    //     this.setState(prevState => ({ privacyMode: selectedMode }));
    // }

    // onChangeBike = (val) => {
    //     if (val && this.props.currentRide.spaceId !== val) {
    //         // this.props.updateRideInList({ rideId: this.props.currentRide.rideId, spaceId: val }, this.props.currentRide.rideType, this.props.currentRide.rideId === this.props.ride.rideId);
    //         this.setState({ bikeId: val });
    //     }
    // }

    // onSubmit = () => {
    //     const { bikeId, rideDescription, privacyMode } = this.state;
    //     let body = {};
    //     if (bikeId !== this.props.currentRide.spaceId) {
    //         body = { rideId: this.props.currentRide.rideId, spaceId: bikeId };
    //     }
    //     if (rideDescription !== this.props.currentRide.description) {
    //         body = { ...body, rideId: this.props.currentRide.rideId, description: rideDescription };
    //     }
    //     if (privacyMode !== this.props.currentRide.privacyMode) {
    //         body = { ...body, rideId: this.props.currentRide.rideId, privacyMode: privacyMode };
    //     }
    //     if (body.rideId) {
    //         this.props.updateRideInList(body, this.props.currentRide.rideType, this.props.currentRide.rideId === this.props.ride.rideId);
    //     }
    // }

    onChangeRideDescription = text => this.setState({ rideDescription: text });

    toggleLikeAction = () => {
        const { currentRide } = this.props;
        if (this.state.isLike) {
            this.props.unLike(currentRide.rideId, this.props.user.userId, currentRide.rideType, currentRide.numberOfLikes,  (res) => {
                this.setState(prevState => ({ likesCount: prevState.likesCount - 1, isLike: false }))
            });
        }
        else {
            this.props.addLike(currentRide.rideId, this._postType, currentRide.rideType, currentRide.numberOfLikes, (res) => {
                this.setState(prevState => ({ likesCount: prevState.likesCount + 1, isLike: true }))
            }); 
        }
    }

    getFormattedTime = (dateTime) => {
        const time = new Date(dateTime).toTimeString().substring(0, 5).split(':');
        let period = time[0] < 12 ? 'AM' : 'PM';
        if (time[0] > 12) {
            time[0] = time[0] - 12;
        }
        return `${time.join(':')} ${period}`;
    }

    openCommentPage = () => Actions.push(PageKeys.COMMENTS,
        {
            postId: this.props.currentRide.rideId, postType: this._postType,
            isEditable: this.props.isEditable, postData: this.props.currentRide,
            onUpdatesuccess: (commentsCount) => {
                this.fetchTopThreeComments();
                this.props.updateCommentsCount(this.props.currentRide.rideId, this.props.currentRide.rideType, commentsCount)
            },
            post:this.props.currentRide
        });

    openLikesPage = () => Actions.push(PageKeys.LIKES, { hasNetwork: this.props.hasNetwork, id: this.props.currentRide.rideId, type: this._postType });

    onChangeComment = (val) => this.setState(prevState => ({ commentText: val }));

    displayComments = (item, ischildComment, parentId, childId) => {
        const { enableDeleteOption } = this.state;
        const { isEditable } = this.props;
        return <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: ischildComment ? 70 : 17, marginRight: 27 }}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
                {enableDeleteOption && (isEditable || item.userId === this.props.user.userId) ? <IconButton style={{ marginRight: 10, alignSelf: 'center' }} iconProps={{ name: 'ios-close-circle', type: 'Ionicons', style: { color: '#CE0D0D', fontSize: 17 } }} onPress={() => this.deleteComment(parentId, childId, ischildComment)} /> : <View style={{ marginRight: 22 }} />}
                <View style={{ flex: 1 }}>
                    <DefaultText style={{ fontFamily: CUSTOM_FONTS.robotoSlabBold }}>{item.userName}</DefaultText>
                    <DefaultText style={{ fontFamily: CUSTOM_FONTS.roboto, fontSize: 13 }}>{item.text}</DefaultText>
                    <LinkButton style={{ alignSelf: 'flex-end' }} title='Reply' titleStyle={styles.postCommentBtn} onPress={() => this.setState({ showCommentBox: true, parentCommentId: item.id, mainParentCommentId: parentId })} />
                </View>
            </View>
            <View >
                <DefaultText style={{ fontSize: 10 }}>{getFormattedDateFromISO(item.date)}, {this.getFormattedTime(item.date)}</DefaultText>
            </View>
        </View>
    }

    renderComments = ({ item }) => {
        const parentItem = item;
        return <View style={{ marginTop: 10 }}>
            {this.displayComments(parentItem, false, parentItem.id, null)}
            {item.childComments && item.childComments.length > 0 && !this.state.showChildComments[item.id] && <View style={{ flexDirection: 'row', marginLeft: 40 }}>
                <View style={styles.horizontaline}></View>
                <LinkButton style={{ marginHorizontal: 10 }} title={`View ${item.childComments.length} ${item.childComments.length === 1 ? 'reply' : 'replies'}`} titleStyle={[APP_COMMON_STYLES.optionBtnTxt, { fontSize: 13 }]} onPress={() => this.setState({ showChildComments: { [item.id]: true } })} />
                <View style={styles.horizontaline}></View>
            </View>
            }
            {this.state.showChildComments[item.id] && <View style={{ flexDirection: 'row', marginLeft: 40 }}>
                <View style={styles.horizontaline}></View>
                <LinkButton style={{ marginHorizontal: 10 }} title={`Hide ${item.childComments.length} ${item.childComments.length === 1 ? 'reply' : 'replies'}`} titleStyle={[APP_COMMON_STYLES.optionBtnTxt, { fontSize: 13 }]} onPress={() => this.setState({ showChildComments: { [item.id]: false } })} />
                <View style={styles.horizontaline}></View>
            </View>
            }
            {this.state.showChildComments[item.id] && <FlatList
                keyboardShouldPersistTaps="handled"
                data={item.childComments}
                style={{ marginTop: 15 }}
                inverted={true}
                extraData={this.state}
                keyExtractor={this.commentKeyExtractor}
                renderItem={({ item: childItem, index }) => this.displayComments(childItem, true, parentItem.id, childItem.id)}
            />}
        </View>
    }

    postComment = () => {
        if (this.state.commentText.trim().length === 0) Toast.show({ text: 'Enter some text' });
        else {
            const parentCommentId = this.state.parentCommentId;
            const mainParentCommentId = this.state.mainParentCommentId
            let commentData = { text: this.state.commentText, referenceType: this.props.notificationBody ? this.props.notificationBody.reference.targetScreen === 'POST_DETAIL' ? 'post' : 'ride' : this.props.postType, userId: this.props.user.userId };
            if (parentCommentId) {
                commentData.parentCommentId = parentCommentId;
            }
            this.setState({ showCommentBox: false, commentText: '', parentCommentId: null, mainParentCommentId: null });
            this.props.addComment(this.props.notificationBody ? this.props.notificationBody.tragetId : this.props.postId, commentData, (res) => {
                if (parentCommentId) {
                    this.setState(prevState => ({
                        comments: this.state.comments.map(item => {
                            if (item.id === mainParentCommentId) {
                                const childCommentIndex = item.childComments ? item.childComments.findIndex(childCmnt => childCmnt.id === parentCommentId) : -1;
                                console.log('\n\n\n childCommentIndex : ', childCommentIndex)
                                return { ...item, childComments: item.childComments ? childCommentIndex > -1 ? [...item.childComments.slice(0, childCommentIndex), res.data, ...item.childComments.slice(childCommentIndex)] : [...item.childComments, res.data] : [res.data] }
                            }
                            else {
                                return item
                            }
                            // return item.id === mainParentCommentId ?
                            //     { ...item, childComments: item.childComments ? [res.data, ...item.childComments] : [res.data] }
                            //     : item
                        }), numberOfComments: prevState.numberOfComments + 1, commentCount: prevState.commentCount + 1
                    }),
                        () => this.props.onUpdatesuccess && this.props.onUpdatesuccess(this.state.numberOfComments));
                }
                else {
                    this.setState(prevState => ({ comments: [res.data, ...prevState.comments,], numberOfComments: prevState.numberOfComments + 1, commentCount: prevState.commentCount + 1 }),
                        () => this.props.onUpdatesuccess && this.props.onUpdatesuccess(this.state.numberOfComments));
                }
            }, (er) => { });
        }
    }

    deleteComment = (parentId, childId, isChildComment) => {
        this.props.deleteComment(isChildComment ? childId : parentId, this.props.user.userId, (res) => {
            console.log('\n\n\n res.data : ', res.data)
            if (isChildComment) {
                this.setState(prevState => {
                    const comments = this.state.comments.map(item => {
                        return item.id === parentId
                            ? { ...item, childComments: item.childComments.filter(({ id }) => id !== childId) }
                            : item
                    });
                    return { comments: comments, commentCount: prevState.commentCount - res.data.deletedCommentsCount, enableDeleteOption: comments.length > 0, numberOfComments: prevState.numberOfComments - res.data.deletedCommentsCount }
                }, () => this.props.onUpdatesuccess && this.props.onUpdatesuccess(this.state.numberOfComments));
            }
            else {
                this.setState(prevState => {
                    const comments = prevState.comments.filter(({ id }) => id !== parentId);
                    return { comments: comments, commentCount: prevState.commentCount - res.data.deletedCommentsCount, enableDeleteOption: comments.length > 0, numberOfComments: prevState.numberOfComments - res.data.deletedCommentsCount }
                }, () => this.props.onUpdatesuccess && this.props.onUpdatesuccess(this.state.numberOfComments));
            }
        }, (er) => { })
    }
    onPressRide = async (selectedRide) => {
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

    showCommentMenuModal = () => this.setState({ isVisibleCommentMenu: true });

    hideCommentMenuModal = () => this.setState({ isVisibleCommentMenu: false });

    render() {
        const { currentRide, isEditable, user } = this.props;
        const { bikeList, comments, isVisibleCommentMenu, rideDescription, privacyMode, showCommentBox, commentText, enableDeleteOption,commentCount, isLike, likesCount  } = this.state;
        const BIKE_LIST = [];
        if (!currentRide) return <BasePage />;
        if (isEditable) {
            !currentRide.spaceId && BIKE_LIST.push({ label: 'SELECT A BIKE', value: null });
            bikeList.forEach(bike => BIKE_LIST.push({ label: bike.name, value: bike.spaceId }));
        }
        return (
            <BasePage heading={currentRide.name} showLoader={this.props.showLoader}>
                {isVisibleCommentMenu && <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={isVisibleCommentMenu} onCancel={this.hideCommentMenuModal} onPressOutside={this.hideCommentMenuModal}>
                    <View style={APP_COMMON_STYLES.optionsContainer}>
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='DELETE COMMENT' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={() => this.setState({ enableDeleteOption: true, isVisibleCommentMenu: false })} />
                    </View>
                </BaseModal>}
                <KeyboardAvoidingView keyboardVerticalOffset={20} behavior={IS_ANDROID ? null : 'padding'} style={styles.fill}>
                    <ScrollView style={styles.fill}>
                        <PostCard
                            onPress={() => this.onPressRide(currentRide)}
                            headerContent={<View style={styles.footerContainer}>
                                <View style={{ flexDirection: 'row' }}>
                                    <ImageButton imageSrc={require('../../../assets/img/distance.png')} imgStyles={styles.footerIcon} />
                                    <DefaultText style={styles.footerText}>{this.getDistanceAsFormattedString(currentRide.totalDistance, this.props.user.distanceUnit)}</DefaultText>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <ImageButton imageSrc={require('../../../assets/img/duration.png')} imgStyles={styles.footerIcon} />
                                    <DefaultText style={styles.footerText}>{this.getTimeAsFormattedString(currentRide.totalTime)}</DefaultText>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <ImageButton imageSrc={require('../../../assets/img/date.png')} imgStyles={styles.footerIcon} />
                                    <DefaultText style={styles.footerText}>{this.getFormattedDate(currentRide.date)}</DefaultText>
                                </View>
                            </View>}
                            outerContainer={{ borderBottomWidth: 0, }}
                            image={currentRide.picture && currentRide.picture.id ? `${GET_PICTURE_BY_ID}${currentRide.picture.id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}` : null}
                            placeholderImage={require('../../../assets/img/ride-placeholder-image.png')}
                            placeholderImgHeight={220}
                            placeholderBlur={6}
                            footerContent={<View>
                                <View style={styles.postCardFtrIconCont}>
                                    <View style={styles.likesCont}>
                                        <IconButton iconProps={{ name: 'like1', type: 'AntDesign', style: { color: isLike ? '#2B77B4' : '#fff', fontSize: 22 } }} onPress={this.toggleLikeAction} />
                                        <LinkButton style={{ alignSelf: 'center' }} title={likesCount + ' Likes'} titleStyle={styles.postCardFtrIconTitle} onPress={currentRide.numberOfLikes > 0 ? this.openLikesPage : null} />
                                    </View>
                                    <IconButton title={commentCount + ' Comments'} titleStyle={styles.postCardFtrIconTitle} iconProps={{ name: 'ios-chatbubbles', type: 'Ionicons', style: { color: '#fff', fontSize: 22 } }} onPress={commentCount > 3 && this.openCommentPage} />
                                </View>
                            </View>}
                        />
                        {/* <KeyboardAvoidingView behavior={IS_ANDROID ? null : 'padding'} style={styles.container}>
                            <DefaultText style={styles.title}>RIDE DESCRIPTION</DefaultText>
                            <LabeledInputPlaceholder
                                editable={isEditable}
                                containerStyle={{ backgroundColor: '#F4F4F4', minHeight: 30 }}
                                inputValue={currentRide.description}
                                inputStyle={{ paddingBottom: 0 }}
                                multiline={true}
                                returnKeyType='done'
                                placeholder={isEditable ? 'Describe the ride here' : 'No description yet'}
                                onChange={this.onChangeRideDescription}
                                label=''
                                outerContainer={{ minHeight: 30, marginTop: 10 }}
                                hideKeyboardOnSubmit={true} />
                        </KeyboardAvoidingView>
                        {
                            isEditable
                                ? <View>
                                    <View style={styles.dropdownContainer}>
                                        <IconicList
                                            disabled={!isEditable || BIKE_LIST.length === 1}
                                            selectedValue={currentRide.spaceId}
                                            dropdownIcon={<NBIcon name='caret-down' type='FontAwesome' style={styles.dropdownIcon} />}
                                            placeholder={currentRide.spaceId ? null : 'SELECT A BIKE'}
                                            placeholderStyle={styles.dropdownPlaceholderTxt}
                                            textStyle={styles.dropdownTxt}
                                            pickerStyle={styles.dropdownStyle}
                                            values={BIKE_LIST}
                                            onChange={this.onChangeBike} />
                                    </View>
                                    <View style={styles.hDivider} />
                                </View>
                                : currentRide.spaceId
                                    ? <DefaultText style={[styles.dropdownPlaceholderTxt, { paddingHorizontal: CONTAINER_H_SPACE, marginTop: 20 }]} text={'Need to show bike name'} />
                                    : null
                        }
                        {
                            isEditable
                                ? <View style={styles.switchBtnContainer}>
                                    <LinkButton style={[styles.grayBorderBtn, { marginRight: 17 }, privacyMode === 'private' ? null : styles.greenLinkBtn]} title='PUBLIC' titleStyle={[styles.grayBorderBtnText, { color: privacyMode === 'private' ? '#9A9A9A' : '#fff' }]} onPress={() => isEditable ? this.onChangePrivacyMode('public') : null} />
                                    <LinkButton style={[styles.grayBorderBtn, privacyMode === 'private' ? styles.redLinkBtn : null]} title='PRIVATE' titleStyle={[styles.grayBorderBtnText, { color: privacyMode === 'private' ? '#fff' : '#9A9A9A' }]} onPress={() => isEditable ? this.onChangePrivacyMode('private') : null} />
                                </View>
                                : null
                        }
                        {isEditable && <BasicButton title={'UPDATE'} style={styles.submitBtn} titleStyle={styles.submitBtnTxt} onPress={this.onSubmit} />} */}
                        <View style={styles.container}>
                            <DefaultText style={styles.title}>RIDE DESCRIPTION</DefaultText>
                            <DefaultText style={[styles.dropdownPlaceholderTxt, { marginTop: 5, fontFamily: CUSTOM_FONTS.roboto }]} text={currentRide.description} />
                            <DefaultText style={[styles.dropdownPlaceholderTxt, { marginTop: 20 }]} text={currentRide.rideType === RIDE_TYPE.SHARED_RIDE ? currentRide.space ? currentRide.space.name : '' : this.state.currentBikeName} />
                            <DefaultText style={[styles.dropdownPlaceholderTxt, { marginTop: 20 }]} text={currentRide.privacyMode === 'private' ? 'ONLY ME' : 'ROAD CREW'} />
                        </View>
                        <View style={styles.hDivider} />
                        <View style={styles.commentsContainer}>
                            {
                                showCommentBox
                                    ? <View style={{ marginTop: 10 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 27 }}>
                                            <DefaultText style={[styles.label, { marginLeft: 15 }]}>{user.name}</DefaultText>
                                            <LinkButton title='CLOSE' titleStyle={styles.postCommentBtn} onPress={() => this.setState({ showCommentBox: false, commentText: '' })} />
                                        </View>
                                        <LabeledInputPlaceholder
                                            containerStyle={{ borderBottomWidth: 0, flex: 0 }}
                                            inputValue={commentText} inputStyle={{ paddingBottom: 0, }}
                                            outerContainer={{ padding: 5, borderWidth: 1, borderColor: '#707070', borderRadius: 10, marginTop: 5, marginHorizontal: 27, flex: 0 }}
                                            returnKeyType='done'
                                            onChange={this.onChangeComment}
                                            hideKeyboardOnSubmit={true}
                                            onSubmit={this.postComment} />
                                        <LinkButton style={{ alignSelf: 'center', marginTop: 5 }} title='POST COMMENT' titleStyle={styles.postCommentBtn} onPress={this.postComment} />
                                    </View>
                                    : enableDeleteOption
                                        ? <LinkButton style={{ alignSelf: 'flex-end', marginRight: 25, marginTop: 10 }} title='CLOSE' titleStyle={[styles.postCommentBtn]} onPress={() => this.setState({ enableDeleteOption: false })} />
                                        : <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 27, marginTop: 10 }}>
                                            <IconButton style={{ alignSelf: 'flex-start', justifyContent: 'space-between', }} title='ADD COMMENT' titleStyle={styles.addComment} iconProps={{ name: 'ios-add-circle', type: 'Ionicons', style: { color: '#F5891F', fontSize: 20 } }} onPress={() => this.setState({ showCommentBox: true })} />
                                            {comments && <IconButton iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#B4B4B4', fontSize: 20 } }} onPress={this.showCommentMenuModal} />}
                                        </View>
                            }
                            {comments && <View>
                                <FlatList
                                    contentContainerStyle={{ paddingBottom: 10 }}
                                    showsVerticalScrollIndicator={false}
                                    data={comments.slice(0, 3)}
                                    inverted={true}
                                    keyExtractor={this.commentKeyExtractor}
                                    renderItem={this.renderComments}
                                />
                            </View>}
                            {commentCount > 3 && <LinkButton style={{ alignSelf: 'center', marginBottom: 10 }} title={'View All'} titleStyle={{ color: '#B4B4B4', fontSize: 15 }} onPress={this.openCommentPage} />}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </BasePage>
        );
    }
}

const mapStateToProps = (state, props) => {
    const { user } = state.UserAuth;
    const { ride } = state.RideInfo.present;
    const { showLoader, hasNetwork } = state.PageState;
    if (props.comingFrom === PageKeys.NOTIFICATIONS) {
        return { user, ride, showLoader, hasNetwork };
    }
    else {
        return { user, ride, showLoader, hasNetwork, currentRide: getCurrentRideState(state, props) };
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        updateRideInList: (updates, rideType, updateActiveRide) => {
            dispatch(apiLoaderActions(true));
            updateRide(updates, () => {
                dispatch(apiLoaderActions(false));
                dispatch(updateRideInListAction({ ride: updates, rideType }));
                updateActiveRide === true && dispatch(updateRideAction(updates));
            }, (err) => dispatch(apiLoaderActions(false)))
        },
        addLike: (rideId, postType, rideType, numberOfLikes, successCallback) => addLike(rideId, postType).then(res => {
            console.log('addLike sucess : ', res);
            successCallback();
            dispatch(updateRideLikeAndCommentAction({ isUpdateLike: true, isLiked: true, rideId, isAdded: true, rideType }));
        }).catch(er => console.log('addLike error : ', er)),
        unLike: (rideId, userId, rideType, numberOfLikes, successCallback) => unLike(rideId, userId).then(res => {
            console.log('unLike sucess : ', res);
            successCallback();
            dispatch(updateRideLikeAndCommentAction({ isUpdateLike: true, isLiked: true, rideId, isAdded: false, rideType }));
        }).catch(er => console.log('unLike error : ', er)),
        addComment: (postId, commentData, successCallback, errorCallback) => addComment(postId, commentData).then(res => {
            console.log('addComment success : ', res.data)
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            successCallback(res)
        }).catch(er => {
            console.log('addComment error : ', er)
            errorCallback(er)
            handleServiceErrors(er, [postId, commentData, successCallback, errorCallback], 'addComment', true, true);
        }),
        deleteComment: (commentId, userId, successCallback, errorCallback) => deleteComment(commentId, userId).then(res => {
            console.log('deleteComment success : ', res)
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            successCallback(res)
        }).catch(er => {
            console.log('deleteComment error : ', er)
            errorCallback(er)
            handleServiceErrors(er, [commentId, userId, successCallback, errorCallback], 'deleteComment', true, true);
        }),
        updateCommentsCount: (rideId, rideType, numberOfComments) => dispatch(updateRideLikeAndCommentAction({ rideId, numberOfComments, rideType })),
        getRideInfo: (rideId, successCallback) => getRideInfo(rideId).then(res => {
            console.log('\n\n\n getRideInfo success: ', res.data)
            successCallback(res.data)
        }).catch(er => {
            console.log('getRideInfo error: ', res.data)
        }),
        pauseRecordRide: (pauseTime, actualPoints, trackpoints, distance, ride, userId, loadRide) => dispatch(pauseRecordRide(pauseTime, actualPoints, trackpoints, distance, ride, userId, loadRide)),
        completeRecordRide: (endTime, actualPoints, trackpoints, distance, ride, userId, loadRide) => dispatch(completeRecordRide(endTime, actualPoints, trackpoints, distance, ride, userId, loadRide)),
        changeScreen: (screenProps) => dispatch(screenChangeAction(screenProps)),
        clearRideFromMap: () => dispatch(clearRideAction()),
        loadRideOnMap: (rideId, rideInfo) => dispatch(getRideByRideId(rideId, rideInfo)),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(RideDetails);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#585756',
        padding: 10,

    },
    footerIcon: {
        height: 23,
        width: 26,
    },
    footerText: {
        color: '#EAEAEA',
        fontSize: 15,
        fontFamily: CUSTOM_FONTS.robotoBold,
    },
    container: {
        marginHorizontal: CONTAINER_H_SPACE,
        marginTop: 30
    },
    commentsContainer: {
        paddingBottom: 20
    },
    title: {
        fontFamily: CUSTOM_FONTS.robotoBold,
        fontSize: 14,
        letterSpacing: 1.2
    },
    description: {
        fontSize: 17,
        fontFamily: CUSTOM_FONTS.roboto
    },
    switchBtnContainer: {
        flexDirection: 'row',
        marginHorizontal: CONTAINER_H_SPACE,
        marginTop: 20
    },
    hDivider: {
        backgroundColor: '#C4C6C8',
        marginTop: 10,
        height: 1.5
    },
    dropdownContainer: {
        marginHorizontal: CONTAINER_H_SPACE,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#B2B2B2',
        paddingLeft: 10,
        marginTop: 20
    },
    dropdownStyle: {
        height: 26,
        width: widthPercentageToDP(100) - CONTAINER_H_SPACE * 2,
        borderBottomWidth: 0
    },
    dropdownTxt: {
        top: 3,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        color: '#585756',
        fontSize: 12
    },
    dropdownPlaceholderTxt: {
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        fontSize: 12,
        top: 3
    },
    grayBorderBtn: {
        borderWidth: 2,
        borderColor: '#9A9A9A',
        alignItems: 'center',
        width: 80,
        paddingVertical: 5,
        borderRadius: 22
    },
    grayBorderBtnText: {
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 0.5
    },
    greenLinkBtn: {
        backgroundColor: '#2EB959',
        borderColor: '#2EB959'
    },
    redLinkBtn: {
        backgroundColor: '#B92E2E',
        borderColor: '#B92E2E'
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
    submitBtn: {
        height: 35,
        backgroundColor: '#f69039',
        width: 213,
        alignSelf: 'center',
        borderRadius: 20,
        marginTop: 30
    },
    submitBtnTxt: {
        letterSpacing: 1.4,
        fontSize: 14,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    labelStyle: {
        fontSize: 11,
        letterSpacing: 1.1,
        fontFamily: CUSTOM_FONTS.robotoSlabBold
    },
    likesCont: {
        flexDirection: 'row'
    },
    commentContainer: {
        marginTop: 13,
    },
    addComment: {
        fontSize: 11, fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 1.1,
        color: '#F5891F',
        marginLeft: 10
    },
    label: {
        fontSize: 12,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
    },
    postCommentBtn: {
        letterSpacing: 1.1,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        color: '#F5891F'
    },
    horizontaline: {
        borderBottomWidth: 1,
        borderColor: '#ADADAD',
        width: 40,
        alignSelf: 'center'
    },
})