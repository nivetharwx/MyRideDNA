import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, TextInput, Animated, ScrollView, Text, Keyboard, FlatList, View, Image, ImageBackground, TouchableOpacity, TouchableNativeFeedback } from 'react-native';
import { IconButton } from '../../../components/buttons';
import { widthPercentageToDP, APP_COMMON_STYLES, heightPercentageToDP } from '../../../constants';
import { ListItem, Left, Thumbnail, Body, Right, Icon as NBIcon, CheckBox } from 'native-base';
import { ThumbnailCard } from '../../../components/cards';
import { createFriendGroup, getFriendGroups, addMembers, getAllGroupMembers } from '../../../api';
import { updateUpdatingGroupId, resetCurrentGroup } from '../../../actions';

const CREATE_GROUP_WIDTH = widthPercentageToDP(9);
class GroupsTab extends Component {
    createSecAnim = new Animated.Value(CREATE_GROUP_WIDTH / 2);
    borderWidthAnim = new Animated.Value(0);
    createGrpInputRef = null;
    addMemberInputRef = null;
    isAddingGroup = false;
    constructor(props) {
        super(props);
        this.state = {
            selectedFriendList: [],
            searchFriendList: [],
            newGroupName: null,
        }
    }

    componentDidMount() {
        this.props.getFriendGroups(this.props.user.userId);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.goToGroupList === true && prevProps.goToGroupList === false && this.props.currentGroup !== null) {
            if (this.borderWidthAnim.__getValue() === 1) {
                this.props.getFriendGroups(this.props.user.userId);
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
                    this.addMemberInputRef.clear()
                    this.addMemberInputRef.blur();
                    this.props.getFriendGroups(this.props.user.userId);
                });
            } else {
                this.props.getFriendGroups(this.props.user.userId);
            }
        }
        if (this.props.currentGroup !== prevProps.currentGroup) {
            this.setState({ selectedFriendList: [], searchFriendList: [], newGroupName: null }, () => {
                // DOC: Clicked on group from the list
                if (prevProps.currentGroup === null) {
                    this.props.getAllGroupMembers(this.props.currentGroup.groupId, this.props.user.userId);
                }
            });
        }
    }

    openCreateGroupSection = () => {
        if (this.createGrpInputRef.isFocused() === true) {
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
            this.setState({ newGroupName: '' });
            this.createGrpInputRef.focus();
        });
    }

    openSearchFriendSection = () => {
        if (this.addMemberInputRef.isFocused() === true) {
            this.closeSearchFriendSection();
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
            this.addMemberInputRef.focus();
            this.setState({ searchFriendList: this.props.allFriends });
        });
    }

    closeSearchFriendSection = (callback) => {
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
            this.addMemberInputRef.clear();
            this.addMemberInputRef.blur();
            if (typeof callback === 'function') callback();
            if (this.state.selectedFriendList.length > 0) {
                this.props.addMembers(this.props.currentGroup.groupId, {
                    joinedDate: new Date().toISOString(),
                    joinedBy: this.props.user.userId,
                    groupMembers: this.state.selectedFriendList
                });
            } else {
                this.setState(prevState => ({ selectedFriendList: [], searchFriendList: [] }));
            }
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

    openGroupDetails = (index) => this.props.resetCurrentGroup(index)

    renderGroup = ({ item, index }) => {
        return (
            <ListItem avatar onPress={() => this.openGroupDetails(index)}>
                <Left style={{ alignItems: 'center', justifyContent: 'center' }}>
                    {
                        item.groupProfilePictureThumbnail
                            ? <Thumbnail source={{ uri: 'Image URL' }} />
                            : <NBIcon active name="group" type='FontAwesome' style={{ width: widthPercentageToDP(6) }} />
                    }
                </Left>
                <Body>
                    <Text>{item.groupName}</Text>
                    <Text note></Text>
                </Body>
                <Right>
                    <Text note></Text>
                </Right>
            </ListItem>
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
            this.isAddingGroup = true;
            this.props.createFriendGroup({
                groupName: newGroupName,
                createdBy: this.props.user.userId,
                createdDate: new Date().toISOString(),
            });
        });
    }

    searchForFriend = (value) => {
        value = value.trim();
        this.setState(prevState => ({ searchFriendList: this.props.allFriends.filter(friend => friend.name.toUpperCase().includes(value.toUpperCase())) }));
    }

    render() {
        const { selectedFriendList, newGroupName, searchFriendList } = this.state;
        const { currentGroup, friendGroupList, user } = this.props;
        const spinAnim = this.borderWidthAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '45deg']
        });
        return (
            currentGroup
                ? <View style={styles.fill}>
                    <ListItem avatar style={{ marginTop: heightPercentageToDP(5), height: heightPercentageToDP(10), borderBottomWidth: 5, borderBottomColor: '#000', marginRight: widthPercentageToDP(4) }}>
                        <Left style={{ height: '100%', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 0, paddingTop: 0 }}>
                            {
                                currentGroup.groupProfilePictureThumbnail
                                    ? <Thumbnail source={{ uri: 'Image URL' }} />
                                    : <NBIcon active name="group" type='FontAwesome' style={{ width: widthPercentageToDP(6), alignSelf: 'center' }} />
                            }
                        </Left>
                        <Body style={{ borderBottomWidth: 0 }}>
                            <Text>{currentGroup.groupName}</Text>
                            <Text note></Text>
                        </Body>
                        <Right style={{ borderBottomWidth: 0, paddingTop: 0, justifyContent: 'center' }}>
                            <Text note>Members</Text>
                            <Text note>{currentGroup.groupMembers.length === 0 ? 'Only You' : currentGroup.groupMembers.length}</Text>
                        </Right>
                    </ListItem>
                    <FlatList
                        contentContainerStyle={[styles.friendList, { paddingBottom: currentGroup.groupMembers.length > 0 ? heightPercentageToDP(8) : 0 }]}
                        data={currentGroup.groupMembers}
                        numColumns={2}
                        keyExtractor={this.memberKeyExtractor}
                        renderItem={({ item }) => (<ThumbnailCard
                            thumbnailPlaceholder={require('../../../assets/img/friend-profile-pic.png')}
                            item={item}
                            onLongPress={() => null}
                        />)}
                    />
                    <View style={{ position: 'absolute', width: '100%', top: heightPercentageToDP(15), backgroundColor: 'rgba(0,0,0,0.7)' }}>
                        <FlatList
                            contentContainerStyle={{ paddingBottom: searchFriendList.length > 0 ? heightPercentageToDP(8) : 0 }}
                            data={searchFriendList}
                            keyExtractor={this.friendKeyExtractor}
                            renderItem={this.renderFriend}
                        />
                    </View>
                    <Animated.View style={[styles.createGrpContainer, { bottom: widthPercentageToDP(user.handDominance === 'left' ? 20 : 8), width: this.createSecAnim }]}>
                        <Animated.View style={[styles.createGrpActionSec, { backgroundColor: '#fff', borderWidth: this.borderWidthAnim }]}>
                            {
                                selectedFriendList.length === 0
                                    ? <Animated.View style={[styles.createGroupIcon, styles.createGrpChildSize, { transform: [{ rotate: spinAnim }] }]}>
                                        <IconButton iconProps={{ name: 'plus', type: 'Entypo', style: { color: '#fff' } }} onPress={this.openSearchFriendSection}
                                            style={{ flex: 1 }} />
                                    </Animated.View>
                                    : <IconButton iconProps={{ name: 'check', type: 'Entypo', style: { color: '#fff' } }} onPress={this.closeSearchFriendSection}
                                        style={[styles.createGroupIcon, styles.createGrpChildSize]} />
                            }
                            <TextInput ref={elRef => this.addMemberInputRef = elRef} style={{ flex: 1, marginLeft: 3 }}
                                onSubmitEditing={({ nativeEvent }) => this.searchForFriend(nativeEvent.text)} onChangeText={this.searchForFriend} />
                        </Animated.View>
                    </Animated.View>
                </View>
                : <View style={styles.fill}>
                    {
                        friendGroupList.length > 0
                            ? <FlatList
                                data={friendGroupList}
                                keyExtractor={this.groupKeyExtractor}
                                renderItem={this.renderGroup}
                                extraData={this.state}
                            />
                            : <ImageBackground source={require('../../../assets/img/profile-bg.png')} style={styles.backgroundImage} />
                    }
                    <Animated.View style={[styles.createGrpContainer, { bottom: widthPercentageToDP(user.handDominance === 'left' ? 20 : 8), width: this.createSecAnim }]}>
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
                    </Animated.View>
                </View>
        )
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { friendGroupList, currentGroup } = state.FriendGroupList;
    const { allFriends } = state.FriendList;
    return { user, friendGroupList, allFriends, currentGroup };
};
const mapDispatchToProps = (dispatch) => {
    return {
        createFriendGroup: (newGroupInfo) => dispatch(createFriendGroup(newGroupInfo)),
        getFriendGroups: (userId) => dispatch(getFriendGroups(userId)),
        addMembers: (groupId, memberDetails) => dispatch(addMembers(groupId, memberDetails)),
        resetCurrentGroup: (groupIdx) => dispatch(resetCurrentGroup(groupIdx)),
        getAllGroupMembers: (groupId, userId) => dispatch(getAllGroupMembers(groupId, userId)),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(GroupsTab);

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
        flex: 1
    }
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