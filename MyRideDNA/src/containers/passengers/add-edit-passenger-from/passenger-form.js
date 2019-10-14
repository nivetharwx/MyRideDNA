import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, StatusBar, ScrollView, View, Keyboard, Alert, KeyboardAvoidingView, Text } from 'react-native';
import { BasicHeader } from '../../../components/headers';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, IS_ANDROID } from '../../../constants';
import { Actions } from 'react-native-router-flux';
import { LabeledInput, IconicList, IconicDatePicker, LabeledInputPlaceholder } from '../../../components/inputs';
import { BasicButton, IconButton } from '../../../components/buttons';
import { Thumbnail } from '../../../components/images';
import ImageCropPicker from 'react-native-image-crop-picker';
import { addBikeToGarage, editBike, registerPassenger, updatePassengerDetails } from '../../../api';
import { toggleLoaderAction } from '../../../actions';
import { Tabs, Tab, TabHeading, ScrollableTab, ListItem, Left, Body, Right, Icon as NBIcon, Toast } from 'native-base';
import { IconLabelPair } from '../../../components/labels';
import ImagePicker from 'react-native-image-crop-picker';

class PaasengerFormDisplay extends Component {
    fieldRefs = [];
    constructor(props) {
        super(props);
        this.state = {
            passenger: props.passengerIdx >= 0 ? props.passengerList[props.passengerIdx] : {},
            activeTab: 0,
        };
        if (!this.state.passenger.homeAddress) {
            this.state.passenger['homeAddress'] = { city: '', state: '' };
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.passengerList !== this.props.passengerList) {
            // Actions.pop();
        }
    }

    onChangeName = (val) => {
        this.setState(prevState => ({ passenger: { ...prevState.passenger, name: val + '' } }));
    }

    onChangeGender = (val) => {
        this.setState(prevState => ({ passenger: { ...prevState.passenger, gender: val + '' } }));
    }

    onChangeDOB = (val) => {
        this.setState(prevState => ({ passenger: { ...prevState.passenger, dob: new Date(val).toISOString() } }));
    }

    // onChangeCity = (val) => {
    //     this.setState(prevState => ({ passenger: { ...prevState.passenger, city: val + '' } }));
    // }

    // onChangeState = (val) => {
    //     this.setState(prevState => ({ passenger: { ...prevState.passenger, state: val + '' } }));
    // }
    onChangeCity = (val) => {
        this.setState(prevState => ({ passenger: { ...prevState.passenger, homeAddress: { ...prevState.passenger.homeAddress, city: val + '' } } }));
    }

    onChangeState = (val) => {
        this.setState(prevState => ({ passenger: { ...prevState.passenger, homeAddress: { ...prevState.passenger.homeAddress, state: val + '' } } }));
    }


    onChangePhone = (val) => {
        // this.changedDetails['gender'] = val;
        this.setState(prevState => ({ passenger: { ...prevState.passenger, phoneNumber: val + '' } }));
    }

    onSubmit = () => {
        Keyboard.dismiss();
        const { passenger } = this.state;
        if (!passenger.name || passenger.name.trim().length === 0) {
            Alert.alert('Field Error', 'Please enter a passenger name');
            return;
        }
        if (!passenger.passengerId) {
            console.log('passenger submit : ', this.state.passenger)
            this.props.registerPassenger(this.props.user.userId, passenger);
        } else {
            console.log('passenger update : ', this.state.passenger);
            this.props.updatePassengerDetails(passenger.passengerId, passenger);
        }
    }

    onChangeTab = ({ from, i }) => {
        this.setState({ activeTab: i }, () => {
        });
    }

    onPressGalleryIcon = async () => {
        console.log('onPressGalleryIcon')
        this.setState({ isLoadingProfPic: true });
        try {
            const imageObj = await ImagePicker.openPicker({
                width: 300,
                height: 300,
                cropping: false,
                includeBase64: true,
            });
            // this.props.updateProfilePicture(imageObj.data, imageObj.mime, this.props.user.userId);
            this.setState(prevState => ({ passenger: { ...prevState.passenger, mimeType: imageObj.mime, image: imageObj.data } }));
        } catch (er) {
            this.setState({ isLoadingProfPic: false });
            console.log("Error occurd: ", er);
        }
    }

    onPressCameraIcon = async () => {
        console.log('onPressCameraIcon')
        this.setState({ isLoadingProfPic: true });
        try {
            const imageObj = await ImagePicker.openCamera({
                width: 300,
                height: 300,
                includeBase64: true,
                cropping: false, // DOC: Setting this to true (in openCamera) is not working as expected (19-12-2018).
            });
            this.setState(prevState => ({ passenger: { ...prevState.passenger, mimeType: imageObj.mime, image: imageObj.data } }));
        } catch (er) {
            this.setState({ isLoadingProfPic: false });
            console.log("Error occurd: ", er);
        }

    }

    render() {
        const { passenger, activeTab } = this.state;
        const {topMargin} = this.props
        const GENDER_LIST = [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }];
        return (
            <View style={styles.fill} >
                <KeyboardAvoidingView behavior={IS_ANDROID ? null : 'padding'} style={styles.fill}>
                    <ScrollView >
                        <View style={[{ flexDirection: 'row', justifyContent: 'space-evenly' }, topMargin]}>
                            <View style={{ alignSelf: 'center' }}>
                                <IconButton Button iconProps={{ name: 'camera', type: 'FontAwesome', style: { fontSize: widthPercentageToDP(9), color: '#F5891F' } }}
                                    style={{}} onPress={this.onPressCameraIcon} />
                                <Text style={{ letterSpacing: 2, marginTop: heightPercentageToDP(1), fontWeight: '500', color: '#000', fontSize: heightPercentageToDP(2) }}>{' TAKE \nPHOTO'}</Text>
                            </View>
                            <View style={{ alignSelf: 'center' }}>
                                <IconButton Button iconProps={{ name: 'md-photos', type: 'Ionicons', style: { fontSize: widthPercentageToDP(9), color: '#F5891F' } }}
                                    style={{}} onPress={this.onPressGalleryIcon} />
                                <Text style={{ letterSpacing: 2, marginTop: heightPercentageToDP(1), fontWeight: '500', color: '#000', fontSize: heightPercentageToDP(2) }}>{'UPLOAD \n PHOTO'}</Text>
                            </View>
                        </View>
                        <View style={{ marginLeft: widthPercentageToDP(12), marginTop: heightPercentageToDP(3) }}>
                            <LabeledInputPlaceholder
                                inputValue={passenger.name} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{marginTop:IS_ANDROID?null:heightPercentageToDP(4)}}
                                inputRef={elRef => this.fieldRefs[0] = elRef} returnKeyType='next'
                                onChange={this.onChangeName} label='NAME' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                inputValue={passenger.homeAddress.city} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{marginTop:IS_ANDROID?null:heightPercentageToDP(4)}}
                                inputRef={elRef => this.fieldRefs[1] = elRef} returnKeyType='next'
                                onChange={this.onChangeCity} label='CITY' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[2].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                inputValue={passenger.homeAddress.state} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{marginTop:IS_ANDROID?null:heightPercentageToDP(4)}}
                                inputRef={elRef => this.fieldRefs[2] = elRef} returnKeyType='next'
                                onChange={this.onChangeState} label='STATE' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[3].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInputPlaceholder
                                inputValue={passenger.phoneNumber? + passenger.phoneNumber + "":passenger.phoneNumber} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{marginTop:IS_ANDROID?null:heightPercentageToDP(4)}}
                                inputRef={elRef => this.fieldRefs[3] = elRef} returnKeyType='next'
                                onChange={this.onChangePhone} label='PHONE' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[4].focus()} hideKeyboardOnSubmit={false} 
                                inputType="telephoneNumber"
                                />
                            <IconicList
                                selectedValue={passenger.gender} values={GENDER_LIST} labelPlaceHolder='GENDER'
                                outerContainer={{marginTop:IS_ANDROID?null:heightPercentageToDP(3)}}
                                labelPlaceHolderStyle={[styles.labelStyle, { marginTop: heightPercentageToDP(1) }]}
                                innerContainerStyle={{ borderBottomWidth: 1 }} onChange={this.onChangeGender} />
                            <IconicDatePicker
                                selectedDate={passenger.dob} datePickerStyle={{ paddingLeft: 0, paddingBottom: 1, fontSize: heightPercentageToDP(2.3) }}
                                outerContainer={{marginTop:IS_ANDROID?null:heightPercentageToDP(4)}}
                                onChange={this.onChangeDOB} label='BIRTHDAY' labelStyle={styles.labelStyle} />
                        </View>
                        <BasicButton title='UPDATE' style={styles.submitBtn} titleStyle={{ letterSpacing: 2, fontSize: heightPercentageToDP(3.5) }} onPress={this.onSubmit} />
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* <KeyboardAvoidingView behavior={IS_ANDROID ? null : 'padding'} style={styles.fill}>
                    <BasicHeader headerHeight={heightPercentageToDP(8.5)} title={passenger.passengerId ? 'Edit Passenger' : 'Add Passenger'} leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: () => Actions.pop() }} />
                    <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
                        <LabeledInput inputValue={passenger.name} inputRef={elRef => this.fieldRefs[0] = elRef} returnKeyType='next' onChange={this.onChangeName} placeholder='Name' onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false} />
                        <IconicList
                            selectedValue={passenger.gender} placeholder='Gender' values={GENDER_LIST}
                            onChange={this.onChangeGender} />
                        <IconicDatePicker selectedDate={passenger.dob} onChange={this.onChangeDOB} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <LabeledInput containerStyle={{ flex: 1 }} inputValue={passenger.homeAddress.address} inputRef={elRef => this.fieldRefs[1] = elRef} returnKeyType='next' onChange={this.onChangeAddress} placeholder='Building number, street' onSubmit={() => this.fieldRefs[2].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInput containerStyle={{ flex: 1 }} inputValue={passenger.homeAddress.city} inputRef={elRef => this.fieldRefs[2] = elRef} returnKeyType='next' onChange={this.onChangeCity} placeholder='City' onSubmit={() => this.fieldRefs[3].focus()} hideKeyboardOnSubmit={false} />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <LabeledInput containerStyle={{ flex: 1 }} inputValue={passenger.homeAddress.state} inputRef={elRef => this.fieldRefs[3] = elRef} returnKeyType='next' onChange={this.onChangeState} placeholder='State' onSubmit={() => this.fieldRefs[4].focus()} hideKeyboardOnSubmit={false} />
                            <LabeledInput containerStyle={{ flex: 1 }} inputValue={passenger.homeAddress.country} inputRef={elRef => this.fieldRefs[4] = elRef} onChange={this.onChangeCountry} placeholder='Country' onSubmit={() => { }} hideKeyboardOnSubmit={true} />
                        </View>
                    </ScrollView>
                    <BasicButton title='SUBMIT' style={styles.submitBtn} onPress={this.onSubmit} />
                </KeyboardAvoidingView> */}
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
        updatePassengerDetails: (passengerId ,passenger) => dispatch(updatePassengerDetails(passengerId ,passenger)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(PaasengerFormDisplay);

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
    },
    tabContentCont: {
        paddingHorizontal: 0
    },
    labelStyle: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1.1
    },
    submitBtn: {
        height: heightPercentageToDP(9),
        backgroundColor: '#f69039',
        marginTop: heightPercentageToDP(8)
    },
});