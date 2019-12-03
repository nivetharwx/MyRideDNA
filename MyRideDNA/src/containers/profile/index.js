import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, SafeAreaView, View, Text, StatusBar, Platform, ImageBackground } from 'react-native';
import { heightPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, WindowDimensions, widthPercentageToDP } from '../../constants/index';
import { ShifterButton } from '../../components/buttons';
import { appNavMenuVisibilityAction, replaceGarageInfoAction, clearGarageInfoAction } from '../../actions';
import { Tabs, Tab, ScrollableTab, TabHeading } from 'native-base';
import MyProfileTab from './my-profile';
import MyGarageTab from './my-garage';
import { Loader } from '../../components/loader';
import { getGarageInfo } from '../../api';

class Profile extends Component {
    tabsRef = null;
    constructor(props) {
        super(props);
        this.state = {
            profilePicString: '',
        };
    }

    componentDidMount() {
        this.props.getGarageInfo(this.props.user.userId);
        if (this.props.tabProps.activeTab !== 0) setTimeout(() => this.tabsRef.goToPage(this.props.tabProps.activeTab), 0);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.tabProps !== this.props.tabProps) {
            this.tabsRef.goToPage(this.props.tabProps.activeTab);
        }
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

    componentWillUnmount() {
        // this.props.clearGarageInfo();
    }

    render() {
        const { user, showLoader } = this.props;
        return (
            <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={[{ flex: 1 }, !this.props.hasNetwork ? { marginBottom: heightPercentageToDP(8.2) } : null]}>
                    <Tabs tabBarPosition='bottom' tabContainerStyle={styles.bottomTabContainer} ref={elRef => this.tabsRef = elRef} tabBarActiveTextColor='#fff' tabBarInactiveTextColor='#fff' tabBarUnderlineStyle={{ height: 0 }}>
                        <Tab heading='MY PROFILE' tabStyle={[styles.inActiveTab, styles.borderRightWhite]} activeTabStyle={[styles.activeTab, styles.borderRightWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                            <MyProfileTab />
                        </Tab>
                        <Tab heading='MY GARAGE' tabStyle={[styles.inActiveTab, styles.borderLeftWhite]} activeTabStyle={[styles.activeTab, styles.borderLeftWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                            <MyGarageTab />
                        </Tab>
                    </Tabs>

                    {/* Shifter: - Brings the app navigation menu */}
                    <ShifterButton onPress={this.showAppNavMenu}
                        containerStyles={{ bottom: APP_COMMON_STYLES.tabContainer.height }} size={18} alignLeft={user.handDominance === 'left'} />
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
        getGarageInfo: (userId) => {
            getGarageInfo(userId, (garage) => {
                dispatch(replaceGarageInfoAction(garage));
            }, (error) => {
                console.log(`getGarage error: `, error);
            })
        },
        clearGarageInfo: () => dispatch(clearGarageInfoAction()),
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