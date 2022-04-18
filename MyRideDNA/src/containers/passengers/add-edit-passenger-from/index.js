import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, FlatList, Animated, ActivityIndicator, Easing } from 'react-native';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, CUSTOM_FONTS, GET_PICTURE_BY_ID } from '../../../constants';
import { Actions } from 'react-native-router-flux';
import { SearchBoxFilter } from '../../../components/inputs';
import { IconButton } from '../../../components/buttons';
import { registerPassenger, getCommunityFriendsList, handleServiceErrors, deletePassenger } from '../../../api';
import { apiLoaderActions, removeFromPassengerListAction, resetCommunityListAction, resetErrorHandlingAction } from '../../../actions';
import { Tabs, Tab } from 'native-base';
import { DefaultText } from '../../../components/labels';
import PaasengerFormDisplay from './passenger-form';
import { HorizontalCard } from '../../../components/cards';
import { BasePage } from '../../../components/pages';

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
            pageNumber: 0,
            hasRemainingList: false,
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.communityList !== this.props.communityList) {
            if (this.props.communityList.length === 0) {
                Actions.pop();
                return;
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
                this.props.getCommunityFriendsList(this.props.user.userId, 0, 10, (res) => { }, (error) => { });
            }
        });
    }

    onChangeTab = ({ from, i }) => {
        this.setState({ activeTab: i }, () => {
            if (i === 1) {
                this.props.getCommunityFriendsList(this.props.user.userId, this.state.pageNumber, 10,
                    (res) => {
                        if (res.friendList.length > 0) {
                            this.setState({ pageNumber: this.state.pageNumber + 1, hasRemainingList: res.remainingList > 0 })
                        }
                    }, (error) => { }
                );
            }
        });
    }

    onChangeSearchFriend = (val) => this.setState({ searchQuery: val });

    addFriendToCommunity = (item) => {
        if(item.isPassenger){
            this.props.deletePassenger(item.passengerId, item.userId);
        }
        else{
            this.props.registerPassenger({ passengerId: item.userId, userId: this.props.user.userId })
        }
    };

    communityKeyExtractor = (item) => item.userId;

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.hasRemainingList === false || this.state.isLoading === true || distanceFromEnd < 0) return;
        this.setState({ isLoading: true }, () => {
            this.props.getCommunityFriendsList(this.props.user.userId, this.state.pageNumber, 10, (res) => {
                if (res.friendList.length > 0) {
                    this.setState({ pageNumber: this.state.pageNumber + 1, hasRemainingList: res.remainingList > 0, isLoading: false });
                } else this.setState({ isLoading: false });
            }, (err) => this.setState({ isLoading: false }));
        });
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
        return null;
    }

    onPressBackIcon = () => this.props.resetCommunityList();

    render() {
        const { passenger, searchQuery } = this.state;
        const { communityList, showLoader } = this.props;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        const filteredFriends = searchQuery === '' ? communityList : communityList.filter(friend => (friend.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 ||
            (friend.nickname ? friend.nickname.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 : false)));
        return (
            <BasePage showLoader={showLoader} heading={passenger.passengerId ? 'Edit Passenger' : 'Add Passenger'} onBackButtonPress={this.onPressBackIcon}>
                {
                    this.props.passengerIdx !== -1
                        ? <PaasengerFormDisplay passengerIdx={this.props.passengerIdx} />
                        : <Tabs tabContainerStyle={APP_COMMON_STYLES.tabContainer} onChangeTab={this.onChangeTab} tabBarActiveTextColor='#fff' tabBarInactiveTextColor='#fff' style={{}} tabBarUnderlineStyle={{ height: 0 }}>
                            <Tab heading='NEW PASSENGER' tabStyle={[styles.inActiveTab, styles.borderRightWhite]} activeTabStyle={[styles.activeTab, styles.borderRightWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                                <PaasengerFormDisplay />
                            </Tab>
                            <Tab heading='FROM COMMUNITY' tabStyle={[styles.inActiveTab, styles.borderLeftWhite]} activeTabStyle={[styles.activeTab, styles.borderLeftWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                                <View style={{ marginHorizontal: widthPercentageToDP(8) }}>
                                    <SearchBoxFilter
                                        searchQuery={searchQuery} onChangeSearchValue={this.onChangeSearchFriend}
                                        placeholder='Name' outerContainer={{ marginTop: 16 }}
                                    />
                                </View>
                                <View style={styles.searchResultLabelCont}>
                                    <DefaultText style={styles.searchResultLabel}>SEARCH RESULTS</DefaultText>
                                </View>
                                <View style={{ marginTop: 16 }}>
                                    <FlatList
                                        contentContainerStyle={{ paddingBottom: this.state.hasRemainingList ? 40 : 0 }}
                                        keyboardShouldPersistTaps={'handled'}
                                        style={{ marginBottom: heightPercentageToDP(20) }}
                                        data={filteredFriends}
                                        keyExtractor={this.communityKeyExtractor}
                                        renderItem={({ item, index }) => (
                                            <HorizontalCard
                                                item={item}
                                                horizontalCardPlaceholder={require('../../../assets/img/profile-pic-placeholder.png')}
                                                cardOuterStyle={styles.horizontalCardOuterStyle}
                                                thumbnail={item.profilePictureId ? `${GET_PICTURE_BY_ID}${item.profilePictureId}` : null}
                                                rightProps={
                                                    item.isPassenger
                                                        ? { righticonImage: require('../../../assets/img/add-passenger-from-community-true.png'), imgBGColor: '#81BA41', imgStyles: { width: 32, height: 32 } }
                                                        : { righticonImage: require('../../../assets/img/add-passenger-from-community.png'), imgStyles: { width: 32, height: 32 } }
                                                }
                                                onPress={() => this.addFriendToCommunity(item)}
                                            />
                                        )}
                                        ListFooterComponent={this.renderFooter}
                                        onEndReached={this.loadMoreData}
                                        onEndReachedThreshold={0.1}
                                    />
                                    {
                                        this.props.hasNetwork === false && communityList.length === 0 && <View style={{ flex: 1, position: 'absolute', top: 23 }}>
                                            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                                <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(15), flex: 1, marginLeft: widthPercentageToDP(40) } }} onPress={this.retryApiFunction} />
                                            </Animated.View>
                                            <DefaultText style={{ marginLeft: widthPercentageToDP(13), fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</DefaultText>
                                            <DefaultText style={{ marginTop: heightPercentageToDP(2), marginLeft: widthPercentageToDP(25) }}>Please connect to internet </DefaultText>
                                        </View>
                                    }
                                </View>
                            </Tab>
                        </Tabs>
                }
            </BasePage>
        )
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { passengerList, communityList } = state.PassengerList;
    const { showLoader, hasNetwork, pageNumber } = state.PageState;
    return { user, passengerList, showLoader, hasNetwork, pageNumber, communityList };
}
const mapDispatchToProps = (dispatch) => {
    return {
        registerPassenger: (passenger) => dispatch(registerPassenger(passenger)),
        getCommunityFriendsList: (userId, pageNumber, preference, successCallback, errorCallback) => dispatch(getCommunityFriendsList(userId, pageNumber, preference, successCallback, errorCallback)),
        resetCommunityList: () => dispatch(resetCommunityListAction()),
        deletePassenger: (passengerId, friendId) => {
            dispatch(apiLoaderActions(true));
            deletePassenger(passengerId).then(res => {
                console.log("deletePassenger success: ", res.data);
                dispatch(apiLoaderActions(false));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                dispatch(removeFromPassengerListAction({passengerId, friendId}));
                // Actions.refresh({ passengerId: null });
            }).catch(er => {
                console.log(`deletePassenger error: `, er.response || er);
                handleServiceErrors(er, [passengerId], 'deletePassenger', true, true);
                dispatch(apiLoaderActions(false));
            })
        }
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(PaasengerForm);

const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    searchResultLabelCont: {
        borderBottomWidth: 3,
        borderBottomColor: '#F5891F',
        marginTop: 16,
        marginHorizontal: widthPercentageToDP(9)
    },
    searchResultLabel: {
        marginLeft: widthPercentageToDP(3),
        color: '#000',
        letterSpacing: 0.6,
        marginBottom: 2,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    horizontalCardOuterStyle: {
        marginHorizontal: widthPercentageToDP(9),
        marginBottom: heightPercentageToDP(4)
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
        fontFamily: CUSTOM_FONTS.robotoBold,
        letterSpacing: 0.6
    }
});