import React, { Component } from 'react';
import {
    SafeAreaView, Text, View, FlatList, ImageBackground,
    TouchableOpacity, Alert, Modal, ScrollView, TouchableWithoutFeedback
} from 'react-native';
import { connect } from 'react-redux';

import { Accordion, Tab, TabHeading, Tabs, ScrollableTab, Icon as NBIcon, ListItem, Left, Right, ActionSheet } from "native-base";
import { PageKeys, WindowDimensions, RIDE_TYPE } from '../../constants';
import { Actions } from 'react-native-router-flux';
import { ShifterButton, BasicButton, LinkButton } from '../../components/buttons';
import { appNavMenuVisibilityAction, loadRideAction, screenChangeAction, clearRideAction } from '../../actions';
import { BasicHeader } from '../../components/headers';
import { getAllBuildRides, getRideByRideId, deleteRide, getAllRecordedRides, copyRide, renameRide, getAllPublicRides, copySharedRide } from '../../api';
import { getFormattedDate } from '../../util';
import { LabeledInput } from '../../components/inputs';
import { BaseModal } from '../../components/modal';

const BUILD_RIDE_OPTIONS = [
    { text: "Copy to new ride", icon: "md-copy", iconColor: "#EB861E" },
    { text: "Remove from list", icon: "md-trash", iconColor: "#EB861E" },
    { text: "Cancel", icon: "md-close-circle", iconColor: "#EB861E" },
];
const RECORD_RIDE_OPTIONS = [
    { text: "Rename ride", icon: "md-create", iconColor: "#EB861E" },
    { text: "Remove from list", icon: "md-trash", iconColor: "#EB861E" },
    { text: "Cancel", icon: "md-close-circle", iconColor: "#EB861E" },
];
const SHARED_RIDE_OPTIONS = [
    { text: "Copy to new ride", icon: "md-copy", iconColor: "#EB861E" },
    { text: "Cancel", icon: "md-close-circle", iconColor: "#EB861E" },
];

export class Rides extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0,
            searchQuery: '',
            headerSearchMode: false,
            newRideName: '',
            isVisibleRenameModal: false,
            selectedRide: null
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
            this.props.getAllPublicRides();
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
                this.props.getAllPublicRides(this.props.user.userId);
            }
        }

        if (prevProps.buildRides !== this.props.buildRides ||
            prevProps.recordedRides !== this.props.recordedRides ||
            prevProps.sharedRides !== this.props.sharedRides) {
            if (this.state.isVisibleRenameModal === true) {
                this.onCancelRenameForm();
            }
        }
    }

    onChangeTab = ({ from, i }) => {
        this.setState({ activeTab: i, headerSearchMode: false });
    }

    keyExtractor = (item) => item.rideId;

    showSharedRideOptions = (rideId, rideName, index, isRecorded) => {
        ActionSheet.show(
            {
                options: SHARED_RIDE_OPTIONS,
                cancelButtonIndex: SHARED_RIDE_OPTIONS.length - 1,
                title: 'Choose an action'
            },
            async (buttonIndex) => {
                if (buttonIndex === 0) {
                    this.setState({ isVisibleRenameModal: true, selectedRide: { rideType: RIDE_TYPE.SHARED_RIDE, index } });
                }
            }
        );
    }

    showBuildRideOptions = (rideId, rideName, index) => {
        ActionSheet.show(
            {
                options: BUILD_RIDE_OPTIONS,
                cancelButtonIndex: 2,
                title: 'Choose an action'
            },
            async (buttonIndex) => {
                if (buttonIndex === 0) {
                    this.setState({ isVisibleRenameModal: true, selectedRide: { rideType: RIDE_TYPE.BUILD_RIDE, index } });
                } else if (buttonIndex === 1) {
                    this.deleteRideConfirmation(rideId, rideName, index, RIDE_TYPE.BUILD_RIDE);
                }
            }
        );
    }

    showRecordRideOptions = (rideId, rideName, index) => {
        ActionSheet.show(
            {
                options: RECORD_RIDE_OPTIONS,
                cancelButtonIndex: 2,
                title: 'Choose an action'
            },
            async (buttonIndex) => {
                if (buttonIndex === 0) {
                    this.setState({ isVisibleRenameModal: true, selectedRide: { rideType: RIDE_TYPE.RECORD_RIDE, index } });
                } else if (buttonIndex === 1) {
                    this.deleteRideConfirmation(rideId, rideName, index, RIDE_TYPE.RECORD_RIDE);
                }
            }
        );
    }

    deleteRideConfirmation(rideId, rideName, index, rideType) {
        Alert.alert(
            'Confirmation to delete',
            `Are you sure to delete the ${rideName}?`,
            [
                {
                    text: 'Yes', onPress: () => {
                        // DOC: Clear ride from map if it is currently loaded on map
                        if (this.props.ride.rideId === rideId) {
                            this.props.clearRideFromMap();
                        }
                        this.props.deleteRide(rideId, index, rideType);
                    }
                },
                { text: 'Cancel', onPress: () => { }, style: 'cancel' },
            ],
            { cancelable: false }
        );
    }

    onPressRide(rideId) {
        this.props.changeScreen(PageKeys.MAP);
        this.props.loadRideOnMap(rideId);
    }

    onSubmitRenameForm = () => {
        if (this.state.newRideName === '' || this.state.newRideName === this.state.selectedRide.rideName) return;
        // DOC: Check for selectedRide type and decide the API call
        const { rideType, index } = this.state.selectedRide;
        switch (rideType) {
            case RIDE_TYPE.BUILD_RIDE:
                this.props.copyRide(this.props.buildRides[index].rideId, this.state.newRideName,
                    RIDE_TYPE.BUILD_RIDE, new Date().toISOString());
                break;
            case RIDE_TYPE.RECORD_RIDE:
                this.props.renameRide({ ...this.props.recordedRides[index], name: this.state.newRideName },
                    rideType, this.props.user.userId, index);
                break;
            case RIDE_TYPE.SHARED_RIDE:
                this.props.copySharedRide(this.props.sharedRides[index].rideId, this.state.newRideName,
                    RIDE_TYPE.BUILD_RIDE, this.props.user.userId, new Date().toISOString());
                break;
        }
    }

    onCancelRenameForm = () => {
        this.setState({ isVisibleRenameModal: false, newRideName: '', selectedRide: null });
    }

    render() {
        const { activeTab, searchQuery, headerSearchMode, isVisibleRenameModal } = this.state;
        const { buildRides, recordedRides, sharedRides } = this.props;
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <BaseModal isVisible={isVisibleRenameModal} onCancel={this.onCancelRenameForm} onPressOutside={this.onCancelRenameForm}>
                    <View style={{ backgroundColor: '#fff', width: WindowDimensions.width * 0.6, padding: 20, elevation: 3 }}>
                        <LabeledInput placeholder='Enter new name here' onChange={(val) => this.setState({ newRideName: val })}
                            onSubmit={this.onSubmitRenameForm} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                            <LinkButton title='Submit' onPress={this.onSubmitRenameForm} />
                            <LinkButton title='Cancel' onPress={this.onCancelRenameForm} />
                        </View>
                    </View>
                </BaseModal>
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
                                                <TouchableOpacity onPress={() => this.showBuildRideOptions(item.rideId, item.name, index)}>
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
                                                <TouchableOpacity onPress={() => this.showRecordRideOptions(item.rideId, item.name, index)}>
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
                                                {
                                                    item.isRecorded
                                                        ? null
                                                        : <TouchableOpacity onPress={() => this.showSharedRideOptions(item.rideId, item.name, index)}>
                                                            <NBIcon name="dots-vertical" type='MaterialCommunityIcons' style={{ alignSelf: 'center', color: '#EB861E' }} />
                                                        </TouchableOpacity>
                                                }
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
        getAllPublicRides: (userId) => dispatch(getAllPublicRides(userId)),
        loadRideOnMap: (rideId) => dispatch(getRideByRideId(rideId)),
        deleteRide: (rideId, index, rideType) => dispatch(deleteRide(rideId, index, rideType)),
        copyRide: (rideId, rideName, rideType, date) => dispatch(copyRide(rideId, rideName, rideType, date)),
        copySharedRide: (rideId, rideName, rideType, userId, date) => dispatch(copySharedRide(rideId, rideName, rideType, userId, date)),
        renameRide: (ride, rideType, userId, index) => dispatch(renameRide(ride, rideType, userId, index)),
        changeScreen: (screenKey) => dispatch(screenChangeAction(screenKey)),
        clearRideFromMap: () => dispatch(clearRideAction())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Rides);