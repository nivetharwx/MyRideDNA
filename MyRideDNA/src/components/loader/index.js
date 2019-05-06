import React from 'react';
import {
    StyleSheet,
    View,
    ActivityIndicator,
    Text
} from 'react-native';
import { BaseModal } from '../modal'
import { widthPercentageToDP, IS_ANDROID, APP_COMMON_STYLES } from '../../constants';

export const ImageLoader = ({ show, offsetTop }) => {
    return (
        <View style={[styles.modalContent, { marginTop: offsetTop, height: show ? '100%' : 0 }]} pointerEvents='none'>
            <View style={styles.wrapper}>
                <ActivityIndicator animating={show} />
            </View>
        </View>
    );
}

export const Loader = ({ isVisible, onCancel }) => {
    return isVisible
        ? <View style={styles.loaderContainer}>
            <View style={styles.loaderContent}>
                {
                    IS_ANDROID
                        ? <ActivityIndicator size={widthPercentageToDP(20)} color='#fff' animating={isVisible} />
                        : <ActivityIndicator size={1} color='#fff' animating={isVisible} />
                }
                <Text style={{ color: '#fff' }}>Loading...</Text>
            </View>
        </View>
        : null
}

const styles = StyleSheet.create({
    loaderContainer: {
        position: 'absolute',
        zIndex: 999,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.8)',
        elevation: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loaderContent: {
        width: widthPercentageToDP(20),
        height: widthPercentageToDP(20),
        elevation: 3
    },
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
        backgroundColor: 'rgba(255,255,255,0.5)',
        height: 100,
        width: 100,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'space-around'
    }
});