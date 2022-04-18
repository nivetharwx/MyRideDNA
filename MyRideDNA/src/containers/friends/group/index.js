import React, { Component } from 'react';
import { View, FlatList, Keyboard, Animated, ActivityIndicator, Easing, Alert, KeyboardAvoidingView, ScrollView, Image } from 'react-native';
import { connect } from 'react-redux';
import styles from './styles';
import { Actions } from 'react-native-router-flux';
import { resetCurrentGroupAction, setCurrentFriendAction, hideFriendsLocationAction, screenChangeAction, removeFriendGroupAction, resetMembersFromCurrentGroupAction, resetErrorHandlingAction, apiLoaderActions, updateGroupMembersAction } from '../../../actions';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, PageKeys, GET_PICTURE_BY_ID, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, IS_ANDROID, RELATIONSHIP } from '../../../constants';
import { IconButton, LinkButton, BasicButton } from '../../../components/buttons';
import { readNotification, getGroupMembers, exitFriendGroup, getFriendsLocationList, addFavorite, removeFavorite, deleteFriendGroup, handleServiceErrors, rejectFriendRequest, approveFriendRequest, cancelFriendRequest, sendFriendRequest } from '../../../api';
import { HorizontalCard } from '../../../components/cards';
import { BaseModal } from '../../../components/modal';
import { SearchBoxFilter } from '../../../components/inputs';
import { DefaultText } from '../../../components/labels';
import { BasePage } from '../../../components/pages';
import { ImageLoader } from '../../../components/loader';


class Group extends Component {
    borderWidthAnim = new Animated.Value(0);
    defaultBtmOffset = widthPercentageToDP(8);
    constructor(props) {
        super(props);
        this.state = {
            kbdBtmOffset: this.defaultBtmOffset,
            isLoading: false,
            spinValue: new Animated.Value(0),
            searchQuery: '',
            showOptionsModal: false,
            hasRemainingList: false,
            pageNumber: 0,
            onPressArrow: false,
            showDeleteModal: false
        };
    }

    componentDidMount() {
        this.getGroupMember()
        Keyboard.addListener('keyboardDidShow', this.adjustLayoutOnKeyboardVisibility);
        Keyboard.addListener('keyboardDidHide', this.adjustLayoutOnKeyboardVisibility);
    }

    componentDidUpdate(prevProps, prevState) {
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

    getGroupMember = () => {
        if (this.props.comingFrom === PageKeys.NOTIFICATIONS) {
            this.getMembers(this.props.notificationBody.reference.groupId, this.props.notificationBody.notifiedUserId, this.props.notificationBody.reference.groupName, this.props.notificationBody.reference.profilPictureId, true, this.state.pageNumber);
        }
        else if (this.props.comingFrom === 'notificationPage') {
            this.getMembers(this.props.notificationBody.reference.groupId, this.props.notificationBody.notifiedUserId, this.props.notificationBody.reference.groupName, this.props.notificationBody.profilPictureId, true, this.state.pageNumber)
            this.props.readNotification(this.props.notificationBody.notifiedUserId, this.props.notificationBody.id);
        }
        else if (this.props.comingFrom === PageKeys.CHAT) {
            this.getMembers(this.props.groupData.id, this.props.user.userId, this.props.groupData.groupName, this.props.groupData.groupProfilePictureId, true, this.state.pageNumber)
        }
        else {
            this.getMembers(this.props.friendGroupList[this.props.grpIndex].groupId, this.props.user.userId, this.props.friendGroupList[this.props.grpIndex].groupName, this.props.friendGroupList[this.props.grpIndex].profilePictureId, true, this.state.pageNumber)
        }
    }

    getMembers = (groupId, userId, groupName, profilePictureId, toggleLoader, pageNumber) => {
        this.props.getGroupMembers(groupId, userId, groupName, profilePictureId, toggleLoader, pageNumber, (res) => {
            if (res.groupMembers.length > 0) {
                this.setState({ pageNumber: this.state.pageNumber + 1, hasRemainingList: res.remainingList > 0, isLoading: false })
            }
            else {
                this.setState({ isLoading: false })
            }
        }, (err) => {
            this.setState({ isLoading: false })
        });
    }

    adjustLayoutOnKeyboardVisibility = (e) => {
        if (!e) return;
        this.setState(prevState => ({ kbdBtmOffset: prevState.kbdBtmOffset === this.defaultBtmOffset ? e.endCoordinates.height : this.defaultBtmOffset }));
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.onPressArrow) {
            this.props.changeScreen({ name: PageKeys.MAP });
        }

        if (prevProps.currentGroup.groupMembers !== this.props.currentGroup.groupMembers) {
            if (this.props.currentGroup.groupMembers.length === 0) {
                Actions.pop();
            }
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
            }
        });
    }

    onPressBackButton = () => {
        Keyboard.dismiss();
        Actions.pop();
    }

    memberKeyExtractor = (item) => item.memberId;

    onChangeSearchValue = (val) => { this.setState({ searchQuery: val }) }

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
    }

    openFriendsProfileTab = (item, index) => {
        if (index === 0) {
            Actions.push(PageKeys.PROFILE, { tabProps: { activeTab: 0 } });
        }
        else {
            if (item.isFriend) {
                this.props.setCurrentFriend({ userId: item.memberId });
                Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: item.memberId, isUnknown: !item.isFriend });
            }
            else {
                Actions.push(PageKeys.PASSENGER_PROFILE, { isUnknown: true, person: { ...item, userId: item.memberId } })
            }
        }
    }

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.isLoading === true || distanceFromEnd < 0) return;
        this.setState((prevState) => ({ isLoading: true }), () => {
            this.getMembers(this.props.currentGroup.groupId, this.props.user.userId, this.props.currentGroup.groupName, this.props.currentGroup.profilePictureId, false, this.state.pageNumber)
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

    showOptionsModal = () => this.setState({ showOptionsModal: true });

    hideOptionsModal = () => this.setState({ showOptionsModal: false });

    exitGroup = () => {
        this.props.exitFriendGroup(this.props.currentGroup.groupId, this.props.user.userId);
        this.setState({ showOptionsModal: false });
    }
    editGroup = () => {
        this.hideOptionsModal();
        if (this.props.apiCallsInProgress[this.props.currentGroup.groupId]) return;
        Actions.push(PageKeys.GROUP_FORM, { groupDetail: this.props.currentGroup, isAdmin: this.props.currentGroup.groupMembers[0].isAdmin });

    }

    deleteGroup = () => {
        this.props.deleteFriendGroup(this.props.currentGroup.groupId)
        this.hideOptionsModal()
        this.hideDeleteModal()
    }

    toggleFriendsLocation = (isVisible, item) => {
        if (!item.locationEnable) return;
        friendId = item.memberId;
        isVisible
            ? this.props.hideFriendsLocation(friendId)
            : this.props.getFriendsLocationList(this.props.user.userId, [friendId], false)
    }

    onPressNavigationIcon = (isVisible, item) => {
        if (!item.locationEnable) return;
        friendId = item.memberId;
        isVisible
            ? this.setState({ onPressArrow: true })
            : this.setState({ onPressArrow: true }, () => {
                this.props.getFriendsLocationList(this.props.user.userId, [friendId], true)
            })
    }

    toggleFavouriteFriend = (member) => {
        if (member.favorite) {
            this.props.removeFavorite(member.memberId, this.props.user.userId)
        }
        else {
            this.props.addFavorite(member.memberId, this.props.user.userId)
        }

    }
    cancelingFriendRequest = (item) => {
        this.props.cancelRequest(this.props.user.userId, item.memberId);
    }

    approvingFriendRequest = (item) => {
        this.props.approvedRequest(this.props.user.userId, item.memberId, new Date().toISOString());
    }
    rejectingFriendRequest = (item) => {
        console.log('\n\n\n item:', item)
        this.props.rejectRequest(this.props.user.userId, item.memberId);
    }

    sendFriendRequest = (item) => {
        const { user } = this.props;
        const requestBody = {
            senderId: user.userId,
            senderName: user.name,
            senderNickname: user.nickname,
            senderEmail: user.email,
            userId: item.memberId,
            name: item.name,
            nickname: item.nickname,
            actionDate: new Date().toISOString()
        };
        this.props.sendFriendRequest(requestBody);
    }

    acceptRejectFriendRequest = (item) => {
        Alert.alert(
            'Do you want to accept request ?',
            '',
            [
                { text: 'cancel', onPress: () => { }, style: 'cancel' },
                {
                    text: 'Accept ', onPress: () => {
                        this.approvingFriendRequest(item)
                    }
                },
                {
                    text: 'Reject', onPress: () => {
                        this.rejectingFriendRequest(item)
                    }
                },
            ],
            { cancelable: false }
        )
    }

    cancelFriendRequest = (item) => {
        Alert.alert(
            'Do you want to cancel request ?',
            '',
            [
                {
                    text: 'Yes ', onPress: () => {
                        this.cancelingFriendRequest(item)
                    }
                },
                { text: 'No', onPress: () => { }, style: 'cancel' },
            ],
            { cancelable: false }
        )
    }

    getActions = (item) => {
        const { friendsLocationList } = this.props;
        switch (item.relationship) {
            case RELATIONSHIP.RECIEVED_REQUEST: return [{ isIconImage: true, imgSrc: require('../../../assets/img/accept-reject.png'), id: 4, onPressActions: () => this.acceptRejectFriendRequest(item), imgStyle: { height: 23, width: 26, marginTop: 6 } }]
            case RELATIONSHIP.SENT_REQUEST: return [{ isIconImage: true, imgSrc: require('../../../assets/img/add-frnd-frm-comm-success-green.png'), id: 4, onPressActions: () => this.cancelFriendRequest(item), imgStyle: { height: 23, width: 26, marginTop: 6 } }]
            case RELATIONSHIP.UNKNOWN: return [{ isIconImage: true, imgSrc: require('../../../assets/img/add-friend-from-community.png'), id: 4, onPressActions: () => this.sendFriendRequest(item), imgStyle: { height: 23, width: 26, marginTop: 6 } }]
            default: return [{ name: item.favorite ? 'star' : 'star-outlined', id: 1, type: 'Entypo', color: item.favorite ? '#CE0D0D' : '#C4C6C8', onPressActions: () => this.toggleFavouriteFriend(item) },
            { name: 'search', id: 2, type: 'FontAwesome', color: friendsLocationList[item.memberId] !== undefined && friendsLocationList[item.memberId].isVisible ? '#2B77B4' : '#C4C6C8', onPressActions: () => this.toggleFriendsLocation(friendsLocationList[item.memberId] !== undefined && friendsLocationList[item.memberId].isVisible, item) },
            { name: 'location-arrow', id: 3, type: 'FontAwesome', color: item.locationEnable ? '#81BA41' : '#C4C6C8', onPressActions: () => this.onPressNavigationIcon(friendsLocationList[item.memberId] !== undefined && friendsLocationList[item.memberId].isVisible, item) },
            { isIconImage: true, imgSrc: require('../../../assets/img/chat.png'), id: 4, onPressActions: () => this.openChatPage(item), imgStyle: { height: 23, width: 26, marginTop: 6 } }]
        }
    }

    openDeleteModal = () => this.setState({ showDeleteModal: true });

    hideDeleteModal = () => this.setState({ showDeleteModal: false });

    render() {
        const { searchQuery, showOptionsModal, showDeleteModal } = this.state;
        const { user, currentGroup, friendsLocationList, showLoader, apiCallsInProgress } = this.props;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        let filteredMembers = []
        filteredMembers = searchQuery === '' ? currentGroup.groupMembers : currentGroup.groupMembers.filter(member => {
            return (member.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 ||
                (member.nickname ? member.nickname.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 : false))
        });

        return currentGroup === null
            ? <View style={styles.fill} />
            : <BasePage showLoader={showLoader} heading={currentGroup.groupName ? currentGroup.groupName : ''}
                headerRightIconProps={{ reverse: false, name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 19 }, onPress: this.showOptionsModal }}>
                <KeyboardAvoidingView keyboardVerticalOffset={20} behavior={IS_ANDROID ? null : 'padding'} style={styles.fill}>
                    <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={showOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                        <View style={APP_COMMON_STYLES.optionsContainer}>
                            {
                                currentGroup.groupMembers.length > 0 && currentGroup.groupMembers[0].isAdmin
                                    ? <LinkButton disabled={apiCallsInProgress[this.props.currentGroup.groupId]} style={APP_COMMON_STYLES.optionBtn} title='EDIT GROUP' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.editGroup} />
                                    : null
                            }
                            {
                                currentGroup.groupMembers.length > 0 && currentGroup.groupMembers[0].isAdmin ?
                                    <LinkButton style={APP_COMMON_STYLES.optionBtn} title='DELETE GROUP' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openDeleteModal} />
                                    : null
                            }
                            {
                                currentGroup.groupMembers.length > 0 && currentGroup.groupMembers[0].isAdmin
                                    ? null
                                    : <LinkButton style={APP_COMMON_STYLES.optionBtn} title='LEAVE GROUP' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.exitGroup} />
                            }
                            <BaseModal containerStyle={{ justifyContent: 'center', alignItems: 'center' }} isVisible={showDeleteModal} onCancel={this.hideDeleteModal} >
                                <View style={styles.deleteBoxCont}>
                                    <DefaultText style={styles.deleteTitle}>Delete Group</DefaultText>
                                    <DefaultText numberOfLines={3} style={styles.deleteText}>Are you sure You Want to delete this Group? You will not be able to undo this action</DefaultText>
                                    <View style={styles.btnContainer}>
                                        <BasicButton title='CANCEL' style={[styles.actionBtn, { backgroundColor: '#8D8D8D' }]} titleStyle={styles.actionBtnTxt} onPress={this.hideDeleteModal} />
                                        <BasicButton title='CONFIRM' style={styles.actionBtn} titleStyle={styles.actionBtnTxt} onPress={this.deleteGroup} />
                                    </View>
                                </View>
                            </BaseModal>
                        </View>
                    </BaseModal>

                    <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ flexGrow: 0 }}>
                        <View style={styles.profilePic}>
                            <Image source={currentGroup.profilePictureId ? { uri: `${GET_PICTURE_BY_ID}${currentGroup.profilePictureId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}` } : require('../../../assets/img/profile-pic-placeholder.png')} style={styles.profilePicture} />
                            {
                                apiCallsInProgress[this.props.currentGroup.groupId] && <ImageLoader containerStyle={{ backgroundColor: 'transparent', alignSelf: 'center' }} show={apiCallsInProgress[this.props.currentGroup.groupId]} offsetTop={50} />
                            }
                        </View>
                        <SearchBoxFilter
                            searchQuery={searchQuery} onChangeSearchValue={this.onChangeSearchValue}
                            placeholder='Name' outerContainer={{ marginTop: 22, marginHorizontal: styles.container.marginHorizontal }}
                        />
                    </ScrollView>
                    <View style={styles.container}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={[{ paddingBottom: this.state.hasRemainingList ? 100 : 60 }, styles.friendList]}
                            keyboardShouldPersistTaps="handled"
                            data={filteredMembers}
                            listKey={this.memberKeyExtractor}
                            renderItem={({ item, index }) => (
                                <HorizontalCard
                                    horizontalCardPlaceholder={require('../../../assets/img/friend-profile-pic.png')}
                                    item={item}
                                    thumbnail={item.profilePictureId ? `${GET_PICTURE_BY_ID}${item.profilePictureId}` : null}
                                    onPressLeft={() => this.openFriendsProfileTab(item, index)}
                                    comingFrom={PageKeys.GROUP}
                                    cardOuterStyle={styles.HorizontalCardOuterStyle}
                                    actionsBar={{
                                        online: true,
                                        actions: item.memberId === user.userId
                                            ? [{ name: 'search', id: 2, type: 'FontAwesome', color: friendsLocationList[item.memberId] !== undefined && friendsLocationList[item.memberId].isVisible ? '#2B77B4' : '#C4C6C8', onPressActions: () => this.toggleFriendsLocation(friendsLocationList[item.memberId] !== undefined && friendsLocationList[item.memberId].isVisible, item) },
                                            { name: 'location-arrow', id: 3, type: 'FontAwesome', color: item.locationEnable ? '#81BA41' : '#C4C6C8', onPressActions: () => this.onPressNavigationIcon(friendsLocationList[item.memberId] !== undefined && friendsLocationList[item.memberId].isVisible, item) },]
                                            : this.getActions(item)
                                    }}
                                />
                            )
                            }
                            ListFooterComponent={this.renderFooter}
                            onEndReached={this.loadMoreData}
                            onEndReachedThreshold={0.1}
                        />
                        {
                            this.props.hasNetwork === false && currentGroup.groupMembers.length === 0 && <View style={{ flexDirection: 'column', justifyContent: 'space-between', position: 'absolute', top: heightPercentageToDP(5), left: widthPercentageToDP(20), height: 100, }}>
                                <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                                <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                            </View>
                        }
                    </View>
                </KeyboardAvoidingView>
            </BasePage>
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { currentGroup, friendGroupList } = state.FriendGroupList;
    const { friendsLocationList } = state.FriendList;
    const { showLoader, hasNetwork, lastApi, isRetryApi, apiCallsInProgress } = state.PageState;
    const { pageNumber } = state.PageState;
    return { user, currentGroup, showLoader, friendGroupList, pageNumber, hasNetwork, lastApi, isRetryApi, friendsLocationList, apiCallsInProgress };
};
const mapDispatchToProps = (dispatch) => {
    return {
        resetCurrentGroup: () => dispatch(resetCurrentGroupAction()),
        getGroupMembers: (groupId, userId, groupName, profilePictureId, toggleLoader, pageNumber, successCallback, errorCallback) => {
            toggleLoader && dispatch(apiLoaderActions(true))
            getGroupMembers(groupId, userId, false, pageNumber).then(res => {
                console.log('getGroupMembers success :', res.data)
                if (res.data.groupMembers.length > 0) {
                    dispatch(apiLoaderActions(false))
                    dispatch(resetMembersFromCurrentGroupAction({ members: res.data.groupMembers, groupId: groupId, groupName: groupName, profilePictureId: profilePictureId, pageNumber: pageNumber, userId: userId }))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    typeof successCallback === 'function' && successCallback(res.data)
                }
                else if (res.data.groupMembers.length === 0) {
                    dispatch(apiLoaderActions(false));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    successCallback(res.data)
                }
            }).catch(er => {
                console.log(`getGroupMembers error: `, er.response ? er.response : er);
                handleServiceErrors(er, [groupId, userId, groupName, profilePictureId, toggleLoader, pageNumber, successCallback, errorCallback], 'getGroupMembers', false, true)
                dispatch(apiLoaderActions(false))
            })
        },
        readNotification: (userId, notificationId) => dispatch(readNotification(userId, notificationId)),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
        exitFriendGroup: (groupId, memberId) => dispatch(exitFriendGroup(groupId, memberId)),
        hideFriendsLocation: (userId) => dispatch(hideFriendsLocationAction(userId)),
        getFriendsLocationList: (userId, friendsIdList, isTempLocation) => dispatch(getFriendsLocationList(userId, friendsIdList, isTempLocation)),
        changeScreen: (screenProps) => dispatch(screenChangeAction(screenProps)),
        addFavorite: (userId, senderId) => dispatch(addFavorite(userId, senderId, true)),
        removeFavorite: (userId, senderId) => dispatch(removeFavorite(userId, senderId, true)),
        deleteFriendGroup: (groupId) => deleteFriendGroup(groupId).then(res => {
            console.log('deleteFriendGroup : ', res)
            dispatch(removeFriendGroupAction(groupId))
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
        }).catch(er => {
            handleServiceErrors(er, [groupId], 'deleteFriendGroup', false, true);
        }),
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'group', isRetryApi: state })),
        sendFriendRequest: (requestBody) => dispatch(sendFriendRequest(requestBody, (res) => {
            dispatch(updateGroupMembersAction({ memberId: requestBody.userId, relationship: RELATIONSHIP.SENT_REQUEST }))
        }, (error) => {
            console.log('sendFriendRequest error: ', error)
        })),
        cancelRequest: (userId, personId) => dispatch(cancelFriendRequest(userId, personId, (res) => {
            dispatch(updateGroupMembersAction({ memberId: personId, relationship: RELATIONSHIP.UNKNOWN }))
        }, (error) => {
            console.log('cancelFriendRequest error: ', error)
        })),
        approvedRequest: (userId, personId, actionDate) => dispatch(approveFriendRequest(userId, personId, actionDate, (res) => {
            dispatch(updateGroupMembersAction({ memberId: personId, relationship: RELATIONSHIP.FRIEND }))
        }, (error) => {
            console.log('approveFriendRequest error: ', error)
        })),
        rejectRequest: (userId, personId) => dispatch(rejectFriendRequest(userId, personId, (res) => {
            dispatch(updateGroupMembersAction({ memberId: personId, relationship: RELATIONSHIP.UNKNOWN }))
        }, (error) => {
            console.log('rejectFriendRequest error: ', error)
        })),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(Group);