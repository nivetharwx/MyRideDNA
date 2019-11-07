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
    <TouchableOpacity activeOpacity={0.6} style={[{ backgroundColor: '#F5891F', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }, style]} onPress={onPress}>
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

export const IconButton = ({ title, titleStyle, iconRight, iconProps = {}, onPress, onPressOut, style, disabled, disabledColor = '#DBDBDB' }) => {
    return disabled
        ? iconRight
            ? <View style={[{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }, style, { borderColor: disabledColor }]}>
                {
                    title !== undefined || title !== null
                        ? <Text style={titleStyle}>{title}</Text>
                        : null
                }
                <NBIcon name={iconProps.name}
                    type={iconProps.type} style={[{ fontSize: 30, }, iconProps.style, { color: disabledColor, borderColor: disabledColor }]} />
            </View>
            : <View style={[{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }, style, { borderColor: disabledColor }]}>
                <NBIcon name={iconProps.name}
                    type={iconProps.type} style={[{ fontSize: 30 }, iconProps.style, { color: disabledColor, borderColor: disabledColor }]} />
                {
                    title !== undefined || title !== null
                        ? <Text style={titleStyle}>{title}</Text>
                        : null
                }
            </View>
        : iconRight
            ? <TouchableOpacity style={[{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }, style]} activeOpacity={0.6} onPress={onPress} onPressOut={onPressOut}>
                {
                    title !== undefined || title !== null
                        ? <Text style={titleStyle}>{title}</Text>
                        : null
                }
                <NBIcon name={iconProps.name}
                    type={iconProps.type} style={[{ fontSize: 30 }, iconProps.style]} />
            </TouchableOpacity>
            : <TouchableOpacity style={[{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }, style]} activeOpacity={0.6} onPress={onPress} onPressOut={onPressOut}>
                <NBIcon name={iconProps.name}
                    type={iconProps.type} style={[{ fontSize: 30 }, iconProps.style]} />
                {
                    title !== undefined || title !== null
                        ? <Text style={titleStyle}>{title}</Text>
                        : null
                }
            </TouchableOpacity>
};

export const AppMenuButton = ({ containerStyle, iconProps, onPress }) => (
    <TouchableOpacity activeOpacity={0.4} style={containerStyle} onPress={onPress}>
        <View style={{ backgroundColor: '#221D1F', width: 120, height: 120, borderRadius: 120, justifyContent: 'center' }}>
            <View style={{ backgroundColor: '#EB861E', width: 80, height: 80, borderRadius: 80, justifyContent: 'center', alignSelf: 'center' }}>
                <NBIcon name={iconProps.name} type={iconProps.type} style={{ fontSize: 40, backgroundColor: '#fff', borderRadius: 40, alignSelf: 'center', padding: 10 }} />
            </View>
        </View>
    </TouchableOpacity>
);

export const LinkButton = ({ style = {}, title, titleStyle, onPress, highlightColor }) => (
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
            switchAnim: new Animated.Value(props.value === false ? 0 : 33),
            toggleValue: props.value
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value != this.props.value) {
            Animated.timing(this.state.switchAnim,
                {
                    toValue: this.props.value === false ? 0 : 33,
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
            <View style={{ justifyContent: 'center', alignItems: 'flex-end', padding: widthPercentageToDP(2) }}>
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

export const ImageButton = ({ onPress, imgStyles, containerStyles, imageSrc }) => (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress ? onPress : () => { }} style={containerStyles}>
        <View style={[{ width: 120, height: 120, borderRadius: 60 }, imgStyles]}>
            <Image style={{ width: null, height: null, flex: 1, resizeMode: 'contain' }} source={imageSrc} />
        </View>
    </TouchableOpacity>
);

export const ShifterButton = ({ onPress, containerStyles, size = 20, alignLeft = false }) => (
    <TouchableOpacity onPress={onPress} style={[styles.shiterButtonContainer, containerStyles, alignLeft ? styles.alignLeft : null]}>
        <View style={[styles.shiterImgContainer, alignLeft ? { borderTopEndRadius: 90 } : { borderTopStartRadius: 90 }]}>
            <Image source={require('../../assets/img/shifter_shadow.png')} style={[{ position: 'absolute', bottom: 0, right: 0, height: 65, width: 75 }, alignLeft ? styles.leftImage : null]} />
        </View>
    </TouchableOpacity>
);
