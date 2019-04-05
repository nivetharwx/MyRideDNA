import React, { Component } from 'react';
import { View, ImageBackground, Text, StatusBar, ScrollView, FlatList, TextInput } from 'react-native';
import { connect } from 'react-redux';
import styles from './styles';
import { appNavMenuVisibilityAction } from '../../actions';
import { ShifterButton, IconButton } from '../../components/buttons';
import { Thumbnail, Item, List } from 'native-base';
import { APP_COMMON_STYLES, widthPercentageToDP } from '../../constants';
import { ChatBubble } from '../../components/bubble';

class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    showAppNavigation = () => this.props.showAppNavMenu();

    render() {
        const { user } = this.props;
        return <View style={styles.fill}>
            <View style={APP_COMMON_STYLES.statusBar}>
                <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColorDark} barStyle="light-content" />
            </View>
            <View style={styles.fill}>
                <ImageBackground style={styles.chatBackgroundImage} source={require('../../assets/img/chat-bg.jpg')}>
                    <View style={styles.chatHeader}>
                        <Thumbnail style={styles.thumbnail} source={this.props.friend.profilePicture ? { uri: this.props.friend.profilePicture } : require('../../assets/img/friend-profile-pic.png')} />
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <Text style={styles.chatHeaderName}>{this.props.friend.name}</Text>
                            <Text style={styles.chatHeaderNickname}>{this.props.friend.nickname}</Text>
                        </View>
                        <IconButton style={styles.headerIconRight} iconProps={{ name: 'md-more', type: 'Ionicons', style: { color: '#fff' } }} />
                    </View>
                    <View style={styles.rootContainer}>
                        <FlatList
                            style={styles.chatArea}
                            contentContainerStyle={{ paddingBottom: 10 }}
                            data={[
                                {
                                    message: `Testing message\nTesting message\nTesting message\nTesting message\nTesting message\nTesting message\nTesting message\nTesting message\nTesting message\nTesting message\nTesting message\nTesting message\nTesting message\nTesting message\nTesting message\n`,
                                    time: '8.11.18, 2:21 PM'
                                },
                                {
                                    message: 'Testing message',
                                    time: '8.11.18, 2:21 PM'
                                }, {
                                    message: 'Testing message',
                                    name: 'You',
                                    time: '8.11.18, 2:21 PM'
                                }, {
                                    message: 'Testing message',
                                    name: 'You',
                                    time: '8.11.18, 2:21 PM'
                                }, {
                                    message: 'Testing message',
                                    time: '8.11.18, 2:21 PM'
                                }, {
                                    message: 'Testing message',
                                    time: '8.11.18, 2:21 PM'
                                }, {
                                    message: 'Testing message',
                                    time: '8.11.18, 2:21 PM'
                                }, {
                                    message: 'Testing message',
                                    time: '8.11.18, 2:21 PM'
                                }, {
                                    message: 'Testing message',
                                    time: '8.11.18, 2:21 PM'
                                }, {
                                    message: 'Testing message',
                                    time: '8.11.18, 2:21 PM'
                                }, {
                                    message: 'Testing message',
                                    time: '8.11.18, 2:21 PM'
                                }, {
                                    message: 'Testing message',
                                    time: '8.11.18, 2:21 PM'
                                }, {
                                    message: 'Testing message',
                                    time: '8.11.18, 2:21 PM'
                                }, {
                                    message: 'Testing message',
                                    time: '8.11.18, 2:21 PM'
                                }, {
                                    message: 'Testing message',
                                    name: 'You',
                                    time: '8.11.18, 2:21 PM'
                                }, {
                                    message: 'Testing message',
                                    name: 'You',
                                    time: '8.11.18, 2:21 PM'
                                }, {
                                    message: 'Testing message',
                                    name: 'You',
                                    time: '8.11.18, 2:21 PM'
                                },
                                {
                                    message: `Testing message\nTesting message\nTesting message\nTesting message\nTesting message\nTesting message\nTesting message\nTesting message\nTesting message\nTesting message\nTesting message\nTesting message\nTesting message\nTesting message\nTesting message\n`,
                                    name: 'You',
                                    time: '8.11.18, 2:21 PM'
                                },
                                {
                                    message: 'Testing message',
                                    name: 'You',
                                    time: '8.11.18, 2:21 PM'
                                }, {
                                    message: 'Testing message',
                                    name: 'You',
                                    time: '8.11.18, 2:21 PM'
                                }, {
                                    message: 'last message',
                                    time: '8.11.18, 2:21 PM'
                                }]}
                            keyExtractor={(item, index) => index + ''}
                            renderItem={({ item, index }) => {
                                return item.name
                                    ? <ChatBubble
                                        bubbleName={item.name}
                                        messageTime={item.time}
                                        message={item.message}
                                        bubbleStyle={styles.friendChatBubble}
                                        bubbleNameStyle={styles.friendName}
                                    />
                                    : <ChatBubble
                                        bubbleName='Me'
                                        messageTime={item.time}
                                        message={item.message}
                                    />
                            }}
                        />
                    </View>
                    <Item style={styles.msgInputBoxContainer}>
                        <IconButton style={styles.footerLeftIcon} iconProps={{ name: 'md-attach', type: 'Ionicons' }} />
                        <TextInput placeholder='Type a message' style={{ flex: 1 }} onFocus={this.onFocusTextInput} onBlur={this.onBlurTextInput} />
                        <IconButton iconProps={{ name: 'md-send', type: 'Ionicons', style: { color: APP_COMMON_STYLES.headerColor } }} />
                    </Item>
                    <ShifterButton onPress={this.showAppNavigation} containerStyles={styles.shifterContainer} />
                </ImageBackground>
            </View>
        </View >
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    return { user };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Chat);