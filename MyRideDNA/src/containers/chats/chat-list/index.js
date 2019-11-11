import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, TextInput, Animated, Text, Alert, Keyboard, FlatList, View, ImageBackground, ActivityIndicator, StatusBar, Easing } from 'react-native';
import { IconButton, LinkButton } from '../../../components/buttons';
import { widthPercentageToDP, heightPercentageToDP, PageKeys, APP_COMMON_STYLES, IS_ANDROID } from '../../../constants';
import { ListItem, Left, Thumbnail, Body, Right, Icon as NBIcon, CheckBox, Toast, Item } from 'native-base';
import { BasicHeader } from '../../../components/headers';
import { ShifterButton } from '../../../components/buttons';
import { getAllChats, getPictureList, logoutUser } from '../../../api';
import { appNavMenuVisibilityAction, updateChatPicAction, updateGroupChatPicAction } from '../../../actions';
import { getFormattedDateFromISO } from '../../../util';
import { Actions } from 'react-native-router-flux';
import { BaseModal } from '../../../components/modal';
const THUMBNAIL_SIZE = IS_ANDROID ? heightPercentageToDP(9) : heightPercentageToDP(10.5);
const CREATE_GROUP_WIDTH = widthPercentageToDP(9);
class ChatList extends Component {
    CHAT_LIST_OPTIONS = [{ text: 'Delete Chat', id: 'clearAll', handler: () => this.deleteFromChatList() }, { text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() }];
    frndChatPicLoading = false;
    grpChatPicLoading = false;
    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            isLoading: false,
            isLoadingData: false,
            isVisibleOptionsModal: false,
            spinValue: new Animated.Value(0),
        };
    }

    componentDidMount() {
        this.grpChatPicLoading = false;
        this.frndChatPicLoading = false;
        this.props.getAllChats(this.props.user.userId);
    }



    componentDidUpdate(prevProps, prevState) {
        if (prevProps.chatList !== this.props.chatList) {
            const chatIdList = [];
            const grpPicObj = {};
            this.props.chatList.forEach((chat) => {
                if (!chat.profilePicture || (chat.isGroup && !chat.profilePictureList)) {
                    if (chat.isGroup) {
                        if (chat.groupProfilePictureId) {
                            chatIdList.push(chat.groupProfilePictureId);
                        } else if (chat.profilePictureIdList) {
                            grpPicObj[chat.id] = chat.profilePictureIdList;
                        }
                    } else if (chat.profilePictureId) {
                        chatIdList.push(chat.profilePictureId);
                    }
                }
            })
            if (chatIdList.length > 0 && !this.frndChatPicLoading) {
                this.frndChatPicLoading = true;
                this.props.getChatListPic(chatIdList);
            }
            if (Object.keys(grpPicObj).length > 0 && !this.grpChatPicLoading) {
                this.grpChatPicLoading = true;
                this.props.getGroupMembersPic(grpPicObj);
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
                this.props.getAllChats(this.props.user.userId);
            }
        });

    }

    onPressLogout = async () => {
        this.props.logoutUser(this.props.user.userId, this.props.userAuthToken, this.props.deviceToken);
    }


    componentWillUnmount() {
    }

    deleteFromChatList = () => {

    }

    getFormattedDate = (item) => {
        console.log('newDate chatList : ', new Date(item.date).toTimeString());
        const itemDate = new Date(item.message.date).toString().substr(4, 12).split(' ')[1];
        if (new Date().getDate() == itemDate) {
            return new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        else if ((new Date().getDate() - itemDate) === 1) {
            return 'yesterday'
        }
        else {
            return new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', year: '2-digit', month: 'short' })
        }

    }

    getFormattedTime = (dateTime) => {
        const time = new Date(dateTime).toTimeString().substring(0, 5).split(':');
        let period = time[0] < 12 ? 'AM' : 'PM';
        if (time[0] > 12) {
            time[0] = time[0] - 12;
        }
        return `${time.join(':')} ${period}`;
        // return new Date(dateTime).toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
    }
    showAppNavigation = () => this.props.showAppNavMenu();
    goToChatPage = (item) => {
        if (item.isGroup) {
            Actions.push(PageKeys.CHAT, { comingFrom: PageKeys.CHAT_LIST, isGroup: true, chatInfo: item })
        }
        else {
            Actions.push(PageKeys.CHAT, { comingFrom: PageKeys.CHAT_LIST, isGroup: false, chatInfo: item })
        }
    }

    renderGroupName = (item) => {
        const groupNameLength = item.groupName.length;
        if (groupNameLength > 26) return <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1D527C' }}>{item.groupName.substring(0, 17) + '...'}</Text>;
        else {
            const spacesLeft = 26 - groupNameLength - 6;
            const firstNameStr = item.memberNameList.reduce((arr, name) => {
                arr.push(name.split(' ')[0]);
                return arr;
            }, []).join(',');
            return firstNameStr.length > spacesLeft
                ? <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1D527C' }}>{item.groupName}
                    <Text style={{ color: '#585756', fontSize: 13 }}>{`  (${firstNameStr.substring(0, spacesLeft)}...)`}</Text>
                </Text>
                : <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1D527C' }}>{item.groupName}
                    {
                        firstNameStr ? <Text style={{ color: '#585756', fontSize: 13 }}>{`  (${firstNameStr})`}</Text> : null
                    }
                </Text>
        }
    }

    renderChatList = ({ item, index }) => {
        // if (item.isGroup) {
        //     return (
        //         <ListItem style={{ marginTop: 20 }} avatar onLongPress={() => console.log('onLongPressChatList')} onPress={() => console.log('onPressChatLIst')}>
        //             <Left style={{ alignItems: 'center', justifyContent: 'center' }}>
        //                 <Thumbnail style={styles.thumbnail} source={require('../../../assets/img/friend-profile-pic.png')} />
        //             </Left>
        //             <Body>

        //             </Body>
        //             <Right>
        //             </Right>
        //         </ListItem>
        //     );
        // }
        return (
            // <ListItem avatar style={{}} onPress={() => this.goToChatPage(item)} onLongPress={()=>this.showOptionsModal()}>
            <ListItem noIndent style={styles.itemCont} onPress={() => this.goToChatPage(item)}>
                {
                    item.isGroup
                        ? <Left style={styles.leftCont}>
                            {
                                item.profilePicture
                                    ? <Thumbnail style={styles.iconContComm} source={{ uri: item.profilePicture }} />
                                    : item.profilePictureList
                                        ? <View style={[styles.iconContComm, { backgroundColor: '#ffffff' }]}>
                                            <Thumbnail style={{ height: 38, width: 38, borderRadius: 19, borderWidth: 1, borderColor: '#ffffff' }} source={{ uri: item.profilePictureList[0] }} />
                                            <Thumbnail style={{ height: 38, width: 38, borderRadius: 19, borderWidth: 1, borderColor: '#ffffff', position: 'absolute', zIndex: 10, left: 17.5, top: 15 }} source={{ uri: item.profilePictureList[1] }} />
                                        </View>
                                        : <IconButton disabled style={[styles.iconContComm, styles.groupIconCont]} iconProps={{ name: 'users', type: 'FontAwesome', style: styles.iconComm }} />
                            }
                            <View style={styles.bodyCont}>
                                {
                                    item.isGroup
                                        ? this.renderGroupName(item)
                                        : <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1D527C' }}>{item.name}</Text>
                                }
                                <Text style={{ fontSize: 12, marginTop: 5, color: '#585756' }}>{item.message ? item.message.content.length > 25 ? item.message.content.substring(0, 26) + '...' : item.message.content : null}</Text>
                            </View>
                        </Left>
                        : <Left style={styles.leftCont}>
                            {
                                item.profilePicture
                                    ? <Thumbnail style={styles.iconContComm} source={{ uri: item.profilePicture }} />
                                    : <IconButton disabled style={[styles.iconContComm, styles.userIconCont]} iconProps={{ name: 'user', type: 'FontAwesome', style: styles.iconComm }} />
                            }
                            <View style={styles.bodyCont}>
                                {
                                    item.isGroup
                                        ? this.renderGroupName(item)
                                        : <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1D527C' }}>{item.name}</Text>
                                }
                                <Text style={{ fontSize: 12, marginTop: 5, color: '#585756' }}>{item.message ? item.message.content.length > 25 ? item.message.content.substring(0, 26) + '...' : item.message.content : null}</Text>
                            </View>
                        </Left>
                }
                <Right style={styles.rightCont}>
                    <Text style={{ color: '#8D8D8D', letterSpacing: 0.8 }}>{item.message ? this.getFormattedTime(item.message.date) : null}</Text>
                    {
                        item.totalUnseenMessage > 0 ?
                            <View style={styles.messageNumber}>
                                <Text style={{ alignSelf: 'center', color: '#FFFFFF', fontSize: heightPercentageToDP(2) }}>{item.totalUnseenMessage > 99 ? '99+' : item.totalUnseenMessage}</Text>
                            </View>
                            : null}
                </Right>
            </ListItem>
        );

    }


    chatListKeyExtractor = (item) => item.id;

    onCancelOptionsModal = () => this.setState({ isVisibleOptionsModal: false })
    renderMenuOptions = () => {
        let options = null;
        options = this.CHAT_LIST_OPTIONS;
        return (
            options.map(option => (
                <LinkButton
                    key={option.id}
                    onPress={option.handler}
                    highlightColor={APP_COMMON_STYLES.infoColor}
                    style={APP_COMMON_STYLES.menuOptHighlight}
                    title={option.text}
                    titleStyle={APP_COMMON_STYLES.menuOptTxt}
                />
            ))
        )
    }

    showOptionsModal = () => {
        this.setState({ isVisibleOptionsModal: true });
    }

    render() {
        const { chatList, user, hasNetwork } = this.props;
        const { isVisibleOptionsModal } = this.state;
        return (
            <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={{ flex: 1 }}>
                    <BasicHeader title='Messaging' />
                    <BaseModal isVisible={isVisibleOptionsModal} onCancel={this.onCancelOptionsModal} onPressOutside={this.onCancelOptionsModal}>
                        <View style={[APP_COMMON_STYLES.menuOptContainer, user.handDominance === 'left' ? APP_COMMON_STYLES.leftDominantCont : null]}>
                            {
                                this.renderMenuOptions()
                            }
                        </View>
                    </BaseModal>
                    <View style={styles.rootContainer}>
                        {
                            chatList.length > 0 ?
                                <FlatList
                                    data={chatList}
                                    keyExtractor={this.chatListKeyExtractor}
                                    renderItem={this.renderChatList}
                                />
                                :
                                hasNetwork ?
                                    <ImageBackground source={require('../../../assets/img/profile-bg.png')} style={styles.backgroundImage} />
                                    :
                                    <View style={{ flex: 1, position: 'absolute', top: heightPercentageToDP(30) }}>
                                        <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                            <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(15), flex: 1, marginLeft: widthPercentageToDP(40) } }} onPress={this.retryApiFunction} />
                                        </Animated.View>
                                        <Text style={{ marginLeft: widthPercentageToDP(13), fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</Text>
                                        <Text style={{ marginTop: heightPercentageToDP(2), marginLeft: widthPercentageToDP(25) }}>Please connect to internet </Text>
                                    </View>
                        }
                    </View>

                    <ShifterButton onPress={this.showAppNavigation} containerStyles={this.props.hasNetwork === false ? { bottom: heightPercentageToDP(8.5) } : null} alignLeft={this.props.user.handDominance === 'left'} />

                </View>
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    const { user, userAuthToken, deviceToken } = state.UserAuth;
    const { chatList } = state.ChatList;
    const { hasNetwork, lastApi } = state.PageState;
    return { user, chatList, userAuthToken, deviceToken, hasNetwork, lastApi };
};
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        createFriendGroup: (newGroupInfo) => dispatch(createFriendGroup(newGroupInfo)),
        getAllChats: (userId) => dispatch(getAllChats(userId)),
        getChatListPic: (chatIdList) => getPictureList(chatIdList, (pictureObj) => {
            console.log('getPictureList getChatListPic sucess :', pictureObj)
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
        logoutUser: (userId, accessToken, deviceToken) => dispatch(logoutUser(userId, accessToken, deviceToken)),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(ChatList);

const styles = StyleSheet.create({
    fill: {
        flex: 1
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
        height: 68,
        paddingTop: 5,
        flexDirection: 'column',
        flex: 1,
        marginLeft: 5
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
        height: 52,
        width: 52,
        maxWidth: 52,
        borderRadius: 26,
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
        // marginRight: widthPercentageToDP(8),
        // marginTop: heightPercentageToDP(1.4),
        height: 30,
        minWidth: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
