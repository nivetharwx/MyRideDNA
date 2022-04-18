import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Animated, FlatList, View, ActivityIndicator, Easing } from 'react-native';
import { getAllFriends, getFriendsLocationList, addFavorite, removeFavorite } from '../../../api';
import { FRIEND_TYPE, widthPercentageToDP, heightPercentageToDP, PageKeys, GET_PICTURE_BY_ID } from '../../../constants';
import { IconButton, ImageButton } from '../../../components/buttons';
import { HorizontalCard } from '../../../components/cards';
import { screenChangeAction, hideFriendsLocationAction, setCurrentFriendAction } from '../../../actions';
import { Actions } from 'react-native-router-flux';
import { SearchBoxFilter } from '../../../components/inputs';
import { DefaultText } from '../../../components/labels';
import AsyncStorage from '@react-native-community/async-storage';


const FILTERED_ACTION_IDS = {
    BTN_ALL_FRIENDS: 'btn_all_friends',
    LOCATION_ENABLE_FRIENDS: 'location-enable-friends',
    LOCATION_ENABLE: 'location-enable',
    VISIBLE_ON_MAP_FRIENDS: 'visible-on-map-friends',
    VISIBLE_ON_MAP: 'visible-on-map',
};




class AllFriendsTab extends Component {
    filteredFriends = []
    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            friendsFilter: FILTERED_ACTION_IDS.BTN_ALL_FRIENDS,
            isFilter: null,
            isLoading: false,
            spinValue: new Animated.Value(0),
            searchQuery: '',
            hasRemainingList: false,
            pageNumber: 0,
            onPressArrow: false
        }
    }

    componentDidMount() {
        this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, true, (res) => {
            console.log(res)
            this.setState(prevState=>({ hasRemainingList: res.remainingList > 0 ,pageNumber: res.friendList.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber}))
        }, (err) => {
        },this.state.searchQuery,this.state.isFilter==FILTERED_ACTION_IDS.LOCATION_ENABLE);
    }

    componentDidUpdate(prevProps, prevState) {
        if (Actions.currentScene !== PageKeys.GROUP && this.state.onPressArrow) {
            this.props.changeScreen({ name: PageKeys.MAP });
        }

        if (prevProps.allFriends !== this.props.allFriends) {
            if (prevState.isRefreshing === true) {
                this.setState({ isRefreshing: false });
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
                this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, this.state.pageNumber, true, (res) => {
                    this.setState(prevState=>({ hasRemainingList: res.remainingList > 0 ,pageNumber: res.friendList.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber}))
                }, (err) => {
                },this.state.searchQuery,this.state.isFilter==FILTERED_ACTION_IDS.LOCATION_ENABLE);
            }
        });

    }

    openFriendsProfileTab = (friend) => {
        if (this.state.searchQuery !== '')
            this.setState(prevState => ({ searchQuery: '' }));
        this.openProfile(friend.userId)
    }

    openChatPage = (person) => {
        person['isGroup'] = false;
        person['id'] = person.userId;
        Actions.push(PageKeys.CHAT, { chatInfo: person });
        if (this.state.searchQuery !== '')
            this.setState(prevState => ({ searchQuery: '' }));
    }

    onPullRefresh = () => {
        if (this.state.searchQuery !== '')
            this.setState(prevState => ({ searchQuery: '' }));
        this.setState({ isRefreshing: true });
        console.log(this.state.isFilter)
        this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, false, (res) => {
            this.setState({ hasRemainingList: res.remainingList > 0 ,pageNumber: res.friendList.length > 0 ? 1 : 0,isRefreshing: false })
        }, (err) => {
        },'',this.state.isFilter==FILTERED_ACTION_IDS.LOCATION_ENABLE)
    }

    toggleFriendsLocation = async (isVisible, item) => {
       
        if (!item.locationEnable) return;
        const friendsIds = await AsyncStorage.getItem('friendIds');
        if(isVisible){
            if(JSON.parse(friendsIds).length === 1){
                AsyncStorage.removeItem('friendIds').then((res) => {
                }).catch(er => {
                });
            }
            else{
                AsyncStorage.setItem('friendIds', JSON.stringify(JSON.parse(friendsIds).filter(id=>id!== item.userId))).then(res => {
                }).catch(er => {
                }) 
            }
            this.props.hideFriendsLocation(item.userId)
        }
        else{
            if(friendsIds){
                AsyncStorage.setItem('friendIds', JSON.stringify([...JSON.parse(friendsIds), item.userId])).then(res => {
                    console.log('\n\n\n res : ', res)
                }).catch(er => {
                }) 
            }
            else{
                AsyncStorage.setItem('friendIds', JSON.stringify([item.userId])).then(res => {
                    console.log('\n\n\n res : ', res)
                }).catch(er => {
                })
            } 
            this.props.getFriendsLocationList(this.props.user.userId, [item.userId], false)
        }
    }

    onPressNavigationIcon = (isVisible, item) => {
        console.log(item.locationEnable,isVisible)
        if (!item.locationEnable) return;
        isVisible
            ? this.setState({ onPressArrow: true })
            : this.setState({ onPressArrow: true }, () => {
                this.props.getFriendsLocationList(this.props.user.userId, [item.userId], true)
            })
    }

    friendKeyExtractor = (item) => item.userId;

    openProfile = (userId) => {
        if (this.state.searchQuery !== '')
            this.setState(prevState => ({ searchQuery: '' }));
        this.props.setCurrentFriend({ userId });
        Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: userId });
    }

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.isLoading === true || !this.state.hasRemainingList ) return;
        this.setState((prevState) => ({ isLoading: true }), () => {
            this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, this.state.pageNumber, false, (res) => {
                this.setState(prevState => ({ isLoading: false, pageNumber: res.friendList.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber, hasRemainingList: res.remainingList > 0 }));
            }, (er) => {
                this.setState({ isLoading: false })
            },this.state.searchQuery,this.state.isFilter==FILTERED_ACTION_IDS.LOCATION_ENABLE);
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
              
              this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, true, (res) => {
                this.setState({ hasRemainingList: res.remainingList > 0 ,pageNumber:this.state.pageNumber+1})
            }, (err) => {
            },this.state.searchQuery,this.state.isFilter==FILTERED_ACTION_IDS.LOCATION_ENABLE);
            // } else {
            //     this.props.searchForFriend('', this.props.user.userId, 0, 10,this.filterProps, this.props.addedMembers, (res)=>{
            //         this.setState(prevState => ({ isLoading: false, pageNumber: 1 , hasRemainingList: res.remainingList > 0 }));
            //     },(er)=>{
            //         this.setState({isLoading:false})
            //     });
            // }
        }, 300);
    }

    toggleFavouriteFriend = (friend) => {
        console.log(friend,'  //////favorite')
        if (friend.favorite) {
            this.props.removeFavorite(friend.userId, this.props.user.userId)
        }
        else {
            this.props.addFavorite(friend.userId, this.props.user.userId)
        }

    }


    filterLocationEnableFriends = () => {
        if (this.state.isFilter === FILTERED_ACTION_IDS.LOCATION_ENABLE) {
            this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, true, (res) => {
            }, (err) => {
            },this.state.searchQuery,false);
            this.setState({ friendsFilter: FILTERED_ACTION_IDS.BTN_ALL_FRIENDS, isFilter: null,pageNumber:this.props.allFriends.length==0?0:Math.ceil((this.props.allFriends.length-1)/10)},()=>{
                console.log(this.state.pageNumber)
            } )
        }
        else {
            this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, true, (res) => {
            }, (err) => {
            },this.state.searchQuery,true);
            this.setState({ friendsFilter: FILTERED_ACTION_IDS.LOCATION_ENABLE_FRIENDS, isFilter: FILTERED_ACTION_IDS.LOCATION_ENABLE })
        }
    }

    filterVisibleOnMapFriends = () => {
        if (this.state.isFilter === FILTERED_ACTION_IDS.VISIBLE_ON_MAP) {
            // this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0, true, (res) => {
            // }, (err) => {
            // },this.state.searchQuery);
            this.setState({ friendsFilter: FILTERED_ACTION_IDS.BTN_ALL_FRIENDS, isFilter: null,pageNumber:this.props.allFriends.length==0?0:Math.ceil((this.props.allFriends.length-1)/10) },()=>{
                console.log(this.state.pageNumber)
            })
        }
        else {
            this.setState({ friendsFilter: FILTERED_ACTION_IDS.VISIBLE_ON_MAP_FRIENDS, isFilter: FILTERED_ACTION_IDS.VISIBLE_ON_MAP })
        }
    }

    render() {
        const { isRefreshing, friendsFilter, searchQuery } = this.state;
        const { allFriends, friendsLocationList } = this.props;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        
       if (friendsFilter === FILTERED_ACTION_IDS.LOCATION_ENABLE_FRIENDS) {  
            this.filteredFriends = allFriends
        }
        else if (friendsFilter === FILTERED_ACTION_IDS.VISIBLE_ON_MAP_FRIENDS) {
            this.filteredFriends =allFriends.filter(friend => friendsLocationList[friend.userId] && friendsLocationList[friend.userId].isVisible === true);
        }else{
            this.filteredFriends=allFriends
        }
        return (
            <View style={styles.fill}>
                <View style={{ flex: 1, marginHorizontal: widthPercentageToDP(8) }}>
                    <SearchBoxFilter
                        searchQuery={searchQuery} onChangeSearchValue={this.onChangeSearchValue}
                        placeholder='Name' outerContainer={{ marginTop: 16 }}
                        placeholderTextColor="#505050"
                        footer={<View style={styles.filterContainer}>
                            <ImageButton imageSrc={require('../../../assets/img/add-person-icon.png')} imgStyles={{ width: 23, height: 26 }} onPress={() => {
                                Actions.push(PageKeys.CONTACTS_SECTION);
                                if (this.state.searchQuery !== '')
                                    this.setState(prevState => ({ searchQuery: '' }));
                            }} />
                            <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { color: this.state.isFilter === FILTERED_ACTION_IDS.VISIBLE_ON_MAP ? '#000000' : '#C4C6C8', fontSize: 23 } }} onPress={() => this.filterVisibleOnMapFriends()} />
                            <IconButton iconProps={{ name: 'location-arrow', type: 'FontAwesome', style: { color: this.state.isFilter === FILTERED_ACTION_IDS.LOCATION_ENABLE ? '#000000' : '#C4C6C8', fontSize: 23 } }} onPress={() => this.filterLocationEnableFriends()} />
                        </View>}
                    />
                    <FlatList
                        keyboardShouldPersistTaps={'handled'}
                        contentContainerStyle={[{ paddingBottom: this.state.hasRemainingList ? 40 : 0 }, styles.friendList]}
                        showsVerticalScrollIndicator={false}
                        data={this.filteredFriends}
                        refreshing={isRefreshing}
                        onRefresh={this.onPullRefresh}
                        keyExtractor={this.friendKeyExtractor}
                        extraData={this.state}
                        renderItem={({ item, index }) => 
                        {
                            return(
                            <HorizontalCard
                                horizontalCardPlaceholder={require('../../../assets/img/friend-profile-pic.png')}
                                item={item}
                                onPressLeft={() => this.openFriendsProfileTab(item)}
                                thumbnail={item.profilePictureId ? `${GET_PICTURE_BY_ID}${item.profilePictureId}` : null}
                                cardOuterStyle={styles.horizontalCardOuterStyle}
                                actionsBar={{
                                    online: true,
                                    actions: [{ name: item.favorite ? 'star' : 'star-outlined', id: 1, type: 'Entypo', color: item.favorite ? '#CE0D0D' : '#C4C6C8', onPressActions: () => this.toggleFavouriteFriend(item) },
                                    { name: 'search', id: 2, type: 'FontAwesome', color: friendsLocationList[item.userId] !== undefined && friendsLocationList[item.userId].isVisible ? '#2B77B4' : '#C4C6C8', onPressActions: () => this.toggleFriendsLocation(friendsLocationList[item.userId] !== undefined && friendsLocationList[item.userId].isVisible, item) },
                                    { name: 'location-arrow', id: 3, type: 'FontAwesome', color: item.locationEnable ? '#81BA41' : '#C4C6C8', onPressActions: () => this.onPressNavigationIcon(friendsLocationList[item.userId] !== undefined && friendsLocationList[item.userId].isVisible, item) },
                                    { isIconImage: true, imgSrc: require('../../../assets/img/chat.png'), id: 4, onPressActions: () => this.openChatPage(item), imgStyle: { height: 23, width: 26, marginTop: 6 } }]
                                }}
                            />
                        )
                        }
                    }
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
    const { allFriends, paginationNum, searchFriendList, friendsLocationList } = state.FriendList;
    const { pageNumber, hasNetwork } = state.PageState;
    return { user, allFriends, paginationNum, searchFriendList, friendsLocationList, pageNumber, hasNetwork };
};
const mapDispatchToProps = (dispatch) => {
    return {
        getAllFriends: (friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback,searchQuery,locationEnable) => dispatch(getAllFriends(friendType, userId, pageNumber, toggleLoader, successCallback, errorCallback,searchQuery,locationEnable)),
        changeScreen: (screenProps) => dispatch(screenChangeAction(screenProps)),
        getFriendsLocationList: (userId, friendsIdList, isTempLocation) => dispatch(getFriendsLocationList(userId, friendsIdList, isTempLocation)),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
        hideFriendsLocation: (userId) => dispatch(hideFriendsLocationAction(userId)),
        addFavorite: (userId, senderId) => dispatch(addFavorite(userId, senderId)),
        removeFavorite: (userId, senderId) => dispatch(removeFavorite(userId, senderId))
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(AllFriendsTab);

const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    friendList: {
        paddingTop: 5,
    },
    horizontalCardOuterStyle: {
        marginBottom: heightPercentageToDP(1),
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#868686',
        paddingBottom: 16
    }
});