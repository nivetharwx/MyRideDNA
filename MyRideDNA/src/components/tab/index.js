import React from 'react';
import { View, TouchableNativeFeedback, Text } from 'react-native';
import { Icon as NBIcon } from 'native-base';
import { DefaultText } from '../labels';

import styles from './styles';

export const Tab = ({ isActive, title, onTabPress, id }) => (
    <TouchableNativeFeedback onPress={() => onTabPress(id)}>
        <View style={[styles.tab, { backgroundColor: isActive ? 'tomato' : '#fff' }]}>
            <DefaultText style={{ color: isActive ? '#fff' : '#000' }}>{title}</DefaultText>
        </View>
    </TouchableNativeFeedback>
);