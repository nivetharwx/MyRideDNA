import React, { Component } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TouchableWithoutFeedback, PanResponder, Animated } from 'react-native';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, CUSTOM_FONTS } from '../../constants';
import { DefaultText } from '../labels';
import { IconButton } from '../buttons';

const FIXED_CIRCLE_SIZE = 15
const SLIDER_HANLDE_SIZE = 25;
const SLIDER_WIDTH = 250;
const CURSOR_VALUE_BOX_WIDTH = 54;
const CURSOR_CONNECTOR_WIDTH = 4;
const SLIDER_H_MARGIN = (CURSOR_VALUE_BOX_WIDTH / 2) - (FIXED_CIRCLE_SIZE / 2);
export class Slider extends Component {
    _leftPanResponder = null;
    _lastHandlePosition = 0;
    constructor(props) {
        super(props);
        this._leftPanResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: () => true,
            onPanResponderMove: this._handlePanResponderMove,
            onPanResponderEnd: this._hanldePanResponderEnd,
        });
        this.state = {
            sliderHandlePosition: 0,
        }
    }

    _handlePanResponderMove = (event, gesture) => {
        const isSlidingRight = gesture.dx > 0;
        if (isSlidingRight) {
            if (this._lastHandlePosition === SLIDER_WIDTH) return;
            if (this._lastHandlePosition > 0) {
                this.setState({ sliderHandlePosition: Math.min(this._lastHandlePosition + gesture.dx, SLIDER_WIDTH) });
            } else {
                this.setState({ sliderHandlePosition: Math.min(gesture.dx, SLIDER_WIDTH) });
            }
        } else {
            if (this._lastHandlePosition === 0) return;
            this.setState({ sliderHandlePosition: Math.max(this._lastHandlePosition + gesture.dx, 0) });
        }
    }

    _hanldePanResponderEnd = (event, gesture) => {
        this.props.onChangeRadiusValue(this.state.sliderHandlePosition);
        this._lastHandlePosition = this.state.sliderHandlePosition;
    }

    render() {
        const { sliderLineStyle, sliderCircleStyle } = this.props;
        const { sliderHandlePosition } = this.state;
        return (
            <View style={{ alignSelf: 'center', height: styles.endPointCont.top + 10 + SLIDER_HANLDE_SIZE + FIXED_CIRCLE_SIZE, width: (FIXED_CIRCLE_SIZE + SLIDER_WIDTH + CURSOR_VALUE_BOX_WIDTH) }}>
                {
                    Math.round(sliderHandlePosition) > 0 && sliderHandlePosition < SLIDER_WIDTH ?
                        <View style={[styles.cursorValueBoxCont, { left: (FIXED_CIRCLE_SIZE / 2) - (CURSOR_CONNECTOR_WIDTH / 2) + sliderHandlePosition }]}>
                            <View style={[styles.cursorValueBox]}>
                                <DefaultText style={styles.cursorValue}>{Math.round(sliderHandlePosition)}</DefaultText>
                            </View>
                            <View style={styles.connectorLine} />
                        </View>
                        : null
                }
                <View style={styles.endPointCont}>
                    <View style={[styles.fixedCircle, { backgroundColor: sliderHandlePosition > 0 ? '#2B77B4' : '#fff', borderWidth: sliderHandlePosition > 0 ? 0 : 1 }]} />
                    <DefaultText style={[styles.label, { color: '#2B77B4', left: -8 }]}>NEARBY</DefaultText>
                </View>
                <View style={[styles.endPointCont, { left: styles.sliderLine.left + styles.sliderLine.width }]}>
                    <View style={styles.fixedCircle} />
                    <DefaultText style={[styles.label, { color: '#585756', left: -5 }]}>250</DefaultText>
                </View>
                <View style={[styles.sliderLine, sliderLineStyle]} />
                <View style={[styles.highlightedLine, { width: sliderHandlePosition }]} />
                <View {...this._leftPanResponder.panHandlers} style={[styles.cursor, { left: (SLIDER_H_MARGIN) + sliderHandlePosition }, sliderCircleStyle]} />
                {/* <View style={styles.labelContainer}>
                    <DefaultText style={[styles.label, { color: '#2B77B4' }]}>NEARBY</DefaultText>
                    <DefaultText style={[styles.label, { color: '#585756', marginRight: 7 }]}>250</DefaultText>
                </View> */}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    sliderLine: {
        width: SLIDER_WIDTH,
        borderWidth: 1,
        borderColor: '#707070',
        marginTop: 40 + SLIDER_HANLDE_SIZE / 2,
        left: SLIDER_H_MARGIN + (FIXED_CIRCLE_SIZE / 2)
    },
    endPointCont: {
        position: 'absolute',
        top: 40 + SLIDER_HANLDE_SIZE / 2 - FIXED_CIRCLE_SIZE / 2 + 1,
        left: SLIDER_H_MARGIN,
    },
    fixedCircle: {
        height: FIXED_CIRCLE_SIZE,
        width: FIXED_CIRCLE_SIZE,
        borderRadius: 7.5,
        borderWidth: 1,
        borderColor: '#707070',
        backgroundColor: '#fff',
    },
    cursor: {
        top: 40 - 1,
        position: 'absolute',
        height: SLIDER_HANLDE_SIZE,
        width: SLIDER_HANLDE_SIZE,
        borderRadius: SLIDER_HANLDE_SIZE / 2,
        backgroundColor: '#2B77B4'
    },
    highlightedLine: {
        borderWidth: 2,
        borderColor: '#2B77B4',
        position: 'absolute',
        top: 40 + SLIDER_HANLDE_SIZE / 2,
        left: SLIDER_H_MARGIN + (FIXED_CIRCLE_SIZE / 2)
    },
    cursorValueBoxCont: {
        position: 'absolute',
        flexDirection: 'column',
        height: 40,
    },
    cursorValueBox: {
        height: 32,
        width: CURSOR_VALUE_BOX_WIDTH,
        borderWidth: 3,
        borderColor: '#2B77B4',
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    connectorLine: {
        height: 8,
        width: CURSOR_CONNECTOR_WIDTH,
        backgroundColor: '#2B77B4',
        left: (CURSOR_VALUE_BOX_WIDTH / 2 - CURSOR_CONNECTOR_WIDTH / 2)
    },
    cursorValue: {
        fontFamily: CUSTOM_FONTS.robotoBold,
        fontSize: 15,
        color: '#2B77B4',
    },
    labelContainer: {
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        fontFamily: CUSTOM_FONTS.robotoBold,
        fontSize: 12,
        marginTop: 10,
    },

});