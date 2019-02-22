import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Animated, ScrollView, Text, FlatList, View, Image, ImageBackground, TouchableOpacity, TouchableNativeFeedback } from 'react-native';
import { getAllFriends, searchForFriend, sendFriendRequest, cancelFriendRequest, approveFriendRequest, rejectFriendRequest, doUnfriend } from '../../../api';
import { FRIEND_TYPE, widthPercentageToDP, APP_COMMON_STYLES, WindowDimensions, heightPercentageToDP, RELATIONSHIP } from '../../../constants';
import { BaseModal } from '../../../components/modal';
import { LinkButton } from '../../../components/buttons';
import { ThumbnailCard } from '../../../components/cards';


class AllFriendsTab extends Component {
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
        this.setState({ selectedPerson: this.props.searchFriendList[index], isVisibleOptionsModal: true });
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
        this.allImageRef[index].measure((x, y, width, height, pageX, pageY) => {
            this.oldPosition.x = pageX;
            this.oldPosition.y = pageY;
            this.oldPosition.width = width;
            this.oldPosition.height = height;

            this.position.setValue({ x: pageX, y: pageY });
            this.dimensions.setValue({ x: width, y: height });
        });

        this.setState({ selectedPersonImg: require('../../../assets/img/friend-profile-pic.png') }, () => {
            this.viewImage.measure((dx, dy, dWidth, dHeight, dPageX, dPageY) => {
                Animated.parallel([
                    Animated.timing(this.position.x, {
                        toValue: (dWidth / 2) - (widthPercentageToDP(100) * 65 / 200),
                        duration: 300
                    }),
                    Animated.timing(this.position.y, {
                        toValue: heightPercentageToDP(100) * 10 / 100,
                        duration: 300
                    }),
                    Animated.timing(this.dimensions.x, {
                        toValue: widthPercentageToDP(100) * 65 / 100,
                        duration: 300
                    }),
                    Animated.timing(this.dimensions.y, {
                        toValue: widthPercentageToDP(100) * 65 / 100,
                        duration: 300
                    }),
                    Animated.timing(this.animation, {
                        toValue: 1,
                        duration: 300
                    }),
                ]).start();
            });
        });
    }

    closeProfile = () => {
        Animated.parallel([
            Animated.timing(this.position.x, {
                toValue: this.oldPosition.x,
                duration: 300
            }),
            Animated.timing(this.position.y, {
                toValue: this.oldPosition.y,
                duration: 300
            }),
            Animated.timing(this.dimensions.x, {
                toValue: this.oldPosition.width,
                duration: 300
            }),
            Animated.timing(this.dimensions.y, {
                toValue: this.oldPosition.height,
                duration: 300
            }),
            Animated.timing(this.animation, {
                toValue: 0,
                duration: 300
            }),
        ]).start(() => {
            this.setState({ selectedPersonImg: null });
        });
    }

    render() {
        const { isRefreshing, isVisibleOptionsModal } = this.state;
        const { allFriends, searchQuery, searchFriendList, user } = this.props;

        const activeImageStyle = {
            width: this.dimensions.x,
            height: this.dimensions.y,
            left: this.position.x,
            top: this.position.y
        };
        const animatedContentY = this.animation.interpolate({
            inputRange: [0, 1],
            outputRange: [-150, 0]
        });
        const animatedContentOpacity = this.animation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 1, 1]
        });
        const animatedContentStyle = {
            opacity: animatedContentOpacity,
            transform: [{
                translateY: animatedContentY
            }]
        };
        const animatedCrossOpacity = {
            opacity: this.animation
        };

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
                    searchQuery === ''
                        ? allFriends.length === 0
                            ? <ImageBackground source={require('../../../assets/img/profile-bg.png')} style={styles.backgroundImage} />
                            : <FlatList
                                style={{ flexDirection: 'column' }}
                                contentContainerStyle={styles.friendList}
                                numColumns={2}
                                data={allFriends}
                                refreshing={isRefreshing}
                                onRefresh={this.onPullRefresh}
                                keyExtractor={this.friendKeyExtractor}
                                renderItem={({ item, index }) => (
                                    <ThumbnailCard
                                        thumbnailPlaceholder={require('../../../assets/img/friend-profile-pic.png')}
                                        item={item}
                                        onLongPress={() => this.showOptionsModal(index)}
                                    />
                                )}
                            />
                        : searchFriendList.length === 0
                            ? <ImageBackground source={require('../../../assets/img/profile-bg.png')} style={styles.backgroundImage} />
                            : <FlatList
                                style={{ flexDirection: 'column' }}
                                contentContainerStyle={styles.friendList}
                                numColumns={2}
                                data={searchFriendList}
                                refreshing={isRefreshing}
                                onRefresh={this.onPullRefresh}
                                keyExtractor={this.friendKeyExtractor}
                                renderItem={({ item, index }) => (
                                    <ThumbnailCard
                                        thumbnailPlaceholder={require('../../../assets/img/friend-profile-pic.png')}
                                        item={item}
                                        onLongPress={() => this.openProfile(index)} //this.showOptionsModal(index)
                                        actions={this.getActionsForRelationship(item)}
                                        thumbnailRef={imgRef => this.allImageRef[index] = imgRef}
                                        onPress={() => this.openProfile(index)}
                                    />
                                )}
                            />
                }
                {/* <View style={StyleSheet.absoluteFill} pointerEvents={this.state.selectedPersonImg ? 'auto' : 'none'}>
                    <View style={{ flex: 2, zIndex: 1000 }} ref={elRef => this.viewImage = elRef}>
                        <ImageBackground style={{ flex: 1 }} source={this.state.selectedPersonImg ? require('../../../assets/img/profile-bg.png') : null}>
                            <Animated.Image
                                source={this.state.selectedPersonImg ? require('../../../assets/img/friend-profile-pic.png') : null}
                                style={[{ resizeMode: 'cover', top: 0, left: 0, height: null, width: null, borderRadius: 15 }, activeImageStyle]}
                            ></Animated.Image>
                        </ImageBackground>
                        <TouchableNativeFeedback onPress={this.closeProfile}>
                            <Animated.View style={[{ position: 'absolute', top: 30, right: 30 }, animatedCrossOpacity]}>
                                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>X</Text>
                            </Animated.View>
                        </TouchableNativeFeedback>
                    </View>
                    <Animated.View style={[{ flex: 1, zIndex: 900, backgroundColor: '#fff', padding: 20, paddingTop: 50, paddingBotton: 10 }, animatedContentStyle]}>
                        <Text>TESING TEXT CONTENT</Text>
                    </Animated.View>
                </View> */}
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { allFriends, paginationNum, searchFriendList } = state.FriendList;
    return { user, allFriends, paginationNum, searchFriendList };
};
const mapDispatchToProps = (dispatch) => {
    return {
        getAllFriends: (friendType, userId, pageNumber) => dispatch(getAllFriends(friendType, userId, pageNumber)),
        searchForFriend: (searchParam, userId, pageNumber) => dispatch(searchForFriend(searchParam, userId, pageNumber)),
        sendFriendRequest: (requestBody, personId) => dispatch(sendFriendRequest(requestBody, personId)),
        cancelFriendRequest: (userId, personId) => dispatch(cancelFriendRequest(userId, personId)),
        approveFriendRequest: (userId, personId, actionDate) => dispatch(approveFriendRequest(userId, personId, actionDate)),
        rejectFriendRequest: (userId, personId) => dispatch(rejectFriendRequest(userId, personId)),
        doUnfriend: (userId, personId) => dispatch(doUnfriend(userId, personId)),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(AllFriendsTab);

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
    relationshipAction: {
        color: APP_COMMON_STYLES.headerColor
    }
});