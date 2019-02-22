import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, SafeAreaView, View, Text, StatusBar, Platform } from 'react-native';
import { heightPercentageToDP, APP_COMMON_STYLES } from '../../constants/index';
import { ShifterButton } from '../../components/buttons';
import { appNavMenuVisibilityAction } from '../../actions';
import { Tabs, Tab, ScrollableTab, TabHeading } from 'native-base';
import MyProfileTab from './my-profile';
import MyGarageTab from './my-garage';

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
        const { user } = this.props;
        const { activeTab, profilePicString } = this.state;
        return (
            <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={{ flex: 1 }}>
                    <Tabs locked={true} onChangeTab={this.onChangeTab} style={styles.bottomTabContainer} tabBarPosition='bottom' renderTabBar={() => <ScrollableTab ref={elRef => this.tabsRef = elRef} style={{ backgroundColor: '#6C6C6B' }} underlineStyle={{ height: 0 }} />}>
                        <Tab heading={<TabHeading style={[styles.bottomTab, { backgroundColor: activeTab === 0 ? '#0083CA' : '#6C6C6B' }]}>
                            <Text style={{ color: '#fff' }}>MY PROFILE</Text>
                        </TabHeading>}>
                            <MyProfileTab />
                        </Tab>
                        <Tab heading={<TabHeading style={[styles.bottomTab, { backgroundColor: activeTab === 1 ? '#0083CA' : '#6C6C6B', borderColor: '#fff', borderRightWidth: 2, borderLeftWidth: 2 }]}>
                            <Text style={{ color: '#fff' }}>MY GARAGE</Text>
                        </TabHeading>}>
                            <MyGarageTab />
                        </Tab>
                        <Tab heading={<TabHeading style={[styles.bottomTab, { backgroundColor: activeTab === 2 ? '#0083CA' : '#6C6C6B' }]}>
                            <Text style={{ color: '#fff' }}>MY VEST</Text>
                        </TabHeading>}>
                            <View style={{ backgroundColor: '#fff', flex: 1 }}></View>
                        </Tab>
                    </Tabs>

                    {/* Shifter: - Brings the app navigation menu */}
                    <ShifterButton onPress={this.showAppNavMenu}
                        containerStyles={{ bottom: BOTTOM_TAB_HEIGHT }} size={18} alignLeft={this.props.user.handDominance === 'left'} />
                </View>
            </View >
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
        height: '100%',
        width: '100%',
    },
    bottomTab: {
        flex: 1,
        height: BOTTOM_TAB_HEIGHT,
    }
});