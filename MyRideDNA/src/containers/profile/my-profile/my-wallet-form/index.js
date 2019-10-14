import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, KeyboardAvoidingView, StatusBar, Platform, ScrollView, View, Keyboard, Alert, TextInput, Text } from 'react-native';
import { BasicHeader } from '../../../../components/headers';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, IS_ANDROID } from '../../../../constants';
import { Actions } from 'react-native-router-flux';
import { LabeledInput, IconicList, IconicDatePicker, IconicInput, LabeledInputPlaceholder } from '../../../../components/inputs';
import { BasicButton, IconButton } from '../../../../components/buttons';
import { Thumbnail } from '../../../../components/images';
import ImageCropPicker from 'react-native-image-crop-picker';
import { addBikeToGarage, editBike, updateUserInfo, updateProfilePicture, updateMyWallet } from '../../../../api';
import { toggleLoaderAction } from '../../../../actions';
import { DatePicker, Icon as NBIcon, Toast } from 'native-base';
import { Loader } from '../../../../components/loader';
import ImagePicker from 'react-native-image-crop-picker';

class MyWalletForm extends Component {
    fieldRefs = [];
    vScroll = null;
    changedDetails = {};
    updatingUserMyWallet = false;
    constructor(props) {
        console.log('constructor')
        super(props);
        this.state = {
            showLoader: false,
            isLoadingProfPic: false,
            insurance: {
                ...props.userMyWallet.insurance
            },
            roadsideAssistance:{
                ...props.userMyWallet.roadsideAssistance
            }
        };
    }

    componentDidMount(){
        
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.userMyWallet !== this.props.userMyWallet) {
            // DOC: Confirming changes happened due to api call from this form
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
        console.log('insurance : ', this.state.insurance)
        console.log('roadsideAssistance : ', this.state.roadsideAssistance)
        Keyboard.dismiss();
        this.updatingUserMyWallet = true;
        this.setState({ showLoader: true })
        this.props.updateMyWallet(this.props.user.userId,this.state.insurance, this.state.roadsideAssistance, (res) => {
            this.hideLoader()
        }, (err) => {
            this.hideLoader()
        });
    }



    render() {
        const { insurance,roadsideAssistance, showLoader } = this.state;
        console.log('userMyWallet : ',this.props.userMyWallet)
        console.log('insurance : ',this.state.insurance)
        console.log('roadsideAssistance : ',this.state.roadsideAssistance)
        return (
            <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <KeyboardAvoidingView behavior={IS_ANDROID ? null : 'padding'} style={styles.fill}>
                    <BasicHeader title='My Wallet' leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }} />
                    <ScrollView >
                        <View style={{ marginLeft: widthPercentageToDP(13), marginTop: heightPercentageToDP(15) }}>
                            <Text style={{ color: '#F5891F', fontSize: 17, fontWeight: 'bold' }}>Insurance</Text>
                            <LabeledInputPlaceholder
                                inputValue={insurance.name} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{marginTop:IS_ANDROID?null:heightPercentageToDP(3)}}
                                inputRef={elRef => this.fieldRefs[0] = elRef} returnKeyType='next'
                                onChange={this.onChangeName} label='NAME' secondLabel='(Insured Rider)' secondLabelStyle={styles.secondLabelStyle} labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[0].focus()} hideKeyboardOnSubmit={false} />

                            <LabeledInputPlaceholder
                                inputValue={insurance.vehicle} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{marginTop:IS_ANDROID?null:heightPercentageToDP(3)}}
                                inputRef={elRef => this.fieldRefs[1] = elRef} returnKeyType='next'
                                onChange={this.onChangeVehicle} label='VEHICLE' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                inputValue={insurance.policyNumber} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{marginTop:IS_ANDROID?null:heightPercentageToDP(3)}}
                                inputRef={elRef => this.fieldRefs[2] = elRef} returnKeyType='next'
                                onChange={this.onChangePolicyNumberInsurance} label='POLICY NUMBER' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[2].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                inputValue={insurance.contactInfo} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{marginTop:IS_ANDROID?null:heightPercentageToDP(3)}}
                                inputRef={elRef => this.fieldRefs[3] = elRef} returnKeyType='next'
                                onChange={this.onChangeContactInfoInsurance} label='CONTACT INFO' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[3].focus()} hideKeyboardOnSubmit={false} />

                            <Text style={{ color: '#F5891F', fontSize: 17, fontWeight: 'bold', marginTop: heightPercentageToDP(5) }}>ROADSIDE ASSISTANCE</Text>
                            <LabeledInputPlaceholder
                                inputValue={roadsideAssistance.policyNumber} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{marginTop:IS_ANDROID?null:heightPercentageToDP(3)}}
                                inputRef={elRef => this.fieldRefs[4] = elRef} returnKeyType='next'
                                onChange={this.onChangePolicyNumberRdAsst} label='POLICY NUMBER' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[4].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                inputValue={roadsideAssistance.contactInfo} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{marginTop:IS_ANDROID?null:heightPercentageToDP(3)}}
                                inputRef={elRef => this.fieldRefs[5] = elRef} returnKeyType='next'
                                onChange={this.onChangeContactInfoRdAsst} label='CONTACT INFO' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[5].focus()} hideKeyboardOnSubmit={false} />
                        </View>
                    </ScrollView>
                    <BasicButton title='UPDATE' style={styles.submitBtn} titleStyle={{ letterSpacing: 2, fontSize: heightPercentageToDP(3.5) }} onPress={this.onSubmit} />
                </KeyboardAvoidingView>
                <Loader isVisible={showLoader} />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user, userMyWallet } = state.UserAuth;
    return { user, userMyWallet };
}
const mapDispatchToProps = (dispatch) => {
    return {
        // updateUser: (userInfo, successCallback, errorCallback) => dispatch(updateUserInfo(userInfo, successCallback, errorCallback)),
        updateMyWallet : (userId, insurance, roadsideAssistance, successCallback, errorCallback) => dispatch(updateMyWallet(userId, insurance, roadsideAssistance, successCallback, errorCallback))
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(MyWalletForm);

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
        // flex: 1,
        // justifyContent: 'space-around'
    },
    submitBtn: {
        height: heightPercentageToDP(9),
        backgroundColor: '#f69039',
    },
    formFieldIcon: {
        color: '#999999'
    },
    addressInput: {
        width: '48%',
        borderBottomColor: '#D4D4D4',
        borderBottomWidth: 1
    },
    labelStyle: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1.1
    },
    secondLabelStyle: {
        color: '#000',
        fontSize: 10,
        letterSpacing: 1.1,
        marginLeft: widthPercentageToDP(2)
    }
});