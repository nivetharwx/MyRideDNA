import React, { Component } from 'react';
import { View, ScrollView, StyleSheet, Platform, TextInput, Text } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';

import { IconicInput, IconicList, IconicDatePicker } from '../../components/inputs';
import { BasicHeader } from '../../components/headers';
import { Icon as NBIcon } from 'native-base';
import { updateUserInfo } from '../../api';
import { IS_ANDROID } from '../../constants';


const ANDROID_HEADER_HEIGHT = 50;
const IOS_HEADER_HEIGHT = 90;
const HEADER_HEIGHT = IS_ANDROID ? ANDROID_HEADER_HEIGHT : IOS_HEADER_HEIGHT;

class EditProfile extends Component {
    changedDetails = {};
    constructor(props) {
        super(props);
        this.state = {
            user: this.props.user
        };
    }

    componentWillReceiveProps(nextProps) {
        console.log("componentWillReceiveProps - nextProps", nextProps.user);
        console.log("componentWillReceiveProps - prevProps", this.props.user);
        console.log("componentWillReceiveProps - state", this.state.user);
    }

    onPressBackButton = () => {
        Actions.pop();
    }

    onPressSave = () => {
        // if (this.props.callback) {
        //     this.props.callback(this.state.user).then(res => {
        //         Actions.pop();
        //     }, err => {
        //         console.log(err);
        //         Actions.pop();
        //     });
        // }
        if (Object.keys(this.changedDetails).length > 0) {
            this.changedDetails.userId = this.state.user.userId;
            this.changedDetails.email = this.state.user.email;
            this.props.updateUser(this.changedDetails);
            Actions.pop();
        } else {
            console.log("User details did not change");
        }
    }

    render() {
        const GENDER_LIST = [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }];
        const { user } = this.state;
        return (
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <BasicHeader headerHeight={HEADER_HEIGHT} leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                    title='Edit your info' rightIconProps={{ name: 'md-checkmark', type: 'Ionicons', onPress: this.onPressSave }} />
                <ScrollView style={{ backgroundColor: 'white', flex: 1, marginTop: HEADER_HEIGHT, paddingVertical: 20 }}>
                    <View style={{ flex: 1, justifyContent: 'space-around' }}>
                        <IconicInput iconProps={{ name: 'md-person', type: 'Ionicons' }} inputType='name' placeholder='Name' value={user.name}
                            onChange={val => { this.changedDetails['name'] = val; this.setState({ user: { ...user, name: val } }) }} />
                        <IconicInput iconProps={{ name: 'md-person', type: 'Ionicons' }} inputType='name' placeholder='Nick Name' value={user.nickname}
                            onChange={val => { this.changedDetails['nickname'] = val; this.setState({ user: { ...user, nickname: val } }) }} />
                        <IconicList iconProps={{ name: 'transgender', type: 'FontAwesome' }} selectedValue={user.gender} placeholder='Gender'
                            onChange={val => { this.changedDetails['gender'] = val; this.setState({ user: { ...user, gender: val } }) }} values={GENDER_LIST}></IconicList>
                        <IconicDatePicker iconProps={{ name: 'calendar', type: 'Foundation' }} onChange={val => this.setState({ user: { ...user, ...{ dob: val } } })} selectedDateString={user.dob} />
                        <View style={{ marginVertical: 10 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ paddingLeft: 10, paddingRight: 5, justifyContent: 'center', alignItems: 'center' }}>
                                    <NBIcon name='address-card' type='FontAwesome' style={{ fontSize: 14, color: '#a9a9a9' }} />
                                </View>
                                <Text style={{ marginLeft: 5, fontSize: 16 }}>Address</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: 10 }}>
                                <TextInput style={styles.addressInput} placeholder='Building number, Street line' textContentType='addressCity'
                                    onChange={val => this.setState({ user: { ...user, homeAddress: { ...user.homeAddress, ...{ address: val } } } })} />
                                <TextInput style={styles.addressInput} placeholder='City' textContentType='addressCity'
                                    onChange={val => this.setState({ user: { ...user, homeAddress: { ...user.homeAddress, ...{ city: val } } } })} />
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: 10 }}>
                                <TextInput style={{ width: '48%', borderBottomColor: '#D4D4D4', borderBottomWidth: 1 }} placeholder='State' textContentType='addressState'
                                    onChange={val => this.setState({ user: { ...user, homeAddress: { ...user.homeAddress, ...{ state: val } } } })} />
                                <TextInput style={styles.addressInput} placeholder='Country' textContentType='countryName'
                                    onChange={val => this.setState({ user: { ...user, homeAddress: { ...user.homeAddress, ...{ country: val } } } })} />
                            </View>
                            <TextInput style={[styles.addressInput, { marginLeft: 10 }]} placeholder='Postal code' textContentType='postalCode' keyboardType='numeric'
                                onChange={val => this.setState({ user: { ...user, homeAddress: { ...user.homeAddress, ...{ zipCode: val } } } })} />
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    return { user };
};
const mapDispatchToProps = (dispatch) => {
    return {
        updateUser: (userInfo) => dispatch(updateUserInfo(userInfo)),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(EditProfile);

const styles = StyleSheet.create({
    addressInput: {
        width: '48%',
        borderBottomColor: '#D4D4D4',
        borderBottomWidth: 1
    }
});