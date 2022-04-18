import React from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { APP_COMMON_STYLES, CUSTOM_FONTS } from '../../constants';
import { DefaultText } from '../labels';
import { Icon as NBIcon } from 'native-base';

export const ChatBubble = ({ bubbleStyle, showSelectionCircle, messageTimeStyle, messageStyle, bubbleName, messageTime, messageDate, message, onLongPress = null, onPress = null, selectedMessage, circleStyle }) => (
    <TouchableWithoutFeedback onPress={onPress} activeOpacity={onLongPress ? 0.7 : 1} onLongPress={onLongPress} style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        <View style={{ flexDirection: 'row', flex: 1 }}>
            <View style={{ flex: 1 }}>
                {
                    bubbleName || messageDate
                        ? <View style={{ height: 15, marginTop: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
                            <DefaultText style={[styles.bubbleName]}>{bubbleName || ''}</DefaultText>
                        </View>
                        : <View style={{ height: 5 }} />
                }
                <View style={[styles.chatBubble, bubbleStyle]}>
                    <DefaultText style={[styles.message, messageStyle]}>{message}</DefaultText>
                    <DefaultText style={[styles.messageTime, messageTimeStyle]}>{messageTime}</DefaultText>
                </View>
            </View>
            {
                showSelectionCircle
                    ? <View style={[styles.circle, { marginTop: bubbleName ? 15 : 0 }, circleStyle, { backgroundColor: selectedMessage ? APP_COMMON_STYLES.infoColor : 'rgba(255,255,255, 0.4)' }]}>
                        {
                            selectedMessage
                                ? <NBIcon name='check' type='Entypo' style={{ color: '#FFFFFF', left: 2, fontSize: 24.5, marginRight: 5 }} />
                                : null
                        }
                    </View>
                    : null
            }
        </View>
    </TouchableWithoutFeedback >
);

const styles = StyleSheet.create({
    highlightStyle: {
        backgroundColor: '#99C8F7'
    },
    chatBubble: {
        paddingTop: 11,
        width: 215,
        marginRight: 7,
        maxWidth: 215,
        borderRadius: 9,
        borderBottomLeftRadius: 9,
        borderBottomRightRadius: 9,
        backgroundColor: '#fff',
        alignSelf: 'flex-start',
    },
    chatBubbleHeader: {
        flexDirection: 'row',
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
    },
    circle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginLeft: 'auto',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center'
    }
});