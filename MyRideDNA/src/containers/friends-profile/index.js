import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, StatusBar, ImageBackground, ScrollView } from 'react-native';
import { heightPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, WindowDimensions, widthPercentageToDP } from '../../constants/index';
import { ShifterButton, IconButton } from '../../components/buttons';
import { appNavMenuVisibilityAction, getFriendsInfoAction, resetCurrentFriendAction } from '../../actions';
import { Tabs, Tab, ScrollableTab, TabHeading, Accordion } from 'native-base';
import { BasicHeader } from '../../components/headers';
import { Actions } from 'react-native-router-flux';
import { Loader } from '../../components/loader';
import styles from './styles';

const BOTTOM_TAB_HEIGHT = heightPercentageToDP(7);
class FriendsProfile extends Component {
    // DOC: Icon format is for Icon component from NativeBase Library
    FRIENDS_PROFILE_ICONS = [
        { name: 'ios-chatbubbles', type: 'Ionicons', style: { color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(7) }, onPress: () => console.log("Chat pressed") },
        { name: 'account-remove', type: 'MaterialCommunityIcons', style: { color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(7) }, onPress: () => console.log("Unfriend pressed") },
        { name: 'location-on', type: 'MaterialIcons', style: { color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(7) }, onPress: () => console.log("Show location pressed") },
        // { name: 'ios-shirt', type: 'Ionicons', style: { color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(7) }, onPress: () => console.log("Vest pressed") },
    ];
    tabsRef = null;
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0,
            isLoadingProfPic: false
        };
    }

    componentDidMount() {
        // setTimeout(() => {
        //     this.tabsRef.props.goToPage(0);
        //     this.setState({ activeTab: 0 });
        // }, 50);
        this.props.getFriendsInfo(this.props.friendIdx);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.currentFriend !== this.props.currentFriend) {
            if (this.props.currentFriend === null) {
                Actions.pop();
                return;
            } else if (prevProps.currentFriend === null) {
                // TODO: Fetch profile picture
            }
        }
    }

    onPressBackButton = () => {
        setTimeout(() => this.props.resetCurrentFriend(), 100);
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

    onChangeTab = ({ from, i }) => {
        this.setState({ activeTab: i });
    }


    renderAccordionItem = (item) => {
        if (item.title === 'Options') {
            return (
                <View style={styles.rowContent}>
                    {
                        item.content.map(props => <IconButton key={props.name} iconProps={props} onPress={props.onPress} />)
                    }
                </View>
            );
        }
    }

    render() {
        const { user, currentFriend } = this.props;
        const { activeTab, isLoadingProfPic } = this.state;
        return currentFriend === null
            ? <View style={styles.fill} />
            : <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={{ flex: 1 }}>
                    <BasicHeader title={<Text style={{
                        fontSize: widthPercentageToDP(5),
                        color: 'white',
                        fontWeight: 'bold',
                        backgroundColor: 'transparent',
                    }}
                        renderToHardwareTextureAndroid collapsable={false}>
                        {currentFriend.name}
                        <Text style={{ color: APP_COMMON_STYLES.infoColor }}>
                            {'  '}{currentFriend.nickname}
                        </Text>
                    </Text>} leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }} />
                    <Tabs locked={true} onChangeTab={this.onChangeTab} style={styles.bottomTabContainer} tabBarPosition='bottom' renderTabBar={() => <ScrollableTab ref={elRef => this.tabsRef = elRef} style={{ backgroundColor: '#6C6C6B' }} underlineStyle={{ height: 0 }} />}>
                        <Tab heading={<TabHeading style={[styles.bottomTab, { height: BOTTOM_TAB_HEIGHT, backgroundColor: activeTab === 0 ? '#0083CA' : '#6C6C6B' }]}>
                            <Text style={{ color: '#fff' }}>PROFILE</Text>
                        </TabHeading>}>
                            <View style={{ backgroundColor: '#fff', flex: 1 }}>
                                <ImageBackground source={require('../../assets/img/profile-bg.png')} style={styles.profileBG}>
                                    <View style={styles.profilePic}>
                                        <ImageBackground source={currentFriend.profilePicture ? { uri: currentFriend.profilePicture } : require('../../assets/img/profile-pic.png')} style={{ height: null, width: null, flex: 1, borderRadius: 5 }}>
                                            {
                                                isLoadingProfPic
                                                    ? <Loader show={isLoadingProfPic} />
                                                    : null
                                            }
                                        </ImageBackground>
                                    </View>
                                </ImageBackground>
                                <ScrollView styles={styles.scrollBottom} contentContainerStyle={styles.scrollBottomContent}>
                                    <Accordion dataArray={[{ title: 'Options', content: this.FRIENDS_PROFILE_ICONS }]}
                                        renderContent={this.renderAccordionItem} headerStyle={styles.accordionHeader} />
                                </ScrollView>
                            </View>
                        </Tab>
                        <Tab heading={<TabHeading style={[styles.bottomTab, { height: BOTTOM_TAB_HEIGHT, backgroundColor: activeTab === 1 ? '#0083CA' : '#6C6C6B', borderLeftWidth: 2, borderLeftColor: '#fff', borderRightWidth: 1, borderRightColor: '#fff' }]}>
                            <Text style={{ color: '#fff' }}>GARAGE</Text>
                        </TabHeading>}>
                            <View style={{ backgroundColor: '#fff', flex: 1 }}>
                                <Text>GARAGE</Text>
                            </View>
                        </Tab>
                        <Tab heading={<TabHeading style={[styles.bottomTab, { height: BOTTOM_TAB_HEIGHT, backgroundColor: activeTab === 2 ? '#0083CA' : '#6C6C6B', borderLeftWidth: 1, borderLeftColor: '#fff', borderRightWidth: 2, borderRightColor: '#fff' }]}>
                            <Text style={{ color: '#fff' }}>RIDES</Text>
                        </TabHeading>}>
                            <View style={{ backgroundColor: '#fff', flex: 1 }}>
                                <Text>RIDES</Text>
                            </View>
                        </Tab>
                        <Tab heading={<TabHeading style={[styles.bottomTab, { height: BOTTOM_TAB_HEIGHT, backgroundColor: activeTab === 3 ? '#0083CA' : '#6C6C6B' }]}>
                            <Text style={{ color: '#fff' }}>VEST</Text>
                        </TabHeading>}>
                            <View style={{ backgroundColor: '#fff', flex: 1 }}>
                                <Text>VEST</Text>
                            </View>
                        </Tab>
                    </Tabs>

                    {/* Shifter: - Brings the app navigation menu */}
                    <ShifterButton onPress={this.showAppNavMenu}
                        containerStyles={{ bottom: IS_ANDROID ? BOTTOM_TAB_HEIGHT : BOTTOM_TAB_HEIGHT - 8 }} size={18} alignLeft={user.handDominance === 'left'} />
                </View>
            </View >
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { showMenu } = state.TabVisibility;
    const { currentFriend } = state.FriendList;
    return { user, showMenu, currentFriend };
};
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        getFriendsInfo: (friendIdx) => dispatch(getFriendsInfoAction(friendIdx)),
        resetCurrentFriend: () => dispatch(resetCurrentFriendAction()),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(FriendsProfile);