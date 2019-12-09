import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, TouchableWithoutFeedback, StatusBar, FlatList, ScrollView, View, Keyboard, Alert, TextInput, Text, ActivityIndicator, Animated, Easing } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { DatePicker, Icon as NBIcon, Toast, ListItem, Left, Body, Right, Thumbnail } from 'native-base';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, PageKeys, GET_PICTURE_BY_ID } from '../../constants';
import { getPassengersById, getPictureList } from '../../api';
import { BasicHeader } from '../../components/headers';
import { SquareCard } from '../../components/cards';
import { DefaultText } from '../../components/labels';
import { Loader } from '../../components/loader';
import { ShifterButton } from '../../components/buttons';
import { setCurrentFriendAction, goToPrevProfileAction, resetPersonProfileAction, updatePicturesAction } from '../../actions';

class BuddyPassengers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoadingData: false,
            isLoading: false,
            spinValue: new Animated.Value(0),
            pageNumber: 1
        };
    }

    componentDidMount() {
        // this.props.getPassengerList(this.props.user.userId, this.state.pageNumber, 10, (res) => {
        //     if (res.passengerList.length > 0) {
        //         this.setState({ pageNumber: this.state.pageNumber + 1 })
        //     }
        // }, (err) => {
        // });
    }

    componentDidUpdate(prevProps, prevState) {
        // if (prevProps.person.passengerList !== this.props.person.passengerList) {
        //     if (!this.isLoadingPassPic) {
        //         const passPicIdList = [];
        //         this.props.person.passengerList.forEach((passenger) => {
        //             if (!passenger.profilePicture && passenger.profilePictureId) {
        //                 passPicIdList.push(passenger.profilePictureId);
        //             }
        //         })
        //         if (passPicIdList.length > 0) {
        //             this.isLoadingPassPic = true;
        //             this.props.getPictureList(passPicIdList, 'passenger', () => this.isLoadingPassPic = false, () => this.isLoadingPassPic = false);
        //         }
        //     }
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
                this.props.getPassengerList(this.props.user.userId, 0, 10, (res) => {
                }, (err) => {
                });
            }
        });

    }

    onPressBackButton = () => Actions.pop();

    onPressBackButton = () => {
        Actions.pop()
        this.props.hasPrevProfiles
            ? this.props.goToPrevProfile()
            : this.props.resetPersonProfile();
    }


    onCancelOptionsModal = () => this.setState({ selectedPassenger: null, isVisibleOptionsModal: false })


    passengerKeyExtractor = (item) => item.passengerId;

    loadMoreData = () => {
        if (this.state.isLoadingData && this.state.isLoading === false) {
            this.setState({ isLoading: true, isLoadingData: false })
            this.props.getPassengersById(this.props.user.userId, this.props.person.userId, this.state.pageNumber, this.props.person.passengerList, (res) => {
                if (res.passengerList.length > 0) {
                    this.setState({ pageNumber: this.state.pageNumber + 1 })
                }
                this.setState({ isLoading: false })
            }, (error) => {
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


    openPassengerProfile = (item, index) => {
        if (item.isFriend) {
            this.props.setCurrentFriend({ userId: item.passengerUserId });
            Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: item.passengerUserId });
        }
        else {
            Actions.push(PageKeys.PASSENGER_PROFILE, { passengerIdx: index });
        }
    }
    toggleAppNavigation = () => this.props.showAppNavMenu();



    render() {
        const { user, person, showLoader } = this.props;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        return (
            <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={styles.fill}>
                    <BasicHeader
                        title='Passengers'
                        leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                    />
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingTop: 40 + APP_COMMON_STYLES.headerHeight }}
                        style={{ flexDirection: 'column' }}
                        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: heightPercentageToDP(4), marginHorizontal: 25 }}
                        numColumns={2}
                        data={person.passengerList}
                        keyExtractor={this.passengerKeyExtractor}
                        renderItem={({ item, index }) => (
                            <SquareCard
                                // TODO: Have to request portrait image here
                                image={item.profilePictureId ? `${GET_PICTURE_BY_ID}${item.profilePictureId}` : null}
                                placeholderImage={require('../../assets/img/profile-pic.png')}
                                title={item.name}
                                subtitle={item.homeAddress && item.homeAddress.city && item.homeAddress.state ? `${item.homeAddress.city}, ${item.homeAddress.state}` : item.homeAddress.city ? item.homeAddress.city : item.homeAddress.state}
                                onPress={() => this.openPassengerProfile(item, index)}
                                imageStyle={{ height: widthPercentageToDP(40), width: widthPercentageToDP(40) }}
                            />
                        )}
                        ListFooterComponent={this.renderFooter}
                        onEndReached={this.loadMoreData}
                        onEndReachedThreshold={0.1}
                        onMomentumScrollBegin={() => this.setState({ isLoadingData: true })}
                    />

                    {
                        this.props.hasNetwork === false && person.passengerList.length === 0 && <View style={{ flex: 1, position: 'absolute', top: heightPercentageToDP(30) }}>
                            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(15), flex: 1, marginLeft: widthPercentageToDP(40) } }} onPress={this.retryApiFunction} />
                            </Animated.View>
                            <DefaultText style={{ marginLeft: widthPercentageToDP(13), fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</DefaultText>
                            <DefaultText style={{ marginTop: heightPercentageToDP(2), marginLeft: widthPercentageToDP(25) }}>Please connect to internet </DefaultText>
                        </View>
                    }

                </View>
                <Loader isVisible={showLoader} />
                <ShifterButton onPress={this.toggleAppNavigation} alignLeft={this.props.user.handDominance === 'left'} />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { showLoader, hasNetwork, lastApi } = state.PageState;
    const { person } = state.CurrentProfile;
    const hasPrevProfiles = state.CurrentProfile.prevProfiles.length > 0;
    return { user, showLoader, hasNetwork, lastApi, person, hasPrevProfiles };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        // getPictureList: (pictureIdList, callingFrom) => getPictureList(pictureIdList, (pictureObj) => {
        //     dispatch(updatePicturesAction({ pictureObj, type: callingFrom }))
        // }, (error) => {
        //     console.log('getPictureList error : ', error)
        // }),
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
});