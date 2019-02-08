import React from 'react';
import { StyleSheet, View, Alert, TouchableHighlight, Text } from 'react-native';
import { connect } from 'react-redux';
import { LabeledInput } from '../../components/inputs';
import { toggleNetworkStatusAction } from '../../actions';
import { isValidEmailFormat } from '../../util';
import Spinner from 'react-native-loading-spinner-overlay';
import { LinkButton } from '../../components/buttons';
import axios from 'axios';
import { USER_BASE_URL, WindowDimensions, APP_COMMON_STYLES } from '../../constants';
import { BaseModal } from '../../components/modal';
import Md5 from 'react-native-md5';
import { Toast } from 'native-base';

class ForgotPassword extends React.Component {
    initialState = {
        formStep: 1,
        email: '',
        password: '',
        confirmPassword: '',
        otp: '',
        showLoader: false,
    };
    cPasswdRef = null;
    constructor(props) {
        super(props);
        this.state = {
            ...this.initialState
        };
    }

    onChangeEmail = (email) => {
        this.setState({ email });
    }

    onChangeOTP = (otp) => {
        this.setState({ otp });
    }

    onPasswordsChange = (password) => {
        this.setState({ password });
    }

    onConfrimPassworddChange = (confirmPassword) => {
        this.setState({ confirmPassword });
    }

    showNetworkError() {
        Alert.alert('Network Info', "Please connect to a network to continue", undefined, { cancelable: false });
    }

    onCloseModal = () => {
        this.setState(this.initialState);
        this.props.onCancel();
    }

    onPressSubmitButton = () => {
        if (this.state.formStep === 1) {
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
                            Alert.alert('Updated successfully', 'Please do login with your new password');
                            this.props.onCancel();
                        });
                    })
                    .catch(error => {
                        this.setState({ showLoader: false });
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
        axios.post(USER_BASE_URL + `validateOTP`, { otp: otp, email: this.state.email }, { timeout: 15 * 1000 })
            .then(res => {
                this.setState({ showLoader: false, formStep: 3 });
            })
            .catch(error => {
                this.setState({ showLoader: false }, () => {
                    Alert.alert('Error', 'Entered OTP is wrong');
                });
            });
    }

    getCPasswdRef = (inputRef) => {
        this.cPasswdRef = inputRef;
    }

    onSubmitEditingPassword = () => {
        this.cPasswdRef.focus();
    }

    onSubmitEmail = (email) => {
        if (!this.props.hasNetwork) {
            this.showNetworkError();
            return;
        }
        if (isValidEmailFormat(email)) {
            this.setState({ showLoader: true });
            axios.get(USER_BASE_URL + `sendOTPToMail/${email}`, undefined, { timeout: 15 * 1000 })
                .then(res => {
                    Toast.show({
                        text: 'We have sent an OTP to your email',
                        buttonText: 'Okay'
                    });
                    this.setState({ showLoader: false, formStep: 2 });
                })
                .catch(error => {
                    this.setState({ showLoader: false }, () => {
                        if (error.response.data.appErrorCode === 400) {
                            Alert.alert('Error', 'Entered email is not registered in MyRideDNA');
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
                    <View style={styles.form}>
                        <LabeledInput placeholder='Enter your registered email' onChange={this.onChangeEmail} onSubmit={this.onSubmitEmail} />
                        <View style={styles.buttonContainer}>
                            <LinkButton title='Cancel' onPress={this.onCloseModal} />
                            <LinkButton title='Submit' onPress={this.onPressSubmitButton} />
                        </View>
                    </View>
                )
            case 2:
                return (
                    <View style={styles.form}>
                        <LabeledInput placeholder='Enter the OTP here' onChange={this.onChangeOTP} onSubmit={this.onSubmitOTP} />
                        <View style={styles.buttonContainer}>
                            <LinkButton title='Cancel' onPress={this.onCloseModal} />
                            <LinkButton title='Resend OTP' onPress={() => this.onSubmitEmail(this.state.email)} />
                            <LinkButton title='Submit' onPress={this.onPressSubmitButton} />
                        </View>
                    </View>
                )
            case 3:
                return (
                    <View style={styles.form}>
                        <LabeledInput inputType='password' returnKeyType='next' placeholder='Enter new password' onChange={this.onPasswordsChange} onSubmit={this.onSubmitEditingPassword} hideKeyboardOnSubmit={false} />
                        <LabeledInput inputType='password' placeholder='Confirm password' onChange={this.onConfrimPassworddChange} inputRef={this.getCPasswdRef} />
                        <View style={styles.buttonContainer}>
                            <LinkButton title='Cancel' onPress={this.onCloseModal} />
                            <LinkButton title='Submit' onPress={this.onPressSubmitButton} />
                        </View>
                    </View>
                )
        }
    }

    render() {
        const { formStep, showLoader } = this.state;
        const { isVisible, onCancel, onPressOutside } = this.props;
        return (
            <BaseModal isVisible={isVisible} alignCenter={true} onCancel={this.onCloseModal}>
                <View style={styles.fill}>
                    <Spinner
                        visible={showLoader}
                        textContent={'Verifying...'}
                        textStyle={{ color: '#fff' }}
                    />
                    {
                        this.renderForm(formStep)
                    }
                </View>
            </BaseModal>
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
    fill: {
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
    }
});