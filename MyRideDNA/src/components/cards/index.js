import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TouchableHighlight, ImageBackground, Image, Animated, Easing } from 'react-native';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES } from '../../constants';
import { Icon as NBIcon } from 'native-base';
import { LinkButton, IconButton } from '../buttons';

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
                                        ? <Text style={styles.mainHeader}>{this.props.mainHeading}</Text>
                                        : null
                                }
                                {
                                    this.props.subHeading
                                        ? <Text style={styles.subHeader}>{this.props.subHeading}</Text>
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
                            <Text>{this.props.notes}</Text>
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

export const ThumbnailCard = ({ item, thumbnailPlaceholder, onPress, onLongPress, actions, thumbnailRef }) => (
    <View style={styles.thumbnail}>
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
            {
                item.isOnline
                    ? <View style={{ backgroundColor: '#37B603', position: 'absolute', zIndex: 100, alignSelf: 'flex-start', bottom: '70%', left: '20%', width: widthPercentageToDP(6), height: widthPercentageToDP(6), borderRadius: widthPercentageToDP(3), elevation: 10 }} />
                    : null
            }
            <View style={{flexDirection:'row'}}>
                {
                    item.isAdmin
                        ? <IconButton iconProps={{ name: 'verified-user', type: 'MaterialIcons', style: { fontSize: widthPercentageToDP(6), color: APP_COMMON_STYLES.headerColor } }} />
                        : null
                }
                <Text style={{
                    fontWeight: 'bold',
                    backgroundColor: 'transparent',
                    fontSize: widthPercentageToDP(4),
                    color: item.name === 'You' ? APP_COMMON_STYLES.infoColor : '#000'
                }}
                    renderToHardwareTextureAndroid collapsable={false}>

                    {item.name}
                    {
                        item.nickname
                            ?
                            <Text style={{ color: APP_COMMON_STYLES.infoColor, fontWeight: 'bold' }}>
                                {'  '}{item.nickname}
                            </Text>
                            : null
                    }
                </Text>
            </View>
            {/* <Text style={{ color: '#A1A2A6' }}>{item.email}</Text> */}
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

{/* <NBIcon name='md-star' type='Ionicons' />
    <View style={styles.columnContainer}>
        {
            coloumns.map((column, index) => (
                <View key={index + ''} style={styles.columnContent}><Text>{column}</Text></View>
            ))
        }
    </View> */}



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
        fontWeight: 'bold',
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
        width: '50%',
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