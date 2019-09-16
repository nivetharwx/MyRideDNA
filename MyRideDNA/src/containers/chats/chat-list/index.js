import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, TextInput, Animated, Text, Alert, Keyboard, FlatList, View, ImageBackground, ActivityIndicator, StatusBar, AsyncStorage, Easing } from 'react-native';
import { IconButton, LinkButton } from '../../../components/buttons';
import { widthPercentageToDP, heightPercentageToDP, PageKeys, APP_COMMON_STYLES, IS_ANDROID } from '../../../constants';
import { ListItem, Left, Thumbnail, Body, Right, Icon as NBIcon, CheckBox, Toast, Item } from 'native-base';
import { BasicHeader } from '../../../components/headers';
import { ShifterButton } from '../../../components/buttons';
import { getAllChats, getPictureList, logoutUser } from '../../../api';
import { appNavMenuVisibilityAction, replaceChatListAction } from '../../../actions';
import { getFormattedDateFromISO } from '../../../util';
import { Actions } from 'react-native-router-flux';
import { BaseModal } from '../../../components/modal';
const THUMBNAIL_SIZE = IS_ANDROID ? heightPercentageToDP(9) : heightPercentageToDP(10.5);
const CREATE_GROUP_WIDTH = widthPercentageToDP(9);
class ChatList extends Component {
    CHAT_LIST_OPTIONS = [{ text: 'Delete Chat', id: 'clearAll', handler: () => this.deleteFromChatList() }, { text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() }];
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
        this.props.getAllChats(this.props.user.userId);
    }



    componentDidUpdate(prevProps, prevState) {
        if (prevProps.chatList !== this.props.chatList) {
            const chatIdList = [];
            this.props.chatList.forEach((chatListPic) => {
                if (!chatListPic.profilePicture && chatListPic.profilePictureId) {
                    chatIdList.push(chatListPic.profilePictureId);
                }
            })
            if (chatIdList.length > 0) {
                this.props.getChatListPic(chatIdList)
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

    getDate = (item) => {
        const itemDate = new Date(item.message.date).toString().substr(4, 12).split(' ')[1];
        if (new Date().getDate() == itemDate) {
            return new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        else if ((new Date().getDate() - itemDate) === 1) {
            return 'yesterday'
        }
        else {
            return new Date(item.date).toLocaleDateString()
        }

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

    renderChatLIst = ({ item, index }) => {
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
            <ListItem avatar style={{}} onPress={() => this.goToChatPage(item)}>
                {
                    item.isGroup ?
                        <Left style={{ alignItems: 'center', justifyContent: 'center', height: heightPercentageToDP(12) }}>
                            {/* <NBIcon active name="group" type='FontAwesome' style={{marginLeft:widthPercentageToDP(2), width: widthPercentageToDP(13), fontSize:heightPercentageToDP(6) }} /> */}
                            <View style={styles.groupIconStyle}>
                                <IconButton iconProps={{ name: 'users', type: 'FontAwesome', style: { color: 'white', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(5), marginLeft: widthPercentageToDP(3.5), marginTop: heightPercentageToDP(2) } }} />
                            </View>
                        </Left>
                        :

                        <Left style={{ alignItems: 'center', justifyContent: 'center' }}>
                            {item.profilePicture ?
                                <Thumbnail style={styles.thumbnail} source={{ uri: item.profilePicture }} />
                                :
                                <View style={styles.groupIconStyle}>
                                    <IconButton iconProps={{ name: 'user', type: 'FontAwesome', style: { color: 'white', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(6), marginLeft: widthPercentageToDP(6), marginTop: heightPercentageToDP(1) } }} />
                                </View>
                            }
                        </Left>
                }
                <Body style={{ height: heightPercentageToDP(12) }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontSize: heightPercentageToDP(3), fontWeight: 'bold' }}>{item.isGroup ? item.groupName : item.name}</Text>
                        <Text>  </Text>
                        <Text style={{ fontSize: heightPercentageToDP(3), fontWeight: 'bold' }}>{item.nickname ? item.nickname : null}</Text>
                    </View>
                    {/* <Text style={{ marginTop: heightPercentageToDP(1) }}>{item.messageList.length > 0 ? item.messageList[item.messageList.length - 1].content.length > 25 ? item.messageList[item.messageList.length - 1].content.substring(0, 26) + '...' : item.messageList[item.messageList.length - 1].content : null}</Text> */}
                    <Text style={{ marginTop: heightPercentageToDP(1) }}>{item.message ? item.message.content.length > 25 ? item.message.content.substring(0, 26) + '...' : item.message.content : null}</Text>
                </Body>
                <Right style={{ height: heightPercentageToDP(12) }}>
                    <Text style={{ marginTop: heightPercentageToDP(0.7) }}>{item.message ? this.getDate(item) : null}</Text>
                    {
                        item.totalUnseenMessage > 0 ?
                            <View style={styles.messageNumber}>
                                <Text style={{ alignSelf: 'center', color: '#FFFFFF', fontSize: heightPercentageToDP(2) }}>{item.totalUnseenMessage}</Text>
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
                    <StatusBar translucent backgroundColor='black' barStyle="light-content" />
                </View>
                <View style={{ flex: 1 }}>
                    <BasicHeader title='Chat' rightIconProps={{ name: 'md-exit', type: 'Ionicons', style: { fontSize: widthPercentageToDP(8), color: '#fff' }, onPress: this.onPressLogout }} />
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
                                    renderItem={this.renderChatLIst}
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
            dispatch(replaceChatListAction({ pictureObj }))
        }, (error) => {
            console.log('getPictureList getChatListPic error :  ', error)
        }),
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
        marginTop: heightPercentageToDP(8),
        marginLeft: 0
    },

    backgroundImage: {
        height: null,
        width: null,
        flex: 1,
        alignItems: 'center',
        paddingTop: heightPercentageToDP(5)
    },
    thumbnail: {
        height: THUMBNAIL_SIZE,
        width: THUMBNAIL_SIZE,
        borderRadius: THUMBNAIL_SIZE / 2,
        alignSelf: 'center',
    },
    groupIconStyle: {
        height: THUMBNAIL_SIZE,
        width: THUMBNAIL_SIZE,
        borderRadius: THUMBNAIL_SIZE / 2,
        backgroundColor: '#6C6C6B',
    },
    messageNumber: {
        backgroundColor: APP_COMMON_STYLES.infoColor,
        marginRight: widthPercentageToDP(8),
        marginTop: heightPercentageToDP(1.4),
        height: heightPercentageToDP(3),
        minWidth: widthPercentageToDP(5),
        borderRadius: widthPercentageToDP(5)
    }
});
