import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Animated, FlatList, View, Alert, ActivityIndicator, Easing, StatusBar } from 'react-native';
import { Icon as NBIcon, Tabs, Tab } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { DefaultText } from '../../components/labels';
import { APP_COMMON_STYLES, PageKeys, CUSTOM_FONTS, widthPercentageToDP, heightPercentageToDP, FRIEND_TYPE } from '../../constants';
import { BasicHeader } from '../../components/headers';
import { LabeledInputPlaceholder } from '../../components/inputs';
import { IconButton } from '../../components/buttons';
import { getRoadBuddiesById, getPictureList } from '../../api';
import { HorizontalCard } from '../../components/cards';
import { setCurrentFriendAction, goToPrevProfileAction, resetPersonProfileAction, updatePicturesAction } from '../../actions';


class BuddyFriends extends Component {
    isLoadingFrndsPic = false;
    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            isLoading: false,
            isLoadingData: false,
            spinValue: new Animated.Value(0),
            searchQuery: '',
            pageNumber: 1
        }
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.person.friendList !== this.props.person.friendList) {
            if (!this.isLoadingFrndsPic) {
                const frndPicIdList = [];
                this.props.person.friendList.forEach((frnd) => {
                    if (!frnd.profilePicture && frnd.profilePictureId) {
                        frndPicIdList.push(frnd.profilePictureId);
                    }
                })
                if (frndPicIdList.length > 0) {
                    this.isLoadingFrndsPic = true;
                    this.props.getPictureList(frndPicIdList, 'roadBuddies', () => this.isLoadingFrndsPic = false, () => this.isLoadingFrndsPic = false);
                }
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

            }
        });

    }



    sendFriendRequest = (person) => {
        const { user } = this.props;
        const { selectedPerson } = this.state;
        person = person || selectedPerson;
        const requestBody = {
            senderId: user.userId,
            senderName: user.name,
            senderNickname: user.nickname,
            senderEmail: user.email,
            userId: person.userId,
            name: person.name,
            nickname: person.nickname,
            email: person.email,
            actionDate: new Date().toISOString(),
        };
        if (this.state.isVisibleOptionsModal) this.onCancelOptionsModal();
        this.props.sendFriendRequest(requestBody, person.userId);
    }



    openChatPage = (person) => {
        const { selectedPerson } = this.state;
        person = person || selectedPerson;
        person['isGroup'] = false;
        person['id'] = person.userId;
        Actions.push(PageKeys.CHAT, { chatInfo: person });
        if (this.state.isVisibleOptionsModal)
            this.onCancelOptionsModal();
        if (this.state.searchQuery !== '')
            this.setState(prevState => ({ searchQuery: '' }));
    }

    onPullRefresh = () => {
        if (this.state.searchQuery !== '')
            this.setState(prevState => ({ searchQuery: '' }));
        this.setState({ isRefreshing: true });
    }


    loadMoreData = () => {
        if (this.state.isLoadingData && this.state.isLoading === false) {
            this.setState({ isLoading: true, isLoadingData: false })
            this.props.getRoadBuddiesById(this.props.user.userId, this.props.person.userId, this.state.pageNumber, (res) => {
                if (res.friendList.length > 0) {
                    this.setState({ pageNumber: this.state.pageNumber + 1 })
                }
                this.setState({ isLoading: false })
            }, (error) => {
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

    onPressBackButton = () => {
        Actions.pop()
        this.props.hasPrevProfiles
            ? this.props.goToPrevProfile()
            : this.props.resetPersonProfile();
    }

    friendKeyExtractor = (item) => item.userId;

    openFriendsProfileTab = (friend) => {
        if (this.state.searchQuery !== '')
            this.setState(prevState => ({ searchQuery: '' }));
        friend = friend || this.state.selectedPerson;
        this.openProfile(friend.userId)
    }
    openProfile = (userId) => {
        if (this.state.searchQuery !== '')
            this.setState(prevState => ({ searchQuery: '' }));
        this.props.setCurrentFriend({ userId });
        if (this.state.isVisibleOptionsModal) {
            this.setState({ isVisibleOptionsModal: false })
        }
        Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: userId });
    }

    render() {
        const { searchQuery, isRefreshing } = this.state;
        const { person } = this.props;
        return (
            <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent barStyle="light-content" />
                </View>
                <View style={styles.fill}>
                    <BasicHeader
                        title='Road Buddies'
                        leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                    />

                    <Tabs tabContainerStyle={APP_COMMON_STYLES.tabContainer} tabBarActiveTextColor='#fff' tabBarInactiveTextColor='#fff' style={{ marginTop: APP_COMMON_STYLES.headerHeight }} tabBarUnderlineStyle={{ height: 0 }}>
                        <Tab heading='ALL BUDDIES' tabStyle={[styles.inActiveTab, styles.borderRightWhite]} activeTabStyle={[styles.activeTab, styles.borderRightWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                            <View style={{ marginHorizontal: widthPercentageToDP(8), flex: 1 }}>
                                <View style={{ marginTop: 16, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', borderRadius: 20, height: 37 }}>
                                    <View style={{ flex: 2.89 }}>
                                        <LabeledInputPlaceholder
                                            placeholder='Name'
                                            inputValue={searchQuery} inputStyle={{ borderBottomWidth: 0, width: widthPercentageToDP(47), marginLeft: 15, backgroundColor: '#fff' }}
                                            returnKeyType='next'
                                            onChange={this.onChangeSearchValue}
                                            hideKeyboardOnSubmit={true}
                                            containerStyle={styles.searchCont} />
                                    </View>
                                    <View style={{ flex: 1, backgroundColor: '#C4C6C8', borderTopRightRadius: 20, borderBottomRightRadius: 20, justifyContent: 'center' }}>
                                        <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { color: '#707070', fontSize: 22 } }} />
                                    </View>
                                </View>
                                <FlatList
                                    showsVerticalScrollIndicator={false}
                                    style={{ flexDirection: 'column' }}
                                    contentContainerStyle={styles.friendList}
                                    data={person.friendList}
                                    refreshing={isRefreshing}
                                    onRefresh={this.onPullRefresh}
                                    keyExtractor={this.friendKeyExtractor}
                                    extraData={this.state}
                                    renderItem={({ item, index }) => (
                                        <HorizontalCard
                                            horizontalCardPlaceholder={require('../../assets/img/friend-profile-pic.png')}
                                            item={item}
                                            onPressLeft={() => this.openFriendsProfileTab(item)}
                                            thumbnail={item.profilePicture}
                                            cardOuterStyle={styles.horizontalCardOuterStyle}
                                            actionsBar={{
                                                online: true,
                                                actions: [
                                                    { isIconImage: true, imgSrc: require('../../assets/img/chat.png'), id: 4, onPressActions: () => this.openChatPage(item), imgStyle: { height: 23, width: 26, marginTop: 6 } }
                                                ]
                                            }}
                                        />
                                    )}
                                    ListFooterComponent={this.renderFooter}
                                    onEndReached={this.loadMoreData}
                                    onEndReachedThreshold={0.1}
                                    onMomentumScrollBegin={() => this.setState({ isLoadingData: true })}
                                />
                                {/* rightIcon={{name:'user', type:'FontAwesome', style:styles.rightIconStyle}} /> */}


                            </View>
                        </Tab>
                    </Tabs>
                </View>

            </View>
        )
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { allFriends, paginationNum, searchFriendList, friendsLocationList } = state.FriendList;
    const { pageNumber, hasNetwork } = state.PageState;
    const { person } = state.CurrentProfile;
    const hasPrevProfiles = state.CurrentProfile.prevProfiles.length > 0;
    return { user, allFriends, paginationNum, searchFriendList, friendsLocationList, pageNumber, hasNetwork, person, hasPrevProfiles };
};
const mapDispatchToProps = (dispatch) => {
    return {
        getRoadBuddiesById: (userId, friendId, pageNumber, successCallback, errorCallback) => dispatch(getRoadBuddiesById(userId, friendId, pageNumber, successCallback, errorCallback)),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
        goToPrevProfile: () => dispatch(goToPrevProfileAction()),
        resetPersonProfile: () => dispatch(resetPersonProfileAction()),
        getPictureList: (pictureIdList, callingFrom) => getPictureList(pictureIdList, (pictureObj) => {
            dispatch(updatePicturesAction({ pictureObj, type: callingFrom }))
        }, (error) => {
            console.log('getPictureList error : ', error)
        }),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(BuddyFriends);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    inActiveTab: {
        backgroundColor: '#81BA41'
    },
    borderRightWhite: {
        borderRightWidth: 1,
        borderColor: '#fff'
    },
    activeTab: {
        backgroundColor: '#000000'
    },
    tabText: {
        fontSize: 13,
        fontFamily: CUSTOM_FONTS.robotoBold,
        letterSpacing: 0.6
    },
    searchCont: {
        marginBottom: 0,
        flex: 1,
        width: widthPercentageToDP(47),
    },
    friendList: {
        marginTop: 20,
    },
    horizontalCardOuterStyle: {
        // marginHorizontal: widthPercentageToDP(4),
        marginBottom: heightPercentageToDP(4),
    }
});