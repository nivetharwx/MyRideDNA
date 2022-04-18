import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Animated, Keyboard, FlatList, View, ActivityIndicator, Easing, Alert } from 'react-native';
import { IconButton } from '../../../components/buttons';
import { widthPercentageToDP, heightPercentageToDP, PageKeys, GET_PICTURE_BY_ID } from '../../../constants';
import { HorizontalCard } from '../../../components/cards';
import { getFriendGroups, getAllMembersLocation, handleServiceErrors, searchForGroup, getAllGroupLocation } from '../../../api';
import { Actions } from 'react-native-router-flux';
import { hideMembersLocationAction, screenChangeAction, updatePageNumberAction, clearGroupSearchResultsAction, replaceGroupSearchResultsAction, updateFriendGroupListAction, resetErrorHandlingAction } from '../../../actions';
import { SearchBoxFilter } from '../../../components/inputs';
import { DefaultText } from '../../../components/labels';


const CARD_HEIGHT = 74;
class GroupListTab extends Component {
    filteredGroups = [];
    defaultBtmOffset = widthPercentageToDP(8);
    _preference = 10;
    constructor(props) {
        super(props);
        this.defaultBtmOffset = widthPercentageToDP(props.user.handDominance === 'left' ? 20 : 8);
        this.state = {
            isRefreshing: false,
            kbdBtmOffset: this.defaultBtmOffset,
            selectedGroup: null,
            isLoading: false,
            spinValue: new Animated.Value(0),
            searchQuery: '',
            hasRemainingList: false,
            pageNumber: 0,
            groupIds: [],
            onPressArrow: false
        };
    }

    componentDidMount() {
        
        console.log('didmount called groups')
        this._preference = parseInt(heightPercentageToDP(100) / CARD_HEIGHT);
        this.props.getFriendGroups(this.props.user.userId, true, this.state.pageNumber, this._preference, (res) => {
            if (res.groups.length > 0) {
                this.setState(prevState=>({  pageNumber: res.groups.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber, hasRemainingList: res.remainingList > 0, groupIds: res.groups.map(group => group.groupId) }))
            }
        }, (err) => {
        },this.state.searchQuery);
    }

    adjustLayoutOnKeyboardVisibility = ({ endCoordinates }) => {
        this.setState({ kbdBtmOffset: endCoordinates.height });
    }


    componentDidUpdate(prevProps, prevState) {
        
        if (prevState.pageNumber !== this.state.pageNumber) {
            this.props.getAllGroupLocation(this.state.groupIds)
        }
        if (prevProps.friendGroupList !== this.props.friendGroupList) {
            if (prevState.isRefreshing === true) {
                this.setState({ isRefreshing: false });
            }
            // console.log(this.props.friendGroupList.length<=this._preference,this.props.friendGroupList.length,this._preference)
            // if(this.props.friendGroupList.length<=this._preference){
            //     this.setState({ pageNumber: 0 });
            // }
        }
        if (this.state.onPressArrow) {
            this.props.changeScreen({ name: PageKeys.MAP });
        }
        if (prevProps.hasNetwork === false && this.props.hasNetwork === true) {
            this.retryApiFunc();
        }

        if (prevProps.isRetryApi === false && this.props.isRetryApi === true) {
            if (Actions.currentScene === this.props.lastApi.currentScene) {
                Alert.alert(
                    'Something went wrong ',
                    '',
                    [
                        {
                            text: 'Retry ', onPress: () => {
                                this.retryApiFunc();
                                this.props.resetErrorHandling(false)
                            }
                        },
                        { text: 'Cancel', onPress: () => { this.props.resetErrorHandling(false) }, style: 'cancel' },
                    ],
                    { cancelable: false }
                )
            }
        }

    }

    retryApiFunc = () => {
        if (this.props.lastApi && this.props.lastApi.currentScene === Actions.currentScene) {
            this.props[`${this.props.lastApi.api}`](...this.props.lastApi.params)
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
                this.props.getFriendGroups(this.props.user.userId, true, 0, this._preference, (res) => {
                }, (err) => {
                },this.state.searchQuery);
            }
        });
    }
    
    onPullRefresh = () => {
        this.setState({ isRefreshing: true });
        this._preference = parseInt(heightPercentageToDP(100) / CARD_HEIGHT);
        this.props.getFriendGroups(this.props.user.userId, false, 0, this._preference, (res) => {
            if (res.groups.length > 0) {
                this.setState({ pageNumber: 1, hasRemainingList: res.remainingList > 0, groupIds: res.groups.map(group => group.groupId) })
            }
            this.props.getAllGroupLocation( res.groups.map(group => group.groupId))
        }, (err) => {
        });
    }

    addKeyboardListeners() {
        Keyboard.addListener('keyboardDidShow', this.adjustLayoutOnKeyboardVisibility);
        Keyboard.addListener('keyboardDidHide', this.adjustLayoutAndRemoveListeners);
    }

    adjustLayoutAndRemoveListeners = () => {
        this.setState({ kbdBtmOffset: this.defaultBtmOffset }, () => {
            Keyboard.removeListener('keyboardDidShow', this.adjustLayoutOnKeyboardVisibility);
            Keyboard.removeListener('keyboardDidHide', this.adjustLayoutAndRemoveListeners);
        });
    }

    openGroupInfo = (index) => {
        Actions.push(PageKeys.GROUP, { grpIndex: index });
    }
    openChatPage = (item) => {
        const groupDetail = this.state.selectedGroup || item;
        groupDetail['isGroup'] = true
        groupDetail['id'] = groupDetail.groupId
        Actions.push(PageKeys.CHAT, { isGroup: true, chatInfo: groupDetail })
    }

    toggleMembersLocation = (isVisible, item) => {
        if (!item.locationEnable) return;
        groupId = item.groupId
        isVisible
            ? this.props.hideMembersLocation(groupId)
            : this.props.getAllMembersLocation(groupId, this.props.user.userId, false)
    }

    onPressNavigationIcon = (isVisible, item) => {
        if (!item.locationEnable) return;
        groupId = item.groupId
        isVisible
            ? this.setState({ onPressArrow: true })
            : this.setState({ onPressArrow: true }, () => {
                this.props.getAllMembersLocation(groupId, this.props.user.userId, true)
            })
    }

    renderGroup = ({ item, index }) => {
        return (
            <HorizontalCard
                item={item}
                cardOuterStyle={styles.horizontalCardOuterStyle}
                onPressLeft={() => this.openGroupInfo(index)}
                leftIcon={{ name: 'group', type: 'FontAwesome' }}
                thumbnail={item.profilePictureId ? `${GET_PICTURE_BY_ID}${item.profilePictureId}` : null}
                actionsBar={{
                    actions: [
                        { name: 'search', id: 2, type: 'FontAwesome', color: this.props.membersLocationList[item.groupId] !== undefined && this.props.membersLocationList[item.groupId].members[0].isVisible ? '#2B77B4' : '#C4C6C8', onPressActions: () => this.toggleMembersLocation(this.props.membersLocationList[item.groupId] !== undefined && this.props.membersLocationList[item.groupId].members[0].isVisible, item) },
                        { name: 'location-arrow', type: 'FontAwesome', color: item.locationEnable ? '#81BA41' : '#C4C6C8', onPressActions: () => this.onPressNavigationIcon(this.props.membersLocationList[item.groupId] !== undefined && this.props.membersLocationList[item.groupId].members[0].isVisible, item) },
                        { isIconImage: true, imgSrc: require('../../../assets/img/chat.png'), id: 4, onPressActions: () => this.openChatPage(item), imgStyle: { height: 23, width: 26, marginTop: 6 } }]
                }}
            />
        );
    }

    groupKeyExtractor = (item,i) => item.groupId;

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.isLoading === true || !this.state.hasRemainingList ) return;
        this.setState((prevState) => ({ isLoading: true }), () => {
            this.props.getFriendGroups(this.props.user.userId, false, this.state.pageNumber, this._preference, (res) => {
                if (res.groups.length > 0) {
                    this.setState(prevState=>({ groupIds: res.groups.map(group => group.groupId), pageNumber:res.groups.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber, hasRemainingList: res.remainingList > 0, isLoading: false }))
                }
                else {
                    this.setState({ isLoading: false })
                }
            }, (er) => {
                this.setState({ isLoading: false })
            },this.state.searchQuery);
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
              this._preference = parseInt(heightPercentageToDP(100) / CARD_HEIGHT);
            this.props.getFriendGroups(this.props.user.userId, true, 0, this._preference, (res) => {
            if (res.groups.length > 0) {
                this.setState({ pageNumber:res.groups.length > 0 ? 1: 0, hasRemainingList: res.remainingList > 0, groupIds: res.groups.map(group => group.groupId) })
            }
        }, (err) => {
        },this.state.searchQuery);
            // } else {
            //     this.props.searchForFriend('', this.props.user.userId, 0, 10,this.filterProps, this.props.addedMembers, (res)=>{
            //         this.setState(prevState => ({ isLoading: false, pageNumber: 1 , hasRemainingList: res.remainingList > 0 }));
            //     },(er)=>{
            //         this.setState({isLoading:false})
            //     });
            // }
        }, 300);
    }

    render() {
        const { isRefreshing, searchQuery } = this.state;
        const { friendGroupList, user, membersLocationList, onPressAddGroup } = this.props;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
       

        return (
            <View style={styles.fill}>
                <View style={styles.container}>
                    <SearchBoxFilter
                        searchQuery={searchQuery}
                        onChangeSearchValue={this.onChangeSearchValue}
                        placeholder='Name'
                        placeholderTextColor="#505050"
                        outerContainer={{ marginTop: 16 }}
                    />
                    <FlatList
                        contentContainerStyle={[{}, styles.friendList]}
                        keyboardShouldPersistTaps={'handled'}
                        showsVerticalScrollIndicator={false}
                        data={friendGroupList}
                        refreshing={isRefreshing}
                        onRefresh={this.onPullRefresh}
                        keyExtractor={this.groupKeyExtractor}
                        renderItem={this.renderGroup}
                        extraData={this.state}
                        ListFooterComponent={this.renderFooter}
                        onEndReached={this.loadMoreData}
                        onEndReachedThreshold={0.1}
                    />
                </View>
                {
                    this.props.hasNetwork === false && friendGroupList.length === 0 && <View style={{ flexDirection: 'column', justifyContent: 'space-between', position: 'absolute', top: heightPercentageToDP(20), left: widthPercentageToDP(27), height: 100, }}>
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
    const { friendGroupList, currentGroup, membersLocationList, searchGroup } = state.FriendGroupList;
    const { allFriends } = state.FriendList;
    const { pageNumber, hasNetwork, lastApi, isRetryApi } = state.PageState;
    return { user, friendGroupList, allFriends, currentGroup, pageNumber, hasNetwork, lastApi, isRetryApi, membersLocationList, searchGroup };
};
const mapDispatchToProps = (dispatch) => {
    return {
        getFriendGroups: (userId, toggleLoader, pageNumber, preference, successCallback, errorCallback,searchValue) => dispatch(getFriendGroups(userId, toggleLoader, pageNumber, preference, successCallback, errorCallback,searchValue)),
        getAllMembersLocation: (groupId, userId, isTempLocation) => dispatch(getAllMembersLocation(groupId, userId, isTempLocation)),
        hideMembersLocation: (groupId) => dispatch(hideMembersLocationAction(groupId)),
        changeScreen: (screenProps) => dispatch(screenChangeAction(screenProps)),
        searchForGroup: (memberId, searchParam, pageNumber, preference, successCallback, errorCallback) => searchForGroup(memberId, searchParam, pageNumber, preference).then(res => {
            if (res.status === 200) {
                typeof successCallback === 'function' && successCallback();
                console.log("res.data: ", res.data);
                dispatch(updatePageNumberAction({ pageNumber: pageNumber }));
                dispatch(replaceGroupSearchResultsAction({ results: res.data.groupList, pageNumber }))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
            } else {
                typeof successCallback === 'function' && successCallback(); cd
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
            }
        })
            .catch(er => {
                typeof errorCallback === 'function' && errorCallback();
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                handleServiceErrors(er, [memberId, searchParam, pageNumber, preference], searchForGroup, true);
            }),
        clearGroupSearchResults: () => dispatch(clearGroupSearchResultsAction()),
        getAllGroupLocation: (groupIds) => getAllGroupLocation(groupIds).then(res => {
            console.log('getAllGroupLocation success : ', res)
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            dispatch(updateFriendGroupListAction(res.data));
        }).catch(er => {
            console.log('getAllGroupLocation error : ', er)
            handleServiceErrors(er, [groupIds], 'getAllGroupLocation', true, true);
        }),
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'group_list', isRetryApi: state })),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(GroupListTab);

const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    horizontalCardOuterStyle: {
        marginBottom: 15,
        height: CARD_HEIGHT,
    },
    friendList: {
        paddingTop: 5
    },
    container: {
        flex: 1,
        marginHorizontal: widthPercentageToDP(8)
    }
}); 