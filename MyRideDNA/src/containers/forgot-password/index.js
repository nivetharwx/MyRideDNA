import React from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { connect } from 'react-redux';
import { LabeledInputPlaceholder } from '../../components/inputs';
import { toggleNetworkStatusAction } from '../../actions';
import { isValidEmailFormat } from '../../util';
import { BasicButton } from '../../components/buttons';
import axios from 'axios';
import { USER_BASE_URL, WindowDimensions, widthPercentageToDP, CUSTOM_FONTS, IS_ANDROID, heightPercentageToDP, PageKeys } from '../../constants';
import Md5 from 'react-native-md5';
import { DefaultText } from '../../components/labels';
import { Actions } from 'react-native-router-flux';

class ForgotPassword extends React.Component {
    initialState = {
        formStep: 1,
        email: '',
        password: '',
        confirmPassword: '',
        otp: '',
        showLoader: false,
        isVisiblePassword: false,
        isVisibleConfirmPassword: false,
        isVisibleOTP: false,
    };
    fieldRefs = [];
    cPasswdRef = null;
    constructor(props) {
        super(props);
        this.state = {
            ...this.initialState
        };
    }

    togglePasswordVisibility = () => this.setState(prevState => ({ isVisiblePassword: !prevState.isVisiblePassword }));

    toggleConfirmPasswordVisibility = () => this.setState(prevState => ({ isVisibleConfirmPassword: !prevState.isVisibleConfirmPassword }));

    onChangeEmail = (email = '') => this.setState({ email: email.trim() });

    onChangeOTP = (otp) => this.setState({ otp });

    onPasswordsChange = (password) => this.setState({ password });

    onConfrimPassworddChange = (confirmPassword) => this.setState({ confirmPassword });

    showNetworkError() { Alert.alert('Network Info', "Please connect to a network to continue", undefined, { cancelable: false }); }

    onCloseModal = () => {
        this.setState(this.initialState);
        this.props.onCancel();
    }

    onPressSubmitButton = () => {
        if (this.state.formStep === 1) {
            this.setState({ isVisibleOTP: true });
            this.onSubmitEmail(this.state.email);
        } else if (this.state.formStep === 2) {
            this.onSubmitOTP(this.state.otp);
        } else if (this.state.formStep === 3) {
            this.onSubmitNewPassword(this.state.password, this.state.confirmPassword);
        }
    }

    onSubmitNewPassword = (password, cPassword) => {
        if (password === cPassword) {
            if ((password + '').trim().length > 0) {
                this.setState({ showLoader: true });
                axios.put(USER_BASE_URL + `setNewPassword`, { email: this.state.email, password: Md5.hex_md5(password + '') }, { timeout: 15 * 1000 })
                    .then(res => {
                        this.setState({ showLoader: false }, () => {
                            setTimeout(() => {
                                Alert.alert('Updated successfully', 'Your password has changed successfully');
                            }, 100);
                            this.props.onCancel();
                            Actions.reset(PageKeys.LOGIN);
                            
                        });
                    })
                    .catch(error => {
                        this.setState({ showLoader: false });
                        if ((error.message === 'timeout of 15000ms exceeded' || error.message === 'Network Error') && this.props.hasNetwork === true) {
                            Alert.alert(
                                'Something went wrong ',
                                '',
                                [
                                    {
                                        text: 'Retry ', onPress: () => {
                                            this.onSubmitNewPassword()
                                        }
                                    },
                                    { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                                ],
                                { cancelable: false }
                            )
                        }
                    });
            } else {
                Alert.alert('Error', 'Please fill the fields');
            }
        } else {
            Alert.alert('Error', 'Entered passwords are not matching');
        }
    }

    onSubmitOTP = (otp) => {
        if ((otp + '').trim().length === 0) {
            Alert.alert('Error', 'Please enter the OTP');
            return;
        }
        this.setState({ showLoader: true });
        console.log(this.state.email);
        axios.post(USER_BASE_URL + `validateOTP`, { otp: otp, email: this.state.email }, { timeout: 15 * 1000 })
            .then(res => {
                this.setState({ showLoader: false, formStep: 3 });
            })
            .catch(error => {
                if (error.response) {
                    console.log('validateOTP message: ', error.message);
                    console.log('validateOTP response.data: ', error.response.data);
                    console.log('validateOTP response.status: ', error.response.status);
                    console.log('validateOTP response.headers: ', error.response.headers);
                }
                this.setState({ showLoader: false }, () => {
                    if ((error.message === 'timeout of 15000ms exceeded' || error.message === 'Network Error') && this.props.hasNetwork === true) {
                        Alert.alert(
                            'Something went wrong ',
                            '',
                            [
                                {
                                    text: 'Retry ', onPress: () => {
                                        this.onSubmitOTP()
                                    }
                                },
                                { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                            ],
                            { cancelable: false }
                        )
                    } else {
                        setTimeout(() => {
                            Alert.alert('Error', 'Entered OTP is wrong');
                        }, 100);
                    }

                });
            });
    }

    getCPasswdRef = (inputRef) => this.cPasswdRef = inputRef;

    onSubmitEditingPassword = () => this.cPasswdRef.focus();

    passwordFormat = () => {
        if (this.state.password.length < 5) {
            Alert.alert('Error', 'Password should have minimum 5 characters');
        } else if (this.state.password.search(/\d/) == -1) {
            Alert.alert('Error', 'Password should contain one number');
        }
    }

    onSubmitEmail = (email) => {
        if (!this.props.hasNetwork) {
            this.showNetworkError();
            return;
        }
        if (isValidEmailFormat(email)) {
            this.setState({ showLoader: true });
            axios.get(USER_BASE_URL + `sendOTPToMail/${email}`, undefined, { timeout: 15 * 1000 })
                .then(res => this.setState({ showLoader: false, formStep: 2 }))
                .catch(error => {
                    this.setState({ showLoader: false }, () => {
                        if ((error.message === 'timeout of 15000ms exceeded' || error.message === 'Network Error') && this.props.hasNetwork === true) {
                            Alert.alert(
                                'Something went wrong ',
                                '',
                                [
                                    { text: 'Retry ', onPress: () => this.onSubmitEmail(this.state.email) },
                                    { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                                ],
                                { cancelable: false }
                            )
                        }
                        else {
                            setTimeout(() => {
                                if (error.response.data.appErrorCode === 400) {
                                    Alert.alert('Error', 'Entered email is not registered in MyRideDNA');
                                }
                            }, 100);
                        }
                    });
                });
        } else {
            Alert.alert('Error', 'Entered email is not in the proper format');
        }
    }

    renderForm(formStep) {
        switch (formStep) {
            case 1:
                return (
                    <View>
                        <DefaultText style={{color:'#707070', fontSize:14, marginTop:7}}>Oops! It looks like we’ve hit a roadblock! Did you forget your password?
                        Enter the email you use for MyRideDNA and we’ll send you instructions to reset your password
                        </DefaultText>
                        <LabeledInputPlaceholder
                            containerStyle={{ backgroundColor: '#F4F4F4', flex: 0, borderBottomColor: '#707070' }}
                            inputValue={this.state.email} inputStyle={{ paddingBottom: 0, }} inputType={'emailAddress'}
                            outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3), marginTop: 10, flex: 0 }}
                            returnKeyType='done'
                            onChange={this.onChangeEmail} label='EMAIL ADDRESS' labelStyle={styles.labelStyle}
                            hideKeyboardOnSubmit={false}
                            onSubmit={this.onPressSubmitButton} />
                        <BasicButton title='SUBMIT' style={[styles.submitBtn, { backgroundColor: '#2B77B4' }]} titleStyle={styles.submitBtnTxt} onPress={this.onPressSubmitButton} />
                    </View>
                )
            case 2:
                return (
                    <View>
                        <LabeledInputPlaceholder
                            containerStyle={{ backgroundColor: '#F4F4F4', flex: 0, borderBottomColor: '#707070' }}
                            inputValue={this.state.otp} inputStyle={{ paddingBottom: 0, }}
                            outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3), marginTop: 10, flex: 0 }}
                            returnKeyType='done'
                            onChange={this.onChangeOTP} label='ENTER THE ONE-TIME PASSWORD HERE' labelStyle={styles.labelStyle}
                            hideKeyboardOnSubmit={false}
                            onSubmit={this.onPressSubmitButton} />
                        {
                            this.state.isVisibleOTP
                                ? <DefaultText style={{ color: 'red', fontSize: 13 }}>This has been sent to your registered email</DefaultText>
                                : null
                        }
                        <BasicButton title='SUBMIT' style={[styles.submitBtn, { backgroundColor: '#2B77B4' }]} titleStyle={styles.submitBtnTxt} onPress={this.onPressSubmitButton} />
                    </View >
                )
            case 3:
                return (
                    <View>
                        <LabeledInputPlaceholder
                            containerStyle={{ backgroundColor: '#F4F4F4', flex: 0, borderBottomColor: '#707070' }}
                            inputValue={this.state.password} inputStyle={{ paddingBottom: 0, }}
                            outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3), marginTop: 40, flex: 0 }}
                            inputRef={elRef => this.fieldRefs[0] = elRef} returnKeyType='next'
                            secureTextEntry={!this.state.isVisiblePassword}
                            onChange={this.onPasswordsChange} label='NEW PASSWORD' labelStyle={styles.labelStyle}
                            onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false}
                            iconProps={{ name: this.state.isVisiblePassword ? 'eye-off' : 'eye', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(6), paddingRight: 0, color: 'white' }, onPress: this.togglePasswordVisibility, containerStyle: { backgroundColor: '#0083CA', alignItems: 'center', justifyContent: 'center', width: widthPercentageToDP(8), height: widthPercentageToDP(8), borderRadius: widthPercentageToDP(4) } }}
                        />
                        <LabeledInputPlaceholder
                            containerStyle={{ backgroundColor: '#F4F4F4', flex: 0, borderBottomColor: '#707070' }}
                            inputValue={this.state.confirmPassword} inputStyle={{ paddingBottom: 0, }}
                            outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3), marginTop: 40, flex: 0 }}
                            inputRef={elRef => this.fieldRefs[1] = elRef} returnKeyType='done'
                            secureTextEntry={!this.state.isVisibleConfirmPassword}
                            onChange={this.onConfrimPassworddChange} label='CONFIRM PASSWORD' labelStyle={styles.labelStyle}
                            onSubmit={this.onPressSubmitButton}
                            iconProps={{ name: this.state.isVisibleConfirmPassword ? 'eye-off' : 'eye', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(6), paddingRight: 0, color: 'white' }, onPress: this.toggleConfirmPasswordVisibility, containerStyle: { backgroundColor: '#0083CA', alignItems: 'center', justifyContent: 'center', width: widthPercentageToDP(8), height: widthPercentageToDP(8), borderRadius: widthPercentageToDP(4) } }}
                        />
                        <BasicButton title='SUBMIT' style={[styles.submitBtn, { backgroundColor: '#2B77B4' }]} titleStyle={styles.submitBtnTxt} onPress={this.onPressSubmitButton} />
                    </View>
                )
        }
    }

    render() {
        const { formStep } = this.state;
        return (
            <View>{this.renderForm(formStep)}</View>
        );
    }

}
const mapStateToProps = (state) => {
    const { hasNetwork } = state.PageState;
    return { hasNetwork };
}
const mapDipatchToProps = (dispatch) => {
    return {
        toggleNetworkStatus: (status) => dispatch(toggleNetworkStatusAction(status)),
    }; 
}
export default connect(mapStateToProps, mapDipatchToProps)(ForgotPassword);

const styles = StyleSheet.create({
    container: {
        width: WindowDimensions.width * 0.8,
        height: WindowDimensions.height * 0.3,
        backgroundColor: '#fff',
        elevation: 3,
        justifyContent: 'center'
    },
    buttonContainer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    form: {
        marginHorizontal: 10,
    },
    labelStyle: {
        fontSize: 11,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 1.1
    },
    submitBtn: {
        height: 35,
        backgroundColor: '#f69039',
        width: 213,
        alignSelf: 'center',
        marginTop: 32,
        borderRadius: 20

    },
    submitBtnTxt: {
        letterSpacing: 1.4,
        fontSize: 14,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
});