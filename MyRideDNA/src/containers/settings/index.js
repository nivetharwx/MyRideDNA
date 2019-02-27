import React, { Component } from 'react';
import { View, StatusBar, Text, ScrollView, AsyncStorage, TouchableOpacity, TextInput } from 'react-native';
import { connect } from 'react-redux';
import styles from './styles';
import { APP_COMMON_STYLES, IS_ANDROID, widthPercentageToDP, USER_AUTH_TOKEN } from '../../constants';
import { BasicHeader } from '../../components/headers';
import { SwitchIconButton, ShifterButton, LinkButton, IconButton } from '../../components/buttons';
import { Item, Icon as NBIcon, Accordion, Toast } from 'native-base';
import { appNavMenuVisibilityAction } from '../../actions';
import { LabeledInput } from '../../components/inputs';
import { logoutUser } from '../../api';
import { BaseModal } from '../../components/modal';
import ForgotPassword from '../../containers/forgot-password';

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
        };
        console.log(props.user);
    }

    onChangeCurrentPasswordField = (val) => this.setState({ currentPasswd: val });

    onChangeNewPasswordField = (val) => this.setState({ newPasswd: val });

    onChangeConfirmPasswordField = (val) => this.setState({ confirmPasswd: val });

    toggleCurPasswdVisibility = () => this.setState(prevState => ({ hideCurPasswd: !prevState.hideCurPasswd }));

    toggleNewPasswdVisibility = () => this.setState(prevState => ({ hideNewPasswd: !prevState.hideNewPasswd }));

    toggleConfPasswdVisibility = () => this.setState(prevState => ({ hideConfPasswd: !prevState.hideConfPasswd }));

    onFocusNewPasswordField = () => {
        if (this.state.currentPasswd.trim().length === 0) {
            Toast.show({
                text: 'Please provide your current password',
                buttonText: 'Okay',
                position: 'top',
                onClose: () => {
                    this.fieldRefs[0].focus();
                }
            });
        }
    }

    onFocusConfirmPasswordField = () => {
        if (this.state.currentPasswd.trim().length === 0) {
            Toast.show({
                text: 'Please provide your current password',
                buttonText: 'Okay',
                position: 'top',
                onClose: () => {
                    this.fieldRefs[0].focus();
                }
            });
        } else if (this.state.newPasswd.trim().length === 0) {
            Toast.show({
                text: 'Please provide proper password',
                buttonText: 'Okay',
                position: 'top',
                onClose: () => {
                    this.fieldRefs[1].focus();
                }
            });
        }
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

    onPressLogout = async () => {
        const accessToken = await AsyncStorage.getItem(USER_AUTH_TOKEN);
        this.props.logoutUser(this.props.user.userId, accessToken);
    }

    toggleForgotPasswordForm = () => {
        this.setState(prevState => ({ showForgotPasswordModal: !prevState.showForgotPasswordModal }));
    }

    renderAccordionItem = (item) => {
        if (item.title === 'Change password') {
            const { currentPasswd, newPasswd, confirmPasswd,
                hideCurPasswd, hideNewPasswd, hideConfPasswd } = this.state;
            return (
                <View style={styles.changePasswdFrom}>
                    <Item style={styles.passwdFormField}>
                        <TextInput secureTextEntry={hideCurPasswd} style={styles.fill} value={currentPasswd} ref={elRef => this.fieldRefs[0] = elRef} returnKeyType='next' onChangeText={this.onChangeCurrentPasswordField} placeholder='Current Password' onSubmitEditing={() => this.fieldRefs[1].focus()} blurOnSubmit={false} />
                        <IconButton onPress={this.toggleCurPasswdVisibility} style={{ backgroundColor: '#0083CA', alignItems: 'center', justifyContent: 'center', width: widthPercentageToDP(8), height: widthPercentageToDP(8), borderRadius: widthPercentageToDP(4) }} iconProps={{ name: hideCurPasswd ? 'eye' : 'eye-off', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(6), paddingRight: 0, color: 'white' } }} />
                    </Item>
                    <Item style={styles.passwdFormField}>
                        <TextInput secureTextEntry={hideNewPasswd} style={styles.fill} value={newPasswd} ref={elRef => this.fieldRefs[1] = elRef} onFocus={this.onFocusNewPasswordField} returnKeyType='next' onChangeText={this.onChangeNewPasswordField} placeholder='New Password' onSubmitEditing={() => this.fieldRefs[2].focus()} blurOnSubmit={false} />
                        <IconButton onPress={this.toggleNewPasswdVisibility} style={{ backgroundColor: '#0083CA', alignItems: 'center', justifyContent: 'center', width: widthPercentageToDP(8), height: widthPercentageToDP(8), borderRadius: widthPercentageToDP(4) }} iconProps={{ name: hideNewPasswd ? 'eye' : 'eye-off', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(6), paddingRight: 0, color: 'white' } }} />
                    </Item>
                    <Item style={styles.passwdFormField}>
                        <TextInput secureTextEntry={hideConfPasswd} style={styles.fill} value={confirmPasswd} ref={elRef => this.fieldRefs[2] = elRef} onFocus={this.onFocusConfirmPasswordField} returnKeyType='next' onChangeText={this.onChangeConfirmPasswordField} placeholder='Confirm Password' onSubmitEditing={() => { }} blurOnSubmit={true} />
                        <IconButton onPress={this.toggleConfPasswdVisibility} style={{ backgroundColor: '#0083CA', alignItems: 'center', justifyContent: 'center', width: widthPercentageToDP(8), height: widthPercentageToDP(8), borderRadius: widthPercentageToDP(4) }} iconProps={{ name: hideConfPasswd ? 'eye' : 'eye-off', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(6), paddingRight: 0, color: 'white' } }} />
                    </Item>
                    <LinkButton style={styles.linkItem} title='Forgot Password ?' titleStyle={styles.infoLink} onPress={this.toggleForgotPasswordForm} />
                </View>
            );
        }
    }

    render() {
        const { user } = this.props;
        const { locationEnable } = this.state;
        return (
            <View style={[styles.fill, IS_ANDROID ? null : styles.iosBottomMargin]}>
                <ForgotPassword isVisible={this.state.showForgotPasswordModal} onCancel={this.toggleForgotPasswordForm} onPressOutside={this.toggleForgotPasswordForm} />
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={styles.fill}>
                    <BasicHeader title='Settings' rightIconProps={{ name: 'md-exit', type: 'Ionicons', style: { fontSize: widthPercentageToDP(8), color: '#fff' }, onPress: this.onPressLogout }} />
                    <View style={styles.pageContent}>
                        <Item style={styles.containerItem}>
                            <Text>Share my location with friends</Text>
                            <View style={{ flex: 1 }}>
                                <SwitchIconButton
                                    activeIcon={<NBIcon name='close' type='FontAwesome' style={{ color: '#fff', alignSelf: 'flex-start', paddingHorizontal: 10 }} />}
                                    inactiveIcon={<NBIcon name='eye' type='MaterialCommunityIcons' style={{ color: '#fff', alignSelf: 'flex-end', paddingHorizontal: 10 }} />}
                                    value={locationEnable} onChangeValue={() => this.setState(prevState => ({ locationEnable: !prevState.locationEnable }))} />
                            </View>
                        </Item>
                        <ScrollView style={[styles.containerItem, { marginLeft: 0 }]} contentContainerStyle={styles.fill}>
                            <Accordion style={{ borderWidth: 0 }} dataArray={[{ title: 'Change password' }]} renderContent={this.renderAccordionItem} headerStyle={{}} />
                        </ScrollView>
                        <View style={styles.submitSec}>
                            <TouchableOpacity style={styles.submitButton}>
                                <NBIcon name='md-checkmark' type='Ionicons' style={styles.submitBtnIcon} />
                            </TouchableOpacity>
                        </View>
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
    return { user };
}

const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        logoutUser: (userId, accessToken) => dispatch(logoutUser(userId, accessToken)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);