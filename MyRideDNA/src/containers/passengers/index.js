import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, FlatList, View, ActivityIndicator, Animated, Easing } from 'react-native';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, PageKeys, THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG, GET_PICTURE_BY_ID } from '../../constants';
import { Actions } from 'react-native-router-flux';
import { IconButton } from '../../components/buttons';
import { getPassengerList, } from '../../api';
import { SquareCard } from '../../components/cards';
import { setCurrentFriendAction } from '../../actions';
import { DefaultText } from '../../components/labels';
import { BasePage } from '../../components/pages';


class Passengers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            spinValue: new Animated.Value(0),
            pageNumber: 0,
            hasRemainingList: false
        };
    }

    componentDidMount() {
        this.props.getPassengerList(this.props.user.userId, this.state.pageNumber, 10, (res) => {
            if (res.passengerList.length > 0) {
                this.setState({ pageNumber: this.state.pageNumber + 1, hasRemainingList: res.remainingList > 0 })
            }
        }, (err) => {
        });
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
                this.props.getPassengerList(this.props.user.userId, 0, 10, (res) => {
                    this.setState({ hasRemainingList: res.remainingList > 0 })
                }, (err) => {
                });
            }
        });

    }

    onPressBackButton = () => Actions.pop();

    passengerKeyExtractor = (item) => item.passengerId;

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.isLoading === true || distanceFromEnd < 0) return;
        this.setState((prevState) => ({ isLoading: true }), () => {
            this.props.getPassengerList(this.props.user.userId, this.state.pageNumber, 10, (res) => {
                if (res.passengerList.length > 0) {
                    this.setState({ pageNumber: this.state.pageNumber + 1, hasRemainingList: res.remainingList > 0 })
                }
                this.setState({ isLoading: false })
            }, (er) => {
                this.setState({ isLoading: false })
            });
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

    openPassengerProfile = (item, index) => {
        if (item.isFriend) {
            this.props.setCurrentFriend({ userId: item.passengerUserId });
            Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: item.passengerUserId, passengerId: item.passengerId });
        }
        else {
            Actions.push(PageKeys.PASSENGER_PROFILE, { passengerId: item.passengerId, onPassenger: true });
        }
    }

    openPsngFrom = () => {
        Actions.push(PageKeys.PASSENGER_FORM, { passengerIdx: -1 })
    }

    render() {
        const { user, passengerList, showLoader } = this.props;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        return (
            <BasePage showLoader={showLoader}
                heading={'Passengers'}
                headerRightIconProps={{ reverse: true, name: 'md-add', type: 'Ionicons', containerStyle: styles.rightIconPropsStyle, style: styles.addIcon, onPress: this.openPsngFrom }}>
                <FlatList
                    contentContainerStyle={{ paddingBottom: this.state.hasRemainingList ? 40 : 0, marginTop: APP_COMMON_STYLES.statusBar.height }}
                    showsVerticalScrollIndicator={false}
                    style={{ flexDirection: 'column' }}
                    columnWrapperStyle={styles.columnWrapper}
                    numColumns={2}
                    data={passengerList}
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
                    this.props.hasNetwork === false && passengerList.length === 0 && <View style={{ flexDirection: 'column', justifyContent: 'space-between', position: 'absolute', top: heightPercentageToDP(20), left: widthPercentageToDP(27), height: 100, }}>
                        <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                        <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                    </View>
                }
            </BasePage>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { passengerList } = state.PassengerList;
    const { showLoader, hasNetwork, lastApi } = state.PageState;
    return { user, passengerList, showLoader, hasNetwork, lastApi };
}
const mapDispatchToProps = (dispatch) => {
    return {
        getPassengerList: (userId, pageNumber, preference, successCallback, errorCallback) => dispatch(getPassengerList(userId, pageNumber, preference, successCallback, errorCallback)),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Passengers);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    rightIconPropsStyle: {
        height: 27,
        width: 27,
        backgroundColor: '#F5891F',
        borderRadius: 13.5
    },
    addIcon: {
        color: '#fff',
        fontSize: 19
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