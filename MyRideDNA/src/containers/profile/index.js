import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, } from 'react-native';
import { APP_COMMON_STYLES, CUSTOM_FONTS } from '../../constants/index';
import { Tabs, Tab } from 'native-base';
import MyProfileTab from './my-profile';
import MyGarageTab from './my-garage';
import { BasePage } from '../../components/pages';

class Profile extends Component {
    tabsRef = null;
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (this.props.tabProps.activeTab !== 0) setTimeout(() => this.tabsRef && this.tabsRef.goToPage(this.props.tabProps.activeTab), 0);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.tabProps !== this.props.tabProps) {
            this.tabsRef && this.tabsRef.goToPage(this.props.tabProps.activeTab);
        }
    }

    render() {
        const { showLoader } = this.props;
        return (
            <BasePage defaultHeader={false} showLoader={showLoader} shifterBottomOffset={APP_COMMON_STYLES.tabContainer.height}>
                <Tabs tabBarPosition='bottom' tabContainerStyle={styles.bottomTabContainer} ref={elRef => this.tabsRef = elRef} tabBarActiveTextColor='#fff' tabBarInactiveTextColor='#fff' tabBarUnderlineStyle={{ height: 0 }}>
                    <Tab heading='MY PROFILE' tabStyle={[styles.inActiveTab]} activeTabStyle={[styles.activeTab]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                        <MyProfileTab />
                    </Tab>
                    <Tab heading='MY GARAGE' tabStyle={[styles.inActiveTab, styles.borderLeftWhite]} activeTabStyle={[styles.activeTab, styles.borderLeftWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                        <MyGarageTab isEditable={true} />
                    </Tab>
                </Tabs>
            </BasePage>
        );
    }
}

const mapStateToProps = (state) => {
    const { showLoader, hasNetwork } = state.PageState;
    return { showLoader, hasNetwork };
};
export default connect(mapStateToProps, null)(Profile);

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
    activeTab: {
        backgroundColor: '#000000'
    },
    inActiveTab: {
        backgroundColor: '#0083CA'
    },
    tabText: {
        fontSize: 13,
        fontFamily: CUSTOM_FONTS.robotoBold,
    }
});