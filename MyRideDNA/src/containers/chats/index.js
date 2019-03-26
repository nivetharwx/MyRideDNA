import React, { Component } from 'react';
import { View, ImageBackground, Text, StatusBar, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import styles from './styles';
import { appNavMenuVisibilityAction } from '../../actions';
import { ShifterButton, IconButton } from '../../components/buttons';
import { Thumbnail } from 'native-base';
import { APP_COMMON_STYLES } from '../../constants';
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
                        <Thumbnail source={require('../../assets/img/friend-profile-pic.png')} />
                        <Text style={styles.chatHeaderText}>Name of group here</Text>
                        <IconButton style={styles.headerIconRight} iconProps={{ name: 'md-more', type: 'Ionicons', style: { color: '#fff' } }} />
                    </View>
                    <View style={styles.rootContainer}>
                        <ScrollView style={styles.chatArea}>
                            <ChatBubble
                                bubbleName='Me'
                                messageTime='8.11.18, 2:21 PM'
                                message='Talk'
                            />
                            <ChatBubble
                                bubbleName='You'
                                messageTime='8.11.18, 2:22 PM'
                                message='Reply'
                                bubbleStyle={styles.friendChatBubble}
                                bubbleNameStyle={styles.friendName}
                            />
                            <ChatBubble
                                bubbleName='You'
                                messageTime='8.11.18, 2:22 PM'
                                message='Talk again'
                                bubbleStyle={styles.friendChatBubble}
                                bubbleNameStyle={styles.friendName}
                            />
                            <ChatBubble
                                bubbleName='Me'
                                messageTime='8.11.18, 2:21 PM'
                                message='Talk again and further discussion'
                            />
                            <ChatBubble
                                bubbleName='You'
                                messageTime='8.11.18, 2:22 PM'
                                message='Talk again'
                                bubbleStyle={styles.friendChatBubble}
                                bubbleNameStyle={styles.friendName}
                            />
                            <ChatBubble
                                bubbleName='Me'
                                messageTime='8.11.18, 2:21 PM'
                                message='Talk'
                            />
                            <ChatBubble
                                bubbleName='You'
                                messageTime='8.11.18, 2:22 PM'
                                message='Reply'
                                bubbleStyle={styles.friendChatBubble}
                                bubbleNameStyle={styles.friendName}
                            />
                            <ChatBubble
                                bubbleName='You'
                                messageTime='8.11.18, 2:22 PM'
                                message='Talk again'
                                bubbleStyle={styles.friendChatBubble}
                                bubbleNameStyle={styles.friendName}
                            />
                            <ChatBubble
                                bubbleName='Me'
                                messageTime='8.11.18, 2:21 PM'
                                message={`Talk again and further discussion,
                                    talk talk talk talk talk talk talk talk
                                    talk talk talk talk talk talk talk talk
                                    talk talk talk talk talk talk talk talk
                                    talk talk talk talk talk talk talk talk
                                    talk talk talk talk talk talk talk talk
                                    talk talk talk talk talk talk talk talk
                                `}
                            />
                            <ChatBubble
                                bubbleName='You'
                                messageTime='8.11.18, 2:22 PM'
                                message='Talk again'
                                bubbleStyle={styles.friendChatBubble}
                                bubbleNameStyle={styles.friendName}
                            />
                        </ScrollView>
                    </View>
                    <ShifterButton onPress={this.toggleAppNavigation} />
                </ImageBackground>
            </View>
        </View>
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