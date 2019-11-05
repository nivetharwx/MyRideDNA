import React from 'react';
import {
    View,
    PureComponent,
    Text,
    ScrollView,
    Image,
    ImageBackground,
    TouchableOpacity,
    TextInput,
    StatusBar
} from 'react-native';

import { IconicInput } from '../../components/inputs';
import { IconButton, LinkButton } from '../../components/buttons';

import * as Animatable from 'react-native-animatable';

import { WindowDimensions, heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES } from '../../constants/index';
import { LoginStyles } from './styles';
import { Item, Icon as NBIcon } from 'native-base';

export const LoginScreen = (props) => (
    <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps='always'>
        <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
        <Animatable.View iterationCount={1} style={{ width: widthPercentageToDP(100), height: heightPercentageToDP(25) }}>
            <Image source={require('../../assets/img/logo.png')} style={{ width: null, height: null, flex: 1, resizeMode: 'contain' }}></Image>
        </Animatable.View>
        <View style={LoginStyles.loginForm}>
            <Item style={{ marginLeft: widthPercentageToDP(5), marginRight: widthPercentageToDP(5) }}>
                <NBIcon name='email' type='MaterialIcons' style={{ color: '#0083CA' }} />
                <TextInput style={{ flex: 1 }} textContentType='emailAddress' keyboardType='email-address' placeholder='Email' onChangeText={props.onEmailChange} />
            </Item>
            <Item style={{ marginLeft: widthPercentageToDP(5), marginRight: widthPercentageToDP(5) }}>
                <NBIcon name='vpn-key' type='MaterialIcons' style={{ color: '#0083CA' }} />
                <TextInput style={{ flex: 1 }} secureTextEntry={!props.isVisiblePassword} textContentType='password' keyboardType='default' placeholder='Password' onChangeText={props.onPasswordChange} onSubmitEditing={props.onSubmit} />
                <IconButton onPress={props.togglePasswordVisibility} style={{ backgroundColor: '#0083CA', alignItems: 'center', justifyContent: 'center', width: widthPercentageToDP(6), height: widthPercentageToDP(6), borderRadius: widthPercentageToDP(4) }} iconProps={{ name: props.isVisiblePassword ? 'eye-off' : 'eye', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(4), paddingRight: 0, color: 'white' } }} />
            </Item>
        </View>
        <View style={{ width: WindowDimensions.width, height: heightPercentageToDP(47) }}>
            <View style={LoginStyles.loginButtonContainer}>
                <View style={{ backgroundColor: '#fff', width: 90, alignSelf: 'center', padding: 10, borderRadius: 120 }}>
                    <TouchableOpacity style={LoginStyles.loginButton} onPress={props.onSubmit} activeOpacity={0.9}><Text style={{ color: 'white', letterSpacing: 4, fontWeight: 'bold' }}>LOGIN</Text></TouchableOpacity>
                </View>
            </View>
            <View style={{ position: 'absolute', zIndex: 8, width: WindowDimensions.width, backgroundColor: 'rgba(182,86,26,0.7)', height: heightPercentageToDP(13.5), paddingTop: 15 }}>
                <View style={{ marginTop: 18, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <LinkButton title={`Forgot Password`} titleStyle={{ color: 'white', fontSize: 14, fontWeight: 'bold' }} onPress={props.onForgotPasswordPress} />
                    </View>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <LinkButton title='Sign up' titleStyle={{ color: 'white', fontSize: 14, fontWeight: 'bold' }} onPress={props.onSignupPress} />
                    </View>
                </View>
            </View>
            <ImageBackground style={{ width: '100%', flex: 1 }} source={require('../../assets/img/login-bottom.png')}>
                <View style={{ backgroundColor: 'rgba(23, 30, 70, 0.5)', paddingTop: 70, height: '100%', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
                    <IconButton onPress={props.doFacebookLogin} style={{ paddingHorizontal: 0 }} iconProps={{ name: 'facebook', type: 'MaterialCommunityIcons', style: { backgroundColor: '#fff', fontSize: 60, borderRadius: 5 } }} />
                    <IconButton onPress={props.doGoogleLogin} style={{ paddingHorizontal: 0 }} iconProps={{ name: 'google-', type: 'Entypo', style: { backgroundColor: '#fff', fontSize: 60, borderRadius: 5 } }} />
                </View>
            </ImageBackground>
        </View>
    </ScrollView>
);