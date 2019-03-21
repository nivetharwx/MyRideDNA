import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, StatusBar, ScrollView, View, Keyboard, Alert, KeyboardAvoidingView } from 'react-native';
import { BasicHeader } from '../../../components/headers';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, IS_ANDROID } from '../../../constants';
import { Actions } from 'react-native-router-flux';
import { LabeledInput, IconicList, IconicDatePicker } from '../../../components/inputs';
import { BasicButton } from '../../../components/buttons';
import { Thumbnail } from '../../../components/images';
import ImageCropPicker from 'react-native-image-crop-picker';
import { addBikeToGarage, editBike, registerPassenger, updatePassengerDetails } from '../../../api';
import { toggleLoaderAction } from '../../../actions';

class PaasengerForm extends Component {
    fieldRefs = [];
    constructor(props) {
        super(props);
        this.state = {
            passenger: props.passengerIdx >= 0 ? props.passengerList[props.passengerIdx] : {}
        };
        if (!this.state.passenger.homeAddress) {
            this.state.passenger.homeAddress = { address: '', city: '', state: '', country: '', zipCode: '' };
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.passengerList !== this.props.passengerList) {
            Actions.pop();
        }
    }

    onChangeName = (val) => {
        this.setState(prevState => ({ passenger: { ...prevState.passenger, name: val + '' } }));
    }

    onChangeGender = (val) => {
        this.setState(prevState => ({ passenger: { ...prevState.passenger, gender: val + '' } }));
    }

    onChangeDOB = (val) => {
        this.setState(prevState => ({ passenger: { ...prevState.passenger, dob: val + '' } }));
    }

    onChangeAddress = (val) => {
        this.setState(prevState => ({ passenger: { ...prevState.passenger, homeAddress: { ...prevState.passenger.homeAddress, address: val + '' } } }));
    }

    onChangeCity = (val) => {
        this.setState(prevState => ({ passenger: { ...prevState.passenger, homeAddress: { ...prevState.passenger.homeAddress, city: val + '' } } }));
    }

    onChangeState = (val) => {
        this.setState(prevState => ({ passenger: { ...prevState.passenger, homeAddress: { ...prevState.passenger.homeAddress, state: val + '' } } }));
    }

    onChangeCountry = (val) => {
        this.setState(prevState => ({ passenger: { ...prevState.passenger, homeAddress: { ...prevState.passenger.homeAddress, country: val + '' } } }));
    }

    onSubmit = () => {
        Keyboard.dismiss();
        const { passenger } = this.state;
        if (!passenger.name || passenger.name.trim().length === 0) {
            Alert.alert('Field Error', 'Please enter a passenger name');
            return;
        }
        if (!passenger.passengerId) {
            this.props.registerPassenger(this.props.user.userId, passenger);
        } else {
            this.props.updatePassengerDetails(passenger);
        }
    }

    render() {
        const { passenger } = this.state;
        const GENDER_LIST = [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }];
        return (
            <View style={styles.fill} >
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <KeyboardAvoidingView behavior={IS_ANDROID ? null : 'padding'} style={styles.fill}>
                    <BasicHeader headerHeight={heightPercentageToDP(8.5)} title={passenger.passengerId ? 'Edit Passenger' : 'Add Passenger'} leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: () => Actions.pop() }} />
                    <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
                        <LabeledInput inputValue={passenger.name} inputRef={elRef => this.fieldRefs[0] = elRef} returnKeyType='next' onChange={this.onChangeName} placeholder='Name' onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false} />
                        <IconicList
                            selectedValue={passenger.gender} placeholder='Gender' values={GENDER_LIST}
                            onChange={this.onChangeGender} />
                        <IconicDatePicker selectedDate={passenger.dob} onChange={this.onChangeDOB} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <LabeledInput containerStyle={{ flex: 1 }} inputValue={passenger.address} inputRef={elRef => this.fieldRefs[1] = elRef} returnKeyType='next' onChange={this.onChangeAddress} placeholder='Building number, street' onSubmit={() => this.fieldRefs[2].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInput containerStyle={{ flex: 1 }} inputValue={passenger.city} inputRef={elRef => this.fieldRefs[2] = elRef} returnKeyType='next' onChange={this.onChangeCity} placeholder='City' onSubmit={() => this.fieldRefs[3].focus()} hideKeyboardOnSubmit={false} />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <LabeledInput containerStyle={{ flex: 1 }} inputValue={passenger.state} inputRef={elRef => this.fieldRefs[3] = elRef} returnKeyType='next' onChange={this.onChangeState} placeholder='State' onSubmit={() => this.fieldRefs[4].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInput containerStyle={{ flex: 1 }} inputValue={passenger.country} inputRef={elRef => this.fieldRefs[4] = elRef} onChange={this.onChangeCountry} placeholder='Country' onSubmit={() => { }} hideKeyboardOnSubmit={true} />
                        </View>
                    </ScrollView>
                    <BasicButton title='SUBMIT' style={styles.submitBtn} onPress={this.onSubmit} />
                </KeyboardAvoidingView>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { passengerList } = state.PassengerList;
    return { user, passengerList };
}
const mapDispatchToProps = (dispatch) => {
    return {
        registerPassenger: (userId, passenger) => dispatch(registerPassenger(userId, passenger)),
        updatePassengerDetails: (passenger) => dispatch(updatePassengerDetails(passenger)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(PaasengerForm);

const styles = StyleSheet.create({
    fill: {
        flex: 1
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
    imageUploadBtn: {
        marginLeft: 10,
        height: heightPercentageToDP(5),
        width: '50%'
    },
    imgContainer: {
        marginTop: heightPercentageToDP(2),
        flexDirection: 'row',
        flexWrap: 'wrap',
    }
});