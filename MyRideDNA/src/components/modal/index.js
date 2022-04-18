import React, { Component, useEffect } from 'react';
import { connect } from 'react-redux';
import {
    StyleSheet, SafeAreaView, Modal, TouchableOpacity, ScrollView, View,
    TouchableWithoutFeedback, ImageBackground, PanResponder, Animated, Image, Dimensions
} from 'react-native';
import { ImageButton, IconButton, LinkButton } from '../buttons';
import { PageKeys, heightPercentageToDP, widthPercentageToDP, IS_ANDROID, APP_COMMON_STYLES, CUSTOM_FONTS, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, GET_PICTURE_BY_ID, WindowDimensions } from '../../constants';
import { BasicHeader } from '../headers';
import { appNavMenuVisibilityAction } from '../../actions';
import { DefaultText } from '../labels';
import { BlurView, VibrancyView } from "@react-native-community/blur";
import FitImage from 'react-native-fit-image';
import { ImageLoader } from '../loader';
import RoadFeedIcon from '../../assets/img/road-feed.svg'

NUM_OF_DESC_LINES = 3;
export const MenuModal = ({ isVisible, onClose, onPressNavMenu, activeMenu, notificationCount, messageCount, hideAppNavMenu, leftIconPress = null, alignCloseIconLeft = false, ...otherProps }) => {
    return (
        isVisible
            ? <Modal
                animationType="slide"
                transparent={true}
                visible={isVisible}
                onRequestClose={onClose}>
                <View style={{ height: heightPercentageToDP(100), width: widthPercentageToDP(100), backgroundColor: '#000000D5', flex: 1 }}>
                    <View style={{ flex: 1, alignItems: 'center',justifyContent:'center' }}>
                        <View style={styles.rowContainer}>
                            <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-atlas.png')} imgStyles={[styles.navIconImage, { marginLeft: 30, marginRight: 45 }]} onPress={() => onPressNavMenu({ screenKey: PageKeys.RIDES })} />
                            <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-lets-ride.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu({ screenKey: PageKeys.MAP })} />
                        </View>
                        <View style={styles.rowContainer}>
                            <TouchableOpacity style={[styles.navIconImage, { width: 100, height: 100, marginTop: 0, marginRight: 30, marginLeft:24 }]} activeOpacity={0.7} onPress={() => onPressNavMenu({ screenKey: PageKeys.NOTIFICATIONS })}>
                                <ImageBackground style={{ width: null, height: null, flex: 1 }} source={require('../../assets/img/menu-notifications.png')}>
                                    {
                                        notificationCount > 0
                                            ? <View style={{
                                                position: 'absolute', width: 29, height: 29, borderRadius: 29,
                                                backgroundColor: '#0076B5', top: 3, right: 7, borderWidth: 2, borderColor: '#fff', justifyContent: 'center', alignItems: 'center'
                                            }}>
                                                <DefaultText style={{ color: '#fff', fontFamily: CUSTOM_FONTS.roboto, fontSize: widthPercentageToDP(3) }}>{notificationCount}</DefaultText>
                                            </View>
                                            : null
                                    }
                                </ImageBackground>
                            </TouchableOpacity>
                            <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-offers.png')} imgStyles={[styles.navIconImage, { marginTop: 10 }]} onPress={() => onPressNavMenu({ screenKey: PageKeys.OFFERS })} />
                        </View>
                        <View style={[styles.rowContainer, { marginTop: 15 }]}>
                            <TouchableOpacity style={[styles.navIconImage, { width: 72, height: 82, marginTop: 10, marginRight: 0, marginLeft:18 }]} activeOpacity={0.7} onPress={() => onPressNavMenu({ screenKey: PageKeys.CHAT_LIST })}>
                                <ImageBackground style={{ width: null, height: null, flex: 1 }} source={require('../../assets/img/menu-messaging.png')}>
                                    {
                                        messageCount > 0
                                            ? <View style={{
                                                position: 'absolute', width: 29, height: 29, borderRadius: 29,
                                                backgroundColor: '#0076B5', top: -4, right: -6, borderWidth: 2, borderColor: '#fff', justifyContent: 'center', alignItems: 'center'
                                            }}>
                                                <DefaultText style={{ color: '#fff', fontFamily: CUSTOM_FONTS.roboto, fontSize: widthPercentageToDP(3) }}>{messageCount}</DefaultText>
                                            </View>
                                            : null
                                    }
                                </ImageBackground>
                            </TouchableOpacity>
                            <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-road-buddies.png')} imgStyles={[styles.navIconImage, { width: 107, height: 107, marginLeft: 70, marginHorizontal: 0 }]} onPress={() => onPressNavMenu({ screenKey: PageKeys.FRIENDS })} />
                            {/* <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-messaging.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu({ screenKey: PageKeys.CHAT_LIST })} /> */}
                        </View>
                        <View style={styles.rowContainer}>
                            <TouchableOpacity style={{ height: 87, width: 87, marginLeft: 34, marginRight: 40 }} onPress={() => onPressNavMenu({ screenKey: PageKeys.NEWS_FEED })}><RoadFeedIcon /></TouchableOpacity>
                            {/* <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-stories-from-the-road.png')} imgStyles={[styles.navIconImage, { width: 105, height: 105, marginTop:-10, marginLeft:45 }]} onPress={() => onPressNavMenu({ screenKey: PageKeys.NEWS_FEED })} /> */}
                            <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-profile.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu({ screenKey: PageKeys.PROFILE, params: { tabProps: { activeTab: 0 } } })} />
                        </View>
                        <View style={styles.rowContainer}>
                            <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-garage.png')} imgStyles={[styles.navIconImage, { marginLeft: 34, marginRight: 45 }]} onPress={() => onPressNavMenu({ screenKey: PageKeys.PROFILE, params: { tabProps: { activeTab: 1 } } })} />
                            <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-settings.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu({ screenKey: PageKeys.SETTINGS })} />
                        </View>
                        {/* <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-rides.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu({ screenKey: PageKeys.RIDES })} /> */}
                        {/* <TouchableOpacity style={{ marginHorizontal: 35, marginVertical: 15 }} activeOpacity={0.7} onPress={() => onPressNavMenu({ screenKey: PageKeys.NOTIFICATIONS)}>
                            <View style={styles.navIconImage}>
                                <ImageBackground style={{ width: null, height: null, flex: 1 }} source={require('../../assets/img/menu-notifications.png')}>
                                    {
                                        notificationCount > 0
                                            ? <View style={{
                                                position: 'absolute', width: widthPercentageToDP(7), height: widthPercentageToDP(7), borderRadius: widthPercentageToDP(6),
                                                backgroundColor: '#0076B5', top: 11, right: 10, borderWidth: widthPercentageToDP(1), borderColor: '#fff', justifyContent: 'center', alignItems: 'center'
                                            }}>
                                                <DefaultText  style={{ color: '#fff', fontWeight: 'bold', fontSize: widthPercentageToDP(3) }}>{notificationCount}</DefaultText>
                                            </View>
                                            : null
                                    }
                                </ImageBackground>
                            </View>
                        </TouchableOpacity> */}
                        {/* <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-notifications.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu({ screenKey: PageKeys.NOTIFICATIONS)} /> */}
                    </View>
                    <BasicHeader showShadow={false} style={[{ backgroundColor: 'transparent', paddingHorizontal: 10 }, IS_ANDROID || Dimensions.get("screen").height<670 ? null : { marginTop: 20 }]} headerHeight={heightPercentageToDP(8.5)}
                        // leftIconProps={{ name: 'logout-variant', type: 'MaterialCommunityIcons', style: { marginLeft: 10, fontSize: widthPercentageToDP(8), color: '#AFAFAF' }, onPress: () => { leftIconPress() } }}
                        leftComponent={<LinkButton title={'LOGOUT'} titleStyle={{ color: '#AFAFAF', fontSize: 13, fontFamily: CUSTOM_FONTS.roboto, letterSpacing: 0.65 }} onPress={() => { leftIconPress() }} />}
                        leftComponentStyle={{ backgroundColor: '#000000', paddingHorizontal: 10, paddingVertical: 3 }}
                        rightIconProps={{ name: 'close', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(8), color: '#AFAFAF' }, onPress: hideAppNavMenu }} />
                </View>
                {otherProps.children}
            </Modal>
            : null
    )
};
const mapStateToProps = (state) => {
    return {};
}
const mapDispatchToProps = (dispatch) => {
    return {
        hideAppNavMenu: () => dispatch(appNavMenuVisibilityAction(false)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(MenuModal);

export const BaseModal = ({ isVisible, onCancel, onPressOutside, offSpaceBackgroundColor, alignCenter, containerStyle, ...otherProps }) => {
    useEffect(()=>{
        console.log(isVisible)
    },[isVisible])
    return isVisible
        ? <View style={{ position: 'absolute', elevation: 10, zIndex: 999, width: '100%', height: '100%' }}>

            <Modal
                animationType="fade"
                transparent={true}
                visible={isVisible}
                onRequestClose={onCancel}>
                <SafeAreaView />
                {/* <BlurView
                    style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0 }}
                    blurType="dark"
                    blurAmount={3}
                    overlayColor={'#00000029'}
                    reducedTransparencyFallbackColor="white"> */}
                {/* <VibrancyView blurType="light" style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0 }}> */}
                <TouchableOpacity activeOpacity={1} style={[styles.fillParent, offSpaceBackgroundColor ? { backgroundColor: offSpaceBackgroundColor } : styles.modalOffSpaceBgColor]} onPress={onPressOutside}>
                    <ScrollView
                        keyboardShouldPersistTaps={'handled'}
                        directionalLockEnabled={true}
                        style={styles.fillParent}
                        contentContainerStyle={[styles.fillParent, containerStyle, alignCenter ? styles.centerContent : null]}
                    >
                        <TouchableWithoutFeedback>
                            {
                                otherProps.children
                            }
                        </TouchableWithoutFeedback>
                    </ScrollView>
                </TouchableOpacity>
                {/* </BlurView> */}
                {/* </VibrancyView> */}
            </Modal>
        </View>
        : null
}

export class GesturedCarouselModal extends Component {
    _panResponder = null;
    _initialTouches = null;
    _initialPageX = null;
    constructor(props) {
        super(props);
        this.state = {
            position: new Animated.ValueXY(),
            isZoomEnable: (this.props.pictureIds && this.props.pictureIds[0] && this.props.pictureIds[0].id),
            isGestureEnable: (this.props.pictureIds && this.props.pictureIds[0] && this.props.pictureIds[0].id),
            scrollEnabled: true,
            scaleValue: 1,
            isZooming: false,
            isDraggingDown: false,
            activeIndex: this.props.initialCarouselIndex || 0,
            top: 0,
            left: 0,
            showMoreSections: {},
            showReadLessOption: {}
        };
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => this.state.isZoomEnable || this.state.isGestureEnable,
            onMoveShouldSetPanResponder: () => this.state.isZoomEnable || this.state.isGestureEnable,
            onMoveShouldSetPanResponderCapture: () => this.state.isZoomEnable || this.state.isGestureEnable,
            onPanResponderGrant: this._handlePanResponderGrant,
            onPanResponderMove: this._handlePanResponderMove,
            // onPanResponderRelease: this._handlePanResponderRelease,
            onPanResponderEnd: this._hanldePanResponderEnd,
        });
    }

    _handlePanResponderGrant = (event, gestureState) => {
        this._initialTouches = event.nativeEvent.touches;
        if (this._initialTouches.length === 1) {
            this._initialPageX = event.nativeEvent.pageX;
        }
    }

    _handlePanResponderMove = (event, gesture) => {
        if (this.state.isZoomEnable) {
            event.nativeEvent.touches.length === 2 && this._handleMultiTouchGestures(event, gesture);
        }
        if (this.state.isGestureEnable && this.state.isZooming === false) {
            event.nativeEvent.touches.length === 1 && this._handleSingleTouchGestures(event, gesture);
        }
    }

    // _handlePanResponderRelease = (event, gesture) => { }

    _hanldePanResponderEnd = (event, gesture) => {
        if (gesture.dy != 120) {
            this.state.isDraggingDown === true && this.setState({ isDraggingDown: false });
            this.state.position.setValue({ x: 0, y: 0 });
        }
        if (this.state.isZooming === true) {
            setTimeout(() => this.setState({ scrollEnabled: true, scaleValue: 1, isZooming: false, top: 0, left: 0 }), 50);
        } else {
            const distance = this._initialPageX - event.nativeEvent.pageX;
            if (distance > 30) {
                if (this.state.activeIndex + 1 < this.props.pictureIds.length) {
                    this.setState(prevState => ({ activeIndex: prevState.activeIndex + 1 }));
                }
            } else if (distance < -30) {
                if (this.state.activeIndex > 0) {
                    this.setState(prevState => ({ activeIndex: prevState.activeIndex - 1 }));
                }
            }
        }
    }

    _handleSingleTouchGestures = (event, gesture) => {
        if (gesture.dy > 120) {
            this.state.position.setValue({ x: 0, y: 0 });
            this.state.scrollEnabled && this.closeSwipingPictureModal();
        } else if (gesture.dy > 30) {
            this.state.isDraggingDown === false && this.setState({ isDraggingDown: true });
            this.state.position.setValue({ x: 0, y: gesture.dy });
        }
    }

    _handleMultiTouchGestures = (event, gesture) => {
        const touches = event.nativeEvent.touches;
        let currentDistance = this.getDistance(touches);
        let initialDistance = this.getDistance(this._initialTouches);
        let newScale = this.getScale(currentDistance, initialDistance);
        if (newScale >= 1) {
            this.state.position.setValue({ x: gesture.dx, y: gesture.dy });
            this.setState({
                scrollEnabled: false, scaleValue: newScale, isZooming: true,
                top: 0 + touches[0].pageY - this._initialTouches[0].pageY,
                left: 0 + touches[0].pageX - this._initialTouches[0].pageX,
            });
        }
    }

    getDistance = (touches) => {
        const [a, b] = touches;
        if (a == null || b == null) return 0;
        return Math.sqrt(
            this.pow2abs(a.pageX, b.pageX) + this.pow2abs(a.pageY, b.pageY)
        );
    }

    pow2abs = (a, b) => Math.pow(Math.abs(a - b), 2);

    getScale = (currentDistance, initialDistance) => {
        const SCALE_MULTIPLIER = 1;
        return currentDistance / initialDistance * SCALE_MULTIPLIER;
    }

    closeSwipingPictureModal = () => this.props.onCancel();

    onDescriptionLayout({ nativeEvent: { lines } }, id) {
        !this.state.showReadLessOption[id] && lines.length > NUM_OF_DESC_LINES && this.setState(prevState => ({ showMoreSections: { ...prevState.showMoreSections, [id]: true } }));
    }

    showHideContent = (isVisible, id) => {
        if (isVisible) {
            this.setState(prevState => ({ showMoreSections: { [id]: false }, showReadLessOption: { [id]: true } }))
        }
        else {
            this.setState(prevState => ({ showMoreSections: { [id]: true }, showReadLessOption: { [id]: false } }))
        }
    }

    render() {
        const { isVisible, onCancel, alignCenter, containerStyle, pictureIds, headerChildren } = this.props;
        const { scaleValue, position, isZooming, isDraggingDown, activeIndex } = this.state;
        console.log(pictureIds[activeIndex].id,'///// previewing image')
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={isVisible}
                onRequestClose={onCancel}>
                <View style={[{ flex: 1 }, styles.modalOffSpaceBgColor]}>
                    {
                        isZooming
                            ? null
                            : <SafeAreaView>
                                <View style={[styles.gestureModalHeader]}>

                                    <View style={{ flexDirection: 'row' }}>
                                        <View style={styles.gestureModalHeaderChildContainer}>{headerChildren}</View>
                                        <IconButton iconProps={{ name: 'md-close', type: 'Ionicons', style: styles.closeIcon }} onPress={this.closeSwipingPictureModal} />
                                    </View>
                                </View>
                            </SafeAreaView>
                    }
                    <View style={[{ flex: 1 }]} {...this._panResponder.panHandlers}>
                        <ScrollView
                            directionalLockEnabled={true}
                            contentContainerStyle={[{ flex: 1 }, containerStyle, alignCenter ? styles.centerContent : null, isZooming ? { paddingTop: styles.gestureModalHeader.height } : null]}
                            style={{ flex: 1 }}>
                            <TouchableWithoutFeedback>
                               
                                <View style={{ flex: 1 }}>
                                    <Animated.View style={[{ flex: 1 }, { transform: position.getTranslateTransform() }]}>
                                        <View style={{ height: heightPercentageToDP(100) - styles.gestureModalHeader.height - 20, justifyContent: 'center' }}>
                                            {
                                                
                                                ( pictureIds && pictureIds[activeIndex] && pictureIds[activeIndex].id
                                                    ? <TouchableOpacity activeOpacity={1} style={isZooming ? { width: widthPercentageToDP(100), aspectRatio: 1, zIndex: 999, position: 'absolute', top: this.state.top, left: this.state.left, transform: [{ scale: scaleValue }], zIndex: 999 } : { width: widthPercentageToDP(100), aspectRatio: 1, }}>
                                                        <Image source={{ uri: `${GET_PICTURE_BY_ID}${pictureIds[activeIndex].id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}` }} style={{ width: null, height: null, flex: 1 }} resizeMode='contain' />
                                                    </TouchableOpacity>
                                                    : null )
                                            }
                                            {
                                                pictureIds.length > 1 && <View style={styles.pictureNumbercont}>
                                                    <DefaultText style={{ color: '#000000',fontSize:11}}>{activeIndex + 1}/{pictureIds.length}</DefaultText>
                                                </View>
                                            }
                                            {
                                                isZooming || isDraggingDown
                                                    ? null
                                                    : pictureIds && pictureIds[activeIndex]
                                                        ? <View style={this.state.showReadLessOption[pictureIds[activeIndex].id] ? styles.showMoredescription : styles.descriptionCont}>
                                                            <DefaultText numberOfLines={this.state.showReadLessOption[pictureIds[activeIndex].id] ? null : NUM_OF_DESC_LINES} onTextLayout={(evt) => this.onDescriptionLayout(evt, pictureIds[activeIndex].id)} style={styles.description}>{pictureIds[activeIndex].description}</DefaultText>{this.state.showMoreSections[pictureIds[activeIndex].id] ? <LinkButton titleStyle={{ color: '#fff' }} style={{ alignSelf: 'center' }} title={'see more'} onPress={() => this.showHideContent(true, pictureIds[activeIndex].id)} /> : null}{this.state.showReadLessOption[pictureIds[activeIndex].id] ? <LinkButton titleStyle={{ color: '#fff' }} style={{ alignSelf: 'center' }} title={'see less'} onPress={() => this.showHideContent(false, pictureIds[activeIndex].id)} /> : null}
                                                        </View>
                                                        : null
                                            }
                                        </View>
                                    </Animated.View>
                                </View>
                            </TouchableWithoutFeedback>
                        </ScrollView>
                    </View>
                </View>
                {this.props.children}
            </Modal >
        );
    }
}

const styles = StyleSheet.create({
    navIconImage: {
        width: 84,
        height: 84,
        borderRadius: 84,
        marginHorizontal: 35
    },
    fillParent: {
        width: '100%',
        height: '100%'
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOffSpaceBgColor: {
        backgroundColor: 'rgba(0,0,0,0.7)'
    },
    safePadding: {
        paddingTop: heightPercentageToDP(2)
    },
    rowContainer: {
        alignSelf: 'center',
        flexDirection: 'row',
        marginTop: 25
    },
    closeIcon: {
        fontSize: 28,
        color: '#fff'
    },
    gestureModalHeader: {
        height: APP_COMMON_STYLES.headerHeight,
        width: widthPercentageToDP(100),
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingRight: 20,
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    gestureModalHeaderChildContainer: {
        marginRight: 20,
    },
    descriptionCont: {
        marginLeft: 25,
        marginTop: 10,
        marginBottom: 100,
        maxWidth: widthPercentageToDP(100) - 50,
    },
    showMoredescription: {
        position: 'absolute',
        top: 10,
        backgroundColor: 'rgba(0,0,0, 0.6)',
        height: heightPercentageToDP(100) - (2.3 * APP_COMMON_STYLES.headerHeight),
        bottom: 10,
        paddingHorizontal: 25,
    },
    description: {
        fontFamily: CUSTOM_FONTS.roboto,
        letterSpacing: 0.4,
        fontSize: 16,
        color: '#fff',
    },
    pictureNumbercont: {
        height:25, 
        width:25,
        borderRadius:12,
        backgroundColor: '#FFFFFF',
        borderWidth:1,
        borderColor:'#000000',
        marginLeft: 10,
        top:-400,
        left:45,
        justifyContent:'center',
        alignItems:'center'
    }
});