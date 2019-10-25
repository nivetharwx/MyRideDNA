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
            this.tabsRef.goToPage(0);
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
                    <Tabs tabBarPosition='bottom' tabContainerStyle={styles.bottomTabContainer} ref={elRef => this.tabsRef = elRef} onChangeTab={this.onChangeTab} tabBarActiveTextColor='#fff' tabBarInactiveTextColor='#fff' tabBarUnderlineStyle={{ height: 0 }}>
                        <Tab heading='MY PROFILE' tabStyle={[styles.inActiveTab, styles.borderRightWhite]} activeTabStyle={[styles.activeTab, styles.borderRightWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                            <MyProfileTab />
                        </Tab>
                        <Tab heading='MY GARAGE' tabStyle={[styles.inActiveTab, styles.borderLeftWhite]} activeTabStyle={[styles.activeTab, styles.borderLeftWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                            <MyGarageTab />
                        </Tab>
                    </Tabs>

                    {/* Shifter: - Brings the app navigation menu */}
                    <ShifterButton onPress={this.showAppNavMenu}
                        containerStyles={{ bottom: APP_COMMON_STYLES.tabContainer.height }} size={18} alignLeft={this.props.user.handDominance === 'left'} />
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
        bottom: 0,
        width: '100%',
        height: APP_COMMON_STYLES.tabContainer.height
    },
    bottomTab: {
        height: APP_COMMON_STYLES.tabContainer.height,
        alignItems: 'center',
        justifyContent: 'center',
        width: widthPercentageToDP(50),

    },
    activeTab: {
        backgroundColor: '#000000'
    },
    inActiveTab: {
        backgroundColor: '#0083CA'
    },
    borderRightWhite: {
        borderRightWidth: 1,
        borderColor: '#fff'
    },
    borderLeftWhite: {
        borderLeftWidth: 1,
        borderColor: '#fff'
    },
    tabText: {
        fontSize: 13,
        fontWeight: 'bold'
    }
});