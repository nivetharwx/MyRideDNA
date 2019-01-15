import React from 'react';
import {
    SafeAreaView,
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Animated,
    TextInput
} from 'react-native';
import { Icon as NBIcon } from 'native-base';
import { WindowDimensions } from '../../constants';

export const BasicHeader = ({ headerHeight, leftIconProps, title, rightIconProps }) => (
    <SafeAreaView style={[styles.header, { height: headerHeight }]}>
        <View style={{ marginHorizontal: 20, alignItems: 'center', justifyContent: 'center' }}>
            {
                leftIconProps ?
                    <TouchableOpacity style={leftIconProps.reverse ? styles.iconPadding : null} onPress={leftIconProps.onPress}>
                        <NBIcon name={leftIconProps.name} type={leftIconProps.type} style={[{
                            fontSize: 25,
                            color: leftIconProps.reverse ? 'black' : 'white'
                        }, leftIconProps.style]} />
                    </TouchableOpacity>
                    : null
            }
        </View>
        <View style={{ flex: 1, alignSelf: 'center' }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                {title}
            </Text>
        </View>
        <View style={{ marginHorizontal: 20, alignItems: 'center', justifyContent: 'center' }}>
            {
                rightIconProps ?
                    <TouchableOpacity style={rightIconProps.reverse ? styles.iconPadding : null} onPress={rightIconProps.onPress}>
                        <NBIcon name={rightIconProps.name} type={rightIconProps.type} style={[{
                            fontSize: 25,
                            color: rightIconProps.reverse ? 'black' : 'white'
                        }, rightIconProps.style]} />
                    </TouchableOpacity>
                    : null
            }
        </View>
    </SafeAreaView>
);

export class SearchHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            widthAnim: new Animated.Value(20)
        }
    }
    render() {
        const { widthAnim } = this.state;
        return (
            <SafeAreaView style={styles.header}>
                <TouchableOpacity>
                    <NBIcon name='menu' type='MaterialIcons' style={{ color: '#fff' }} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <NBIcon name='search' type='FontAwesome' style={{ color: '#fff' }} />
                </TouchableOpacity>
            </SafeAreaView>
        );
    }
}


const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        // alignItems: 'center',
        top: 0,
        left: 0,
        width: '100%',
        height: 60,
        overflow: 'hidden',
        backgroundColor: '#0076B5',
        zIndex: 100,
        flexDirection: 'row',
    },
    iconPadding: {
        padding: 5,
        backgroundColor: 'white',
        borderRadius: 19,
        height: 38,
        width: 38,
        alignItems: 'center',
        justifyContent: 'center'
    },
})