import React, { useState, PureComponent, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TouchableHighlight, ImageBackground, TouchableWithoutFeedback, Image, Animated, Easing, FlatList, PanResponder } from 'react-native';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, CUSTOM_FONTS, GET_PICTURE_BY_ID, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, PageKeys } from '../../constants';
import { Icon as NBIcon, ListItem, Left, Body, Right } from 'native-base';
import { LinkButton, IconButton, ImageButton } from '../buttons';
import { DefaultText } from '../labels';
import { ImageLoader } from '../loader';
import FitImage from 'react-native-fit-image';

export class BasicCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            actionBarAnim: new Animated.Value(0),
        };
    }

    toggleActionBar = () => {
        Animated.timing(
            this.state.actionBarAnim,
            {
                toValue: this.state.actionBarAnim.__getValue() === 0 ? heightPercentageToDP(6) : 0,
                duration: 300,
                easing: Easing.linear
            }
        ).start()
    }

    render() {
        // const { coloumns = [1, 2] } = this.this.props;
        const spin = this.state.actionBarAnim.interpolate({
            inputRange: [0, heightPercentageToDP(6)],
            outputRange: ['0deg', '180deg']
        });
        const borderNOpacity = this.state.actionBarAnim.interpolate({
            inputRange: [0, heightPercentageToDP(6)],
            outputRange: [0, 1]
        });
        return (
            <View style={[styles.container, this.props.isFlat ? null : styles.containerBorder, this.props.containerStyle]}>
                <View style={[styles.fill, this.props.isActive ? styles.activeBorder : null]}>
                    <TouchableOpacity onLongPress={this.props.onLongPress} style={styles.media}>
                        <ImageBackground resizeMode='cover' source={this.props.media} style={styles.media} />
                    </TouchableOpacity>
                    <View style={styles.content}>
                        <View style={styles.headingContainer}>
                            <View style={{ flex: 1 }}>
                                {
                                    this.props.mainHeading
                                        ? <DefaultText style={styles.mainHeader}>{this.props.mainHeading}</DefaultText>
                                        : null
                                }
                                {
                                    this.props.subHeading
                                        ? <DefaultText style={styles.subHeader}>{this.props.subHeading}</DefaultText>
                                        : null
                                }
                            </View>
                            {
                                this.props.children ?
                                    <TouchableHighlight onPress={this.toggleActionBar} underlayColor='#0076B5' style={{ width: widthPercentageToDP(10), height: widthPercentageToDP(10), borderRadius: widthPercentageToDP(5), justifyContent: 'center', alignItems: 'center' }}>
                                        <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                            <NBIcon name='chevron-down' type='Entypo' />
                                        </Animated.View>
                                    </TouchableHighlight>
                                    : null
                            }
                        </View>
                        <View style={styles.notes}>
                            <DefaultText>{this.props.notes}</DefaultText>
                        </View>
                    </View>
                    {
                        this.props.children ?
                            <Animated.View style={[styles.actionbar, { height: this.state.actionBarAnim, borderTopWidth: borderNOpacity, opacity: borderNOpacity }]}>
                                {
                                    this.props.children
                                }
                            </Animated.View>
                            : null
                    }
                </View>
            </View>
        );
    }
}

export const ThumbnailCard = ({ item, thumbnailPlaceholder, onPress, onLongPress, actions, thumbnailRef, style }) => (
    <View style={[styles.thumbnail, style]}>
        <TouchableOpacity onPress={() => onPress ? onPress() : null} activeOpacity={onLongPress ? 0.7 : 1} onLongPress={() => onLongPress && onLongPress()} style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <View style={[{
                width: widthPercentageToDP(30), height: widthPercentageToDP(30),
                borderRadius: widthPercentageToDP(15), borderWidth: 6, borderColor: '#231F20', overflow: 'hidden'
            }]} ref={elRef => thumbnailRef ? thumbnailRef(elRef) : null}>
                <Image source={item.profilePicture ? { uri: item.profilePicture } : item.profilePictureId ? null : thumbnailPlaceholder}
                    style={{ width: null, height: null, flex: 1 }} />
            </View>
            <View>
                {
                    item.isAdmin
                        ? <IconButton iconProps={{ name: 'verified-user', type: 'MaterialIcons', style: { fontSize: widthPercentageToDP(6), color: APP_COMMON_STYLES.headerColor } }} />
                        : null
                }
                <DefaultText style={{
                    fontWeight: 'bold',
                    backgroundColor: 'transparent',
                    fontSize: widthPercentageToDP(4),
                    color: item.name === 'You' ? APP_COMMON_STYLES.infoColor : '#000'
                }}
                    renderToHardwareTextureAndroid collapsable={false}>
                    {item.name}
                </DefaultText>
                {
                    item.nickname
                        ?
                        <DefaultText style={{ color: APP_COMMON_STYLES.infoColor, fontWeight: 'bold' }}>
                            {'  '}{item.nickname}
                        </DefaultText>
                        : null
                }
            </View>
            {/* <DefaultText  style={{ color: '#A1A2A6' }}>{item.email}</DefaultText> */}
        </TouchableOpacity>
        {
            Array.isArray(actions) && actions.length > 0
                ? <View style={styles.actionContainer}>
                    {
                        actions.map(action => (
                            <LinkButton key={action.title} title={action.title} titleStyle={action.titleStyle} onPress={action.onPress} />
                        ))
                    }
                </View>
                : null
        }
    </View>
);

export const SmallCard = ({ image, placeholderImage, onPress, outerContainer, imageStyle, customPlaceholder, showLoader, numberOfPicUploading, }) => (
    <View style={outerContainer}>
        <TouchableOpacity onPress={() => onPress ? onPress() : null} style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <View style={[{ height: 74, width: 74, backgroundColor: '#A9A9A9', justifyContent: 'center' }, imageStyle]}>
                {
                    image
                        ? <Image source={{ uri: image }} style={{ width: null, height: null, flex: 1 }} />
                        : placeholderImage
                            ? <Image source={placeholderImage} style={{ width: null, height: null, flex: 1 }} />
                            : customPlaceholder
                }
                {showLoader && <ImageLoader show={showLoader} />}
            </View>
            {showLoader && <DefaultText style={{ position: 'absolute', top: 10, left: 3, color: '#989898', }}>{`${numberOfPicUploading} picture being uploading`}</DefaultText>}
        </TouchableOpacity>
    </View>
);
export const SquareCard = ({ title, subtitle, placeholderImage, onPress, onLongPress, image, imageStyle, containerStyle, contentContainerStyle, placeholderBlurVal = null, showLoader, numberOfPicUploading, }) => (
    <TouchableOpacity onPress={() => onPress ? onPress() : null} onLongPress={onLongPress || null} style={[{ flexDirection: 'column' }, containerStyle]}>
        <View style={[{ height: 150, width: 150, backgroundColor: '#A9A9A9', justifyContent: 'center' }, imageStyle]}>
            {
                image
                    ? <Image source={{ uri: image }} style={{ width: null, height: null, flex: 1 }} />
                    : placeholderImage
                        ? <Image blurRadius={placeholderBlurVal} source={placeholderImage} style={{ width: null, height: null, flex: 1 }} />
                        : null
            }
            {showLoader && <ImageLoader show={showLoader} />}
        </View>
        {showLoader && <DefaultText style={{ position: 'absolute', top: 50, left: 10, color: '#989898', fontSize: 15 }}>{`${numberOfPicUploading} picture being uploading`}</DefaultText>}
        <View style={contentContainerStyle}>
            {
                title
                    ? <DefaultText numberOfLines={1} style={{ fontSize: 15, fontFamily: CUSTOM_FONTS.robotoSlabBold, color: '#000', marginTop: 6, maxWidth: imageStyle && imageStyle.width ? imageStyle.width : 150 }}>{title}</DefaultText>
                    : null
            }
            {
                subtitle
                    ? <DefaultText style={{ fontSize: 11, color: '#585756', marginTop: 2, maxWidth: imageStyle && imageStyle.width ? imageStyle.width : 150 }}>{subtitle}</DefaultText>
                    : null
            }
        </View>

    </TouchableOpacity>
);

export const HorizontalCard = ({ item, onPress, rightProps, onLongPress, actionsBar, cardOuterStyle, horizontalCardPlaceholder, righticonImage, onPressLeft, thumbnail, leftIcon, comingFrom }) => (
    <View style={[{ flex: 1, marginTop: 20, flexDirection: 'row', minWidth: widthPercentageToDP(81.5) }, cardOuterStyle]}>
        <TouchableOpacity style={{ height: 74, width: 74, flexDirection: actionsBar ? 'row' : null, }} onPress={onPressLeft} >
            {
                actionsBar && actionsBar.online
                    ? <View style={{ backgroundColor: item.isOnline ? '#81BA41' : '#C4C6C8', zIndex: 1, width: 6 }} />
                    : null
            }
            {
                thumbnail
                    ? <Image source={{ uri: thumbnail }} style={{ width: null, height: null, flex: 1 }} />
                    : horizontalCardPlaceholder
                        ? <Image source={horizontalCardPlaceholder} style={{ width: null, height: null, flex: 1 }} />
                        : leftIcon
                            ? <View style={{ flex: 1, width: null, heigh: null, backgroundColor: '#C4C6C8', justifyContent: 'center', alignItems: 'center' }}>
                                <NBIcon active name={leftIcon.name} type={leftIcon.type} style={{ fontSize: 40, color: '#707070' }} />
                            </View>
                            : <View style={{ flex: 1, width: null, heigh: null, backgroundColor: '#C4C6C8', justifyContent: 'center', alignItems: 'center' }} />
            }
        </TouchableOpacity>

        {
            // here condition is for change of middle view according to action bar is present or not
            actionsBar ?
                <View style={{ flex: 1, justifyContent: 'center', borderWidth: 1, borderColor: '#EAEAEA' }}>
                    <View style={{ flex: 1, backgroundColor: '#EAEAEA', justifyContent: 'center', alignItems: 'center' }}>
                        <DefaultText style={{ fontSize: 14, fontFamily: CUSTOM_FONTS.robotoBold, color: '#585756' }}>{item.name ? `${item.name} ${item.isAdmin ? '(Admin)' : ''}` : item.groupName ? item.groupName : null}</DefaultText>
                    </View>
                    <View style={{ flex: 1 }}>
                        {
                            // to iterate the actions array
                            actionsBar.actions && actionsBar.actions.length > 0 ?
                                <FlatList
                                    numColumns={4}
                                    columnWrapperStyle={{ justifyContent: actionsBar.actions.length === 1 ? (comingFrom && comingFrom === PageKeys.GROUP ? 'flex-end' : 'center') : actionsBar.actions.length < 3 ? 'space-around' : 'space-between', marginHorizontal: 20, marginTop: 5 }}
                                    data={actionsBar.actions}
                                    keyExtractor={() => actionsBar.actions.id}
                                    renderItem={({ item, index }) => {
                                        if (item.isIconImage) {
                                            return <ImageButton imageSrc={item.imgSrc} imgStyles={item.imgStyle} onPress={item.onPressActions} />
                                        } else {
                                            return <IconButton iconProps={{ name: item.name, type: item.type, style: { color: item.color, fontSize: 24 } }} onPress={item.onPressActions} />
                                        }
                                    }}
                                />
                                : null
                        }
                    </View>
                </View>
                :
                <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#EAEAEA', height: 74 }}>
                    <View style={{ marginLeft: widthPercentageToDP(3) }}>
                        <DefaultText fontFamily={CUSTOM_FONTS.robotoBold} style={{ fontSize: 13, color: '#585756' }}>{item.name}</DefaultText>
                        <DefaultText fontFamily={CUSTOM_FONTS.robotoSlabBold} style={{ fontSize: 10, color: '#9A9A9A' }}>{item.nickname}</DefaultText>
                    </View>
                </View>
        }
        {
            // here condition is when right view is present or not
            rightProps
                ? rightProps.righticonImage
                    ? <ImageButton containerStyles={{ height: 74, width: 74, justifyContent: 'center', alignItems: 'center', backgroundColor: rightProps.imgBGColor ? rightProps.imgBGColor : '#C4C6C8' }} imageSrc={rightProps.righticonImage} imgStyles={[{ height: 27, width: 27 }, rightProps.imgStyles]} onPress={onPress} />
                    : rightProps.rightIcon ?
                        <View style={{ height: 74, width: 74, justifyContent: 'center', alignItems: 'center', backgroundColor: rightProps.imgBGColor ? rightProps.imgBGColor : '#C4C6C8' }}>
                            <IconButton iconProps={{ name: rightProps.rightIcon.name, type: rightProps.rightIcon.type, style: { color: rightProps.rightIcon.color, fontSize: 35 } }} onPress={onPress} />
                        </View>
                        : null
                : null
        }
    </View>
)

// export class Carousel extends React.Component {
//     _panResponder = null;
//     _initialTouches = null;
//     _initialPageX = null;
//     constructor(props) {
//         super(props);
//         this.state = {
//             position: new Animated.ValueXY(),
//             scrollEnabled: true,
//             activeIndex: this.props.initialCarouselIndex || 0,
//         };
//         this._panResponder = this.createpanResponder();
//     }

//     componentDidUpdate() {
//         if (this._panResponder === null) this._panResponder = this.createpanResponder();
//     }

//     createpanResponder() {
//         return PanResponder.create({
//             onStartShouldSetPanResponder: () => true,
//             onMoveShouldSetPanResponder: () => true,
//             onMoveShouldSetPanResponderCapture: () => true,
//             onPanResponderGrant: this._handlePanResponderGrant,
//             onPanResponderEnd: this._hanldePanResponderEnd,
//         });
//     }

//     _handlePanResponderGrant = (event, gestureState) => {
//         this._initialTouches = event.nativeEvent.touches;
//         if (this._initialTouches.length === 1) {
//             this._initialPageX = event.nativeEvent.pageX;
//         }
//     }

//     _handlePanResponderMove = (event, gesture) => {
//         if (this.state.isZoomEnable) {
//             event.nativeEvent.touches.length === 2 && this._handleMultiTouchGestures(event, gesture);
//         }
//         if (this.state.isGestureEnable && this.state.isZooming === false) {
//             event.nativeEvent.touches.length === 1 && this._handleSingleTouchGestures(event, gesture);
//         }
//     }

//     _handleSingleTouchGestures = (event, gesture) => {
//         if (gesture.dy > 120) {
//             this.state.position.setValue({ x: 0, y: 0 });
//             this.state.scrollEnabled && this.closeSwipingPictureModal();
//         } else if (gesture.dy > 30) {
//             this.state.isDraggingDown === false && this.setState({ isDraggingDown: true });
//             this.state.position.setValue({ x: 0, y: gesture.dy });
//         }
//     }

//     _hanldePanResponderEnd = (event, gesture) => {
//         const distance = this._initialPageX - event.nativeEvent.pageX;
//         if (distance > 30) {
//             if (this.state.activeIndex + 1 < this.props.pictureIds.length) {
//                 this.setState(prevState => ({ activeIndex: prevState.activeIndex + 1 }));
//             }
//         } else if (distance < -30) {
//             if (this.state.activeIndex > 0) {
//                 this.setState(prevState => ({ activeIndex: prevState.activeIndex - 1 }));
//             }
//         }
//     }

//     render() {
//         const { activeIndex } = this.state;
//         const { pictureIds = null, showTextContent } = this.props;
//         if (pictureIds === null || pictureIds.length === 0) return null;
//         return <FitImage {...this._panResponder.panHandlers} resizeMode='cover' source={{ uri: `${GET_PICTURE_BY_ID}${pictureIds[activeIndex].id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}` }} />;
//     }
// }

export const Carousel = ({ pictureIds, outerContainer, onPressImage = null, onChangeImage = null, imageHeight, innerConatiner, showTextContent = false, initialCarouselIndex = 0, containerDisable = false, scrollEnabled = true, scaleValue = 1, showItemNumber = true, showIndicator = true }) => {
    const [activeIndex, setActiveIndex] = useState(initialCarouselIndex);
    const onViewRef = React.useRef(({ viewableItems, changed }) => {
        if (changed[0].isViewable === false && viewableItems[0]) {
            if (onChangeImage) onChangeImage(viewableItems[0].index);
            setActiveIndex(viewableItems[0].index);
        }
    });
    return <View style={outerContainer}>
        <FlatList
            scrollEnabled={scrollEnabled}
            horizontal
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            data={pictureIds}
            keyExtractor={(item) => item.id}
            initialScrollIndex={initialCarouselIndex}
            onViewableItemsChanged={onViewRef.current}
            renderItem={({ item, index }) => {
                return <TouchableOpacity activeOpacity={1} onPress={() => onPressImage && onPressImage(activeIndex)} style={{ height: null, width: widthPercentageToDP(100) }}>
                    <FitImage resizeMode='cover' source={{ uri: `${GET_PICTURE_BY_ID}${item.id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}` }} />
                    {showTextContent && <DefaultText numberOfLines={8} style={styles.description}>{item.description}</DefaultText>}
                </TouchableOpacity>
            }}
        />
        {
            showIndicator && pictureIds.length > 1 ?
                <View style={styles.bubbleContainer}>
                    {
                        pictureIds.map((item, index) => <IconButton style={{ justifyContent: 'flex-start' }} iconProps={{ name: 'dot-single', type: 'Entypo', style: { fontSize: 23, color: activeIndex === index ? '#2B77B4' : '#C4C6C8' } }} />)
                    }
                </View>
                : null
        }
        {
            showItemNumber && pictureIds.length > 1 ?
                <View style={styles.numberContainer}>
                    <DefaultText style={{ color: '#fff', fontSize: 15 }}>{activeIndex + 1}/{pictureIds.length}</DefaultText>
                </View>
                : null
        }
    </View>
}

export const PostCard = ({ outerContainer, placeholderImgHeight = null, imageHeight = null, showLoader, headerStyle, nameOfRide, nameOfRideStyle, headerIcon, image = null, placeholderImage = null, placeholderBlur = 0, imageStyle, headerContent, footerStyle, footerContent, onPress = null, pictureIds = null, numberOfPicUploading, postTitle, postDescription, numberOfpicture }) => {
    const [hasLoaded, setImageStatus] = useState(false);
    return <View style={[{
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#D8D8D8',
    }, outerContainer]}>
        {headerContent}
        {
            pictureIds && pictureIds.length > 1
                ? <Carousel outerContainer={{ height: 220 }} pictureIds={pictureIds} onPressImage={onPress} />
                : image || placeholderImage
                    ? <TouchableOpacity activeOpacity={hasLoaded === false ? 1 : 0.5} style={{ height: hasLoaded === false ? placeholderImgHeight : imageHeight, overflow: 'hidden', backgroundColor: '#A9A9A9', justifyContent: 'center' }} onPress={() => onPress && onPress(0)}>
                        <ImageBackground style={{ height: null, width: null, flex: 1 }} source={placeholderImage || require('../../assets/img/placeholder-image.jpg')} blurRadius={placeholderBlur}>
                            {showLoader && <DefaultText style={{ position: 'absolute', top: 70, left: 70, color: '#C4C6C8', fontSize: 20 }}>{`${numberOfPicUploading} picture being uploading`}</DefaultText>}
                            {
                                image !== null || (pictureIds && pictureIds.length === 1)
                                    ? <FitImage onLoadStart={() => setImageStatus(false)} onLoadEnd={(e) => setImageStatus(true)} resizeMode='cover' source={
                                        image !== null
                                            ? { uri: image }
                                            : { uri: `${GET_PICTURE_BY_ID}${pictureIds[0].id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}` }
                                    } />
                                    : null
                            }
                        </ImageBackground>
                      { numberOfpicture && numberOfpicture> 1 && <View style={{position:'absolute', top:15, left:20, height:25, width:25,borderRadius:12, backgroundColor:'#ffffff', justifyContent:'center', alignItems:'center'}}>
                        <DefaultText>1/{numberOfpicture}</DefaultText>
                        </View>}
                    </TouchableOpacity>
                    : <View style={{ backgroundColor: '#EAEAEA' }}>
                        <DefaultText style={styles.postCardTitle}>{postTitle}</DefaultText>
                        <DefaultText style={styles.postCardDescription}>{postDescription}</DefaultText>
                    </View>
        }
        {footerContent}
        {showLoader && <ImageLoader show={showLoader} />}
    </View>
}




const styles = StyleSheet.create({
    fill: {
        width: '99.98%',
        height: '100%'
    },
    activeBorder: {
        borderWidth: 1,
        borderColor: 'blue'
    },
    container: {
        height: heightPercentageToDP(50),
        width: widthPercentageToDP(95),
        marginBottom: widthPercentageToDP(2),
    },
    containerBorder: {
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'rgba(163,163,163,0.5)',
        elevation: 2,
    },
    media: {
        flex: 1,
        height: null,
        width: null,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5
    },
    content: {
        flex: 1,
        padding: 5,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5
    },
    columnContainer: {
        // flex: 1,
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: 'rgba(163,163,163,0.5)',
        justifyContent: 'space-around',
    },
    columnContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headingContainer: {
        // flex: 1,
        flexDirection: 'row',
        paddingTop: 5,
        paddingBottom: 10,
        width: '100%'
    },
    mainHeader: {
        fontFamily: CUSTOM_FONTS.robotoBold,
        fontSize: widthPercentageToDP(4),
    },
    subHeader: {
        color: '#A3A3A3',
        fontSize: widthPercentageToDP(3),
    },
    notes: {
        // flex: 1,
    },
    actionbar: {
        // position: 'absolute',
        // width: '100%',
        // bottom: 0,
        height: 0,
        borderTopWidth: 0,
        borderTopColor: 'rgba(163,163,163,0.5)',
        paddingVertical: 5,
        overflow: 'hidden',
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    thumbnail: {
        width: '100%',
        height: heightPercentageToDP(30),
        borderBottomWidth: 1,
        borderBottomColor: '#949599',
        paddingBottom: heightPercentageToDP(1),
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    bubbleContainer: {
        height: 20,
        width: widthPercentageToDP(100),
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 2,
        backgroundColor: 'rgba(0,0,0,0.7)'
    },
    numberContainer: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        position: 'absolute',
        right: 5,
        top: 10,
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        borderRadius: 6,
        height: 30
    },
    description: {
        fontFamily: CUSTOM_FONTS.roboto,
        letterSpacing: 0.4,
        fontSize: 16,
        color: '#fff',
        marginLeft: 25,
        marginTop: 23,
        maxWidth: widthPercentageToDP(100) - 25,
    },
    postCardTitle: {
        color: '#2B77B4',
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 0.6,
        marginLeft: 27,
        marginTop: 36
    },
    postCardDescription: {
        marginHorizontal: 42,
        marginTop: 11,
        marginBottom: 25,
        fontSize: 15,
        fontFamily: CUSTOM_FONTS.roboto,
        lineHeight: 25
    }
});