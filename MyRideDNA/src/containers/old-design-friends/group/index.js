import React, { Component } from 'react';
import { View, FlatList, ScrollView, StatusBar, Alert, Keyboard, Animated, TextInput, Text } from 'react-native';
import { connect } from 'react-redux';
import styles, { CREATE_GROUP_WIDTH } from './styles';
import { BasicHeader } from '../../../components/headers';
import { Actions } from 'react-native-router-flux';
import { getGroupInfoAction, resetCurrentGroupAction } from '../../../actions';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, IS_ANDROID } from '../../../constants';
import { IconButton, LinkButton } from '../../../components/buttons';
import { addMembers, getAllGroupMembers, dismissMemberAsAdmin, makeMemberAsAdmin, removeMember } from '../../../api';
import { ThumbnailCard } from '../../../components/cards';
import { BaseModal } from '../../../components/modal';
import { Icon as NBIcon, ListItem, Left, Thumbnail, Body, Right, CheckBox } from 'native-base';

class Group extends Component {
    floatSecAnim = new Animated.Value(CREATE_GROUP_WIDTH / 2);
    borderWidthAnim = new Animated.Value(0);
    addMemberInputRef = null;
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
            selectedMember: null
        };
    }

    componentDidMount() {
        this.props.getGroupInfo(this.props.grpIndex);
        Keyboard.addListener('keyboardDidShow', this.adjustLayoutOnKeyboardVisibility);
        Keyboard.addListener('keyboardDidHide', this.adjustLayoutOnKeyboardVisibility);
    }

    adjustLayoutOnKeyboardVisibility = ({ endCoordinates }) => {
        this.setState(prevState => ({ kbdBtmOffset: prevState.kbdBtmOffset === this.defaultBtmOffset ? endCoordinates.height : this.defaultBtmOffset }));
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.currentGroup !== this.props.currentGroup) {
            if (this.props.currentGroup === null) {
                Actions.pop();
                return;
            } else if (prevProps.currentGroup === null) {
                this.props.getAllGroupMembers(this.props.currentGroup.groupId, this.props.user.userId);
            } else if (this.props.currentGroup.groupMembers.length !== prevProps.currentGroup.groupMembers.length) {
                setTimeout(() => {
                    this.filteredFriends = this.props.allFriends.filter(friend => this.props.currentGroup.groupMembers.findIndex(member => member.memberId === friend.userId) === -1);
                }, 0);
            }
        }
    }

    componentWillUnmount() {
        // DOC: Remove all keyboard event listeners
        Keyboard.removeListener('keyboardDidShow', this.adjustLayoutOnKeyboardVisibility);
        Keyboard.removeListener('keyboardDidHide', this.adjustLayoutOnKeyboardVisibility);
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
                searchFriendList: this.filteredFriends
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
        value = value.trim();
        this.setState(prevState => ({ searchFriendList: this.filteredFriends.filter(friend => friend.name.toLowerCase().includes(value.toLowerCase())) }));
    }

    addFriendsToGroup = () => {
        this.closeSearchFriendSection(() => {
            this.props.addMembers(this.props.currentGroup.groupId, {
                joinedDate: new Date().toISOString(),
                joinedBy: this.props.user.userId,
                groupMembers: this.state.selectedFriendList
            });
            this.setState({ searchFriendList: [], selectedFriendList: [] });
        });
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

    removeMemberConfirmation() {
        const { memberId, name } = this.state.selectedMember;
        Alert.alert(
            'Confirmation to remove',
            `Are you sure to remove ${name}?`,
            [
                {
                    text: 'Yes', onPress: () => {
                        this.props.removeMember(this.props.currentGroup.groupId, memberId);
                        this.onCancelOptionsModal();
                    }
                },
                { text: 'Cancel', onPress: () => { }, style: 'cancel' },
            ],
            { cancelable: false }
        );
    }

    renderMenuOptions = () => {
        const { selectedMember } = this.state;
        const userInfo = this.props.currentGroup.groupMembers[0];
        const options = [
            { text: `Chat with ${selectedMember.name}`, id: 'chat', handler: () => { } },
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

    render() {
        const { kbdBtmOffset, isActiveSearch, selectedMember, selectedFriendList, searchFriendList, isVisibleOptionsModal, isVisibleSearchModal } = this.state;
        const { user, currentGroup } = this.props;
        const spinAnim = this.borderWidthAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '45deg']
        });
        return currentGroup === null
            ? <View style={styles.fill} />
            : <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={styles.fill}>
                    <BasicHeader title={<Text>{currentGroup.groupName + `\n`}<Text style={{ fontSize: 14 }}>Members: {currentGroup.groupMembers.length ? currentGroup.groupMembers.length : ''}</Text></Text>} leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }} />
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
                                        <IconButton iconProps={{ name: 'close', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(8), color: 'white', alignSelf: user.handDominance === 'left' ? 'flex-start' : 'flex-end' } }} onPress={this.onCancelSearchModal} />
                                    }
                                    {
                                        searchFriendList.length > 0
                                            ? <FlatList
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
                    <FlatList
                        contentContainerStyle={[styles.memberList, { paddingBottom: currentGroup.groupMembers.length > 0 ? heightPercentageToDP(8) : 0 }]}
                        data={currentGroup.groupMembers}
                        numColumns={2}
                        keyExtractor={this.memberKeyExtractor}
                        renderItem={({ item, index }) => (<ThumbnailCard
                            thumbnailPlaceholder={require('../../../assets/img/friend-profile-pic.png')}
                            item={item}
                            onLongPress={() => this.showOptionsModal(index)}
                        />)}
                    />

                    <Animated.View style={[styles.floatSecContainer, { bottom: kbdBtmOffset, width: this.floatSecAnim }]}>
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
                    </Animated.View>
                </View>
            </View>
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { currentGroup } = state.FriendGroupList;
    const { allFriends } = state.FriendList;
    return { user, currentGroup, allFriends };
};
const mapDispatchToProps = (dispatch) => {
    return {
        getGroupInfo: (grpIdx) => dispatch(getGroupInfoAction(grpIdx)),
        resetCurrentGroup: () => dispatch(resetCurrentGroupAction()),
        addMembers: (groupId, memberDetails) => dispatch(addMembers(groupId, memberDetails)),
        getAllGroupMembers: (groupId, userId) => dispatch(getAllGroupMembers(groupId, userId)),
        makeMemberAsAdmin: (groupId, memberId) => dispatch(makeMemberAsAdmin(groupId, memberId)),
        dismissMemberAsAdmin: (groupId, memberId) => dispatch(dismissMemberAsAdmin(groupId, memberId)),
        removeMember: (groupId, memberId) => dispatch(removeMember(groupId, memberId)),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(Group);