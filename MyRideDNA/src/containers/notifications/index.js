import React, { Component } from 'react';
import { SafeAreaView, View, Text, Platform, Image, ScrollView, StyleSheet, FlatList, StatusBar, TouchableOpacity, ActivityIndicator, Animated, Easing } from 'react-native';
import { Actions } from 'react-native-router-flux';

import { BasicHeader } from '../../components/headers';
import { heightPercentageToDP, APP_COMMON_STYLES, widthPercentageToDP, PageKeys, CUSTOM_FONTS, RELATIONSHIP } from '../../constants';
import { List, ListItem, Left, Thumbnail, Body, Right } from 'native-base';
import { ShifterButton, IconButton, ImageButton, LinkButton } from '../../components/buttons';
import { appNavMenuVisibilityAction, updateNotificationAction, screenChangeAction, isloadingDataAction, resetCurrentFriendAction, deleteNotificationsAction } from '../../actions';
import { connect } from 'react-redux';
import { logoutUser, getAllNotifications, getPicture, readNotification, seenNotification, deleteNotifications, getPictureList, cancelFriendRequest, approveFriendRequest, rejectFriendRequest } from '../../api';
import { getFormattedDateFromISO } from '../../util';
import store from '../../store';
import { Loader } from '../../components/loader';
import { LabeledInputPlaceholder } from '../../components/inputs';


const FILTERED_ACTION_IDS = {
    ALL_NOTIFICATION: 'all-notification',
    RECEIVED_REQUEST: 'received-request',
    RECEIVED_REQUEST_ENABLED: 'received-request-enabled',
    SENT_REQUEST: 'sent-request',
    SENT_REQUEST_ENABLED: 'sent-request-enabled',
    GROUP: 'group',
    GROUP_ENABLED: 'group-enabled',
}

const testingNotifications = [
    {
        fromUserName: 'Varun Kumar',
        message: 'sents you friend request',
        date: '2019-11-11T11:39:17.125Z',
        id: 1,
        notificationType: 'receivedRequest',
        profilePicture: "data:image/jpeg;base64,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"
    },
    {
        fromUserName: 'Madhavan V',
        message: 'has added you to tester group',
        date: '2019-09-17T09:39:33.486Z',
        id: 2,
        notificationType: 'group',
        profilePicture: "data:image/jpeg;base64,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"
    },
    {
        fromUserName: 'Neha',
        message: 'Friend request sent to ',
        date: "2019-09-17T09:39:12.054Z",
        id: 3,
        notificationType: 'sentRequest',
        profilePicture: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAB9AEYDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDz621CJrkhVZQDyzDqa0o4ppJWkR8Bhx71N4T8GN4l1yKwMxjiiHmTt3C+g9TXtsHgHSoPDtxpCIru2Slw6jerdVOR6fyrxlhZVVzUyJUVUXMjxCPTiqKHON/O2sS+0e4a1lEbfMzk/QV9CXnw+0waM8MKMbuOMlJmY5LAdx0xntXGeIfAtzp1zZrauZY50O9n42OMfoc8fQ1Cw2KpPmtcxlQqRWmp5dpBubeBoyoXbwCR1q9qGmrqFuspJWQDkr1JrQ17Trmwjkt3QJLBJtlZeQPxpum3EMsMaQzLI3esKlSSftErO5hNyTSMm0Se304280hEjtw3cCsi80qW0lNxGwkiHLE/1rf1mXypPLjiO4HO71qrZyNcXJWQhcr8yt0P1relUmk6i2e5nzy5rMuaJY293Z/anUKGOAvpRWvbx2f2VFtQAv8AEo7GivPqVZObd2i1I6z4bxl9XlltUywC7jnqOc5/OvZlTDZ7YFee/CPQm0jwbBczqpvLxmlkYcnbnCjP05/GvRs8fhX0+Hp+zpKN7nrK6gkNZQFY+1YswV9SkmlOUjTag/ma17liIWx1OMfnWHc3KWsDzsC8kr7II1GS2PQfXmt0aU+5geNmtY/Bl3BMq+bduAi46ncCT+leMweG9R0ySS/FhOloB12H88ele7ppbPIt5fbTOPuA8iEeg9/epZ4I3tZYlAKspV2bpz61y18L7WTbfS1jOrhlUd2z5zmunmuDHNC2TyrY6VPDbgwsHUSue/TitnxVpSaHIghd5lYlFMmN2Rz2HTFc6uoFI9zMBk4xivKqUpw921jy54d03aW5csUuYbmbYxMZHA9DRVu1uNikmLeWHOeKK4qjblsSoHu/w/u4rzwZphRuUiEbjurDsf0P411WMKc9ua850fwlrnh7V5rnR9VtHtZmG+1uFYKwH+7nB9DXcXd6F0yffLDHcCJsAS5w2OMdD+lfS0ZS5EpqzR6qUtEwvbqJrZnjlVhwMoc81SS3EEoubhd10y7YoRz5Sen19TXPeHzIkUMu8u+4MUC8E9m6nn9P5114jADbY9zH7xLgk/rXPg8fHEylGKtY6Zw9m+W5nmIu++c7j2RTgD/Pt+dZeq3R8vYDtjHAC8D8+3863pIZGByFQfTJrD1WIwqZIIkuJh0MzlQP0P8AKvQvYce55v400qGewgv3Z1mSXbFjhTkc8Hr061xH9koSjsN+HDECu216z1+9lFxdAThAQViB2xr/ALINZXlQxwLtznocjnNfO4/ETVW9mjycVNupdqxUkeEjMhEY7CiiSCNvmuEIPvRXAmrdTmSb1PXdQ1SR443iVVgkjDqwH3gfepNIe3WP7TdYkY5KI3QAcZx9a4Kz8RXllpT2F20TwpkoDy6d+D3HtU/hrX7PVLmSC4n8plyyFyFDLn1r6ihjaVVKOzPZhiac2o9WekyY/tDz88yDbkf3gAQPxyfxAq4t6gUI+Mdjj/OKwQx8hsvvh3DDg9iMZB9uKrzXZaF8Md8bFJOOQw7/AIjB/Gt4whGWi3N3Z2TOklKMuVJx/sn+hrIvHRjtaRwPQq39DWPFqs6MFLbh2NaH22KWIvK6xkdd/StXGwWsUb54rSAm1WPz34VvLJPPfmuJmtpbefy5Duwck9yK76YxAlcRFiP4a5LW4Cb9WzhcV5uYYL61y2dv8i55bLExT2d/wOY1S4BuWUnYvGFNFVtaZbvVG8tAURQufU0V5n1GcPdSbXoeTUwNaM3FRbS62MY3hLK029gfmSQHBX2NaaxRTyeUoEU5Xdkfxf8A16gsrCC+tFUeaI8/KZG+YVoyGO2vlMZ4jQZcjj0rCpJbR3OaVrKzOu07xg9l4SttM+zK7xEq8jN2zkYHr2zS3/iC3jubO8s5fMSaMx3cJ4ZcfdP15I+lcddXUscTp5Qy7/Lj09aq2q3EkrPK22MdBW1PG11HV+hvHETUT0Kw1CyvG3R3cRTPO5tp/I9K0ZdZ06PQLm7tLmCeW3l8pomf73OMj27144ltcvqOS7BC2Nh6YrXaCJYyfL8uNTxgct712VsznZRXUuWNnax6Dp9/PNas04RZwvDZyCaZqcAewjlWUSSlfm56Vya6pd3EsUQUKqjkg8sadd6m6OEUn0NejTarclSEnZdO/qfYYetTrU41KcitKYbaQhhknqRzRW7oXgu88UpNcRyeTDG20Fh1NFW5J6qTX9ehxVcZR5377Xy/4Bivbx2dzIY4gFkHByT+VULaBp7dVYMZA7NtqefVEliSNMlgTgoMUWrmW1UqfJdgdzsea+RfNFXPjE9CK6B8p2JPmj5QKrxxoLLdcyFX3dBzzUsyh4BAZfOkU5Yg4JqhcIXtpNxePb8ic5H1rWCurXGpMs2qpKd8Dysqk53CtuOYSxyL5YIwAmRWTodtLPaLHvPyDp04rY2YjCscMDyaxrtc1hXbM02twmopJDKUI5YA9KiWWY6zB5jhbVpV82Rudq55rcKRSAkHBI5OKwbzzYtRtyu37NC6yMG4GAc1rha8nNK+xcJzi/dbPpCxtLfTNPjGmwbo5MMccZ460Vjab490nUtFt7y0nRg3BXPTFFe9OEpO8ZtfcehzLqrngYjIuFlYuFxyMcioLqdYrtcxGSMMCBnpSXN1IwYpIdpOd2M5qp500skchPyjOAR2ryIQb1Z5F+hoDy3lkf5vmGOD0FQvbK0yFJWAX+EtjJqvBeSO7RpHwzbdw5xVy8tnuGhhkYNvXhkPP5Vapzj73Q3jQqSpuql7q0uben3EUZEwX5+jKx4NM1C9lLEsoCk8Y9KxIZjZzG1myjRDg+oq68y3lqvlyZBOSD1rklR5Z3exmy1HfiZkjRuDwSO1P1CwFzpLKsoWQZRj3PvSWMMbR+WECOwOD71noLh7i46sqkAAnHNTFJSvHSxVOXKZT2M1lbJDZOyKDzjI3GiuihjnkPleaNyjJ+XgUV1LEzXmdXtPM5ie4iguYo4NzRqCW74+tUodQlvJ41cfuRIEJHYGs+W6eOxdk4a4kO4+g9qs6bFvWGAMVE3zMR7V6UaKitdTnp0rtLu7HZxaZY2J3QOyjOSxbINZ80hIV1DKoyEfGMj2qLe4UR7sqOMVp6xr7alptpp7WsUaW65DL1PauyfPCUYwgrN667f5n6ZSw1OhTjCMEk9/UxiqzXClrkv6rtP862BFDFAjQlAW4BPrWNYDdeMuB04JGcVrGL7LGI1wyEbsMO9eVj1H2nKnqfDZz7KOJkobve/6FyMSNIkikMIzyAaiurhNjiNcSZzVnTpAtq7KiqSm44rHmuFBkLRBm3YzmvOhHmm12PHb6i/aL0sFJRDjLEt1NFVL2OGNxLsYs/q1FdapqSul+AczP//Z"
    },
    {
        fromUserName: 'Ashish',
        message: 'sents you friend request',
        date: "2019-09-11T12:34:00.487Z",
        id: 4,
        notificationType: 'receivedRequest',
    },
]


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
            searchQuery: '',
            isFilter: null,
            notificationFilter: FILTERED_ACTION_IDS.ALL_NOTIFICATION,
            isFilter: null
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

    cancelingFriendRequest = (item) => {
        this.props.cancelRequest(this.props.user.userId, item.fromUserId, item.requestId, item.id);
    }

    approvingFriendRequest = (item) => {
        this.props.approvedRequest(this.props.user.userId, item.fromUserId, new Date().toISOString(), item.requestId, item.id);
    }
    rejectingFriendRequest = (item) => {
        this.props.rejectRequest(this.props.user.userId, item.fromUserId, item.requestId, item.id);
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
        if (item.notificationType === 'group') {
            if (item.reference && item.reference.targetScreen) {
                store.dispatch(screenChangeAction({ name: PageKeys[item.reference.targetScreen], params: { comingFrom: 'notificationPage', notificationBody: item } }));
            }
            else {
                this.props.readNotification(this.props.user.userId, item.id)
            }
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

    getFormattedTime = (dateTime) => {
        const time = new Date(dateTime).toTimeString().substring(0, 5).split(':');
        let period = time[0] < 12 ? 'AM' : 'PM';
        if (time[0] > 12) {
            time[0] = time[0] - 12;
        }
        return `${time.join(':')} ${period}`;
        // return new Date(dateTime).toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
    }

    getNotificationTypeIcons = (notificationType) => {
        switch (notificationType) {
            case RELATIONSHIP.RECIEVED_REQUEST: return <View style={[styles.thumbnailNotificationIcon, { backgroundColor: '#2B77B4' }]}>
                <ImageButton imageSrc={require('../../assets/img/received-friend-request.png')} imgStyles={{ height: 10, width: 10 }} />
            </View>
            case RELATIONSHIP.SENT_REQUEST: return <View style={[styles.thumbnailNotificationIcon, { backgroundColor: '#FF0000' }]}>
                <ImageButton imageSrc={require('../../assets/img/sent-friend-request.png')} imgStyles={{ height: 12, width: 12 }} />
            </View>
            case 'group': return <View style={[styles.thumbnailNotificationIcon, { backgroundColor: '#81BA41' }]}>
                <IconButton iconProps={{ name: 'group', type: 'FontAwesome', style: { color: '#C4C6C8', fontSize: 8, marginLeft: 22 } }} />
            </View>
        }
    }

    getBodyContent = (item) => {
        switch (item.notificationType) {
            case RELATIONSHIP.SENT_REQUEST: return <View style={styles.bodyCont}>
                <Text style={styles.message}><Text style={styles.message}>{item.message}</Text><Text style={styles.name}>{' ' + item.fromUserName}</Text></Text>
                <IconButton iconProps={{ name: 'close', type: 'AntDesign', style: { color: '#FF0000', fontSize: 14 } }} title='Cancel' titleStyle={{ color: '#FF0000', fontFamily: CUSTOM_FONTS.roboto }} style={{ justifyContent: 'flex-start' }} onPress={() => this.cancelingFriendRequest(item)} />
            </View>

            case RELATIONSHIP.RECIEVED_REQUEST: return <View style={styles.bodyCont}>
                <Text style={styles.name}>{item.fromUserName + ' '}<Text style={styles.message}>{item.message}</Text></Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <IconButton iconProps={{ name: 'add-user', type: 'Entypo', style: { color: '#2B77B4', fontSize: 13 } }} title='Accept' titleStyle={{ color: '#2B77B4', fontFamily: CUSTOM_FONTS.roboto }} onPress={() => this.approvingFriendRequest(item)} />
                    <IconButton iconProps={{ name: 'remove-user', type: 'Entypo', style: { color: '#2B77B4', fontSize: 13 } }} title='Reject' titleStyle={{ color: '#2B77B4', fontFamily: CUSTOM_FONTS.roboto }} onPress={() => this.rejectingFriendRequest(item)} />
                </View>
            </View>

            case 'group': return <View style={styles.bodyCont}>
                <Text style={styles.name}>{item.fromUserName + ' '}<Text style={styles.message}>{item.message}</Text></Text>
            </View>
        }
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
            <ListItem noIndent style={styles.itemCont} onPress={() => this.onPressnotification(item)}>
                <Left style={styles.leftCont}>
                    {
                        item.profilePicture
                            ? <Thumbnail style={styles.iconContComm} source={{ uri: item.profilePicture }} />
                            : <IconButton disabled style={[styles.iconContComm, styles.userIconCont]} iconProps={{ name: 'user', type: 'FontAwesome', style: styles.iconComm }} />
                    }

                    {
                        this.getNotificationTypeIcons(item.notificationType)
                    }
                    {
                        this.getBodyContent(item)
                    }

                </Left>
                <Right style={styles.rightCont}>
                    <Text style={styles.notificationTime}>{item.date ? this.getFormattedTime(item.date) : null}</Text>
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
    onChangeSearchValue = (val) => { this.setState({ searchQuery: val }) }

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

    filterReceivedRequest = () => {
        if (this.state.isFilter === FILTERED_ACTION_IDS.RECEIVED_REQUEST_ENABLED) {
            this.setState({ notificationFilter: FILTERED_ACTION_IDS.ALL_NOTIFICATION, isFilter: null })
        }
        else {
            this.setState({ notificationFilter: FILTERED_ACTION_IDS.RECIEVED_REQUEST, isFilter: FILTERED_ACTION_IDS.RECEIVED_REQUEST_ENABLED })
        }
    }
    filterSentRequest = () => {
        if (this.state.isFilter === FILTERED_ACTION_IDS.SENT_REQUEST_ENABLED) {
            this.setState({ notificationFilter: FILTERED_ACTION_IDS.ALL_NOTIFICATION, isFilter: null })
        }
        else {
            this.setState({ notificationFilter: FILTERED_ACTION_IDS.SENT_REQUEST, isFilter: FILTERED_ACTION_IDS.SENT_REQUEST_ENABLED })
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

    render() {
        const { notificationList, user, showLoader, hasNetwork } = this.props;
        const { searchQuery, notificationFilter } = this.state;
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
        else if (notificationFilter === FILTERED_ACTION_IDS.RECIEVED_REQUEST) {
            const receivedRequests = notificationList.notification.filter(notification => notification.notificationType === 'receivedRequest');
            filteredNotification = searchQuery === '' ? receivedRequests : receivedRequests.filter(notification => {
                return (notification.fromUserName.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1)
            });
        }
        else if (notificationFilter === FILTERED_ACTION_IDS.SENT_REQUEST) {
            const sentRequests = notificationList.notification.filter(notification => notification.notificationType === 'sentRequest');
            filteredNotification = searchQuery === '' ? sentRequests : sentRequests.filter(notification => {
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
            <View style={{ flex: 1 }}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                    <BasicHeader title='Notification'
                    // rightIconProps={{ name: 'md-exit', type: 'Ionicons', style: { fontSize: widthPercentageToDP(8), color: '#fff' }, onPress: this.onPressLogout }}
                    // leftIconProps={this.props.comingFrom === PageKeys.PROFILE ? { reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton } : null}
                    />
                    <View style={{ marginHorizontal: widthPercentageToDP(9), marginTop: 80, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', borderRadius: 20, height: 37 }}>
                        <View style={{ flex: 2.89 }}>
                            <LabeledInputPlaceholder
                                placeholder='Name'
                                inputValue={searchQuery} inputStyle={{ borderBottomWidth: 0, width: widthPercentageToDP(47), marginLeft: 15, backgroundColor: '#fff' }}
                                onChange={this.onChangeSearchValue}
                                hideKeyboardOnSubmit={false}
                                containerStyle={styles.searchCont} />
                        </View>
                        <View style={{ flex: 1, backgroundColor: '#C4C6C8', borderTopRightRadius: 20, borderBottomRightRadius: 20, justifyContent: 'center' }}>
                            <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { color: '#707070', fontSize: 22 } }} />
                        </View>
                        {/* rightIcon={{name:'user', type:'FontAwesome', style:styles.rightIconStyle}} /> */}

                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, borderBottomWidth: 1, borderBottomColor: '#868686', marginHorizontal: widthPercentageToDP(9), paddingBottom: 16 }}>
                        <ImageButton imageSrc={this.state.isFilter === FILTERED_ACTION_IDS.RECEIVED_REQUEST_ENABLED ? require('../../assets/img/received-friend-request-blue.png') : require('../../assets/img/received-friend-request.png')} imgStyles={{ height: 25, width: 28, marginTop: 0 }} onPress={() => this.filterReceivedRequest()} />
                        <ImageButton imageSrc={this.state.isFilter === FILTERED_ACTION_IDS.SENT_REQUEST_ENABLED ? require('../../assets/img/sent-friend-request-red.png') : require('../../assets/img/sent-friend-request.png')} imgStyles={{ height: 28, width: 30, marginTop: 0 }} onPress={() => this.filterSentRequest()} />
                        <IconButton iconProps={{ name: 'group', type: 'FontAwesome', style: { color: this.state.isFilter === FILTERED_ACTION_IDS.GROUP_ENABLED ? '#81BA41' : '#C4C6C8', fontSize: 20 } }} onPress={() => this.filterGroup()} />
                        {/* <IconButton iconProps={{ name: 'location-arrow', type: 'FontAwesome', style: { color: this.state.isFilter === FILTERED_ACTION_IDS.VISIBLE_ON_MAP ? '#81BA41' : '#C4C6C8', fontSize: 23 } }} onPress={() => this.filterVisibleOnMapFriends()} /> */}
                    </View>
                    <FlatList
                        // data={notificationList.notification}
                        data={filteredNotification}
                        keyExtractor={this._keyExtractor}
                        renderItem={this._renderItem}
                        ListFooterComponent={this.renderFooter}
                        // onTouchStart={this.loadMoreData}
                        onEndReached={this.loadMoreData}
                        onEndReachedThreshold={0.1}
                        onMomentumScrollBegin={() => this.setState({ isLoadingData: true })}

                    />
                    {
                        this.props.hasNetwork === false && notificationList.notification.length === 0 && <View style={{ flex: 1, position: 'absolute', top: heightPercentageToDP(30) }}>
                            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(15), flex: 1, marginLeft: widthPercentageToDP(40) } }} onPress={this.retryApiFunction} />
                            </Animated.View>
                            <Text style={{ marginLeft: widthPercentageToDP(13), fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</Text>
                            <Text style={{ marginTop: heightPercentageToDP(2), marginLeft: widthPercentageToDP(25) }}>Please connect to internet </Text>
                        </View>
                    }

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
        resetCurrentFriend: () => dispatch(resetCurrentFriendAction({ comingFrom: PageKeys.NOTIFICATIONS })),
        cancelRequest: (userId, personId, requestId, notificationIds) => dispatch(cancelFriendRequest(userId, personId, requestId, (res) => {
            dispatch(deleteNotificationsAction({ notificationIds }));
        }, (error) => {
        })),
        approvedRequest: (userId, personId, actionDate, requestId, notificationIds) => dispatch(approveFriendRequest(userId, personId, actionDate, requestId, (res) => {
            dispatch(deleteNotificationsAction({ notificationIds }));
        }, (error) => {
        })),
        rejectRequest: (userId, personId, requestId, notificationIds) => dispatch(rejectFriendRequest(userId, personId, requestId, (res) => {
            dispatch(deleteNotificationsAction({ notificationIds }));
        }, (error) => {
        })),
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
        fontSize: 14,
        color: '#000000',
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
        marginLeft: 5,
        justifyContent: 'space-between',
        paddingBottom: 7
    },
    rightCont: {
        height: 68,
        paddingTop: 12
    },
    thumbnailNotificationIcon: {
        height: 16,
        width: 16,
        borderRadius: 8,
        position: 'absolute',
        bottom: 8,
        left: 47,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#C4C6C8'
    },
    linkButtonStyle: {
        paddingHorizontal: 0,
        flexDirection: 'row'
    },
    searchCont: {
        marginBottom: 0,
        flex: 1,
        width: widthPercentageToDP(47),
    },
    notificationTime: {
        color: '#8D8D8D',
        letterSpacing: 0.8,
        fontSize: 10,
        fontFamily: CUSTOM_FONTS.robotoSlabBold
    }
});