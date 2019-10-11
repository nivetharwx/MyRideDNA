import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, StatusBar, ScrollView, View, Keyboard, Alert, KeyboardAvoidingView, Text, FlatList } from 'react-native';
import { BasicHeader } from '../../../components/headers';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, FRIEND_TYPE } from '../../../constants';
import { Actions } from 'react-native-router-flux';
import { LabeledInput, IconicList, IconicDatePicker, LabeledInputPlaceholder } from '../../../components/inputs';
import { BasicButton, IconButton } from '../../../components/buttons';
import { Thumbnail } from '../../../components/images';
import ImageCropPicker from 'react-native-image-crop-picker';
import { addBikeToGarage, editBike, registerPassenger, updatePassengerDetails, getAllFriends } from '../../../api';
import { toggleLoaderAction } from '../../../actions';
import { Tabs, Tab, TabHeading, ScrollableTab, ListItem, Left, Body, Right, Icon as NBIcon, Toast } from 'native-base';
import { IconLabelPair } from '../../../components/labels';
import ImagePicker from 'react-native-image-crop-picker';
import PaasengerFormDisplay from './passenger-form';
import { HorizontalCard } from '../../../components/cards';


const clubDummyData = [{ name: 'Black Rebel Motorcycle Club', id: "1" }, { name: 'Hell’s Angels', id: "2" }, { name: 'Milwaukee Outlaws', id: "3" }]
class PaasengerForm extends Component {
    fieldRefs = [];
    constructor(props) {
        super(props);
        this.state = {
            passenger: props.passengerIdx >= 0 ? props.passengerList[props.passengerIdx] : {},
            activeTab: 0,
            searchQuery: ''
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.passengerList !== this.props.passengerList) {
            Actions.pop();
        }

        if (prevProps.allFriends !== this.props.allFriends) {
            const pictureIdList = [];
            this.props.allFriends.forEach((friend) => {
                if (!friend.profilePicture && friend.profilePictureId) {
                    pictureIdList.push(friend.profilePictureId);
                }
            })
            if (pictureIdList.length > 0) {
                this.props.getPictureList(pictureIdList);
            }
        }
    }



    onChangeTab = ({ from, i }) => {
        this.setState({ activeTab: i }, () => {
            if (i === 1) {
                this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, false, (res) => {
                }, (err) => {
                });
            }
        });
    }

    onChangeSearchFriend = (val) => {
        this.setState({ searchQuery: val })
    }

    addFriendToCommunity = (item) => {
        console.log('addFriendToCommunity : ', item)
        this.props.registerPassenger(this.props.user.userId, { passengerId: item.userId })
    }

    communityKeyExtractor = (item) => item.userId;

    render() {
        const { passenger, activeTab, searchQuery } = this.state;
        const { allFriends } = this.props;
        console.log('allFriends : ', allFriends)
        const GENDER_LIST = [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }];
        this.state.filteredFriends = searchQuery === '' ? allFriends : allFriends.filter(friend => {
            return (friend.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 ||
                (friend.nickname ? friend.nickname.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 : false))
        });
        return (
            <View style={styles.fill} >
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={{ flex: 1 }}>
                    <BasicHeader headerHeight={heightPercentageToDP(10.5)} title={passenger.passengerId ? 'Edit Passenger' : 'Add Passenger'} leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: () => Actions.pop() }} />
                    {
                        this.props.passengerIdx !== -1 ?
                            <PaasengerFormDisplay passengerIdx={this.props.passengerIdx} topMargin={{ marginTop: heightPercentageToDP(15) }} />
                            :
                            <Tabs locked={false} onChangeTab={this.onChangeTab} style={{ flex: 1, backgroundColor: '#fff', marginTop: APP_COMMON_STYLES.headerHeight }} renderTabBar={() => <ScrollableTab ref={elRef => this.tabsRef = elRef} activeTab={activeTab} backgroundColor='#E3EED3' underlineStyle={{ height: 0 }} />}>
                                <Tab heading={<TabHeading style={{ width: widthPercentageToDP(50), backgroundColor: activeTab === 0 ? '#000000' : '#81BA41' }}>
                                    <IconLabelPair containerStyle={styles.tabContentCont} text={`NEW PASSENGER`} textStyle={{ color: '#fff', fontSize: heightPercentageToDP(2), letterSpacing: 0.6 }} />
                                </TabHeading>}>
                                    <PaasengerFormDisplay topMargin={{ marginTop: heightPercentageToDP(6) }} />
                                </Tab>

                                <Tab heading={<TabHeading style={{ width: widthPercentageToDP(50), backgroundColor: activeTab === 1 ? '#000000' : '#81BA41', borderColor: '#fff', borderColor: '#fff', borderLeftWidth: 1 }}>
                                    <IconLabelPair containerStyle={styles.tabContentCont} text={`FROM COMMUNITY`} textStyle={{ color: '#fff', fontSize: heightPercentageToDP(2), letterSpacing: 0.6 }} />
                                </TabHeading>}>
                                    <View style={{ marginHorizontal: widthPercentageToDP(9), marginTop: heightPercentageToDP(7), borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', borderRadius: 20, height: heightPercentageToDP(7) }}>
                                        <View style={{ flex: 2.89 }}>
                                            <LabeledInputPlaceholder
                                                inputValue={searchQuery} inputStyle={{ paddingBottom: 0, borderBottomWidth: 0, width: widthPercentageToDP(47), marginLeft: 15, height: heightPercentageToDP(5), backgroundColor: '#fff' }}
                                                inputRef={elRef => this.fieldRefs[7] = elRef} returnKeyType='next'
                                                onChange={this.onChangeSearchFriend}
                                                hideKeyboardOnSubmit={false}
                                                containerStyle={styles.containerStyle} />
                                        </View>
                                        <View style={{ flex: 1, backgroundColor: '#C4C6C8', borderTopRightRadius: 20, borderBottomRightRadius: 20, justifyContent: 'center' }}>
                                            <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { color: '#707070', fontSize: 19 } }} />
                                        </View>
                                        {/* rightIcon={{name:'user', type:'FontAwesome', style:styles.rightIconStyle}} /> */}

                                    </View>
                                    <View style={{ borderBottomWidth: 3, borderBottomColor: '#F5891F', marginTop: heightPercentageToDP(5), marginHorizontal: widthPercentageToDP(9) }}>
                                        <Text style={{ marginLeft: widthPercentageToDP(3), fontSize: 12, fontWeight: 'bold', color: '#000', letterSpacing: 0.6, marginBottom: 2 }}>SEARCH RESULTS</Text>
                                    </View>
                                    <View style={{ marginTop: heightPercentageToDP(6) }}>
                                        <FlatList
                                            data={this.state.filteredFriends}
                                            keyExtractor={this.communityKeyExtractor}
                                            renderItem={({ item, index }) => (
                                                <HorizontalCard
                                                    item={item}
                                                    horizontalCardPlaceholder={require('../../../assets/img/profile-pic.png')}
                                                    cardOuterStyle={styles.HorizontalCardOuterStyle}
                                                    righticonImage={require('../../../assets/img/add-passenger-from-community.png')}
                                                    onPress={() => this.addFriendToCommunity(item)}
                                                />
                                            )}
                                        />

                                    </View>
                                </Tab>
                            </Tabs>
                    }

                </View>

                {/* <KeyboardAvoidingView behavior={IS_ANDROID ? null : 'padding'} style={styles.fill}>
                    <BasicHeader headerHeight={heightPercentageToDP(8.5)} title={passenger.passengerId ? 'Edit Passenger' : 'Add Passenger'} leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: () => Actions.pop() }} />
                    <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
                        <LabeledInput inputValue={passenger.name} inputRef={elRef => this.fieldRefs[0] = elRef} returnKeyType='next' onChange={this.onChangeName} placeholder='Name' onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false} />
                        <IconicList
                            selectedValue={passenger.gender} placeholder='Gender' values={GENDER_LIST}
                            onChange={this.onChangeGender} />
                        <IconicDatePicker selectedDate={passenger.dob} onChange={this.onChangeDOB} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <LabeledInput containerStyle={{ flex: 1 }} inputValue={passenger.homeAddress.address} inputRef={elRef => this.fieldRefs[1] = elRef} returnKeyType='next' onChange={this.onChangeAddress} placeholder='Building number, street' onSubmit={() => this.fieldRefs[2].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInput containerStyle={{ flex: 1 }} inputValue={passenger.homeAddress.city} inputRef={elRef => this.fieldRefs[2] = elRef} returnKeyType='next' onChange={this.onChangeCity} placeholder='City' onSubmit={() => this.fieldRefs[3].focus()} hideKeyboardOnSubmit={false} />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <LabeledInput containerStyle={{ flex: 1 }} inputValue={passenger.homeAddress.state} inputRef={elRef => this.fieldRefs[3] = elRef} returnKeyType='next' onChange={this.onChangeState} placeholder='State' onSubmit={() => this.fieldRefs[4].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInput containerStyle={{ flex: 1 }} inputValue={passenger.homeAddress.country} inputRef={elRef => this.fieldRefs[4] = elRef} onChange={this.onChangeCountry} placeholder='Country' onSubmit={() => { }} hideKeyboardOnSubmit={true} />
                        </View>
                    </ScrollView>
                    <BasicButton title='SUBMIT' style={styles.submitBtn} onPress={this.onSubmit} />
                </KeyboardAvoidingView> */}
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { passengerList } = state.PassengerList;
    const { allFriends, paginationNum } = state.FriendList;
    return { user, passengerList, allFriends, paginationNum };
}
const mapDispatchToProps = (dispatch) => {
    return {
        registerPassenger: (userId, passenger) => dispatch(registerPassenger(userId, passenger)),
        updatePassengerDetails: (passenger) => dispatch(updatePassengerDetails(passenger)),
        getAllFriends: (friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback) => dispatch(getAllFriends(friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(PaasengerForm);

const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    form: {
        marginTop: APP_COMMON_STYLES.headerHeight,
    },
    formContent: {
        paddingTop: 20,
        flex: 1,
        justifyContent: 'space-around'
    },
    submitBtn: {
        height: heightPercentageToDP(8.5),
    },
    imageUploadBtn: {
        marginLeft: 10,
        height: heightPercentageToDP(5),
        width: '50%'
    },
    imgContainer: {
        marginTop: heightPercentageToDP(2),
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tabContentCont: {
        paddingHorizontal: 0
    },
    labelStyle: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1.1
    },
    submitBtn: {
        height: heightPercentageToDP(9),
        backgroundColor: '#f69039',
        marginTop: heightPercentageToDP(8)
    },
    HorizontalCardOuterStyle: {
        marginHorizontal: widthPercentageToDP(9),
        marginBottom: heightPercentageToDP(4)
    },
    rightIconStyle: {
    },
    containerStyle: {
        marginBottom: 0
    }
});