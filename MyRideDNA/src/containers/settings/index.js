import React, { Component } from 'react';
import { View, StatusBar, Text, ScrollView, AsyncStorage, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import styles from './styles';
import { APP_COMMON_STYLES, IS_ANDROID, widthPercentageToDP, USER_AUTH_TOKEN } from '../../constants';
import { BasicHeader } from '../../components/headers';
import { SwitchIconButton, ShifterButton, LinkButton } from '../../components/buttons';
import { Item, Icon as NBIcon, Accordion } from 'native-base';
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
            sharedLocation: false,
            showForgotPasswordModal: false
        };
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
            return (
                <View style={styles.changePasswdFrom}>
                    <LabeledInput inputValue={''} inputRef={elRef => this.fieldRefs[0] = elRef} returnKeyType='next' onChange={(val) => { }} placeholder='Current Password' onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false} />
                    <LabeledInput inputValue={''} inputRef={elRef => this.fieldRefs[1] = elRef} returnKeyType='next' onChange={(val) => { }} placeholder='New Password' onSubmit={() => this.fieldRefs[2].focus()} hideKeyboardOnSubmit={false} />
                    <LabeledInput inputValue={''} inputRef={elRef => this.fieldRefs[2] = elRef} onChange={() => { }} placeholder='Confirm password' onSubmit={() => { }} hideKeyboardOnSubmit={true} />
                    <LinkButton style={styles.linkItem} title='Forgot Password' titleStyle={styles.infoLink} onPress={this.toggleForgotPasswordForm} />
                </View>
            );
        }
    }

    render() {
        const { user } = this.props;
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
                            <SwitchIconButton
                                activeIcon={<NBIcon name='close' type='FontAwesome' style={{ color: '#fff', alignSelf: 'flex-start', paddingHorizontal: 10 }} />}
                                inactiveIcon={<NBIcon name='eye' type='MaterialCommunityIcons' style={{ color: '#fff', alignSelf: 'flex-end', paddingHorizontal: 10 }} />}
                                value={this.state.sharedLocation} onChangeValue={() => this.setState(prevState => ({ sharedLocation: !prevState.sharedLocation }))} />
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