import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TouchableWithoutFeedback } from 'react-native';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP } from '../../constants';

class Bubble extends React.PureComponent {
    render() {
        let innerChildView = this.props.children;

        if (this.props.onPress) {
            innerChildView = (
                <TouchableOpacity onPress={this.props.onPress}>
                    {this.props.children}
                </TouchableOpacity>
            );
        }

        return (
            <View style={[styles.centerContainer, this.props.style]}>
                {innerChildView}
            </View>
        );
    }
}

export const ChatBubble = ({ bubbleStyle, bubbleHeaderStyle, bubbleNameStyle, messageTimeStyle, messageStyle, bubbleName, messageTime, message, onLongPress, onPress, selectedMessage }) => (

    <TouchableWithoutFeedback onPress={() => onPress ? onPress() : null} activeOpacity={onLongPress ? 0.7 : 1} onLongPress={() => onLongPress && onLongPress()} style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        {
            selectedMessage ?
                <View style={styles.longPressColor}>
                    <View style={[styles.chatBubble, bubbleStyle, styles.longPressColor]}>
                        <View style={[styles.chatBubbleHeader, bubbleHeaderStyle]} >
                            <Text style={[styles.bubbleName, bubbleNameStyle]}>{bubbleName}</Text>
                            <Text style={[styles.messageTime, messageTimeStyle]}>{messageTime}</Text>
                        </View>
                        <Text style={[messageStyle]}>{message}</Text>
                    </View>
                </View>
                :
                <View style={[styles.chatBubble, bubbleStyle]}>
                    <View style={[styles.chatBubbleHeader, bubbleHeaderStyle]} >
                        <Text style={[styles.bubbleName, bubbleNameStyle]}>{bubbleName}</Text>
                        <Text style={[styles.messageTime, messageTimeStyle]}>{messageTime}</Text>
                    </View>
                    <Text style={[messageStyle]}>{message}</Text>
                </View>
        }

    </TouchableWithoutFeedback>
);

const styles = StyleSheet.create({
    longPressColor: {
        backgroundColor: 'rgba(97, 155, 213,0.4)',
        minHeight: heightPercentageToDP(8),
    },
    chatBubble: {
        padding: 8,
        width: widthPercentageToDP(80),
        minHeight: heightPercentageToDP(8),
        maxWidth: widthPercentageToDP(80),
        borderRadius: heightPercentageToDP(1),
        borderBottomLeftRadius: heightPercentageToDP(1),
        borderBottomRightRadius: heightPercentageToDP(1),
        marginTop: heightPercentageToDP(2),
        backgroundColor: '#fff',
        alignSelf: 'flex-start',
    },
    chatBubbleHeader: {
        flexDirection: 'row'
    },
    bubbleName: {
        color: APP_COMMON_STYLES.infoColor
    },
    messageTime: {
        fontStyle: 'italic',
        marginLeft: '2%'
    },
    container: {
        borderRadius: 30,
        position: 'absolute',
        bottom: 16,
        left: 48,
        right: 48,
        paddingVertical: 16,
        minHeight: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    centerContainer: {
        borderRadius: 10,
        position: 'absolute',
        bottom: 48,
        top: 48,
        left: 48,
        right: 48,
        padding: 16,
        minHeight: 200,
        elevation: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        alignSelf: 'center',
        zIndex: 900
    }
});