import React, { Component } from 'react';
import { SafeAreaView, View, Text, Platform, ImageBackground, ScrollView, StyleSheet, FlatList } from 'react-native';
import { Actions } from 'react-native-router-flux';

import { BasicHeader } from '../../components/headers';
import { WindowDimensions, IS_ANDROID, CUSTOM_FONTS } from '../../constants';
import { List, ListItem, Left, Thumbnail, Body, Right } from 'native-base';

const ANDROID_HEADER_HEIGHT = 50;
const IOS_HEADER_HEIGHT = 90;
const HEADER_HEIGHT = IS_ANDROID ? ANDROID_HEADER_HEIGHT : IOS_HEADER_HEIGHT;
const LIST_ITEM_HEIGHT = 70;

export class Notifications extends Component {
    constructor(props) {
        super(props);
        this.state = {
            notifications: [
                {
                    id: '102',
                    fromRiderName: 'Amit Saini',
                    message: 'Sent you a friend request',
                    status: 'unread'
                },
                {
                    id: '101',
                    fromRiderName: 'Varun Kumar',
                    message: 'Accepted your friend request',
                    status: 'unread'
                },
                {
                    id: '104',
                    fromRiderName: 'Varun',
                    message: 'Accepted your friend request',
                    status: 'unread'
                },
                {
                    id: '105',
                    fromRiderName: 'Varun',
                    message: 'Accepted your friend request',
                    status: 'unread'
                },
                {
                    id: '106',
                    fromRiderName: 'Varun',
                    message: 'Accepted your friend request',
                    status: 'unread'
                },
                {
                    id: '107',
                    fromRiderName: 'Varun',
                    message: 'Accepted your friend request',
                    status: 'unread'
                },
                {
                    id: '108',
                    fromRiderName: 'Varun',
                    message: 'Accepted your friend request',
                    status: 'unread'
                },
                {
                    id: '109',
                    fromRiderName: 'Varun',
                    message: 'Accepted your friend request',
                    status: 'unread'
                },
                {
                    id: '110',
                    fromRiderName: 'Varun',
                    message: 'Accepted your friend request',
                    status: 'unread'
                },
                {
                    id: '111',
                    fromRiderName: 'Varun',
                    message: 'Accepted your friend request',
                    status: 'unread'
                },
                {
                    id: '112',
                    fromRiderName: 'Varun',
                    message: 'Accepted your friend request',
                    status: 'unread'
                },
                {
                    id: '113',
                    fromRiderName: 'Varun',
                    message: 'Accepted your friend request',
                    status: 'unread'
                },
            ]

        };
    }

    onPressBackButton = () => {
        Actions.pop();
    }

    _keyExtractor = (item, index) => item.id;

    _renderItem = ({ item, index }) => {
        const { notifications } = this.state;
        return (
            <ListItem avatar
                key={item.id}
                style={[styles.listItem, { backgroundColor: item.status === 'unread' ? 'rgba(62, 62, 61, 1)' : 'rgba(62, 62, 61, 0.3)' }]}
                onPress={() => this.setState({ notifications: [...notifications.slice(0, index), Object.assign({}, item, { status: 'read' }), ...notifications.slice(index + 1)] })}>
                <Left style={[styles.noBorderTB, styles.avatarContainer]}>
                    <Thumbnail source={require('../../assets/img/friend-profile-pic.png')} />
                </Left>
                <Body style={[styles.noBorderTB, { height: '100%', justifyContent: 'center' }]}>
                    <Text style={styles.name}>{item.fromRiderName}</Text>
                    <Text style={styles.message}>{item.message}</Text>
                </Body>
                <Right style={[styles.noBorderTB, { height: '100%', justifyContent: 'center' }]}>
                    {null}
                </Right>
            </ListItem>
        );
    }

    render() {
        const { notifications } = this.state;
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <BasicHeader headerHeight={HEADER_HEIGHT} leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                    title='Notifications' />
                <ImageBackground source={require('../../assets/img/notifications-bg.png')} style={{ width: WindowDimensions.width, height: WindowDimensions.height, marginTop: HEADER_HEIGHT }}>
                    <ScrollView style={{ flex: 1, marginBottom: LIST_ITEM_HEIGHT }}>
                        <FlatList
                            data={notifications}
                            keyExtractor={this._keyExtractor}
                            renderItem={this._renderItem}
                        />
                    </ScrollView>
                </ImageBackground>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    name: {
        color: 'white',
        fontFamily:CUSTOM_FONTS.gothamBold
    },
    message: {
        color: 'white',
        fontSize: 12
    },
    listItem: {
        marginLeft: 0,
        paddingLeft: 10,
        height: LIST_ITEM_HEIGHT,
        marginVertical: 1
    },
    noBorderTB: {
        borderBottomWidth: 0,
        borderTopWidth: 0,
    },
    avatarContainer: {
        height: '100%',
        paddingTop: 0,
        alignItems: 'center',
        justifyContent: 'center'
    }
});