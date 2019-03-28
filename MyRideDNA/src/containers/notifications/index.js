import React, { Component } from 'react';
import { SafeAreaView, View, Text, Platform, Image, ScrollView, StyleSheet, FlatList, StatusBar } from 'react-native';
import { Actions } from 'react-native-router-flux';

import { BasicHeader } from '../../components/headers';
import { heightPercentageToDP, APP_COMMON_STYLES } from '../../constants';
import { List, ListItem, Left, Thumbnail, Body, Right } from 'native-base';
import { ShifterButton } from '../../components/buttons';
import { appNavMenuVisibilityAction } from '../../actions';
import { connect } from 'react-redux';

class Notifications extends Component {
    constructor(props) {
        super(props);
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
                    <Thumbnail source={require('../../assets/img/friend-profile-pic.png')} />
                </Left>
                <Body style={[styles.noBorderTB, styles.itemBody]}>
                    {/* {
                        item.status === 'unread'
                            ? <Text style={[styles.name, { color: '#fff' }]}>{item.fromUserName + ' '}<Text style={styles.message}>{item.message}</Text></Text>
                            : <Text style={styles.name}>{item.fromUserName + ' '}<Text style={styles.message}>{item.message}</Text></Text>
                    } */}
                    <Text style={styles.name}>{item.fromUserName + ' '}<Text style={styles.message}>{item.message}</Text></Text>
                </Body>
            </ListItem>
        );
    }

    render() {
        const { notificationList, user } = this.props;
        return (
            <View style={{ flex: 1 }}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={{ flex: 1 }}>
                    <BasicHeader title='Notifications' />
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
    const { user } = state.UserAuth;
    const { notificationList } = state.NotificationList;
    return { user, notificationList };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
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