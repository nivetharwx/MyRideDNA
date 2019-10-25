import React, { Component } from 'react';
import { View, FlatList, ScrollView, StatusBar, Alert, Keyboard, Animated, TextInput, Text, ActivityIndicator, Easing } from 'react-native';
import { connect } from 'react-redux';
import styles, { CREATE_GROUP_WIDTH } from './styles';
import { BasicHeader } from '../../../components/headers';
import { Actions } from 'react-native-router-flux';
import { getGroupInfoAction, resetCurrentGroupAction, updateMemberAction } from '../../../actions';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, IS_ANDROID, WindowDimensions, PageKeys, FRIEND_TYPE, RELATIONSHIP } from '../../../constants';
import { IconButton, LinkButton } from '../../../components/buttons';
import { addMembers, getAllGroupMembers, dismissMemberAsAdmin, makeMemberAsAdmin, removeMember, getPicture, getPictureList, readNotification, getGroupMembers } from '../../../api';
import { ThumbnailCard, HorizontalCard } from '../../../components/cards';
import { BaseModal } from '../../../components/modal';
import { Icon as NBIcon, ListItem, Left, Thumbnail, Body, Right, CheckBox } from 'native-base';
import { LabeledInput, LabeledInputPlaceholder } from '../../../components/inputs';
import { Loader } from '../../../components/loader';

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
            // this.props.getAllGroupMembers(this.props.friendGroupList[this.props.grpIndex].groupId, this.props.user.userId, this.props.friendGroupList[this.props.grpIndex].groupName);
            this.props.getGroupMembers(this.props.friendGroupList[this.props.grpIndex].groupId, this.props.user.userId, this.props.friendGroupList[this.props.grpIndex].groupName, true, 0, (res) => {
            }, (err) => {
            });
        }
        // this.props.getGroupInfo(this.props.grpIndex);
        Keyboard.addListener('keyboardDidShow', this.adjustLayoutOnKeyboardVisibility);
        Keyboard.addListener('keyboardDidHide', this.adjustLayoutOnKeyboardVisibility);
    }

    adjustLayoutOnKeyboardVisibility = (e) => {
        if (!e) return;
        this.setState(prevState => ({ kbdBtmOffset: prevState.kbdBtmOffset === this.defaultBtmOffset ? e.endCoordinates.height : this.defaultBtmOffset }));
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.currentGroup !== this.props.currentGroup) {
            if (this.props.currentGroup.groupMembers.length === 0) {
                Actions.pop();
                return;
            }
        }
        // else if (prevProps.currentGroup === null) {
        //     // this.props.getAllGroupMembers(this.props.currentGroup.groupId, this.props.user.userId);
        // } 
        // else if (this.props.currentGroup.groupMembers.length !== prevProps.currentGroup.groupMembers.length) {
        //     // this.props.currentGroup.groupMembers.forEach(picture => {
        //     //     if (!picture.profilePicture && picture.profilePictureId) {
        //     //         this.props.getPicture(picture.profilePictureId, picture.memberId)
        //     //     }
        //     // })
        //     const groupMemberIdList = [];
        //     this.props.currentGroup.groupMembers.forEach(picture => {
        //         if (!picture.profilePicture && picture.profilePictureId) {
        //             groupMemberIdList.push(picture.profilePictureId);
        //         }
        //     })
        //     if (groupMemberIdList.length > 0) {
        //         this.props.getGroupMemberPicture(groupMemberIdList)
        //     }
        //     setTimeout(() => {
        //         this.filteredFriends = this.props.allFriends.filter(friend => this.props.currentGroup.groupMembers.findIndex(member => member.memberId === friend.userId) === -1);
        //     }, 0);
        // }
        if (prevProps.currentGroup.groupMembers !== this.props.currentGroup.groupMembers) {
            // this.props.currentGroup.groupMembers.forEach(picture => {
            //     if (!picture.profilePicture && picture.profilePictureId) {
            //         this.props.getPicture(picture.profilePictureId, picture.memberId)
            //     }
            // })
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
        setTimeout(() => this.props.resetCurrentGroup(), 100);
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
                // searchFriendList: [
                //     { name: 'friend 1' }, { name: 'friend 2' }, { name: 'friend 3' }, { name: 'friend 4' }, { name: 'friend 5' }, { name: 'friend 6' }, { name: 'friend 7' }, { name: 'friend 8' },
                //     { name: 'friend 9' }, { name: 'friend 10' }, { name: 'friend 11' }, { name: 'friend 12' }, { name: 'friend 13' }, { name: 'friend 14' }, { name: 'friend 15' }, { name: 'friend 16' }
                // ]
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
        // this.closeSearchFriendSection(() => {

        // });
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
            { text: `Chat with ${selectedMember.name}`, id: 'chat', handler: () => { this.openChatPage() } },
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
    openChatPage = (groupDetail) => {
        groupDetail = this.props.currentGroup;
        const { groupMembers, ...otherGroupDetail } = groupDetail
        otherGroupDetail['isGroup'] = true
        otherGroupDetail['id'] = groupDetail.groupId
        Actions.push(PageKeys.CHAT, { isGroup: true, chatInfo: otherGroupDetail })
        this.setState({ isVisibleOptionsModal: false })
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


    onPressAddMember = () => {
        this.setState({ isVisibleSearchModal: true });

    }
    openFriendsProfileTab = (userId, index, friendType) => {
        this.setState({ isVisibleOptionsModal: false, selectedMember: null });
        if (index === 0) {
            Actions.push(PageKeys.PROFILE);
        }
        else {
            if (this.props.allFriends.findIndex(friend => friend.userId === userId) === -1) {
                const notFriend = this.props.currentGroup.groupMembers.filter(member => {
                    return member.memberId === userId
                }, []);
                Actions.push(PageKeys.FRIENDS_PROFILE, { relationshipStatus: RELATIONSHIP.UNKNOWN, person: notFriend[0], activeTab: 0 });
            }
            else {
                Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: userId, friendType: FRIEND_TYPE.ALL_FRIENDS });
            }
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

    // openFriendsProfileTab = (friend, index) => {
    //     friend = friend || this.state.selectedPerson;
    //     if (index !== 0) {
    //         console.log('openFriendsProfileTab friend : ', friend);
    //         console.log('openFriendsProfileTab index : ', index);
    //         Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: friend.memberId, friendType: FRIEND_TYPE.ALL_FRIENDS, activeTab: 0 })
    //     }
    // }

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
                    <StatusBar translucent backgroundColor='black' barStyle="light-content" />
                </View>
                <View style={styles.fill}>
                    <BasicHeader
                        searchbarMode={isVisibleSearchModal}
                        searchValue={searchName}
                        onChangeSearchValue={this.searchForFriend} onCancelSearchMode={() => this.setState({ searchName: '', isVisibleSearchModal: false })}
                        onClearSearchValue={() => this.setState({ searchName: '' })}
                        title={<Text>{currentGroup.groupName ? currentGroup.groupName + `\n` : '\n'}<Text style={{ fontSize: 14 }}>Members: {currentGroup.groupMembers.length ? currentGroup.groupMembers.length : ''}</Text></Text>}
                        leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                        thumbnail={{ picture: currentGroup.profilePicture ? currentGroup.profilePicture : null }}
                    // rightIconProps={{ reverse: true, name: 'md-add', type: 'Ionicons', onPress: this.onPressAddMember }}
                    />
                    {/* <BaseModal alignCenter={true} isVisible={this.state.isVisibleAddMemberModal} onCancel={this.onCancelAddMemberForm} onPressOutside={this.onCancelAddMemberForm}>
                        <View style={{ backgroundColor: '#fff', width: WindowDimensions.width *0.8, height: WindowDimensions.height*0.8, padding: 20, elevation: 3 }}>
                            <LabeledInput placeholder='Search name' onChange={(val) => this.setState({ addMemberToGroup: val })}
                                onSubmit={this.onSubmitGroupForm} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                <LinkButton  title='Submit' onPress={this.onSubmitGroupForm} />
                                <LinkButton title='Cancel' onPress={this.onCancelAddMemberForm} />
                            </View>
                        </View>
                    </BaseModal> */}
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
                                            : <Text style={{ alignSelf: 'center', color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(5), letterSpacing: 1, fontWeight: 'bold' }}>Not found any friends</Text>
                                    }
                                </View>
                            </View>
                            : null
                    }

                    <View style={{ marginHorizontal: widthPercentageToDP(9), marginTop: 80, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', borderRadius: 20, height: 37 }}>
                        <View style={{ flex: 2.89 }}>
                            <LabeledInputPlaceholder
                                inputValue={searchQuery} inputStyle={{ paddingBottom: 0, borderBottomWidth: 0, width: widthPercentageToDP(47), marginLeft: 15, height: 25, backgroundColor: '#fff', }}
                                returnKeyType='next'
                                onChange={this.onChangeSearchValue}
                                hideKeyboardOnSubmit={false}
                                containerStyle={styles.containerStyle} />
                        </View>
                        <View style={{ flex: 1, backgroundColor: '#C4C6C8', borderTopRightRadius: 20, borderBottomRightRadius: 20, justifyContent: 'center' }}>
                            <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { color: '#707070', fontSize: 22 } }} />
                        </View>
                        {/* rightIcon={{name:'user', type:'FontAwesome', style:styles.rightIconStyle}} /> */}

                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, borderBottomWidth: 1, borderBottomColor: '#868686', marginHorizontal: widthPercentageToDP(9), paddingBottom: 16 }}>
                        <IconButton iconProps={{ name: 'edit', type: 'FontAwesome', style: { color: '#C4C6C8', fontSize: 23 } }} onPress={() => Actions.push(PageKeys.GROUP_FORM, { pageIndex: this.props.grpIndex })} />
                        {
                            currentGroup.groupMembers.length > 0 && currentGroup.groupMembers[0].isAdmin ?
                                <IconButton iconProps={{ name: 'adduser', type: 'AntDesign', style: { color: '#C4C6C8', fontSize: 23 } }} onPress={() => this.onPressAddMember()} />
                                :
                                null
                        }
                        <IconButton iconProps={{ name: 'message1', type: 'AntDesign', style: { color: '#C4C6C8', fontSize: 23 } }} onPress={() => this.openChatPage()} />
                        <IconButton iconProps={{ name: 'search', type: 'FontAwesome', style: { color: this.state.isFilter === FILTERED_ACTION_IDS.LOCATION_ENABLE ? '#2B77B4' : '#C4C6C8', fontSize: 23 } }} onPress={() => this.filterLocationEnableMembers()} />
                        {/* <IconButton iconProps={{ name: 'location-arrow', type: 'FontAwesome', style: { color:'#C4C6C8', fontSize: 23 } }} onPress={() => this.filterVisibleOnMapFriends()} /> */}
                    </View>

                    {
                        this.state.filteredMembers.length > 0
                            ?
                            <FlatList
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={styles.friendList}
                                data={this.state.filteredMembers}
                                keyExtractor={this.memberKeyExtractor}
                                renderItem={({ item, index }) => (
                                    <View style={{ flex: 1, maxWidth: widthPercentageToDP(50) }}>
                                        <HorizontalCard
                                            horizontalCardPlaceholder={require('../../../assets/img/friend-profile-pic.png')}
                                            item={item}
                                            thumbnail={item.profilePicture}
                                            onPressLeft={() => this.openFriendsProfileTab(item.memberId, index)}
                                            cardOuterStyle={styles.HorizontalCardOuterStyle}
                                            actionsBar={{
                                                online: true,
                                                actions: [
                                                    // { name: item.favorite ? 'star' : 'star-outlined', id: 1, type: 'Entypo', color: item.favorite ? '#CE0D0D' : '#C4C6C8', onPressActions: () => this.toggleFavouriteFriend(item) },
                                                    { name: 'search', id: 2, type: 'FontAwesome', color: item.locationEnable ? '#2B77B4' : '#C4C6C8' },
                                                    index !== 0 ? { name: 'contacts', id: 2, type: 'AntDesign', color: item.isFriend ? '#CE0D0D' : '#C4C6C8' } : null,
                                                    { name: 'verified-user', id: 3, type: 'MaterialIcons', color: item.isAdmin ? '#81BA41' : '#C4C6C8' },
                                                    // { name: 'message1', id: 4, type: 'AntDesign', color: '#707070', onPressActions: () => this.openChatPage(item) }
                                                    index === 0 || item.isAdmin ? null : this.state.filteredMembers[0].isAdmin === false ? null : { name: 'remove-user', id: 4, type: 'Entypo', color: '#707070', onPressActions: () => this.removeMemberConfirmation(item) }
                                                ]
                                            }}
                                        />
                                    </View>
                                    // <View style={{ flex: 1, maxWidth: widthPercentageToDP(50) }}>
                                    //     <View style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', width: '80%', height: widthPercentageToDP(15), position: 'absolute', zIndex: 100, justifyContent: 'space-between' }}>
                                    //         {
                                    //             item.isOnline
                                    //                 ? <View style={{ backgroundColor: '#37B603', width: widthPercentageToDP(6), height: widthPercentageToDP(6), borderRadius: widthPercentageToDP(3), elevation: 10 }} />
                                    //                 : null
                                    //         }
                                    //         {
                                    //             item.isOnline && item.locationEnable
                                    //                 ? <IconButton iconProps={{ name: 'location-on', type: 'MaterialIcons', style: { color: friendsLocationList && friendsLocationList[item.userId] && friendsLocationList[item.userId].isVisible ? APP_COMMON_STYLES.headerColor : '#ACACAC', fontSize: widthPercentageToDP(7) } }} />
                                    //                 : null
                                    //         }
                                    //     </View>
                                    //     <ThumbnailCard
                                    //         thumbnailPlaceholder={require('../../../assets/img/friend-profile-pic.png')}
                                    //         item={item}
                                    //         onLongPress={() => this.showOptionsModal(index)}
                                    //         onPress={() => this.openProfile(item.memberId, FRIEND_TYPE.ALL_FRIENDS)}
                                    //     />
                                    // </View>
                                )
                                }
                                ListFooterComponent={this.renderFooter}
                                // onTouchStart={this.loadMoreData}
                                onEndReached={this.loadMoreData}
                                onEndReachedThreshold={0.1}
                                onMomentumScrollBegin={() => this.setState({ isLoadingData: true })}
                            />
                            :
                            this.props.hasNetwork ?
                                null
                                :
                                <View style={{ flex: 1, position: 'absolute', top: heightPercentageToDP(30) }}>
                                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                        <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(15), flex: 1, marginLeft: widthPercentageToDP(40) } }} onPress={this.retryApiFunction} />
                                    </Animated.View>
                                    <Text style={{ marginLeft: widthPercentageToDP(13), fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</Text>
                                    <Text style={{ marginTop: heightPercentageToDP(2), marginLeft: widthPercentageToDP(25) }}>Please connect to internet </Text>
                                </View>
                    }

                    {/* <Animated.View style={[styles.floatSecContainer, { bottom: kbdBtmOffset, width: this.floatSecAnim }]}>
                        <Animated.View style={[styles.floatContnetAlign, { backgroundColor: isActiveSearch ? '#fff' : 'transparent', borderWidth: this.borderWidthAnim }]}>
                            {
                                selectedFriendList.length === 0
                                    ? <Animated.View style={[styles.floatInputIcon, styles.floatSectionChild, { transform: [{ rotate: spinAnim }] }]}>
                                        <IconButton iconProps={{ name: 'plus', type: 'Entypo', style: { color: '#fff' } }} onPress={this.openSearchFriendSection}
                                            style={{ flex: 1 }} />
                                    </Animated.View>
                                    : <IconButton iconProps={{ name: 'check', type: 'Entypo', style: { color: '#fff' } }} onPress={this.addFriendsToGroup}
                                        style={[styles.floatInputIcon, styles.floatSectionChild]} />
                            }
                            <TextInput pointerEvents='box-only' ref={elRef => this.addMemberInputRef = elRef} style={{ flex: 1, marginLeft: 3 }}
                                onSubmitEditing={({ nativeEvent }) => this.searchForFriend(nativeEvent.text)} onChangeText={this.searchForFriend} />
                        </Animated.View>
                    </Animated.View> */}
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
        // getAllGroupMembers: (groupId, userId, groupName) => dispatch(getAllGroupMembers(groupId, userId, groupName)),
        getGroupMembers: (groupId, userId, groupName, toggleLoader, pageNumber, successCallback, errorCallback) => dispatch(getGroupMembers(groupId, userId, groupName, toggleLoader, pageNumber, successCallback, errorCallback)),
        makeMemberAsAdmin: (groupId, memberId) => dispatch(makeMemberAsAdmin(groupId, memberId)),
        dismissMemberAsAdmin: (groupId, memberId) => dispatch(dismissMemberAsAdmin(groupId, memberId)),
        removeMember: (groupId, memberId) => dispatch(removeMember(groupId, memberId)),
        // getPicture: (pictureId, memberId) => getPicture(pictureId, ({ picture, pictureId }) => {
        //     dispatch(updateMemberAction({ updates: { profilePicture: picture }, memberId: memberId }))
        // }, (error) => {
        //     dispatch(updateMemberAction({ updates: {}, memberId: memberId }))
        // }),
        getGroupMemberPicture: (groupMemberIdList) => getPictureList(groupMemberIdList, (pictureObj) => {
            dispatch(updateMemberAction({ pictureObj }))
        }, (error) => {
            console.log('getPictureList GroupMemberPicture error : ', error)
            // dispatch(updateMemberAction({ updates: {}, memberId: memberId }))
        }),
        readNotification: (userId, notificationId) => dispatch(readNotification(userId, notificationId)),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(Group);