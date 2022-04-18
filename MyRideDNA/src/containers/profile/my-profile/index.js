import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, ImageBackground, Image, FlatList, ScrollView, RefreshControl, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { PageKeys, widthPercentageToDP, heightPercentageToDP, APP_COMMON_STYLES, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, CUSTOM_FONTS, GET_PICTURE_BY_ID, IS_ANDROID } from '../../../constants/index';
import { IconButton, LinkButton } from '../../../components/buttons';
import { screenChangeAction, setCurrentFriendAction } from '../../../actions';
import { getRoadBuddies, getMyWallet, getPassengerList, getUser } from '../../../api';
import { SmallCard } from '../../../components/cards';
import { getFormattedDateFromISO } from '../../../util';
import { DefaultText } from '../../../components/labels';
import { BaseModal, GesturedCarouselModal } from '../../../components/modal';
import FitImage from 'react-native-fit-image';
import ProfilePlaceholder from '../../../assets/img/Profile-Placeholder.svg'
import { CountComponent } from '../../../components/count';
import ImageViewer from 'react-native-image-viewing'
import { Icon as NBIcon } from 'native-base'


class MyProfileTab extends Component {
    profilePicture = null;
    constructor(props) {
        super(props);
        this.state = {
            isLoadingUpdates: false,
            showOptionsModal: false,
            isVisbleFullImage: false,
        };
    }

    componentWillMount() {
        this.props.getRoadBuddies(this.props.user.userId);
        this.props.getMyWallet(this.props.user.userId);
        this.props.getPassengerList(this.props.user.userId, 0, 10, (res) => { }, (err) => { });
    }

    async componentDidMount() {
        this.props.getUser(this.props.user.userId);
    }

    fetchUserUpdates = () => {
        this.props.getUser(this.props.user.userId, this.userUpdatesSuccessCallback, this.userUpdatesErrorCallback);
    }

    userUpdatesSuccessCallback = () => this.setState({ isLoadingUpdates: false });

    userUpdatesErrorCallback = () => this.setState({ isLoadingUpdates: false });

    clubsKeyExtractor = (item) => item.clubId;

    roadBuddiesKeyExtractor = (item) => item.userId;

    passengerListKeyExtractor = (item) => item.passengerId;

    onPressFriendsPage = () => {
        store.dispatch(screenChangeAction({ name: PageKeys.FRIENDS, params: { comingFrom: PageKeys.PROFILE } }));
    }

    openPassengerProfile = (item, index) => {
        if (item.isFriend) {
            this.openRoadBuddy(item.passengerUserId, item.passengerId);
        }
        else {
            Actions.push(PageKeys.PASSENGER_PROFILE, { passengerId: item.passengerId, onPassenger: true });
        }
    }

    openRoadBuddy = (userId, passengerId = null) => {
        this.props.setCurrentFriend({ userId });
        Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: userId, passengerId });
    }

    openJournalPage = () => Actions.push(PageKeys.JOURNAL, { isEditable: true, personId: this.props.user.userId });

    showOptionsModal = () => this.setState({ showOptionsModal: true });

    hideOptionsModal = () => this.setState({ showOptionsModal: false });

    openEditProfilePage = () => {
        this.setState(prevState => ({ showOptionsModal: false }), () => Actions.push(PageKeys.EDIT_PROFILE_FORM))
    }

    showFullImage = () => this.setState({ isVisbleFullImage: true });

    onCancelFullImage = () => this.setState({ isVisbleFullImage: false });

    render() {
        const { user, allFriends, passengerList } = this.props;
        const { isLoadingUpdates, showOptionsModal, isVisbleFullImage } = this.state;
        return (
            <View style={styles.fill}>
                {/* {user.profilePictureId && <GesturedCarouselModal
                    isVisible={isVisbleFullImage}
                    onCancel={this.onCancelFullImage}
                    pictureIds={[{ id: user.profilePictureId }]}
                    isGestureEnable={true}
                    isZoomEnable={true}
                />} */}
                {
                 user.profilePictureId && <ImageViewer HeaderComponent={()=>{
                    return <View style={{height:IS_ANDROID?heightPercentageToDP(6):heightPercentageToDP(10),display:'flex',backgroundColor:'rgba(0, 0, 0, 0.37)',flexDirection:'row',justifyContent:'flex-end',alignItems:'flex-end',}}>
                        <View style={{width:50,height:50,display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                        <NBIcon name='close' fontSize={20}  style={{ color: '#fff'}} onPress={this.onCancelFullImage} />
                        </View>
                    </View>
                }} visible={isVisbleFullImage} onRequestClose={this.onCancelFullImage} images={[{ id: user.profilePictureId }].map(image=>{
                        return {
                            ...image,uri: `${GET_PICTURE_BY_ID}${image.id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}`
                        }
                    })} imageIndex={0} />
                }
                <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={showOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                    <View style={APP_COMMON_STYLES.optionsContainer}>
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='EDIT PROFILE' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openEditProfilePage} />
                    </View>
                </BaseModal>
                <View style={styles.header}>
                    <IconButton iconProps={{ name: 'ios-notifications', type: 'Ionicons', style: { fontSize: 26 } }}
                        style={styles.headerIconCont} onPress={() => Actions.push(PageKeys.NOTIFICATIONS)} />
                         {
                            this.props.notificationCount>0?
                                    <CountComponent notificationCount={this.props.notificationCount} left={43} />:null
                        }
                    <View style={styles.titleContainer}>
                        <DefaultText style={styles.title} >{user.name}</DefaultText>
                        <DefaultText style={styles.subTitle}>{user.nickname ? user.nickname.toUpperCase() : null}</DefaultText>
                    </View>
                    <IconButton style={{ justifyContent: 'flex-end', marginRight: 17 }} iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 20 } }} onPress={this.showOptionsModal} />
                </View>
                <ScrollView
                    keyboardShouldPersistTaps={'handled'}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: APP_COMMON_STYLES.tabContainer.height }}
                    refreshControl={<RefreshControl refreshing={isLoadingUpdates} onRefresh={this.fetchUserUpdates} />}
                >
                    <TouchableOpacity activeOpacity={1} onPress={user.profilePictureId ? this.showFullImage : null} style={styles.profilePic}>
                        {
                            user.profilePictureId
                                ? <ImageBackground source={require('../../../assets/img/profile-bg.png')} style={{ height: null, width: null, flex: 1, overflow: 'hidden' }}>
                                    <FitImage  resizeMode='contain' style={{height:310, width:widthPercentageToDP(100)}} source={{ uri: `${GET_PICTURE_BY_ID}${user.profilePictureId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}` }} />
                                </ImageBackground>                 
                                : <ProfilePlaceholder />
                                // <Image source={require('../../../assets/img/profile-pic-placeholder.png')} style={{ height: null, width: null, flex: 1 }} />
                        }
                    </TouchableOpacity>
                    {/* <ProfilePlaceholder /> */}
                    <View style={{ height: 13 }}>
                        <ImageBackground source={require('../../../assets/img/profile-bg.png')} style={{ height: null, width: null, flex: 1, overflow: 'hidden' }} />
                    </View>
                    <View style={styles.container}>
                        <View style={styles.basicAlignment}>
                            <View style={{ flexDirection: 'column' }}>
                                <DefaultText style={styles.labels}>LOCATION</DefaultText>
                                <DefaultText style={styles.labelsData}>{user.homeAddress.city ? user.homeAddress.city : '__ '}, {user.homeAddress.state ? user.homeAddress.state : '__'}</DefaultText>
                            </View>
                        </View>
                        <View style={[styles.basicAlignment, styles.horizontalContainer]}>
                            <View style={styles.individualComponent}>
                                <DefaultText style={styles.labels}>DOB</DefaultText>
                                <DefaultText style={styles.labelsData}>{user.dob ? getFormattedDateFromISO(new Date(user.dob).toISOString()) : '---'}</DefaultText>
                            </View>
                            <View style={styles.individualComponent}>
                                <DefaultText style={[styles.labels, { paddingHorizontal: 9 }]}>YEARS RIDING</DefaultText>
                                <DefaultText style={styles.labelsData}>{user.ridingSince ? new Date().getFullYear() - user.ridingSince : '0'}</DefaultText>
                            </View>
                            <View style={styles.individualComponent}>
                                <DefaultText style={styles.labels}>MEMBER SINCE</DefaultText>
                                <DefaultText style={[styles.labelsData, { alignSelf: 'center' }]}>{new Date(user.dateOfRegistration).getFullYear()}</DefaultText>
                            </View>
                        </View>
                        <View style={styles.clubContainer}>
                            <DefaultText style={styles.labels}>CLUBS</DefaultText>
                            <FlatList
                                style={{ marginBottom: 9 }}
                                data={user.clubs ? user.clubs : []}
                                keyExtractor={this.clubsKeyExtractor}
                                renderItem={({ item, index }) => (
                                    <View style={{ paddingVertical: 2 }}>
                                        <DefaultText style={styles.labelsData}>{item.clubName}</DefaultText>
                                    </View>
                                )}
                            />
                        </View>
                        <View style={{ marginTop: 19 }}>
                            <View style={styles.basicAlignment}>
                                <TouchableOpacity activeOpacity={allFriends.length === 0 ? 1 : 0.7} style={styles.basicAlignment} onPress={allFriends.length > 0 ? this.onPressFriendsPage : null}>
                                    <DefaultText style={[styles.labelsData, { letterSpacing: 1.8, paddingRight: 8 }]}>Road Crew</DefaultText>
                                    {allFriends.length > 0 && <DefaultText style={[styles.labelsData, { letterSpacing: 1.8, color: '#F5891F' }]}>[see all]</DefaultText>}
                                </TouchableOpacity>
                                <IconButton style={styles.addBtnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: 10, color: '#fff' } }} onPress={() => Actions.push(PageKeys.CONTACTS_SECTION)} />
                            </View>
                            {
                                allFriends.length > 0
                                    ?
                                    <View style={styles.greyBorder}>
                                        <FlatList
                                            style={{ flexDirection: 'column' }}
                                            numColumns={4}
                                            data={allFriends.slice(0, 4)}
                                            keyExtractor={this.roadBuddiesKeyExtractor}
                                            renderItem={({ item, index }) => (
                                                <SmallCard
                                                    placeholderImage={require('../../../assets/img/profile-pic-placeholder.png')}
                                                    image={item.profilePictureId ? `${GET_PICTURE_BY_ID}${item.profilePictureId}` : null}
                                                    onPress={() => this.openRoadBuddy(item.userId)}
                                                    imageStyle={styles.imageStyle}
                                                />
                                            )}
                                        />

                                    </View>
                                    : null
                            }
                        </View>
                        <View style={{ marginTop: 19 }}>
                            <View style={styles.basicAlignment}>
                                <TouchableOpacity activeOpacity={passengerList.length === 0 ? 1 : 0.7} style={styles.basicAlignment} onPress={() => passengerList.length > 0 && Actions.push(PageKeys.PASSENGERS)}>
                                    <DefaultText style={[styles.labelsData, { letterSpacing: 1.8, paddingRight: 8 }]}>Passengers</DefaultText>
                                    {passengerList.length > 0 && <DefaultText style={[styles.labelsData, { letterSpacing: 1.8, color: '#F5891F' }]}>[see all]</DefaultText>}
                                </TouchableOpacity>
                                <IconButton style={styles.addBtnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: 10, color: '#fff' } }} onPress={() => Actions.push(PageKeys.PASSENGER_FORM, { passengerIdx: -1 })} />
                            </View>
                            {
                                passengerList.length > 0
                                    ?
                                    <View style={styles.greyBorder}>
                                        <FlatList
                                            style={{ flexDirection: 'column' }}
                                            numColumns={4}
                                            data={passengerList.slice(0, 4)}
                                            keyExtractor={this.passengerListKeyExtractor}
                                            renderItem={({ item, index }) => (
                                                <SmallCard
                                                    placeholderImage={require('../../../assets/img/profile-pic-placeholder.png')}
                                                    image={item.profilePictureId ? `${GET_PICTURE_BY_ID}${item.profilePictureId}` : null}
                                                    onPress={() => this.openPassengerProfile(item, index)}
                                                    imageStyle={styles.imageStyle}
                                                />
                                            )}
                                        />
                                    </View>
                                    : null
                            }
                        </View>
                    </View>
                    <TouchableOpacity style={styles.fullWidthContainer} onPress={() => Actions.push(PageKeys.MY_WALLET_FORM)}>
                        <ImageBackground source={require('../../../assets/img/my-wallet.png')} style={styles.imgBG}>
                            <DefaultText style={styles.txtOnImg}>My Wallet</DefaultText>
                        </ImageBackground>
                    </TouchableOpacity>
                    <LinkButton style={styles.fullWidthContainer} onPress={this.openJournalPage}>
                        <ImageBackground source={require('../../../assets/img/my-journal.png')} style={styles.imgBG}>
                            <DefaultText style={styles.txtOnImg}>The Road</DefaultText>
                            <DefaultText style={[styles.txtOnImg,{marginTop:-50}]}>Stories From</DefaultText>
                        </ImageBackground>
                    </LinkButton>
                    <TouchableOpacity style={styles.fullWidthContainer} onPress={() => Actions.push(PageKeys.VEST)}>
                        <ImageBackground source={require('../../../assets/img/my-vest.png')} style={styles.imgBG}>
                            <DefaultText style={styles.txtOnImg}>My Vest</DefaultText>
                        </ImageBackground>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.fullWidthContainer} onPress={() => Actions.push(PageKeys.ALBUM)}>
                        <ImageBackground source={require('../../../assets/img/my-photos.png')} style={styles.imgBG}>
                            <DefaultText style={styles.txtOnImg}>My Photos</DefaultText>
                        </ImageBackground>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { allFriends } = state.FriendList;
    const { passengerList } = state.PassengerList;
    const notificationCount=state.NotificationList.notificationList.totalUnseen
    return { user, allFriends, passengerList,notificationCount };
}
const mapDispatchToProps = (dispatch) => {
    return {
        getRoadBuddies: (userId) => dispatch(getRoadBuddies(userId)),
        getMyWallet: (userId) => dispatch(getMyWallet(userId)),
        getPassengerList: (userId, pageNumber, preference, successCallback, errorCallback) => dispatch(getPassengerList(userId, pageNumber, preference, successCallback, errorCallback)),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
        getUser: (userId, successCallback, errorCallback) => dispatch(getUser(userId, successCallback, errorCallback)),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(MyProfileTab);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
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
        marginHorizontal: 17,
        justifyContent: 'center',
        alignSelf: 'center'
    },
    container: {
        marginHorizontal: 27,
        marginTop: 26
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
        fontFamily: CUSTOM_FONTS.gothamBold
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
    profilePic: {
        width: widthPercentageToDP(100),
        height: 255,
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
        borderTopWidth: 12,
        borderTopColor: '#f69039',
        elevation: 20,
    },
    addBtnCont: {
        height: 14,
        width: 14,
        borderRadius: 7,
        backgroundColor: '#a8a8a8',
        marginRight: 10
    },
    greyBorder: {
        borderTopWidth: 13,
        borderTopColor: '#DCDCDE'
    },
    txtOnImg: {
        marginLeft:20,
        color: '#fff',
        fontSize: 18,
        letterSpacing: 2.7,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        marginTop:-40
    },
    imageStyle: {
        marginRight: widthPercentageToDP(1.8),
        height: widthPercentageToDP(100 / 5),
        width: widthPercentageToDP(100 / 5)
    }
});