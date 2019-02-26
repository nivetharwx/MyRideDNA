import React from 'react';
import {
    View,
    PureComponent,
    Text,
    ScrollView,
    Image,
    ImageBackground,
    TouchableOpacity,
    TextInput
} from 'react-native';

import { IconicInput } from '../../components/inputs';
import { IconButton, LinkButton } from '../../components/buttons';

import * as Animatable from 'react-native-animatable';

import { WindowDimensions, heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES } from '../../constants/index';
import { LoginStyles } from './styles';
import { Item, Icon as NBIcon } from 'native-base';

export const LoginScreen = (props) => (
    <ScrollView style={{ flex: 1 }}>
        <Animatable.View animation='zoomIn' iterationCount={1} style={{ height: 200, width: WindowDimensions.width }}>
            <Image source={require('../../assets/img/logo.png')}></Image>
        </Animatable.View>
        <View style={LoginStyles.loginForm}>
            <Item style={{ marginLeft: widthPercentageToDP(5), marginRight: widthPercentageToDP(5) }}>
                <NBIcon name='email' type='MaterialIcons' style={{ color: '#0083CA' }} />
                <TextInput style={{ flex: 1 }} textContentType='emailAddress' keyboardType='email-address' placeholder='Email' onChangeText={props.onEmailChange} />
            </Item>
            <Item style={{ marginLeft: widthPercentageToDP(5), marginRight: widthPercentageToDP(5) }}>
                <NBIcon name='vpn-key' type='MaterialIcons' style={{ color: '#0083CA' }} />
                <TextInput style={{ flex: 1 }} secureTextEntry={!props.isVisiblePassword} textContentType='password' keyboardType='default' placeholder='Password' onChangeText={props.onPasswordChange} />
                <IconButton onPress={props.togglePasswordVisibility} style={{ backgroundColor: '#0083CA', alignItems: 'center', justifyContent: 'center', width: widthPercentageToDP(8), height: widthPercentageToDP(8), borderRadius: widthPercentageToDP(4) }} iconProps={{ name: props.isVisiblePassword ? 'eye-off' : 'eye', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(6), paddingRight: 0, color: 'white' } }} />
            </Item>
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