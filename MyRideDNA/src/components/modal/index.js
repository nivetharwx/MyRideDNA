import React from 'react';
import { SafeAreaView, Modal, TouchableOpacity, ScrollView, View, Image, TouchableWithoutFeedback } from 'react-native';
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
                    <TouchableOpacity activeOpacity={0.7} onPress={() => onPressNavMenu(PageKeys.RIDES)}>
                        <View style={{ width: 130, height: 130, borderRadius: 65, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ width: 120, height: 120, borderRadius: 60 }}>
                                <Image style={{ width: null, height: null, flex: 1 }} source={require('../../assets/img/menu-rides.png')} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => onPressNavMenu(PageKeys.PROFILE)}>
                        <View style={{ width: 130, height: 130, borderRadius: 65, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ width: 120, height: 120, borderRadius: 60 }}>
                                <Image style={{ width: null, height: null, flex: 1 }} source={require('../../assets/img/menu-profile.png')} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => onPressNavMenu(PageKeys.MAP)}>
                        <View style={{ width: 130, height: 130, borderRadius: 65, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ width: 120, height: 120, borderRadius: 60 }}>
                                <Image style={{ width: null, height: null, flex: 1 }} source={require('../../assets/img/menu-map.png')} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => onPressNavMenu(PageKeys.FRIENDS)}>
                        <View style={{ width: 130, height: 130, borderRadius: 65, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ width: 120, height: 120, borderRadius: 60 }}>
                                <Image style={{ width: null, height: null, flex: 1 }} source={require('../../assets/img/menu-friends.png')} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => onPressNavMenu(PageKeys.SETTINGS)}>
                        <View style={{ width: 130, height: 130, borderRadius: 65, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ width: 120, height: 120, borderRadius: 60 }}>
                                <Image style={{ width: null, height: null, flex: 1 }} source={require('../../assets/img/menu-settings.png')} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => onPressNavMenu(PageKeys.OFFERS)}>
                        <View style={{ width: 130, height: 130, borderRadius: 65, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ width: 120, height: 120, borderRadius: 60 }}>
                                <Image style={{ width: null, height: null, flex: 1 }} source={require('../../assets/img/menu-offers.png')} />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    </SafeAreaView>
);

export const BaseModal = (props) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={props.isVisible}
        onRequestClose={props.onCancel}>
        {
            props.onPressOutside ?
                <TouchableOpacity style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' }} onPress={props.onPressOutside}>
                    <ScrollView
                        directionalLockEnabled={true}
                        style={{ height: '100%', width: '100%' }}
                        contentContainerStyle={{ justifyContent: 'center', height: '100%', width: '100%', alignItems: 'center' }}
                    >
                        <TouchableWithoutFeedback>
                            {
                                props.children
                            }
                        </TouchableWithoutFeedback>
                    </ScrollView>
                </TouchableOpacity>
                : <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <ScrollView
                        directionalLockEnabled={true}
                        style={{ height: '100%', width: '100%' }}
                        contentContainerStyle={{ justifyContent: 'center', height: '100%', width: '100%', alignItems: 'center' }}
                    >
                        <TouchableWithoutFeedback>
                            {
                                props.children
                            }
                        </TouchableWithoutFeedback>
                    </ScrollView>
                </View>
        }
    </Modal>
);

{/*                 <TouchableOpacity activeOpacity={0.4}>
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

{/*                 <AppMenuButton containerStyle={{ marginBottom: 10 }} iconProps={{ name: 'motorbike', type: 'MaterialCommunityIcons' }}  onPress={() => onPressNavMenu(PageKeys.RIDES)} />
                    <AppMenuButton containerStyle={{ marginBottom: 10 }} iconProps={{ name: 'person', type: 'MaterialIcons' }} onPress={() => onPressNavMenu(PageKeys.PROFILE)} />
                    <AppMenuButton containerStyle={{ marginBottom: 10 }} iconProps={{ name: 'map', type: 'MaterialIcons' }} onPress={() => onPressNavMenu(PageKeys.MAP)} />
                    <AppMenuButton containerStyle={{ marginBottom: 10 }} iconProps={{ name: 'ios-people', type: 'Ionicons' }} onPress={() => onPressNavMenu(PageKeys.FRIENDS)} />
                    <AppMenuButton containerStyle={{ marginBottom: 10 }} iconProps={{ name: 'settings', type: 'MaterialIcons' }} onPress={() => onPressNavMenu(PageKeys.SETTINGS)} />
                    <AppMenuButton containerStyle={{ marginBottom: 10 }} iconProps={{ name: 'card-giftcard', type: 'MaterialIcons' }} onPress={() => onPressNavMenu(PageKeys.OFFERS)} /> */}