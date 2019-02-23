import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TouchableHighlight,
    TouchableWithoutFeedback,
    Image,
    Animated
} from 'react-native';

import { Icon as NBIcon } from 'native-base';

import styles from './styles';
import { widthPercentageToDP, heightPercentageToDP, APP_COMMON_STYLES } from '../../constants';

export const LoginButton = ({ title, onPress }) => (
    <TouchableHighlight
        style={{ marginBottom: 10 }}
        onPress={onPress}>
        <Text style={[ButttonStyles.loginButtonText, { backgroundColor: '#555860' }]}>Login</Text>
    </TouchableHighlight>
);

export const MapControlPair = ({ firstIcon, secondIcon, containerStyle }) => (
    <View style={[styles.controlPairLeft, containerStyle]}>
        <TouchableOpacity style={[styles.iconControlLeft, styles.bottomSeparator]} onPress={firstIcon.onPress}>
            <NBIcon name={firstIcon.name} type={firstIcon.type} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconControlLeft, styles.topSeparator]} onPress={secondIcon.onPress}>
            <NBIcon name={secondIcon.name} type={secondIcon.type} />
        </TouchableOpacity>
    </View>
);

export const BasicButton = ({ title, titleStyle, onPress, style }) => (
    <TouchableOpacity activeOpacity={0.6} style={[{ backgroundColor: '#0076B5', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }, style]} onPress={onPress}>
        <View style={{ paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={[{ color: '#fff', fontSize: 15, fontWeight: 'bold' }, titleStyle]}>{title}</Text>
        </View>
    </TouchableOpacity>
);

export const RoundButton = ({ title, onPress, style, titleStyle }) => (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
        <View style={[{ backgroundColor: '#0083CA', borderRadius: 30, height: 30, width: 30, alignItems: 'center', justifyContent: 'center' }, style]}>
            <Text style={[{ color: '#fff', alignSelf: 'center', fontSize: 15, fontWeight: 'bold' }, titleStyle]}>{title}</Text>
        </View>
    </TouchableOpacity>
);

export const IconButton = ({ iconProps, onPress, style }) => (
    <TouchableOpacity style={[{ justifyContent: 'center', alignItems: 'center' }, style]} activeOpacity={0.6} onPress={onPress}>
        <NBIcon name={iconProps.name}
            type={iconProps.type} style={[{ fontSize: 30 }, iconProps.style]} />
    </TouchableOpacity>
);

export const AppMenuButton = ({ containerStyle, iconProps, onPress }) => (
    <TouchableOpacity activeOpacity={0.4} style={containerStyle} onPress={onPress}>
        <View style={{ backgroundColor: '#221D1F', width: 120, height: 120, borderRadius: 120, justifyContent: 'center' }}>
            <View style={{ backgroundColor: '#EB861E', width: 80, height: 80, borderRadius: 80, justifyContent: 'center', alignSelf: 'center' }}>
                <NBIcon name={iconProps.name} type={iconProps.type} style={{ fontSize: 40, backgroundColor: '#fff', borderRadius: 40, alignSelf: 'center', padding: 10 }} />
            </View>
        </View>
    </TouchableOpacity>
);

export const LinkButton = ({ style, title, titleStyle, onPress, highlightColor }) => (
    highlightColor
        ? <TouchableHighlight onPress={onPress}
            underlayColor={highlightColor} style={style}>
            <Text style={titleStyle}>{title}</Text>
        </TouchableHighlight>
        : <TouchableOpacity activeOpacity={0.6} style={[{ paddingHorizontal: 20 }, style]} onPress={onPress}>
            <Text style={titleStyle}>{title}</Text>
        </TouchableOpacity>
);

export class SwitchIconButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            switchAnim: new Animated.Value(props.value === false ? 0 : 40),
            toggleValue: props.value
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value != this.props.value) {
            Animated.timing(this.state.switchAnim,
                {
                    toValue: this.props.value === false ? -5 : 40,
                    duration: 300,
                    useNativeDriver: true
                }
            ).start();
        }
    }

    onSwitchStateChange = () => this.props.onChangeValue(!this.props.value);

    render() {
        const { activeIcon, inactiveIcon, value } = this.props;
        const { switchAnim } = this.state;
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end', padding: widthPercentageToDP(2) }}>
                <TouchableWithoutFeedback onPress={this.onSwitchStateChange}>
                    <View style={{ width: widthPercentageToDP(17), height: heightPercentageToDP(3.7), borderRadius: heightPercentageToDP(2), borderWidth: 1, backgroundColor: value ? 'black' : 'green', justifyContent: 'center' }}>
                        {
                            value === true ? activeIcon : null
                        }
                        <Animated.View style={{ position: 'absolute', zIndex: 100, elevation: 10, width: widthPercentageToDP(7.5), height: widthPercentageToDP(7.5), borderRadius: widthPercentageToDP(3.75), backgroundColor: '#fff', transform: [{ translateX: switchAnim }] }} />
                        {
                            value === false ? inactiveIcon : null
                        }
                    </View>
                </TouchableWithoutFeedback>
            </View>
        )
    }
}

export const ImageButton = ({ onPress, styles, imageSrc }) => (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        <View style={[{ width: 120, height: 120, borderRadius: 60 }, styles]}>
            <Image style={{ width: null, height: null, flex: 1 }} source={imageSrc} />
        </View>
    </TouchableOpacity>
);

export const ShifterButton = ({ onPress, containerStyles, size = 20, alignLeft = false }) => (
    <TouchableOpacity onPress={onPress} style={[styles.shiterButtonContainer, containerStyles, alignLeft ? styles.alignLeft : null, { width: widthPercentageToDP(size), height: widthPercentageToDP(size) }]}>
        <View style={[styles.shiterImgContainer, alignLeft ? { borderTopEndRadius: widthPercentageToDP(size) } : { borderTopStartRadius: widthPercentageToDP(size) }]}>
            <Image source={require('../../assets/img/shifter.png')} style={[{ position: 'absolute', bottom: 0, right: 0, height: widthPercentageToDP(size - 5), width: widthPercentageToDP(size - 5) }, alignLeft ? styles.leftImage : null]} />
        </View>
    </TouchableOpacity>
);
