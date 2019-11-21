import React from 'react';
import { View, ScrollView, Image, ImageBackground, TextInput, StatusBar } from 'react-native';
import { IconButton, LinkButton } from '../../components/buttons';
import * as Animatable from 'react-native-animatable';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, CUSTOM_FONTS } from '../../constants/index';
import { LoginStyles } from './styles';
import { Item, Icon as NBIcon } from 'native-base';

export const LoginScreen = (props) => (
    <ScrollView scrollEnabled={false} style={{ flex: 1 }} keyboardShouldPersistTaps='handled'>
        <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
        <Animatable.View iterationCount={1} style={{ flex: 1, height: heightPercentageToDP(25) }}>
            <Image source={require('../../assets/img/logo.png')} style={{ width: null, height: null, flex: 1, resizeMode: 'contain' }}></Image>
            {/* <ImageBackground source={require('../../assets/img/logo-sky-bg.jpg')} style={{ width: null, height: null, flex: 1, justifyContent: 'center' }}>
                <View style={{ width: 200, height: 80, marginTop: 30 }}><Image source={require('../../assets/img/logo-high-res.png')} style={{ width: null, height: null, flex: 1, resizeMode: 'contain' }} /></View>
            </ImageBackground> */}
        </Animatable.View>
        <View style={LoginStyles.loginForm}>
            <Item style={{ marginLeft: widthPercentageToDP(5), marginRight: widthPercentageToDP(5) }}>
                <NBIcon name='email' type='MaterialIcons' style={{ color: '#0083CA' }} />
                <TextInput style={{ flex: 1, fontFamily: CUSTOM_FONTS.robotoSlab }} textContentType='emailAddress' keyboardType='email-address' placeholder='Email' onChangeText={props.onEmailChange} />
            </Item>
            <Item style={{ marginLeft: widthPercentageToDP(5), marginRight: widthPercentageToDP(5) }}>
                <NBIcon name='vpn-key' type='MaterialIcons' style={{ color: '#0083CA' }} />
                <TextInput style={{ flex: 1, fontFamily: CUSTOM_FONTS.robotoSlab }} secureTextEntry={!props.isVisiblePassword} textContentType='password' keyboardType='default' placeholder='Password' onChangeText={props.onPasswordChange} onSubmitEditing={props.onSubmit} />
                <IconButton onPress={props.togglePasswordVisibility} style={{ backgroundColor: '#0083CA', alignItems: 'center', justifyContent: 'center', width: widthPercentageToDP(6), height: widthPercentageToDP(6), borderRadius: widthPercentageToDP(4) }} iconProps={{ name: props.isVisiblePassword ? 'eye-off' : 'eye', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(4), paddingRight: 0, color: 'white' } }} />
            </Item>
        </View>
        <View style={{ width: widthPercentageToDP(100), height: heightPercentageToDP(47) }}>
            <View style={LoginStyles.loginButtonContainer}>
                <View style={{ borderRadius: 100, padding: 10, backgroundColor: '#fff', alignSelf: 'center' }}>
                    <LinkButton style={LoginStyles.loginButton} title='LOGIN' titleStyle={LoginStyles.loginButtonText} />
                </View>
            </View>
            <View style={LoginStyles.linkPairContainer}>
                <LinkButton title={`Forgot Password`} titleStyle={LoginStyles.linkPairText} onPress={props.onForgotPasswordPress} />
                <LinkButton title='Sign up' titleStyle={LoginStyles.linkPairText} onPress={props.onSignupPress} />
            </View>
            <ImageBackground style={{ width: '100%', flex: 1 }} source={require('../../assets/img/login-bottom.png')}>
                <View style={LoginStyles.socialSiteIconContainer}>
                    <IconButton onPress={props.doFacebookLogin} style={{ paddingHorizontal: 0 }} iconProps={{ name: 'facebook', type: 'MaterialCommunityIcons', style: LoginStyles.socialSiteIcon }} />
                    <IconButton onPress={props.doGoogleLogin} style={{ paddingHorizontal: 0 }} iconProps={{ name: 'google-', type: 'Entypo', style: LoginStyles.socialSiteIcon }} />
                </View>
            </ImageBackground>
        </View>
    </ScrollView>
);