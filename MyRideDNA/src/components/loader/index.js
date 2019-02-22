import React from 'react';
import {
    StyleSheet,
    View,
    ActivityIndicator
} from 'react-native';
import { WindowDimensions } from '../../constants';

export const Loader = ({ show, offsetTop }) => {
    return (
        <View style={[styles.modalContent, { marginTop: offsetTop, height: show ? '100%' : 0 }]} pointerEvents='none'>
            <View style={styles.wrapper}>
                <ActivityIndicator animating={show} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        backgroundColor: 'rgba(133,133,133,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        zIndex: 999,
        height: '100%',
        width: '100%',
        overflow: 'hidden'
    },
    wrapper: {
        backgroundColor: '#FFFFFF',
        height: 100,
        width: 100,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'space-around'
    }
});