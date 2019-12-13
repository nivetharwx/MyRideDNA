import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TouchableHighlight, ImageBackground, TouchableWithoutFeedback, Image, Animated, Easing, FlatList } from 'react-native';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, CUSTOM_FONTS } from '../../constants';
import { Icon as NBIcon, ListItem, Left, Body, Right } from 'native-base';
import { LinkButton, IconButton, ImageButton } from '../buttons';
import { DefaultText } from '../labels';

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

export const SmallCard = ({ image, placeholderImage, onPress, outerContainer, imageStyle, customPlaceholder }) => (
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
            </View>
        </TouchableOpacity>
    </View>
);
export const SquareCard = ({ title, subtitle, placeholderImage, onPress, onLongPress, image, imageStyle, containerStyle, contentContainerStyle }) => (
    <TouchableOpacity onPress={() => onPress ? onPress() : null} onLongPress={() => onLongPress && onLongPress()} style={[{ flexDirection: 'column' }, containerStyle]}>
        <View style={[{ height: 150, width: 150, backgroundColor: '#A9A9A9', justifyContent: 'center' }, imageStyle]}>
            {
                image
                    ? <Image source={{ uri: image }} style={{ width: null, height: null, flex: 1 }} />
                    : placeholderImage
                        ? <Image source={placeholderImage} style={{ width: null, height: null, flex: 1 }} />
                        : null
            }
        </View>
        <View style={contentContainerStyle}>
            {
                title
                    ? <DefaultText style={{ fontSize: 15, fontFamily: CUSTOM_FONTS.robotoSlabBold, color: '#000', marginTop: 6 }}>{title}</DefaultText>
                    : null
            }
            {
                subtitle
                    ? <DefaultText style={{ fontSize: 11, color: '#585756', marginTop: 2 }}>{subtitle}</DefaultText>
                    : null
            }
        </View>
    </TouchableOpacity>
);

export const HorizontalCard = ({ item, onPress, rightProps, onLongPress, actionsBar, cardOuterStyle, horizontalCardPlaceholder, righticonImage, onPressLeft, thumbnail, leftIcon }) => (
    <View style={[{ flex: 1, marginTop: 20, flexDirection: 'row', minWidth: widthPercentageToDP(81.5) }, cardOuterStyle]}>
        <TouchableOpacity style={{ height: 74, width: 74, flexDirection: actionsBar ? 'row' : null, }} onPress={onPressLeft} >
            {
                // for online and offline
                actionsBar && actionsBar.online ?
                    <View style={{ backgroundColor: item.isOnline ? '#81BA41' : '#C4C6C8', zIndex: 1, width: 6 }}>
                    </View>
                    :
                    null
            }
            {
                thumbnail ?
                    <Image source={{ uri: thumbnail }} style={{ width: null, height: null, flex: 1 }} />
                    :
                    horizontalCardPlaceholder
                        ?
                        <Image source={horizontalCardPlaceholder} style={{ width: null, height: null, flex: 1 }} />
                        :
                        leftIcon ?
                            <View style={{ flex: 1, width: null, heigh: null, backgroundColor: '#C4C6C8', justifyContent: 'center', alignItems: 'center' }}>
                                <NBIcon active name={leftIcon.name} type={leftIcon.type} style={{ fontSize: 40, color: '#707070' }} />
                            </View>
                            :
                            <View style={{ flex: 1, width: null, heigh: null, backgroundColor: '#C4C6C8', justifyContent: 'center', alignItems: 'center' }}>
                            </View>

            }
        </TouchableOpacity>

        {
            // here condition is for change of middle view according to action bar is present or not
            actionsBar ?
                <View style={{ flex: 1, justifyContent: 'center', borderWidth: 1, borderColor: '#EAEAEA' }}>
                    <View style={{ flex: 1, backgroundColor: '#EAEAEA', justifyContent: 'center', alignItems: 'center' }}>
                        <DefaultText style={{ fontSize: 14, fontFamily: CUSTOM_FONTS.robotoBold, color: '#585756' }}>{item.name ? item.name : item.groupName ? item.groupName : null}</DefaultText>
                    </View>
                    <View style={{ flex: 1 }}>
                        {
                            // to iterate the actions array
                            actionsBar.actions && actionsBar.actions.length > 0 ?
                                <FlatList
                                    numColumns={4}
                                    columnWrapperStyle={{ justifyContent: actionsBar.actions.length === 1 ? 'flex-end' : actionsBar.actions.length < 3 ? 'space-around' : 'space-between', marginHorizontal: 20, marginTop: 5 }}
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
                    : null
                : null
        }
    </View>
)

export const RideCard = ({ outerContainer, headerStyle, nameOfRide, nameOfRideStyle, headerIcon, image, rideCardPlaceholder, imageStyle, headerContent, footerStyle, footerContent }) => (
    <View onPress={() => onPress ? onPress() : null} style={[{
        flex: 1,
        backgroundColor: '#FFFFFF',
        height: 310,
        borderBottomWidth: 1,
        borderBottomColor: '#D8D8D8'
    }, outerContainer]}>
        {headerContent}
        <View style={[{ height: 190, backgroundColor: '#A9A9A9', justifyContent: 'center' }, imageStyle]}>
            {
                image ?
                    <Image source={{ uri: image }} style={{ width: null, height: null, flex: 1 }} />
                    :
                    rideCardPlaceholder
                        ?
                        <Image source={rideCardPlaceholder} style={{ width: null, height: null, flex: 1 }} />
                        : null
            }
        </View>
        {footerContent}
    </View>
);



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
    }
});