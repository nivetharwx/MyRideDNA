import React from 'react';
import { View } from 'react-native';
import { Tab } from '../tab';
import styles from './styles';
import { PageKeys } from '../../constants';
import { ActionConst, Actions } from 'react-native-router-flux';

export const Tabs = ({ activeTab, onTabPress }) => {
    onTabPress = (tabName) => {
        tabName != activeTab && Actions.reset(tabName);
    }

    return (
        <View style={styles.absoluteContainer}>
            <View style={styles.tabContainer}>
                <Tab isActive={activeTab === PageKeys.RIDES} id={PageKeys.RIDES} title={'Rides'} onTabPress={onTabPress} />
                <Tab isActive={activeTab === PageKeys.PROFILE} id={PageKeys.PROFILE} title={'Profile'} onTabPress={onTabPress} />
                <Tab isActive={activeTab === PageKeys.MAP} id={PageKeys.MAP} title={'Map'} onTabPress={onTabPress} />
            </View>
        </View>
    );
}
