import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, SafeAreaView, View, Text, ImageBackground, Image, StatusBar, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Actions } from 'react-native-router-flux';
import { PageKeys, widthPercentageToDP, heightPercentageToDP, APP_COMMON_STYLES, USER_AUTH_TOKEN } from '../../constants/index';
import { ShifterButton, IconButton } from '../../components/buttons';
import { appNavMenuVisibilityAction } from '../../actions';
import { Accordion, Tabs, Tab, ScrollableTab, TabHeading } from 'native-base';
import ImagePicker from 'react-native-image-crop-picker';
import { logoutUser } from '../../api';

/**
 * TODO: 
 * 1) Change bike: -
 *        a) How the user will select a bike?
 *        b) How the active bike will display?
 * 2) Bottom tabs (MY GARAGE and MY VEST) - Waiting for platypus design confirmation
 * 3) Passengers -  Waiting for platypus design confirmation
 * 4) Default profile picture or profile picture placeholder
 * 
 */

class Profile extends Component {
    // DOC: Icon format is for Icon component from NativeBase Library
    PROFILE_ICONS = {
        gallery: { name: 'md-photos', type: 'Ionicons', style: { color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(7) }, onPress: () => this.onPressGalleryIcon() },
        camera: { name: 'camera', type: 'FontAwesome', style: { color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(6) }, onPress: () => this.onPressCameraIcon() },
        passengers: { name: 'md-people', type: 'Ionicons', style: { color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(7) }, onPress: () => { console.log('Passengers pressed') } },
    };
    constructor(props) {
        super(props);
        this.state = {
            profilePicString: '',
            activeTab: -1,
        };
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

    renderAccordionItem = (item) => {
        if (item.title === 'Change profile') {
            return (
                <View style={styles.rowContent}>
                    {
                        item.content.map(props => <IconButton key={props.name} iconProps={props} onPress={props.onPress} />)
                    }
                </View>
            );
        } else {
            return (
                <View style={styles.rowContent}>
                    {
                        <Text>{item.content.toString()}</Text>
                    }
                </View>
            );
        }
    }

    onPressGalleryIcon = async () => {
        try {
            const imageObj = await ImagePicker.openPicker({
                width: 300,
                height: 300,
                cropping: false,
                includeBase64: true,
            });
            this.setState({ profilePicString: `data:${imageObj.mime};base64,${imageObj.data}` });
        } catch (er) {
            console.log("Error occurd: ", er);
        }
    }

    onPressCameraIcon = async () => {
        try {
            const imageObj = await ImagePicker.openCamera({
                width: 300,
                height: 300,
                includeBase64: true,
                cropping: false, // DOC: Setting this to true (in openCamera) is not working as expected (19-12-2018).
            });
            this.setState({ profilePicString: `data:${imageObj.mime};base64,${imageObj.data}` });
        } catch (er) {
            console.log("Error occurd: ", er);
        }
    }

    onPressLogout = async () => {
        // TODO: Store accesstoken initially while login and use it here,
        const accessToken = await AsyncStorage.getItem(USER_AUTH_TOKEN);
        const deviceToken = await AsyncStorage.getItem(DEVICE_TOKEN);
        this.props.logoutUser(this.props.user.userId, accessToken, deviceToken);
    }

    render() {
        const { user } = this.props;
        const { activeTab, profilePicString } = this.state;
        return (
            <SafeAreaView style={styles.fill}>
                <StatusBar
                    backgroundColor={APP_COMMON_STYLES.statusBarColor}
                    barStyle="default"
                />
                <ImageBackground source={require('../../assets/img/profile-bg.png')} style={styles.profileBG}>
                    <View style={styles.profilePic}>
                        <Image source={profilePicString ? { uri: profilePicStrings } : require('../../assets/img/profile-pic.png')} style={{ height: null, width: null, flex: 1, borderRadius: 5 }} />
                    </View>
                    <View style={styles.profileHeader}>
                        <IconButton iconProps={{ name: 'bell', type: 'FontAwesome', style: { fontSize: widthPercentageToDP(5) } }}
                            style={[styles.headerIcon, { marginLeft: widthPercentageToDP(1) }]} onPress={() => Actions.push(PageKeys.NOTIFICATIONS)} />
                        <Text style={styles.title}
                            renderToHardwareTextureAndroid collapsable={false}>
                            {user.name}
                            <Text style={{ color: APP_COMMON_STYLES.infoColor, fontWeight: 'bold' }}>
                                {'  '}{user.nickname}
                            </Text>
                        </Text>
                        <IconButton iconProps={{ name: 'md-exit', type: 'Ionicons', style: { fontSize: widthPercentageToDP(8), color: APP_COMMON_STYLES.infoColor } }}
                            style={[styles.headerIcon, { backgroundColor: 'transparent' }]} onPress={this.onPressLogout} />
                    </View>
                </ImageBackground>
                <ScrollView styles={styles.scrollBottom} contentContainerStyle={styles.scrollBottomContent}>
                    <Accordion dataArray={[{ title: 'Change profile', content: [this.PROFILE_ICONS.gallery, this.PROFILE_ICONS.camera, this.PROFILE_ICONS.passengers] },
                    { title: 'Change space', content: [] }]}
                        renderContent={this.renderAccordionItem} headerStyle={styles.accordionHeader} />
                </ScrollView>

                <Tabs onChangeTab={this.onChangeTab} style={[styles.bottomTabs, activeTab > -1 ? styles.fullSize : null]} tabBarPosition='bottom' renderTabBar={() => <ScrollableTab style={{ backgroundColor: '#6C6C6B' }} underlineStyle={{ height: 0 }} />}>
                    <Tab heading={<TabHeading style={{ flex: 1, backgroundColor: activeTab === 0 ? '#0083CA' : '#6C6C6B' }}>
                        <Text style={{ color: '#fff' }}>MY GARAGE</Text>
                    </TabHeading>}>
                        <View style={{ backgroundColor: 'red', flex: activeTab === 0 ? 1 : null }}></View>
                    </Tab>
                    <Tab heading={<TabHeading style={{ flex: 1, backgroundColor: activeTab === 1 ? '#0083CA' : '#6C6C6B' }}>
                        <Text style={{ color: '#fff' }}>MY VEST</Text>
                    </TabHeading>}>
                        <View style={{ backgroundColor: 'green', flex: activeTab === 1 ? 1 : null }}></View>
                    </Tab>
                </Tabs>

                {/* Shifter: - Brings the app navigation menu */}
                <ShifterButton onPress={this.showAppNavMenu} alignLeft={this.props.user.handDominance === 'left'} />
            </SafeAreaView>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { showMenu } = state.TabVisibility;
    return { user, showMenu };
};
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        logoutUser: (userId, accessToken, deviceToken) => dispatch(logoutUser(userId, accessToken, deviceToken)),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Profile);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    rowContent: {
        padding: heightPercentageToDP(5),
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    profileHeader: {
        position: 'absolute',
        zIndex: 50,
        width: '100%',
        height: heightPercentageToDP(6),
        flexDirection: 'row',
        marginTop: heightPercentageToDP(1)
    },
    headerIcon: {
        paddingHorizontal: 0,
        width: widthPercentageToDP(9),
        height: widthPercentageToDP(9),
        borderRadius: widthPercentageToDP(9) / 2,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        flex: 1,
        marginLeft: widthPercentageToDP(3),
        alignSelf: 'center',
        fontSize: widthPercentageToDP(5),
        color: 'white',
        alignItems: 'flex-start',
        fontWeight: 'bold',
        backgroundColor: 'transparent',
    },
    profileBG: {
        width: '100%',
        height: heightPercentageToDP(65),
    },
    profilePic: {
        height: widthPercentageToDP(80),
        width: widthPercentageToDP(80),
        alignSelf: 'center',
        marginTop: heightPercentageToDP(10),
        borderWidth: 1,
    },
    scrollBottomContent: {
        flex: 1,
        marginBottom: heightPercentageToDP(9.9)
    },
    accordionHeader: {
        backgroundColor: 'transparent',
        marginHorizontal: widthPercentageToDP(10),
        borderBottomWidth: 1,
        borderBottomColor: '#000'
    },
    bottomTabs: {
        position: 'absolute',
        // zIndex: 50, 
        bottom: 0,
        height: heightPercentageToDP(10),
    },
    fullSize: {
        height: '100%',
        width: '100%',
    }
});