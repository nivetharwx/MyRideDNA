import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, FlatList, View, ActivityIndicator, Animated, Easing } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, PageKeys, GET_PICTURE_BY_ID, THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG, RELATIONSHIP } from '../../constants';
import { getPassengersById } from '../../api';
import { SquareCard } from '../../components/cards';
import { DefaultText } from '../../components/labels';
import { setCurrentFriendAction, goToPrevProfileAction, resetPersonProfileAction } from '../../actions';
import { BasePage } from '../../components/pages';
import { getCurrentProfileState } from '../../selectors';
import { IconButton } from '../../components/buttons';

class BuddyPassengers extends Component {
    _screenIndex = null;
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            spinValue: new Animated.Value(0),
            pageNumber: 1,
            showBlockingLoader: false
        };
    }

    componentDidMount() {
        this._screenIndex = this.props.screens.length;
        this.props.getPassengersById(this.props.user.userId, this.props.person.userId, 0, this.props.person.passengerList, (res) => {
            if (res.passengerList.length > 0) {
                this.setState({ pageNumber: 1, hasRemainingList: res.remainingList > 0 })
            }
        }, (err) => { });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.screens.length > this.props.screens.length) {
            if (this.props.screens.length === this._screenIndex) {
                if (!this.props.person.isFriend) {
                    this.onPressBackButton();
                } else this.setState({ showBlockingLoader: false });
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
                this.props.getPassengerList(this.props.user.userId, 0, 10, (res) => { }, (err) => { });
            }
        });
    }

    onPressBackButton = () => {
        Actions.pop();
        this.props.goToPrevProfile();
    }

    passengerKeyExtractor = (item) => item.passengerId;

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.isLoading === true || distanceFromEnd < 0) return;
        this.setState((prevState) => ({ isLoading: true }), () => {
            this.props.getPassengersById(this.props.user.userId, this.props.person.userId, this.state.pageNumber, this.props.person.passengerList, (res) => {
                if (res.passengerList.length > 0) {
                    this.setState({ pageNumber: this.state.pageNumber + 1, hasRemainingList: res.remainingList > 0, isLoading: false })
                } else this.setState({ isLoading: false });
            }, (error) => this.setState({ isLoading: false }));
        });
    }

    renderFooter = () => {
        return this.state.isLoading
            ? (<View style={{ paddingVertical: 20, borderTopWidth: 1, borderColor: "#CED0CE" }}>
                <ActivityIndicator animating size="large" />
            </View>)
            : null
    }

    openPassengerProfile = (item, index) => {
        if (item.isFriend) {
            if (item.passengerUserId === this.props.user.userId) {
                Actions.push(PageKeys.PROFILE, { tabProps: { activeTab: 0 } });
            }
            else if (item.relationship === RELATIONSHIP.FRIEND) {
                this.setState({ showBlockingLoader: true });
                this.props.setCurrentFriend({ userId: item.passengerUserId });
                Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: item.passengerUserId, passengerId: item.passengerId, isPassenger:item.isPassenger });
            }
            else {
                Actions.push(PageKeys.PASSENGER_PROFILE, { isUnknown: true, person: { ...item, userId: item.passengerUserId } })
            }
        } else {
            Actions.push(PageKeys.PASSENGER_PROFILE, { passengerId: item.passengerId, onPassenger: false });
        }
    }

    render() {
        const { person, showLoader } = this.props;
        const { showBlockingLoader } = this.state;
        const spin = this.state.spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
        return (
            <BasePage heading={'Passengers'} showLoader={showLoader || showBlockingLoader}>
                <FlatList
                    contentContainerStyle={[{ paddingBottom: this.state.hasRemainingList ? 40 : 0 }, styles.contentContainer]}
                    keyboardShouldPersistTaps={'handled'}
                    showsVerticalScrollIndicator={false}
                    style={{ flexDirection: 'column' }}
                    columnWrapperStyle={styles.columnWrapper}
                    numColumns={2}
                    data={person.passengerList}
                    keyExtractor={this.passengerKeyExtractor}
                    renderItem={({ item, index }) => (
                        <SquareCard
                            image={item.profilePictureId ? `${GET_PICTURE_BY_ID}${item.profilePictureId.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` : null}
                            placeholderImage={require('../../assets/img/profile-pic-placeholder.png')}
                            title={item.name}
                            subtitle={item.homeAddress ? (item.homeAddress.city && item.homeAddress.state) ? `${item.homeAddress.city}, ${item.homeAddress.state}` : item.homeAddress.city ? item.homeAddress.city : item.homeAddress.state : null}
                            onPress={() => this.openPassengerProfile(item, index)}
                            imageStyle={styles.imageStyle}
                        />
                    )}
                    ListFooterComponent={this.renderFooter}
                    onEndReached={this.loadMoreData}
                    onEndReachedThreshold={0.1}
                />
                {
                    this.props.hasNetwork === false && ((person.passengerList && person.passengerList.length === 0) || !person.passengerList) && <View style={{ flexDirection: 'column', justifyContent: 'space-between', height: 100, position: 'absolute', top: heightPercentageToDP(20), left: widthPercentageToDP(20) }}>
                        <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                        <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                    </View>
                }
            </BasePage>
        );
    }
}
const mapStateToProps = (state, props) => {
    const { user } = state.UserAuth;
    const { showLoader, hasNetwork, lastApi } = state.PageState;
    const { screens } = state.FriendsProfiles;
    return { user, showLoader, hasNetwork, lastApi, screens, person: getCurrentProfileState(state, props) };
}
const mapDispatchToProps = (dispatch) => {
    return {
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
        getPassengersById: (userId, friendId, pageNumber, passengerList, successCallback, errorCallback) => dispatch(getPassengersById(userId, friendId, pageNumber, passengerList, successCallback, errorCallback)),
        goToPrevProfile: () => dispatch(goToPrevProfileAction()),
        resetPersonProfile: () => dispatch(resetPersonProfileAction()),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(BuddyPassengers);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    contentContainer: {
        paddingTop: APP_COMMON_STYLES.statusBar.height
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: heightPercentageToDP(4),
        marginHorizontal: 25
    },
    imageStyle: {
        height: widthPercentageToDP(40),
        width: widthPercentageToDP(40)
    }
});