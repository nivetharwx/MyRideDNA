import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';
import { BasicHeader } from '../../components/headers';
import { Tabs, Tab } from 'native-base';
import { heightPercentageToDP, APP_COMMON_STYLES, FRIEND_TYPE, PageKeys } from '../../constants';
import styles from './styles';
import AllFriendsTab from './all-friends';
import GroupListTab from './group-list';
import FavoriteListTab from './favorites-list';
import { cancelFriendRequest, approveFriendRequest, rejectFriendRequest, getAllFriends, getFriendGroups, getAllGroupLocation, handleServiceErrors } from '../../api';
import { BasePage } from '../../components/pages';
import { Actions } from 'react-native-router-flux';
import { resetErrorHandlingAction, updateFriendGroupListAction } from '../../actions';

const CARD_HEIGHT = 74;
class Friends extends Component {
    tabsRef = null;
    constructor(props) {
        super(props);
        this.state = {
            headerSearchMode: false,
            searchQuery: '',
            activeTab: -1,
            friendsActiveTab: 0,
        };
    }

    componentDidMount() {
        // this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, true, (res) => {

        // }, (err) => {
        // });
    }


    componentDidUpdate(prevProps, prevState) {
    }

    onChangeTab = ({ from, i }) => {
        console.log(from,i,'///// from and i')
        this.setState({ activeTab: i, headerSearchMode: false }, () => {
            if (this.state.activeTab === 2) {
            }
            if (i === 0 || i === 1 || i === 2) {
                this.setState({ searchQuery: '' })
            }
        });
        // if (from === 2 && i === 0) {
        //     this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, true, (res) => {
        //     }, (err) => {
        //     });
        // }
        // if (from === 1 && i === 0) {
        //     this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, true, (res) => {
        //     }, (err) => {
        //     });
        // }
        // if (i === 2) {
        //     console.log('///////////entered')
        //     this._preference = parseInt(heightPercentageToDP(100) / CARD_HEIGHT);
        //     this.props.getFriendGroups(this.props.user.userId, true, 0, this._preference, (res) => {
        //         this.props.getAllGroupLocation(res.groups.map(group => group.groupId))
        //     }, (err) => {
        //     });
        // }
    }

    onChangeFriendsTab = ({ from, i }) => {
        this.setState({ friendsActiveTab: i });
    }

    onPressBackButton = () => Actions.pop();

    render() {
        const { searchQuery, activeTab } = this.state;
        return (
            <BasePage defaultHeader={false} showLoader={this.props.showLoader}>
                <View style={{ flex: 1 }}>
                    {
                        activeTab === 2 ?
                            <BasicHeader
                                title='Road Crew'
                                leftIconProps={this.props.comingFrom === PageKeys.PROFILE ? { reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton } : { reverse: true, name: 'ios-notifications', type: 'Ionicons', onPress: () => Actions.push(PageKeys.NOTIFICATIONS) }}
                                rightIconProps={{ reverse: true, name: 'md-add', type: 'Ionicons', containerStyle: styles.headerRtIconContainer, style: styles.addIcon, onPress: () => Actions.push(PageKeys.GROUP_FORM, { groupDetail: null, isAdmin: true }) }}
                                notificationCount={this.props.comingFrom === PageKeys.PROFILE?null:this.props.notificationCount}
                                />
                                :
                                <BasicHeader
                                title='Road Crew'
                                leftIconProps={this.props.comingFrom === PageKeys.PROFILE ? { reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton } : { reverse: true, name: 'ios-notifications', type: 'Ionicons', onPress: () => Actions.push(PageKeys.NOTIFICATIONS) }}
                                notificationCount={this.props.comingFrom === PageKeys.PROFILE?null:this.props.notificationCount}
                            />
                    }

                    <Tabs tabContainerStyle={APP_COMMON_STYLES.tabContainer} ref={elRef => this.tabsRef = elRef} onChangeTab={this.onChangeTab} tabBarActiveTextColor='#fff' tabBarInactiveTextColor='#fff' style={{ marginTop: APP_COMMON_STYLES.headerHeight }} tabBarUnderlineStyle={{ height: 0 }}>
                        <Tab heading='ALL' tabStyle={[styles.inActiveTab, styles.borderRightWhite]} activeTabStyle={[styles.activeTab, styles.borderRightWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                            <AllFriendsTab refreshContent={activeTab === 0} searchQuery={searchQuery} />
                        </Tab>
                        <Tab  heading='FAVORITES' tabStyle={[styles.inActiveTab, styles.borderRightWhite, styles.borderLeftWhite]} activeTabStyle={[styles.activeTab, styles.borderRightWhite, styles.borderLeftWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                            <FavoriteListTab refreshContent={activeTab === 1} searchQuery={searchQuery} />
                        </Tab>
                        <Tab heading='GROUPS' tabStyle={[styles.inActiveTab, styles.borderLeftWhite]} activeTabStyle={[styles.activeTab, styles.borderLeftWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                            <GroupListTab  onPressAddGroup={this.onPressCreateGroup} />
                        </Tab>
                    </Tabs>
                </View>
            </BasePage>
        );
    }
}

const mapStateToProps = (state) => {
    const { user, userAuthToken, deviceToken } = state.UserAuth;
    const { allFriends, paginationNum } = state.FriendList;
    const { showLoader, hasNetwork } = state.PageState;
    const notificationCount=state.NotificationList.notificationList.totalUnseen;
    return { user, allFriends, paginationNum, userAuthToken, deviceToken, showLoader,notificationCount, hasNetwork };
}
const mapDispatchToProps = (dispatch) => {
    return {
        getAllFriends: (friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback) => dispatch(getAllFriends(friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback)),
        cancelRequest: (userId, personId, requestId) => dispatch(cancelFriendRequest(userId, personId, requestId)),
        approvedRequest: (userId, personId, actionDate, requestId) => dispatch(approveFriendRequest(userId, personId, actionDate, requestId)),
        rejectRequest: (userId, personId, requestId) => dispatch(rejectFriendRequest(userId, personId, requestId)),
        getFriendGroups: (userId, toggleLoader, pageNumber, preference, successCallback, errorCallback) => dispatch(getFriendGroups(userId, toggleLoader, pageNumber, preference, successCallback, errorCallback)),
        getAllGroupLocation: (groupIds) => getAllGroupLocation(groupIds).then(res => {
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            dispatch(updateFriendGroupListAction(res.data));
        }).catch(er => {
            console.log('getAllGroupLocation error : ', er)
            handleServiceErrors(er, [groupIds], 'getAllGroupLocation', true, true);
        }),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Friends);