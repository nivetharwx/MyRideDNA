import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Alert, ImageBackground, Image, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { PageKeys, widthPercentageToDP, heightPercentageToDP, APP_COMMON_STYLES, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, WindowDimensions, CUSTOM_FONTS, GET_PICTURE_BY_ID, RELATIONSHIP, IS_ANDROID } from '../../constants/index';
import { BasicButton, IconButton, LinkButton } from '../../components/buttons';
import { appNavMenuVisibilityAction, updateUserAction, updateMyProfileLastOptionsAction, apiLoaderActions, screenChangeAction, setCurrentFriendAction, resetPersonProfileAction, goToPrevProfileAction, resetErrorHandlingAction, removeFromPassengerListAction, updateCurrentFriendAction, resetPersonProfilePicAction } from '../../actions';
import { getSpaceList, setBikeAsActive, getRoadBuddies, getPassengersById, getRoadBuddiesById, getUserProfile, doUnfriend, deletePassenger, handleServiceErrors } from '../../api';
import { SmallCard } from '../../components/cards';
import { DefaultText } from '../../components/labels';
import { getFormattedDateFromISO } from '../../util';
import { BaseModal, GesturedCarouselModal } from '../../components/modal';
import { BasePage } from '../../components/pages';
import { Tabs, Tab } from 'native-base';
import MyGarageTab from '../profile/my-garage';
import FitImage from 'react-native-fit-image';
import { getCurrentProfileState } from '../../selectors';
import ImageViewer from 'react-native-image-viewing'
import { Icon as NBIcon } from 'native-base'

class FriendsProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'PROFILE',
            bikes: [10, 20, 30, 40, 50],
            showOptionsModal: false,
            isVisbleFullImage: false,
            showDeleteModal: false,
            isPassenger: false
        };
    }

    componentDidMount() {
        if (this.props.comingFrom === PageKeys.NOTIFICATIONS) {
            console.log('\n\n\n comingFrom : ', this.props.comingFrom)
            this.props.getUserProfile(this.props.user.userId, this.props.notificationBody.fromUserId);
        } else {
            this.props.getUserProfile(this.props.user.userId, this.props.frienduserId);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.person !== this.props.person) {
            if (!this.props.person || prevProps.person.userId !== this.props.person.userId) return;
            if (prevProps.person.isFriend === false && this.props.person.isFriend === true) {
                this.props.getPassengersById(this.props.user.userId, this.props.frienduserId, 0, this.props.person.passengerList, (res) => { }, (error) => { });
                this.props.getRoadBuddiesById(this.props.user.userId, this.props.frienduserId, 0, this.props.person.friendList, (res) => { }, (error) => { });
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

    onChangeTab = ({ i }) => this.setState({ activeTab: i === 0 ? 'PROFILE' : 'GARAGE' });

    clubsKeyExtractor = (item) => item.clubId;

    roadBuddiesKeyExtractor = (item) => item.userId;

    passengerListKeyExtractor = (item) => item.passengerId;

    onPressFriendsPage = () => this.props.changeScreen({ name: PageKeys.FRIENDS, params: { comingFrom: PageKeys.PROFILE } });

    openPassengerProfile = (item, index) => {
        if (item.isFriend) {
            this.openRoadBuddy(item);
        } else {
            Actions.push(PageKeys.PASSENGER_PROFILE, { passengerId: item.passengerId, onPassenger: false });
        }
    }

    openRoadBuddy = (item) => {
        if (item.userId === this.props.user.userId) {
            this.props.changeScreen({ name: PageKeys.PROFILE });
        }
        else if (item.relationship === RELATIONSHIP.FRIEND) {
            this.props.setCurrentFriend({ userId: item.passengerId ? item.passengerUserId : item.userId });
            Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: item.passengerId ? item.passengerUserId : item.userId });
        }
        else {
            Actions.push(PageKeys.PASSENGER_PROFILE, { isUnknown: true, person: { ...item, userId: item.passengerId ? item.passengerUserId : item.userId } })
        }
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

    popToPrevProfile = () => {
        Actions.pop();
        this.props.goToPrevProfile();
    }

    getBuddyFriendListPage = () => {
        this.props.setCurrentFriend(this.props.person);
        Actions.push(PageKeys.BUDDY_FRIENDS, { frienduserId: this.props.person.userId });
    }

    getBuddyPassengerListPage = () => {
        this.props.setCurrentFriend(this.props.person);
        Actions.push(PageKeys.BUDDY_PASSENGERS, { frienduserId: this.props.person.userId });
    }

    showOptionsModal = () => this.setState({ showOptionsModal: true });

    hideOptionsModal = () => this.setState({ showOptionsModal: false });

    removeRoadBuddy = () => {
        this.props.doUnfriend(this.props.user.userId, this.props.person.userId, this.props.person.isPassenger ? this.props.person.passengerId : null, (res) => {
            this.setState({ showDeleteModal: false, showOptionsModal: false, isPassenger: false }, () => {
                Actions.pop()
            })
        }, (er) => { })
    }

    removeFromPassengers = () => {
        this.props.deletePassenger(this.props.person.passengerId, this.props.person.userId, (res) => {
            this.setState({ showDeleteModal: false, showOptionsModal: false, isPassenger: false }, () => {
                Actions.pop()
            })
        });
    }

    openJournalPage = () => Actions.push(PageKeys.JOURNAL, { isEditable: this.props.person.userId === this.props.user.userId, personId: this.props.person.userId, person: this.props.person });

    showFullImage = () => this.setState({ isVisbleFullImage: true });

    onCancelFullImage = () => {
        console.log('closed friends profile')
       return this.setState({ isVisbleFullImage: false })
    };

    handleServiceErrors1 = () => {

    }
    openDeleteModal = (isPassenger) => this.setState({ showDeleteModal: true, isPassenger });

    hideDeleteModal = () => this.setState({ showDeleteModal: false, isPassenger: false });

    render() {
        const { person = null } = this.props;
        const { showOptionsModal, isVisbleFullImage, showDeleteModal, isPassenger } = this.state;
        if (person === null) return <BasePage />;
        return (
            <BasePage defaultHeader={false} shifterBottomOffset={APP_COMMON_STYLES.tabContainer.height}>
                {/* {person.profilePictureId && <GesturedCarouselModal
                    isVisible={isVisbleFullImage}
                    onCancel={this.onCancelFullImage}
                    pictureIds={[{ id: person.profilePictureId }]}
                    isGestureEnable={true}
                    isZoomEnable={true}
                />} */}
                {
                 person.profilePictureId && <ImageViewer HeaderComponent={()=>{
                    return <View style={{height:IS_ANDROID?heightPercentageToDP(6):heightPercentageToDP(12),display:'flex',flexDirection:'row',backgroundColor:'rgba(0, 0, 0, 0.37)',justifyContent:'flex-end',alignItems:'flex-end'}}>
                        <View style={{width:50,height:50,display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                        <NBIcon name='close' fontSize={20}  style={{ color: '#fff'}} onPress={this.onCancelFullImage} />
                        </View>
                    </View>
                }} visible={isVisbleFullImage} onRequestClose={this.onCancelFullImage} images={[{ id: person.profilePictureId }].map(image=>{
                        return {
                            ...image,uri: `${GET_PICTURE_BY_ID}${image.id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}`
                        }
                    })} imageIndex={0} />
                }
                <View style={{ flex: 1 }}>
                    <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={showOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                        <View>
                            <View style={APP_COMMON_STYLES.optionsContainer}>
                                <LinkButton style={APP_COMMON_STYLES.optionBtn} title='REMOVE FRIEND' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={() => this.openDeleteModal(false)} />
                                {person.isPassenger && <LinkButton style={APP_COMMON_STYLES.optionBtn} title='REMOVE AS PASSENGER' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={() => this.openDeleteModal(true)} />}
                            </View>
                            {showDeleteModal && <BaseModal containerStyle={{ justifyContent: 'center', alignItems: 'center' }} isVisible={showDeleteModal} onCancel={this.hideDeleteModal} >
                                <View style={styles.deleteBoxCont}>
                                    <DefaultText style={styles.deleteTitle}>{isPassenger ? `Remove Passenger` : `Remove Friend`}</DefaultText>
                                    <DefaultText numberOfLines={3} style={styles.deleteText}>{isPassenger ? `Are you sure you want to remove ${this.props.person.name} from your passenger’s list?` : `Are you sure you want to remove ${this.props.person.name} from your Road Crew ?`}</DefaultText>
                                    <View style={styles.btnContainer}>
                                        <BasicButton title='CANCEL' style={[styles.actionBtn, { backgroundColor: '#8D8D8D' }]} titleStyle={styles.actionBtnTxt} onPress={this.hideDeleteModal} />
                                        <BasicButton title='CONFIRM' style={styles.actionBtn} titleStyle={styles.actionBtnTxt} onPress={isPassenger ? this.removeFromPassengers : this.removeRoadBuddy} />
                                    </View>
                                </View>
                            </BaseModal>
                            }
                        </View>
                    </BaseModal>
                    <View style={styles.header}>
                        <IconButton iconProps={{ name: 'md-arrow-round-back', type: 'Ionicons', style: { fontSize: 27 } }}
                            style={styles.headerIconCont} onPress={this.popToPrevProfile} />
                        <View style={styles.titleContainer}>
                            <DefaultText style={styles.title} >{person.name}</DefaultText>
                            {person.nickname && <DefaultText style={styles.subTitle}>{person.nickname.toUpperCase()}</DefaultText>}
                        </View>
                        {
                            this.props.person.isFriend && this.state.activeTab === 'PROFILE'
                                ? <IconButton style={{ justifyContent: 'flex-end', marginRight: 17 }} iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 20 } }} onPress={this.showOptionsModal} />
                                : null
                        }
                    </View>
                    <Tabs onChangeTab={this.onChangeTab} tabBarPosition='bottom' tabContainerStyle={styles.bottomTabContainer} ref={elRef => this.tabsRef = elRef} tabBarActiveTextColor='#fff' tabBarInactiveTextColor='#fff' tabBarUnderlineStyle={{ height: 0 }}>
                        <Tab heading='PROFILE' tabStyle={[styles.inActiveTab, styles.borderRightWhite]} activeTabStyle={[styles.activeTab, styles.borderRightWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                            <View style={[styles.fill, { paddingBottom: APP_COMMON_STYLES.tabContainer.height }]}>
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <TouchableOpacity activeOpacity={1} onPress={person.profilePictureId ? this.showFullImage : null} style={styles.profilePic}>
                                        {person.profilePictureId
                                            ? <ImageBackground source={require('../../assets/img/profile-bg.png')} style={{ height: null, width: null, flex: 1, overflow: 'hidden' }}>
                                                <FitImage onLoadStart={this.showProfilePicLoader} onLoadEnd={this.hideProfilePicLoader} resizeMode='cover' source={{ uri: `${GET_PICTURE_BY_ID}${person.profilePictureId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}` }} />
                                            </ImageBackground>
                                            : <Image source={require('../../assets/img/profile-pic-placeholder.png')} style={{ height: null, width: null, flex: 1 }} />}
                                    </TouchableOpacity>
                                    <View style={styles.container}>
                                        <View style={{ flexDirection: 'column' }}>
                                            <DefaultText style={styles.labels}>LOCATION</DefaultText>
                                            <DefaultText style={styles.labelsData}>{person.homeAddress.city ? person.homeAddress.city : '__ '}, {person.homeAddress.state ? person.homeAddress.state : '__'}</DefaultText>
                                        </View>
                                        <View style={[styles.basicAlignment, styles.horizontalContainer]}>
                                            <View style={styles.individualComponent}>
                                                <DefaultText style={styles.labels}>DOB</DefaultText>
                                                <DefaultText style={styles.labelsData}>{person.dob ? getFormattedDateFromISO(new Date(person.dob).toISOString()) : '---'}</DefaultText>
                                            </View>
                                            <View style={styles.individualComponent}>
                                                <DefaultText style={[styles.labels, { paddingHorizontal: 9 }]}>YEARS RIDING</DefaultText>
                                                <DefaultText style={styles.labelsData}>{person.ridingSince ? new Date().getFullYear() - person.ridingSince : 0}</DefaultText>
                                            </View>
                                            <View style={styles.individualComponent}>
                                                <DefaultText style={styles.labels}>MEMBER SINCE</DefaultText>
                                                <DefaultText style={[styles.labelsData, { alignSelf: 'center' }]}>{new Date(person.dateOfRegistration).getFullYear()}</DefaultText>
                                            </View>
                                        </View>
                                        <View style={styles.clubContainer}>
                                            <DefaultText style={styles.labels}>CLUBS</DefaultText>
                                            <FlatList
                                                style={{ marginBottom: 9 }}
                                                data={person.clubs}
                                                keyExtractor={this.clubsKeyExtractor}
                                                renderItem={({ item, index }) => (
                                                    <View style={{ paddingVertical: 2 }}>
                                                        <DefaultText style={styles.labelsData}>{item.clubName}</DefaultText>
                                                    </View>
                                                )}
                                            />
                                        </View>
                                        {
                                            person.isFriend
                                                ? <View>
                                                    {
                                                        person.friendList.length > 0
                                                            ? <View style={{ marginTop: 19 }}>
                                                                <View style={styles.basicAlignment}>
                                                                    <TouchableOpacity activeOpacity={person.friendList.length === 0 ? 1 : 0.7} style={styles.basicAlignment} onPress={() => person.friendList.length > 0 && this.getBuddyFriendListPage()}>
                                                                        <DefaultText style={[styles.labelsData, { letterSpacing: 1.8, paddingRight: 8 }]}>Road Crew</DefaultText>
                                                                        <DefaultText style={[styles.labelsData, { letterSpacing: 1.8, color: '#F5891F' }]}>[see all]</DefaultText>
                                                                    </TouchableOpacity>
                                                                </View>
                                                                <View style={styles.greyBorder}>
                                                                    <FlatList
                                                                        style={{ flexDirection: 'column' }}
                                                                        numColumns={4}
                                                                        data={person.friendList.slice(0, 4)}
                                                                        keyExtractor={this.roadBuddiesKeyExtractor}
                                                                        renderItem={({ item, index }) => (
                                                                            <SmallCard
                                                                                placeholderImage={require('../../assets/img/profile-pic-placeholder.png')}
                                                                                image={item.profilePictureId ? `${GET_PICTURE_BY_ID}${item.profilePictureId}` : null}
                                                                                onPress={() => this.openRoadBuddy(item)}
                                                                                imageStyle={styles.imageStyle}
                                                                            />
                                                                        )}
                                                                    />
                                                                </View>
                                                            </View>
                                                            : null
                                                    }
                                                    {
                                                        person.passengerList.length > 0
                                                            ? <View style={{ marginTop: 19 }}>
                                                                <View style={styles.basicAlignment}>
                                                                    <TouchableOpacity activeOpacity={person.passengerList.length === 0 ? 1 : 0.7} style={styles.basicAlignment} onPress={() => person.passengerList.length > 0 && this.getBuddyPassengerListPage()}>
                                                                        <DefaultText style={[styles.labelsData, { letterSpacing: 1.8, paddingRight: 8 }]}>Passengers</DefaultText>
                                                                        <DefaultText style={[styles.labelsData, { letterSpacing: 1.8, color: '#F5891F' }]}>[see all]</DefaultText>
                                                                    </TouchableOpacity>
                                                                </View>
                                                                <View style={styles.greyBorder}>
                                                                    <FlatList
                                                                        style={{ flexDirection: 'column' }}
                                                                        numColumns={4}
                                                                        data={person.passengerList.slice(0, 4)}
                                                                        keyExtractor={this.passengerListKeyExtractor}
                                                                        renderItem={({ item, index }) => (
                                                                            <SmallCard
                                                                                placeholderImage={require('../../assets/img/profile-pic-placeholder.png')}
                                                                                image={item.profilePictureId ? `${GET_PICTURE_BY_ID}${item.profilePictureId}` : null}
                                                                                onPress={() => this.openPassengerProfile(item, index)}
                                                                                imageStyle={styles.imageStyle}
                                                                            />
                                                                        )}
                                                                    />
                                                                </View>
                                                            </View>
                                                            : null
                                                    }
                                                </View>
                                                : null
                                        }
                                    </View>
                                    <LinkButton style={styles.fullWidthContainer} onPress={this.openJournalPage}>
                                        <ImageBackground source={require('../../assets/img/my-journal.png')} style={styles.imgBG}>
                                                <DefaultText style={styles.txtOnImg}>The Road</DefaultText>
                                                <DefaultText style={[styles.txtOnImg,{marginTop:-50}]}>Stories From</DefaultText>
                                        </ImageBackground>
                                    </LinkButton>
                                    <LinkButton style={styles.fullWidthContainer} onPress={() => Actions.push(PageKeys.VEST)} >
                                        <ImageBackground source={require('../../assets/img/my-vest.png')} style={styles.imgBG}>
                                            <DefaultText style={styles.txtOnImg}>My Vest</DefaultText>
                                        </ImageBackground>
                                    </LinkButton>
                                    <TouchableOpacity style={styles.fullWidthContainer} onPress={() => Actions.push(PageKeys.BUDDY_ALBUM, { frienduserId: this.props.person.userId })}>
                                        <ImageBackground source={require('../../assets/img/my-photos.png')} style={styles.imgBG}>
                                            <DefaultText style={styles.txtOnImg}>Photos</DefaultText>
                                        </ImageBackground>
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                        </Tab>
                        <Tab heading='GARAGE' tabStyle={[styles.inActiveTab, styles.borderLeftWhite]} activeTabStyle={[styles.activeTab, styles.borderLeftWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                            <MyGarageTab isEditable={false} friend={this.props.person} />
                        </Tab>
                    </Tabs>
                </View>
            </BasePage>
        );
    }
}

const mapStateToProps = (state, props) => {
    const { user, userAuthToken, deviceToken } = state.UserAuth;
    const { hasNetwork, lastApi, isRetryApi } = state.PageState;
    return { user, userAuthToken, deviceToken, lastApi, isRetryApi, hasNetwork, person: getCurrentProfileState(state, props) };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        updateUser: (updates) => dispatch(updateUserAction(updates)),
        resetPersonProfilePic: () => dispatch(resetPersonProfilePicAction()),
        getSpaceList: (userId) => dispatch(getSpaceList(userId)),
        setBikeAsActive: (userId, spaceId, prevActiveIndex, index) => dispatch(setBikeAsActive(userId, spaceId, prevActiveIndex, index)),
        updateMyProfileLastOptions: (expanded) => dispatch(updateMyProfileLastOptionsAction({ expanded })),
        getRoadBuddies: (userId) => dispatch(getRoadBuddies(userId)),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
        getUserProfile: (userId, friendId) => getUserProfile(userId, friendId).then(res => {
            console.log('getUserProfile  : ', res.data)
            dispatch(apiLoaderActions(false));
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            dispatch(updateCurrentFriendAction(res.data));
        }).catch(er => {
            console.log(`getUserProfile error: `, er.response || er);
            dispatch(apiLoaderActions(false));
            handleServiceErrors(er, [userId, friendId], 'getUserProfile', false, true);
        }),
        getPassengersById: (userId, friendId, pageNumber, passengerList, successCallback, errorCallback) => dispatch(getPassengersById(userId, friendId, pageNumber, passengerList, successCallback, errorCallback)),
        getRoadBuddiesById: (userId, friendId, pageNumber, friendList, successCallback, errorCallback) => dispatch(getRoadBuddiesById(userId, friendId, pageNumber, friendList, successCallback, errorCallback)),
        goToPrevProfile: () => dispatch(goToPrevProfileAction()),
        resetPersonProfile: () => dispatch(resetPersonProfileAction()),
        changeScreen: (screenProps) => dispatch(screenChangeAction(screenProps)),
        doUnfriend: (userId, personId, passengerId, successCallback, errorCallback) => dispatch(doUnfriend(userId, personId, passengerId, successCallback, errorCallback)),
        deletePassenger: (passengerId, frienduserId, successCallback) => {
            dispatch(apiLoaderActions(true));
            deletePassenger(passengerId).then(res => {
                console.log("deletePassenger success: ", res.data);
                dispatch(apiLoaderActions(false));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                dispatch(removeFromPassengerListAction({ passengerId }));
                dispatch(updateCurrentFriendAction({ isPassenger: false, userId: frienduserId }));
                Actions.refresh({ passengerId: null });
                successCallback();
            }).catch(er => {
                console.log(`deletePassenger error: `, er.response || er);
                handleServiceErrors(er, [passengerId], 'deletePassenger', true, true);
                dispatch(apiLoaderActions(false));
            })
        },
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'friends_profile', isRetryApi: state })),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(FriendsProfile);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    rowContent: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    profileHeader: {
        position: 'absolute',
        zIndex: 50,
        width: '100%',
        height: heightPercentageToDP(6),
        flexDirection: 'row',
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
    title: {
        fontSize: 20,
        color: '#FFFFFF',
        backgroundColor: 'transparent',
        letterSpacing: 0.8,
        fontFamily: CUSTOM_FONTS.gothamBold
    },
    subTitle: {
        color: '#C4C4C4',
        fontSize: 12,
        letterSpacing: 1.08,
        fontFamily: CUSTOM_FONTS.gothamBold,
    },
    profilePicBtmBorder: {
        width: '100%',
        height: 13
    },
    profilePic: {
        height: 255,
        width: WindowDimensions.width
    },
    container: {
        marginHorizontal: 27,
        marginTop: 26
    },
    basicAlignment: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    horizontalContainer: {
        borderTopWidth: 1,
        borderColor: '#0090b1',
        marginTop: heightPercentageToDP(2),
        height: 47,
    },
    individualComponent: {
        borderRightWidth: 1,
        borderColor: '#0090b1',
        alignItems: 'center',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-evenly'
    },
    clubContainer: {
        flexDirection: 'column',
        marginTop: 17,
        borderBottomWidth: 1,
        borderBottomColor: '#B1B1B1',
    },
    labels: {
        letterSpacing: 1.6,
        fontSize: 8,
        color: '#707070',
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
    },
    labelsData: {
        color: '#000',
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        fontSize: 12,
        paddingBottom: 7
    },
    scrollBottomContent: {
        flex: 1
    },
    accordionHeader: {
        backgroundColor: 'transparent',
        marginHorizontal: widthPercentageToDP(10),
        borderBottomWidth: 1,
        borderBottomColor: '#000'
    },
    horizontalScroll: {
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
    },

    //  new Design styles
    header: {
        height: APP_COMMON_STYLES.headerHeight,
        backgroundColor: APP_COMMON_STYLES.headerColor,
        flexDirection: 'row',
        elevation: 30,
        shadowOffset: { width: 0, height: 8 },
        shadowColor: '#000000',
        shadowOpacity: 0.9,
        shadowRadius: 5,
        zIndex: 999
    },
    titleContainer: {
        flex: 1,
        flexDirection: 'column',
        marginLeft: 17,
        justifyContent: 'center',
        alignSelf: 'center'
    },
    clubList: {
        marginHorizontal: widthPercentageToDP(1),
        paddingTop: widthPercentageToDP(1),
    },
    imgBG: {
        width: widthPercentageToDP(100),
        height: heightPercentageToDP(30),
        justifyContent: 'center',
        paddingLeft: 20
    },
    fullWidthContainer: {
        flex: 1,
        marginTop: 20,
        borderTopWidth: 9,
        borderTopColor: '#f69039',
        elevation: 20,
    },
    addBtnCont: {
        height: 18,
        width: 18,
        borderRadius: 9,
        backgroundColor: '#a8a8a8',
        marginRight: 10
    },
    txtOnImg: {
        marginLeft:20,
        color: '#fff',
        fontSize: 18,
        letterSpacing: 2.7,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        marginTop:-40
    },
    greyBorder: {
        borderTopWidth: 13,
        borderTopColor: '#DCDCDE'
    },
    imageStyle: {
        marginRight: widthPercentageToDP(1.8),
        height: widthPercentageToDP(100 / 5),
        width: widthPercentageToDP(100 / 5)
    },
    bottomTabContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: APP_COMMON_STYLES.tabContainer.height
    },
    bottomTab: {
        height: APP_COMMON_STYLES.tabContainer.height,
        alignItems: 'center',
        justifyContent: 'center',
        width: widthPercentageToDP(50),

    },
    activeTab: {
        backgroundColor: '#000000'
    },
    inActiveTab: {
        backgroundColor: '#0083CA'
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
});