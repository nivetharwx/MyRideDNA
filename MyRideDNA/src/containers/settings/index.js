import React, { Component } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Alert, TouchableHighlightBase } from 'react-native';
import { connect } from 'react-redux';
import styles from './styles';
import { APP_COMMON_STYLES, IS_ANDROID, widthPercentageToDP, heightPercentageToDP, CUSTOM_FONTS, PageKeys } from '../../constants';
import { SwitchIconButton, LinkButton, BasicButton } from '../../components/buttons';
import { Toast } from 'native-base';
import { resetPasswordErrorAction, apiLoaderActions, resetErrorHandlingAction } from '../../actions';
import { IconicList, LabeledInputPlaceholder } from '../../components/inputs';
import { logoutUser, updatePassword, updateUserSettings, deactivateUserAccount } from '../../api';
import { BaseModal } from '../../components/modal';
import ForgotPassword from '../../containers/forgot-password';
import Md5 from 'react-native-md5';
import { Actions } from 'react-native-router-flux';
import { DefaultText } from '../../components/labels';
import { BasePage } from '../../components/pages';
import deviceInfo from 'react-native-device-info'

export class Settings extends Component {
    fieldRefs = [];
    constructor(props) {
        super(props);
        this.state = {
            locationEnable: props.user.locationEnable || false,
            currentPasswd: '',
            newPasswd: '',
            confirmPasswd: '',
            hideCurPasswd: true,
            hideNewPasswd: true,
            hideConfPasswd: true,
            showForgotPasswordModal: false,
            measurementDistanceUnit: props.user.distanceUnit,
            locationRadiusState: props.user.locationRadius,
            handDominanceState: props.user.handDominance,
            timeIntervalInSeconds: props.user.timeIntervalInSeconds,
            showCircle: props.user.showCircle,
            isUpdatedSetting: false,
            showOptionsModal: false,
            baseModalField: null,
            versionNumber:''
        };
    }

    componentDidMount(){
       
        deviceInfo.getReadableVersion().then(ver=>{
            this.setState({
                versionNumber:ver
            })
        })
        
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.updatePasswordError && (prevProps.updatePasswordError !== this.props.updatePasswordError)) {
            Toast.show({
                text: this.props.updatePasswordError.userMessage,
                buttonText: 'Okay',
                position: 'bottom',
                onClose: () => this.props.resetUpdatePasswordError()
            });
        }
        if (this.props.updatePasswordSuccess && (prevProps.updatePasswordSuccess !== this.props.updatePasswordSuccess)) {
            Toast.show({
                text: 'Your password has updated successfully. Please do login again',
                buttonText: 'Okay',
                position: 'bottom',
            });
            this.fieldRefs = [];
            this.setState({ currentPasswd: '', newPasswd: '', confirmPasswd: '' });
            this.onPressLogout();
        }
        if (this.state.isUpdatedSetting) {
            console.log('updated setting')
            Toast.show({
                text: 'Setting updated successfully'
            });
            this.setState({ isUpdatedSetting: false })
        }
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

    onChangeCurrentPasswordField = (val) => this.setState({ currentPasswd: val });

    onChangeNewPasswordField = (val) => this.setState({ newPasswd: val });

    onChangeConfirmPasswordField = (val) => this.setState({ confirmPasswd: val });

    toggleCurPasswdVisibility = () => this.setState(prevState => ({ hideCurPasswd: !prevState.hideCurPasswd }));

    toggleNewPasswdVisibility = () => this.setState(prevState => ({ hideNewPasswd: !prevState.hideNewPasswd }));

    toggleConfPasswdVisibility = () => this.setState(prevState => ({ hideConfPasswd: !prevState.hideConfPasswd }));

    onChangedistanceUnit = (val) => this.setState({ measurementDistanceUnit: val })

    onChangeLoactionradius = (val) => this.setState({ locationRadiusState: val })

    onChangeTimeInterval = (val) => this.setState({ timeIntervalInSeconds: val })

    onChangeHandDominance = (val) => this.setState({ handDominanceState: val })

    passwordFormat = () => {
        if (this.state.newPasswd.length < 5) {
            Alert.alert('Error', 'Password should be greater than 5 character');
        } else if (this.state.newPasswd.search(/\d/) == -1) {
            Alert.alert('Error', 'Password should contain one number');
        }
    }


    toggleForgotPasswordForm = () => {
        this.setState(prevState => ({ showForgotPasswordModal: !prevState.showForgotPasswordModal }));
    }

    submitPasswordChange = () => {
        const { currentPasswd, newPasswd, confirmPasswd } = this.state;
        if (currentPasswd !== '' && newPasswd !== '' && confirmPasswd !== '') {
            if (newPasswd === confirmPasswd) {
                this.setState({ showOptionsModal: false, baseModalField: null })
                this.props.updatePassword({ userId: this.props.user.userId, currentPassword: Md5.hex_md5(currentPasswd + ''), newPassword: Md5.hex_md5(newPasswd + '') });
            } else {
                Toast.show({
                    text: 'Entered passwords are not matching',
                    buttonText: 'Okay',
                    position: 'bottom'
                });
            }
        }
    }

    submitSettingsChanges = () => {
        const { locationEnable, measurementDistanceUnit,
            locationRadiusState, handDominanceState, timeIntervalInSeconds, showCircle } = this.state;
        // TODO: Add new keys here and validate
        if (locationRadiusState !== '' && !isNaN(locationRadiusState) && parseInt(locationRadiusState) > 0
            && !isNaN(timeIntervalInSeconds) && parseInt(timeIntervalInSeconds) > 0) {
            this.props.updateUserSettings({
                userId: this.props.user.userId, distanceUnit: measurementDistanceUnit,
                locationRadius: parseInt(locationRadiusState), handDominance: handDominanceState,
                timeIntervalInSeconds: parseInt(timeIntervalInSeconds), showCircle, locationEnable
            })
            this.setState({ isUpdatedSetting: true })
        } else {
            Toast.show({
                text: 'fill all field correctly',
                buttonText: 'Okay',
                position: 'bottom'
            });
        }
    }

    showOptionsModal = () => this.setState({ showOptionsModal: true });

    hideOptionsModal = () => this.setState({ showOptionsModal: false, currentPasswd: '', newPasswd: '', confirmPasswd: '', baseModalField: null });

    getFormattedDeleteDateFromISO = (isoDateString = new Date().toISOString()) => {
        return new Date(new Date().setDate(new Date().getDate() + 60)).toLocaleDateString('default', { weekday: 'long', month: 'long', day: "numeric", year: 'numeric' })
    }

    deactivateUserAccount = () => {
        this.props.deactivateUserAccount(this.props.user.userId, (res) => {
            this.setState({ showOptionsModal: true, baseModalField: 'DELETE_ACCOUNT_THIRD_CONFIRMATION' })
        });
    }

    onPressLogout = async () => {
        this.props.logoutUser(this.props.user.userId, this.props.userAuthToken, this.props.deviceToken, (res) => { }, (er) => { });
    }

    renderBaseModal = () => {
        const { currentPasswd, newPasswd, confirmPasswd,
            hideCurPasswd, hideNewPasswd, hideConfPasswd } = this.state;
        switch (this.state.baseModalField) {
            case 'CHANGE_PASSWORD': return <View style={styles.optionsView}>
                <DefaultText style={{ color: '#2B77B4', fontFamily: CUSTOM_FONTS.robotoBold, fontSize: 20, letterSpacing: 0.2 }}>Change Password</DefaultText>
                {/* <TextInput secureTextEntry={hideCurPasswd} style={styles.fill} value={currentPasswd} ref={elRef => this.fieldRefs[0] = elRef} returnKeyType='next' onChangeText={this.onChangeCurrentPasswordField} placeholder='Current Password' onSubmitEditing={() => this.fieldRefs[1].focus()} blurOnSubmit={false} /> */}
                <LabeledInputPlaceholder
                    containerStyle={{ backgroundColor: '#F4F4F4', flex: 0, borderBottomColor: '#707070' }}
                    inputValue={currentPasswd} inputStyle={{ paddingBottom: 0, }}
                    outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3), marginTop: 40, flex: 0 }}
                    inputRef={elRef => this.fieldRefs[0] = elRef} returnKeyType='next'
                    secureTextEntry={hideCurPasswd}
                    onChange={this.onChangeCurrentPasswordField} label='CURRENT PASSWORD' labelStyle={styles.labelStyle}
                    onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false}
                    iconProps={{ name: hideCurPasswd ? 'eye' : 'eye-off', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(6), paddingRight: 0, color: 'white' }, onPress: this.toggleCurPasswdVisibility, containerStyle: { backgroundColor: '#0083CA', alignItems: 'center', justifyContent: 'center', width: widthPercentageToDP(8), height: widthPercentageToDP(8), borderRadius: widthPercentageToDP(4) } }}
                />
                <LabeledInputPlaceholder
                    containerStyle={{ backgroundColor: '#F4F4F4', flex: 0, borderBottomColor: '#707070' }}
                    inputValue={newPasswd} inputStyle={{ paddingBottom: 0, }}
                    outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3), marginTop: 10, flex: 0 }}
                    inputRef={elRef => this.fieldRefs[1] = elRef} returnKeyType='next'
                    secureTextEntry={hideNewPasswd}
                    onChange={this.onChangeNewPasswordField} label='NEW PASSWORD' labelStyle={styles.labelStyle}
                    onSubmit={() => this.fieldRefs[2].focus()} hideKeyboardOnSubmit={false}
                    iconProps={{ name: hideNewPasswd ? 'eye' : 'eye-off', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(6), paddingRight: 0, color: 'white' }, onPress: this.toggleNewPasswdVisibility, containerStyle: { backgroundColor: '#0083CA', alignItems: 'center', justifyContent: 'center', width: widthPercentageToDP(8), height: widthPercentageToDP(8), borderRadius: widthPercentageToDP(4) } }}
                />
                <LabeledInputPlaceholder
                    containerStyle={{ backgroundColor: '#F4F4F4', flex: 0, borderBottomColor: '#707070' }}
                    inputValue={confirmPasswd} inputStyle={{ paddingBottom: 0, }}
                    outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3), marginTop: 10, flex: 0 }}
                    inputRef={elRef => this.fieldRefs[2] = elRef} returnKeyType='next'
                    secureTextEntry={hideConfPasswd}
                    onChange={this.onChangeConfirmPasswordField} label='CONFIRM PASSWORD' labelStyle={styles.labelStyle}
                    onSubmit={this.submitSettingsChanges} hideKeyboardOnSubmit={false}
                    iconProps={{ name: hideConfPasswd ? 'eye' : 'eye-off', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(6), paddingRight: 0, color: 'white' }, onPress: this.toggleConfPasswdVisibility, containerStyle: { backgroundColor: '#0083CA', alignItems: 'center', justifyContent: 'center', width: widthPercentageToDP(8), height: widthPercentageToDP(8), borderRadius: widthPercentageToDP(4) } }}
                />
                <BasicButton title='SUBMIT' style={[styles.submitBtn, { backgroundColor: '#2B77B4' }]} titleStyle={styles.submitBtnTxt} onPress={this.submitPasswordChange} />
                <LinkButton style={[styles.linkItem, { marginTop: 20 }]} title='Forgot Password?' titleStyle={[styles.infoLink, { color: '#585756', fontSize: 18, letterSpacing: 0.18 }]} onPress={() => this.setState({ showOptionsModal: true, baseModalField: 'FORGOT_PASSWORD', showForgotPasswordModal: true })} />
            </View>
            case 'FORGOT_PASSWORD': return <View style={styles.optionsView}>
                <DefaultText style={{ color: '#2B77B4', fontFamily: CUSTOM_FONTS.robotoBold, fontSize: 20, letterSpacing: 0.2 }}>RESET PASSWORD</DefaultText>
                <ForgotPassword isVisible={this.state.showForgotPasswordModal} onCancel={this.toggleForgotPasswordForm} onPressOutside={this.toggleForgotPasswordForm} comingFrom={PageKeys.SETTINGS} />
            </View>
            case 'DELETE_ACCOUNT_FIRST_CONFIRMATION': return <View style={[styles.optionsView, { marginRight: 32 }]}>
                <DefaultText style={{ color: '#CE0D0D', fontFamily: CUSTOM_FONTS.robotoBold, fontSize: 20, letterSpacing: 0.2 }}>DELETE ACCOUNT</DefaultText>
                <DefaultText style={[styles.deleteSubText, { marginRight: 20, marginTop: 30 }]} numberOfLines={3}>Your account is scheduled to be delete on {this.getFormattedDeleteDateFromISO()}.</DefaultText>
                <DefaultText style={styles.deleteSubText}>Are you sure you wish to permanently delete your account?</DefaultText>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <BasicButton title='CANCEL' style={[styles.submitBtn, { backgroundColor: '#8D8D8D', width: 125 }]} titleStyle={styles.submitBtnTxt} onPress={this.hideOptionsModal} />
                    <BasicButton title='DELETE' style={[styles.submitBtn, { backgroundColor: '#CE0D0D', width: 125 }]} titleStyle={styles.submitBtnTxt} onPress={() => this.setState({ showOptionsModal: true, baseModalField: 'DELETE_ACCOUNT_SECOND_CONFIRMATION' })} />
                </View>
            </View>
            case 'DELETE_ACCOUNT_SECOND_CONFIRMATION': return <View style={[styles.optionsView, { marginRight: 32 }]}>
                <DefaultText style={{ color: '#CE0D0D', fontFamily: CUSTOM_FONTS.robotoBold, fontSize: 20, letterSpacing: 0.2 }}>Delete: Are you sure?</DefaultText>
                <DefaultText style={[styles.deleteSubText, { marginRight: 20, marginTop: 30 }]} numberOfLines={3}>Your account will be deactivated for 60 days before it is permanently deleted.</DefaultText>
                <DefaultText style={[styles.deleteSubText, { marginTop: 10 }]} numberOfLines={6}>All of your account information and photos will be permanently deleted. If you would like to
                keep your account, please log into MyRideDNA before {this.getFormattedDeleteDateFromISO()}.</DefaultText>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <BasicButton title='CANCEL' style={[styles.submitBtn, { backgroundColor: '#8D8D8D', width: 125 }]} titleStyle={styles.submitBtnTxt} onPress={this.hideOptionsModal} />
                    <BasicButton title='CONFIRM' style={[styles.submitBtn, { backgroundColor: '#CE0D0D', width: 125 }]} titleStyle={styles.submitBtnTxt} onPress={() => this.setState(this.deactivateUserAccount)} />
                </View>
            </View>
            case 'DELETE_ACCOUNT_THIRD_CONFIRMATION': return <View style={[styles.optionsView, { marginRight: 32 }]}>
                <DefaultText style={{ color: '#CE0D0D', fontFamily: CUSTOM_FONTS.robotoBold, fontSize: 20, letterSpacing: 0.2 }}>Account successfully scheduled for deletion</DefaultText>
                <DefaultText style={[styles.deleteSubText, { marginRight: 20, marginTop: 30 }]}>Your account has been deactivated from the site and will be permanently deleted after 60 days.
                If you log back in to the site within the next 60 days, you will have the option to cancel your
                request.</DefaultText>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <BasicButton title='OKAY' style={[styles.submitBtn, { backgroundColor: '#CE0D0D', width: 125 }]} titleStyle={styles.submitBtnTxt} onPress={this.onPressLogout} />
                </View>
            </View>

            default: return null
        }

    }

 render() {
        const MEASUREMENT_UNITS = [{ label: 'Km', value: 'km' }, { label: 'Mi', value: 'mi' }];
        const HAND_DOMINANCE = [{ label: 'LH', value: 'left' }, { label: 'RH', value: 'right' }];
        const { user, showLoader,notificationCount } = this.props;
        const { locationEnable, showCircle, showOptionsModal } = this.state;
        return (
            <BasePage
                heading={'Settings'} showLoader={showLoader}
                headerLeftIconProps={{ reverse: true, name: 'ios-notifications', type: 'Ionicons', onPress: () => Actions.push(PageKeys.NOTIFICATIONS) }}
                notificationCount={notificationCount}>
                <BaseModal containerStyle={styles.baseModalContainerStyle} isVisible={showOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                    <View style={styles.optionsContainer}>
                        {
                            this.renderBaseModal()
                        }
                    </View>
                </BaseModal>
                <KeyboardAvoidingView behavior={IS_ANDROID ? null : 'padding'} style={{ flex: 1, }} >
                    <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps='handled' contentContainerStyle={{ paddingBottom: styles.submitBtn.height, bottom: this.state.btmOffset }}>
                        <View style={[styles.fieldContainer]}>
                            <DefaultText style={styles.labelText}>Share my location with buddies</DefaultText>
                            <SwitchIconButton
                                activeIcon={<DefaultText style={styles.activeSwitchBtn}>ON</DefaultText>}
                                inactiveIcon={<DefaultText style={styles.inActiveSwitchBTn}>OFF</DefaultText>}
                                value={locationEnable} onChangeValue={() => this.setState(prevState => ({ locationEnable: !prevState.locationEnable }))}
                                innerContainer={{ backgroundColor: locationEnable ? '#01C650' : '#00000029', width: 45, height: 25 }}
                                animatedContainer={{ height: 23, width: 24 }}
                            />
                        </View>
                        <View style={[styles.fieldContainer]}>
                            <DefaultText style={styles.labelText}>Distance units</DefaultText>
                            <IconicList
                                iconProps={IS_ANDROID ? {} : { type: 'MaterialIcons', name: 'arrow-drop-down', style: { color: APP_COMMON_STYLES.infoColor, fontSize: 28 } }}
                                pickerStyle={[{ borderBottomWidth: 0 }, IS_ANDROID ? { flex: 1 } : null]}
                                textStyle={{ paddingLeft: 10, fontSize: 14, bottom: 6 }}
                                selectedValue={this.state.measurementDistanceUnit} values={MEASUREMENT_UNITS}
                                outerContainer={{ flex: 1, alignItems: 'flex-end' }}
                                containerStyle={[styles.borderStyle, { width: IS_ANDROID ? 90 : 86 }]}
                                innerContainerStyle={{ height: 24 }}
                                onChange={this.onChangedistanceUnit} />
                        </View>

                        <View style={[styles.fieldContainer, { marginHorizontal: 33 }]}>
                            <DefaultText style={styles.labelText}>Time interval in seconds</DefaultText>
                            <LabeledInputPlaceholder
                                containerStyle={[{ width: 84, height: 26, backgroundColor: '#F4F4F4' }, styles.borderStyle]}
                                inputValue={!this.state.timeIntervalInSeconds ? '' : this.state.timeIntervalInSeconds + ''}
                                outerContainer={{ alignItems: 'flex-end', borderColor: '#C4C6C8', }}
                                inputStyle={{ flex: 0, justifyContent: 'center', paddingBottom: 2, color: '#585756', fontFamily: CUSTOM_FONTS.robotoSlabBold }}
                                returnKeyType='next'
                                inputType='telephoneNumber'
                                onChange={this.onChangeTimeInterval}
                                hideKeyboardOnSubmit={true} />
                        </View>

                        <View style={[styles.fieldContainer, { borderTopWidth: 1, borderTopColor: '#C4C6C8', marginHorizontal: 0, paddingHorizontal: 33, paddingTop: 15, }]}>
                            <DefaultText style={styles.labelText}>Show visible map boundary circle</DefaultText>
                            <SwitchIconButton
                                activeIcon={<DefaultText style={styles.activeSwitchBtn}>ON</DefaultText>}
                                inactiveIcon={<DefaultText style={styles.inActiveSwitchBTn}>OFF</DefaultText>}
                                value={showCircle} onChangeValue={() => this.setState(prevState => ({ showCircle: !prevState.showCircle }))}
                                innerContainer={{ backgroundColor: showCircle ? '#01C650' : '#00000029', width: 45, height: 25 }}
                                animatedContainer={{ height: 23, width: 24 }}
                            />
                        </View>
                        <View style={[styles.fieldContainer, { borderBottomWidth: 1, borderBottomColor: '#C4C6C8', marginHorizontal: 0, paddingHorizontal: 33, paddingBottom: 15 }]}>
                            <DefaultText style={styles.labelText}>Location Radius</DefaultText>
                            <LabeledInputPlaceholder
                                containerStyle={[{ width: 84, height: 26, backgroundColor: '#F4F4F4' }, styles.borderStyle]}
                                inputValue={!this.state.locationRadiusState ? '' : this.state.locationRadiusState + ''}
                                outerContainer={{ alignItems: 'flex-end', borderColor: '#C4C6C8', }}
                                inputStyle={{ flex: 0, justifyContent: 'center', paddingBottom: 2, color: '#585756', fontFamily: CUSTOM_FONTS.robotoSlabBold }}
                                returnKeyType='next'
                                onChange={this.onChangeLoactionradius}
                                hideKeyboardOnSubmit={true} />
                        </View>

                        <View style={[styles.fieldContainer, { borderBottomColor: '#C4C6C8', borderBottomWidth: 1, marginHorizontal: 0, paddingHorizontal: 33, marginTop: 0, paddingVertical: 20, }]}>
                            <DefaultText style={styles.labelText}>Right or Left Handed</DefaultText>
                            <IconicList
                                selectedValue={this.state.handDominanceState} values={HAND_DOMINANCE}
                                iconProps={IS_ANDROID ? {} : { type: 'MaterialIcons', name: 'arrow-drop-down', style: { color: APP_COMMON_STYLES.infoColor, fontSize: 28 } }}
                                pickerStyle={[{ borderBottomWidth: 0 }, IS_ANDROID ? { flex: 1 } : null]}
                                textStyle={{ paddingLeft: 10, fontSize: 14, bottom: 6 }}
                                outerContainer={{ flex: 1, alignItems: 'flex-end' }}
                                containerStyle={[styles.borderStyle, { width: IS_ANDROID ? 90 : 86 }]}
                                innerContainerStyle={{ height: 24 }}
                                onChange={this.onChangeHandDominance} />
                        </View>
                        <View style={{ marginTop: 10 }}>
                            <BasicButton title='CHANGE PASSWORD' style={[styles.submitBtn, { backgroundColor: '#2B77B4' }]} titleStyle={styles.submitBtnTxt} onPress={() => this.setState({ showOptionsModal: true, baseModalField: 'CHANGE_PASSWORD' })} />
                            <BasicButton title='UPDATE SETTINGS' style={styles.submitBtn} titleStyle={styles.submitBtnTxt} onPress={this.submitSettingsChanges} />
                            <LinkButton style={styles.linkItem} title='DELETE ACCOUNT' titleStyle={styles.infoLink} onPress={() => this.setState({ showOptionsModal: true, baseModalField: 'DELETE_ACCOUNT_FIRST_CONFIRMATION' })} />
                        </View>
                        <View>
                            <DefaultText style={styles.versionText}>{'Version.'+ this.state.versionNumber}</DefaultText>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </BasePage >
        );
    }
}

const mapStateToProps = (state) => {
    const { user, deviceToken, userAuthToken, updatePasswordError, updatePasswordSuccess } = state.UserAuth;
    const { showLoader, hasNetwork, lastApi, isRetryApi } = state.PageState;
    const notificationCount=state.NotificationList.notificationList.totalUnseen;
    return { user, deviceToken, userAuthToken, updatePasswordError, updatePasswordSuccess, showLoader, hasNetwork, lastApi, isRetryApi ,notificationCount};
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateUserSettings: (userSettings) => dispatch(updateUserSettings(userSettings)),
        updatePassword: (passwordInfo) => dispatch(updatePassword(passwordInfo)),
        logoutUser: (userId, accessToken, deviceToken, successCallback, errorCallback) => dispatch(logoutUser(userId, accessToken, deviceToken, successCallback, errorCallback)),
        resetUpdatePasswordError: () => dispatch(resetPasswordErrorAction()),
        deactivateUserAccount: (userId, successCallback) => {
            dispatch(apiLoaderActions(true));
            deactivateUserAccount(userId).then(res => {
                console.log('deactivateUserAccount success: ', res.data)
                dispatch(apiLoaderActions(false));
                typeof successCallback === 'function' && successCallback(res.data)
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
            }).catch(er => {
                dispatch(apiLoaderActions(false));
                handleServiceErrors(er, [userId, successCallback], 'deactivateUserAccount', true, true);
                console.log('deactivateUserAccount error: ', res.data)
            })
        },
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'settings', isRetryApi: state })),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);