import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, StatusBar, ScrollView, View, Keyboard, Alert, KeyboardAvoidingView, Text, FlatList, Animated, ActivityIndicator, Easing } from 'react-native';
import { BasicHeader } from '../../../components/headers';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, FRIEND_TYPE } from '../../../constants';
import { Actions } from 'react-native-router-flux';
import { LabeledInput, IconicList, IconicDatePicker, LabeledInputPlaceholder } from '../../../components/inputs';
import { BasicButton, IconButton } from '../../../components/buttons';
import { Thumbnail } from '../../../components/images';
import ImageCropPicker from 'react-native-image-crop-picker';
import { addBikeToGarage, editBike, registerPassenger, updatePassengerDetails, getPictureList, getCommunityFriendsList } from '../../../api';
import { toggleLoaderAction, updateFriendInListAction, updateCommunityListAction, resetCommunityListAction } from '../../../actions';
import { Tabs, Tab, TabHeading, ScrollableTab, ListItem, Left, Body, Right, Icon as NBIcon, Toast } from 'native-base';
import { IconLabelPair } from '../../../components/labels';
import ImagePicker from 'react-native-image-crop-picker';
import PaasengerFormDisplay from './passenger-form';
import { HorizontalCard } from '../../../components/cards';
import { Loader } from '../../../components/loader';


const clubDummyData = [{ name: 'Black Rebel Motorcycle Club', id: "1" }, { name: 'Hell’s Angels', id: "2" }, { name: 'Milwaukee Outlaws', id: "3" }]
class PaasengerForm extends Component {
    borderWidthAnim = new Animated.Value(0);
    fieldRefs = [];
    constructor(props) {
        super(props);
        this.state = {
            passenger: props.passengerIdx >= 0 ? props.passengerList[props.passengerIdx] : {},
            activeTab: 0,
            searchQuery: '',
            isLoadingData: false,
            isLoading: false,
            spinValue: new Animated.Value(0),
        };
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.passengerList !== this.props.passengerList) {
            // Actions.pop();
        }

        if (prevProps.communityList !== this.props.communityList) {
            if (this.props.communityList.length === 0) {
                Actions.pop();
                return;
            }
            const pictureIdList = [];
            this.props.communityList.forEach((friend) => {
                if (!friend.profilePicture && friend.profilePictureId) {
                    pictureIdList.push(friend.profilePictureId);
                }
            })
            if (pictureIdList.length > 0) {
                this.props.getPictureList(pictureIdList);
            }
        }
    }

    retryApiFunction = () => {
        this.state.spinValue.setValue(0);
        Animated.timing(this.state.spinValue, {
            toValue: 1,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: true
        }).start(() => {
            if (this.props.hasNetwork === true) {
                this.props.getCommunityFriendsList(this.props.user.userId, 0, 10, (res) => {
                },
                    (error) => {
                    })
            }
        });

    }

    onChangeTab = ({ from, i }) => {
        this.setState({ activeTab: i }, () => {
            if (i === 1) {
                this.props.getCommunityFriendsList(this.props.user.userId, 0, 10, (res) => {
                },
                    (error) => {
                    })
            }
        });
    }

    onChangeSearchFriend = (val) => {
        this.setState({ searchQuery: val })
    }

    addFriendToCommunity = (item) => {
        this.props.registerPassenger(this.props.user.userId, { passengerId: item.userId })
    }

    communityKeyExtractor = (item) => item.userId;


    loadMoreData = () => {
        if (this.state.isLoadingData && this.state.isLoading === false) {
            this.setState({ isLoading: true, isLoadingData: false })
            this.props.getCommunityFriendsList(this.props.user.userId, this.props.pageNumber, 10, (res) => {
                this.setState({ isLoading: false })
            }, (err) => {
                this.setState({ isLoading: false })
            });
        }
    }

    renderFooter = () => {
        if (this.state.isLoading) {
            return (
                <View
                    style={{
                        paddingVertical: 20,
                        borderTopWidth: 1,
                        borderColor: "#CED0CE"
                    }}
                >
                    <ActivityIndicator animating size="large" />
                </View>
            );
        }
        return null
    }

    onPressBackIcon = () => {
        this.props.resetCommunityList()
    }

    render() {
        const { passenger, activeTab, searchQuery } = this.state;
        const { communityList } = this.props;
        const spinAnim = this.borderWidthAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '45deg']
        });
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        const GENDER_LIST = [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }];
        this.state.filteredFriends = searchQuery === '' ? communityList : communityList.filter(friend => {
            return (friend.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 ||
                (friend.nickname ? friend.nickname.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 : false))
        });
        return (
            <View style={styles.fill} >
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={{ flex: 1 }}>
                    <BasicHeader headerHeight={heightPercentageToDP(10.5)} title={passenger.passengerId ? 'Edit Passenger' : 'Add Passenger'} leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: () => this.onPressBackIcon() }} />
                    {
                        this.props.passengerIdx !== -1 ?
                            <PaasengerFormDisplay passengerIdx={this.props.passengerIdx} topMargin={{ marginTop: heightPercentageToDP(15) }} />
                            :
                            <Tabs onChangeTab={this.onChangeTab} tabBarActiveTextColor='#fff' tabBarInactiveTextColor='#fff' style={{ marginTop: APP_COMMON_STYLES.headerHeight }} tabBarUnderlineStyle={{ height: 0 }}>
                                <Tab heading='NEW PASSENGER' tabStyle={[styles.inActiveTab, styles.borderRightWhite]} activeTabStyle={[styles.activeTab, styles.borderRightWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                                    <PaasengerFormDisplay topMargin={{ marginTop: heightPercentageToDP(6) }} />
                                </Tab>

                                <Tab heading='FROM COMMUNITY' tabStyle={[styles.inActiveTab, styles.borderLeftWhite]} activeTabStyle={[styles.activeTab, styles.borderLeftWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                                    <View style={{ marginHorizontal: widthPercentageToDP(9), marginTop: 16, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', borderRadius: 20, height: 37 }}>
                                        <View style={{ flex: 2.89 }}>
                                            <LabeledInputPlaceholder
                                                inputValue={searchQuery} inputStyle={{ paddingBottom: 0, backgroundColor: '#fff', borderBottomWidth: 0 }}
                                                inputRef={elRef => this.fieldRefs[7] = elRef} returnKeyType='next'
                                                onChange={this.onChangeSearchFriend}
                                                hideKeyboardOnSubmit={false}
                                                containerStyle={styles.containerStyle}
                                                outerContainer={{ marginLeft: 15 }}
                                            />
                                        </View>
                                        <View style={{ flex: 1, backgroundColor: '#C4C6C8', borderTopRightRadius: 20, borderBottomRightRadius: 20, justifyContent: 'center' }}>
                                            <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { color: '#707070', fontSize: 19 } }} />
                                        </View>
                                        {/* rightIcon={{name:'user', type:'FontAwesome', style:styles.rightIconStyle}} /> */}

                                    </View>
                                    <View style={{ borderBottomWidth: 3, borderBottomColor: '#F5891F', marginTop: 16, marginHorizontal: widthPercentageToDP(9) }}>
                                        <Text style={{ marginLeft: widthPercentageToDP(3), fontSize: 12, fontWeight: 'bold', color: '#000', letterSpacing: 0.6, marginBottom: 2 }}>SEARCH RESULTS</Text>
                                    </View>
                                    <View style={{ marginTop: 16 }}>
                                        {
                                            communityList.length === 0
                                                ?
                                                this.props.hasNetwork === false
                                                    ?
                                                    <View style={{ flex: 1, position: 'absolute', top: 23 }}>
                                                        <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                                            <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(15), flex: 1, marginLeft: widthPercentageToDP(40) } }} onPress={this.retryApiFunction} />
                                                        </Animated.View>
                                                        <Text style={{ marginLeft: widthPercentageToDP(13), fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</Text>
                                                        <Text style={{ marginTop: heightPercentageToDP(2), marginLeft: widthPercentageToDP(25) }}>Please connect to internet </Text>
                                                    </View>
                                                    :
                                                    null
                                                :
                                                this.state.filteredFriends.length > 0
                                                    ?
                                                    <FlatList
                                                        style={{ marginBottom: heightPercentageToDP(20) }}
                                                        data={this.state.filteredFriends}
                                                        keyExtractor={this.communityKeyExtractor}
                                                        renderItem={({ item, index }) => (
                                                            <HorizontalCard
                                                                item={item}
                                                                horizontalCardPlaceholder={require('../../../assets/img/profile-pic.png')}
                                                                cardOuterStyle={styles.horizontalCardOuterStyle}
                                                                rightProps={{ righticonImage: require('../../../assets/img/add-passenger-from-community.png') }}
                                                                onPress={() => this.addFriendToCommunity(item)}
                                                            />
                                                        )}
                                                        ListFooterComponent={this.renderFooter}
                                                        // onTouchStart={this.loadMoreData}
                                                        onEndReached={this.loadMoreData}
                                                        onEndReachedThreshold={0.1}
                                                        onMomentumScrollBegin={() => this.setState({ isLoadingData: true })}
                                                    />
                                                    :
                                                    this.props.hasNetwork ?
                                                        null
                                                        :
                                                        <View style={{ flex: 1, position: 'absolute', top: 23 }}>
                                                            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                                                <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(15), flex: 1, marginLeft: widthPercentageToDP(40) } }} onPress={this.retryApiFunction} />
                                                            </Animated.View>
                                                            <Text style={{ marginLeft: widthPercentageToDP(13), fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</Text>
                                                            <Text style={{ marginTop: heightPercentageToDP(2), marginLeft: widthPercentageToDP(25) }}>Please connect to internet </Text>
                                                        </View>

                                        }


                                    </View>
                                </Tab>
                            </Tabs>
                    }

                </View>
                <Loader isVisible={this.props.showLoader} />
            </View >
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { passengerList, communityList } = state.PassengerList;
    const { allFriends, paginationNum } = state.FriendList;
    const { showLoader, hasNetwork, pageNumber } = state.PageState;
    return { user, passengerList, allFriends, paginationNum, showLoader, hasNetwork, pageNumber, communityList };
}
const mapDispatchToProps = (dispatch) => {
    return {
        registerPassenger: (userId, passenger) => dispatch(registerPassenger(userId, passenger)),
        updatePassengerDetails: (passenger) => dispatch(updatePassengerDetails(passenger)),
        getPictureList: (pictureIdList) => getPictureList(pictureIdList, (pictureObj) => {
            dispatch(updateCommunityListAction({ pictureObj }))
        }, (error) => {
            console.log('getPictureList community list error : ', error)
            // dispatch(updateFriendInListAction({ userId: friendId }))
        }),
        getCommunityFriendsList: (userId, pageNumber, preference, successCallback, errorCallback) => dispatch(getCommunityFriendsList(userId, pageNumber, preference, successCallback, errorCallback)),
        resetCommunityList: () => dispatch(resetCommunityListAction())
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
    horizontalCardOuterStyle: {
        marginHorizontal: widthPercentageToDP(9),
        marginBottom: heightPercentageToDP(4)
    },
    rightIconStyle: {
    },
    containerStyle: {
        marginBottom: 0,
        flex: 1,
        width: widthPercentageToDP(47),
    },
    activeTab: {
        backgroundColor: '#000000'
    },
    inActiveTab: {
        backgroundColor: '#81BA41'
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