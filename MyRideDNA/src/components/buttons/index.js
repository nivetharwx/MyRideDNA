import React from 'react';
import {
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

export const BasicButton = ({ title, iconProps, onPress, style }) => (
    <View style={[{ backgroundColor: '#0076B5', borderRadius: 5, height: 30 }, style]}>
        <TouchableOpacity activeOpacity={0.6} style={{ flexDirection: 'row', height: '100%', paddingVertical: 10, paddingHorizontal: 20 }} onPress={onPress}>
            <Text style={{ color: '#fff', alignSelf: 'center', fontSize: 15, fontWeight: 'bold' }}>{title}</Text>
            {
                iconProps
                    ? <NBIcon name={iconProps.name} type={iconProps.type} style={[{ marginLeft: 5, color: '#fff', fontSize: 22, alignSelf: 'center' }, iconProps.style]} />
                    : null
            }
        </TouchableOpacity>
    </View>
);

export const RoundButton = ({ title, onPress, style, titleStyle }) => (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
        <View style={[{ backgroundColor: '#0083CA', borderRadius: 30, height: 30, width: 30, alignItems: 'center', justifyContent: 'center' }, style]}>
            <Text style={[{ color: '#fff', alignSelf: 'center', fontSize: 15, fontWeight: 'bold' }, titleStyle]}>{title}</Text>
        </View>
    </TouchableOpacity>
);

export const IconButton = ({ iconProps, onPress, style }) => (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
        <View style={[{ paddingHorizontal: 10 }, style]}>
            <NBIcon name={iconProps.name}
                type={iconProps.type} style={[{ fontSize: 30 }, iconProps.style]} />
        </View>
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

export const LinkButton = ({ style, title, titleStyle, onPress }) => (
    <TouchableOpacity activeOpacity={0.6} style={[{ paddingHorizontal: 20 }, style]} onPress={onPress}>
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end', padding: 10 }}>
                <TouchableWithoutFeedback onPress={this.onSwitchStateChange}>
                    <View style={{ width: 70, height: 25, borderRadius: 15, borderWidth: 1, backgroundColor: value ? 'black' : 'green', justifyContent: 'center' }}>
                        {
                            value === true ? activeIcon : null
                        }
                        <Animated.View style={{ position: 'absolute', zIndex: 100, elevation: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', translateX: switchAnim }} />
                        {
                            value === false ? inactiveIcon : null
                        }
                    </View>
                </TouchableWithoutFeedback>
            </View>
        )
    }
}

export const ShifterButton = ({ onPress }) => (
    <TouchableOpacity onPress={onPress} style={{ position: 'absolute', zIndex: 900, elevation: 10, bottom: 0, right: 0 }}>
        <View style={{ width: 80, height: 80, backgroundColor: 'none' }}>
            <Image source={require('../../assets/img/shifter.png')} style={{ flex: 1, height: null, width: null }} />
        </View>
    </TouchableOpacity>
);
