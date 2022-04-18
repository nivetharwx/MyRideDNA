import React, { Component } from 'react';
import { StyleSheet, FlatList, View, ScrollView, Image, TouchableOpacity, Alert, Text, } from 'react-native';
import { connect } from 'react-redux';
import { BaseModal, GesturedCarouselModal } from '../../../components/modal';
import { widthPercentageToDP, heightPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, RIDE_POINT, CUSTOM_FONTS, GET_PICTURE_BY_ID, PageKeys, POST_TYPE, RECORD_RIDE_STATUS, RIDE_TYPE, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG } from '../../../constants';
import { IconButton, BasicButton, ImageButton, LinkButton } from '../../../components/buttons';
import { updateRide, getSpaces, getRideInfo } from '../../../api';
import { updateRideAction, updateRideInListAction, apiLoaderActions, editBikeListAction, resetErrorHandlingAction } from '../../../actions';
import { DefaultText } from '../../../components/labels';
import { IconicList, LabeledInputPlaceholder } from '../../../components/inputs';
import { Actions } from 'react-native-router-flux';
import { BasePage } from '../../../components/pages';
import { ImageLoader } from '../../../components/loader';
import CommentSection from '../comment-scetion';
import DurationIcon from '../../../assets/img/Time-Ride.svg'
import DistanceIcon from '../../../assets/img/Distance-Rides.svg'
import CalendarIcon from '../../../assets/img/Date-Rides.svg'
import ImageViewer from 'react-native-image-viewing'
import { Icon as NBIcon } from 'native-base';

const CONTAINER_H_SPACE = widthPercentageToDP(6);
const NUM_OF_DESC_LINES = 2;
class ItinerarySection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isPrivate: this.props.ride ? this.props.ride.privacyMode === 'private' ? true : false : false,
            selectedBikeId: this.props.ride.spaceId ? this.props.ride.spaceId : null,
            bikeList: [],
            isEditingRide: props.isEditingRide || false,
            showOptionsModal: false,
            description: this.props.ride.description || '',
            name: this.props.ride.name || '',
            showSwipingPictureModal: false,
            selectedPictureIdLIst: [],
            isLoadingWaypoints: false,
            showMoreSections: {},
            activeIndex: -1,
            commentMode: false,
        };
    }

    componentDidMount() {
        console.log('//// mounted called',this.props)
        getSpaces(this.props.user.userId, (bikeList) => {
            this.setState({ bikeList });
        }, (er) => console.log(er));
        if (this.props.comingFrom !== PageKeys.MAP) {
            this.fetchRideInfo();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        console.log('/// component did update called')
        if (prevProps.hasNetwork === false && this.props.hasNetwork === true) {
            this.retryApiFunc();
        }

        console.log(this.props,'printed props')

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

    fetchRideInfo = () => {
        this.setState({ isLoadingWaypoints: true });
        this.props.getRideInfo(this.props.ride.rideId, (res) => {
            
            Actions.refresh({ ride: { ...this.props.ride, ...res } });
            this.setState({ isLoadingWaypoints: false });
        }, (er) => {
            this.setState({ isLoadingWaypoints: false });
        })
    }

    pointKeyExtractor = item => item.id || item.lng + '' + item.lat;

    onPressUpdate = () => {
        this.props.updateRide({ name: this.state.name, description: this.state.description, spaceId: this.state.selectedBikeId, privacyMode: this.state.isPrivate ? 'private' : 'public', rideId: this.props.ride.rideId },
            this.props.comingFrom === PageKeys.LOGGED_RIDE ? POST_TYPE.LOGGED_RIDES : this.props.ride.rideType, this.props.comingFrom === PageKeys.MAP, (res) => {
                if (this.props.comingFrom !== PageKeys.MAP) {
                    Actions.refresh({ ride: { ...this.props.ride, name: this.state.name, description: this.state.description, spaceId: this.state.selectedBikeId, privacyMode: this.state.isPrivate ? 'private' : 'public' } ,isEditingRide:false});
                }
                this.setState({ isEditingRide: false });
            }, (er) => this.setState({ isEditingRide: false }));
    }

    getFormattedDate = (isoDateString = new Date().toISOString(), joinBy = ' ') => {
        const dateInfo = new Date(isoDateString).toString().substr(4, 12).split(' ');
        return [dateInfo[0] + '.', (dateInfo[2] + '').slice(-2)].join(joinBy);
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

    onPressBackButton = () => Actions.pop()

    onChangeBike = (val) => this.setState({ selectedBikeId: val });

    onChangeDescription = (val) => this.setState({ description: val });

    onChangeName = (val) => this.setState({ name: val });

    onChangePrivacyMode = (val) => this.setState({ isPrivate: val });

    enableEditingRide = () => this.setState({ isEditingRide: true, showOptionsModal: false })

    openOptionsModal = () => {
        this.setState({ showOptionsModal: true });
    }

    hideOptionsModal = () => this.setState({ showOptionsModal: false });

    onPressWaypoint = (waypointType, selectedPost, index) => {
        const pictureIds = selectedPost.pictureList ? selectedPost.pictureList.map(item => ({ id: item.id })) : [];
        Actions.push(PageKeys.POST_FORM, {
            comingFrom: PageKeys.ITINERARY_SECTION, updateRideOnMap: this.props.comingFrom === PageKeys.MAP,
            waypointType, selectedPost: { ...selectedPost, pictureIds }, rideId: this.props.ride.rideId, index: waypointType === RIDE_POINT.WAYPOINT ? index - 1 : null,
            onDismiss: this.props.comingFrom !== PageKeys.MAP ? () => new Promise((resolve, reject) => {
                this.fetchRideInfo();
                resolve("done");
            }) : null
        })
    }

    onPressPicture = (waypointType, item, index) => {
        if (this.state.isEditingRide) {
            this.onPressWaypoint(waypointType, item, index)
        } else {
            const updateList = []
            item.pictureList.forEach(picture =>
                updateList.push({ id: picture.id, description: item.description })
            )
            this.openPicture(updateList)
        }
    }

    onDescriptionLayout({ nativeEvent: { lines } }, index) {
        lines.length > NUM_OF_DESC_LINES && this.setState(prevState => ({ showMoreSections: { ...prevState.showMoreSections, [index]: true } }));
    }

    showMoreContent = (index) => {
        this.setState(prevState => {
            const { [index]: deletedKey, ...otherKeys } = prevState.showMoreSections;
            if (Object.keys(otherKeys).length === 0) {
                return { showMoreSections: {}, activeIndex: index };
            } else {
                return { showMoreSections: { ...otherKeys }, activeIndex: index };
            }
        })
    }

    renderWayPointContent = (item, waypointType, index) => {
        const { isEditingRide, activeIndex } = this.state;
        return <View style={styles.waypointContainer}>
            <View style={styles.leftContainer}>
                {
                    waypointType === RIDE_POINT.WAYPOINT ?
                        <View style={styles.dotIcon}></View>
                        : <IconButton iconProps={{ name: 'location-pin', type: 'Entypo', style: styles.sourceIcon }} />
                }
                {
                    waypointType === RIDE_POINT.DESTINATION ?
                        null
                        : <View style={[styles.dottedLine, { height: isEditingRide || item.pictureList && item.pictureList.length ? 93 : 20 }]} />
                }
            </View>
            <View style={styles.bodyContainer}>
                <DefaultText style={styles.waypointName}>
                    {
                        item.name
                            ? item.name
                            : `Unknown (${item.lat}, ${item.lng})`
                    }
                </DefaultText>
                {
                    (item.pictureList && item.pictureList.length > 0) || (item.description)
                        ? <TouchableOpacity style={styles.waypointDetail} onPress={() => isEditingRide ? this.onPressWaypoint(waypointType, item, index) : this.onPressPicture(waypointType, item, index)}>
                            {
                                (item.pictureList && item.pictureList.length > 0)
                                    ? <View style={styles.waypointPic}>
                                        <Image source={{ uri: `${GET_PICTURE_BY_ID}${item.pictureList[item.pictureList.length - 1].id}` }} style={{ width: null, height: null, flex: 1 }} />
                                        {
                                            item.pictureList.length > 1
                                                ? <View style={styles.numberOfPictureCont}><DefaultText style={styles.numberOfPictureText}>{item.pictureList.length}</DefaultText></View>
                                                : null
                                        }
                                    </View>
                                    : <View style={[styles.waypointPic, { alignItems: 'center', justifyContent: 'center' }]}>
                                        <ImageButton imageSrc={require('../../../assets/img/cam-icon-light-gray.png')} imgStyles={[styles.cameraIcon]} onPress={() => isEditingRide ? this.onPressWaypoint(waypointType, item, index) : null} />
                                    </View>
                            }
                            <View style={styles.waypointDescriptionCont}>
                                <DefaultText style={[styles.waypointDescription, { color: item.description ? '#4E4D4D' : '#9A9A9A' }]} numberOfLines={1}>{item.description ? item.description : 'additional description'}</DefaultText>
                            </View>
                        </TouchableOpacity>
                        : isEditingRide
                            ? <TouchableOpacity style={styles.waypointDetail} onPress={() => this.onPressWaypoint(waypointType, item, index)}>
                                <View style={[styles.waypointPic, { alignItems: 'center', justifyContent: 'center' }]}>
                                    <ImageButton imageSrc={require('../../../assets/img/cam-icon-light-gray.png')} imgStyles={[styles.cameraIcon]} />
                                </View>
                                <View style={styles.waypointDescriptionCont}>
                                    <DefaultText style={[styles.waypointDescription, { color: item.description ? '#4E4D4D' : '#9A9A9A' }]}>{'additional description'}</DefaultText>
                                </View>
                            </TouchableOpacity>
                            : null
                }

            </View>
        </View>
    }

    openPicture = (pictureList) => {
        this.setState({ showSwipingPictureModal: true, selectedPictureIdLIst: pictureList });
    }

    onCancelVisiblePicture = () => {
        this.setState({ showSwipingPictureModal: false, selectedPictureIdLIst: [] });
    }

    hideCommentSection = () => this.setState({ commentMode: false, activeIndex: -1 })

    render() {
        const { ride, bike, user } = this.props;
        const { selectedBikeId, bikeList, isPrivate, showOptionsModal, name, description, isEditingRide, showSwipingPictureModal, selectedPictureIdLIst, commentMode, activeIndex } = this.state;
        if (ride === undefined) return null;
        if (ride.rideId === null) return null;
        const BIKE_LIST = [];
        console.log('\n\n\n bike :', ride)
        if(ride.userId === user.userId || ride.rideType === RIDE_TYPE.BUILD_RIDE){
            console.log('\n\n\n if')
            if (bikeList.length>0) {
                bikeList.forEach(bike => BIKE_LIST.push({ label: bike.name, value: bike.spaceId }));
            } else {
                // BIKE_LIST.push({ label: bike.name, value: bike.spaceId });
            }
        }
        else{
            console.log('\n\n\n if', bike && bike.spaceId)
            if(ride && ride.spaceId && ride.space){
                BIKE_LIST.push({ label: ride.space.name, value: ride.space.id });
            }
            else{
                console.log('\n\n\n else')
            }
        }
        
        return <BasePage
            heading={ride.name}
            headerRightIconProps={( this.props.comingFrom === PageKeys.MAP && ride.userId === user.userId && !this.state.isEditingRide) ? { name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 20 }, onPress: this.openOptionsModal } : null}>
            {
                commentMode ?
                    <View style={[{ height: heightPercentageToDP(100), width: widthPercentageToDP(100), elevation: 12, position: 'absolute', zIndex: 900 }]}>
                        <CommentSection isEditable={false} showInEditMode={false} index={activeIndex} onClose={this.hideCommentSection} />
                    </View>
                    : null
            }
            <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={showOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                <View style={APP_COMMON_STYLES.optionsContainer}>
                    <LinkButton style={APP_COMMON_STYLES.optionBtn} title='Edit' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.enableEditingRide} />
                </View>
            </BaseModal>
            {/* {showSwipingPictureModal && <GesturedCarouselModal isVisible={showSwipingPictureModal} onCancel={this.onCancelVisiblePicture}
                pictureIds={selectedPictureIdLIst}
                isGestureEnable={true}
                isZoomEnable={true}
                initialCarouselIndex={0}
                innerConatiner={{ marginTop: heightPercentageToDP(20) }}
            />} */}
            {
                 showSwipingPictureModal && <ImageViewer FooterComponent={(img)=>{
                    return   ( <View style={{ height: 100,backgroundColor:'rgba(0, 0, 0, 0.37)',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                            <DefaultText style={{ fontSize: 16, color: 'white',marginLeft:20 }} text={selectedPictureIdLIst[img.imageIndex].description} numberOfLines={2}/>
                            <Text style={{ fontSize: 16, color: 'white',textAlign:'center',marginBottom:19, }} >{(img.imageIndex+1)+' / '+selectedPictureIdLIst.length}</Text>
                            </View>)
                }} HeaderComponent={()=>{
                    return <View style={{height:IS_ANDROID?heightPercentageToDP(6):heightPercentageToDP(10),backgroundColor:'rgba(0, 0, 0, 0.37)',display:'flex',flexDirection:'row',justifyContent:'flex-end',alignItems:'flex-end'}}>
                        <View style={{width:50,height:50,display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center',}}>
                        <NBIcon name='close' fontSize={20}  style={{ color: '#fff'}} onPress={this.onCancelVisiblePicture} />
                        </View>
                    </View>
                }} visible={showSwipingPictureModal} onRequestClose={this.onCancelVisiblePicture}  images={selectedPictureIdLIst.map(image=>{
                        return {
                            ...image,uri: `${GET_PICTURE_BY_ID}${image.id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}`
                        }
                    })} imageIndex={0} />
                }
            <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps={'handled'}>
                <View style={styles.subHeader}>
                    <View style={{ flexDirection: 'row' }}>
                        {/* <ImageButton imageSrc={require('../../../assets/img/distance.png')} imgStyles={styles.subHeaderIcon} /> */}
                        <DistanceIcon />
                        <DefaultText style={styles.subHeaderText}>{this.getDistanceAsFormattedString(ride.totalDistance, this.props.user.distanceUnit)}</DefaultText>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        {/* <ImageButton imageSrc={require('../../../assets/img/duration.png')} imgStyles={styles.subHeaderIcon} /> */}
                        <DurationIcon />
                        <DefaultText style={styles.subHeaderText}>{this.getTimeAsFormattedString(ride.totalTime)}</DefaultText>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        {/* <ImageButton imageSrc={require('../../../assets/img/date.png')} imgStyles={styles.subHeaderIcon} /> */}
                        <CalendarIcon />
                        <DefaultText style={styles.subHeaderText}>{this.getFormattedDate(ride.date)}</DefaultText>
                    </View>
                </View>
                <View style={styles.rideDetailCont}>
                    <DefaultText style={{ fontFamily: CUSTOM_FONTS.robotoBold, fontSize: 14, letterSpacing: 1.2, marginBottom: 3 }}>RIDE NAME</DefaultText>
                    {
                        isEditingRide
                            ? <LabeledInputPlaceholder
                                containerStyle={{ backgroundColor: '#F4F4F4', borderBottomWidth: 0, paddingRight: 10, }}
                                inputValue={name} inputStyle={{ paddingVertical: 2, fontSize: 15, }}
                                returnKeyType='next'
                                onChange={this.onChangeName}
                                hideKeyboardOnSubmit={true} />
                            : <DefaultText style={{ fontFamily: CUSTOM_FONTS.roboto, fontSize: 15, color: ride.name ? '#000000' : '#ACACAC', paddingRight: 10, }}>{ride.name || '- - -'}</DefaultText>
                    }
                    <DefaultText style={{ fontFamily: CUSTOM_FONTS.robotoBold, fontSize: 14, letterSpacing: 1.2, marginTop: 20, marginBottom: 3 }}>RIDE DESCRIPTION</DefaultText>
                    {
                        isEditingRide
                            ? <LabeledInputPlaceholder
                                multiline={true}
                                containerStyle={{ backgroundColor: '#F4F4F4', borderBottomWidth: 0, paddingRight: 10, }}
                                inputValue={description} inputStyle={{ paddingVertical: 2, fontSize: 15, }}
                                returnKeyType='default'
                                onChange={this.onChangeDescription} />
                            : <DefaultText style={{ fontFamily: CUSTOM_FONTS.roboto, fontSize: 15, color: ride.description ? '#000000' : '#ACACAC', paddingRight: 10, }}>{ride.description || '- - -'}</DefaultText>
                    }
                    {this.props.rideType==RIDE_TYPE.RECORD_RIDE?<View style={styles.dropdownContainer}>
                        <IconicList
                            disabled={BIKE_LIST.length === 0 || !isEditingRide}
                            iconProps={IS_ANDROID ? {} : { type: 'MaterialIcons', name: 'arrow-drop-down', style: { color: APP_COMMON_STYLES.infoColor, fontSize: 28 } }}
                            pickerStyle={[{ borderBottomWidth: 0 }, IS_ANDROID ? { flex: 1 } : null]}
                            textStyle={{ paddingLeft: 10, fontSize: 14, bottom: 6 }}
                            selectedValue={selectedBikeId}
                            values={BIKE_LIST}
                            placeholder={bike ? 'SELECT A BIKE' : null}
                            outerContainer={{ flex: 1, alignItems: 'flex-end' }}
                            containerStyle={[styles.borderStyle, { flex: 1 }]}
                            innerContainerStyle={{ height: 24 }}
                            onChange={this.onChangeBike} />
                    </View>:null
                    }
                    {
                        ride.isRecorded === false || ride.status === RECORD_RIDE_STATUS.COMPLETED
                            ? <View style={styles.switchBtnContainer}>
                                <LinkButton style={[styles.grayBorderBtn, { marginRight: 17 }, isPrivate ? null : styles.greenLinkBtn]} title='ROAD CREW' titleStyle={[styles.grayBorderBtnText, { color: isPrivate ? '#9A9A9A' : '#fff' }]} onPress={isEditingRide ? () => isPrivate === true && this.onChangePrivacyMode(false) : null} />
                                <LinkButton style={[styles.grayBorderBtn, isPrivate ? styles.redLinkBtn : null]} title='ONLY ME' titleStyle={[styles.grayBorderBtnText, { color: isPrivate ? '#fff' : '#9A9A9A' }]} onPress={isEditingRide ? () => isPrivate === false && this.onChangePrivacyMode(true) : null} />
                            </View>
                            : null
                    }

                </View>
                {isEditingRide && <BasicButton title='UPDATE' style={styles.submitBtn} titleStyle={{ letterSpacing: 1.4, fontSize: 14, fontFamily: CUSTOM_FONTS.robotoBold }} onPress={this.onPressUpdate} />}
                <View style={styles.hDivider} />
                <View>
                    {this.state.isLoadingWaypoints && <ImageLoader containerStyle={{ backgroundColor: 'transparent' }} show={this.state.isLoadingWaypoints} />}
                    {ride.source && this.renderWayPointContent(ride.source, RIDE_POINT.SOURCE, 0)}
                    <FlatList
                        keyboardShouldPersistTaps={'handled'}
                        extraData={this.state}
                        data={ride.waypoints}
                        renderItem={({ item, index }) => this.renderWayPointContent(item, RIDE_POINT.WAYPOINT, ride.source ? index + 1 : index)}
                        keyExtractor={this.pointKeyExtractor}
                    />
                    {ride.destination && this.renderWayPointContent(ride.destination, RIDE_POINT.DESTINATION, ride.source ? ride.waypoints.length + 1 : ride.waypoints.length)}
                </View>
            </ScrollView>
        </BasePage >
    }
}
const mapStateToProps = (state) => {
    const { ride } = state.RideInfo.present;
    const { user } = state.UserAuth;
    // const { rides } = state.
    const { currentBike: bike } = state.GarageInfo;
    const { hasNetwork, lastApi, isRetryApi } = state.PageState;
    return ride && ride.rideId ? { user, ride, bike, hasNetwork, lastApi, isRetryApi } : { user, bike, hasNetwork, lastApi, isRetryApi };
}
const mapDipatchToProps = (dispatch) => {
    return {
        updateRide: (updates, rideType, updateRideOnMap, successCallback) => {
            dispatch(apiLoaderActions(true));
            updateRide(updates, () => {
                typeof successCallback === 'function' && successCallback()
                dispatch(apiLoaderActions(false));
                updateRideOnMap && dispatch(updateRideAction(updates));
                if (rideType === POST_TYPE.LOGGED_RIDES) {
                    dispatch(editBikeListAction({ ride: updates, postType: rideType, }));
                }
                else {
                    dispatch(updateRideInListAction({ ride: updates, rideType }));
                }
            }, (err) => dispatch(apiLoaderActions(false)))
        },
        getRideInfo: (rideId, successCallback, errorCallback) => getRideInfo(rideId).then(res => {
            console.log('getRideInfo success: ', res.data)
            // dispatch(updateRideAction(res.data))  //sumit changes
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            successCallback(res.data)
        }).catch(er => {
            console.log('getRideInfo error: ', er)
            handleServiceErrors(er, [rideId, successCallback, errorCallback], 'getRideInfo', true, true);
        }),
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'itinerary_section', isRetryApi: state })),
    };
}
export default connect(mapStateToProps, mapDipatchToProps)(ItinerarySection);

const styles = StyleSheet.create({
    modalRoot: {
        backgroundColor: '#fff',
        flex: 1,
    },
    header: {
        backgroundColor: APP_COMMON_STYLES.headerColor,
        height: APP_COMMON_STYLES.headerHeight,
        zIndex: 100,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: APP_COMMON_STYLES.statusBar.height
    },
    headerIconCont: {
        paddingHorizontal: 0,
        width: widthPercentageToDP(9),
        height: widthPercentageToDP(9),
        borderRadius: widthPercentageToDP(9) / 2,
        backgroundColor: '#fff',
        alignSelf: 'center',
        marginLeft: 17
    },
    titleContainer: {
        flex: 1,
        flexDirection: 'column',
        marginLeft: 17,
        justifyContent: 'center',
        alignSelf: 'center'
    },
    headerText: {
        fontSize: 20,
        color: '#FFFFFF',
        backgroundColor: 'transparent',
        letterSpacing: 0.8,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    bodyContent: {
        flex: 1,
    },
    subHeader: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        height: APP_COMMON_STYLES.headerHeight,
        backgroundColor: '#585756',
        alignItems: 'center'
    },
    subHeaderIcon: {
        height: 23,
        width: 26,
        alignSelf: 'center'
    },
    subHeaderText: {
        color: '#EAEAEA',
        fontSize: 15,
        fontFamily: CUSTOM_FONTS.robotoBold,
        marginLeft: 5,
        alignSelf: 'center'
    },
    rideDetailCont: {
        marginLeft: 30,
        marginTop: 33
    },
    dropdownContainer: {
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#B2B2B2',
        marginTop: 18
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
    switchBtnContainer: {
        flexDirection: 'row',
        marginTop: 20
    },
    dropdownIcon: {
        color: APP_COMMON_STYLES.infoColor,
        height: 26,
    },
    grayBorderBtn: {
        borderWidth: 1,
        borderColor: '#9A9A9A',
        alignItems: 'center',
        width: 90,
        paddingVertical: 3,
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
    hDivider: {
        backgroundColor: '#C4C6C8',
        marginVertical: 20,
        height: 1.5,
    },
    waypointContainer: {
        marginHorizontal: 23,
        flexDirection: 'row'
    },
    leftContainer: {
        flexDirection: 'column',
        width: 23,
        paddingTop: 0,
    },
    sourceIcon: {
        color: APP_COMMON_STYLES.infoColor,
        fontSize: 25,
        marginTop: 3
    },
    dottedLine: {
        marginTop: 2,
        width: 1,
        alignSelf: 'center',
        borderColor: '#DBDBDB',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 1
    },
    bodyContainer: {
        width: 281,
    },
    waypointName: {
        fontSize: 23,
        fontFamily: CUSTOM_FONTS.robotoBold,
        color: '#585756',
        paddingBottom: 8,
        paddingLeft: 5,
    },
    waypointDetail: {
        flexDirection: 'row',
        marginLeft: 5
    },
    waypointPic: {
        height: 60,
        width: 60,
        backgroundColor: '#DBDBDB'
    },
    cameraIcon: {
        height: 30,
        width: 30,
    },
    waypointDescriptionCont: {
        width: 210,
        backgroundColor: '#EAEAEA',
        justifyContent: 'center',
    },
    waypointDescription: {
        marginLeft: 14,
        fontSize: 17,
        fontFamily: CUSTOM_FONTS.roboto
    },
    submitBtn: {
        height: 35,
        backgroundColor: '#f69039',
        width: 213,
        alignSelf: 'center',
        borderRadius: 20,
        marginTop: 20
    },
    dotIcon: {
        height: 18,
        width: 18,
        borderRadius: 9,
        backgroundColor: APP_COMMON_STYLES.infoColor,
        marginTop: 8,
        marginBottom: 2,
        alignSelf: 'center'
    },
    numberOfPictureCont: {
        height: 15,
        width: 15,
        borderRadius: 7.5,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: '#fff'
    },
    numberOfPictureText: {
        color: '#585756',
        fontFamily: CUSTOM_FONTS.robotoBold
    }

});