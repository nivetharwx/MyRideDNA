import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TouchableHighlight, ImageBackground, Animated, Easing } from 'react-native';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES } from '../../constants';
import { Icon as NBIcon } from 'native-base';

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
            <View style={styles.container}>
                <View style={[styles.fill, this.props.isActive ? styles.activeBorder : null]}>
                    <TouchableOpacity onLongPress={this.toggleActionBar} style={styles.media}>
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
        height: heightPercentageToDP(60),
        width: widthPercentageToDP(95),
        marginBottom: widthPercentageToDP(2),
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
        flex: 1,
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
    }
});