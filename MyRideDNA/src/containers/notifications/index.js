import React, { Component } from 'react';
import { SafeAreaView, View, Text, Platform, Image, ScrollView, StyleSheet, FlatList, StatusBar, TouchableOpacity, ActivityIndicator, Animated, Easing } from 'react-native';
import { Actions } from 'react-native-router-flux';

import { BasicHeader } from '../../components/headers';
import { heightPercentageToDP, APP_COMMON_STYLES, widthPercentageToDP, PageKeys } from '../../constants';
import { List, ListItem, Left, Thumbnail, Body, Right } from 'native-base';
import { ShifterButton, IconButton } from '../../components/buttons';
import { appNavMenuVisibilityAction, updateNotificationAction, screenChangeAction, isloadingDataAction, resetCurrentFriendAction } from '../../actions';
import { connect } from 'react-redux';
import { logoutUser, getAllNotifications, getPicture, readNotification, seenNotification, deleteNotifications, getPictureList } from '../../api';
import { getFormattedDateFromISO } from '../../util';
import store from '../../store';
import { Loader } from '../../components/loader';


class Notifications extends Component {
    constructor(props) {
        super(props);
        this.state = {
            notifPicture: {},
            isLoadingAgain: false,
            onEndReachedCalledDuringMomentum: true,
            isLoadingData: false,
            isLoading: false,
            spinValue: new Animated.Value(0),
        }
    }

    componentDidMount() {
        // this.props.getAllNotifications(this.props.user.userId);
        this.props.getAllNotifications(this.props.user.userId, 0, new Date().toISOString(), 'notification', (res) => {
        }, (err) => {
        });
        // this.props.seenNotification(this.props.user.userId);
    }

    componentDidUpdate(prevProps, prevState) {

        // if (prevProps.notificationList.notification !== this.props.notificationList.notification) {
        //     this.props.notificationList.notification.forEach((notificationPic) => {
        //         if (!notificationPic.profilePicture && notificationPic.profilPictureId) {
        //             if (!this.state.notifPicture[notificationPic.profilPictureId])
        //                 this.setState(prevState => {
        //                     const updatedPictureLoader = { ...prevState.notifPicture };
        //                     updatedPictureLoader[notificationPic.profilPictureId] = true;
        //                     return { notifPicture: updatedPictureLoader }
        //                 }, () => {
        //                     this.props.getNotificationPic(notificationPic.profilPictureId, notificationPic.id)
        //                 });

        //         } else {
        //             this.setState(prevState => {
        //                 const updatedPictureLoader = { ...prevState.notifPicture };
        //                 updatedPictureLoader[notificationPic.profilPictureId] = false;
        //                 return { notifPicture: updatedPictureLoader }
        //             });
        //         }
        //     })
        // }
        if (prevProps.notificationList.notification !== this.props.notificationList.notification || !this.props.notificationList.notification.profilePicture) {
            const pictureIdList = []
            this.props.notificationList.notification.forEach((notificationPic) => {
                if (!notificationPic.profilePicture && notificationPic.profilPictureId) {
                    pictureIdList.push(notificationPic.profilPictureId)
                }
            })
            if (pictureIdList.length > 0) {
                this.props.getNotificationPic(pictureIdList);
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
                }, (err) => {
                });
            }
        });

    }

    toggleAppNavigation = () => this.props.showAppNavMenu();

    componentWillUnmount() {
    }

    onPressBackButton = () => {
        Actions.pop();
    }

    // onPressnotification = (item) => {
    //     console.log('item notification : ',item);
    //     if (item.reference.targetScreen === 'FRIENDS_PROFILE') {
    //         // Actions.push(PageKeys.FRIENDS_PROFILE, { comingFrom:'notificationTab',   id : item.fromUserId });
    //         store.dispatch(screenChangeAction({ name: PageKeys[item.reference.targetScreen], params: { comingFrom: 'notificationPage', notificationBody: item } }));
    //         // Actions.push(PageKeys.FRIENDS_PROFILE);
    //     }
    //     else if (item.targetScreen === "REQUESTS") {
    //         store.dispatch(screenChangeAction({ name: PageKeys.FRIENDS, params: { comingFrom: 'notificationPage', goTo: item.targetScreen, notificationBody: item } }));
    //     }
    //     this.props.readNotification(this.props.user.userId, item.id);
    // }
    onPressnotification = (item) => {
        this.props.resetCurrentFriend();
        if (item.reference && item.reference.targetScreen) {
            if (Object.keys(PageKeys).indexOf(item.reference.targetScreen) === -1) {
                if (item.reference.targetScreen === 'REQUESTS') {
                    store.dispatch(screenChangeAction({ name: PageKeys.FRIENDS, params: { comingFrom: 'notificationPage', goTo: item.reference.targetScreen, notificationBody: item } }));
                }
                return;
            }
            store.dispatch(screenChangeAction({ name: PageKeys[item.reference.targetScreen], params: { comingFrom: 'notificationPage', notificationBody: item } }));
        }
        else {
            this.props.readNotification(this.props.user.userId, item.id)
        }
    }

    _keyExtractor = (item, index) => item.id;

    deleteNotification = (item, index) => {
        this.props.deleteNotification(item.id);
    }
    getDateAndTime = (item) => {
        var dateFormat = { day: 'numeric', year: '2-digit', month: 'short' };
        return new Date(item.date).toLocaleDateString('en-IN', dateFormat);
    }

    getFormattedTime =  (dateTime) => {
        const time = new Date(dateTime).toTimeString().substring(0, 5).split(':');
        let period = time[0] < 12 ? 'AM' : 'PM';
        if (time[0] > 12) {
            time[0] = time[0] - 12;
        }
        return `${time.join(':')} ${period}`;
        // return new Date(dateTime).toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
    }

    _renderItem = ({ item, index }) => {
        return (
            // <ListItem avatar key={item.id}
            //     // style={[styles.listItem, { backgroundColor: item.status === 'unread' ? APP_COMMON_STYLES.headerColor : '#fff' }]}
            //     style={[styles.listItem, item.status === 'unread' ? { backgroundColor: '#daedf4' } : { backgroundColor: '#fff' }]}
            //     onPress={() => this.onPressnotification(item)}  >
            //     <Left style={[styles.noBorderTB, styles.avatarContainer]}>
            //         <Thumbnail source={item.profilePicture ? { uri: item.profilePicture } : require('../../assets/img/friend-profile-pic.png')} />
            //     </Left>
            //     <Body style={[styles.noBorderTB, styles.itemBody]}>
            //         <Text style={[styles.name, { fontWeight: 'bold', fontSize: 17 }]}>{item.fromUserName + ' '}<Text style={styles.message}>{item.message}</Text></Text>
            //         <Text>{this.getDateAndTime(item)}</Text>
            //     </Body>
            //     <Right>
            //         <IconButton iconProps={{ name: 'close', type: 'MaterialIcons', style: { fontSize: 25, color: '#6B7663' } }} onPress={() => this.deleteNotification(item, index)} />
            //     </Right>
            // </ListItem>
            <ListItem noIndent style={styles.itemCont}>
                <Left style={styles.leftCont}>
                    {
                        item.profilePicture
                            ? <Thumbnail style={styles.iconContComm} source={{ uri: item.profilePicture }} />
                            : <IconButton disabled style={[styles.iconContComm, styles.userIconCont]} iconProps={{ name: 'user', type: 'FontAwesome', style: styles.iconComm }} />
                    }
                    <View style={styles.bodyCont}>
                        <Text style={styles.name}>{item.fromUserName + ' '}<Text style={styles.message}>{item.message}</Text></Text>
                    </View>
                </Left>
                <Right style={styles.rightCont}>
                    <Text style={{ color: '#8D8D8D', letterSpacing: 0.8, fontSize: 11 }}>{this.getFormattedTime(item.date)}</Text>
                </Right>
            </ListItem>
        );
    }

    onPressLogout = async () => {
        this.props.logoutUser(this.props.user.userId, this.props.userAuthToken, this.props.deviceToken);
    }
    loadMoreData = () => {
        if (this.state.isLoadingData && this.state.isLoading === false) {
            this.setState({ isLoading: true, isLoadingData: false })
            this.props.getAllNotifications(this.props.user.userId, this.props.pageNumber, this.props.notificationList.notification[this.props.notificationList.notification.length - 1].date, (res) => {
                this.setState({ isLoading: false })
            }, (err) => {
                this.setState({ isLoading: false })
            });
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

    render() {
        const { notificationList, user, showLoader, hasNetwork } = this.props;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        return (
            <View style={{ flex: 1 }}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                    <BasicHeader title='Notifications' 
                    rightIconProps={{ name: 'md-exit', type: 'Ionicons', style: { fontSize: widthPercentageToDP(8), color: '#fff' }, onPress: this.onPressLogout }} 
                    // leftIconProps={this.props.comingFrom === PageKeys.PROFILE ? { reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton } : null}
                    />
                    <View style={styles.scrollArea}>
                        <FlatList
                            data={notificationList.notification}
                            keyExtractor={this._keyExtractor}
                            renderItem={this._renderItem}
                            ListFooterComponent={this.renderFooter}
                            // onTouchStart={this.loadMoreData}
                            onEndReached={this.loadMoreData}
                            onEndReachedThreshold={0.1}
                            onMomentumScrollBegin={() => this.setState({ isLoadingData: true })}

                        />

                        {/* <Image source={require('../../assets/img/notifications-bg.png')} style={styles.bottomImage} /> */}
                    </View>
                    {
                        this.props.hasNetwork === false && notificationList.notification.length === 0 && <View style={{ flex: 1, position: 'absolute', top: heightPercentageToDP(30) }}>
                            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(15), flex: 1, marginLeft: widthPercentageToDP(40) } }} onPress={this.retryApiFunction} />
                            </Animated.View>
                            <Text style={{ marginLeft: widthPercentageToDP(13), fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</Text>
                            <Text style={{ marginTop: heightPercentageToDP(2), marginLeft: widthPercentageToDP(25) }}>Please connect to internet </Text>
                        </View>
                    }
                    {/* {
                        notificationList.notification.length > 0 ?
                            
                            :
                            hasNetwork ?
                                <Image source={require('../../assets/img/notifications-bg.png')} style={styles.bottomImage} />
                                :
                                <View style={{ flex: 1, position: 'absolute', top: heightPercentageToDP(35) }}>
                                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                        <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(15), flex: 1, marginLeft: widthPercentageToDP(40) } }} onPress={this.retryApiFunction} />
                                    </Animated.View>
                                    <Text style={{ marginLeft: widthPercentageToDP(13), fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</Text>
                                    <Text style={{ marginTop: heightPercentageToDP(2), marginLeft: widthPercentageToDP(25) }}>Please connect to internet </Text>
                                </View>
                    } */}

                    {/* Shifter: - Brings the app navigation menu */}
                    <ShifterButton onPress={this.toggleAppNavigation} containerStyles={this.props.hasNetwork === false ? { bottom: heightPercentageToDP(8.5) } : null} alignLeft={user.handDominance === 'left'} />
                </View>
                <Loader isVisible={showLoader} />
            </View>
        );
    }
}
const mapStateToProps = (state) => {
    const { user, userAuthToken, deviceToken } = state.UserAuth;
    const { notificationList, isLoading } = state.NotificationList;
    const { showLoader, pageNumber, hasNetwork, lastApi } = state.PageState;
    return { user, userAuthToken, deviceToken, notificationList, pageNumber, isLoading, showLoader, hasNetwork, lastApi };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        logoutUser: (userId, accessToken, deviceToken) => dispatch(logoutUser(userId, accessToken, deviceToken)),
        readNotification: (userId, notificationId) => dispatch(readNotification(userId, notificationId)),
        // getAllNotifications: (userId) => dispatch(getAllNotifications(userId)),
        getAllNotifications: (userId, pageNumber, date, comingFrom, successCallback, errorCallback) => dispatch(getAllNotifications(userId, pageNumber, date, comingFrom, successCallback, errorCallback)),
        seenNotification: (userId) => dispatch(seenNotification(userId)),
        // getNotificationPic: (pictureId, id) => getPicture(pictureId, ({ picture, pictureId }) => {
        //     dispatch(updateNotificationAction({ profilePicture: picture, id: id }))
        // }, (error) => {
        //     dispatch(updateNotificationAction({ id: id }))
        // }),
        getNotificationPic: (pictureIdList) => getPictureList(pictureIdList, (pictureObj) => {
            dispatch(updateNotificationAction({ pictureObj }))
        }, (error) => {
            console.log('getPicture list error: ', error)
            // dispatch(updateNotificationAction(pictureObj))
        }),
        deleteNotification: (notificationIds) => dispatch(deleteNotifications(notificationIds)),
        resetCurrentFriend: () => dispatch(resetCurrentFriendAction({ comingFrom: PageKeys.NOTIFICATIONS }))
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Notifications);

const styles = StyleSheet.create({
    scrollArea: {
        marginTop: APP_COMMON_STYLES.headerHeight,
        flexShrink: 0,
        backgroundColor: '#ffffff'
    },
    name: {
        fontWeight: 'bold',
        fontSize: 14,
        color:'#000000'
    },
    message: {
        fontSize: 12,
        fontWeight:'normal'
    },
    listItem: {
        marginLeft: 0,
        paddingLeft: 10,
        height: heightPercentageToDP(10),
        borderBottomWidth: 1,
        borderBottomColor: '#000'
    },
    noBorderTB: {
        borderBottomWidth: 0,
        borderTopWidth: 0,
    },
    itemBody: {
        height: '100%',
        justifyContent: 'center'
    },
    avatarContainer: {
        height: '100%',
        paddingTop: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    bottomImage: {
        height: '100%',
        width: '100%',
        flexShrink: 1
    },
    separator: {
        height: 0.5,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    footer: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    loadMoreBtn: {
        padding: 10,
        backgroundColor: '#800000',
        borderRadius: 4,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        color: 'white',
        fontSize: 15,
        textAlign: 'center',
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
        height: 68
    },
    iconContComm: {
        marginHorizontal: 15,
        height: 48,
        width: 48,
        borderRadius: 24,
        alignSelf: 'center',
        backgroundColor: '#6C6C6B',
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
        marginLeft: 5
    },
    rightCont: {
        height: 68,
        paddingTop: 10
    },
});