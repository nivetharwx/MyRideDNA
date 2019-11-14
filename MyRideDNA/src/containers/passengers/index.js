import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, TouchableWithoutFeedback, StatusBar, FlatList, ScrollView, View, Keyboard, Alert, TextInput, Text, ActivityIndicator, Animated, Easing } from 'react-native';
import { BasicHeader } from '../../components/headers';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, PageKeys, FRIEND_TYPE, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, PORTRAIT_TAIL_TAG } from '../../constants';
import { Actions } from 'react-native-router-flux';
import { LabeledInput, IconicList, IconicDatePicker, IconicInput } from '../../components/inputs';
import { BasicButton, LinkButton, IconButton, ShifterButton } from '../../components/buttons';
import { DatePicker, Icon as NBIcon, Toast, ListItem, Left, Body, Right, Thumbnail } from 'native-base';
import { BaseModal } from '../../components/modal';
import { getPassengerList, deletePassenger, getPictureList } from '../../api';
import { SmallCard, SquareCard } from '../../components/cards';
import { updatePassengerInListAction, appNavMenuVisibilityAction, setCurrentFriendAction } from '../../actions';
import { Loader } from '../../components/loader';


const roadbuddiesDummyData = [{ name: 'person1', id: '1' }, { name: 'person2', id: '2' }, { name: 'person3', id: '3' }, { name: 'person4', id: '4' }]
class Passengers extends Component {
    PASSENGER_OPTIONS = [{ text: 'Passenger Detail', id: 'passengerDetail', handler: () => this.openPassengerDetail() }, { text: 'Edit Passenger', id: 'edit', handler: () => this.openPassengerForm() }, { text: 'Remove Passenger', id: 'removePassenger', handler: () => this.showRemovePassengerConfirmation() }, { text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() }];
    constructor(props) {
        super(props);
        this.state = {
            selectedPassenger: null,
            isVisibleOptionsModal: false,
            isLoadingData: false,
            isLoading: false,
            spinValue: new Animated.Value(0),
            pageNumber: 0
        };
    }

    componentDidMount() {
        this.props.getPassengerList(this.props.user.userId, this.state.pageNumber, 10, (res) => {
            if (res.passengerList.length > 0) {
                this.setState({ pageNumber: this.state.pageNumber + 1 })
            }
        }, (err) => {
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.passengerList !== this.props.passengerList) {
            const pictureIdList = [];
            this.props.passengerList.forEach((friend) => {
                if (!friend.profilePicture && friend.profilePictureId) {
                    pictureIdList.push(friend.profilePictureId.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG));
                }
            })
            if (pictureIdList.length > 0) {
                this.props.getPictureList(pictureIdList, THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG);
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
                this.props.getPassengerList(this.props.user.userId, 0, 10, (res) => {
                }, (err) => {
                });
            }
        });

    }

    onPressBackButton = () => Actions.pop();

    showOptionsModal = (index) => {
        this.setState({ selectedPassenger: this.props.passengerList[index], isVisibleOptionsModal: true });
    }

    onCancelOptionsModal = () => this.setState({ selectedPassenger: null, isVisibleOptionsModal: false })

    renderMenuOptions = () => {
        if (this.state.selectedPassenger === null) return;
        // const options = [{ text: 'Edit Passenger', id: 'editPassenger', handler: () => this.openPassengerForm() }, { text: 'Remove Passenger', id: 'removePassenger', handler: () => this.showRemovePassengerConfirmation() }, { text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() }];
        var options = []
        if (this.state.selectedPassenger.isFriend) {
            options = [
                ...this.PASSENGER_OPTIONS.slice(0, 1),
                ...this.PASSENGER_OPTIONS.slice(2)
            ]
        }
        else {
            options = this.PASSENGER_OPTIONS
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

    openPassengerForm = () => {
        if (this.state.selectedPassenger) {
            const passengerIdx = this.props.passengerList.findIndex(passenger => passenger.passengerId === this.state.selectedPassenger.passengerId);
            Actions.push(PageKeys.PASSENGER_FORM, { passengerIdx });
        }
        else {
            Actions.push(PageKeys.PASSENGER_FORM, { passengerIdx: -1 });
        }
        this.onCancelOptionsModal();
    }

    showRemovePassengerConfirmation = () => {
        const { passengerId, name } = this.state.selectedPassenger;
        setTimeout(() => {
            Alert.alert(
                'Confirmation to remove passenger',
                `Are you sure to remove ${name}?`,
                [
                    {
                        text: 'Yes', onPress: () => {
                            this.props.deletePassenger(passengerId);
                            this.onCancelOptionsModal();
                        }
                    },
                    { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                ],
                { cancelable: false }
            );
        }, 100);
    }

    passengerKeyExtractor = (item) => {
        return item.passengerId
    }

    renderPassenger = ({ item, index }) => {
        return (
            // DOC: Removed native-base ListItem as TouchableNativeFeedback is not working in react-native 0.59.0
            <TouchableWithoutFeedback style={{ width: widthPercentageToDP(100), marginTop: 20 }} onLongPress={() => this.showOptionsModal(index)}>
                <View style={{ flex: 1, flexDirection: 'row', height: heightPercentageToDP(10) }}>
                    <View style={{ width: widthPercentageToDP(15), alignItems: 'center', justifyContent: 'center' }}>
                        {
                            item.groupProfilePictureThumbnail
                                ? <Thumbnail source={{ uri: 'Image URL' }} />
                                : <NBIcon active name="person" type='MaterialIcons' style={{ width: widthPercentageToDP(7) }} />
                        }
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' }}>
                        <Text>{item.name}</Text>
                    </View>
                    <View>
                        <Text note></Text>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    passengerListKeyExtractor = (item) => item.passengerId;

    loadMoreData = () => {
        if (this.state.isLoadingData && this.state.isLoading === false) {
            this.setState({ isLoading: true, isLoadingData: false })
            this.props.getPassengerList(this.props.user.userId, this.state.pageNumber, 10, (res) => {
                if (res.passengerList.length > 0) {
                    this.setState({ pageNumber: this.state.pageNumber + 1 })
                }
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

    openPassengerDetail = (item, index) => {
        if (this.state.selectedPassenger) {
            const passengerIdx = this.props.passengerList.findIndex(passenger => passenger.passengerId === this.state.selectedPassenger.passengerId);
            this.openPassengerProfile(this.state.selectedPassenger, passengerIdx)
        }
        this.onCancelOptionsModal();
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
        const { user, passengerList, showLoader } = this.props;
        const { isVisibleOptionsModal } = this.state;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        return (
            <View style={styles.fill}>
                <BaseModal isVisible={isVisibleOptionsModal} onCancel={this.onCancelOptionsModal} onPressOutside={this.onCancelOptionsModal}>
                    <View style={[APP_COMMON_STYLES.menuOptContainer, user.handDominance === 'left' ? APP_COMMON_STYLES.leftDominantCont : null]}>
                        {
                            this.renderMenuOptions()
                        }
                    </View>
                </BaseModal>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={styles.fill}>
                    <BasicHeader
                        title='Passengers'
                        leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                        rightIconProps={{ reverse: true, name: 'md-add', type: 'Ionicons', onPress: this.openPassengerForm, rightIconPropsStyle: styles.rightIconPropsStyle, style: { color: '#fff', fontSize: 19 } }}
                    />
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingTop: 40 + APP_COMMON_STYLES.headerHeight }}
                        style={{ flexDirection: 'column' }}
                        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: heightPercentageToDP(4), marginHorizontal: 25 }}
                        numColumns={2}
                        data={passengerList}
                        keyExtractor={this.passengerListKeyExtractor}
                        renderItem={({ item, index }) => (
                            <SquareCard
                                // containerStyle={{ marginHorizontal: 20 }}
                                squareCardPlaceholder={require('../../assets/img/profile-pic.png')}
                                item={item}
                                onLongPress={() => this.showOptionsModal(index)}
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
                        this.props.hasNetwork === false && passengerList.length === 0 && <View style={{ flex: 1, position: 'absolute', top: heightPercentageToDP(30) }}>
                            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(15), flex: 1, marginLeft: widthPercentageToDP(40) } }} onPress={this.retryApiFunction} />
                            </Animated.View>
                            <Text style={{ marginLeft: widthPercentageToDP(13), fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</Text>
                            <Text style={{ marginTop: heightPercentageToDP(2), marginLeft: widthPercentageToDP(25) }}>Please connect to internet </Text>
                        </View>
                    }

                </View>
                <Loader isVisible={showLoader} />
                {/* Shifter: - Brings the app navigation menu */}
                <ShifterButton onPress={this.toggleAppNavigation} alignLeft={this.props.user.handDominance === 'left'} />
            </View>
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
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        getPassengerList: (userId, pageNumber, preference, successCallback, errorCallback) => dispatch(getPassengerList(userId, pageNumber, preference, successCallback, errorCallback)),
        deletePassenger: (passengerId) => dispatch(deletePassenger(passengerId)),
        getPictureList: (pictureIdList, curImgSize, newImgSize) => getPictureList(pictureIdList, (pictureObj) => {
            // console.log('getPictureList all passenger sucess : ', pictureObj);
            dispatch(updatePassengerInListAction({ pictureObj, curImgSize, newImgSize }))
        }, (error) => {
            console.log('getPictureList all friend error : ', error)
            // dispatch(updateFriendInListAction({ userId: friendId }))
        }),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Passengers);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    form: {
        marginTop: APP_COMMON_STYLES.headerHeight,
    },
    formContent: {
        paddingTop: 20,
        flex: 1,
        justifyContent: 'space-around'
    },
    submitBtn: {
        height: heightPercentageToDP(8.5),
    },
    formFieldIcon: {
        color: '#999999'
    },
    addressInput: {
        width: '48%',
        borderBottomColor: '#D4D4D4',
        borderBottomWidth: 1
    },
    passengerList: {
        marginTop: APP_COMMON_STYLES.headerHeight
    },
    rightIconPropsStyle: {
        height: 27,
        width: 27,
        backgroundColor: '#F5891F',
        borderRadius: 13.5,
        marginRight: 10
    }
});