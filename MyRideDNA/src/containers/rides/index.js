import React, { Component } from 'react';
import { SafeAreaView, Text, View, FlatList, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import { connect } from 'react-redux';

import { Accordion, Tab, TabHeading, Tabs, ScrollableTab, Icon as NBIcon, ListItem, Left, Right, ActionSheet } from "native-base";
import { PageKeys, WindowDimensions, RIDE_TYPE } from '../../constants';
import { Actions } from 'react-native-router-flux';
import { ShifterButton } from '../../components/buttons';
import { appNavMenuVisibilityAction, loadRideAction, screenChangeAction, clearRideAction } from '../../actions';
import { BasicHeader } from '../../components/headers';
import { getAllBuildRides, getRideByRideId, deleteRide, getAllRecordedRides } from '../../api';
import { getFormattedDate } from '../../util';

const RIDE_OPTIONS = [
    { text: "Copy to new ride", icon: "md-copy", iconColor: "#EB861E" },
    { text: "Remove from list", icon: "md-trash", iconColor: "#EB861E" },
    { text: "Cancel", icon: "md-close-circle", iconColor: "#EB861E" },
];

export class Rides extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0,
            searchQuery: '',
            headerSearchMode: false
        };
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

    componentDidMount() {
        const { activeTab } = this.state;
        if (activeTab === 0) {
            this.props.getAllBuildRides(this.props.user.userId);
        } else if (activeTab === 1) {
            this.props.getAllRecordedRides(this.props.user.userId);
        } else {
            
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const { activeTab } = this.state;
        if (prevState.activeTab != activeTab) {
            if (activeTab === 0) {
                this.props.getAllBuildRides(this.props.user.userId);
            } else if (activeTab === 1) {
                this.props.getAllRecordedRides(this.props.user.userId);
            } else {
                // TODO: Shared rides
            }
        }
    }

    onChangeTab = ({ from, i }) => {
        this.setState({ activeTab: i, headerSearchMode: false });
    }

    keyExtractor = (item) => item.rideId;

    onPressRideOptions = (rideId, rideName, rideType, index) => {
        ActionSheet.show(
            {
                options: RIDE_OPTIONS,
                cancelButtonIndex: 2,
                title: 'Choose an option'
            },
            async (buttonIndex) => {
                if (buttonIndex === 0) {
                    console.log("Copy to new ride");
                } else if (buttonIndex === 1) {
                    // DOC: Clear ride from map if it is currently loaded on map
                    Alert.alert(
                        'Confirmation to delete',
                        `Are you sure to delete the ${rideName}?`,
                        [
                            {
                                text: 'Yes', onPress: () => {
                                    if (this.props.ride.rideId === rideId) {
                                        this.props.clearRideFromMap();
                                    }
                                    this.props.deleteRide(rideId, index, rideType);
                                }
                            },
                            { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                        ],
                        { cancelable: false }
                    );
                } else {
                    console.log('Cancelled by user');
                }
            }
        );
    }

    onPressRide(rideId) {
        this.props.changeScreen(PageKeys.MAP);
        this.props.loadRideOnMap(rideId);
    }

    render() {
        const { activeTab, searchQuery, headerSearchMode } = this.state;
        const { buildRides, recordedRides, sharedRides } = this.props;
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <BasicHeader title='Rides' rightIconProps={{ name: 'search', type: 'FontAwesome', onPress: () => this.setState({ headerSearchMode: true }) }} searchbarMode={headerSearchMode}
                    searchValue={searchQuery} onChangeSearchValue={(val) => this.setState({ searchQuery: val })} onCancelSearchMode={() => this.setState({ headerSearchMode: false })}
                    onClearSearchValue={() => this.setState({ searchQuery: '' })} />
                <Tabs onChangeTab={this.onChangeTab} style={{ flex: 1, backgroundColor: '#E3EED3', marginTop: 60 }} renderTabBar={() => <ScrollableTab activeTab={activeTab} backgroundColor='#E3EED3' underlineStyle={{ height: 0 }} />}>
                    <Tab
                        heading={<TabHeading style={{ backgroundColor: activeTab === 0 ? '#81BB41' : '#E3EED3' }}>
                            <NBIcon name='motorbike' type='MaterialCommunityIcons' style={{ color: activeTab === 0 ? '#fff' : '#6B7663' }} /><Text style={{ marginLeft: 5, color: activeTab === 0 ? '#fff' : '#6B7663' }}>Created{'\n'}Rides</Text>
                        </TabHeading>}>
                        <View>
                            {
                                buildRides.length > 0 ?
                                    <FlatList
                                        data={buildRides}
                                        renderItem={({ item, index }) => <ListItem style={{ marginLeft: 0, paddingLeft: 10, backgroundColor: index % 2 === 0 ? '#fff' : '#F3F2F2' }}>
                                            <Left style={{ flex: 1 }}>
                                                <TouchableOpacity style={{ flex: 1 }} onPress={() => this.onPressRide(item.rideId)}>
                                                    <Text>{`${item.name}, ${getFormattedDate(new Date(item.date).toString().substr(4, 12), '.')}`}</Text>
                                                </TouchableOpacity>
                                            </Left>
                                            <Right>
                                                <TouchableOpacity onPress={() => this.onPressRideOptions(item.rideId, item.name, RIDE_TYPE.BUILD_RIDE, index)}>
                                                    <NBIcon name="dots-vertical" type='MaterialCommunityIcons' style={{ alignSelf: 'center', color: '#EB861E' }} />
                                                </TouchableOpacity>
                                            </Right>
                                        </ListItem>}
                                        keyExtractor={this.keyExtractor}
                                    />
                                    : <ImageBackground source={require('../../assets/img/empty-rides-bg.png')} style={{ width: '100%', height: '100%' }} />
                            }
                        </View>
                    </Tab>
                    <Tab
                        heading={<TabHeading style={{ flex: 1, backgroundColor: activeTab === 1 ? '#81BB41' : '#E3EED3', borderColor: '#fff', borderRightWidth: 2, borderLeftWidth: 2 }}>
                            <NBIcon name='menu' type='MaterialCommunityIcons' style={{ color: activeTab === 1 ? '#fff' : '#6B7663' }} /><Text style={{ marginLeft: 5, color: activeTab === 1 ? '#fff' : '#6B7663' }}>Recorded{'\n'}Rides</Text>
                        </TabHeading>}>
                        <View>
                            {
                                recordedRides.length > 0 ?
                                    <FlatList
                                        data={recordedRides}
                                        renderItem={({ item, index }) => <ListItem style={{ marginLeft: 0, paddingLeft: 10, backgroundColor: index % 2 === 0 ? '#fff' : '#F3F2F2' }}>
                                            <Left style={{ flex: 1 }}>
                                                <TouchableOpacity style={{ flex: 1 }} onPress={() => this.onPressRide(item.rideId)}>
                                                    <Text>{`${item.name}`}</Text>
                                                </TouchableOpacity>
                                            </Left>
                                            <Right>
                                                <TouchableOpacity onPress={() => this.onPressRideOptions(item.rideId, item.name, RIDE_TYPE.RECORD_RIDE, index)}>
                                                    <NBIcon name="dots-vertical" type='MaterialCommunityIcons' style={{ alignSelf: 'center', color: '#EB861E' }} />
                                                </TouchableOpacity>
                                            </Right>
                                        </ListItem>}
                                        keyExtractor={this.keyExtractor}
                                    />
                                    : <ImageBackground source={require('../../assets/img/empty-rides-bg.png')} style={{ width: '100%', height: '100%' }} />
                            }
                        </View>
                    </Tab>
                    <Tab
                        heading={<TabHeading style={{ flex: 1, backgroundColor: activeTab === 2 ? '#81BB41' : '#E3EED3' }}>
                            <NBIcon name='ios-people' type='Ionicons' style={{ color: activeTab === 2 ? '#fff' : '#6B7663' }} /><Text style={{ marginLeft: 5, color: activeTab === 2 ? '#fff' : '#6B7663' }}>Shared{'\n'}Rides</Text>
                        </TabHeading>}>
                        <View>
                            {
                                sharedRides.length > 0 ?
                                    <FlatList
                                        data={sharedRides}
                                        renderItem={({ item, index }) => <ListItem style={{ marginLeft: 0, paddingLeft: 10, backgroundColor: index % 2 === 0 ? '#fff' : '#F3F2F2' }}>
                                            <Left style={{ flex: 1 }}>
                                                <TouchableOpacity style={{ flex: 1 }} onPress={() => this.onPressRide(item.rideId)}>
                                                    <Text>{`${item.name}, ${getFormattedDate(new Date(item.date).toString().substr(4, 12), '.')}`}</Text>
                                                </TouchableOpacity>
                                            </Left>
                                            <Right>
                                                <TouchableOpacity onPress={() => this.onPressRideOptions(item.rideId, item.name, RIDE_TYPE.BUILD_RIDE, index)}>
                                                    <NBIcon name="dots-vertical" type='MaterialCommunityIcons' style={{ alignSelf: 'center', color: '#EB861E' }} />
                                                </TouchableOpacity>
                                            </Right>
                                        </ListItem>}
                                        keyExtractor={this.keyExtractor}
                                    />
                                    : <ImageBackground source={require('../../assets/img/empty-rides-bg.png')} style={{ width: '100%', height: '100%' }} />
                            }
                        </View>
                    </Tab>
                </Tabs>

                {/* Shifter: - Brings the menu */}
                <ShifterButton onPress={this.showAppNavMenu} />
            </SafeAreaView>
        );
    }

    componentWillUnmount() {
        console.log("Rides unmounted");
    }
}

const mapStateToProps = (state) => {
    const { showMenu } = state.TabVisibility;
    const { user } = state.UserAuth;
    const { buildRides, recordedRides, sharedRides } = state.RideList;
    const { ride } = state.RideInfo;
    return { showMenu, user, buildRides, recordedRides, sharedRides, ride };
}

const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        getAllBuildRides: (userId) => dispatch(getAllBuildRides(userId)),
        getAllRecordedRides: (userId) => dispatch(getAllRecordedRides(userId)),
        loadRideOnMap: (rideId) => dispatch(getRideByRideId(rideId)),
        deleteRide: (rideId, index, rideType) => dispatch(deleteRide(rideId, index, rideType)),
        changeScreen: (screenKey) => dispatch(screenChangeAction(screenKey)),
        clearRideFromMap: () => dispatch(clearRideAction())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Rides);