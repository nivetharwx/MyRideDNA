import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, SafeAreaView, View, Text, StatusBar, Platform, ImageBackground } from 'react-native';
import { heightPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, WindowDimensions, widthPercentageToDP } from '../../constants/index';
import { ShifterButton } from '../../components/buttons';
import { appNavMenuVisibilityAction } from '../../actions';
import { Tabs, Tab, ScrollableTab, TabHeading } from 'native-base';
import MyProfileTab from './my-profile';
import MyGarageTab from './my-garage';
import { Loader } from '../../components/loader';

const BOTTOM_TAB_HEIGHT = heightPercentageToDP(7);
class Profile extends Component {
    tabsRef = null;
    constructor(props) {
        super(props);
        this.state = {
            profilePicString: '',
            activeTab: 0,
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.tabsRef.props.goToPage(0);
            this.setState({ activeTab: 0 });
        }, 50);
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

    onChangeTab = ({ from, i }) => {
        this.setState({ activeTab: i });
    }

    render() {
        const { user, showLoader } = this.props;
        const { activeTab, profilePicString } = this.state;
        return (
            <View style={styles.fill}>
                {
                    IS_ANDROID
                        ? <View style={APP_COMMON_STYLES.statusBar}>
                            <StatusBar translucent backgroundColor='black' barStyle="light-content" />
                        </View>
                        : activeTab !== 0
                            ? <View style={APP_COMMON_STYLES.statusBar}>
                                <StatusBar translucent backgroundColor='black' barStyle="light-content" />
                            </View>
                            : null
                }
                <View style={[{ flex: 1 }, !this.props.hasNetwork ? { marginBottom: heightPercentageToDP(8.2) } : null]}>
                    <Tabs onChangeTab={this.onChangeTab} style={styles.bottomTabContainer} tabBarPosition='bottom' renderTabBar={() => <ScrollableTab ref={elRef => this.tabsRef = elRef} style={{ backgroundColor: '#6C6C6B', height: BOTTOM_TAB_HEIGHT }} underlineStyle={{ height: 0 }} />}>
                        <Tab heading={<TabHeading style={[styles.bottomTab, { backgroundColor: activeTab === 0 ? 'rgba(0, 0, 0, 0.5)' : '#0083CA' }]}>
                            <Text style={{ color: '#fff', fontSize: widthPercentageToDP(3) }}>MY PROFILE</Text>
                        </TabHeading>}>
                            <MyProfileTab />
                        </Tab>
                        <Tab heading={<TabHeading style={[styles.bottomTab, { backgroundColor: activeTab === 1 ? 'rgba(0, 0, 0, 0.5)' : '#0083CA', borderLeftWidth: 2, borderLeftColor: '#fff', borderRightWidth: 2, borderRightColor: '#fff' }]}>
                            <Text style={{ color: '#fff', fontSize: widthPercentageToDP(3) }}>MY GARAGE</Text>
                        </TabHeading>}>
                            <MyGarageTab />
                        </Tab>
                        {/* <Tab heading={<TabHeading style={[styles.bottomTab, { backgroundColor: activeTab === 2 ? '#0083CA' : '#6C6C6B' }]}>
                            <Text style={{ color: '#fff', fontSize: widthPercentageToDP(3) }}>MY VEST</Text>
                        </TabHeading>}>
                            <View style={{ backgroundColor: 'rgba(149, 165, 166, 1)', flex: 1, }}>
                                <ImageBackground source={require('../../assets/img/vest.png')} style={{ width: '100%', height: '100%' }} imageStyle={{ opacity: 0.5 }}></ImageBackground>
                                <Text style={{ position: 'absolute', width: '100%', textAlign: 'center', marginTop: heightPercentageToDP(20), fontWeight: 'bold', fontSize: 80, color: 'rgba(rgba(46, 49, 49, 1))' }}>MY VEST</Text>
                                <Text style={{ position: 'absolute', width: '100%', textAlign: 'center', marginTop: heightPercentageToDP(40), fontSize: 50, color: 'rgba(rgba(46, 49, 49, 1))' }}>Coming Soon...</Text>

                            </View>

                        </Tab> */}
                    </Tabs>

                    {/* Shifter: - Brings the app navigation menu */}
                    <ShifterButton onPress={this.showAppNavMenu}
                        containerStyles={{ bottom: BOTTOM_TAB_HEIGHT }} size={18} alignLeft={this.props.user.handDominance === 'left'} />
                </View>
                <Loader isVisible={showLoader} />
            </View >
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { showMenu } = state.TabVisibility;
    const { showLoader, hasNetwork } = state.PageState;
    return { user, showMenu, showLoader, hasNetwork };
};
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Profile);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    bottomTabContainer: {
        position: 'absolute',
        // zIndex: 50,
        bottom: 0,
        // paddingBottom: IS_ANDROID ? 0 : 20,
        height: '100%',
        width: '100%',
    },
    bottomTab: {
        height: BOTTOM_TAB_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        width: widthPercentageToDP(50),

    }
});