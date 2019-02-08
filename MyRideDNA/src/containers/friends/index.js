import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SafeAreaView, Text, View } from 'react-native';
import { BasicHeader } from '../../components/headers';
import { Tabs, Tab, TabHeading, ScrollableTab, Icon as NBIcon } from 'native-base';
import { heightPercentageToDP } from '../../constants';
import styles from './styles';
import AllFriendsTab from './all-friends';
import { appNavMenuVisibilityAction } from '../../actions';
import { ShifterButton } from '../../components/buttons';

class Friends extends Component {
    tabsRef = null;
    constructor(props) {
        super(props);
        this.state = {
            headerSearchMode: false,
            searchQuery: '',
            activeTab: -1,
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.tabsRef.props.goToPage(1)
        }, 50);
    }

    toggleAppNavigation = () => this.props.showAppNavMenu();

    onChangeTab = ({ from, i }) => {
        this.setState({ activeTab: i, headerSearchMode: false });
    }

    render() {
        const { headerSearchMode, searchQuery, activeTab } = this.state;
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <BasicHeader headerHeight={heightPercentageToDP(8.5)} title='Friends' rightIconProps={{ name: 'search', type: 'FontAwesome', onPress: () => this.setState({ headerSearchMode: true }) }} searchbarMode={headerSearchMode}
                    searchValue={searchQuery} onChangeSearchValue={(val) => this.setState({ searchQuery: val })} onCancelSearchMode={() => this.setState({ headerSearchMode: false })}
                    onClearSearchValue={() => this.setState({ searchQuery: '' })} />

                <Tabs onChangeTab={this.onChangeTab} style={{ flex: 1, backgroundColor: '#fff', marginTop: heightPercentageToDP(8.5) }} renderTabBar={() => <ScrollableTab ref={elRef => this.tabsRef = elRef} activeTab={activeTab} backgroundColor='#E3EED3' underlineStyle={{ height: 0 }} />}>
                    <Tab
                        heading={<TabHeading style={{ flex: 1, backgroundColor: activeTab === 0 ? '#81BB41' : '#E3EED3' }}>
                            <NBIcon name='user' type='Feather' style={{ color: activeTab === 0 ? '#fff' : '#6B7663' }} /><Text style={{ marginLeft: 5, color: activeTab === 0 ? '#fff' : '#6B7663' }}>Online{'\n'}friends</Text>
                        </TabHeading>}>
                        <View style={{ flex: 1 }}>

                        </View>
                    </Tab>
                    <Tab
                        heading={<TabHeading style={{ flex: 1, backgroundColor: activeTab === 1 ? '#81BB41' : '#E3EED3' }}>
                            <NBIcon name='people-outline' type='MaterialIcons' style={{ color: activeTab === 1 ? '#fff' : '#6B7663' }} /><Text style={{ marginLeft: 5, color: activeTab === 1 ? '#fff' : '#6B7663' }}>All{'\n'}friends</Text>
                        </TabHeading>}>
                        <AllFriendsTab refreshContent={activeTab === 1} searchQuery={searchQuery} />
                    </Tab>
                    <Tab
                        heading={<TabHeading style={{ flex: 1, backgroundColor: activeTab === 2 ? '#81BB41' : '#E3EED3' }}>
                            <NBIcon name='group' type='FontAwesome' style={{ color: activeTab === 2 ? '#fff' : '#6B7663' }} /><Text style={{ marginLeft: 5, color: activeTab === 2 ? '#fff' : '#6B7663' }}>Groups</Text>
                        </TabHeading>}>
                        <View style={{ flex: 1 }}>

                        </View>
                    </Tab>
                </Tabs>

                {/* Shifter: - Brings the app navigation menu */}
                <ShifterButton onPress={this.toggleAppNavigation} />
            </SafeAreaView>
        );
    }
}

const mapStateToProps = (state) => {
    return {};
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Friends);