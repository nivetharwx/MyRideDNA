import React, { Component } from 'react';
import { View, FlatList, ScrollView, StatusBar, Alert, Keyboard, Animated, TextInput, Text, ActivityIndicator, Easing } from 'react-native';
import { connect } from 'react-redux';
import styles, { CREATE_GROUP_WIDTH } from './styles';
import { BasicHeader } from '../../../components/headers';
import { Actions } from 'react-native-router-flux';
import { getGroupInfoAction, resetCurrentGroupAction, updateMemberAction, setCurrentFriendAction } from '../../../actions';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, IS_ANDROID, WindowDimensions, PageKeys, FRIEND_TYPE, RELATIONSHIP, CUSTOM_FONTS } from '../../../constants';
import { IconButton, LinkButton, ImageButton } from '../../../components/buttons';
import { addMembers, getAllGroupMembers, dismissMemberAsAdmin, makeMemberAsAdmin, removeMember, getPicture, getPictureList, readNotification, getGroupMembers } from '../../../api';
import { ThumbnailCard, HorizontalCard } from '../../../components/cards';
import { BaseModal } from '../../../components/modal';
import { Icon as NBIcon, ListItem, Left, Thumbnail, Body, Right, CheckBox } from 'native-base';
import { LabeledInput, LabeledInputPlaceholder, SearchBoxFilter } from '../../../components/inputs';
import { Loader } from '../../../components/loader';
import { DefaultText } from '../../../components/labels';

const FILTERED_ACTION_IDS = {
    BTN_ALL_MEMBERS: 'btn_all_members',
    LOCATION_ENABLE_MEMBERS: 'location-enable-members',
    LOCATION_ENABLE: 'location-enable',
};

class Group extends Component {
    floatSecAnim = new Animated.Value(CREATE_GROUP_WIDTH / 2);
    borderWidthAnim = new Animated.Value(0);
    addMemberInputRef = null; l
    defaultBtmOffset = widthPercentageToDP(8);
    constructor(props) {
        super(props);
        this.state = {
            isActiveSearch: false,
            selectedFriendList: [],
            searchFriendList: [],
            kbdBtmOffset: this.defaultBtmOffset,
            isVisibleOptionsModal: false,
            isVisibleSearchModal: false,
            selectedMember: null,
            isVisibleAddMemberModal: false,
            addMemberToGroup: '',
            searchName: '',
            isLoading: false,
            isLoadingData: false,
            filteredFriends: null,
            spinValue: new Animated.Value(0),
            searchQuery: '',
            friendsFilter: FILTERED_ACTION_IDS.BTN_ALL_MEMBERS,
            isFilter: null,
            filteredMembers: []
        };
    }

    componentDidMount() {
        if (this.props.comingFrom === PageKeys.NOTIFICATIONS) {
            this.props.getGroupMembers(JSON.parse(this.props.notificationBody.reference).groupId, this.props.notificationBody.notifiedUserId, JSON.parse(this.props.notificationBody.reference).groupName, true, 0, (res) => {
            }, (err) => {
            });
        }
        else if (this.props.comingFrom === 'notificationPage') {
            this.props.getGroupMembers(this.props.notificationBody.reference.groupId, this.props.notificationBody.notifiedUserId, this.props.notificationBody.reference.groupName, true, 0, (res) => {
            }, (err) => {
            });
            this.props.readNotification(this.props.notificationBody.notifiedUserId, this.props.notificationBody.id);
        }
        else {
            this.props.getGroupMembers(this.props.friendGroupList[this.props.grpIndex].groupId, this.props.user.userId, this.props.friendGroupList[this.props.grpIndex].groupName, true, 0, (res) => {
            }, (err) => {
            });
        }
        Keyboard.addListener('keyboardDidShow', this.adjustLayoutOnKeyboardVisibility);
        Keyboard.addListener('keyboardDidHide', this.adjustLayoutOnKeyboardVisibility);
    }

    adjustLayoutOnKeyboardVisibility = (e) => {
        if (!e) return;
        this.setState(prevState => ({ kbdBtmOffset: prevState.kbdBtmOffset === this.defaultBtmOffset ? e.endCoordinates.height : this.defaultBtmOffset }));
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.currentGroup.groupMembers !== this.props.currentGroup.groupMembers) {
            const groupMemberIdList = [];
            this.props.currentGroup.groupMembers.forEach(picture => {
                if (!picture.profilePicture && picture.profilePictureId) {
                    groupMemberIdList.push(picture.profilePictureId);
                }
            })
            if (groupMemberIdList.length > 0) {
                this.props.getGroupMemberPicture(groupMemberIdList)
            }
            setTimeout(() => {
                this.state.filteredFriends = this.props.allFriends.filter(friend => this.props.currentGroup.groupMembers.findIndex(member => member.memberId === friend.userId) === -1);
            }, 0);
        }
    }

    componentWillUnmount() {
        this.props.resetCurrentGroup();
        // DOC: Remove all keyboard event listeners
        Keyboard.removeListener('keyboardDidShow', this.adjustLayoutOnKeyboardVisibility);
        Keyboard.removeListener('keyboardDidHide', this.adjustLayoutOnKeyboardVisibility);
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

    onPressBackButton = () => {
        Keyboard.dismiss();
        Actions.pop();
    }

    openSearchFriendSection = () => {
        if (this.borderWidthAnim.__getValue() > 0) {
            this.closeSearchFriendSection();
            return;
        }
        Animated.parallel([
            Animated.timing(this.floatSecAnim, {
                toValue: widthPercentageToDP(65),
                duration: 300
            }),
            Animated.timing(this.borderWidthAnim, {
                toValue: 1,
                duration: 300
            })
        ]).start(() => {
            this.addMemberInputRef.focus();
            this.setState({
                isVisibleSearchModal: true, isActiveSearch: true,
                searchFriendList: this.state.filteredFriends
            });
        });
    }

    closeSearchFriendSection = (callback) => {
        Animated.parallel([
            Animated.timing(this.floatSecAnim, {
                toValue: CREATE_GROUP_WIDTH / 2,
                duration: 300
            }),
            Animated.timing(this.borderWidthAnim, {
                toValue: 0,
                duration: 300
            })
        ]).start(() => {
            this.addMemberInputRef.clear();
            this.addMemberInputRef.blur();
            this.setState({ isVisibleSearchModal: false, isActiveSearch: false }, () => {
                if (typeof callback === 'function') {
                    callback();
                    return;
                }
            });
        });
    }

    searchForFriend = (value) => {
        this.setState({ searchName: value }, () => {
            value = value.trim();
            this.setState(prevState => ({ searchFriendList: this.state.filteredFriends.filter(friend => friend.name.toLowerCase().includes(value.toLowerCase())) }));
        });
    }

    addFriendsToGroup = () => {
        this.props.addMembers(this.props.currentGroup.groupId, {
            joinedDate: new Date().toISOString(),
            joinedBy: this.props.user.userId,
            groupMembers: this.state.selectedFriendList
        });
        this.setState({ searchFriendList: [], selectedFriendList: [], isVisibleSearchModal: false });
    }

    onCancelOptionsModal = () => {
        this.setState({ isVisibleOptionsModal: false, selectedMember: null });
    }

    onCancelSearchModal = () => {
        this.setState({ isVisibleSearchModal: false, selectedFriendList: [] }, () => {
            if (this.borderWidthAnim.__getValue() > 0) {
                this.closeSearchFriendSection();
            }
        });
    }

    memberKeyExtractor = (item) => item.memberId;

    friendKeyExtractor = (item) => item.userId;

    showOptionsModal = (index) => {
        if (this.props.currentGroup.groupMembers[index].name === 'You') return;
        this.setState({ selectedMember: this.props.currentGroup.groupMembers[index], isVisibleOptionsModal: true });
    }

    assignAdminRole = () => {
        this.props.makeMemberAsAdmin(this.props.currentGroup.groupId, this.state.selectedMember.memberId);
        this.onCancelOptionsModal();
    }

    rollbackAdminRole = () => {
        this.props.dismissMemberAsAdmin(this.props.currentGroup.groupId, this.state.selectedMember.memberId);
        this.onCancelOptionsModal();
    }

    removeMemberConfirmation(member) {
        member = member || this.state.selectedMember;
        Alert.alert(
            'Confirmation to remove',
            `Are you sure to remove ${member.name}?`,
            [
                {
                    text: 'Yes', onPress: () => {
                        this.props.removeMember(this.props.currentGroup.groupId, member.memberId);
                        this.onCancelOptionsModal();
                    }
                },
                { text: 'Cancel', onPress: () => { }, style: 'cancel' },
            ],
            { cancelable: false }
        );
    }

    onChangeSearchValue = (val) => { this.setState({ searchQuery: val }) }

    renderMenuOptions = () => {
        const { selectedMember } = this.state;
        const userInfo = this.props.currentGroup.groupMembers[0];
        const options = [
            { text: 'Open profile', id: 'profile', handler: () => { this.openProfile(selectedMember.memberId) } },
            { text: `Chat with ${selectedMember.name}`, id: 'chat', handler: () => { this.openChatPage(selectedMember) } },
        ];
        if (userInfo.isAdmin) {
            options.push(...[
                { text: `Remove ${selectedMember.name}`, id: 'remove', handler: () => this.removeMemberConfirmation() },
                selectedMember.isAdmin
                    ? { text: 'Dismiss admin', id: 'dismissAdmin', handler: () => this.rollbackAdminRole() }
                    : { text: 'Make group admin', id: 'assignAdmin', handler: () => this.assignAdminRole() }
            ]);
        }
        options.push({ text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() });
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

    openChatPage = (info, isGroup) => {
        if (isGroup) {
            const { groupMembers, ...otherDetails } = this.props.currentGroup;
            otherDetails['isGroup'] = true;
            otherDetails['id'] = otherDetails.groupId;
            info = otherDetails;
        } else {
            info['isGroup'] = false;
            info['id'] = info.memberId;
        }
        Actions.push(PageKeys.CHAT, { isGroup: true, chatInfo: info });
        this.setState({ isVisibleOptionsModal: false });
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
                    <DefaultText style={{ color: '#fff' }}>{item.name}</DefaultText>
                    <DefaultText style={{ color: '#fff' }} note></DefaultText>
                </Body>
                <Right>
                    <CheckBox checked={this.state.selectedFriendList.findIndex(selFriend => selFriend.memberId === item.userId) > -1} />
                </Right>
            </ListItem>
        );
    }

    onPressAddMember = () => {
        this.setState({ isVisibleSearchModal: true });

    }

    openFriendsProfileTab = (item, index) => {
        this.setState({ isVisibleOptionsModal: false, selectedMember: null });
        if (index === 0) {
            Actions.push(PageKeys.PROFILE);
        }
        else {
            this.props.setCurrentFriend({ userId: item.memberId });
            Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: item.memberId, isUnknown: !item.isFriend });
        }
    }

    loadMoreData = () => {
        if (this.state.isLoadingData && this.state.isLoading === false) {
            this.setState({ isLoading: true, isLoadingData: false })
            this.props.getGroupMembers(this.props.currentGroup.groupId, this.props.currentGroup.userId, this.props.currentGroup.groupName, false, this.props.pageNumber, (res) => {
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

    filterLocationEnableMembers = () => {
        if (this.state.isFilter === FILTERED_ACTION_IDS.LOCATION_ENABLE) {
            this.setState({ friendsFilter: FILTERED_ACTION_IDS.BTN_ALL_MEMBERS, isFilter: null })
        }
        else {
            this.setState({ friendsFilter: FILTERED_ACTION_IDS.LOCATION_ENABLE_MEMBERS, isFilter: FILTERED_ACTION_IDS.LOCATION_ENABLE })
        }
    }

    render() {
        const { kbdBtmOffset, isActiveSearch, selectedMember, selectedFriendList, searchFriendList, isVisibleOptionsModal, isVisibleSearchModal, searchName, searchQuery, friendsFilter } = this.state;
        const { user, currentGroup, friendGroupList, friendsLocationList } = this.props;
        const spinAnim = this.borderWidthAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '45deg']
        });
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });

        if (friendsFilter === FILTERED_ACTION_IDS.BTN_ALL_MEMBERS) {
            this.state.filteredMembers = searchQuery === '' ? currentGroup.groupMembers : currentGroup.groupMembers.filter(member => {
                return (member.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 ||
                    (member.nickname ? member.nickname.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 : false))
            });
        }
        else if (friendsFilter === FILTERED_ACTION_IDS.LOCATION_ENABLE_MEMBERS) {
            const locationEnabledMembers = currentGroup.groupMembers.filter(member => member.locationEnable);
            this.state.filteredMembers = searchQuery === '' ? locationEnabledMembers : locationEnabledMembers.filter(member => {
                return (member.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 ||
                    (member.nickname ? friend.nickname.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 : false))
            });
        }

        return currentGroup === null
            ? <View style={styles.fill} />
            : <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={styles.fill}>
                    <BasicHeader
                        searchbarMode={isVisibleSearchModal}
                        searchValue={searchName}
                        onChangeSearchValue={this.searchForFriend} onCancelSearchMode={() => this.setState({ searchName: '', isVisibleSearchModal: false })}
                        onClearSearchValue={() => this.setState({ searchName: '' })}
                        title={<Text style={{ fontFamily: CUSTOM_FONTS.robotoBold }}>{this.props.comingFrom === 'notificationPage' ? this.props.notificationBody.reference.groupName + '\n' : currentGroup.groupName ? currentGroup.groupName + `\n` : '\n'}<Text style={{ fontSize: 14, fontFamily: CUSTOM_FONTS.robotoBold }}>Members: {currentGroup.groupMembers.length ? currentGroup.groupMembers.length : ''}</Text></Text>}
                        leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                        thumbnail={{ picture: currentGroup.profilePicture ? currentGroup.profilePicture : null }}
                    />
                    <BaseModal isVisible={isVisibleOptionsModal} onCancel={this.onCancelOptionsModal} onPressOutside={this.onCancelOptionsModal}>
                        <View style={[APP_COMMON_STYLES.menuOptContainer, user.handDominance === 'left' ? APP_COMMON_STYLES.leftDominantCont : null]}>
                            {
                                selectedMember
                                    ? this.renderMenuOptions()
                                    : null
                            }
                        </View>
                    </BaseModal>
                    {
                        isVisibleSearchModal
                            ? <View style={styles.searchMemberModal}>
                                <View style={{ flex: 1 }}>
                                    {
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <IconButton iconProps={{ name: 'close', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(8), color: 'white' } }} onPress={this.onCancelSearchModal} />
                                            {
                                                selectedFriendList.length > 0
                                                    ?
                                                    <IconButton onPress={this.addFriendsToGroup} iconProps={{
                                                        name: 'check', type: 'Entypo', style: {
                                                            fontSize: widthPercentageToDP(8),
                                                            color: 'white',
                                                            alignSelf: 'flex-start',
                                                        }
                                                    }} />
                                                    : null

                                            }
                                        </View>
                                    }
                                    {
                                        searchFriendList.length > 0
                                            ? <FlatList
                                                keyboardShouldPersistTaps="handled"
                                                style={{ marginTop: widthPercentageToDP(4) }}
                                                contentContainerStyle={{ paddingBottom: searchFriendList.length > 0 ? heightPercentageToDP(8) + kbdBtmOffset : 0 }}
                                                data={searchFriendList}
                                                keyExtractor={this.friendKeyExtractor}
                                                renderItem={this.renderFriend}
                                                extraData={this.state}
                                            />
                                            : <DefaultText style={{ alignSelf: 'center', color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(5), letterSpacing: 1, fontWeight: 'bold' }}>Not found any friends</DefaultText>
                                    }
                                </View>
                            </View>
                            : null
                    }
                    <View style={{ marginHorizontal: w = widthPercentageToDP(9) }}>
                        <SearchBoxFilter
                            searchQuery={searchQuery} onChangeSearchValue={this.onChangeSearchValue}
                            placeholder='Name' outerContainer={{ marginTop: 80 }}
                            footer={<View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, borderBottomWidth: 1, borderBottomColor: '#868686', paddingBottom: 16 }}>
                                <IconButton iconProps={{ name: 'edit', type: 'FontAwesome', style: { color: '#C4C6C8', fontSize: 23 } }} onPress={() => Actions.push(PageKeys.GROUP_FORM, { pageIndex: this.props.grpIndex })} />
                                {
                                    currentGroup.groupMembers.length > 0 && currentGroup.groupMembers[0].isAdmin ?
                                        <IconButton iconProps={{ name: 'adduser', type: 'AntDesign', style: { color: '#C4C6C8', fontSize: 23 } }} onPress={() => this.onPressAddMember()} />
                                        :
                                        null
                                }
                                <ImageButton imageSrc={require('../../../assets/img/chat.png')} imgStyles={{ height: 23, width: 26, marginTop: 6 }} onPress={() => this.openChatPage(undefined, true)} />
                                <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { color: this.state.isFilter === FILTERED_ACTION_IDS.LOCATION_ENABLE ? '#2B77B4' : '#C4C6C8', fontSize: 23 } }} onPress={() => this.filterLocationEnableMembers()} />
                            </View>}
                        />
                        <FlatList
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={styles.friendList}
                            data={this.state.filteredMembers}
                            keyExtractor={this.memberKeyExtractor}
                            renderItem={({ item, index }) => (
                                <HorizontalCard
                                    horizontalCardPlaceholder={require('../../../assets/img/friend-profile-pic.png')}
                                    item={item}
                                    thumbnail={item.profilePicture}
                                    onPressLeft={() => this.openFriendsProfileTab(item, index)}
                                    cardOuterStyle={styles.HorizontalCardOuterStyle}
                                    actionsBar={{
                                        online: true,
                                        actions: [
                                            { name: 'search', id: 2, type: 'FontAwesome', color: item.locationEnable ? '#2B77B4' : '#C4C6C8' },
                                            index !== 0 && item.isFriend ? { isIconImage: true, imgSrc: require('../../../assets/img/chat.png'), id: 4, onPressActions: () => this.openChatPage(item), imgStyle: { height: 23, width: 26, marginTop: 6 } } : null,
                                            { name: 'verified-user', id: 3, type: 'MaterialIcons', color: item.isAdmin ? '#81BA41' : '#C4C6C8' },
                                            index === 0 || item.isAdmin ? null : this.state.filteredMembers[0].isAdmin === false ? null : { name: 'remove-user', id: 4, type: 'Entypo', color: '#707070', onPressActions: () => this.removeMemberConfirmation(item) }
                                        ]
                                    }}
                                />
                            )
                            }
                            ListFooterComponent={this.renderFooter}
                            onEndReached={this.loadMoreData}
                            onEndReachedThreshold={0.1}
                            onMomentumScrollBegin={() => this.setState({ isLoadingData: true })}
                        />
                        {
                            this.props.hasNetwork === false && currentGroup.groupMembers.length === 0 && <View style={{ height: heightPercentageToDP(30) }}>
                                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                    <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', fontSize: heightPercentageToDP(15) } }} onPress={this.retryApiFunction} />
                                </Animated.View>
                                <DefaultText style={{ fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</DefaultText>
                                <DefaultText style={{ alignSelf: 'center' }}>Please connect to internet</DefaultText>
                            </View>
                        }
                    </View>
                </View>
                <Loader isVisible={this.props.showLoader} />
            </View>
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { currentGroup, friendGroupList } = state.FriendGroupList;
    const { allFriends } = state.FriendList;
    const { showLoader, hasNetwork } = state.PageState;
    const { pageNumber } = state.PageState;
    return { user, currentGroup, allFriends, showLoader, friendGroupList, pageNumber, hasNetwork };
};
const mapDispatchToProps = (dispatch) => {
    return {
        getGroupInfo: (grpIdx) => dispatch(getGroupInfoAction(grpIdx)),
        resetCurrentGroup: () => dispatch(resetCurrentGroupAction()),
        addMembers: (groupId, memberDetails) => dispatch(addMembers(groupId, memberDetails)),
        getGroupMembers: (groupId, userId, groupName, toggleLoader, pageNumber, successCallback, errorCallback) => dispatch(getGroupMembers(groupId, userId, groupName, toggleLoader, pageNumber, successCallback, errorCallback)),
        makeMemberAsAdmin: (groupId, memberId) => dispatch(makeMemberAsAdmin(groupId, memberId)),
        dismissMemberAsAdmin: (groupId, memberId) => dispatch(dismissMemberAsAdmin(groupId, memberId)),
        removeMember: (groupId, memberId) => dispatch(removeMember(groupId, memberId)),
        getGroupMemberPicture: (groupMemberIdList) => getPictureList(groupMemberIdList, (pictureObj) => {
            dispatch(updateMemberAction({ pictureObj }))
        }, (error) => {
            console.log('getPictureList GroupMemberPicture error : ', error)
        }),
        readNotification: (userId, notificationId) => dispatch(readNotification(userId, notificationId)),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(Group);