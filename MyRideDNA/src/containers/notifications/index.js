import React, { Component } from 'react';
import { SafeAreaView, View, Text, Platform, Image, ScrollView, AsyncStorage, StyleSheet, FlatList, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Actions } from 'react-native-router-flux';

import { BasicHeader } from '../../components/headers';
import { heightPercentageToDP, APP_COMMON_STYLES, widthPercentageToDP, PageKeys } from '../../constants';
import { List, ListItem, Left, Thumbnail, Body, Right } from 'native-base';
import { ShifterButton, IconButton } from '../../components/buttons';
import { appNavMenuVisibilityAction, updateNotificationAction, screenChangeAction, isloadingDataAction } from '../../actions';
import { connect } from 'react-redux';
import { logoutUser, getAllNotifications, getPicture, readNotification, seenNotification, deleteNotifications, getPictureList } from '../../api';
import { getFormattedDateFromISO } from '../../util';
import store from '../../store';


class Notifications extends Component {
    constructor(props) {
        super(props);
        this.state = {
            notifPicture: {},
            isLoadingAgain: false,
            onEndReachedCalledDuringMomentum: true
        }
    }

    componentDidMount() {
        // this.props.getAllNotifications(this.props.user.userId);
        this.props.getAllNotifications(this.props.user.userId, this.props.pageNumber);
        this.props.seenNotification(this.props.user.userId);
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

        if (prevProps.notificationList.notification !== this.props.notificationList.notification) {
            const pictureIdList = []
            this.props.notificationList.notification.forEach((notificationPic) => {
                if (!notificationPic.profilePicture && notificationPic.profilPictureId) {
                    pictureIdList.push(notificationPic.profilPictureId)
                }
            })
            this.props.getNotificationPic(pictureIdList);
        }
    }

    toggleAppNavigation = () => this.props.showAppNavMenu();

    componentWillUnmount() {
    }

    onPressBackButton = () => {
        Actions.pop();
    }

    onPressnotification = (item) => {
        if (item.targetScreen === 'FRIENDS_PROFILE') {
            // Actions.push(PageKeys.FRIENDS_PROFILE, { comingFrom:'notificationTab',   id : item.fromUserId });
            store.dispatch(screenChangeAction({ name: PageKeys[item.targetScreen], params: { comingFrom: 'notificationPage', notificationBody: item } }));
            // Actions.push(PageKeys.FRIENDS_PROFILE);
        }
        else if (item.targetScreen === "REQUESTS") {
            store.dispatch(screenChangeAction({ name: PageKeys.FRIENDS, params: { comingFrom: 'notificationPage', goTo: item.targetScreen, notificationBody: item } }));
        }
        this.props.readNotification(this.props.user.userId, item.id);
    }

    _keyExtractor = (item, index) => item.id;

    deleteNotification = (item, index) => {
        this.props.deleteNotification(item.id);
    }

    _renderItem = ({ item, index }) => {
        return (
            // <ListItem avatar
            //     key={item.id}
            //     // style={[styles.listItem, { backgroundColor: item.status === 'unread' ? APP_COMMON_STYLES.headerColor : '#fff' }]}
            //     style={[styles.listItem, { backgroundColor: '#fff' }]}
            //     onPress={() => this.onPressnotification(item)}>
            //     <Left style={[styles.noBorderTB, styles.avatarContainer]}>
            //         <Thumbnail source={item.profilePicture ? { uri: item.profilePicture } : require('../../assets/img/friend-profile-pic.png')} />
            //     </Left>
            //     <Body style={[styles.noBorderTB, styles.itemBody,]}>
            //         {
            //             item.status === 'unread'
            //                 ? <Text style={[styles.name, {backgroundColor:'#e8f4f8',fontWeight:'bold',fontSize:17 }]}>{item.fromUserName + ' '}<Text style={styles.message}>{item.message}</Text></Text>
            //                 : <Text style={[styles.name,{fontWeight:'bold', fontSize:17}]}>{item.fromUserName + ' '}<Text style={styles.message}>{item.message}</Text></Text>
            //         }
            //         {/* <Text style={styles.name}>{item.fromUserName + ' '}<Text style={styles.message}>{item.message}</Text></Text> */}
            //         {/* <Text>{getFormattedDateFromISO(item.date, '/')}</Text> */}
            //     </Body>
            // </ListItem>
            item.status === 'unread'
                ?
                <ListItem avatar key={item.id}
                    // style={[styles.listItem, { backgroundColor: item.status === 'unread' ? APP_COMMON_STYLES.headerColor : '#fff' }]}
                    style={[styles.listItem, { backgroundColor: '#daedf4' }]}
                    onPress={() => this.onPressnotification(item)}  >
                    <Left style={[styles.noBorderTB, styles.avatarContainer]}>
                        <Thumbnail source={item.profilePicture ? { uri: item.profilePicture } : require('../../assets/img/friend-profile-pic.png')} />
                    </Left>
                    <Body style={[styles.noBorderTB, styles.itemBody]}>
                        <Text style={[styles.name, { fontWeight: 'bold', fontSize: 17 }]}>{item.fromUserName + ' '}<Text style={styles.message}>{item.message}</Text></Text>
                        <Text>{getFormattedDateFromISO(item.date, '/')}</Text>
                    </Body>
                    <Right>
                        <IconButton iconProps={{ name: 'close', type: 'MaterialIcons', style: { fontSize: 25, color: '#6B7663' } }} onPress={() => this.deleteNotification(item, index)} />
                    </Right>
                </ListItem>
                :
                <ListItem avatar
                    key={item.id}
                    // style={[styles.listItem, { backgroundColor: item.status === 'unread' ? APP_COMMON_STYLES.headerColor : '#fff' }]}
                    style={[styles.listItem, { backgroundColor: '#fff' }]}
                    onPress={() => this.onPressnotification(item)}>
                    <Left style={[styles.noBorderTB, styles.avatarContainer]}>
                        <Thumbnail source={item.profilePicture ? { uri: item.profilePicture } : require('../../assets/img/friend-profile-pic.png')} />
                    </Left>
                    <Body style={[styles.noBorderTB, styles.itemBody,]}>
                        <Text style={[styles.name, { fontWeight: 'bold', fontSize: 17 }]}>{item.fromUserName + ' '}<Text style={styles.message}>{item.message}</Text></Text>
                        <Text>{getFormattedDateFromISO(item.date, '/')}</Text>
                    </Body>
                    <Right>
                        <IconButton iconProps={{ name: 'close', type: 'MaterialIcons', style: { fontSize: 25, color: '#6B7663' } }} onPress={() => this.deleteNotification(item, index)} />
                    </Right>
                </ListItem>
        );
    }

    onPressLogout = async () => {
        this.props.logoutUser(this.props.user.userId, this.props.userAuthToken, this.props.deviceToken);
    }
    loadMoreData = () => {
        if (this.props.isLoading === false) {
            this.props.getAllNotifications(this.props.user.userId, this.props.pageNumber);
        }
        console.log('loadMoreData')

    }

    renderFooter = () => {
        if (this.props.isLoading) {
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
        const { notificationList, user } = this.props;
        console.log('notificationList : ', notificationList.notification)
        return (
            <View style={{ flex: 1 }}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={{ flex: 1 }}>
                    <BasicHeader title='Notifications' rightIconProps={{ name: 'md-exit', type: 'Ionicons', style: { fontSize: widthPercentageToDP(8), color: '#fff' }, onPress: this.onPressLogout }} />
                    {
                        notificationList.notification ?
                            <ScrollView style={[styles.scrollArea, notificationList.notification.length > 0 ? { paddingBottom: heightPercentageToDP(5) } : null]}>
                                <FlatList
                                    data={notificationList.notification}
                                    keyExtractor={this._keyExtractor}
                                    renderItem={this._renderItem}
                                ItemSeparatorComponent={() => <View style={styles.separator} />}
                                ListFooterComponent={this.renderFooter}
                                // ItemSeparatorComponent={() => <View style={styles.separator} />}
                                // onEndReached={this.loadMoreData}
                                // onEndReachedThreshold={0.001}
                                // onMomentumScrollBegin={() => { this.setState({ onEndReachedCalledDuringMomentum: false }) }}
                                onTouchStart={this.loadMoreData}

                                />
                            </ScrollView>
                            :
                            <Image source={require('../../assets/img/notifications-bg.png')} style={styles.bottomImage} />}

                    {/* Shifter: - Brings the app navigation menu */}
                    <ShifterButton onPress={this.toggleAppNavigation} alignLeft={user.handDominance === 'left'} />
                </View>
            </View>
        );
    }
}
const mapStateToProps = (state) => {
    const { user, userAuthToken, deviceToken } = state.UserAuth;
    const { notificationList, pageNumber, isLoading } = state.NotificationList;
    return { user, userAuthToken, deviceToken, notificationList, pageNumber, isLoading };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        logoutUser: (userId, accessToken, deviceToken) => dispatch(logoutUser(userId, accessToken, deviceToken)),
        readNotification: (userId, notificationId) => dispatch(readNotification(userId, notificationId)),
        // getAllNotifications: (userId) => dispatch(getAllNotifications(userId)),
        getAllNotifications: (userId, pageNumber) => dispatch(getAllNotifications(userId, pageNumber)),
        seenNotification: (userId) => dispatch(seenNotification(userId)),
        // getNotificationPic: (pictureId, id) => getPicture(pictureId, ({ picture, pictureId }) => {
        //     dispatch(updateNotificationAction({ profilePicture: picture, id: id }))
        // }, (error) => {
        //     dispatch(updateNotificationAction({ id: id }))
        // }),
        getNotificationPic: (pictureIdList) => getPictureList(pictureIdList, (pictureObj) => {
            console.log('getPictureList : ', pictureObj)
            dispatch(updateNotificationAction({ pictureObj }))
        }, (error) => {
            console.log('getPicture list : ', error)
            // dispatch(updateNotificationAction(pictureObj))
        }),
        deleteNotification: (notificationIds) => dispatch(deleteNotifications(notificationIds)),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Notifications);

const styles = StyleSheet.create({
    scrollArea: {
        marginTop: APP_COMMON_STYLES.headerHeight,
        flexShrink: 0,
        backgroundColor: '#fff',
    },
    name: {
        fontWeight: 'bold',
        fontSize: 15
    },
    message: {
        fontSize: 13
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
});