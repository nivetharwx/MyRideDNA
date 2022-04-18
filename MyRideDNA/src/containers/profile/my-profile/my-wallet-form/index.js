import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, ScrollView, View, Keyboard, Text, KeyboardAvoidingView } from 'react-native';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, CUSTOM_FONTS } from '../../../../constants';
import { Actions } from 'react-native-router-flux';
import { LabeledInputPlaceholder } from '../../../../components/inputs';
import { BasicButton, LinkButton } from '../../../../components/buttons';
import { updateMyWallet } from '../../../../api';
import { Toast } from 'native-base';
import { BaseModal } from '../../../../components/modal';
import { BasePage } from '../../../../components/pages';

class MyWalletForm extends Component {
    fieldRefs = [];
    updatingUserMyWallet = false;
    constructor(props) {
        super(props);
        this.state = {
            showLoader: false,
            insurance: {
                ...props.userMyWallet.insurance
            },
            roadsideAssistance: {
                ...props.userMyWallet.roadsideAssistance
            },
            isEditable: false,
            showOptionsModal: false,
        };
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.userMyWallet !== this.props.userMyWallet) {
            if (this.updatingUserMyWallet === true) {
                Toast.show({
                    text: 'My Wallet updated successfully',
                    buttonText: 'Okay'
                });
                this.onPressBackButton();
            }
        }
    }

    onChangeName = (val) => {
        this.setState(prevState => ({ insurance: { ...prevState.insurance, name: val + '' } }));
    }

    onChangeVehicle = (val) => {
        this.setState(prevState => ({ insurance: { ...prevState.insurance, vehicle: val + '' } }));
    }

    onChangePolicyNumberInsurance = (val) => {
        this.setState(prevState => ({ insurance: { ...prevState.insurance, policyNumber: val + '' } }));
    }

    onChangeContactInfoInsurance = (val) => {
        this.setState(prevState => ({ insurance: { ...prevState.insurance, contactInfo: val + '' } }));
    }
    onChangePolicyNumberRdAsst = (val) => {
        this.setState(prevState => ({ roadsideAssistance: { ...prevState.roadsideAssistance, policyNumber: val + '' } }));
    }
    onChangeContactInfoRdAsst = (val) => {
        this.setState(prevState => ({ roadsideAssistance: { ...prevState.roadsideAssistance, contactInfo: val + '' } }));
    }

    onPressBackButton = () => Actions.pop();

    hideLoader = () => {
        this.setState({ showLoader: false });
    }

    onSubmit = () => {
        Keyboard.dismiss();
        this.updatingUserMyWallet = true;
        this.setState({ showLoader: true })
        this.props.updateMyWallet(this.props.user.userId, this.state.insurance, this.state.roadsideAssistance, (res) => {
            this.hideLoader()
        }, (err) => {
            this.hideLoader()
        });
    }

    allowEditWallet = () => this.setState({ isEditable: true, showOptionsModal: false })

    showOptionsModal = () => this.setState({ showOptionsModal: true });

    hideOptionsModal = () => this.setState({ showOptionsModal: false });

    render() {
        const { insurance, roadsideAssistance, showLoader, isEditable, showOptionsModal } = this.state;
        return (
            <BasePage showLoader={showLoader}
                heading={isEditable?'Edit My Wallet':'My Wallet'}
                headerRightIconProps={isEditable ? null : { name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 20 }, onPress: this.showOptionsModal }}>
                <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={showOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                    <View style={APP_COMMON_STYLES.optionsContainer}>
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='EDIT WALLET' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.allowEditWallet} />
                        {this.props.passengerId && <LinkButton style={APP_COMMON_STYLES.optionBtn} title='REMOVE AS PASSENGER' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.removeFromPassengers} />}
                    </View>
                </BaseModal>
                <KeyboardAvoidingView keyboardVerticalOffset={20} behavior={IS_ANDROID ? null : 'padding'} style={styles.fill}>
                    <ScrollView>
                        <View style={{ marginLeft: widthPercentageToDP(13), marginTop: 40 }}>
                            <Text style={{ color: '#F5891F', fontSize: 20, fontFamily: CUSTOM_FONTS.robotoSlabBold }}>Insurance</Text>
                            <LabeledInputPlaceholder
                                editable={isEditable} containerStyle={{ backgroundColor: isEditable ? '#F4F4F4' : null }}
                                inputValue={insurance.name} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[0] = elRef} returnKeyType='next'
                                onChange={this.onChangeName} label='NAME' secondLabel='(Insured Rider)' secondLabelStyle={styles.secondLabelStyle} labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false} />

                            <LabeledInputPlaceholder
                                editable={isEditable} containerStyle={{ backgroundColor: isEditable ? '#F4F4F4' : null }}
                                inputValue={insurance.vehicle} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[1] = elRef} returnKeyType='next'
                                onChange={this.onChangeVehicle} label='VEHICLE' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[2].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                editable={isEditable} containerStyle={{ backgroundColor: isEditable ? '#F4F4F4' : null }}
                                inputValue={insurance.policyNumber} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[2] = elRef} returnKeyType='next'
                                onChange={this.onChangePolicyNumberInsurance} label='POLICY NUMBER' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[3].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                editable={isEditable} containerStyle={{ backgroundColor: isEditable ? '#F4F4F4' : null }}
                                inputValue={insurance.contactInfo} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[3] = elRef} returnKeyType='next'
                                onChange={this.onChangeContactInfoInsurance} label='CONTACT INFO' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[4].focus()} hideKeyboardOnSubmit={false} />

                            <Text style={{ color: '#F5891F', fontSize: 20, fontFamily: CUSTOM_FONTS.robotoSlabBold, marginTop: heightPercentageToDP(5) }}>Roadside Assistance</Text>
                            <LabeledInputPlaceholder
                                editable={isEditable} containerStyle={{ backgroundColor: isEditable ? '#F4F4F4' : null }}
                                inputValue={roadsideAssistance.policyNumber} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[4] = elRef} returnKeyType='next'
                                onChange={this.onChangePolicyNumberRdAsst} label='POLICY NUMBER' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[5].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                editable={isEditable} containerStyle={{ backgroundColor: isEditable ? '#F4F4F4' : null }}
                                inputValue={roadsideAssistance.contactInfo} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? 5 : heightPercentageToDP(3) }}
                                inputRef={elRef => this.fieldRefs[5] = elRef}
                                onChange={this.onChangeContactInfoRdAsst} label='CONTACT INFO' labelStyle={styles.labelStyle}
                                hideKeyboardOnSubmit={true}
                                onSubmit={this.onSubmit}
                            />
                        </View>
                        {
                            isEditable ?
                                <BasicButton title='UPDATE' style={styles.submitBtn} titleStyle={{ letterSpacing: 1.4, fontSize: 14, fontFamily: CUSTOM_FONTS.robotoBold }} onPress={this.onSubmit} />
                                : null
                        }
                    </ScrollView>
                </KeyboardAvoidingView>
            </BasePage>
        );
    }
}

const mapStateToProps = (state) => {
    const { user, userMyWallet } = state.UserAuth;
    return { user, userMyWallet };
}
const mapDispatchToProps = (dispatch) => {
    return {
        updateMyWallet: (userId, insurance, roadsideAssistance, successCallback, errorCallback) => dispatch(updateMyWallet(userId, insurance, roadsideAssistance, successCallback, errorCallback))
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(MyWalletForm);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    submitBtn: {
        height: 35,
        backgroundColor: '#f69039',
        width: 213,
        alignSelf: 'center',
        borderRadius: 20,
        marginTop: 55,
        marginBottom: 20,

    },
    labelStyle: {
        color: '#000',
        fontSize: 11,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 1.1
    },
    secondLabelStyle: {
        color: '#000',
        fontSize: 11,
        letterSpacing: 1.1,
        marginLeft: widthPercentageToDP(2)
    }
});