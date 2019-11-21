import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TouchableWithoutFeedback } from 'react-native';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, CUSTOM_FONTS } from '../../constants';
import { DefaultText } from '../labels';

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

export const ChatBubble = ({ bubbleStyle, bubbleHeaderStyle, bubbleNameStyle, messageTimeStyle, messageStyle, bubbleName, messageTime, messageDate, message, onLongPress, onPress, selectedMessage }) => (

    <TouchableWithoutFeedback onPress={() => onPress ? onPress() : null} activeOpacity={onLongPress ? 0.7 : 1} onLongPress={() => onLongPress && onLongPress()} style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        {
            selectedMessage ?
                <View>
                    {
                        bubbleName || messageDate
                            ? <View style={{ height: 15, marginTop: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
                                <DefaultText style={[styles.bubbleName]}>{bubbleName || ''}</DefaultText>
                                <DefaultText style={[styles.bubbleDate]}>{messageDate}</DefaultText>
                            </View>
                            : <View style={{ height: 15, marginTop: 5 }} />
                    }
                    <View style={[styles.chatBubble, bubbleStyle, styles.highlightStyle]}>
                        <DefaultText style={[styles.message, messageStyle]}>{message}</DefaultText>
                        <DefaultText style={[styles.messageTime, messageTimeStyle]}>{messageTime}</DefaultText>
                    </View>
                </View>
                :
                <View>
                    {
                        bubbleName || messageDate
                            ? <View style={{ height: 15, marginTop: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
                                <DefaultText style={[styles.bubbleName]}>{bubbleName || ''}</DefaultText>
                                <DefaultText style={[styles.bubbleDate]}>{messageDate}</DefaultText>
                            </View>
                            : <View style={{ height: 15, marginTop: 5 }} />
                    }
                    <View style={[styles.chatBubble, bubbleStyle]}>
                        <DefaultText style={[styles.message, messageStyle]}>{message}</DefaultText>
                        <DefaultText style={[styles.messageTime, messageTimeStyle]}>{messageTime}</DefaultText>
                    </View>
                </View>
        }

    </TouchableWithoutFeedback>
);

const styles = StyleSheet.create({
    highlightStyle: {
        backgroundColor: '#99C8F7'
    },
    chatBubble: {
        // paddingBottom: 8,
        // paddingTop: 8,
        // paddingHorizontal: 20,
        paddingTop: 11,
        width: 215,
        // minHeight: heightPercentageToDP(8),
        maxWidth: 215,
        borderRadius: 9,
        borderBottomLeftRadius: 9,
        borderBottomRightRadius: 9,
        backgroundColor: '#fff',
        alignSelf: 'flex-start',
    },
    chatBubbleHeader: {
        flexDirection: 'row',
        // paddingBottom: 5,
    },
    message: {
        paddingHorizontal: 20,
        fontFamily: CUSTOM_FONTS.roboto
    },
    bubbleName: {
        color: '#C4C4C4',
        fontSize: 10,
        letterSpacing: 0.8,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    bubbleDate: {
        color: '#8D8D8D',
        fontSize: 10,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    messageTime: {
        alignSelf: 'flex-end',
        fontSize: 10,
        paddingRight: 5,
        paddingBottom: 2,
        letterSpacing: 0.8,
        fontFamily: CUSTOM_FONTS.robotoBold
        // fontStyle: 'italic',
        // marginRight: 5,
        // marginTop: 5,
        // color: '#fff',
        // height: 17
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