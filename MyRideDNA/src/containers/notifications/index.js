import React, { Component } from 'react';
import { SafeAreaView, View, Text, Platform, Image, ScrollView, AsyncStorage, StyleSheet, FlatList, StatusBar } from 'react-native';
import { Actions } from 'react-native-router-flux';

import { BasicHeader } from '../../components/headers';
import { heightPercentageToDP, APP_COMMON_STYLES, widthPercentageToDP } from '../../constants';
import { List, ListItem, Left, Thumbnail, Body, Right } from 'native-base';
import { ShifterButton } from '../../components/buttons';
import { appNavMenuVisibilityAction, updateNotificationAction } from '../../actions';
import { connect } from 'react-redux';
import { logoutUser, getAllNotifications, getPicture } from '../../api';
import { getFormattedDateFromISO } from '../../util';

class Notifications extends Component {
    constructor(props) {
        super(props);
        this.state = {
            notifPicture: {}
        }
    }

    componentDidMount() {
        this.props.getAllNotifications(this.props.user.userId);
    }

    componentDidUpdate(prevProps, prevState) {

        if (prevProps.notificationList !== this.props.notificationList) {
            this.props.notificationList.forEach((notificationPic) => {
                if (!notificationPic.profilePicture && notificationPic.profilPictureId) {
                    if (!this.state.notifPicture[notificationPic.profilPictureId])
                        this.setState(prevState => {
                            const updatedPictureLoader = { ...prevState.notifPicture };
                            updatedPictureLoader[notificationPic.profilPictureId] = true;
                            return { notifPicture: updatedPictureLoader }
                        }, () => {
                            this.props.getNotificationPic(notificationPic.profilPictureId, notificationPic.id)
                        });

                } else {
                    this.setState(prevState => {
                        const updatedPictureLoader = { ...prevState.notifPicture };
                        updatedPictureLoader[notificationPic.profilPictureId] = false;
                        return { notifPicture: updatedPictureLoader }
                    });
                }
            })
        }
    }

    toggleAppNavigation = () => this.props.showAppNavMenu();

    componentWillUnmount() {
    }

    onPressBackButton = () => {
        Actions.pop();
    }

    _keyExtractor = (item, index) => item.id;

    _renderItem = ({ item, index }) => {
        return (
            <ListItem avatar
                key={item.id}
                // style={[styles.listItem, { backgroundColor: item.status === 'unread' ? APP_COMMON_STYLES.headerColor : '#fff' }]}
                style={[styles.listItem, { backgroundColor: '#fff' }]}
                onPress={() => console.log("Pressed: ", item.message)}>
                <Left style={[styles.noBorderTB, styles.avatarContainer]}>
                    <Thumbnail source={item.profilePicture ? { uri: item.profilePicture } : require('../../assets/img/friend-profile-pic.png')} />
                </Left>
                <Body style={[styles.noBorderTB, styles.itemBody]}>
                    {/* {
                        item.status === 'unread'
                            ? <Text style={[styles.name, { color: '#fff' }]}>{item.fromUserName + ' '}<Text style={styles.message}>{item.message}</Text></Text>
                            : <Text style={styles.name}>{item.fromUserName + ' '}<Text style={styles.message}>{item.message}</Text></Text>
                    } */}
                    <Text style={styles.name}>{item.fromUserName + ' '}<Text style={styles.message}>{item.message}</Text></Text>
                    <Text>{getFormattedDateFromISO(item.date, '/')}</Text>
                </Body>
            </ListItem>
        );
    }

    onPressLogout = async () => {
        this.props.logoutUser(this.props.user.userId, this.props.userAuthToken, this.props.deviceToken);
    }

    render() {
        const { notificationList, user } = this.props;
        return (
            <View style={{ flex: 1 }}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={{ flex: 1 }}>
                    <BasicHeader title='Notifications' rightIconProps={{ name: 'md-exit', type: 'Ionicons', style: { fontSize: widthPercentageToDP(8), color: '#fff' }, onPress: this.onPressLogout }} />
                    <ScrollView style={[styles.scrollArea, notificationList.length > 0 ? { paddingBottom: heightPercentageToDP(5) } : null]}>
                        <FlatList
                            data={notificationList}
                            keyExtractor={this._keyExtractor}
                            renderItem={this._renderItem}
                        />
                    </ScrollView>
                    <Image source={require('../../assets/img/notifications-bg.png')} style={styles.bottomImage} />

                    {/* Shifter: - Brings the app navigation menu */}
                    <ShifterButton onPress={this.toggleAppNavigation} alignLeft={user.handDominance === 'left'} />
                </View>
            </View>
        );
    }
}
const mapStateToProps = (state) => {
    const { user, userAuthToken, deviceToken } = state.UserAuth;
    const { notificationList } = state.NotificationList;
    return { user, userAuthToken, deviceToken, notificationList };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        logoutUser: (userId, accessToken, deviceToken) => dispatch(logoutUser(userId, accessToken, deviceToken)),
        getAllNotifications: (userId) => dispatch(getAllNotifications(userId)),
        getNotificationPic: (pictureId, id) => getPicture(pictureId, ({ picture, pictureId }) => {
            dispatch(updateNotificationAction({ profilePicture: picture, id: id }))
        }, (error) => {
            dispatch(updateNotificationAction({ id: id }))
        }),
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
    }
});