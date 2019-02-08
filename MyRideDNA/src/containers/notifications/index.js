import React, { Component } from 'react';
import { SafeAreaView, View, Text, Platform, Image, ScrollView, StyleSheet, FlatList, StatusBar } from 'react-native';
import { Actions } from 'react-native-router-flux';

import { BasicHeader } from '../../components/headers';
import { WindowDimensions, heightPercentageToDP } from '../../constants';
import { List, ListItem, Left, Thumbnail, Body, Right } from 'native-base';

const ANDROID_HEADER_HEIGHT = 50;
const IOS_HEADER_HEIGHT = 90;
const HEADER_HEIGHT = Platform.OS === 'android' ? ANDROID_HEADER_HEIGHT : IOS_HEADER_HEIGHT;
const LIST_ITEM_HEIGHT = 70;

export class Notifications extends Component {
    constructor(props) {
        super(props);
        this.state = {
            notifications: []
        };
        this.count = 0;
        this.interval = setInterval(() => {
            if (this.count === 15) clearInterval(this.interval);
            this.count++;
            this.setState({ notifications: [{ id: Date.now(), fromRiderName: 'MY_RIDE_DNA', message: '' + Date.now(), status: 'unread' }, ...this.state.notifications] })
        }, 1000);
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
                style={[styles.listItem, { backgroundColor: item.status === 'unread' ? '#fff' : '#fff' }]}
                onPress={() => this.setState({ notifications: [...notifications.slice(0, index), { ...item, status: 'read' }, ...notifications.slice(index + 1)] })}>
                <Left style={[styles.noBorderTB, styles.avatarContainer]}>
                    <Thumbnail source={require('../../assets/img/friend-profile-pic.png')} />
                </Left>
                <Body style={[styles.noBorderTB, styles.itemBody]}>
                    <Text style={styles.name}>{item.fromRiderName + ' '}<Text style={styles.message}>{item.message}</Text></Text>
                </Body>
            </ListItem>
        );
    }

    render() {
        const { notifications } = this.state;
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar
                    backgroundColor="rgba(0,118,181,0.9)"
                    barStyle="default"
                />
                <BasicHeader headerHeight={heightPercentageToDP(8.5)} title='Notifications' leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }} />
                <ScrollView style={[styles.scrollArea, notifications.length > 0 ? { paddingBottom: heightPercentageToDP(5) } : null]}>
                    <FlatList
                        data={notifications}
                        keyExtractor={this._keyExtractor}
                        renderItem={this._renderItem}
                    />
                </ScrollView>
                <Image source={require('../../assets/img/notifications-bg.png')} style={styles.bottomImage} />
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    scrollArea: {
        marginTop: heightPercentageToDP(8.5),
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