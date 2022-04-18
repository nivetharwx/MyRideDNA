import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Animated, FlatList, View, ImageBackground, Easing, TextInput, ActivityIndicator, Text } from 'react-native';
import { IconButton, LinkButton } from '../../../components/buttons';
import { widthPercentageToDP, heightPercentageToDP, PageKeys, APP_COMMON_STYLES, CUSTOM_FONTS, GET_PICTURE_BY_ID, CHAT_CONTENT_TYPE } from '../../../constants';
import { ListItem, Left, Thumbnail, Icon as NBIcon } from 'native-base';
import { BasicHeader } from '../../../components/headers';
import { getAllChats, getPictureList, handleServiceErrors, searchFriendsForChat, searchingOnChat } from '../../../api';
import { appNavMenuVisibilityAction, updateChatPicAction, updateGroupChatPicAction, clearChatListAction, resetErrorHandlingAction } from '../../../actions';
import { Actions } from 'react-native-router-flux';
import { DefaultText } from '../../../components/labels';
import { BasePage } from '../../../components/pages';

class ChatList extends Component {
    frndChatPicLoading = false;
    grpChatPicLoading = false;
    _searchQueryTimeout = null;
    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            isLoading: false,
            isLoadingData: false,
            spinValue: new Animated.Value(0),
            showFriends: false,
            showSearchbar: this.props.isShareMode || false,
            searchQuery: '',
            selectionList: [],
            searchResults: [],
            pageNumber:0,
            hasRemainingList: false,
        };
    }

    componentDidMount() {
        this.grpChatPicLoading = false;
        this.frndChatPicLoading = false;
        this.props.getAllChats(this.props.user.userId);
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
                this.props.getAllChats(this.props.user.userId);
            }
        });
    }

    componentWillUnmount() {
        // this.props.clearChatList();
    }

    deleteFromChatList = () => {

    }
    getFormattedDate = (dateTime) => {
        var dateFirst = new Date();
        var dateSecond = new Date(dateTime);
        var timeDiff = Math.abs(dateSecond.getTime() - dateFirst.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if (new Date(dateTime).toLocaleDateString() === new Date().toLocaleDateString()) {
            const time = new Date(dateTime).toTimeString().substring(0, 5).split(':');
            let period = time[0] < 12 ? 'AM' : 'PM';
            if (time[0] > 12) {
                time[0] = time[0] - 12;
            }
            return `${time.join(':')} ${period}`;
        }
        else if (diffDays > 0 && diffDays < 7) {
            return `${diffDays} day ago`
        }
        else {
            return `${Math.floor(diffDays / 7)} week ago`
        }
    }

    showAppNavigation = () => this.props.showAppNavMenu();

    goToChatPage = (item) => {
        Actions.push(PageKeys.CHAT, { comingFrom: PageKeys.CHAT_LIST, isGroup: item.isGroup ? true : false, chatInfo: item });
    }

    renderItemHeader = (item) => {
        if (item.isGroup) {
            const firstNameStr = item.memberNameList.reduce((arr, name) => {
                arr.push(name.split(' ')[0]);
                return arr;
            }, []).join(', ');
            return <View style={{ flexDirection: 'row' }}>
                <DefaultText numberOfLines={1} style={[styles.itemNameTxt, styles.groupNameTxt]}>
                    {item.groupName}{
                        firstNameStr
                            ? <DefaultText numberOfLines={1} style={styles.groupMembersTxt}>{item.groupName ? ' - ' : '' + `${firstNameStr}`}</DefaultText>
                            : null
                    }
                </DefaultText>
                <DefaultText style={styles.msgTime}>{item.message && item.message.date ? this.getFormattedDate(item.message.date) : ''}</DefaultText>
            </View>;
        }
        return <View style={{ flexDirection: 'row' }}>
            <DefaultText style={[styles.itemNameTxt, styles.groupNameTxt]}>{item.name}</DefaultText>
            <DefaultText style={styles.msgTime}>{item.message && item.message.date ? this.getFormattedDate(item.message.date) : ''}</DefaultText>
        </View>;
    }

    renderItemBodyContent(item) {
        let MSGCONTENT = null;
        if (item.message) {
            switch (item.message.type) {
                case CHAT_CONTENT_TYPE.RIDE:
                    MSGCONTENT = <DefaultText numberOfLines={2} style={styles.itemMsgTxt}><DefaultText style={[styles.itemMsgTxt, { fontWeight: 'bold' }]}>{item.isGroup ? item.message.senderId === this.props.user.userId ? 'You : ' : item.message.senderName && item.message.senderName !== 'system' && item.message.senderName.split(' ')[0] + ' : ' : null}</DefaultText>{(item.message.content + '').indexOf('Shared') !== 0 ? `Shared a ride, ${JSON.parse(item.message.content).name}` : item.message.content}</DefaultText>;
                    break;
                case CHAT_CONTENT_TYPE.IMAGE || CHAT_CONTENT_TYPE.VIDEO:
                    MSGCONTENT = <DefaultText numberOfLines={2} style={styles.itemMsgTxt}><DefaultText style={[styles.itemMsgTxt, { fontWeight: 'bold' }]}>{item.isGroup ? item.message.senderId === this.props.user.userId ? 'You : ' :item.message.senderName && item.message.senderName !== 'system' && item.message.senderName.split(' ')[0] + ' : ' : null}</DefaultText>Shared {`${item.message.media.length} ${item.message.type}${item.message.media.length > 1 ? 's' : ''}`}</DefaultText>;
                    break;
                default:
                    MSGCONTENT = <DefaultText numberOfLines={2} style={styles.itemMsgTxt}><DefaultText style={[styles.itemMsgTxt, { fontWeight: 'bold' }]}>{item.isGroup ? item.message.senderId === this.props.user.userId ? 'You : ' : item.message.senderName && item.message.senderName !== 'system' && item.message.senderName.split(' ')[0] + ' : ' : null}</DefaultText>{`${item.message.content ? item.message.content : ''}`}</DefaultText>;
            }
        }
        return <View style={styles.bodyCont}>
            {
                this.renderItemHeader(item)
            }
            <View style={styles.itemMsgTxtView}>
                {MSGCONTENT}
                {
                    item.totalUnseenMessage > 0
                        ? <View style={styles.messageNumber}>
                            <DefaultText style={{ alignSelf: 'center', color: '#FFFFFF' }}>{item.totalUnseenMessage > 99 ? '99+' : item.totalUnseenMessage}</DefaultText>
                        </View>
                        : null
                }
            </View>
        </View>
    }

    renderChatList = ({ item, index }) => {
        console.log("PROFILE ID-------------------",item.name,item.profilePictureId);
        return (
            <ListItem noIndent style={styles.itemCont} onPress={() => this.props.isShareMode ? this.selectChat({ ...item }) : this.goToChatPage(item)}>
                {
                    item.isGroup
                        ? <Left style={styles.leftCont}>
                            {
                                // console.log(item,'item printed'),
                                item.groupProfilePictureId
                                    ? <Thumbnail style={styles.iconContComm} source={{ uri: `${GET_PICTURE_BY_ID}${item.groupProfilePictureId}` }} />
                                    : item.profilePictureIdList.length>0
                                        ? <View style={[styles.iconContComm, { backgroundColor: '#ffffff' }]}>
                                            {item.profilePictureIdList[1]?<Thumbnail style={[styles.smallThumbanail]} source={{ uri: `${GET_PICTURE_BY_ID}${item.profilePictureIdList[1]}` }} />:
                                            <View style={{width:32,height:32,backgroundColor:'#6C6C6B',borderRadius:16,alignItems:'center',justifyContent:'center', borderWidth: 1,borderColor: '#ffffff',}}>
                                                <Text style={{fontSize:17,color:'#ffffff'}}>{item.memberNameList[1]?(item.memberNameList[1]).slice(0,1).toUpperCase():this.props.user.name.slice(0,1).toUpperCase()}
                                                </Text>
                                                </View>}
                                            <Thumbnail style={[styles.smallThumbanail, styles.smallThumbanailTop]} source={{ uri: `${GET_PICTURE_BY_ID}${item.profilePictureIdList[0]}` }} />
                                        </View>
                                        : <IconButton disabled style={[styles.iconContComm, styles.groupIconCont]} iconProps={{ name: 'users', type: 'FontAwesome', style: styles.iconComm }} />
                            }
                            {
                                this.state.selectionList.findIndex(chat => chat.id === item.id) > -1
                                    ? <View style={[{
                                        ...styles.iconContComm,
                                        position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)',
                                        alignItems: 'center', justifyContent: 'center',
                                    }]}>
                                        <NBIcon name='check' type='Entypo' style={{ color: '#fff', fontSize: 20 }} />
                                    </View>
                                    : null
                            }
                            {this.renderItemBodyContent(item)}
                        </Left>
                        : <Left style={styles.leftCont}>
                            {  
                                item.profilePictureId
                                    ? <Thumbnail style={styles.iconContComm} source={{ uri: `${GET_PICTURE_BY_ID}${item.profilePictureId}` }} />
                                    : <IconButton disabled style={[styles.iconContComm, styles.userIconCont]} iconProps={{ name: 'user', type: 'FontAwesome', style: styles.iconComm }} />
                            }
                            {
                                this.state.selectionList.findIndex(chat => chat.id === item.id) > -1
                                    ? <View style={[{
                                        ...styles.iconContComm,
                                        position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)',
                                        alignItems: 'center', justifyContent: 'center',
                                    }]}>
                                        <NBIcon name='check' type='Entypo' style={{ color: '#fff', fontSize: 20 }} />
                                    </View>
                                    : null
                            }
                            {this.renderItemBodyContent(item)}
                        </Left>
                }
            </ListItem>
        );
    }


    chatListKeyExtractor = (item) => item.id;

    onCancelOptionsModal = () => this.setState({ isVisibleOptionsModal: false });

    onChangeSearchValue = (val) =>{ 
        if(this.props.isShareMode){
            clearTimeout(this._searchQueryTimeout);
         this.setState({ searchQuery: val, pageNumber: 0 },
            () => this.state.searchQuery === ''
                ? this.clearSearchResults()
                : this._searchQueryTimeout = setTimeout(() => this.searchFriend(val), 200)
        );
        }
        else{
            this.setState({ searchQuery: val })
        }
    };

    searchFriend(searchParam, appendResults = false) {
        this.props.getAllChats(this.props.user.userId,searchParam, (res) => {
            if (this.state.searchQuery === '') return;
            // const chatListRes =  this.props.chatList.filter(item => {
            //     if (item.isGroup) {
            //         return item.groupName
            //             ? item.groupName.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) > -1
            //             : (item.memberNameList.reduce((arr, name) => {
            //                 arr.push(name.split(' ')[0]);
            //                 return arr;
            //             }, []).join(', ') || '').toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) > -1;
            //     } else {
            //         return (item.name || '').toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) > -1
            //     }
            // });
            this.setState(prevState => {
                return {
                    searchResults: appendResults
                        ? [...prevState.searchResults, ...this._markSelectedFriend(prevState.selectionList, res.chats)]
                        : this._markSelectedFriend(prevState.selectionList, res.chats),
                    // pageNumber: res.data.friendList.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber,
                    // hasRemainingList: res.data.remainingList > 0,
                    isLoading: false,
                };
            });
        }, (er) => { })
        // this.props.getAllChats(this.props.user.userId,searchParam,(res)=>{
        //     console.log('\n\n\n getAllChat searchParam:', res)
        // },(er)=>{});
    }

    _markSelectedFriend(selectedList, newList) {
        selectedList.forEach(friend => {
            const idx = newList.findIndex(user => user.userId === friend.userId);
            if (idx > -1) newList[idx].isSelected = true;
        });
        return newList;
    }

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.isLoading === true || distanceFromEnd < 0) return;
        this.setState({ isLoading: true });
        this.searchFriend(this.state.searchQuery, true);
    }

    renderFooter = () => {
        return this.state.isLoading
            ? <View style={{ paddingVertical: 20, borderTopWidth: 1, borderColor: "#CED0CE" }}>
                <ActivityIndicator animating size="large" />
            </View>
            : null;
    }

    goToSelectedMediaPage = () => {
        Actions.push(PageKeys.SELECTED_MEDIA_VIEW, {
            receivers: this.state.selectionList, mediaIds: this.props.mediaIds, sendMessage: (...args) => {
                this.props.callbackFn(...args);
                this.onPressBackButton();
            }
        });
    }

    shareRide = () => {
        const idsObj = this.state.selectionList.reduce((idsObj, item) => {
            item.isGroup
                ? idsObj.groupIds.push(item.id)
                : idsObj.ids.push(item.id)
            return idsObj;
        }, { ids: [], groupIds: [] });
        this.props.callbackFn(this.props.rideId, idsObj.ids.length ? idsObj.ids : null, idsObj.groupIds.length ? idsObj.groupIds : null);
        this.onPressBackButton();
    }

    onPressBackButton = () => Actions.pop();

    onPressNewChatIcon = () => Actions.push(PageKeys.CHAT_SEARCH, {
        onDismiss: () => new Promise((resolve, reject) => {
            this.props.getAllChats(this.props.user.userId);
            resolve("done");
        })
    })

    clearSearchQuery = () => this.setState({ searchQuery: '', searchResults:[] });
    clearSearchResults = () => this.setState({ searchResults: [] });

    selectChat(chat) {
        if (this.state.selectionList.findIndex(item => item.id === chat.id) > -1) {
            this.removeFromSelected(chat.id);
        } else {
            if (chat.isGroup && !chat.groupName) {
                chat.groupName = chat.memberNameList.reduce((arr, name) => {
                    arr.push(name.split(' ')[0]);
                    return arr;
                }, []).join(', ').slice(0, 11);
            }
            this.setState(prevState => {
                return {
                    selectionList: [...prevState.selectionList, chat],
                }
            });
        }
    }

    removeFromSelected(id) {
        this.setState(prevState => {
            return {
                selectionList: prevState.selectionList.filter(chat => chat.id !== id)
            }
        });
    }

    getSelectedChatName(chat) {
        if (chat.isGroup && !chat.name) {
            return chat.memberNameList.reduce((arr, name) => {
                arr.push(name.split(' ')[0]);
                return arr;
            }, []).join(', ').slice(0, 11);
        } else {
            return chat.name;
        }
    }

    render() {
        console.log('\n\n\n searchQuery : ', this.state.searchQuery);
        const { chatList, hasNetwork, isShareMode, isSharingRide } = this.props;
        const { searchQuery, showSearchbar, selectionList, hasRemainingList, searchResults } = this.state;
        console.log('\n\n\n searchResults : ', searchResults);
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        return (
            <BasePage defaultHeader={false} showShifter={!isShareMode}>
                <View style={{ flex: 1 }}>
                    {
                        isShareMode
                            ? <BasicHeader title={'Share media'}
                                leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                                rightComponent={selectionList.length > 0 ? <LinkButton title={'Done'} titleStyle={{ color: '#fff', fontFamily: CUSTOM_FONTS.gothamBold, fontSize: 18 }} onPress={isSharingRide ? this.shareRide : this.goToSelectedMediaPage} /> : null}
                            />
                            : <BasicHeader title={'Messaging'}
                                leftIconProps={{ reverse: true, name: 'ios-notifications', type: 'Ionicons', onPress: () => Actions.push(PageKeys.NOTIFICATIONS) }}
                                rightIconProps={{ reverse: true, name: 'md-add', type: 'Ionicons', containerStyle: styles.headerRtIconContainer, style: styles.addIcon, onPress: this.onPressNewChatIcon }}
                                notificationCount={this.props.notificationCount}
                            />
                    }
                    <View style={styles.rootContainer}>
                        {/* {
                            showSearchbar && chatList.length > 0
                                ? <View style={{ minHeight: 50, borderBottomColor: '#707070', borderBottomWidth: 0.5, marginTop: 20 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}>
                                        <DefaultText style={{ color: APP_COMMON_STYLES.headerColor, fontSize: 14, fontFamily: CUSTOM_FONTS.robotoBold, marginRight: 10 }}>TO:</DefaultText>
                                        <View style={{ flex: 1, justifyContent: 'center', flexDirection: 'row' }}>
                                            <TextInput value={searchQuery} placeholder='Input name here' style={{ flex: 1 }} onChangeText={this.onChangeSearchValue} />
                                            {searchQuery.length > 0 && <IconButton iconProps={{ name: 'clear', type: 'MaterialIcons', style: { fontSize: 20 } }} onPress={this.clearSearchQuery} />}
                                        </View>
                                    </View>
                                    {
                                        selectionList
                                            ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 5, paddingTop: 5 }}>
                                                {
                                                    selectionList.map(chat => {
                                                        return <IconButton key={chat.id} onPress={() => this.removeFromSelected(chat.id)}
                                                            title={chat.name || chat.groupName}
                                                            titleStyle={{ color: '#fff', fontFamily: CUSTOM_FONTS.robotoBold, marginLeft: 2, }}
                                                            style={{ marginLeft: 3, marginBottom: 3, padding: 5, backgroundColor: APP_COMMON_STYLES.infoColor, borderRadius: 20 }}
                                                            iconProps={{ name: 'close', type: 'FontAwesome', style: { color: '#fff', fontSize: 14 } }} />
                                                    })
                                                }
                                            </View>
                                            : null
                                    }
                                </View>
                                : null
                        } */}
                        <View style={{flex:1}}>
                        <FlatList
                        contentContainerStyle={{ paddingBottom: hasRemainingList ? 40 : 0 }}
                            keyboardShouldPersistTaps={'handled'}
                            data={searchResults.length>0?searchResults: chatList.filter(item => {
                                if (item.isGroup) {
                                    console.log(item.isGroup,item.groupName,'////////item ')
                                    return item.groupName
                                        ? item.groupName.toLocaleLowerCase().indexOf(searchQuery.toLocaleLowerCase()) > -1
                                        : (item.memberNameList.reduce((arr, name) => {
                                            arr.push(name.split(' ')[0]);
                                            return arr;
                                        }, []).join(', ') || '').toLocaleLowerCase().indexOf(searchQuery.toLocaleLowerCase()) > -1;
                                } else {
                                    return (item.name || '').toLocaleLowerCase().indexOf(searchQuery.toLocaleLowerCase()) > -1
                                }
                            })
                        }
                            keyExtractor={this.chatListKeyExtractor}
                            renderItem={this.renderChatList}
                            extraData={selectionList}
                           ListFooterComponent={isShareMode?this.renderFooter:null}
                            onEndReached={isShareMode?this.loadMoreData:null}
                            onEndReachedThreshold={0.1}
                        />
                        {
                            this.props.hasNetwork === false && chatList.length === 0 && <View style={{ flexDirection: 'column', justifyContent: 'space-between', position: 'absolute', top: heightPercentageToDP(20), left: widthPercentageToDP(27), height: 100, }}>
                                <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                                <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                            </View>
                        }
                        </View>
                    </View>
                </View>
            </BasePage>
        )
    }
}

const mapStateToProps = (state) => {
    const { user, userAuthToken, deviceToken } = state.UserAuth;
    const { chatList } = state.ChatList;
    const { hasNetwork, lastApi } = state.PageState;
    const notificationCount=state.NotificationList.notificationList.totalUnseen
    return { user, chatList, userAuthToken, deviceToken, hasNetwork, lastApi ,notificationCount};
};
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        createFriendGroup: (newGroupInfo) => dispatch(createFriendGroup(newGroupInfo)),
        getAllChats: (userId, searchParams, successCallback, errorCallback) => dispatch(getAllChats(userId, searchParams, successCallback, errorCallback)),
        getChatListPic: (chatIdList) => getPictureList(chatIdList, (pictureObj) => {
            dispatch(updateChatPicAction({ pictureObj }))
        }, (error) => {
            console.log('getPictureList getChatListPic error :  ', error)
        }),
        getGroupMembersPic: (grpPicObj) => {
            const picIds = Object.keys(grpPicObj).reduce((list, id) => {
                list.push(...grpPicObj[id]);
                return list;
            }, []);
            getPictureList(picIds, (pictureObj) => {
                const grpChatPicObj = Object.keys(grpPicObj).reduce((obj, id) => {
                    obj[id] = [pictureObj[grpPicObj[id][0]], pictureObj[grpPicObj[id][1]]];
                    return obj;
                }, {});
                dispatch(updateGroupChatPicAction({ groupPicObj: grpChatPicObj }));
            }, (error) => {
                console.log('getGroupMembersPic error :  ', error);
            })
        },
        clearChatList: () => dispatch(clearChatListAction()),
        searchingOnChat: (searchParam, userId,  successCallback, errorCallback) => searchingOnChat(searchParam, userId).then(res => {
            console.log('searchingOnChat success : ', res.data)
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            successCallback(res)
        }).catch(er => {
            console.log('searchingOnChat error : ', er)
            errorCallback(er)
            handleServiceErrors(er, [searchParam, userId, pageNumber, successCallback, errorCallback], 'searchFriendsForChat', true, true);
        }),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(ChatList);

const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    headerRtIconContainer: {
        height: 27,
        width: 27,
        backgroundColor: '#F5891F',
        borderRadius: 13.5
    },
    addIcon: {
        color: '#fff',
        fontSize: 19
    },
    rootContainer: {
        flex: 1,
        marginTop: APP_COMMON_STYLES.headerHeight + 5,
        marginLeft: 0,
        backgroundColor: '#ffffff'
    },
    itemCont: {
        paddingBottom: 0,
        paddingTop: 0,
        paddingLeft: 0,
        height: 68
    },
    leftCont: {
        height: 68,
        paddingTop: 5,
        flexDirection: 'row'
    },
    rightCont: {
        height: 68,
        paddingTop: 10
    },
    bodyCont: {
        marginLeft: 5,
        height: 68,
        paddingTop: 5,
        flexDirection: 'column',
        flex: 1
    },
    backgroundImage: {
        height: null,
        width: null,
        flex: 1,
        alignItems: 'center',
        paddingTop: heightPercentageToDP(5)
    },
    thumbnail: {
        height: 52,
        width: 52,
        borderRadius: 26,
        alignSelf: 'center',
    },
    iconContComm: {
        marginHorizontal: 15,
        height: 48,
        width: 48,
        borderRadius: 24,
        alignSelf: 'center',
        backgroundColor: '#6C6C6B',
    },
    groupIconCont: {
        padding: 12
    },
    userIconCont: {
        paddingLeft: 12
    },
    iconComm: {
        color: '#ffffff',
        width: 32,
        height: 30,
        alignSelf: 'center',
    },
    messageNumber: {
        backgroundColor: APP_COMMON_STYLES.infoColor,
        height: 30,
        minWidth: 30,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },
    smallThumbanail: {
        height: 32,
        width: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ffffff',
        backgroundColor: '#6C6C6B'
    },
    smallThumbanailTop: {
        position: 'absolute',
        zIndex: 10,
        left: 17.5,
        top: 12,     
    },
    groupMembersTxt: { color: '#1D527C', fontSize: 13, fontFamily:CUSTOM_FONTS.robotoBold },
    msgTime: {
        color: '#8D8D8D',
        letterSpacing: 0.8,
        fontSize: 10,
        fontFamily: CUSTOM_FONTS.robotoSlabBold
    },
    itemNameTxt: {
        fontSize: 14,
        color: '#1D527C',
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    groupNameTxt: {
        flex: 1,
        marginRight: 10
    },
    itemMsgTxtView: { flex: 1, flexDirection: 'row' },
    itemMsgTxt: {
        marginTop: 5,
        marginRight: 5,
        color: '#1D527C',
        flex: 1
    }
});
