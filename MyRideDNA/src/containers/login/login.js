import React from 'react';
import {
    View,
    PureComponent,
    Text,
    ScrollView,
    Image,
    ImageBackground,
    TouchableOpacity,
} from 'react-native';

import { IconicInput } from '../../components/inputs';
import { IconButton, LinkButton } from '../../components/buttons';

import * as Animatable from 'react-native-animatable';

import { WindowDimensions, heightPercentageToDP } from '../../constants/index';
import { LoginStyles } from './styles';

export const LoginScreen = (props) => (
    <ScrollView style={{ flex: 1 }}>
        <Animatable.View animation='zoomIn' iterationCount={1} style={{ height: 200, width: WindowDimensions.width }}>
            <Image source={require('../../assets/img/logo.png')}></Image>
        </Animatable.View>
        <View style={LoginStyles.loginForm}>
            <IconicInput iconProps={{ name: 'email', type: 'MaterialIcons', style: { color: '#0083CA' } }} inputType='emailAddress' onChange={props.onEmailChange} placeholder='Email' style={{ marginVertical: 20 }} />
            <IconicInput style={{ flex: 1 }} iconProps={{ name: 'vpn-key', type: 'MaterialIcons', style: { color: '#0083CA' } }}
                iconEnd={<IconButton onPress={props.togglePasswordVisibility} style={{ backgroundColor: '#0083CA', borderRadius: 10, paddingHorizontal: 1, paddingVertical: 1, marginRight: 10 }} iconProps={{ name: props.isVisiblePassword ? 'eye-off' : 'eye', type: 'MaterialCommunityIcons', style: { fontSize: 20, color: 'white', borderRadius: 10 } }} />}
                inputType={props.isVisiblePassword ? 'text' : 'password'} onChange={props.onPasswordChange} placeholder='Password' />
        </View>
        <View style={{ width: WindowDimensions.width }}>
            <View style={LoginStyles.loginButtonContainer}>
                <View style={{ backgroundColor: '#fff', width: 120, alignSelf: 'center', padding: 10, borderRadius: 120 }}>
                    <TouchableOpacity style={LoginStyles.loginButton} onPress={props.onSubmit} activeOpacity={0.9}><Text style={{ color: 'white' }}>LOGIN</Text></TouchableOpacity>
                </View>
            </View>
            <View style={{ position: 'absolute', zIndex: 8, width: WindowDimensions.width, backgroundColor: 'rgba(182,86,26,0.7)', height: heightPercentageToDP(10), paddingTop: 15 }}>
                <View style={{ paddingStart: 5, paddingEnd: 30, marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <LinkButton title={`Forgot\nPassword`} titleStyle={{ color: 'white', fontSize: 16 }} onPress={props.onForgotPasswordPress} />
                    </View>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <LinkButton title='Signup' titleStyle={{ color: 'white', fontSize: 16 }} onPress={props.onSignupPress} />
                    </View>
                </View>
            </View>
            <ImageBackground style={{ width: '100%', height: WindowDimensions.height - 420 }} source={require('../../assets/img/login-bottom.png')}>
                <View style={{ backgroundColor: 'rgba(62, 62, 61, 0.7)', paddingTop: 100, height: '100%', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                    <IconButton onPress={() => { }} style={{ paddingHorizontal: 0 }} iconProps={{ name: 'facebook', type: 'MaterialCommunityIcons', style: { backgroundColor: '#fff', fontSize: 60, borderRadius: 5 } }} />
                    <IconButton onPress={() => { }} style={{ paddingHorizontal: 0 }} iconProps={{ name: 'google-', type: 'Entypo', style: { backgroundColor: '#fff', fontSize: 60, borderRadius: 5 } }} />
                </View>
            </ImageBackground>
        </View>
    </ScrollView>
);