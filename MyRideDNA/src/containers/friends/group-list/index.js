import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, TouchableWithoutFeedback, Animated, Text, Alert, Keyboard, FlatList, View, ImageBackground, ActivityIndicator, Easing } from 'react-native';
import { IconButton, LinkButton } from '../../../components/buttons';
import { widthPercentageToDP, heightPercentageToDP, PageKeys, APP_COMMON_STYLES } from '../../../constants';
import { ListItem, Left, Thumbnail, Body, Right, Icon as NBIcon, CheckBox, Toast } from 'native-base';
import { ThumbnailCard } from '../../../components/cards';
import { createFriendGroup, getFriendGroups, addMembers, getAllGroupMembers, exitFriendGroup, getAllGroups } from '../../../api';
import { Actions } from 'react-native-router-flux';
import { BaseModal } from '../../../components/modal';

const CREATE_GROUP_WIDTH = widthPercentageToDP(9);
class GroupListTab extends Component {
    createSecAnim = new Animated.Value(CREATE_GROUP_WIDTH / 2);
    borderWidthAnim = new Animated.Value(0);
    createGrpInputRef = null;
    addMemberInputRef = null;
    isAddingGroup = false;
    defaultBtmOffset = widthPercentageToDP(8);
    constructor(props) {
        super(props);
        this.defaultBtmOffset = widthPercentageToDP(props.user.handDominance === 'left' ? 20 : 8);
        this.state = {
            selectedFriendList: [],
            isRefreshing: false,
            searchFriendList: [],
            newGroupName: null,
            kbdBtmOffset: this.defaultBtmOffset,
            isVisibleOptionsModal: false,
            selectedGroup: null,
            isLoading: false,
            isLoadingData: false,
            spinValue: new Animated.Value(0),
        };
    }

    componentDidMount() {
        // this.props.getFriendGroups(this.props.user.userId, true);
        this.props.getFriendGroups(this.props.user.userId, true, 0, (res) => {
        }, (err) => {
        });
    }

    adjustLayoutOnKeyboardVisibility = ({ endCoordinates }) => {
        this.setState({ kbdBtmOffset: endCoordinates.height });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.friendGroupList !== this.props.friendGroupList) {
            if (prevState.isRefreshing === true) {
                this.setState({ isRefreshing: false });
            }
            if (this.isAddingGroup) {
                /** TODO: Open group details page with last group added
                 *  this.props.friendGroupList[this.props.friendGroupList.length - 1]
                 **/
            }
        }
        // if (this.props.refreshContent === true && prevProps.refreshContent === false) {
        //     // this.props.getFriendGroups(this.props.user.userId, true);
        //     this.props.getFriendGroups(this.props.user.userId, true, 0, (res) => {
        //     }, (err) => {
        //     });
        // }
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
    onPullRefresh = () => {
        this.setState({ isRefreshing: true });
        // this.props.getFriendGroups(this.props.user.userId, false);
        this.props.getFriendGroups(this.props.user.userId, false, 0, (res) => {
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

    componentWillUnmount() {
    }

    onCancelOptionsModal = () => this.setState({ isVisibleOptionsModal: false, selectedGroup: null })

    openGroupInfo = (index) => {
        this.state.isVisibleOptionsModal && this.setState({ isVisibleOptionsModal: false });
        if (this.borderWidthAnim.__getValue() > 0) {
            this.closeCreateGroupSection(() => Actions.push(PageKeys.GROUP, { grpIndex: index }));
        } else {
            Actions.push(PageKeys.GROUP, { grpIndex: index });
        }
    }
    openChatPage = (index) => {
        const groupDetail = this.props.friendGroupList[index];
        groupDetail['isGroup'] = true
        groupDetail['id'] = groupDetail.groupId
        Actions.push(PageKeys.CHAT, { isGroup: true, chatInfo: groupDetail })
        this.setState({ isVisibleOptionsModal: false })
    }

    openCreateGroupSection = () => {
        if (this.borderWidthAnim.__getValue() > 0) {
            this.closeCreateGroupSection();
            return;
        }
        Animated.parallel([
            Animated.timing(this.createSecAnim, {
                toValue: widthPercentageToDP(65),
                duration: 300
            }),
            Animated.timing(this.borderWidthAnim, {
                toValue: 1,
                duration: 300
            })
        ]).start(() => {
            // this.addKeyboardListeners();
            this.setState({ newGroupName: '' });
            this.createGrpInputRef.focus();
        });
    }

    closeCreateGroupSection = (callback) => {
        Animated.parallel([
            Animated.timing(this.createSecAnim, {
                toValue: CREATE_GROUP_WIDTH / 2,
                duration: 300
            }),
            Animated.timing(this.borderWidthAnim, {
                toValue: 0,
                duration: 300
            })
        ]).start(() => {
            this.createGrpInputRef.clear();
            this.createGrpInputRef.blur();
            this.setState({ newGroupName: null });
            if (typeof callback === 'function') callback();
        });
    }

    showOptionsModal = (index) => {
        this.setState({ selectedGroup: this.props.friendGroupList[index], isVisibleOptionsModal: true });
    }

    renderMenuOptions = () => {
        if (this.state.selectedGroup === null) return;
        const index = this.props.friendGroupList.findIndex(item => item.groupId === this.state.selectedGroup.groupId);
        const options = [{ text: 'Open group', id: 'openGroup', handler: () => this.openGroupInfo(index) }, { text: 'Chat', id: 'openChat', handler: () => this.openChatPage(index) }, { text: 'Exit group', id: 'exitGroup', handler: () => this.showExitGroupConfirmation() }, { text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() }];
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

    showExitGroupConfirmation = () => {
        const { groupId, groupName } = this.state.selectedGroup;
        setTimeout(() => {
            Alert.alert(
                'Confirmation to exit group',
                `Are you sure to exit from ${groupName}?`,
                [
                    {
                        text: 'Yes', onPress: () => {
                            this.props.exitFriendGroup(groupId, this.props.user.userId);
                            this.onCancelOptionsModal();
                        }
                    },
                    { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                ],
                { cancelable: false }
            );
        }, 100);
    }

    renderGroup = ({ item, index }) => {
        return (
            // DOC: Removed native-base ListItem as TouchableNativeFeedback is not working in react-native 0.59.0
            <TouchableWithoutFeedback style={{ width: widthPercentageToDP(100), marginTop: 20 }} onLongPress={() => this.showOptionsModal(index)} onPress={() => this.openGroupInfo(index)}>
                <View style={{ flex: 1, flexDirection: 'row', height: heightPercentageToDP(10) }}>
                    <View style={{ width: widthPercentageToDP(15), alignItems: 'center', justifyContent: 'center' }}>
                        {
                            item.groupProfilePictureThumbnail
                                ? <Thumbnail source={{ uri: 'Image URL' }} />
                                : <NBIcon active name="group" type='FontAwesome' style={{ width: '50%', alignSelf: 'center' }} />
                        }
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' }}>
                        <Text>{item.groupName}</Text>
                    </View>
                    <View>
                        <Text note></Text>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    toggleFriendSelection = (index) => {
        let prevIndex = -1;
        this.setState(prevState => {
            prevIndex = prevState.selectedFriendList.findIndex(selFriend => prevState.searchFriendList[index].userId === selFriend.memberId);
            if (prevIndex === -1) {
                return {
                    selectedFriendList: [
                        ...prevState.selectedFriendList,
                        { memberId: prevState.searchFriendList[index].userId, isAdmin: false }
                    ]
                }
            } else {
                return {
                    selectedFriendList: [
                        ...prevState.selectedFriendList.slice(0, prevIndex),
                        ...prevState.selectedFriendList.slice(prevIndex + 1)
                    ]
                }
            }
        });
    }

    renderFriend = ({ item, index }) => {
        return (
            <ListItem avatar onPress={() => this.toggleFriendSelection(index)}>
                <Left style={{ alignItems: 'center', justifyContent: 'center' }}>
                    {
                        item.profilePictureThumbnail
                            ? <Thumbnail source={{ uri: 'Image URL' }} />
                            : <NBIcon active name="person" type='MaterialIcons' style={{ width: widthPercentageToDP(6), color: '#fff' }} />
                    }
                </Left>
                <Body>
                    <Text style={{ color: '#fff' }}>{item.name}</Text>
                    <Text style={{ color: '#fff' }} note></Text>
                </Body>
                <Right>
                    <CheckBox checked={this.state.selectedFriendList.findIndex(selFriend => selFriend.memberId === item.userId) > -1} />
                </Right>
            </ListItem>
        );
    }

    groupKeyExtractor = (item) => item.groupId;

    friendKeyExtractor = (item) => item.userId;

    memberKeyExtractor = (item) => item.memberId;

    onEnterGroupName = (val) => {
        this.setState({ newGroupName: val });
    }

    createGroup = () => {
        const { newGroupName } = this.state;
        this.closeCreateGroupSection(() => {
            if (newGroupName.trim().length === 0) {
                // Toast.show({
                //     text: 'Please provide a group name',
                //     buttonText: 'Okay'
                // });
            } else {
                this.isAddingGroup = true;
                this.props.createFriendGroup({
                    groupName: newGroupName,
                    createdBy: this.props.user.userId,
                    createdDate: new Date().toISOString(),
                });
            }
        });
    }

    loadMoreData = () => {
        if (this.state.isLoadingData && this.state.isLoading === false) {
            this.setState({ isLoading: true, isLoadingData: false })
            this.props.getFriendGroups(this.props.user.userId, false, this.props.pageNumber, (res) => {
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

    render() {
        const { newGroupName, isVisibleOptionsModal, isRefreshing } = this.state;
        const { friendGroupList, user, searchQuery } = this.props;
        const spinAnim = this.borderWidthAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '45deg']
        });
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        let filteredGroups = [];
        filteredGroups = searchQuery === '' ? friendGroupList : friendGroupList.filter(group => {
            return (group.groupName.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1)
        });
        return (
            <View style={styles.fill}>
                <BaseModal isVisible={isVisibleOptionsModal} onCancel={this.onCancelOptionsModal} onPressOutside={this.onCancelOptionsModal}>
                    <View style={[APP_COMMON_STYLES.menuOptContainer, user.handDominance === 'left' ? APP_COMMON_STYLES.leftDominantCont : null]}>
                        {
                            this.renderMenuOptions()
                        }
                    </View>
                </BaseModal>
                {
                    friendGroupList.length === 0
                        ?
                        this.props.hasNetwork === false
                            ?
                            <View style={{ flex: 1, position: 'absolute', top: heightPercentageToDP(30) }}>
                                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                    <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(15), flex: 1, marginLeft: widthPercentageToDP(40) } }} onPress={this.retryApiFunction} />
                                </Animated.View>
                                <Text style={{ marginLeft: widthPercentageToDP(13), fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</Text>
                                <Text style={{ marginTop: heightPercentageToDP(2), marginLeft: widthPercentageToDP(25) }}>Please connect to internet </Text>
                            </View>
                            :
                            <ImageBackground source={require('../../../assets/img/profile-bg.png')} style={styles.backgroundImage} />
                        : filteredGroups.length > 0
                            ?
                            <FlatList
                                data={filteredGroups}
                                refreshing={isRefreshing}
                                onRefresh={this.onPullRefresh}
                                keyExtractor={this.groupKeyExtractor}
                                renderItem={this.renderGroup}
                                extraData={this.state}
                                ListFooterComponent={this.renderFooter}
                                // onTouchMove={this.loadMoreData}
                                // onTouchStart={this.loadMoreData}
                                onEndReached={this.loadMoreData}
                                onEndReachedThreshold={0.1}
                                onMomentumScrollBegin={() => this.setState({ isLoadingData: true })}
                            />
                            :
                            this.props.hasNetwork ?
                                <ImageBackground source={require('../../../assets/img/profile-bg.png')} style={styles.backgroundImage}>
                                    <Text style={{ color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(6), fontWeight: 'bold', letterSpacing: 1 }}>{`No Groups found`}</Text>
                                </ImageBackground>
                                :
                                <View style={{ flex: 1, position: 'absolute', top: heightPercentageToDP(30) }}>
                                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                        <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(15), flex: 1, marginLeft: widthPercentageToDP(40) } }} onPress={this.retryApiFunction} />
                                    </Animated.View>
                                    <Text style={{ marginLeft: widthPercentageToDP(13), fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</Text>
                                    <Text style={{ marginTop: heightPercentageToDP(2), marginLeft: widthPercentageToDP(25) }}>Please connect to internet </Text>
                                </View>
                }
                {/* <Animated.View style={[styles.createGrpContainer, { bottom: this.state.kbdBtmOffset, width: this.createSecAnim }]}>
                    <Animated.View style={[styles.createGrpActionSec, { backgroundColor: newGroupName === null ? 'transparent' : '#fff', borderWidth: this.borderWidthAnim }]}>
                        {
                            !newGroupName || newGroupName.trim().length === 0
                                ? <Animated.View style={[styles.createGroupIcon, styles.createGrpChildSize, { transform: [{ rotate: spinAnim }] }]}>
                                    <IconButton iconProps={{ name: 'plus', type: 'Entypo', style: { color: '#fff' } }} onPress={this.openCreateGroupSection}
                                        style={{ flex: 1 }} />
                                </Animated.View>
                                : <IconButton iconProps={{ name: 'check', type: 'Entypo', style: { color: '#fff' } }} onPress={this.createGroup}
                                    style={[styles.createGroupIcon, styles.createGrpChildSize]} />
                        }
                        <TextInput ref={elRef => this.createGrpInputRef = elRef} style={{ flex: 1, marginLeft: 3 }} onChangeText={this.onEnterGroupName} onSubmitEditing={this.createGroup} />
                    </Animated.View>
                </Animated.View> */}
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { friendGroupList, currentGroup } = state.FriendGroupList;
    const { allFriends } = state.FriendList;
    const { pageNumber, hasNetwork } = state.PageState;
    return { user, friendGroupList, allFriends, currentGroup, pageNumber, hasNetwork };
};
const mapDispatchToProps = (dispatch) => {
    return {
        createFriendGroup: (newGroupInfo) => dispatch(createFriendGroup(newGroupInfo)),
        // getFriendGroups: (userId, toggleLoader) => dispatch(getFriendGroups(userId, toggleLoader)),
        getFriendGroups: (userId, toggleLoader, pageNumber, successCallback, errorCallback) => dispatch(getFriendGroups(userId, toggleLoader, pageNumber, successCallback, errorCallback)),
        exitFriendGroup: (groupId, memberId) => dispatch(exitFriendGroup(groupId, memberId)),
        addMembers: (groupId, memberDetails) => dispatch(addMembers(groupId, memberDetails)),
        getAllGroupMembers: (groupId, userId) => dispatch(getAllGroupMembers(groupId, userId)),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(GroupListTab);

const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    createGrpContainer: {
        position: 'absolute',
        // bottom: widthPercentageToDP(20),
        marginRight: widthPercentageToDP(20),
        marginLeft: widthPercentageToDP(12.5),
        width: 0,
    },
    createGrpActionSec: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    createGroupIcon: {
        marginLeft: -CREATE_GROUP_WIDTH / 2,
        backgroundColor: '#81BB41',
        justifyContent: 'center',
        alignItems: 'center'
    },
    createGrpChildSize: {
        width: CREATE_GROUP_WIDTH,
        height: CREATE_GROUP_WIDTH,
        borderRadius: CREATE_GROUP_WIDTH / 2,
    },
    memberList: {
        marginHorizontal: widthPercentageToDP(5),
        paddingTop: widthPercentageToDP(5)
    },
    backgroundImage: {
        height: null,
        width: null,
        flex: 1,
        alignItems: 'center',
        paddingTop: heightPercentageToDP(5)
    },
});


{/* <ListItem avatar>
                <Left>
                    {
                        item.groupProfilePictureThumbnail
                            ? < Thumbnail source={{ uri: 'Image URL' }} />
                            : <NBIcon active name="group" type='FontAwesome' />
                    }
                </Left>
                <Body>
                    <Text>{item.groupName}</Text>
                    <Text note></Text>
                </Body>
                <Right>
                    <Text note>3</Text>
                </Right>
            </ListItem> */}