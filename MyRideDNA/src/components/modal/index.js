import React from 'react';
import { connect } from 'react-redux';
import {
    StyleSheet,
    SafeAreaView, Modal, TouchableOpacity, ScrollView, View, Image,
    TouchableWithoutFeedback, Text, ImageBackground, StatusBar, Platform
} from 'react-native';
import { Icon as NBIcon } from 'native-base';
import { AppMenuButton, ImageButton } from '../buttons';
import { Actions } from 'react-native-router-flux';
import { PageKeys, heightPercentageToDP, widthPercentageToDP, IS_ANDROID, APP_COMMON_STYLES } from '../../constants';
import { BasicHeader } from '../headers';
import { appNavMenuVisibilityAction } from '../../actions';
import { DefaultText } from '../labels';


export const MenuModal = ({ isVisible, onClose, onPressNavMenu, activeMenu, notificationCount, hideAppNavMenu, alignCloseIconLeft = false }) => {
    return (
        <SafeAreaView>
            <Modal
                animationType="slide"
                transparent={true}
                visible={isVisible}
                onRequestClose={onClose}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <BasicHeader showShadow={false} style={[{ backgroundColor: 'transparent' }, IS_ANDROID ? null : { marginTop: 20 }]} headerHeight={heightPercentageToDP(8.5)}
                        rightIconProps={{ name: 'close', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(8), color: '#AFAFAF' }, onPress: hideAppNavMenu }} />
                    <View style={{ flex: 1, marginTop: APP_COMMON_STYLES.headerHeight }}>
                        <View style={styles.rowContainer}>
                            <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-newsfeed.png')} imgStyles={styles.navIconImage} onPress={() => null} />
                            <TouchableOpacity activeOpacity={0.7} onPress={() => onPressNavMenu({ screenKey: PageKeys.NOTIFICATIONS })}>
                                <View style={styles.navIconImage}>
                                    <ImageBackground style={{ width: null, height: null, flex: 1 }} source={require('../../assets/img/menu-notifications.png')}>
                                        {
                                            notificationCount > 0
                                                ? <View style={{
                                                    position: 'absolute', width: 29, height: 29, borderRadius: 29,
                                                    backgroundColor: '#0076B5', top: 0, right: 2, borderWidth: 2, borderColor: '#fff', justifyContent: 'center', alignItems: 'center'
                                                }}>
                                                    <DefaultText style={{ color: '#fff', fontWeight: 'bold', fontSize: widthPercentageToDP(3) }}>{notificationCount}</DefaultText>
                                                </View>
                                                : null
                                        }
                                    </ImageBackground>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.rowContainer}>
                            <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-road-buddies.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu({ screenKey: PageKeys.FRIENDS })} />
                            <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-messaging.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu({ screenKey: PageKeys.CHAT_LIST })} />
                        </View>
                        <View style={styles.rowContainer}>
                            <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-profile.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu({ screenKey: PageKeys.PROFILE, params: { tabProps: { activeTab: 0 } } })} />
                            <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-garage.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu({ screenKey: PageKeys.PROFILE, params: { tabProps: { activeTab: 1 } } })} />
                        </View>
                        <View style={styles.rowContainer}>
                            <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-lets-ride.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu({ screenKey: PageKeys.MAP })} />
                            <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-settings.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu({ screenKey: PageKeys.SETTINGS })} />
                        </View>
                        <View style={styles.rowContainer}>
                            <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-atlas.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu({ screenKey: PageKeys.RIDES })} />
                            <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-offers.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu({ screenKey: PageKeys.OFFERS })} />
                        </View>
                        {/* <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-rides.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu({ screenKey: PageKeys.RIDES })} /> */}
                        {/* <TouchableOpacity style={{ marginHorizontal: 35, marginVertical: 15 }} activeOpacity={0.7} onPress={() => onPressNavMenu({ screenKey: PageKeys.NOTIFICATIONS)}>
                            <View style={styles.navIconImage}>
                                <ImageBackground style={{ width: null, height: null, flex: 1 }} source={require('../../assets/img/menu-notifications.png')}>
                                    {
                                        notificationCount > 0
                                            ? <View style={{
                                                position: 'absolute', width: widthPercentageToDP(7), height: widthPercentageToDP(7), borderRadius: widthPercentageToDP(6),
                                                backgroundColor: '#0076B5', top: 11, right: 10, borderWidth: widthPercentageToDP(1), borderColor: '#fff', justifyContent: 'center', alignItems: 'center'
                                            }}>
                                                <DefaultText  style={{ color: '#fff', fontWeight: 'bold', fontSize: widthPercentageToDP(3) }}>{notificationCount}</DefaultText>
                                            </View>
                                            : null
                                    }
                                </ImageBackground>
                            </View>
                        </TouchableOpacity> */}
                        {/* <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-notifications.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu({ screenKey: PageKeys.NOTIFICATIONS)} /> */}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
};
const mapStateToProps = (state) => {
    return {};
}
const mapDispatchToProps = (dispatch) => {
    return {
        hideAppNavMenu: () => dispatch(appNavMenuVisibilityAction(false)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(MenuModal);

export const BaseModal = (props) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={props.isVisible}
            onRequestClose={props.onCancel}>
            {
                props.onPressOutside ?
                    <TouchableOpacity style={[styles.fillParent, props.offSpaceBackgroundColor ? { backgroundColor: props.offSpaceBackgroundColor } : styles.modalOffSpaceBgColor]} onPress={props.onPressOutside}>
                        <ScrollView
                            directionalLockEnabled={true}
                            style={styles.fillParent}
                            contentContainerStyle={[styles.fillParent, IS_ANDROID ? null : styles.safePadding, props.alignCenter ? styles.centerContent : null]}
                        >
                            <TouchableWithoutFeedback>
                                {
                                    props.children
                                }
                            </TouchableWithoutFeedback>
                        </ScrollView>
                    </TouchableOpacity>
                    : <View style={[styles.fillParent, styles.modalOffSpaceBgColor]}>
                        <ScrollView
                            directionalLockEnabled={true}
                            style={styles.fillParent}
                            contentContainerStyle={[styles.fillParent, props.alignCenter ? styles.centerContent : null]}
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
}

const styles = StyleSheet.create({
    navIconImage: {
        width: 84,
        height: 84,
        borderRadius: 84,
        marginHorizontal: 35
    },
    fillParent: {
        width: '100%',
        height: '100%'
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOffSpaceBgColor: {
        backgroundColor: 'rgba(0,0,0,0.7)'
    },
    safePadding: {
        paddingTop: heightPercentageToDP(2)
    },
    rowContainer: {
        alignSelf: 'center',
        flexDirection: 'row',
        marginTop: 15
    }
});