import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Animated, FlatList, View, ActivityIndicator, Easing } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { widthPercentageToDP, heightPercentageToDP, PageKeys, FRIEND_TYPE, GET_PICTURE_BY_ID, USER_BASE_URL } from '../../../constants';
import { SearchBoxFilter } from '../../../components/inputs';
import { IconButton } from '../../../components/buttons';
import { HorizontalCard } from '../../../components/cards';
import { getFriendsLocationList, getAllFriends, getFavouriteList } from '../../../api';
import { hideFriendsLocationAction, setCurrentFriendAction, screenChangeAction } from '../../../actions';
import { DefaultText } from '../../../components/labels';
import Axios from 'axios';

const FILTERED_ACTION_IDS = {
    BTN_ALL_FRIENDS: 'btn_all_friends',
    LOCATION_ENABLE_FRIENDS: 'location-enable-friends',
    LOCATION_ENABLE: 'location-enable',
    VISIBLE_ON_MAP_FRIENDS: 'visible-on-map-friends',
    VISIBLE_ON_MAP: 'visible-on-map',
};


class FavoriteListTab extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            isLoading: false,
            spinValue: new Animated.Value(0),
            searchQuery: '',
            isFilter: null,
            friendsFilter: FILTERED_ACTION_IDS.BTN_ALL_FRIENDS,
            pageNumber: 0,
            onPressArrow: false,
            hasRemainingList:false
            
        };
    }

    componentDidMount() {
        
        this.props.getFavouriteList( this.props.user.userId, 0, true, (res) => {
            this.setState(prevState=>({ hasRemainingList: res.remainingList > 0,pageNumber: res.friendList.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber,favouriteList:[...res.friendList]}))
        }, (err) => {
        },this.state.searchQuery,true,this.state.isFilter==FILTERED_ACTION_IDS.LOCATION_ENABLE)
     }


    componentDidUpdate(prevProps, prevState) {
        if (prevProps.allFriends !== this.props.allFriends) {
            if (prevState.isRefreshing === true) {
                this.setState({ isRefreshing: false });
            }
        }
        if (this.state.onPressArrow) {
            this.props.changeScreen({ name: PageKeys.MAP });
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
                this.props.getFavouriteList(this.props.user.userId, 0, false, (res) => {
                    this.setState({ hasRemainingList: res.remainingList > 0 ,pageNumber: res.friendList.length > 0 ? 1 : 0,favouriteList:[...res.friendList]},this.state.searchQuery)
                }, (err) => {
                },this.state.searchQuery,false,this.state.isFilter==FILTERED_ACTION_IDS.LOCATION_ENABLE)
            }
        });

    }

    onPullRefresh = () => {
        if (this.state.searchQuery !== '')
            this.setState(prevState => ({ searchQuery: '' }));
        this.setState({ isRefreshing: true });
        this.props.getFavouriteList(this.props.user.userId, 0, false, (res) => {
            this.setState({ hasRemainingList: res.remainingList > 0,pageNumber:1 ,favouriteList:[...res.friendList],isRefreshing:false})
        }, (err) => {
        },this.state.searchQuery,true,this.state.isFilter==FILTERED_ACTION_IDS.LOCATION_ENABLE)
    }

    componentWillUnmount() { }

    openChatPage = (person) => {
        const { selectedPerson } = this.state;
        person = person || selectedPerson;
        person['isGroup'] = false;
        person['id'] = person.userId;
        Actions.push(PageKeys.CHAT, { chatInfo: person })
        if (this.state.isVisibleOptionsModal)
            this.onCancelOptionsModal();
        if (this.state.searchQuery !== '')
            this.setState(prevState => ({ searchQuery: '' }));
    }

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

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.isLoading === true || !this.state.hasRemainingList ) return;
        this.setState((prevState) => ({ isLoading: true }), () => {
            this.props.getFavouriteList(this.props.user.userId,this.state.pageNumber, false, (res) => {
                console.log(res,'/////// resp')
                this.setState(prevState => ({ isLoading: false, pageNumber: res.friendList.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber, hasRemainingList: res.remainingList > 0,favouriteList:[...res.friendList] ,}));
            }, (er) => {
                this.setState({ isLoading: false })
            },this.state.searchQuery,false,this.state.isFilter==FILTERED_ACTION_IDS.LOCATION_ENABLE);
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
        return null
    }

    onChangeSearchValue = (val) => {  
        clearTimeout(this.searchQueryTimeout);
        this.setState({ searchQuery: val ,pageNumber:0});
        this.searchQueryTimeout = setTimeout(() => {  
            this.props.getFavouriteList( this.props.user.userId, 0, true, (res) => {
                this.setState({ hasRemainingList: res.remainingList > 0,pageNumber: res.friendList.length > 0 ? 1 : 0 ,favouriteList:[...res.friendList]})
            }, (err) => {
            },this.state.searchQuery,true,this.state.isFilter==FILTERED_ACTION_IDS.LOCATION_ENABLE)
            // } else {
            //     this.props.searchForFriend('', this.props.user.userId, 0, 10,this.filterProps, this.props.addedMembers, (res)=>{
            //         this.setState(prevState => ({ isLoading: false, pageNumber: 1 , hasRemainingList: res.remainingList > 0 }));
            //     },(er)=>{
            //         this.setState({isLoading:false})
            //     });
            // }
        }, 300);
    }

    filterLocationEnableFriends = () => {
        if (this.state.isFilter === FILTERED_ACTION_IDS.LOCATION_ENABLE) {
            this.props.getFavouriteList( this.props.user.userId, 0, true, (res) => {
                this.setState({ hasRemainingList: res.remainingList > 0,pageNumber: res.friendList.length > 0 ? 1: 0 ,favouriteList:[...res.friendList]})
            }, (err) => {
            },this.state.searchQuery,true,false)
            this.setState({ friendsFilter: FILTERED_ACTION_IDS.BTN_ALL_FRIENDS, isFilter: null,pageNumber:this.props.favouriteList.length==0?0:Math.ceil((this.props.favouriteList.length-1)/10) },()=>{
                console.log(this.state.pageNumber)
            })
        }
        else {
            this.props.getFavouriteList( this.props.user.userId, 0, true, (res) => {
                this.setState({ hasRemainingList: res.remainingList > 0,pageNumber: res.friendList.length > 0 ? 1: 0 ,favouriteList:[...res.friendList]})
            }, (err) => {
            },this.state.searchQuery,true,true)
            this.setState({ friendsFilter: FILTERED_ACTION_IDS.LOCATION_ENABLE_FRIENDS, isFilter: FILTERED_ACTION_IDS.LOCATION_ENABLE })
        }
    }

    filterVisibleOnMapFriends = () => {
        if (this.state.isFilter === FILTERED_ACTION_IDS.VISIBLE_ON_MAP) {
            // this.props.getFavouriteList( this.props.user.userId, 0, true, (res) => {
            //     this.setState({ hasRemainingList: res.remainingList > 0 ,pageNumber: res.friendList.length > 0 ? 1: 0,favouriteList:[...res.friendList]})
            // }, (err) => {
            // },this.state.searchQuery,true)
            this.setState({ friendsFilter: FILTERED_ACTION_IDS.BTN_ALL_FRIENDS, isFilter: null,pageNumber:this.props.favouriteList.length==0?0:Math.ceil((this.props.favouriteList.length-1)/10) },()=>{
                console.log(this.state.pageNumber)
            })
        }
        else {
            this.setState({ friendsFilter: FILTERED_ACTION_IDS.VISIBLE_ON_MAP_FRIENDS, isFilter: FILTERED_ACTION_IDS.VISIBLE_ON_MAP })
        }
    }

    toggleFriendsLocation = (isVisible, item) => {
        if (!item.locationEnable) return;
        friendId = item.userId || this.state.selectedPerson.userId;
        isVisible
            ? this.setState({ isVisibleOptionsModal: false }, () => {
                this.props.hideFriendsLocation(friendId);
            })
            : this.props.getFriendsLocationList(this.props.user.userId, [friendId], false)
    }

    onPressNavigationIcon = (isVisible, item) => {
        if (!item.locationEnable) return;
        friendId = item.userId || this.state.selectedPerson.userId;
        isVisible
            ? this.setState({ onPressArrow: true })
            : this.setState({ onPressArrow: true }, () => {
                this.props.getFriendsLocationList(this.props.user.userId, [friendId], true)
            })
    }

    render() {
        const { searchQuery, isRefreshing, friendsFilter } = this.state;
        const { favouriteList, friendsLocationList } = this.props;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        let filteredFriends = [];
        if (friendsFilter === FILTERED_ACTION_IDS.BTN_ALL_FRIENDS) {
            filteredFriends = favouriteList 
        }
        else if (friendsFilter === FILTERED_ACTION_IDS.LOCATION_ENABLE_FRIENDS) {
            filteredFriends = favouriteList      
        }
        else if (friendsFilter === FILTERED_ACTION_IDS.VISIBLE_ON_MAP_FRIENDS) {
            filteredFriends = favouriteList.filter(friend => friendsLocationList[friend.userId] && friendsLocationList[friend.userId].isVisible === true);
        }
        return (
            <View style={styles.fill}>
                <View style={{ flex: 1, marginHorizontal: widthPercentageToDP(8) }}>
                    <SearchBoxFilter
                        searchQuery={searchQuery} onChangeSearchValue={this.onChangeSearchValue}
                        placeholder='Name' outerContainer={{ marginTop: 16 }}
                        placeholderTextColor="#505050"
                        footer={<View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, borderBottomWidth: 1, borderBottomColor: '#868686', paddingBottom: 16 }}>
                            <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { color: this.state.isFilter === FILTERED_ACTION_IDS.VISIBLE_ON_MAP ? '#000000' : '#C4C6C8', fontSize: 23 } }} onPress={() => this.filterVisibleOnMapFriends()} />
                            <IconButton iconProps={{ name: 'location-arrow', type: 'FontAwesome', style: { color: this.state.isFilter === FILTERED_ACTION_IDS.LOCATION_ENABLE ? '#000000' : '#C4C6C8', fontSize: 23 } }} onPress={() => this.filterLocationEnableFriends()} />
                        </View>}
                    />
                    <FlatList
                        contentContainerStyle={[{ paddingBottom: this.state.hasRemainingList ? 40 : 0 }, styles.friendList]}
                        keyboardShouldPersistTaps={'handled'}
                        showsVerticalScrollIndicator={false}
                        style={{ flexDirection: 'column' }}
                        data={filteredFriends}
                        refreshing={isRefreshing}
                        onRefresh={this.onPullRefresh}
                        keyExtractor={this.friendKeyExtractor}
                        extraData={this.state}
                        renderItem={({ item, index }) => (
                            <HorizontalCard
                                horizontalCardPlaceholder={require('../../../assets/img/friend-profile-pic.png')}
                                item={item}
                                onPressLeft={() => this.openFriendsProfileTab(item)}
                                thumbnail={item.profilePictureId ? `${GET_PICTURE_BY_ID}${item.profilePictureId}` : null}
                                cardOuterStyle={styles.horizontalCardOuterStyle}
                                actionsBar={{
                                    online: true,
                                    actions: [
                                        { name: 'search', id: 2, type: 'FontAwesome', color: friendsLocationList[item.userId] !== undefined && friendsLocationList[item.userId].isVisible ? '#2B77B4' : '#C4C6C8', onPressActions: () => this.toggleFriendsLocation(friendsLocationList[item.userId] !== undefined && friendsLocationList[item.userId].isVisible, item) },
                                        { name: 'location-arrow', id: 3, type: 'FontAwesome', color: item.locationEnable ? '#81BA41' : '#C4C6C8', onPressActions: () => this.onPressNavigationIcon(friendsLocationList[item.userId] !== undefined && friendsLocationList[item.userId].isVisible, item) },
                                        { isIconImage: true, imgSrc: require('../../../assets/img/chat.png'), id: 4, onPressActions: () => this.openChatPage(item), imgStyle: { height: 23, width: 26, marginTop: 6 } }]
                                }}
                            />
                        )}
                        ListFooterComponent={this.renderFooter}
                        onEndReached={this.loadMoreData}
                        onEndReachedThreshold={0.1}
                    />
                </View>
                {
                    this.props.hasNetwork === false && allFriends.length === 0 && <View style={{ flexDirection: 'column', justifyContent: 'space-between', position: 'absolute', top: heightPercentageToDP(25), left: widthPercentageToDP(27), height: 100, }}>
                        <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                        <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                    </View>
                }
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { allFriends, friendsLocationList,favouriteList } = state.FriendList;
    const { pageNumber, hasNetwork } = state.PageState;
    return { user, pageNumber, hasNetwork, allFriends, friendsLocationList,favouriteList };
};
const mapDispatchToProps = (dispatch) => {
    return {
        getAllFriends: (friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback) => dispatch(getAllFriends(friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback)),
        getFriendsLocationList: (userId, friendsIdList, isTempLocation) => dispatch(getFriendsLocationList(userId, friendsIdList, isTempLocation)),
        hideFriendsLocation: (userId) => dispatch(hideFriendsLocationAction(userId)),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
        changeScreen: (screenProps) => dispatch(screenChangeAction(screenProps)),
        getFavouriteList:(userId, pageNumber, toggleLoader, successCallback, errorCallback,searchValue,refreshed,locationEnable)=>dispatch(getFavouriteList(userId, pageNumber, toggleLoader, successCallback, errorCallback,searchValue,refreshed,locationEnable))
       
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(FavoriteListTab);

const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    horizontalCardOuterStyle: {
        marginBottom: heightPercentageToDP(1),
    },
    friendList: {
        paddingTop: 5
    },
});
