import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, ImageBackground, Image, TouchableOpacity, Alert } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { APP_COMMON_STYLES, PageKeys, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, widthPercentageToDP, CUSTOM_FONTS, GET_PICTURE_BY_ID, RELATIONSHIP, IS_ANDROID, heightPercentageToDP, } from '../../../constants';
import { deletePassenger, handleServiceErrors, getUserProfile, cancelFriendRequest, approveFriendRequest, rejectFriendRequest, sendFriendRequest } from '../../../api';
import { BaseModal, GesturedCarouselModal } from '../../../components/modal';
import { apiLoaderActions, removeFromPassengerListAction, resetErrorHandlingAction, updateSearchListAction, updateFriendRequestResponseAction, setCurrentFriendAction } from '../../../actions';
import { BasicButton, LinkButton } from '../../../components/buttons';
import { DefaultText } from '../../../components/labels';
import { getFormattedDateFromISO } from '../../../util';
import { getCurrentPassengerState } from '../../../selectors';
import { BasePage } from '../../../components/pages';
import FitImage from 'react-native-fit-image';
import ImageViewer from 'react-native-image-viewing'
import { Icon as NBIcon } from 'native-base';

class PassengersProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPassenger: null,
            showOptionsModal: false,
            isVisbleFullImage: false,
            status: this.props.person ? this.props.person.relationship : RELATIONSHIP.UNKNOWN,
            showRequestModal:false,
            showDeleteModal:false
        };
    }

    componentDidMount() {
        if (this.props.isUnknown) {
            this.props.getUserProfile(this.props.user.userId, this.props.person.userId, (res) => {
                this.setState({ status: res.relationship })
                Actions.refresh({ currentPassenger: res })
            });
        }
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

    onPressBackButton = () => Actions.pop();

    renderAddress() {
        const { homeAddress } = this.props.currentPassenger;
        if (!homeAddress) return null;
        let address = '';
        if (homeAddress.city && homeAddress.state) address = `${homeAddress.city}, ${homeAddress.state}`;
        else address = homeAddress.city ? homeAddress.city : homeAddress.state;
        return <DefaultText fontFamily={CUSTOM_FONTS.robotoSlabBold}>{address}</DefaultText >
    }

    showOptionsModal = () => this.setState({ showOptionsModal: true });

    hideOptionsModal = () => this.setState({ showOptionsModal: false });

    openPassengerEditForm = () => {
        this.setState({ showOptionsModal: false });
        return Actions.push(PageKeys.PASSENGER_FORM, { passengerIdx: this.props.currentPassenger.currentPassengerIndex })
    }

    removePassenger = () => {
        this.props.deletePassenger(this.props.currentPassenger.passengerId, (res) => {
            this.setState({showDeleteModal:false, showOptionsModal: false },()=>{
                this.onPressBackButton()
            });
        });

        
    }

    showFullImage = () => this.setState({ isVisbleFullImage: true });

    onCancelFullImage = () => this.setState({ isVisbleFullImage: false });

    sendFriendRequest = () => {
        const { user } = this.props;
        const requestBody = {
            senderId: user.userId,
            senderName: user.name,
            senderNickname: user.nickname,
            senderEmail: user.email,
            userId: this.props.currentPassenger.userId,
            name: this.props.currentPassenger.name,
            nickname: this.props.currentPassenger.nickname,
            email: this.props.currentPassenger.email,
            actionDate: new Date().toISOString()
        };
        this.props.sendFriendRequest(requestBody, (res) => {
            this.setState({ status: RELATIONSHIP.SENT_REQUEST })
        });
        this.hideOptionsModal()
    }

    cancelingFriendRequest = () => {
        this.props.cancelRequest(this.props.user.userId, this.props.currentPassenger.userId, (res) => {
            this.setState({ status: RELATIONSHIP.UNKNOWN })
            this.hideRequestModal();
            this.hideOptionsModal()
        });
    }

    approvingFriendRequest = () => {
        this.props.approvedRequest(this.props.user.userId, this.props.currentPassenger.userId, new Date().toISOString(), (res) => {
            this.props.setCurrentFriend({ userId: this.props.currentPassenger.userId });
            Actions.replace(PageKeys.FRIENDS_PROFILE, { frienduserId: this.props.currentPassenger.userId });
        });
        this.hideOptionsModal()
    }
    rejectingFriendRequest = () => {
        this.props.rejectRequest(this.props.user.userId, this.props.currentPassenger.userId, (res) => {
            this.setState({ status: RELATIONSHIP.UNKNOWN })
        });
        this.hideOptionsModal()
    }


    renderOptions = () => {
        switch (this.state.status) {
            case RELATIONSHIP.SENT_REQUEST: return <View style={APP_COMMON_STYLES.optionsContainer}>
                <LinkButton style={APP_COMMON_STYLES.optionBtn} title='CANCEL REQUEST' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openRequestModal} />
            </View>
            case RELATIONSHIP.RECIEVED_REQUEST: return <View style={APP_COMMON_STYLES.optionsContainer}>
                <LinkButton style={APP_COMMON_STYLES.optionBtn} title='ACCEPT REQUEST' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.approvingFriendRequest} />
                <LinkButton style={APP_COMMON_STYLES.optionBtn} title='REJECT REQUEST' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.rejectingFriendRequest} />
            </View>
            default: return <View style={APP_COMMON_STYLES.optionsContainer}>
                <LinkButton style={APP_COMMON_STYLES.optionBtn} title='SEND REQUEST' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.sendFriendRequest} />
            </View>
        }
    }

    openRequestModal = () => this.setState({ showRequestModal: true, });

    hideRequestModal = () => this.setState({ showRequestModal: false});

    openDeleteModal = () => this.setState({ showDeleteModal: true });

    hideDeleteModal = () => this.setState({ showDeleteModal: false  });

    render() {
        const { currentPassenger, onPassenger, isUnknown } = this.props;
        const { showOptionsModal, isVisbleFullImage, showRequestModal, showDeleteModal } = this.state;
        if (!currentPassenger) return <BasePage />;
        return (
            <BasePage heading={currentPassenger.name}
                headerRightIconProps={onPassenger || isUnknown === true ? {
                    reverse: false, name: 'options', type: 'SimpleLineIcons', onPress: this.showOptionsModal, style: { color: '#fff', fontSize: 19 }
                } : null
                }>
                {/* {
                    currentPassenger.profilePictureId && <GesturedCarouselModal
                        isVisible={isVisbleFullImage}
                        onCancel={this.onCancelFullImage}
                        pictureIds={[{ id: currentPassenger.profilePictureId }]}
                        isGestureEnable={true}
                        isZoomEnable={true}
                    />
                } */}
                {
                 currentPassenger.profilePictureId  && <ImageViewer HeaderComponent={()=>{
                    return <View style={{height:IS_ANDROID?heightPercentageToDP(6):heightPercentageToDP(10),backgroundColor:'rgba(0, 0, 0, 0.37)',display:'flex',flexDirection:'row',justifyContent:'flex-end',alignItems:'flex-end'}}>
                        <View style={{width:50,height:50,display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                        <NBIcon name='close' fontSize={20}  style={{ color: '#fff'}} onPress={this.onCancelFullImage} />
                        </View>
                    </View>
                }} visible={isVisbleFullImage} onRequestClose={this.onCancelFullImage} images={[{ id: currentPassenger.profilePictureId }].map(image=>{
                        return {
                            ...image,uri: `${GET_PICTURE_BY_ID}${image.id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}`
                        }
                    })} imageIndex={0} />
                }
                < BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={showOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal} >
                    <View>
                    {
                        onPassenger ?
                            <View style={APP_COMMON_STYLES.optionsContainer}>
                                <LinkButton style={APP_COMMON_STYLES.optionBtn} title='EDIT' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openPassengerEditForm} />
                                <LinkButton style={APP_COMMON_STYLES.optionBtn} title='REMOVE PASSENGER' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openDeleteModal} />
                            </View>
                            :
                            this.renderOptions()
                    }
                    {
                        showRequestModal && <BaseModal containerStyle={{ justifyContent: 'center', alignItems: 'center' }} isVisible={showRequestModal} onCancel={this.hideRequestModal} >
                            <View style={styles.deleteBoxCont}>
                                <DefaultText style={styles.deleteTitle}>Cancel Friend Request</DefaultText>
                                <DefaultText numberOfLines={3} style={styles.deleteText}>{`Are you sure you want to cancel your friend request sent to ${currentPassenger.name}?`}</DefaultText>
                                <View style={styles.btnContainer}>
                                    <BasicButton title='CANCEL' style={[styles.actionBtn, { backgroundColor: '#8D8D8D' }]} titleStyle={styles.actionBtnTxt} onPress={this.hideRequestModal} />
                                    <BasicButton title='CONFIRM' style={styles.actionBtn} titleStyle={styles.actionBtnTxt} onPress={()=>this.cancelingFriendRequest()} />
                                </View>
                            </View>
                        </BaseModal>
                    }
                    {
                        showDeleteModal && <BaseModal containerStyle={{ justifyContent: 'center', alignItems: 'center' }} isVisible={showDeleteModal} onCancel={this.hideDeleteModal} >
                            <View style={styles.deleteBoxCont}>
                                <DefaultText style={styles.deleteTitle}>Remove Passenger</DefaultText>
                                <DefaultText numberOfLines={3} style={styles.deleteText}>{`Are you sure you want to remove ${this.props.currentPassenger.name} from your passenger’s list?`}</DefaultText>
                                <View style={styles.btnContainer}>
                                    <BasicButton title='CANCEL' style={[styles.actionBtn, { backgroundColor: '#8D8D8D' }]} titleStyle={styles.actionBtnTxt} onPress={this.hideDeleteModal} />
                                    <BasicButton title='CONFIRM' style={styles.actionBtn} titleStyle={styles.actionBtnTxt} onPress={()=>this.removePassenger()} />
                                </View>
                            </View>
                        </BaseModal>
                    }

                    </View>
                </BaseModal >
                <TouchableOpacity activeOpacity={1} onPress={currentPassenger.profilePictureId ? this.showFullImage : null} style={styles.profilePic}>
                    {currentPassenger.profilePictureId
                        ? <ImageBackground source={require('../../../assets/img/profile-bg.png')} style={styles.profileBG}>
                            <FitImage resizeMode='cover' source={{ uri: `${GET_PICTURE_BY_ID}${currentPassenger.profilePictureId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}` }} />
                        </ImageBackground>
                        : <Image source={require('../../../assets/img/profile-pic-placeholder.png')} style={{ height: null, width: null, flex: 1 }} />}
                </TouchableOpacity>
                <View style={{ height: 13 }}>
                    <ImageBackground source={require('../../../assets/img/profile-bg.png')} style={{ height: null, width: null, flex: 1, overflow: 'hidden' }} />
                </View>
                <View style={styles.contentContainer}>
                    {
                        isUnknown ? null
                            :
                            onPassenger
                                ? <View>
                                    <DefaultText style={styles.fieldLabel}>DOB</DefaultText>
                                    <DefaultText fontFamily={CUSTOM_FONTS.robotoSlabBold}>{currentPassenger.dob ? getFormattedDateFromISO(currentPassenger.dob) : ''}</DefaultText>
                                    <DefaultText style={[styles.fieldLabel, styles.fieldsGapVertical]}>PHONE</DefaultText>
                                    <DefaultText fontFamily={CUSTOM_FONTS.robotoSlabBold}>{currentPassenger.phoneNumber || ''}</DefaultText>
                                </View>
                                : null
                    }
                    <DefaultText style={[styles.fieldLabel, styles.fieldsGapVertical]}>LOCATION</DefaultText>
                    {this.renderAddress()}
                </View>
            </BasePage >
        );
    }
}

const mapStateToProps = (state, props) => {
    const { user } = state.UserAuth;
    const { hasNetwork, lastApi, isRetryApi } = state.PageState;
    if (props.isUnknown) {
        return { user, hasNetwork, lastApi, isRetryApi }
    }
    else {
        return { user, hasNetwork, lastApi, isRetryApi, currentPassenger: getCurrentPassengerState(state, props) };
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        deletePassenger: (passengerId, successCallback) => {
            dispatch(apiLoaderActions(true));
            deletePassenger(passengerId).then(res => {
                console.log("deletePassenger success: ", res.data);
                dispatch(apiLoaderActions(false));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                dispatch(removeFromPassengerListAction({passengerId}));
                successCallback()
            }).catch(er => {
                console.log(`deletePassenger error: `, er.response || er);
                handleServiceErrors(er, [passengerId, successCallback], 'deletePassenger', true, true);
                dispatch(apiLoaderActions(false));
            })
        },
        getUserProfile: (userId, friendId, successCallback) => getUserProfile(userId, friendId).then(res => {
            console.log('getUserProfile  : ', res.data)
            dispatch(apiLoaderActions(false));
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            successCallback(res.data)
        }).catch(er => {
            console.log(`getUserProfile error: `, er.response || er);
            dispatch(apiLoaderActions(false));
            handleServiceErrors(er, [userId, friendId, successCallback], 'getUserProfile', false, true);
        }),
        cancelRequest: (userId, personId, successCallback) => dispatch(cancelFriendRequest(userId, personId, (res) => {
            console.log('\n\n\n cancelFriendRequest : ', res);
            dispatch(updateSearchListAction({ userId: personId, relationship: RELATIONSHIP.UNKNOWN }))
            successCallback();
        }, (error) => {
        })),
        approvedRequest: (userId, personId, actionDate, successCallback) => dispatch(approveFriendRequest(userId, personId, actionDate, (res) => {
            console.log('\n\n\n approveFriendRequest : ', res);
            dispatch(updateSearchListAction({ userId: personId, relationship: RELATIONSHIP.FRIEND }));
            successCallback();
        }, (error) => {
        })),
        rejectRequest: (userId, personId, successCallback) => dispatch(rejectFriendRequest(userId, personId, (res) => {
            console.log('\n\n\n rejectFriendRequest : ', res);
            dispatch(updateSearchListAction({ userId: personId, relationship: RELATIONSHIP.UNKNOWN }));
            successCallback();
        }, (error) => {
        })),
        sendFriendRequest: (requestBody, successCallback) => dispatch(sendFriendRequest(requestBody, (res) => {
            console.log('\n\n\n sendFriendRequest : ', res);
            dispatch(updateSearchListAction({ userId: requestBody.userId, relationship: RELATIONSHIP.SENT_REQUEST }));
            successCallback()
        }, (error) => {
            dispatch(updateFriendRequestResponseAction({ error: error.response.data || "Something went wrong" }));
        })),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'friends_profile', isRetryApi: state })),
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
        marginHorizontal: 35,
        marginTop: 41
    },
    profileBG: {
        width: null,
        height: null,
        flex: 1,
        overflow: 'hidden',
    },
    profilePic: {
        height: 255,
        width: widthPercentageToDP(100),
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
    profilePicture: {
        height: null,
        width: null,
        flex: 1,
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    actionBtn: {
        height: 35,
        backgroundColor: '#2B77B4',
        width: 125,
        alignSelf: 'center',
        borderRadius: 20,
        marginTop: 20
    },
    actionBtnTxt: {
        letterSpacing: 1.4,
        fontSize: 14,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    deleteBoxCont: {
        height: 263,
        width: 327,
        backgroundColor: '#F4F4F4',
        borderRadius: 20,
        padding: 31,
        paddingRight: 40
    },
    deleteTitle: {
        color: '#585756',
        fontFamily: CUSTOM_FONTS.robotoBold,
        fontSize: 20
    },
    deleteText: {
        color: '#585756',
        fontFamily: CUSTOM_FONTS.roboto,
        fontSize: 17,
        letterSpacing: 0.17,
        marginTop: 30
    },
});