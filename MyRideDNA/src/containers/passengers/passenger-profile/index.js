import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Platform, TouchableWithoutFeedback, StatusBar, FlatList, ScrollView, View, Keyboard, Alert, TextInput, Text, ActivityIndicator, Animated, Easing, ImageBackground } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { DatePicker, Icon as NBIcon, Toast, ListItem, Left, Body, Right, Thumbnail } from 'native-base';
import { BasicHeader } from '../../../components/headers';
import { APP_COMMON_STYLES, PageKeys, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, heightPercentageToDP, IS_ANDROID, WindowDimensions, widthPercentageToDP, CUSTOM_FONTS } from '../../../constants';
import { getPassengerList, getPicture } from '../../../api';
import { BaseModal } from '../../../components/modal';
import { getPassengerInfoAction, updateCurrentPassengerAction, resetCurrentPassengerAction, appNavMenuVisibilityAction } from '../../../actions';
import { ImageLoader } from '../../../components/loader';
import { IconButton, ShifterButton } from '../../../components/buttons';
import { DefaultText } from '../../../components/labels';
import { getFormattedDateFromISO } from '../../../util';

const hasIOSAbove10 = parseInt(Platform.Version) > 10;

class PassengersProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPassenger: null,
            isVisibleOptionsModal: false,
            isLoadingData: false,
            isLoading: false,
            spinValue: new Animated.Value(0),
            isLoadingProfPic: false,
        };
    }

    componentDidMount() {
        this.props.getPassengerInfo(this.props.passengerIdx);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.currentPassenger !== this.props.currentPassenger) {
            if (this.props.currentPassenger.passengerId === null) {
                Actions.pop();
                return;
            }
            if (!this.props.currentPassenger.profilePicture && this.props.currentPassenger.profilePictureId) {
                this.setState({ isLoadingProfPic: true })
                this.props.getProfilePicture(this.props.currentPassenger.profilePictureId.replace(THUMBNAIL_TAIL_TAG, ''))
            }
            else {
                this.setState({ isLoadingProfPic: false })
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

    onPressBackButton = () => {
        this.props.resetCurrentPassenger()
    }

    showOptionsModal = (index) => {
        this.setState({ selectedPassenger: this.props.passengerList[index], isVisibleOptionsModal: true });
    }

    onCancelOptionsModal = () => this.setState({ selectedPassenger: null, isVisibleOptionsModal: false })

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

    showAppNavMenu = () => this.props.showAppNavMenu();

    loadMoreData = () => {
        if (this.state.isLoadingData && this.state.isLoading === false) {
            this.setState({ isLoading: true, isLoadingData: false })
            this.props.getPassengerList(this.props.user.userId, this.props.pageNumber, 10, (res) => {
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

    renderAddress() {
        const { homeAddress } = this.props.currentPassenger;
        if (!homeAddress) return null;
        let address = '';
        if (homeAddress.city && homeAddress.state) address = `${homeAddress.city}, ${homeAddress.state}`;
        else address = homeAddress.city ? homeAddress.city : homeAddress.state;
        return <DefaultText fontFamily={CUSTOM_FONTS.robotoSlabBold}>{address}</DefaultText >
    }

    render() {
        const { user, currentPassenger } = this.props;
        const { isLoadingProfPic } = this.state;
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
                        title={currentPassenger.name || ''}
                        leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                    />
                    <ImageBackground source={require('../../../assets/img/profile-bg.png')} style={styles.profileBG}>
                        <View style={styles.profilePic}>
                            <ImageBackground source={currentPassenger.profilePicture ? { uri: currentPassenger.profilePicture } : require('../../../assets/img/profile-pic.png')} style={{ height: null, width: null, flex: 1, borderRadius: 5 }}>
                                {/* <ImageBackground source={require('../../../assets/img/profile-pic.png')} style={{ height: null, width: null, flex: 1, borderRadius: 5 }}> */}
                                {
                                    isLoadingProfPic
                                        ? <ImageLoader show={isLoadingProfPic} />
                                        : null
                                }
                            </ImageBackground>
                        </View>
                    </ImageBackground>
                    <IconButton iconProps={{ name: 'account-edit', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(8), color: '#f69039' } }}
                        style={styles.editPassenger} onPress={() => Actions.push(PageKeys.PASSENGER_FORM, { passengerIdx: this.props.passengerIdx })} />
                    <View style={styles.contentContainer}>
                        <DefaultText style={styles.fieldLabel}>DOB</DefaultText>
                        <DefaultText fontFamily={CUSTOM_FONTS.robotoSlabBold}>{currentPassenger.dob ? getFormattedDateFromISO(currentPassenger.dob) : ''}</DefaultText>
                        <DefaultText style={[styles.fieldLabel, styles.fieldsGapVertical]}>PHONE</DefaultText>
                        <DefaultText fontFamily={CUSTOM_FONTS.robotoSlabBold}>{currentPassenger.phoneNumber || ''}</DefaultText>
                        <DefaultText style={[styles.fieldLabel, styles.fieldsGapVertical]}>ADDRESS</DefaultText>
                        {this.renderAddress()}
                    </View>
                </View>
                {/* Shifter: - Brings the app navigation menu */}
                <ShifterButton onPress={this.showAppNavMenu} alignLeft={user.handDominance === 'left'} />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { passengerList, currentPassenger } = state.PassengerList;
    const { showLoader, pageNumber, hasNetwork, lastApi } = state.PageState;
    return { user, passengerList, showLoader, pageNumber, hasNetwork, lastApi, currentPassenger };
}
const mapDispatchToProps = (dispatch) => {
    return {
        getPassengerInfo: (passengerId) => dispatch(getPassengerInfoAction(passengerId)),
        getProfilePicture: (pictureId) => getPicture(pictureId, ({ picture }) => {
            console.log('getPicture passenger profile success: ', picture)
            dispatch(updateCurrentPassengerAction({ profilePicture: picture }))
        }, (error) => {
            console.log('getPicture passenger profile error: ', error)
        }),
        resetCurrentPassenger: () => dispatch(resetCurrentPassengerAction()),
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(PassengersProfile);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    contentContainer: {
        flex: 1,
        marginHorizontal: 35
    },
    profileBG: {
        width: '100%',
        height: heightPercentageToDP(44),
        paddingTop: IS_ANDROID ? 0 : hasIOSAbove10 ? heightPercentageToDP(1.5) : 0
    },
    profilePic: {
        height: heightPercentageToDP(42),
        width: WindowDimensions.width,
        borderWidth: 1,
    },
    editPassenger: {
        marginTop: 15,
        marginRight: 25,
        justifyContent: 'flex-end',
    },
    fieldLabel: {
        fontSize: 8,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 1.6,
        color: '#707070'
    },
    fieldsGapVertical: {
        marginTop: 14
    },
});