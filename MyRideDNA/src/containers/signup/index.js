import React, { Component } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Icon as NBIcon } from 'native-base';
import { Actions } from 'react-native-router-flux';

import { IconicInput, IconicList } from '../../components/inputs';
import { BasicHeader } from '../../components/headers';

import { LoginStyles } from '../../containers/login/styles';
import { WindowDimensions } from '../../constants';
import { LoginButton, SocialButtons, IconButton, RoundButton } from '../../components/buttons';

const ANDROID_HEADER_HEIGHT = 50;
const IOS_HEADER_HEIGHT = 90;
const HEADER_HEIGHT = Platform.OS === 'android' ? ANDROID_HEADER_HEIGHT : IOS_HEADER_HEIGHT;

export class Signup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            isPasswdVisible: false,
            isConfirmPasswdVisible: false
        };
    }

    onEmailChange = (val) => {
    }

    onSubmit = () => {

    }

    onPressBackButton = () => {
        Actions.pop();
    }



    render() {
        const { user, isPasswdVisible, isConfirmPasswdVisible } = this.state;
        return (
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <BasicHeader headerHeight={HEADER_HEIGHT} leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                    title='Sign up' />
                <ScrollView style={{ backgroundColor: 'white', marginTop: HEADER_HEIGHT }} contentContainerStyle={{ paddingTop: 20, justifyContent: 'space-between', flex: 1 }}>
                    <IconicInput iconProps={{ style: styles.formFieldIcon, name: 'md-person', type: 'Ionicons' }} inputType='name' placeholder='Name'></IconicInput>
                    <IconicList iconProps={{ style: styles.formFieldIcon, name: 'transgender', type: 'FontAwesome' }}
                        selectedValue={user.gender} placeholder='Gender' values={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]}
                        onChange={val => this.setState({ user: { ...user, gender: val } })}></IconicList>
                    <IconicInput iconProps={{ style: styles.formFieldIcon, name: 'email', type: 'MaterialIcons' }} inputType='emailAddress' placeholder='Email'></IconicInput>
                    <IconicInput
                        iconEnd={<IconButton onPress={() => this.setState({ isPasswdVisible: !isPasswdVisible })} style={{ backgroundColor: '#0083CA', borderRadius: 10, paddingHorizontal: 1, paddingVertical: 1, marginRight: 10 }} iconProps={{ name: isPasswdVisible ? 'eye-off' : 'eye', type: 'MaterialCommunityIcons', style: { fontSize: 20, color: 'white', borderRadius: 10 } }} />}
                        iconProps={{ style: styles.formFieldIcon, name: 'vpn-key', type: 'MaterialIcons' }} inputType={isPasswdVisible ? 'text' : 'password'} placeholder='Password'></IconicInput>
                    <IconicInput
                        iconEnd={<IconButton onPress={() => this.setState({ isConfirmPasswdVisible: !isConfirmPasswdVisible })} style={{ backgroundColor: '#0083CA', borderRadius: 10, paddingHorizontal: 1, paddingVertical: 1, marginRight: 10 }} iconProps={{ name: isConfirmPasswdVisible ? 'eye-off' : 'eye', type: 'MaterialCommunityIcons', style: { fontSize: 20, color: 'white', borderRadius: 10 } }} />}
                        iconProps={{ style: styles.formFieldIcon, name: 'vpn-key', type: 'MaterialIcons' }} inputType={isConfirmPasswdVisible ? 'text' : 'password'} placeholder='Confirm password'></IconicInput>

                    <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10, justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <RoundButton title='GO' style={{ height: 100, width: 100, borderRadius: 100 }} titleStyle={{ fontSize: 25 }} onPress={() => { }} />
                        <TouchableOpacity><Text style={{ color: '#0083CA', fontSize: 17 }}>Privacy policy</Text></TouchableOpacity>
                    </View>
                    {/* <View style={{ justifyContent: 'space-around', borderColor: 'red', borderWidth: 1 }}> */}

                    {/* <TouchableOpacity>
                            <Text style={styles.termsConditionLink}>Read and accept Terms & Conditions</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.signupButton}>
                            <Text style={{ color: 'white', fontSize: 19, letterSpacing: (WindowDimensions.width / 50), alignSelf: 'center', fontWeight: 'bold', }}>SIGN UP</Text>
                        </TouchableOpacity>
                        <Text style={{ alignSelf: 'center', fontWeight: 'bold', paddingVertical: 10, fontSize: 18 }}>OR</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginVertical: 20 }}>
                            <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#E9EAED' }]}><NBIcon name="facebook-square" type="FontAwesome" style={{ fontSize: 20, color: '#3b5998' }} /><Text style={[LoginStyles.loginButtonText, { paddingLeft: 10, color: '#939598' }]}>FACEBOOK LOGIN</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#5B5B5B' }]}><NBIcon name="social-google-plus" type="Foundation" style={{ fontSize: 20, backgroundColor: 'white', color: '#DD4B39' }} /><Text style={[LoginStyles.loginButtonText, { paddingLeft: 10, color: 'white' }]}>GOOGLE+ LOGIN</Text></TouchableOpacity>
                        </View> */}
                    {/* </View> */}
                    <View style={{ paddingVertical: (WindowDimensions.height * 5) / 100, backgroundColor: '#EB861E', alignItems: 'flex-end', paddingEnd: 10 }}>
                        <View style={{ flexDirection: 'row', width: '50%', justifyContent: 'space-around' }}>
                            <IconButton onPress={() => { }} style={{ paddingHorizontal: 0 }} iconProps={{ name: 'facebook', type: 'MaterialCommunityIcons', style: { backgroundColor: '#fff', color: '#EB861E', fontSize: 60, borderRadius: 5 } }} />
                            <IconButton onPress={() => { }} style={{ paddingHorizontal: 0 }} iconProps={{ name: 'google-', type: 'Entypo', style: { backgroundColor: '#fff', color: '#EB861E', fontSize: 60, borderRadius: 5 } }} />
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    formFieldIcon: {
        color: '#999999'
    },
    termsConditionLink: {
        marginLeft: 20,
        marginVertical: 20,
        color: '#EB861E',
        fontSize: 18
    },
    signupButton: {
        backgroundColor: '#EB861E',
        paddingVertical: 6,
        borderRadius: 5,
        marginHorizontal: 20,
        width: WindowDimensions.width - 40,
    },
    socialButton: {
        flexDirection: 'row',
        height: 40,
        alignItems: 'center',
        borderRadius: 5,
        paddingHorizontal: 10
    }
});