import React, { Component } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Animated, Easing } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { heightPercentageToDP, APP_COMMON_STYLES, widthPercentageToDP, PageKeys, CUSTOM_FONTS, RELATIONSHIP, GET_PICTURE_BY_ID, NOTIFICATION_TYPE } from '../../constants';
import { ListItem, Left, Right } from 'native-base';
import { IconButton, ImageButton, LinkButton } from '../../components/buttons';
import { screenChangeAction, deleteNotificationsAction, setCurrentFriendAction, clearNotificationListAction } from '../../actions';
import { connect } from 'react-redux';
import { getAllNotifications, readNotification, seenNotification, deleteNotifications, cancelFriendRequest, approveFriendRequest, rejectFriendRequest } from '../../api';
import store from '../../store';
import { SearchBoxFilter } from '../../components/inputs';
import { DefaultText } from '../../components/labels';
import { BaseModal } from '../../components/modal';
import { BasePage } from '../../components/pages';
import AddFriendBlack from '../../assets/img/Add-Person-Black.svg';
import AddFriendGray from '../../assets/img/Add-Person-Gray.svg';

const FILTERED_ACTION_IDS = {
    ALL_NOTIFICATION: 'all-notification',
    ALL_REQUEST: 'all-request',
    ALL_REQUEST_ENABLED: 'all-request-enabled',
    GROUP: 'group',
    GROUP_ENABLED: 'group-enabled',
}

class Notifications extends Component {
    _postType = 'post';
    _rideType = 'ride';
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            spinValue: new Animated.Value(0),
            searchQuery: '',
            notificationFilter: FILTERED_ACTION_IDS.ALL_NOTIFICATION,
            isFilter: FILTERED_ACTION_IDS.ALL_NOTIFICATION,
            pageNumber: 0,
            showOptionsModal: false,
            currentNotification: null,
            hasRemainingList: false,
        }
    }

    componentDidMount() {
        this.props.getAllNotifications(this.props.user.userId, this.state.pageNumber, new Date().toISOString(), 'notification', (res) => {
            if (res.notification.length > 0) {
                this.setState({ pageNumber: this.state.pageNumber + 1, hasRemainingList: res.remainingList > 0 })
            }
        }, (err) => { });
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.comingFrom === PageKeys.NOTIFICATIONS) {
            if (!prevProps.notificationBody || prevProps.notificationBody.id !== this.props.notificationBody.id) {
                this.props.getAllNotifications(this.props.user.userId, 0, new Date().toISOString(), 'notification', (res) => {
                    if (res.notification.length > 0) {
                        this.setState({ pageNumber: this.state.pageNumber + 1, hasRemainingList: res.remainingList > 0 })
                    }
                }, (err) => { });
            }
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
                this.props.getAllNotifications(this.props.user.userId, 0, new Date().toISOString(), (res) => {
                    this.setState({ hasRemainingList: res.remainingList > 0 });
                }, (err) => { });
            }
        });
    }

    cancelingFriendRequest = (item) => {
        this.props.cancelRequest(this.props.user.userId, item.fromUserId, item.id);
        this.hideOptionsModal();
    }

    approvingFriendRequest = (item) => {
        this.props.approvedRequest(this.props.user.userId, item.fromUserId, new Date().toISOString(), item.id);
        this.hideOptionsModal();
    }

    rejectingFriendRequest = (item) => {
        this.props.rejectRequest(this.props.user.userId, item.fromUserId, item.id);
        this.hideOptionsModal();
    }

    onPressBackButton = () => Actions.pop();

    openCommentPage(item) {
        Actions.push(PageKeys.COMMENTS, {
            postId: item.reference.tragetId, isEditable: true, postType:item.reference.targetScreen === 'RIDE_DETAILS'? this._rideType:this._postType,post:item
        });
    }

    openLikesPage(id) { Actions.push(PageKeys.LIKES, { hasNetwork: this.props.hasNetwork, id: id, type: this._postType }); }

    onPressnotification = (item) => {
        if (item.notificationType === NOTIFICATION_TYPE.GROUP) {
            if (item.reference && item.reference.targetScreen) {
                store.dispatch(screenChangeAction({ name: PageKeys[item.reference.targetScreen], params: { comingFrom: 'notificationPage', notificationBody: item } }));
            } else {
                this.props.readNotification(this.props.user.userId, item.id)
            }
        } else if (item.notificationType === NOTIFICATION_TYPE.COMMENT) {

            // store.dispatch(screenChangeAction({ name: PageKeys[item.reference.targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: item, isEditable: true } }));
            store.dispatch(screenChangeAction({ name: PageKeys[item.reference.targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: {...item, tragetId:item.reference.tragetId}, isEditable: true } }));
        }
        else if(item.notificationType === NOTIFICATION_TYPE.LIKE){
            store.dispatch(screenChangeAction({ name: PageKeys[item.reference.targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: {...item, tragetId:item.reference.tragetId}, isEditable: true } }));
        }
        else if (item.notificationType === RELATIONSHIP.RECIEVED_REQUEST || item.notificationType === RELATIONSHIP.SENT_REQUEST) {
            Actions.push(PageKeys.PASSENGER_PROFILE, { isUnknown: true, person: { ...item, userId: item.fromUserId } })
        }
        else if (item.notificationType === RELATIONSHIP.ACCEPT_REQUEST) {
            this.props.setCurrentFriend({ userId: item.fromUserId });
            Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: item.fromUserId })
        }
    }

    _keyExtractor = item => item.id;

    deleteNotification = (item) => {
        this.props.deleteNotification(item.id);
        this.hideOptionsModal()
    }

    getDateAndTime = (item) => {
        var dateFormat = { day: 'numeric', year: '2-digit', month: 'short' };
        return new Date(item.date).toLocaleDateString('en-IN', dateFormat);
    }

    getFormattedDate = (dateTime) => {
        var dateFirst = new Date();
        var dateSecond = new Date(dateTime);
        var timeDiff = Math.abs(dateSecond.getTime() - dateFirst.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if (new Date(dateTime).toLocaleDateString() === new Date().toLocaleDateString()) {
            const time = new Date(dateTime).toTimeString().substring(0, 5).split(':');
            let period = time[0] < 12 ? 'AM' : 'PM';
            if (time[0] > 12) {
                time[0] = time[0] - 12;
            }
            return `${time.join(':')} ${period}`;
        }
        else if (diffDays > 0 && diffDays < 7) {
            return `${diffDays} day ago`
        }
        else {
            return `${Math.floor(diffDays / 7)} week ago`
        }
    }

    getBodyContent = (item) => {
        if (item.notificationType === RELATIONSHIP.SENT_REQUEST) {
            return <TouchableOpacity style={styles.bodyCont} onPress={() => this.onPressnotification(item)}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.message}>you sent </Text><Text style={styles.name}>{item.fromUserName + ' '}</Text><Text style={styles.message}>a friend request</Text>
                </View>
                <DefaultText style={styles.notificationTime}>{item.date ? this.getFormattedDate(item.date) : null}</DefaultText>
            </TouchableOpacity>
        }
        else {
            return <TouchableOpacity style={styles.bodyCont} onPress={() => this.onPressnotification(item)}>
                <Text style={styles.name}>{item.fromUserName + ' '}<Text style={styles.message}>{item.message}</Text></Text>
                <DefaultText style={styles.notificationTime}>{item.date ? this.getFormattedDate(item.date) : null}</DefaultText>
            </TouchableOpacity>
        }
    }

    openFriendsProfile = (item) => {
        if (item.isFriend) {
            this.props.setCurrentFriend({ userId: item.fromUserId });
            Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: item.fromUserId });
        }
        else {
            Actions.push(PageKeys.PASSENGER_PROFILE, { isUnknown: true, person: { ...item, userId: item.fromUserId } })
        }
    }

    _renderItem = ({ item, index }) => {
        return (
            <ListItem noIndent style={styles.itemCont} >
                <Left style={styles.leftCont}>
                    {
                        item.profilPictureId
                            ? <ImageButton pictureStyle={{ resizeMode: null }} imgStyles={styles.iconContComm} imageSrc={{ uri: `${GET_PICTURE_BY_ID}${item.profilPictureId}` }} onPress={() => this.openFriendsProfile(item)} />
                            : <IconButton disabled style={[styles.iconContComm, styles.userIconCont]} iconProps={{ name: 'user', type: 'FontAwesome', style: styles.iconComm }} onPress={() => this.openFriendsProfile(item)} />
                    }
                    {
                        this.getBodyContent(item)
                    }

                </Left>
                <Right style={styles.rightCont}>
                    <IconButton iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#B4B4B4', fontSize: 20, marginRight: 20 } }} onPress={() => this.showOptionsModal(item)} />
                </Right>
            </ListItem>
        );
    }

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.pageNumber === 0 || this.state.isLoading === true || distanceFromEnd < 0) return;
        this.setState((prevState) => ({ isLoading: true }), () => {
            this.props.getAllNotifications(this.props.user.userId, this.state.pageNumber, this.props.notificationList.notification[this.props.notificationList.notification.length - 1].date, (res) => {
                if (res.notification.length > 0) {
                    this.setState({ pageNumber: this.state.pageNumber + 1, hasRemainingList: res.remainingList > 0 })
                }
                this.setState({ isLoading: false })
            }, (er) => {
                this.setState({ isLoading: false })
            });
        });
    }

    onChangeSearchValue = (val) => this.setState({ searchQuery: val });

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

    allNotifications = () => {
        if (this.state.isFilter === FILTERED_ACTION_IDS.ALL_NOTIFICATION) {
            this.setState({ notificationFilter: [], isFilter: null })
        } else {
            this.setState({ notificationFilter: FILTERED_ACTION_IDS.ALL_NOTIFICATION, isFilter: FILTERED_ACTION_IDS.ALL_NOTIFICATION })
        }
    }

    filterGroup = () => {
        if (this.state.isFilter === FILTERED_ACTION_IDS.GROUP_ENABLED) {
            this.setState({ notificationFilter: FILTERED_ACTION_IDS.ALL_NOTIFICATION, isFilter: null })
        }
        else {
            this.setState({ notificationFilter: FILTERED_ACTION_IDS.GROUP, isFilter: FILTERED_ACTION_IDS.GROUP_ENABLED })
        }
    }

    filterAllRequest = () => {
        if (this.state.isFilter === FILTERED_ACTION_IDS.ALL_REQUEST_ENABLED) {
            this.setState({ notificationFilter: FILTERED_ACTION_IDS.ALL_NOTIFICATION, isFilter: null })
        }
        else {
            this.setState({ notificationFilter: FILTERED_ACTION_IDS.ALL_REQUEST, isFilter: FILTERED_ACTION_IDS.ALL_REQUEST_ENABLED })
        }
    }

    showOptionsModal = (item) => this.setState({ currentNotification: item, showOptionsModal: true });

    hideOptionsModal = () => this.setState({ showOptionsModal: false });

    renderOptions = () => {
        switch (this.state.currentNotification && this.state.currentNotification.notificationType) {
            case RELATIONSHIP.RECIEVED_REQUEST: return <View>
                <LinkButton style={APP_COMMON_STYLES.optionBtn} title='ACCEPT REQUEST' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={() => this.approvingFriendRequest(this.state.currentNotification)} />
                <LinkButton style={APP_COMMON_STYLES.optionBtn} title='REJECT REQUEST' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={() => this.rejectingFriendRequest(this.state.currentNotification)} />
                <LinkButton style={APP_COMMON_STYLES.optionBtn} title='REMOVE NOTIFICATION' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={() => this.deleteNotification(this.state.currentNotification)} />
            </View>
            case RELATIONSHIP.SENT_REQUEST: return <View>
                <LinkButton style={APP_COMMON_STYLES.optionBtn} title='CANCEL REQUEST' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={() => this.cancelingFriendRequest(this.state.currentNotification)} />
                <LinkButton style={APP_COMMON_STYLES.optionBtn} title='REMOVE NOTIFICATION' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={() => this.deleteNotification(this.state.currentNotification)} />
            </View>
            default: return <View>
                <LinkButton style={APP_COMMON_STYLES.optionBtn} title='REMOVE NOTIFICATION' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={() => this.deleteNotification(this.state.currentNotification)} />
            </View>
        }
    }

    componentWillUnmount() {
        this.props.clearNotificationList();
    }

    render() {
        const { notificationList, showLoader, hasNetwork } = this.props;
        const { searchQuery, notificationFilter, showOptionsModal } = this.state;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        let filteredNotification = [];
        if (notificationFilter === FILTERED_ACTION_IDS.ALL_NOTIFICATION) {
            filteredNotification = searchQuery === '' ? notificationList.notification : notificationList.notification.filter(notification => {
                return (notification.fromUserName.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1)
            });
        }
        else if (notificationFilter === FILTERED_ACTION_IDS.ALL_REQUEST) {
            const allRequests = notificationList.notification.filter(notification => notification.notificationType === 'sentRequest' || notification.notificationType === 'receivedRequest');
            filteredNotification = searchQuery === '' ? allRequests : allRequests.filter(notification => {
                return (notification.fromUserName.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1)
            });
        }
        else if (notificationFilter === FILTERED_ACTION_IDS.GROUP) {
            const groups = notificationList.notification.filter(notification => notification.notificationType === 'group');
            filteredNotification = searchQuery === '' ? groups : groups.filter(notification => {
                return (notification.fromUserName.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1)
            });
        }
        return (
            <BasePage heading={'Notifications'} headerLeftIconProps={this.props.currentScreen.name === PageKeys.NOTIFICATIONS ? null : { reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }} showLoader={showLoader} rootContainerSafePadding={20}>
                <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={showOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                    <View style={APP_COMMON_STYLES.optionsContainer}>{this.renderOptions()}</View>
                </BaseModal>
                <View style={{ marginHorizontal: widthPercentageToDP(8) }}>
                    <SearchBoxFilter
                        searchQuery={searchQuery} onChangeSearchValue={this.onChangeSearchValue}
                        placeholder='Name'
                        footer={<View style={styles.filterContainer}>
                            <IconButton iconProps={{ name: 'ios-notifications', type: 'Ionicons', style: { color: this.state.isFilter === FILTERED_ACTION_IDS.ALL_NOTIFICATION ? '#000000' : '#C4C6C8', fontSize: 30 } }} onPress={() => this.allNotifications()} />
                            <TouchableOpacity onPress={() => this.filterAllRequest()}>
                                {
                                    this.state.isFilter === FILTERED_ACTION_IDS.ALL_REQUEST_ENABLED
                                    ? <AddFriendBlack/> 
                                    : <AddFriendGray/>
                                }
                            </TouchableOpacity>
                            <ImageButton imageSrc={this.state.isFilter === FILTERED_ACTION_IDS.GROUP_ENABLED ? require('../../assets/img/group-icon-dark.png') : require('../../assets/img/group-icon.png')} imgStyles={[styles.filterImage, { height: 28, width: 29 }]} onPress={() => this.filterGroup()} />
                        </View>}
                    />
                </View>
                {
                   notificationList.notification.length>0? 
                <FlatList
                    contentContainerStyle={{ paddingBottom: this.state.hasRemainingList ? 100 : 60 }}
                    keyboardShouldPersistTaps={'handled'}
                    data={filteredNotification}
                    extraData={this.state}
                    keyExtractor={this._keyExtractor}
                    renderItem={this._renderItem}
                    ListFooterComponent={this.renderFooter}
                    onEndReached={this.loadMoreData}
                    onEndReachedThreshold={0.1}
                />:null
                }
                {
                    this.props.hasNetwork === false && notificationList.notification.length === 0 && <View style={{ flexDirection: 'column', justifyContent: 'space-between', position: 'absolute', top: heightPercentageToDP(35), left: widthPercentageToDP(27), height: 100, }}>
                        <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                        <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                    </View>
                }
            </BasePage>
        );
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { notificationList, isLoading } = state.NotificationList;
    const { showLoader, pageNumber, hasNetwork, currentScreen } = state.PageState;
    return { user, currentScreen, notificationList, pageNumber, isLoading, showLoader, hasNetwork };
}
const mapDispatchToProps = (dispatch) => {
    return {
        readNotification: (userId, notificationId) => dispatch(readNotification(userId, notificationId)),
        getAllNotifications: (userId, pageNumber, date, comingFrom, successCallback, errorCallback) => dispatch(getAllNotifications(userId, pageNumber, date, comingFrom, successCallback, errorCallback)),
        seenNotification: (userId) => dispatch(seenNotification(userId)),
        deleteNotification: (notificationIds) => dispatch(deleteNotifications(notificationIds)),
        cancelRequest: (userId, personId, notificationIds) => dispatch(cancelFriendRequest(userId, personId, (res) => {
            dispatch(deleteNotificationsAction({ notificationIds }));
        }, (error) => { })),
        approvedRequest: (userId, personId, actionDate, notificationIds) => dispatch(approveFriendRequest(userId, personId, actionDate, (res) => {
            dispatch(deleteNotificationsAction({ notificationIds }));
        }, (error) => { })),
        rejectRequest: (userId, personId, notificationIds) => dispatch(rejectFriendRequest(userId, personId, (res) => {
            dispatch(deleteNotificationsAction({ notificationIds }));
        }, (error) => { })),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
        clearNotificationList: () => dispatch(clearNotificationListAction()),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Notifications);

const styles = StyleSheet.create({
    name: {
        fontSize: 14,
        color: '#1D527C',
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    message: {
        fontSize: 12,
        color: '#000000',
        fontFamily: CUSTOM_FONTS.roboto,
        fontWeight: 'normal'
    },
    listItem: {
        marginLeft: 0,
        paddingLeft: 10,
        height: heightPercentageToDP(10),
        borderBottomWidth: 1,
        borderBottomColor: '#000'
    },
    footer: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    leftCont: {
        height: 68,
        paddingTop: 5,
        flexDirection: 'row'
    },
    itemCont: {
        paddingBottom: 0,
        paddingTop: 0,
        paddingLeft: 0,
        height: 68,
    },
    iconContComm: {
        marginHorizontal: 15,
        height: 48,
        width: 48,
        borderRadius: 24,
        alignSelf: 'center',
        backgroundColor: '#6C6C6B',
        overflow: 'hidden'
    },
    userIconCont: {
        paddingLeft: 12
    },
    iconComm: {
        color: '#ffffff',
        width: 32,
        height: 30,
        alignSelf: 'center',
    },
    bodyCont: {
        height: 68,
        paddingTop: 5,
        flexDirection: 'column',
        flex: 1,
        marginLeft: 5,
        paddingBottom: 7,
        justifyContent: 'space-between'
    },
    rightCont: {
        height: 68,
        justifyContent: 'center',
    },
    notificationTime: {
        color: '#8D8D8D',
        letterSpacing: 0.8,
        fontSize: 10,
        fontFamily: CUSTOM_FONTS.robotoSlabBold
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#868686',
        paddingBottom: 16
    },
    filterImage: {
        height: 24,
        width: 25,
        marginTop: 2
    }
});