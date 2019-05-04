import React from 'react';
import {
    StyleSheet,
    View,
    ActivityIndicator,
    Text
} from 'react-native';
import { BaseModal } from '../modal'
import { widthPercentageToDP, IS_ANDROID } from '../../constants';

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
    return (
        <BaseModal alignCenter={true} isVisible={isVisible} onCancel={onCancel}>
            <View style={{ justifyContent: 'center', alignItems: 'center', width: widthPercentageToDP(20), height: widthPercentageToDP(20), elevation: 3 }}>
                {
                    IS_ANDROID
                        ? <ActivityIndicator size={widthPercentageToDP(20)} color='#fff' animating={isVisible} />
                        : <ActivityIndicator size={1} color='#fff' animating={isVisible} />
                }
                <Text style={{ color: '#fff' }}>Loading...</Text>
            </View>
        </BaseModal>
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
        backgroundColor: 'rgba(255,255,255,0.5)',
        height: 100,
        width: 100,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'space-around'
    }
});