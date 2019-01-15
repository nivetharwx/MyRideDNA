import React from 'react';
import { SafeAreaView, Modal, TouchableOpacity, View, Image } from 'react-native';
import { Icon as NBIcon } from 'native-base';
import { AppMenuButton } from '../buttons';
import { Actions } from 'react-native-router-flux';
import { PageKeys } from '../../constants';


export const MenuModal = ({ isVisible, onClose, onPressNavMenu, activeMenu }) => (
    <SafeAreaView>
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}>
            <View style={{ flex: 1, paddingHorizontal: 30, paddingVertical: 20, backgroundColor: 'rgba(0,0,0,0.7)' }}>
                <View style={{ flex: 1, backgroundColor: '#fff', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', padding: 20, alignContent: 'center' }}>
                    <TouchableOpacity activeOpacity={0.4} onPress={() => onPressNavMenu(PageKeys.RIDES)}>
                        <Image source={require('../../assets/img/menu-rides.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.4} onPress={() => onPressNavMenu(PageKeys.PROFILE)}>
                        <Image source={require('../../assets/img/menu-profile.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.4} onPress={() => onPressNavMenu(PageKeys.MAP)}>
                        <Image source={require('../../assets/img/menu-map.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.4} onPress={() => onPressNavMenu(PageKeys.FRIENDS)}>
                        <Image source={require('../../assets/img/menu-friends.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.4} onPress={() => onPressNavMenu(PageKeys.SETTINGS)}>
                        <Image source={require('../../assets/img/menu-settings.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.4} onPress={() => onPressNavMenu(PageKeys.OFFERS)}>
                        <Image source={require('../../assets/img/menu-offers.png')} />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    </SafeAreaView>
);

{/* <TouchableOpacity activeOpacity={0.4}>
                        <Image source={require('../../assets/img/menu-rides.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.4}>
                        <Image source={require('../../assets/img/menu-profile.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.4}>
                        <Image source={require('../../assets/img/menu-map.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.4}>
                        <Image source={require('../../assets/img/menu-friends.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.4}>
                        <Image source={require('../../assets/img/menu-settings.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.4}>
                        <Image source={require('../../assets/img/menu-offers.png')} />
                    </TouchableOpacity> */}

{/* <AppMenuButton containerStyle={{ marginBottom: 10 }} iconProps={{ name: 'motorbike', type: 'MaterialCommunityIcons' }} />
                    <AppMenuButton containerStyle={{ marginBottom: 10 }} iconProps={{ name: 'person', type: 'MaterialIcons' }} />
                    <AppMenuButton containerStyle={{ marginBottom: 10 }} iconProps={{ name: 'map', type: 'MaterialIcons' }} />
                    <AppMenuButton containerStyle={{ marginBottom: 10 }} iconProps={{ name: 'ios-people', type: 'Ionicons' }} />
                    <AppMenuButton containerStyle={{ marginBottom: 10 }} iconProps={{ name: 'settings', type: 'MaterialIcons' }} />
                    <AppMenuButton containerStyle={{ marginBottom: 10 }} iconProps={{ name: 'card-giftcard', type: 'MaterialIcons' }} /> */}