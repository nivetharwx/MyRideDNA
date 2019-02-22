//getAllOnlineFriends
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Animated, ScrollView, Text, Keyboard, FlatList, View, Image, ImageBackground, TouchableOpacity, TouchableNativeFeedback } from 'react-native';
import { getAllFriends, searchForFriend, sendFriendRequest, cancelFriendRequest, approveFriendRequest, rejectFriendRequest, doUnfriend } from '../../../api';
import { FRIEND_TYPE, widthPercentageToDP, APP_COMMON_STYLES, WindowDimensions, heightPercentageToDP, RELATIONSHIP } from '../../../constants';
import { BaseModal } from '../../../components/modal';
import { LinkButton } from '../../../components/buttons';
import { ThumbnailCard } from '../../../components/cards';
import { openFriendProfileAction } from '../../../actions';


class OnlineFriendsTab extends Component {
    FRIEND_OPTIONS = [{ text: 'Profile', id: 'profile', handler: () => { } }, { text: 'Rides', id: 'rides', handler: () => { } }, { text: `Show\nlocation`, id: 'location', handler: () => { } }, { text: 'Chat', id: 'chat', handler: () => { } }, { text: 'Call', id: 'call', handler: () => { } }, { text: 'Garage', id: 'garage', handler: () => { } }, { text: 'Unfreind', id: 'unfriend', handler: () => this.doUnfriend() }, { text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() }];
    UNKNOWN_OPTIONS = [{ text: 'Profile', id: 'profile', handler: () => { } }, { text: 'Rides', id: 'rides', handler: () => { } }, { text: 'Send\nRequest', id: 'sendRequest', handler: () => this.sendFriendRequest() }, { text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() }];
    SENT_REQUEST_OPTIONS = [{ text: 'Profile', id: 'profile', handler: () => { } }, { text: 'Rides', id: 'rides', handler: () => { } }, { text: 'Cancel\nRequest', id: 'cancelRequest', handler: () => this.cancelFriendRequest() }, { text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() }];
    RECEIVED_REQUEST_OPTIONS = [{ text: 'Profile', id: 'profile', handler: () => { } }, { text: 'Rides', id: 'rides', handler: () => { } }, { text: 'Accept\nRequest', id: 'acceptRequest', handler: () => { } }, { text: 'Reject\nRequest', id: 'rejectRequest', handler: () => { } }, { text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() }];
    allImageRef = [];
    oldPosition = {};
    position = new Animated.ValueXY();
    dimensions = new Animated.ValueXY();
    animation = new Animated.Value(0);
    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            isVisibleOptionsModal: false,
            selectedPerson: null,
            selectedPersonImg: null
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.allFriends !== this.props.allFriends) {
            if (prevState.isRefreshing === true) {
                this.setState({ isRefreshing: false });
            }
        }
        if (this.props.refreshContent === true && prevProps.refreshContent === false) {
            this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0);
        }
        if (prevProps.searchQuery !== this.props.searchQuery && this.props.searchQuery.slice(-1) !== '') {
            Keyboard.dismiss();
            this.props.searchForFriend(this.props.searchQuery, this.props.user.userId, 0);
        }
    }

    sendFriendRequest = (person) => {
        const { user } = this.props;
        const { selectedPerson } = this.state;
        person = person || selectedPerson;
        const requestBody = {
            senderId: user.userId,
            senderName: user.name,
            senderNickname: user.nickname,
            senderEmail: user.email,
            userId: person.userId,
            name: person.name,
            nickname: person.nickname,
            email: person.email,
            actionDate: new Date().toISOString()
        };
        if (this.state.isVisibleOptionsModal) this.onCancelOptionsModal();
        this.props.sendFriendRequest(requestBody, person.userId);
    }

    cancelFriendRequest = (person) => {
        const { user } = this.props;
        const { selectedPerson } = this.state;
        person = person || selectedPerson;
        this.props.cancelFriendRequest(user.userId, person.userId);
        if (this.state.isVisibleOptionsModal) this.onCancelOptionsModal();
    }

    approveFriendRequest = (person) => {
        const { user } = this.props;
        const { selectedPerson } = this.state;
        person = person || selectedPerson;
        this.props.approveFriendRequest(user.userId, person.userId, new Date().toISOString());
        if (this.state.isVisibleOptionsModal) this.onCancelOptionsModal();
    }

    rejectFriendRequest = (person) => {
        const { user } = this.props;
        const { selectedPerson } = this.state;
        person = person || selectedPerson;
        this.props.rejectFriendRequest(user.userId, person.userId);
        if (this.state.isVisibleOptionsModal) this.onCancelOptionsModal();
    }

    doUnfriend = (person) => {
        const { user } = this.props;
        const { selectedPerson } = this.state;
        person = person || selectedPerson;
        this.props.doUnfriend(user.userId, person.userId);
        if (this.state.isVisibleOptionsModal) this.onCancelOptionsModal();
    }

    onPullRefresh = () => {
        this.setState({ isRefreshing: true });
        // TODO: Do API call based on searchfriend or all friends
        this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, this.props.paginationNum)
    }

    showOptionsModal = (index) => {
        const person = this.props.searchQuery.trim().length > 0 ? this.props.searchFriendList[index] : this.props.allFriends[index];
        this.setState({ selectedPerson: person, isVisibleOptionsModal: true });
    }

    onCancelOptionsModal = () => this.setState({ isVisibleOptionsModal: false, selectedPerson: null })

    renderMenuOptions = () => {
        if (this.state.selectedPerson === null) return;
        let options = null;
        switch (this.state.selectedPerson.relationship) {
            case RELATIONSHIP.FRIEND:
                options = this.FRIEND_OPTIONS;
                break;
            case RELATIONSHIP.RECIEVED_REQUEST:
                options = this.RECEIVED_REQUEST_OPTIONS;
                break;
            case RELATIONSHIP.SENT_REQUEST:
                options = this.SENT_REQUEST_OPTIONS;
                break;
            case RELATIONSHIP.UNKNOWN:
                options = this.UNKNOWN_OPTIONS;
                break;
        }
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

    friendKeyExtractor = (item) => item.userId;

    getActionsForRelationship = (person) => {
        switch (person.relationship) {
            case RELATIONSHIP.FRIEND:
                return null;
            case RELATIONSHIP.RECIEVED_REQUEST:
                return [
                    { title: 'Accept', onPress: () => this.approveFriendRequest(person), titleStyle: styles.relationshipAction },
                    { title: 'Reject', onPress: () => this.rejectFriendRequest(person), titleStyle: styles.relationshipAction },
                ]
            case RELATIONSHIP.SENT_REQUEST:
                return [
                    { title: 'Cancel Request', onPress: () => this.cancelFriendRequest(person), titleStyle: styles.relationshipAction }
                ]
            case RELATIONSHIP.UNKNOWN:
                return [
                    { title: 'Send Request', onPress: () => this.sendFriendRequest(person), titleStyle: styles.relationshipAction }
                ]
        }
    }

    openProfile = (index) => {
        const person = this.props.searchQuery.trim().length > 0 ? this.props.searchFriendList[index] : this.props.allFriends[index];
        this.allImageRef[index].measure((x, y, width, height, pageX, pageY) => {
            const userInfo = { userId: person.userId, image: require('../../../assets/img/friend-profile-pic.png') };
            const oldPosition = { pageX, pageY, width, height };
            this.props.openUserProfile({ userInfo, oldPosition });
        });
    }

    render() {
        const { isVisibleOptionsModal } = this.state;
        const { user, onlineFriends } = this.props;

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
                    onlineFriends.length === 0
                        ? <ImageBackground source={require('../../../assets/img/profile-bg.png')} style={styles.backgroundImage} />
                        : <FlatList
                            style={{ flexDirection: 'column' }}
                            contentContainerStyle={styles.friendList}
                            numColumns={2}
                            data={onlineFriends}
                            keyExtractor={this.friendKeyExtractor}
                            renderItem={({ item, index }) => (
                                <ThumbnailCard
                                    thumbnailPlaceholder={require('../../../assets/img/friend-profile-pic.png')}
                                    item={item}
                                    onLongPress={() => this.showOptionsModal(index)}
                                />
                            )}
                        />
                }
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { onlineFriends } = state.FriendList;
    return { user, onlineFriends };
};
const mapDispatchToProps = (dispatch) => {
    return {
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(OnlineFriendsTab);

const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    backgroundImage: {
        height: null,
        width: null,
        flex: 1
    },
    friendList: {
        marginHorizontal: widthPercentageToDP(5),
        paddingTop: widthPercentageToDP(5)
    },
});